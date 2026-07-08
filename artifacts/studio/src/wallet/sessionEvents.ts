// wallet/sessionEvents.ts
//
// Session-change announcement seam. The session truth ALWAYS stays with
// GET /api/auth/session — this event never carries state, it only tells
// listeners (RainbowKit status query, WalletSessionBoot) to re-read the
// server. In-memory only; nothing is persisted.

export const SESSION_CHANGED_EVENT = "syndicate:session-changed";

export function announceSessionChanged(): void {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}
