/**
 * Capital-Axis Read-Model — PURE BUILDER (server-only, in-memory; H2-⑰).
 * ---------------------------------------------------------------------------
 * The CAPITAL AXIS: one of the doctrine's many recognition axes — a rung
 * names a seat's ECONOMIC FOOTPRINT, never a membership category (the seat
 * is binary: $5 and $10,000 buy the SAME seat). Origin HOME_RANK_LADDER
 * harvested whole (12 thresholds, $5 → $10,000); names set by the founder
 * at the H2-⑰ gate (2026-07-15) — six origin names renamed per
 * SPEC_REFERRAL §⑨ (they collided with roles/axes/classes).
 *
 * THE SETTLED DOCTRINE (SPEC_REFERRAL §⓪/§⑨ — never re-litigate):
 *   - Spend-tiers are legal and universal (the Sephora/Marriott precedent);
 *     the red line is what a tier UNLOCKS: recognition/status ONLY — never
 *     a better SYN rate, never a bonus, never any financial edge.
 *   - A rung is ACQUIRED — it never descends (founder rule).
 *   - LINE-ON-RISE ONLY, and the BASE rung is the seat's birth state (every
 *     seat enters at the minimum purchase) — reaching it is never a line.
 *   - One purchase crossing several rungs = ONE line, the highest rung.
 *   - No countdown, no "next rung approaching" — the anti-scarcity pin
 *     extends to this class.
 *
 * Derivation (the witness pattern, third application): per-seat cumulative
 * gross USDC walks the SAME gapless purchase lane the milestones use
 * (memberNumber + the purchase's own public amount, both whitelisted).
 * V1 purchases carry no seat ordinal and are HONESTLY EXCLUDED from
 * per-seat footprints (counted + noted, never guessed). The V2B sentinel 0
 * is a pairing token, never a seat.
 *
 * Purity: no db, no network, no clock. Fail closed on malformed amounts.
 * The line carries the RUNG TITLE and the public seat number only — never
 * the cumulative amount (§8: seat lines never carry money; anyone can
 * recompute from the chain).
 */

import {
  PURCHASE_EVENT_BY_GENERATION,
  type BlockTimestampInput,
  type RawSaleEventInput,
  type SaleGeneration,
} from "./activityHeartbeatReadmodel";

// ---------------------------------------------------------------------------
// The capital register (canon; founder-named at the H2-⑰ gate, 2026-07-15).
// Thresholds in WHOLE USDC — verbatim from the origin HOME_RANK_LADDER.
// ---------------------------------------------------------------------------

export interface CapitalRung {
  /** Founder-approved public title (recognition only — never a benefit). */
  readonly title: string;
  /** Cumulative gross USDC threshold (whole USDC). */
  readonly usdc: number;
}

export const CAPITAL_AXIS_LADDER: readonly CapitalRung[] = [
  { title: "Citizen", usdc: 5 }, // the BASE rung — the seat's birth state, never a line
  { title: "Resident", usdc: 10 },
  { title: "Advocate", usdc: 25 },
  { title: "Patron", usdc: 50 }, // deliberate harmony with the Patron Seal (founder call)
  { title: "Strategist", usdc: 75 },
  { title: "Vanguard", usdc: 100 },
  { title: "Architect", usdc: 250 },
  { title: "Benefactor", usdc: 500 },
  { title: "Guardian", usdc: 1_000 },
  { title: "Keystone", usdc: 2_500 },
  { title: "Inner Circle", usdc: 5_000 },
  { title: "Monolith", usdc: 10_000 },
];

const USDC_BASE = 1_000_000n; // 6-decimal base units per whole USDC

// ---------------------------------------------------------------------------
// Shapes.
// ---------------------------------------------------------------------------

