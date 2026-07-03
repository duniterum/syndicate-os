/**
 * Member Continuity substrate — Holder Index Phase 2 (SERVER-ONLY, SCHEMA ONLY).
 * ------------------------------------------------------------------------------
 * Founder-approved schema-definition slice (Phase 2 of
 * docs/architecture/HOLDER_INDEX_READ_MODEL_DESIGN.md §14; design accepted at
 * commit 45cf487). SCHEMA CODE ONLY: no DDL has been executed, no tables exist,
 * no builder writes rows, no served code may ever import this module.
 * Actual DB creation is a SEPARATE founder/Dave gate.
 *
 * Derived-artifact doctrine (parent design §7, verbatim from identity canon):
 *   - These tables are DERIVED, DROPPABLE artifacts — never primary truth.
 *     "Rebuild = pure function of (historical_member_freeze + historical_member
 *     + sale_event_raw). Deterministic, idempotent, droppable and fully
 *     rebuildable." "No manual fields. No stored eligibility."
 *   - Authority stays upstream: Part B freeze/root for #1–#8, the emitted V3
 *     memberNumber for #9+, the canon event registry for taxonomy.
 *   - Fail-closed persistence (Part B precedent): only a VERIFIED build may
 *     persist anything. A failed build aborts and writes NOTHING — `status`
 *     is CHECK-limited to 'VERIFIED' so no other state can exist.
 *
 * Numbering doctrine baked into DDL:
 *   - CHECK (member_number >= 1): the V2B sentinel 0 can never be a member.
 *   - numbering_authority is CHECK-limited to 'PART_B_FREEZE_ROOT' | 'V3_EMITTED'
 *     and cross-CHECKed against generation (V3 ⇔ V3_EMITTED — no exceptions).
 *   - Part-B-authority rows must carry freeze lineage (composite FK to
 *     historical_member); V3-authority rows must carry raw-event lineage
 *     (FK to sale_event_raw). Provenance is structural, not optional.
 *   - entry_first_seat is CHECK-limited to 'true' | 'unknown': an
 *     identity-bearing entry receipt can never be a firstSeat=false row
 *     ('unknown' = V1, where the field was never emitted — never inferred).
 *
 * ENTRY-RECEIPT-ONLY boundary (founder doctrine — never collapse concepts):
 *   `member_continuity_record` stores the identity-bearing ENTRY receipt only.
 *   It is NOT the general receipt/proof-trail table. One member has exactly
 *   one identity-bearing entry proof (enforced by PK + firstSeat CHECK); the
 *   OS may later have MANY receipts/proofs per member/wallet — later seats
 *   (firstSeat=false purchases), Archive1155/artifact events, marketplace/
 *   artifact receipts, and future protocol proofs. Those multi-receipt flows
 *   belong to a future Activity/Register/Archive slice with its own table(s)
 *   and their own founder gate — never to this table. Every receipt column
 *   here carries the `entry_` prefix to make that boundary unmissable.
 *
 * Gated fields (deliberately ABSENT — founder decision, Phase 2 approval):
 *   NO V3 source/referral columns exist here and none are reserved. They may
 *   only be added by a future explicitly approved source/attribution gate.
 *
 * PII posture (mirrors historical_member):
 *   - `entry_wallet`, `entry_transaction`, `entry_block`, `entry_log_index`,
 *     `routed_fold` are SERVER-ONLY and de-anonymizing. NEVER serialized into
 *     any public/HTTP payload, log, founder report, or committed artifact.
 *     The memberNumber→wallet mapping must never be exposed anywhere.
 *   - `member_continuity_verification_run` holds NO PII: aggregate counts,
 *     booleans, hashes, and the public on-chain root commitment only.
 *
 * Index discipline: expression-free indexes only (Replit publish-time dev→prod
 * introspection reconstructs expression indexes with invalid operator classes —
 * see historical_member_wallet_uq note in partB.ts).
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
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { saleEventRaw, saleGenerationEnum } from "./indexer";
import { historicalMember } from "./partB";

/**
 * One row per VERIFIED build of the member-continuity read-model.
 * Founder decision: ALL runs are kept (tiny rows, audit trail); any
 * retention/pruning policy is a later decision. NO PII.
 */
