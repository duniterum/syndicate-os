/**
 * Member Continuity Read-Model — SERVER-ONLY DERIVE + RECONCILE RUNNER.
 * ---------------------------------------------------------------------
 * Reads Part B (historical_member_freeze / historical_member) and Part A
 * (sale_event_raw) with READ-ONLY selects, feeds the pure builder in
 * ./member-continuity-readmodel.ts, verifies rebuild determinism, and prints
 * ONLY the address-safe report (counts, pass/fail, shortened root, aggregates).
 *
 * HARD RULES:
 *   - No writes of any kind (no insert/update/delete, no table, no migration).
 *   - Never print wallets, transaction hashes, proofs, decodedJson or rawJson.
 *   - Exit non-zero unless gate + reconciliation + determinism are all green.
 *   - On-chain root/memberCount reconciliation is NOT redone here: it is
 *     already enforced fail-closed by the Part B import gate and freeze gate
 *     (root triple-match). This slice adds no new RPC dependency.
 */

import {
  buildMemberContinuityReadModel,
  toAddressSafeReport,
  assertAddressSafeJson,
  type BuildInput,
  type HistoricalMemberInput,
  type V3PurchaseEventInput,
  type SaleGeneration,
} from "./member-continuity-readmodel";

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

async function countQuery(
  sqlText: string,
  params: readonly unknown[],
): Promise<number> {
  const { pool } = await import("@workspace/db");
  const res = await pool.query(sqlText, [...params]);
  return toInt(res.rows[0]?.count, "count query");
}

async function main(): Promise<void> {
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

  // --- Part A: raw V3 purchase rows (read-only; decoded fields mapped, never printed) ---
  const v3Rows = await db.db
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
    };
  });

  // --- Corroboration aggregates (counts only; corroborating, never numbering) ---
  const chainParam = [freezeRow.chainId] as const;
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
  };

  // --- Build + determinism verification (rebuild + input-order independence) ---
  const first = buildMemberContinuityReadModel(input);
  const second = buildMemberContinuityReadModel(input);
  const shuffled: BuildInput = {
    ...input,
    historicalMembers: [...historicalMembers].reverse(),
    v3Purchases: [...v3Purchases].reverse(),
  };
  const third = buildMemberContinuityReadModel(shuffled);

  // Record-level comparisons happen in memory only — never serialized to output.
  const rebuildIdentical =
    JSON.stringify(first) === JSON.stringify(second);
  const orderIndependent =
    JSON.stringify(first) === JSON.stringify(third);

  const report = {
    ...toAddressSafeReport(first),
    determinism: {
      rebuildIdentical,
      inputOrderIndependent: orderIndependent,
    },
    onchainReconciliation:
      "NOT_REDONE_HERE — root triple-match + memberCount already enforced fail-closed by the Part B import gate / freeze gate; this slice adds no new RPC dependency.",
    persistenceDecision:
      "DEFERRED — read-model derives in memory from Part A + Part B; no table, no migration, no writes (see design doc §15).",
  };

  const json = JSON.stringify(report, null, 2);
  assertAddressSafeJson(json);
  console.log(json);

  const ok =
    first.gatePassed && first.consistent && rebuildIdentical && orderIndependent;
  if (!ok) {
    console.error(
      "[FAIL] member-continuity derive: gate/reconciliation/determinism not fully green",
    );
    process.exit(1);
  }
  console.error(
    `member-continuity derive: OK — ${first.totals.total} records (${first.totals.historical} historical + ${first.totals.postFreezeV3} post-freeze V3), consistent, deterministic, nothing persisted.`,
  );
  await (await import("@workspace/db")).pool.end();
}

main().catch((err) => {
  // Never echo row/payload material — message only.
  console.error(`[FAIL] member-continuity derive: ${(err as Error).message}`);
  process.exit(1);
});
