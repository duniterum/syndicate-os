// components/referral/referralStanding.ts
//
// The SHARED standing read for the tabbed referral surface (slice 2 — the
// 5 tabs). One hook, one formatter, one failure-humanizer — the container
// fetches ONCE and every tab panel receives the same readback as a prop, so
// the five panels can never drift apart on the same wallet's truth.
// Extracted verbatim from MemberReferralDashboard.tsx (S7 truth sweep code —
// proven in prod); no behavior change.

import { useEffect, useState } from "react";
import { formatRawUnits } from "@/lib/rawUnits";

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

// Slice ④ — the member's OWN per-introduction rows (same dynamic-import +
// session-event discipline; fetched by the panels that render the record).
// Slice 5.1: an optional retry token — bumping it re-runs the read and shows
// the honest resolving state again (the register's "Retry" affordance); the
// zero-arg callers are unchanged.
export type OwnIntroductionsReadback =
  import("@/wallet/walletSession").OwnIntroductionsReadback;

export function useOwnIntroductions(retryToken = 0): OwnIntroductionsReadback | null {
  const [readback, setReadback] = useState<OwnIntroductionsReadback | null>(null);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    if (retryToken > 0) setReadback(null);
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void ws.fetchOwnIntroductions().then((r) => {
          if (active) setReadback(r);
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
  }, [retryToken]);
  return readback;
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

/** THE one referral money formatter (slice 5.1, harmony rule #5): exact USD
 * from USDC base units — never floored (the split must SUM on screen exactly
 * as it does on-chain: $3.325 renders, not $3.32), fraction padded to at
 * least cents. The flooring `usd()` is retired from every referral surface —
 * the same receipt can never show two different dollar figures one card
 * apart. */
export function usdExact(raw: string): string {
  const s = formatRawUnits(raw, 6);
  const [whole, frac = ""] = s.split(".");
  return `$${whole}.${frac.padEnd(2, "0")}`;
}

// ── The register's ONE date grammar (slice 5.1 — shared with the binder's
// composition: full month words, absolute dates, pure string math on the
// served ISO day; no Date parsing, no locale drift). ─────────────────────────
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

/** "2026-07-12" → "JULY 2026" (the month-group eyebrow). */
export function monthLabel(isoDayUtc: string): string {
  const m = isoDayUtc.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!m) return isoDayUtc;
  const idx = Number(m[2]) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${m[1]}` : isoDayUtc;
}

/** "2026-07-12" → "July 12, 2026" (the register's one date format). */
export function dateLabel(isoDayUtc: string): string {
  const m = isoDayUtc.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDayUtc;
  const idx = Number(m[2]) - 1;
  if (idx < 0 || idx > 11) return isoDayUtc;
  const month = MONTHS[idx];
  return `${month.charAt(0)}${month.slice(1).toLowerCase()} ${Number(m[3])}, ${m[1]}`;
}
