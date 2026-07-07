/**
 * Operator Write Zone — Phase 3 (auth + operator registry + audit + referral terms).
 * ------------------------------------------------------------------------------
 * The OS's FIRST write-capable tables. Architecturally SEPARATE from the
 * Protocol Reality Spine, which never gains write endpoints. Rows here are
 * written only by fail-closed, step-up-verified operator endpoints — never by
 * public/read paths, never by inference. Mirrors OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.
 *
 * Nothing here is active until BOTH:
 *   (1) a Postgres `DATABASE_URL` is provisioned and migrated
 *       (`pnpm --filter @workspace/db push`), and
 *   (2) `SYNDICATE_AUTH_ENABLED` is set.
 * Absent either, the write endpoints fail closed and these tables stay unused.
 *
 * PII posture: `operator.label` is a private human label — never serialized to
 * any public payload. Audit rows never store wallet↔member-number pairings.
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/** Operator registry — one row per operator wallet, exactly one role. */
export const operator = pgTable(
  "operator",
  {
    id: text("id").primaryKey(),
    wallet: text("wallet").notNull(),
    label: text("label").notNull(), // private human label, never public
    role: text("role").notNull(),
    status: text("status").notNull().default("PENDING"),
    permissions: jsonb("permissions"),
    rowVersion: integer("row_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    walletUnique: uniqueIndex("operator_wallet_unique").on(t.wallet),
    roleValid: check(
      "operator_role_valid",
      sql`${t.role} in ('founder_root','protocol_admin','operator','source_reviewer','member_support','content_docs','auditor','worker_agent')`,
    ),
    statusValid: check(
      "operator_status_valid",
      sql`${t.status} in ('PENDING','ACTIVE','SUSPENDED','REVOKED','ROTATING','EXPIRED')`,
    ),
  }),
);

/** Operator SIWE sessions — short-lived, server-side; a registry change invalidates. */
export const operatorSession = pgTable("operator_session", {
  id: text("id").primaryKey(),
  operatorId: text("operator_id").notNull(),
  wallet: text("wallet").notNull(),
  roleAtLogin: text("role_at_login").notNull(),
  rowVersionAtLogin: integer("row_version_at_login").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

/** Append-only audit log — every privileged action (who / what / target / when). */
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  actorWallet: text("actor_wallet").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  detail: jsonb("detail"),
  stepUpSigned: boolean("step_up_signed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Referral program terms — the editable CRUD state (key/value + who/when).
 * Rate values are stored in basis points; the UI shows percentages. Every write
 * is expected to emit a `source-terms-changed` governance event (transparency).
 */
export const referralTerm = pgTable(
  "referral_term",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedBy: text("updated_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    keyUnique: uniqueIndex("referral_term_key_unique").on(t.key),
  }),
);

// ── drizzle-zod schemas for fail-closed endpoint validation ──────────────────
export const insertOperatorSchema = createInsertSchema(operator);
export const selectOperatorSchema = createSelectSchema(operator);
export const insertOperatorSessionSchema = createInsertSchema(operatorSession);
export const insertAuditLogSchema = createInsertSchema(auditLog);
export const insertReferralTermSchema = createInsertSchema(referralTerm);
export const selectReferralTermSchema = createSelectSchema(referralTerm);
