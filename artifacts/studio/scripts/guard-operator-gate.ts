// Guard: the NEUTRAL WALL (/admin-in-prod, Ruling ② — supersedes the old
// "console excluded from the bundle" model on 2026-07-17).
// The console SHIPS in production as a SEPARATE lazy chunk, and the reveal is
// SERVER-CONFIRMED ROLE ONLY: a non-operator at a bare INTERNAL URL gets the
// exact catch-all 404 composition, zero admin vocabulary, and the console
// chunk is never requested. This guard proves the structure that keeps the
// public-sees-admin-never class dead:
//   1. every INTERNAL registry path is routed through <OperatorRoute> in App.tsx;
//   2. App.tsx has NO static (runtime) import of the console module, Shell, or
//      any console page — only the type-only import and the UNCONDITIONAL lazy
//      dynamic import (the separate-chunk seam), and OperatorRoute implements
//      the wall: fail-closed reveal state seeded from OPERATOR_PREVIEW_ENABLED
//      (dev-only bypass — folds false in prod), server operator-context read,
//      SESSION_CHANGED_EVENT re-read, and the <NotFound /> wall branch;
//   3. the dev-bypass constant folds statically: it references
//      import.meta.env.DEV and __OPERATOR_PREVIEW__ only, and uses no runtime
//      signals (location/hostname/fetch/clock);
//   4. vite.config.ts defines __OPERATOR_PREVIEW__ from VITE_OPERATOR_PREVIEW;
//   5. OperatorConsole.tsx is the ONLY static importer of Shell and the console
//      pages anywhere in src/ (so admin code stays in the console chunk);
//   6. no public-chrome file renders a literal link to an INTERNAL path (the
//      /studio teaser lives in syndicateFacts.ts config and is the intended,
//      documented exception — it renders the 404 wall when not revealed);
//   7. dist-grep probe strings stay meaningful: the OS-map banner copy exists
//      only in gated modules (in dist it may appear ONLY in the console chunk,
//      never the entry bundle), and the RETIRED fallback copy ("Internal
//      preview is not enabled…") exists NOWHERE — that page admitted an
//      internal surface at the bare URL, the exact wall violation;
//   8. the /os-map live proof binding stays operator-gated and fail-closed:
//      the adapter/panel modules are importable only from the gated graph,
//      the adapter is pure (no fetch/state/clock) and consumes only the
//      existing generated client types, its classification map reconciles
//      exactly with the protocolOsMap node ids, the payload's archive group
//      stays deliberately unbound (founder-deferred), and the unavailable
//      probe string is verbatim-unique to the panel for dist-grep proof.
//
// Scans are comment-stripped so documentation may name the primitives it
// forbids without self-matching. Node-loadable (Node >= 22.6 / 24).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { seoRouteRegistry } from "../src/lib/seo-route-registry.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

function read(rel: string): string {
  return readFileSync(path.resolve(srcDir, rel), "utf8");
}

/** Strip /* *\/ and // comments (and JSX {/* *\/} bodies) before scanning. */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const appRaw = read("App.tsx");
const app = stripComments(appRaw);
const gate = stripComments(read("config/operatorPreviewGate.ts"));
const consoleModRaw = read("operator/OperatorConsole.tsx");
const consoleMod = stripComments(consoleModRaw);
const viteCfg = stripComments(
  readFileSync(path.resolve(here, "..", "vite.config.ts"), "utf8"),
);

// ── 1. Every INTERNAL registry path is gated in App.tsx ─────────────────────
const internalPaths = seoRouteRegistry
  .filter((r) => r.routeType === "INTERNAL" && r.path !== "*")
  .map((r) => r.path);

check(
  internalPaths.length === 16,
  `registry declares 16 INTERNAL routes (${internalPaths.join(", ")})`,
  `expected exactly 16 INTERNAL registry routes (6 console + 10 admin sections; /admin/seasons joined at S2-final 2026-07-24), found ${internalPaths.length} — update this guard deliberately if that changed`,
);

