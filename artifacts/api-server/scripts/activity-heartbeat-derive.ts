/**
 * Activity Heartbeat Read-Model — SERVER-ONLY DERIVE + REPORT RUNNER.
 * --------------------------------------------------------------------
 * Reads Part A (sale_event_raw) and the Protocol Time cache (block_timestamp)
 * with READ-ONLY selects, feeds the pure builder in
 * ./activity-heartbeat-readmodel.ts, verifies rebuild determinism, and prints
 * ONLY the address-safe report (counts, buckets, coverage, day-granularity
 * date range, pass/fail).
 *
 * HARD RULES:
 *   - No writes of any kind (no insert/update/delete, no table, no migration).
 *   - No RPC: chain truth was already verified by the founder-gated indexer
 *     and Protocol Time enrichment scripts; this runner adds no new network
 *     dependency.
 *   - decodedJson access is whitelisted to exactly {firstSeat, memberNumber};
 *     gated economics (referral/source fields) are never read.
 *   - Never print wallets, transaction hashes, member numbers, block numbers,
 *     decodedJson or rawJson.
 *   - Exit non-zero unless consistency + determinism + the block-hash
 *     cross-check are all green.
 */

import {
  buildActivityHeartbeatReadModel,
  toAddressSafeActivityReport,
  type ActivityBuildInput,
  type RawSaleEventInput,
  type BlockTimestampInput,
} from "./activity-heartbeat-readmodel";
import { assertAddressSafeJson } from "./member-continuity-readmodel";

/** Avalanche C-Chain — same expected chain the reality spine reconciles. */
const EXPECTED_CHAIN_ID = 43114;

function toInt(value: unknown, label: string): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (typeof n !== "number" || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`expected integer for ${label}`);
  }
  return n;
}

function toBool(value: unknown, label: string): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`expected boolean for ${label}`);
}

async function main(): Promise<void> {
  const db = await import("@workspace/db");
  const { asc, eq } = await import("drizzle-orm");

  // --- Part A: raw sale-event rows (read-only; whitelisted decoded fields) ---
  const rawRows = await db.db
    .select({
      chainId: db.saleEventRaw.chainId,
      generation: db.saleEventRaw.generation,
      eventName: db.saleEventRaw.eventName,
      blockNumber: db.saleEventRaw.blockNumber,
      logIndex: db.saleEventRaw.logIndex,
      blockHash: db.saleEventRaw.blockHash,
      transactionHash: db.saleEventRaw.transactionHash,
      decodedJson: db.saleEventRaw.decodedJson,
    })
    .from(db.saleEventRaw)
    .where(eq(db.saleEventRaw.chainId, EXPECTED_CHAIN_ID))
    .orderBy(asc(db.saleEventRaw.blockNumber), asc(db.saleEventRaw.logIndex));

  const strayChainCount = (
    await db.db
      .select({ chainId: db.saleEventRaw.chainId })
      .from(db.saleEventRaw)
  ).filter((r) => r.chainId !== EXPECTED_CHAIN_ID).length;
  if (strayChainCount > 0) {
    throw new Error(
      `sale_event_raw contains ${strayChainCount} row(s) on an unexpected chain — refusing to derive`,
    );
  }

  const rawEvents: RawSaleEventInput[] = rawRows.map((r) => {
    // decodedJson WHITELIST: exactly {firstSeat, memberNumber}. Nothing else
    // is read; gated economics never enter this model.
    const d = r.decodedJson as Record<string, unknown>;
    return {
      chainId: r.chainId,
      generation: r.generation,
      eventName: r.eventName,
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      transactionHash: r.transactionHash,
      firstSeat:
        "firstSeat" in d ? toBool(d.firstSeat, "decoded firstSeat") : null,
      memberNumber:
        "memberNumber" in d
          ? toInt(d.memberNumber, "decoded memberNumber")
          : null,
    };
  });

  // --- Protocol Time: verified block timestamps (read-only) ---
  const tsRows = await db.db
    .select({
      chainId: db.blockTimestamp.chainId,
      blockNumber: db.blockTimestamp.blockNumber,
      blockTimestampSec: db.blockTimestamp.blockTimestampSec,
      blockHash: db.blockTimestamp.blockHash,
    })
    .from(db.blockTimestamp)
    .where(eq(db.blockTimestamp.chainId, EXPECTED_CHAIN_ID))
    .orderBy(asc(db.blockTimestamp.blockNumber));

  const blockTimestamps: BlockTimestampInput[] = tsRows.map((t) => ({
    chainId: t.chainId,
    blockNumber: t.blockNumber,
    blockTimestampSec: t.blockTimestampSec,
  }));

  // --- Divergence-witness cross-check: raw block_hash ↔ cache block_hash ---
  const cacheHashByBlock = new Map<number, string>();
  for (const t of tsRows) {
    if (t.blockHash) cacheHashByBlock.set(t.blockNumber, t.blockHash);
  }
  let rowsWithBothHashes = 0;
  let divergedRows = 0;
  for (const r of rawRows) {
    const cacheHash = cacheHashByBlock.get(r.blockNumber);
    if (r.blockHash && cacheHash) {
      rowsWithBothHashes += 1;
      if (r.blockHash !== cacheHash) divergedRows += 1;
    }
  }
  if (divergedRows > 0) {
    throw new Error(
      `block-hash divergence between sale_event_raw and the Protocol Time cache on ${divergedRows} row(s) (hashes withheld) — refusing to derive`,
    );
  }

  const input: ActivityBuildInput = {
    expectedChainId: EXPECTED_CHAIN_ID,
    rawEvents,
    blockTimestamps,
  };

  // --- Build + determinism verification (rebuild + input-order independence) ---
  const first = buildActivityHeartbeatReadModel(input);
  const second = buildActivityHeartbeatReadModel(input);
  const shuffled: ActivityBuildInput = {
    ...input,
    rawEvents: [...rawEvents].reverse(),
    blockTimestamps: [...blockTimestamps].reverse(),
  };
  const third = buildActivityHeartbeatReadModel(shuffled);

  // Item-level comparisons happen in memory only — never serialized to output.
  const rebuildIdentical = JSON.stringify(first) === JSON.stringify(second);
  const orderIndependent = JSON.stringify(first) === JSON.stringify(third);

  const report = {
    ...toAddressSafeActivityReport(first),
    determinism: {
      rebuildIdentical,
      inputOrderIndependent: orderIndependent,
    },
    blockHashCrossCheck: {
      rowsWithBothHashes,
      diverged: divergedRows,
    },
    boundary:
      "INTERNAL READ-MODEL ONLY — no persistence, no route, no UI, no public projection; a public activity surface is a separate founder-gated slice.",
    persistenceDecision:
      "DEFERRED — derives in memory from Part A + Protocol Time; no table, no migration, no writes.",
  };

  const json = JSON.stringify(report, null, 2);
  assertAddressSafeJson(json);
  console.log(json);

  const ok = first.consistent && rebuildIdentical && orderIndependent;
  if (!ok) {
    console.error(
      "[FAIL] activity-heartbeat derive: consistency/determinism not fully green",
    );
    process.exit(1);
  }
  console.error(
    `activity-heartbeat derive: OK — ${first.totals.items} activity item(s) from ${first.totals.rawRowsConsidered} raw row(s) (${first.totals.routedRowsFolded} Routed folded), consistent, deterministic, nothing persisted.`,
  );
  await (await import("@workspace/db")).pool.end();
}

main().catch((err) => {
  // Never echo row/payload material — message only.
  console.error(`[FAIL] activity-heartbeat derive: ${(err as Error).message}`);
  process.exit(1);
});
