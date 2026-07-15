/**
 * Event Backbone — PUBLIC RECEIPT-LINE FEED projection (M4-b; M4-c extended).
 * --------------------------------------------------------------------------
 * Projects the backbone's last-good read-models into the public feed:
 * receipt-backed lines only — seats, burns (Proof of Burn), and referral
 * lifecycle. The SECOND (and last) sanctioned serialization out of the
 * read-models, next to the address-safe aggregate report.
 *
 * Privacy doctrine (guard-enforced; H2-P amended — THE PRIDE OF THE PUBLIC
 * RECORD, founder override 2026-07-15, recorded in ADR-003):
 *   - Served per line: kind, block number, chain-verified time, the
 *     transaction verify anchor + its log index, and the kind's own facts —
 *     INCLUDING, since H2-P, the event's own member number and its actor's
 *     SHORT-FORM address (the origin voice: "0x123…abcd entered the public
 *     registry"). The feed narrates what the chain publishes, full stop.
 *   - NEVER served: a FULL wallet address (short form only — derived here,
 *     from the event's own field, never enriched, never joined), gated
 *     referral/source identity (the veiled referred flag is a boolean),
 *     decodedJson/rawJson. The founder voice rule stands: founder acts SAY
 *     the founder; their short form is withheld in favor of the name.
 *   - Output gate UNCHANGED and still armed: every transactionHash must
 *     match the EXACT 0x+64-hex transaction shape, validated anchors are
 *     masked, and the remaining JSON must survive the strict address
 *     scanner — a FULL address (40-hex), bare hash, or over-long hex still
 *     fails closed. A short form (3+4 hex around an ellipsis) can never
 *     trip it and can never BE a full address.
 *   - Recency-truthful: newest first, hard cap on the mixed feed; the burn
 *     ledger is served COMPLETE (the numbered public record).
 */

import { assertAddressSafeJson } from "../lib/protocol/addressSafety";
import type {
  ActivityBuildResult,
  FirstSeatBucket,
} from "./activityHeartbeatReadmodel";
import type {
  ProtocolEventBuildResult,
  SenderLabel,
  TreasuryMoveItem,
} from "./protocolEventReadmodel";
import type {
  MilestoneBuildResult,
  MilestoneKind,
} from "./milestoneReadmodel";
import type { EraBuildResult } from "./eraReadmodel";

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
  /** H2-P: the event's own member number (V2B sentinel normalized to null). */
  readonly memberNumber: number | null;
  /** H2-P: the actor's SHORT FORM (never a full address). */
  readonly memberShort: string | null;
  /** H2-P (founder choice B): the veiled referred flag — a boolean only. */
  readonly referred: boolean;
}

export interface PublicBurnLine extends LineCommon {
  readonly kind: "burn";
  /** 1-based Proof of Burn number, oldest first — valid on the gapless record. */
  readonly proofOfBurnNumber: number;
  /** Exact raw 18-decimal base units, decimal string. */
  readonly amountSynRaw: string;
  /** Founder or Community — the label the sentence speaks. */
  readonly senderLabel: SenderLabel;
  /** H2-P: Community sender's SHORT FORM (null on Founder — the voice rule). */
  readonly actorShort: string | null;
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
  /** H2-P: Community actor's SHORT FORM (null on Founder — the voice rule). */
  readonly actorShort: string | null;
}

export interface PublicArchiveMintLine extends LineCommon {
  readonly kind: "archive-mint";
  readonly artifactLabel: string;
  /** H2-P: the artifact's on-chain token id (the origin voice names it). */
  readonly artifactId: number;
  readonly quantityRaw: string;
  /** H2-P: the minter's SHORT FORM (null on pre-backfill rows — honest gap). */
  readonly minterShort: string | null;
}

export interface PublicArchivePauseLine extends LineCommon {
  readonly kind: "archive-pause";
  readonly action: "paused" | "resumed";
}

// ── H2-⑦ — treasury movements (organ LABELS only; post-Fold-Law) ────────────
export interface PublicTreasuryLine extends LineCommon {
  readonly kind: "treasury-move";
  readonly token: "USDC" | "SYN";
  /** Exact raw base units — public per the Visibility Rule. */
  readonly amountRaw: string;
  readonly movement: "in" | "out" | "internal";
  /** A LABEL ("the vault" / "the liquidity wallet" / "the operations
   *  wallet") — never an address; external counterparties never named. */
  readonly organLabel: string;
  readonly toOrganLabel: string | null;
}