// The nine sectioned admin sub-routes (Phase 2 slice 1) must ALL be present
// as INTERNAL registry routes — removing one silently would un-gate it.
const ADMIN_SECTION_PATHS = [
  "/admin/members",
  "/admin/sources",
  "/admin/seasons",
  "/admin/operators",
  "/admin/content",
  "/admin/modules",
  "/admin/broadcast",
  "/admin/audit",
  "/admin/support",
  "/admin/settings",
];
for (const p of ADMIN_SECTION_PATHS) {
  check(
    internalPaths.includes(p),
    `registry declares admin section ${p} as INTERNAL`,
    `admin section ${p} is missing from the INTERNAL registry routes — every mounted /admin/* section must be registered INTERNAL`,
  );
}

for (const p of internalPaths) {
  const pattern = new RegExp(
    `<Route path="${p}">\\s*<OperatorRoute page="[a-z0-9-]+" />\\s*</Route>`,
  );
  check(
    pattern.test(app),
    `App.tsx routes ${p} through <OperatorRoute>`,
    `App.tsx must route INTERNAL path ${p} through <OperatorRoute> (gated), not directly`,
  );
}

// ── 2. App.tsx: no static runtime import of console modules ─────────────────
const staticConsoleImport =
  /import\s+(?!type\b)[^;]*from\s+"@\/(components\/layout\/Shell|pages\/(OperatorOverview|ProofStudio|OperatorPreview|OsMap)|operator\/OperatorConsole)"/;
check(
  !staticConsoleImport.test(app),
  "App.tsx has no static runtime import of Shell/console pages/OperatorConsole",
  "App.tsx statically imports a console module — that defeats the build-time exclusion",
);
check(
  /import type \{ OperatorConsolePage \} from "@\/operator\/OperatorConsole"/.test(
    app,
  ),
  "App.tsx uses a type-only import for OperatorConsolePage",
  "App.tsx should import OperatorConsolePage as `import type` only",
);
check(
  /const OperatorConsole = lazy\(\(\) => import\("@\/operator\/OperatorConsole"\)\)/.test(
    app,
  ),
  "App.tsx loads OperatorConsole via the unconditional lazy dynamic import (separate chunk)",
  "App.tsx must load OperatorConsole via `const OperatorConsole = lazy(() => import(...))` — the separate-chunk seam",
);

// ── 2b. The NEUTRAL WALL shape in OperatorRoute (Ruling ②) ──────────────────
// Fail-closed reveal: seeded from the dev-only bypass (folds false in prod),
// resolved ONLY by the server's operator-context, re-read on session change,
// and the non-revealed branch renders the EXACT catch-all 404 composition.
const operatorRouteBlock = app.match(
  /function OperatorRoute\(\{ page \}: \{ page: OperatorConsolePage \}\) \{[\s\S]*?\n\}/,
)?.[0];
check(
  operatorRouteBlock !== undefined,
  "App.tsx declares the OperatorRoute wall component",
  "App.tsx must declare `function OperatorRoute({ page }: { page: OperatorConsolePage })` — the neutral wall lives there",
);
if (operatorRouteBlock) {
  check(
    /useState\(OPERATOR_PREVIEW_ENABLED\)/.test(operatorRouteBlock),
    "wall reveal state is fail-closed (seeded from the statically-folding dev bypass)",
    "OperatorRoute must seed its reveal state as `useState(OPERATOR_PREVIEW_ENABLED)` — fail-closed false in prod",
  );
  check(
    /fetchOperatorContext\(\)/.test(operatorRouteBlock) &&
      /ctx\.isOperator && ctx\.role !== null/.test(operatorRouteBlock),
    "wall reveal resolves ONLY from the server operator-context (isOperator && role)",
    "OperatorRoute must resolve the reveal from fetchOperatorContext() requiring `ctx.isOperator && ctx.role !== null`",
  );
  check(
    /SESSION_CHANGED_EVENT/.test(operatorRouteBlock),
    "wall re-reads the role on SESSION_CHANGED_EVENT (sign-in resolves in place)",
    "OperatorRoute must re-read operator-context on SESSION_CHANGED_EVENT",
  );
  check(
    /<PublicLayout>\s*<NotFound \/>\s*<\/PublicLayout>/.test(operatorRouteBlock),
    "the wall branch renders the exact catch-all 404 composition (PublicLayout + NotFound)",
    "OperatorRoute's non-revealed branch must render <PublicLayout><NotFound /></PublicLayout> — zero admin vocabulary",
  );
  check(
    !/window\.location|hostname|localStorage|document\.cookie/.test(operatorRouteBlock),
    "wall uses no client-side identity signals (server truth only)",
    "OperatorRoute must not read client-side identity signals — the server's operator-context is the only reveal authority",
  );
}

