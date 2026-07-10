// Guard: access-state shell (Slice IA-1).
// The S1–S14 vocabulary, the two-field surface registry, and the fail-closed
// shell must stay honest:
//   1. the studio metadata covers exactly the 14 states, each with a valid
//      track and non-empty labels/copy;
//   2. CURRENT_ACCESS_STATE_ID stays pinned to S1 — since slice S2 it is the
//      FAIL-CLOSED DEFAULT (boot/fallback) rather than the only possible
//      value, but the constant itself must remain S1 (founder-gated);
//   3. every classified surface carries both new fields with valid values;
//   4. NO surface is GATED: frontend gating without a real, wired state
//      machine would be theater — flipping any surface to GATED must be a
//      deliberate future founder-gated change together with this guard;
//   5. the audience ↔ requiredState projection stays consistent
//      (PUBLIC→S1, MEMBER_PREVIEW→S7, OPERATOR_PREVIEW→S11);
//   6. the matrix projection is total (every state × every used requirement
//      evaluates) and fail-closed (unknown state → S1; unmodelled tier →
//      block; PREVIEW_LABELLED never blocks);
//   7. the provider and simulator hold no persistence: no localStorage /
//      sessionStorage / cookies / indexedDB — simulated state is in-memory
//      only. (S2 DELIBERATE REOPEN, founder-approved:) the provider may now
//      hold in-memory React state for the session-wired S1⇄S4 seam, but it
//      still performs no I/O itself — no fetch, no effects — and must force
//      every wired value through the fail-closed resolveWiredState;
//   8. the shared vocabulary in lib/os-contracts stays type-only and never
//      accepts a "SIMULATED" value;
//   9. no access-shell file carries wallet-address or 64-hex material — this
//      layer is vocabulary only and must never pair wallets with members.
//  10. (IA-2a) gate-mount coverage: every classified surface's route in
//      App.tsx actually renders through the gate seam — public/member
//      surfaces through PublicRoute (which mounts AccessGate), INTERNAL
//      surfaces through OperatorRoute (the hard build-time gate). The only
//      deliberate exception is the unclassified catch-all NotFound route
//      (AccessGate fails closed on unclassified paths, so wrapping it would
//      block the 404 page — documented architectural exception).
//  11. (IA-2a) import restriction: matrixAllows / evaluateAccess are the
//      access decision primitives; only the defining module, AccessGate, and
//      the operator simulator may reference them. Random components/routes
//      importing them directly would create parallel gating logic.
//  12. (IA-2a) no browser-storage auth anywhere in studio src: localStorage /
//      sessionStorage are allowed only for the theme preference
//      (ThemeProvider) — no file may ever persist auth/session material.
//  13. (S2) wire ceiling: WIRABLE_ACCESS_STATES is exactly ["S1","S4"] and
//      resolveWiredState collapses every other input to S1 — the anonymous
//      SIWE session can never wire a member/privileged state;
//  14. (S2) wire-seam allowlist: useWireAccessState is referenced only by the
//      provider itself and the build-time-gated src/wallet/ module;
//  15. (S2) wallet module hard gate: no static import of "@/wallet/..."
//      anywhere; App.tsx / MemberAccess.tsx reach it only through the
//      WALLET_SESSION_PREVIEW_ENABLED-conditional dynamic import; the gate
//      constant folds statically and vite.config.ts wires the define — so a
//      default production build excludes the wallet code entirely;
//  16. (S2) the wallet panel carries the founder-required verbatim honesty
//      copy (SESSION line, session ≠ membership, member continuity not
//      wired, Holder Index not served);
//  17. (S2) wallet module boundary: it talks ONLY to literal "/api/auth/..."
//      URLs, contains no member-lookup material, and holds no persistence.
//
// Scans are comment-stripped so documentation may name the primitives it
// forbids without self-matching. Node-loadable (Node >= 22.6 / 24).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  ACCESS_STATE_IDS,
  CURRENT_ACCESS_STATE_ID,
  WIRABLE_ACCESS_STATES,
  accessStates,
  evaluateAccess,
  matrixAllows,
  resolveAccessState,
  resolveWiredState,
} from "../src/config/accessState.ts";
import { surfaceClassification } from "../src/config/surfaceClassification.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const repoRoot = path.resolve(here, "..", "..", "..");

