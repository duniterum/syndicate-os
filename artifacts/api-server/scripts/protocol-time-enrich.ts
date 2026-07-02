/**
 * Protocol Time enrichment — verified block-timestamp cache runner (SERVER-ONLY).
 * -------------------------------------------------------------------------------
 * Founder-gated tsx script. Populates the reusable `block_timestamp` cache for
 * every DISTINCT (chainId, blockNumber) already present in `sale_event_raw`.
 *
 * Scope discipline:
 *   - Reads ONLY existing indexed raw rows — no rescan, no eth_getLogs, no new
 *     block-range discovery. The raw index defines the block set.
 *   - Never reads decodedJson/rawJson — only chain_id / block_number / block_hash.
 *   - Writes ONLY into `block_timestamp` (insert, onConflictDoNothing). The raw
 *     index, Part B tables, and cursors are never touched.
 *
 * Truth discipline (fail closed at every step):
 *   1. eth_chainId FIRST — must equal EXPECTED_CHAIN_ID (43114) or nothing runs.
 *   2. Every raw row's chainId must equal the probed chain.
 *   3. eth_getBlockByNumber per distinct block; returned number MUST equal the
 *      requested number; hash + timestamp parsed strictly; zero/implausible
 *      timestamps rejected.
 *   4. Witness divergence = HARD FAIL: fetched header is compared against the
 *      raw-index block_hash (when present) AND any already-cached row. Replays
 *      therefore re-verify the whole cache against the live chain every run.
 *   5. Monotonicity: cached timestamps must be non-decreasing by block number.
 *   6. Completeness: after the run, every distinct raw block must be cached —
 *      otherwise the run exits non-zero as INCOMPLETE.
 *   7. Idempotent replay: a second run fetches+verifies but inserts 0 rows.
 *
 * Output discipline: the report contains counts, block numbers, chainId, and
 * ISO dates ONLY — never an RPC URL, never a block/tx hash, never an address.
 * A fail-closed output gate scans the serialized report before printing.
 *
 * Modes:
 *   (default)   — enrich + verify (writes at most the missing cache rows)
 *   --status    — read-only coverage report (no RPC, no writes)
 */

import {
  makeFetchTransport,
  resolveEndpoints,
  EXPECTED_CHAIN_ID,
} from "../src/lib/protocol/rpcTransport";
import { probeChain, ethGetBlockByNumber } from "../src/lib/protocol/evmRead";
import {
  parseBlockHeader,
  checkPlausibility,
  checkMonotonicNonDecreasing,
  checkWitness,
  assertTimeSafeOutput,
  redactError,
  toIsoUtc,
} from "./protocol-time-core";

const DEFAULT_TIMEOUT_MS = 8000;

interface CheckLine {
  name: string;
  pass: boolean;
  detail: string;
}

