/**
 * Activity Heartbeat Read-Model — PURE BUILDER (server-only, in-memory).
 * ----------------------------------------------------------------------
 * Derives the internal "activity heartbeat" view of protocol activity from
 * Part A raw sale-event rows + the Protocol Time block-timestamp cache.
 * Moved from scripts/activity-heartbeat-readmodel.ts in slice M4-a (founder
 * GO): the served backbone zone rebuilds this model unattended. TWO sanctioned
 * projections exist and no more: the address-safe AGGREGATE report (this
 * module) and the receipt-line FEED (feedProjection.ts, M4-b founder GO —
 * public chain data per line, its own fail-closed output gate).
 *
 * Purity rules (guard-enforced):
 *   - No database, network, or RPC imports. Inputs arrive as narrow
 *     projections mapped by the backbone DB zone / derive runner.
 *   - No wall-clock reads (`Date.now` / zero-arg `new Date()`): every
 *     timestamp is chain-verified block time passed in by the caller.
 *   - Deterministic: input order never changes the output.
 *   - Fail closed: wrong chain, unknown event shape, unpaired Routed row, or
 *     a missing verified block timestamp throws — never a guessed value.
 *
 * Privacy doctrine (H2-P amended — THE PRIDE OF THE PUBLIC RECORD, founder
 * override 2026-07-15, recorded in ADR-003):
 *   - The FEED narrates what the chain publishes: the event's own member
 *     number and its actor's SHORT-FORM address render per line (the origin
 *     voice — "0x123…abcd entered the public registry"). The FULL address
 *     stays SERVER-ONLY: only the projection's short form ever serializes,
 *     and the unchanged output scanners still fail closed on any full
 *     address. No enrichment: never a field beyond what ONE event carries,
 *     no lookup API, no roster join.
 *   - The AGGREGATE report stays blind: neither member numbers, addresses,
 *     hashes nor per-item rows ever reach `toAddressSafeActivityReport`,
 *     which fail-closes by scanning its own output.
 *   - Gated economics (referral/source fields) are never read into inputs —
 *     except the loader's sourceId → BOOLEAN reduction (the veiled
 *     who-brought-whom, founder choice B; the id itself never leaves).
 */

import type {
  SyndicateAdapterKind,
  SyndicateProofDomain,
  SyndicateSurface,
} from "@workspace/os-contracts";
import { assertAddressSafeJson } from "../lib/protocol/addressSafety";

// ---------------------------------------------------------------------------
// OS vocabulary binding (existing os-contracts taxonomy only — nothing minted).
// ---------------------------------------------------------------------------

export const ACTIVITY_HEARTBEAT_READ_MODEL_META: {
  readonly domain: SyndicateProofDomain;
  readonly surface: SyndicateSurface;
  readonly adapterKind: SyndicateAdapterKind;
  /**
   * M4-b posture: exactly TWO sanctioned public projections — the address-
   * safe aggregate report (this module) and the receipt-line feed
   * (feedProjection.ts: public chain data per line, identity-blind,
   * own output gate). Nothing else ever serializes the model.
   */
  readonly publicProjection: "AGGREGATE_PLUS_RECEIPT_LINES";
  readonly persistence: "NONE_IN_MEMORY_ONLY";
} = {
  domain: "ACTIVITY_HEARTBEAT",
  surface: "SERVER_SIDE_CANON",
  adapterKind: "ACTIVITY_INDEX_ADAPTER",
  publicProjection: "AGGREGATE_PLUS_RECEIPT_LINES",
  persistence: "NONE_IN_MEMORY_ONLY",
};

