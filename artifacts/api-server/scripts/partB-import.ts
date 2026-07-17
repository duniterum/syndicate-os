/**
 * CLI: Part B historical-member freeze import — founder-approved, fail-closed.
 * ----------------------------------------------------------------------------
 * Drives the pure gate engine (`src/lib/protocol/partBImportGate.ts`) with:
 *   - the canonical artifact fetched IN-MEMORY, pinned to the authoring commit
 *     (never mutable `main`), never written to disk or the repo;
 *   - live Avalanche reads (eth_chainId probe FIRST, then the read-only
 *     `V1_MEMBER_ROOT()` eth_call on the V3 engine) — RPC failure = fail closed;
 *   - raw Part A reconciliation aggregates from sale_event_raw (server-only);
 *   - a single-transaction insert (1 freeze row + 8 member rows) with
 *     post-insert invariant checks;
 *   - exact-replay doctrine: existing rows must match field-by-field
 *     (no-op success) or the run HARD FAILS. Never ON CONFLICT DO NOTHING.
 *
 * PRIVACY: the printed report is address-safe by construction and re-checked
 * by assertAddressSafeAggregate before printing. Wallets/txs/proofs never leave the DB
 * boundary. Contract addresses stay inside protocolTargets (server-side).
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run partB:preflight  # gate only, no writes
 *   pnpm --filter @workspace/api-server run partB:import     # gate + one-time import
 *   pnpm --filter @workspace/api-server run partB:status     # address-safe DB status
 */

import { createHash } from "node:crypto";
import {
  DEFAULT_TIMEOUT_MS,
  assertAddressSafeAggregate,
  makeFetchTransport,
  resolveEndpoints,
} from "../src/lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../src/lib/protocol/evmRead";
import { CONTRACT_TARGETS } from "../src/data/protocolTargets";
import { PART_B_EXPECTATIONS } from "../src/data/partBExpectations";
import {
  compareExistingVsPlan,
  parseFreezeArtifact,
  runPartBGate,
  type ExistingFreezeRow,
  type ExistingMemberRow,
  type GateOutcome,
  type PartBLiveReads,
  type RawSaleAggregates,
} from "../src/lib/protocol/partBImportGate";

type Mode = "preflight" | "import" | "status";

const BYTES32_RE = /^0x[0-9a-fA-F]{64}$/;

function parseMode(argv: string[]): Mode {
  if (argv.includes("--import")) return "import";
  if (argv.includes("status")) return "status";
  return "preflight";
}

function shortRoot(root: string | null | undefined): string {
  if (!root || root.length < 14) return "(none)";
  return `${root.slice(0, 10)}…${root.slice(-6)}`;
}

