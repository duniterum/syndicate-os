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
import { GENESIS_SEAT_BY_WALLET } from "../lib/protocol/historicalFreezeWallets";
import type {
  ActivityBuildResult,
  FirstSeatBucket,
} from "./activityHeartbeatReadmodel";
import type {
  ActorClass,
  ProtocolEventBuildResult,
  SenderLabel,
  TreasuryMoveItem,
} from "./protocolEventReadmodel";
import type {
  MilestoneBuildResult,
  MilestoneFamily,
  MilestoneKind,
} from "./milestoneReadmodel";
import type { EraBuildResult } from "./eraReadmodel";
import type { CapitalBuildResult } from "./capitalAxisReadmodel";
import type { TreasuryAsset } from "./protocolEventScan";

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
  /**
   * THE FULL ADDRESS, PUBLIC (address law 2026-07-24/25: an address is
   * pseudonymous, never hidden; the short form is READABILITY only, and every
   * row owes an independently verifiable explorer anchor). The leak scan
   * already ALLOWS a public 40-hex value — activity-heartbeat.guard.ts:335.
   * Same nullability as its short form, so the Founder voice rule is untouched.
   */
  readonly memberAddress: string | null;
  /** H2-P: the referred flag (the event's own source-id test). */
  readonly referred: boolean;
  /**
   * H2-P founder override A: the referrer's SHORT FORM — the same event's
   * own sourceWallet, republished (no join). null when unreferred or when
   * the event's wallet field is malformed (the sentence degrades to the
   * veiled wording).
   */
  readonly referredByShort: string | null;
  /**
   * THE FULL ADDRESS, PUBLIC (address law 2026-07-24/25: an address is
   * pseudonymous, never hidden; the short form is READABILITY only, and every
   * row owes an independently verifiable explorer anchor). The leak scan
   * already ALLOWS a public 40-hex value — activity-heartbeat.guard.ts:335.
   * Same nullability as its short form, so the Founder voice rule is untouched.
   */
  readonly referredByAddress: string | null;
}

export interface PublicBurnLine extends LineCommon {
  readonly kind: "burn";
  /** 1-based Proof of Burn number, oldest first — valid on the gapless record. */
  readonly proofOfBurnNumber: number;
  /** Exact raw 18-decimal base units, decimal string. */
  readonly amountSynRaw: string;
  /** Founder or Community — the label the sentence speaks. */
  readonly senderLabel: SenderLabel;
  /**
   * THE FOUR-CLASS ACTOR (Founder ruling 2026-07-26). The public feed must
   * distinguish a seat holder’s act from a stranger’s: in this protocol one
   * has bought a seat and the others have not. Decided server-side from the
   * chain’s own sets — allocation registry, organ wallets, the sale lane’s
   * seat record — never from a typed label. The SURFACE renders it as a chip;
   * the sentence only ever names an origin, so no public copy says
   * “not a member”.
   */
  readonly actorClass: ActorClass;
  /** The organ’s public label when actorClass is "organ"; null otherwise. */
  readonly actorOrganLabel: string | null;
  /** H2-P: Community sender's SHORT FORM (null on Founder — the voice rule). */
  readonly actorShort: string | null;
  /**
   * THE FULL ADDRESS, PUBLIC (address law 2026-07-24/25: an address is
   * pseudonymous, never hidden; the short form is READABILITY only, and every
   * row owes an independently verifiable explorer anchor). The leak scan
   * already ALLOWS a public 40-hex value — activity-heartbeat.guard.ts:335.
   * Same nullability as its short form, so the Founder voice rule is untouched.
   */
  readonly actorAddress: string | null;
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
  /**
   * THE FULL ADDRESS, PUBLIC (address law 2026-07-24/25: an address is
   * pseudonymous, never hidden; the short form is READABILITY only, and every
   * row owes an independently verifiable explorer anchor). The leak scan
   * already ALLOWS a public 40-hex value — activity-heartbeat.guard.ts:335.
   * Same nullability as its short form, so the Founder voice rule is untouched.
   */
  readonly actorAddress: string | null;
}

