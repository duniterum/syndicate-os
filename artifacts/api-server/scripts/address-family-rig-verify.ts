// address-family-rig-verify.ts — runtime proof of the pre-masked-family slice
// (2026-08-02, THE ADDRESS LAW 2026-07-25).
//
// WHAT IT MEASURES: against a RUNNING api (default http://localhost:5000 — the
// real esbuild dist, never an in-process tsx boot), it seeds ONE throwaway
// ACTIVE founder_root row, mints a real SIWE session over HTTP, then asserts
// the new address-law shape on all five operator reads: every served row
// carries the FULL wallet + the short display form + the canon Snowtrace
// /address/ link. Empty collections pass vacuously and SAY so.
// WHAT IT DOES NOT COVER: the member-side introduction rows (needs a source
// owner's session) and the rendered pixels (the browser pass does those).
//
// Fixture discipline (same as operator-list-test.ts): the keypair is
// generated at RUN TIME, throwaway, never committed; the fixture row is
// deleted with `--teardown <rowId>` AFTER the browser pass (the session's
// authority dies with the row — lookupActiveOperator re-reads it per request).
//
// Run:      pnpm --filter @workspace/api-server run rig:address-family
// Teardown: pnpm --filter @workspace/api-server run rig:address-family -- --teardown <rowId>
// Requires: DATABASE_URL (the LOCAL rig DB) + the detached api on BASE.

import { randomUUID } from "node:crypto";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSiweMessage } from "viem/siwe";
import { EXPLORER_BASE_URL } from "../src/canon/the-syndicate/contracts/syndicate-config";

const BASE = process.env["RIG_API_BASE"] ?? "http://localhost:5000";

