/**
 * THE CONTINUITY SPINE LANE — the verified member-continuity pipeline as a
 * backbone stage (2026-08-02, the founder's automation order: « il y a
 * maintenant 16 membres pourquoi ce n'est pas à jour?? ça doit marcher
 * automatiquement » — prod served 14 seats while the chain held 16, because
 * the spine was fed ONLY by the founder-armed script).
 * ---------------------------------------------------------------------------
 * This module is the ONE implementation of the S3a/S3b pipeline — the
 * founder-armed script (scripts/member-continuity-build.ts) imports from
 * here, and the backbone cycle calls refreshContinuitySpine() every cycle.
 * NOTHING about the write law changed when it moved:
 *   - the pure builder derives the WHOLE record set (Part B freeze roster +
 *     raw V3 firstSeat events; the EMITTED memberNumber is the numbering
 *     authority, never a counter);
 *   - determinism is proven at write time (rebuild ×2 + shuffled-input
 *     rebuild + hash stability);
 *   - the live read-only memberCount() must reconcile EXACTLY with the built
 *     record set or nothing is written;
 *   - persistence is ONE transaction (run row + full record set) with
 *     in-transaction post-insert verification; any anomaly throws → rollback;
 *   - replay semantics are explicit: exact replay (same provenance + same
 *     hash) no-ops; same provenance with a different hash hard-fails
 *     (HASH_DRIFT_SAME_PROVENANCE); grown provenance performs a full derived
 *     rebuild; shrunk/diverged provenance is refused. No upsert, ever.
 * The cycle-side entry adds ONLY a cheap short-circuit (current
 * sale_event_raw count + max id against the memorialized provenance) so the
 * common no-new-members cycle costs two count queries and zero writes.
 * Every returned line is address-safe (counts and action words only).
 */

import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { CONTRACT_TARGETS } from "../data/protocolTargets";
import { PART_B_EXPECTATIONS } from "../data/partBExpectations";
import {
  buildMemberContinuityReadModel,
  type BuildInput,
  type BlockTimestampCopyInput,
  type DdlProjection,
  type HistoricalMemberInput,
  type RoutedRowInput,
  type SaleGeneration,
  type V2PurchaseRowInput,
  type V3PurchaseEventInput,
} from "../lib/protocol/memberContinuityReadmodel";
import { SELECTOR_MEMBER_COUNT } from "../lib/protocol/financialDecoders";
import type {
  MemberContinuityRecordInsert,
  MemberContinuityVerificationRunInsert,
} from "@workspace/db";

/**
 * Version label recorded in the run row (code provenance only — deliberately
 * EXCLUDED from the determinism hash, so a version bump never drifts it).
 * Bumped 1.1.0 → 1.2.0 when the pipeline became the shared backbone lane.
 */
export const BUILDER_VERSION = "member-continuity-builder/1.2.0-backbone";

/**
 * keccak256("memberCount()")[0..4] — the ONE declaration lives in
 * financialDecoders (duplicate-facts law); re-exported here so the
 * member-continuity guard reconciles it against canon in place.
 */
export const MEMBER_COUNT_SELECTOR = SELECTOR_MEMBER_COUNT;

// ---------------------------------------------------------------------------
// Small coercers (fail-closed; shared by the loader below).
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