async function fetchPinned(path: string): Promise<string> {
  const { repo, commitSha } = PART_B_EXPECTATIONS.artifact;
  const url = `https://raw.githubusercontent.com/${repo}/${commitSha}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `pinned artifact fetch failed (${res.status}) for ${path} @ ${commitSha.slice(0, 8)}`,
    );
  }
  return res.text();
}

async function readLive(): Promise<PartBLiveReads> {
  const transport = makeFetchTransport(resolveEndpoints(), DEFAULT_TIMEOUT_MS);
  // Doctrine: probe eth_chainId BEFORE any eth_call.
  const probe = await probeChain(transport);
  if (!probe.rpcReachable || !probe.chainIdOk) {
    return {
      probe,
      onChainRoot: null,
      liveReadError: probe.rpcReachable ? "wrong chain" : "rpc unreachable",
    };
  }
  const target = CONTRACT_TARGETS.find(
    (t) => t.key === PART_B_EXPECTATIONS.authorityEngineKey,
  );
  if (!target) {
    return { probe, onChainRoot: null, liveReadError: "authority engine target missing" };
  }
  try {
    const raw = await ethCall(transport, target.address, PART_B_EXPECTATIONS.selector);
    if (typeof raw !== "string" || !BYTES32_RE.test(raw)) {
      return { probe, onChainRoot: null, liveReadError: "eth_call result not bytes32" };
    }
    return { probe, onChainRoot: raw, liveReadError: null };
  } catch {
    return { probe, onChainRoot: null, liveReadError: "eth_call failed" };
  }
}

type Db = Awaited<ReturnType<typeof loadDb>>;

async function loadDb() {
  const mod = await import("@workspace/db");
  const { sql, and, eq, asc } = await import("drizzle-orm");
  return {
    db: mod.db,
    pool: mod.pool,
    historicalMemberFreeze: mod.historicalMemberFreeze,
    historicalMember: mod.historicalMember,
    sql,
    and,
    eq,
    asc,
  };
}

async function readRawAggregates(d: Db): Promise<RawSaleAggregates> {
  const { db, sql } = d;
  const one = async <T>(q: ReturnType<typeof sql>): Promise<T[]> => {
    const res = await db.execute(q);
    return res.rows as T[];
  };
  const total = await one<{ cnt: number }>(
    sql`select count(*)::int as cnt from sale_event_raw`,
  );
  const v1Cnt = await one<{ cnt: number }>(
    sql`select count(*)::int as cnt from sale_event_raw
        where generation = 'V1' and event_name = 'TokensPurchased'`,
  );
  const v1Buyers = await one<{ b: string }>(
    sql`select distinct lower(decoded_json->>'buyer') as b from sale_event_raw
        where generation = 'V1' and event_name = 'TokensPurchased'
          and decoded_json->>'buyer' is not null`,
  );
  const v2a = await one<{ n: number }>(
    sql`select distinct (decoded_json->>'memberNumber')::int as n from sale_event_raw
        where generation = 'V2A' and event_name = 'Purchased'
          and (decoded_json->>'firstSeat')::boolean is true`,
  );
  const v2b = await one<{ n: number }>(
    sql`select distinct (decoded_json->>'memberNumber')::int as n from sale_event_raw
        where generation = 'V2B' and event_name = 'Purchased'
          and (decoded_json->>'firstSeat')::boolean is true`,
  );
  const sentinel = await one<{ cnt: number; allfalse: boolean | null }>(
    sql`select count(*)::int as cnt,
               coalesce(bool_and((decoded_json->>'firstSeat')::boolean is false), true) as allfalse
        from sale_event_raw
        where generation = 'V2B' and event_name = 'Purchased'
          and (decoded_json->>'memberNumber')::int = 0`,
  );
  const v3 = await one<{ n: number }>(
    sql`select distinct (decoded_json->>'memberNumber')::int as n from sale_event_raw
        where generation = 'V3' and event_name = 'MembershipPurchasedV3'
          and (decoded_json->>'firstSeat')::boolean is true`,
  );
  const pairs = await one<{ tx: string; li: number }>(
    sql`select lower(transaction_hash) as tx, log_index as li from sale_event_raw`,
  );
  return {
    totalRawRows: total[0]?.cnt ?? 0,
    v1EventCount: v1Cnt[0]?.cnt ?? 0,
    v1DistinctBuyersLower: v1Buyers.map((r) => r.b),
    v2aFirstSeatMemberNumbers: v2a.map((r) => r.n),
    v2bFirstSeatTrueMemberNumbers: v2b.map((r) => r.n),
    v2bSentinelZeroCount: sentinel[0]?.cnt ?? 0,
    v2bSentinelZeroAllFirstSeatFalse: sentinel[0]?.allfalse ?? true,
    v3FirstSeatMemberNumbers: v3.map((r) => r.n),
    txLogPairsLower: new Set(pairs.map((r) => `${r.tx}#${r.li}`)),
  };
}

async function readExisting(d: Db): Promise<{
  freeze: ExistingFreezeRow | null;
  members: ExistingMemberRow[];
}> {
  const { db, historicalMemberFreeze, historicalMember, and, eq, asc } = d;
  const exp = PART_B_EXPECTATIONS;
  const freezeRows = await db
    .select()
    .from(historicalMemberFreeze)
    .where(
      and(
        eq(historicalMemberFreeze.chainId, exp.chainId),
        eq(historicalMemberFreeze.freezeBlock, exp.freezeBlock),
      ),
    );
  const memberRows = await db
    .select()
    .from(historicalMember)
    .where(
      and(
        eq(historicalMember.chainId, exp.chainId),
        eq(historicalMember.freezeBlock, exp.freezeBlock),
      ),
    )
    .orderBy(asc(historicalMember.memberNumber));
  return {
    freeze: (freezeRows[0] as ExistingFreezeRow | undefined) ?? null,
    members: memberRows as ExistingMemberRow[],
  };
}

/** Address-safe gate report (checks carry no wallets/txs by construction). */
function gateReport(gate: GateOutcome) {
  return {
    ok: gate.ok,
    checks: gate.checks.map((c) =>
      c.detail === undefined
        ? { name: c.name, ok: c.ok }
        : { name: c.name, ok: c.ok, detail: c.detail },
    ),
    warnings: gate.warnings,
    passed: gate.checks.filter((c) => c.ok).length,
    total: gate.checks.length,
  };
}

function printSafe(report: unknown): void {
  const serialized = JSON.stringify(report, null, 2);
  assertAddressSafeAggregate(serialized);
  console.log(serialized);
}

async function runGatePipeline(d: Db): Promise<GateOutcome> {
  const exp = PART_B_EXPECTATIONS;
  const [outputText, inputText] = await Promise.all([
    fetchPinned(exp.artifact.outputPath),
    fetchPinned(exp.artifact.inputPath),
  ]);
  const inputSnapshotSha256 = createHash("sha256")
    .update(Buffer.from(inputText, "utf8"))
    .digest("hex");
  const parsed = parseFreezeArtifact(outputText);
  const live = await readLive();
  const raw = await readRawAggregates(d);
  return runPartBGate({ parsed, live, raw, inputSnapshotSha256 });
}