export const memberContinuityVerificationRun = pgTable(
  "member_continuity_verification_run",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    chainId: integer("chain_id").notNull(),
    /** CHECK-limited: 'VERIFIED' is the only persistable state (fail-closed). */
    status: text("status").notNull(),
    /** Freeze lineage this build was reconciled against (Part B authority). */
    freezeBlock: bigint("freeze_block", { mode: "number" }).notNull(),
    /** The triple-matched root (public on-chain commitment — no PII). */
    freezeRoot: text("freeze_root").notNull(),
    /** Totals — CHECK-reconciled: historical + v3 == total == on-chain count. */
    memberTotal: integer("member_total").notNull(),
    historicalCount: integer("historical_count").notNull(),
    v3Count: integer("v3_count").notNull(),
    /** Live memberCount() read at build time (reconciliation target). */
    onchainMemberCount: integer("onchain_member_count").notNull(),
    /** Hash of the canonically-serialized output (shuffled-input identity). */
    determinismHash: text("determinism_hash").notNull(),
    /** Raw-input provenance: how much of sale_event_raw this build consumed. */
    inputSaleEventCount: integer("input_sale_event_count").notNull(),
    inputMaxSaleEventRawId: bigint("input_max_sale_event_raw_id", {
      mode: "number",
    }),
    /** Builder code provenance (version/commit label of the builder). */
    builderVersion: text("builder_version").notNull(),
    /**
     * Memorializes reconciliation outcomes: booleans and AGGREGATE counts only
     * (root triple-match, V3 contiguity, sentinel exclusions, fold cardinality).
     * Never contains wallets, transaction hashes, or per-member data.
     */
    verification: jsonb("verification").notNull(),
    builtAt: timestamp("built_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    /**
     * Redundant with the PK on `id` alone, but required as a composite FK
     * target so record rows are chain-scoped to their build (a record can
     * never reference a verification run from a different chain).
     * Must be a UNIQUE CONSTRAINT (inline in CREATE TABLE), not a unique
     * index: the FK ALTER is emitted before CREATE INDEX statements, so an
     * index-flavored target does not exist yet when the FK is validated.
     */
    unique("member_continuity_run_chain_id_uq").on(t.chainId, t.id),
    check(
      "member_continuity_run_status_verified",
      sql`${t.status} = 'VERIFIED'`,
    ),
    check(
      "member_continuity_run_totals_reconcile",
      sql`${t.memberTotal} = ${t.historicalCount} + ${t.v3Count}`,
    ),
    check(
      "member_continuity_run_onchain_match",
      sql`${t.memberTotal} = ${t.onchainMemberCount}`,
    ),
  ],
);

/**
 * One row per member — the era-unified continuity record with its entry
 * receipt folded 1:1 (parent design §8: the atomic membership-truth object is
 * exactly one entry receipt per member number; later purchases are activity,
 * never identity). SERVER-ONLY — entry columns are PII/de-anonymizing.
 * Derived + droppable: rebuilt in full by every VERIFIED build.
 */
