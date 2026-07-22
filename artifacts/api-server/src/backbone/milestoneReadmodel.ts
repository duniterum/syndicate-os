/**
 * Milestone Read-Model — PURE BUILDER (server-only, in-memory; H2-⑬).
 * ---------------------------------------------------------------------------
 * The protocol's canonical milestones, derived GAPLESSLY from the indexed
 * history — no new persistence, no new tables. Harvested whole from the
 * origin's activity-milestones.ts (11 canon defs; thresholds are canonical —
 * member ordinals, cumulative USDC, first-of-kind mints — never invented),
 * adapted to today's vocabulary per the Mirror Rule:
 *   - always "routed", never "raised" (the sale routes 70/20/10 — routing is
 *     the register; fundraising vocabulary never enters),
 *   - always SEATS, never "buyers"/"members" (the 12/11 law),
 *   - the seat milestones ARE today's chapter boundaries (chapters.ts canon:
 *     Genesis Signal #1–#333 · First Thousand · The Expansion · First Ten
 *     Thousand) — the milestone record and the Chronicle tell one story.
 *
 * Derivation doctrine:
 *   - A SEALED milestone anchors to the EXACT transaction where the chain
 *     crossed it (the Nth purchase, the crossing of a cumulative-USDC
 *     threshold, the first mint of an artifact) — derivable only because the
 *     backbone's lanes are gapless BY CONSTRUCTION.
 *   - Status is derived at build time; NEVER persisted (origin rule kept).
 *   - LIVE CROSS-CHECK (overclaim protection): when the runner supplies the
 *     live memberCount / inflow-aggregate reads, a milestone the events call
 *     sealed but the live chain does not is WITHHELD with an honest note —
 *     fail-closed, never an invented achievement. Live-read unavailability
 *     never suppresses event-derived truth (the gapless history is chain
 *     truth on its own); it only removes the extra check, and says so.
 *   - Purity: no db, no network, no clock — inputs arrive from the runner.
 *
 * Privacy: outputs carry labels, counts, amounts (public per the Visibility
 * Rule) and transaction anchors (public chain data, gate-masked downstream).
 * No wallet, no member identity — a seat ORDINAL is public (seat numbers
 * public, wallets never); it appears only as a milestone TARGET, never as a
 * per-line "who".
 */

import {
  PURCHASE_EVENT_BY_GENERATION,
  type BlockTimestampInput,
  type RawSaleEventInput,
  type SaleGeneration,
} from "./activityHeartbeatReadmodel";
import type {
  ArchiveMintItem,
  BurnLedgerItem,
  LifecycleItem,
  LpLiquidityItem,
} from "./protocolEventReadmodel";

// ---------------------------------------------------------------------------
// The canon definitions (origin harvest, adapted vocabulary — founder GO
// 2026-07-15 on the full 11-row table).
// ---------------------------------------------------------------------------

// M-EVO-1 (founder GO 2026-07-22, MILESTONE_SYSTEM_EVOLUTION.md — the 8-law
// constitution): the registry gains FAMILIES and endless ladders. New kinds:
//   burn-acts (Nth Proof of Burn) · burn-syn (cumulative SYN retired) ·
//   sources-created (Nth registry creation) · lp-acts (Nth pool add) ·
//   archive-count (cumulative artifacts, quantity-summed).
// All derive from the SAME gapless lanes — zero new scans; a rung the chain
// already crossed RETRO-SEALS at its true historical anchor (law 5).
export type MilestoneKind =
  | "seats"
  | "usdc"
  | "first-mint"
  | "burn-acts"
  | "burn-syn"
  | "sources-created"
  | "lp-acts"
  | "archive-count";

/** The §2 families (MILESTONE_SYSTEM_EVOLUTION.md). RESERVED families
 *  (alias · ramp · nft-marketplace) ship WITH their modules — law 8. */
export type MilestoneFamily =
  | "membership"
  | "economy"
  | "fire"
  | "referral"
  | "liquidity"
  | "archive";

export interface MilestoneDef {
  readonly id: string;
  /** Founder-approved public label (the panel + the line's facts row). */
  readonly label: string;
  readonly kind: MilestoneKind;
  readonly family: MilestoneFamily;
  /** Count/ordinal target · whole-USDC threshold · whole-SYN threshold. */
  readonly target: number;
  /** first-mint only: the canon artifact label the crossing looks for. */
  readonly artifactLabel?: "First Signal" | "Patron Seal";
}

