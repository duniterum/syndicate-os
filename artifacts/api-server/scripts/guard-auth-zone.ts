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
//      chain id are reconciled verbatim. Public MVP amendment (founder-
//      approved): sessions bind the SIWE-verified account SERVER-SIDE ONLY
//      to serve the read-only member-self readback — S4 remains the ceiling;
//   4. payload/log leak: res.json lines never carry address/wallet/member/
//      account identifiers (nonce is allowed ONLY in the challenge response,
//      which the SIWE contract requires; the member-self response carries
//      recognition posture and the engine's own decimal figure, NEVER the
//      bound account); log lines never carry nonce/signature/address/account/
//      sessionId identifiers (string literals are stripped first so
//      reason codes like "invalid_signature" may exist);
//   5. fixture discipline: key-material helpers (privateKeyToAccount,
//      generatePrivateKey, mnemonicToAccount) appear only under scripts/,
//      never in served src/; no wallet-address or 64-hex literals in the
//      auth zone;
//   6. studio dist posture (FLIPPED for the founder-approved Public Online
//      Integration MVP): the wallet session shell is now public product
//      surface, so a production-default dist must CONTAIN the wallet
//      chunk's strings (/api/auth transport, S2 honesty copy) — while
//      server-side/fixture strings (SIWE statement copy, key-material
//      helpers, the session cookie name, the server exposure flag) must
//      still NEVER appear in any dist (this section requires a
//      production-default dist to exist and fails closed when missing);
//   7. client identity / edge posture (IA-2.5): peer-address APIs are never
//      used in served source; Express trust proxy stays unset; the spoofable
//      x-real-ip / Forwarded headers are never read; clientIdentity.ts
//      exports only throttleKey, performs no logging, salts from randomBytes
//      (never env), hashes HMAC-SHA256 → base64url; user-agent is never
//      keying material;
//   8. self-readback boundary (founder Decision 5a): the auth zone exposes
//      NO lookup surface — req.query and req.params are never read anywhere
//      under src/auth/ (the ONLY input to member-self/member-standing is the
//      session cookie); the member-standing route exists and resolves eras
//      exclusively through lib/protocol/holderIndexStanding (the auth zone
//      never imports the raw snapshot module directly, keeping ONE mapping
//      path); the live engine read goes through the shared engineReadback
//      helper in BOTH readback routes (no second inline read path to drift).
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
// Founder-approved amendment (operator WRITE zone, July 2026): src/operator is
// the SECOND sanctioned non-spine zone — the only place authorized writes
// happen. It is excluded from the read-only spine scan and pinned to its
// approved fail-closed shape by section 9 below.
const operatorDir = path.resolve(srcDir, "operator");
const operatorFiles = allSrcTs.filter((f) =>
  f.startsWith(operatorDir + path.sep),
);
const spineFiles = allSrcTs.filter(
  (f) =>
    !f.startsWith(authDir + path.sep) &&
    !f.startsWith(operatorDir + path.sep),
);

check(
  authFiles.length > 0,
  `auth zone present (${authFiles.length} files under src/auth)`,
  "src/auth is missing — the auth zone moved without updating this guard",
);