// ── 3. Gate constant folds statically ────────────────────────────────────────
check(
  /import\.meta\.env\.DEV\s*\|\|\s*__OPERATOR_PREVIEW__/.test(gate),
  "gate = import.meta.env.DEV || __OPERATOR_PREVIEW__ (both statically replaced)",
  "operatorPreviewGate.ts must be exactly `import.meta.env.DEV || __OPERATOR_PREVIEW__`",
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
    !gate.includes(banned),
    `gate has no runtime signal: ${banned}`,
    `operatorPreviewGate.ts must not use runtime signal \`${banned}\` — the gate must fold at build time`,
  );
}

// ── 4. vite define wires the flag ────────────────────────────────────────────
check(
  /__OPERATOR_PREVIEW__/.test(viteCfg) &&
    /VITE_OPERATOR_PREVIEW\s*===?\s*"true"/.test(viteCfg),
  'vite.config.ts defines __OPERATOR_PREVIEW__ from VITE_OPERATOR_PREVIEW === "true"',
  "vite.config.ts must define __OPERATOR_PREVIEW__ from process.env.VITE_OPERATOR_PREVIEW",
);

// ── 5. OperatorConsole is the only static importer of console modules ────────
const consoleModulePatterns = [
  '"@/components/layout/Shell"',
  '"@/pages/OperatorOverview"',
  '"@/pages/ProofStudio"',
  '"@/pages/OperatorPreview"',
  '"@/pages/OsMap"',
  '"@/components/admin/AdminShell"',
];
for (const spec of consoleModulePatterns) {
  check(
    consoleMod.includes(`from ${spec}`),
    `OperatorConsole imports ${spec}`,
    `OperatorConsole.tsx must import ${spec} (single console entry point)`,
  );
}
const allFiles = walk(srcDir);
for (const file of allFiles) {
  const rel = path.relative(srcDir, file);
  if (rel === path.join("operator", "OperatorConsole.tsx")) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  for (const spec of consoleModulePatterns) {
    const runtimeImport = new RegExp(
      `import\\s+(?!type\\b)[^;]*from\\s+${spec.replace(/[/\\]/g, "\\$&")}`,
    );
    check(
      !runtimeImport.test(code),
      `${rel}: no runtime import of ${spec}`,
      `${rel} statically imports ${spec} — console modules may only be imported by operator/OperatorConsole.tsx`,
    );
  }
}

// ── 5b. Sectioned admin graph stays a strict chain ──────────────────────────
// AdminShell → sections → panels/AdminHome. Each admin module may only be
// statically imported by its single designated parent, so the whole admin
// surface remains reachable exclusively through the gated OperatorConsole
// dynamic import (AdminShell itself is pinned to OperatorConsole in 5.).
const adminGraph: Record<string, string[]> = {
  '"@/pages/admin/sections"': [path.join("components", "admin", "AdminShell.tsx")],
  '"@/pages/admin/panels"': [path.join("pages", "admin", "sections.tsx")],
  '"@/pages/admin/AdminHome"': [path.join("pages", "admin", "sections.tsx")],
  // M-INT-1: the member ledger joins the strict chain (sections.tsx only).
  '"@/pages/admin/memberLedger"': [path.join("pages", "admin", "sections.tsx")],
  // CONSOLE ①/③ (2026-07-22): the referral KPI band + the per-source
  // performance panel join the strict chain (sections.tsx only) — admin
  // modules may never be reachable from a public surface.
  '"@/pages/admin/ReferralKpiBand"': [path.join("pages", "admin", "sections.tsx")],
  '"@/pages/admin/SourcePerformancePanel"': [path.join("pages", "admin", "sections.tsx")],
  // S2-final (2026-07-24): the Seasons 2-rails panel joins the strict chain
  // (sections.tsx only) — admin modules never reachable from a public surface.
  '"@/pages/admin/SeasonsRails"': [path.join("pages", "admin", "sections.tsx")],
};
for (const [spec, allowedImporters] of Object.entries(adminGraph)) {
  let importedByAllowed = false;
  for (const file of allFiles) {
    const rel = path.relative(srcDir, file);
    const code = stripComments(readFileSync(file, "utf8"));
    const runtimeImport = new RegExp(
      `import\\s+(?!type\\b)[^;]*from\\s+${spec.replace(/[/\\]/g, "\\$&")}`,
    );
    if (!runtimeImport.test(code)) continue;
    if (allowedImporters.includes(rel)) {
      importedByAllowed = true;
    } else {
      errors.push(
        `${rel} statically imports ${spec} — admin module may only be imported by ${allowedImporters.join(", ")}`,
      );
    }
  }
  check(
    importedByAllowed,
    `admin graph: ${spec} imported only by ${allowedImporters.join(", ")}`,
    `admin module ${spec} is not imported by its designated parent (${allowedImporters.join(", ")}) — the admin graph chain broke`,
  );
}

