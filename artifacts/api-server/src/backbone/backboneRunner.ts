/**
 * Event Backbone — the UNATTENDED runner (M4-a, founder GO).
 * -----------------------------------------------------------
 * Makes the existing, already-proven indexer machinery run by itself inside
 * the served process: boot + interval cycles of
 *
 *   ① incremental sale-event scan (the pure engine, cursor-resumed — the
 *      SAME `runSaleEventScan` the founder-gated CLI drives; writes are
 *      idempotent, the cursor never advances past persisted rows),
 *   ② incremental Protocol Time enrichment (only never-verified blocks),
 *   ③ in-memory rebuild of the activity heartbeat read-model (pure builder;
 *      the address-safe aggregate report is kept as last-good state).
 *
 * Failure posture — the server NEVER crashes because of the backbone:
 *   - Any error fails the WHOLE cycle closed: the last-good read-model is
 *     kept, the error is redacted (URLs + hex stripped) and recorded, and
 *     the next cycle is scheduled anyway.
 *   - Cycles are single-flight by construction: the next cycle is scheduled
 *     only AFTER the current one finishes (success or failure).
 *   - Dark by default: nothing starts unless the founder set the exact
 *     opt-in literal (see backboneConfig.ts); without DATABASE_URL the
 *     backbone parks itself in "no-database" and never touches the DB.
 *
 * Wall-clock use here is OPS METADATA ONLY (cycle bookkeeping timestamps and
 * the plausibility upper bound inside enrichment) — chain truth timestamps
 * come exclusively from verified block headers, per Protocol Time doctrine.
 */

import { logger } from "../lib/logger";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
  FULL_ADDRESS_RE,
} from "../lib/protocol/rpcTransport";
import {
  expandScanUnits,
  runSaleEventScan,
  type ScanRunSummary,
} from "../lib/protocol/saleEventIndexer";
import { redactError } from "../lib/protocol/protocolTimeCore";
import {
  buildActivityHeartbeatReadModel,
  toAddressSafeActivityReport,
  type ActivityAddressSafeReport,
} from "./activityHeartbeatReadmodel";
import {
  BOOT_DELAY_MS,
  readBackboneConfig,
  type BackboneConfig,
} from "./backboneConfig";
import { enrichMissingBlockTimestamps } from "./blockTimeEnrich";
import { loadActivityHeartbeatInput, makeSaleEventPersistence } from "./backboneDb";

// ---------------------------------------------------------------------------
// Status state (in-memory, address-free by construction).
// ---------------------------------------------------------------------------

export type BackboneState =
  | "disabled"
  | "no-database"
  | "idle"
  | "running";

interface UnitStatusLine {
  readonly contractKey: string;
  readonly eventName: string;
  readonly generation: string;
  readonly status: string;
  readonly scannedTo: number | null;
}

export interface BackboneStatusSnapshot {
  readonly module: "event-backbone";
  readonly enabled: boolean;
  readonly state: BackboneState;
  readonly intervalSec: number;
  readonly cycles: { readonly ok: number; readonly failed: number };
  readonly lastSuccess: {
    readonly finishedIso: string;
    readonly headBlock: number | null;
    readonly unitsOk: number;
    readonly unitsError: number;
    readonly eventsInserted: number;
    readonly timestampsInserted: number;
    readonly units: readonly UnitStatusLine[];
    readonly readModel: ActivityAddressSafeReport;
  } | null;
  readonly lastError: {
    readonly atIso: string;
    readonly message: string;
  } | null;
  readonly honesty: string;
}

const HONESTY_LINE =
  "Coverage grows from each generation's pinned deployment block to the head the last cycle saw; a failed cycle keeps the previous good state. Counts are address-safe aggregates — never proof of absence between cycles.";

interface MutableStatus {
  enabled: boolean;
  state: BackboneState;
  intervalSec: number;
  cyclesOk: number;
  cyclesFailed: number;
  lastSuccess: BackboneStatusSnapshot["lastSuccess"];
  lastError: BackboneStatusSnapshot["lastError"];
}

const status: MutableStatus = {
  enabled: false,
  state: "disabled",
  intervalSec: 0,
  cyclesOk: 0,
  cyclesFailed: 0,
  lastSuccess: null,
  lastError: null,
};

let started = false;

/** Address-free snapshot for the status route (structure is already safe). */
export function getBackboneStatus(): BackboneStatusSnapshot {
  return {
    module: "event-backbone",
    enabled: status.enabled,
    state: status.state,
    intervalSec: status.intervalSec,
    cycles: { ok: status.cyclesOk, failed: status.cyclesFailed },
    lastSuccess: status.lastSuccess,
    lastError: status.lastError,
    honesty: HONESTY_LINE,
  };
}

// ---------------------------------------------------------------------------
// The cycle.
// ---------------------------------------------------------------------------

