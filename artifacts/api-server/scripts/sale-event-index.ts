/**
 * CLI: raw sale-event indexer — Sprint 2B-Part A (read-only, server-only).
 * ----------------------------------------------------------------------
 * Drives the pure engine (`src/lib/protocol/saleEventIndexer.ts`) with a real
 * fetch transport and a Drizzle-backed persistence adapter. Read-only against
 * chain (eth_chainId / eth_blockNumber / eth_getLogs only); the ONLY writes are
 * to our own indexer tables. Decoded fields stay server-only; the printed run
 * summary is address-free and re-checked by the address-leak guard before print.
 *
 * The Drizzle adapter is dynamically imported so `--dry-run` needs no DATABASE_URL.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run sale-index:dry-run   # no writes, bounded window
 *   pnpm --filter @workspace/api-server run sale-index:backfill  # writes rows through head
 *   pnpm --filter @workspace/api-server run sale-index:status    # print cursors only, no scan
 * Flags: --chunk-size=<n>  --max-blocks=<n> (dry-run window bound)
 *        --full-range     (dry-run: scan each unit fromBlock→head, no window bound)
 *        --generation=<V1|V2A|V2B|V3>  (dry-run: scan only one generation's units)
 *        --event=<name>   (dry-run: scan only one event name — pair with a
 *                         generation to keep a single foreground run bounded)
 *        --min-chunk=<n>  (adaptive splitter floor; default 500)
 *        --near-head=<n>  (dry-run: scan the most recent N blocks instead of history)
 *        --primary-only  (diagnostic: use ONLY the resolved primary endpoint,
 *                         no fallback — isolates the primary's true capability
 *                         so a fallback error can't mask it. URL never printed.)
 */