// ── 6. Public chrome renders no literal INTERNAL links ──────────────────────
const publicChrome = [
  "components/layout/PublicLayout.tsx",
  "pages/PublicHome.tsx",
  "pages/not-found.tsx",
];
for (const rel of publicChrome) {
  const code = stripComments(read(rel));
  for (const p of internalPaths) {
    check(
      !code.includes(`"${p}"`),
      `${rel}: no literal link to ${p}`,
      `${rel} contains a literal INTERNAL link "${p}" — INTERNAL links must come from config (syndicateFacts teaser) or not exist`,
    );
  }
}

// ── 7. Dist-grep probe strings stay meaningful ───────────────────────────────
// OSMAP_PROBE: exists only in gated modules → in dist it may appear ONLY in
// the console lazy chunk, never the public entry bundle (the dist proof).
// RETIRED_FALLBACK_PROBE: the dead OperatorPreviewUnavailable copy — it
// admitted an internal surface existed at the bare URL (the wall violation
// class). It must exist NOWHERE in src; deploy verification greps dist for
// its absence too.
const OSMAP_PROBE = "INTERNAL FOUNDER PREVIEW";
const RETIRED_FALLBACK_PROBE = "Internal preview is not enabled on this deployment";
const gatedFiles = new Set(
  [
    "operator/OperatorConsole.tsx",
    "operator/protocolRealityEvidence.ts",
    "operator/LiveEvidencePanel.tsx",
    "components/layout/Shell.tsx",
    "pages/OperatorOverview.tsx",
    "pages/ProofStudio.tsx",
    "pages/OperatorPreview.tsx",
    "pages/OsMap.tsx",
    "config/protocolOsMap.ts",
    "operator/AccessStateSimulator.tsx",
  ].map((r) => path.resolve(srcDir, r)),
);
let probeInGated = false;
for (const file of allFiles) {
  const code = stripComments(readFileSync(file, "utf8"));
  if (code.includes(OSMAP_PROBE)) {
    if (gatedFiles.has(file)) probeInGated = true;
    else
      errors.push(
        `probe string "${OSMAP_PROBE}" leaked into non-gated file ${path.relative(srcDir, file)} — dist-grep proof would be ambiguous`,
      );
  }
}
check(
  probeInGated,
  `probe string "${OSMAP_PROBE}" present in gated modules only`,
  `probe string "${OSMAP_PROBE}" not found in gated modules — dist-grep proof has no target`,
);
// The retired-fallback class stays dead: the copy may reappear NOWHERE
// (this guard file lives in scripts/, outside the scanned src/ tree).
{
  let retiredFound: string | null = null;
  for (const file of allFiles) {
    const code = stripComments(readFileSync(file, "utf8"));
    if (code.includes(RETIRED_FALLBACK_PROBE)) {
      retiredFound = path.relative(srcDir, file);
      break;
    }
  }
  check(
    retiredFound === null,
    "retired fallback copy (the wall-violation class) exists nowhere in src",
    `the retired "Internal preview…" fallback copy reappeared in ${retiredFound} — the neutral wall forbids admitting an internal surface at the bare URL`,
  );
}

// ── 8. /os-map live proof binding stays operator-gated + fail-closed ────────
const adapterRaw = read("operator/protocolRealityEvidence.ts");
const adapter = stripComments(adapterRaw);
const panelRaw = read("operator/LiveEvidencePanel.tsx");
const panel = stripComments(panelRaw);
const osMapPage = stripComments(read("pages/OsMap.tsx"));
const osMapConfig = stripComments(read("config/protocolOsMap.ts"));

