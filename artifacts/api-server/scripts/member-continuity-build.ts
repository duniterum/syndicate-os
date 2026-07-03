/**
 * Member Continuity Builder — S3a DDL-SHAPED DRY-RUN RUNNER (SERVER-ONLY).
 * -------------------------------------------------------------------------
 * Founder-approved S3a slice: derives the member-continuity read-model with
 * READ-ONLY selects, shapes the EXACT would-be `member_continuity_record` /
 * `member_continuity_verification_run` rows in memory, reconciles them
 * against the live read-only `memberCount()` view, verifies determinism
 * (rebuild + input-order + full-pipeline hash stability), and prints ONLY an
 * aggregate, address-safe report. NOTHING IS PERSISTED.
 *
 * HARD RULES (S3a boundary):
 *   - `--dry-run` is the ONLY accepted mode. There is no write mode, no
 *     write flag, and no write adapter — persistence is a SEPARATE founder
 *     gate (S3b). The persistence slot below is an inert `null` constant.
 *   - No writes of any kind (no insert/update/delete, no table, no
 *     migration, no schema change). Read-only selects + one read-only
 *     eth_call (chainId probe first) only.
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

/** Version label recorded in the would-be run row (provenance only). */
const BUILDER_VERSION = "member-continuity-builder/1.0.0-s3a-dry-run";

/**
 * keccak256("memberCount()")[0..4] — read-only view selector on the active
 * V3 engine. Reconciled mechanically against canon by the guard (viem
 * toFunctionSelector), same precedent as PART_B_EXPECTATIONS.selector.
 */
const MEMBER_COUNT_SELECTOR = "0x11aee380";

// ---------------------------------------------------------------------------
// S3b persistence gate — INERT BY DESIGN. No write adapter exists in S3a.
// ---------------------------------------------------------------------------

/**
 * The ONLY shape a future S3b write adapter may take. S3a defines the
 * interface for reviewability and pins the slot to `null` — there is no
 * implementation, no write code, and no flag that can enable one.
 */
interface ContinuityPersistence {
  readonly persistVerifiedBuild: (ddl: DdlProjection) => Promise<void>;
}

/** S3B_NOT_APPROVED: permanently null in S3a. Never assign anything here. */
const persistence: ContinuityPersistence | null = null;

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
// Main (dry-run only).
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!process.argv.includes("--dry-run")) {
    console.error(
      "[FAIL] S3B_NOT_APPROVED: this builder has exactly one mode (--dry-run). No write mode exists.",
    );
    process.exit(1);
  }
  if (persistence !== null) {
    throw new Error(
      "S3B_NOT_APPROVED: a persistence adapter can never be active in S3a",
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
  const report = {
    slice: "S3A_DDL_SHAPED_DRY_RUN",
    mode: "DRY_RUN_ONLY",
    persistenceGate:
      "INERT_NULL — S3B_NOT_APPROVED (no write adapter exists; write approval is a separate founder gate)",
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
  };

  const json = JSON.stringify(report, null, 2);
  assertAddressSafeJson(json);
  console.log(json);

  const ok =
    first.gatePassed &&
    first.consistent &&
    rebuildIdentical &&
    orderIndependent &&
    hashStable &&
    ddl !== undefined &&
    ddl.persistenceEligible;
  if (!ok) {
    console.error(
      "[FAIL] member-continuity dry-run: gate/reconciliation/determinism/DDL-preflight not fully green (nothing was going to be persisted either way)",
    );
    await (await import("@workspace/db")).pool.end();
    process.exit(1);
  }
  console.error(
    `member-continuity dry-run: OK — ${first.totals.total} DDL-shaped records (${first.totals.historical} historical + ${first.totals.postFreezeV3} post-freeze V3), consistent, deterministic, NOTHING PERSISTED (S3B_NOT_APPROVED).`,
  );
  await (await import("@workspace/db")).pool.end();
}

main().catch((err) => {
  // Never echo row/payload material — message only.
  console.error(`[FAIL] member-continuity dry-run: ${(err as Error).message}`);
  process.exit(1);
});
