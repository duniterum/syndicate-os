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
import { NONCE_TTL_MS } from "../src/auth/authConfig";
import { consumeNonce, issueNonce } from "../src/auth/nonceStore";

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