// 8a. Live-binding modules are importable only from the gated graph.
const liveBindingSpecs = [
  '"@/operator/protocolRealityEvidence"',
  '"@/operator/LiveEvidencePanel"',
];
for (const file of allFiles) {
  const rel = path.relative(srcDir, file);
  if (gatedFiles.has(file)) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  for (const spec of liveBindingSpecs) {
    check(
      !code.includes(`from ${spec}`),
      `${rel}: no import of ${spec}`,
      `${rel} imports ${spec} — live-binding modules may only be imported inside the gated operator graph`,
    );
  }
}
check(
  osMapPage.includes('from "@/operator/LiveEvidencePanel"') &&
    osMapPage.includes("<LiveEvidencePanel nodeId=") &&
    osMapPage.includes("<SpineDomainMeta />"),
  "OsMap.tsx renders LiveEvidencePanel + SpineDomainMeta (live binding wired)",
  "OsMap.tsx must render LiveEvidencePanel and SpineDomainMeta for the spine domain",
);

// 8b. Adapter purity: pure mapping, no runtime signals, no bespoke transport,
// type-only consumption of the generated client, no status-vocabulary import.
for (const banned of [
  "fetch(",
  "useQuery",
  "useGetProtocolReality",
  "useState",
  "useEffect",
  "window",
  "localStorage",
  "Date.now",
  "new Date",
]) {
  check(
    !adapter.includes(banned),
    `adapter is pure: no ${banned}`,
    `protocolRealityEvidence.ts must stay a pure mapping — found \`${banned}\``,
  );
}
check(
  !/import\s+(?!type\b)[^;]*from\s+"@workspace\/api-client-react"/.test(adapter),
  "adapter imports the generated client types only (import type)",
  "protocolRealityEvidence.ts must import from @workspace/api-client-react as `import type` only",
);
check(
  !adapter.includes('from "@/config/truthStatus"'),
  "adapter does not import status vocabulary (classification is a separate axis)",
  "protocolRealityEvidence.ts must not import truthStatus — classification must not blur into status vocabulary",
);

// 8c. Classification map reconciles exactly with protocolOsMap node ids.
// NOTE: the textual id regex is [a-z0-9-]+ — node ids with underscores or
// uppercase would be silently skipped by BOTH scans; keep ids kebab-case.
const DOMAIN_IDS = [
  "reality-spine",
  "historical-index",
  "pending-wiring",
  "product-surfaces",
  "future-governance",
];
const allConfigIds = [...osMapConfig.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
check(
  DOMAIN_IDS.every((d) => allConfigIds.includes(d)),
  "protocolOsMap declares the 5 known domain ids",
  `protocolOsMap domain ids changed (expected ${DOMAIN_IDS.join(", ")}) — update this guard deliberately`,
);
const nodeIds = allConfigIds.filter((id) => !DOMAIN_IDS.includes(id));
const classBlock = adapter.match(/osMapNodeClass[^=]*=\s*\{([\s\S]*?)\n\};/);
const classKeys = classBlock
  ? [...classBlock[1].matchAll(/(?:"([a-z0-9-]+)"|^\s*([a-z0-9-]+)):/gm)].map((m) => m[1] ?? m[2])
  : [];
check(
  nodeIds.length === 23,
  `protocolOsMap declares 23 nodes`,
  `expected 23 protocolOsMap nodes, found ${nodeIds.length} — update this guard and the adapter classification deliberately`,
);
for (const id of nodeIds) {
  check(
    classKeys.includes(id),
    `classification covers node ${id}`,
    `osMapNodeClass is missing node id "${id}" — every /os-map node must be classified`,
  );
}
for (const key of classKeys) {
  check(
    nodeIds.includes(key),
    `classification key ${key} exists in protocolOsMap`,
    `osMapNodeClass key "${key}" matches no protocolOsMap node — stale classification`,
  );
}

// 8d. Spine bindings: exactly the 4 approved spine nodes; archive group
// stays deliberately unbound this slice (founder-deferred open item).
const spineBlock = adapter.match(/spineNodeGroup[^=]*=\s*\{([\s\S]*?)\n\};/);
const spinePairs = spineBlock
  ? [...spineBlock[1].matchAll(/"([a-z0-9-]+)":\s*"([a-z]+)"/g)].map((m) => [m[1], m[2]])
  : [];
const expectedSpine: Record<string, string> = {
  "chain-identity": "chain",
  "contract-code": "contracts",
  "erc20-metadata": "tokens",
  "sale-engines": "sale",
};
check(
  spinePairs.length === 4 &&
    spinePairs.every(([n, g]) => expectedSpine[n] === g),
  "spineNodeGroup binds exactly the 4 approved spine nodes (chain/contracts/tokens/sale)",
  "spineNodeGroup must bind exactly chain-identity→chain, contract-code→contracts, erc20-metadata→tokens, sale-engines→sale",
);
check(
  !spinePairs.some(([, g]) => g === "archive"),
  "payload archive group stays unbound (founder-deferred)",
  "the archive group may not be bound to a spine node without founder approval",
);

// 8e. Fail-closed UI: the panel has an error branch and the unavailable probe
// string, verbatim-unique to the panel for dist-grep proof.
const LIVE_PROBE = "LIVE PROOF UNAVAILABLE";
check(
  panel.includes("isError") && panel.includes(LIVE_PROBE),
  "panel fails closed (isError branch + unavailable copy)",
  `LiveEvidencePanel.tsx must render the fail-closed "${LIVE_PROBE}" state on fetch failure`,
);
check(
  panel.includes("selectNodeEvidence"),
  "panel selects evidence through the pure adapter",
  "LiveEvidencePanel.tsx must select signals via selectNodeEvidence (single adapter path)",
);
for (const file of allFiles) {
  const rel = path.relative(srcDir, file);
  if (rel === path.join("operator", "LiveEvidencePanel.tsx")) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !code.includes(LIVE_PROBE),
    `${rel}: no "${LIVE_PROBE}" probe leak`,
    `probe string "${LIVE_PROBE}" leaked into ${rel} — dist-grep proof would be ambiguous`,
  );
}

