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
import type { ArchiveMintItem } from "./protocolEventReadmodel";

// ---------------------------------------------------------------------------
// The canon definitions (origin harvest, adapted vocabulary — founder GO
// 2026-07-15 on the full 11-row table).
// ---------------------------------------------------------------------------

export type MilestoneKind = "seats" | "usdc" | "first-mint";

export interface MilestoneDef {
  readonly id: string;
  /** Founder-approved public label (the panel + the line's facts row). */
  readonly label: string;
  readonly kind: MilestoneKind;
  /** Seats count · whole-USDC threshold · 1 for first-of-kind mints. */
  readonly target: number;
  /** first-mint only: the canon artifact label the crossing looks for. */
  readonly artifactLabel?: "First Signal" | "Patron Seal";
}

export const PROTOCOL_MILESTONES: readonly MilestoneDef[] = [
  { id: "first-seat", label: "First seat sealed", kind: "seats", target: 1 },
  { id: "first-signal-mint", label: "First Signal minted", kind: "first-mint", target: 1, artifactLabel: "First Signal" },
  { id: "patron-seal-mint", label: "First Patron Seal minted", kind: "first-mint", target: 1, artifactLabel: "Patron Seal" },
  { id: "routed-100", label: "$100 routed", kind: "usdc", target: 100 },
  { id: "routed-1k", label: "$1,000 routed", kind: "usdc", target: 1_000 },
  { id: "routed-10k", label: "$10,000 routed", kind: "usdc", target: 10_000 },
  { id: "seats-100", label: "100 seats sealed", kind: "seats", target: 100 },
  { id: "seats-333", label: "Genesis Signal sealed (#1–#333)", kind: "seats", target: 333 },
  { id: "seats-1000", label: "First Thousand sealed (#334–#1,000)", kind: "seats", target: 1_000 },
  { id: "seats-3333", label: "The Expansion sealed (#1,001–#3,333)", kind: "seats", target: 3_333 },
  { id: "seats-10000", label: "First Ten Thousand sealed", kind: "seats", target: 10_000 },
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
  /** Live cross-check reads (fail-soft null — overclaim protection only). */
  readonly liveMemberCount: number | null;
  /** All-engine cumulative gross USDC inflow, 6-dec raw decimal string. */
  readonly liveInflowAggregateRaw: string | null;
}

export interface SealedMilestone {
  readonly id: string;
  readonly label: string;
  readonly kind: MilestoneKind;
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
  readonly target: number;
  /** seats kind: the indexed history's current seat count. */
  readonly currentSeats: number | null;
  /** usdc kind: the indexed history's cumulative inflow (6-dec raw). */
  readonly currentUsdcRaw: string | null;
}

export interface MilestoneBuildResult {
  /** Chain order (oldest crossing first) — the protocol's account of itself. */
  readonly sealed: readonly SealedMilestone[];
  /** Canon order (the defs list), sealed ones excluded. */
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
      target: def.target,
      blockNumber: row.blockNumber,
      logIndex: row.logIndex,
      transactionHash: row.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    };
  };

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
    return item
      ? {
          id: def.id,
          label: def.label,
          kind: def.kind,
          target: def.target,
          blockNumber: item.blockNumber,
          logIndex: item.logIndex,
          transactionHash: item.transactionHash,
          blockTimestampSec: item.blockTimestampSec,
          isoDayUtc: item.isoDayUtc,
        }
      : null;
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
  const approaching: ApproachingMilestone[] = [];

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
      approaching.push({
        id: def.id,
        label: def.label,
        kind: def.kind,
        target: def.target,
        currentSeats: null,
        currentUsdcRaw: cumUsdc.toString(10),
      });
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
      approaching.push({
        id: def.id,
        label: def.label,
        kind: def.kind,
        target: def.target,
        currentSeats: derivedSeatCount,
        currentUsdcRaw: null,
      });
    } else {
      const anchor = firstMintFor(def);
      if (anchor) {
        sealed.push(anchor);
        continue;
      }
      approaching.push({
        id: def.id,
        label: def.label,
        kind: def.kind,
        target: def.target,
        currentSeats: null,
        currentUsdcRaw: null,
      });
    }
  }

  sealed.sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  );

  return { sealed, approaching, notes };
}