// The pre-M-EVO labels (founder GO 2026-07-15) stay VERBATIM — never
// rephrased; the new rungs' labels are the founder-approved §2 ladder
// (GO and GO-Live 2026-07-22). RESERVED (not derivable yet, never invented):
// commissions-paid + second-generation ladders await the sale-lane input's
// commission field (their own micro-slice); alias/ramp/nft families ride
// their modules.
export const PROTOCOL_MILESTONES: readonly MilestoneDef[] = [
  // ── MEMBERSHIP — the master ladder; era ends are rungs (one ladder,
  //    double meaning: chapter sealed + the rate table's page turn) ──
  { id: "first-seat", label: "First seat sealed", kind: "seats", family: "membership", target: 1 },
  { id: "seats-10", label: "The First Ten sealed (seats #1–#10)", kind: "seats", family: "membership", target: 10 },
  { id: "seats-25", label: "25 seats sealed", kind: "seats", family: "membership", target: 25 },
  { id: "seats-50", label: "50 seats sealed", kind: "seats", family: "membership", target: 50 },
  { id: "seats-100", label: "100 seats sealed", kind: "seats", family: "membership", target: 100 },
  { id: "seats-250", label: "250 seats sealed", kind: "seats", family: "membership", target: 250 },
  { id: "seats-333", label: "Genesis Signal sealed (#1–#333)", kind: "seats", family: "membership", target: 333 },
  { id: "seats-500", label: "500 seats sealed", kind: "seats", family: "membership", target: 500 },
  { id: "seats-1000", label: "First Thousand sealed (#334–#1,000)", kind: "seats", family: "membership", target: 1_000 },
  { id: "seats-2000", label: "2,000 seats sealed", kind: "seats", family: "membership", target: 2_000 },
  { id: "seats-3333", label: "The Expansion sealed (#1,001–#3,333)", kind: "seats", family: "membership", target: 3_333 },
  { id: "seats-5000", label: "5,000 seats sealed", kind: "seats", family: "membership", target: 5_000 },
  { id: "seats-10000", label: "First Ten Thousand sealed", kind: "seats", family: "membership", target: 10_000 },
  { id: "seats-25000", label: "25,000 seats sealed — era 6 opens", kind: "seats", family: "membership", target: 25_000 },
  { id: "seats-50000", label: "50,000 seats sealed — era 7 opens", kind: "seats", family: "membership", target: 50_000 },
  { id: "seats-100000", label: "100,000 seats sealed — era 8 opens", kind: "seats", family: "membership", target: 100_000 },
  { id: "seats-250000", label: "250,000 seats sealed — era 9 opens", kind: "seats", family: "membership", target: 250_000 },
  { id: "seats-500000", label: "Half a million seats sealed", kind: "seats", family: "membership", target: 500_000 },
  { id: "seats-1000000", label: "THE FINAL SEAT — #1,000,000 sealed", kind: "seats", family: "membership", target: 1_000_000 },
  // ── ECONOMY — cumulative USDC routed through the sale (70/20/10) ──
  { id: "routed-100", label: "$100 routed", kind: "usdc", family: "economy", target: 100 },
  { id: "routed-1k", label: "$1,000 routed", kind: "usdc", family: "economy", target: 1_000 },
  { id: "routed-10k", label: "$10,000 routed", kind: "usdc", family: "economy", target: 10_000 },
  { id: "routed-25k", label: "$25,000 routed", kind: "usdc", family: "economy", target: 25_000 },
  { id: "routed-50k", label: "$50,000 routed", kind: "usdc", family: "economy", target: 50_000 },
  { id: "routed-100k", label: "$100,000 routed", kind: "usdc", family: "economy", target: 100_000 },
  { id: "routed-250k", label: "$250,000 routed", kind: "usdc", family: "economy", target: 250_000 },
  { id: "routed-500k", label: "$500,000 routed", kind: "usdc", family: "economy", target: 500_000 },
  { id: "routed-1m", label: "$1,000,000 routed", kind: "usdc", family: "economy", target: 1_000_000 },
  { id: "routed-2m5", label: "$2,500,000 routed", kind: "usdc", family: "economy", target: 2_500_000 },
  { id: "routed-5m", label: "$5,000,000 routed", kind: "usdc", family: "economy", target: 5_000_000 },
  { id: "routed-10m", label: "$10,000,000 routed", kind: "usdc", family: "economy", target: 10_000_000 },
  { id: "routed-25m", label: "$25,000,000 routed", kind: "usdc", family: "economy", target: 25_000_000 },
  { id: "routed-50m", label: "$50,000,000 routed", kind: "usdc", family: "economy", target: 50_000_000 },
  { id: "routed-100m", label: "$100,000,000 routed", kind: "usdc", family: "economy", target: 100_000_000 },
  // ── FIRE — Proof of Burn acts + cumulative SYN retired ──
  { id: "burn-act-1", label: "First Proof of Burn", kind: "burn-acts", family: "fire", target: 1 },
  { id: "burn-act-10", label: "Ten Proofs of Burn", kind: "burn-acts", family: "fire", target: 10 },
  { id: "burn-act-25", label: "25 Proofs of Burn", kind: "burn-acts", family: "fire", target: 25 },
  { id: "burn-act-50", label: "50 Proofs of Burn", kind: "burn-acts", family: "fire", target: 50 },
  { id: "burn-act-100", label: "100 Proofs of Burn", kind: "burn-acts", family: "fire", target: 100 },
  { id: "burn-act-333", label: "333 Proofs of Burn", kind: "burn-acts", family: "fire", target: 333 },
  { id: "burned-10k", label: "10,000 SYN burned", kind: "burn-syn", family: "fire", target: 10_000 },
  { id: "burned-50k", label: "50,000 SYN burned", kind: "burn-syn", family: "fire", target: 50_000 },
  { id: "burned-100k", label: "100,000 SYN burned", kind: "burn-syn", family: "fire", target: 100_000 },
  { id: "burned-500k", label: "500,000 SYN burned", kind: "burn-syn", family: "fire", target: 500_000 },
  { id: "burned-1m", label: "One million SYN burned", kind: "burn-syn", family: "fire", target: 1_000_000 },
  { id: "burned-5m", label: "Five million SYN burned", kind: "burn-syn", family: "fire", target: 5_000_000 },
  { id: "burned-10m", label: "1% of the supply burned — 10,000,000 SYN", kind: "burn-syn", family: "fire", target: 10_000_000 },
  { id: "burned-25m", label: "2.5% of the supply burned — 25,000,000 SYN", kind: "burn-syn", family: "fire", target: 25_000_000 },
  { id: "burned-50m", label: "5% of the supply burned — 50,000,000 SYN", kind: "burn-syn", family: "fire", target: 50_000_000 },
  { id: "burned-100m", label: "10% of the supply burned — 100,000,000 SYN", kind: "burn-syn", family: "fire", target: 100_000_000 },
  // ── REFERRAL — the registry's own growth (founder-signed creations) ──
  { id: "source-1", label: "First referral source created", kind: "sources-created", family: "referral", target: 1 },
  { id: "sources-5", label: "Five referral sources created", kind: "sources-created", family: "referral", target: 5 },
  { id: "sources-10", label: "Ten referral sources created", kind: "sources-created", family: "referral", target: 10 },
  { id: "sources-25", label: "25 referral sources created", kind: "sources-created", family: "referral", target: 25 },
  { id: "sources-50", label: "50 referral sources created", kind: "sources-created", family: "referral", target: 50 },
  { id: "sources-100", label: "100 referral sources created", kind: "sources-created", family: "referral", target: 100 },
  // ── LIQUIDITY — pool acts only (monotonic law) ──
  { id: "lp-add-1", label: "First liquidity added to the public pool", kind: "lp-acts", family: "liquidity", target: 1 },
  { id: "lp-add-10", label: "Ten liquidity additions", kind: "lp-acts", family: "liquidity", target: 10 },
  { id: "lp-add-25", label: "25 liquidity additions", kind: "lp-acts", family: "liquidity", target: 25 },
  { id: "lp-add-50", label: "50 liquidity additions", kind: "lp-acts", family: "liquidity", target: 50 },
  // ── ARCHIVE — protocol memory ──
  { id: "first-signal-mint", label: "First Signal minted", kind: "first-mint", family: "archive", target: 1, artifactLabel: "First Signal" },
  { id: "patron-seal-mint", label: "First Patron Seal minted", kind: "first-mint", family: "archive", target: 1, artifactLabel: "Patron Seal" },
  { id: "artifacts-25", label: "25 artifacts archived", kind: "archive-count", family: "archive", target: 25 },
  { id: "artifacts-50", label: "50 artifacts archived", kind: "archive-count", family: "archive", target: 50 },
  { id: "artifacts-100", label: "100 artifacts archived", kind: "archive-count", family: "archive", target: 100 },
  { id: "artifacts-333", label: "333 artifacts archived", kind: "archive-count", family: "archive", target: 333 },
];

