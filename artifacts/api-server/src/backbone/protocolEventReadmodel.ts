/**
 * Protocol-Event Read-Model — PURE BUILDER (server-only, in-memory; M4-c).
 * -------------------------------------------------------------------------
 * Derives the burn ledger (Proof of Burn) + the referral-lifecycle lines from
 * the protocol-event lane + the Protocol Time cache. Pure: no db, no network,
 * no clock — inputs arrive as narrow projections mapped by the backbone DB
 * zone.
 *
 * The origin doctrine, carried (syn-burn-events.ts):
 *   - Proof-of-Burn numbers are 1-based, oldest first — #1 is the first burn
 *     ever. Numbering is valid ONLY over a gapless history; the backbone's
 *     cursor discipline makes persisted rows gapless BY CONSTRUCTION, so the
 *     builder numbers unconditionally — the origin's PARTIAL state cannot
 *     exist here (a failed chunk fails the cycle without advancing the
 *     cursor; a hole can never be persisted).
 *   - Founder vs Community is a LABEL derived from the known founder
 *     allocation wallet — the sender ADDRESS enters this builder and never
 *     leaves it: the output carries only the label.
 *
 * Fail closed: wrong shape, unknown lifecycle event, malformed amount, or a
 * missing verified block timestamp throws — never a guessed value.
 */

import type {
  RawBurnRowInput,
  RawLifecycleRowInput,
  RawLpLiquidityRowInput,
  RawLpTokenMintRowInput,
  RawArchiveMintRowInput,
  RawArchivePauseRowInput,
  RawTreasuryRowInput,
} from "./protocolEventScan";
import type { BlockTimestampInput } from "./activityHeartbeatReadmodel";
import { LADDER_RUNGS_CANON } from "../lib/protocol/connectorLadderCanon";

export type SenderLabel = "Founder" | "Community";