export interface PublicArchiveMintLine extends LineCommon {
  readonly kind: "archive-mint";
  readonly artifactLabel: string;
  /** H2-P: the artifact's on-chain token id (the origin voice names it). */
  readonly artifactId: number;
  readonly quantityRaw: string;
  /** H2-P: the minter's SHORT FORM (null on pre-backfill rows — honest gap). */
  readonly minterShort: string | null;
  /**
   * THE FULL ADDRESS, PUBLIC (address law 2026-07-24/25: an address is
   * pseudonymous, never hidden; the short form is READABILITY only, and every
   * row owes an independently verifiable explorer anchor). The leak scan
   * already ALLOWS a public 40-hex value — activity-heartbeat.guard.ts:335.
   * Same nullability as its short form, so the Founder voice rule is untouched.
   */
  readonly minterAddress: string | null;
  /** The founder facet: Founder/Community per the readmodel's own set. */
  readonly minterLabel: "Founder" | "Community" | null;
}

export interface PublicArchivePauseLine extends LineCommon {
  readonly kind: "archive-pause";
  readonly action: "paused" | "resumed";
}

// ── H2-⑦ — treasury movements (organ LABELS only; post-Fold-Law) ────────────
export interface PublicTreasuryLine extends LineCommon {
  readonly kind: "treasury-move";
  /** A curated name, or a discovered token's own symbol. */
  readonly token: string;
  /**
   * DISCOVERED ASSETS ONLY (the discovery lane, 2026-07-27) — the token's
   * contract and its own decimals, both read off the chain. They are the only
   * reason a browser can render an asset nobody registered: the decimals scale
   * the figure, and the address is what the row is CALLED whenever the symbol
   * claims a name that is already ours. null on curated and native rows.
   *
   * ADDRESS-EMISSION: this is a TOKEN CONTRACT, not a person — public by
   * definition, exactly like the contract addresses already published on
   * /contracts. No wallet is involved.
   */
  readonly assetContract: string | null;
  readonly assetDecimals: number | null;
  /** Exact raw base units — public per the Visibility Rule. */
  readonly amountRaw: string;
  readonly movement: "in" | "out" | "internal";
  /** A LABEL ("the vault" / "the liquidity wallet" / "the operations
   *  wallet") — never an address; external counterparties never named. */
  readonly organLabel: string;
  readonly toOrganLabel: string | null;
  /**
   * A1 (founder funding doctrine, 2026-07-22 — deliberate whitelist
   * amendment): true when the move's counterparty is a FOUNDER wallet
   * (in: advanced by the Founder; out: returned to the Founder). A boolean
   * label only — no address, no new identity surface.
   */
  readonly counterpartFounder: boolean;
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

// ── H2-⑰ — capital-axis rises (the witness pattern; LINE-ON-RISE only —
// the base rung is the seat's birth state; the rung title is recognition,
// never a benefit; the line never carries the cumulative amount) ────────────
export interface PublicCapitalLine extends LineCommon {
  readonly kind: "capital-rise";
  /** The seat whose footprint rose (public ordinal). */
  readonly seatNumber: number;
  /** The rung reached (founder-named canon title — recognition only). */
  readonly rung: string;
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
  | PublicEraLine
  | PublicCapitalLine;

/** H2-⑬ — the /activity Milestones panel block (address-safe by shape). */
export interface PublicMilestones {
  /** Sealed crossings, oldest first — each IS a feed line with its anchor. */
  readonly sealed: readonly PublicMilestoneLine[];
  /** M-EVO-1: the NEXT unsealed rung per (family, kind) lane — honest
   *  progress from the indexed history, one bar per ladder. */
  readonly approaching: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: MilestoneKind;
    readonly family: MilestoneFamily;
    readonly target: number;
    readonly currentSeats: number | null;
    readonly currentUsdcRaw: string | null;
    readonly currentCount: number | null;
    readonly currentSynRaw: string | null;
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
    /** H2-⑰: capital-axis rises (per-seat footprint recognition). */
    readonly capital: boolean;
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
  /** H2-⑰: the capital-axis model (null = dark). */
  readonly capitalModel: CapitalBuildResult | null;
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
 * The SAME value, unshortened — the public full address (address law
 * 2026-07-24/25). Deliberately shares shortForm’s fail-closed validation so
 * the two can never disagree about what an address is: one malformed value
 * throws for both rather than serializing a half-truth. Lowercased, because
 * the client compares it to the short form it renders beside.
 */
function fullForm(address: string | null): string | null {
  if (address === null) return null;
  if (!/^0x[0-9a-f]{40}$/.test(address)) {
    throw new Error(
      "feed projection failed closed: an actor is not a lowercased full address (value withheld)",
    );
  }
  return address;
}

/**
 * Build the public feed from the backbone's last-good models. Fail-closed:
 * any malformed anchor, amount, or label throws. Null models (dark / parked /
 * no successful cycle yet) serve an honest empty feed — never an invented one.
 */
export function buildPublicFeed(source: FeedSource): PublicActivityFeed {
  return buildPublicFeedWithLines(source).feed;
}

/**
 * M-EVO hardening (adversarial verify, 2026-07-22): the WHOLE projected
 * line set travels beside the capped feed — the A2 route's pagination and
 * whole-history counts speak from `allLines`, never from the newest-100
 * window (the one-authority rule: a payload must never contradict itself
 * once the history outgrows the cap).
 */
export function buildPublicFeedWithLines(source: FeedSource): {
  feed: PublicActivityFeed;
  allLines: PublicFeedLine[];
} {
  const { model, protocolModel, milestoneModel, eraModel, capitalModel } =
    source;

  // ── FIRST SEAT IS DECIDED BY THE SEAT NUMBER, NOT BY THE EVENT FLAG ────────
  // (Founder ruling 2026-07-26, and the Chronicle's "The duplicate seat" is the
  // authority behind it.)
  //
  // THE DEFECT: `item.firstSeatBucket` is whatever the SALE EVENT emitted, and
  // the old V1/V2 engines emitted nothing — so 5 of 26 purchases carried
  // "unknown". Downstream that made the Seats lane hold 17 rows while the live
  // engine reports 14 seats: the page disagreed with itself by 3.
  //
  // THE AUTHORITY: a purchase that takes a seat NUMBER not yet seen is an
  // acquisition; a repeat on a number already issued is a footprint expansion.
  // The seat key is the member number, and for the pre-numbering rows the wallet
  // itself — which is enough, because those rows predate seat numbering entirely.
  //
  // WHY NOT "the first purchase per WALLET", which is the tempting shortcut: it
  // would have ERASED historical seat #7. One wallet legitimately holds #7 AND
  // #11 — the unclaimed historical seat bought through the active engine and was
  // issued a second number, permanently, and #7 now stands empty forever. Keying
  // on the seat NUMBER counts both, which is exactly the rounding-away the
  // Chronicle record forbids: "it did not edit the number, it did not quietly
  // reconcile the count".
  //
  // Ordered by (block, logIndex) so "earliest" is chain order, never array order.
  // A row whose seat key cannot be resolved KEEPS its served bucket — an honest
  // unknown is never promoted to a claim.
  //
  // THE NAMESPACE JOIN (2026-07-27) — why a numberless row still keys `n:`.
  // The seat key USED to fall straight through to `w:<wallet>` whenever the row
  // carried no member number, which put the pre-numbering V1 rows of historical
  // members #1 and #2 in a namespace of their own — separate from the very seat
  // numbers they hold. Two key spaces for one seat is a defect CLASS, not a
  // case: any row that later arrives carrying the real number keys `n:1`, a key
  // never seen before, and the earliest-per-key rule declares a first seat for a
  // wallet that entered at block 87,158,947.
  //
  // `GENESIS_SEAT_BY_WALLET` is the Merkle-frozen roster the runner already
  // joins on in three other read-models; resolving through it collapses the two
  // spaces into one. The `w:` branch survives for a numberless row whose wallet
  // is NOT in the frozen roster — it is the honest fallback, never a merge.
  //
  // SERVER-ONLY, and it stays that way: the map is read to RESOLVE a key, and
  // what leaves is a seat number the chain already published. No wallet from the
  // roster enters a served payload (ADR-003 + the envelope's own checks).
  //
  // ZERO-DIFF on today's rows and that is the point: every genesis wallet's rows
  // are numberless today, so `w:<wallet>` and `n:<seat>` group them identically.
  // The join changes nothing now and removes the class before it can fire.
  const seatKeyOf = (item: {
    memberNumber: number | null;
    memberAddress: string | null;
  }): string | null => {
    if (item.memberNumber !== null && item.memberNumber > 0) {
      return `n:${item.memberNumber}`;
    }
    if (item.memberAddress === null) return null;
    const wallet = item.memberAddress.toLowerCase();
    const genesisSeat = GENESIS_SEAT_BY_WALLET.get(wallet);
    return genesisSeat !== undefined ? `n:${genesisSeat}` : `w:${wallet}`;
  };
  const earliestBySeatKey = new Map<string, string>();
  for (const item of [...(model?.items ?? [])].sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  )) {
    const key = seatKeyOf(item);
    if (key === null || earliestBySeatKey.has(key)) continue;
    earliestBySeatKey.set(key, `${item.blockNumber}:${item.logIndex}`);
  }
  const derivedBucket = (item: {
    memberNumber: number | null;
    memberAddress: string | null;
    blockNumber: number;
    logIndex: number;
    firstSeatBucket: FirstSeatBucket;
  }): FirstSeatBucket => {
    // AN EXPLICIT NEGATIVE IS NEVER OVERRIDDEN (closing-review catch, 2026-07-26,
    // confirmed by replaying the live payload and then injecting the trigger).
    //
    // THE DEFECT THIS CLOSES, and it is the mirror image of the one this very
    // derivation was written to fix. The claim gate is LIVE on /join and tells
    // the two historical members whose rows carry no number to claim their seat
    // — and the purchase that follows emits their REAL number. If that row were
    // read as a new seat, the feed would publish "Member #1 … entered the public
    // registry" for a wallet that entered at block 87,158,947: a chain-refutable
    // claim (business red line ②), on the page whose whole job is proof, and the
    // Seats lane would read 15 rows against a chip showing the engine's 14.
    //
    // TWO INDEPENDENT DEFENCES, deliberately (2026-07-27). `seatKeyOf` now joins
    // the frozen roster, so that row keys `n:1` — the same key its own V1 rows
    // key — and is a repeat by arithmetic, even if the engine says nothing. This
    // rule is the second: an engine that SPEAKS is never overruled, whatever the
    // key resolves to. The join removes the class; this keeps the contract's own
    // word final. Neither is redundant — the join cannot help a wallet outside
    // the roster, and this rule cannot help a row the engine left silent.
    //
    // The sale event's own negative flag is the strongest signal that exists — it
    // comes from the contract that issued the seat. Deriving is for rows the old
    // engines left SILENT, never for overruling one that spoke. Measured on
    // today's 26 live rows this guard is zero-diff (14 true / 12 false either
    // way), so it costs nothing now and prevents the claim later.
    if (item.firstSeatBucket === "false") return "false";
    const key = seatKeyOf(item);
    if (key === null) return item.firstSeatBucket;
    return earliestBySeatKey.get(key) === `${item.blockNumber}:${item.logIndex}`
      ? "true"
      : "false";
  };

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
      // DERIVED from the seat number (see above), not the event flag.
      firstSeatBucket: derivedBucket(item),
      routedFolded: item.routedFolded,
      // H2-P: the event's own public identity facts, short form only.
      memberNumber: item.memberNumber,
      memberShort: shortForm(item.memberAddress),
      memberAddress: fullForm(item.memberAddress),
      referred: item.referredBySource,
      // Override A: the referrer is the proud party — same event, no join.
      referredByShort: shortForm(item.referrerAddress),
      referredByAddress: fullForm(item.referrerAddress),
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
        actorClass: b.actorClass,
        actorOrganLabel: b.actorOrganLabel,
        // H2-P + the founder voice rule: the founder's acts say the founder;
        // Community pride carries the short form.
        actorShort:
          b.senderLabel === "Community" ? shortForm(b.actorAddress) : null,
        actorAddress:
          b.senderLabel === "Community" ? fullForm(b.actorAddress) : null,
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
      actorAddress:
        p.actorLabel === "Community" ? fullForm(p.actorAddress) : null,
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
      minterAddress: fullForm(a.minterAddress),
      minterLabel: a.minterLabel,
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
      assetContract: t.assetContract,
      assetDecimals: t.assetDecimals,
      amountRaw: t.amountRaw,
      movement: t.movement,
      organLabel: t.organLabel,
      toOrganLabel: t.toOrganLabel,
      counterpartFounder: t.counterpartFounder,
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
          family: a.family,
          target: a.target,
          currentSeats: a.currentSeats,
          currentUsdcRaw: a.currentUsdcRaw,
          // M-EVO-1: act-ladder counts + the cumulative-SYN walk (clean
          // decimals only — the builder failed closed upstream otherwise).
          currentCount: a.currentCount,
          currentSynRaw: a.currentSynRaw,
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

