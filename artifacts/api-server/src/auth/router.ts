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
// member verification, no operator authority). No endpoint ever returns
// member data, operator authority, or wallet/member pairings; no response
// echoes a wallet address. All failures fail closed with a uniform safe
// error shape. Nonces, signatures and addresses are never logged.

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
  touchSession,
} from "./sessionStore";
import { allowRequest } from "./throttle";
import { throttleKey } from "./clientIdentity";

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
  //    id is issued (fixation defense).
  const priorId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof priorId === "string" && priorId.length > 0) {
    destroySession(priorId);
  }
  const sessionId = createSession();
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