export const ACTIVITY_DOCTRINE = [
  "Derived, never authority: rebuildable at any time from Part A raw rows + the Protocol Time cache; deleting the read-model loses nothing.",
  "Activity is not identity authority: it never assigns or infers a member number — it carries ONLY what the event itself emitted (H2-P: the event's own number + its actor's short-form address render on the feed line; the V2B sentinel 0 stays a pairing token, never a member).",
  "Activity is not the Chronicle, the Register, or the Archive; nothing here auto-promotes into any of those.",
  "Chain-verified time only: every item timestamp comes from the block-timestamp cache (eth_getBlockByNumber-verified); wall-clock never enters.",
  "Routed rows are routing detail of their purchase transaction, not separate activity; they fold into the paired purchase and are counted as folded.",
  "firstSeat is reported only where the contract emitted it; V1 rows are 'unknown', never inferred.",
  "Gated economics stay gated: referral and source fields are never read into this model — except the loader's source-id → BOOLEAN reduction (H2-P, founder choice B: the veiled referred flag; the id never leaves). The purchase's own public gross-USDC figure and era page stay whitelisted for the milestone and era read-models only.",
  "The taxonomy (kind/category) mirrors the vendored canon protocol-event registry; this file never invents a parallel taxonomy.",
  "Exactly TWO sanctioned projections: the address-safe aggregate report (status) and the receipt-line feed (feedProjection, M4-b) — nothing else ever serializes the model.",
  "THE PRIDE OF THE PUBLIC RECORD (H2-P, ADR-003 amendment 2026-07-15): feed lines carry the event's own member number and the actor's SHORT-FORM address — the origin voice restored. A FULL member address never serializes anywhere (the unchanged output scanners fail closed on one); decodedJson/rawJson never leave; the aggregate report stays blind to numbers, addresses and per-item rows.",
] as const;

// ---------------------------------------------------------------------------
// Taxonomy literals — local mirrors of the vendored canon protocol-event
// registry (kind "purchase" belongs to category "membership-sale"). The canon
// file is tsconfig-excluded and never imported; the guard reconciles these
// literals against the canon text and fails closed on drift.
// ---------------------------------------------------------------------------

export const ACTIVITY_EVENT_KIND = "purchase" as const;
export const ACTIVITY_EVENT_CATEGORY = "membership-sale" as const;

export type SaleGeneration = "V1" | "V2A" | "V2B" | "V3";

/** The one purchase-family event name each generation emits. */
export const PURCHASE_EVENT_BY_GENERATION: Record<SaleGeneration, string> = {
  V1: "TokensPurchased",
  V2A: "Purchased",
  V2B: "Purchased",
  V3: "MembershipPurchasedV3",
};

/** Generations that also emit a Routed routing event in the same transaction. */
export const ROUTED_GENERATIONS: ReadonlySet<SaleGeneration> = new Set([
  "V2A",
  "V2B",
]);

// ---------------------------------------------------------------------------
// Input shapes (narrow projections mapped by the backbone DB zone).
// ---------------------------------------------------------------------------

export interface RawSaleEventInput {
  readonly chainId: number;
  readonly generation: string;
  readonly eventName: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** SERVER-ONLY opaque pairing key. Never serialized out of this module. */
  readonly transactionHash: string;
  /**
   * Whitelisted decoded flag. null when the generation does not emit it
   * (V1 purchases, Routed rows). NEVER inferred from anything else.
   */
  readonly firstSeat: boolean | null;
  /**
   * Whitelisted decoded number, used ONLY as an opaque pairing/reconciliation
   * token between a Purchased row and its Routed row. Never identity, never
   * reported. The V2B sentinel 0 is a valid opaque token, never a member.
   */
  readonly memberNumber: number | null;
  /**
   * H2-⑬: the purchase's own PUBLIC gross-USDC figure (6-dec raw decimal
   * string; V1 usdcAmount · V2 usdcIn · V3 grossUsdc — not a gated economics
   * field). Consumed ONLY by the milestone read-model's cumulative walk;
   * never rendered per-line, never enters the aggregate report. null on
   * Routed rows (routing detail, not a purchase).
   */
  readonly usdcGrossRaw: string | null;
  /**
   * H2-⑫: the engine's rate-table page this purchase was made in — a PUBLIC
   * protocol parameter (uint16, never an address). Consumed ONLY by the
   * era read-model's transition-witness walk; never rendered per-line,
   * never enters the aggregate report. null where the generation carries
   * no era (V1) and on Routed rows.
   */
  readonly era: number | null;
  /**
   * H2-P (THE PRIDE OF THE PUBLIC RECORD, founder amendment 2026-07-15):
   * the event's own PUBLIC actor — V3 recipient (the seat's holder), else
   * the buyer. SERVER-ONLY as a full address; it leaves the server ONLY as
   * the feed projection's SHORT FORM. Never enriched, never joined beyond
   * this event's own fields; never enters the aggregate report.
   */
  readonly memberAddress: string | null;
  /**
   * H2-P: TRUE iff the V3 event's own source id is non-zero (the loader's
   * reduction; the id itself never leaves).
   */
  readonly referredBySource: boolean;
  /**
   * H2-P founder override A (2026-07-15): the event's OWN referrer — the V3
   * log's sourceWallet, same event, no join. SERVER-ONLY full address; it
   * leaves ONLY as the projection's short form ("brought by 0x3f2…0a91").
   * null when unreferred or when the wallet field is malformed (the line
   * degrades to the veiled wording — an honest gap, never a guess).
   */
  readonly referrerAddress: string | null;
}