export const memberContinuityRecord = pgTable(
  "member_continuity_record",
  {
    chainId: integer("chain_id").notNull(),
    /** 1-based member number. CHECK >= 1 excludes the V2B sentinel 0. */
    memberNumber: integer("member_number").notNull(),
    /** Sale generation of the entry (era is preserved, never collapsed). */
    generation: saleGenerationEnum("generation").notNull(),
    /** Which authority numbered this member (CHECK-locked per era). */
    numberingAuthority: text("numbering_authority").notNull(),
    /** Part B lineage: NOT NULL iff authority is PART_B_FREEZE_ROOT. */
    freezeBlock: bigint("freeze_block", { mode: "number" }),
    /** SERVER-ONLY entry wallet PII (checksum form). Never surfaced anywhere. */
    entryWallet: text("entry_wallet").notNull(),
    /** SERVER-ONLY entry proof trail (explorer-linkable → PII). */
    entryBlock: bigint("entry_block", { mode: "number" }).notNull(),
    entryLogIndex: integer("entry_log_index").notNull(),
    entryTransaction: text("entry_transaction").notNull(),
    /** Emitted-only tri-state collapsed to entry semantics: 'true' | 'unknown'. */
    entryFirstSeat: text("entry_first_seat").notNull(),
    /**
     * Chain-verified entry timestamp (epoch seconds), COPIED from the Protocol
     * Time cache at build time. NULL until enrichment covers the entry block —
     * additive, never blocks identity fields, never wall-clock.
     */
    entryBlockTimestampSec: bigint("entry_block_timestamp_sec", {
      mode: "number",
    }),
    /**
     * SERVER-ONLY folded routing detail of the ENTRY transaction only (V2A/
     * V2B Routed row folded into its entry purchase — txHash-paired,
     * fail-closed cardinality). NULL for eras without a Routed companion.
     */
    entryRoutedFold: jsonb("entry_routed_fold"),
    /** Raw-event lineage: NOT NULL iff authority is V3_EMITTED. */
    saleEventRawId: bigint("sale_event_raw_id", { mode: "number" }),
    /** The VERIFIED build that produced this row (rebuild provenance). */
    buildId: bigint("build_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.chainId, t.memberNumber] }),
    foreignKey({
      name: "member_continuity_partb_fk",
      columns: [t.chainId, t.freezeBlock, t.memberNumber],
      foreignColumns: [
        historicalMember.chainId,
        historicalMember.freezeBlock,
        historicalMember.memberNumber,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "member_continuity_build_fk",
      columns: [t.chainId, t.buildId],
      foreignColumns: [
        memberContinuityVerificationRun.chainId,
        memberContinuityVerificationRun.id,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "member_continuity_raw_event_fk",
      columns: [t.saleEventRawId],
      foreignColumns: [saleEventRaw.id],
    }).onDelete("restrict"),
    check("member_continuity_number_min", sql`${t.memberNumber} >= 1`),
    check(
      "member_continuity_authority_enum",
      sql`${t.numberingAuthority} IN ('PART_B_FREEZE_ROOT', 'V3_EMITTED')`,
    ),
    check(
      "member_continuity_authority_era",
      sql`(${t.generation} = 'V3') = (${t.numberingAuthority} = 'V3_EMITTED')`,
    ),
    check(
      "member_continuity_partb_lineage",
      sql`(${t.numberingAuthority} = 'PART_B_FREEZE_ROOT') = (${t.freezeBlock} IS NOT NULL)`,
    ),
    check(
      "member_continuity_v3_lineage",
      sql`(${t.numberingAuthority} = 'V3_EMITTED') = (${t.saleEventRawId} IS NOT NULL)`,
    ),
    check(
      "member_continuity_entry_first_seat",
      sql`${t.entryFirstSeat} IN ('true', 'unknown')`,
    ),
    check(
      "member_continuity_entry_routed_fold_era",
      sql`${t.entryRoutedFold} IS NULL OR ${t.generation} IN ('V2A', 'V2B')`,
    ),
    /** One identity per event position (expression-free by discipline). */
    uniqueIndex("member_continuity_entry_event_uq").on(
      t.chainId,
      t.entryTransaction,
      t.entryLogIndex,
    ),
  ],
);

export const insertMemberContinuityVerificationRunSchema = createInsertSchema(
  memberContinuityVerificationRun,
);
export const selectMemberContinuityVerificationRunSchema = createSelectSchema(
  memberContinuityVerificationRun,
);
export const insertMemberContinuityRecordSchema = createInsertSchema(
  memberContinuityRecord,
);
export const selectMemberContinuityRecordSchema = createSelectSchema(
  memberContinuityRecord,
);

export type MemberContinuityVerificationRunRow =
  typeof memberContinuityVerificationRun.$inferSelect;
export type MemberContinuityVerificationRunInsert =
  typeof memberContinuityVerificationRun.$inferInsert;
export type MemberContinuityRecordRow =
  typeof memberContinuityRecord.$inferSelect;
export type MemberContinuityRecordInsert =
  typeof memberContinuityRecord.$inferInsert;

/**
 * Boundary marker: DDL has been PUSHED (founder-approved S1 gate, dev
 * database) and the founder-approved S3b write has PERSISTED the VERIFIED
 * build (one verification run + the full record set), written ONLY by the
 * founder-armed `member-continuity:write` script in a single transaction.
 * No served/runtime code reads or imports this schema; rows remain
 * derived/droppable and rebuildable from their sources.
 */
export const MEMBER_CONTINUITY_SCHEMA_STATUS =
  "SCHEMA_PUSHED_S3B_ROWS_PERSISTED" as const;