// 8f. Provenance honesty: the fetched-at line is page-load client time and
// must say so; no other wall-clock "verified" claim in the panel.
check(
  panelRaw.includes("fetched at page load"),
  "panel provenance line is labelled as page-load time",
  "the panel's fetched-at line must be labelled as page-load time (never protocol/event truth)",
);
check(
  !/last verified/i.test(panel),
  'panel makes no "last verified" claim',
  'LiveEvidencePanel.tsx must not claim "last verified" — wall-clock is page-load provenance only',
);

// ── 9. Access-state simulator stays inside the gated operator graph ─────────
// (Slice IA-1, founder-approved trimmed form.) The simulator may only be
// imported by gated console modules, and its probe string must be verbatim-
// unique to it so the production dist-grep proof is unambiguous.
const SIMULATOR_PROBE = "ACCESS-STATE SIMULATOR — SIMULATED STATE — NOT WIRED";
const simulatorSpec = '"@/operator/AccessStateSimulator"';
const simulatorSrc = stripComments(read("operator/AccessStateSimulator.tsx"));
check(
  simulatorSrc.includes("SIMULATED STATE — NOT WIRED"),
  "simulator carries the SIMULATED STATE — NOT WIRED warning copy",
  "AccessStateSimulator.tsx must carry the SIMULATED STATE — NOT WIRED warning copy",
);
let simProbeInGated = false;
for (const file of allFiles) {
  const rel = path.relative(srcDir, file);
  const code = stripComments(readFileSync(file, "utf8"));
  if (code.includes(SIMULATOR_PROBE)) {
    if (gatedFiles.has(file)) simProbeInGated = true;
    else
      errors.push(
        `simulator probe string leaked into non-gated file ${rel} — dist-grep proof would be ambiguous`,
      );
  }
  if (gatedFiles.has(file)) continue;
  check(
    !code.includes(`from ${simulatorSpec}`),
    `${rel}: no import of ${simulatorSpec}`,
    `${rel} imports ${simulatorSpec} — the access-state simulator may only be imported inside the gated operator graph`,
  );
}
check(
  simProbeInGated,
  `simulator probe string present in gated modules only`,
  `simulator probe string not found in gated modules — dist-grep proof has no target`,
);

// ── Report ───────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nguard-operator-gate: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nguard-operator-gate: all ${ok.length} checks passed.`);
