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
import { inviteOperator, suspendOperator, listOperators } from "./operatorRegistryService";
import { readMemberLedger } from "./memberLedgerService";
import {
  sendMemberNotification,
  broadcastNotification,
  listNotifications,
  deleteNotification,
  NOTIFICATION_TITLE_MAX,
  NOTIFICATION_BODY_MAX,
} from "./notificationService";
import { assertAddressSafeAggregate } from "../lib/protocol/rpcTransport";

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
  id: z.string().min(1).max(64),
});

// NOTIF-1: the client sends a SEAT number only — never a wallet. The server
// resolves seat→wallet on the continuity spine inside the service.
// NOTIF-2: optional icon + internal link — shape-gated here (length + type);
// the EXACT-MATCH authority is the service (bad_icon / bad_link against the
// os-contracts palette + whitelist). A raw URL never has a field: `link` is
// always a whitelisted internal path key, validated server-side.
const NotifyMemberBody = z.object({
  seat: z.number().int().min(1),
  title: z.string().min(1).max(NOTIFICATION_TITLE_MAX),
  body: z.string().min(1).max(NOTIFICATION_BODY_MAX),
  icon: z.string().max(40).nullish(),
  link: z.string().max(128).nullish(),
});

const BroadcastBody = z.object({
  title: z.string().min(1).max(NOTIFICATION_TITLE_MAX),
  body: z.string().min(1).max(NOTIFICATION_BODY_MAX),
  icon: z.string().max(40).nullish(),
  link: z.string().max(128).nullish(),
});

// NOTIF-2b: delete a notification by its stable id (from the masked list).
const DeleteNotificationBody = z.object({
  id: z.string().min(1).max(64),
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
    id: parsed.data.id,
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

// ── GET /api/operator/operators (list) ──────────────────────────────────────
// Admin-tier registry READ: founder_root or protocol_admin. Read-only; the
// service returns masked wallets only, so no full operator PII leaves the server.
router.get("/operators", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.list.throttled" });
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
    req.log.warn({ event: "operator.list.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const result = await listOperators();
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  req.log.info({ event: "operator.listed", code: "ok" });
  res.json({ ok: true, operators: result.operators });
});

// ── GET /api/operator/member-ledger (M-INT-1; A21 shipped 2026-07-20) ───────
// FOUNDER-ONLY READ: the per-seat member ledger — a projection of already-
// indexed data with SERVER-MASKED short wallets (the §D privacy overlay
// restricts memberNumber↔wallet pairings to founder_root, stricter than the
// admin-tier WRITE_ROLES). No query/params exist (never a lookup API —
// ADR-003). A21: rows now carry their receipts' 64-hex verify anchors, so
// the output scan is the BOUNDARY-AWARE 40-hex form (the f436c42 lesson —
// anchors pass, a bare address fail-closes); every access writes an audit
// row inside the service.
router.get("/member-ledger", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.ledger.throttled" });
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
    req.log.warn({ event: "operator.ledger.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const result = await readMemberLedger({ wallet: account, role: ctx.role });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  // Fail-closed output scan, BOUNDARY-AWARE (A21): a bare 20-byte address
  // anywhere in the payload turns this response into a 500, never a leak —
  // while the receipts' legitimate 64-hex verify anchors pass (the f436c42
  // form, same as the public receipt read).
  if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(JSON.stringify(result.payload))) {
    throw new Error("address-shaped token in ledger payload");
  }
  req.log.info({ event: "operator.ledger.read", code: "ok" });
  res.json({ ok: true, payload: result.payload });
});

// ── POST /api/operator/notifications/member (NOTIF-1) ───────────────────────
// FOUNDER-ONLY WRITE: message ONE member. The body carries a SEAT number only;
// the service resolves seat→wallet server-side on the continuity spine — no
// wallet ever appears in a client request. Audited inside the service (seat
// only — the pairing never lands in audit).
router.post("/notifications/member", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.notify_member.throttled" });
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
    req.log.warn({ event: "operator.notify_member.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const parsed = NotifyMemberBody.safeParse(req.body);
  if (!parsed.success) {
    deny(res, 400, "bad_request");
    return;
  }
  const result = await sendMemberNotification({
    seat: parsed.data.seat,
    title: parsed.data.title,
    body: parsed.data.body,
    icon: parsed.data.icon,
    link: parsed.data.link,
    actorWallet: account,
    actorRole: ctx.role,
  });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  req.log.info({ event: "operator.notify_member.sent", code: "ok" });
  res.json({ ok: true });
});

// ── POST /api/operator/notifications/broadcast (NOTIF-1) ────────────────────
// FOUNDER-ONLY WRITE: one message to ALL members (a single audience=ALL row —
// the persisted read model; no push, no email, ever). Audited in the service.
router.post("/notifications/broadcast", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.broadcast.throttled" });
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
    req.log.warn({ event: "operator.broadcast.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const parsed = BroadcastBody.safeParse(req.body);
  if (!parsed.success) {
    deny(res, 400, "bad_request");
    return;
  }
  const result = await broadcastNotification({
    title: parsed.data.title,
    body: parsed.data.body,
    icon: parsed.data.icon,
    link: parsed.data.link,
    actorWallet: account,
    actorRole: ctx.role,
  });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  req.log.info({ event: "operator.broadcast.sent", code: "ok" });
  res.json({ ok: true });
});

// ── POST /api/operator/notifications/delete (NOTIF-2b) ──────────────────────
// FOUNDER-ONLY WRITE: retire a notification by its stable id (a mistaken /
// outdated / test send). A deliberate audited act — distinct from the
// no-auto-expiry covenant. The service removes the row + its receipts in one
// transaction and audit-rows the deletion.
router.post("/notifications/delete", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.notif_delete.throttled" });
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
    req.log.warn({ event: "operator.notif_delete.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const parsed = DeleteNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    deny(res, 400, "bad_request");
    return;
  }
  const result = await deleteNotification({
    id: parsed.data.id,
    actorWallet: account,
    actorRole: ctx.role,
  });
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  req.log.info({ event: "operator.notif_delete.ok", code: "ok" });
  res.json({ ok: true });
});

// ── GET /api/operator/notifications (NOTIF-1) ───────────────────────────────
// FOUNDER-ONLY READ: the recent sent list (the honest bell + composer history).
// Masked short wallets only; no query/params; the payload passes the 40-hex
// fail-closed scanner before it leaves.
router.get("/notifications", async (req: Request, res: Response) => {
  if (!allowRequest(throttleKey(req))) {
    req.log.warn({ event: "operator.notifications.throttled" });
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
    req.log.warn({ event: "operator.notifications.denied", code: "insufficient_role" });
    deny(res, 403, "insufficient_role");
    return;
  }
  const result = await listNotifications();
  if (!result.ok) {
    deny(res, result.reason === "unavailable" ? 503 : 400, result.reason);
    return;
  }
  assertAddressSafeAggregate(JSON.stringify(result.notifications));
  req.log.info({ event: "operator.notifications.listed", code: "ok" });
  res.json({ ok: true, notifications: result.notifications });
});

export default router;
