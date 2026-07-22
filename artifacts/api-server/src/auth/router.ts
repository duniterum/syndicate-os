// Auth zone router — IA-2 dev-only SIWE challenge/session skeleton.
//
// Mounted at /api/auth, architecturally separate from the read-only protocol
// reality spine. This router is the ONLY place in the api-server with write
// verbs and the ONLY place a JSON body parser is mounted (scoped, size-capped
// — the spine keeps zero body-parsing surface).
//
// Contract (founder-approved):
//   POST /api/auth/challenge → SIWE message fields + single-use nonce
//   POST /api/auth/verify    → validates SIWE message + signature; on success
//                              rotates the session and returns { state: "S4" }
//                              with an HttpOnly/Secure/SameSite=Strict/
//                              Path=/api cookie
//   GET  /api/auth/session   → { state: "S1" | "S4" } — nothing else, ever
//   POST /api/auth/logout    → destroys the session, clears the cookie,
//                              returns { state: "S1" }
//
// Hard caps: S4 is the ceiling (registry-less — no ACTIVE-row logic, no
// operator authority). Self-readback amendments (founder-approved): GET
// /member-self (live engine recognition figure) and GET /member-standing
// (Decision 5a — own-row Holder Index era standing via the static snapshot)
// read ONLY the session's own bound account; no directory, roster, or
// arbitrary wallet/memberNumber lookup exists, and no response ever echoes
// a wallet address or wallet/member pairing. All failures fail closed with
// a uniform safe error shape. Nonces, signatures and addresses are never
// logged.

import {
  Router,
  json,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe";
import { recoverMessageAddress } from "viem";
// R5 own-row source standing: resolution lives in the read-only spine helper
// (the engineReadback pattern); the auth zone stays registry-less.
import { readOwnSourceStanding } from "../lib/protocol/sourceStandingRead";
import {
  AUTH_CHAIN_ID,
  AUTH_JSON_LIMIT,
  AUTH_STATEMENT,
  NONCE_TTL_MS,
  SESSION_ABSOLUTE_TTL_MS,
  SESSION_COOKIE_NAME,
  SIWE_VERSION,
  expectedSiweOrigin,
  isAllowedBrowserOrigin,
} from "./authConfig";
import { consumeNonce, issueNonce } from "./nonceStore";
import {
  createSession,
  destroySession,
  getSessionAccount,
  touchSession,
} from "./sessionStore";
import { allowRequest } from "./throttle";
import { throttleKey } from "./clientIdentity";
import { readEngineMemberNumber } from "./engineReadback";
import { lookupActiveOperator } from "./operatorContext";
import { lookupGenesisMember, lookupMemberReceipt } from "./memberRoster";
import {
  readOwnInbox,
  markInboxSeen,
  markInboxRead,
  type InboxPayload,
} from "./memberInbox";
// SPEC R3 — the own-row channel breakdown (the FOURTH sanctioned DB bridge).
import { readOwnChannelBreakdown } from "./channelStanding";
// K3.a — the member's own activation intake: live eligibility (chain reads
// only) + the request rows (the FIFTH sanctioned DB bridge).
import { readActivationEligibility } from "./activationEligibility";
import {
  createOwnActivationRequest,
  readOwnActivationRequest,
} from "./activationRequests";
// Slice ④ — the per-introduction rows holder (pure spine state, no DB reach;
// the D3 own-purchase pattern applied to the introducer's axis).
import { getIntroductionRowsModel } from "../lib/protocol/introductionRowsModel";
import { resolveOwnStanding } from "../lib/protocol/holderIndexStanding";
import { txUrl } from "../canon/the-syndicate/chain/chain-registry";
import { assertProtocolRealityDiscipline } from "../lib/protocol/payloadDiscipline";
// D-TRUTH D3: the backbone's own-purchase read-model (SERVER-ONLY wallet
// keys) — the auth zone serves a session's OWN rows out of it, nothing else.
import { getOwnPurchaseSource } from "../backbone/backboneRunner";

const router: Router = Router();

// Scoped body parsing + cookie reading: auth zone only, never app-wide.
router.use(json({ limit: AUTH_JSON_LIMIT }));
router.use(cookieParser());

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/api",
} as const;

// Uniform safe error shape: coarse public reason codes only — no field-level
// detail, no echoes of submitted material.
function deny(res: Response, status: number, reason: string): void {
  res.status(status).json({ error: "auth_denied", reason });
}

