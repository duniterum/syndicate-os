/**
 * MILESTONE PROGRESS — ONE derivation, read by every surface that draws a bar.
 * ---------------------------------------------------------------------------
 * Two surfaces now render milestone ladders: the record on /activity and the
 * momentum band on the public home. They must never compute a percentage twice
 * — a bar that reads 62% on one page and 61% on another is the one-authority
 * rule broken in the most visible possible way, on figures whose whole job is
 * to be checkable.
 *
 * Moved here verbatim from `components/activity/MilestonesPanel.tsx`
 * (2026-07-27) rather than copied: the panel imports it now, so there is
 * exactly one place where a raw ladder becomes a percentage and a sentence.
 */

import {
  formatSynRaw,
  formatUsdcRaw,
  type ServedMilestones,
} from "@/lib/backboneFeedClient";

export type MilestoneApproaching = ServedMilestones["approaching"][number];

/**
 * Defense in depth (adversarial verify, 2026-07-22): a non-finite ratio can
 * never reach the bar — a NaN width renders as a FULL gold bar in CSS, which
 * would announce a milestone as complete when nothing is known.
 */
export function clampPct(ratio: number): number | null {
  return Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : null;
}

export function progressFor(a: MilestoneApproaching): {
  text: string;
  pct: number;
} | null {
  if (a.kind === "seats" && a.currentSeats !== null) {
    const pct = clampPct(a.currentSeats / a.target);
    if (pct === null) return null;
    return {
      text: `${a.currentSeats.toLocaleString("en-US")} / ${a.target.toLocaleString("en-US")} seats`,
      pct,
    };
  }
  if ((a.kind === "usdc" || a.kind === "archive-usdc") && a.currentUsdcRaw !== null) {
    const current = Number(BigInt(a.currentUsdcRaw) / 1_000_000n);
    // The two money ladders speak their own register: routed (the sale,
    // 70/20/10) vs patronage (the archive — founder "prix ok" 2026-07-22).
    const unit = a.kind === "usdc" ? "USDC routed" : "USDC of patronage";
    return {
      text: `${formatUsdcRaw(a.currentUsdcRaw)} / ${a.target.toLocaleString("en-US")} ${unit}`,
      pct: clampPct(current / a.target) ?? 0,
    };
  }
  // M-EVO-2: the cumulative-SYN ladder (18-dec raw → whole SYN).
  if (a.kind === "burn-syn" && a.currentSynRaw !== null) {
    const current = Number(BigInt(a.currentSynRaw) / 10n ** 18n);
    return {
      text: `${formatSynRaw(a.currentSynRaw)} / ${a.target.toLocaleString("en-US")} SYN burned`,
      pct: clampPct(current / a.target) ?? 0,
    };
  }
  // M-EVO-2: the act ladders (burns · source creations · pool adds ·
  // artifacts) — a plain honest count toward the rung.
  if (
    (a.kind === "burn-acts" ||
      a.kind === "sources-created" ||
      a.kind === "lp-acts" ||
      a.kind === "archive-count") &&
    a.currentCount !== null
  ) {
    return {
      text: `${a.currentCount.toLocaleString("en-US")} / ${a.target.toLocaleString("en-US")}`,
      pct: clampPct(a.currentCount / a.target) ?? 0,
    };
  }
  // first-mint (or a missing figure): no meaningful bar — honest text only.
  return null;
}

/**
 * The home band's own figure split: the ladder's CURRENT value and its TARGET
 * as two separate strings, because that layout prints them at opposite ends of
 * the bar rather than as one "a / b" sentence. Derived from `progressFor` so
 * the percentage can never disagree with the numbers printed beside it.
 */
export function progressPartsFor(a: MilestoneApproaching): {
  current: string;
  target: string;
  pct: number;
} | null {
  const p = progressFor(a);
  if (p === null) return null;
  const [currentRaw, ...rest] = p.text.split(" / ");
  const tail = rest.join(" / ");
  if (currentRaw === undefined || tail.length === 0) return null;
  // The tail is "<target> <unit words>"; the unit already lives in the card's
  // own label, so the right-hand figure stays a bare number.
  const target = tail.split(" ")[0] ?? tail;
  const unit = tail.slice(target.length).trim();
  return {
    current: unit.length > 0 ? `${currentRaw} ${unit}` : currentRaw,
    target,
    pct: p.pct,
  };
}
