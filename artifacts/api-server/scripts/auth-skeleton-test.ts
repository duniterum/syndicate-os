// Fixture test for the IA-2 dev-only SIWE challenge/session skeleton.
//
// Fixture discipline (founder-approved):
//   • the keypair is generated at RUN TIME from randomness — nothing here is
//     a meaningful identity, nothing is committed, nothing is ever imported
//     by served code;
//   • tests run against the live dev server through the shared proxy
//     (localhost:80), so routing reality is exercised too.
//
// Run: pnpm --filter @workspace/api-server run auth-skeleton:test
// (the API Server workflow must be running)

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSiweMessage } from "viem/siwe";
import type { Request } from "express";
import { NONCE_TTL_MS, THROTTLE_MAX_PER_WINDOW } from "../src/auth/authConfig";
import { consumeNonce, issueNonce } from "../src/auth/nonceStore";
import { throttleKey } from "../src/auth/clientIdentity";

const BASE = process.env["AUTH_TEST_BASE"] ?? "http://localhost:80/api/auth";

const results: { name: string; pass: boolean; detail: string }[] = [];
function record(name: string, pass: boolean, detail: string): void {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

const HEX40 = /0x[0-9a-fA-F]{40}\b/;

async function post(
  pathname: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<{ status: number; json: unknown; setCookie: string | null }> {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  if (HEX40.test(text)) {
    record("response leak scan", false, `${pathname} body contains a 0x40-hex value`);
  }
  if (/\b198\.51\.100\.\d+|\b203\.0\.113\.\d+/.test(text)) {
    record("response raw-IP leak scan", false, `${pathname} body echoes a test client IP`);
  }
  return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
}

async function getSession(cookie?: string): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`${BASE}/session`, {
    headers: cookie ? { cookie } : {},
  });
  const text = await res.text();
  if (HEX40.test(text)) {
    record("response leak scan", false, "/session body contains a 0x40-hex value");
  }
  return { status: res.status, json: JSON.parse(text) };
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

async function getChallenge(): Promise<ChallengeFields> {
  const { status, json } = await post("/challenge", undefined);
  if (status !== 200) {
    throw new Error(`challenge failed with status ${status}`);
  }
  return json as ChallengeFields;
}

function buildMessage(
  c: ChallengeFields,
  address: `0x${string}`,
  overrides: Partial<{ domain: string; uri: string; chainId: number; statement: string; nonce: string }> = {},
): string {
  return createSiweMessage({
    address,
    domain: overrides.domain ?? c.domain,
    uri: overrides.uri ?? c.uri,
    chainId: overrides.chainId ?? c.chainId,
    statement: overrides.statement ?? c.statement,
    nonce: overrides.nonce ?? c.nonce,
    version: c.version,
    issuedAt: new Date(c.issuedAt),
    expirationTime: new Date(c.expirationTime),
  });
}

function stateOf(json: unknown): string {
  return (json as { state?: string }).state ?? "(none)";
}
function reasonOf(json: unknown): string {
  return (json as { reason?: string }).reason ?? "(none)";
}

async function main(): Promise<void> {
  // Run-time fixture keypair — random, meaningless, never persisted.
  const account = privateKeyToAccount(generatePrivateKey());
  const strangerAccount = privateKeyToAccount(generatePrivateKey());

  // ── success path ──────────────────────────────────────────────────────────
  const c1 = await getChallenge();
  record(
    "challenge success",
    typeof c1.nonce === "string" &&
      c1.nonce.length >= 8 &&
      c1.chainId === 43114 &&
      c1.version === "1" &&
      c1.statement.startsWith("Sign to prove control"),
    `nonce issued, chainId ${c1.chainId}, domain ${c1.domain}`,
  );

  const msg1 = buildMessage(c1, account.address);
  const sig1 = await account.signMessage({ message: msg1 });
  const v1 = await post("/verify", { message: msg1, signature: sig1 });
  record(
    "verify success → S4",
    v1.status === 200 && stateOf(v1.json) === "S4",
    `status ${v1.status}, state ${stateOf(v1.json)}`,
  );
  const setCookie = v1.setCookie ?? "";
  record(
    "session cookie flags",
    /HttpOnly/i.test(setCookie) &&
      /Secure/i.test(setCookie) &&
      /SameSite=Strict/i.test(setCookie) &&
      /Path=\/api/i.test(setCookie),
    setCookie.replace(/syn_session=[^;]+/, "syn_session=<redacted>"),
  );
  const cookiePair = setCookie.split(";")[0] ?? "";

  const s1 = await getSession(cookiePair);
  record(
    "session after verify → S4",
    s1.status === 200 && stateOf(s1.json) === "S4",
    `state ${stateOf(s1.json)}`,
  );

  // ── member-self readback (Public MVP) ─────────────────────────────────────
  // A fresh fixture account is never a member: expect S4 + honest chain
  // posture + isRecognized false + seatNumber null, and NO account echo.
  const msRes = await fetch(`${BASE}/member-self`, {
    headers: { cookie: cookiePair },
  });
  const msBody = await msRes.text();
  let msJson: {
    state?: string;
    chainVerified?: boolean;
    isRecognized?: boolean | null;
    seatNumber?: string | null;
  } = {};
  try {
    msJson = JSON.parse(msBody) as typeof msJson;
  } catch {
    msJson = {};
  }
  record(
    "member-self with session → S4, chain-verified, fixture not recognized",
    msRes.status === 200 &&
      msJson.state === "S4" &&
      msJson.chainVerified === true &&
      msJson.isRecognized === false &&
      msJson.seatNumber === null,
    `status ${msRes.status}, state ${msJson.state}, chainVerified ${String(msJson.chainVerified)}, isRecognized ${String(msJson.isRecognized)}`,
  );
  record(
    "member-self response leak scan (no 0x40-hex, no account echo)",
    !/0x[0-9a-fA-F]{40}/.test(msBody) &&
      !msBody.toLowerCase().includes(account.address.slice(2).toLowerCase()),
    "body carries no wallet-address material",
  );
  const msAnon = await fetch(`${BASE}/member-self`);
  const msAnonJson = (await msAnon.json()) as { state?: string; isRecognized?: unknown };
  record(
    "member-self without session → S1 + nulls (fail closed, not an error)",
    msAnon.status === 200 && msAnonJson.state === "S1" && msAnonJson.isRecognized === null,
    `status ${msAnon.status}, state ${msAnonJson.state}`,
  );

  // ── member-standing self-readback (founder Decision 5a) ───────────────────
  // A fresh fixture account is never a member: expect S4 + honest chain
  // posture + recognized false with EVERY standing field null (sentinel is a
  // clean not-recognized state, never an invented era), and NO account echo.
  const mstRes = await fetch(`${BASE}/member-standing`, {
    headers: { cookie: cookiePair },
  });
  const mstBody = await mstRes.text();
  let mstJson: {
    state?: string;
    chainVerified?: boolean;
    recognized?: boolean | null;
    memberNumber?: string | null;
    era?: string | null;
    authority?: string | null;
    continuityStatus?: string | null;
    proofPosture?: unknown;
  } = {};
  try {
    mstJson = JSON.parse(mstBody) as typeof mstJson;
  } catch {
    mstJson = {};
  }
  record(
    "member-standing with session → S4, chain-verified, fixture not recognized, all standing fields null",
    mstRes.status === 200 &&
      mstJson.state === "S4" &&
      mstJson.chainVerified === true &&
      mstJson.recognized === false &&
      mstJson.memberNumber === null &&
      mstJson.era === null &&
      mstJson.authority === null &&
      mstJson.continuityStatus === null &&
      mstJson.proofPosture === null,
    `status ${mstRes.status}, state ${mstJson.state}, chainVerified ${String(mstJson.chainVerified)}, recognized ${String(mstJson.recognized)}`,
  );
  record(
    "member-standing response leak scan (no 0x40-hex, no account echo)",
    !/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(mstBody) &&
      !mstBody.toLowerCase().includes(account.address.slice(2).toLowerCase()),
    "body carries no wallet-address material",
  );
  // Own-row only: a lookup-style query param must have ZERO effect — the
  // response is byte-identical to the no-param read (no lookup surface).
  const mstProbe = await fetch(
    `${BASE}/member-standing?account=${strangerAccount.address}`,
    { headers: { cookie: cookiePair } },
  );
  const mstProbeBody = await mstProbe.text();
  record(
    "member-standing ignores lookup query params (own-row only)",
    mstProbe.status === 200 &&
      mstProbeBody === mstBody &&
      !mstProbeBody
        .toLowerCase()
        .includes(strangerAccount.address.slice(2).toLowerCase()),
    "query-param probe returned the identical own-row response, no echo",
  );
  const mstAnon = await fetch(`${BASE}/member-standing`);
  const mstAnonJson = (await mstAnon.json()) as {
    state?: string;
    recognized?: unknown;
    era?: unknown;
    proofPosture?: unknown;
  };
  record(
    "member-standing without session → S1 + nulls (fail closed, not an error)",
    mstAnon.status === 200 &&
      mstAnonJson.state === "S1" &&
      mstAnonJson.recognized === null &&
      mstAnonJson.era === null &&
      mstAnonJson.proofPosture === null,
    `status ${mstAnon.status}, state ${mstAnonJson.state}`,
  );

  // ── S2d: /season-standing — own season self-readback (the same three
  //    disciplines: leak scan · lookup-param inert · anonymous S1). ─────────
  const ssnRes = await fetch(`${BASE}/season-standing`, {
    headers: { cookie: cookiePair },
  });
  const ssnBody = await ssnRes.text();
  const ssnJson = JSON.parse(ssnBody) as {
    state?: string;
    quests?: unknown;
    failureReason?: unknown;
  };
  record(
    "season-standing with session → 200 S4 (quests or an honest reason)",
    ssnRes.status === 200 &&
      ssnJson.state === "S4" &&
      (Array.isArray(ssnJson.quests) ||
        typeof ssnJson.failureReason === "string"),
    `status ${ssnRes.status}, state ${ssnJson.state}`,
  );
  record(
    "season-standing response leak scan (no 0x40-hex, no account echo)",
    !/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(ssnBody) &&
      !ssnBody.toLowerCase().includes(account.address.slice(2).toLowerCase()),
    "body carries no wallet-address material",
  );
  const ssnProbe = await fetch(
    `${BASE}/season-standing?account=${strangerAccount.address}`,
    { headers: { cookie: cookiePair } },
  );
  const ssnProbeBody = await ssnProbe.text();
  record(
    "season-standing ignores lookup query params (own-row only)",
    ssnProbe.status === 200 && ssnProbeBody === ssnBody,
    "query-param probe returned the identical own-row response",
  );
  const ssnAnon = await fetch(`${BASE}/season-standing`);
  const ssnAnonJson = (await ssnAnon.json()) as {
    state?: string;
    quests?: unknown;
    seat?: unknown;
  };
  record(
    "season-standing without session → S1 + nulls (fail closed, not an error)",
    ssnAnon.status === 200 &&
      ssnAnonJson.state === "S1" &&
      ssnAnonJson.quests === null &&
      ssnAnonJson.seat === null,
    `status ${ssnAnon.status}, state ${ssnAnonJson.state}`,
  );

  const lo = await post("/logout", undefined, { cookie: cookiePair });
  record(
    "logout → S1",
    lo.status === 200 && stateOf(lo.json) === "S1",
    `state ${stateOf(lo.json)}`,
  );
  const s2 = await getSession(cookiePair);
  record(
    "session after logout → S1",
    s2.status === 200 && stateOf(s2.json) === "S1",
    `state ${stateOf(s2.json)} (destroyed server-side)`,
  );

  // ── negative: invalid signature (signed by a different key) ───────────────
  const c2 = await getChallenge();
  const msg2 = buildMessage(c2, account.address);
  const sigWrong = await strangerAccount.signMessage({ message: msg2 });
  const v2 = await post("/verify", { message: msg2, signature: sigWrong });
  record(
    "invalid signature fails",
    v2.status === 401 && reasonOf(v2.json) === "invalid_signature",
    `status ${v2.status}, reason ${reasonOf(v2.json)}`,
  );

  // ── negative: replayed nonce ──────────────────────────────────────────────
  const replay = await post("/verify", { message: msg1, signature: sig1 });
  record(
    "replayed nonce fails",
    replay.status === 401 && reasonOf(replay.json) === "invalid_nonce",
    `status ${replay.status}, reason ${reasonOf(replay.json)} (nonce already consumed)`,
  );

  // ── negative: unknown nonce (restart-loss equivalent path) ────────────────
  const c3 = await getChallenge();
  const msg3 = buildMessage(c3, account.address, {
    nonce: "deadbeefdeadbeefdeadbeefdeadbeef",
  });
  const sig3 = await account.signMessage({ message: msg3 });
  const v3 = await post("/verify", { message: msg3, signature: sig3 });
  record(
    "unknown/lost nonce fails (restart fail-closed path)",
    v3.status === 401 && reasonOf(v3.json) === "invalid_nonce",
    `status ${v3.status}, reason ${reasonOf(v3.json)}`,
  );

  // ── negative: expired nonce (in-process unit check of the same store) ─────
  const issued = issueNonce();
  const realNow = Date.now;
  let expiredRejected = false;
  try {
    Date.now = () => realNow() + NONCE_TTL_MS + 1000;
    expiredRejected = issued !== null && !consumeNonce(issued.nonce);
  } finally {
    Date.now = realNow;
  }
  record(
    "expired nonce fails (store unit check)",
    expiredRejected,
    "consume after TTL+1s → rejected",
  );

  // ── negative: wrong domain / wrong URI / wrong chainId / tampered ─────────
  const c4 = await getChallenge();
  const msgWrongDomain = buildMessage(c4, account.address, { domain: "evil.example" });
  const sigWD = await account.signMessage({ message: msgWrongDomain });
  const vWD = await post("/verify", { message: msgWrongDomain, signature: sigWD });
  record(
    "wrong domain fails",
    vWD.status === 401 && reasonOf(vWD.json) === "invalid_message",
    `status ${vWD.status}, reason ${reasonOf(vWD.json)}`,
  );

  const c5 = await getChallenge();
  const msgWrongUri = buildMessage(c5, account.address, { uri: "https://evil.example/" });
  const sigWU = await account.signMessage({ message: msgWrongUri });
  const vWU = await post("/verify", { message: msgWrongUri, signature: sigWU });
  record(
    "wrong URI fails",
    vWU.status === 401 && reasonOf(vWU.json) === "invalid_message",
    `status ${vWU.status}, reason ${reasonOf(vWU.json)}`,
  );

  const c6 = await getChallenge();
  const msgWrongChain = buildMessage(c6, account.address, { chainId: 1 });
  const sigWC = await account.signMessage({ message: msgWrongChain });
  const vWC = await post("/verify", { message: msgWrongChain, signature: sigWC });
  record(
    "wrong chainId fails",
    vWC.status === 401 && reasonOf(vWC.json) === "invalid_message",
    `status ${vWC.status}, reason ${reasonOf(vWC.json)}`,
  );

  const c7 = await getChallenge();
  const msgGood = buildMessage(c7, account.address);
  const sigGood = await account.signMessage({ message: msgGood });
  const tampered = msgGood.replace("temporary", "permanent");
  const vT = await post("/verify", { message: tampered, signature: sigGood });
  record(
    "tampered message fails",
    vT.status === 401,
    `status ${vT.status}, reason ${reasonOf(vT.json)}`,
  );

  // ── negative: cookie / origin ─────────────────────────────────────────────
  const noCookie = await getSession();
  record(
    "missing cookie → S1",
    noCookie.status === 200 && stateOf(noCookie.json) === "S1",
    `state ${stateOf(noCookie.json)}`,
  );
  const bogus = await getSession("syn_session=bogus-restart-lost-session-id");
  record(
    "unknown session cookie → S1 (restart fail-closed)",
    bogus.status === 200 && stateOf(bogus.json) === "S1",
    `state ${stateOf(bogus.json)}`,
  );

  const cross = await post("/challenge", undefined, {
    origin: "https://evil.example",
  });
  record(
    "cross-origin POST rejected",
    cross.status === 403 && reasonOf(cross.json) === "cross_origin",
    `status ${cross.status}, reason ${reasonOf(cross.json)}`,
  );
  const crossFetch = await post("/challenge", undefined, {
    "sec-fetch-site": "cross-site",
  });
  record(
    "Sec-Fetch-Site: cross-site POST rejected",
    crossFetch.status === 403 && reasonOf(crossFetch.json) === "cross_origin",
    `status ${crossFetch.status}, reason ${reasonOf(crossFetch.json)}`,
  );

  // ── IA-2.5: client-identity extractor unit checks ─────────────────────────
  // A fresh module instance loads here with its own per-boot salt (unrelated
  // to the server's). Only key EQUALITY/INEQUALITY is asserted — raw IPs
  // below are RFC 5737/3849 documentation addresses, never real clients.
  const fakeReq = (headers: Record<string, string | string[]>): Request =>
    ({ headers }) as unknown as Request;
  const keyOf = (headers: Record<string, string | string[]>): string =>
    throttleKey(fakeReq(headers));
  const fallbackKey = keyOf({});

  record(
    "empty XFF → shared fallback bucket",
    keyOf({ "x-forwarded-for": "" }) === fallbackKey &&
      keyOf({ "x-forwarded-for": "   " }) === fallbackKey,
    "no-header, empty and whitespace-only XFF all collapse to one bucket",
  );
  record(
    "loopback-only XFF → fallback bucket",
    keyOf({ "x-forwarded-for": "127.0.0.1" }) === fallbackKey &&
      keyOf({ "x-forwarded-for": "::1" }) === fallbackKey,
    "loopback entries are never client identity",
  );
  record(
    "all-private XFF → fallback bucket",
    keyOf({
      "x-forwarded-for":
        "10.1.2.3, 192.168.0.9, 172.20.5.5, 169.254.1.1, 100.64.9.9, fc00::7, fe80::2",
    }) === fallbackKey,
    "RFC1918 + link-local + CGNAT + ULA all skipped",
  );
  record(
    "::ffff: mapped IPv4 normalizes",
    keyOf({ "x-forwarded-for": "::ffff:203.0.113.7" }) ===
      keyOf({ "x-forwarded-for": "203.0.113.7" }),
    "mapped and plain forms share one bucket",
  );
  record(
    "port-suffixed entries normalize",
    keyOf({ "x-forwarded-for": "203.0.113.7:4321" }) ===
      keyOf({ "x-forwarded-for": "203.0.113.7" }) &&
      keyOf({ "x-forwarded-for": "[2001:db8::7]:443" }) ===
        keyOf({ "x-forwarded-for": "2001:db8::7" }),
    "IPv4:port and [IPv6]:port forms share the plain bucket",
  );
  record(
    "malformed entries skipped",
    keyOf({ "x-forwarded-for": "banana, 203.0.113.7, not.an.ip.entry" }) ===
      keyOf({ "x-forwarded-for": "203.0.113.7" }) &&
      keyOf({ "x-forwarded-for": "banana, ,, garbage" }) === fallbackKey,
    "invalid literals never derail derivation; all-invalid collapses to fallback",
  );
  record(
    "mixed chain → rightmost public wins",
    keyOf({ "x-forwarded-for": "6.6.6.6, 203.0.113.7, 10.0.0.1, 127.0.0.1" }) ===
      keyOf({ "x-forwarded-for": "203.0.113.7" }) &&
      keyOf({ "x-forwarded-for": "6.6.6.6, 203.0.113.7, 10.0.0.1" }) !==
        keyOf({ "x-forwarded-for": "6.6.6.6" }),
    "attacker-prepended entries are ignored; the infra-appended side is trusted",
  );
  record(
    "spoofed x-real-ip never changes bucket",
    keyOf({ "x-forwarded-for": "203.0.113.7", "x-real-ip": "6.6.6.6" }) ===
      keyOf({ "x-forwarded-for": "203.0.113.7" }) &&
      keyOf({ "x-real-ip": "6.6.6.6" }) === fallbackKey,
    "x-real-ip is measured pass-through and never read",
  );
  record(
    "spoofed/malformed Forwarded never changes bucket",
    keyOf({ "x-forwarded-for": "203.0.113.7", forwarded: "for=6.6.6.6" }) ===
      keyOf({ "x-forwarded-for": "203.0.113.7" }) &&
      keyOf({ forwarded: "for=6.6.6.6" }) === fallbackKey &&
      keyOf({ forwarded: ";;;garbage==" }) === fallbackKey,
    "Forwarded is measured pass-through and never read",
  );
  record(
    "distinct clients → distinct buckets",
    keyOf({ "x-forwarded-for": "198.51.100.1" }) !==
      keyOf({ "x-forwarded-for": "198.51.100.2" }) &&
      keyOf({ "x-forwarded-for": "198.51.100.1" }) ===
        keyOf({ "x-forwarded-for": "198.51.100.1" }),
    "separation between clients, stability within one boot",
  );
  const sampleKey = keyOf({ "x-forwarded-for": "198.51.100.1" });
  record(
    "keys are opaque (no raw IP material)",
    sampleKey.startsWith("ip:") &&
      !sampleKey.includes("198.51.100.1") &&
      !sampleKey.slice(3).includes(".") &&
      fallbackKey === "ip:fallback",
    "hashed base64url key; raw IP absent; stable named fallback bucket",
  );

  // ── IA-2.5: live throttle behavior through the shared proxy ───────────────
  // The proxy APPENDS its peer to XFF, so a spoofed public entry stays left
  // of the appended loopback and the extractor derives it — a dev-only
  // property used here to simulate distinct clients.
  const CLIENT_A = { "x-forwarded-for": "198.51.100.77" };
  const CLIENT_B = { "x-forwarded-for": "198.51.100.78" };
  let tripStatus = 0;
  let tripsAt = 0;
  let tripBody: unknown = null;
  for (let i = 1; i <= THROTTLE_MAX_PER_WINDOW + 1; i += 1) {
    const r = await post("/challenge", undefined, CLIENT_A);
    if (r.status === 429) {
      tripStatus = r.status;
      tripsAt = i;
      tripBody = r.json;
      break;
    }
  }
  record(
    "throttle trips at limit for one derived bucket",
    tripStatus === 429 && tripsAt <= THROTTLE_MAX_PER_WINDOW + 1,
    `429 at request ${tripsAt} of window (limit ${THROTTLE_MAX_PER_WINDOW}/min)`,
  );
  record(
    "429 keeps uniform safe deny shape",
    JSON.stringify(tripBody) ===
      JSON.stringify({ error: "auth_denied", reason: "throttled" }),
    JSON.stringify(tripBody),
  );
  const bAfter = await post("/challenge", undefined, CLIENT_B);
  record(
    "second client unaffected by first client's throttle",
    bAfter.status === 200,
    `client B /challenge status ${bAfter.status} while client A is throttled`,
  );
  // Budget note: every no-XFF request in this suite (all the main-flow tests
  // above, ~18 today) shares ONE fallback throttle bucket (30/min). If the
  // suite grows more fallback-bucket requests, this final check can trip a
  // spurious 429 — keep the cumulative no-XFF request count under the limit,
  // or key new live tests with a spoofed public XFF like CLIENT_A/CLIENT_B.
  const fallbackLive = await post("/challenge", undefined, {
    "x-real-ip": "6.6.6.6",
    forwarded: "for=6.6.6.6",
  });
  record(
    "no-public-XFF live requests stay on the shared fallback bucket",
    fallbackLive.status === 200,
    `fallback-bucket /challenge status ${fallbackLive.status} despite spoofed x-real-ip/Forwarded`,
  );

  // ── Pre-publish hardening: production auth-exposure gate ──────────────────
  // These checks run against an IN-PROCESS app instance on an ephemeral port
  // (never the shared dev server), because they must flip NODE_ENV /
  // SYNDICATE_AUTH_ENABLED for the app under test. The gate reads the
  // environment per-request, so mutating process.env between requests is the
  // deterministic way to exercise both postures. Env is restored in finally.
  {
    const { default: app } = await import("../src/app");
    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const addr = server.address();
    if (addr === null || typeof addr === "string") {
      throw new Error("in-process server did not expose a port");
    }
    const gateBase = `http://127.0.0.1:${addr.port}/api/auth`;
    const savedNodeEnv = process.env["NODE_ENV"];
    const savedFlag = process.env["SYNDICATE_AUTH_ENABLED"];
    try {
      process.env["NODE_ENV"] = "production";
      delete process.env["SYNDICATE_AUTH_ENABLED"];
      const NOT_FOUND = JSON.stringify({ error: "not_found" });
      for (const p of ["/challenge", "/verify", "/logout"]) {
        const res = await fetch(`${gateBase}${p}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: p === "/challenge" ? undefined : JSON.stringify({}),
        });
        const text = await res.text();
        record(
          `prod-dark: POST ${p} answers as an unknown route`,
          res.status === 404 && text === NOT_FOUND && res.headers.get("set-cookie") === null,
          `status ${res.status}, body ${text.slice(0, 60)}, set-cookie ${String(res.headers.get("set-cookie"))}`,
        );
      }
      const sess = await fetch(`${gateBase}/session`, {
        headers: { cookie: "syn_session=doesnotexist" },
      });
      const sessText = await sess.text();
      record(
        "prod-dark: GET /session answers as an unknown route (cookie never read)",
        sess.status === 404 && sessText === NOT_FOUND && sess.headers.get("set-cookie") === null,
        `status ${sess.status}, body ${sessText.slice(0, 60)}`,
      );
      process.env["SYNDICATE_AUTH_ENABLED"] = "true";
      const enabled = await fetch(`${gateBase}/challenge`, { method: "POST" });
      await enabled.text();
      record(
        'prod-explicit-enable: flag "true" re-exposes the zone (challenge 200)',
        enabled.status === 200,
        `status ${enabled.status} with SYNDICATE_AUTH_ENABLED=true in production mode`,
      );
      process.env["SYNDICATE_AUTH_ENABLED"] = "TRUE";
      const sloppy = await fetch(`${gateBase}/challenge`, { method: "POST" });
      const sloppyText = await sloppy.text();
      record(
        'prod-exact-match: flag "TRUE" (non-exact) stays dark',
        sloppy.status === 404 && sloppyText === NOT_FOUND,
        `status ${sloppy.status} — only the exact string "true" exposes the zone`,
      );
    } finally {
      if (savedNodeEnv === undefined) delete process.env["NODE_ENV"];
      else process.env["NODE_ENV"] = savedNodeEnv;
      if (savedFlag === undefined) delete process.env["SYNDICATE_AUTH_ENABLED"];
      else process.env["SYNDICATE_AUTH_ENABLED"] = savedFlag;
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
    }
  }

  // ── summary ───────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.pass);
  console.log(
    `\nauth-skeleton-test: ${results.length - failed.length}/${results.length} checks passed.`,
  );
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("auth-skeleton-test: unexpected failure:", err);
  process.exit(1);
});