// CSRF/origin defense for state-changing requests (alongside SameSite=Strict
// cookies): a browser-declared cross-site origin or fetch metadata is
// rejected outright. Requests without these headers (curl, server-to-server,
// same-origin navigations) pass through. Global CORS stays credential-free
// and is not touched by this zone.
function rejectCrossOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method === "POST") {
    const origin = req.headers.origin;
    if (typeof origin === "string" && !isAllowedBrowserOrigin(origin)) {
      req.log.warn({ event: "auth.request.cross_origin_denied" });
      deny(res, 403, "cross_origin");
      return;
    }
    const fetchSite = req.headers["sec-fetch-site"];
    if (
      typeof fetchSite === "string" &&
      !["same-origin", "same-site", "none"].includes(fetchSite)
    ) {
      req.log.warn({ event: "auth.request.cross_site_denied" });
      deny(res, 403, "cross_origin");
      return;
    }
  }
  next();
}
router.use(rejectCrossOrigin);

// Throttle keying (IA-2.5): derived via src/auth/clientIdentity.ts — the
// explicit rightmost-non-private x-forwarded-for extractor with a hashed,
// per-boot-salted key. Peer-address APIs are never used for keying here
// (behind the shared proxy the socket peer is always the proxy itself).

// ── POST /api/auth/challenge ────────────────────────────────────────────────
router.post("/challenge", (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.challenge.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const issued = issueNonce();
  if (issued === null) {
    req.log.warn({ event: "auth.challenge.store_full" });
    deny(res, 503, "unavailable");
    return;
  }
  const { domain, uri } = expectedSiweOrigin();
  const now = Date.now();
  req.log.info({ event: "auth.challenge.issued" });
  res.json({
    domain,
    uri,
    statement: AUTH_STATEMENT,
    version: SIWE_VERSION,
    chainId: AUTH_CHAIN_ID,
    nonce: issued.nonce,
    issuedAt: new Date(now).toISOString(),
    expirationTime: new Date(Math.min(issued.expiresAt, now + NONCE_TTL_MS)).toISOString(),
  });
});

// ── POST /api/auth/verify ───────────────────────────────────────────────────
const verifyBodySchema = z
  .object({
    message: z.string().min(1).max(4000),
    signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
  })
  .strict();

router.post("/verify", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.verify.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const parsedBody = verifyBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    req.log.info({ event: "auth.verify.denied", code: "bad_request" });
    deny(res, 400, "bad_request");
    return;
  }
  const body = parsedBody.data;

  // 1. Parse + field-bind the SIWE message against server-computed values —
  //    domain, URI, chain id and the exact approved statement. Nothing is
  //    trusted from the client.
  const expected = expectedSiweOrigin();
  let fields: ReturnType<typeof parseSiweMessage>;
  try {
    fields = parseSiweMessage(body.message);
  } catch {
    req.log.info({ event: "auth.verify.denied", code: "unparseable_message" });
    deny(res, 401, "invalid_message");
    return;
  }
  if (
    fields.domain !== expected.domain ||
    fields.uri !== expected.uri ||
    fields.chainId !== AUTH_CHAIN_ID ||
    fields.statement !== AUTH_STATEMENT ||
    fields.version !== SIWE_VERSION ||
    typeof fields.nonce !== "string" ||
    typeof fields.address !== "string"
  ) {
    req.log.info({ event: "auth.verify.denied", code: "binding_mismatch" });
    deny(res, 401, "invalid_message");
    return;
  }
  const timeValid = validateSiweMessage({
    message: fields,
    domain: expected.domain,
  });
  if (!timeValid) {
    req.log.info({ event: "auth.verify.denied", code: "message_invalid_or_expired" });
    deny(res, 401, "invalid_message");
    return;
  }

  // 2. Single-use nonce consume (atomic; unknown/replayed/expired all fail
  //    closed through one path — restart loss lands here too).
  if (!consumeNonce(fields.nonce)) {
    req.log.info({ event: "auth.verify.denied", code: "nonce_rejected" });
    deny(res, 401, "invalid_nonce");
    return;
  }

  // 3. EIP-191 signature recovery must produce the message's own account.
  //    (EOA-only in this dev skeleton — contract-wallet signatures are a
  //    founder-gated later concern.) The recovered value is compared and
  //    dropped: never stored, never logged, never echoed.
  let signatureValid = false;
  try {
    const recovered = await recoverMessageAddress({
      message: body.message,
      signature: body.signature as `0x${string}`,
    });
    signatureValid =
      recovered.toLowerCase() === fields.address.toLowerCase();
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) {
    req.log.info({ event: "auth.verify.denied", code: "signature_rejected" });
    deny(res, 401, "invalid_signature");
    return;
  }

  // 4. Rotate: any prior session on this client is destroyed before a fresh
  //    id is issued (fixation defense). The SIWE-verified account is bound
  //    SERVER-SIDE ONLY (member-self readback) — never echoed, never logged.
  const priorId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof priorId === "string" && priorId.length > 0) {
    destroySession(priorId);
  }
  const sessionId = createSession(fields.address);
  if (sessionId === null) {
    req.log.warn({ event: "auth.verify.store_full" });
    deny(res, 503, "unavailable");
    return;
  }
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_ABSOLUTE_TTL_MS,
  });
  req.log.info({ event: "auth.verify.ok" });
  res.json({ state: "S4" });
});

