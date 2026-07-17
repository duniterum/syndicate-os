// scripts/operator-seed-founder-root.ts
// -----------------------------------------------------------------------------
// THE FOUNDER_ROOT SEED CEREMONY (Q36 — OPERATOR_WALLET_AUTH §L.2).
// The ONE-TIME founding act that enrolls the founder's wallet as the first (and
// only) `founder_root` row in the operator registry. Everything else in the
// registry flows FROM this row (invite requires an ACTIVE founder_root), so
// this script is the bootstrap — and ONLY the bootstrap:
//
//   • FIRST-SEED-ONLY: refuses if ANY founder_root row exists in ANY status.
//     This script can never be a takeover, a rotation, or a recovery — those
//     are §F ceremonies with their own authorization, never a script re-run.
//   • DUAL-ARMED (the house holder-index pattern): a dry-run by default; the
//     write requires BOTH `--write` AND `FOUNDER_ROOT_SEED_APPROVED="true"`.
//     The founder's explicit authorization arms it; disarm after the ceremony.
//   • WALLET PINNED TO CANON, never an input: the founder's decision
//     (2026-07-17) is the protocol's recorded Founder wallet, cross-checked at
//     runtime against FINANCIAL_TARGETS.allocationWallets[FOUNDER]. No env/arg
//     wallet exists — a typo'd or hostile environment cannot seed a different
//     address.
//   • TRANSACTIONAL + AUDITED: the operator row and its `operator.seed` audit
//     row commit in ONE transaction (the write-zone house shape).
//   • Backups stay OFFLINE (founder decision, option A): no backup wallet is
//     enrolled here or anywhere online; root recovery is the documented
//     offline ceremony (§F), never a dashboard or script action.
//
// Run (Replit, prod, founder-authorized):
//   dry-run : pnpm --filter @workspace/api-server run operator:seed-founder-root
//   ceremony: FOUNDER_ROOT_SEED_APPROVED=true \
//             pnpm --filter @workspace/api-server run operator:seed-founder-root -- --write
// Verify after: pnpm --filter @workspace/api-server run operator:verify

import { randomUUID } from "node:crypto";
import { FINANCIAL_TARGETS } from "../src/data/protocolTargets";

// The founder's Q36 decision (2026-07-17): the protocol's recorded Founder
// wallet — hardware-signing recommended; backups offline per option A.
const FOUNDER_ROOT_WALLET = "0x88EC79AF0d5A2F3b83022A1770c645506803Dd73";
const FOUNDER_ROOT_LABEL = "Founder"; // private human label — never public
const APPROVAL_FLAG = "FOUNDER_ROOT_SEED_APPROVED";

function mask(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function fail(msg: string): never {
  console.error(`[operator:seed] REFUSED — ${msg}`);
  process.exit(1);
}

async function main(): Promise<void> {
  // ── Canon cross-check: the pinned wallet must BE the canon Founder wallet ──
  const canonFounder = FINANCIAL_TARGETS.allocationWallets.find(
    (w) => w.key === "FOUNDER",
  );
  if (canonFounder === undefined) fail("canon has no FOUNDER allocation wallet");
  if (canonFounder.address.toLowerCase() !== FOUNDER_ROOT_WALLET.toLowerCase()) {
    fail(
      `pinned wallet ${mask(FOUNDER_ROOT_WALLET)} != canon Founder ${mask(canonFounder.address)} — canon drift, resolve before seeding`,
    );
  }

  if (process.env.DATABASE_URL == null || process.env.DATABASE_URL.length === 0) {
    fail("DATABASE_URL is not set — provision + migrate the DB first (Q37)");
  }

  const armedWrite = process.argv.includes("--write");
  const armedApproval = process.env[APPROVAL_FLAG] === "true";

  const { db, operator, auditLog } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  // ── FIRST-SEED-ONLY: any founder_root row (any status) is a hard stop ──────
  const existingRoots = await db
    .select({ id: operator.id, wallet: operator.wallet, status: operator.status })
    .from(operator)
    .where(eq(operator.role, "founder_root"));
  if (existingRoots.length > 0) {
    fail(
      `a founder_root row already exists (${existingRoots
        .map((r) => `${mask(r.wallet)} ${r.status}`)
        .join(", ")}) — this script is the FIRST seed only; rotation/recovery is the §F ceremony`,
    );
  }

  const wallet = FOUNDER_ROOT_WALLET.toLowerCase();
  console.log(`[operator:seed] target: ${mask(wallet)} · role founder_root · status ACTIVE`);
  console.log(`[operator:seed] canon cross-check: OK (matches the Founder allocation wallet)`);
  console.log(`[operator:seed] registry state: 0 founder_root rows (first seed confirmed)`);

  if (!armedWrite || !armedApproval) {
    console.log(
      `[operator:seed] DRY-RUN — nothing written. The ceremony requires BOTH --write AND ${APPROVAL_FLAG}="true" (currently: --write=${armedWrite}, approval=${armedApproval}).`,
    );
    return;
  }

  // ── THE CEREMONY: one transaction — the row + its audit entry ──────────────
  await db.transaction(async (tx) => {
    await tx.insert(operator).values({
      id: randomUUID(),
      wallet,
      label: FOUNDER_ROOT_LABEL,
      role: "founder_root",
      status: "ACTIVE",
    });
    await tx.insert(auditLog).values({
      id: randomUUID(),
      actorWallet: wallet, // the founding act: the root enrolls itself, once
      actorRole: "founder_root",
      action: "operator.seed-founder-root",
      target: wallet,
      detail: {
        ceremony: "Q36 first seed (founder-authorized, 2026-07-17)",
        canonCrossCheck: "FINANCIAL_TARGETS.allocationWallets[FOUNDER]",
        backupPosture: "offline (option A) — no online backup rows by design",
      },
      stepUpSigned: false,
    });
  });

  // ── Read back the truth (never trust the write; verify it) ─────────────────
  const readback = await db
    .select({ wallet: operator.wallet, role: operator.role, status: operator.status })
    .from(operator)
    .where(eq(operator.role, "founder_root"));
  if (
    readback.length !== 1 ||
    readback[0].wallet !== wallet ||
    readback[0].status !== "ACTIVE"
  ) {
    fail(`post-write readback mismatch (${JSON.stringify(readback.map((r) => ({ w: mask(r.wallet), s: r.status })))})`);
  }

  console.log(
    `[operator:seed] ✅ SEEDED — founder_root ${mask(wallet)} ACTIVE (audit row written in the same transaction).`,
  );
  console.log(`[operator:seed] NOW DISARM: unset ${APPROVAL_FLAG}.`);
}

main().catch((err) => {
  console.error(`[operator:seed] ERROR — ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