function read(abs: string): string {
  return readFileSync(abs, "utf8");
}

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

// ── 1. Fourteen states, valid tracks, complete metadata ─────────────────────
const EXPECTED_IDS = [
  "S1", "S2", "S3", "S4", "S5", "S6", "S7",
  "S8", "S9", "S10", "S11", "S12", "S13", "S14",
];
check(
  ACCESS_STATE_IDS.length === 14 &&
    EXPECTED_IDS.every((id, i) => ACCESS_STATE_IDS[i] === id),
  "accessStates covers exactly S1–S14 in order",
  `accessStates must cover exactly S1–S14 (found: ${ACCESS_STATE_IDS.join(", ")})`,
);
const VALID_TRACKS = new Set(["USER", "PRIVILEGED", "MACHINE"]);
for (const id of ACCESS_STATE_IDS) {
  const m = accessStates[id];
  check(
    Boolean(m) &&
      VALID_TRACKS.has(m.track) &&
      m.name.length > 0 &&
      m.chipLabel.startsWith(`${id} ·`) &&
      m.honestNote.length > 0,
    `${id}: complete metadata (track ${m?.track})`,
    `${id}: metadata incomplete or invalid (need name, valid track, "${id} ·"-prefixed chipLabel, honestNote)`,
  );
}
check(
  accessStates.S14.track === "MACHINE" &&
    accessStates.S11.track === "PRIVILEGED" &&
    accessStates.S12.track === "PRIVILEGED" &&
    accessStates.S13.track === "PRIVILEGED",
  "track split matches the design doc (§1): S11–S13 PRIVILEGED, S14 MACHINE",
  "track assignments drifted from the design doc (§1): S11–S13 must be PRIVILEGED, S14 MACHINE",
);

// ── 2. The fail-closed default stays S1 ─────────────────────────────────────
// Since S2 the app-wide state may be session-wired to S4 at runtime (dev
// preview only), but the boot/default/fallback constant must remain S1 — in
// production builds (wallet module code-excluded) it is the only value.
check(
  CURRENT_ACCESS_STATE_ID === "S1",
  "CURRENT_ACCESS_STATE_ID is pinned to S1 (fail-closed default)",
  "CURRENT_ACCESS_STATE_ID must stay S1 — it is the fail-closed boot default; changing it is a founder-gated act",
);

// ── 3 + 4 + 5. Two-field registry: valid, ungated, audience-consistent ──────
const VALID_ENFORCEMENT = new Set(["PREVIEW_LABELLED", "GATED"]);
const audienceRequired: Record<string, string> = {
  PUBLIC: "S1",
  MEMBER_PREVIEW: "S7",
  OPERATOR_PREVIEW: "S11",
};
let gatedCount = 0;
for (const s of surfaceClassification) {
  check(
    (EXPECTED_IDS as string[]).includes(s.requiredState) &&
      VALID_ENFORCEMENT.has(s.enforcement),
    `${s.routePath}: classified (requiredState ${s.requiredState}, ${s.enforcement})`,
    `${s.routePath}: requiredState/enforcement missing or invalid`,
  );
  if (s.enforcement === "GATED") gatedCount++;
  check(
    s.requiredState === audienceRequired[s.audience],
    `${s.routePath}: requiredState matches audience ${s.audience}`,
    `${s.routePath}: audience ${s.audience} must map to requiredState ${audienceRequired[s.audience]}, found ${s.requiredState}`,
  );
}
check(
  gatedCount === 0,
  "no surface is GATED (no wired state machine exists)",
  `${gatedCount} surface(s) are GATED — forbidden until a real, wired, founder-approved state machine exists; update this guard deliberately in that slice`,
);