// ── GET /api/auth/session ───────────────────────────────────────────────────
// Returns ONLY the coarse state. No identity, no expiry detail, no session
// metadata. Missing/unknown/expired cookie is not an error — it is S1.
router.get("/session", (req: Request, res: Response) => {
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const active =
    typeof sessionId === "string" &&
    sessionId.length > 0 &&
    touchSession(sessionId);
  req.log.info({
    event: "auth.session.checked",
    code: active ? "active" : "none",
  });
  res.json({ state: active ? "S4" : "S1" });
});

// ── GET /api/auth/operator-context ──────────────────────────────────────────
// Bridges a wallet-verified session to operator authority: looks the session's
// SIWE-verified account up in the operator registry (Phase 3) and returns the
// role ONLY when the operator row exists and is ACTIVE. Read-only. Fail-closed
// on every axis (no session, DB absent, zone disabled, unknown/non-ACTIVE
// wallet, or any error) → { isOperator: false, role: null }. The verified
// account is never echoed; only the coarse operator role leaves the server.
router.get("/operator-context", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.operator_context.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const account =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (account === null) {
    // No wallet session is not an error — simply not an operator.
    res.json({ isOperator: false, role: null });
    return;
  }
  const ctx = await lookupActiveOperator(account);
  req.log.info({
    event: "auth.operator_context.checked",
    code: ctx.isOperator ? "operator" : "none",
  });
  res.json({ isOperator: ctx.isOperator, role: ctx.role });
});

