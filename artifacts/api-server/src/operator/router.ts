// operator/router.ts
//
// Operator WRITE zone — mounted at /api/operator behind authExposureGate (so in
// production it is unreachable unless SYNDICATE_AUTH_ENABLED === "true"). This
// is architecturally separate from the read-only /api router and from the
// registry-less auth zone; it is the only place authorized writes happen.
//
// Every write route follows one shape: throttle → require a wallet session →
// resolve the operator role via the read-only bridge → require a write-capable
// role → validate the body → delegate to a fail-closed service. The verified
// account is used server-side only and is never echoed back.

import { Router, type IRouter, json, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { AUTH_JSON_LIMIT, SESSION_COOKIE_NAME } from "../auth/authConfig";
import { getSessionAccount } from "../auth/sessionStore";
import { allowRequest } from "../auth/throttle";
import { throttleKey } from "../auth/clientIdentity";
import { lookupActiveOperator } from "../auth/operatorContext";
import { saveReferralTerm } from "./referralTermsService";
import { inviteOperator, suspendOperator } from "./operatorRegistryService";

const router: IRouter = Router();

// Scoped body parsing + cookie reading: this zone only, never app-wide.
router.use(json({ limit: AUTH_JSON_LIMIT }));
router.use(cookieParser());

// Roles allowed to change program terms (admin-tier). Everything else is denied.
const WRITE_ROLES = new Set(["founder_root", "protocol_admin"]);

// Uniform safe error shape: coarse reason codes only, no echoes of submitted
// material, no field-level detail.
function deny(res: Response, status: number, reason: string): void {
  res.status(status).json({ error: "operator_denied", reason });
}

const SaveReferralTermBody = z.object({
  key: z.string().min(1).max(64),
  value: z.string().min(1).max(256),
});

const InviteOperatorBody = z.object({
  wallet: z.string().min(1).max(66),
  label: z.string().min(1).max(128),
  role: z.string().min(1).max(32),
});

const SuspendOperatorBody = z.object({
  wallet: z.string().min(1).max(66),
});

// ── POST /api/operator/referral-terms ───────────────────────────────────────
router.post("/referral-terms", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.referral_term.throttled" });
    deny(res, 429, "throttled");
    return;
  }

  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const account =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (account === null) {
    deny(res, 401, "no_session");
    return;
  }

  const ctx = await lookupActiveOperator(account);
  if (!ctx.isOperator || ctx.role === null || !WRITE_ROLES.has(ctx.role)) {
    req.log.warn({ event: "operator.referral_term.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }

  const parsed = SaveReferralTermBody.safeParse(req.body);
  if (!parsed.success) {
    deny(res, 400, "bad_request");
    return;
  }

  const result = await saveReferralTerm({
    key: parsed.data.key,
    value: parsed.data.value,
    actorWallet: account,
    actorRole: ctx.role,
  });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }

  req.log.info({ event: "operator.referral_term.saved", code: "ok" });
  res.json({ ok: true, key: parsed.data.key });
});

// ── POST /api/operator/operators (invite) ───────────────────────────────────
// Admin-tier registry change: founder_root only. Creates an ACTIVE operator row.
router.post("/operators", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.invite.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const account =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (account === null) {
    deny(res, 401, "no_session");
    return;
  }
  const ctx = await lookupActiveOperator(account);
  if (!ctx.isOperator || ctx.role !== "founder_root") {
    req.log.warn({ event: "operator.invite.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const parsed = InviteOperatorBody.safeParse(req.body);
  if (!parsed.success) {
    deny(res, 400, "bad_request");
    return;
  }
  const result = await inviteOperator({
    wallet: parsed.data.wallet,
    label: parsed.data.label,
    role: parsed.data.role,
    actorWallet: account,
    actorRole: ctx.role,
  });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  req.log.info({ event: "operator.invited", code: "ok" });
  res.json({ ok: true });
});

// ── POST /api/operator/operators/suspend ────────────────────────────────────
// Admin-tier registry change: founder_root only. Sets an operator SUSPENDED;
// the bridge denies them on their very next request.
router.post("/operators/suspend", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.suspend.throttled" });
    deny(res, 429, "throttled");
    return;
  }
  const sessionId: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  const account =
    typeof sessionId === "string" && sessionId.length > 0
      ? getSessionAccount(sessionId)
      : null;
  if (account === null) {
    deny(res, 401, "no_session");
    return;
  }
  const ctx = await lookupActiveOperator(account);
  if (!ctx.isOperator || ctx.role !== "founder_root") {
    req.log.warn({ event: "operator.suspend.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const parsed = SuspendOperatorBody.safeParse(req.body);
  if (!parsed.success) {
    deny(res, 400, "bad_request");
    return;
  }
  const result = await suspendOperator({
    wallet: parsed.data.wallet,
    actorWallet: account,
    actorRole: ctx.role,
  });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  req.log.info({ event: "operator.suspended", code: "ok" });
  res.json({ ok: true });
});

export default router;