// ---------------------------------------------------------------------------
// Build input / output shapes.
// ---------------------------------------------------------------------------

export interface MilestoneBuildInput {
  readonly expectedChainId: number;
  /** The sale lane's raw rows (gapless; usdcGrossRaw whitelisted for cumsum). */
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
  /** The protocol lane's archive mints (already labeled + timestamped). */
  readonly archiveMintItems: readonly ArchiveMintItem[];
  /** M-EVO-1: the burn ledger (gapless, numbered) — the fire family. */
  readonly burnItems: readonly BurnLedgerItem[];
  /** M-EVO-1: registry lifecycle rows — the referral family (creations). */
  readonly lifecycleItems: readonly LifecycleItem[];
  /** M-EVO-1: pool liquidity acts — the liquidity family (adds only). */
  readonly lpItems: readonly LpLiquidityItem[];
  /** Live cross-check reads (fail-soft null — overclaim protection only). */
  readonly liveMemberCount: number | null;
  /** All-engine cumulative gross USDC inflow, 6-dec raw decimal string. */
  readonly liveInflowAggregateRaw: string | null;
}

export interface SealedMilestone {
  readonly id: string;
  readonly label: string;
  readonly kind: MilestoneKind;
  /** M-EVO-1: the §2 family lane. */
  readonly family: MilestoneFamily;
  readonly target: number;
  /** The crossing transaction — the milestone's verify anchor. */
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

export interface ApproachingMilestone {
  readonly id: string;
  readonly label: string;
  readonly kind: MilestoneKind;
  /** M-EVO-1: the §2 family lane. */
  readonly family: MilestoneFamily;
  readonly target: number;
  /** seats kind: the indexed history's current seat count. */
  readonly currentSeats: number | null;
  /** usdc kind: the indexed history's cumulative inflow (6-dec raw). */
  readonly currentUsdcRaw: string | null;
  /** M-EVO-1 act kinds (burn-acts · sources-created · lp-acts ·
   *  archive-count): the indexed history's current count. */
  readonly currentCount: number | null;
  /** M-EVO-1 burn-syn: cumulative SYN retired (18-dec raw decimal). */
  readonly currentSynRaw: string | null;
}

export interface MilestoneBuildResult {
  /** Chain order (oldest crossing first) — the protocol's account of itself. */
  readonly sealed: readonly SealedMilestone[];
  /**
   * M-EVO-1 (goal-gradient law): the NEXT unsealed rung PER FAMILY — one
   * honest bar per lane, never fifty distant numbers. Canon family order.
   */
  readonly approaching: readonly ApproachingMilestone[];
  /** Honest derivation notes (withheld lines, live-read posture) — address-free. */
  readonly notes: readonly string[];
}

function fail(message: string): never {
  // Never echo transaction hashes or decoded material.
  throw new Error(`milestone build failed closed: ${message}`);
}

/** Format chain-verified epoch seconds as a UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

const DEC_RE = /^[0-9]+$/;
const USDC_BASE = 1_000_000n; // 6-decimal base units per whole USDC

// ---------------------------------------------------------------------------
// Builder.
// ---------------------------------------------------------------------------

export function buildMilestoneReadModel(
  input: MilestoneBuildInput,
): MilestoneBuildResult {
  const {
    expectedChainId,
    rawEvents,
    blockTimestamps,
    archiveMintItems,
    burnItems,
    lifecycleItems,
    lpItems,
    liveMemberCount,
    liveInflowAggregateRaw,
  } = input;

  const notes: string[] = [];

  // --- Chain uniformity + timestamp map (fail closed, heartbeat discipline) ---
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

  // --- The purchase sequence, chain-ordered (the crossing walk's spine) ---
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

  const anchorAt = (
    def: MilestoneDef,
    row: { blockNumber: number; logIndex: number; transactionHash: string },
  ): SealedMilestone => {
    const ts = tsByBlock.get(row.blockNumber);
    if (ts === undefined) {
      fail("a crossing block has no verified timestamp in the Protocol Time cache");
    }
    return {
      id: def.id,
      label: def.label,
      kind: def.kind,
      family: def.family,
      target: def.target,
      blockNumber: row.blockNumber,
      logIndex: row.logIndex,
      transactionHash: row.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    };
  };

  /** M-EVO-1: seal a def at an item that already carries verified time
   *  (the protocol lane's items — burns, lifecycle, lp, mints). */
  const anchorAtTimed = (
    def: MilestoneDef,
    item: {
      blockNumber: number;
      logIndex: number;
      transactionHash: string;
      blockTimestampSec: number;
      isoDayUtc: string;
    },
  ): SealedMilestone => ({
    id: def.id,
    label: def.label,
    kind: def.kind,
    family: def.family,
    target: def.target,
    blockNumber: item.blockNumber,
    logIndex: item.logIndex,
    transactionHash: item.transactionHash,
    blockTimestampSec: item.blockTimestampSec,
    isoDayUtc: item.isoDayUtc,
  });

