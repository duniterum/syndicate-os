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
 * THE THREE LAWS:
 *   ① HOLDING PERIOD (wash-loop dead): a burn/mint act counts toward money only
 *     if the wallet's most recent SYN acquisition is ≥ the published holding
 *     period BEFORE the act. Buy→burn→rebuy cycles the same capital for zero
 *     money-XP.
 *   ② REFERRAL FLOOR-GATE (the founder's two numbers): an introduction counts
 *     toward money only when the REFERRED wallet independently clears the
 *     eligibility floor pair — min qualifying purchase AND min XP.
 *   ③ REFERRAL WINDOW CAP: at most N introduction credits per introducer per
 *     money window (earliest by block/logIndex kept — deterministic); the rest
 *     are recognition-only.
 * (Purchase XP is already ONCE per wallet per season upstream in the
 * readmodel — receipt-splitting buys nothing; it passes through here.)
 *
 * Values: `ANTI_FARM_PROPOSED` are ENGINEERING DEFAULTS the founder confirms or
 * amends at the S3-9 money-sheet seal (they enter the hashed rule sheet as
 * per-source caps). The floor pair stays null until HE sets it — and potPolicy
 * separately REFUSES any round while it is null.
 */

import type { XpSourceKey } from "../data/seasonConfig.js";

/** Proposed V1 knobs — the founder's to confirm at S3-9 (hashed into the sheet). */
export const ANTI_FARM_PROPOSED = {
  /** ① Min holding time (seconds) between the wallet's last SYN acquisition and
   *  a burn/mint act for that act to count toward money. Default: 7 days. */
  holdingPeriodSeconds: 7 * 24 * 3600,
  /** ③ Max introduction credits per introducer per money window. Default: 10. */
  referralWindowCap: 10,
} as const;

export interface AntiFarmKnobs {
  readonly holdingPeriodSeconds: number;
  readonly referralWindowCap: number;
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
  readonly blockTimestamp: number;
  /** ① burn-act/archive-mint context: the wallet's most recent SYN acquisition
   *  time BEFORE this act (seconds), or null if unknown → excluded fail-closed. */
  readonly lastAcquisitionTimestamp?: number | null;
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
  | "referral-context-unknown"
  | "referral-window-cap";

export interface MoneyWindowResult {
  readonly included: readonly MoneyWindowEventInput[];
  readonly excluded: readonly { event: MoneyWindowEventInput; reason: MoneyExclusionReason }[];
  /** wallet (lowercase) → Σ money-window XP. */
  readonly perWalletMoneyXp: ReadonlyMap<string, number>;
}

/** Apply the three laws to ONE money window's events. Pure, deterministic. */
export function filterForMoneyWindow(
  events: readonly MoneyWindowEventInput[],
  knobs: AntiFarmKnobs,
): MoneyWindowResult {
  const included: MoneyWindowEventInput[] = [];
  const excluded: { event: MoneyWindowEventInput; reason: MoneyExclusionReason }[] = [];

  // Deterministic order first — the cap keeps the EARLIEST credits.
  const ordered = [...events].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );

  const referralCount = new Map<string, number>();
  for (const e of ordered) {
    if (e.sourceKey === "burn-act" || e.sourceKey === "archive-mint") {
      // ① the holding period — fail-closed on unknown acquisition.
      if (e.lastAcquisitionTimestamp === null || e.lastAcquisitionTimestamp === undefined) {
        excluded.push({ event: e, reason: "holding-unknown" });
        continue;
      }
      if (e.blockTimestamp - e.lastAcquisitionTimestamp < knobs.holdingPeriodSeconds) {
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
      // ③ the per-introducer window cap — earliest kept.
      const key = e.wallet.toLowerCase();
      const n = referralCount.get(key) ?? 0;
      if (n >= knobs.referralWindowCap) {
        excluded.push({ event: e, reason: "referral-window-cap" });
        continue;
      }
      referralCount.set(key, n + 1);
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