// ── 6. Matrix projection is total and fail-closed ───────────────────────────
const usedRequirements = [...new Set(surfaceClassification.map((s) => s.requiredState))];
let matrixTotal = true;
for (const st of ACCESS_STATE_IDS) {
  for (const req of usedRequirements) {
    if (typeof matrixAllows(st, req) !== "boolean") matrixTotal = false;
  }
}
check(
  matrixTotal,
  `matrix projection is total (14 states × ${usedRequirements.length} used requirements)`,
  "matrixAllows failed to evaluate some state × requirement pair",
);
check(
  resolveAccessState("NOT_A_STATE") === "S1" &&
    resolveAccessState(undefined) === "S1",
  "unknown state resolves to S1 (fail closed)",
  "resolveAccessState must resolve unknown values to S1",
);
check(
  evaluateAccess("S1", "S11", "GATED").allowed === false &&
    evaluateAccess("S1", "S7", "GATED").allowed === false,
  "a GATED surface above S1 blocks (fail closed)",
  "evaluateAccess must block a GATED surface whose requirement exceeds the current state",
);
check(
  surfaceClassification.every(
    (s) => evaluateAccess("S1", s.requiredState, s.enforcement).allowed,
  ),
  "every current surface renders for S1 (all PREVIEW_LABELLED — behavior preserved)",
  "a PREVIEW_LABELLED surface blocked for S1 — IA-1 must not change current rendering",
);
check(
  matrixAllows("S14", "S1") === false && matrixAllows("S13", "S7") === false,
  "matrix spot checks match the design doc §3 (S14 has no public FE; S13 not in member cockpit)",
  "matrix drifted from the design doc §3 rows",
);

// ── 7. No persistence in the access shell ────────────────────────────────────
const shellFiles = [
  "components/access/AccessStateProvider.tsx",
  "components/access/AccessGate.tsx",
  "components/access/AccessStateChip.tsx",
  "operator/AccessStateSimulator.tsx",
  "config/accessState.ts",
];
const PERSISTENCE = ["localStorage", "sessionStorage", "document.cookie", "indexedDB"];
for (const rel of shellFiles) {
  const code = stripComments(read(path.resolve(srcDir, rel)));
  for (const banned of PERSISTENCE) {
    check(
      !code.includes(banned),
      `${rel}: no ${banned}`,
      `${rel} uses ${banned} — the access shell must hold no persistence (in-memory only)`,
    );
  }
}
const providerCode = stripComments(
  read(path.resolve(srcDir, "components/access/AccessStateProvider.tsx")),
);
// S2 deliberate reopen: the provider may hold in-memory React state for the
// session wire seam (useState), but it performs NO I/O itself — session
// resolution lives in the gated wallet module.
for (const banned of ["useEffect", "fetch(", "XMLHttpRequest", "WebSocket"]) {
  check(
    !providerCode.includes(banned),
    `provider performs no I/O: no ${banned}`,
    `AccessStateProvider must perform no I/O itself — found \`${banned}\` (session resolution belongs to the gated wallet module)`,
  );
}
check(
  providerCode.includes("useState") &&
    providerCode.includes("CURRENT_ACCESS_STATE_ID"),
  "provider boots from the fail-closed default (useState(CURRENT_ACCESS_STATE_ID))",
  "AccessStateProvider must initialize its in-memory state from CURRENT_ACCESS_STATE_ID (fail-closed default)",
);
check(
  providerCode.includes("resolveWiredState"),
  "provider forces every wired value through resolveWiredState (fail closed)",
  "AccessStateProvider must pass every wired value through resolveWiredState — the wire seam may never set a raw value",
);
const simulatorCode = stripComments(
  read(path.resolve(srcDir, "operator/AccessStateSimulator.tsx")),
);
check(
  simulatorCode.includes("useState"),
  "simulator state is in-memory React state",
  "AccessStateSimulator must keep its simulated state in React useState (in-memory only)",
);
check(
  !simulatorCode.includes("AccessStateProvider"),
  "simulator never touches the app-wide provider",
  "AccessStateSimulator must not import or wrap the app-wide AccessStateProvider — simulation stays self-contained",
);

// ── 8. Shared vocabulary stays type-only, no SIMULATED value ─────────────────
const contractsSrc = stripComments(
  read(path.resolve(repoRoot, "lib", "os-contracts", "src", "access-state.ts")),
);
check(
  !/export\s+(const|function|class|let|var)\b/.test(contractsSrc),
  "lib/os-contracts access-state.ts is type-only (no runtime exports)",
  "lib/os-contracts/src/access-state.ts must stay type-only",
);
check(
  !/"SIMULATED[^"]*"\s*(\||;|$)/m.test(contractsSrc),
  'no "SIMULATED" accepted value in the shared vocabulary',
  'lib/os-contracts access-state.ts must never accept a "SIMULATED" value — simulator warning copy is UI copy only',
);

