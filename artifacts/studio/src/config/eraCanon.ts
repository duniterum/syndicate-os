// config/eraCanon.ts — the 9-era rate schedule, committed CANON (A3,
// founder AW-2 GO 2026-07-22: "oui car c'est informatif").
// ---------------------------------------------------------------------------
// PROVENANCE: these are the deployed MembershipSaleV3's IMMUTABLE era
// parameters — a `pure` function graven in bytecode (N0 in the Authority
// Constitution: nobody, the founder included, can change them without a new
// sale contract). Like deploymentRegistry.ts, committing bytecode constants
// is canon, never a snapshot: this table can only rot if a NEW sale engine
// deploys — which is its own Chronicle-grade slice.
// Source of record: CONSTITUTION_AUTORITE §① (the 9-era table, read from the
// .sol) · the origin's src/lib/eras.ts mirror · the live quote() (the
// purchase UI still prices ONLY from the live quote — this table informs,
// it never quotes).
// THE DISPLAY LAW (founder override AW-2, dated 2026-07-22, dossier §6):
// showing the CURRENT era's terms and the seat where the rate table turns is
// FACTUAL BYTECODE DISCLOSURE — informative, chain-verifiable, published in
// our own whitepaper. It overrides the earlier line-on-crossing-only pin.
// What remains out: invented urgency (no deadline exists) and any
// non-bytecode claim. (SETTLED_RULES §8-⑧, 2026-07-24: no legal gate lives
// in this system — that is the founder's own business matter, never ours.)

export interface EraDef {
  /** 1-based era number. */
  readonly era: number;
  /** SYN received per USDC (the bytecode rate). */
  readonly synPerUsd: number;
  /** Minimum entry in whole USDC. */
  readonly minEntryUsd: number;
  /** The last seat of this era — the rate table turns at endSeat + 1. */
  readonly endSeat: number;
}

export const ERA_CANON: readonly EraDef[] = [
  { era: 1, synPerUsd: 100, minEntryUsd: 5, endSeat: 333 },
  { era: 2, synPerUsd: 50, minEntryUsd: 10, endSeat: 1_000 },
  { era: 3, synPerUsd: 40, minEntryUsd: 10, endSeat: 3_333 },
  { era: 4, synPerUsd: 16, minEntryUsd: 25, endSeat: 10_000 },
  { era: 5, synPerUsd: 12, minEntryUsd: 25, endSeat: 25_000 },
  { era: 6, synPerUsd: 6, minEntryUsd: 50, endSeat: 50_000 },
  { era: 7, synPerUsd: 4, minEntryUsd: 50, endSeat: 100_000 },
  { era: 8, synPerUsd: 2, minEntryUsd: 100, endSeat: 250_000 },
  { era: 9, synPerUsd: 1, minEntryUsd: 100, endSeat: 1_000_000 },
];

/** The era a given LIVE seat count sits in (fail-closed null off-table). */
export function eraForSeatCount(seatCount: number): EraDef | null {
  if (!Number.isSafeInteger(seatCount) || seatCount < 0) return null;
  return ERA_CANON.find((e) => seatCount < e.endSeat) ?? null;
}