  // --- USDC cumulative walk (every purchase MUST carry its public amount) ---
  // Crossing anchors per usdc def: the purchase whose running sum reached it.
  const usdcCrossings = new Map<string, SealedMilestone>();
  let cumUsdc = 0n;
  {
    const usdcDefs = PROTOCOL_MILESTONES.filter((d) => d.kind === "usdc");
    let nextIdx = 0;
    const sorted = usdcDefs.slice().sort((a, b) => a.target - b.target);
    for (const p of purchases) {
      if (p.usdcGrossRaw === null || !DEC_RE.test(p.usdcGrossRaw)) {
        fail("a purchase row carries no clean USDC amount — the cumulative walk refuses to guess");
      }
      cumUsdc += BigInt(p.usdcGrossRaw);
      while (
        nextIdx < sorted.length &&
        cumUsdc >= BigInt(sorted[nextIdx]!.target) * USDC_BASE
      ) {
        usdcCrossings.set(sorted[nextIdx]!.id, anchorAt(sorted[nextIdx]!, p));
        nextIdx += 1;
      }
    }
  }

  // --- Seat count + seat-ordinal anchors ---
  // The indexed history's current seat count = the highest seat ordinal among
  // first-seat purchases (the active numbering continues the historical
  // continuity baseline, so the maximum IS the count; repeat purchases never
  // move it). V1 rows carry no ordinal and cannot claim one.
  let derivedSeatCount = 0;
  for (const p of purchases) {
    if (p.firstSeat === true && p.memberNumber !== null && p.memberNumber > derivedSeatCount) {
      derivedSeatCount = p.memberNumber;
    }
  }