// ── GET /api/auth/member-self ───────────────────────────────────────────────
// Read-only membership self-readback (Public MVP, founder-approved): resolves
// the session's SERVER-SIDE bound account to the active engine's public
// memberNumberOf(account) figure via eth_call. The bound account itself is
// NEVER echoed — the response carries only the coarse session state, honest
// chain posture, and the engine's own recognition figure as an EXACT decimal
// string ("0" on chain = not recognized by the active engine → null).
// No session → S1 with nulls (fail closed, not an error). No write surface.
router.get("/member-self", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.member_self.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;

  let chainVerified = false;
  let isRecognized: boolean | null = null;
  let engineFigure: string | null = null;
  let failureReason: string | null = null;

  if (boundAccount === null) {
    failureReason = "no active wallet session; sign in to read your standing";
  } else {
    const read = await readEngineMemberNumber(boundAccount);
    chainVerified = read.chainVerified;
    isRecognized = read.isRecognized;
    engineFigure = read.engineFigure;
    failureReason = read.failureReason;
  }

  const sessionActive = boundAccount !== null;
  const outcome = !sessionActive ? "none" : chainVerified ? "read" : "chain_skip";
  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    chainVerified,
    isRecognized,
    seatNumber: engineFigure,
    failureReason,
  };
  try {
    assertProtocolRealityDiscipline(payload);
  } catch {
    req.log.warn({ event: "auth.member_self.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({ event: "auth.member_self.checked", code: outcome });
  res.json(payload);
});

// ── GET /api/auth/member-standing ───────────────────────────────────────────
// Holder Index SELF-READBACK (founder Decision 5a — narrow). Resolves the
// session's SERVER-SIDE bound account to the live engine's memberNumberOf
// figure, then maps that figure into EXACTLY ONE era of the static hash-
// pinned Holder Index snapshot. Own-row only:
//   - no query/params lookup surface of any kind (the ONLY input is the
//     session cookie; arbitrary wallet/memberNumber lookup does not exist)
//   - the bound account is never echoed; no tx hash is returned
//   - engine "0" = sentinel → clean not-recognized state
//   - figure outside every snapshot era → fail closed (snapshot stale —
//     never guessed into an era, never reported as recognized standing)
//   - snapshot not VERIFIED / ambiguous mapping → fail closed (unavailable)
// No session → S1 with nulls (fail closed, not an error). No write surface.
router.get("/member-standing", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.member_standing.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;

  let chainVerified = false;
  let recognized: boolean | null = null;
  let ownNumber: string | null = null;
  let era: string | null = null;
  let authority: string | null = null;
  let authorityLabel: string | null = null;
  let continuityStatus: string | null = null;
  let proofPosture: { snapshotStatus: string; snapshotHash: string } | null =
    null;
  let receipt: {
    transaction: string;
    block: number | null;
    explorerUrl: string;
  } | null = null;
  let failureReason: string | null = null;

  if (boundAccount === null) {
    failureReason = "no active wallet session; sign in to read your standing";
  } else {
    const read = await readEngineMemberNumber(boundAccount);
    chainVerified = read.chainVerified;
    failureReason = read.failureReason;
    if (read.isRecognized === true && read.engineFigure !== null) {
      // V3-era member (#9+): the LIVE engine is the authority.
      const standing = resolveOwnStanding(read.engineFigure);
      if (standing.kind === "MAPPED") {
        recognized = true;
        ownNumber = read.engineFigure;
        era = standing.era;
        authority = standing.authority;
        authorityLabel = standing.authorityLabel;
        continuityStatus = standing.continuityStatus;
        proofPosture = {
          snapshotStatus: standing.snapshotStatus,
          snapshotHash: standing.snapshotHash,
        };
      } else if (standing.kind === "STALE") {
        // The live V3 engine has emitted a seat the verified snapshot has not
        // caught up to. A figure past the freeze range is DEFINITIONALLY a V3
        // seat (numbering authority = the emitted memberNumber, per era
        // doctrine), so it is recognized LIVE — the snapshot is a rebuildable
        // cache, never the V3 authority. No snapshot proof is claimed for it.
        recognized = true;
        ownNumber = read.engineFigure;
        era = "V3_EMITTED";
        authority = "V3_EMITTED";
        authorityLabel = "V3 engine event (live; snapshot rebuild pending)";
        continuityStatus = "VERIFIED_LIVE_V3";
      } else if (standing.kind === "UNRECONCILED") {
        failureReason =
          "holder index snapshot is not in a verified state; standing unavailable (fail closed)";
      } else {
        failureReason =
          "standing could not be resolved to exactly one era; unavailable (fail closed)";
      }
    } else if (read.isRecognized === false) {
      // The live V3 engine does not know this wallet (sentinel "0"). It may
      // still be a FROZEN GENESIS seat (#1–#8), which has no on-chain
      // memberNumberOf — resolve its OWN seat from the frozen roster (own-row,
      // never a directory). Genesis seats live inside the verified snapshot's
      // freeze era, so the snapshot still supplies era + proof.
      const genesis = await lookupGenesisMember(boundAccount);
      if (genesis.recognized && genesis.memberNumber !== null) {
        const standing = resolveOwnStanding(genesis.memberNumber);
        if (standing.kind === "MAPPED") {
          recognized = true;
          ownNumber = genesis.memberNumber;
          era = standing.era;
          authority = standing.authority;
          authorityLabel = standing.authorityLabel;
          continuityStatus = standing.continuityStatus;
          proofPosture = {
            snapshotStatus: standing.snapshotStatus,
            snapshotHash: standing.snapshotHash,
          };
        } else {
          // Roster says genesis but the snapshot disagrees — fail closed rather
          // than assert an unverified seat.
          failureReason =
            "genesis standing could not be reconciled to the verified snapshot (fail closed)";
        }
      } else {
        recognized = false; // genuinely not a member on any era
      }
    }
    // read.isRecognized === null → live read unavailable; failureReason set above.
  }

  // ADR-003 §3 — own receipt: once recognized, surface the member's OWN entry
  // transaction (the purchase that established the seat) so they can show and
  // verify it. Own-row only, canonical explorer URL, fail-closed — a missing
  // receipt never degrades the recognized standing.
  if (recognized === true && boundAccount !== null) {
    const ownReceipt = await lookupMemberReceipt(boundAccount);
    if (ownReceipt !== null) {
      const explorerUrl = txUrl(ownReceipt.transaction);
      if (explorerUrl !== null) {
        receipt = {
          transaction: ownReceipt.transaction,
          block: ownReceipt.block,
          explorerUrl,
        };
      }
    }
  }

  const sessionActive = boundAccount !== null;
  const outcome = !sessionActive
    ? "none"
    : recognized === true
      ? "mapped"
      : recognized === false
        ? "sentinel"
        : "unavailable";
  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    chainVerified,
    recognized,
    memberNumber: ownNumber,
    era,
    authority,
    authorityLabel,
    continuityStatus,
    proofPosture,
    receipt,
    failureReason,
  };
  // Leak gates: payload discipline + boundary-aware address scan (40-hex
  // fail-closes; 64-hex snapshot hash pins pass). The bound account never
  // enters the payload object, this is defense in depth.
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.member_standing.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({ event: "auth.member_standing.checked", code: outcome });
  res.json(payload);
});

