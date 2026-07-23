/**
 * Season Config — the ONE rule sheet the season engine reads (SERVER-ONLY).
 * ---------------------------------------------------------------------------
 * S1 of the seasons arc (founder GO-and-GO-LIVE 2026-07-23). The design law:
 * docs/reference/SEASONS_ORIGIN_HARVEST_AAA_BENCHMARK.md §0 (as amended by the
 * deep-check §0.14, the zero-click ruling §0.15, and the pot model §0.17).
 *
 * Doctrine pins this file carries:
 *   - ONE POLICY MODULE (§0.14-B): weights, axes, the payout curve, floors live HERE and
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
  // THE CONNECTOR LADDER — the CANON rungs and thresholds, verbatim from
  // referralProgram.ts commissionTiers (founder vocabulary check 2026-07-23:
  // "on utilise LES ÉCHELLES ET LES MOTS de notre système, jamais inventés").
  // The rung titles the surfaces speak are the engraved names; the canon's own
  // Active note already binds the ladder to season points. V1 counts CONVERTED
  // introductions; the DURABLE qualifier (the panel's own standing) replaces it
  // at S2 wiring — one authority, the season never recomputes the ladder.
  { id: "connector-active", questClass: "ladder", metricKey: "introductions-converted", target: 3, bonusXp: 250 },
  { id: "connector-trusted", questClass: "ladder", metricKey: "introductions-converted", target: 10, bonusXp: 600 },
  { id: "connector-established", questClass: "ladder", metricKey: "introductions-converted", target: 25, bonusXp: 1000 },
  { id: "connector-durable", questClass: "ladder", metricKey: "introductions-converted", target: 60, bonusXp: 1500 },
  { id: "connector-foundational", questClass: "ladder", metricKey: "introductions-converted", target: 150, bonusXp: 2500 },
  { id: "connector-summit", questClass: "ladder", metricKey: "introductions-converted", target: 300, bonusXp: 5000 },
  // FIRSTS — the milestone-canon first-act class, personal (first-seat/
  // first-mint precedent; a first is a starter completion, never a rung).
  { id: "first-introduction", questClass: "starter", metricKey: "introductions-converted", target: 1, bonusXp: 100 },
  { id: "first-burn", questClass: "starter", metricKey: "burn-acts", target: 1, bonusXp: 100 },
  { id: "first-archive-mint", questClass: "starter", metricKey: "archive-mints", target: 1, bonusXp: 100 },
];

/**
 * THE PAYOUT CURVE — FOUNDER DECISION 2026-07-23: OPTION A, the poker-standard
 * geometric curve (dossier §10; SUPERSEDES the flat-within-band §0.17-④ model —
 * the world standard has NO flat top: adjacent ranks always differ).
 * Defined in BASIS POINTS of the round budget so the SHAPE scales to any pot —
 * $2,000 or $100,000, every prize scales proportionally.
 *
 * THE DEPTH LAW (founder follow-up, same day: "à 100k ça s'arrête toujours au
 * 25e?" — NO): 25 paid is only the $2,000/333 illustration, never a constant.
 * Paid depth = min( ~10% of eligible builders, the deepest rank whose prize
 * still clears MIN_PRIZE_USDC ). A bigger pot pays DEEPER and BIGGER at every
 * rank — the poker scaling law: paid places track the FIELD; the min-cash
 * floor keeps the tail meaningful. The table below is the curve SAMPLED at
 * 25 places; the S3 policy module stretches the same geometric shape to the
 * computed depth. READ BY NOTHING until S3.
 */
export interface BountyCurveStep {
  readonly fromRank: number;
  readonly toRank: number;
  /** Basis points of the round budget EACH wallet at these ranks receives. */
  readonly bpEach: number;
}
export const BOUNTY_CURVE_BP_V1: readonly BountyCurveStep[] = [
  { fromRank: 1, toRank: 1, bpEach: 2250 },
  { fromRank: 2, toRank: 2, bpEach: 1450 },
  { fromRank: 3, toRank: 3, bpEach: 1000 },
  { fromRank: 4, toRank: 4, bpEach: 750 },
  { fromRank: 5, toRank: 5, bpEach: 600 },
  { fromRank: 6, toRank: 6, bpEach: 500 },
  { fromRank: 7, toRank: 7, bpEach: 425 },
  { fromRank: 8, toRank: 8, bpEach: 350 },
  { fromRank: 9, toRank: 9, bpEach: 300 },
  { fromRank: 10, toRank: 10, bpEach: 250 },
  { fromRank: 11, toRank: 15, bpEach: 175 },
  { fromRank: 16, toRank: 25, bpEach: 125 },
];
// Σ over the 25-place sample = 10,000 bp exactly — the WHOLE pot pays.
/** The min-cash floor guarding the tail when depth scales (founder-settable
 *  at the S3 gate; $20 default per the WSOP min-cash-matters principle). */
export const MIN_PRIZE_USDC_DEFAULT = 20;

/**
 * THE ELIGIBILITY FLOOR PAIR — §0.17-⑤ (BACKLOG season-floor: both figures
 * are the FOUNDER's, decided at the S3 gate). null = not yet set; the S3
 * money rail REFUSES to open a round while either is null (fail-closed) —
 * recognition XP flows regardless.
 */
/** §0.17-⑤ ANTI-FARM DEFERRAL (final audit 2026-07-23): the referral XP
 *  per-wallet-per-window CAP and the floor-pair gate on the CREDIT path are
 *  NOT implemented in the V1 recognition engine — both MUST land with the S3
 *  money rail before any round pays (recognition-only until then; the S3
 *  policy module refuses to open a round while this note stands). */
export const ELIGIBILITY_FLOOR = {
  /** Minimum qualifying purchase (whole USDC) for a referred wallet to
   *  credit its introducer toward BOUNTY eligibility. */
  minQualifyingPurchaseUsdc: null as number | null,
  /** Minimum XP for a wallet to enter a paid band. */
  minXpForBounty: null as number | null,
} as const;
