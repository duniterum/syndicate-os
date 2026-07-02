/**
 * Raw sale-event indexing ENGINE (SERVED, canon-free) — Sprint 2B-Part A.
 * ----------------------------------------------------------------------
 * A pure, read-only scan engine over the membership-sale event history. It is
 * transport- and persistence-INJECTED so it can be exercised offline with a mock
 * transport + in-memory store, then run for real with a fetch transport + a
 * Drizzle-backed store (the Drizzle adapter lives in scripts/, so this served
 * module never imports @workspace/db).
 *
 * Safety invariants:
 *   - chainId FIRST: nothing is scanned until eth_chainId verifies Avalanche
 *     C-Chain. Wrong/unknown chain => every unit is skipped, zero eth_getLogs.
 *   - Read-only: only eth_blockNumber / eth_getLogs are ever issued.
 *   - Fail-closed: an RPC failure or a decode-shape mismatch stops that unit and
 *     does NOT advance its cursor (no partial/guessed rows).
 *   - Idempotent + resumable: rows are keyed by (chainId, txHash, logIndex) at
 *     the persistence layer; a resume starts at lastScannedBlock + 1.
 *   - Address-free output: the returned run summary contains counts and safe
 *     keys ONLY. Decoded fields (which may contain addresses) live solely in the
 *     server-only persistence layer and are never part of the summary.
 */

import { EXPECTED_CHAIN_ID, FULL_ADDRESS_RE, type RpcTransport } from "./rpcTransport";
import { ethBlockNumber, ethGetLogs, probeChain, type RawLogEntry } from "./evmRead";
import {
  SALE_EVENT_DEFS_BY_NAME,
  decodeSaleEventLog,
  type DecodedEventFields,
} from "./saleEventDecoders";
import {
  SALE_SCAN_TARGETS,
  type SaleGeneration,
  type SaleScanTarget,
} from "../../data/protocolTargets";

export const DEFAULT_CHUNK_SIZE = 2000;

// Adaptive eth_getLogs splitter tuning (bounded — never retries endlessly).
export const DEFAULT_MIN_CHUNK_SIZE = 500;
export const DEFAULT_MAX_SPLIT_DEPTH = 5;
export const DEFAULT_MAX_RANGE_RETRIES = 64;
export const DEFAULT_RATE_RETRIES = 3;
export const DEFAULT_RATE_BACKOFF_MS = 400;

// ── Scan units (one contract × one event) ────────────────────────────────────
export type ScanUnit = {
  chainId: number;
  contractKey: string;
  generation: SaleGeneration;
  /** SERVER-ONLY address; never placed into a run summary. */
  address: string;
  eventName: string;
  topic0: string;
  fromBlock: number;
};

/** Expand scan targets into per-event scan units. Throws on an unknown event. */
export function expandScanUnits(
  targets: readonly SaleScanTarget[] = SALE_SCAN_TARGETS,
): ScanUnit[] {
  const units: ScanUnit[] = [];
  for (const t of targets) {
    for (const eventName of t.events) {
      const def = SALE_EVENT_DEFS_BY_NAME[eventName];
      if (!def) {
        throw new Error(`No pinned event def for "${eventName}" (${t.key})`);
      }
      units.push({
        chainId: EXPECTED_CHAIN_ID,
        contractKey: t.key,
        generation: t.generation,
        address: t.address,
        eventName,
        topic0: def.topic0,
        fromBlock: t.fromBlock,
      });
    }
  }
  return units;
}

// ── Persistence boundary (injected; Drizzle adapter lives in scripts/) ────────
export type CursorKey = {
  chainId: number;
  contractKey: string;
  eventName: string;
};

export type CursorState = {
  fromBlock: number;
  lastScannedBlock: number;
  status: string;
  lastError: string | null;
};

/** A single decoded raw event row (SERVER-ONLY; decodedJson/rawJson never emitted). */
export type RawEventRecord = {
  chainId: number;
  contractKey: string;
  generation: SaleGeneration;
  eventName: string;
  blockNumber: number;
  blockHash: string | null;
  transactionHash: string;
  logIndex: number;
  topic0: string;
  decodedJson: DecodedEventFields;
  rawJson: unknown;
};

export type CursorUpsert = {
  key: CursorKey;
  generation: SaleGeneration;
  fromBlock: number;
  lastScannedBlock: number;
  lastLogIndex: number | null;
  status: string;
  lastError: string | null;
};

export type Persistence = {
  getCursor(key: CursorKey): Promise<CursorState | null>;
  upsertCursor(input: CursorUpsert): Promise<void>;
  /** Insert rows idempotently; returns the count actually inserted. */
  insertEvents(rows: readonly RawEventRecord[]): Promise<number>;
};

