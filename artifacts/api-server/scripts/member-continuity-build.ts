/**
 * Member Continuity Builder — S3a DRY-RUN + S3b FOUNDER-ARMED WRITE (SERVER-ONLY).
 * -------------------------------------------------------------------------
 * Derives the member-continuity read-model with READ-ONLY selects, shapes
 * the EXACT `member_continuity_record` / `member_continuity_verification_run`
 * rows in memory, reconciles them against the live read-only `memberCount()`
 * view, verifies determinism (rebuild + input-order + full-pipeline hash
 * stability), and prints ONLY an aggregate, address-safe report.
 *
 * HARD RULES:
 *   - Default posture is dry-run / no-write. The S3b write path exists ONLY
 *     behind BOTH the --write script mode AND the exact founder arming env
 *     value — and even then persists ONLY a fully green VERIFIED build,
 *     freshly rebuilt at write time (never a stored/stale hash).
 *   - The write is ONE transaction (run row + full record set) with
 *     in-transaction post-insert verification; any anomaly throws →
 *     rollback. Failed builds are never memorialized. No partial state.
 *     No upsert / ON CONFLICT — replay semantics are explicit instead:
 *     exact replay (same provenance + same hash) no-ops; same provenance
 *     with a different hash hard-fails; grown provenance performs a full
 *     derived rebuild under the same verified rules; anything else fails.
 *   - Never print wallets, transaction hashes, proofs, decodedJson or
 *     rawJson. The report is self-scanned fail-closed before printing.
 *   - The Routed fold whitelist maps EXACTLY three amounts; the gated
 *     referral/source namespace is structurally excluded (the fold input
 *     type has no such field — see RoutedRowInput).
 *   - Exit non-zero unless gate + reconciliation + determinism + DDL
 *     preflight (incl. live memberCount match) are all green.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run member-continuity:dry-run
 *   MEMBER_CONTINUITY_WRITE_APPROVED=I_APPROVE_S3B_WRITE \
 *     pnpm --filter @workspace/api-server run member-continuity:write
 */

import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  resolveEndpoints,
} from "../src/lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../src/lib/protocol/evmRead";
import { CONTRACT_TARGETS } from "../src/data/protocolTargets";
import { PART_B_EXPECTATIONS } from "../src/data/partBExpectations";
import {
  buildMemberContinuityReadModel,
  toAddressSafeReport,
  assertAddressSafeJson,
  type BuildInput,
  type BlockTimestampCopyInput,
  type DdlProjection,
  type DdlRecordShape,
  type DdlRunShape,
  type HistoricalMemberInput,
  type RoutedRowInput,
  type SaleGeneration,
  type V2PurchaseRowInput,
  type V3PurchaseEventInput,
} from "./member-continuity-readmodel";
import type {
  MemberContinuityRecordInsert,
  MemberContinuityVerificationRunInsert,
} from "@workspace/db";

/**
 * Version label recorded in the run row (code provenance only — deliberately
 * EXCLUDED from the determinism hash, so a version bump never drifts it).
 */
const BUILDER_VERSION = "member-continuity-builder/1.1.0-s3b";

/**
 * keccak256("memberCount()")[0..4] — read-only view selector on the active
 * V3 engine. Reconciled mechanically against canon by the guard (viem
 * toFunctionSelector), same precedent as PART_B_EXPECTATIONS.selector.
 */
const MEMBER_COUNT_SELECTOR = "0x11aee380";

// ---------------------------------------------------------------------------
// S3b persistence gate — FOUNDER-ARMED WRITE MODE (approved S3b slice).
// Default posture stays dry-run/no-write. The write path is reachable ONLY
// behind BOTH the --write script mode AND the exact arming value below.
// ---------------------------------------------------------------------------

type RunMode = "DRY_RUN" | "WRITE";

/** The founder arming variable — must equal the exact approval value. */
const WRITE_ARMING_ENV = "MEMBER_CONTINUITY_WRITE_APPROVED";
const WRITE_ARMING_VALUE = "I_APPROVE_S3B_WRITE";

