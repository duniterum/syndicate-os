// lib/sessionEvents.ts
//
// Session-change announcement seam (hoisted out of the wallet module in Phase
// 3 slice 4a so non-wallet surfaces — e.g. the admin operator registry — can
// LISTEN without statically reaching @/wallet/, which the access-state guard
// reserves for App.tsx). The session truth ALWAYS stays with
// GET /api/auth/session — this event never carries state, it only tells
// listeners (RainbowKit status query, WalletSessionBoot, registry reads) to
// re-read the server. In-memory only; nothing is persisted.

export const SESSION_CHANGED_EVENT = "syndicate:session-changed";

export function announceSessionChanged(): void {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}
