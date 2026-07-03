/**
 * Holder Index reconciler — snapshot-vs-database, FAIL-CLOSED (read-only).
 * ---------------------------------------------------------------------------
 * The served Holder Index is a STATIC generated module (freezeGate pattern:
 * served code never reads the database at runtime). This reconciler keeps that
 * static value honest:
 *
 *   1. SELF-CONSISTENCY — recomputes the canonical hash of the static
 *      snapshot's own aggregate content; a hand-edited or corrupted module
 *      fails immediately (pinned snapshotHash mismatch).
 *   2. DATABASE RECONCILIATION — re-derives the full aggregate object from the
 *      VERIFIED member-continuity build (READ-ONLY selects, PII columns never
 *      selected) and requires EXACT equality with the static snapshot,
 *      including the hash pin.
 *
 * ANY divergence — stale snapshot, hash drift, era-boundary violation, count
 * mismatch, missing timestamp truth, or a database that no longer supports
 * VERIFIED — exits non-zero. On such a failure the snapshot must be
 * regenerated through the founder-gated holder-index:build, never hand-patched.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run holder-index:reconcile
 */

import {
  deriveHolderIndexFromDb,
  computeSnapshotHash,
  assertAggregateSafe,
  shortHash,
  type HolderIndexAggregates,
} from "./holder-index-core";
import { HOLDER_INDEX_SNAPSHOT } from "../src/lib/protocol/holderIndexSnapshot";

function stripHash(snapshot: typeof HOLDER_INDEX_SNAPSHOT): HolderIndexAggregates {
  const { snapshotHash, ...aggregates } = snapshot;
  void snapshotHash;
  return aggregates as HolderIndexAggregates;
}

async function main(): Promise<void> {
  const failures: string[] = [];

  // 1. Self-consistency of the static served module.
  const staticAggregates = stripHash(HOLDER_INDEX_SNAPSHOT);
  const recomputedStaticHash = computeSnapshotHash(staticAggregates);
  if (recomputedStaticHash !== HOLDER_INDEX_SNAPSHOT.snapshotHash) {
    failures.push(
      "SNAPSHOT_SELF_HASH_MISMATCH: the static module's pinned snapshotHash does not match its own content — the generated file was altered outside the gated build",
    );
  }

  // 2. Fresh derivation from the database (fail-closed inside).
  const outcome = await deriveHolderIndexFromDb();
  if (!outcome.ok) {
    failures.push(...outcome.reasons.map((r) => `DB_DERIVATION_FAILED: ${r}`));
  } else {
    const derivedCanonical = JSON.stringify(outcome.aggregates);
    const staticCanonical = JSON.stringify(staticAggregates);
    if (derivedCanonical !== staticCanonical) {
      failures.push(
        "SNAPSHOT_STALE_OR_DIVERGED: the database-derived aggregates differ from the static served snapshot — regenerate via the founder-gated holder-index:build",
      );
    }
    if (outcome.snapshotHash !== HOLDER_INDEX_SNAPSHOT.snapshotHash) {
      failures.push(
        `SNAPSHOT_HASH_DRIFT: derived ${shortHash(outcome.snapshotHash)} != pinned ${shortHash(HOLDER_INDEX_SNAPSHOT.snapshotHash)}`,
      );
    }
  }

  const report = {
    reconciler: "holder-index:reconcile",
    staticSnapshot: {
      status: HOLDER_INDEX_SNAPSHOT.status,
      memberTotal: HOLDER_INDEX_SNAPSHOT.memberTotal,
      eras: HOLDER_INDEX_SNAPSHOT.eras.map((e) => ({
        era: e.era,
        count: e.count,
        seatNumberLow: e.seatNumberLow,
        seatNumberHigh: e.seatNumberHigh,
      })),
      snapshotHash: shortHash(HOLDER_INDEX_SNAPSHOT.snapshotHash),
    },
    checks: {
      selfHashConsistent: recomputedStaticHash === HOLDER_INDEX_SNAPSHOT.snapshotHash,
      dbDerivationVerified: outcome.ok,
      snapshotMatchesDb: failures.length === 0,
    },
    failures,
  };
  const serialized = JSON.stringify(report, null, 2);
  assertAggregateSafe(serialized);

  if (failures.length > 0) {
    console.error(serialized);
    console.error(
      `holder-index reconcile: FAIL (${failures.length} failure(s)) — the served snapshot is NOT reconciled; regenerate via the founder-gated build. Fail-closed.`,
    );
    process.exit(1);
  }
  console.log(serialized);
  console.log("holder-index reconcile: OK — static served snapshot exactly matches the database-derived aggregates (hash pin verified).");
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  assertAggregateSafe(msg);
  console.error(`holder-index reconcile: FAIL — ${msg}`);
  process.exit(1);
});