// ── H2-⑬ — milestone crossings (derived, anchored to the crossing tx) ───────
export interface PublicMilestoneLine extends LineCommon {
  readonly kind: "milestone";
  readonly milestoneId: string;
  /** Founder-approved public label (canon defs, milestoneReadmodel). */
  readonly label: string;
  readonly milestoneKind: MilestoneKind;
  readonly target: number;
}

// ── H2-⑫ — era transitions (the witness pattern; line-on-crossing ONLY —
// era bounds are bytecode, never framed as scarcity pressure) ────────────────
export interface PublicEraLine extends LineCommon {
  readonly kind: "era-transition";
  /** The era the protocol entered. */
  readonly era: number;
  /** The engine whose rate table turned (public generation label). */
  readonly engine: string;
}

export type PublicFeedLine =
  | PublicSeatLine
  | PublicBurnLine
  | PublicLifecycleLine
  | PublicLpLine
  | PublicArchiveMintLine
  | PublicArchivePauseLine
  | PublicTreasuryLine
  | PublicMilestoneLine
  | PublicEraLine;

/** H2-⑬ — the /activity Milestones panel block (address-safe by shape). */
export interface PublicMilestones {
  /** Sealed crossings, oldest first — each IS a feed line with its anchor. */
  readonly sealed: readonly PublicMilestoneLine[];
  /** Canon order; honest progress from the indexed history. */
  readonly approaching: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: MilestoneKind;
    readonly target: number;
    readonly currentSeats: number | null;
    readonly currentUsdcRaw: string | null;
  }[];
  /** Honest derivation notes (withheld lines, live-read posture). */
  readonly notes: readonly string[];
}

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
    /** H2-⑦: treasury movements (post-Fold-Law genuine acts). */
    readonly treasury: boolean;
    /** H2-⑬: milestone crossings, derived from the lanes above. */
    readonly milestones: boolean;
    /** H2-⑫: era transitions (witnessed page turns; empty until one). */
    readonly eras: boolean;
  };
  readonly honesty: string;
  /** Mixed feed, newest first, capped. */
  readonly items: readonly PublicFeedLine[];
  /** The COMPLETE numbered Proof of Burn record, oldest first. */
  readonly burnLedger: readonly PublicBurnLine[];
  /** H2-⑬: the Milestones panel block (null while the model is dark). */
  readonly milestones: PublicMilestones | null;
}

const FEED_HONESTY_LINE =
  "Receipt-backed lines only, newest first, from each stream's pinned deployment block to the head the last cycle saw. Between cycles this is a snapshot — never evidence of absence. Every line is verifiable on-chain via its transaction anchor.";

