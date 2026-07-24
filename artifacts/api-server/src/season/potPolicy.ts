/**
 * potPolicy — THE ONE SHARE AUTHORITY (S3-3 · master plan §1-④ · spec §10).
 * ---------------------------------------------------------------------------
 * Every dollar figure any surface ever shows — the money board, the member's own
 * row, the admin dry-run, and the on-chain payout root itself — is a projection
 * of THIS module over the one rule sheet (`seasonConfig`). The client NEVER
 * computes a share; two figures for one quantity is the named origin disease.
 *
 * THE ALGORITHMS BELOW ARE LAW-TEXT (§0.17-④ + §0.14-B, hashed into rulesHash
 * via `POLICY_ALGORITHM_TEXT` so mid-season drift is chain-detectable):
 *   RANK   : windowXp DESC → earliest attainingBlock ASC → seat number ASC.
 *   DEPTH  : d = max(1, floor(eligible/10)), then FLOOR-TRIM — while the last
 *            paid rank's amount < the min-cash floor, d-1 and re-stretch (the
 *            WSOP min-cash principle: the tail stays meaningful).
 *   STRETCH: paid rank i (1..d) samples the 25-place Option-A curve at index
 *            ceil(i*25/d); the sampled weights are renormalized over the round
 *            budget by bigint LARGEST-REMAINDER so Σ amounts == budget EXACTLY
 *            (no dust, no stranded wei; remainder units go to the smallest
 *            fractional loss, rank-ascending on ties).
 *
 * FAIL-CLOSED REFUSALS (typed, never a throw a caller can miss): the floor pair
 * unset · the §0.17-⑤ anti-farm laws unbuilt (ANTI_FARM_IMPLEMENTED false) ·
 * an empty eligible field · a zero budget. Recognition XP flows regardless —
 * only MONEY refuses.
 */

import {
  ANTI_FARM_IMPLEMENTED,
  BOUNTY_CURVE_BP_V1,
  ELIGIBILITY_FLOOR,
  MIN_PRIZE_USDC_DEFAULT,
} from "../data/seasonConfig.js";

/** One standings row as the policy consumes it (the read-model adapts to this
 *  shape in S3-5 — potPolicy stays decoupled and purely functional). */
export interface PotInputRow {
  /** Full wallet address (chain data is public — founder ruling 2026-07-24). */
  readonly account: `0x${string}`;
  /** Seat number, or null for a no-seat builder (THE POT REQUIRES THE SEAT §0.18). */
  readonly seat: number | null;
  /** XP earned inside THIS round's delta window. */
  readonly windowXp: number;
  /** Block at which the wallet reached its windowXp (the §0.14-B tie-break). */
  readonly attainingBlock: number;
  /** Hors-concours operator status at the snapshot (never consumes a slot). */
  readonly horsConcours: boolean;
}

export interface PaidSlot {
  readonly rank: number;
  readonly account: `0x${string}`;
  readonly seat: number;
  readonly windowXp: number;
  /** USDC base units (6 decimals), exact. */
  readonly amountRaw: bigint;
  /** The stretched curve weight this rank sampled (pre-renormalization). */
  readonly sampledBp: number;
}

export type PotRefusalCode =
  | "floor-pair-unset"
  | "anti-farm-unbuilt"
  | "no-eligible-rows"
  | "zero-budget";

export type PotComputation =
  | {
      readonly ok: true;
      readonly depth: number;
      readonly budgetRaw: bigint;
      readonly paidSlots: readonly PaidSlot[];
      /** True when computed against a PROJECTED budget (committed+carryover),
       *  not a posted round — the §0.18 "projection, never a reservation" law. */
      readonly isProjection: boolean;
    }
  | { readonly ok: false; readonly refusal: PotRefusalCode; readonly reason: string };

/** The exact algorithm text hashed into every season's rulesHash (§0.17-⑦) —
 *  change the code, change this text, change the hash: drift is chain-visible. */
export const POLICY_ALGORITHM_TEXT =
  "rank: windowXp desc, then earliest attaining block, then seat number; " +
  "depth: max(1, floor(eligible/10)) floor-trimmed while last prize < min-cash; " +
  "stretch: rank i of d samples curve index ceil(i*25/d), renormalized over the " +
  "budget by bigint largest-remainder so the sum equals the budget exactly.";

/** roundId allocator — seasonId*1000+seq, seq 1..999 (spec §4: seasonId = roundId/1000). */
export function allocateRoundId(seasonId: number, seq: number): number {
  if (!Number.isInteger(seasonId) || seasonId < 1) throw new Error(`bad seasonId ${seasonId}`);
  if (!Number.isInteger(seq) || seq < 1 || seq > 999) throw new Error(`bad round seq ${seq}`);
  return seasonId * 1000 + seq;
}

