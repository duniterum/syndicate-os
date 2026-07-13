/**
 * Event Backbone — INCREMENTAL Protocol Time enrichment (M4-a, founder GO).
 * --------------------------------------------------------------------------
 * After each unattended scan, every NEW raw block needs its chain-verified
 * timestamp in the block_timestamp cache (the read-model fails closed on a
 * missing timestamp). This is the incremental complement of the founder-gated
 * `protocol-time:enrich` replay:
 *
 *   - Scope: ONLY blocks present in sale_event_raw and MISSING from the
 *     cache. Already-cached blocks are never re-fetched here — the full
 *     re-verification replay stays the founder-gated script's job.
 *   - Same truth discipline, same shared core (src/lib/protocol/
 *     protocolTimeCore.ts): chain probe FIRST, header verified against the
 *     requested number, plausibility bounds, witness comparison against the
 *     raw index's block_hash — divergence is a HARD FAIL, nothing is
 *     "corrected".
 *   - Writes: INSERT into block_timestamp only (idempotent), via the
 *     backbone DB zone. Completeness is re-checked after the run;
 *     an uncached block remaining is a failed cycle, never a silent gap.
 */

import { EXPECTED_CHAIN_ID, type RpcTransport } from "../lib/protocol/rpcTransport";
import { ethGetBlockByNumber, probeChain } from "../lib/protocol/evmRead";
import {
  checkPlausibility,
  checkWitness,
  parseBlockHeader,
} from "../lib/protocol/protocolTimeCore";
import { insertBlockTimestampRow, loadUncachedRawBlocks } from "./backboneDb";

export interface EnrichCycleResult {
  readonly missingBefore: number;
  readonly fetched: number;
  readonly inserted: number;
  readonly missingAfter: number;
}

/**
 * Fetch + verify + cache the timestamp of every raw block still missing from
 * the Protocol Time cache. Fail-closed end to end; throws on any violation.
 */
export async function enrichMissingBlockTimestamps(
  transport: RpcTransport,
): Promise<EnrichCycleResult> {
  const missing = await loadUncachedRawBlocks();
  if (missing.length === 0) {
    return { missingBefore: 0, fetched: 0, inserted: 0, missingAfter: 0 };
  }

  const strayChains = [
    ...new Set(missing.map((b) => b.chainId)),
  ].filter((c) => c !== EXPECTED_CHAIN_ID);
  if (strayChains.length > 0) {
    throw new Error(
      `uncached raw blocks sit on unexpected chain(s) [${strayChains.join(",")}] — refusing to enrich`,
    );
  }

  // Chain probe FIRST (fail closed) — never read headers off the wrong chain.
  const probe = await probeChain(transport);
  if (!probe.chainIdOk) {
    throw new Error(
      `chain probe failed before enrichment (reachable=${probe.rpcReachable} actual=${probe.chainIdActual ?? "null"} expected=${EXPECTED_CHAIN_ID})`,
    );
  }

  // Wall clock as a sanity UPPER BOUND only — never a timestamp source.
  const nowSec = Math.floor(Date.now() / 1000);
  let fetched = 0;
  let inserted = 0;
  for (const blockRef of missing) {
    const rawHeader = await ethGetBlockByNumber(transport, blockRef.blockNumber);
    fetched += 1;
    const header = parseBlockHeader(rawHeader, blockRef.blockNumber);
    const plausible = checkPlausibility(header.timestampSec, nowSec);
    if (!plausible.pass) {
      throw new Error(
        `block ${blockRef.blockNumber}: implausible timestamp (${plausible.reason})`,
      );
    }
    // Witness: the raw index's own block_hash (when recorded).
    checkWitness(
      { blockHash: header.blockHash, timestampSec: header.timestampSec },
      { blockHash: blockRef.witnessHash },
      "sale_event_raw.block_hash",
    );
    inserted += await insertBlockTimestampRow({
      chainId: EXPECTED_CHAIN_ID,
      blockNumber: blockRef.blockNumber,
      blockTimestampSec: header.timestampSec,
      blockHash: header.blockHash,
    });
  }

  // Completeness: nothing may remain uncached after the run.
  const missingAfter = (await loadUncachedRawBlocks()).length;
  if (missingAfter > 0) {
    throw new Error(
      `enrichment INCOMPLETE: ${missingAfter} raw block(s) still uncached`,
    );
  }

  return { missingBefore: missing.length, fetched, inserted, missingAfter };
}