export interface FeedSource {
  readonly model: ActivityBuildResult | null;
  readonly protocolModel: ProtocolEventBuildResult | null;
  /** H2-⑬: the milestone model (null = dark / no successful build yet). */
  readonly milestoneModel: MilestoneBuildResult | null;
  /** H2-⑫: the era-transition model (null = dark). */
  readonly eraModel: EraBuildResult | null;
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

/** The served short form's exact shape: 0x + 3 hex + … + 4 hex, nothing else. */
export const SHORT_FORM_RE = /^0x[0-9a-f]{3}…[0-9a-f]{4}$/;

/**
 * H2-P — the ONE place a member address becomes public voice: the origin's
 * short form ("0x123…abcd"). Input must be a full 40-hex address (fail-closed);
 * the output can never be mistaken for one and can never trip the gate.
 */
function shortForm(address: string | null): string | null {
  if (address === null) return null;
  if (!/^0x[0-9a-f]{40}$/.test(address)) {
    throw new Error(
      "feed projection failed closed: a pride actor is not a lowercased full address (value withheld)",
    );
  }
  return `0x${address.slice(2, 5)}…${address.slice(-4)}`;
}

/**
 * Build the public feed from the backbone's last-good models. Fail-closed:
 * any malformed anchor, amount, or label throws. Null models (dark / parked /
 * no successful cycle yet) serve an honest empty feed — never an invented one.
 */
export function buildPublicFeed(source: FeedSource): PublicActivityFeed {
  const { model, protocolModel, milestoneModel, eraModel } = source;

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
      // H2-P: the event's own public identity facts, short form only.
      memberNumber: item.memberNumber,
      memberShort: shortForm(item.memberAddress),
      referred: item.referredBySource,
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
        // H2-P + the founder voice rule: the founder's acts say the founder;
        // Community pride carries the short form.
        actorShort:
          b.senderLabel === "Community" ? shortForm(b.actorAddress) : null,
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
      // H2-P + the founder voice rule (Community pride only).
      actorShort:
        p.actorLabel === "Community" ? shortForm(p.actorAddress) : null,
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
      artifactId: a.artifactId,
      quantityRaw: a.quantityRaw,
      // H2-P: the origin voice ("0x123…abcd archived First Signal"); null
      // on pre-backfill rows — an honest gap, never an invented actor.
      minterShort: shortForm(a.minterAddress),
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

  // ── H2-⑦ — treasury movements (labels validated, amounts clean) ──
  const treasuryLines: PublicTreasuryLine[] = (
    protocolModel?.treasuryItems ?? []
  ).map((t: TreasuryMoveItem) => {
    assertAnchor(t.transactionHash);
    if (!/^[0-9]+$/.test(t.amountRaw)) {
      throw new Error(
        "feed projection failed closed: a treasury amount is not a clean integer (value withheld)",
      );
    }
    // Organ labels are the read-model's canon strings — an address-shaped
    // "label" must never pass (fail-closed, value withheld).
    if (/0x[0-9a-fA-F]{6,}/.test(t.organLabel) || /0x[0-9a-fA-F]{6,}/.test(t.toOrganLabel ?? "")) {
      throw new Error(
        "feed projection failed closed: a treasury organ label is address-shaped (value withheld)",
      );
    }
    return {
      kind: t.kind,
      token: t.token,
      amountRaw: t.amountRaw,
      movement: t.movement,
      organLabel: t.organLabel,
      toOrganLabel: t.toOrganLabel,
      blockNumber: t.blockNumber,
      blockTimestampSec: t.blockTimestampSec,
      isoDayUtc: t.isoDayUtc,
      transactionHash: t.transactionHash,
      logIndex: t.logIndex,
    };
  });

  // ── H2-⑬ — milestone crossings + the panel block ──
  const milestoneLines: PublicMilestoneLine[] = (
    milestoneModel?.sealed ?? []
  ).map((m) => {
    assertAnchor(m.transactionHash);
    return {
      kind: "milestone" as const,
      milestoneId: m.id,
      label: m.label,
      milestoneKind: m.kind,
      target: m.target,
      blockNumber: m.blockNumber,
      blockTimestampSec: m.blockTimestampSec,
      isoDayUtc: m.isoDayUtc,
      transactionHash: m.transactionHash,
      logIndex: m.logIndex,
    };
  });
  const milestones: PublicMilestones | null = milestoneModel
    ? {
        sealed: milestoneLines,
        approaching: milestoneModel.approaching.map((a) => ({
          id: a.id,
          label: a.label,
          kind: a.kind,
          target: a.target,
          currentSeats: a.currentSeats,
          currentUsdcRaw: a.currentUsdcRaw,
        })),
        notes: milestoneModel.notes,
      }
    : null;

  // ── H2-⑫ — era transitions (witnessed page turns; empty until one) ──
  const eraLines: PublicEraLine[] = (eraModel?.transitions ?? []).map((t) => {
    assertAnchor(t.transactionHash);
    if (!Number.isSafeInteger(t.era) || t.era < 1) {
      throw new Error(
        "feed projection failed closed: an era transition carries no clean era (value withheld)",
      );
    }
    return {
      kind: "era-transition" as const,
      era: t.era,
      engine: t.engine,
      blockNumber: t.blockNumber,
      blockTimestampSec: t.blockTimestampSec,
      isoDayUtc: t.isoDayUtc,
      transactionHash: t.transactionHash,
      logIndex: t.logIndex,
    };
  });

  // Derived kinds share their anchor with the event that crossed/witnessed
  // them; in the newest-first feed the crossing reads as the CONSEQUENCE —
  // the derived line ranks newer than its underlying event (the tie-break
  // law, H2-⑬; H2-⑫ era lines join the same rank).
  const derivedRank = (k: PublicFeedLine["kind"]): number =>
    k === "milestone" || k === "era-transition" ? 1 : 0;

  const allLines: PublicFeedLine[] = [
    ...seatLines,
    ...burnLedger,
    ...lifecycleLines,
    ...lpLines,
    ...archiveMintLines,
    ...archivePauseLines,
    ...treasuryLines,
    ...milestoneLines,
    ...eraLines,
  ].sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? b.blockNumber - a.blockNumber
      : a.logIndex !== b.logIndex
        ? b.logIndex - a.logIndex
        : derivedRank(b.kind) - derivedRank(a.kind),
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
      treasury: protocolModel !== null,
      milestones: milestoneModel !== null,
      eras: eraModel !== null,
    },
    honesty: FEED_HONESTY_LINE,
    items,
    burnLedger,
    milestones,
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
