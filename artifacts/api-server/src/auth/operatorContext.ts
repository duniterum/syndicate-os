// auth/operatorContext.ts
//
// Operator-authorization bridge (READ-ONLY). Resolves a SIWE-verified wallet
// session to its operator ROLE via the Phase 3 operator registry, so the write
// zone can gate on a real, ACTIVE operator row instead of on wallet control
// alone. This does not itself write anything and does not grant any authority
// beyond reporting the role.
//
// Fail-closed on every axis, and it NEVER couples the read-only server to a
// database at boot: `@workspace/db` throws at import time when DATABASE_URL is
// unset, so we import it LAZILY and only after confirming BOTH that the auth
// zone is enabled AND that a database is provisioned. Any miss — no DB, zone
// disabled, unknown wallet, non-ACTIVE status, or any error — returns
// "not an operator". The verified account is used server-side only and is
// never echoed back.

import { eq } from "drizzle-orm";
import { AUTH_EXPOSURE_FLAG } from "./authExposure";

export interface OperatorContext {
  isOperator: boolean;
  /** Coarse operator role, or null. Never any wallet/label/identity material. */
  role: string | null;
}

const NOT_OPERATOR: OperatorContext = { isOperator: false, role: null };

/**
 * Look a SIWE-verified account up in the operator registry. Returns the role
 * only when an operator row exists AND its status is ACTIVE. Fail-closed.
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function lookupActiveOperator(account: string): Promise<OperatorContext> {
  // Gate first: never touch the DB module unless the zone is enabled AND a
  // database is provisioned. This keeps the read-only server bootable with no DB.
  if (
    process.env[AUTH_EXPOSURE_FLAG] !== "true" ||
    process.env.DATABASE_URL == null ||
    process.env.DATABASE_URL.length === 0
  ) {
    return NOT_OPERATOR;
  }

  try {
    // Lazy import: defers @workspace/db's boot-time DATABASE_URL assertion until
    // we have already confirmed DATABASE_URL is present.
    const { db, operator } = await import("@workspace/db");
    const rows = await db
      .select({ role: operator.role, status: operator.status })
      .from(operator)
      .where(eq(operator.wallet, account.toLowerCase()))
      .limit(1);

    const row = rows[0];
    if (row === undefined || row.status !== "ACTIVE") {
      return NOT_OPERATOR;
    }
    return { isOperator: true, role: row.role };
  } catch {
    // Any DB/schema/connection error → fail closed, never grant authority.
    return NOT_OPERATOR;
  }
}
