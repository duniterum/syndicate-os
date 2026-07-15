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
  type ActivityBuildResult,
} from "./activityHeartbeatReadmodel";
import type { FeedSource } from "./feedProjection";
import {
  BOOT_DELAY_MS,
  readBackboneConfig,
  type BackboneConfig,
} from "./backboneConfig";
import { enrichMissingBlockTimestamps } from "./blockTimeEnrich";
import {
  BACKBONE_EXPECTED_CHAIN_ID,
  loadActivityHeartbeatInput,
  loadProtocolEventRows,
  makeSaleEventPersistence,
} from "./backboneDb";
import {
  runProtocolEventScan,
  type ProtocolScanStreamSummary,
} from "./protocolEventScan";
import {
  buildProtocolEventReadModel,
  type ProtocolEventBuildResult,
} from "./protocolEventReadmodel";
import {
  refreshIntroductionModel,
  type IntroductionRefreshSummary,
} from "./introductionRefresh";
import { FINANCIAL_TARGETS } from "../data/protocolTargets";
import {
  buildMilestoneReadModel,
  type MilestoneBuildResult,
} from "./milestoneReadmodel";
import { ethCall } from "../lib/protocol/evmRead";
import {
  decodeUint256Decimal,
  SELECTOR_TOTAL_GROSS_USDC,
} from "../lib/protocol/saleDecoders";
import {
  SELECTOR_MEMBER_COUNT,
  SELECTOR_TOTAL_USDC_RAISED,
} from "../lib/protocol/financialDecoders";

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
  /** partial = the serving state refreshed but a protocol stream faulted. */
  readonly cycles: {
    readonly ok: number;
    readonly partial: number;
    readonly failed: number;
  };
  readonly lastSuccess: {
    readonly finishedIso: string;
    readonly headBlock: number | null;
    readonly unitsOk: number;
    readonly unitsError: number;
    readonly eventsInserted: number;
    readonly protocolEventsInserted: number;
    readonly timestampsInserted: number;
    readonly units: readonly UnitStatusLine[];
    readonly protocolStreams: readonly {
      readonly streamKey: string;
      readonly status: string;
      readonly cursorBlock: number | null;
      readonly caughtUp: boolean;
      readonly rowsInserted: number;
    }[];
    readonly burnLedgerTotal: number;
    readonly lifecycleTotal: number;
    /** M0: the in-process introduction refresh (address-free counts only). */
    readonly introductionRefresh: {
      readonly refreshed: boolean;
      readonly skippedReason: string | null;
      readonly asOfBlock: number | null;
      readonly attributedRows: number;
      readonly distinctSources: number;
    } | null;
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
  cyclesPartial: number;
  cyclesFailed: number;
  lastSuccess: BackboneStatusSnapshot["lastSuccess"];
  lastError: BackboneStatusSnapshot["lastError"];
}

const status: MutableStatus = {
  enabled: false,
  state: "disabled",
  intervalSec: 0,
  cyclesOk: 0,
  cyclesPartial: 0,
  cyclesFailed: 0,
  lastSuccess: null,
  lastError: null,
};

let started = false;

/**
 * Last-good read-models (SERVER-ONLY memory; sale items carry pairing tokens,
 * burn items carry sender addresses until projected to labels). The ONLY ways
 * out are the two sanctioned projections: the aggregate report (status) and
 * the receipt-line feed (feedProjection, its own output gate).
 */
let lastGoodModel: ActivityBuildResult | null = null;
let lastGoodProtocolModel: ProtocolEventBuildResult | null = null;
/** H2-⑬: the derived milestone model (crossings + honest progress). */
let lastGoodMilestoneModel: MilestoneBuildResult | null = null;
/** The protocol lane's honest coverage bounds (its cursors), for projections. */
let burnsAsOfBlock: number | null = null;
let lifecycleAsOfBlock: number | null = null;

/** Source for the public receipt-line feed (projected + gated by the route). */
export function getBackboneFeedSource(): FeedSource {
  return {
    model: lastGoodModel,
    protocolModel: lastGoodProtocolModel,
    milestoneModel: lastGoodMilestoneModel,
    state: status.state,
    headBlock: status.lastSuccess?.headBlock ?? null,
    finishedIso: status.lastSuccess?.finishedIso ?? null,
    burnsAsOfBlock,
    lifecycleAsOfBlock,
  };
}