export interface BurnLedgerItem {
  /** 1-based Proof of Burn number, oldest first (#1 = the first burn ever). */
  readonly proofOfBurnNumber: number;
  /** Exact raw 18-decimal base units, decimal string (the amount IS the record). */
  readonly amountSynRaw: string;
  /** The sender, as a label ONLY — the address never leaves the server. */
  readonly senderLabel: SenderLabel;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

export type LifecycleKind =
  | "source-created"
  | "source-terms"
  | "source-status"
  | "source-wallet";

export interface LifecycleItem {
  readonly kind: LifecycleKind;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
  /**
   * H1a (⑧): on a source-terms row whose new rate matches a rate-raising
   * ladder rung, the rung's TITLE — the "a source rose to {rung}" fact.
   * Null on every other row. A title, never an address, never a bps echo.
   */
  readonly risenToTitle: string | null;
}

// ── H1a — the new public line shapes (labels and figures only) ──────────────
export interface LpLiquidityItem {
  readonly kind: "lp-add" | "lp-remove";
  /** token0 = SYN raw 18-dec; token1 = USDC raw 6-dec (the amount IS public). */
  readonly amountSynRaw: string;
  readonly amountUsdcRaw: string;
  /** Founder or Community — the burns precedent; the address never leaves. */
  readonly actorLabel: SenderLabel;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

export interface ArchiveMintItem {
  readonly kind: "archive-mint";
  /** Canon artifact label (First Signal / Patron Seal / Artifact #N). */
  readonly artifactLabel: string;
  readonly quantityRaw: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

export interface ArchivePauseItem {
  readonly kind: "archive-pause";
  readonly action: "paused" | "resumed";
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

// ── H2-⑦ — treasury movements (organ LABELS only; addresses never leave) ────
export interface TreasuryMoveItem {
  readonly kind: "treasury-move";
  readonly token: "USDC" | "SYN";
  /** Exact raw base units (USDC 6-dec / SYN 18-dec), decimal string. */
  readonly amountRaw: string;
  readonly movement: "in" | "out" | "internal";
  /** The organ the sentence names (out/internal: source; in: destination). */
  readonly organLabel: string;
  /** internal moves only: the destination organ. */
  readonly toOrganLabel: string | null;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

export interface ProtocolEventBuildInput {
  readonly expectedChainId: number;
  readonly burns: readonly RawBurnRowInput[];
  readonly lifecycle: readonly RawLifecycleRowInput[];
  readonly lpLiquidity: readonly RawLpLiquidityRowInput[];
  readonly lpTokenMints: readonly RawLpTokenMintRowInput[];
  readonly archiveMints: readonly RawArchiveMintRowInput[];
  readonly archivePauses: readonly RawArchivePauseRowInput[];
  /** H2-⑦: treasury transfer rows (organ set topic-filtered by the lane). */
  readonly treasury: readonly RawTreasuryRowInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
  /** Lowercased known founder wallet addresses (the allocation registry). */
  readonly founderAddresses: ReadonlySet<string>;
  /**
   * H2-⑦: lowercased organ address → its public LABEL ("the vault" /
   * "the liquidity wallet" / "the operations wallet"). The ONLY place organ
   * membership is decided; no address ever leaves the model.
   */
  readonly organLabelByAddress: ReadonlyMap<string, string>;
  /**
   * H2-⑦ THE FOLD LAW input: the sale lane's purchase transaction hashes
   * (lowercased). A treasury transfer whose transaction already carries a
   * first-class heartbeat line — a purchase (this set) or any of THIS
   * model's own lines (burn, lifecycle, lp, archive) — is ROUTING DETAIL of
   * that line: folded and counted, never a second line.
   */
  readonly saleTransactionHashes: ReadonlySet<string>;
  /**
   * H1a-fix: the pair's immutable token0 orientation (canon pin, chain-
   * verified). Persisted LP rows store NEUTRAL amount0/amount1; this input
   * decides which is SYN — never assumed.
   */
  readonly lpToken0IsSyn: boolean;
}

export interface ProtocolEventBuildResult {
  /** Oldest-first, numbered — the complete Proof of Burn record. */
  readonly burnLedger: readonly BurnLedgerItem[];
  readonly lifecycleItems: readonly LifecycleItem[];
  readonly lpItems: readonly LpLiquidityItem[];
  readonly archiveMintItems: readonly ArchiveMintItem[];
  readonly archivePauseItems: readonly ArchivePauseItem[];
  /** H2-⑦: genuine treasury acts (post-Fold-Law; routing detail excluded). */
  readonly treasuryItems: readonly TreasuryMoveItem[];
  readonly totals: {
    readonly burns: number;
    readonly lifecycle: number;
    readonly lp: number;
    readonly archiveMints: number;
    readonly archivePauses: number;
    readonly treasuryMoves: number;
    /** Treasury rows folded as routing detail of narrated transactions. */
    readonly treasuryRowsFolded: number;
  };
}

const LIFECYCLE_KIND_BY_EVENT: Record<string, LifecycleKind> = {
  SourceCreated: "source-created",
  SourceTermsUpdated: "source-terms",
  SourceStatusChanged: "source-status",
  // H1a (⑯): wallet rotations — public administrative acts, one kind.
  SourceWalletUpdated: "source-wallet",
  SourcePayoutWalletUpdated: "source-wallet",
};

/** Canon artifact labels (the archive ID registry's public names). */
const ARTIFACT_LABEL_BY_ID: Record<number, string> = {
  1: "First Signal",
  3: "Patron Seal",
};

/**
 * bps → the rate-raising rung it lands on exactly; null when not a rung.
 * The BASE rung (threshold 0) never reads as a "rise" — creation terms at the
 * base rate are a birth, not a promotion.
 */
function rungTitleForBps(bps: number | null | undefined): string | null {
  if (typeof bps !== "number") return null;
  const rung = LADDER_RUNGS_CANON.find(
    (r) => r.raisesRate && r.bps === bps && r.durableThreshold > 0,
  );
  return rung ? rung.title : null;
}

function fail(message: string): never {
  // Never echo addresses, hashes, or decoded material.
  throw new Error(`protocol-event build failed closed: ${message}`);
}

/** Chain-verified epoch seconds → UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

export function buildProtocolEventReadModel(
  input: ProtocolEventBuildInput,
): ProtocolEventBuildResult {
  const { burns, lifecycle, blockTimestamps, founderAddresses } = input;

  const tsByBlock = new Map<number, number>();
  for (const t of blockTimestamps) {
    if (t.chainId !== input.expectedChainId) {
      fail(`block timestamp on unexpected chain ${t.chainId}`);
    }
    const existing = tsByBlock.get(t.blockNumber);
    if (existing !== undefined && existing !== t.blockTimestampSec) {
      fail("conflicting verified timestamps for one block");
    }
    tsByBlock.set(t.blockNumber, t.blockTimestampSec);
  }
  const timeOf = (blockNumber: number): number => {
    const ts = tsByBlock.get(blockNumber);
    if (ts === undefined) {
      fail("a row's block has no verified timestamp in the Protocol Time cache");
    }
    return ts;
  };

  // ── Burn ledger: oldest first, numbered #1..N (gapless by construction) ──
  const orderedBurns = [...burns].sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  );
  const burnLedger: BurnLedgerItem[] = orderedBurns.map((b, i) => {
    if (!/^[0-9]+$/.test(b.valueRaw)) fail("burn amount is not a clean integer");
    if (!/^0x[0-9a-fA-F]{40}$/.test(b.fromAddress)) {
      fail("burn sender is not address-shaped");
    }
    const ts = timeOf(b.blockNumber);
    return {
      proofOfBurnNumber: i + 1,
      amountSynRaw: b.valueRaw,
      senderLabel: founderAddresses.has(b.fromAddress.toLowerCase())
        ? "Founder"
        : "Community",
      blockNumber: b.blockNumber,
      logIndex: b.logIndex,
      transactionHash: b.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    };
  });

  // ── Lifecycle lines (the §8 sentences are fixed; only facts travel) ──
  const lifecycleItems: LifecycleItem[] = lifecycle.map((l) => {
    const kind = LIFECYCLE_KIND_BY_EVENT[l.eventName];
    if (!kind) fail(`unknown lifecycle event "${l.eventName}"`);
    const ts = timeOf(l.blockNumber);
    return {
      kind,
      blockNumber: l.blockNumber,
      logIndex: l.logIndex,
      transactionHash: l.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
      risenToTitle:
        l.eventName === "SourceTermsUpdated" ? rungTitleForBps(l.commissionBps) : null,
    };
  });

  // ── H1a ⑤⑥ — liquidity lines with the Founder/Community label ──
  // A pool Mint's depositor is identified by the SAME-TX LP-token mint
  // (pair Transfer from 0x0 → depositor); a Burn carries its withdrawer on
  // the event itself. Fail-closed: an unidentifiable actor is a fault —
  // the label is never guessed.
  const depositorByTx = new Map<string, string>();
  for (const t of input.lpTokenMints) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(t.depositor)) fail("lp depositor not address-shaped");
    depositorByTx.set(t.transactionHash.toLowerCase(), t.depositor.toLowerCase());
  }
  const labelOf = (address: string | null | undefined): SenderLabel => {
    if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      fail("liquidity actor is not address-shaped");
    }
    return founderAddresses.has(address.toLowerCase()) ? "Founder" : "Community";
  };
  const lpItems: LpLiquidityItem[] = input.lpLiquidity.map((p) => {
    if (!/^[0-9]+$/.test(p.amount0Raw) || !/^[0-9]+$/.test(p.amount1Raw)) {
      fail("lp amount is not a clean integer");
    }
    const ts = timeOf(p.blockNumber);
    const actor =
      p.eventName === "Mint"
        ? depositorByTx.get(p.transactionHash.toLowerCase())
        : p.withdrawer;
    return {
      kind: p.eventName === "Mint" ? "lp-add" : "lp-remove",
      // Orientation is the PINNED canon fact — never an assumption (the
      // H1a-fix lesson: the real pair's token0 is USDC).
      amountSynRaw: input.lpToken0IsSyn ? p.amount0Raw : p.amount1Raw,
      amountUsdcRaw: input.lpToken0IsSyn ? p.amount1Raw : p.amount0Raw,
      actorLabel: labelOf(actor),
      blockNumber: p.blockNumber,
      logIndex: p.logIndex,
      transactionHash: p.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    };
  });

  // ── H1a ⑪ — artifact mints (protocol memory; the minter never enters) ──
  const archiveMintItems: ArchiveMintItem[] = input.archiveMints.map((a) => {
    if (!/^[0-9]+$/.test(a.quantityRaw)) fail("archive mint quantity is not a clean integer");
    const ts = timeOf(a.blockNumber);
    return {
      kind: "archive-mint",
      artifactLabel: ARTIFACT_LABEL_BY_ID[a.artifactId] ?? `Artifact #${a.artifactId}`,
      quantityRaw: a.quantityRaw,
      blockNumber: a.blockNumber,
      logIndex: a.logIndex,
      transactionHash: a.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    };
  });

  // ── H1a ⑨ — ceremonial pause/unpause (founder-signed public acts) ──
  const archivePauseItems: ArchivePauseItem[] = input.archivePauses.map((c) => {
    const ts = timeOf(c.blockNumber);
    return {
      kind: "archive-pause",
      action: c.eventName === "Paused" ? "paused" : "resumed",
      blockNumber: c.blockNumber,
      logIndex: c.logIndex,
      transactionHash: c.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    };
  });

  // ── H2-⑦ — treasury movements under THE FOLD LAW ──
  // The narrated set: every transaction already carrying a first-class
  // heartbeat line — the sale lane's purchases (input) plus THIS model's own
  // burn / lifecycle / lp / archive lines. A treasury transfer inside such a
  // transaction is that line's routing detail: folded, counted, never a
  // second line. Structural, not a filter list — every future narrated class
  // added to this union folds its own routing side-effects automatically.
  const narratedTxs = new Set<string>();
  for (const h of input.saleTransactionHashes) narratedTxs.add(h.toLowerCase());
  for (const x of burnLedger) narratedTxs.add(x.transactionHash.toLowerCase());
  for (const x of lifecycleItems) narratedTxs.add(x.transactionHash.toLowerCase());
  for (const x of lpItems) narratedTxs.add(x.transactionHash.toLowerCase());
  for (const x of archiveMintItems) narratedTxs.add(x.transactionHash.toLowerCase());
  for (const x of archivePauseItems) narratedTxs.add(x.transactionHash.toLowerCase());

  let treasuryRowsFolded = 0;
  const treasuryItems: TreasuryMoveItem[] = [];
  for (const t of input.treasury) {
    if (!/^[0-9]+$/.test(t.valueRaw)) fail("treasury amount is not a clean integer");
    if (
      !/^0x[0-9a-fA-F]{40}$/.test(t.fromAddress) ||
      !/^0x[0-9a-fA-F]{40}$/.test(t.toAddress)
    ) {
      fail("treasury endpoint is not address-shaped");
    }
    if (narratedTxs.has(t.transactionHash.toLowerCase())) {
      treasuryRowsFolded += 1;
      continue;
    }
    const fromOrgan = input.organLabelByAddress.get(t.fromAddress.toLowerCase()) ?? null;
    const toOrgan = input.organLabelByAddress.get(t.toAddress.toLowerCase()) ?? null;
    if (fromOrgan === null && toOrgan === null) {
      // The stream's topic filter guarantees organ membership — a row with
      // neither endpoint in the organ set is a derivation fault.
      fail("treasury row touches no known organ");
    }
    const ts = timeOf(t.blockNumber);
    treasuryItems.push({
      kind: "treasury-move",
      token: t.token,
      amountRaw: t.valueRaw,
      movement: fromOrgan !== null && toOrgan !== null ? "internal" : fromOrgan !== null ? "out" : "in",
      organLabel: fromOrgan ?? (toOrgan as string),
      toOrganLabel: fromOrgan !== null && toOrgan !== null ? toOrgan : null,
      blockNumber: t.blockNumber,
      logIndex: t.logIndex,
      transactionHash: t.transactionHash,
      blockTimestampSec: ts,
      isoDayUtc: isoDayUtcFromSeconds(ts),
    });
  }
  treasuryItems.sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  );

  return {
    burnLedger,
    lifecycleItems,
    lpItems,
    archiveMintItems,
    archivePauseItems,
    treasuryItems,
    totals: {
      burns: burnLedger.length,
      lifecycle: lifecycleItems.length,
      lp: lpItems.length,
      archiveMints: archiveMintItems.length,
      archivePauses: archivePauseItems.length,
      treasuryMoves: treasuryItems.length,
      treasuryRowsFolded,
    },
  };
}
