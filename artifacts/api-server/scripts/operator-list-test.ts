// operator-list-test.ts — end-to-end DEV proof of the sanctioned registry READ
// (Phase 3 slice 1: GET /api/operator/operators).
//
// Fixture discipline (same as operator-write-test.ts):
//   • keypairs are generated at RUN TIME from randomness — throwaway, never
//     committed, never imported by served code;
//   • the app under test is an IN-PROCESS instance on an ephemeral port, so
//     SYNDICATE_AUTH_ENABLED="true" exists ONLY inside this test process —
//     the committed config, the workflow dev server, and production posture
//     are never touched (prod stays dark);
//   • the ONE seeded row (a throwaway ACTIVE founder_root, needed to hold a
//     founder session) is torn down in `finally`. The three real seeded
//     founders are only READ, never modified.
//
// Run: pnpm --filter @workspace/api-server run operator-list:test
// Requires: DATABASE_URL provisioned + migrated, three founders seeded.

import { randomUUID } from "node:crypto";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSiweMessage } from "viem/siwe";

const results: { name: string; pass: boolean; detail: string }[] = [];
function record(name: string, pass: boolean, detail: string): void {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

interface ChallengeFields {
  domain: string;
  uri: string;
  statement: string;
  version: "1";
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

interface ListedOperator {
  walletShort: string;
  label: string;
  role: string;
  status: string;
}

async function main(): Promise<void> {
  if (process.env["DATABASE_URL"] == null || process.env["DATABASE_URL"].length === 0) {
    throw new Error("DATABASE_URL is not provisioned — this dev test needs the dev database");
  }

  const founderFixtureAccount = privateKeyToAccount(generatePrivateKey()); // throwaway founder_root (session holder)
  const strangerAccount = privateKeyToAccount(generatePrivateKey()); // NO operator row
  const fixtureWallet = founderFixtureAccount.address.toLowerCase();
  const fixtureRowId = `test-${randomUUID()}`;
  const fixtureShort = `${fixtureWallet.slice(0, 6)}…${fixtureWallet.slice(-4)}`;

  const savedFlag = process.env["SYNDICATE_AUTH_ENABLED"];

  const { db, operator } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  // Enable the auth zone for THIS PROCESS ONLY (dev), then boot in-process.
  process.env["SYNDICATE_AUTH_ENABLED"] = "true";
  const { default: app } = await import("../src/app");
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const addr = server.address();
  if (addr === null || typeof addr === "string") {
    throw new Error("in-process server did not expose a port");
  }
  const base = `http://127.0.0.1:${addr.port}`;

  const postJson = async (
    pathname: string,
    body: unknown,
  ): Promise<{ status: number; json: Record<string, unknown> }> => {
    const res = await fetch(`${base}${pathname}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    return { status: res.status, json };
  };

  const getList = async (
    cookie?: string,
  ): Promise<{ status: number; json: Record<string, unknown> }> => {
    const res = await fetch(`${base}/api/operator/operators`, {
      method: "GET",
      headers: cookie ? { cookie } : {},
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    return { status: res.status, json };
  };

  // Real SIWE flow: challenge → sign with the throwaway key → verify → cookie.
  const siweLogin = async (
    account: ReturnType<typeof privateKeyToAccount>,
  ): Promise<string> => {
    const c = await postJson("/api/auth/challenge", undefined);
    if (c.status !== 200) throw new Error(`challenge failed: ${c.status}`);
    const ch = c.json as unknown as ChallengeFields;
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
    const res = await fetch(`${base}/api/auth/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });
    if (res.status !== 200) throw new Error(`verify failed: ${res.status}`);
    const setCookie = res.headers.get("set-cookie") ?? "";
    const pair = setCookie.split(";")[0] ?? "";
    if (!pair.startsWith("syn_session=")) throw new Error("no syn_session cookie issued");
    return pair;
  };

  try {
    // ── seed: ONE throwaway ACTIVE founder_root (session holder only) ───────
    await db.insert(operator).values({
      id: fixtureRowId,
      wallet: fixtureWallet,
      label: "TEST FIXTURE operator-list-test (torn down)",
      role: "founder_root",
      status: "ACTIVE",
    });
    record("seed", true, "throwaway ACTIVE founder_root seeded (torn down below)");

    // ── negative: no session → 401 ───────────────────────────────────────────
    const anon = await getList();
    record(
      "no session → 401 no_session",
      anon.status === 401,
      `status ${anon.status}, body ${JSON.stringify(anon.json)}`,
    );

    // ── negative: session without operator row → 403 ─────────────────────────
    const strangerCookie = await siweLogin(strangerAccount);
    const stranger = await getList(strangerCookie);
    record(
      "stranger session → 403 insufficient_role",
      stranger.status === 403,
      `status ${stranger.status}, body ${JSON.stringify(stranger.json)}`,
    );

    // ── happy path: founder session lists the registry, masked ──────────────
    const founderCookie = await siweLogin(founderFixtureAccount);
    const list = await getList(founderCookie);
    const operators = Array.isArray(list.json["operators"])
      ? (list.json["operators"] as ListedOperator[])
      : [];
    record(
      "founder session → 200 { ok: true, operators: [...] }",
      list.status === 200 && list.json["ok"] === true && operators.length >= 4,
      `status ${list.status}, ${operators.length} row(s)`,
    );

    const realFounders = operators.filter(
      (o) =>
        o.role === "founder_root" &&
        o.status === "ACTIVE" &&
        o.walletShort !== fixtureShort,
    );
    record(
      "the three seeded founders are returned (masked)",
      realFounders.length === 3,
      realFounders
        .map((o) => `${o.label} ${o.walletShort} ${o.role} ${o.status}`)
        .join(" | ") || "none",
    );
    record(
      "every wallet is masked (0x????…???? — no 40-hex material)",
      operators.every(
        (o) => /^0x[0-9a-f]{4}…[0-9a-f]{4}$/.test(o.walletShort) && !/0x[0-9a-fA-F]{40}/.test(JSON.stringify(o)),
      ),
      operators.map((o) => o.walletShort).join(", "),
    );
    record(
      "row shape carries ONLY walletShort/label/role/status",
      operators.every(
        (o) =>
          Object.keys(o).sort().join(",") === "label,role,status,walletShort",
      ),
      `keys: ${operators[0] ? Object.keys(operators[0]).sort().join(",") : "n/a"}`,
    );
  } finally {
    await db.delete(operator).where(eq(operator.id, fixtureRowId));
    console.log("teardown: throwaway operator row deleted");
    server.close();
    if (savedFlag === undefined) {
      delete process.env["SYNDICATE_AUTH_ENABLED"];
    } else {
      process.env["SYNDICATE_AUTH_ENABLED"] = savedFlag;
    }
  }

  const failures = results.filter((r) => !r.pass);
  console.log(
    `\noperator-list-test: ${results.length - failures.length}/${results.length} checks passed.`,
  );
  if (failures.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