// ── GET /api/auth/source-standing ───────────────────────────────────────────
// R5 — introduction-standing SELF-READBACK (own-row, the member-standing
// discipline verbatim): the ONLY input is the session cookie; the bound
// account is used server-side to DERIVE its canonical sourceId
// (keccak256("SYN.SOURCE.V1", account) — SPEC §③) and then the OPAQUE
// sourceKey into the generated introduction snapshot (R5a). No lookup surface
// for arbitrary wallets/sources exists; the account, the sourceId, and any
// other member's material are never echoed. Registry existence/active are
// LIVE reads (fail closed to null); the counters are an honest SERVED
// SNAPSHOT, labeled asOfBlock — never passed off as live.
router.get("/source-standing", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.source_standing.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;

  const resolved =
    boundAccount === null
      ? {
          chainVerified: false,
          sourceOnChain: null,
          sourceActive: null,
          sourceOrigin: null,
          sourceIdHex: null,
          standing: null,
          failureReason:
            "no active wallet session; sign in to read your referral standing",
        }
      : await readOwnSourceStanding(boundAccount);

  const sessionActive = boundAccount !== null;
  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    chainVerified: resolved.chainVerified,
    sourceOnChain: resolved.sourceOnChain,
    sourceActive: resolved.sourceActive,
    // D-TRUTH D2: which resolution answered — "canonical" or "founder-signed"
    // (the own-row fallback). Additive; clients ignore unknown fields.
    sourceOrigin: resolved.sourceOrigin,
    // Ruling ① (2026-07-16): the resolved PAYING source's id, own-row only
    // (64-hex — passes the boundary-aware address gate below).
    sourceIdHex: resolved.sourceIdHex,
    standing: resolved.standing,
    failureReason: resolved.failureReason,
  };
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.source_standing.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({
    event: "auth.source_standing.checked",
    code: !sessionActive ? "none" : resolved.standing !== null ? "mapped" : "unavailable",
  });
  res.json(payload);
});

// ── GET /api/auth/channel-standing ──────────────────────────────────────────
// SPEC R3 (`&via=`, founder GO 2026-07-19) — the member's OWN channel
// breakdown: aggregate clicks + receipt-verified conversions per tag, for
// the session's own resolved source only (the same D2-aware resolution as
// source-standing, inside auth/channelStanding.ts — the FOURTH sanctioned
// DB-reaching auth file). The ONLY input is the session cookie; no query
// surface exists; the payload carries no wallet and no source id — just
// tag/clicks/conversions rows. Fail-closed: gate closed / resolution or DB
// miss → available:false with empty rows, never an invented zero.
router.get("/channel-standing", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.channel_standing.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;

  const sessionActive = boundAccount !== null;
  const breakdown =
    boundAccount === null ? null : await readOwnChannelBreakdown(boundAccount);

  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    available: breakdown !== null,
    rows: breakdown?.rows ?? [],
  };
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.channel_standing.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({
    event: "auth.channel_standing.checked",
    code: !sessionActive ? "none" : breakdown !== null ? "served" : "unavailable",
  });
  res.json(payload);
});