async function main(): Promise<void> {
  const mode = parseMode(process.argv.slice(2));
  const exp = PART_B_EXPECTATIONS;
  const d = await loadDb();
  try {
    if (mode === "status") {
      const existing = await readExisting(d);
      printSafe({
        mode,
        freezeRow: existing.freeze
          ? {
              chainId: existing.freeze.chainId,
              freezeBlock: existing.freeze.freezeBlock,
              root: shortRoot(existing.freeze.root),
              memberCount: existing.freeze.memberCount,
              validationStatus: existing.freeze.validationStatus,
            }
          : null,
        historicalMemberRows: existing.members.length,
        memberNumberSequence: existing.members.map((m) => m.memberNumber),
      });
      return;
    }

    const gate = await runGatePipeline(d);
    if (mode === "preflight") {
      printSafe({ mode, gate: gateReport(gate), writesPerformed: false });
      if (!gate.ok) process.exitCode = 1;
      return;
    }

    // mode === "import"
    if (!gate.ok || !gate.plan) {
      printSafe({
        mode,
        result: "GATE FAILED SAFELY — no writes performed",
        gate: gateReport(gate),
      });
      process.exitCode = 1;
      return;
    }
    const plan = gate.plan;

    const existing = await readExisting(d);
    if (existing.freeze !== null || existing.members.length > 0) {
      if (existing.freeze === null) {
        printSafe({
          mode,
          result: "HARD FAIL — member rows exist without a freeze row",
          divergences: [`orphan member rows: ${existing.members.length}`],
        });
        process.exitCode = 1;
        return;
      }
      const comparison = compareExistingVsPlan(
        existing.freeze,
        existing.members,
        plan,
      );
      if (comparison.match) {
        printSafe({
          mode,
          result: "REPLAY NO-OP — existing rows exactly match the verified plan",
          gate: gateReport(gate),
          writesPerformed: false,
        });
        return;
      }
      printSafe({
        mode,
        result: "HARD FAIL — existing rows diverge from the verified plan",
        divergences: comparison.divergences,
        writesPerformed: false,
      });
      process.exitCode = 1;
      return;
    }

    // First import: single transaction, then in-transaction invariant re-check.
    const { db, historicalMemberFreeze, historicalMember, and, eq, asc, sql } = d;
    await db.transaction(async (tx) => {
      await tx.insert(historicalMemberFreeze).values({
        ...plan.freeze,
        validatedAt: new Date(),
      });
      await tx.insert(historicalMember).values(plan.members);

      const freezeCheck = await tx
        .select()
        .from(historicalMemberFreeze)
        .where(
          and(
            eq(historicalMemberFreeze.chainId, exp.chainId),
            eq(historicalMemberFreeze.freezeBlock, exp.freezeBlock),
          ),
        );
      const memberCheck = await tx
        .select()
        .from(historicalMember)
        .where(
          and(
            eq(historicalMember.chainId, exp.chainId),
            eq(historicalMember.freezeBlock, exp.freezeBlock),
          ),
        )
        .orderBy(asc(historicalMember.memberNumber));
      const distinctWallets = await tx.execute(
        sql`select count(distinct lower(wallet))::int as cnt from historical_member
            where chain_id = ${exp.chainId} and freeze_block = ${exp.freezeBlock}`,
      );
      const distinct = (distinctWallets.rows[0] as { cnt: number } | undefined)?.cnt ?? 0;
      const seqOk = memberCheck.every((m, i) => m.memberNumber === i + 1);
      const invariantsOk =
        freezeCheck.length === 1 &&
        freezeCheck[0]!.validationStatus === "VERIFIED" &&
        freezeCheck[0]!.root === plan.freeze.root &&
        memberCheck.length === exp.memberCount &&
        seqOk &&
        distinct === exp.memberCount;
      if (!invariantsOk) {
        throw new Error(
          `post-insert invariant check failed (freezeRows=${freezeCheck.length} members=${memberCheck.length} seqOk=${seqOk} distinctWallets=${distinct}) — transaction rolled back`,
        );
      }
    });

    const after = await readExisting(d);
    printSafe({
      mode,
      result: "PART B IMPORT COMPLETE",
      gate: gateReport(gate),
      db: {
        freezeRows: after.freeze ? 1 : 0,
        historicalMemberRows: after.members.length,
        memberNumberSequence: after.members.map((m) => m.memberNumber),
        validationStatus: after.freeze?.validationStatus ?? null,
        root: shortRoot(after.freeze?.root),
      },
      writesPerformed: true,
    });
  } finally {
    await d.pool.end();
  }
}

main().catch((err) => {
  // Address-safe error surface: never serialize raw error objects (they can
  // embed request payloads); print message text only after the leak guard.
  const message = err instanceof Error ? err.message : String(err);
  try {
    assertAddressSafeAggregate(message);
    console.error(`[partB-import] FAILED: ${message}`);
  } catch {
    console.error("[partB-import] FAILED: (detail redacted by address-leak guard)");
  }
  process.exit(1);
});
