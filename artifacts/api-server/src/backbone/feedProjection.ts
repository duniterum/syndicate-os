/**
 * Event Backbone — PUBLIC RECEIPT-LINE FEED projection (M4-b; M4-c extended).
 * --------------------------------------------------------------------------
 * Projects the backbone's last-good read-models into the public feed:
 * receipt-backed lines only — seats, burns (Proof of Burn), and referral
 * lifecycle. The SECOND (and last) sanctioned serialization out of the
 * read-models, next to the address-safe aggregate report.
 *
 * Privacy doctrine (guard-enforced):
 *   - Served per line: kind, block number, chain-verified time, the
 *     transaction verify anchor + its log index (one tx can carry two burns —
 *     the pair is the line's identity; both are public chain data), and the
 *     kind's own facts: generation + firstSeat bucket (seats), the exact
 *     amount + the Founder/Community LABEL + the Proof of Burn number
 *     (burns — the amount IS the record), nothing extra (lifecycle).
 *   - NEVER served: wallet addresses (the burn sender enters the read-model
 *     and leaves ONLY as its label), member numbers, decodedJson/rawJson.
 *   - Output gate: every transactionHash must match the EXACT 0x+64-hex
 *     transaction shape (a 20-byte address can never pass), those validated
 *     anchors are masked, and the remaining JSON must survive the strict
 *     address scanner — a smuggled address, bare hash, or over-long hex
 *     still fails closed.
 *   - Recency-truthful: newest first, hard cap on the mixed feed; the burn
 *     ledger is served COMPLETE (it is the numbered public record — rare,
 *     manual acts). Filters/pagination deliberately wait (M5+).
 */

import { assertAddressSafeJson } from "../lib/protocol/addressSafety";
import type {
  ActivityBuildResult,
  FirstSeatBucket,
} from "./activityHeartbeatReadmodel";
import type {
  ProtocolEventBuildResult,
  SenderLabel,
} from "./protocolEventReadmodel";

/** Hard cap on served mixed-feed lines (newest first). Pagination waits. */
export const FEED_MAX_ITEMS = 100;

/** EXACT transaction-hash shape: 0x + 64 hex. An address (40 hex) can never pass. */
export const TX_HASH_SHAPE_RE = /^0x[0-9a-fA-F]{64}$/;

interface LineCommon {
  readonly blockNumber: number;
  /** Chain-verified epoch seconds (Protocol Time; never wall-clock). */
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
  /** The verify anchor (public chain data). Shape-validated, gate-masked. */
  readonly transactionHash: string;
  /** Position within the anchor tx — the line's identity (public chain data). */
  readonly logIndex: number;
}

export interface PublicSeatLine extends LineCommon {
  readonly kind: "purchase";
  readonly category: "membership-sale";
  readonly generation: string;
  readonly firstSeatBucket: FirstSeatBucket;
  readonly routedFolded: boolean;
}

export interface PublicBurnLine extends LineCommon {
  readonly kind: "burn";
  /** 1-based Proof of Burn number, oldest first — valid on the gapless record. */
  readonly proofOfBurnNumber: number;
  /** Exact raw 18-decimal base units, decimal string. */
  readonly amountSynRaw: string;
  /** Founder or Community — a LABEL, never an address. */
  readonly senderLabel: SenderLabel;
}

export interface PublicLifecycleLine extends LineCommon {
  readonly kind: "source-created" | "source-terms" | "source-status" | "source-wallet";
  /** H1a (⑧): the rung a source rose to, when the terms update IS a promotion. */
  readonly risenToTitle: string | null;
}

// ── H1a — the complete heartbeat's new public lines ─────────────────────────
export interface PublicLpLine extends LineCommon {
  readonly kind: "lp-add" | "lp-remove";
  /** Exact raw base units (SYN 18-dec, USDC 6-dec) — public per the chain. */
  readonly amountSynRaw: string;
  readonly amountUsdcRaw: string;
  /** Founder or Community — the burns precedent (the founder voice rule). */
  readonly actorLabel: SenderLabel;
}

