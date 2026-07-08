// wallet/sessionEvents.ts
//
// Re-export of the session-change announcement seam, which lives in
// lib/sessionEvents.ts (hoisted in Phase 3 slice 4a so non-wallet listeners
// never statically import the wallet module). Wallet-internal imports keep
// their "./sessionEvents" path; the seam itself carries no wallet code and
// no state — the session truth always stays with GET /api/auth/session.

export { SESSION_CHANGED_EVENT, announceSessionChanged } from "@/lib/sessionEvents";
