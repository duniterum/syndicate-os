// scripts/operator-registry-verify.ts
// -----------------------------------------------------------------------------
// READ-ONLY operator-registry verification (safe to run any time, anywhere).
// Prints the registry rows MASKED (never a full wallet — the house address
// discipline) + the audit-log row count. Used by the Q36 ceremony's phase-4
// verification and any future registry health check. Writes NOTHING.

import { sql } from "drizzle-orm";

function mask(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

async function main(): Promise<void> {
  if (process.env.DATABASE_URL == null || process.env.DATABASE_URL.length === 0) {
    console.error("[operator:verify] DATABASE_URL is not set — nothing to read.");
    process.exit(1);
  }

  const { db, operator, auditLog } = await import("@workspace/db");

  const rows = await db
    .select({
      wallet: operator.wallet,
      role: operator.role,
      status: operator.status,
      createdAt: operator.createdAt,
    })
    .from(operator);

  console.log(`[operator:verify] operator registry: ${rows.length} row(s)`);
  for (const r of rows) {
    console.log(
      `  ${mask(r.wallet)} · ${r.role} · ${r.status} · since ${r.createdAt.toISOString()}`,
    );
  }

  const audit = await db.select({ n: sql<number>`count(*)::int` }).from(auditLog);
  console.log(`[operator:verify] audit_log rows: ${audit[0]?.n ?? 0}`);

  const activeRoots = rows.filter((r) => r.role === "founder_root" && r.status === "ACTIVE");
  console.log(
    `[operator:verify] ACTIVE founder_root count: ${activeRoots.length} ${activeRoots.length === 1 ? "(healthy)" : activeRoots.length === 0 ? "(NOT SEEDED)" : "(!! more than one)"}`,
  );
}

main().catch((err) => {
  console.error(`[operator:verify] ERROR — ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