function resolveMode(): RunMode {
  const dry = process.argv.includes("--dry-run");
  const write = process.argv.includes("--write");
  if (dry === write) {
    console.error(
      "[FAIL] exactly one mode flag is required: --dry-run (default no-write posture) or --write (founder-armed S3b persistence)",
    );
    process.exit(1);
  }
  if (write && process.env[WRITE_ARMING_ENV] !== WRITE_ARMING_VALUE) {
    console.error(
      `[FAIL] S3B_WRITE_NOT_ARMED: --write refused — ${WRITE_ARMING_ENV} is not set to the exact founder approval value.`,
    );
    process.exit(1);
  }
  return write ? "WRITE" : "DRY_RUN";
}

/** Aggregate-only outcome of an armed write attempt (NO row material). */
interface PersistOutcome {
  readonly action: "INITIAL_WRITE" | "GROWN_PROVENANCE_REBUILD" | "REPLAY_NOOP";
  readonly runId: number | null;
  readonly recordsWritten: number;
  readonly recordsDeleted: number;
  readonly priorRunCount: number;
  readonly priorRecordCount: number;
  readonly dbRunCount: number;
  readonly dbRecordCount: number;
}

/** The ONLY write adapter shape. Armed exclusively by `armPersistence`. */
interface ContinuityPersistence {
  readonly persistVerifiedBuild: (
    ddl: DdlProjection,
  ) => Promise<PersistOutcome>;
}

/**
 * VERIFIED-only persistence: one transaction, explicit replay semantics,
 * in-transaction post-insert verification, rollback on any anomaly.
 * No upsert / ON CONFLICT anywhere — divergence is a hard failure, never a
 * silent merge.
 */
