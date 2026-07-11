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
import { resolveOwnStanding } from "../lib/protocol/holderIndexStanding";
import { txUrl } from "../canon/the-syndicate/chain/chain-registry";
import { assertProtocolRealityDiscipline } from "../lib/protocol/payloadDiscipline";

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
