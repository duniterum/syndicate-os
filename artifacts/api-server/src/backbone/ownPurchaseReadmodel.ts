/**
 * Own-Purchase Read-Model — PURE BUILDER (server-only, in-memory; D-TRUTH D3).
 * ---------------------------------------------------------------------------
 * The member's OWN purchase history: every indexed purchase row keyed by its
 * public actor's wallet, so the auth zone can serve a session's own rows —
 * date · gross USDC amount · verify anchor. ADR-003 §3 own-row discipline:
 * the wallet key exists ONLY server-side (the auth route matches the
 * session's own bound account and emits rows WITHOUT the wallet); no lookup
 * surface for arbitrary wallets exists.
 *
 * One derivation, one truth: the fold walks the SAME gapless purchase lane
 * as the milestones/capital walk (RawSaleEventInput — the loader's
 * whitelisted projection; no second decodedJson reader is born). The actor
 * is the loader's memberAddress (V3 recipient — the seat's holder — else
 * the buyer): exactly the capital walk's attribution semantics.
 *
 * Purity: no db, no network, no clock. Fail closed on malformed amounts.
 */

import {
  PURCHASE_EVENT_BY_GENERATION,
  type BlockTimestampInput,
  type RawSaleEventInput,
  type SaleGeneration,
} from "./activityHeartbeatReadmodel";

export interface OwnPurchaseRow {
  /** UTC calendar day of the purchase (chain-verified block timestamp). */
  readonly isoDayUtc: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** The purchase's own 64-hex verify anchor. */
  readonly transactionHash: string;
  /** The purchase's own PUBLIC gross USDC (6-dec raw decimal string). */
  readonly usdcGrossRaw: string;
  /** Engine generation — a public protocol parameter (V1 · V2A · V2B · V3). */
  readonly generation: string;
}

export interface OwnPurchaseBuildInput {
  readonly expectedChainId: number;
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
}

export interface OwnPurchaseBuildResult {
  /** SERVER-ONLY: lowercase actor wallet → own rows, newest first. */
  readonly rowsByWallet: ReadonlyMap<string, readonly OwnPurchaseRow[]>;
}

function fail(message: string): never {
  throw new Error(`own-purchase build failed closed: ${message}`);
}

/** Format chain-verified epoch seconds as a UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

export function buildOwnPurchaseReadModel(
  input: OwnPurchaseBuildInput,
): OwnPurchaseBuildResult {
  const { expectedChainId, rawEvents, blockTimestamps } = input;

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

  const rowsByWallet = new Map<string, OwnPurchaseRow[]>();
  for (const e of rawEvents) {
    if (e.chainId !== expectedChainId) {
      fail(`raw event on unexpected chain ${e.chainId} (expected ${expectedChainId})`);
    }
    const gen = e.generation as SaleGeneration;
    if (!(gen in PURCHASE_EVENT_BY_GENERATION)) {
      fail(`unknown sale generation "${e.generation}"`);
    }
    if (e.eventName !== PURCHASE_EVENT_BY_GENERATION[gen]) continue; // routing rows are not purchases
    // A purchase row without its public actor (a malformed early decode)
    // simply cannot be an own-row — skipped, never guessed onto a wallet.
    if (e.memberAddress === null) continue;
    if (e.usdcGrossRaw === null || !/^[0-9]+$/.test(e.usdcGrossRaw)) {
      fail("a purchase row carries no clean USDC amount — the own-row fold refuses to guess");
    }
    const ts = tsByBlock.get(e.blockNumber);
    if (ts === undefined) {
      fail("a purchase block has no verified timestamp in the Protocol Time cache");
    }
    const key = e.memberAddress.toLowerCase();
    const rows = rowsByWallet.get(key) ?? [];
    rows.push({
      isoDayUtc: isoDayUtcFromSeconds(ts),
      blockNumber: e.blockNumber,
      logIndex: e.logIndex,
      transactionHash: e.transactionHash,
      usdcGrossRaw: e.usdcGrossRaw,
      generation: e.generation,
    });
    rowsByWallet.set(key, rows);
  }

  // Newest first — the display order (the receipt list reads downward in time).
  for (const rows of rowsByWallet.values()) {
    rows.sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? b.blockNumber - a.blockNumber
        : b.logIndex - a.logIndex,
    );
  }

  return { rowsByWallet };
}
