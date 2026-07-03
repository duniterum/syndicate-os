/**
 * Holder Index core — shared derivation for the build script and reconciler.
 * ---------------------------------------------------------------------------
 * Derives the AGGREGATE-ONLY Holder Index from the VERIFIED member-continuity
 * build (READ-ONLY selects). This module NEVER selects PII columns: entry
 * wallets, entry transactions, entry blocks, log indexes, and routed folds are
 * structurally excluded from every query in this file.
 *
 * HARD RULES (founder-approved Holder Index sprint, decisions 1b + 2a + 4/4a):
 *   - Aggregates only: counts, era boundaries, coverage — never per-seat rows.
 *   - Era provenance is always carried (4a): every aggregate is labelled with
 *     its numbering authority ("historical freeze / on-chain root" for seats
 *     #1–#8, "V3 engine event" for seats #9+).
 *   - Fail closed on: no VERIFIED run, count mismatch, era-boundary violation,
 *     unknown authority, chain mismatch, build-lineage mismatch, or missing
 *     timestamp truth. A partial snapshot is never derived.
 *   - The derived object is the EXACT content of the static served snapshot
 *     (freezeGate pattern) — served code imports the generated module and
 *     never reads the database at runtime.
 */

import { createHash } from "node:crypto";
import { EXPECTED_CHAIN_ID } from "../src/lib/protocol/rpcTransport";
import { PART_B_EXPECTATIONS } from "../src/data/partBExpectations";

// ---------------------------------------------------------------------------
// Era doctrine (binding — founder decision 4, confirmed 2026-07-03)
// ---------------------------------------------------------------------------

export const ERA_PART_B = "PART_B_FREEZE_ROOT" as const;
export const ERA_V3 = "V3_EMITTED" as const;

export const ERA_PART_B_LABEL = "historical freeze / on-chain root";
export const ERA_V3_LABEL = "V3 engine event";

export const ERA_PART_B_DOCTRINE =
  "Seats #1\u2013#8: authority is the verified historical freeze + on-chain V1_MEMBER_ROOT. Imported once from the verified canonical artifact, never re-derived or renumbered; memberNumber 0 remains a sentinel, never a seat.";
export const ERA_V3_DOCTRINE =
  "Seats #9+: authority is the memberNumber emitted by V3 engine events on-chain. Read from raw indexed events, never inferred, never renumbered.";

// ---------------------------------------------------------------------------
// Aggregate shapes (public-safe by construction)
// ---------------------------------------------------------------------------

export interface HolderIndexEraAggregate {
  readonly era: typeof ERA_PART_B | typeof ERA_V3;
  readonly label: string;
  readonly doctrine: string;
  readonly count: number;
  readonly seatNumberLow: number;
  readonly seatNumberHigh: number;
}

export interface HolderIndexAggregates {
  readonly gate: "HOLDER_INDEX_AGGREGATES_V1";
  readonly status: "VERIFIED";
  readonly chainId: number;
  readonly freezeBlock: number;
  readonly memberTotal: number;
  readonly eras: readonly HolderIndexEraAggregate[];
  readonly timestampCoverage: {
    readonly withVerifiedTimestamp: number;
    readonly total: number;
  };
  readonly provenance: {
    readonly runId: number;
    readonly builtAt: string;
    readonly builderVersion: string;
    readonly sourceDeterminismHash: string;
    readonly inputSaleEventCount: number;
    readonly inputMaxSaleEventRawId: number | null;
  };
  readonly boundaries: readonly string[];
}

export interface HolderIndexSnapshotShape extends HolderIndexAggregates {
  readonly snapshotHash: string;
}

export const HOLDER_INDEX_BOUNDARIES: readonly string[] = [
  "Aggregate counts only: no wallet addresses, no per-seat public roster, no memberNumber-to-wallet linkage, no directory.",
  "Served code imports this static snapshot and performs NO runtime database read (freezeGate pattern); the scripts-side reconciler re-derives it from the database and fails closed on any mismatch.",
  "Era provenance is always labelled: historical freeze / on-chain root (#1\u2013#8) vs V3 engine event (#9+). The two authorities are never collapsed into one undifferentiated sequence.",
  "Membership recognition only — no financial framing, no economic projection. Member self-readback is session-bound OWN-ROW only (founder Decision 5a): a signed wallet may resolve its own standing against this snapshot; no public directory, roster, or arbitrary lookup exists.",
];

