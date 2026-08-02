/**
 * Member Continuity Builder — S3a DRY-RUN + S3b FOUNDER-ARMED WRITE (SERVER-ONLY).
 * -------------------------------------------------------------------------
 * Thin CLI over the ONE shared pipeline in
 * src/backbone/continuitySpineRefresh.ts (2026-08-02: the pipeline moved to
 * src under the founder's automation order — the backbone refreshes the
 * spine every cycle; this script remains the founder-armed MANUAL path and
 * the dry-run inspector, importing the exact same loader, verified build and
 * persist — never a second implementation).
 *
 * HARD RULES (unchanged):
 *   - Default posture is dry-run / no-write. The S3b write path exists ONLY
 *     behind BOTH the --write script mode AND the exact founder arming env
 *     value — and even then persists ONLY a fully green VERIFIED build,
 *     freshly rebuilt at write time (never a stored/stale hash).
 *   - The write is ONE transaction (run row + full record set) with
 *     in-transaction post-insert verification; any anomaly throws →
 *     rollback. Failed builds are never memorialized. No partial state.
 *     No upsert / ON CONFLICT — replay semantics are explicit instead.
 *   - Never print wallets, transaction hashes, proofs, decodedJson or
 *     rawJson. The report is self-scanned fail-closed before printing.
 *   - Exit non-zero unless gate + reconciliation + determinism + DDL
 *     preflight (incl. live memberCount match) are all green.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run member-continuity:dry-run
 *   MEMBER_CONTINUITY_WRITE_APPROVED=I_APPROVE_S3B_WRITE \
 *     pnpm --filter @workspace/api-server run member-continuity:write
 */

import {
  toAddressSafeReport,
  assertAddressSafeJson,
} from "../src/lib/protocol/memberContinuityReadmodel";
import {
  loadContinuityBuildInput,
  runVerifiedContinuityBuild,
  persistVerifiedBuild,
  BUILDER_VERSION,
  type PersistOutcome,
} from "../src/backbone/continuitySpineRefresh";

// ---------------------------------------------------------------------------
// S3b persistence gate — FOUNDER-ARMED WRITE MODE (approved S3b slice).
// Default posture stays dry-run/no-write. The write path is reachable ONLY
// behind BOTH the --write script mode AND the exact arming value below.
// (The BACKBONE lane is the standing sanctioned writer since 2026-08-02 and
// carries no env arming — its writes flow through the same verified
// persistVerifiedBuild; this arming gates the MANUAL script path only.)
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

/**
 * Display form of a 64-hex digest that cannot trip the bare-64-hex identity
 * scan (the scan is deliberately shape-based; a digest is safe but must not
 * look like a leaf/root). Full-hash equality is proven in memory.
 */
function splitHashDisplay(hash: string): string {
  return `sha256:${hash.slice(0, 16)}…${hash.slice(-16)}`;
}

// ---------------------------------------------------------------------------
// Main (dry-run default; write only when founder-armed).
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const mode = resolveMode();

  const input = await loadContinuityBuildInput();
  const build = runVerifiedContinuityBuild(input);
  const { first, rebuildIdentical, orderIndependent, hashStable, ok, ddl } =
    build;
  const onchainMemberCount = input.ddl?.onchainMemberCount ?? null;
  const inputSaleEventCount = input.ddl?.inputSaleEventCount ?? 0;
  const inputMaxSaleEventRawId = input.ddl?.inputMaxSaleEventRawId ?? null;

  let outcome: PersistOutcome | null = null;
  if (mode === "WRITE") {
    if (!ok || ddl === undefined) {
      console.error(
        "[FAIL] S3B write refused: preflight not fully green — failed builds are never memorialized (nothing written, no partial state).",
      );
      await (await import("@workspace/db")).pool.end();
      process.exit(1);
    }
    outcome = await persistVerifiedBuild(ddl);
  }

  const report = {
    slice: mode === "WRITE" ? "S3B_VERIFIED_WRITE" : "S3A_DDL_SHAPED_DRY_RUN",
    mode: mode === "WRITE" ? "FOUNDER_ARMED_WRITE" : "DRY_RUN_ONLY",
    persistenceGate:
      mode === "WRITE"
        ? "ARMED — founder-approved S3b (--write + exact env arming); VERIFIED-only, one transaction, rollback on any anomaly"
        : "INERT in dry-run — manual S3b writes happen ONLY via the founder-armed member-continuity:write script mode (the backbone lane refreshes the spine automatically through the same verified pipeline)",
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
            readOk: onchainMemberCount !== null,
            matches:
              onchainMemberCount !== null &&
              onchainMemberCount === ddl.records.length,
          },
          provenance: {
            inputSaleEventCount,
            inputMaxSaleEventRawId,
            builderVersion: BUILDER_VERSION,
          },
          determinismHash: splitHashDisplay(ddl.run.determinismHash),
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
      `member-continuity dry-run: OK — ${first.totals.total} DDL-shaped records (${first.totals.historical} historical + ${first.totals.postFreezeV3} post-freeze V3), consistent, deterministic, NOTHING PERSISTED (writes require the founder-armed member-continuity:write mode or the backbone lane).`,
    );
  }
  await (await import("@workspace/db")).pool.end();
}

main().catch((err) => {
  // Never echo row/payload material — message only.
  console.error(`[FAIL] member-continuity build: ${(err as Error).message}`);
  process.exit(1);
});
