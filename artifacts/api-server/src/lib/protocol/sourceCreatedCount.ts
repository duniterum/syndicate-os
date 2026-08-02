/**
 * The ONE "referral sources created on-chain" count (2026-08-02).
 * ---------------------------------------------------------------------------
 * Counts indexed SourceCreated events from the SOURCE_LIFECYCLE lane — the
 * founder-signed registry acts, chain truth, including zero-purchase sources
 * (the class every narrower universe misses). Canon-chain scoped. Imported by
 * the member-ledger totals AND the per-source performance payload so the
 * dashboard tile and the panel behind its door can never quote two different
 * authorities for the same words (the 12-vs-14 lesson, then the 5-vs-1).
 * Semantic note, deliberately visible to callers: this is CREATED-EVER — a
 * revoked source still counts. Whether the surfaces should instead show
 * "active now" is the founder's open decision (2026-08-02 review, finding 4).
 */

import { CHAIN_REGISTRY } from "../../canon/the-syndicate/chain/chain-registry";
import type { RpcTransport } from "./rpcTransport";

export async function countSourcesCreated(): Promise<number> {
  const { pool } = await import("@workspace/db");
  const res = await pool.query(
    `select count(*)::int as count from protocol_event_raw where chain_id = $1 and stream_key = 'SOURCE_LIFECYCLE' and event_name = 'SourceCreated'`,
    [CHAIN_REGISTRY.id],
  );
  return Number(res.rows[0]?.count ?? 0);
}

// ---------------------------------------------------------------------------
// THE SOURCE ROSTER (2026-08-02, the founder's delegation: « do your best »).
// One on-chain roster for "which sources exist": every SourceCreated event,
// with owner wallet and the latest folded status. The store keeps only
// topic0 + an empty decode for lifecycle rows, so the detail comes the
// chain-reading-law way (§③ verbatim): THE INDEX SAYS WHERE TO LOOK — the
// stored (tx, logIndex) pairs — and OUR NODE SAYS WHAT IS THERE — a handful
// of immutable receipts, fetched once and cached for the process lifetime.
// ABI facts (sale-abi.ts, transcribed verbatim): SourceCreated topics =
// [sig, sourceId, sourceWallet, sourceClass], data word1 = initial status;
// SourceStatusChanged topics = [sig, sourceId], data word1 = newStatus.
// ---------------------------------------------------------------------------

export interface SourceRosterRow {
  /** 64-hex source id (no 0x prefix stripped — the panel's own form). */
  readonly sourceIdHex: string;
  /** The owner wallet from the creation event (lowercase). */
  readonly ownerWallet: string;
  /** Latest folded status number (1 ACTIVE · 2 PAUSED · 3 REVOKED), or
   * null when a receipt could not be read (said, never invented). */
  readonly status: number | null;
  readonly createdBlock: number;
}

interface ReceiptLogLite {
  readonly logIndex: number;
  readonly topics: readonly string[];
  readonly data: string;
}

/** Immutable receipts, fetched once per process (read once, hold forever). */
const receiptCache = new Map<string, ReceiptLogLite[]>();

async function receiptLogs(
  transport: RpcTransport,
  txHash: string,
): Promise<ReceiptLogLite[] | null> {
  const cached = receiptCache.get(txHash);
  if (cached !== undefined) return cached;
  try {
    const receipt = (await transport("eth_getTransactionReceipt", [txHash])) as {
      logs?: readonly { logIndex?: string; topics?: readonly string[]; data?: string }[];
    } | null;
    if (receipt === null || !Array.isArray(receipt.logs)) return null;
    const logs: ReceiptLogLite[] = receipt.logs.map((l) => ({
      logIndex: Number.parseInt(String(l.logIndex ?? "-0x1"), 16),
      topics: Array.isArray(l.topics) ? l.topics : [],
      data: typeof l.data === "string" ? l.data : "0x",
    }));
    receiptCache.set(txHash, logs);
    return logs;
  } catch {
    return null; // transport miss — the caller degrades honestly
  }
}

function topicToSourceId(topic: string | undefined): string | null {
  if (typeof topic !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(topic)) return null;
  return topic.toLowerCase();
}

function topicToAddress(topic: string | undefined): string | null {
  if (typeof topic !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(topic)) return null;
  return `0x${topic.slice(-40).toLowerCase()}`;
}

/** Data word at index i (32-byte words after 0x) as a small uint, or null. */
function dataWordUint(data: string, i: number): number | null {
  const start = 2 + i * 64;
  const word = data.slice(start, start + 64);
  if (!/^[0-9a-fA-F]{64}$/.test(word)) return null;
  const n = Number.parseInt(word, 16);
  return Number.isSafeInteger(n) ? n : null;
}

/**
 * Fold the full roster from the store's lifecycle rows + their receipts.
 * Fail-open per row (a missing receipt leaves that fact null), fail-closed
 * as a whole only when the STORE read itself fails (throws to the caller).
 */
export async function readSourceRoster(
  transport: RpcTransport,
): Promise<SourceRosterRow[]> {
  const { pool } = await import("@workspace/db");
  const res = await pool.query(
    `select event_name, transaction_hash, log_index, block_number from protocol_event_raw where chain_id = $1 and stream_key = 'SOURCE_LIFECYCLE' and event_name in ('SourceCreated','SourceStatusChanged') order by block_number asc, log_index asc`,
    [CHAIN_REGISTRY.id],
  );
  const byId = new Map<
    string,
    { ownerWallet: string; status: number | null; createdBlock: number }
  >();
  for (const row of res.rows as {
    event_name: string;
    transaction_hash: string;
    log_index: number;
    block_number: string | number;
  }[]) {
    const logs = await receiptLogs(transport, row.transaction_hash);
    const log = logs?.find((l) => l.logIndex === Number(row.log_index)) ?? null;
    if (log === null) continue; // receipt unreadable — honest gap this pass
    const sourceId = topicToSourceId(log.topics[1]);
    if (sourceId === null) continue;
    if (row.event_name === "SourceCreated") {
      const owner = topicToAddress(log.topics[2]);
      if (owner === null) continue;
      byId.set(sourceId, {
        ownerWallet: owner,
        status: dataWordUint(log.data, 1),
        createdBlock: Number(row.block_number),
      });
    } else {
      const prev = byId.get(sourceId);
      if (prev !== undefined) {
        prev.status = dataWordUint(log.data, 1) ?? prev.status;
      }
    }
  }
  return [...byId.entries()].map(([sourceIdHex, v]) => ({
    sourceIdHex,
    ownerWallet: v.ownerWallet,
    status: v.status,
    createdBlock: v.createdBlock,
  }));
}