// ── 9. No wallet/hex material in the access shell ────────────────────────────
const HEX40 = /0x[0-9a-fA-F]{40}\b/;
const HEX64 = /\b[0-9a-fA-F]{64}\b/;
for (const rel of shellFiles) {
  const code = stripComments(read(path.resolve(srcDir, rel)));
  check(
    !HEX40.test(code) && !HEX64.test(code),
    `${rel}: no wallet-address / 64-hex material`,
    `${rel} contains wallet-address or 64-hex material — the access shell is vocabulary only`,
  );
}

// ── 10. Gate-mount coverage (IA-2a) ──────────────────────────────────────────
const appSrc = read(path.resolve(srcDir, "App.tsx"));
const appCode = stripComments(appSrc);

check(
  /function PublicRoute[\s\S]*?<AccessGate routePath=\{path\}>/.test(appCode),
  "PublicRoute helper mounts AccessGate with the route path",
  "PublicRoute in App.tsx no longer mounts <AccessGate routePath={path}> — the gate seam is broken",
);

const publicRoutePaths = new Set(
  [...appCode.matchAll(/<PublicRoute path="([^"]+)"/g)].map((m) => m[1]),
);
const operatorRoutePaths = new Set(
  [...appCode.matchAll(/<Route path="([^"]+)">\s*<OperatorRoute\b/g)].map(
    (m) => m[1],
  ),
);
const bareRoutePaths = new Set(
  [...appCode.matchAll(/<Route path="([^"]+)">/g)].map((m) => m[1]),
);

for (const s of surfaceClassification) {
  if (s.layout === "public") {
    check(
      publicRoutePaths.has(s.routePath),
      `${s.routePath}: gate-mounted via PublicRoute (AccessGate)`,
      `${s.routePath} is a classified public/member surface but is not mounted via <PublicRoute> in App.tsx — it bypasses AccessGate`,
    );
  } else {
    check(
      operatorRoutePaths.has(s.routePath),
      `${s.routePath}: mounted via OperatorRoute (hard build-time gate)`,
      `${s.routePath} is a classified INTERNAL surface but is not mounted via <Route><OperatorRoute> in App.tsx — it bypasses the operator hard gate`,
    );
  }
}

const classifiedPaths = new Set(surfaceClassification.map((s) => s.routePath));
for (const p of publicRoutePaths) {
  check(
    classifiedPaths.has(p),
    `PublicRoute ${p} is classified in the surface registry`,
    `PublicRoute ${p} has no entry in surfaceClassification — AccessGate would fail closed on it; classify the surface (deliberately) or remove the route`,
  );
}
for (const p of operatorRoutePaths) {
  check(
    classifiedPaths.has(p),
    `OperatorRoute ${p} is classified in the surface registry`,
    `OperatorRoute ${p} has no entry in surfaceClassification — classify the INTERNAL surface (deliberately) or remove the route`,
  );
}
const ungatedClassified = [...bareRoutePaths].filter(
  (p) => classifiedPaths.has(p) && !operatorRoutePaths.has(p),
);
check(
  ungatedClassified.length === 0,
  "no classified route is mounted as a bare <Route> (all pass a gate seam)",
  `classified route(s) mounted as bare <Route> without a gate: ${ungatedClassified.join(", ")}`,
);
check(
  /<Route>\s*<PublicLayout>\s*<NotFound \/>/.test(appCode),
  "catch-all NotFound stays the single ungated exception (unclassified 404)",
  "the catch-all NotFound route changed shape — it must remain the bare, unclassified catch-all (or this guard must be deliberately updated)",
);

// ── 11 + 12. Studio-wide walks: import restriction + no browser-storage auth ─
function walkSrc(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) {
      if (entry === "node_modules") continue;
      walkSrc(abs, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(abs);
    }
  }
  return out;
}
const allSrcFiles = walkSrc(srcDir);