// ── Run options + summary (summary is address-free by construction) ───────────
export type ScanOptions = {
  transport: RpcTransport;
  /** null/undefined => dry-run: no writes, no cursor, non-throwing decode count. */
  persistence?: Persistence | null;
  units?: readonly ScanUnit[];
  chunkSize?: number;
  /** Adaptive splitter floor: never split a range narrower than this. */
  minChunkSize?: number;
  /** Adaptive splitter per-chunk recursion depth bound (guarantees termination). */
  maxSplitDepth?: number;
  /** Adaptive splitter per-unit total split budget (belt-and-suspenders cap). */
  maxRangeRetries?: number;
  /** Bound the window per unit (dry-run). null => scan through head. */
  maxBlocksPerUnit?: number | null;
  /** Override chain head (tests). */
  headOverride?: number | null;
};

export type UnitRunSummary = {
  contractKey: string;
  generation: SaleGeneration;
  eventName: string;
  scannedFrom: number | null;
  scannedTo: number | null;
  /** Count of successful eth_getLogs sub-calls (reflects any adaptive splits). */
  chunksScanned: number;
  logsSeen: number;
  /** Logs that decoded cleanly against the pinned canon shape. */
  decodedOk: number;
  /** Logs that FAILED to decode (dry-run count mode only; strict mode throws). */
  decodeErrors: number;
  /** Deduped, sanitized, capped decode-failure reason classes (no addresses). */
  decodeErrorClasses: string[];
  /** Distinct transaction count (SIZE only; tx hashes never serialized). */
  txCount: number;
  firstMatchedBlock: number | null;
  lastMatchedBlock: number | null;
  rowsInserted: number;
  status: "ok" | "error" | "skipped";
  error: string | null;
};

export type ScanRunSummary = {
  chainId: number | null;
  chainOk: boolean;
  head: number | null;
  elapsedMs: number;
  units: UnitRunSummary[];
};

/** Never let an address (even one echoed by an RPC node) enter the summary. */
function sanitizeError(message: string): string {
  return message.replace(new RegExp(FULL_ADDRESS_RE.source, "g"), "0x<redacted>");
}

function parseHexNumber(value: unknown): number | null {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]+$/.test(value)) return null;
  const n = Number.parseInt(value, 16);
  return Number.isSafeInteger(n) ? n : null;
}

/** Decode + shape a single raw log into a persistable record. Throws fail-closed. */
function toRecord(unit: ScanUnit, log: RawLogEntry): RawEventRecord {
  const def = SALE_EVENT_DEFS_BY_NAME[unit.eventName]!;
  const decoded = decodeSaleEventLog(def, log);
  if (!decoded.ok) {
    throw new Error(`decode ${unit.eventName}: ${decoded.reason}`);
  }
  const blockNumber = parseHexNumber(log.blockNumber);
  const logIndex = parseHexNumber(log.logIndex);
  const transactionHash =
    typeof log.transactionHash === "string" ? log.transactionHash : null;
  if (blockNumber === null) throw new Error(`bad blockNumber (${unit.eventName})`);
  if (logIndex === null) throw new Error(`bad logIndex (${unit.eventName})`);
  if (transactionHash === null) throw new Error(`bad transactionHash (${unit.eventName})`);
  const blockHash = typeof log.blockHash === "string" ? log.blockHash : null;
  return {
    chainId: unit.chainId,
    contractKey: unit.contractKey,
    generation: unit.generation,
    eventName: unit.eventName,
    blockNumber,
    blockHash,
    transactionHash,
    logIndex,
    topic0: def.topic0,
    decodedJson: decoded.fields,
    rawJson: { topics: log.topics, data: log.data },
  };
}

// eth_getLogs error classes we react to. Only range/payload errors justify
// splitting the block window; rate errors get a bounded same-range backoff;
// timeout gets one same-range retry then a split; everything else fails closed.
type RpcErrorClass = "range" | "rate" | "timeout" | "other";

function classifyRpcError(message: string): RpcErrorClass {
  const m = message.toLowerCase();
  if (/(^|\D)429(\D|$)|too many requests|rate.?limit|-32097/.test(m)) return "rate";
  if (/abort|timeout|timed out|etimedout/.test(m)) return "timeout";
  if (
    /(^|\D)413(\D|$)|payload too large|request entity too large|limit exceeded|query returned more than|response size|block range|too many results|max results|result set too large|-32005|exceeds|too large/.test(
      m,
    )
  ) {
    return "range";
  }
  return "other";
}

