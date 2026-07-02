/**
 * Protocol Time foundation — verified block-timestamp cache (SERVER-ONLY).
 * -----------------------------------------------------------------------
 * A reusable, chain-derived block-timestamp cache keyed by (chainId, blockNumber).
 * This is deliberately a SEPARATE table rather than a column on `sale_event_raw`:
 *   - `sale_event_raw` is an insert-only raw index; adding a timestamp column
 *     would create its first UPDATE path. This cache keeps the raw index pristine.
 *   - Multiple raw rows share a block; the cache stores each block exactly once.
 *   - Future read-models (Activity, Chronicle) can reuse the same cache without
 *     re-fetching or touching raw rows.
 *
 * Truth rules:
 *   - `blockTimestampSec` is ALWAYS parsed from an eth_getBlockByNumber response
 *     on the verified chain (eth_chainId checked first). It is never derived from
 *     wall-clock time. `fetchedAt` is bookkeeping only — never protocol time.
 *   - `blockHash` is stored as a divergence witness: replays hard-fail if the
 *     chain ever reports a different hash/timestamp for a cached block.
 *   - Rows are only ever written by the founder-gated enrichment script; served
 *     code never writes.
 */

import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const blockTimestamp = pgTable(
  "block_timestamp",
  {
    chainId: integer("chain_id").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    /** Chain-derived block timestamp in epoch SECONDS (never wall-clock). */
    blockTimestampSec: bigint("block_timestamp_sec", {
      mode: "number",
    }).notNull(),
    /** Block hash returned alongside the timestamp (divergence witness). */
    blockHash: text("block_hash").notNull(),
    /** Bookkeeping only — when this row was fetched. NEVER protocol time. */
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.chainId, t.blockNumber] })],
);

export const insertBlockTimestampSchema = createInsertSchema(blockTimestamp);
export const selectBlockTimestampSchema = createSelectSchema(blockTimestamp);

export type BlockTimestampRow = typeof blockTimestamp.$inferSelect;
export type BlockTimestampInsert = typeof blockTimestamp.$inferInsert;