export interface PublicArchiveMintLine extends LineCommon {
  readonly kind: "archive-mint";
  readonly artifactLabel: string;
  readonly quantityRaw: string;
}

export interface PublicArchivePauseLine extends LineCommon {
  readonly kind: "archive-pause";
  readonly action: "paused" | "resumed";
}

export type PublicFeedLine =
  | PublicSeatLine
  | PublicBurnLine
  | PublicLifecycleLine
  | PublicLpLine
  | PublicArchiveMintLine
  | PublicArchivePauseLine;

export interface PublicActivityFeed {
  readonly module: "event-backbone";
  readonly state: string;
  readonly coverage: {
    readonly headBlock: number | null;
    readonly finishedIso: string | null;
    readonly itemsTotal: number;
    readonly served: number;
    /**
     * The protocol lane's honest bounds (its cursors). During a catch-up
     * these sit BELOW headBlock: burns/lifecycle are complete UP TO here —
     * the record grows as the indexer advances; never evidence of absence
     * beyond it.
     */
    readonly burnsAsOfBlock: number | null;
    readonly lifecycleAsOfBlock: number | null;
  };
  /** Which histories are served COMPLETE in this payload (honest flags). */
  readonly lanes: {
    readonly seats: boolean;
    readonly burns: boolean;
    readonly referralLifecycle: boolean;
    readonly liquidity: boolean;
    readonly archive: boolean;
  };
  readonly honesty: string;
  /** Mixed feed, newest first, capped. */
  readonly items: readonly PublicFeedLine[];
  /** The COMPLETE numbered Proof of Burn record, oldest first. */
  readonly burnLedger: readonly PublicBurnLine[];
}

const FEED_HONESTY_LINE =
  "Receipt-backed lines only, newest first, from each stream's pinned deployment block to the head the last cycle saw. Between cycles this is a snapshot — never evidence of absence. Every line is verifiable on-chain via its transaction anchor.";

export interface FeedSource {
  readonly model: ActivityBuildResult | null;
  readonly protocolModel: ProtocolEventBuildResult | null;
  readonly state: string;
  readonly headBlock: number | null;
  readonly finishedIso: string | null;
  readonly burnsAsOfBlock: number | null;
  readonly lifecycleAsOfBlock: number | null;
}

function assertAnchor(transactionHash: string): void {
  if (!TX_HASH_SHAPE_RE.test(transactionHash)) {
    throw new Error(
      "feed projection failed closed: a line's verify anchor is not transaction-shaped (value withheld)",
    );
  }
}

function assertSenderLabel(label: string): void {
  if (label !== "Founder" && label !== "Community") {
    throw new Error(
      "feed projection failed closed: a burn sender label is not Founder/Community (value withheld)",
    );
  }
}

/**
 * Build the public feed from the backbone's last-good models. Fail-closed:
 * any malformed anchor, amount, or label throws. Null models (dark / parked /
 * no successful cycle yet) serve an honest empty feed — never an invented one.
 */
