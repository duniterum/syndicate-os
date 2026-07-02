/**
 * CLI: Historical Freeze Gate status — DB-derived reconciler (Part B).
 * --------------------------------------------------------------------
 * Re-derives the freeze-gate status from the server-only database and
 * RECONCILES it against the static served module (`freezeGate.ts`). The served
 * module never reads the DB at runtime (founder-approved flip semantics), so
 * this script is the honesty check that keeps the static VERIFIED value true:
 *
 *   derived VERIFIED  + static VERIFIED → exit 0
 *   derived BLOCKED   + static BLOCKED  → exit 0 (pre-import posture)
 *   any mismatch                        → exit 1 (fail closed; static module
 *                                          must be corrected, never the DB)
 *
 * Output is address-safe (aggregate counts + shortened root only) and is
 * re-checked by the address-leak guard before printing.
 *
 * Run:  pnpm --filter @workspace/api-server run freeze-gate:status
 */

import { assertNoAddressLeak } from "../src/lib/protocol/rpcTransport";
import {
  HISTORICAL_FREEZE_GATE,
  type FreezeGateStatus,
} from "../src/lib/protocol/freezeGate";
import { PART_B_EXPECTATIONS } from "../src/data/partBExpectations";

function shortRoot(root: string | null | undefined): string {
  if (!root || root.length < 14) return "(none)";
  return `${root.slice(0, 10)}…${root.slice(-6)}`;
}

type DbModule = typeof import("@workspace/db");

async function deriveFromDb(mod: DbModule): Promise<{
  derived: FreezeGateStatus;
  facts: Record<string, unknown>;
}> {
  const { and, eq, asc, sql } = await import("drizzle-orm");
  const exp = PART_B_EXPECTATIONS;
  const freezeRows = await mod.db
    .select()
    .from(mod.historicalMemberFreeze)
    .where(
      and(
        eq(mod.historicalMemberFreeze.chainId, exp.chainId),
        eq(mod.historicalMemberFreeze.freezeBlock, exp.freezeBlock),
      ),
    );
  const memberRows = await mod.db
    .select()
    .from(mod.historicalMember)
    .where(
      and(
        eq(mod.historicalMember.chainId, exp.chainId),
        eq(mod.historicalMember.freezeBlock, exp.freezeBlock),
      ),
    )
    .orderBy(asc(mod.historicalMember.memberNumber));
  const distinctRes = await mod.db.execute(
    sql`select count(distinct lower(wallet))::int as cnt from historical_member
        where chain_id = ${exp.chainId} and freeze_block = ${exp.freezeBlock}`,
  );
  const distinctWallets =
    (distinctRes.rows[0] as { cnt: number } | undefined)?.cnt ?? 0;

  const freeze = freezeRows[0];
  const sequenceOk = memberRows.every((m, i) => m.memberNumber === i + 1);
  const conditions = {
    freezeRowPresent: freezeRows.length === 1,
    validationStatusVerified: freeze?.validationStatus === "VERIFIED",
    rootMatchesPinnedExpectation:
      freeze?.root?.toLowerCase() === exp.expectedRoot.toLowerCase(),
    memberCountColumnIs8: freeze?.memberCount === exp.memberCount,
    memberRowsAre8: memberRows.length === exp.memberCount,
    sequenceIs1To8: sequenceOk,
    distinctWalletsAre8: distinctWallets === exp.memberCount,
  };
  const derived: FreezeGateStatus = Object.values(conditions).every(Boolean)
    ? "VERIFIED"
    : "BLOCKED";
  return {
    derived,
    facts: {
      conditions,
      freezeRows: freezeRows.length,
      memberRows: memberRows.length,
      distinctWallets,
      root: shortRoot(freeze?.root),
      validatedAt: freeze?.validatedAt?.toISOString() ?? null,
    },
  };
}

async function main(): Promise<void> {
  const g = HISTORICAL_FREEZE_GATE;
  let derived: FreezeGateStatus = "BLOCKED";
  let facts: Record<string, unknown> = {};
  let dbError: string | null = null;
  // Hoist the DB module so the pool is ALWAYS closed, even when derivation throws.
  let mod: DbModule | null = null;
  try {
    mod = await import("@workspace/db");
    const r = await deriveFromDb(mod);
    derived = r.derived;
    facts = r.facts;
  } catch (err) {
    // No DB / unreadable DB derives BLOCKED (fail closed).
    dbError = err instanceof Error ? err.message.slice(0, 160) : "db unavailable";
  } finally {
    if (mod) await mod.pool.end();
  }

  const consistent = derived === g.status;
  const report = {
    staticServedStatus: g.status,
    dbDerivedStatus: derived,
    consistent,
    dbFacts: facts,
    dbError,
    summary: g.summary,
    v1Doctrine: g.v1Doctrine,
    verifiedBasis: g.verifiedBasis,
    reconciliation: g.reconciliation,
    boundaries: g.boundaries,
  };
  const serialized = JSON.stringify(report, null, 2);
  assertNoAddressLeak(serialized);

  process.stdout.write(
    `HISTORICAL FREEZE GATE — static: ${g.status} · db-derived: ${derived} · ${
      consistent ? "CONSISTENT" : "MISMATCH (fail closed)"
    }\n\n`,
  );
  process.stdout.write(`${serialized}\n`);
  if (!consistent) {
    process.stdout.write(
      "\nFAIL CLOSED: the static served module disagrees with the database. Correct the static module (revert to BLOCKED) — never mutate the DB to match.\n",
    );
    process.exit(1);
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  try {
    assertNoAddressLeak(message);
    console.error(`[freeze-gate:status] FAILED: ${message}`);
  } catch {
    console.error("[freeze-gate:status] FAILED: (detail redacted by address-leak guard)");
  }
  process.exit(1);
});