/** Redact anything an upstream error could carry (URLs, keys-in-URLs, hex). */
function toSafeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return redactError(raw).replace(FULL_ADDRESS_RE, "[hex-redacted]").slice(0, 300);
}

function summarizeUnits(summary: ScanRunSummary): UnitStatusLine[] {
  return summary.units.map((u) => ({
    contractKey: u.contractKey,
    eventName: u.eventName,
    generation: u.generation,
    status: u.status,
    scannedTo: u.scannedTo,
  }));
}

async function runCycle(): Promise<void> {
  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);

  // ① Incremental scan — the same engine + adapter the founder-gated CLI
  // drives; the cursor resumes from lastScannedBlock + 1 through head.
  const persistence = await makeSaleEventPersistence();
  const summary = await runSaleEventScan({
    transport,
    persistence,
    units: expandScanUnits(),
    maxBlocksPerUnit: null, // scan through head
  });
  if (!summary.chainOk) {
    throw new Error("chain probe failed before the scan — cycle aborted");
  }
  const failedUnits = summary.units.filter((u) => u.status === "error");
  if (failedUnits.length > 0) {
    // Fail the WHOLE cycle closed. Persisted sub-ranges stay (idempotent,
    // cursor-guarded); the next cycle resumes them honestly.
    throw new Error(
      `${failedUnits.length}/${summary.units.length} scan unit(s) errored — cycle failed closed`,
    );
  }
  const eventsInserted = summary.units.reduce(
    (acc, u) => acc + u.rowsInserted,
    0,
  );

  // ② Incremental Protocol Time enrichment (new blocks only, witness-checked).
  const enrich = await enrichMissingBlockTimestamps(transport);

  // ③ Rebuild the read-model in memory (pure, fail-closed, address-safe out).
  const { input } = await loadActivityHeartbeatInput();
  const model = buildActivityHeartbeatReadModel(input);
  if (!model.consistent) {
    throw new Error("activity read-model rebuild is not consistent — cycle failed closed");
  }
  const report = toAddressSafeActivityReport(model);

  status.lastSuccess = {
    finishedIso: new Date().toISOString(), // ops metadata, never chain truth
    headBlock: summary.head,
    unitsOk: summary.units.length,
    unitsError: 0,
    eventsInserted,
    timestampsInserted: enrich.inserted,
    units: summarizeUnits(summary),
    readModel: report,
  };
}

// ---------------------------------------------------------------------------
// Scheduling (single-flight: next cycle only after this one settles).
// ---------------------------------------------------------------------------

function scheduleNext(delayMs: number, cfg: BackboneConfig): void {
  const timer = setTimeout(() => {
    void runCycleSafe(cfg);
  }, delayMs);
  // Never hold the process open for the backbone alone.
  timer.unref();
}

async function runCycleSafe(cfg: BackboneConfig): Promise<void> {
  status.state = "running";
  try {
    await runCycle();
    status.cyclesOk += 1;
    logger.info(
      {
        backbone: {
          cyclesOk: status.cyclesOk,
          eventsInserted: status.lastSuccess?.eventsInserted,
          timestampsInserted: status.lastSuccess?.timestampsInserted,
          headBlock: status.lastSuccess?.headBlock,
        },
      },
      "backbone cycle OK",
    );
  } catch (err) {
    status.cyclesFailed += 1;
    status.lastError = {
      atIso: new Date().toISOString(),
      message: toSafeErrorMessage(err),
    };
    logger.warn(
      { backbone: { cyclesFailed: status.cyclesFailed, error: status.lastError.message } },
      "backbone cycle FAILED (last-good state kept)",
    );
  } finally {
    status.state = "idle";
    scheduleNext(cfg.intervalSec * 1000, cfg);
  }
}

/**
 * Start the unattended backbone. Idempotent; called once after listen().
 * Dark unless the founder's exact opt-in literal is set; parks in
 * "no-database" (and never imports @workspace/db) when DATABASE_URL is absent.
 */
export function startBackbone(): void {
  if (started) return;
  started = true;

  const cfg = readBackboneConfig();
  status.enabled = cfg.enabled;
  status.intervalSec = cfg.intervalSec;

  if (!cfg.enabled) {
    status.state = "disabled";
    logger.info("backbone: disabled (opt-in flag not set) — staying dark");
    return;
  }
  if (
    process.env["DATABASE_URL"] == null ||
    process.env["DATABASE_URL"].length === 0
  ) {
    status.state = "no-database";
    logger.warn("backbone: enabled but DATABASE_URL is not provisioned — parked");
    return;
  }

  status.state = "idle";
  logger.info(
    { backbone: { intervalSec: cfg.intervalSec, bootDelayMs: BOOT_DELAY_MS } },
    "backbone: enabled — first cycle scheduled",
  );
  scheduleNext(BOOT_DELAY_MS, cfg);
}