// ── 1. Route exposure: spine GET-only, scoped body parser, mount ────────────
// Express route write verbs only (router.post / app.delete …) — anchored so
// container methods like Map.prototype.delete never false-trip the scan.
const WRITE_VERB =
  /(\b(?:router|app)\s*\.\s*(post|put|patch|delete)\s*\()|(\b(?:router|app)\s*\[\s*["'](post|put|patch|delete)["']\s*\])|(\.route\s*\([^)]*\)\s*\.\s*(post|put|patch|delete)\s*\()/;
for (const abs of spineFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  check(
    !WRITE_VERB.test(code),
    `${rel}: no write verbs (read-only spine)`,
    `${rel} declares a write verb (.post/.put/.patch/.delete) outside src/auth and src/operator — the read-only spine must stay GET-only`,
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
// Founder-approved amendment (operator-authorization bridge, July 2026):
// operatorContext.ts is the SINGLE file in the auth zone allowed to reach the
// Phase 3 operator registry — read-only, lazily imported, fail-closed. Every
// other auth file stays registry-less, and operatorContext.ts itself is pinned
// below to the exact fail-closed shape that was approved.
const OPERATOR_BRIDGE_FILE = "auth/operatorContext.ts";
const REGISTRY_REACH = /@workspace\/db|drizzle|historical_member|memberRoot|ACTIVE/;
// For helpers OUTSIDE src/auth (one-hop transitive scan) only true DB reach
// counts — "ACTIVE" is a legitimate chain-decode status word in read-only
// protocol helpers and must not false-positive there.
const DB_REACH = /@workspace\/db|drizzle|historical_member|memberRoot/;
for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  if (rel === OPERATOR_BRIDGE_FILE) continue;
  const code = stripComments(read(abs));
  check(
    !REGISTRY_REACH.test(code),
    `${rel}: no registry/DB reach`,
    `${rel} references registry/DB material — the IA-2 auth zone is registry-less by founder gate (sole exception: ${OPERATOR_BRIDGE_FILE})`,
  );
  // Anti-laundering: an auth file must not route a registry reach through a
  // helper module outside src/auth. Resolve each relative import that escapes
  // the auth dir and scan the target one hop deep for registry/DB material.
  const importSpecs = [
    ...code.matchAll(/from\s+["'](\.\.?\/[^"']+)["']|import\(\s*["'](\.\.?\/[^"']+)["']\s*\)/g),
  ]
    .map((m) => m[1] ?? m[2])
    .filter((s): s is string => typeof s === "string");
  for (const spec of importSpecs) {
    const base = path.resolve(path.dirname(abs), spec);
    const target = [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")].find(
      (c) => existsSync(c),
    );
    if (target === undefined) continue;
    if (path.relative(authDir, target).startsWith("..") === false) continue; // inside auth: already scanned above
    check(
      !DB_REACH.test(stripComments(read(target))),
      `${rel} → ${path.relative(srcDir, target)}: imported helper has no registry/DB reach`,
      `${rel} imports ${path.relative(srcDir, target)}, which references registry/DB material — the auth zone must not launder a registry reach through a helper module`,
    );
  }
}
{
  const bridgeAbs = path.join(srcDir, OPERATOR_BRIDGE_FILE);
  const bridgeExists = existsSync(bridgeAbs);
  check(
    bridgeExists,
    `${OPERATOR_BRIDGE_FILE}: present`,
    `${OPERATOR_BRIDGE_FILE} missing — remove its guard exception if the bridge is retired`,
  );
  if (bridgeExists) {
    const code = stripComments(read(bridgeAbs));
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(code) &&
        /await import\(\s*["']@workspace\/db["']\s*\)/.test(code),
      `${OPERATOR_BRIDGE_FILE}: @workspace/db is lazily imported only`,
      `${OPERATOR_BRIDGE_FILE} must import @workspace/db ONLY via a lazy await import() — a top-level import couples the read-only server to a DB at boot`,
    );
    {
      const flagGateIdx = code.search(/AUTH_EXPOSURE_FLAG\]\s*!==\s*["']true["']/);
      const dbUrlIdx = code.indexOf("DATABASE_URL");
      const lazyImportIdx = code.search(/await import\(\s*["']@workspace\/db["']\s*\)/);
      check(
        flagGateIdx !== -1 &&
          dbUrlIdx !== -1 &&
          lazyImportIdx !== -1 &&
          flagGateIdx < lazyImportIdx &&
          dbUrlIdx < lazyImportIdx,
        `${OPERATOR_BRIDGE_FILE}: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import`,
        `${OPERATOR_BRIDGE_FILE} must check the auth exposure flag and DATABASE_URL presence BEFORE the lazy @workspace/db import — gate order drifted`,
      );
    }
    check(
      /catch\s*(\([^)]*\))?\s*\{[^}]*return NOT_OPERATOR/.test(code),
      `${OPERATOR_BRIDGE_FILE}: any error fails closed to NOT_OPERATOR`,
      `${OPERATOR_BRIDGE_FILE} must return NOT_OPERATOR from its catch — DB errors must never grant authority`,
    );
    check(
      /status\s*!==\s*["']ACTIVE["']/.test(code),
      `${OPERATOR_BRIDGE_FILE}: only ACTIVE operator rows resolve to a role`,
      `${OPERATOR_BRIDGE_FILE} must reject every non-ACTIVE operator status`,
    );
    check(
      !/\b(console|res|req|logger)\s*\./.test(code),
      `${OPERATOR_BRIDGE_FILE}: pure lookup module — no response, request, or log surface`,
      `${OPERATOR_BRIDGE_FILE} must stay a pure lookup module (no res/req/console/logger) so the verified account can never be echoed or logged from here`,
    );
  }
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
      !/\b(address|wallet|member|signature|account|boundAccount|verifiedAccount)\b/i.test(
        call.text,
      ),
      `${rel}:${call.line}: response expression carries no identity material`,
      `${rel}:${call.line}: a response expression references address/wallet/member/signature/account — auth responses must never carry identity material`,
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
      !/\b(nonce|signature|address|sessionId|wallet|member|account|boundAccount|verifiedAccount|ip|ips|remoteAddress|forwarded|xff)\b/i.test(
        call.text,
      ),
      `${rel}:${call.line}: log expression carries no secret/identity identifiers`,
      `${rel}:${call.line}: a log call references nonce/signature/address/sessionId/wallet/member/account/ip/remoteAddress/forwarded — values must never be logged`,
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

// ── 6. Studio dist posture (production-default build required) ──────────────
// FLIPPED (founder-approved Public Online Integration MVP): the wallet
// session shell is public product surface. A production-default dist must
// now CONTAIN the wallet chunk (its /api/auth transport and S2 honesty
// copy) — the regression net inverted. Server-side and fixture strings
// remain forbidden in every dist: the SIWE statement is issued by the
// server only, key-material helpers live under scripts/ only, the session
// cookie is HttpOnly (frontend never names it), and the server exposure
// flag is server posture (deliberately never named in frontend code).
if (!existsSync(studioDistDir)) {
  errors.push(
    "studio dist/ not found — run a production-default studio build first; this guard fails closed without dist proof",
  );
} else {
  const distFiles = walk(studioDistDir).filter((f) =>
    /\.(js|css|html)$/.test(f),
  );
  const REQUIRED_WALLET_PROBES = [
    // Wallet-chunk transport + honesty copy: their presence proves the
    // public wallet session shell shipped in the production-default build.
    // (Copy updated with the member-self readback slice: continuity is now a
    // live SELF-readback for the signed wallet only, so the honesty lines
    // changed — these are the new stable wallet-chunk strings.)
    "/api/auth",
    "proves control of a wallet",
    "self-readback",
  ];
  for (const probe of REQUIRED_WALLET_PROBES) {
    const hits = distFiles.filter((f) => read(f).includes(probe));
    check(
      hits.length > 0,
      `studio dist carries the public wallet shell string "${probe}"`,
      `studio dist is missing "${probe}" — the wallet session shell is public product surface and must ship in a production-default build (rebuild dist)`,
    );
  }
  const FORBIDDEN_DIST_PROBES = [
    "Sign to prove control of this wallet",
    "privateKeyToAccount",
    "syn_session",
    "SYNDICATE_AUTH_ENABLED",
  ];
  for (const probe of FORBIDDEN_DIST_PROBES) {
    const hits = distFiles.filter((f) => read(f).includes(probe));
    check(
      hits.length === 0,
      `studio dist carries no "${probe}"`,
      `studio dist contains "${probe}" in: ${hits
        .map((f) => path.relative(studioDistDir, f))
        .join(", ")} — server-side/fixture strings must never ship in the frontend bundle`,
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

// ── 8. Self-readback boundary (founder Decision 5a) ─────────────────────────
// Own-row only: the auth zone must never grow a lookup surface. The ONLY
// input to the readback routes is the session cookie — query strings and
// route params are banned wholesale under src/auth/.
for (const abs of authFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripStringLiterals(stripComments(read(abs)));
  check(
    !/\breq\.(query|params)\b/.test(code),
    `${rel}: no req.query / req.params (no lookup surface)`,
    `${rel} reads req.query or req.params — the self-readback contract forbids ANY lookup input beyond the session cookie`,
  );
}

const routerAbs = path.resolve(authDir, "router.ts");
if (existsSync(routerAbs)) {
  const routerCode = stripComments(read(routerAbs));
  check(
    /router\.get\(\s*["']\/member-standing["']/.test(routerCode),
    "router exposes GET /member-standing (Holder Index self-readback)",
    "GET /member-standing route missing from src/auth/router.ts — the Decision 5a self-readback surface drifted",
  );
  check(
    routerCode.includes("../lib/protocol/holderIndexStanding"),
    "router resolves standing through lib/protocol/holderIndexStanding",
    "router.ts does not import holderIndexStanding — era mapping must go through the single pure mapping module",
  );
  check(
    !routerCode.includes("../lib/protocol/holderIndexSnapshot"),
    "router never imports the raw snapshot module directly",
    "router.ts imports holderIndexSnapshot directly — the auth zone must map eras ONLY via holderIndexStanding (one mapping path)",
  );
  const memberRouteCount = (
    routerCode.match(/readEngineMemberNumber\(/g) ?? []
  ).length;
  check(
    routerCode.includes('from "./engineReadback"') && memberRouteCount >= 2,
    "both readback routes share the engineReadback helper",
    "member-self/member-standing no longer share readEngineMemberNumber — a second inline engine-read path is drift waiting to happen",
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

// ── 9. Operator WRITE zone (founder-approved amendment, July 2026) ──────────
// src/operator is the sanctioned write zone — the ONLY place authorized writes
// happen. Exempting it from the read-only spine scan (section 1) is paid for
// here by pinning its exact fail-closed shape: gated mount, session + ACTIVE
// operator role + admin-tier requirement, server-side authority (allow-list +
// hard cap), transactional write+audit, lazy DB import, and no identity leaks.
const operatorRouterAbs = path.resolve(operatorDir, "router.ts");
const operatorServiceAbs = path.resolve(operatorDir, "referralTermsService.ts");
check(
  operatorFiles.length > 0 &&
    existsSync(operatorRouterAbs) &&
    existsSync(operatorServiceAbs),
  `operator write zone present (${operatorFiles.length} files under src/operator)`,
  "src/operator (write zone) is missing or incomplete — remove its guard exemption if the zone is retired",
);
if (existsSync(operatorRouterAbs) && existsSync(operatorServiceAbs)) {
  // 9a. Mount posture: gate FIRST, router second — dark in production unless
  // SYNDICATE_AUTH_ENABLED === "true", exactly like the auth zone.
  check(
    /app\.use\("\/api\/operator",\s*authExposureGate,\s*operatorRouter\)/.test(
      appCode,
    ),
    "operator router mounted at /api/operator behind the exposure gate in app.ts",
    'app.ts must mount the write zone via app.use("/api/operator", authExposureGate, operatorRouter) — gate first, router second',
  );

  // 9b. Write verbs live ONLY in the zone's router file.
  for (const abs of operatorFiles) {
    const rel = path.relative(srcDir, abs);
    if (abs === operatorRouterAbs) continue;
    check(
      !WRITE_VERB.test(stripComments(read(abs))),
      `${rel}: no write verbs outside operator/router.ts`,
      `${rel} declares a write verb — inside the write zone, routes live only in operator/router.ts`,
    );
  }

  const opRouterCode = stripComments(read(operatorRouterAbs));
  // 9c. Router shape: scoped size-capped parser; throttle; session required;
  // role resolved via the read-only bridge; admin-tier allow-list; zod-validated
  // body; and NEVER query/params as input.
  check(
    /json\(\{\s*limit:/.test(opRouterCode),
    "operator router mounts its own size-capped JSON parser",
    "src/operator/router.ts must mount json({ limit: ... }) — scoped, size-capped body parsing",
  );
  check(
    /allowRequest\(/.test(opRouterCode) && /throttleKey\(/.test(opRouterCode),
    "operator router throttles every write route",
    "src/operator/router.ts must throttle (allowRequest + throttleKey) before any write work",
  );
  check(
    /getSessionAccount\(/.test(opRouterCode) &&
      /account\s*===\s*null/.test(opRouterCode),
    "operator router requires a wallet session (null account → deny)",
    "src/operator/router.ts must resolve the session account and deny when absent — no sessionless writes",
  );
  check(
    /lookupActiveOperator\(/.test(opRouterCode) &&
      /WRITE_ROLES\s*=\s*new Set\(\["founder_root",\s*"protocol_admin"\]\)/.test(
        opRouterCode,
      ) &&
      /WRITE_ROLES\.has\(/.test(opRouterCode),
    "operator router gates writes on an ACTIVE operator role in the admin-tier allow-list",
    "src/operator/router.ts role gate drifted — writes require lookupActiveOperator + WRITE_ROLES (founder_root, protocol_admin only)",
  );
  check(
    /\.safeParse\(/.test(opRouterCode),
    "operator router zod-validates every body",
    "src/operator/router.ts must validate bodies with zod safeParse before delegating",
  );
  check(
    /router\.post\(\s*"\/referral-terms"/.test(opRouterCode),
    'operator router exposes exactly the approved route path ("/referral-terms")',
    'src/operator/router.ts route path drifted — the approved write route is router.post("/referral-terms", …)',
  );
  check(
    !/req\.(query|params)\b/.test(opRouterCode),
    "operator router never reads req.query/req.params",
    "src/operator/router.ts reads req.query/req.params — session cookie + validated body are the only inputs",
  );

  // 9d. Leak scan (same discipline as the auth zone): no identity material in
  // any response or log expression anywhere in the zone.
  for (const abs of operatorFiles) {
    const rel = path.relative(srcDir, abs);
    const scanCode = stripStringLiterals(stripComments(read(abs)));
    for (const call of extractCallExpressions(scanCode, /\.json\(/)) {
      check(
        !/\b(address|wallet|member|signature|account|boundAccount|verifiedAccount|actorWallet)\b/i.test(
          call.text,
        ),
        `${rel}:${call.line}: response expression carries no identity material`,
        `${rel}:${call.line}: a write-zone response references address/wallet/account material — responses must never carry identity material`,
      );
    }
    for (const call of extractCallExpressions(
      scanCode,
      /log\.(info|warn|error|debug)\(/,
    )) {
      check(
        !/\b(nonce|signature|address|sessionId|wallet|member|account|boundAccount|verifiedAccount|actorWallet|ip|ips|remoteAddress|forwarded|xff)\b/i.test(
          call.text,
        ),
        `${rel}:${call.line}: log expression carries no secret/identity identifiers`,
        `${rel}:${call.line}: a write-zone log call references identity material — values must never be logged`,
      );
    }
  }

  const opServiceCode = stripComments(read(operatorServiceAbs));
  // 9e. Service shape: fail-closed gate (flag + DATABASE_URL) BEFORE the lazy
  // DB import; lazy import only; server-side authority (allow-list + pinned
  // 30% hard cap); term write and audit row in ONE transaction; errors fail
  // closed.
  {
    const flagGateIdx = opServiceCode.search(
      /AUTH_EXPOSURE_FLAG\]\s*!==\s*["']true["']/,
    );
    const dbUrlIdx = opServiceCode.indexOf("DATABASE_URL");
    const lazyImportIdx = opServiceCode.search(
      /await import\(\s*["']@workspace\/db["']\s*\)/,
    );
    check(
      flagGateIdx !== -1 &&
        dbUrlIdx !== -1 &&
        lazyImportIdx !== -1 &&
        flagGateIdx < lazyImportIdx &&
        dbUrlIdx < lazyImportIdx,
      "write service: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import",
      "referralTermsService.ts must check the auth exposure flag and DATABASE_URL BEFORE the lazy @workspace/db import — gate order drifted",
    );
  }
  check(
    !/^\s*import[^;]*@workspace\/db/m.test(opServiceCode),
    "write service: @workspace/db is lazily imported only",
    "referralTermsService.ts must import @workspace/db ONLY via a lazy await import() — a top-level import couples the read-only server to a DB at boot",
  );
  check(
    /HARD_CAP_BPS\s*=\s*3000\b/.test(opServiceCode) &&
      />\s*HARD_CAP_BPS/.test(opServiceCode),
    "write service: 30% hard cap (3000 bps) pinned and enforced server-side",
    "referralTermsService.ts hard cap drifted — HARD_CAP_BPS must stay 3000 and be enforced against every bps value",
  );
  check(
    /ALLOWED_KEYS\s*=\s*new Set\(/.test(opServiceCode) &&
      /!ALLOWED_KEYS\.has\(/.test(opServiceCode),
    "write service: term keys restricted to a server-side allow-list",
    "referralTermsService.ts must reject any key outside its ALLOWED_KEYS allow-list — server-side validation is the authority",
  );
  {
    const txIdx = opServiceCode.search(/db\.transaction\(/);
    const auditIdx = opServiceCode.search(/insert\(auditLog\)/);
    check(
      txIdx !== -1 && auditIdx !== -1 && auditIdx > txIdx,
      "write service: term write and audit row committed in one transaction",
      "referralTermsService.ts must insert the audit_log row inside the same db.transaction as the term write — no write without an audit trail",
    );
  }
  check(
    /catch\s*(\([^)]*\))?\s*\{[\s\S]{0,200}?ok:\s*false/.test(opServiceCode),
    "write service: any error fails closed (ok: false, rolled back)",
    "referralTermsService.ts must return ok: false from its catch — a failed write never half-applies",
  );
  check(
    !/\b(console|res|req|logger)\s*\./.test(opServiceCode),
    "write service: pure service module — no response, request, or log surface",
    "referralTermsService.ts must stay a pure service (no res/req/console/logger) so identity material can never leak from it",
  );

  // 9f. Fixture discipline parity: no wallet-address / 64-hex literals in the
  // write zone either.
  for (const abs of operatorFiles) {
    const rel = path.relative(srcDir, abs);
    const code = stripComments(read(abs));
    check(
      !HEX40.test(code) && !HEX64.test(code),
      `${rel}: no wallet-address / 64-hex literals`,
      `${rel} contains wallet-address or 64-hex material`,
    );
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nguard-auth-zone: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nguard-auth-zone: all ${ok.length} checks passed.`);