  const seatAnchorFor = (def: MilestoneDef): SealedMilestone | null => {
    if (def.target === 1) {
      // The protocol's beginning: the chronologically first purchase ever
      // indexed (V1's first act — it carries no ordinal; the sequence does).
      const first = purchases[0];
      return first ? anchorAt(def, first) : null;
    }
    const row = purchases.find(
      (p) => p.firstSeat === true && p.memberNumber === def.target,
    );
    return row ? anchorAt(def, row) : null;
  };

  // --- First-mint anchors (labels are the protocol lane's canon labels) ---
  const mintsSorted = archiveMintItems
    .slice()
    .sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? a.blockNumber - b.blockNumber
        : a.logIndex - b.logIndex,
    );
  const firstMintFor = (def: MilestoneDef): SealedMilestone | null => {
    const item = mintsSorted.find((m) => m.artifactLabel === def.artifactLabel);
    return item ? anchorAtTimed(def, item) : null;
  };

  // ── M-EVO-1 — the protocol-lane walks (all chain-ordered, all monotonic) ──
  const chainOrder = <T extends { blockNumber: number; logIndex: number }>(
    xs: readonly T[],
  ): T[] =>
    xs
      .slice()
      .sort((a, b) =>
        a.blockNumber !== b.blockNumber
          ? a.blockNumber - b.blockNumber
          : a.logIndex - b.logIndex,
      );

  // The fire family: acts = the numbered ledger itself; cumulative SYN =
  // a walk over the same ledger (18-dec raw, exact BigInt — never floated).
  const burnsSorted = chainOrder(burnItems);
  const SYN_BASE = 10n ** 18n;
  let cumBurnedSyn = 0n;
  const burnSynCrossings = new Map<string, SealedMilestone>();
  {
    const defs = PROTOCOL_MILESTONES.filter((d) => d.kind === "burn-syn")
      .slice()
      .sort((a, b) => a.target - b.target);
    let nextIdx = 0;
    for (const b of burnsSorted) {
      if (!DEC_RE.test(b.amountSynRaw)) {
        fail("a burn row carries no clean SYN amount — the cumulative walk refuses to guess");
      }
      cumBurnedSyn += BigInt(b.amountSynRaw);
      while (
        nextIdx < defs.length &&
        cumBurnedSyn >= BigInt(defs[nextIdx]!.target) * SYN_BASE
      ) {
        burnSynCrossings.set(defs[nextIdx]!.id, anchorAtTimed(defs[nextIdx]!, b));
        nextIdx += 1;
      }
    }
  }

  // The referral family counts CREATIONS (founder-signed, monotonic — a
  // status flip is never a milestone; the monotonic law).
  const sourceCreations = chainOrder(
    lifecycleItems.filter((l) => l.kind === "source-created"),
  );
  // The liquidity family counts ADDS only (acts, monotonic).
  const lpAdds = chainOrder(lpItems.filter((p) => p.kind === "lp-add"));
  // The archive family counts ARTIFACTS (quantity-summed — one mint act can
  // archive several); the crossing anchors at the mint that crossed.
  let cumArtifacts = 0n;
  const artifactCrossings = new Map<string, SealedMilestone>();
  {
    const defs = PROTOCOL_MILESTONES.filter((d) => d.kind === "archive-count")
      .slice()
      .sort((a, b) => a.target - b.target);
    let nextIdx = 0;
    for (const m of mintsSorted) {
      if (!DEC_RE.test(m.quantityRaw)) {
        fail("an archive mint carries no clean quantity — the cumulative walk refuses to guess");
      }
      cumArtifacts += BigInt(m.quantityRaw);
      while (
        nextIdx < defs.length &&
        cumArtifacts >= BigInt(defs[nextIdx]!.target)
      ) {
        artifactCrossings.set(defs[nextIdx]!.id, anchorAtTimed(defs[nextIdx]!, m));
        nextIdx += 1;
      }
    }
  }
  /** Nth-act anchor over a chain-ordered act list (1-based target). */
  const nthActFor = (
    def: MilestoneDef,
    acts: readonly {
      blockNumber: number;
      logIndex: number;
      transactionHash: string;
      blockTimestampSec: number;
      isoDayUtc: string;
    }[],
  ): SealedMilestone | null => {
    const item = acts[def.target - 1];
    return item ? anchorAtTimed(def, item) : null;
  };

  // --- Live cross-check posture (overclaim protection, fail-soft) ---
  const liveInflow =
    liveInflowAggregateRaw !== null && DEC_RE.test(liveInflowAggregateRaw)
      ? BigInt(liveInflowAggregateRaw)
      : null;
  if (liveMemberCount === null && liveInflow === null) {
    notes.push(
      "live cross-check unavailable this cycle — milestones served from the gapless indexed history alone",
    );
  }

  // --- Assemble (canon def order; sealed sorted to chain order at the end) ---
  const sealed: SealedMilestone[] = [];
  const approachingAll: ApproachingMilestone[] = [];
  const approachingRow = (
    def: MilestoneDef,
    currents: Partial<
      Pick<
        ApproachingMilestone,
        "currentSeats" | "currentUsdcRaw" | "currentCount" | "currentSynRaw"
      >
    >,
  ): ApproachingMilestone => ({
    id: def.id,
    label: def.label,
    kind: def.kind,
    family: def.family,
    target: def.target,
    currentSeats: currents.currentSeats ?? null,
    currentUsdcRaw: currents.currentUsdcRaw ?? null,
    currentCount: currents.currentCount ?? null,
    currentSynRaw: currents.currentSynRaw ?? null,
  });

  for (const def of PROTOCOL_MILESTONES) {
    if (def.kind === "usdc") {
      const crossing = usdcCrossings.get(def.id) ?? null;
      const targetRaw = BigInt(def.target) * USDC_BASE;
      if (crossing && liveInflow !== null && liveInflow < targetRaw) {
        // The events claim a crossing the live chain does not back: withhold.
        notes.push(
          `"${def.label}" withheld — the live inflow read sits below the indexed crossing (fail-closed)`,
        );
      } else if (crossing) {
        sealed.push(crossing);
        continue;
      } else if (liveInflow !== null && liveInflow >= targetRaw) {
        notes.push(
          `"${def.label}" is crossed on the live chain; the indexed history has not caught up — approaching until it anchors`,
        );
      }
      approachingAll.push(approachingRow(def, { currentUsdcRaw: cumUsdc.toString(10) }));
    } else if (def.kind === "seats") {
      const eventSealed = derivedSeatCount >= def.target;
      const liveBacks = liveMemberCount === null || liveMemberCount >= def.target;
      const anchor = eventSealed && liveBacks ? seatAnchorFor(def) : null;
      if (eventSealed && liveBacks && anchor) {
        sealed.push(anchor);
        continue;
      }
      if (eventSealed && !liveBacks) {
        notes.push(
          `"${def.label}" withheld — the live seat count sits below the indexed crossing (fail-closed)`,
        );
      } else if (eventSealed && !anchor) {
        notes.push(
          `"${def.label}" reached but its crossing transaction is not identifiable in the indexed history — status shown, line withheld`,
        );
      } else if (!eventSealed && liveMemberCount !== null && liveMemberCount >= def.target) {
        notes.push(
          `"${def.label}" is crossed on the live chain; the indexed history has not caught up — approaching until it anchors`,
        );
      }
      approachingAll.push(approachingRow(def, { currentSeats: derivedSeatCount }));
    } else if (def.kind === "first-mint") {
      const anchor = firstMintFor(def);
      if (anchor) {
        sealed.push(anchor);
        continue;
      }
      approachingAll.push(approachingRow(def, {}));
    } else if (def.kind === "burn-acts") {
      // M-EVO-1 — the fire family's act ladder (the numbered ledger itself).
      const anchor = burnsSorted.length >= def.target ? nthActFor(def, burnsSorted) : null;
      if (anchor) {
        sealed.push(anchor);
        continue;
      }
      approachingAll.push(approachingRow(def, { currentCount: burnsSorted.length }));
    } else if (def.kind === "burn-syn") {
      const crossing = burnSynCrossings.get(def.id) ?? null;
      if (crossing) {
        sealed.push(crossing);
        continue;
      }
      approachingAll.push(approachingRow(def, { currentSynRaw: cumBurnedSyn.toString(10) }));
    } else if (def.kind === "sources-created") {
      const anchor =
        sourceCreations.length >= def.target ? nthActFor(def, sourceCreations) : null;
      if (anchor) {
        sealed.push(anchor);
        continue;
      }
      approachingAll.push(approachingRow(def, { currentCount: sourceCreations.length }));
    } else if (def.kind === "lp-acts") {
      const anchor = lpAdds.length >= def.target ? nthActFor(def, lpAdds) : null;
      if (anchor) {
        sealed.push(anchor);
        continue;
      }
      approachingAll.push(approachingRow(def, { currentCount: lpAdds.length }));
    } else {
      // archive-count — the quantity-summed artifact walk.
      const crossing = artifactCrossings.get(def.id) ?? null;
      if (crossing) {
        sealed.push(crossing);
        continue;
      }
      approachingAll.push(
        approachingRow(def, { currentCount: Number(cumArtifacts) }),
      );
    }
  }

  // M-EVO-1 (goal-gradient law): serve the NEXT unsealed rung per
  // (family, kind) lane — one honest bar per ladder (fire keeps two: its
  // act ladder and its cumulative ladder), never fifty distant numbers.
  // Def order within a lane is ascending by construction (the registry's
  // written order), so the first unsealed row IS the next rung.
  const seenLane = new Set<string>();
  const approaching: ApproachingMilestone[] = [];
  for (const a of approachingAll) {
    const lane = `${a.family}:${a.kind}`;
    if (seenLane.has(lane)) continue;
    seenLane.add(lane);
    approaching.push(a);
  }

  sealed.sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  );

  return { sealed, approaching, notes };
}