/**
 * Run one read-only scan pass over the given units. Fail-closed and idempotent.
 *
 * Decode mode is keyed STRUCTURALLY off `persistence`:
 *   - persistence PRESENT (backfill): strict fail-closed — each matched log is
 *     built into a record via toRecord(), which THROWS on any decode-shape
 *     mismatch, erroring the unit and never inserting a partial row or advancing
 *     the cursor.
 *   - persistence ABSENT (dry-run): non-throwing decode-integrity accounting —
 *     each matched log is decoded via decodeSaleEventLog and COUNTED
 *     (decodedOk / decodeErrors / decodeErrorClasses); a decode failure is
 *     reported, never thrown, and no record is built. This makes it structurally
 *     impossible for a backfill to run in counting mode.
 *
 * eth_getLogs is issued through a bounded adaptive splitter: a provider
 * range/payload error (or, after one retry, a timeout) on a wide range is
 * retried on halved sub-ranges down to a floor / depth bound — never endlessly;
 * a rate error gets a bounded same-range backoff. A chunk yields ALL its logs or
 * throws, so the cursor is never advanced on a partial sub-range.
 */
export async function runSaleEventScan(opts: ScanOptions): Promise<ScanRunSummary> {
  const {
    transport,
    persistence = null,
    units = expandScanUnits(),
    chunkSize = DEFAULT_CHUNK_SIZE,
    minChunkSize = DEFAULT_MIN_CHUNK_SIZE,
    maxSplitDepth = DEFAULT_MAX_SPLIT_DEPTH,
    maxRangeRetries = DEFAULT_MAX_RANGE_RETRIES,
    maxBlocksPerUnit = null,
    headOverride = null,
  } = opts;

  const startedAt = Date.now();
  const summary: ScanRunSummary = {
    chainId: null,
    chainOk: false,
    head: null,
    elapsedMs: 0,
    units: [],
  };

  const emptyUnitSummary = (u: ScanUnit): Omit<UnitRunSummary, "status" | "error"> => ({
    contractKey: u.contractKey,
    generation: u.generation,
    eventName: u.eventName,
    scannedFrom: null,
    scannedTo: null,
    chunksScanned: 0,
    logsSeen: 0,
    decodedOk: 0,
    decodeErrors: 0,
    decodeErrorClasses: [],
    txCount: 0,
    firstMatchedBlock: null,
    lastMatchedBlock: null,
    rowsInserted: 0,
  });

  // 1) chainId FIRST — refuse to scan anything on an unverified/wrong chain.
  const probe = await probeChain(transport);
  summary.chainId = probe.chainIdActual;
  summary.chainOk = probe.chainIdOk;
  if (!probe.chainIdOk) {
    for (const u of units) {
      summary.units.push({
        ...emptyUnitSummary(u),
        status: "skipped",
        error: probe.wrongChain ? "wrong chain" : "chain not verified",
      });
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  // 2) head block.
  const head = headOverride ?? (await ethBlockNumber(transport));
  summary.head = head;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 3) per-unit chunked scan.
  for (const unit of units) {
    const key: CursorKey = {
      chainId: unit.chainId,
      contractKey: unit.contractKey,
      eventName: unit.eventName,
    };
    const unitSummary: UnitRunSummary = {
      ...emptyUnitSummary(unit),
      status: "ok",
      error: null,
    };

    // Address-free accumulators — only their COUNTS/classes ever enter output.
    const txSet = new Set<string>();
    const decodeClassSet = new Set<string>();
    const def = SALE_EVENT_DEFS_BY_NAME[unit.eventName]!;

    // Progress tracked OUTSIDE the try so the catch can never regress the cursor:
    // `lastScanned` only ever moves forward, and we never persist a value below a
    // previously recorded lastScannedBlock. `haveCursor` gates the error upsert so
    // a failed cursor READ never overwrites unknown prior progress.
    let lastScanned = unit.fromBlock - 1;
    let haveCursor = false;

    // Bounded adaptive splitter: returns ALL logs in [from,to] or throws. A
    // per-chunk recursion depth bound guarantees termination; a per-unit split
    // budget is a secondary cap. Only range/payload (and once-retried timeout)
    // errors split; rate errors back off on the SAME range; others fail closed.
    let rangeRetryBudget = maxRangeRetries;
    const fetchRangeAllLogs = async (
      from: number,
      to: number,
      depth: number,
    ): Promise<RawLogEntry[]> => {
      let rateAttempt = 0;
      let timeoutRetried = false;
      for (;;) {
        try {
          const logs = await ethGetLogs(transport, {
            address: unit.address,
            fromBlock: from,
            toBlock: to,
            topic0: unit.topic0,
          });
          unitSummary.chunksScanned += 1;
          return logs;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const cls = classifyRpcError(message);
          if (cls === "rate" && rateAttempt < DEFAULT_RATE_RETRIES) {
            rateAttempt += 1;
            await sleep(DEFAULT_RATE_BACKOFF_MS * rateAttempt);
            continue;
          }
          if (cls === "timeout" && !timeoutRetried) {
            timeoutRetried = true;
            continue;
          }
          const splittable = cls === "range" || cls === "timeout";
          const width = to - from + 1;
          if (splittable && depth < maxSplitDepth && width > minChunkSize && rangeRetryBudget > 0) {
            rangeRetryBudget -= 1;
            const mid = from + Math.floor((to - from) / 2);
            const left = await fetchRangeAllLogs(from, mid, depth + 1);
            const right = await fetchRangeAllLogs(mid + 1, to, depth + 1);
            return left.concat(right);
          }
          throw err instanceof Error ? err : new Error(message);
        }
      }
    };

    try {
      const cursor = persistence ? await persistence.getCursor(key) : null;
      haveCursor = true;
      if (cursor) lastScanned = cursor.lastScannedBlock;
      const startFrom = Math.max(unit.fromBlock, lastScanned + 1);
      const endTarget =
        maxBlocksPerUnit != null
          ? Math.min(head, startFrom + maxBlocksPerUnit - 1)
          : head;

      unitSummary.scannedFrom = startFrom;

      if (startFrom > head) {
        // Already caught up to head; nothing to scan.
        unitSummary.scannedTo = head;
      } else {
        if (persistence) {
          await persistence.upsertCursor({
            key,
            generation: unit.generation,
            fromBlock: unit.fromBlock,
            lastScannedBlock: lastScanned,
            lastLogIndex: null,
            status: "running",
            lastError: null,
          });
        }

        for (let from = startFrom; from <= endTarget; from += chunkSize) {
          const to = Math.min(from + chunkSize - 1, endTarget);
          const logs = await fetchRangeAllLogs(from, to, 0);
          unitSummary.logsSeen += logs.length;

          // Address-free block-range + distinct-tx accounting over ALL matched logs.
          for (const log of logs) {
            const bn = parseHexNumber(log.blockNumber);
            if (bn !== null) {
              if (unitSummary.firstMatchedBlock === null || bn < unitSummary.firstMatchedBlock) {
                unitSummary.firstMatchedBlock = bn;
              }
              if (unitSummary.lastMatchedBlock === null || bn > unitSummary.lastMatchedBlock) {
                unitSummary.lastMatchedBlock = bn;
              }
            }
            if (typeof log.transactionHash === "string") txSet.add(log.transactionHash);
          }

          if (persistence) {
            // Strict fail-closed: toRecord throws on any decode-shape mismatch.
            const records = logs.map((log) => toRecord(unit, log));
            unitSummary.decodedOk += records.length;
            if (records.length > 0) {
              unitSummary.rowsInserted += await persistence.insertEvents(records);
            }
          } else {
            // Dry-run integrity: non-throwing decode accounting (reported, not thrown).
            for (const log of logs) {
              const decoded = decodeSaleEventLog(def, log);
              if (decoded.ok) {
                unitSummary.decodedOk += 1;
              } else {
                unitSummary.decodeErrors += 1;
                const klass = sanitizeError(decoded.reason);
                if (!decodeClassSet.has(klass) && decodeClassSet.size < 8) {
                  decodeClassSet.add(klass);
                }
              }
            }
          }

          lastScanned = to;
          if (persistence) {
            await persistence.upsertCursor({
              key,
              generation: unit.generation,
              fromBlock: unit.fromBlock,
              lastScannedBlock: to,
              lastLogIndex: null,
              status: "running",
              lastError: null,
            });
          }
        }

        unitSummary.scannedTo = lastScanned;
        if (persistence) {
          await persistence.upsertCursor({
            key,
            generation: unit.generation,
            fromBlock: unit.fromBlock,
            lastScannedBlock: lastScanned,
            lastLogIndex: null,
            status: lastScanned >= head ? "complete" : "idle",
            lastError: null,
          });
        }
      }
    } catch (err) {
      const message = sanitizeError(err instanceof Error ? err.message : String(err));
      unitSummary.status = "error";
      unitSummary.error = message;
      // Reflect real progress in the summary; never below this unit's start.
      unitSummary.scannedTo = lastScanned >= unit.fromBlock ? lastScanned : null;
      // Only persist an error cursor if we successfully READ the cursor. Writing
      // `lastScanned` (which only ever moves forward) can never regress prior
      // progress; a failed cursor read leaves prior progress untouched.
      if (persistence && haveCursor) {
        try {
          await persistence.upsertCursor({
            key,
            generation: unit.generation,
            fromBlock: unit.fromBlock,
            lastScannedBlock: lastScanned,
            lastLogIndex: null,
            status: "error",
            lastError: message,
          });
        } catch {
          // Persistence failure while recording an error is non-fatal to the run.
        }
      }
    }

    unitSummary.txCount = txSet.size;
    unitSummary.decodeErrorClasses = [...decodeClassSet];
    summary.units.push(unitSummary);
  }

  summary.elapsedMs = Date.now() - startedAt;
  return summary;
}
