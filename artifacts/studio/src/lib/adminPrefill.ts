// lib/adminPrefill.ts — K3.a: the queue→signing handoff seam.
// ---------------------------------------------------------------------------
// The review queue's Approve door hands the signing surface the request's
// wallet through a one-shot window event — never storage (rule 12: React
// memory and one-shot events only), never a static wallet-zone import from
// a component (rule 15). ProposeSourceCreate (wallet zone, lazy) listens and
// prefills its own form + scrolls itself into view; the K3.b stacked signing
// session will absorb this seam whole.

export const PROPOSE_SOURCE_PREFILL_EVENT = "syn:propose-source-prefill";

export interface ProposeSourcePrefillDetail {
  /** The full wallet to create the source for (founder-only material). */
  wallet: string;
  /** K3.b — the activation request this signing session answers: after the
   * activation receipt confirms, the session closes the request and the
   * member's bell rings, with no manual Record-it click. */
  requestId: string | null;
}

// One-shot in-memory buffer (adversarial verify 2026-07-22): the wallet-zone
// chunk is lazy — Approve can fire before ProposeSourceCreate ever mounted,
// and a bare event into a listenerless window is silently lost while the
// toast claims success. The dispatch also parks the value here; the form
// consumes it exactly once on mount. Never storage (rule 12) — module memory
// only, gone on reload.
let pendingPrefill: ProposeSourcePrefillDetail | null = null;

export function dispatchProposeSourcePrefill(
  wallet: string,
  requestId: string | null = null,
): void {
  pendingPrefill = { wallet, requestId };
  window.dispatchEvent(
    new CustomEvent<ProposeSourcePrefillDetail>(PROPOSE_SOURCE_PREFILL_EVENT, {
      detail: { wallet, requestId },
    }),
  );
}

/** The parked detail, consumed exactly once (mount-time catch-up). */
export function consumePendingPrefill(): ProposeSourcePrefillDetail | null {
  const p = pendingPrefill;
  pendingPrefill = null;
  return p;
}