// ── GET /api/auth/introduction-rows ─────────────────────────────────────────
// Slice ④ (founder GO 2026-07-19) — the member's OWN per-introduction rows:
// each attributed join as a chain-event fact (verified UTC day · the
// introduced wallet in ADR-003 SHORT form only · the R5 durable flag · the
// commission paid · the 64-hex verify anchor + canonical explorer URL). The
// D3 member-purchases discipline verbatim: session cookie = the ONLY input;
// the resolved source picks rows SERVER-SIDE; the full sourceId map key and
// the bound account never enter the payload; 40-hex fail-closed scan (short
// forms and 64-hex anchors pass by construction). Fail-closed: no session /
// model not built / source unresolved → an honest reason, never a guess.
router.get("/introduction-rows", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.introduction_rows.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  const sessionActive = boundAccount !== null;

  let rows:
    | {
        isoDayUtc: string;
        who: string;
        durable: boolean;
        commissionRaw: string;
        transaction: string;
        explorerUrl: string;
        block: number;
        // Slice ⑤ — the receipt-backed breakdown: the event's own amounts
        // (numbers only, no addresses), or null (fail-closed, never invented).
        anatomy: {
          grossRaw: string;
          commissionBps: number;
          netRaw: string;
          vaultRaw: string;
          liquidityRaw: string;
          operationsRaw: string;
        } | null;
      }[]
    | null = null;
  let asOfBlock: number | null = null;
  let failureReason: string | null = null;

  if (boundAccount === null) {
    failureReason = "no active wallet session; sign in to read your own introduction record";
  } else {
    const model = getIntroductionRowsModel();
    if (model === null) {
      failureReason =
        "the record model has not built yet — your rows return shortly; nothing is assumed";
    } else {
      const resolved = await readOwnSourceStanding(boundAccount);
      if (resolved.sourceIdHex === null) {
        failureReason =
          resolved.failureReason ??
          "no referral source exists for this wallet yet — a new source is a founder-signed on-chain act";
      } else {
        asOfBlock = model.asOfBlock;
        rows = [];
        for (const r of model.rowsBySourceId.get(resolved.sourceIdHex) ?? []) {
          const explorerUrl = txUrl(r.transactionHash);
          if (explorerUrl === null) continue; // an anchor we cannot verify-link never serves
          rows.push({
            isoDayUtc: r.isoDayUtc,
            who: r.who,
            durable: r.durable,
            commissionRaw: r.commissionRaw,
            transaction: r.transactionHash,
            explorerUrl,
            block: r.blockNumber,
            anatomy: r.anatomy === null ? null : { ...r.anatomy },
          });
        }
      }
    }
  }

  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    rows,
    asOfBlock,
    failureReason,
  };
  // Leak gates: payload discipline + boundary-aware address scan (a bare
  // 40-hex fail-closes; short forms and 64-hex anchors pass). The bound
  // account and the full sourceId never enter the payload object.
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.introduction_rows.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({
    event: "auth.introduction_rows.checked",
    code: !sessionActive ? "none" : rows !== null ? "mapped" : "unavailable",
  });
  res.json(payload);
});

// ── GET /api/auth/member-purchases ──────────────────────────────────────────
// D-TRUTH D3 — own purchase-history SELF-READBACK (the member-standing
// discipline verbatim): the ONLY input is the session cookie; the bound
// account picks the session's OWN rows out of the backbone's own-purchase
// read-model and only dates, public amounts and 64-hex verify anchors leave.
// ADR-003 §3: a member's own receipts are theirs to see and share; no lookup
// surface for arbitrary wallets exists and the session's own key is never
// echoed. Fail-closed: model dark → an honest reason, never a guess.
router.get("/member-purchases", (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.member_purchases.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;

  const sessionActive = boundAccount !== null;
  let rows:
    | {
        isoDayUtc: string;
        amountRaw: string;
        transaction: string;
        explorerUrl: string;
        block: number;
        engine: string;
        // R-BIND (the Receipts binder) — the row's own receipt facts:
        // chain-verified seconds + the event's own money/context fields
        // (numbers, booleans, a 64-hex id, an ADR-003 short form ONLY), or
        // null (honest absence — the binder then shows the row without a
        // full ticket, never a guess). ADR-003 §3: a member's own receipts
        // are theirs to see and share.
        sealedAtSec: number;
        receipt: {
          seat: number | null;
          holderShort: string | null;
          commissionRaw: string | null;
          netRaw: string | null;
          vaultRaw: string | null;
          liquidityRaw: string | null;
          operationsRaw: string | null;
          synOutRaw: string | null;
          synPerUsdc: string | null;
          era: number | null;
          firstSeat: boolean | null;
          sourceIdHex: string | null;
          broughtByShort: string | null;
        } | null;
      }[]
    | null = null;
  let failureReason: string | null = null;
  if (boundAccount === null) {
    failureReason =
      "no active wallet session; sign in to read your own purchase record";
  } else {
    const source = getOwnPurchaseSource();
    if (source === null) {
      failureReason =
        "the record model has not built yet — your rows return shortly; nothing is assumed";
    } else {
      const own = source.rowsByWallet.get(boundAccount.toLowerCase()) ?? [];
      rows = [];
      for (const r of own) {
        const explorerUrl = txUrl(r.transactionHash);
        if (explorerUrl === null) continue; // an anchor we cannot verify-link never serves
        rows.push({
          isoDayUtc: r.isoDayUtc,
          amountRaw: r.usdcGrossRaw,
          transaction: r.transactionHash,
          explorerUrl,
          block: r.blockNumber,
          engine: r.generation,
          sealedAtSec: r.sealedAtSec,
          receipt: r.receipt === null ? null : { ...r.receipt },
        });
      }
    }
  }

  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    rows,
    // R-BIND: the chain-verified token decimals (the token-metadata guard's
    // canon — same constants the join-quote serves; ONE truth source so the
    // binder's exact amounts re-base on served facts, never a client literal).
    decimals: { usdc: 6 as const, syn: 18 as const },
    failureReason,
  };
  // Leak gates: payload discipline + boundary-aware address scan (40-hex
  // fail-closes; the rows' 64-hex verify anchors pass). The bound account
  // never enters the payload object — defense in depth.
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.member_purchases.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({
    event: "auth.member_purchases.checked",
    code: !sessionActive ? "none" : rows !== null ? "mapped" : "unavailable",
  });
  res.json(payload);
});

