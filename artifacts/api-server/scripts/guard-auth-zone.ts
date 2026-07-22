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
// SPEC R3 amendment (channel zone, founder GO 2026-07-19): src/channel is the
// THIRD sanctioned non-spine zone — the constitutionally-named channel log
// (CONSTITUTION_AUTORITE §③ N2: "Le log des canaux" · "Les analytics").
// ANONYMOUS, bounded, fail-closed 204 beacons ONLY (click + receipt-verified
// conversion) — the least-trusting zone by design: no cookies, no sessions,
// no identity, no reads, nothing echoed. Excluded from the read-only spine
// scan and pinned to its exact approved shape by section 10 below.
const channelDir = path.resolve(srcDir, "channel");
const channelFiles = allSrcTs.filter((f) =>
  f.startsWith(channelDir + path.sep),
);
const spineFiles = allSrcTs.filter(
  (f) =>
    !f.startsWith(authDir + path.sep) &&
    !f.startsWith(operatorDir + path.sep) &&
    !f.startsWith(channelDir + path.sep),
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
    `${rel} declares a write verb (.post/.put/.patch/.delete) outside src/auth, src/operator and src/channel — the read-only spine must stay GET-only`,
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
// Founder-approved amendment (member self-recognition bridge, July 2026):
// memberRoster.ts is the SECOND sanctioned DB-reaching auth file — it resolves a
// signed wallet's OWN frozen genesis seat (#1–#8) from the member-continuity
// roster, read-only, lazily imported, own-row, fail-closed. Pinned below to the
// same registry-less-by-default shape as the operator bridge.
const MEMBER_BRIDGE_FILE = "auth/memberRoster.ts";
// NOTIF-1 (Q43, founder GO 2026-07-18): memberInbox.ts is the THIRD sanctioned
// DB-reaching auth file — the member's OWN-ROW notification center: the inbox
// read (own rows + ALL broadcasts joined to own receipts) AND the FIRST
// member-side writes (seen/read receipts, own-row keyed to the bound account
// — the no-email canon needs an honest badge). Lazily imported, fail-closed.
// Pinned below to the exact own-row shape.
const INBOX_BRIDGE_FILE = "auth/memberInbox.ts";
// SPEC R3 (founder GO 2026-07-19): channelStanding.ts is the FOURTH sanctioned
// DB-reaching auth file — the member's OWN-ROW channel breakdown (aggregate
// clicks + receipt-verified conversions per tag, for the session's own
// resolved source only; rows written ONLY by the anonymous src/channel zone).
// Read-only here, lazily imported, fail-closed. Pinned below to the exact
// own-row shape.
const CHANNEL_BRIDGE_FILE = "auth/channelStanding.ts";
// K3.a (mockup founder-approved 2026-07-22, "GO and GO-Live"): the FIFTH
// sanctioned DB-reaching auth file — the member's OWN activation-request rows
// (THE SECOND member-side write class). Own-row only, lazily imported,
// fail-closed, ask audited in the same transaction. Pinned below.
const ACTIVATION_BRIDGE_FILE = "auth/activationRequests.ts";
const DB_BRIDGE_FILES = new Set([
  OPERATOR_BRIDGE_FILE,
  MEMBER_BRIDGE_FILE,
  INBOX_BRIDGE_FILE,
  CHANNEL_BRIDGE_FILE,
  ACTIVATION_BRIDGE_FILE,
]);
const REGISTRY_REACH = /@workspace\/db|drizzle|historical_member|memberRoot|ACTIVE/;
// For helpers OUTSIDE src/auth (one-hop transitive scan) only true DB reach
// counts — "ACTIVE" is a legitimate chain-decode status word in read-only
// protocol helpers and must not false-positive there.
const DB_REACH = /@workspace\/db|drizzle|historical_member|memberRoot/;
for (const abs of authFiles) {
  // Normalize to POSIX separators so the OPERATOR_BRIDGE_FILE exception matches
  // on Windows too (path.relative yields "\" on win32; the constant uses "/").
  const rel = path.relative(srcDir, abs).split(path.sep).join("/");
  if (DB_BRIDGE_FILES.has(rel)) continue;
  const code = stripComments(read(abs));
  check(
    !REGISTRY_REACH.test(code),
    `${rel}: no registry/DB reach`,
    `${rel} references registry/DB material — the IA-2 auth zone is registry-less by founder gate (sanctioned exceptions: ${[...DB_BRIDGE_FILES].join(", ")})`,
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
{
  const memberAbs = path.join(srcDir, MEMBER_BRIDGE_FILE);
  const memberExists = existsSync(memberAbs);
  check(
    memberExists,
    `${MEMBER_BRIDGE_FILE}: present`,
    `${MEMBER_BRIDGE_FILE} missing — remove its guard exception if the genesis bridge is retired`,
  );
  if (memberExists) {
    const code = stripComments(read(memberAbs));
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(code) &&
        /await import\(\s*["']@workspace\/db["']\s*\)/.test(code),
      `${MEMBER_BRIDGE_FILE}: @workspace/db is lazily imported only`,
      `${MEMBER_BRIDGE_FILE} must import @workspace/db ONLY via a lazy await import() — a top-level import couples the read-only server to a DB at boot`,
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
        `${MEMBER_BRIDGE_FILE}: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import`,
        `${MEMBER_BRIDGE_FILE} must check the auth exposure flag and DATABASE_URL presence BEFORE the lazy @workspace/db import — gate order drifted`,
      );
    }
    check(
      /catch\s*(\([^)]*\))?\s*\{[^}]*return NOT_A_MEMBER/.test(code),
      `${MEMBER_BRIDGE_FILE}: any error fails closed to NOT_A_MEMBER`,
      `${MEMBER_BRIDGE_FILE} must return NOT_A_MEMBER from its catch — DB errors must never invent a seat`,
    );
    check(
      /["']PART_B_FREEZE_ROOT["']/.test(code),
      `${MEMBER_BRIDGE_FILE}: resolves only frozen genesis (PART_B_FREEZE_ROOT) rows`,
      `${MEMBER_BRIDGE_FILE} must scope its roster read to PART_B_FREEZE_ROOT — V3 seats are recognized live, never from the rebuildable roster`,
    );
    check(
      !/\b(console|res|req|logger)\s*\./.test(code),
      `${MEMBER_BRIDGE_FILE}: pure lookup module — no response, request, or log surface`,
      `${MEMBER_BRIDGE_FILE} must stay a pure lookup module (no res/req/console/logger) so the verified account can never be echoed or logged from here`,
    );
  }
}
{
  const inboxAbs = path.join(srcDir, INBOX_BRIDGE_FILE);
  const inboxExists = existsSync(inboxAbs);
  check(
    inboxExists,
    `${INBOX_BRIDGE_FILE}: present`,
    `${INBOX_BRIDGE_FILE} missing — remove its guard exception if the inbox read is retired`,
  );
  if (inboxExists) {
    const code = stripComments(read(inboxAbs));
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(code) &&
        /await import\(\s*["']@workspace\/db["']\s*\)/.test(code),
      `${INBOX_BRIDGE_FILE}: @workspace/db is lazily imported only`,
      `${INBOX_BRIDGE_FILE} must import @workspace/db ONLY via a lazy await import() — a top-level import couples the read-only server to a DB at boot`,
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
        `${INBOX_BRIDGE_FILE}: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import`,
        `${INBOX_BRIDGE_FILE} must check the auth exposure flag and DATABASE_URL presence BEFORE the lazy @workspace/db import — gate order drifted`,
      );
    }
    check(
      /catch\s*(\([^)]*\))?\s*\{[^}]*return null/.test(code),
      `${INBOX_BRIDGE_FILE}: any error fails closed to null`,
      `${INBOX_BRIDGE_FILE} must return null from its catch — DB errors must never invent an inbox`,
    );
    // Own-row ONLY: every account use is lowercased into `me`, notification
    // selection is EXACTLY own-wallet rows + ALL broadcasts, and receipt
    // writes key on the bound account — no lookup surface for arbitrary
    // wallets exists anywhere in the module.
    check(
      /const me = account\.toLowerCase\(\);/.test(code) &&
        /eq\(notification\.recipientWallet,\s*me\)/.test(code) &&
        /eq\(notification\.audience,\s*["']ALL["']\)/.test(code),
      `${INBOX_BRIDGE_FILE}: own-row where clause (session wallet + ALL broadcasts only)`,
      `${INBOX_BRIDGE_FILE} where clause drifted — notification selection must be ONLY eq(recipientWallet, me) OR eq(audience, "ALL") with me = account.toLowerCase()`,
    );
    check(
      /memberWallet:\s*me/.test(code) &&
        /eq\(notificationReceipt\.memberWallet,\s*me\)/.test(code) &&
        !/memberWallet:\s*(?!me)[a-zA-Z]/.test(code),
      `${INBOX_BRIDGE_FILE}: receipt writes are own-row ONLY (memberWallet = the bound account)`,
      `${INBOX_BRIDGE_FILE} receipt write drifted — every receipt insert/update must key memberWallet to the session's own lowercased account`,
    );
    check(
      /\.limit\(INBOX_LIMIT\)/.test(code),
      `${INBOX_BRIDGE_FILE}: reads are bounded (limit)`,
      `${INBOX_BRIDGE_FILE} must bound its reads with .limit(INBOX_LIMIT)`,
    );
    {
      const rowShape = code.match(/export interface InboxRow \{[\s\S]*?\n\}/)?.[0] ?? "";
      check(
        rowShape.length > 0 && !/[wW]allet/.test(rowShape),
        `${INBOX_BRIDGE_FILE}: served InboxRow carries NO wallet field`,
        `${INBOX_BRIDGE_FILE} InboxRow drifted — served inbox rows carry title/body/time/scope only, never any wallet material`,
      );
    }
    check(
      !/\b(console|res|req|logger)\s*\./.test(code),
      `${INBOX_BRIDGE_FILE}: pure lookup module — no response, request, or log surface`,
      `${INBOX_BRIDGE_FILE} must stay a pure lookup module (no res/req/console/logger) so the verified account can never be echoed or logged from here`,
    );
  }
}
{
  // K3.a — the activation-request bridge pin block (dated 2026-07-22).
  const activationAbs = path.join(srcDir, ACTIVATION_BRIDGE_FILE);
  const activationExists = existsSync(activationAbs);
  check(
    activationExists,
    `${ACTIVATION_BRIDGE_FILE}: present`,
    `${ACTIVATION_BRIDGE_FILE} missing — remove its guard exception if the intake is retired`,
  );
  if (activationExists) {
    const code = stripComments(read(activationAbs));
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(code) &&
        /await import\(\s*["']@workspace\/db["']\s*\)/.test(code),
      `${ACTIVATION_BRIDGE_FILE}: @workspace/db is lazily imported only`,
      `${ACTIVATION_BRIDGE_FILE} must import @workspace/db ONLY via a lazy await import() — a top-level import couples the read-only server to a DB at boot`,
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
        `${ACTIVATION_BRIDGE_FILE}: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import`,
        `${ACTIVATION_BRIDGE_FILE} must check the auth exposure flag and DATABASE_URL presence BEFORE the lazy @workspace/db import — gate order drifted`,
      );
    }
    check(
      /catch\s*(\([^)]*\))?\s*\{[^}]*return null/.test(code) &&
        /catch\s*(\([^)]*\))?\s*\{[^}]*return "unavailable"/.test(code),
      `${ACTIVATION_BRIDGE_FILE}: every error fails closed (read → null, write → "unavailable")`,
      `${ACTIVATION_BRIDGE_FILE} must fail closed from every catch — the read returns null, the write returns "unavailable"; a DB error must never invent or lose a request state`,
    );
    // Own-row ONLY: every account use is lowercased into `me`; the row
    // selection AND the insert key on the bound account and nothing else.
    check(
      /const me = account\.toLowerCase\(\);/.test(code) &&
        /eq\(activationRequest\.memberWallet,\s*me\)/.test(code) &&
        /memberWallet:\s*me/.test(code) &&
        !/memberWallet:\s*(?!me)[a-zA-Z]/.test(code),
      `${ACTIVATION_BRIDGE_FILE}: own-row where clause + own-row insert (memberWallet = the bound account)`,
      `${ACTIVATION_BRIDGE_FILE} drifted — every select must filter eq(activationRequest.memberWallet, me) and every insert must key memberWallet: me with me = account.toLowerCase()`,
    );
    // ONE open request per wallet — enforced in the TRANSACTION (never a
    // partial index): the open-row check must name both open statuses.
    check(
      /db\.transaction\(/.test(code) &&
        /inArray\(activationRequest\.status,\s*\[\s*"WAITING",\s*"HOLD"\s*\]\s*\)/.test(code),
      `${ACTIVATION_BRIDGE_FILE}: one OPEN request per wallet enforced inside the transaction`,
      `${ACTIVATION_BRIDGE_FILE} must check for an existing WAITING/HOLD row inside the ask transaction — one open request per wallet is a service invariant`,
    );
    // The engraved order: the ASK is AUDITED — the audit row commits in the
    // SAME transaction as the request row, and its target is the request id
    // (never a wallet↔seat pairing).
    check(
      /tx\.insert\(auditLog\)/.test(code) &&
        /action:\s*"activation-request\.ask"/.test(code) &&
        /target:\s*`request#/.test(code),
      `${ACTIVATION_BRIDGE_FILE}: the ask commits with its audit row (target = the request id)`,
      `${ACTIVATION_BRIDGE_FILE} must insert the audit_log row inside the same transaction as the request row, action "activation-request.ask", target the request id — never identity material`,
    );
    check(
      /\.limit\(1\)/.test(code),
      `${ACTIVATION_BRIDGE_FILE}: reads are bounded`,
      `${ACTIVATION_BRIDGE_FILE} must bound its reads with .limit(...)`,
    );
    {
      const rowShape =
        code.match(/export interface OwnActivationRequest \{[\s\S]*?\n\}/)?.[0] ?? "";
      check(
        rowShape.length > 0 && !/[wW]allet/.test(rowShape),
        `${ACTIVATION_BRIDGE_FILE}: served OwnActivationRequest carries NO wallet field`,
        `${ACTIVATION_BRIDGE_FILE} OwnActivationRequest drifted — the member's own view is status/dates/reason only, never any wallet material`,
      );
    }
    check(
      !/\b(console|res|req|logger)\s*\./.test(code),
      `${ACTIVATION_BRIDGE_FILE}: pure module — no response, request, or log surface`,
      `${ACTIVATION_BRIDGE_FILE} must stay a pure module (no res/req/console/logger) so the verified account can never be echoed or logged from here`,
    );
  }
}
{
  const channelBridgeAbs = path.join(srcDir, CHANNEL_BRIDGE_FILE);
  const channelBridgeExists = existsSync(channelBridgeAbs);
  check(
    channelBridgeExists,
    `${CHANNEL_BRIDGE_FILE}: present`,
    `${CHANNEL_BRIDGE_FILE} missing — remove its guard exception if the channel breakdown read is retired`,
  );
  if (channelBridgeExists) {
    const code = stripComments(read(channelBridgeAbs));
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(code) &&
        /await import\(\s*\n?\s*["']@workspace\/db["']\s*\n?\s*\)/.test(code),
      `${CHANNEL_BRIDGE_FILE}: @workspace/db is lazily imported only`,
      `${CHANNEL_BRIDGE_FILE} must import @workspace/db ONLY via a lazy await import() — a top-level import couples the read-only server to a DB at boot`,
    );
    {
      const flagGateIdx = code.search(/AUTH_EXPOSURE_FLAG\]\s*!==\s*["']true["']/);
      const dbUrlIdx = code.indexOf("DATABASE_URL");
      const lazyImportIdx = code.search(/await import\(/);
      check(
        flagGateIdx !== -1 &&
          dbUrlIdx !== -1 &&
          lazyImportIdx !== -1 &&
          flagGateIdx < lazyImportIdx &&
          dbUrlIdx < lazyImportIdx,
        `${CHANNEL_BRIDGE_FILE}: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import`,
        `${CHANNEL_BRIDGE_FILE} must check the auth exposure flag and DATABASE_URL presence BEFORE the lazy @workspace/db import — gate order drifted`,
      );
    }
    check(
      /catch\s*(\([^)]*\))?\s*\{[^}]*return null/.test(code),
      `${CHANNEL_BRIDGE_FILE}: any error fails closed to null`,
      `${CHANNEL_BRIDGE_FILE} must return null from its catch — DB errors must never invent a breakdown`,
    );
    // Own-row ONLY: the source is resolved through the SAME session-account
    // resolver as source-standing (canonical + D2 founder-signed fallback);
    // both table reads filter on that resolved id and nothing else.
    check(
      /readOwnSourceStanding\(account\.toLowerCase\(\)\)/.test(code) &&
        /eq\(referralChannelClick\.sourceIdHex,\s*sourceIdHex\)/.test(code) &&
        /eq\(referralChannelConversion\.sourceIdHex,\s*sourceIdHex\)/.test(code),
      `${CHANNEL_BRIDGE_FILE}: own-row where clauses (the session's own resolved source only)`,
      `${CHANNEL_BRIDGE_FILE} drifted — the breakdown must resolve the source via readOwnSourceStanding(account.toLowerCase()) and filter BOTH tables on that resolved id only`,
    );
    {
      const rowShape =
        code.match(/export interface ChannelBreakdownRow \{[\s\S]*?\n\}/)?.[0] ?? "";
      check(
        rowShape.length > 0 &&
          !/[wW]allet/.test(rowShape) &&
          !/[sS]ource/.test(rowShape),
        `${CHANNEL_BRIDGE_FILE}: served ChannelBreakdownRow carries NO wallet/source field`,
        `${CHANNEL_BRIDGE_FILE} ChannelBreakdownRow drifted — served rows carry via/clicks/conversions only, never wallet or source material`,
      );
    }
    check(
      !/\b(console|res|req|logger)\s*\./.test(code),
      `${CHANNEL_BRIDGE_FILE}: pure lookup module — no response, request, or log surface`,
      `${CHANNEL_BRIDGE_FILE} must stay a pure lookup module (no res/req/console/logger) so the verified account can never be echoed or logged from here`,
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
    // (Copy updated with the member-self readback slice, then again by S7:
    // the session panel retired — the honesty doctrine now ships in the
    // Member Home door band ("proves control of a wallet", "session ≠
    // membership" via syndicateFacts) and the own-row phrase "ever your own
    // row" replaced the machinery word "self-readback", which fell under the
    // Human-First Law. These are the new stable build strings.)
    "/api/auth",
    "proves control of a wallet",
    "no list of members",
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
  // Phase 3 slice 3: the suspend body schema is EXACTLY { id } — a wallet must
  // never be accepted as a suspend target from the network.
  check(
    /const SuspendOperatorBody = z\.object\(\{\s*id: z\.string\(\)\.min\(1\)\.max\(64\),\s*\}\);/.test(
      opRouterCode,
    ),
    "operator router: suspend body schema is EXACTLY { id } (no wallet field)",
    "src/operator/router.ts SuspendOperatorBody drifted — the suspend body must be exactly { id: z.string().min(1).max(64) }; a wallet field must never enter the suspend body",
  );
  // Approved route pin (verb-aware): the operator zone exposes EXACTLY these
  // verb+path pairs, in this order, and nothing else. Any new route must be
  // founder-approved and added here explicitly. TWO sanctioned READs:
  // GET /operators (Phase 3 slice 1 — masked registry list, admin-tier) and
  // GET /member-ledger (M-INT-1, founder-acted 2026-07-16 — the per-seat
  // member ledger, FOUNDER-ONLY because it pairs memberNumber↔walletShort per
  // the §D privacy overlay). Everything else stays a POST write.
  const APPROVED_ROUTES: ReadonlyArray<readonly [string, string]> = [
    ["post", "/referral-terms"],
    ["post", "/operators"],
    ["post", "/operators/suspend"],
    ["get", "/operators"],
    ["get", "/member-ledger"],
    // NOTIF-1 (Q43, founder GO 2026-07-18): notify ONE member (seat only in
    // the body — the server resolves seat→wallet), broadcast to ALL, and the
    // masked recent list (the honest bell). ALL THREE founder_root-only.
    ["post", "/notifications/member"],
    ["post", "/notifications/broadcast"],
    ["post", "/notifications/delete"],
    ["get", "/notifications"],
    // K3.a (mockup founder-approved 2026-07-22): the Source review queue —
    // the founder's list (live preflight, masked wallets, audited read), the
    // verdicts (decline/hold/reopen/close — approve is NEVER a server act),
    // and the signing-material read (ONE request's full wallet, audited per
    // read — the verify-links pattern). ALL THREE founder_root-only.
    ["get", "/activation-requests"],
    ["post", "/activation-requests/decide"],
    ["post", "/activation-requests/wallet"],
  ];
  const FOUNDER_ONLY_ROUTES = new Set([
    "post /operators",
    "post /operators/suspend",
    "post /notifications/member",
    "post /notifications/broadcast",
    "post /notifications/delete",
    "post /activation-requests/decide",
    "post /activation-requests/wallet",
  ]);
  const READ_ONLY_ROUTES = new Set([
    "get /operators",
    "get /member-ledger",
    "get /notifications",
    "get /activation-requests",
  ]);
  // Close alternate Express route-declaration syntaxes BEFORE enumerating:
  // .route(...).post(...), bracketed verbs (router["post"]), computed access,
  // and any router.use beyond the two sanctioned scoped middleware lines could
  // otherwise declare a handler the route-set pin below never sees.
  check(
    !/\.route\s*\(/.test(opRouterCode),
    "operator router declares no .route(...) chains (route-set pin cannot be bypassed)",
    "src/operator/router.ts uses .route(...) — routes must be declared ONLY as router.post(\"<path>\", …) so the approved-route-set pin sees them",
  );
  check(
    !/router\s*\[/.test(opRouterCode) && !/\brouter\s*\.\s*\n/.test(opRouterCode),
    "operator router uses no bracketed/computed/split verb access",
    'src/operator/router.ts accesses router via brackets or a split member expression — only literal router.post("<path>", …) declarations are approved',
  );
  {
    const useLines = opRouterCode
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.includes("router.use("));
    check(
      useLines.length === 2 &&
        useLines[0] === "router.use(json({ limit: AUTH_JSON_LIMIT }));" &&
        useLines[1] === "router.use(cookieParser());",
      "operator router.use is exactly the two sanctioned scoped middleware lines (json parser + cookieParser)",
      "src/operator/router.ts router.use drifted — only the exact lines router.use(json({ limit: AUTH_JSON_LIMIT })); and router.use(cookieParser()); are approved; anything else could smuggle a handler past the route-set pin",
    );
  }
  check(
    (opRouterCode.match(/Router\s*\(\s*\)/g) ?? []).length === 1,
    "operator router instantiates exactly ONE Router (no hidden sub-routers)",
    "src/operator/router.ts instantiates more than one Router() — a sub-router could carry routes the route-set pin never sees",
  );
  const routeMatches = [...opRouterCode.matchAll(/router\.(get|post|put|patch|delete|all|head|options)\s*\(\s*"([^"]*)"/g)];
  const approvedJoined = APPROVED_ROUTES.map(([v, p]) => `${v} ${p}`).join("|");
  check(
    routeMatches.map((m) => `${m[1]} ${m[2]}`).join("|") === approvedJoined,
    `operator router exposes exactly the approved verb+path set (${approvedJoined.replaceAll("|", ", ")})`,
    `src/operator/router.ts route set drifted — approved routes are ${approvedJoined.replaceAll("|", ", ")} and nothing else (found: ${routeMatches.map((m) => `${m[1]} ${m[2]}`).join(", ") || "none"})`,
  );
  // Per-route shape pin: split the router into route blocks and require EVERY
  // route to carry the full fail-closed chain, the registry WRITE routes to be
  // founder_root ONLY (stricter than the admin-tier allow-list), and the ONE
  // sanctioned READ route (GET /operators) to stay body-free, admin-tier
  // gated, and delegated to the masked list read ONLY.
  {
    const blockStarts = routeMatches.map((m) => m.index ?? 0);
    for (let i = 0; i < blockStarts.length; i += 1) {
      const routeKey = `${routeMatches[i]?.[1] ?? "?"} ${routeMatches[i]?.[2] ?? "(unknown)"}`;
      const block = opRouterCode.slice(
        blockStarts[i],
        i + 1 < blockStarts.length ? blockStarts[i + 1] : opRouterCode.length,
      );
      check(
        /allowRequest\(\s*throttleKey\(/.test(block),
        `route ${routeKey}: throttled (allowRequest + throttleKey) before any work`,
        `src/operator/router.ts route ${routeKey} lost its throttle — every route must call allowRequest(throttleKey(req)) first`,
      );
      check(
        /getSessionAccount\(/.test(block) && /account\s*===\s*null/.test(block),
        `route ${routeKey}: wallet session required (null account → deny)`,
        `src/operator/router.ts route ${routeKey} lost its session requirement — no sessionless access`,
      );
      check(
        /lookupActiveOperator\(/.test(block),
        `route ${routeKey}: role resolved via the read-only operator bridge`,
        `src/operator/router.ts route ${routeKey} must resolve the role via lookupActiveOperator`,
      );
      if (READ_ONLY_ROUTES.has(routeKey)) {
        check(
          !/req\.body\b/.test(block),
          `route ${routeKey}: READ route never touches req.body`,
          `src/operator/router.ts route ${routeKey} is a sanctioned READ — it must not read req.body at all`,
        );
        if (routeKey === "get /member-ledger") {
          // M-INT-1: FOUNDER-ONLY (memberNumber↔walletShort pairings are
          // restricted to founder_root by the §D privacy overlay — stricter
          // than the admin tier), delegates ONLY to the ledger read, and the
          // serialized payload must pass the 40-hex fail-closed scanner
          // before it leaves the server.
          check(
            /ctx\.role\s*!==\s*"founder_root"/.test(block) && !/WRITE_ROLES/.test(block),
            `route ${routeKey}: founder_root ONLY (member pairings are founder-gated)`,
            `src/operator/router.ts route ${routeKey} role gate drifted — the member ledger must deny unless ctx.role === "founder_root" and must NOT use the broader WRITE_ROLES allow-list`,
          );
          check(
            /readMemberLedger\(/.test(block) &&
              !/inviteOperator\(|suspendOperator\(|upsertReferralTerms\(|saveReferralTerm\(|listOperators\(/.test(block),
            `route ${routeKey}: delegates to the ledger read ONLY (no other service reachable)`,
            `src/operator/router.ts route ${routeKey} must call readMemberLedger() and must never reach any write service or the registry list`,
          );
          // A21 AMENDED (founder-gated, wireframe-approved + GO 2026-07-20):
          // the ledger rows now carry 64-hex verify anchors, so THIS route's
          // output scan is the BOUNDARY-AWARE 40-hex form (the f436c42
          // lesson — the strict aggregate scanner would 500 on every anchor).
          // A bare 20-byte address still fail-closes the response.
          check(
            /0x\[0-9a-fA-F\]\{40\}\(\?!\[0-9a-fA-F\]\)/.test(block) &&
              /JSON\.stringify\(result\.payload\)/.test(block) &&
              /throw new Error/.test(block),
            `route ${routeKey}: serialized payload passes the BOUNDARY-AWARE 40-hex fail-closed scan (A21)`,
            `src/operator/router.ts route ${routeKey} must run the boundary-aware 40-hex fail-closed scan (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/) over JSON.stringify(result.payload) and throw before res.json`,
          );
        } else if (routeKey === "get /notifications") {
          // NOTIF-1: FOUNDER-ONLY (the list pairs masked recipients with
          // founder-authored text), delegates ONLY to the masked list read,
          // and the serialized payload passes the 40-hex fail-closed scanner.
          check(
            /ctx\.role\s*!==\s*"founder_root"/.test(block) && !/WRITE_ROLES/.test(block),
            `route ${routeKey}: founder_root ONLY (the sent list is founder-gated)`,
            `src/operator/router.ts route ${routeKey} role gate drifted — the notifications list must deny unless ctx.role === "founder_root" and must NOT use the broader WRITE_ROLES allow-list`,
          );
          check(
            /listNotifications\(\)/.test(block) &&
              !/inviteOperator\(|suspendOperator\(|upsertReferralTerms\(|saveReferralTerm\(|sendMemberNotification\(|broadcastNotification\(/.test(
                block,
              ),
            `route ${routeKey}: delegates to the masked notification list ONLY (no write service reachable)`,
            `src/operator/router.ts route ${routeKey} must call listNotifications() and must never reach any write service`,
          );
          check(
            /assertAddressSafeAggregate\(\s*JSON\.stringify\(/.test(block),
            `route ${routeKey}: serialized payload passes the 40-hex fail-closed scanner`,
            `src/operator/router.ts route ${routeKey} must run assertAddressSafeAggregate(JSON.stringify(...)) over the payload before res.json`,
          );
        } else if (routeKey === "get /activation-requests") {
          // K3.a (dated 2026-07-22): FOUNDER-ONLY — queue rows pair masked
          // wallets with seats and live preflight verdicts (§D overlay class);
          // delegates ONLY to the audited queue list; the serialized payload
          // passes the BOUNDARY-AWARE 40-hex scan (64-hex source ids pass, a
          // bare address fail-closes).
          check(
            /ctx\.role\s*!==\s*"founder_root"/.test(block) && !/WRITE_ROLES/.test(block),
            `route ${routeKey}: founder_root ONLY (queue pairings are founder-gated)`,
            `src/operator/router.ts route ${routeKey} role gate drifted — the activation queue must deny unless ctx.role === "founder_root" and must NOT use the broader WRITE_ROLES allow-list`,
          );
          check(
            /listActivationRequests\(/.test(block) &&
              !/inviteOperator\(|suspendOperator\(|saveReferralTerm\(|listOperators\(|decideActivationRequest\(|readActivationRequestWallet\(/.test(
                block,
              ),
            `route ${routeKey}: delegates to the audited queue list ONLY (no other service reachable)`,
            `src/operator/router.ts route ${routeKey} must call listActivationRequests() and must never reach any write service or the signing-material read`,
          );
          check(
            /0x\[0-9a-fA-F\]\{40\}\(\?!\[0-9a-fA-F\]\)/.test(block) &&
              /JSON\.stringify\(result\.payload\)/.test(block) &&
              /throw new Error/.test(block),
            `route ${routeKey}: serialized payload passes the BOUNDARY-AWARE 40-hex fail-closed scan`,
            `src/operator/router.ts route ${routeKey} must run the boundary-aware 40-hex fail-closed scan over JSON.stringify(result.payload) and throw before res.json`,
          );
        } else {
          check(
            /WRITE_ROLES\.has\(/.test(block),
            `route ${routeKey}: admin-tier allow-list gate (WRITE_ROLES)`,
            `src/operator/router.ts route ${routeKey} must gate on WRITE_ROLES.has(ctx.role)`,
          );
          check(
            /listOperators\(\)/.test(block) &&
              !/inviteOperator\(|suspendOperator\(|upsertReferralTerms\(/.test(block),
            `route ${routeKey}: delegates to the masked list read ONLY (no write service reachable)`,
            `src/operator/router.ts route ${routeKey} must call listOperators() and must never reach inviteOperator/suspendOperator/upsertReferralTerms`,
          );
        }
      } else {
        check(
          /\.safeParse\(\s*req\.body\s*\)/.test(block),
          `route ${routeKey}: body zod-validated (safeParse(req.body))`,
          `src/operator/router.ts route ${routeKey} must zod-validate req.body before delegating`,
        );
        if (FOUNDER_ONLY_ROUTES.has(routeKey)) {
          check(
            /ctx\.role\s*!==\s*"founder_root"/.test(block) &&
              !/WRITE_ROLES/.test(block),
            `route ${routeKey}: founder_root ONLY (registry changes are founder-gated)`,
            `src/operator/router.ts route ${routeKey} role gate drifted — registry write routes must deny unless ctx.role === "founder_root" and must NOT use the broader WRITE_ROLES allow-list`,
          );
        } else {
          check(
            /WRITE_ROLES\.has\(/.test(block),
            `route ${routeKey}: admin-tier allow-list gate (WRITE_ROLES)`,
            `src/operator/router.ts route ${routeKey} must gate on WRITE_ROLES.has(ctx.role)`,
          );
        }
      }
      if (routeKey === "post /activation-requests/wallet") {
        // K3.a (dated 2026-07-22): THE SIGNING-MATERIAL EXEMPTION — the
        // operator zone's ONE deliberate address-emitting response (the
        // verify-links pattern for legitimate address material): the
        // founder's wallet screen must sign exactly the wallet the request
        // named, and createSource takes a wallet. Founder-only (pinned
        // above), audited PER READ inside the service, payload built
        // OUTSIDE the res.json call (the zone's payload-variable idiom).
        check(
          /readActivationRequestWallet\(/.test(block) &&
            /const signingMaterial = \{ ok: true as const, signerTarget: result\.wallet \};/.test(
              block,
            ) &&
            /res\.json\(signingMaterial\);/.test(block),
          `route ${routeKey}: the deliberate signing-material shape (audited service read, payload-variable idiom)`,
          `src/operator/router.ts route ${routeKey} drifted — it must delegate to readActivationRequestWallet (audited per read) and build the response as const signingMaterial = { ok: true as const, signerTarget: result.wallet }; res.json(signingMaterial);`,
        );
      }
    }
  }
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

  // 9g. Registry service shape (invite/suspend — founder-approved amendment):
  // same fail-closed discipline as the terms service, plus registry-specific
  // authority pins (wallet-form validation, role allow-list, self-suspend
  // lockout guard, transactional change+audit for BOTH operations).
  const registryServiceAbs = path.resolve(operatorDir, "operatorRegistryService.ts");
  check(
    existsSync(registryServiceAbs),
    "registry service present (operatorRegistryService.ts)",
    "src/operator/operatorRegistryService.ts is missing — remove its route pins if the registry zone is retired",
  );
  if (existsSync(registryServiceAbs)) {
    const regCode = stripComments(read(registryServiceAbs));
    {
      const gateIdx = regCode.search(/AUTH_EXPOSURE_FLAG\]\s*===\s*["']true["']/);
      const dbUrlIdx = regCode.indexOf("DATABASE_URL");
      const lazyIdx = regCode.search(/await import\(\s*["']@workspace\/db["']\s*\)/);
      check(
        gateIdx !== -1 && dbUrlIdx !== -1 && lazyIdx !== -1 && gateIdx < lazyIdx && dbUrlIdx < lazyIdx,
        "registry service: exposure-flag + DATABASE_URL gate executes BEFORE the lazy DB import",
        "operatorRegistryService.ts must check the auth exposure flag and DATABASE_URL BEFORE the lazy @workspace/db import — gate order drifted",
      );
    }
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(regCode),
      "registry service: @workspace/db is lazily imported only",
      "operatorRegistryService.ts must import @workspace/db ONLY via a lazy await import()",
    );
    check(
      (regCode.match(/\^0x\[0-9a-f\]\{40\}\$/g) ?? []).length >= 1,
      "registry service: wallet form validated server-side in inviteOperator",
      "operatorRegistryService.ts must validate /^0x[0-9a-f]{40}$/ on the lowercased wallet in inviteOperator",
    );
    // Phase 3 slice 3 — suspend is id-based ONLY: the client never submits a
    // wallet to suspend. Pins: the suspend input carries id (no wallet field),
    // the id is bounds-checked (bad_id), and the target wallet is RESOLVED
    // server-side from the row by id (for the self-suspend guard + audit
    // target) — never taken from the request.
    check(
      /interface SuspendOperatorInput \{\s*id: string;\s*actorWallet: string;\s*actorRole: string;\s*\}/.test(
        regCode,
      ),
      "registry service: suspend input is EXACTLY { id, actorWallet, actorRole } — no target-wallet field",
      "operatorRegistryService.ts SuspendOperatorInput drifted — suspend must be id-based; a target wallet field must never enter the suspend input",
    );
    check(
      /input\.id\.length === 0 \|\| input\.id\.length > 64/.test(regCode) &&
        /bad_id/.test(regCode),
      "registry service: suspend id bounds-checked server-side (bad_id)",
      "operatorRegistryService.ts must bounds-check input.id (empty / >64 → bad_id) before touching the DB",
    );
    check(
      /select\(\{\s*wallet:\s*operator\.wallet,\s*role:\s*operator\.role,\s*status:\s*operator\.status\s*\}\)/.test(
        regCode,
      ) && /eq\(operator\.id,\s*input\.id\)/.test(regCode),
      "registry service: suspend resolves the target wallet/role/status from the row by id (server-side authority)",
      "operatorRegistryService.ts suspendOperator must resolve the target wallet, role, AND status by SELECTing the row via eq(operator.id, input.id) — the target identity/tier must never come from the request",
    );
    // Phase 3 slice 4a — last-founder guard is REQUIRED: a suspend that could
    // remove the last ACTIVE founder_root must be refused (last_founder). The
    // guard must (a) trigger on an ACTIVE founder_root target, (b) count
    // ACTIVE founder_root rows server-side inside the same transaction, and
    // (c) refuse when that count is <= 1 — the founder tier can never be
    // emptied.
    check(
      /found\[0\]\.role === "founder_root" && found\[0\]\.status === "ACTIVE"/.test(regCode),
      "registry service: last-founder guard triggers on an ACTIVE founder_root target",
      "operatorRegistryService.ts suspendOperator must check the resolved row's role === \"founder_root\" && status === \"ACTIVE\" before allowing a founder suspend — the last-founder guard trigger drifted",
    );
    check(
      /and\(eq\(operator\.role,\s*"founder_root"\),\s*eq\(operator\.status,\s*"ACTIVE"\)\)/.test(
        regCode,
      ),
      "registry service: last-founder guard counts ACTIVE founder_root rows server-side",
      "operatorRegistryService.ts suspendOperator must count rows where role=founder_root AND status=ACTIVE via and(eq(...), eq(...)) inside the transaction — the count query drifted",
    );
    // The check-then-update must be ATOMIC under concurrency: both the target
    // row resolution AND the ACTIVE-founder count must take row locks
    // (SELECT ... FOR UPDATE), or two concurrent founder suspends could each
    // observe count=2 and empty the tier together.
    check(
      (regCode.match(/\.for\("update"\)/g) ?? []).length >= 2 &&
        /eq\(operator\.status,\s*"ACTIVE"\)\)\)\s*\.for\("update"\)/.test(regCode) &&
        /\.limit\(1\)\s*\.for\("update"\)/.test(regCode),
      "registry service: last-founder check-then-update is lock-serialized (FOR UPDATE on target row AND founder count)",
      "operatorRegistryService.ts suspendOperator must append .for(\"update\") to BOTH the target-row select and the ACTIVE founder_root count select — without row locks, concurrent suspends can race past the last-founder guard and empty the tier",
    );
    check(
      /activeFounders\.length <= 1/.test(regCode) &&
        /reason:\s*"last_founder"/.test(regCode),
      "registry service: last ACTIVE founder_root can never be suspended (last_founder, <= 1)",
      "operatorRegistryService.ts suspendOperator must refuse with reason \"last_founder\" when the ACTIVE founder_root count is <= 1 — the founder tier must never be emptied",
    );
    {
      // The last_founder refusal must return BEFORE any update/audit write —
      // no mutation and no audit row may exist for a refused founder suspend.
      const lastFounderIdx = regCode.indexOf('reason: "last_founder"');
      const updateIdx = regCode.search(/\.update\(operator\)/);
      check(
        lastFounderIdx !== -1 && updateIdx !== -1 && lastFounderIdx < updateIdx,
        "registry service: last_founder refusal executes BEFORE the status update (no mutation, no audit)",
        "operatorRegistryService.ts must return the last_founder refusal before the update(operator)/audit insert — a refused founder suspend must leave zero traces",
      );
    }
    check(
      /action:\s*"operator\.suspend"/.test(regCode) &&
        /target:\s*targetWallet/.test(regCode) &&
        /detail:\s*\{\s*id:\s*input\.id\s*\}/.test(regCode),
      "registry service: suspend audit row pinned (action operator.suspend, target = resolved wallet, detail.id)",
      "operatorRegistryService.ts suspend audit row drifted — it must record action \"operator.suspend\", target = the resolved row wallet, and detail { id: input.id }",
    );
    check(
      /OPERATOR_ROLES\s*=\s*new Set\(/.test(regCode) && /!OPERATOR_ROLES\.has\(/.test(regCode),
      "registry service: invited roles restricted to a server-side allow-list",
      "operatorRegistryService.ts must reject any role outside its OPERATOR_ROLES allow-list",
    );
    check(
      /cannot_suspend_self/.test(regCode) &&
        /===\s*input\.actorWallet\.toLowerCase\(\)/.test(regCode),
      "registry service: self-suspend lockout guard pinned (cannot_suspend_self)",
      "operatorRegistryService.ts must deny wallet === actorWallet with reason cannot_suspend_self — the founder can never lock themselves out",
    );
    check(
      (regCode.match(/db\.transaction\(/g) ?? []).length === 2 &&
        (regCode.match(/insert\(auditLog\)/g) ?? []).length === 2,
      "registry service: invite AND suspend each commit their audit row in one transaction",
      "operatorRegistryService.ts must wrap each registry change + its audit_log insert in ONE db.transaction — no registry change without an audit trail",
    );
    check(
      /status:\s*"SUSPENDED"/.test(regCode) && !/\.delete\(/.test(regCode),
      "registry service: suspend flips status only (no row deletion surface)",
      "operatorRegistryService.ts must set status SUSPENDED and never delete operator rows — the registry is append/status-only",
    );
    check(
      /catch\s*(\([^)]*\))?\s*\{[\s\S]{0,200}?ok:\s*false/.test(regCode),
      "registry service: any error fails closed (ok: false, rolled back)",
      "operatorRegistryService.ts must return ok: false from its catch",
    );
    check(
      !/\b(console|res|req|logger)\s*\./.test(regCode),
      "registry service: pure service module — no response, request, or log surface",
      "operatorRegistryService.ts must stay a pure service (no res/req/console/logger)",
    );
    // Phase 3 slice 1 — sanctioned masked list read. Pins: every exported
    // service function opens with the same fail-closed gate; the list row
    // shape carries ONLY the masked walletShort (never a full-wallet field);
    // and the server-side mask is the 0x……-style slice.
    {
      const exportedFns = (regCode.match(/export async function /g) ?? []).length;
      const gatedReturns = (
        regCode.match(/if \(!gateOpen\(\)\) return \{ ok: false, reason: "unavailable" \};/g) ?? []
      ).length;
      check(
        exportedFns >= 3 && gatedReturns === exportedFns,
        "registry service: EVERY exported function (incl. listOperators) opens with the fail-closed exposure gate",
        "operatorRegistryService.ts gate coverage drifted — each exported async function must start with `if (!gateOpen()) return { ok: false, reason: \"unavailable\" };`",
      );
    }
    // (Phase 3 slice 3 amendment: the stable row id — a UUID, non-PII — is now
    // part of the list row shape so the admin surface can suspend by id
    // without ever handling a wallet. Still NO full-wallet field.)
    check(
      /interface OperatorRow \{\s*id: string;\s*walletShort: string;\s*label: string;\s*role: string;\s*status: string;\s*\}/.test(
        regCode,
      ),
      "registry service: list row shape is EXACTLY { id, walletShort, label, role, status } — no full-wallet field",
      "operatorRegistryService.ts OperatorRow drifted — the list read may carry ONLY id/walletShort/label/role/status; a full wallet field must never enter the row shape",
    );
    check(
      /listOperators/.test(regCode) &&
        /slice\(0,\s*6\)/.test(regCode) &&
        /slice\(-4\)/.test(regCode),
      "registry service: listOperators masks wallets server-side (slice(0,6)…slice(-4))",
      "operatorRegistryService.ts must mask wallets server-side in listOperators — the full wallet never leaves the server",
    );
  }

  // 9e-ML. M-INT-1 member-ledger service pins (mirrors the registry-service
  // discipline): fail-closed gate, pure module, masked short wallets ONLY in
  // the row shape, no transaction anchors in v1 rows (audit A21 — a later
  // founder-gated amendment), and every access audit-logged.
  {
    const mlCode = stripComments(read(path.resolve(srcDir, "operator", "memberLedgerService.ts")));
    check(
      /if \(!gateOpen\(\)\) return \{ ok: false, reason: "unavailable" \};/.test(mlCode),
      "ledger service: opens with the fail-closed exposure gate",
      'memberLedgerService.ts must start readMemberLedger with `if (!gateOpen()) return { ok: false, reason: "unavailable" };`',
    );
    check(
      !/\b(console|res|req|logger)\s*\./.test(mlCode),
      "ledger service: pure service module — no response, request, or log surface",
      "memberLedgerService.ts must stay a pure service (no res/req/console/logger)",
    );
    check(
      /catch\s*(\([^)]*\))?\s*\{[\s\S]{0,200}?ok:\s*false/.test(mlCode),
      "ledger service: any error fails closed (ok: false)",
      "memberLedgerService.ts must return ok: false from its catch",
    );
    check(
      /walletShort: string;/.test(mlCode) &&
        !/\bwallet: string;/.test(mlCode.replace(/actor: \{[\s\S]*?\}/, "")) &&
        /slice\(0,\s*6\)/.test(mlCode) &&
        /slice\(-4\)/.test(mlCode),
      "ledger service: rows carry the masked walletShort ONLY (slice(0,6)…slice(-4)); no full-wallet row field",
      "memberLedgerService.ts row shape drifted — LedgerRow may carry only the server-masked walletShort, never a full wallet field",
    );
    // A21 SHIPPED (the amendment this pin reserved — founder-gated,
    // wireframe-approved + "GO and GO-Live" 2026-07-20): rows now carry
    // their receipts' verify anchors. The pin flips to guarding the
    // amendment's OWN laws: the receipt lines are the sanctioned public row
    // shape mapped from the own-purchase read-model (one spine, one fact
    // shape), an anchor without its explorer link never serves, and the
    // route's boundary-aware output scan (pinned above) stays the net.
    check(
      /LedgerReceiptLine/.test(mlCode) &&
        /txUrl\(r\.transactionHash\)/.test(mlCode) &&
        /if \(explorerUrl === null\) continue;/.test(mlCode),
      "ledger service: A21 receipt lines ride the sanctioned shape — an anchor we cannot verify-link never serves",
      "memberLedgerService.ts A21 drifted — receipt lines must map through txUrl(r.transactionHash) and skip null explorer links (the auth-route discipline)",
    );
    check(
      /"member-ledger\.read"/.test(mlCode) && /auditLog/.test(mlCode),
      "ledger service: every access writes the member-ledger.read audit row",
      "memberLedgerService.ts must write an auditLog row (action member-ledger.read) on every successful read",
    );
    check(
      /SEGMENT_DEFINITIONS/.test(mlCode) && /segmentDefinitions/.test(mlCode),
      "ledger service: segment definitions ship in the payload (the console renders the exact math)",
      "memberLedgerService.ts must serve SEGMENT_DEFINITIONS in the payload — a segment chip without its definition is an unexplained judgment",
    );
  }

  // 9e-NT. NOTIF-1 notification service pins (mirrors the registry-service
  // discipline): fail-closed gate, pure module, seat→wallet resolved server-
  // side on the continuity spine (never from the client), the wallet↔seat
  // pairing NEVER in audit (seat-only target), address-bearing text refused at
  // write time, masked recipients in the list, and every write audit-rowed.
  {
    const ntCode = stripComments(read(path.resolve(srcDir, "operator", "notificationService.ts")));
    check(
      (ntCode.match(/if \(!gateOpen\(\)\) return \{ ok: false, reason: "unavailable" \};/g) ?? [])
        .length === 4,
      "notification service: all four entries open with the fail-closed exposure gate",
      'notificationService.ts must start sendMemberNotification, broadcastNotification, listNotifications AND deleteNotification with `if (!gateOpen()) return { ok: false, reason: "unavailable" };`',
    );
    check(
      !/\b(console|res|req|logger)\s*\./.test(ntCode),
      "notification service: pure service module — no response, request, or log surface",
      "notificationService.ts must stay a pure service (no res/req/console/logger)",
    );
    check(
      /catch\s*(\([^)]*\))?\s*\{[\s\S]{0,200}?ok:\s*false/.test(ntCode),
      "notification service: any error fails closed (ok: false)",
      "notificationService.ts must return ok: false from its catch",
    );
    check(
      /memberContinuityRecord\.memberNumber,\s*input\.seat/.test(ntCode) &&
        !/input\.wallet|recipientWallet:\s*input/.test(ntCode),
      "notification service: seat→wallet resolved on the continuity spine ONLY (no client wallet input)",
      "notificationService.ts must resolve the recipient from the seat via memberContinuityRecord — a wallet must never arrive as an input",
    );
    check(
      /target:\s*`seat#\$\{input\.seat\}`/.test(ntCode) &&
        !/target:\s*wallet/.test(ntCode),
      "notification service: audit target is the seat ONLY (the wallet↔seat pairing never lands in audit)",
      "notificationService.ts audit row drifted — the notify-member audit target must be `seat#${input.seat}`, never the wallet",
    );
    check(
      /"notification\.send-member"/.test(ntCode) &&
        /"notification\.broadcast"/.test(ntCode) &&
        /auditLog/.test(ntCode),
      "notification service: every write audit-rowed (notification.send-member / notification.broadcast)",
      "notificationService.ts must write an auditLog row inside each write transaction",
    );
    check(
      /address_in_text/.test(ntCode),
      "notification service: address-bearing text refused at write time (the inbox leak scan can never trip)",
      "notificationService.ts must refuse titles/bodies containing a raw 40-hex address (reason address_in_text)",
    );
    check(
      /recipientShort/.test(ntCode) &&
        /slice\(0,\s*6\)/.test(ntCode) &&
        /slice\(-4\)/.test(ntCode),
      "notification service: the list masks recipients server-side (slice(0,6)…slice(-4))",
      "notificationService.ts must mask recipient wallets server-side in listNotifications — the full wallet never leaves the server",
    );
    // NOTIF-2: the optional icon + internal link are validated fail-closed
    // against the os-contracts single source. A non-null icon outside the
    // palette → bad_icon; a non-null link outside the EXACT-MATCH whitelist →
    // bad_link. The internal-only boundary is Set membership, never a prefix
    // test (`//evil.com` / `/\evil.com` are refused explicitly).
    check(
      /from "@workspace\/os-contracts"/.test(ntCode) &&
        /NOTIFICATION_ICON_PALETTE/.test(ntCode) &&
        /NOTIFICATION_LINK_PATHS/.test(ntCode),
      "notification service: icon palette + link whitelist imported from the os-contracts single source",
      "notificationService.ts must import NOTIFICATION_ICON_PALETTE + NOTIFICATION_LINK_PATHS from @workspace/os-contracts — the one literal server + studio + guards share",
    );
    check(
      /ICON_SET\.has\(/.test(ntCode) && /return "bad_icon"/.test(ntCode),
      "notification service: a non-null icon outside the palette is refused (bad_icon)",
      "notificationService.ts must refuse a non-null icon not in ICON_SET with reason bad_icon",
    );
    check(
      /LINK_SET\.has\(/.test(ntCode) &&
        /return "bad_link"/.test(ntCode) &&
        /startsWith\("\/\/"\)/.test(ntCode) &&
        !/startsWith\("\/"\)\s*&&/.test(ntCode),
      "notification service: a non-null link is EXACT-MATCH whitelisted; // refused (bad_link); never a startsWith('/') gate",
      "notificationService.ts must refuse a non-null link unless LINK_SET.has(link), explicitly reject the // protocol-relative form (bad_link), and NEVER admit a link by a startsWith('/') prefix test",
    );
    check(
      !/req\.body|input\.category/.test(ntCode) && /category: null/.test(ntCode),
      "notification service: v1 stores category NULL (no client-set category)",
      "notificationService.ts must store category: null on v1 sends — the v2 generator owns category; the client never sets it",
    );
    // NOTIF-2b: the founder-gated delete removes the row AND its receipts in one
    // transaction (cascade), then audit-rows the act (distinct from auto-expiry).
    check(
      /"notification\.delete"/.test(ntCode) &&
        /delete\(notificationReceipt\)/.test(ntCode) &&
        /delete\(notification\)/.test(ntCode),
      "notification service: delete cascades the receipts + audit-rows the act (notification.delete)",
      "notificationService.ts deleteNotification must delete notificationReceipt rows AND the notification in one tx, and write an auditLog row (action notification.delete)",
    );
  }

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

// ── 10. Channel zone shape (SPEC R3 — founder GO 2026-07-19) ────────────────
// The THIRD sanctioned zone, pinned to its exact approved shape: two
// ANONYMOUS fail-closed 204 beacons and NOTHING else. The zone's whole
// safety argument is what it does NOT have — sessions, cookies, reads,
// echoes, identity, logs — so this section pins the absences as hard as the
// presences.
{
  const CHANNEL_ZONE_FILES = [
    "channelStore.ts",
    "channelThrottle.ts",
    "router.ts",
    "sourceExistence.ts",
    "txVerify.ts",
  ];
  const actualChannelFiles = channelFiles
    .map((f) => path.relative(channelDir, f).split(path.sep).join("/"))
    .sort();
  check(
    JSON.stringify(actualChannelFiles) === JSON.stringify(CHANNEL_ZONE_FILES),
    `channel zone file set is exactly [${CHANNEL_ZONE_FILES.join(", ")}]`,
    `src/channel file set drifted (${actualChannelFiles.join(", ")}) — a new channel-zone file is a deliberate guard amendment, never a drive-by`,
  );

  // 10a. Mount: /api/channel, deliberately NOT behind authExposureGate (an
  // anonymous click is not an auth act; without a DATABASE_URL the store
  // drops silently), mounted BEFORE the read-only spine.
  check(
    /app\.use\("\/api\/channel",\s*channelRouter\)/.test(appCode) &&
      !/app\.use\("\/api\/channel",\s*authExposureGate/.test(appCode),
    "channel router mounted at /api/channel WITHOUT the auth exposure gate (fail-closed via DATABASE_URL absence instead)",
    'app.ts must mount app.use("/api/channel", channelRouter) — no exposure gate (the zone is anonymous by design and fail-closed via DATABASE_URL)',
  );

  const channelRouterAbs = path.resolve(channelDir, "router.ts");
  if (existsSync(channelRouterAbs)) {
    const chCode = stripComments(read(channelRouterAbs));
    // 10b. Exactly two POST routes; no GET; no lookup surface; no cookies.
    check(
      /router\.post\("\/click",/.test(chCode) &&
        /router\.post\("\/conversion",/.test(chCode) &&
        (chCode.match(/router\.(post|put|patch|delete|get)\(/g) ?? []).length === 2,
      "channel router: exactly POST /click + POST /conversion, nothing else",
      "src/channel/router.ts route set drifted — the zone is exactly the two approved beacons (POST /click, POST /conversion); anything else is a deliberate amendment",
    );
    check(
      !/req\.(query|params)\b/.test(stripStringLiterals(chCode)),
      "channel router: no req.query / req.params (no lookup surface)",
      "src/channel/router.ts reads req.query/req.params — the beacons take a validated body and nothing else",
    );
    check(
      !/cookieParser|req\.cookies|res\.cookie/.test(chCode),
      "channel router: no cookies in the zone (anonymous by design)",
      "src/channel/router.ts touches cookies — the channel zone is anonymous; a cookie would be a visitor identifier (ADR-003)",
    );
    check(
      !/sessionStore|getSessionAccount|SESSION_COOKIE_NAME/.test(chCode),
      "channel router: no session reach (anonymous by design)",
      "src/channel/router.ts reaches session material — the beacons must never resolve identity",
    );
    // 10c. Scoped tiny body parser + origin defense + throttle-first.
    check(
      /json\(\{\s*limit:\s*"1kb"\s*\}\)/.test(chCode),
      "channel router: scoped 1kb JSON parser",
      'src/channel/router.ts must mount json({ limit: "1kb" }) — scoped, tiny',
    );
    check(
      /isAllowedBrowserOrigin/.test(chCode) && /sec-fetch-site/.test(read(channelRouterAbs)),
      "channel router: browser origin + fetch-metadata defense present",
      "src/channel/router.ts must keep the dropCrossOrigin defense (origin allow-list + sec-fetch-site)",
    );
    check(
      /allowChannelClick\(throttleKey\(req\)\)/.test(chCode) &&
        /allowChannelConversion\(throttleKey\(req\)\)/.test(chCode),
      "channel router: both beacons throttle-first via the hashed client key",
      "src/channel/router.ts must throttle both beacons via allowChannelClick/allowChannelConversion(throttleKey(req)) before any work",
    );
    // 10d. 204-only: nothing is echoed, nothing exists to probe.
    check(
      /res\.status\(204\)\.end\(\)/.test(chCode) &&
        !/\.json\(/.test(chCode) &&
        !/res\.send\(/.test(chCode),
      "channel router: 204-only responses — nothing echoed, no error detail",
      "src/channel/router.ts must answer ONLY res.status(204).end() — a body/echo creates a probe surface and can leak submitted material",
    );
    // 10e. Validation + tag law + verification order.
    check(
      /safeParse\(req\.body\)/.test(chCode) &&
        /\^\[a-z0-9\]\[a-z0-9_-\]\{0,23\}\$/.test(chCode),
      "channel router: zod-validated body + the pinned channel-tag law",
      "src/channel/router.ts must zod-safeParse the body and keep the tag law ^[a-z0-9][a-z0-9_-]{0,23}$ (lowercase, short, boring — never prose)",
    );
    {
      const existsIdx = chCode.indexOf("sourceExistsCached");
      const verifyIdx = chCode.indexOf("verifyConversionOnChain");
      const recordConvIdx = chCode.indexOf("recordConversion");
      check(
        existsIdx !== -1 &&
          verifyIdx !== -1 &&
          recordConvIdx !== -1 &&
          verifyIdx < recordConvIdx,
        "channel router: conversions are receipt-verified on-chain BEFORE recording; clicks require registry existence",
        "src/channel/router.ts drifted — recordConversion may run ONLY after verifyConversionOnChain, and clicks/conversions ONLY for a registry-confirmed source",
      );
    }
    // 10f. No log surface: the zone logs nothing at all (a sourceId/tag/tx in
    // a log line would be a stored trace outside the disclosed record).
    check(
      !/req\.log|logger|console\./.test(chCode),
      "channel router: zero log surface",
      "src/channel/router.ts must not log — the disclosed record is the DB aggregate, never log lines",
    );
  }

  // 10g. Store discipline: DATABASE_URL gate before the lazy import; every
  // failure swallowed (fail closed); the per-day distinct-tag cap present;
  // conversion inserts are insert-ignore on the unique tx hash.
  const channelStoreAbs = path.resolve(channelDir, "channelStore.ts");
  if (existsSync(channelStoreAbs)) {
    const stCode = stripComments(read(channelStoreAbs));
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(stCode) &&
        /await import\(/.test(stCode) &&
        stCode.indexOf("DATABASE_URL") < stCode.indexOf("await import("),
      "channel store: DATABASE_URL gate executes BEFORE the lazy DB import",
      "src/channel/channelStore.ts must gate on DATABASE_URL presence BEFORE the lazy @workspace/db import",
    );
    check(
      /MAX_VIAS_PER_SOURCE_PER_DAY/.test(stCode),
      "channel store: per-source per-day distinct-tag cap present",
      "src/channel/channelStore.ts must keep the MAX_VIAS_PER_SOURCE_PER_DAY row-growth bound",
    );
    check(
      /onConflictDoNothing\(\)/.test(stCode),
      "channel store: conversion insert is insert-ignore on the unique tx hash",
      "src/channel/channelStore.ts conversion write must stay onConflictDoNothing — the unique tx hash is the double-count defense",
    );
    check(
      !/\b(console|res|req|logger)\s*\./.test(stCode),
      "channel store: pure service module — no response, request, or log surface",
      "src/channel/channelStore.ts must stay a pure service (no res/req/console/logger)",
    );
  }

  // 10h. Verification discipline: chain probed first; tx must have succeeded;
  // the decode runs against the pinned V3 event; the sale address comes from
  // the canon target table, never a literal.
  const txVerifyAbs = path.resolve(channelDir, "txVerify.ts");
  if (existsSync(txVerifyAbs)) {
    const tvCode = stripComments(read(txVerifyAbs));
    check(
      /probeChain/.test(tvCode) &&
        /eth_getTransactionReceipt/.test(tvCode) &&
        tvCode.indexOf("probeChain") < tvCode.indexOf("eth_getTransactionReceipt"),
      "tx verify: chain identity probed BEFORE the receipt read",
      "src/channel/txVerify.ts must probeChain before eth_getTransactionReceipt (fail closed on wrong chain)",
    );
    check(
      /status\s*!==\s*"0x1"/.test(tvCode) &&
        /MEMBERSHIP_PURCHASED_V3_DEF/.test(tvCode) &&
        /decodeSaleEventLog/.test(tvCode) &&
        /SALE_TARGETS/.test(tvCode),
      "tx verify: success-status + pinned V3 event decode + canon sale address",
      "src/channel/txVerify.ts drifted — it must require receipt status 0x1, decode against MEMBERSHIP_PURCHASED_V3_DEF, and take the sale address from SALE_TARGETS (never a literal)",
    );
  }

  // 10i. Fixture/identity parity for the whole zone: no hex literals, no
  // top-level @workspace/db anywhere, no IP APIs (the zone-wide scans in
  // sections 2/5/7 already cover storage/credentials/req.ip — these are the
  // zone-specific extras).
  for (const abs of channelFiles) {
    const rel = path.relative(srcDir, abs);
    const code = stripComments(read(abs));
    check(
      !HEX40.test(code) && !HEX64.test(code),
      `${rel}: no wallet-address / 64-hex literals`,
      `${rel} contains wallet-address or 64-hex material`,
    );
    check(
      !/^\s*import[^;]*@workspace\/db/m.test(code),
      `${rel}: no top-level @workspace/db import`,
      `${rel} imports @workspace/db at top level — DB reach must stay lazy inside channelStore.ts`,
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
