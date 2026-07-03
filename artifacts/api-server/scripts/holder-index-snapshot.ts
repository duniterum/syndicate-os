/**
 * Holder Index snapshot builder — FOUNDER-GATED (approved Holder Index sprint).
 * ---------------------------------------------------------------------------
 * Derives the aggregate-only Holder Index from the VERIFIED member-continuity
 * build (READ-ONLY database selects — this script writes NO database rows) and
 * generates the static served snapshot module (freezeGate pattern).
 *
 * Modes:
 *   --dry-run  (default posture) — derive, report aggregates, and compare
 *              against the existing generated module: UP_TO_DATE / STALE /
 *              MISSING. Never writes anything.
 *   --write    — regenerates src/lib/protocol/holderIndexSnapshot.ts. Gated
 *              behind the exact founder arming value below. This is a source
 *              file write, not a database write.
 *
 * Fail-closed: derivation refuses on any invariant violation (see core), and
 * the printed report is self-scanned for address/PII leakage before emit.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run holder-index:dry-run
 *   HOLDER_INDEX_BUILD_APPROVED=I_APPROVE_HOLDER_INDEX_SNAPSHOT \
 *     pnpm --filter @workspace/api-server run holder-index:build
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  deriveHolderIndexFromDb,
  renderSnapshotModule,
  assertAggregateSafe,
  shortHash,
  SNAPSHOT_MODULE_RELATIVE_PATH,
} from "./holder-index-core";

const WRITE_ARMING_ENV = "HOLDER_INDEX_BUILD_APPROVED";
const WRITE_ARMING_VALUE = "I_APPROVE_HOLDER_INDEX_SNAPSHOT";

type Mode = "DRY_RUN" | "WRITE";

function resolveMode(): Mode {
  const dry = process.argv.includes("--dry-run");
  const write = process.argv.includes("--write");
  if (dry === write) {
    console.error(
      "[FAIL] exactly one mode flag is required: --dry-run (default no-write posture) or --write (founder-armed snapshot generation)",
    );
    process.exit(1);
  }
  if (write && process.env[WRITE_ARMING_ENV] !== WRITE_ARMING_VALUE) {
    console.error(
      `[FAIL] HOLDER_INDEX_BUILD_NOT_ARMED: --write refused — ${WRITE_ARMING_ENV} is not set to the exact founder approval value.`,
    );
    process.exit(1);
  }
  return write ? "WRITE" : "DRY_RUN";
}

async function main(): Promise<void> {
  const mode = resolveMode();
  const outcome = await deriveHolderIndexFromDb();

  if (!outcome.ok) {
    const failReport = JSON.stringify(
      { mode, result: "DERIVATION_FAILED", reasons: outcome.reasons },
      null,
      2,
    );
    assertAggregateSafe(failReport);
    console.error(failReport);
    console.error("holder-index: FAIL — derivation refused (fail-closed); nothing was written.");
    process.exit(1);
  }

  const snapshot = { ...outcome.aggregates, snapshotHash: outcome.snapshotHash };
  const rendered = renderSnapshotModule(snapshot);
  assertAggregateSafe(rendered);

  const modulePath = resolve(import.meta.dirname, "..", SNAPSHOT_MODULE_RELATIVE_PATH);
  const existing = existsSync(modulePath) ? readFileSync(modulePath, "utf8") : null;
  const moduleState =
    existing === null ? "MISSING" : existing === rendered ? "UP_TO_DATE" : "STALE";

  const report = {
    mode,
    derivation: "VERIFIED",
    aggregates: {
      chainId: outcome.aggregates.chainId,
      freezeBlock: outcome.aggregates.freezeBlock,
      memberTotal: outcome.aggregates.memberTotal,
      eras: outcome.aggregates.eras.map((e) => ({
        era: e.era,
        label: e.label,
        count: e.count,
        seatNumberLow: e.seatNumberLow,
        seatNumberHigh: e.seatNumberHigh,
      })),
      timestampCoverage: outcome.aggregates.timestampCoverage,
      provenance: {
        runId: outcome.aggregates.provenance.runId,
        builderVersion: outcome.aggregates.provenance.builderVersion,
        inputSaleEventCount: outcome.aggregates.provenance.inputSaleEventCount,
        sourceDeterminismHash: shortHash(outcome.aggregates.provenance.sourceDeterminismHash),
      },
    },
    snapshotHash: shortHash(outcome.snapshotHash),
    servedModule: { path: SNAPSHOT_MODULE_RELATIVE_PATH, state: moduleState },
  };
  const serialized = JSON.stringify(report, null, 2);
  assertAggregateSafe(serialized);
  console.log(serialized);

  if (mode === "DRY_RUN") {
    if (moduleState === "UP_TO_DATE") {
      console.log("holder-index dry-run: OK — derivation VERIFIED; served snapshot module is UP_TO_DATE.");
      return;
    }
    console.error(
      `holder-index dry-run: served snapshot module is ${moduleState} — run the founder-armed holder-index:build to (re)generate it.`,
    );
    process.exit(1);
  }

  if (moduleState === "UP_TO_DATE") {
    console.log("holder-index build: NO-OP — generated module already matches the derived snapshot exactly.");
    return;
  }
  writeFileSync(modulePath, rendered, "utf8");
  console.log(
    `holder-index build: OK — ${moduleState === "MISSING" ? "generated" : "regenerated"} ${SNAPSHOT_MODULE_RELATIVE_PATH} (snapshot hash ${shortHash(outcome.snapshotHash)}).`,
  );
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  assertAggregateSafe(msg);
  console.error(`holder-index: FAIL — ${msg}`);
  process.exit(1);
});