async function persistVerifiedBuild(
  ddl: DdlProjection,
): Promise<PersistOutcome> {
  const dbm = await import("@workspace/db");
  const { desc, eq, sql } = await import("drizzle-orm");
  const run = ddl.run;

  // Fail-closed re-assertions (defense in depth — never trust the caller).
  if (!ddl.persistenceEligible) {
    throw new Error("S3B write refused: build is not persistence-eligible");
  }
  if (
    run.onchainMemberCount === null ||
    run.onchainMemberCount !== run.memberTotal
  ) {
    throw new Error(
      "S3B write refused: live memberCount() reconciliation is not green at write time",
    );
  }
  if (run.status !== "VERIFIED" || ddl.records.length !== run.memberTotal) {
    throw new Error(
      "S3B write refused: run shape is not VERIFIED or record cardinality drifted",
    );
  }
  if (ddl.records.length === 0) {
    throw new Error("S3B write refused: empty record set is unwritable");
  }

  const chainId = run.chainId;
  const runTable = dbm.memberContinuityVerificationRun;
  const recTable = dbm.memberContinuityRecord;

  const priorRunRows = await dbm.db
    .select({ c: sql<number>`count(*)::int` })
    .from(runTable)
    .where(eq(runTable.chainId, chainId));
  const priorRunCount = priorRunRows[0]?.c ?? 0;
  const priorRecRows = await dbm.db
    .select({ c: sql<number>`count(*)::int` })
    .from(recTable)
    .where(eq(recTable.chainId, chainId));
  const priorRecordCount = priorRecRows[0]?.c ?? 0;
  const latestRows = await dbm.db
    .select()
    .from(runTable)
    .where(eq(runTable.chainId, chainId))
    .orderBy(desc(runTable.id))
    .limit(1);
  const latest = latestRows[0] ?? null;

  // --- Replay semantics (explicit, fail-closed) ---
  if (latest === null) {
    if (priorRecordCount !== 0) {
      throw new Error(
        `S3B write refused (ORPHAN_ROWS_ANOMALY): ${priorRecordCount} record rows exist with no verification run — founder review required`,
      );
    }
  } else {
    const sameProvenance =
      latest.inputSaleEventCount === run.inputSaleEventCount &&
      (latest.inputMaxSaleEventRawId ?? null) ===
        (run.inputMaxSaleEventRawId ?? null);
    if (sameProvenance) {
      if (latest.determinismHash === run.determinismHash) {
        if (priorRecordCount !== latest.memberTotal) {
          throw new Error(
            "S3B replay refused (COUNT_ANOMALY): stored record count does not match the memorialized run total",
          );
        }
        return {
          action: "REPLAY_NOOP",
          runId: null,
          recordsWritten: 0,
          recordsDeleted: 0,
          priorRunCount,
          priorRecordCount,
          dbRunCount: priorRunCount,
          dbRecordCount: priorRecordCount,
        };
      }
      throw new Error(
        "S3B write refused (HASH_DRIFT_SAME_PROVENANCE): identical input provenance produced a different determinism hash — hard fail, founder review required",
      );
    }
    const grown =
      run.inputSaleEventCount > latest.inputSaleEventCount &&
      (run.inputMaxSaleEventRawId ?? 0) > (latest.inputMaxSaleEventRawId ?? 0);
    if (!grown) {
      throw new Error(
        "S3B write refused (PROVENANCE_SHRUNK_OR_DIVERGED): input provenance is not a strict growth of the memorialized provenance — hard fail",
      );
    }
  }
  const action: PersistOutcome["action"] =
    latest === null ? "INITIAL_WRITE" : "GROWN_PROVENANCE_REBUILD";

  const runInsert: MemberContinuityVerificationRunInsert = {
    chainId: run.chainId,
    status: run.status,
    freezeBlock: run.freezeBlock,
    freezeRoot: run.freezeRoot,
    memberTotal: run.memberTotal,
    historicalCount: run.historicalCount,
    v3Count: run.v3Count,
    onchainMemberCount: run.onchainMemberCount,
    determinismHash: run.determinismHash,
    inputSaleEventCount: run.inputSaleEventCount,
    inputMaxSaleEventRawId: run.inputMaxSaleEventRawId,
    builderVersion: run.builderVersion,
    verification: run.verification,
  };

  // --- ONE transaction: run row + full record set + in-tx verification ---
  return await dbm.db.transaction(async (tx) => {
    const insertedRun = await tx
      .insert(runTable)
      .values(runInsert)
      .returning({ id: runTable.id });
    const runId = insertedRun[0]?.id;
    if (typeof runId !== "number") {
      throw new Error("S3B write rollback: run row insert returned no id");
    }
    let recordsDeleted = 0;
    if (action === "GROWN_PROVENANCE_REBUILD") {
      const deleted = await tx
        .delete(recTable)
        .where(eq(recTable.chainId, chainId))
        .returning({ memberNumber: recTable.memberNumber });
      recordsDeleted = deleted.length;
    }
    const recordInserts: MemberContinuityRecordInsert[] = ddl.records.map(
      (r) => ({
        chainId: r.chainId,
        memberNumber: r.memberNumber,
        generation: r.generation,
        numberingAuthority: r.numberingAuthority,
        freezeBlock: r.freezeBlock,
        entryWallet: r.entryWallet,
        entryBlock: r.entryBlock,
        entryLogIndex: r.entryLogIndex,
        entryTransaction: r.entryTransaction,
        entryFirstSeat: r.entryFirstSeat,
        entryBlockTimestampSec: r.entryBlockTimestampSec,
        entryRoutedFold: r.entryRoutedFold,
        saleEventRawId: r.saleEventRawId,
        buildId: runId,
      }),
    );
    await tx.insert(recTable).values(recordInserts);

    // Post-insert verification — any mismatch throws → full rollback.
    const recAfterRows = await tx
      .select({ c: sql<number>`count(*)::int` })
      .from(recTable)
      .where(eq(recTable.chainId, chainId));
    const dbRecordCount = recAfterRows[0]?.c ?? -1;
    const recForBuildRows = await tx
      .select({ c: sql<number>`count(*)::int` })
      .from(recTable)
      .where(eq(recTable.buildId, runId));
    const recForBuild = recForBuildRows[0]?.c ?? -1;
    const runAfterRows = await tx
      .select({ c: sql<number>`count(*)::int` })
      .from(runTable)
      .where(eq(runTable.chainId, chainId));
    const dbRunCount = runAfterRows[0]?.c ?? -1;
    if (
      dbRecordCount !== run.memberTotal ||
      recForBuild !== run.memberTotal ||
      dbRunCount !== priorRunCount + 1
    ) {
      throw new Error(
        "S3B write rollback: post-insert verification failed (row counts did not reconcile)",
      );
    }
    return {
      action,
      runId,
      recordsWritten: recordInserts.length,
      recordsDeleted,
      priorRunCount,
      priorRecordCount,
      dbRunCount,
      dbRecordCount,
    };
  });
}