// ── GET /api/auth/member-inbox ──────────────────────────────────────────────
// NOTIF-1 — own-row NOTIFICATION CENTER self-readback (the member-purchases
// discipline verbatim): the ONLY input is the session cookie; the bound
// account picks the session's OWN notification rows (its member-addressed
// messages + ALL broadcasts) joined to its OWN seen/read receipts. Served
// rows carry NO wallet at all — title/body/time/scope/unread only, plus the
// unseen count (the bell badge). HARVEST-08 + the no-email canon: in-app is
// the only channel. Fail-closed: DB dark → an honest reason, never a guess.
router.get("/member-inbox", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.member_inbox.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;

  const sessionActive = boundAccount !== null;
  let inbox: InboxPayload | null = null;
  let failureReason: string | null = null;
  if (boundAccount === null) {
    failureReason = "no active wallet session; sign in to read your own inbox";
  } else {
    inbox = await readOwnInbox(boundAccount);
    if (inbox === null) {
      failureReason = "the inbox is unavailable right now — nothing is assumed";
    }
  }

  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    rows: inbox?.rows ?? null,
    unseenCount: inbox?.unseenCount ?? null,
    failureReason,
  };
  // Leak gates: payload discipline + boundary-aware address scan (40-hex
  // fail-closes; the write zone already refuses address-bearing text, so a
  // served inbox can never carry one). The bound account never enters the
  // payload object — defense in depth.
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.member_inbox.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({
    event: "auth.member_inbox.checked",
    code: !sessionActive ? "none" : inbox !== null ? "mapped" : "unavailable",
  });
  res.json(payload);
});

// ── POST /api/auth/member-inbox/seen ────────────────────────────────────────
// NOTIF-1 — the member's OWN mark-seen (opening the bell clears the badge;
// items stay unread until clicked). THE FIRST member-side write: own-row
// receipts only, keyed server-side to the bound account; no body input at
// all. Cross-site defense: the zone-wide rejectCrossOrigin + SameSite=Strict.
router.post("/member-inbox/seen", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.member_inbox_seen.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (boundAccount === null) {
    deny(res, 401, "no_session");
    return;
  }
  const ok = await markInboxSeen(boundAccount);
  if (!ok) {
    deny(res, 503, "unavailable");
    return;
  }
  req.log.info({ event: "auth.member_inbox_seen.ok" });
  res.json({ ok: true });
});

// ── POST /api/auth/member-inbox/read ────────────────────────────────────────
// NOTIF-1 — the member's OWN mark-read: one id (clicking an item) or all
// (mark-all-read; body omits id). Own-row receipts only; ids outside the
// member's own window are ignored server-side.
router.post("/member-inbox/read", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.member_inbox_read.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (boundAccount === null) {
    deny(res, 401, "no_session");
    return;
  }
  const body: unknown = req.body;
  let id: string | null = null;
  if (typeof body === "object" && body !== null && "id" in body) {
    const raw = (body as Record<string, unknown>).id;
    if (typeof raw !== "string" || raw.length === 0 || raw.length > 64) {
      deny(res, 400, "bad_request");
      return;
    }
    id = raw;
  }
  const ok = await markInboxRead(boundAccount, id);
  if (!ok) {
    deny(res, 503, "unavailable");
    return;
  }
  req.log.info({ event: "auth.member_inbox_read.ok" });
  res.json({ ok: true });
});

