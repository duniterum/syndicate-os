// auth/memberRoster.ts
//
// Genesis member self-recognition bridge (READ-ONLY). Resolves a SIWE-verified
// wallet session to its OWN frozen genesis seat (#1–#8) via the member-continuity
// roster — the PART_B_FREEZE_ROOT rows, i.e. the historical freeze whose Merkle
// root is triple-matched on-chain against V1_MEMBER_ROOT. This is the companion
// to the LIVE V3 recognition in engineReadback.ts: V3-era seats (#9+) are read
// live from the engine's memberNumberOf; the genesis 8 have NO on-chain
// per-address memberNumberOf, so their own-row seat comes from the frozen roster
// instead.
//
// Boundary discipline (founder-approved amendment, July 2026 — mirrors
// operatorContext.ts, the operator-role bridge). The registry-less server stays
// bootable: @workspace/db is imported LAZILY and only after confirming BOTH that
// the auth zone is enabled AND that a database is provisioned (@workspace/db
// throws at import time when DATABASE_URL is unset). Own-row ONLY: the ONLY input
// is the session's SERVER-SIDE bound account; there is no wallet/seat lookup
// surface, the account is never echoed, and only the member's OWN coarse seat
// number leaves the function. Any miss — no DB, zone disabled, unknown wallet,
// non-genesis row, or any error — returns "not a genesis member". Fail-closed.

import { AUTH_EXPOSURE_FLAG } from "./authExposure";

export interface GenesisMemberContext {
  /** true = the signed wallet owns a frozen genesis seat (#1–#8). */
  recognized: boolean;
  /** EXACT decimal seat string (#1–#8), only when recognized. Never a wallet. */
  memberNumber: string | null;
}

const NOT_A_MEMBER: GenesisMemberContext = { recognized: false, memberNumber: null };

/**
 * Look a SIWE-verified account up in the frozen genesis roster. Returns the OWN
 * seat only when a PART_B_FREEZE_ROOT record exists for that wallet. V3-era
 * seats are deliberately NOT resolved here — they are recognized live from the
 * engine, never from this rebuilt-and-droppable roster. Fail-closed.
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function lookupGenesisMember(
  account: string,
): Promise<GenesisMemberContext> {
  // Gate first: never touch the DB module unless the zone is enabled AND a
  // database is provisioned. Keeps the read-only server bootable with no DB.
  if (
    process.env[AUTH_EXPOSURE_FLAG] !== "true" ||
    process.env.DATABASE_URL == null ||
    process.env.DATABASE_URL.length === 0
  ) {
    return NOT_A_MEMBER;
  }

  try {
    // Lazy import: defers @workspace/db's boot-time DATABASE_URL assertion until
    // we have already confirmed DATABASE_URL is present.
    const { db, memberContinuityRecord } = await import("@workspace/db");
    const { and, eq, sql } = await import("drizzle-orm");
    // entry_wallet is stored in checksum form; the SIWE account is lowercased.
    // Match case-insensitively; scope strictly to the frozen genesis authority.
    const rows = await db
      .select({ memberNumber: memberContinuityRecord.memberNumber })
      .from(memberContinuityRecord)
      .where(
        and(
          sql`lower(${memberContinuityRecord.entryWallet}) = ${account.toLowerCase()}`,
          eq(memberContinuityRecord.numberingAuthority, "PART_B_FREEZE_ROOT"),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (
      row === undefined ||
      typeof row.memberNumber !== "number" ||
      row.memberNumber < 1
    ) {
      return NOT_A_MEMBER;
    }
    return { recognized: true, memberNumber: String(row.memberNumber) };
  } catch {
    // Any DB/schema/connection error → fail closed, never invent a seat.
    return NOT_A_MEMBER;
  }
}