export interface CapitalRiseItem {
  /** The seat whose footprint rose (public ordinal). */
  readonly seatNumber: number;
  /** The rung reached — the highest when one purchase crosses several. */
  readonly rung: string;
  /** The witnessing purchase — the rise's verify anchor. */
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

/**
 * S7 — a seat's CURRENT standing on the capital axis: the same walk's end
 * state (never a second derivation). A seat whose footprint is not
 * derivable (V1-era rows carry no ordinal) is simply ABSENT — never guessed.
 *
 * S7-b (founder decision 2026-07-16, THE OWN-ACCOUNT DISPLAY RULE —
 * GAMIFICATION_LEGAL_DOCTRINE): the standing row ALSO carries the seat's
 * cumulative gross USDC, so the member's OWN dashboard can show his own
 * footprint, the ladder, and the next rung (the Sephora account pattern —
 * guidance, legal because a rung unlocks recognition only, never a
 * financial edge). This is PUBLIC chain data made legible (the purchases
 * carry seat ordinal + amount on-chain; anyone can recompute). The FEED's
 * voice is untouched: a feed line still never carries the amount, and the
 * public anti-scarcity pins (no countdown/approaching narrative) stand.
 */
export interface CapitalStandingItem {
  /** Public seat ordinal. */
  readonly seatNumber: number;
  /** The rung the seat stands on today (base "Citizen" included — a STATE
   *  readback is not a line; LINE-ON-RISE governs the feed, not this). */
  readonly rung: string;
  /** Cumulative gross USDC, raw 6-decimal base units (decimal string). */
  readonly cumulativeUsdcRaw: string;
}

export interface CapitalBuildInput {
  readonly expectedChainId: number;
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
}

export interface CapitalBuildResult {
  /** Chain order (oldest first). */
  readonly rises: readonly CapitalRiseItem[];
  /** S7: every walked seat's current rung, seat-ordinal ascending. */
  readonly standingBySeat: readonly CapitalStandingItem[];
  /** Honest derivation notes (V1 exclusion, sentinel skips) — address-free. */
  readonly notes: readonly string[];
}

function fail(message: string): never {
  throw new Error(`capital-axis build failed closed: ${message}`);
}

/** Format chain-verified epoch seconds as a UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

/** Highest ladder index whose threshold <= cum (or -1 below the base). */
function rungIndexFor(cumRaw: bigint): number {
  let idx = -1;
  for (let i = 0; i < CAPITAL_AXIS_LADDER.length; i++) {
    if (cumRaw >= BigInt(CAPITAL_AXIS_LADDER[i]!.usdc) * USDC_BASE) idx = i;
    else break;
  }
  return idx;
}

// ---------------------------------------------------------------------------
// Builder.
// ---------------------------------------------------------------------------

export function buildCapitalAxisReadModel(
  input: CapitalBuildInput,
): CapitalBuildResult {
  const { expectedChainId, rawEvents, blockTimestamps } = input;
  const notes: string[] = [];

  const tsByBlock = new Map<number, number>();
  for (const t of blockTimestamps) {
    if (t.chainId !== expectedChainId) {
      fail(`block timestamp on unexpected chain ${t.chainId} (expected ${expectedChainId})`);
    }
    const existing = tsByBlock.get(t.blockNumber);
    if (existing !== undefined && existing !== t.blockTimestampSec) {
      fail("conflicting verified timestamps for one block");
    }
    tsByBlock.set(t.blockNumber, t.blockTimestampSec);
  }

  const purchases = rawEvents
    .filter((e) => {
      if (e.chainId !== expectedChainId) {
        fail(`raw event on unexpected chain ${e.chainId} (expected ${expectedChainId})`);
      }
      const gen = e.generation as SaleGeneration;
      if (!(gen in PURCHASE_EVENT_BY_GENERATION)) {
        fail(`unknown sale generation "${e.generation}"`);
      }
      return e.eventName === PURCHASE_EVENT_BY_GENERATION[gen];
    })
    .slice()
    .sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? a.blockNumber - b.blockNumber
        : a.logIndex - b.logIndex,
    );

  const rises: CapitalRiseItem[] = [];
  const cumBySeat = new Map<number, bigint>();
  let unattributed = 0;

  for (const p of purchases) {
    // V1 rows carry no seat ordinal; the V2B sentinel 0 is never a seat.
    // Both are honestly excluded from per-seat footprints — never guessed.
    if (p.memberNumber === null || p.memberNumber <= 0) {
      unattributed += 1;
      continue;
    }
    if (p.usdcGrossRaw === null || !/^[0-9]+$/.test(p.usdcGrossRaw)) {
      fail("an attributed purchase carries no clean USDC amount — the footprint walk refuses to guess");
    }
    const before = cumBySeat.get(p.memberNumber) ?? 0n;
    const after = before + BigInt(p.usdcGrossRaw);
    cumBySeat.set(p.memberNumber, after);

    const beforeIdx = rungIndexFor(before);
    const afterIdx = rungIndexFor(after);
    // LINE-ON-RISE ONLY, and never for the BASE rung (index 0) — the seat's
    // birth state. One purchase crossing several rungs = the highest rung.
    if (afterIdx > beforeIdx && afterIdx >= 1) {
      const ts = tsByBlock.get(p.blockNumber);
      if (ts === undefined) {
        fail("a rise-witness block has no verified timestamp in the Protocol Time cache");
      }
      rises.push({
        seatNumber: p.memberNumber,
        rung: CAPITAL_AXIS_LADDER[afterIdx]!.title,
        blockNumber: p.blockNumber,
        logIndex: p.logIndex,
        transactionHash: p.transactionHash,
        blockTimestampSec: ts,
        isoDayUtc: isoDayUtcFromSeconds(ts),
      });
    }
  }

  if (unattributed > 0) {
    notes.push(
      `${unattributed} purchase(s) carry no seat ordinal (V1 rows / pairing sentinels) — honestly excluded from per-seat footprints, never guessed`,
    );
  }

  // S7 — the walk's end state, folded once here (one derivation, one truth):
  // each walked seat's current rung, base included. S7-b: the cumulative
  // travels too (the own-account display rule — public chain data; the feed
  // line still never carries it).
  const standingBySeat: CapitalStandingItem[] = [...cumBySeat.entries()]
    .map(([seatNumber, cumRaw]) => ({ seatNumber, cumRaw, idx: rungIndexFor(cumRaw) }))
    .filter((s) => s.idx >= 0)
    .sort((a, b) => a.seatNumber - b.seatNumber)
    .map((s) => ({
      seatNumber: s.seatNumber,
      rung: CAPITAL_AXIS_LADDER[s.idx]!.title,
      cumulativeUsdcRaw: s.cumRaw.toString(),
    }));

  return { rises, standingBySeat, notes };
}
