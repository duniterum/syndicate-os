/**
 * Part B — Historical-Member Freeze/Root Continuity (SERVER-ONLY, IMPORT-GATED).
 * ------------------------------------------------------------------------------
 * Founder-approved smallest-safe model (design slice accepted 2026-07-02).
 * Two tables that persist the VERIFIED historical-member freeze — the 8-member
 * set whose Merkle root is committed on-chain as `V1_MEMBER_ROOT` on the active
 * V3 engine. Rows may ONLY be written by the fail-closed import gate script
 * (never by served api-server code, never by inference from raw events).
 *
 * Authority doctrine:
 *   - The ON-CHAIN root + the recovered canonical artifact remain the authority.
 *   - These tables are a DERIVED, rebuildable copy: re-running the import gate
 *     against the pinned artifact + live chain reproduces them exactly.
 *   - The import gate refuses to insert unless the root triple-match holds
 *     (on-chain == artifact == independent recompute), so `root` is a single
 *     column and `validation_status` is CHECK-limited to 'VERIFIED' — no other
 *     persisted state can exist.
 *
 * PII posture (founder-approved):
 *   - `historical_member.wallet`, `first_transaction`, `log_index`,
 *     `first_block`, `leaf`, `proof` are SERVER-ONLY and de-anonymizing.
 *     They are NEVER serialized into any public/HTTP payload, log, founder
 *     report, or committed artifact. memberNumber→wallet/tx/proof mappings
 *     must never be exposed publicly.
 *   - `historical_member_freeze` holds NO PII (roots are public on-chain
 *     commitments; provenance is repo metadata).
 *
 * Sentinel doctrine: V2B continuity rows carry `memberNumber = 0` as a
 * sentinel — such a row must NEVER become a historical member. Enforced at the
 * DB level via CHECK (member_number >= 1) and again in the import gate.
 *
 * V1 doctrine: V1 `TokensPurchased` has NO memberNumber field; seats #1–#2
 * exist only via the freeze/root process (first-seen ordering) — never derived
 * from raw events.
 */

import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { saleGenerationEnum } from "./indexer";

/**
 * One row per VERIFIED historical-member freeze (expected exactly one:
 * chainId 43114 @ freeze block 88496414). NO PII. Derived + rebuildable.
 */
