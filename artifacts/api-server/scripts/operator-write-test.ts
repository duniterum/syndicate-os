// operator-write-test.ts — end-to-end DEV proof of the operator WRITE path.
//
// Fixture discipline (same as auth-skeleton-test.ts):
//   • keypairs are generated at RUN TIME from randomness — throwaway, never
//     committed, never imported by served code;
//   • the app under test is an IN-PROCESS instance on an ephemeral port, so
//     SYNDICATE_AUTH_ENABLED="true" exists ONLY inside this test process —
//     the committed config, the workflow dev server, and production posture
//     are never touched (prod stays dark);
//   • every seeded row is torn down in `finally`, including the rows the
//     happy-path write produces (they are printed first for the report).
//
// Run: pnpm --filter @workspace/api-server run operator-write:test
// Requires: DATABASE_URL provisioned + migrated (drizzle push already run).

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

async function main(): Promise<void> {
  if (process.env["DATABASE_URL"] == null || process.env["DATABASE_URL"].length === 0) {
    throw new Error("DATABASE_URL is not provisioned — this dev test needs the dev database");
  }

  // Throwaway fixture identities (random every run, meaningless, never persisted
  // beyond the seeded rows torn down below).
  const operatorAccount = privateKeyToAccount(generatePrivateKey());
  const strangerAccount = privateKeyToAccount(generatePrivateKey()); // NO operator row
  const suspendedAccount = privateKeyToAccount(generatePrivateKey()); // founder_root but SUSPENDED
  const opWallet = operatorAccount.address.toLowerCase();
  const suspendedWallet = suspendedAccount.address.toLowerCase();
  const opRowId = `test-${randomUUID()}`;
  const suspendedRowId = `test-${randomUUID()}`;

  const savedFlag = process.env["SYNDICATE_AUTH_ENABLED"];

  // Lazy DB handle for seed/assert/teardown (scripts may import the schema —
  // only SERVED src is banned from doing so).
  const { db, operator, referralTerm, auditLog } = await import("@workspace/db");
  const { eq, and, inArray } = await import("drizzle-orm");

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
    cookie?: string,
  ): Promise<{ status: number; json: Record<string, unknown> }> => {
    const res = await fetch(`${base}${pathname}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
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

  // Fixture isolation: snapshot any PREEXISTING commissionBps row before the
  // upsert can touch it, so teardown restores the exact prior state instead of
  // destroying real dev data.
  const priorTermRows = await db
    .select()
    .from(referralTerm)
    .where(eq(referralTerm.key, "commissionBps"));
  const priorTerm = priorTermRows[0];

  try {
    // ── seed: ONE ACTIVE founder_root operator row (+ one SUSPENDED for the
    // negative), both clearly labelled as run-time test fixtures ─────────────
    await db.insert(operator).values([
      {
        id: opRowId,
        wallet: opWallet,
        label: "TEST FIXTURE operator-write-test (torn down)",
        role: "founder_root",
        status: "ACTIVE",
      },
      {
        id: suspendedRowId,
        wallet: suspendedWallet,
        label: "TEST FIXTURE operator-write-test suspended (torn down)",
        role: "founder_root",
        status: "SUSPENDED",
      },
    ]);
    record("seed", true, `operator rows seeded: ACTIVE founder_root + SUSPENDED founder_root`);

    // ── real SIWE session for the operator ───────────────────────────────────
    const opCookie = await siweLogin(operatorAccount);
    record("SIWE login (challenge → sign → verify → syn_session)", true, "cookie obtained");

    // ── happy path: authorized write ─────────────────────────────────────────
    const w = await postJson(
      "/api/operator/referral-terms",
      { key: "commissionBps", value: "800" },
      opCookie,
    );
    record(
      "authorized write → { ok: true, key: 'commissionBps' }",
      w.status === 200 && w.json["ok"] === true && w.json["key"] === "commissionBps",
      `status ${w.status}, body ${JSON.stringify(w.json)}`,
    );

    // ── DB confirmation: referral_term row ───────────────────────────────────
    const termRows = await db
      .select()
      .from(referralTerm)
      .where(eq(referralTerm.key, "commissionBps"));
    const term = termRows[0];
    record(
      "referral_term row written (key=commissionBps, value=800, updated_by=<test wallet>)",
      termRows.length === 1 &&
        term !== undefined &&
        term.value === "800" &&
        term.updatedBy === opWallet,
      term === undefined
        ? "row missing"
        : `id=${term.id} key=${term.key} value=${term.value} updated_by=${term.updatedBy} updated_at=${term.updatedAt.toISOString()}`,
    );

    // ── DB confirmation: matching audit_log row ──────────────────────────────
    const auditRows = await db
      .select()
      .from(auditLog)
      .where(
        and(eq(auditLog.actorWallet, opWallet), eq(auditLog.action, "referral-term.save")),
      );
    const audit = auditRows[0];
    const detail = (audit?.detail ?? {}) as Record<string, unknown>;
    record(
      "audit_log row written (action=referral-term.save, detail carries event:'source-terms-changed')",
      auditRows.length === 1 &&
        audit !== undefined &&
        audit.actorRole === "founder_root" &&
        audit.target === "commissionBps" &&
        detail["event"] === "source-terms-changed" &&
        detail["key"] === "commissionBps" &&
        detail["value"] === "800",
      audit === undefined
        ? "row missing"
        : `id=${audit.id} actor_wallet=${audit.actorWallet} actor_role=${audit.actorRole} action=${audit.action} target=${audit.target} detail=${JSON.stringify(audit.detail)} created_at=${audit.createdAt.toISOString()}`,
    );

    // Baselines for the "nothing written" assertions after the negatives.
    const auditCountBefore = (await db.select({ id: auditLog.id }).from(auditLog)).length;
    const termCountBefore = (await db.select({ id: referralTerm.id }).from(referralTerm))
      .length;

    // ── negative: over-cap value ─────────────────────────────────────────────
    const nOver = await postJson(
      "/api/operator/referral-terms",
      { key: "commissionBps", value: "5000" },
      opCookie,
    );
    record(
      "value '5000' denied → rate_out_of_range",
      nOver.status === 400 && nOver.json["reason"] === "rate_out_of_range",
      `status ${nOver.status}, body ${JSON.stringify(nOver.json)}`,
    );

    // ── negative: unknown key ────────────────────────────────────────────────
    const nKey = await postJson(
      "/api/operator/referral-terms",
      { key: "foo", value: "1" },
      opCookie,
    );
    record(
      "key 'foo' denied → unknown_key",
      nKey.status === 400 && nKey.json["reason"] === "unknown_key",
      `status ${nKey.status}, body ${JSON.stringify(nKey.json)}`,
    );

    // ── negative: no session ─────────────────────────────────────────────────
    const nNoSess = await postJson("/api/operator/referral-terms", {
      key: "commissionBps",
      value: "100",
    });
    record(
      "no session denied → no_session",
      nNoSess.status === 401 && nNoSess.json["reason"] === "no_session",
      `status ${nNoSess.status}, body ${JSON.stringify(nNoSess.json)}`,
    );

    // ── negative: SIWE-verified but NOT an operator (no registry row) ────────
    const strangerCookie = await siweLogin(strangerAccount);
    const nStranger = await postJson(
      "/api/operator/referral-terms",
      { key: "commissionBps", value: "100" },
      strangerCookie,
    );
    record(
      "non-operator wallet denied → insufficient_role",
      nStranger.status === 403 && nStranger.json["reason"] === "insufficient_role",
      `status ${nStranger.status}, body ${JSON.stringify(nStranger.json)}`,
    );

    // ── negative: registered founder_root but status SUSPENDED (non-ACTIVE) ──
    const suspendedCookie = await siweLogin(suspendedAccount);
    const nSuspended = await postJson(
      "/api/operator/referral-terms",
      { key: "commissionBps", value: "100" },
      suspendedCookie,
    );
    record(
      "non-ACTIVE (SUSPENDED) operator denied → insufficient_role",
      nSuspended.status === 403 && nSuspended.json["reason"] === "insufficient_role",
      `status ${nSuspended.status}, body ${JSON.stringify(nSuspended.json)}`,
    );

    // ── nothing written by any negative ──────────────────────────────────────
    const auditCountAfter = (await db.select({ id: auditLog.id }).from(auditLog)).length;
    const termCountAfter = (await db.select({ id: referralTerm.id }).from(referralTerm))
      .length;
    const termAfter = (
      await db.select().from(referralTerm).where(eq(referralTerm.key, "commissionBps"))
    )[0];
    record(
      "negatives wrote NOTHING (row counts unchanged, value still 800)",
      auditCountAfter === auditCountBefore &&
        termCountAfter === termCountBefore &&
        termAfter !== undefined &&
        termAfter.value === "800",
      `audit_log ${auditCountBefore}→${auditCountAfter}, referral_term ${termCountBefore}→${termCountAfter}, commissionBps=${termAfter?.value ?? "(missing)"}`,
    );
  } finally {
    // ── teardown: remove EVERY row this test created ─────────────────────────
    try {
      const delTerms = await db
        .delete(referralTerm)
        .where(and(eq(referralTerm.key, "commissionBps"), eq(referralTerm.updatedBy, opWallet)))
        .returning({ id: referralTerm.id });
      // Restore any preexisting commissionBps row EXACTLY as snapshotted, so
      // the upsert this test performed never destroys real dev data.
      let restored = false;
      if (priorTerm !== undefined) {
        await db.insert(referralTerm).values({
          id: priorTerm.id,
          key: priorTerm.key,
          value: priorTerm.value,
          updatedBy: priorTerm.updatedBy,
          updatedAt: priorTerm.updatedAt,
        });
        restored = true;
      }
      const delAudit = await db
        .delete(auditLog)
        .where(eq(auditLog.actorWallet, opWallet))
        .returning({ id: auditLog.id });
      const delOps = await db
        .delete(operator)
        .where(inArray(operator.id, [opRowId, suspendedRowId]))
        .returning({ id: operator.id });
      record(
        "teardown",
        delOps.length === 2 && (priorTerm === undefined || restored),
        `deleted operator rows: ${delOps.length}, referral_term rows: ${delTerms.length}, audit_log rows: ${delAudit.length}; preexisting commissionBps row: ${priorTerm === undefined ? "none" : restored ? "restored exactly" : "RESTORE FAILED"}`,
      );
    } finally {
      // Restore posture: the flag never leaves this process; committed/prod
      // config stays auth-disabled.
      if (savedFlag === undefined) delete process.env["SYNDICATE_AUTH_ENABLED"];
      else process.env["SYNDICATE_AUTH_ENABLED"] = savedFlag;
      server.close();
      record(
        "posture restored",
        process.env["SYNDICATE_AUTH_ENABLED"] === savedFlag ||
          (savedFlag === undefined && !("SYNDICATE_AUTH_ENABLED" in process.env)),
        "SYNDICATE_AUTH_ENABLED existed only inside this test process; prod stays dark",
      );
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\noperator-write-test: ${results.length - failed.length}/${results.length} passed`,
  );
  if (failed.length > 0) process.exit(1);
  process.exit(0);
}

main().catch((err) => {
  console.error("operator-write-test crashed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
