// operator/operatorRegistryService.ts
//
// Write-zone services for the operator registry: invite (create) and suspend.
// Same fail-closed shape as the referral-terms service:
//   • gated on the exposure flag + DATABASE_URL BEFORE any DB module is touched;
//   • @workspace/db imported ONLY via a lazy await import();
//   • server-side validation is the authority (address form, role allow-list);
//   • every change is a transaction that ALSO writes an audit_log row;
//   • any error rolls back and returns "unavailable".
//
// Suspension takes effect immediately: the operator-authorization bridge
// re-reads the row's status on EVERY request and only ACTIVE resolves to a role,
// so a SUSPENDED operator loses authority on their very next call — no session
// invalidation dance required.

import { randomUUID } from "node:crypto";
import { AUTH_EXPOSURE_FLAG } from "../auth/authExposure";

const OPERATOR_ROLES = new Set([
  "founder_root",
  "protocol_admin",
  "operator",
  "source_reviewer",
  "member_support",
  "content_docs",
  "auditor",
  "worker_agent",
]);

export type RegistryResult = { ok: true } | { ok: false; reason: string };

function gateOpen(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] === "true" &&
    process.env.DATABASE_URL != null &&
    process.env.DATABASE_URL.length > 0
  );
}

export interface InviteOperatorInput {
  wallet: string;
  label: string;
  role: string;
  actorWallet: string;
  actorRole: string;
}

export async function inviteOperator(input: InviteOperatorInput): Promise<RegistryResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };

  const wallet = input.wallet.toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(wallet)) return { ok: false, reason: "bad_wallet" };
  if (input.label.length === 0 || input.label.length > 128) return { ok: false, reason: "bad_label" };
  if (!OPERATOR_ROLES.has(input.role)) return { ok: false, reason: "bad_role" };

  try {
    const { db, operator, auditLog } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    let created = false;
    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: operator.id })
        .from(operator)
        .where(eq(operator.wallet, wallet))
        .limit(1);
      if (existing[0] !== undefined) return; // already registered → no-op
      await tx.insert(operator).values({
        id: randomUUID(),
        wallet,
        label: input.label,
        role: input.role,
        status: "ACTIVE",
      });
      created = true;
      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        action: "operator.invite",
        target: wallet,
        detail: { role: input.role },
        stepUpSigned: false,
      });
    });
    return created ? { ok: true } : { ok: false, reason: "already_exists" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export interface SuspendOperatorInput {
  id: string;
  actorWallet: string;
  actorRole: string;
}

export async function suspendOperator(input: SuspendOperatorInput): Promise<RegistryResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  if (input.id.length === 0 || input.id.length > 64) return { ok: false, reason: "bad_id" };

  try {
    const { db, operator, auditLog } = await import("@workspace/db");
    const { eq, and } = await import("drizzle-orm");
    let result: RegistryResult = { ok: false, reason: "not_found" };
    await db.transaction(async (tx) => {
      // Resolve the row by id for its wallet/role/status (self-suspend guard,
      // last-founder guard, and audit target).
      // FOR UPDATE: lock the target row so concurrent suspends serialize on it
      // — the check-then-update below must be atomic per row.
      const found = await tx
        .select({ wallet: operator.wallet, role: operator.role, status: operator.status })
        .from(operator)
        .where(eq(operator.id, input.id))
        .limit(1)
        .for("update");
      if (found.length === 0) return; // not_found
      const targetWallet = found[0].wallet;
      // Lockout guard: an operator can never suspend themselves.
      if (targetWallet.toLowerCase() === input.actorWallet.toLowerCase()) {
        result = { ok: false, reason: "cannot_suspend_self" };
        return;
      }
      // Last-founder guard: never suspend the last ACTIVE founder_root — the
      // founder tier must never be emptied, or the protocol would freeze. (An
      // already-SUSPENDED founder row doesn't count toward the live tier.)
      if (found[0].role === "founder_root" && found[0].status === "ACTIVE") {
        // FOR UPDATE: lock ALL ACTIVE founder rows while counting, so two
        // concurrent founder suspends can never both observe count=2 and
        // empty the tier — the second transaction blocks here, then re-reads
        // the committed state and refuses.
        const activeFounders = await tx
          .select({ id: operator.id })
          .from(operator)
          .where(and(eq(operator.role, "founder_root"), eq(operator.status, "ACTIVE")))
          .for("update");
        if (activeFounders.length <= 1) {
          result = { ok: false, reason: "last_founder" };
          return;
        }
      }
      await tx
        .update(operator)
        .set({ status: "SUSPENDED", updatedAt: new Date() })
        .where(eq(operator.id, input.id));
      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        action: "operator.suspend",
        target: targetWallet,
        detail: { id: input.id },
        stepUpSigned: false,
      });
      result = { ok: true };
    });
    return result;
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

// Wallet is masked server-side (0x88ec…dd73) — the full wallet never leaves the
// server, so no operator PII is echoed and the response carries no 40/64-hex
// material for the leak-scan to catch.
export interface OperatorRow {
  id: string;
  walletShort: string;
  label: string;
  role: string;
  status: string;
}
export type ListResult =
  | { ok: true; operators: OperatorRow[] }
  | { ok: false; reason: string };

// Read-only registry list for the admin surface. Gated + lazy-DB like the
// writes; returns masked wallets only. Reads are not privileged mutations, so
// nothing is audited here.
export async function listOperators(): Promise<ListResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  try {
    const { db, operator } = await import("@workspace/db");
    const rows = await db
      .select({
        id: operator.id,
        wallet: operator.wallet,
        label: operator.label,
        role: operator.role,
        status: operator.status,
      })
      .from(operator);
    const operators: OperatorRow[] = rows.map((r) => ({
      id: r.id,
      walletShort:
        r.wallet.length >= 10 ? `${r.wallet.slice(0, 6)}…${r.wallet.slice(-4)}` : r.wallet,
      label: r.label,
      role: r.role,
      status: r.status,
    }));
    return { ok: true, operators };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
