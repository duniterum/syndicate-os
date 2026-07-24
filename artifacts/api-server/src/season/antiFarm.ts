/**
 * antiFarm — THE §0.17-⑤ LAWS (S3-4 · the hard prerequisite of ANY paid round).
 * ---------------------------------------------------------------------------
 * The anti-"money buys money" spine, applied to the MONEY WINDOW only:
 * recognition XP (the live board, levels, crowns) is NEVER gated by these laws —
 * rank never drops; the MONEY binds to delta windows (§0.17-②), and it is the
 * money view this module filters. Every law is FAIL-CLOSED: missing context
 * (unknown acquisition time, unknown referred purchase) EXCLUDES the event from
 * money — an honest gap never pays.
 *
 * THE TWO LAWS:
 *   ① HOLDING PERIOD (wash-loop dead): a burn/mint act counts toward money only
 *     if the wallet's most recent SYN acquisition is ≥ the published holding
 *     period BEFORE the act. Buy→burn→rebuy cycles the same capital for zero
 *     money-XP.
 *   ② REFERRAL FLOOR-GATE (the founder's two numbers): an introduction counts
 *     toward money only when the REFERRED wallet independently clears the
 *     eligibility floor pair — min qualifying purchase AND min XP.
 * (Purchase XP is already ONCE per wallet per season upstream in the
 * readmodel — receipt-splitting buys nothing; it passes through here.)
 *
 * ⛔ NO REFERRAL CAP — FOUNDER RULING 2026-07-24 ("pas de plafond — laisser
 * travailler les gens; on n'est pas cons de refuser de l'argent, on est un
 * business"), superseding the harvest §0.17-⑤ "capped per wallet per window"
 * clause IN PLACE: every introduction credit is backed by a REAL qualifying
 * purchase — company REVENUE — so "farming" referrals IS the business working.
 * The floor-gate + self-referral-dead + once-per-season purchase laws already
 * kill every fake vector; the admin intelligence layer (source performance —
 * la crème de la crème) is what identifies the best workers, and it needs the
 * UNCAPPED data. No agent re-adds a cap in any form.
 *
 * Values: `ANTI_FARM_PROPOSED` is the ENGINEERING DEFAULT the founder confirms
 * or amends at the S3-9 money-sheet seal (it enters the hashed rule sheet).
 * The floor pair stays null until HE sets it — and potPolicy separately
 * REFUSES any round while it is null.
 */

import type { XpSourceKey } from "../data/seasonConfig.js";

/** Proposed V1 knob — the founder's to confirm at S3-9 (hashed into the sheet). */
export const ANTI_FARM_PROPOSED = {
  /** ① Min holding time (seconds) between the wallet's last SYN acquisition and
   *  a burn/mint act for that act to count toward money. Default: 7 days. */
  holdingPeriodSeconds: 7 * 24 * 3600,
} as const;

export interface AntiFarmKnobs {
  readonly holdingPeriodSeconds: number;
  readonly floorPair: {
    readonly minQualifyingPurchaseUsdc: number | null;
    readonly minXpForBounty: number | null;
  };
}

/** One XP event as the money-window filter consumes it (the S3-5 adapter maps
 *  the readmodel's window events + lane context into this shape). */
export interface MoneyWindowEventInput {
  readonly wallet: string;
  readonly sourceKey: XpSourceKey | "quest-bonus";
  readonly xp: number;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** Act time (enriched block timestamp, seconds). */
  readonly actAtSec: number;
  /** ① burn-act/archive-mint context: the wallet's most recent SYN acquisition
   *  time BEFORE this act (seconds), or null if unknown → excluded fail-closed. */
  readonly lastAcquiredAtSec?: number | null;
  /** ② introduction context: the referred wallet's qualifying purchase (whole
   *  USDC) and its own XP — null/absent → excluded fail-closed. */
  readonly referredPurchaseUsdc?: number | null;
  readonly referredWalletXp?: number | null;
}

export type MoneyExclusionReason =
  | "holding-period"
  | "holding-unknown"
  | "referral-floor-purchase"
  | "referral-floor-xp"
  | "referral-floor-unset"
  | "referral-context-unknown";

export interface MoneyWindowResult {
  readonly included: readonly MoneyWindowEventInput[];
  readonly excluded: readonly { event: MoneyWindowEventInput; reason: MoneyExclusionReason }[];
  /** wallet (lowercase) → Σ money-window XP. */
  readonly perWalletMoneyXp: ReadonlyMap<string, number>;
}

/** Apply the two laws to ONE money window's events. Pure, deterministic. */
export function filterForMoneyWindow(
  events: readonly MoneyWindowEventInput[],
  knobs: AntiFarmKnobs,
): MoneyWindowResult {
  const included: MoneyWindowEventInput[] = [];
  const excluded: { event: MoneyWindowEventInput; reason: MoneyExclusionReason }[] = [];

  // Deterministic order (block, then logIndex) — stable outputs forever.
  const ordered = [...events].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );

  for (const e of ordered) {
    if (e.sourceKey === "burn-act" || e.sourceKey === "archive-mint") {
      // ① the holding period — fail-closed on unknown acquisition.
      if (e.lastAcquiredAtSec === null || e.lastAcquiredAtSec === undefined) {
        excluded.push({ event: e, reason: "holding-unknown" });
        continue;
      }
      if (e.actAtSec - e.lastAcquiredAtSec < knobs.holdingPeriodSeconds) {
        excluded.push({ event: e, reason: "holding-period" });
        continue;
      }
      included.push(e);
      continue;
    }
    if (e.sourceKey === "introduction-converted") {
      // ② the floor pair — the founder's numbers; null = nothing passes.
      const { minQualifyingPurchaseUsdc, minXpForBounty } = knobs.floorPair;
      if (minQualifyingPurchaseUsdc === null || minXpForBounty === null) {
        excluded.push({ event: e, reason: "referral-floor-unset" });
        continue;
      }
      if (
        e.referredPurchaseUsdc === null ||
        e.referredPurchaseUsdc === undefined ||
        e.referredWalletXp === null ||
        e.referredWalletXp === undefined
      ) {
        excluded.push({ event: e, reason: "referral-context-unknown" });
        continue;
      }
      if (e.referredPurchaseUsdc < minQualifyingPurchaseUsdc) {
        excluded.push({ event: e, reason: "referral-floor-purchase" });
        continue;
      }
      if (e.referredWalletXp < minXpForBounty) {
        excluded.push({ event: e, reason: "referral-floor-xp" });
        continue;
      }
      // NO CAP (founder ruling 2026-07-24): every floor-clearing conversion is
      // real company revenue — let people work; the intelligence layer reads
      // the uncapped truth to see la crème de la crème.
      included.push(e);
      continue;
    }
    // purchase-receipt (once/season upstream) and chain-fed quest bonuses pass.
    included.push(e);
  }

  const perWalletMoneyXp = new Map<string, number>();
  for (const e of included) {
    const k = e.wallet.toLowerCase();
    perWalletMoneyXp.set(k, (perWalletMoneyXp.get(k) ?? 0) + e.xp);
  }
  return { included, excluded, perWalletMoneyXp };
}