export interface BlockTimestampInput {
  readonly chainId: number;
  readonly blockNumber: number;
  /** Chain-derived epoch seconds (Protocol Time cache; never wall-clock). */
  readonly blockTimestampSec: number;
}

export interface ActivityBuildInput {
  readonly expectedChainId: number;
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
}

// ---------------------------------------------------------------------------
// The read-model item (SERVER-ONLY object; never serialized publicly).
// ---------------------------------------------------------------------------

export type FirstSeatBucket = "true" | "false" | "unknown";

export interface ActivityItem {
  readonly kind: typeof ACTIVITY_EVENT_KIND;
  readonly category: typeof ACTIVITY_EVENT_CATEGORY;
  readonly generation: SaleGeneration;
  readonly chainId: number;
  /**
   * The purchase transaction (public chain data). Never enters the aggregate
   * report; leaves the server ONLY as the feed projection's shape-validated
   * verify anchor (M4-b).
   */
  readonly transactionHash: string;
  /** SERVER-ONLY ordering/coverage detail — never enters the report. */
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly blockTimestampSec: number;
  /** UTC calendar day (YYYY-MM-DD) of the chain-verified block time. */
  readonly isoDayUtc: string;
  readonly firstSeatBucket: FirstSeatBucket;
  /** True when a Routed routing row was folded into this purchase. */
  readonly routedFolded: boolean;
  /**
   * H2-P: the event's own member number (PUBLIC — the chain publishes it in
   * the same log; V2B's sentinel 0 normalizes to null). Serves on the feed
   * line beside the short-form address; still NEVER in the aggregate report.
   */
  readonly memberNumber: number | null;
  /** H2-P: SERVER-ONLY full actor address (projection emits SHORT FORM only). */
  readonly memberAddress: string | null;
  /** H2-P: the referred flag (the loader's source-id reduction). */
  readonly referredBySource: boolean;
  /** H2-P override A: SERVER-ONLY full referrer address (short form serves). */
  readonly referrerAddress: string | null;
}