const MATRIX_ALLOWED = new Set([
  "config/accessState.ts",
  "components/access/AccessGate.tsx",
  "operator/AccessStateSimulator.tsx",
]);
const matrixViolations: string[] = [];
for (const abs of allSrcFiles) {
  // Normalize to POSIX separators so the allowlist matches on Windows too
  // (path.relative yields "\" on win32; the allowlist uses "/").
  const rel = path.relative(srcDir, abs).split(path.sep).join("/");
  if (MATRIX_ALLOWED.has(rel)) continue;
  const code = stripComments(read(abs));
  if (/\bmatrixAllows\b/.test(code) || /\bevaluateAccess\b/.test(code)) {
    matrixViolations.push(rel);
  }
}
check(
  matrixViolations.length === 0,
  `matrixAllows/evaluateAccess referenced only by the access shell allowlist (${MATRIX_ALLOWED.size} files)`,
  `matrixAllows/evaluateAccess referenced outside the access shell allowlist: ${matrixViolations.join(", ")} — parallel gating logic is forbidden`,
);

const STORAGE_ALLOWED = new Set(["components/ThemeProvider.tsx"]);
const storageViolations: string[] = [];
for (const abs of allSrcFiles) {
  // Normalize to POSIX separators so the allowlist matches on Windows too.
  const rel = path.relative(srcDir, abs).split(path.sep).join("/");
  if (STORAGE_ALLOWED.has(rel)) continue;
  const code = stripComments(read(abs));
  if (/\b(localStorage|sessionStorage)\b/.test(code)) {
    storageViolations.push(rel);
  }
}
check(
  storageViolations.length === 0,
  "no browser storage outside ThemeProvider (no client-side auth persistence)",
  `browser storage used outside the ThemeProvider allowlist: ${storageViolations.join(", ")} — auth/session material must never live in localStorage/sessionStorage`,
);

// ── 13. (S2) Wire ceiling: only S1/S4 can ever be wired app-wide ─────────────
check(
  WIRABLE_ACCESS_STATES.length === 2 &&
    WIRABLE_ACCESS_STATES[0] === "S1" &&
    WIRABLE_ACCESS_STATES[1] === "S4",
  'WIRABLE_ACCESS_STATES is exactly ["S1", "S4"] (session wire ceiling)',
  'WIRABLE_ACCESS_STATES must stay exactly ["S1", "S4"] — S7+/S11+ have no wired source; widening it is a founder-gated act paired with a real source',
);
check(
  resolveWiredState("S4") === "S4" &&
    resolveWiredState("S1") === "S1" &&
    resolveWiredState("S7") === "S1" &&
    resolveWiredState("S11") === "S1" &&
    resolveWiredState("S14") === "S1" &&
    resolveWiredState(undefined) === "S1" &&
    resolveWiredState(null) === "S1" &&
    resolveWiredState("SIMULATED") === "S1",
  'resolveWiredState fails closed (everything except exactly "S4" → S1)',
  'resolveWiredState must collapse every non-"S4" input to S1 (fail closed)',
);

// ── 14. (S2) Wire-seam import allowlist ──────────────────────────────────────
const PROVIDER_REL = path.join("components", "access", "AccessStateProvider.tsx");
const WALLET_PREFIX = "wallet" + path.sep;
const wireViolations: string[] = [];
for (const abs of allSrcFiles) {
  const rel = path.relative(srcDir, abs);
  if (rel === PROVIDER_REL || rel.startsWith(WALLET_PREFIX)) continue;
  const code = stripComments(read(abs));
  if (/\buseWireAccessState\b/.test(code)) wireViolations.push(rel);
}
check(
  wireViolations.length === 0,
  "useWireAccessState referenced only by the provider and src/wallet/",
  `useWireAccessState referenced outside the wallet module: ${wireViolations.join(", ")} — the wire seam has exactly one caller zone`,
);

