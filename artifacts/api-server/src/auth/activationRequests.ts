// auth/activationRequests.ts — K3.a: the member's OWN "Ask for activation"
// request rows (the FIFTH sanctioned DB bridge; mockup founder-approved
// 2026-07-22 "GO and GO-Live").
// ---------------------------------------------------------------------------
// THE SECOND member-side write class (after notification receipts). Own-row
// ONLY: the single input is the session's SERVER-SIDE bound account; there is
// no lookup surface, the account is never echoed, and served rows carry NO
// wallet. A request is a REQUEST — approval is never a server act: only the
// founder's on-chain signatures move protocol state; the operator zone's
// decide service (activationQueueService) owns every status flip except the
// member's own ask.
//
// Boundary discipline (mirrors memberInbox.ts). The registry-less server
// stays bootable: @workspace/db is imported LAZILY and only after confirming
// BOTH that the auth zone is enabled AND that a database is provisioned.
// Any miss — no DB, zone disabled, error — fails closed (null / "unavailable").
// The ask is AUDITED (the K3 engraved order): the request row and its
// audit_log row commit in ONE transaction; the audit target is the request id,
// never a wallet↔seat pairing.

import { randomUUID } from "node:crypto";
import { AUTH_EXPOSURE_FLAG } from "./authExposure";

/** The member's own view of their latest request — no wallet, no seat. */
export interface OwnActivationRequest {
  /** WAITING | HOLD | DECLINED | CLOSED (served verbatim; client words it). */
  status: string;
  askedAtIso: string | null;
  decidedAtIso: string | null;
  /** The founder's human sentence — only ever set on DECLINED. */
  declineReason: string | null;
  /** Only ever set on CLOSED (e.g. reality answered on-chain). */
  closeCause: string | null;
}

function gateClosed(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] !== "true" ||
    process.env.DATABASE_URL == null ||
    process.env.DATABASE_URL.length === 0
  );
}

/**
 * The signed wallet's OWN latest request (any status), or null request when
 * none exists. Outer null = read unavailable (fail closed, never invented).
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function readOwnActivationRequest(
  account: string,
): Promise<{ request: OwnActivationRequest | null } | null> {
  if (gateClosed()) return null;
  try {
    const { db, activationRequest } = await import("@workspace/db");
    const { eq, desc } = await import("drizzle-orm");
    const me = account.toLowerCase();
    const rows = await db
      .select({
        status: activationRequest.status,
        askedAt: activationRequest.askedAt,
        decidedAt: activationRequest.decidedAt,
        declineReason: activationRequest.declineReason,
        closeCause: activationRequest.closeCause,
      })
      .from(activationRequest)
      .where(eq(activationRequest.memberWallet, me))
      .orderBy(desc(activationRequest.askedAt))
      .limit(1);
    if (rows.length === 0) return { request: null };
    const r = rows[0];
    return {
      request: {
        status: r.status,
        askedAtIso: r.askedAt instanceof Date ? r.askedAt.toISOString() : null,
        decidedAtIso:
          r.decidedAt instanceof Date ? r.decidedAt.toISOString() : null,
        declineReason: r.declineReason,
        closeCause: r.closeCause,
      },
    };
  } catch {
    return null; // fail closed — never invent a request state
  }
}

/**
 * File the signed wallet's OWN activation request. ONE open request per
 * wallet (WAITING/HOLD) — enforced here in the transaction, never by a
 * partial index. The caller (the route) has already re-verified eligibility
 * live; this module only writes rows. The request row and its audit row
 * commit together or not at all.
 *
 * @param account     SIWE-verified account, lowercased (server-only).
 * @param sourceIdHex The wallet's derived 64-hex source id (server-derived).
 */
export async function createOwnActivationRequest(
  account: string,
  sourceIdHex: string,
): Promise<"created" | "exists" | "unavailable"> {
  if (gateClosed()) return "unavailable";
  try {
    const { db, activationRequest, auditLog } = await import("@workspace/db");
    const { eq, and, inArray, sql } = await import("drizzle-orm");
    const me = account.toLowerCase();
    const id = randomUUID();
    let outcome: "created" | "exists" = "created";
    await db.transaction(async (tx) => {
      // Serialize concurrent asks per wallet (adversarial verify 2026-07-22):
      // under READ COMMITTED two concurrent transactions would both see "no
      // open row" and both insert — the advisory xact lock makes the
      // check-then-insert atomic per wallet, released automatically at
      // commit/rollback. No schema change (push stays clean).
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${me}))`);
      const open = await tx
        .select({ id: activationRequest.id })
        .from(activationRequest)
        .where(
          and(
            eq(activationRequest.memberWallet, me),
            inArray(activationRequest.status, ["WAITING", "HOLD"]),
          ),
        )
        .limit(1);
      if (open.length > 0) {
        outcome = "exists";
        return;
      }
      await tx.insert(activationRequest).values({
        id,
        memberWallet: me,
        sourceIdHex: sourceIdHex.toLowerCase(),
        status: "WAITING",
      });
      // The engraved order: the intake is AUDITED. Target = the request id —
      // never a wallet↔seat pairing (the audit-table law).
      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: me,
        actorRole: "member",
        action: "activation-request.ask",
        target: `request#${id}`,
        detail: null,
      });
    });
    return outcome;
  } catch {
    return "unavailable"; // fail closed — the member can simply ask again
  }
}