function readEnvInt(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

interface DistinctBlock {
  chainId: number;
  blockNumber: number;
  /** Raw-index witness hash (nullable on old rows); lowercased when present. */
  witnessHash: string | null;
}

/** Load DISTINCT (chainId, blockNumber, witness block_hash) from sale_event_raw. */
async function loadDistinctRawBlocks(): Promise<DistinctBlock[]> {
  const { pool } = await import("@workspace/db");
  const res = await pool.query(
    `select chain_id, block_number,
            count(distinct block_hash) filter (where block_hash is not null)::int as hash_variants,
            min(lower(block_hash)) as witness_hash
       from sale_event_raw
      group by chain_id, block_number
      order by chain_id, block_number`,
  );
  return res.rows.map((r: Record<string, unknown>) => {
    const variants = Number(r.hash_variants);
    if (variants > 1) {
      throw new Error(
        `raw index inconsistency: block ${String(r.block_number)} carries ${variants} distinct block hashes`,
      );
    }
    return {
      chainId: Number(r.chain_id),
      blockNumber: Number(r.block_number),
      witnessHash: r.witness_hash == null ? null : String(r.witness_hash),
    };
  });
}

async function loadCache(chainId: number) {
  const db = await import("@workspace/db");
  const { eq, asc } = await import("drizzle-orm");
  return db.db
    .select({
      chainId: db.blockTimestamp.chainId,
      blockNumber: db.blockTimestamp.blockNumber,
      blockTimestampSec: db.blockTimestamp.blockTimestampSec,
      blockHash: db.blockTimestamp.blockHash,
    })
    .from(db.blockTimestamp)
    .where(eq(db.blockTimestamp.chainId, chainId))
    .orderBy(asc(db.blockTimestamp.blockNumber));
}

async function main(): Promise<void> {
  const statusOnly = process.argv.includes("--status");
  const checks: CheckLine[] = [];
  let allPass = true;
  const check = (name: string, pass: boolean, detail: string) => {
    checks.push({ name, pass, detail });
    if (!pass) allPass = false;
  };

  // --- Raw block set (scope = existing indexed rows ONLY) ---
  const distinct = await loadDistinctRawBlocks();
  const chainIds = [...new Set(distinct.map((b) => b.chainId))];
  check(
    "every raw row is anchored to the expected chain",
    chainIds.length === 1 && chainIds[0] === EXPECTED_CHAIN_ID,
    `chainIds=[${chainIds.join(",")}] expected=${EXPECTED_CHAIN_ID}`,
  );
  if (!allPass) {
    finish("enrich", checks, null, 0, 0, false);
    return;
  }
  const chainId = EXPECTED_CHAIN_ID;

  const cacheBefore = await loadCache(chainId);
  const cachedSet = new Map(
    cacheBefore.map((r) => [r.blockNumber, r] as const),
  );

  if (statusOnly) {
    const missing = distinct.filter((b) => !cachedSet.has(b.blockNumber));
    check(
      "coverage: every distinct raw block has a cached chain timestamp",
      missing.length === 0,
      `distinctBlocks=${distinct.length} cached=${cacheBefore.length} missing=${missing.length}`,
    );
    const mono = checkMonotonicNonDecreasing(
      cacheBefore.map((r) => ({
        blockNumber: r.blockNumber,
        timestampSec: r.blockTimestampSec,
      })),
    );
    check("cached timestamps non-decreasing by block number", mono.pass, mono.detail);
    finish("status", checks, cacheBefore, 0, 0, allPass);
    return;
  }

  // --- Chain probe FIRST (fail closed) ---
  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
  const probe = await probeChain(transport);
  check(
    "eth_chainId verifies the expected chain before any block read",
    probe.chainIdOk,
    `rpcReachable=${probe.rpcReachable} chainIdActual=${probe.chainIdActual ?? "null"} expected=${EXPECTED_CHAIN_ID}`,
  );
  if (!allPass) {
    finish("enrich", checks, null, 0, 0, false);
    return;
  }

  // --- Fetch + verify EVERY distinct block (cached rows are re-verified) ---
  const db = await import("@workspace/db");
  const nowSec = Math.floor(Date.now() / 1000); // sanity upper bound ONLY — never a timestamp source
  let fetched = 0;
  let inserted = 0;
  let verifiedExisting = 0;
  for (const blockRef of distinct) {
    const rawHeader = await ethGetBlockByNumber(transport, blockRef.blockNumber);
    fetched += 1;
    const header = parseBlockHeader(rawHeader, blockRef.blockNumber);
    const plausible = checkPlausibility(header.timestampSec, nowSec);
    if (!plausible.pass) {
      throw new Error(
        `block ${blockRef.blockNumber}: implausible timestamp (${plausible.reason})`,
      );
    }
    // Witness 1: the raw index's own block_hash (when recorded).
    checkWitness(
      { blockHash: header.blockHash, timestampSec: header.timestampSec },
      { blockHash: blockRef.witnessHash },
      "sale_event_raw.block_hash",
    );
    // Witness 2: an already-cached row (divergence hard fail; replay = re-verify).
    const existing = cachedSet.get(blockRef.blockNumber);
    if (existing) {
      checkWitness(
        { blockHash: header.blockHash, timestampSec: header.timestampSec },
        {
          blockHash: existing.blockHash,
          timestampSec: existing.blockTimestampSec,
        },
        "block_timestamp cache",
      );
      verifiedExisting += 1;
      continue;
    }
    const res = await db.db
      .insert(db.blockTimestamp)
      .values({
        chainId,
        blockNumber: blockRef.blockNumber,
        blockTimestampSec: header.timestampSec,
        blockHash: header.blockHash,
      })
      .onConflictDoNothing({
        target: [db.blockTimestamp.chainId, db.blockTimestamp.blockNumber],
      })
      .returning({ blockNumber: db.blockTimestamp.blockNumber });
    inserted += res.length;
  }
  check(
    "every distinct raw block was fetched and header-verified against the chain",
    fetched === distinct.length,
    `fetched=${fetched} distinctBlocks=${distinct.length}`,
  );
  check(
    "already-cached rows re-verified against live chain (no divergence)",
    verifiedExisting === cacheBefore.length,
    `reVerified=${verifiedExisting} cachedBefore=${cacheBefore.length}`,
  );

  // --- Post-state: completeness + monotonicity + idempotency evidence ---
  const cacheAfter = await loadCache(chainId);
  const cachedAfterSet = new Set(cacheAfter.map((r) => r.blockNumber));
  const missingAfter = distinct.filter((b) => !cachedAfterSet.has(b.blockNumber));
  check(
    "completeness: every distinct raw block is now cached (else INCOMPLETE)",
    missingAfter.length === 0,
    `distinctBlocks=${distinct.length} cachedAfter=${cacheAfter.length} missing=${missingAfter.length}`,
  );
  const mono = checkMonotonicNonDecreasing(
    cacheAfter.map((r) => ({
      blockNumber: r.blockNumber,
      timestampSec: r.blockTimestampSec,
    })),
  );
  check("cached timestamps non-decreasing by block number", mono.pass, mono.detail);
  check(
    "idempotency: inserts equal previously-missing blocks (replay inserts 0)",
    inserted === distinct.length - cacheBefore.length,
    `inserted=${inserted} previouslyMissing=${distinct.length - cacheBefore.length}`,
  );

  finish("enrich", checks, cacheAfter, fetched, inserted, allPass);
}

function finish(
  mode: string,
  checks: CheckLine[],
  cache:
    | { blockNumber: number; blockTimestampSec: number }[]
    | null,
  fetched: number,
  inserted: number,
  allPass: boolean,
): void {
  const earliest = cache && cache.length > 0 ? cache[0] : null;
  const latest = cache && cache.length > 0 ? cache[cache.length - 1] : null;
  const report = {
    module: "protocol-time",
    mode,
    chainId: EXPECTED_CHAIN_ID,
    cachedBlocks: cache?.length ?? 0,
    fetched,
    inserted,
    earliest: earliest
      ? {
          blockNumber: earliest.blockNumber,
          timestampSec: earliest.blockTimestampSec,
          iso: toIsoUtc(earliest.blockTimestampSec),
        }
      : null,
    latest: latest
      ? {
          blockNumber: latest.blockNumber,
          timestampSec: latest.blockTimestampSec,
          iso: toIsoUtc(latest.blockTimestampSec),
        }
      : null,
    checks,
    allPass,
    persistenceNote:
      "writes are INSERTs into block_timestamp only; sale_event_raw, Part B tables, and cursors are never touched",
  };
  const serialized = JSON.stringify(report, null, 2);
  assertTimeSafeOutput(serialized);
  process.stdout.write(serialized + "\n");
  process.stdout.write(
    allPass
      ? `protocol-time ${mode}: OK — ${report.cachedBlocks} blocks cached, ${inserted} inserted this run.\n`
      : `protocol-time ${mode}: FAIL — see checks above.\n`,
  );
  if (!allPass) process.exitCode = 1;
}

main()
  .then(async () => {
    try {
      const { pool } = await import("@workspace/db");
      await pool.end();
    } catch {
      /* DB may not have been opened */
    }
  })
  .catch(async (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `protocol-time: HARD FAIL — ${redactError(message)}\n`,
    );
    process.exitCode = 1;
    try {
      const { pool } = await import("@workspace/db");
      await pool.end();
    } catch {
      /* ignore */
    }
  });