  // ── H2-⑰ — capital-axis rises (footprint recognition; rung title only) ──
  const capitalLines: PublicCapitalLine[] = (capitalModel?.rises ?? []).map(
    (r) => {
      assertAnchor(r.transactionHash);
      if (!Number.isSafeInteger(r.seatNumber) || r.seatNumber < 1) {
        throw new Error(
          "feed projection failed closed: a capital rise carries no clean seat ordinal (value withheld)",
        );
      }
      if (typeof r.rung !== "string" || r.rung.length === 0 || /0x[0-9a-fA-F]{6,}/.test(r.rung)) {
        throw new Error(
          "feed projection failed closed: a capital rung title is malformed (value withheld)",
        );
      }
      return {
        kind: "capital-rise" as const,
        seatNumber: r.seatNumber,
        rung: r.rung,
        blockNumber: r.blockNumber,
        blockTimestampSec: r.blockTimestampSec,
        isoDayUtc: r.isoDayUtc,
        transactionHash: r.transactionHash,
        logIndex: r.logIndex,
      };
    },
  );

  // Derived kinds share their anchor with the event that crossed/witnessed
  // them; in the newest-first feed the crossing reads as the CONSEQUENCE —
  // the derived line ranks newer than its underlying event (the tie-break
  // law, H2-⑬; the era and capital lines join the same rank).
  const derivedRank = (k: PublicFeedLine["kind"]): number =>
    k === "milestone" || k === "era-transition" || k === "capital-rise" ? 1 : 0;

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
    ...capitalLines,
  ].sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? b.blockNumber - a.blockNumber
      : a.logIndex !== b.logIndex
        ? b.logIndex - a.logIndex
        : derivedRank(b.kind) - derivedRank(a.kind),
  );
  const items = allLines.slice(0, FEED_MAX_ITEMS);

