// Guard: auth zone (Slice IA-2).
// The dev-only SIWE challenge/session skeleton must stay inside its approved
// boundaries:
//   1. route exposure: the read-only protocol spine stays GET-only — write
//      verbs (.post/.put/.patch/.delete) exist ONLY under src/auth/; the
//      app-wide middleware stack gains no body parser (express.json stays
//      scoped inside the auth router) and the auth router is mounted at
//      /api/auth in app.ts behind authExposureGate;
//   2. hygiene: session cookies carry HttpOnly + Secure + SameSite=Strict +
//      Path=/api; global CORS stays credential-free (no `credentials: true`
//      anywhere, methods stay GET/HEAD/OPTIONS); no browser-storage anywhere
//      in api-server src;
//   3. S4 cap: the auth zone knows exactly two state literals — "S1" and
//      "S4". No registry/DB import (drizzle, @workspace/db) exists in the
//      zone; no ACTIVE-row logic; the approved statement text and the canon
//      chain id are reconciled verbatim;
//   4. payload/log leak: res.json lines never carry address/wallet/member
//      identifiers (nonce is allowed ONLY in the challenge response, which
//      the SIWE contract requires); log lines never carry nonce/signature/
//      address/sessionId identifiers (string literals are stripped first so
//      reason codes like "invalid_signature" may exist);
//   5. fixture discipline: key-material helpers (privateKeyToAccount,
//      generatePrivateKey, mnemonicToAccount) appear only under scripts/,
//      never in served src/; no wallet-address or 64-hex literals in the
//      auth zone;
//   6. studio dist stays auth-free: the production-default studio build
//      contains no SIWE statement copy, no /api/auth references, no viem or
//      fixture strings — the frontend is visibly unchanged in IA-2 (this
//      section requires a production-default dist to exist and fails closed
//      when it is missing);
//   7. client identity / edge posture (IA-2.5): peer-address APIs are never
//      used in served source; Express trust proxy stays unset; the spoofable
//      x-real-ip / Forwarded headers are never read; clientIdentity.ts
//      exports only throttleKey, performs no logging, salts from randomBytes
//      (never env), hashes HMAC-SHA256 → base64url; user-agent is never
//      keying material.
//
// Scans are comment-stripped so documentation may name what it forbids.
// Run: pnpm --filter @workspace/api-server run auth-zone:guard

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  AUTH_CHAIN_ID,
  AUTH_STATEMENT,
} from "../src/auth/authConfig";
import { CHAIN_REGISTRY } from "../src/canon/the-syndicate/chain/chain-registry";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const scriptsDir = here;
const studioDistDir = path.resolve(here, "..", "..", "studio", "dist");

function read(abs: string): string {
  return readFileSync(abs, "utf8");
}

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

function stripStringLiterals(code: string): string {
  return code
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) {
      if (entry === "node_modules") continue;
      walk(abs, out);
    } else {
      out.push(abs);
    }
  }
  return out;
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const allSrcTs = walk(srcDir).filter((f) => /\.tsx?$/.test(f));
const authDir = path.resolve(srcDir, "auth");
const authFiles = allSrcTs.filter((f) => f.startsWith(authDir + path.sep));
const spineFiles = allSrcTs.filter((f) => !f.startsWith(authDir + path.sep));

check(
  authFiles.length > 0,
  `auth zone present (${authFiles.length} files under src/auth)`,
  "src/auth is missing — the auth zone moved without updating this guard",
);