// ---------------------------------------------------------------------------
// Canonical serialization + hash pin
// ---------------------------------------------------------------------------

/** Deterministic JSON: object keys sorted at every level, arrays in order. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

export function computeSnapshotHash(aggregates: HolderIndexAggregates): string {
  return `sha256:${createHash("sha256").update(canonicalJson(aggregates), "utf8").digest("hex")}`;
}

/** Truncate a long hash for stdout (leak-guard-safe, precedent: S3b report). */
export function shortHash(hash: string): string {
  return hash.length > 28 ? `${hash.slice(0, 18)}\u2026${hash.slice(-8)}` : hash;
}

/**
 * Output-safety scan for script stdout AND snapshot content: a standalone
 * 0x-prefixed 40-hex token is an address leak. Boundary-aware so 64-hex
 * hashes (roots, sha256 pins) never mask a shorter address token.
 */
const STANDALONE_ADDRESS_RE = /0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/;

export function assertAggregateSafe(serialized: string): void {
  if (STANDALONE_ADDRESS_RE.test(serialized)) {
    throw new Error(
      "SAFETY VIOLATION: a standalone 0x address token was detected in holder-index output; refusing to emit.",
    );
  }
  for (const banned of ["entryWallet", "entry_wallet", "entryTransaction", "entry_transaction", "entryRoutedFold", "entry_routed_fold"]) {
    if (serialized.includes(banned)) {
      throw new Error(
        `SAFETY VIOLATION: PII field name "${banned}" detected in holder-index output; refusing to emit.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Derivation (READ-ONLY selects; PII columns never selected)
// ---------------------------------------------------------------------------

export interface DeriveFailure {
  readonly ok: false;
  readonly reasons: readonly string[];
}

export interface DeriveSuccess {
  readonly ok: true;
  readonly aggregates: HolderIndexAggregates;
  readonly snapshotHash: string;
}

export type DeriveOutcome = DeriveFailure | DeriveSuccess;

export async function deriveHolderIndexFromDb(): Promise<DeriveOutcome> {
  const reasons: string[] = [];
  const { db, memberContinuityRecord, memberContinuityVerificationRun } =
    await import("@workspace/db");
  const { desc, eq, and, sql, isNotNull } = await import("drizzle-orm");

  const runs = await db
    .select({
      id: memberContinuityVerificationRun.id,
      chainId: memberContinuityVerificationRun.chainId,
      status: memberContinuityVerificationRun.status,
      freezeBlock: memberContinuityVerificationRun.freezeBlock,
      memberTotal: memberContinuityVerificationRun.memberTotal,
      historicalCount: memberContinuityVerificationRun.historicalCount,
      v3Count: memberContinuityVerificationRun.v3Count,
      onchainMemberCount: memberContinuityVerificationRun.onchainMemberCount,
      determinismHash: memberContinuityVerificationRun.determinismHash,
      inputSaleEventCount: memberContinuityVerificationRun.inputSaleEventCount,
      inputMaxSaleEventRawId:
        memberContinuityVerificationRun.inputMaxSaleEventRawId,
      builderVersion: memberContinuityVerificationRun.builderVersion,
      builtAt: memberContinuityVerificationRun.builtAt,
    })
    .from(memberContinuityVerificationRun)
    .where(eq(memberContinuityVerificationRun.chainId, EXPECTED_CHAIN_ID))
    .orderBy(desc(memberContinuityVerificationRun.id));

  if (runs.length === 0) {
    return { ok: false, reasons: ["NO_VERIFIED_RUN: member_continuity_verification_run has no row for the expected chain"] };
  }
  const run = runs[0]!;
  if (run.status !== "VERIFIED") {
    reasons.push(`RUN_NOT_VERIFIED: latest run status is not VERIFIED`);
  }
  if (run.chainId !== EXPECTED_CHAIN_ID) {
    reasons.push(`CHAIN_MISMATCH: run chainId != expected ${EXPECTED_CHAIN_ID}`);
  }
  if (run.freezeBlock !== PART_B_EXPECTATIONS.freezeBlock) {
    reasons.push(
      `FREEZE_BLOCK_MISMATCH: run freezeBlock ${run.freezeBlock} != Part B expectation ${PART_B_EXPECTATIONS.freezeBlock}`,
    );
  }
  if (run.memberTotal !== run.historicalCount + run.v3Count) {
    reasons.push("TOTALS_MISMATCH: memberTotal != historicalCount + v3Count");
  }
  if (run.memberTotal !== run.onchainMemberCount) {
    reasons.push("ONCHAIN_MISMATCH: memberTotal != onchainMemberCount recorded by the VERIFIED build");
  }

  // AGGREGATE-ONLY record read: member numbers, authority, build lineage, and
  // timestamp PRESENCE. No entry wallet / transaction / block / fold columns.
  const records = await db
    .select({
      memberNumber: memberContinuityRecord.memberNumber,
      numberingAuthority: memberContinuityRecord.numberingAuthority,
      buildId: memberContinuityRecord.buildId,
      chainId: memberContinuityRecord.chainId,
      hasTimestamp: isNotNull(memberContinuityRecord.entryBlockTimestampSec).mapWith(Boolean),
    })
    .from(memberContinuityRecord)
    .where(eq(memberContinuityRecord.chainId, EXPECTED_CHAIN_ID));

  if (records.length !== run.memberTotal) {
    reasons.push(
      `RECORD_COUNT_MISMATCH: ${records.length} records != run.memberTotal ${run.memberTotal}`,
    );
  }
  for (const r of records) {
    if (r.buildId !== run.id) {
      reasons.push(`BUILD_LINEAGE_MISMATCH: a record references buildId != latest VERIFIED run`);
      break;
    }
  }

  const partB = records
    .filter((r) => r.numberingAuthority === ERA_PART_B)
    .map((r) => r.memberNumber)
    .sort((a, b) => a - b);
  const v3 = records
    .filter((r) => r.numberingAuthority === ERA_V3)
    .map((r) => r.memberNumber)
    .sort((a, b) => a - b);
  const unknownAuthority = records.filter(
    (r) => r.numberingAuthority !== ERA_PART_B && r.numberingAuthority !== ERA_V3,
  );
  if (unknownAuthority.length > 0) {
    reasons.push(`UNKNOWN_AUTHORITY: ${unknownAuthority.length} record(s) carry an unrecognized numbering authority`);
  }

  const contiguous = (nums: number[], expectedLow: number): boolean =>
    nums.every((n, i) => n === expectedLow + i);

  if (partB.length !== run.historicalCount) {
    reasons.push(`PART_B_COUNT_MISMATCH: ${partB.length} != run.historicalCount ${run.historicalCount}`);
  }
  if (partB.length !== PART_B_EXPECTATIONS.memberCount) {
    reasons.push(
      `PART_B_EXPECTATION_MISMATCH: ${partB.length} != Part B expected member count ${PART_B_EXPECTATIONS.memberCount}`,
    );
  }
  if (partB.length === 0 || partB[0] !== 1 || !contiguous(partB, 1)) {
    reasons.push("PART_B_BOUNDARY_VIOLATION: historical seats are not exactly the contiguous range starting at #1");
  }
  const v3ExpectedLow = partB.length + 1;
  if (v3.length !== run.v3Count) {
    reasons.push(`V3_COUNT_MISMATCH: ${v3.length} != run.v3Count ${run.v3Count}`);
  }
  if (v3.length > 0 && (v3[0] !== v3ExpectedLow || !contiguous(v3, v3ExpectedLow))) {
    reasons.push(
      `V3_BOUNDARY_VIOLATION: V3-emitted seats are not the contiguous range starting at #${v3ExpectedLow}`,
    );
  }
  if (v3.length === 0) {
    reasons.push("V3_EMPTY: the VERIFIED build carries no V3-emitted seats — refusing to snapshot a foundation-era-only index");
  }

  const withTimestamp = records.filter((r) => r.hasTimestamp).length;
  if (withTimestamp !== records.length) {
    reasons.push(
      `TIMESTAMP_TRUTH_INCOMPLETE: ${withTimestamp}/${records.length} records carry a chain-verified entry timestamp — fail closed (founder non-negotiable)`,
    );
  }

  // silence unused-import style concerns for and/sql if tree differs
  void and;
  void sql;

  if (reasons.length > 0) {
    return { ok: false, reasons };
  }

  const aggregates: HolderIndexAggregates = {
    gate: "HOLDER_INDEX_AGGREGATES_V1",
    status: "VERIFIED",
    chainId: run.chainId,
    freezeBlock: run.freezeBlock,
    memberTotal: run.memberTotal,
    eras: [
      {
        era: ERA_PART_B,
        label: ERA_PART_B_LABEL,
        doctrine: ERA_PART_B_DOCTRINE,
        count: partB.length,
        seatNumberLow: partB[0]!,
        seatNumberHigh: partB[partB.length - 1]!,
      },
      {
        era: ERA_V3,
        label: ERA_V3_LABEL,
        doctrine: ERA_V3_DOCTRINE,
        count: v3.length,
        seatNumberLow: v3[0]!,
        seatNumberHigh: v3[v3.length - 1]!,
      },
    ],
    timestampCoverage: {
      withVerifiedTimestamp: withTimestamp,
      total: records.length,
    },
    provenance: {
      runId: run.id,
      builtAt: run.builtAt.toISOString(),
      builderVersion: run.builderVersion,
      sourceDeterminismHash: run.determinismHash.startsWith("sha256:")
        ? run.determinismHash
        : `sha256:${run.determinismHash}`,
      inputSaleEventCount: run.inputSaleEventCount,
      inputMaxSaleEventRawId: run.inputMaxSaleEventRawId,
    },
    boundaries: HOLDER_INDEX_BOUNDARIES,
  };

  return { ok: true, aggregates, snapshotHash: computeSnapshotHash(aggregates) };
}

// ---------------------------------------------------------------------------
// Generated served-module renderer (freezeGate pattern)
// ---------------------------------------------------------------------------

export const SNAPSHOT_MODULE_RELATIVE_PATH = "src/lib/protocol/holderIndexSnapshot.ts";

export function renderSnapshotModule(snapshot: HolderIndexSnapshotShape): string {
  const literal = JSON.stringify(snapshot, null, 2);
  return `/**
 * Holder Index static snapshot (SERVED, aggregate-only) — GENERATED FILE.
 * ---------------------------------------------------------------------------
 * DO NOT EDIT BY HAND. Generated by the founder-gated holder-index:build
 * script from the VERIFIED continuity build (freezeGate pattern).
 *
 * Served code imports this constant and performs NO runtime database read.
 * The scripts-side reconciler (holder-index:reconcile) re-derives this exact
 * object from the database and FAILS CLOSED (non-zero exit) on any mismatch,
 * stale hash, era-boundary violation, or missing timestamp truth — on such a
 * failure this file must be regenerated through the gated build, never
 * hand-patched.
 *
 * PRIVACY BOUNDARY: aggregate counts and era boundaries only. No wallet
 * addresses, no per-seat rows, no memberNumber-to-wallet linkage, no
 * directory. Entry-level member data remains SERVER-ONLY PII with no public
 * UI/API/projection.
 */

export interface HolderIndexSnapshotEra {
  readonly era: "PART_B_FREEZE_ROOT" | "V3_EMITTED";
  readonly label: string;
  readonly doctrine: string;
  readonly count: number;
  readonly seatNumberLow: number;
  readonly seatNumberHigh: number;
}

export interface HolderIndexSnapshot {
  readonly gate: "HOLDER_INDEX_AGGREGATES_V1";
  readonly status: "VERIFIED";
  readonly chainId: number;
  readonly freezeBlock: number;
  readonly memberTotal: number;
  readonly eras: readonly HolderIndexSnapshotEra[];
  readonly timestampCoverage: {
    readonly withVerifiedTimestamp: number;
    readonly total: number;
  };
  readonly provenance: {
    readonly runId: number;
    readonly builtAt: string;
    readonly builderVersion: string;
    readonly sourceDeterminismHash: string;
    readonly inputSaleEventCount: number;
    readonly inputMaxSaleEventRawId: number | null;
  };
  readonly boundaries: readonly string[];
  readonly snapshotHash: string;
}

export const HOLDER_INDEX_SNAPSHOT: HolderIndexSnapshot = ${literal} as const;
`;
}
