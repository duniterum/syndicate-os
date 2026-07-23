/**
 * Season Config — the ONE rule sheet the season engine reads (SERVER-ONLY).
 * ---------------------------------------------------------------------------
 * S1 of the seasons arc (founder GO-and-GO-LIVE 2026-07-23). The design law:
 * docs/reference/SEASONS_ORIGIN_HARVEST_AAA_BENCHMARK.md §0 (as amended by the
 * deep-check §0.14, the zero-click ruling §0.15, and the pot model §0.17).
 *
 * Doctrine pins this file carries:
 *   - ONE POLICY MODULE (§0.14-B): weights, axes, bands, floors live HERE and
 *     nowhere else — the public ranking, the member card, and the admin
 *     dry-run all read projections of this one sheet. The client NEVER
 *     computes shares.
 *   - THE FEEDER LAW (§0.3): a quest may only reference a metric key this
 *     server actually computes — seasonReadmodel asserts it FAIL-CLOSED at
 *     build time; an unfed quest cannot exist.
 *   - THE RULE-STABILITY LAW (§0.17-⑦): once a season opens, its rule sheet
 *     is immutable for that season (changes apply to the NEXT season); at S3
 *     the sheet's hash is committed in the season-open on-chain event
 *     (rulesHash) — verifiable, not claimed.
 *   - FOUNDER-PENDING VALUES (BACKLOG rows season-bands-weights ·
 *     season-floor): the figures below are the PROPOSED V1 defaults engraved
 *     in §0.14-H/§0.17 — the founder confirms or amends them at the S2/S3
 *     gates, ON SCREEN, before any surface or money reads them as final.
 */

/** Recognition axes (canon: GAMIFICATION_LEGAL_DOCTRINE — capital is an axis,
 *  never the throne). V1 maps the four chain-proven act classes; app-attested
 *  axes (Verifier · Historian-learning) arrive WITH their feeder slices. */
export type SeasonAxis = "connector" | "capital" | "steward" | "historian";

/** The two proof classes of the one-truth ledger (§0.13-①). V1 emits CHAIN
 *  rows only; APP rows arrive with their feeder slices, never before. */
export type XpProofClass = "chain" | "app";

export interface XpSourceDef {
  readonly key: XpSourceKey;
  readonly axis: SeasonAxis;
  readonly proofClass: XpProofClass;
  /** Whole-XP credit per qualifying act (§0.17-⑤ anti-farm laws apply). */
  readonly xp: number;
  /** Human note rendered nowhere — the builder's own discipline record. */
  readonly law: string;
}

export type XpSourceKey =
  | "introduction-converted"
  | "purchase-receipt"
  | "burn-act"
  | "archive-mint";

/** V1 XP weights (§0.14-H defaults; the founder confirms at the S2 gate).
 *  THE BUSINESS DOMINATES: the introduction outweighs everything — bringing
 *  a member is the work the company most wants to recognize. */
export const XP_SOURCES: readonly XpSourceDef[] = [
  {
    key: "introduction-converted",
    axis: "connector",
    proofClass: "chain",
    xp: 500,
    law: "credits the introducer at CONVERSION (the referred purchase's own sourceWallet); buyer wallet == introducer wallet credits NOTHING (self-referral dead, §0.14-F); the qualifying-floor pair (BACKLOG season-floor) re-gates BOUNTY eligibility at S3.",
  },
  {
    key: "purchase-receipt",
    axis: "capital",
    proofClass: "chain",
    xp: 200,
    law: "ONCE per wallet per season (§0.17-⑤ — receipt-splitting buys nothing; money never buys rank twice).",
  },
  {
    key: "burn-act",
    axis: "steward",
    proofClass: "chain",
    xp: 150,
    law: "per Proof of Burn act; the §0.17-⑤ holding-period condition arrives with the bounty slice (recognition-only until then, honest note in the model).",
  },
  {
    key: "archive-mint",
    axis: "historian",
    proofClass: "chain",
    xp: 100,
    law: "per archive mint act (minter known); pre-backfill rows with unknown minter credit nothing — an honest gap, never a guess.",
  },
];

/** Cumulative lifetime level step (recognition only — never money; the
 *  origin's floor(xp/1000)+1 kept as the V1 curve). */
export const LEVEL_XP_STEP = 1000;

/**
 * THE QUEST REGISTRY — V1 (chain-fed ladders only; the §0.3 feeder law).
 * Classes per §0.11: starter | recurrent | ladder | era-scoped. V1 ships the
 * LADDER class on metrics THIS server computes from the gapless lanes; the
 * starter/recurrent/era-scoped classes arrive WITH their feeders (sessions,
 * quizzes) in their own slices — never before. Labels are internal until the
 * S2 gate puts the public copy on the founder's screen.
 */
export type QuestClass = "starter" | "recurrent" | "ladder" | "era-scoped";

/** Metric keys the season read-model actually FEEDS in V1. */
export type SeasonMetricKey =
  | "introductions-converted"
  | "burn-acts"
  | "archive-mints";

export interface SeasonQuestDef {
  readonly id: string;
  readonly questClass: QuestClass;
  readonly metricKey: SeasonMetricKey;
  /** The metric value at which this rung completes for a wallet. */
  readonly target: number;
  /** Bonus XP on completion (recognition; credited by the builder). */
  readonly bonusXp: number;
}

export const SEASON_QUESTS: readonly SeasonQuestDef[] = [
  { id: "ladder-intro-1", questClass: "ladder", metricKey: "introductions-converted", target: 1, bonusXp: 100 },
  { id: "ladder-intro-3", questClass: "ladder", metricKey: "introductions-converted", target: 3, bonusXp: 250 },
  { id: "ladder-intro-10", questClass: "ladder", metricKey: "introductions-converted", target: 10, bonusXp: 600 },
  { id: "ladder-burn-1", questClass: "ladder", metricKey: "burn-acts", target: 1, bonusXp: 100 },
  { id: "ladder-mint-1", questClass: "ladder", metricKey: "archive-mints", target: 1, bonusXp: 100 },
];

/**
 * THE BAND TABLE — §0.17-④ (percentages of the round budget; identical
 * within a band; 95% allocated, 5% → carryover). READ BY NOTHING until S3
 * (the money rail); engraved now so the ONE policy module exists from birth.
 * Founder confirms at the S3 gate (BACKLOG season-bands-weights).
 */
export interface BountyBandDef {
  readonly fromRank: number;
  readonly toRank: number;
  /** Percent of the round budget EACH wallet in the band receives. */
  readonly percentEach: number;
}
export const BOUNTY_BANDS_V1: readonly BountyBandDef[] = [
  { fromRank: 1, toRank: 3, percentEach: 10 },
  { fromRank: 4, toRank: 10, percentEach: 5 },
  { fromRank: 11, toRank: 25, percentEach: 2 },
];

/**
 * THE ELIGIBILITY FLOOR PAIR — §0.17-⑤ (BACKLOG season-floor: both figures
 * are the FOUNDER's, decided at the S3 gate). null = not yet set; the S3
 * money rail REFUSES to open a round while either is null (fail-closed) —
 * recognition XP flows regardless.
 */
export const ELIGIBILITY_FLOOR = {
  /** Minimum qualifying purchase (whole USDC) for a referred wallet to
   *  credit its introducer toward BOUNTY eligibility. */
  minQualifyingPurchaseUsdc: null as number | null,
  /** Minimum XP for a wallet to enter a paid band. */
  minXpForBounty: null as number | null,
} as const;