// ── 1. Route exposure: spine GET-only, scoped body parser, mount ────────────
const WRITE_VERB = /\.(post|put|patch|delete)\s*\(/;
for (const abs of spineFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !WRITE_VERB.test(code),
    `${rel}: no write verbs (read-only spine)`,
    `${rel} declares a write verb (.post/.put/.patch/.delete) outside src/auth — the read-only spine must stay GET-only`,
  );
}
const appCode = stripComments(read(path.resolve(srcDir, "app.ts")));
check(
  !/express\.json|bodyParser|express\.urlencoded/.test(appCode),
  "app.ts mounts no app-wide body parser",
  "app.ts mounts a body parser app-wide — JSON parsing must stay scoped inside the auth router",
);
check(
  /app\.use\("\/api\/auth",\s*authExposureGate,\s*authRouter\)/.test(appCode),
  "auth router mounted at /api/auth behind the exposure gate in app.ts",
  'app.ts must mount the auth zone via app.use("/api/auth", authExposureGate, authRouter) — gate first, router second',
);
const routerCode = stripComments(read(path.resolve(authDir, "router.ts")));
check(
  /json\(\{\s*limit:/.test(routerCode),
  "auth router mounts its own size-capped JSON parser",
  "src/auth/router.ts must mount json({ limit: ... }) — scoped, size-capped body parsing",
);

// ── 2. Hygiene: cookie flags, credential-free CORS, no browser storage ──────
check(
  /httpOnly:\s*true/.test(routerCode) &&
    /secure:\s*true/.test(routerCode) &&
    /sameSite:\s*"strict"/.test(routerCode) &&
    /path:\s*"\/api"/.test(routerCode),
  "session cookie carries HttpOnly + Secure + SameSite=Strict + Path=/api",
  "src/auth/router.ts cookie options drifted — HttpOnly/Secure/SameSite=Strict/Path=/api are founder-approved requirements",
);
for (const abs of allSrcTs) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !/credentials:\s*true/.test(code),
    `${rel}: no credentialed CORS`,
    `${rel} enables credentialed CORS — forbidden (same-origin cookies only)`,
  );
}
check(
  /methods:\s*\["GET",\s*"HEAD",\s*"OPTIONS"\]/.test(appCode),
  "global CORS methods stay GET/HEAD/OPTIONS",
  "app.ts global CORS methods drifted — the global policy must stay read-only-shaped; auth POSTs are same-origin and need no CORS grant",
);
for (const abs of allSrcTs) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !/\b(localStorage|sessionStorage)\b/.test(code),
    `${rel}: no browser storage`,
    `${rel} references browser storage — server code must never model client-side auth persistence`,
  );
}

// ── 3. S4 cap: two state literals, no registry/DB, reconciled constants ─────
const STATE_LITERAL = /"S(\d{1,2})"/g;
for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  const found = new Set(
    [...code.matchAll(STATE_LITERAL)].map((m) => `S${m[1]}`),
  );
  const illegal = [...found].filter((s) => s !== "S1" && s !== "S4");
  check(
    illegal.length === 0,
    `${rel}: state literals capped at S1/S4`,
    `${rel} carries state literal(s) above the S4 cap: ${illegal.join(", ")} — registry-less IA-2 must never emit higher states`,
  );
}
for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !/@workspace\/db|drizzle|historical_member|memberRoot|ACTIVE/.test(code),
    `${rel}: no registry/DB reach`,
    `${rel} references registry/DB material — the IA-2 auth zone is registry-less by founder gate`,
  );
}
check(
  AUTH_CHAIN_ID === CHAIN_REGISTRY.id,
  `AUTH_CHAIN_ID reconciles to canon chain id (${CHAIN_REGISTRY.id})`,
  `AUTH_CHAIN_ID (${AUTH_CHAIN_ID}) drifted from canon chain id (${CHAIN_REGISTRY.id})`,
);
const APPROVED_STATEMENT =
  "Sign to prove control of this wallet. This creates a temporary unverified session only. It does not verify membership, grant operator authority, authorize a transaction, or move funds.";
check(
  AUTH_STATEMENT === APPROVED_STATEMENT,
  "SIWE statement matches the founder-approved text verbatim",
  "AUTH_STATEMENT drifted from the founder-approved statement — changing it is a founder-gated act",
);

// ── 4. Payload/log leak scan (full call expressions, brace-balanced) ────────
// Line-based scans miss multi-line object literals, so each res.json(...) /
// log.*(...) call is extracted as a full parenthesis-balanced expression
// (string literals emptied first, so identifiers are judged, not reason-code
// strings, and literal parens cannot unbalance the extraction).
function extractCallExpressions(
  code: string,
  callPattern: RegExp,
): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  const re = new RegExp(callPattern.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    let i = m.index + m[0].length;
    let depth = 1;
    while (i < code.length && depth > 0) {
      const ch = code[i];
      if (ch === "(") depth += 1;
      else if (ch === ")") depth -= 1;
      i += 1;
    }
    out.push({
      line: code.slice(0, m.index).split("\n").length,
      text: code.slice(m.index, i),
    });
  }
  return out;
}