/** Persistence is armed ONLY in write mode with the exact arming value. */
function armPersistence(mode: RunMode): ContinuityPersistence | null {
  if (mode !== "WRITE") return null;
  if (process.env[WRITE_ARMING_ENV] !== WRITE_ARMING_VALUE) return null;
  return { persistVerifiedBuild };
}

// ---------------------------------------------------------------------------
// Type-level DDL conformance (compile-time only — NEVER EXECUTED).
// Proves the pure builder's shapes are assignable to the real Drizzle
// $inferInsert types, so the dry-run rows ARE the DDL rows byte-for-byte
// (minus DB-owned id/buildId/timestamps). tsc enforces this on every check.
// ---------------------------------------------------------------------------

function _assertDdlShapesMatchSchema(
  r: DdlRecordShape,
  run: DdlRunShape,
): { record: MemberContinuityRecordInsert; run: MemberContinuityVerificationRunInsert } {
  if (run.onchainMemberCount === null) {
    // NOT NULL column — an unavailable live read is unwritable (fail closed).
    throw new Error("unwritable: live memberCount unavailable");
  }
  const record: MemberContinuityRecordInsert = {
    chainId: r.chainId,
    memberNumber: r.memberNumber,
    generation: r.generation,
    numberingAuthority: r.numberingAuthority,
    freezeBlock: r.freezeBlock,
    entryWallet: r.entryWallet,
    entryBlock: r.entryBlock,
    entryLogIndex: r.entryLogIndex,
    entryTransaction: r.entryTransaction,
    entryFirstSeat: r.entryFirstSeat,
    entryBlockTimestampSec: r.entryBlockTimestampSec,
    entryRoutedFold: r.entryRoutedFold,
    saleEventRawId: r.saleEventRawId,
    buildId: 0, // placeholder: a real buildId exists only after an approved S3b write
  };
  const runRow: MemberContinuityVerificationRunInsert = {
    chainId: run.chainId,
    status: run.status,
    freezeBlock: run.freezeBlock,
    freezeRoot: run.freezeRoot,
    memberTotal: run.memberTotal,
    historicalCount: run.historicalCount,
    v3Count: run.v3Count,
    onchainMemberCount: run.onchainMemberCount,
    determinismHash: run.determinismHash,
    inputSaleEventCount: run.inputSaleEventCount,
    inputMaxSaleEventRawId: run.inputMaxSaleEventRawId,
    builderVersion: run.builderVersion,
    verification: run.verification,
  };
  return { record, run: runRow };
}
void _assertDdlShapesMatchSchema;

// ---------------------------------------------------------------------------
// Helpers (shared conventions with member-continuity-derive.ts).
// ---------------------------------------------------------------------------

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

function toOptString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

/** Raw base-unit amount as an EXACT decimal string (never a number). */
function toAmountString(value: unknown, label: string): string {
  const s = String(value ?? "");
  if (!/^[0-9]+$/.test(s)) {
    throw new Error(`expected raw base-unit decimal string for ${label}`);
  }
  return s;
}

/**
 * Display form of a 64-hex digest that cannot trip the bare-64-hex identity
 * scan (the scan is deliberately shape-based; a digest is safe but must not
 * look like a leaf/root). Full-hash equality is proven in memory.
 */
function splitHashDisplay(hash: string): string {
  return `sha256:${hash.slice(0, 16)}…${hash.slice(-16)}`;
}

async function countQuery(
  sqlText: string,
  params: readonly unknown[],
): Promise<number> {
  const { pool } = await import("@workspace/db");
  const res = await pool.query(sqlText, [...params]);
  return toInt(res.rows[0]?.count, "count query");
}