import {
  DEFAULT_TIMEOUT_MS,
  assertAddressSafeAggregate,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../src/lib/protocol/rpcTransport";
import {
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MIN_CHUNK_SIZE,
  expandScanUnits,
  runSaleEventScan,
  type Persistence,
  type ScanUnit,
} from "../src/lib/protocol/saleEventIndexer";
import { ethBlockNumber } from "../src/lib/protocol/evmRead";
import { makeSaleEventPersistence } from "../src/backbone/backboneDb";

type Mode = "dry-run" | "backfill" | "status";

function parseArgs(argv: string[]): {
  mode: Mode;
  chunkSize: number;
  maxBlocks: number;
  minChunk: number;
  primaryOnly: boolean;
  nearHead: number | null;
  fullRange: boolean;
  generation: string | null;
  event: string | null;
} {
  const has = (f: string) => argv.includes(f);
  const num = (f: string, dflt: number): number => {
    const hit = argv.find((a) => a.startsWith(`${f}=`));
    if (!hit) return dflt;
    const n = Number.parseInt(hit.split("=")[1] ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : dflt;
  };
  const optNum = (f: string): number | null => {
    const hit = argv.find((a) => a.startsWith(`${f}=`));
    if (!hit) return null;
    const n = Number.parseInt(hit.split("=")[1] ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const str = (f: string): string | null => {
    const hit = argv.find((a) => a.startsWith(`${f}=`));
    if (!hit) return null;
    const v = hit.split("=")[1] ?? "";
    return v.length > 0 ? v : null;
  };
  const mode: Mode = has("status")
    ? "status"
    : has("--backfill")
      ? "backfill"
      : "dry-run"; // safe default: never write unless --backfill is explicit
  return {
    mode,
    chunkSize: num("--chunk-size", DEFAULT_CHUNK_SIZE),
    maxBlocks: num("--max-blocks", 5000),
    minChunk: num("--min-chunk", DEFAULT_MIN_CHUNK_SIZE),
    primaryOnly: has("--primary-only"),
    nearHead: optNum("--near-head"),
    fullRange: has("--full-range"),
    generation: str("--generation"),
    event: str("--event"),
  };
}

/**
 * Build the Drizzle-backed persistence adapter. The adapter itself lives in
 * src/backbone/backboneDb.ts (M4-a) — ONE adapter shared with the unattended
 * backbone. The CLI keeps pool lifecycle ownership: it closes the pool at the
 * end of a run (the served process never does).
 */
async function makeDrizzlePersistence(): Promise<{ persistence: Persistence; close: () => Promise<void> }> {
  const persistence = await makeSaleEventPersistence();
  return {
    persistence,
    close: async () => {
      const { pool } = await import("@workspace/db");
      await pool.end();
    },
  };
}

async function printStatus(): Promise<void> {
  const { db, pool, indexerCursor } = await import("@workspace/db");
  try {
    const rows = await db.select().from(indexerCursor);
    if (rows.length === 0) {
      process.stdout.write("indexer cursors: (none yet — no scan has run)\n");
      return;
    }
    process.stdout.write("indexer cursors (address-free):\n");
    for (const r of rows) {
      process.stdout.write(
        `  ${r.contractKey}/${r.eventName} [${r.generation}] ` +
          `from=${r.fromBlock} lastScanned=${r.lastScannedBlock} ` +
          `status=${r.status}${r.lastError ? ` err="${r.lastError}"` : ""}\n`,
      );
    }
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  const { mode, chunkSize, maxBlocks, minChunk, primaryOnly, nearHead, fullRange, generation, event } =
    parseArgs(process.argv.slice(2));

  if (mode === "status") {
    await printStatus();
    return;
  }

  const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  // Diagnostic isolation: --primary-only drops the fallback so the primary
  // endpoint's true error/capability cannot be masked by a fallback error.
  // We report only the COUNT of active endpoints — never the URLs themselves.
  const endpoints = resolveEndpoints();
  const activeEndpoints = primaryOnly ? endpoints.slice(0, 1) : endpoints;
  const transport = makeFetchTransport(activeEndpoints, timeoutMs);
  const units = expandScanUnits();

  process.stdout.write(
    `sale-event index: mode=${mode} units=${units.length} ` +
      `endpoints=${activeEndpoints.length}${primaryOnly ? " (primary-only)" : ""} ` +
      `chunkSize=${chunkSize}` +
      (mode === "dry-run" ? (fullRange ? " fullRange" : ` maxBlocks=${maxBlocks}`) : "") +
      (mode === "dry-run" ? ` minChunk=${minChunk}` : "") +
      (generation ? ` generation=${generation}` : "") +
      (event ? ` event=${event}` : "") +
      (nearHead != null ? ` nearHead=${nearHead}` : "") +
      "\n",
  );

  if (mode === "dry-run") {
    // --generation / --event narrow the unit set so a single foreground run stays
    // under the shell timeout (a full-range scan of all units is ~735 getLogs).
    let scanUnits: ScanUnit[] = units;
    if (generation) {
      const g = generation.toUpperCase();
      scanUnits = scanUnits.filter((u) => u.generation === g);
    }
    if (event) {
      scanUnits = scanUnits.filter((u) => u.eventName === event);
    }
    if (scanUnits.length === 0) {
      process.stderr.write(
        `no scan units match filters (generation=${generation ?? "*"} event=${event ?? "*"})\n`,
      );
      process.exit(1);
    }

    // Diagnostic --near-head=N: instead of scanning each unit's pinned historical
    // fromBlock, scan the most RECENT N blocks. Distinguishes "eth_getLogs works
    // recent but not deep history (archive add-on needed)" from "eth_getLogs is
    // refused at any depth (method/plan restriction)". No writes either way.
    let headOverride: number | null = null;
    if (nearHead != null) {
      const head = await ethBlockNumber(transport);
      headOverride = head;
      const recentFrom = Math.max(0, head - nearHead);
      scanUnits = scanUnits.map((u) => ({ ...u, fromBlock: recentFrom }));
    }
    const summary = await runSaleEventScan({
      transport,
      persistence: null, // no writes
      units: scanUnits,
      chunkSize,
      minChunkSize: minChunk,
      // --full-range scans fromBlock→head (the Sprint 2B-Part A dry-run); otherwise
      // the bounded --max-blocks window (default 5000).
      maxBlocksPerUnit: fullRange ? null : maxBlocks,
      headOverride,
    });
    const serialized = JSON.stringify(summary, null, 2);
    assertAddressSafeAggregate(serialized);
    process.stdout.write(serialized + "\n");
    return;
  }

  // backfill (writes rows through head)
  const { persistence, close } = await makeDrizzlePersistence();
  try {
    const summary = await runSaleEventScan({
      transport,
      persistence,
      units,
      chunkSize,
      maxBlocksPerUnit: null, // scan through head
    });
    const serialized = JSON.stringify(summary, null, 2);
    assertAddressSafeAggregate(serialized);
    process.stdout.write(serialized + "\n");
    const failed = summary.units.filter((u) => u.status === "error");
    if (failed.length > 0) process.exitCode = 1;
  } finally {
    await close();
  }
}

void main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`sale-event index FAILED: ${message}\n`);
  process.exit(1);
});
