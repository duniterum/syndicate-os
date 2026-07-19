// components/referral/referralStanding.ts
//
// The SHARED standing read for the tabbed referral surface (slice 2 — the
// 5 tabs). One hook, one formatter, one failure-humanizer — the container
// fetches ONCE and every tab panel receives the same readback as a prop, so
// the five panels can never drift apart on the same wallet's truth.
// Extracted verbatim from MemberReferralDashboard.tsx (S7 truth sweep code —
// proven in prod); no behavior change.

import { useEffect, useState } from "react";

// R5 — the signed wallet's OWN indexed introduction standing (counts from the
// introduction snapshot + live registry existence), fetched through the
// gated wallet module via a runtime dynamic import (guard rule 15). Null =
// not loaded / no session / read failed → the surface renders its honest
// sign-in state; a figure only ever comes from the readback.
export type StandingReadback = import("@/wallet/walletSession").SourceStandingReadback;

export function useOwnSourceStanding(): StandingReadback | null {
  const [standing, setStanding] = useState<StandingReadback | null>(null);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    // Re-read on session changes (S7): the member connects on the door band
    // and this surface resolves in place — no reload needed.
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void ws.fetchSourceStanding().then((r) => {
          if (active) setStanding(r);
        });
      };
      read();
      window.addEventListener(ev.SESSION_CHANGED_EVENT, read);
      cleanup = () => window.removeEventListener(ev.SESSION_CHANGED_EVENT, read);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return standing;
}

/**
 * S7-e — server diagnostics never reach a member verbatim (Human-First Law):
 * known reasons get their human sentence; anything else gets the honest
 * generic. The exact reason stays available to verifiers via the tooltip.
 */
export function humanReadFailure(reason: string | null | undefined): string | null {
  if (!reason) return null;
  if (reason.includes("no on-chain referral source")) {
    return "No referral source exists for this wallet yet — a new source is a founder-signed on-chain act.";
  }
  return "The live read didn't answer just now — nothing is assumed, nothing is invented. Try again in a moment.";
}

export function usd(raw: string): string {
  const n = BigInt(raw);
  const whole = n / 1_000_000n;
  const cents = ((n % 1_000_000n) / 10_000n).toString().padStart(2, "0");
  return `$${whole}.${cents}`;
}