function curveBpAtIndex(index25: number): number {
  for (const step of BOUNTY_CURVE_BP_V1) {
    if (index25 >= step.fromRank && index25 <= step.toRank) return step.bpEach;
  }
  throw new Error(`curve index ${index25} outside the 25-place sample`);
}

interface PolicyKnobs {
  /** Override for tests/preview only; production reads the config flag. */
  readonly antiFarmImplemented?: boolean;
  readonly floorPair?: { minQualifyingPurchaseUsdc: number | null; minXpForBounty: number | null };
  readonly minPrizeUsdc?: number;
}

/**
 * Compute the paid slots for a round budget over the delta-window standings.
 * Pure. Exact. Refuses before it ever guesses.
 */
export function applyCurve(
  rows: readonly PotInputRow[],
  budgetRaw: bigint,
  opts: { isProjection: boolean } & PolicyKnobs,
): PotComputation {
  const antiFarm = opts.antiFarmImplemented ?? ANTI_FARM_IMPLEMENTED;
  const floors = opts.floorPair ?? ELIGIBILITY_FLOOR;
  if (floors.minQualifyingPurchaseUsdc === null || floors.minXpForBounty === null) {
    return {
      ok: false,
      refusal: "floor-pair-unset",
      reason:
        "the eligibility floor pair is the founder's (BACKLOG season-floor) — no paid round before both figures are set",
    };
  }
  if (!antiFarm) {
    return {
      ok: false,
      refusal: "anti-farm-unbuilt",
      reason:
        "§0.17-⑤ anti-farm laws (holding period · referral window cap · floor-gated credit) are not built — S3-4 flips the flag",
    };
  }
  if (budgetRaw <= 0n) {
    return { ok: false, refusal: "zero-budget", reason: "a round needs a positive budget" };
  }

  // THE POT REQUIRES THE SEAT (§0.18): seated, not hors-concours, window XP above
  // the founder's floor. A no-seat builder consumes NO slot.
  const minXp = floors.minXpForBounty;
  const eligible = rows.filter(
    (r) => r.seat !== null && !r.horsConcours && r.windowXp > 0 && r.windowXp >= minXp,
  );
  if (eligible.length === 0) {
    return { ok: false, refusal: "no-eligible-rows", reason: "no seated eligible builder in the window" };
  }

  // RANK — the three hashed keys.
  const ranked = [...eligible].sort((a, b) => {
    if (b.windowXp !== a.windowXp) return b.windowXp - a.windowXp;
    if (a.attainingBlock !== b.attainingBlock) return a.attainingBlock - b.attainingBlock;
    return (a.seat as number) - (b.seat as number);
  });

  const minPrizeRaw = BigInt(Math.round((opts.minPrizeUsdc ?? MIN_PRIZE_USDC_DEFAULT) * 1e6));

  // DEPTH with floor-trim.
  let depth = Math.max(1, Math.floor(ranked.length / 10));
  depth = Math.min(depth, ranked.length);
  let slots: PaidSlot[] = [];
  for (;;) {
    slots = stretchAndAllocate(ranked, depth, budgetRaw);
    const last = slots[slots.length - 1];
    if (depth === 1 || last.amountRaw >= minPrizeRaw) break;
    depth -= 1;
  }

  return { ok: true, depth, budgetRaw, paidSlots: slots, isProjection: opts.isProjection };
}

/** STRETCH + bigint LARGEST-REMAINDER — Σ amounts === budget, exactly, always. */
function stretchAndAllocate(
  ranked: readonly PotInputRow[],
  depth: number,
  budgetRaw: bigint,
): PaidSlot[] {
  const sampled: number[] = [];
  for (let i = 1; i <= depth; i++) {
    sampled.push(curveBpAtIndex(Math.ceil((i * 25) / depth)));
  }
  const totalWeight = BigInt(sampled.reduce((a, b) => a + b, 0));
  const floors: bigint[] = [];
  const remainders: { idx: number; frac: bigint }[] = [];
  let allocated = 0n;
  for (let i = 0; i < depth; i++) {
    const exactNumerator = budgetRaw * BigInt(sampled[i]);
    const floor = exactNumerator / totalWeight;
    floors.push(floor);
    allocated += floor;
    remainders.push({ idx: i, frac: exactNumerator % totalWeight });
  }
  let leftover = budgetRaw - allocated; // < depth units, each 1 raw (0.000001 USDC)
  remainders.sort((a, b) => (b.frac === a.frac ? a.idx - b.idx : b.frac > a.frac ? 1 : -1));
  for (const r of remainders) {
    if (leftover === 0n) break;
    floors[r.idx] += 1n;
    leftover -= 1n;
  }
  return ranked.slice(0, depth).map((row, i) => ({
    rank: i + 1,
    account: row.account,
    seat: row.seat as number,
    windowXp: row.windowXp,
    amountRaw: floors[i],
    sampledBp: sampled[i],
  }));
}