const results: { name: string; pass: boolean; detail: string }[] = [];
function record(name: string, pass: boolean, detail: string): void {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

async function main(): Promise<void> {
  if (process.env["DATABASE_URL"] == null || process.env["DATABASE_URL"].length === 0) {
    throw new Error("DATABASE_URL is not provisioned — this rig check needs the LOCAL database");
  }
  const { db, operator } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  const tearIdx = process.argv.indexOf("--teardown");
  if (tearIdx !== -1) {
    const rowId = process.argv[tearIdx + 1];
    if (rowId == null || rowId.length === 0) throw new Error("--teardown needs the rowId");
    await db.delete(operator).where(eq(operator.id, rowId));
    console.log(`teardown: fixture operator row ${rowId} deleted`);
    process.exit(0);
  }

  const account = privateKeyToAccount(generatePrivateKey());
  const wallet = account.address.toLowerCase();
  const rowId = `rig-verify-${randomUUID()}`;
  await db.insert(operator).values({
    id: rowId,
    wallet,
    label: "RIG VERIFY fixture (torn down)",
    role: "founder_root",
    status: "ACTIVE",
  });
  console.log(`seeded throwaway founder_root ${wallet}`);
  console.log(`FIXTURE_ROW_ID ${rowId}`);

  const c = await fetch(`${BASE}/api/auth/challenge`, { method: "POST" });
  if (c.status !== 200) throw new Error(`challenge failed: ${c.status}`);
  const ch = (await c.json()) as {
    domain: string; uri: string; statement: string; version: "1";
    chainId: number; nonce: string; issuedAt: string; expirationTime: string;
  };
  const message = createSiweMessage({
    address: account.address,
    domain: ch.domain,
    uri: ch.uri,
    chainId: ch.chainId,
    statement: ch.statement,
    nonce: ch.nonce,
    version: ch.version,
    issuedAt: new Date(ch.issuedAt),
    expirationTime: new Date(ch.expirationTime),
  });
  const signature = await account.signMessage({ message });
  const v = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (v.status !== 200) throw new Error(`verify failed: ${v.status}`);
  const cookie = (v.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
  if (!cookie.startsWith("syn_session=")) throw new Error("no syn_session cookie issued");
  console.log(`SESSION_COOKIE ${cookie}`);

  const get = async (p: string): Promise<Record<string, unknown>> => {
    const res = await fetch(`${BASE}${p}`, { headers: { cookie } });
    if (res.status !== 200) throw new Error(`${p} -> ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  };
  const FULL = /^0x[0-9a-f]{40}$/;
  const SNOW = `${EXPLORER_BASE_URL}/address/`;

  {
    const j = await get("/api/operator/operators");
    const ops = (j.operators ?? []) as Record<string, unknown>[];
    record(
      "operators: every row wallet full + short + canon link",
      Array.isArray(ops) && ops.length > 0 && ops.every(
        (o) =>
          FULL.test(String(o.wallet)) &&
          /^0x[0-9a-f]{4}…[0-9a-f]{4}$/.test(String(o.walletShort)) &&
          String(o.explorerUrl) === `${SNOW}${String(o.wallet)}`,
      ),
      `${ops.length} row(s); first: ${ops[0] ? `${ops[0].walletShort}↔${String(ops[0].wallet).slice(0, 10)}…` : "n/a"}`,
    );
  }
  {
    const j = await get("/api/operator/member-ledger");
    const rows = ((j.payload as Record<string, unknown>)?.rows ?? []) as Record<string, unknown>[];
    record(
      "member-ledger: every row wallet full + short + canon link",
      Array.isArray(rows) && rows.length > 0 && rows.every(
        (r) =>
          FULL.test(String(r.wallet)) &&
          String(r.explorerUrl) === `${SNOW}${String(r.wallet)}` &&
          typeof r.walletShort === "string",
      ),
      `${rows.length} row(s); first: seat #${rows[0]?.seat} ${rows[0]?.walletShort}↔${String(rows[0]?.wallet ?? "").slice(0, 10)}…`,
    );
  }
  {
    const j = await get("/api/operator/activation-requests");
    const rows = ((j.payload as Record<string, unknown>)?.rows ?? []) as Record<string, unknown>[];
    record(
      "activation-requests: every present row wallet full + link",
      rows.every(
        (r) => FULL.test(String(r.wallet)) && String(r.explorerUrl) === `${SNOW}${String(r.wallet)}`,
      ),
      `${rows.length} row(s)${rows[0] ? `; first: ${rows[0].walletShort}↔${String(rows[0].wallet).slice(0, 10)}…` : " (empty queue — shape holds vacuously, said honestly)"}`,
    );
  }
  {
    const j = await get("/api/operator/source-performance");
    const rows = ((j.payload as Record<string, unknown>)?.rows ?? []) as Record<string, unknown>[];
    const withOwner = rows.filter((r) => r.ownerWallet !== null);
    record(
      "source-performance: every owned row ownerWallet full + link",
      withOwner.every(
        (r) =>
          FULL.test(String(r.ownerWallet)) &&
          String(r.ownerExplorerUrl) === `${SNOW}${String(r.ownerWallet)}`,
      ),
      `${rows.length} row(s), ${withOwner.length} with a known owner${withOwner[0] ? `; first: ${withOwner[0].ownerShort}↔${String(withOwner[0].ownerWallet).slice(0, 10)}…` : ""}`,
    );
  }
  {
    const j = await get("/api/operator/notifications");
    const ns = (j.notifications ?? []) as Record<string, unknown>[];
    const targeted = ns.filter((n) => n.audience !== "ALL");
    record(
      "notifications: every targeted row recipient full + short + link",
      targeted.every(
        (n) =>
          FULL.test(String(n.recipientWallet)) &&
          String(n.recipientExplorerUrl) === `${SNOW}${String(n.recipientWallet)}` &&
          typeof n.recipientShort === "string",
      ),
      `${ns.length} sent, ${targeted.length} targeted${targeted[0] ? `; first: ${targeted[0].recipientShort}↔${String(targeted[0].recipientWallet).slice(0, 10)}…` : " (none targeted — vacuous, said honestly)"}`,
    );
  }

  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks green${failed ? ` — ${failed} FAILED` : ""}`);
  console.log("(fixture row NOT deleted — run --teardown after the browser pass)");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("rig-verify error:", e);
  process.exit(1);
});
