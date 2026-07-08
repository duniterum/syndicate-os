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
  const inviteeAccount = privateKeyToAccount(generatePrivateKey()); // invited via the API (registry happy path)
  const ghostAccount = privateKeyToAccount(generatePrivateKey()); // never registered (not_found negative)
  const founderBAccount = privateKeyToAccount(generatePrivateKey()); // second ACTIVE founder_root (last-founder guard cases)
  const founderCAccount = privateKeyToAccount(generatePrivateKey()); // third founder_root fixture (concurrency race case)
  const opWallet = operatorAccount.address.toLowerCase();
  const suspendedWallet = suspendedAccount.address.toLowerCase();
  const inviteeWallet = inviteeAccount.address.toLowerCase();
  const ghostWallet = ghostAccount.address.toLowerCase();
  const founderBWallet = founderBAccount.address.toLowerCase();
  const founderCWallet = founderCAccount.address.toLowerCase();
  const opRowId = `test-${randomUUID()}`;
  const suspendedRowId = `test-${randomUUID()}`;
  const founderBRowId = `test-${randomUUID()}`;
  const founderCRowId = `test-${randomUUID()}`;

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

    // ════ operator REGISTRY routes (invite / suspend — founder_root only) ════

    // ── registry happy path 1: founder invites a protocol_admin ─────────────
    const inv = await postJson(
      "/api/operator/operators",
      { wallet: inviteeWallet, label: "TEST FIXTURE invitee (torn down)", role: "protocol_admin" },
      opCookie,
    );
    record(
      "founder invite → { ok: true }",
      inv.status === 200 && inv.json["ok"] === true,
      `status ${inv.status}, body ${JSON.stringify(inv.json)}`,
    );

    // ── DB confirmation: ACTIVE operator row + operator.invite audit ─────────
    const invRows = await db
      .select()
      .from(operator)
      .where(eq(operator.wallet, inviteeWallet));
    const invRow = invRows[0];
    record(
      "invited operator row written (role=protocol_admin, status=ACTIVE)",
      invRows.length === 1 &&
        invRow !== undefined &&
        invRow.role === "protocol_admin" &&
        invRow.status === "ACTIVE",
      invRow === undefined
        ? "row missing"
        : `id=${invRow.id} role=${invRow.role} status=${invRow.status} label=${invRow.label}`,
    );
    const invAudits = await db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.actorWallet, opWallet), eq(auditLog.action, "operator.invite")));
    const invAudit = invAudits[0];
    const invDetail = (invAudit?.detail ?? {}) as Record<string, unknown>;
    record(
      "audit_log row written (action=operator.invite, target=invitee, detail.role)",
      invAudits.length === 1 &&
        invAudit !== undefined &&
        invAudit.actorRole === "founder_root" &&
        invAudit.target === inviteeWallet &&
        invDetail["role"] === "protocol_admin",
      invAudit === undefined
        ? "row missing"
        : `action=${invAudit.action} actor_role=${invAudit.actorRole} target=<invitee> detail=${JSON.stringify(invAudit.detail)}`,
    );

    // ── invitee is live on the bridge: protocol_admin passes the terms gate ──
    // (unknown key 'foo' → 400 unknown_key proves the role gate PASSED and the
    // service denied — nothing is written by this probe.)
    const inviteeCookie = await siweLogin(inviteeAccount);
    const probeBefore = await postJson(
      "/api/operator/referral-terms",
      { key: "foo", value: "1" },
      inviteeCookie,
    );
    record(
      "invited protocol_admin is live on the bridge (terms probe → unknown_key, not insufficient_role)",
      probeBefore.status === 400 && probeBefore.json["reason"] === "unknown_key",
      `status ${probeBefore.status}, body ${JSON.stringify(probeBefore.json)}`,
    );

    // ── registry negative: protocol_admin may NOT invite (founder_root only) ─
    const nAdminInvite = await postJson(
      "/api/operator/operators",
      { wallet: ghostWallet, label: "should never exist", role: "operator" },
      inviteeCookie,
    );
    record(
      "protocol_admin invite denied → insufficient_role (founder_root only)",
      nAdminInvite.status === 403 && nAdminInvite.json["reason"] === "insufficient_role",
      `status ${nAdminInvite.status}, body ${JSON.stringify(nAdminInvite.json)}`,
    );

    // ── registry negative: invite an already-registered wallet ──────────────
    const nDup = await postJson(
      "/api/operator/operators",
      { wallet: inviteeWallet, label: "dup", role: "operator" },
      opCookie,
    );
    record(
      "invite of existing wallet denied → already_exists",
      nDup.status === 400 && nDup.json["reason"] === "already_exists",
      `status ${nDup.status}, body ${JSON.stringify(nDup.json)}`,
    );

    // ── registry read: list carries the stable row id (suspend key) ──────────
    // The UI suspends by the id it read from GET /operators — walk that exact
    // path here instead of peeking at the DB for the invitee's id.
    const listRes = await fetch(`${base}/api/operator/operators`, {
      headers: { cookie: opCookie },
    });
    const listJson = (await listRes.json()) as Record<string, unknown>;
    const listOps = Array.isArray(listJson["operators"])
      ? (listJson["operators"] as Record<string, unknown>[])
      : [];
    const inviteeMask = `${inviteeWallet.slice(0, 6)}…${inviteeWallet.slice(-4)}`;
    const inviteeListRow = listOps.find((o) => o["walletShort"] === inviteeMask);
    const inviteeId =
      inviteeListRow !== undefined && typeof inviteeListRow["id"] === "string"
        ? inviteeListRow["id"]
        : null;
    record(
      "GET /operators row carries the stable id (and still only walletShort — no full wallet)",
      listRes.status === 200 &&
        inviteeId !== null &&
        listOps.every(
          (o) => typeof o["id"] === "string" && !JSON.stringify(o).includes(inviteeWallet),
        ),
      `status ${listRes.status}, invitee id ${inviteeId === null ? "(missing)" : "present"}, rows=${listOps.length}`,
    );
    if (inviteeId === null) throw new Error("invitee id missing from GET /operators");

    // ── registry negative: wallet-shaped suspend body is REJECTED ────────────
    // (id-based contract: a body without `id` never reaches the service.)
    const nWalletBody = await postJson(
      "/api/operator/operators/suspend",
      { wallet: inviteeWallet },
      opCookie,
    );
    record(
      "wallet-shaped suspend body denied → bad_request (id is the only accepted key)",
      nWalletBody.status === 400 && nWalletBody.json["reason"] === "bad_request",
      `status ${nWalletBody.status}, body ${JSON.stringify(nWalletBody.json)}`,
    );

    // ── registry negative: self-suspend lockout guard (by the founder's id) ──
    const nSelf = await postJson(
      "/api/operator/operators/suspend",
      { id: opRowId },
      opCookie,
    );
    const founderRowAfterSelf = (
      await db.select().from(operator).where(eq(operator.id, opRowId))
    )[0];
    record(
      "self-suspend denied → cannot_suspend_self (founder row still ACTIVE)",
      nSelf.status === 400 &&
        nSelf.json["reason"] === "cannot_suspend_self" &&
        founderRowAfterSelf !== undefined &&
        founderRowAfterSelf.status === "ACTIVE",
      `status ${nSelf.status}, body ${JSON.stringify(nSelf.json)}, founder row status=${founderRowAfterSelf?.status ?? "(missing)"}`,
    );

    // ── registry negative: suspend an unknown id ─────────────────────────────
    const nGhost = await postJson(
      "/api/operator/operators/suspend",
      { id: `test-${randomUUID()}` },
      opCookie,
    );
    record(
      "suspend of unknown id denied → not_found",
      nGhost.status === 400 && nGhost.json["reason"] === "not_found",
      `status ${nGhost.status}, body ${JSON.stringify(nGhost.json)}`,
    );

    // ── registry happy path 2: founder suspends the invitee BY ID ────────────
    const susp = await postJson(
      "/api/operator/operators/suspend",
      { id: inviteeId },
      opCookie,
    );
    record(
      "founder suspend → { ok: true }",
      susp.status === 200 && susp.json["ok"] === true,
      `status ${susp.status}, body ${JSON.stringify(susp.json)}`,
    );

    // ── DB confirmation: SUSPENDED row + operator.suspend audit ──────────────
    const suspRow = (
      await db.select().from(operator).where(eq(operator.wallet, inviteeWallet))
    )[0];
    const suspAudits = await db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.actorWallet, opWallet), eq(auditLog.action, "operator.suspend")));
    const suspDetail = (suspAudits[0]?.detail ?? {}) as Record<string, unknown>;
    record(
      "suspend persisted (row SUSPENDED) + audit_log row (action=operator.suspend, target=resolved wallet, detail.id=list id)",
      suspRow !== undefined &&
        suspRow.status === "SUSPENDED" &&
        suspRow.id === inviteeId &&
        suspAudits.length === 1 &&
        suspAudits[0] !== undefined &&
        suspAudits[0].target === inviteeWallet &&
        suspAudits[0].actorRole === "founder_root" &&
        suspDetail["id"] === inviteeId,
      `row status=${suspRow?.status ?? "(missing)"}, audit rows=${suspAudits.length}, action=${suspAudits[0]?.action ?? "(none)"}, detail.id ${suspDetail["id"] === inviteeId ? "matches list id" : "MISMATCH"}`,
    );

    // ── suspension bites on the VERY NEXT call (bridge re-reads status) ──────
    const probeAfter = await postJson(
      "/api/operator/referral-terms",
      { key: "foo", value: "1" },
      inviteeCookie,
    );
    record(
      "suspended operator denied on next call → insufficient_role (same still-valid session)",
      probeAfter.status === 403 && probeAfter.json["reason"] === "insufficient_role",
      `status ${probeAfter.status}, body ${JSON.stringify(probeAfter.json)}`,
    );

    // ════ last-founder guard (Phase 3 slice 4a) ══════════════════════════════

    // ── seed a SECOND ACTIVE founder_root fixture as the suspend target ──────
    await db.insert(operator).values({
      id: founderBRowId,
      wallet: founderBWallet,
      label: "TEST FIXTURE operator-write-test founderB (torn down)",
      role: "founder_root",
      status: "ACTIVE",
    });

    // ── with >= 2 ACTIVE founder_root rows, suspending one still succeeds ────
    const suspB = await postJson(
      "/api/operator/operators/suspend",
      { id: founderBRowId },
      opCookie,
    );
    const founderBAfterApi = (
      await db.select().from(operator).where(eq(operator.id, founderBRowId))
    )[0];
    record(
      "founder suspend with >= 2 ACTIVE founder_root → { ok: true } (row SUSPENDED)",
      suspB.status === 200 &&
        suspB.json["ok"] === true &&
        founderBAfterApi !== undefined &&
        founderBAfterApi.status === "SUSPENDED",
      `status ${suspB.status}, body ${JSON.stringify(suspB.json)}, row status=${founderBAfterApi?.status ?? "(missing)"}`,
    );

    // ── engineer the single-ACTIVE-founder state: re-arm the target fixture,
    // snapshot every OTHER ACTIVE founder_root row id, and flip those rows to
    // SUSPENDED (status column ONLY — restored exactly in the inner finally,
    // crash-safe, so real dev founder rows are never left mutated) ────────────
    await db
      .update(operator)
      .set({ status: "ACTIVE" })
      .where(eq(operator.id, founderBRowId));
    const otherActiveFounderIds = (
      await db
        .select({ id: operator.id })
        .from(operator)
        .where(and(eq(operator.role, "founder_root"), eq(operator.status, "ACTIVE")))
    )
      .map((r) => r.id)
      .filter((id) => id !== founderBRowId);
    try {
      if (otherActiveFounderIds.length > 0) {
        await db
          .update(operator)
          .set({ status: "SUSPENDED" })
          .where(inArray(operator.id, otherActiveFounderIds));
      }
      const auditCountBeforeLf = (await db.select({ id: auditLog.id }).from(auditLog)).length;
      // Direct service call (defense-in-depth layer under test): the route's
      // founder-only gate requires an ACTIVE founder_root ACTOR, whose own row
      // would raise the ACTIVE count to 2 — so the <= 1 refusal can only be
      // exercised at the service seam the router delegates to.
      const { suspendOperator: suspendService } = await import(
        "../src/operator/operatorRegistryService"
      );
      const lf = await suspendService({
        id: founderBRowId,
        actorWallet: opWallet,
        actorRole: "founder_root",
      });
      const founderBAfterLf = (
        await db.select().from(operator).where(eq(operator.id, founderBRowId))
      )[0];
      const auditCountAfterLf = (await db.select({ id: auditLog.id }).from(auditLog)).length;
      record(
        "suspend of the single ACTIVE founder_root refused → last_founder (no mutation, no audit row)",
        !lf.ok &&
          lf.reason === "last_founder" &&
          founderBAfterLf !== undefined &&
          founderBAfterLf.status === "ACTIVE" &&
          auditCountAfterLf === auditCountBeforeLf,
        `service result ${JSON.stringify(lf)}, row status=${founderBAfterLf?.status ?? "(missing)"}, audit_log ${auditCountBeforeLf}→${auditCountAfterLf}`,
      );
    } finally {
      // Restore the flipped founder rows to ACTIVE no matter what happened.
      if (otherActiveFounderIds.length > 0) {
        await db
          .update(operator)
          .set({ status: "ACTIVE" })
          .where(inArray(operator.id, otherActiveFounderIds));
      }
    }
    const restoredActive = await db
      .select({ id: operator.id })
      .from(operator)
      .where(and(eq(operator.role, "founder_root"), eq(operator.status, "ACTIVE")));
    record(
      "flipped founder_root rows restored to ACTIVE exactly",
      otherActiveFounderIds.every((id) => restoredActive.some((r) => r.id === id)),
      `restored ${otherActiveFounderIds.length} row(s); ACTIVE founder_root rows now ${restoredActive.length}`,
    );

    // ── concurrency regression: two PARALLEL suspends against exactly 2 ACTIVE
    // founders must never empty the tier. The FOR UPDATE row locks serialize
    // the check-then-update: exactly one wins; the loser re-reads the committed
    // state and refuses (last_founder) — or is deadlock-aborted to unavailable.
    // Either way at least one ACTIVE founder_root MUST remain. ────────────────
    await db.insert(operator).values({
      id: founderCRowId,
      wallet: founderCWallet,
      label: "TEST FIXTURE operator-write-test founderC (torn down)",
      role: "founder_root",
      status: "ACTIVE",
    });
    const raceFlippedIds = (
      await db
        .select({ id: operator.id })
        .from(operator)
        .where(and(eq(operator.role, "founder_root"), eq(operator.status, "ACTIVE")))
    )
      .map((r) => r.id)
      .filter((id) => id !== founderBRowId && id !== founderCRowId);
    try {
      if (raceFlippedIds.length > 0) {
        await db
          .update(operator)
          .set({ status: "SUSPENDED" })
          .where(inArray(operator.id, raceFlippedIds));
      }
      const { suspendOperator: suspendService2 } = await import(
        "../src/operator/operatorRegistryService"
      );
      const [raceB, raceC] = await Promise.all([
        suspendService2({ id: founderBRowId, actorWallet: opWallet, actorRole: "founder_root" }),
        suspendService2({ id: founderCRowId, actorWallet: opWallet, actorRole: "founder_root" }),
      ]);
      const okCount = [raceB, raceC].filter((r) => r.ok).length;
      const activeBC = await db
        .select({ id: operator.id })
        .from(operator)
        .where(
          and(
            inArray(operator.id, [founderBRowId, founderCRowId]),
            eq(operator.status, "ACTIVE"),
          ),
        );
      record(
        "PARALLEL founder suspends (2 ACTIVE) → at most one succeeds, tier never emptied",
        okCount <= 1 && activeBC.length >= 1 && activeBC.length + okCount === 2,
        `results ${JSON.stringify(raceB)} / ${JSON.stringify(raceC)}, ok=${okCount}, ACTIVE fixture founders left=${activeBC.length}`,
      );
    } finally {
      if (raceFlippedIds.length > 0) {
        await db
          .update(operator)
          .set({ status: "ACTIVE" })
          .where(inArray(operator.id, raceFlippedIds));
      }
    }
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
        .where(inArray(operator.id, [opRowId, suspendedRowId, founderBRowId, founderCRowId]))
        .returning({ id: operator.id });
      // The invitee row was created via the API (unknown id) — delete by wallet.
      // The ghost wallet must never have a row (negatives only), but sweep it
      // too so a failing run can never leave residue behind.
      const delInvitee = await db
        .delete(operator)
        .where(inArray(operator.wallet, [inviteeWallet, ghostWallet]))
        .returning({ id: operator.id });
      record(
        "teardown",
        delOps.length === 4 && delInvitee.length <= 1 && (priorTerm === undefined || restored),
        `deleted operator rows: ${delOps.length} seeded + ${delInvitee.length} invited, referral_term rows: ${delTerms.length}, audit_log rows: ${delAudit.length}; preexisting commissionBps row: ${priorTerm === undefined ? "none" : restored ? "restored exactly" : "RESTORE FAILED"}`,
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
