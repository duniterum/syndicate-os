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
} from "./protocolEventScan";
import type { BlockTimestampInput } from "./activityHeartbeatReadmodel";

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

export type LifecycleKind = "source-created" | "source-terms" | "source-status";

export interface LifecycleItem {
  readonly kind: LifecycleKind;
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
  readonly blockTimestamps: readonly BlockTimestampInput[];
  /** Lowercased known founder wallet addresses (the allocation registry). */
  readonly founderAddresses: ReadonlySet<string>;
}

export interface ProtocolEventBuildResult {
  /** Oldest-first, numbered — the complete Proof of Burn record. */
  readonly burnLedger: readonly BurnLedgerItem[];
  readonly lifecycleItems: readonly LifecycleItem[];
  readonly totals: {
    readonly burns: number;
    readonly lifecycle: number;
  };
}

const LIFECYCLE_KIND_BY_EVENT: Record<string, LifecycleKind> = {
  SourceCreated: "source-created",
  SourceTermsUpdated: "source-terms",
  SourceStatusChanged: "source-status",
};

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
    };
  });

  return {
    burnLedger,
    lifecycleItems,
    totals: { burns: burnLedger.length, lifecycle: lifecycleItems.length },
  };
}
