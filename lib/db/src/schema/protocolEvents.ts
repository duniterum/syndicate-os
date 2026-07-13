/**
 * Generic protocol-event indexing lane — Slice M4-c (SERVER-ONLY).
 * -----------------------------------------------------------------
 * The event backbone's SECOND scan lane: raw, decoded protocol events that are
 * not membership-sale events — SYN burns (ERC20 Transfer to the dead address)
 * and Source Registry lifecycle events. Additive tables, deliberately separate
 * from the sale lane (`indexer_cursor` / `sale_event_raw` carry a sale-
 * generation enum that does not apply here; the proven sale machinery stays
 * byte-stable).
 *
 * Discipline (identical to the sale lane):
 *   - Read-only against chain; the ONLY writes are these tables.
 *   - Rows keyed idempotently by (chainId, transactionHash, logIndex).
 *   - `decodedJson` is SERVER-ONLY (a burn row carries the sender address);
 *     it is NEVER serialized into any public payload — the feed projection
 *     translates a sender to its Founder/Community LABEL before the gate.
 *   - The cursor advances only past fully persisted chunks — the persisted
 *     history is gapless by construction (the Proof-of-Burn numbering law).
 */

import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/**
 * Per-(chain, stream, event) scan cursor. `lastScannedBlock` is the highest
 * block fully scanned+persisted; a resume starts at `lastScannedBlock + 1`
 * (minus the reorg overlap). Keyed by safe internal `streamKey` — never an
 * address.
 */
export const protocolEventCursor = pgTable(
  "protocol_event_cursor",
  {
    chainId: integer("chain_id").notNull(),
    streamKey: text("stream_key").notNull(),
    eventName: text("event_name").notNull(),
    /** Pinned canon deployment block — the earliest block ever scanned. */
    fromBlock: bigint("from_block", { mode: "number" }).notNull(),
    /** Highest block fully scanned+persisted (fromBlock-1 == nothing yet). */
    lastScannedBlock: bigint("last_scanned_block", { mode: "number" })
      .notNull()
      .default(0),
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
  (t) => [primaryKey({ columns: [t.chainId, t.streamKey, t.eventName] })],
);

/**
 * Raw, decoded protocol-event rows. Idempotent on
 * (chainId, transactionHash, logIndex). `decodedJson` is SERVER-ONLY.
 */
export const protocolEventRaw = pgTable(
  "protocol_event_raw",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    chainId: integer("chain_id").notNull(),
    /** Safe internal stream key — never an address. */
    streamKey: text("stream_key").notNull(),
    eventName: text("event_name").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    blockHash: text("block_hash"),
    transactionHash: text("transaction_hash").notNull(),
    logIndex: integer("log_index").notNull(),
    /** keccak256(eventSignature) — the log's topic0. */
    topic0: text("topic0").notNull(),
    /** SERVER-ONLY decoded fields (may contain addresses). Never emitted. */
    decodedJson: jsonb("decoded_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("protocol_event_raw_chain_tx_log_uq").on(
      t.chainId,
      t.transactionHash,
      t.logIndex,
    ),
    index("protocol_event_raw_stream_block_idx").on(
      t.streamKey,
      t.blockNumber,
    ),
  ],
);

export const insertProtocolEventCursorSchema =
  createInsertSchema(protocolEventCursor);
export const selectProtocolEventCursorSchema =
  createSelectSchema(protocolEventCursor);
export const insertProtocolEventRawSchema = createInsertSchema(protocolEventRaw);
export const selectProtocolEventRawSchema = createSelectSchema(protocolEventRaw);

export type ProtocolEventCursorRow = typeof protocolEventCursor.$inferSelect;
export type ProtocolEventRawRow = typeof protocolEventRaw.$inferSelect;
export type ProtocolEventRawInsert = typeof protocolEventRaw.$inferInsert;
