/**
 * rulesHash — the canonical season rule sheet + its chain anchor (spec §0.17-⑦).
 * ---------------------------------------------------------------------------
 * "Immutability becomes verifiable, not claimed": the FULL sheet — curve bp ·
 * XP weights · per-source caps · the floor pair + min-cash · the interim-policy
 * sentence · the hors-concours list · AND the policy ALGORITHMS AS TEXT — is
 * serialized canonically (sorted keys, bigint-safe) and keccak256'd. The owner
 * anchors that hash on-chain (setSeasonRules / the S1 constructor); anyone can
 * re-derive it from the published sheet. Change anything → different hash →
 * chain-visible.
 *
 * HARD LAW (master plan S3-9): every hashed input is a MAINNET-DEPLOY blocker —
 * `hashRuleSheet` REFUSES any null. The founder seals the real figures at S3-9;
 * nothing here guesses for him.
 */

import { keccak256, toBytes } from "viem";
import {
  BOUNTY_CURVE_BP_V1,
  MIN_PRIZE_USDC_DEFAULT,
  XP_SOURCES,
} from "../data/seasonConfig.js";
import { POLICY_ALGORITHM_TEXT } from "./potPolicy.js";

export interface SeasonRuleSheet {
  readonly seasonId: number;
  /** Option-A curve, basis points, the 25-place sample. */
  readonly curveBp: readonly { fromRank: number; toRank: number; bpEach: number }[];
  /** XP weights per source (the founder confirms at S3-9). */
  readonly xpWeights: Readonly<Record<string, number>>;
  /** Per-source caps — the founder's figures for FUTURE app-attested sources
   *  (check-in-class "weigh near-zero in money windows"). EMPTY IS LEGITIMATE:
   *  the 2026-07-24 no-cap ruling («pas de plafond») makes zero caps the V1
   *  truth — introductions are UNCAPPED forever, purchases are once/season
   *  structurally, burn/mint are holding-gated. An empty object hashes fine. */
  readonly perSourceCaps: Readonly<Record<string, number>>;
  /** The floor pair — null REFUSED at hash time. */
  readonly minQualifyingPurchaseUsdc: number | null;
  readonly minXpForBounty: number | null;
  readonly minPrizeUsdc: number;
  /** The interim policy IN WORDS — even "no interims planned" must be written. */
  readonly interimPolicy: string;
  /** Hors-concours wallets at season open (full addresses — chain data is public). */
  readonly horsConcours: readonly `0x${string}`[];
  /** The rank/depth/stretch algorithms as law-text (POLICY_ALGORITHM_TEXT). */
  readonly algorithms: string;
}

/** The V1 skeleton from the one config sheet — founder-pending fields left null
 *  so the S3-9 seal MUST fill them (a null can never slip into a hash). */
export function buildV1SheetSkeleton(seasonId: number): SeasonRuleSheet {
  const weights: Record<string, number> = {};
  for (const s of XP_SOURCES) weights[s.key] = s.xp;
  return {
    seasonId,
    curveBp: BOUNTY_CURVE_BP_V1.map((s) => ({ ...s })),
    xpWeights: weights,
    perSourceCaps: {}, // founder figures at S3-9 (empty = unset, refused by hash)
    minQualifyingPurchaseUsdc: null,
    minXpForBounty: null,
    minPrizeUsdc: MIN_PRIZE_USDC_DEFAULT,
    interimPolicy: "", // must be written, even as "no interims planned"
    horsConcours: [],
    algorithms: POLICY_ALGORITHM_TEXT,
  };
}

/** Canonical stable serialization — sorted keys at every depth, no undefined. */
export function canonicalSerialize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v !== null && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = sortDeep((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  if (typeof v === "bigint") return `bigint:${v.toString()}`;
  return v;
}

/** keccak256 of the canonical sheet — REFUSES nulls/empties (mainnet blockers). */
export function hashRuleSheet(sheet: SeasonRuleSheet): `0x${string}` {
  if (sheet.minQualifyingPurchaseUsdc === null) {
    throw new Error("REFUSED: minQualifyingPurchaseUsdc is null — the founder seals it at S3-9");
  }
  if (sheet.minXpForBounty === null) {
    throw new Error("REFUSED: minXpForBounty is null — the founder seals it at S3-9");
  }
  if (sheet.interimPolicy.trim() === "") {
    throw new Error(
      'REFUSED: the interim policy sentence is empty — even "no interims planned" must be written (the sheet is hashed)',
    );
  }
  // NOTE: perSourceCaps may be EMPTY — the founder's no-cap ruling (2026-07-24)
  // makes zero caps the legitimate V1 posture; refusing empty here would have
  // forced him to invent a cap at S3-9 against his own ruling.
  const curveSum = sheet.curveBp.reduce(
    (a, s) => a + s.bpEach * (s.toRank - s.fromRank + 1),
    0,
  );
  if (curveSum !== 10_000) {
    throw new Error(`REFUSED: curve sums to ${curveSum} bp — the whole pot pays (10,000 exactly)`);
  }
  return keccak256(toBytes(canonicalSerialize(sheet)));
}