/** Address-free snapshot for the status route (structure is already safe). */
export function getBackboneStatus(): BackboneStatusSnapshot {
  return {
    module: "event-backbone",
    enabled: status.enabled,
    state: status.state,
    intervalSec: status.intervalSec,
    cycles: {
      ok: status.cyclesOk,
      partial: status.cyclesPartial,
      failed: status.cyclesFailed,
    },
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

async function runCycle(): Promise<string | null> {
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

  // ①b Protocol-event lane (M4-c): burns + registry lifecycle, cursor-resumed
  // toward the SAME head the sale scan saw, within this cycle's block budget.
  // ISOLATED: a stream fault is recorded (its cursor sits at the last
  // persisted chunk) but NEVER darkens the seat lane or the serving state —
  // the persisted prefix is gapless and serves honestly with its own asOf.
  if (summary.head === null) {
    throw new Error("scan summary carries no head block — cycle aborted");
  }
  const protocolStreams: ProtocolScanStreamSummary[] =
    await runProtocolEventScan(transport, summary.head);
  const protocolEventsInserted = protocolStreams.reduce(
    (acc, s) => acc + s.rowsInserted,
    0,
  );
  const streamFaults = protocolStreams.filter((s) => s.status === "error");

  // ② Incremental Protocol Time enrichment (new blocks only, witness-checked;
  // covers BOTH raw lanes).
  const enrich = await enrichMissingBlockTimestamps(transport);

  // ③ Rebuild the read-models in memory (pure, fail-closed, address-safe out).
  const { input } = await loadActivityHeartbeatInput();
  const model = buildActivityHeartbeatReadModel(input);
  if (!model.consistent) {
    throw new Error("activity read-model rebuild is not consistent — cycle failed closed");
  }
  const report = toAddressSafeActivityReport(model);

  // ③b The protocol-event read-model (burn ledger + lifecycle + liquidity +
  // archive lines — H1a, the complete heartbeat arc). The founder label set:
  // the FOUNDER allocation wallet PLUS the protocol's own routing wallets
  // (vault / liquidity / operations — infra pipes per the Visibility Law;
  // the founder's public acts flow through them). THE FOUNDER VOICE RULE
  // (founder correction 2, 2026-07-15): skin in the game is the trust engine —
  // founder acts SAY the founder. A label decision made HERE, server-side;
  // no address ever leaves the zone.
  const founderAddresses = new Set([
    ...FINANCIAL_TARGETS.allocationWallets
      .filter((w) => w.key === "FOUNDER")
      .map((w) => w.address.toLowerCase()),
    FINANCIAL_TARGETS.vaultWallet.toLowerCase(),
    FINANCIAL_TARGETS.liquidityWallet.toLowerCase(),
    FINANCIAL_TARGETS.operationsWallet.toLowerCase(),
  ]);
  const protocolRows = await loadProtocolEventRows();
  const protocolModel = buildProtocolEventReadModel({
    expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
    burns: protocolRows.burns,
    lifecycle: protocolRows.lifecycle,
    lpLiquidity: protocolRows.lpLiquidity,
    lpTokenMints: protocolRows.lpTokenMints,
    archiveMints: protocolRows.archiveMints,
    archivePauses: protocolRows.archivePauses,
    blockTimestamps: input.blockTimestamps,
    founderAddresses,
    // H1a-fix: the pair's immutable token0 orientation (canon pin, chain-
    // verified 2026-07-15 — token0 is USDC). Never assumed in the read-model.
    lpToken0IsSyn: FINANCIAL_TARGETS.lpPairToken0 === "SYN",
  });

  // ③b2 The milestone read-model (H2-⑬) — derived GAPLESSLY from the two
  // lanes above, no new persistence. The live memberCount + inflow reads are
  // OVERCLAIM PROTECTION only (5 eth_calls, fail-soft): unavailable reads
  // never darken the model — the builder notes the posture honestly; a
  // contradiction WITHHOLDS the contradicted milestone, fail-closed.
  let milestoneModel: MilestoneBuildResult | null = null;
  let milestoneFault: string | null = null;
  try {
    let liveMemberCount: number | null = null;
    let liveInflowAggregateRaw: string | null = null;
    try {
      const mcDec = decodeUint256Decimal(
        await ethCall(
          transport,
          FINANCIAL_TARGETS.memberCountEngine.address,
          SELECTOR_MEMBER_COUNT,
        ),
      );
      const mcNum = mcDec !== null ? Number(mcDec) : NaN;
      liveMemberCount = Number.isSafeInteger(mcNum) ? mcNum : null;

      let inflowSum = 0n;
      let inflowOk = true;
      for (const t of FINANCIAL_TARGETS.inflows) {
        const selector =
          t.view === "totalUsdcRaised"
            ? SELECTOR_TOTAL_USDC_RAISED
            : SELECTOR_TOTAL_GROSS_USDC;
        const dec = decodeUint256Decimal(
          await ethCall(transport, t.address, selector),
        );
        if (dec === null) {
          inflowOk = false;
          break;
        }
        inflowSum += BigInt(dec);
      }
      liveInflowAggregateRaw = inflowOk ? inflowSum.toString(10) : null;
    } catch {
      liveMemberCount = null;
      liveInflowAggregateRaw = null;
    }
    milestoneModel = buildMilestoneReadModel({
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents: input.rawEvents,
      blockTimestamps: input.blockTimestamps,
      archiveMintItems: protocolModel.archiveMintItems,
      liveMemberCount,
      liveInflowAggregateRaw,
    });
  } catch (err) {
    milestoneFault = err instanceof Error ? err.message : String(err);
  }

  // ③c The introduction read-model refresh (M0) — ISOLATED like the protocol
  // lane: a fault or an honest skip never darkens the heartbeat; the previous
  // live model (or the committed snapshot) keeps serving the standing reads.
  let introRefresh: IntroductionRefreshSummary | null = null;
  let introFault: string | null = null;
  try {
    introRefresh = await refreshIntroductionModel(transport, summary.head);
  } catch (err) {
    introFault = err instanceof Error ? err.message : String(err);
  }

  lastGoodModel = model;
  lastGoodProtocolModel = protocolModel;
  // H2-⑬: a milestone fault keeps the previous good milestone model (the
  // heartbeat itself is never darkened by the derived layer).
  if (milestoneModel !== null) lastGoodMilestoneModel = milestoneModel;
  burnsAsOfBlock =
    protocolStreams.find((s) => s.streamKey === "SYN_BURN")?.cursorBlock ??
    burnsAsOfBlock;
  lifecycleAsOfBlock =
    protocolStreams.find((s) => s.streamKey === "SOURCE_LIFECYCLE")
      ?.cursorBlock ?? lifecycleAsOfBlock;

  status.lastSuccess = {
    finishedIso: new Date().toISOString(), // ops metadata, never chain truth
    headBlock: summary.head,
    unitsOk: summary.units.length,
    unitsError: 0,
    eventsInserted,
    protocolEventsInserted,
    timestampsInserted: enrich.inserted,
    units: summarizeUnits(summary),
    protocolStreams: protocolStreams.map((s) => ({
      streamKey: s.streamKey,
      status: s.status,
      cursorBlock: s.cursorBlock,
      caughtUp: s.caughtUp,
      rowsInserted: s.rowsInserted,
    })),
    burnLedgerTotal: protocolModel.totals.burns,
    lifecycleTotal: protocolModel.totals.lifecycle,
    introductionRefresh: introRefresh
      ? {
          refreshed: introRefresh.refreshed,
          skippedReason: introRefresh.skippedReason,
          asOfBlock: introRefresh.asOfBlock,
          attributedRows: introRefresh.attributedRows,
          distinctSources: introRefresh.distinctSources,
        }
      : null,
    readModel: report,
  };

  // A stream/refresh fault makes the cycle PARTIAL — everything above still serves.
  const partialNotes: string[] = [];
  if (streamFaults.length > 0) {
    partialNotes.push(
      `${streamFaults.length} protocol stream(s) faulted — catch-up resumes from the persisted cursor`,
    );
  }
  if (introFault !== null) {
    partialNotes.push(
      "introduction refresh faulted — the previous model keeps serving",
    );
  }
  if (milestoneFault !== null) {
    partialNotes.push(
      "milestone derivation faulted — the previous milestone model keeps serving",
    );
  }
  return partialNotes.length > 0 ? partialNotes.join(" · ") : null;
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
    const partial = await runCycle();
    if (partial !== null) {
      // The serving state refreshed; a protocol stream is still catching up
      // or faulted — honest middle state, never a dark site.
      status.cyclesPartial += 1;
      status.lastError = {
        atIso: new Date().toISOString(),
        message: toSafeErrorMessage(new Error(partial)),
      };
      logger.warn(
        { backbone: { cyclesPartial: status.cyclesPartial, note: status.lastError.message } },
        "backbone cycle PARTIAL (serving state refreshed; protocol lane resumes next cycle)",
      );
    } else {
      status.cyclesOk += 1;
      logger.info(
        {
          backbone: {
            cyclesOk: status.cyclesOk,
            eventsInserted: status.lastSuccess?.eventsInserted,
            protocolEventsInserted: status.lastSuccess?.protocolEventsInserted,
            timestampsInserted: status.lastSuccess?.timestampsInserted,
            headBlock: status.lastSuccess?.headBlock,
          },
        },
        "backbone cycle OK",
      );
    }
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
