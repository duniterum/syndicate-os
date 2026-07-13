/**
 * Activity Heartbeat Read-Model — SERVER-ONLY DERIVE + REPORT RUNNER.
 * --------------------------------------------------------------------
 * Loads Part A (sale_event_raw) + the Protocol Time cache through the SHARED
 * backbone loader (src/backbone/backboneDb.ts — one loader, one decodedJson
 * whitelist, one divergence cross-check; M4-a), feeds the pure builder in
 * src/backbone/activityHeartbeatReadmodel.ts, verifies rebuild determinism,
 * and prints ONLY the address-safe report (counts, buckets, coverage,
 * day-granularity date range, pass/fail).
 *
 * HARD RULES:
 *   - No writes of any kind (no insert/update/delete, no table, no migration).
 *   - No RPC: chain truth was already verified by the indexer and the
 *     Protocol Time enrichment; this runner adds no new network dependency.
 *   - decodedJson access stays whitelisted to exactly {firstSeat,
 *     memberNumber} INSIDE the shared loader; gated economics are never read.
 *   - Never print wallets, transaction hashes, member numbers, block numbers,
 *     decodedJson or rawJson.
 *   - Exit non-zero unless consistency + determinism + the block-hash
 *     cross-check are all green.
 */

import {
  buildActivityHeartbeatReadModel,
  toAddressSafeActivityReport,
  type ActivityBuildInput,
} from "../src/backbone/activityHeartbeatReadmodel";
import { loadActivityHeartbeatInput } from "../src/backbone/backboneDb";
import { assertAddressSafeJson } from "../src/lib/protocol/addressSafety";

async function main(): Promise<void> {
  // Shared loader: read-only selects, decodedJson whitelist, stray-chain
  // refusal, raw↔cache block-hash divergence hard fail (hashes withheld).
  const { input, rowsWithBothHashes } = await loadActivityHeartbeatInput();

  // --- Build + determinism verification (rebuild + input-order independence) ---
  const first = buildActivityHeartbeatReadModel(input);
  const second = buildActivityHeartbeatReadModel(input);
  const shuffled: ActivityBuildInput = {
    ...input,
    rawEvents: [...input.rawEvents].reverse(),
    blockTimestamps: [...input.blockTimestamps].reverse(),
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
      diverged: 0, // the shared loader hard-fails on any divergence
    },
    boundary:
      "SERVER-INTERNAL READ-MODEL — the unattended backbone (M4-a) rebuilds it in memory and serves ONLY the address-safe aggregate report at /api/backbone/status; per-item public serving stays a separate founder-gated slice (M4-b).",
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