// ---------------------------------------------------------------------------
// Live read-only memberCount() (probe eth_chainId FIRST; failure = null).
// ---------------------------------------------------------------------------

async function readOnchainMemberCount(): Promise<{
  readonly value: number | null;
  readonly note: string;
}> {
  const transport = makeFetchTransport(resolveEndpoints(), DEFAULT_TIMEOUT_MS);
  const probe = await probeChain(transport);
  if (!probe.rpcReachable || !probe.chainIdOk) {
    return {
      value: null,
      note: probe.rpcReachable ? "wrong chain" : "rpc unreachable",
    };
  }
  const target = CONTRACT_TARGETS.find(
    (t) => t.key === PART_B_EXPECTATIONS.authorityEngineKey,
  );
  if (!target) {
    return { value: null, note: "authority engine target missing" };
  }
  try {
    const raw = await ethCall(transport, target.address, MEMBER_COUNT_SELECTOR);
    if (typeof raw !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(raw)) {
      return { value: null, note: "eth_call result not uint256" };
    }
    const big = BigInt(raw);
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
      return { value: null, note: "memberCount out of safe integer range" };
    }
    return { value: Number(big), note: "ok" };
  } catch {
    return { value: null, note: "eth_call failed" };
  }
}

// ---------------------------------------------------------------------------
// Main (dry-run default; write only when founder-armed).
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const mode = resolveMode();
  const persistence = armPersistence(mode);
  if (mode !== "WRITE" && persistence !== null) {
    throw new Error(
      "invariant violated: dry-run mode can never hold a persistence adapter",
    );
  }

  const db = await import("@workspace/db");
  const { asc, and, eq } = await import("drizzle-orm");

  // --- Part B: verified freeze + historical members (read-only) ---
  const freezeRows = await db.db
    .select()
    .from(db.historicalMemberFreeze)
    .orderBy(asc(db.historicalMemberFreeze.freezeBlock));
  if (freezeRows.length !== 1) {
    console.error(
      `[FAIL] expected exactly 1 verified freeze row, found ${freezeRows.length}`,
    );
    process.exit(1);
  }
  const freezeRow = freezeRows[0]!;

  const memberRows = await db.db
    .select({
      chainId: db.historicalMember.chainId,
      freezeBlock: db.historicalMember.freezeBlock,
      memberNumber: db.historicalMember.memberNumber,
      wallet: db.historicalMember.wallet,
      source: db.historicalMember.source,
      firstBlock: db.historicalMember.firstBlock,
      logIndex: db.historicalMember.logIndex,
      firstTransaction: db.historicalMember.firstTransaction,
    })
    .from(db.historicalMember)
    .orderBy(asc(db.historicalMember.memberNumber));

  const historicalMembers: HistoricalMemberInput[] = memberRows.map((m) => ({
    chainId: m.chainId,
    freezeBlock: m.freezeBlock,
    memberNumber: m.memberNumber,
    wallet: m.wallet,
    source: m.source as SaleGeneration,
    firstBlock: m.firstBlock,
    logIndex: m.logIndex,
    firstTransaction: m.firstTransaction,
  }));

  // --- Part A: raw V3 purchase rows WITH sale_event_raw lineage id ---
  const v3Rows = await db.db
    .select({
      id: db.saleEventRaw.id,
      chainId: db.saleEventRaw.chainId,
      generation: db.saleEventRaw.generation,
      eventName: db.saleEventRaw.eventName,
      blockNumber: db.saleEventRaw.blockNumber,
      logIndex: db.saleEventRaw.logIndex,
      transactionHash: db.saleEventRaw.transactionHash,
      decodedJson: db.saleEventRaw.decodedJson,
    })
    .from(db.saleEventRaw)
    .where(
      and(
        eq(db.saleEventRaw.chainId, freezeRow.chainId),
        eq(db.saleEventRaw.generation, "V3"),
        eq(db.saleEventRaw.eventName, "MembershipPurchasedV3"),
      ),
    )
    .orderBy(asc(db.saleEventRaw.blockNumber), asc(db.saleEventRaw.logIndex));

  const v3Purchases: V3PurchaseEventInput[] = v3Rows.map((r) => {
    const d = r.decodedJson as Record<string, unknown>;
    return {
      chainId: r.chainId,
      generation: r.generation,
      eventName: r.eventName,
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      transactionHash: r.transactionHash,
      memberNumber: toInt(d.memberNumber, "decoded memberNumber"),
      firstSeat: toBool(d.firstSeat, "decoded firstSeat"),
      buyerWallet: String(d.buyer ?? ""),
      recipientWallet: String(d.recipient ?? ""),
      era: toOptString(d.era),
      chapter: toOptString(d.chapter),
      receiptId: toOptString(d.receiptId),
      receiptVersion: toOptString(d.receiptVersion),
      saleEventRawId: r.id,
    };
  });

  // --- Part A: ALL raw V2A/V2B Purchased rows (opaque pairing tokens only) ---
  const v2Rows = await db.db
    .select({
      chainId: db.saleEventRaw.chainId,
      generation: db.saleEventRaw.generation,
      eventName: db.saleEventRaw.eventName,
      blockNumber: db.saleEventRaw.blockNumber,
      logIndex: db.saleEventRaw.logIndex,
      transactionHash: db.saleEventRaw.transactionHash,
      decodedJson: db.saleEventRaw.decodedJson,
    })
    .from(db.saleEventRaw)
    .where(
      and(eq(db.saleEventRaw.chainId, freezeRow.chainId), eq(db.saleEventRaw.eventName, "Purchased")),
    )
    .orderBy(asc(db.saleEventRaw.blockNumber), asc(db.saleEventRaw.logIndex));

  const v2Purchases: V2PurchaseRowInput[] = v2Rows.map((r) => {
    const d = r.decodedJson as Record<string, unknown>;
    return {
      chainId: r.chainId,
      generation: r.generation,
      eventName: r.eventName,
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      transactionHash: r.transactionHash,
      memberNumberToken:
        d.memberNumber === null || d.memberNumber === undefined
          ? null
          : toInt(d.memberNumber, "decoded V2 pairing token"),
    };
  });

  // --- Part A: raw Routed rows. WHITELIST MAPPING: exactly the three fold
  // amounts. The gated referral/source namespace is DELIBERATELY never read
  // here and the fold input type cannot carry it (structural exclusion). ---
  const routedRawRows = await db.db
    .select({
      chainId: db.saleEventRaw.chainId,
      generation: db.saleEventRaw.generation,
      eventName: db.saleEventRaw.eventName,
      transactionHash: db.saleEventRaw.transactionHash,
      decodedJson: db.saleEventRaw.decodedJson,
    })
    .from(db.saleEventRaw)
    .where(
      and(eq(db.saleEventRaw.chainId, freezeRow.chainId), eq(db.saleEventRaw.eventName, "Routed")),
    )
    .orderBy(asc(db.saleEventRaw.blockNumber), asc(db.saleEventRaw.logIndex));

  const routedRows: RoutedRowInput[] = routedRawRows.map((r) => {
    const d = r.decodedJson as Record<string, unknown>;
    return {
      chainId: r.chainId,
      generation: r.generation,
      eventName: r.eventName,
      transactionHash: r.transactionHash,
      memberNumberToken:
        d.memberNumber === null || d.memberNumber === undefined
          ? null
          : toInt(d.memberNumber, "decoded Routed pairing token"),
      vaultAmount: toAmountString(d.vaultAmount, "vaultAmount"),
      liquidityAmount: toAmountString(d.liquidityAmount, "liquidityAmount"),
      operationsAmount: toAmountString(d.operationsAmount, "operationsAmount"),
    };
  });

  // --- Protocol Time cache COPY (read-only; never fetched/enriched here) ---
  const tsRows = await db.db
    .select({
      chainId: db.blockTimestamp.chainId,
      blockNumber: db.blockTimestamp.blockNumber,
      blockTimestampSec: db.blockTimestamp.blockTimestampSec,
    })
    .from(db.blockTimestamp)
    .where(eq(db.blockTimestamp.chainId, freezeRow.chainId))
    .orderBy(asc(db.blockTimestamp.blockNumber));
  const blockTimestamps: BlockTimestampCopyInput[] = tsRows.map((t) => ({
    chainId: t.chainId,
    blockNumber: t.blockNumber,
    blockTimestampSec: t.blockTimestampSec,
  }));

  // --- Raw-input provenance + corroboration aggregates (counts only) ---
  const chainParam = [freezeRow.chainId] as const;
  const inputSaleEventCount = await countQuery(
    `select count(*)::int as count from sale_event_raw where chain_id = $1`,
    chainParam,
  );
  const maxIdRes = await (
    await import("@workspace/db")
  ).pool.query(
    `select coalesce(max(id), 0)::bigint as max_id from sale_event_raw where chain_id = $1`,
    [...chainParam],
  );
  const maxIdRaw = toInt(maxIdRes.rows[0]?.max_id, "max sale_event_raw id");
  const inputMaxSaleEventRawId = maxIdRaw === 0 ? null : maxIdRaw;

  const corroboration = {
    v1DistinctBuyerCount: await countQuery(
      `select count(distinct decoded_json->>'buyer')::int as count from sale_event_raw where chain_id = $1 and generation = 'V1'`,
      chainParam,
    ),
    v2aFirstSeatTrueCount: await countQuery(
      `select count(*)::int as count from sale_event_raw where chain_id = $1 and generation = 'V2A' and event_name = 'Purchased' and (decoded_json->>'firstSeat') = 'true' and (decoded_json->>'memberNumber')::int >= 1`,
      chainParam,
    ),
    v2bFirstSeatTrueNonSentinelCount: await countQuery(
      `select count(*)::int as count from sale_event_raw where chain_id = $1 and generation = 'V2B' and event_name = 'Purchased' and (decoded_json->>'firstSeat') = 'true' and (decoded_json->>'memberNumber')::int >= 1`,
      chainParam,
    ),
    v2bSentinelRowCount: await countQuery(
      `select count(*)::int as count from sale_event_raw where chain_id = $1 and generation = 'V2B' and event_name = 'Purchased' and (decoded_json->>'memberNumber')::int = 0`,
      chainParam,
    ),
  };

  // --- Live read-only memberCount() reconciliation target ---
  const onchain = await readOnchainMemberCount();

  const input: BuildInput = {
    freeze: {
      chainId: freezeRow.chainId,
      freezeBlock: freezeRow.freezeBlock,
      root: freezeRow.root,
      memberCount: freezeRow.memberCount,
      validationStatus: freezeRow.validationStatus,
    },
    historicalMembers,
    v3Purchases,
    corroboration,
    ddl: {
      v2Purchases,
      routedRows,
      blockTimestamps,
      onchainMemberCount: onchain.value,
      inputSaleEventCount,
      inputMaxSaleEventRawId,
      builderVersion: BUILDER_VERSION,
    },
  };

  // --- Build + determinism (rebuild, input-order, DDL hash stability) ---
  const first = buildMemberContinuityReadModel(input);
  const second = buildMemberContinuityReadModel(input);
  const shuffled: BuildInput = {
    ...input,
    historicalMembers: [...historicalMembers].reverse(),
    v3Purchases: [...v3Purchases].reverse(),
    ddl: {
      ...input.ddl!,
      v2Purchases: [...v2Purchases].reverse(),
      routedRows: [...routedRows].reverse(),
      blockTimestamps: [...blockTimestamps].reverse(),
    },
  };
  const third = buildMemberContinuityReadModel(shuffled);

  // Record-level comparisons happen in memory only — never serialized out.
  const rebuildIdentical = JSON.stringify(first) === JSON.stringify(second);
  const orderIndependent = JSON.stringify(first) === JSON.stringify(third);
  const hashes = [first, second, third].map(
    (b) => b.ddl?.run.determinismHash ?? "",
  );
  const hashStable =
    hashes[0] !== "" && hashes.every((h) => h === hashes[0]);

  const ddl = first.ddl;
  const ok =
    first.gatePassed &&
    first.consistent &&
    rebuildIdentical &&
    orderIndependent &&
    hashStable &&
    ddl !== undefined &&
    ddl.persistenceEligible;

  let outcome: PersistOutcome | null = null;
  if (mode === "WRITE") {
    if (!ok || ddl === undefined || persistence === null) {
      console.error(
        "[FAIL] S3B write refused: preflight not fully green — failed builds are never memorialized (nothing written, no partial state).",
      );
      await (await import("@workspace/db")).pool.end();
      process.exit(1);
    }
    outcome = await persistence.persistVerifiedBuild(ddl);
  }

  const report = {
    slice: mode === "WRITE" ? "S3B_VERIFIED_WRITE" : "S3A_DDL_SHAPED_DRY_RUN",
    mode: mode === "WRITE" ? "FOUNDER_ARMED_WRITE" : "DRY_RUN_ONLY",
    persistenceGate:
      mode === "WRITE"
        ? "ARMED — founder-approved S3b (--write + exact env arming); VERIFIED-only, one transaction, rollback on any anomaly"
        : "INERT in dry-run — S3b writes happen ONLY via the founder-armed member-continuity:write script mode",
    ...toAddressSafeReport(first),
    ddlDryRun: ddl
      ? {
          recordsShaped: ddl.records.length,
          historical: first.totals.historical,
          postFreezeV3: first.totals.postFreezeV3,
          memberNumberRange: {
            min: first.continuity.min,
            max: first.continuity.max,
          },
          entryFirstSeatBuckets: {
            true: ddl.records.filter((r) => r.entryFirstSeat === "true")
              .length,
            unknown: ddl.records.filter((r) => r.entryFirstSeat === "unknown")
              .length,
          },
          foldSummary: ddl.foldSummary,
          timestampCoverage: ddl.timestampCoverage,
          onchainReconciliation: {
            readOk: onchain.value !== null,
            note: onchain.note,
            matches:
              onchain.value !== null &&
              onchain.value === ddl.records.length,
          },
          provenance: {
            inputSaleEventCount,
            inputMaxSaleEventRawId,
            builderVersion: BUILDER_VERSION,
          },
          determinismHash: splitHashDisplay(hashes[0]!),
          persistenceEligible: ddl.persistenceEligible,
          blockedReasons: ddl.blockedReasons,
        }
      : null,
    determinism: {
      rebuildIdentical,
      inputOrderIndependent: orderIndependent,
      determinismHashStable: hashStable,
    },
    writeOutcome: outcome
      ? {
          action: outcome.action,
          runId: outcome.runId,
          recordsWritten: outcome.recordsWritten,
          recordsDeleted: outcome.recordsDeleted,
          priorRunCount: outcome.priorRunCount,
          priorRecordCount: outcome.priorRecordCount,
          dbRunCount: outcome.dbRunCount,
          dbRecordCount: outcome.dbRecordCount,
        }
      : null,
  };

  const json = JSON.stringify(report, null, 2);
  assertAddressSafeJson(json);
  console.log(json);

  if (!ok) {
    console.error(
      "[FAIL] member-continuity build: gate/reconciliation/determinism/DDL-preflight not fully green (nothing persisted)",
    );
    await (await import("@workspace/db")).pool.end();
    process.exit(1);
  }
  if (mode === "WRITE" && outcome) {
    const summary =
      outcome.action === "REPLAY_NOOP"
        ? "exact replay (same provenance + same determinism hash) — NO-OP, zero rows written"
        : `${outcome.action} committed in one transaction — run #${outcome.runId}, ${outcome.recordsWritten} records written, ${outcome.recordsDeleted} replaced; DB now ${outcome.dbRunCount} runs / ${outcome.dbRecordCount} records`;
    console.error(`member-continuity write: OK — ${summary}.`);
  } else {
    console.error(
      `member-continuity dry-run: OK — ${first.totals.total} DDL-shaped records (${first.totals.historical} historical + ${first.totals.postFreezeV3} post-freeze V3), consistent, deterministic, NOTHING PERSISTED (writes require the founder-armed member-continuity:write mode).`,
    );
  }
  await (await import("@workspace/db")).pool.end();
}

main().catch((err) => {
  // Never echo row/payload material — message only.
  console.error(`[FAIL] member-continuity build: ${(err as Error).message}`);
  process.exit(1);
});