  const feed: PublicActivityFeed = {
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
      capital: capitalModel !== null,
    },
    honesty: FEED_HONESTY_LINE,
    items,
    burnLedger,
    milestones,
  };
  return { feed, allLines };
}

/**
 * A2 page slicing as a PURE function (extracted on the adversarial verify's
 * finding, 2026-07-22 — inline express logic had zero behavioral coverage;
 * the guard now fixture-pins THIS).
 * Contract: `lines` newest-first; `cursor` = the previous page's last
 * (blockNumber, logIndex) — the page starts strictly OLDER; pages are
 * CLUSTER-CLOSED (lines sharing (blockNumber, logIndex) never split across
 * a boundary, so a derived crossing stays with its underlying event and a
 * prepend between requests can never skip or repeat a line).
 */
export function sliceFeedPage(
  lines: readonly PublicFeedLine[],
  limit: number,
  cursor: { blockNumber: number; logIndex: number } | null,
): {
  pageItems: PublicFeedLine[];
  nextCursor: string | null;
} {
  let startIndex = 0;
  if (cursor !== null) {
    startIndex = lines.findIndex(
      (i) =>
        i.blockNumber < cursor.blockNumber ||
        (i.blockNumber === cursor.blockNumber && i.logIndex < cursor.logIndex),
    );
    if (startIndex === -1) startIndex = lines.length;
  }
  let endIndex = Math.min(startIndex + limit, lines.length);
  while (
    endIndex > startIndex &&
    endIndex < lines.length &&
    lines[endIndex]!.blockNumber === lines[endIndex - 1]!.blockNumber &&
    lines[endIndex]!.logIndex === lines[endIndex - 1]!.logIndex
  ) {
    endIndex += 1;
  }
  const pageItems = lines.slice(startIndex, endIndex);
  const last = pageItems.length > 0 ? pageItems[pageItems.length - 1]! : null;
  return {
    pageItems,
    nextCursor:
      last !== null && endIndex < lines.length
        ? `${last.blockNumber}:${last.logIndex}`
        : null,
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