for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripStringLiterals(stripComments(read(abs)));

  const responseCalls = extractCallExpressions(code, /\.json\(/);
  check(
    rel !== path.join("auth", "router.ts") || responseCalls.length > 0,
    `${rel}: response-shape scan found ${responseCalls.length} .json(...) call(s)`,
    `${rel}: expected .json(...) calls in the router but found none — the leak scan pattern drifted from the code`,
  );
  for (const call of responseCalls) {
    check(
      !/\b(address|wallet|member|signature)\b/i.test(call.text),
      `${rel}:${call.line}: response expression carries no identity material`,
      `${rel}:${call.line}: a response expression references address/wallet/member/signature — auth responses must never carry identity material`,
    );
    const isChallenge = /issued\.nonce/.test(call.text);
    if (!isChallenge) {
      check(
        !/\bnonce\b/i.test(call.text),
        `${rel}:${call.line}: nonce absent from non-challenge response`,
        `${rel}:${call.line}: nonce referenced in a non-challenge response expression`,
      );
    }
  }

  const logCalls = extractCallExpressions(code, /log\.(info|warn|error|debug)\(/);
  for (const call of logCalls) {
    check(
      !/\b(nonce|signature|address|sessionId|wallet|member|ip|ips|remoteAddress|forwarded|xff)\b/i.test(
        call.text,
      ),
      `${rel}:${call.line}: log expression carries no secret/identity identifiers`,
      `${rel}:${call.line}: a log call references nonce/signature/address/sessionId/wallet/member/ip/remoteAddress/forwarded — values must never be logged`,
    );
  }
}

// ── 5. Fixture discipline ────────────────────────────────────────────────────
const KEY_HELPERS = /privateKeyToAccount|generatePrivateKey|mnemonicToAccount/;
for (const abs of allSrcTs) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !KEY_HELPERS.test(code),
    `${rel}: no key-material helpers in served code`,
    `${rel} references key-material helpers — fixture keys live only under scripts/ (never served, never production authority)`,
  );
}
const HEX40 = /0x[0-9a-fA-F]{40}\b/;
const HEX64 = /\b[0-9a-fA-F]{64}\b/;
for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !HEX40.test(code) && !HEX64.test(code),
    `${rel}: no wallet-address / 64-hex literals`,
    `${rel} contains wallet-address or 64-hex material`,
  );
}
const fixtureScript = path.resolve(scriptsDir, "auth-skeleton-test.ts");
check(
  existsSync(fixtureScript),
  "fixture test script lives under scripts/ (auth-skeleton-test.ts)",
  "scripts/auth-skeleton-test.ts is missing — fixture testing must live under scripts/, never src/",
);

// ── 6. Studio dist stays auth-free (production-default build required) ──────
if (!existsSync(studioDistDir)) {
  errors.push(
    "studio dist/ not found — run a production-default studio build first; this guard fails closed without dist proof",
  );
} else {
  const distFiles = walk(studioDistDir).filter((f) =>
    /\.(js|css|html)$/.test(f),
  );
  const AUTH_PROBES = [
    "Sign to prove control of this wallet",
    "/api/auth",
    "privateKeyToAccount",
    "syn_session",
    "SYNDICATE_AUTH_ENABLED",
    // S2 wallet-chunk-only honesty copy: present ONLY in the build-time-gated
    // src/wallet/ module — its absence from a production-default dist proves
    // the wallet session shell was dead-code-eliminated.
    "member continuity not wired",
    "Holder Index not served",
  ];
  for (const probe of AUTH_PROBES) {
    const hits = distFiles.filter((f) => read(f).includes(probe));
    check(
      hits.length === 0,
      `studio dist carries no "${probe}"`,
      `studio dist contains "${probe}" in: ${hits
        .map((f) => path.relative(studioDistDir, f))
        .join(", ")} — the frontend must stay visibly unchanged and auth-free in IA-2`,
    );
  }
}

// ── 7. Client identity / edge posture (IA-2.5) ──────────────────────────────
const clientIdentityAbs = path.resolve(authDir, "clientIdentity.ts");
check(
  existsSync(clientIdentityAbs),
  "src/auth/clientIdentity.ts present (explicit throttle-key extractor)",
  "src/auth/clientIdentity.ts is missing — throttle keying must go through the explicit extractor",
);

for (const abs of allSrcTs) {
  const rel = path.relative(srcDir, abs);
  const code = stripStringLiterals(stripComments(read(abs)));
  check(
    !/\breq\.ips?\b/.test(code),
    `${rel}: no req.ip / req.ips`,
    `${rel} reads req.ip/req.ips — behind the shared proxy peer addresses are collapsed/spoofable; keying must use clientIdentity.throttleKey`,
  );
}

for (const abs of allSrcTs) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !/["'`]trust proxy["'`]/.test(code),
    `${rel}: trust proxy never set`,
    `${rel} references the trust-proxy setting — founder gate: it stays unset (platform hop count undocumented)`,
  );
  check(
    !/["'`]x-real-ip["'`]/i.test(code) && !/["'`]forwarded["'`]/i.test(code),
    `${rel}: no x-real-ip / Forwarded header reads`,
    `${rel} reads x-real-ip or Forwarded — both pass through the shared proxy untouched and are client-spoofable`,
  );
}

