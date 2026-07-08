// operator/referralTermsService.ts
//
// The FIRST real write in the OS: persist a referral-program term. Lives in the
// write zone (src/operator), NOT in the registry-less auth zone. Security
// properties, all enforced here:
//   • fail-closed gate — writes only when the auth zone is enabled AND a DB is
//     provisioned; checked BEFORE any DB module is touched;
//   • server-side validation is the authority — an allow-list of keys and a
//     HARD 30% cap on any basis-point rate (a client can never exceed it);
//   • every write is a single transaction that ALSO records an audit_log row —
//     there is no term write without an audit trail;
//   • the audit detail carries the `source-terms-changed` transparency marker
//     so the change can surface in Activity / Chronicle (old→new lives in audit);
//   • any error rolls the transaction back and returns "unavailable" — a failed
//     write never half-applies and never grants anything.

import { randomUUID } from "node:crypto";
import { AUTH_EXPOSURE_FLAG } from "../auth/authExposure";

/** Server-side authority: 30% == 3000 bps. Mirrors studio commissionCapPct. */
export const HARD_CAP_BPS = 3000;

/** Only these term keys may be written. Unknown keys are rejected. */
const ALLOWED_KEYS = new Set([
  "commissionBps",
  "capBps",
  "attributionWindowDays",
  "minPurchaseUsdc",
  "programStatus",
]);

/** Keys whose value is a basis-point rate, subject to the hard cap. */
const BPS_KEYS = new Set(["commissionBps", "capBps"]);

export type SaveResult = { ok: true } | { ok: false; reason: string };

export interface SaveReferralTermInput {
  key: string;
  value: string;
  /** SIWE-verified operator account (server-only). */
  actorWallet: string;
  /** Operator role resolved from the ACTIVE registry row. */
  actorRole: string;
}

export async function saveReferralTerm(input: SaveReferralTermInput): Promise<SaveResult> {
  // 1) Fail-closed gate — before touching any DB module.
  if (
    process.env[AUTH_EXPOSURE_FLAG] !== "true" ||
    process.env.DATABASE_URL == null ||
    process.env.DATABASE_URL.length === 0
  ) {
    return { ok: false, reason: "unavailable" };
  }

  // 2) Server-side validation is the authority.
  if (!ALLOWED_KEYS.has(input.key)) {
    return { ok: false, reason: "unknown_key" };
  }
  if (input.value.length === 0 || input.value.length > 256) {
    return { ok: false, reason: "bad_value" };
  }
  if (BPS_KEYS.has(input.key)) {
    const n = Number(input.value);
    if (!Number.isInteger(n) || n < 0 || n > HARD_CAP_BPS) {
      return { ok: false, reason: "rate_out_of_range" };
    }
  }

  // 3) Transactional write: upsert the term AND record the audit row together.
  try {
    const { db, referralTerm, auditLog } = await import("@workspace/db");
    await db.transaction(async (tx) => {
      await tx
        .insert(referralTerm)
        .values({
          id: randomUUID(),
          key: input.key,
          value: input.value,
          updatedBy: input.actorWallet,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: referralTerm.key,
          set: {
            value: input.value,
            updatedBy: input.actorWallet,
            updatedAt: new Date(),
          },
        });
      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        action: "referral-term.save",
        target: input.key,
        detail: {
          key: input.key,
          value: input.value,
          event: "source-terms-changed",
        },
        stepUpSigned: false,
      });
    });
    return { ok: true };
  } catch {
    // Rolled back; never half-applied.
    return { ok: false, reason: "unavailable" };
  }
}