// ── GET /api/auth/activation-request ────────────────────────────────────────
// K3.a (mockup founder-approved 2026-07-22) — the member's OWN eligibility
// card + latest request state, in one read. ONE truth, two faces: the same
// live checks feed the founder's review queue. The ONLY input is the session
// cookie; the bound account is server-side only; the payload carries booleans,
// ISO dates, the founder's decline sentence, and the own-row 64-hex source id
// — never a wallet. Eligibility legs fail closed to null independently.
router.get("/activation-request", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.activation_request.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  const sessionActive = boundAccount !== null;

  const eligibility =
    boundAccount === null
      ? null
      : await readActivationEligibility(boundAccount);
  const own =
    boundAccount === null ? null : await readOwnActivationRequest(boundAccount);

  const payload = {
    state: sessionActive ? ("S4" as const) : ("S1" as const),
    chainVerified: eligibility?.chainVerified ?? false,
    seatHeld: eligibility?.seatHeld ?? null,
    holdsSyn: eligibility?.holdsSyn ?? null,
    sourceOnChain: eligibility?.sourceOnChain ?? null,
    sourceActive: eligibility?.sourceActive ?? null,
    sourceIdHex: eligibility?.sourceIdHex ?? null,
    request: own?.request ?? null,
    /** false = the request store is unavailable (fail closed), never "none". */
    requestReadOk: own !== null,
    failureReason:
      boundAccount === null
        ? "no active wallet session; sign in to read your activation state"
        : (eligibility?.failureReason ?? null),
  };
  try {
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(payload))) {
      throw new Error("address-shaped token in payload");
    }
  } catch {
    req.log.warn({ event: "auth.activation_request.discipline_rejected" });
    deny(res, 500, "unavailable");
    return;
  }
  req.log.info({
    event: "auth.activation_request.checked",
    code: !sessionActive ? "none" : own !== null ? "mapped" : "unavailable",
  });
  res.json(payload);
});

// ── POST /api/auth/activation-request ───────────────────────────────────────
// K3.a — the member's OWN "Ask for activation" (THE SECOND member-side write
// class). No body input at all. Eligibility is RE-VERIFIED LIVE server-side
// at ask time (fail closed: an unavailable read never becomes a verdict):
// a seat held AND SYN held (any amount — the engraved contract truth) AND
// the source not already live. One open request per wallet; the row and its
// audit row commit in one transaction (activationRequests.ts).
router.post("/activation-request", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "auth.activation_request_ask.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const boundAccount =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (boundAccount === null) {
    deny(res, 401, "no_session");
    return;
  }

  const eligibility = await readActivationEligibility(boundAccount);
  if (eligibility.sourceActive === true) {
    deny(res, 400, "already_active");
    return;
  }
  if (
    eligibility.seatHeld === null ||
    eligibility.holdsSyn === null ||
    eligibility.sourceActive === null // the not-already-live leg is fail-closed too
  ) {
    deny(res, 503, "unavailable"); // a read that didn't run is never a pass
    return;
  }
  if (eligibility.seatHeld !== true || eligibility.holdsSyn !== true) {
    deny(res, 400, "not_eligible");
    return;
  }
  if (eligibility.sourceIdHex === null) {
    deny(res, 503, "unavailable");
    return;
  }

  const outcome = await createOwnActivationRequest(
    boundAccount,
    eligibility.sourceIdHex,
  );
  if (outcome === "unavailable") {
    deny(res, 503, "unavailable");
    return;
  }
  req.log.info({ event: "auth.activation_request_ask.ok", code: outcome });
  res.json({ ok: true });
});

// ── POST /api/auth/logout ───────────────────────────────────────────────────
router.post("/logout", (req: Request, res: Response) => {
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof sessionId === "string" && sessionId.length > 0) {
    destroySession(sessionId);
  }
  res.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
  req.log.info({ event: "auth.logout.ok" });
  res.json({ state: "S1" });
});

// Router-scoped error handler: malformed JSON bodies (or any parser error)
// fail closed with the uniform shape instead of an HTML error page.
router.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    void err;
    req.log.info({ event: "auth.request.rejected", code: "body_rejected" });
    deny(res, 400, "bad_request");
  },
);

export default router;
