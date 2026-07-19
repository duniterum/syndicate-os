/**
 * Referral Channel Log — SPEC R3 (`&via=`), the constitutionally-named server
 * write class ("Le log des canaux" — CONSTITUTION_AUTORITE §③ N2; founder GO
 * 2026-07-19, referral-arc slice ③).
 * ------------------------------------------------------------------------------
 * The THIRD sanctioned write zone's tables (after the operator write zone and
 * the member own-row notification receipts): written ONLY by the fail-closed
 * `src/channel/` endpoints in the api-server — never by the read-only spine,
 * never by inference.
 *
 * PII POSTURE (ADR-003 — the binding design constraint):
 *   NO VISITOR IDENTITY EXISTS HERE, by construction. A click is an AGGREGATE
 *   daily counter (source × channel tag × UTC day → count). No IP, no user
 *   agent, no cookie, no per-click event row, no timestamp finer than the day.
 *   The platform never stores who clicked — there is nothing to leak.
 *   `source_id_hex` is the on-chain 64-hex source id (public chain data, the
 *   member's own row); `tx_hash` is a public on-chain transaction hash. The
 *   channel breakdown is served OWN-ROW ONLY (the session's own source),
 *   never a directory, never a lookup of a third party.
 *
 * A conversion row is written ONLY after the server itself verified the
 * transaction receipt on-chain (the purchase event exists and names this
 * source) — the channel is off-chain, but it points at an on-chain PROOF
 * (SPEC R3: "rattachement au reçu on-chain par le hash de transaction").
 *
 * Nothing here is active until a Postgres `DATABASE_URL` is provisioned and
 * migrated (`pnpm --filter @workspace/db push`); absent it, the channel
 * endpoints fail closed (204, nothing recorded) and these tables stay unused.
 */

import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/**
 * Daily click counters — one row per (source, channel tag, UTC day).
 * The write path increments `clicks` via ON CONFLICT on the unique triple;
 * rows are bounded by real sources × capped tags × days, never by traffic.
 * Expression-free by discipline (dev→prod introspection constraint).
 */
export const referralChannelClick = pgTable(
  "referral_channel_click",
  {
    id: text("id").primaryKey(),
    sourceIdHex: text("source_id_hex").notNull(), // 64-hex, lowercased, registry-verified
    via: text("via").notNull(), // normalized channel tag (lowercased, format-capped)
    day: text("day").notNull(), // UTC day "YYYY-MM-DD" — the ONLY time grain
    clicks: integer("clicks").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tripleUnique: uniqueIndex("referral_channel_click_triple_unique").on(
      t.sourceIdHex,
      t.via,
      t.day,
    ),
    sourceIdx: index("referral_channel_click_source_idx").on(t.sourceIdHex),
  }),
);

/**
 * Receipt-verified conversions — one row per on-chain purchase (tx hash),
 * written only after server-side verification of the purchase event. The
 * unique tx hash makes double-counting impossible; the day is the UTC day of
 * the recording. Carries NOTHING about the buyer beyond what the public
 * chain already published inside the transaction itself.
 */
export const referralChannelConversion = pgTable(
  "referral_channel_conversion",
  {
    id: text("id").primaryKey(),
    sourceIdHex: text("source_id_hex").notNull(),
    via: text("via").notNull(),
    txHash: text("tx_hash").notNull(), // public on-chain proof pointer, lowercased
    day: text("day").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    txUnique: uniqueIndex("referral_channel_conversion_tx_unique").on(t.txHash),
    sourceIdx: index("referral_channel_conversion_source_idx").on(t.sourceIdHex),
  }),
);

// ── drizzle-zod schemas for fail-closed endpoint validation ──────────────────
export const insertReferralChannelClickSchema = createInsertSchema(referralChannelClick);
export const selectReferralChannelClickSchema = createSelectSchema(referralChannelClick);
export const insertReferralChannelConversionSchema = createInsertSchema(
  referralChannelConversion,
);
export const selectReferralChannelConversionSchema = createSelectSchema(
  referralChannelConversion,
);