if (existsSync(clientIdentityAbs)) {
  const ciCode = stripComments(read(clientIdentityAbs));
  const exportedNames = [
    ...ciCode.matchAll(
      /export\s+(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g,
    ),
  ].map((m) => m[1]);
  check(
    exportedNames.length === 1 &&
      exportedNames[0] === "throttleKey" &&
      !/export\s*\{/.test(ciCode) &&
      !/export\s+default/.test(ciCode),
    "clientIdentity exports only throttleKey",
    `clientIdentity export surface drifted (found: ${exportedNames.join(", ") || "none"}) — throttleKey must be the sole export`,
  );
  check(
    !/\blogger\b|\breq\.log\b|console\./.test(stripStringLiterals(ciCode)),
    "clientIdentity imports no logger and performs no logging",
    "clientIdentity references a logging surface — the raw-IP path must be log-free",
  );
  check(
    /randomBytes\(/.test(ciCode) && !/process\.env/.test(ciCode),
    "clientIdentity salt comes from randomBytes (never process.env)",
    "clientIdentity salt discipline drifted — per-boot randomBytes only, never env, never persisted",
  );
  check(
    /createHmac\("sha256"/.test(ciCode) &&
      /base64url/.test(ciCode) &&
      !/["']hex["']/.test(ciCode),
    "clientIdentity hashes with HMAC-SHA256 → base64url (never hex)",
    "clientIdentity key hashing drifted — HMAC-SHA256 with truncated base64url digest required",
  );
}

for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !/user-agent|userAgent/i.test(code),
    `${rel}: no user-agent keying`,
    `${rel} references user-agent — attacker-mintable key material, rejected by founder gate`,
  );
}

// ── 8. Production exposure gate (pre-publish hardening) ─────────────────────
// The auth zone is dark by default in production: app.ts mounts
// authExposureGate BEFORE the router; the gate reads SYNDICATE_AUTH_ENABLED
// per-request, requires the exact opt-in string, and answers with the
// unknown-route 404 shape when dark — before any parser/cookie/throttle/
// nonce code can run.
const authExposureAbs = path.resolve(authDir, "authExposure.ts");
check(
  existsSync(authExposureAbs),
  "src/auth/authExposure.ts present (production exposure gate)",
  "src/auth/authExposure.ts is missing — the production dark-by-default gate is a founder-approved requirement",
);
if (existsSync(authExposureAbs)) {
  const gateCode = stripComments(read(authExposureAbs));
  check(
    /"SYNDICATE_AUTH_ENABLED"/.test(gateCode),
    "gate reads the SYNDICATE_AUTH_ENABLED flag",
    "authExposure.ts no longer references SYNDICATE_AUTH_ENABLED — the exposure flag name is contract",
  );
  check(
    !/VITE_/.test(gateCode),
    "exposure flag is server-side only (never VITE_-prefixed)",
    "authExposure.ts references a VITE_-prefixed name — the flag must never reach a frontend bundle",
  );
  check(
    /process\.env\["NODE_ENV"\]\s*!==\s*"production"/.test(gateCode),
    "gate exposes non-production unconditionally / production dark by default",
    "authExposure.ts NODE_ENV posture drifted — non-production stays exposed, production stays dark unless opted in",
  );
  check(
    /===\s*"true"/.test(gateCode) && !/!==\s*"false"/.test(gateCode),
    'gate requires the exact opt-in string "true" (never default-enabled)',
    'authExposure.ts opt-in comparison drifted — only SYNDICATE_AUTH_ENABLED === "true" may expose the zone',
  );
  check(
    /status\(404\)\.json\(\{\s*error:\s*"not_found"\s*\}\)/.test(gateCode),
    "dark responses reuse the unknown-route 404 shape",
    'authExposure.ts dark response drifted — it must be exactly res.status(404).json({ error: "not_found" })',
  );
  check(
    !/nonceStore|sessionStore|sessionThrottle|throttleKey|clientIdentity|cookie/i.test(
      gateCode,
    ),
    "gate touches no auth state (no nonce/session/throttle/cookie surface)",
    "authExposure.ts reaches into auth state — the dark gate must be side-effect-free",
  );
  check(
    !/\blogger\b|req\.log|console\./.test(gateCode),
    "gate performs no logging (dark zone indistinguishable from unknown route)",
    "authExposure.ts logs — a dark zone must not announce itself",
  );
}
const studioSrcDir = path.resolve(here, "..", "..", "studio", "src");
const studioFlagHits = walk(studioSrcDir)
  .filter((f) => /\.(tsx?|css|html)$/.test(f))
  .filter((f) => read(f).includes("SYNDICATE_AUTH_ENABLED"));
check(
  studioFlagHits.length === 0,
  "studio source never references the exposure flag",
  `studio src references SYNDICATE_AUTH_ENABLED in: ${studioFlagHits
    .map((f) => path.relative(studioSrcDir, f))
    .join(", ")} — the flag is server-side posture, never frontend material`,
);

// ── Report ───────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nguard-auth-zone: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nguard-auth-zone: all ${ok.length} checks passed.`);