export function buildPublicFeed(source: FeedSource): PublicActivityFeed {
  const { model, protocolModel } = source;

  const seatLines: PublicSeatLine[] = (model?.items ?? []).map((item) => {
    assertAnchor(item.transactionHash);
    return {
      kind: item.kind,
      category: item.category,
      generation: item.generation,
      blockNumber: item.blockNumber,
      blockTimestampSec: item.blockTimestampSec,
      isoDayUtc: item.isoDayUtc,
      transactionHash: item.transactionHash,
      logIndex: item.logIndex,
      firstSeatBucket: item.firstSeatBucket,
      routedFolded: item.routedFolded,
    };
  });

  const burnLedger: PublicBurnLine[] = (protocolModel?.burnLedger ?? []).map(
    (b) => {
      assertAnchor(b.transactionHash);
      assertSenderLabel(b.senderLabel);
      if (!/^[0-9]+$/.test(b.amountSynRaw)) {
        throw new Error(
          "feed projection failed closed: a burn amount is not a clean integer (value withheld)",
        );
      }
      return {
        kind: "burn" as const,
        proofOfBurnNumber: b.proofOfBurnNumber,
        amountSynRaw: b.amountSynRaw,
        senderLabel: b.senderLabel,
        blockNumber: b.blockNumber,
        blockTimestampSec: b.blockTimestampSec,
        isoDayUtc: b.isoDayUtc,
        transactionHash: b.transactionHash,
        logIndex: b.logIndex,
      };
    },
  );

  const lifecycleLines: PublicLifecycleLine[] = (
    protocolModel?.lifecycleItems ?? []
  ).map((l) => {
    assertAnchor(l.transactionHash);
    return {
      kind: l.kind,
      risenToTitle: l.risenToTitle,
      blockNumber: l.blockNumber,
      blockTimestampSec: l.blockTimestampSec,
      isoDayUtc: l.isoDayUtc,
      transactionHash: l.transactionHash,
      logIndex: l.logIndex,
    };
  });

  // ── H1a — liquidity, artifact-mint and ceremonial lines ──
  const lpLines: PublicLpLine[] = (protocolModel?.lpItems ?? []).map((p) => {
    assertAnchor(p.transactionHash);
    assertSenderLabel(p.actorLabel);
    if (!/^[0-9]+$/.test(p.amountSynRaw) || !/^[0-9]+$/.test(p.amountUsdcRaw)) {
      throw new Error(
        "feed projection failed closed: an lp amount is not a clean integer (value withheld)",
      );
    }
    return {
      kind: p.kind,
      amountSynRaw: p.amountSynRaw,
      amountUsdcRaw: p.amountUsdcRaw,
      actorLabel: p.actorLabel,
      blockNumber: p.blockNumber,
      blockTimestampSec: p.blockTimestampSec,
      isoDayUtc: p.isoDayUtc,
      transactionHash: p.transactionHash,
      logIndex: p.logIndex,
    };
  });
  const archiveMintLines: PublicArchiveMintLine[] = (
    protocolModel?.archiveMintItems ?? []
  ).map((a) => {
    assertAnchor(a.transactionHash);
    if (!/^[0-9]+$/.test(a.quantityRaw)) {
      throw new Error(
        "feed projection failed closed: a mint quantity is not a clean integer (value withheld)",
      );
    }
    return {
      kind: a.kind,
      artifactLabel: a.artifactLabel,
      quantityRaw: a.quantityRaw,
      blockNumber: a.blockNumber,
      blockTimestampSec: a.blockTimestampSec,
      isoDayUtc: a.isoDayUtc,
      transactionHash: a.transactionHash,
      logIndex: a.logIndex,
    };
  });
  const archivePauseLines: PublicArchivePauseLine[] = (
    protocolModel?.archivePauseItems ?? []
  ).map((c) => {
    assertAnchor(c.transactionHash);
    return {
      kind: c.kind,
      action: c.action,
      blockNumber: c.blockNumber,
      blockTimestampSec: c.blockTimestampSec,
      isoDayUtc: c.isoDayUtc,
      transactionHash: c.transactionHash,
      logIndex: c.logIndex,
    };
  });

  const allLines: PublicFeedLine[] = [
    ...seatLines,
    ...burnLedger,
    ...lifecycleLines,
    ...lpLines,
    ...archiveMintLines,
    ...archivePauseLines,
  ].sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? b.blockNumber - a.blockNumber
      : b.logIndex - a.logIndex,
  );
  const items = allLines.slice(0, FEED_MAX_ITEMS);

  return {
    module: "event-backbone",
    state: source.state,
    coverage: {
      headBlock: source.headBlock,
      finishedIso: source.finishedIso,
      itemsTotal: allLines.length,
      served: items.length,
      burnsAsOfBlock: source.burnsAsOfBlock,
      lifecycleAsOfBlock: source.lifecycleAsOfBlock,
    },
    lanes: {
      seats: model !== null,
      burns: protocolModel !== null,
      referralLifecycle: protocolModel !== null,
      liquidity: protocolModel !== null,
      archive: protocolModel !== null,
    },
    honesty: FEED_HONESTY_LINE,
    items,
    burnLedger,
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