export interface ActivityCheck {
  readonly label: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface ActivityBuildResult {
  readonly meta: typeof ACTIVITY_HEARTBEAT_READ_MODEL_META;
  /** SERVER-ONLY items — structurally excluded from the address-safe report. */
  readonly items: readonly ActivityItem[];
  readonly totals: {
    readonly rawRowsConsidered: number;
    readonly purchaseEvents: number;
    readonly routedRowsFolded: number;
    readonly items: number;
  };
  readonly byGeneration: Record<SaleGeneration, number>;
  readonly firstSeatBuckets: Record<FirstSeatBucket, number>;
  readonly coverage: {
    readonly distinctBlocks: number;
    readonly blocksWithVerifiedTimestamp: number;
  };
  readonly dateRangeUtc: {
    readonly first: string | null;
    readonly last: string | null;
  };
  readonly checks: readonly ActivityCheck[];
  readonly consistent: boolean;
}

// ---------------------------------------------------------------------------
// Builder.
// ---------------------------------------------------------------------------

function fail(message: string): never {
  // Never echo transaction hashes, member numbers, or decoded material.
  throw new Error(`activity-heartbeat build failed closed: ${message}`);
}

/** Format chain-verified epoch seconds as a UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

export function buildActivityHeartbeatReadModel(
  input: ActivityBuildInput,
): ActivityBuildResult {
  const { expectedChainId, rawEvents, blockTimestamps } = input;

  // --- Chain uniformity (fail closed) ---
  for (const e of rawEvents) {
    if (e.chainId !== expectedChainId) {
      fail(
        `raw event on unexpected chain ${e.chainId} (expected ${expectedChainId})`,
      );
    }
  }
  const tsByBlock = new Map<number, number>();
  for (const t of blockTimestamps) {
    if (t.chainId !== expectedChainId) {
      fail(
        `block timestamp on unexpected chain ${t.chainId} (expected ${expectedChainId})`,
      );
    }
    const existing = tsByBlock.get(t.blockNumber);
    if (existing !== undefined && existing !== t.blockTimestampSec) {
      fail(`conflicting verified timestamps for one block`);
    }
    tsByBlock.set(t.blockNumber, t.blockTimestampSec);
  }

  // --- Classification (fail closed on any unknown shape) ---
  type Classified = RawSaleEventInput & {
    readonly generationTyped: SaleGeneration;
    readonly role: "purchase" | "routed";
  };
  const classified: Classified[] = rawEvents.map((e) => {
    const gen = e.generation as SaleGeneration;
    if (!(gen in PURCHASE_EVENT_BY_GENERATION)) {
      fail(`unknown sale generation "${e.generation}"`);
    }
    if (e.eventName === PURCHASE_EVENT_BY_GENERATION[gen]) {
      return { ...e, generationTyped: gen, role: "purchase" };
    }
    if (e.eventName === "Routed" && ROUTED_GENERATIONS.has(gen)) {
      return { ...e, generationTyped: gen, role: "routed" };
    }
    fail(`unknown event "${e.eventName}" for generation "${e.generation}"`);
  });

  // --- Transaction grouping + Routed folding (fail closed on cardinality) ---
  const byTx = new Map<string, Classified[]>();
  for (const e of classified) {
    const group = byTx.get(e.transactionHash) ?? [];
    group.push(e);
    byTx.set(e.transactionHash, group);
  }

  const items: ActivityItem[] = [];
  let routedRowsFolded = 0;
  for (const group of byTx.values()) {
    const purchases = group.filter((g) => g.role === "purchase");
    const routed = group.filter((g) => g.role === "routed");
    if (purchases.length === 0) {
      fail("Routed row without a purchase in its transaction (tx withheld)");
    }
    if (purchases.length > 1) {
      fail("more than one purchase event in a single transaction (tx withheld)");
    }
    if (routed.length > 1) {
      fail("more than one Routed row in a single transaction (tx withheld)");
    }
    const purchase = purchases[0]!;
    if (routed.length === 1) {
      const r = routed[0]!;
      if (r.generationTyped !== purchase.generationTyped) {
        fail("Routed row generation differs from its purchase (tx withheld)");
      }
      if (purchase.memberNumber === null || r.memberNumber === null) {
        fail(
          "Routed pairing requires the opaque token on both rows (tx withheld)",
        );
      }
      if (purchase.memberNumber !== r.memberNumber) {
        fail(
          "Routed/purchase reconciliation token mismatch in one transaction (tx withheld)",
        );
      }
      routedRowsFolded += 1;
    }

    const ts = tsByBlock.get(purchase.blockNumber);
    if (ts === undefined) {
      fail("purchase block has no verified timestamp in the Protocol Time cache");
    }
    items.push({
      kind: ACTIVITY_EVENT_KIND,
      category: ACTIVITY_EVENT_CATEGORY,
      generation: purchase.generationTyped,
      chainId: purchase.chainId,
      transactionHash: purchase.transactionHash,
      blockNumber: purchase.blockNumber,
      logIndex: purchase.logIndex,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
      firstSeatBucket:
        purchase.firstSeat === true
          ? "true"
          : purchase.firstSeat === false
            ? "false"
            : "unknown",
      routedFolded: routed.length === 1,
      // H2-P: the event's own public identity facts (the V2B sentinel 0 is
      // a pairing token, never a member — normalized to null here).
      memberNumber:
        purchase.memberNumber !== null && purchase.memberNumber > 0
          ? purchase.memberNumber
          : null,
      memberAddress: purchase.memberAddress,
      referredBySource: purchase.referredBySource,
      referrerAddress: purchase.referrerAddress,
    });
  }

  // --- Deterministic ordering (chain order, input order irrelevant) ---
  items.sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  );

  // --- Aggregates ---
  const byGeneration: Record<SaleGeneration, number> = {
    V1: 0,
    V2A: 0,
    V2B: 0,
    V3: 0,
  };
  const firstSeatBuckets: Record<FirstSeatBucket, number> = {
    true: 0,
    false: 0,
    unknown: 0,
  };
  const itemBlocks = new Set<number>();
  const days = new Set<string>();
  for (const item of items) {
    byGeneration[item.generation] += 1;
    firstSeatBuckets[item.firstSeatBucket] += 1;
    itemBlocks.add(item.blockNumber);
    days.add(item.isoDayUtc);
  }
  const sortedDays = [...days].sort();

  const purchaseEvents = classified.filter((c) => c.role === "purchase").length;
  const routedRows = classified.filter((c) => c.role === "routed").length;

  const checks: ActivityCheck[] = [
    {
      label: "chain-uniform",
      passed: true,
      detail: `all rows and timestamps verified on chain ${expectedChainId}`,
    },
    {
      label: "taxonomy-total",
      passed: items.length === purchaseEvents,
      detail: `items (${items.length}) must equal purchase-family events (${purchaseEvents})`,
    },
    {
      label: "routed-folded",
      passed: routedRowsFolded === routedRows,
      detail: `folded Routed rows (${routedRowsFolded}) must equal Routed rows considered (${routedRows})`,
    },
    {
      label: "timestamp-coverage",
      passed: [...itemBlocks].every((b) => tsByBlock.has(b)),
      detail: `every item block carries a chain-verified timestamp (${itemBlocks.size} distinct blocks)`,
    },
  ];

  const result: ActivityBuildResult = {
    meta: ACTIVITY_HEARTBEAT_READ_MODEL_META,
    items,
    totals: {
      rawRowsConsidered: rawEvents.length,
      purchaseEvents,
      routedRowsFolded,
      items: items.length,
    },
    byGeneration,
    firstSeatBuckets,
    coverage: {
      distinctBlocks: itemBlocks.size,
      blocksWithVerifiedTimestamp: [...itemBlocks].filter((b) =>
        tsByBlock.has(b),
      ).length,
    },
    dateRangeUtc: {
      first: sortedDays[0] ?? null,
      last: sortedDays[sortedDays.length - 1] ?? null,
    },
    checks,
    consistent: checks.every((c) => c.passed),
  };
  return result;
}

// ---------------------------------------------------------------------------
// Address-safe report (the ONLY serialization path out of this module).
// ---------------------------------------------------------------------------

export interface ActivityAddressSafeReport {
  readonly readModel: "ActivityHeartbeatItem";
  readonly layer: "OS_ACTIVITY_HEARTBEAT_FOUNDATION";
  readonly meta: typeof ACTIVITY_HEARTBEAT_READ_MODEL_META;
  readonly taxonomy: {
    readonly kind: typeof ACTIVITY_EVENT_KIND;
    readonly category: typeof ACTIVITY_EVENT_CATEGORY;
  };
  readonly totals: ActivityBuildResult["totals"];
  readonly byGeneration: ActivityBuildResult["byGeneration"];
  readonly firstSeatBuckets: ActivityBuildResult["firstSeatBuckets"];
  readonly coverage: ActivityBuildResult["coverage"];
  readonly dateRangeUtc: ActivityBuildResult["dateRangeUtc"];
  readonly checks: ActivityBuildResult["checks"];
  readonly consistent: boolean;
}

/**
 * Whitelist projection: counts, buckets, coverage, day-granularity date range,
 * pass/fail checks ONLY. Items (and with them block numbers, log indexes,
 * pairing tokens and timestamps) are structurally unreachable, and the
 * serialized output is scanned fail-closed for hex identity material and for
 * forbidden field names.
 */
export function toAddressSafeActivityReport(
  result: ActivityBuildResult,
): ActivityAddressSafeReport {
  const report: ActivityAddressSafeReport = {
    readModel: "ActivityHeartbeatItem",
    layer: "OS_ACTIVITY_HEARTBEAT_FOUNDATION",
    meta: result.meta,
    taxonomy: { kind: ACTIVITY_EVENT_KIND, category: ACTIVITY_EVENT_CATEGORY },
    totals: result.totals,
    byGeneration: result.byGeneration,
    firstSeatBuckets: result.firstSeatBuckets,
    coverage: result.coverage,
    dateRangeUtc: result.dateRangeUtc,
    checks: result.checks,
    consistent: result.consistent,
  };
  const json = JSON.stringify(report);
  assertAddressSafeJson(json);
  for (const forbiddenField of [
    '"memberNumber"',
    '"blockNumber"',
    '"transactionHash"',
    '"firstSeat"',
    '"logIndex"',
    '"blockTimestampSec"',
    '"usdcGrossRaw"',
    '"era"',
    '"memberAddress"',
    '"memberShort"',
    '"referredBySource"',
    '"referrerAddress"',
  ]) {
    if (json.includes(forbiddenField)) {
      throw new Error(
        `address-safe activity report violated: forbidden field ${forbiddenField} present`,
      );
    }
  }
  return report;
}