// ── 15. (S2) Wallet layer boundary (root providers, Phase 1 revision) ────────
// Phase 1 (RainbowKit adoption, founder-approved) REVISED this rule: the
// wallet layer now ships in EVERY build because wagmi + RainbowKit are ROOT
// providers wired in App.tsx. The old invariant ("wallet code is excludable
// from prod via dynamic import") is retired; what replaces it is a STRICTER
// boundary:
//   • App.tsx is the ONLY file allowed to statically reach @/wallet/ — and
//     only for the pinned provider pair from wallet/RainbowKitRoot.tsx.
//   • Every other file keeps the full static-import ban; the boot/panel
//     seams stay flag-gated dynamic imports (checked below, unchanged).
//   • The provider chain order is pinned: WalletWagmiProvider (wagmi) OUTSIDE
//     the query client, WalletAuthProvider (RainbowKit auth) INSIDE it.
//   • RainbowKitRoot must bind adapter={rainbowAuthAdapter}, a derived
//     status, and config={wagmiConfig} — session truth stays with /api/auth.
//   • The WalletConnect projectId env var is referenced ONLY inside wallet/.
const WALLET_SPECIFIER = String.raw`"(?:@\/wallet\/|\.[^"]*\/wallet\/)`;
const staticWalletImports = [
  new RegExp(String.raw`import\s+(?!type\b)[^;]*from\s+${WALLET_SPECIFIER}`),
  new RegExp(String.raw`export\s+(?!type\b)[^;]*from\s+${WALLET_SPECIFIER}`),
  new RegExp(String.raw`import\s+${WALLET_SPECIFIER}`),
];
const WALLET_STATIC_ALLOWLIST = new Set(["App.tsx"]);
for (const abs of allSrcFiles) {
  const rel = path.relative(srcDir, abs);
  if (rel.startsWith(WALLET_PREFIX) || WALLET_STATIC_ALLOWLIST.has(rel)) continue;
  const code = stripComments(read(abs));
  check(
    !staticWalletImports.some((re) => re.test(code)),
    `${rel}: no static import/re-export of the wallet module`,
    `${rel} statically imports or re-exports the wallet module — only App.tsx (root providers) may reach @/wallet/ statically`,
  );
}
// App.tsx may statically import ONLY the RainbowKitRoot providers from wallet/.
const appWalletImports = appCode.match(
  new RegExp(String.raw`import\s+(?!type\b)[^;]*from\s+"@\/wallet\/[^"]*"`, "g"),
) ?? [];
check(
  appWalletImports.length === 1 &&
    /import\s*\{\s*WalletWagmiProvider\s*,\s*WalletAuthProvider\s*\}\s*from\s*"@\/wallet\/RainbowKitRoot"/.test(
      appWalletImports[0],
    ),
  "App.tsx statically imports ONLY { WalletWagmiProvider, WalletAuthProvider } from RainbowKitRoot",
  'App.tsx must have exactly one static wallet import: `import { WalletWagmiProvider, WalletAuthProvider } from "@/wallet/RainbowKitRoot"`',
);
// Provider chain order pinned: wagmi OUTSIDE the query client, RainbowKit
// auth INSIDE it (wagmi v2 requires TanStack Query below it).
const wagmiOpenIdx = appCode.indexOf("<WalletWagmiProvider>");
const queryOpenIdx = appCode.indexOf("<QueryClientProvider");
const authOpenIdx = appCode.indexOf("<WalletAuthProvider>");
check(
  wagmiOpenIdx !== -1 &&
    queryOpenIdx !== -1 &&
    authOpenIdx !== -1 &&
    wagmiOpenIdx < queryOpenIdx &&
    queryOpenIdx < authOpenIdx,
  "App.tsx pins the provider chain: WagmiProvider → QueryClientProvider → RainbowKit auth",
  "App.tsx must nest <WalletWagmiProvider> → <QueryClientProvider> → <WalletAuthProvider> in that order",
);
// RainbowKitRoot invariants: pinned adapter, derived status, pinned config,
// and a fail-closed session read (fetchSessionState, S4 = authenticated).
const rkRootCode = stripComments(
  read(path.resolve(srcDir, "wallet/RainbowKitRoot.tsx")),
);
check(
  /adapter=\{rainbowAuthAdapter\}/.test(rkRootCode) &&
    /status=\{status\}/.test(rkRootCode),
  "RainbowKitRoot binds adapter={rainbowAuthAdapter} + derived status",
  "RainbowKitRoot.tsx must bind `adapter={rainbowAuthAdapter}` and `status={status}` on RainbowKitAuthenticationProvider",
);
check(
  /config=\{wagmiConfig\}/.test(rkRootCode),
  "RainbowKitRoot binds config={wagmiConfig} on WagmiProvider",
  "RainbowKitRoot.tsx must bind `config={wagmiConfig}` on WagmiProvider",
);
check(
  /queryFn:\s*fetchSessionState/.test(rkRootCode) &&
    /data\s*===\s*"S4"\s*\?\s*"authenticated"/.test(rkRootCode),
  "RainbowKitRoot derives status from fetchSessionState (S4 = authenticated, fail-closed)",
  "RainbowKitRoot.tsx must derive auth status from fetchSessionState with S4 → authenticated (session truth stays with /api/auth/session)",
);
// WalletConnect projectId env reference stays inside the wallet module.
for (const abs of allSrcFiles) {
  const rel = path.relative(srcDir, abs);
  if (rel.startsWith(WALLET_PREFIX)) continue;
  const code = stripComments(read(abs));
  check(
    !code.includes("VITE_WALLETCONNECT_PROJECT_ID"),
    `${rel}: no WalletConnect projectId reference`,
    `${rel} references VITE_WALLETCONNECT_PROJECT_ID — the projectId is read only inside src/wallet/`,
  );
}
check(
  /WALLET_SESSION_PREVIEW_ENABLED\s*\?\s*lazy\(\(\) => import\("@\/wallet\/WalletSessionBoot"\)\)\s*:\s*null/.test(
    appCode,
  ),
  "App.tsx loads WalletSessionBoot only via the gated conditional dynamic import",
  'App.tsx must load WalletSessionBoot via `WALLET_SESSION_PREVIEW_ENABLED ? lazy(() => import("@/wallet/WalletSessionBoot")) : null`',
);
const memberAccessCode = stripComments(
  read(path.resolve(srcDir, "pages/MemberAccess.tsx")),
);
check(
  /WALLET_SESSION_PREVIEW_ENABLED\s*\?\s*lazy\(\(\) => import\("@\/wallet\/WalletSessionPanel"\)\)\s*:\s*null/.test(
    memberAccessCode,
  ),
  "MemberAccess.tsx loads WalletSessionPanel only via the gated conditional dynamic import",
  'MemberAccess.tsx must load WalletSessionPanel via `WALLET_SESSION_PREVIEW_ENABLED ? lazy(() => import("@/wallet/WalletSessionPanel")) : null`',
);
// Phase 3 slice 2 — AdminShell's wallet reach is pinned to exactly the two
// flag-conditional lazy loads (operator badge + sign-in action). Any other
// wallet import shape in the admin shell must fail here, not just at rule 15.
const adminShellCode = stripComments(
  read(path.resolve(srcDir, "components/admin/AdminShell.tsx")),
);
check(
  /WALLET_SESSION_PREVIEW_ENABLED\s*\?\s*React\.lazy\(\(\) => import\("@\/wallet\/OperatorBadge"\)\)\s*:\s*null/.test(
    adminShellCode,
  ),
  "AdminShell.tsx loads OperatorBadge only via the gated conditional dynamic import",
  'AdminShell.tsx must load OperatorBadge via `WALLET_SESSION_PREVIEW_ENABLED ? React.lazy(() => import("@/wallet/OperatorBadge")) : null`',
);
check(
  /WALLET_SESSION_PREVIEW_ENABLED\s*\?\s*React\.lazy\(\(\) => import\("@\/wallet\/OperatorSignInAction"\)\)\s*:\s*null/.test(
    adminShellCode,
  ),
  "AdminShell.tsx loads OperatorSignInAction only via the gated conditional dynamic import",
  'AdminShell.tsx must load OperatorSignInAction via `WALLET_SESSION_PREVIEW_ENABLED ? React.lazy(() => import("@/wallet/OperatorSignInAction")) : null`',
);
check(
  /await import\("@\/wallet\/walletSession"\)/.test(adminShellCode),
  "AdminShell.tsx signs out via the dynamic walletSession import",
  'AdminShell.tsx must reach logoutSession via `await import("@/wallet/walletSession")` (dynamic, never static)',
);
check(
  (adminShellCode.match(/@\/wallet\//g) ?? []).length === 3,
  "AdminShell.tsx reaches @/wallet/ exactly 3 times (badge + sign-in action + sign-out)",
  "AdminShell.tsx must reference @/wallet/ exactly 3 times — the OperatorBadge/OperatorSignInAction gated lazy imports and the dynamic walletSession sign-out; remove any extra wallet reach",
);
const walletGate = stripComments(
  read(path.resolve(srcDir, "config/walletSessionGate.ts")),
);
// Public Online Integration MVP (founder-approved, July 2026): the wallet
// session shell is PUBLIC. The gate constant must fold to a literal `true`
// (statically, no env/runtime signal) so the module ships in every build and
// the auth-zone dist-grep can REQUIRE its strings in production dists.
check(
  /WALLET_SESSION_PREVIEW_ENABLED\s*:\s*boolean\s*=\s*true/.test(walletGate),
  "wallet gate = literal `true` (public module, statically folds)",
  "walletSessionGate.ts must set `WALLET_SESSION_PREVIEW_ENABLED: boolean = true` (public wallet session)",
);
for (const banned of [
  "window",
  "location",
  "hostname",
  "fetch(",
  "Date.now",
  "localStorage",
]) {
  check(
    !walletGate.includes(banned),
    `wallet gate has no runtime signal: ${banned}`,
    `walletSessionGate.ts must not use runtime signal \`${banned}\` — the gate must fold at build time`,
  );
}
const viteCfgCode = stripComments(
  read(path.resolve(here, "..", "vite.config.ts")),
);
check(
  !/__WALLET_SESSION_PREVIEW__/.test(viteCfgCode),
  "vite.config.ts no longer defines the retired __WALLET_SESSION_PREVIEW__ flag",
  "vite.config.ts must NOT define __WALLET_SESSION_PREVIEW__ — the build flag was retired when the wallet session went public",
);

// ── 16. (S2) Verbatim honesty copy in the wallet panel ───────────────────────
const walletPanelRaw = read(path.resolve(srcDir, "wallet/WalletSessionPanel.tsx"));
for (const phrase of [
  "SESSION:",
  "(signed)",
  "session ≠ membership",
  "proves control of a wallet",
  "self-readback",
]) {
  check(
    walletPanelRaw.includes(phrase),
    `wallet panel carries verbatim honesty copy: "${phrase}"`,
    `WalletSessionPanel.tsx must carry the verbatim honesty copy "${phrase}" (founder-required)`,
  );
}

// ── 17. (S2) Wallet module boundary: /api/auth only, no member lookup ────────
const walletDirAbs = path.resolve(srcDir, "wallet");
const walletFiles = allSrcFiles.filter((abs) =>
  abs.startsWith(walletDirAbs + path.sep),
);
check(
  walletFiles.length > 0,
  `wallet module present (${walletFiles.length} file(s))`,
  "src/wallet/ is missing — the S2 wallet session shell should exist behind the gate",
);
// Founder-approved exception (Public Online Integration MVP): the panel may
// describe the SELF-readback — the active engine's own memberNumberOf figure
// for the signed wallet, fetched only via /api/auth (the fetch check below
// enforces the transport boundary). Directory/lookup material of OTHER
// wallets stays banned.
const MEMBER_LOOKUP_TOKENS = [
  "member_continuity",
  "holderIndex",
  "/api/protocol",
  "/api/source-status",
  "/api/member",
  "/api/holder",
];
for (const abs of walletFiles) {
  const rel = path.relative(srcDir, abs);
  const code = stripComments(read(abs));
  for (const banned of MEMBER_LOOKUP_TOKENS) {
    check(
      !code.includes(banned),
      `${rel}: no member-lookup material (${banned})`,
      `${rel} contains "${banned}" — the wallet module must never pair a session with member data`,
    );
  }
  for (const banned of PERSISTENCE) {
    check(
      !code.includes(banned),
      `${rel}: no ${banned}`,
      `${rel} uses ${banned} — session material lives in memory + the HttpOnly cookie only`,
    );
  }
  const fetchCount = (code.match(/\bfetch\(/g) ?? []).length;
  const authFetchCount = (code.match(/\bfetch\("\/api\/auth\//g) ?? []).length;
  check(
    fetchCount === authFetchCount,
    `${rel}: every fetch targets a literal /api/auth/ URL (${fetchCount})`,
    `${rel} contains a fetch that does not target a literal "/api/auth/..." URL — the wallet module talks to the auth zone only`,
  );
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nguard-access-state: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nguard-access-state: all ${ok.length} checks passed.`);
