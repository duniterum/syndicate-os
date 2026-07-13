/**
 * Event Backbone — PUBLIC RECEIPT-LINE FEED projection (M4-b, founder GO).
 * --------------------------------------------------------------------------
 * Projects the backbone's last-good activity read-model into the public
 * per-item feed: receipt-backed lines only — "a seat was written · block N ·
 * verify". This is the SECOND (and last) sanctioned serialization out of the
 * read-model, next to the address-safe aggregate report.
 *
 * Privacy doctrine (guard-enforced):
 *   - Served per line: kind/category/generation, block number, chain-verified
 *     time, the transaction hash (THE verify anchor — public chain data, the
 *     same anchor the client feed renders today), firstSeat bucket, routed
 *     fold flag. NOTHING else.
 *   - NEVER served: wallet addresses (structurally absent from the model),
 *     member numbers (opaque pairing tokens — identity-blind stays law),
 *     log indexes, decodedJson/rawJson.
 *   - Output gate: every transactionHash must match the EXACT 0x+64-hex
 *     transaction shape (a 20-byte address can never pass), those validated
 *     anchors are masked, and the remaining JSON must survive the strict
 *     address scanner — so a smuggled address, bare hash, or over-long hex
 *     still fails closed.
 *   - Recency-truthful: newest first, hard cap, coverage + honesty stated.
 *     Filters/pagination deliberately wait (M5+).
 */

import { assertAddressSafeJson } from "../lib/protocol/addressSafety";
import type {
  ActivityBuildResult,
  FirstSeatBucket,
} from "./activityHeartbeatReadmodel";

/** Hard cap on served lines (newest first). Pagination waits (M5+). */
export const FEED_MAX_ITEMS = 100;

/** EXACT transaction-hash shape: 0x + 64 hex. An address (40 hex) can never pass. */
export const TX_HASH_SHAPE_RE = /^0x[0-9a-fA-F]{64}$/;

export interface PublicReceiptLine {
  readonly kind: "purchase";
  readonly category: "membership-sale";
  readonly generation: string;
  readonly blockNumber: number;
  /** Chain-verified epoch seconds (Protocol Time; never wall-clock). */
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
  /** The verify anchor (public chain data). Shape-validated, gate-masked. */
  readonly transactionHash: string;
  readonly firstSeatBucket: FirstSeatBucket;
  readonly routedFolded: boolean;
}

export interface PublicActivityFeed {
  readonly module: "event-backbone";
  readonly state: string;
  readonly coverage: {
    readonly headBlock: number | null;
    readonly finishedIso: string | null;
    readonly itemsTotal: number;
    readonly served: number;
  };
  readonly honesty: string;
  readonly items: readonly PublicReceiptLine[];
}

const FEED_HONESTY_LINE =
  "Receipt-backed lines only, newest first, from each generation's pinned deployment block to the head the last cycle saw. Between cycles this is a snapshot — never evidence of absence. Every line is verifiable on-chain via its transaction anchor.";

export interface FeedSource {
  readonly model: ActivityBuildResult | null;
  readonly state: string;
  readonly headBlock: number | null;
  readonly finishedIso: string | null;
}

/**
 * Build the public feed from the backbone's last-good model. Fail-closed:
 * any line whose transaction anchor is not EXACTLY transaction-shaped throws.
 * A null model (dark / parked / no successful cycle yet) serves an honest
 * empty feed — never an invented one.
 */
export function buildPublicFeed(source: FeedSource): PublicActivityFeed {
  const { model } = source;
  if (model === null) {
    return {
      module: "event-backbone",
      state: source.state,
      coverage: { headBlock: null, finishedIso: null, itemsTotal: 0, served: 0 },
      honesty: FEED_HONESTY_LINE,
      items: [],
    };
  }

  // Model items are ascending (blockNumber, logIndex) — serve newest first.
  const newestFirst = [...model.items].reverse().slice(0, FEED_MAX_ITEMS);
  const items: PublicReceiptLine[] = newestFirst.map((item) => {
    if (!TX_HASH_SHAPE_RE.test(item.transactionHash)) {
      throw new Error(
        "feed projection failed closed: a line's verify anchor is not transaction-shaped (value withheld)",
      );
    }
    return {
      kind: item.kind,
      category: item.category,
      generation: item.generation,
      blockNumber: item.blockNumber,
      blockTimestampSec: item.blockTimestampSec,
      isoDayUtc: item.isoDayUtc,
      transactionHash: item.transactionHash,
      firstSeatBucket: item.firstSeatBucket,
      routedFolded: item.routedFolded,
    };
  });

  return {
    module: "event-backbone",
    state: source.state,
    coverage: {
      headBlock: source.headBlock,
      finishedIso: source.finishedIso,
      itemsTotal: model.totals.items,
      served: items.length,
    },
    honesty: FEED_HONESTY_LINE,
    items,
  };
}

/**
 * Feed output gate: mask ONLY tokens with the exact 0x+64-hex transaction
 * shape, then run the STRICT address scanner on the remainder. Addresses
 * (0x+40 hex), bare 32-byte hashes, and over-long hex all stay unmasked and
 * trip the scan — fail-closed, nothing echoed.
 */
export function assertFeedSafeJson(serialized: string): void {
  const masked = serialized.replace(
    /0x[0-9a-fA-F]{64}(?![0-9a-fA-F])/g,
    "0xVERIFY_ANCHOR",
  );
  assertAddressSafeJson(masked);
}