export async function readOnchainMemberCount(): Promise<{
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
// Input loader — every read-only select the verified build consumes.
// ---------------------------------------------------------------------------

export async function loadContinuityBuildInput(): Promise<BuildInput> {
  const db = await import("@workspace/db");
  const { asc, and, eq } = await import("drizzle-orm");

  // --- Part B: verified freeze + historical members (read-only) ---
  const freezeRows = await db.db
    .select()
    .from(db.historicalMemberFreeze)
    .orderBy(asc(db.historicalMemberFreeze.freezeBlock));
  if (freezeRows.length !== 1) {
    throw new Error(
      `expected exactly 1 verified freeze row, found ${freezeRows.length}`,
    );
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
      and(
        eq(db.saleEventRaw.chainId, freezeRow.chainId),
        eq(db.saleEventRaw.eventName, "Purchased"),
      ),
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
      and(
        eq(db.saleEventRaw.chainId, freezeRow.chainId),
        eq(db.saleEventRaw.eventName, "Routed"),
      ),
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

  return {
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
}

// ---------------------------------------------------------------------------
// Verified build — rebuild ×2 + shuffled-input rebuild + hash stability.
// ---------------------------------------------------------------------------

export interface VerifiedBuildResult {
  readonly first: ReturnType<typeof buildMemberContinuityReadModel>;
  readonly rebuildIdentical: boolean;
  readonly orderIndependent: boolean;
  readonly hashStable: boolean;
  readonly ok: boolean;
  readonly ddl: DdlProjection | undefined;
}

export function runVerifiedContinuityBuild(input: BuildInput): VerifiedBuildResult {
  const first = buildMemberContinuityReadModel(input);
  const second = buildMemberContinuityReadModel(input);
  const shuffled: BuildInput = {
    ...input,
    historicalMembers: [...input.historicalMembers].reverse(),
    v3Purchases: [...input.v3Purchases].reverse(),
    ddl: input.ddl
      ? {
          ...input.ddl,
          v2Purchases: [...input.ddl.v2Purchases].reverse(),
          routedRows: [...input.ddl.routedRows].reverse(),
          blockTimestamps: [...input.ddl.blockTimestamps].reverse(),
        }
      : undefined,
  };
  const third = buildMemberContinuityReadModel(shuffled);

  // Record-level comparisons happen in memory only — never serialized out.
  const rebuildIdentical = JSON.stringify(first) === JSON.stringify(second);
  const orderIndependent = JSON.stringify(first) === JSON.stringify(third);
  const hashes = [first, second, third].map(
    (b) => b.ddl?.run.determinismHash ?? "",
  );
  const hashStable = hashes[0] !== "" && hashes.every((h) => h === hashes[0]);
  const ddl = first.ddl;
  const ok =
    first.gatePassed &&
    first.consistent &&
    rebuildIdentical &&
    orderIndependent &&
    hashStable &&
    ddl !== undefined &&
    ddl.persistenceEligible;
  return { first, rebuildIdentical, orderIndependent, hashStable, ok, ddl };
}

// ---------------------------------------------------------------------------
// VERIFIED-only persistence — one transaction, explicit replay semantics,
// in-transaction post-insert verification, rollback on any anomaly.
// No upsert / ON CONFLICT anywhere — divergence is a hard failure, never a
// silent merge.
// ---------------------------------------------------------------------------

/** Aggregate-only outcome of a write attempt (NO row material). */
export interface PersistOutcome {
  readonly action: "INITIAL_WRITE" | "GROWN_PROVENANCE_REBUILD" | "REPLAY_NOOP";
  readonly runId: number | null;
  readonly recordsWritten: number;
  readonly recordsDeleted: number;
  readonly priorRunCount: number;
  readonly priorRecordCount: number;
  readonly dbRunCount: number;
  readonly dbRecordCount: number;
}

export async function persistVerifiedBuild(
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

// ---------------------------------------------------------------------------
// The cycle entry — cheap short-circuit, then the full verified pipeline.
// ---------------------------------------------------------------------------

export interface SpineRefreshSummary {
  readonly ok: boolean;
  readonly changed: boolean;
  /** Address-safe one-liner for the lane status (counts + action words). */
  readonly line: string;
}

export async function refreshContinuitySpine(): Promise<SpineRefreshSummary> {
  const dbm = await import("@workspace/db");
  const { desc, eq, sql } = await import("drizzle-orm");

  // Short-circuit: memorialized provenance vs current raw-input provenance.
  // Two count queries on the common cycle; the full load runs only on growth.
  const latestRows = await dbm.db
    .select({
      memberTotal: dbm.memberContinuityVerificationRun.memberTotal,
      inputSaleEventCount:
        dbm.memberContinuityVerificationRun.inputSaleEventCount,
      inputMaxSaleEventRawId:
        dbm.memberContinuityVerificationRun.inputMaxSaleEventRawId,
      chainId: dbm.memberContinuityVerificationRun.chainId,
    })
    .from(dbm.memberContinuityVerificationRun)
    .orderBy(desc(dbm.memberContinuityVerificationRun.id))
    .limit(1);
  const latest = latestRows[0] ?? null;
  if (latest !== null) {
    const curRows = await dbm.db
      .select({
        c: sql<number>`count(*)::int`,
        m: sql<number>`coalesce(max(id), 0)::int`,
      })
      .from(dbm.saleEventRaw)
      .where(eq(dbm.saleEventRaw.chainId, latest.chainId));
    const cur = curRows[0];
    if (
      cur !== undefined &&
      cur.c === latest.inputSaleEventCount &&
      (cur.m === 0 ? null : cur.m) === (latest.inputMaxSaleEventRawId ?? null)
    ) {
      return {
        ok: true,
        changed: false,
        line: `spine unchanged (${latest.memberTotal} records, provenance stable)`,
      };
    }
  }

  // Growth (or first run): the full verified pipeline, exactly the script's.
  const input = await loadContinuityBuildInput();
  const build = runVerifiedContinuityBuild(input);
  if (!build.ok || build.ddl === undefined) {
    const blocked =
      build.ddl?.blockedReasons?.join("; ") ??
      "gate/determinism/DDL preflight not green";
    // Failed builds are never memorialized — the lane reports and the next
    // cycle retries (an RPC blip on the live memberCount read lands here).
    return { ok: false, changed: false, line: `spine build not green: ${blocked}` };
  }
  const outcome = await persistVerifiedBuild(build.ddl);
  const line =
    outcome.action === "REPLAY_NOOP"
      ? `spine replay no-op (${outcome.dbRecordCount} records)`
      : `spine ${outcome.action} — run #${outcome.runId}, ${outcome.recordsWritten} records (${outcome.recordsDeleted} replaced), now ${outcome.dbRecordCount}`;
  return { ok: true, changed: outcome.action !== "REPLAY_NOOP", line };
}