export const historicalMemberFreeze = pgTable(
  "historical_member_freeze",
  {
    chainId: integer("chain_id").notNull(),
    freezeBlock: bigint("freeze_block", { mode: "number" }).notNull(),
    /**
     * THE triple-matched Merkle root (on-chain == artifact == recompute).
     * A single column by design: the gate refuses to insert on any mismatch,
     * so separate artifact/recomputed root columns would be informationally
     * dead. Public-safe (an on-chain commitment).
     */
    root: text("root").notNull(),
    memberCount: integer("member_count").notNull(),
    /** CHECK-limited: 'VERIFIED' is the only persistable state (fail-closed). */
    validationStatus: text("validation_status").notNull(),
    validatedAt: timestamp("validated_at", { withTimezone: true }).notNull(),
    /**
     * Memorializes the triple-match + raw-row reconciliation outcome:
     * engine label, method, selector, booleans and AGGREGATE counts only.
     * Never contains wallets, transaction hashes, or per-member data.
     */
    verification: jsonb("verification").notNull(),
    /** Artifact provenance (public repo metadata — no PII). */
    provenanceRepo: text("provenance_repo").notNull(),
    provenanceCommitSha: text("provenance_commit_sha").notNull(),
    provenancePath: text("provenance_path").notNull(),
    provenanceGeneratedAt: timestamp("provenance_generated_at", {
      withTimezone: true,
    }).notNull(),
    /** Recorded inputHash from the artifact (provenance CAVEAT, never a gate). */
    inputHashRecorded: text("input_hash_recorded"),
    /** sha256 of the fetched snapshot bytes at import time (caveat context). */
    inputHashComputed: text("input_hash_computed"),
    /** Honest note about the known BOM/reformat byte-drift. */
    inputHashNote: text("input_hash_note"),
    /** Self-describing algorithm copies from the artifact. */
    leafFormat: text("leaf_format").notNull(),
    treeAlgorithm: text("tree_algorithm").notNull(),
    sourceOrder: text("source_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.chainId, t.freezeBlock] }),
    check(
      "historical_member_freeze_status_verified",
      sql`${t.validationStatus} = 'VERIFIED'`,
    ),
  ],
);

/**
 * One row per frozen historical member (exactly 8 for the verified freeze).
 * SERVER-ONLY — every identity column here is PII or de-anonymizing.
 * Derived + rebuildable from the pinned artifact via the import gate.
 */
export const historicalMember = pgTable(
  "historical_member",
  {
    chainId: integer("chain_id").notNull(),
    freezeBlock: bigint("freeze_block", { mode: "number" }).notNull(),
    /** 1-based seat number. CHECK >= 1 excludes the V2B sentinel 0 at DB level. */
    memberNumber: integer("member_number").notNull(),
    /** SERVER-ONLY wallet PII (checksum form). Never surfaced anywhere. */
    wallet: text("wallet").notNull(),
    /** Sale generation the member first appeared on (reuses sale_generation). */
    source: saleGenerationEnum("source").notNull(),
    /** SERVER-ONLY first-seen ordering inputs (explorer-linkable → PII). */
    firstBlock: bigint("first_block", { mode: "number" }).notNull(),
    logIndex: integer("log_index").notNull(),
    firstTransaction: text("first_transaction").notNull(),
    /** SERVER-ONLY member Merkle leaf (wallet-derived). */
    leaf: text("leaf").notNull(),
    /** SERVER-ONLY Merkle proof array (wallet-linked). */
    proof: jsonb("proof").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.chainId, t.freezeBlock, t.memberNumber] }),
    foreignKey({
      name: "historical_member_freeze_fk",
      columns: [t.chainId, t.freezeBlock],
      foreignColumns: [
        historicalMemberFreeze.chainId,
        historicalMemberFreeze.freezeBlock,
      ],
    }).onDelete("restrict"),
    check("historical_member_number_min", sql`${t.memberNumber} >= 1`),
    /**
     * Wallet uniqueness per freeze — plain columns, exact stored (checksum)
     * form. Case-normalized uniqueness (no case-variant dupes) is enforced by
     * the fail-closed import gate: inside the insert transaction it reconciles
     * count(distinct lower(wallet)) == memberCount and rolls back otherwise
     * (partB-import.ts post-insert invariants).
     *
     * DELIBERATELY NOT an expression index. Replit's publish-time dev→prod
     * schema introspection reconstructs expression indexes with invalid
     * operator classes (observed 2026-07-03: `chain_id text_ops, freeze_block
     * int4_ops, lower(wallet) int4_ops` — rejected by Postgres), which blocked
     * production migration validation. The Drizzle source and the dev DB were
     * both correct; only the platform's reconstruction of expression indexes
     * is buggy, so the schema must stay expression-free in indexes.
     */
    uniqueIndex("historical_member_wallet_uq").on(
      t.chainId,
      t.freezeBlock,
      t.wallet,
    ),
  ],
);

export const insertHistoricalMemberFreezeSchema =
  createInsertSchema(historicalMemberFreeze);
export const selectHistoricalMemberFreezeSchema =
  createSelectSchema(historicalMemberFreeze);
export const insertHistoricalMemberSchema = createInsertSchema(historicalMember);
export const selectHistoricalMemberSchema = createSelectSchema(historicalMember);

export type HistoricalMemberFreezeRow = typeof historicalMemberFreeze.$inferSelect;
export type HistoricalMemberFreezeInsert =
  typeof historicalMemberFreeze.$inferInsert;
export type HistoricalMemberRow = typeof historicalMember.$inferSelect;
export type HistoricalMemberInsert = typeof historicalMember.$inferInsert;

/**
 * Successor to SCHEMA_DEFINED_IMPORT_GATED: the founder-gated one-time import
 * has been executed and VERIFIED — freeze row root triple-matched against the
 * live on-chain V1_MEMBER_ROOT, 8 historical members seq 1..8 present, replay
 * reconciles as an exact no-op. Every write path remains gated behind the
 * fail-closed import gate; served api-server code never reads these tables at
 * runtime; freeze status is derived script-side and reflected in the static
 * served freezeGate module. Wallet/proof material stays server-only PII.
 */
export const PART_B_STATUS = "IMPORTED_VERIFIED" as const;
