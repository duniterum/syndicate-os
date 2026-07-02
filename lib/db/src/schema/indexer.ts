/**
 * Raw Sale Event Indexing Foundation — Sprint 2B-Part A (SERVER-ONLY).
 * -------------------------------------------------------------------
 * Two read-only-facing indexer tables that persist RAW, decoded membership-sale
 * events scanned from Avalanche C-Chain via read-only eth_getLogs. This is an
 * INDEXING FOUNDATION only:
 *   - It never writes to any chain, never touches a wallet, never mints/claims.
 *   - It records raw event rows keyed by (chainId, transactionHash, logIndex) so
 *     the scan is idempotent and resumable.
 *   - `decodedJson` / `rawJson` are SERVER-ONLY. They may contain buyer / recipient
 *     / sourceWallet addresses and source/referral fields; these columns are NEVER
 *     serialized into any public/HTTP payload. A public surface is a separate,
 *     later, founder-approved concern.
 *
 * Explicitly NOT in scope here (Part B, not built): historical-member freeze/root
 * import, Merkle generation, V1 seat #1–#2 assignment, or any member-identity
 * projection. No member is inferred or assigned from these raw rows.
 */

import {
  bigint,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/** Membership-sale engine generation this raw event belongs to. */
export const saleGenerationEnum = pgEnum("sale_generation", [
  "V1",
  "V2A",
  "V2B",
  "V3",
]);

/**
 * Per-(chain, contract, event) scan cursor. `lastScannedBlock` is the highest
 * block fully scanned+persisted; a resume starts at `lastScannedBlock + 1`.
 * Keyed by safe internal `contractKey` (never an address).
 */
export const indexerCursor = pgTable(
  "indexer_cursor",
  {
    chainId: integer("chain_id").notNull(),
    contractKey: text("contract_key").notNull(),
    eventName: text("event_name").notNull(),
    generation: saleGenerationEnum("generation").notNull(),
    /** Pinned canon deployment block — the earliest block ever scanned. */
    fromBlock: bigint("from_block", { mode: "number" }).notNull(),
    /** Highest block fully scanned+persisted (fromBlock-1 == nothing yet). */
    lastScannedBlock: bigint("last_scanned_block", { mode: "number" })
      .notNull()
      .default(0),
    /** Last log index seen within lastScannedBlock (informational). */
    lastLogIndex: integer("last_log_index"),
    /** idle | running | error | complete. */
    status: text("status").notNull().default("idle"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.chainId, t.contractKey, t.eventName] }),
  ],
);

/**
 * Raw, decoded membership-sale event rows. Idempotent on
 * (chainId, transactionHash, logIndex). `decodedJson`/`rawJson` are SERVER-ONLY.
 */
export const saleEventRaw = pgTable(
  "sale_event_raw",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    chainId: integer("chain_id").notNull(),
    /** Safe internal contract key — never an address. */
    contractKey: text("contract_key").notNull(),
    generation: saleGenerationEnum("generation").notNull(),
    eventName: text("event_name").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    blockHash: text("block_hash"),
    transactionHash: text("transaction_hash").notNull(),
    logIndex: integer("log_index").notNull(),
    /** keccak256(eventSignature) — the log's topic0. */
    topic0: text("topic0").notNull(),
    /** SERVER-ONLY decoded fields (may contain addresses). Never emitted. */
    decodedJson: jsonb("decoded_json").notNull(),
    /** SERVER-ONLY untouched log (topics/data) for future re-decode. */
    rawJson: jsonb("raw_json"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("sale_event_raw_chain_tx_log_uq").on(
      t.chainId,
      t.transactionHash,
      t.logIndex,
    ),
    index("sale_event_raw_contract_block_idx").on(
      t.contractKey,
      t.blockNumber,
    ),
  ],
);

export const insertIndexerCursorSchema = createInsertSchema(indexerCursor);
export const selectIndexerCursorSchema = createSelectSchema(indexerCursor);
export const insertSaleEventRawSchema = createInsertSchema(saleEventRaw);
export const selectSaleEventRawSchema = createSelectSchema(saleEventRaw);

export type IndexerCursorRow = typeof indexerCursor.$inferSelect;
export type IndexerCursorInsert = typeof indexerCursor.$inferInsert;
export type SaleEventRawRow = typeof saleEventRaw.$inferSelect;
export type SaleEventRawInsert = typeof saleEventRaw.$inferInsert;
