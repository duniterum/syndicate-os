// Guard: surface-classification coverage.
// Every real route is classified exactly once in surfaceClassification, matches a
// seo-route-registry entry, links to a real module, and its audience agrees with
// its layout (console => operator-preview; member-preview => pending/noindex).
//
// Node-loadable (Node >= 22.6 / 24).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { surfaceClassification } from "../src/config/surfaceClassification.ts";
import { seoRouteRegistry } from "../src/lib/seo-route-registry.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const modulesSrc = readFileSync(
  path.resolve(here, "..", "src", "config", "modules.ts"),
  "utf8",
);
const moduleIds = new Set(
  Array.from(modulesSrc.matchAll(/\bid:\s*"([^"]+)"/g)).map((m) => m[1]),
);
// Pair each module id with its own path (id always precedes path within a module
// object), so a surface can't link a module whose path disagrees with the route.
const modulePathById = new Map<string, string>();
for (const m of modulesSrc.matchAll(/\bid:\s*"([^"]+)"[\s\S]*?\bpath:\s*"([^"]+)"/g)) {
  if (!modulePathById.has(m[1])) modulePathById.set(m[1], m[2]);
}

const registryPaths = new Set(
  seoRouteRegistry.filter((r) => r.path !== "*").map((r) => r.path),
);
const surfacePaths = surfaceClassification.map((s) => s.routePath);
const byPath = new Map(seoRouteRegistry.map((r) => [r.path, r]));

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

// 1. No duplicate classifications.
{
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const p of surfacePaths) {
    if (seen.has(p)) dups.add(p);
    seen.add(p);
  }
  check(
    dups.size === 0,
    "no duplicate surface classifications",
    `duplicate surface routePaths: ${[...dups].join(", ")}`,
  );
}

// 2. Coverage: surface <-> registry (both directions).
for (const s of surfaceClassification) {
  check(
    registryPaths.has(s.routePath),
    `surface ${s.routePath} has a registry entry`,
    `surface ${s.routePath} has no seo-route-registry entry`,
  );
}
for (const p of registryPaths) {
  check(
    surfacePaths.includes(p),
    `registry route ${p} is classified`,
    `registry route ${p} is missing from surfaceClassification`,
  );
}

// 3. Module linkage.
for (const s of surfaceClassification) {
  if (s.moduleId !== undefined) {
    check(
      moduleIds.has(s.moduleId),
      `surface ${s.routePath} links to module "${s.moduleId}"`,
      `surface ${s.routePath} references unknown module "${s.moduleId}"`,
    );
    check(
      modulePathById.get(s.moduleId) === s.routePath,
      `surface ${s.routePath} and module "${s.moduleId}" agree on path`,
      `surface ${s.routePath} links module "${s.moduleId}" whose path is "${modulePathById.get(s.moduleId)}" (mismatch)`,
    );
  }
}

// 4. Audience <-> layout / posture consistency.
for (const s of surfaceClassification) {
  if (s.layout === "console") {
    check(
      s.audience === "OPERATOR_PREVIEW",
      `console surface ${s.routePath} is operator-preview`,
      `console surface ${s.routePath} must be OPERATOR_PREVIEW, got ${s.audience}`,
    );
    const entry = byPath.get(s.routePath);
    check(
      entry !== undefined && entry.routeType === "INTERNAL",
      `console surface ${s.routePath} is INTERNAL in the registry`,
      `console surface ${s.routePath} must be routeType INTERNAL`,
    );
  } else {
    check(
      s.audience === "PUBLIC" || s.audience === "MEMBER_PREVIEW",
      `public-layout surface ${s.routePath} has a public/member audience`,
      `public-layout surface ${s.routePath} must be PUBLIC or MEMBER_PREVIEW, got ${s.audience}`,
    );
  }
  if (s.audience === "MEMBER_PREVIEW") {
    // Public Online Integration MVP (founder-approved): /member is now a
    // public wallet-session surface (INDEX). A member-preview surface must
    // stay a registered public-facing route — PENDING (noindex preview) or
    // INDEX (public) — and must never drift to INTERNAL.
    const entry = byPath.get(s.routePath);
    check(
      entry !== undefined &&
        (entry.indexStatus === "PENDING" || entry.indexStatus === "INDEX"),
      `member-preview surface ${s.routePath} is PENDING or INDEX (never INTERNAL)`,
      `member-preview surface ${s.routePath} must be indexStatus PENDING or INDEX`,
    );
  }
}

// ---------------------------------------------------------------------------
// Homepage governance rule 3: the Promoted Strip stays capped at 4 cards.
// The strip is registry-driven (publicVisible && homepageZone === "PROMOTED_STRIP"),
// so the cap lives in Module Registry v0 data — assert it statically so a future
// zone edit can never silently render 5+ cards. Comments are stripped before
// matching; each registry entry chunk is delimited by its registryId field.
const registrySrc = readFileSync(
  path.resolve(here, "..", "src", "config", "moduleRegistry.ts"),
  "utf8",
)
  // LINE comments stripped FIRST — a `/*` inside a `//` line would open a
  // phantom block and swallow real code (guard-activity-mine's RED, 2026-08-03).
  .replace(/^[ \t]*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const entryChunks = registrySrc.split(/(?=registryId:\s*")/g).slice(1);
check(
  entryChunks.length > 0,
  "module registry entries parsed for homepage-zone audit",
  "could not parse any registry entries from moduleRegistry.ts (registryId markers missing)",
);
const promotedPublic = entryChunks.filter(
  (chunk) =>
    /\bpublicVisible:\s*true\b/.test(chunk) &&
    /\bhomepageZone:\s*"PROMOTED_STRIP"/.test(chunk),
);
check(
  promotedPublic.length <= 4,
  `promoted strip cap holds: ${promotedPublic.length}/4 public PROMOTED_STRIP entries`,
  `homepage governance violation: ${promotedPublic.length} public PROMOTED_STRIP entries exceed the 4-card cap`,
);
const publicHomeSrc = readFileSync(
  path.resolve(here, "..", "src", "pages", "PublicHome.tsx"),
  "utf8",
);
check(
  /homepageZone\s*===\s*"PROMOTED_STRIP"/.test(publicHomeSrc),
  "PublicHome promoted strip filters from the module registry zone field",
  'PublicHome.tsx no longer filters on homepageZone === "PROMOTED_STRIP" — promoted cards must stay registry-driven',
);

// ---------------------------------------------------------------------------
// Public Protocol Map exposure rules (/map):
//   - the page renders an explicit group list that MUST include "archive".
//     (STRUCK 2026-07-30, footer audit — the old pin said the OPPOSITE:
//     "archive binding is founder-deferred". That deferral had become an
//     unpinned future claim on the page while /status rendered the identical
//     group publicly one footer link away — the exposure is audited: the API
//     serves the archive group publicSafe and it is already public on
//     /status. The pin now points the other way so the group can never
//     silently drop back out.)
//   - the page filters publicSafe on the V3 figures it extracts;
//   - the shared ProtocolRealityPanel filters publicSafe defense-in-depth;
//   - the public-map registry entry links moduleId "map", and the internal
//     protocol-map (os-map) governance row still exists — the public entry
//     was added, never repointed.
// LINE comments stripped FIRST — a `/*` inside a `//` line would open a
// phantom block and swallow real code (guard-activity-mine's RED, 2026-08-03).
const stripComments = (s: string): string =>
  s.replace(/^[ \t]*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const protocolMapSrc = stripComments(
  readFileSync(path.resolve(here, "..", "src", "pages", "ProtocolMap.tsx"), "utf8"),
);
{
  const groupsMatch = protocolMapSrc.match(/MAP_GROUPS\s*=\s*\[([^\]]*)\]/);
  check(
    groupsMatch !== null,
    "/map declares an explicit MAP_GROUPS list",
    "/map (ProtocolMap.tsx) no longer declares MAP_GROUPS — the archive-omission audit has nothing to bind to",
  );
  check(
    groupsMatch !== null && /["']archive["']/.test(groupsMatch[1]),
    "/map renders the archive group (bound 2026-07-30 — completeness over deferral)",
    '/map dropped the "archive" group — the 2026-07-30 footer-audit binding regressed; /status renders it publicly, so omission here is a silent completeness hole',
  );
  check(
    /\.publicSafe\b/.test(protocolMapSrc),
    "/map filters items on publicSafe",
    "/map (ProtocolMap.tsx) no longer checks publicSafe on extracted items",
  );
}

// ---------------------------------------------------------------------------
// THE JOIN-LINK ONE-HOME PIN (adversarial review 2026-07-30, confirmed 2/2).
// When the five hand-assembled join links were paid by import (buildJoinLink),
// the duplicate-facts DEBT entry died with them — correctly — but that left
// the fact with NO structural protection: a future hand-rolled copy is a
// single-occurrence fact the duplicate guard can never flag (it reds only on
// 2+ files), and the same review found a sixth survivor the old entry never
// covered (ProposeSourceCreate — a template split hid it from the fact regex).
// This sweep is the transferred protection: the `/join?source=${...}` link is
// CONSTRUCTED in exactly one file, lib/joinLink.ts; anywhere else = RED.
{
  const srcDir = path.resolve(here, "..", "src");
  const walk = function* (dir: string): Generator<string> {
    for (const name of readdirSync(dir)) {
      const abs = path.join(dir, name);
      if (statSync(abs).isDirectory()) yield* walk(abs);
      else if (/\.(ts|tsx)$/.test(name)) yield abs;
    }
  };
  const offenders: string[] = [];
  for (const f of walk(srcDir)) {
    const rel = path.relative(srcDir, f).replace(/\\/g, "/");
    if (rel === "lib/joinLink.ts") continue;
    if (readFileSync(f, "utf8").includes("join?source=${")) offenders.push(rel);
  }
  check(
    offenders.length === 0,
    "the join link is constructed only in lib/joinLink.ts (one fact, one home)",
    `hand-assembled join link outside lib/joinLink.ts — import buildJoinLink instead: ${offenders.join(", ")}`,
  );
}
{
  const panelSrc = stripComments(
    readFileSync(
      path.resolve(here, "..", "src", "components", "ProtocolReality.tsx"),
      "utf8",
    ),
  );
  check(
    /\.filter\(\s*\(?\s*\w+\s*\)?\s*=>\s*\w+\.publicSafe\s*\)/.test(panelSrc),
    "ProtocolRealityPanel filters publicSafe (defense-in-depth)",
    "ProtocolReality.tsx panel no longer filters items on publicSafe",
  );
}
{
  const publicMapEntry = entryChunks.find((c) => /^registryId:\s*"public-map"/.test(c));
  check(
    publicMapEntry !== undefined && /\bmoduleId:\s*"map"/.test(publicMapEntry),
    'registry entry public-map links moduleId "map"',
    'registry entry public-map is missing or no longer links moduleId "map"',
  );
  const internalMapEntry = entryChunks.find(
    (c) => /^registryId:\s*"protocol-map"/.test(c),
  );
  check(
    internalMapEntry !== undefined && /\bmoduleId:\s*"os-map"/.test(internalMapEntry),
    "internal protocol-map (os-map) governance row is intact",
    "internal protocol-map registry row was removed or repointed — /os-map lost its governance coverage",
  );
}

{
  // /status Holder Index rules: aggregate-only, era-labelled, fail-closed.
  const statusSrc = stripComments(
    readFileSync(
      path.resolve(here, "..", "src", "pages", "SystemStatus.tsx"),
      "utf8",
    ),
  );
  check(
    statusSrc.includes("useGetHolderIndex"),
    "/status binds the holder index through the generated hook",
    "SystemStatus.tsx no longer uses useGetHolderIndex — holder index must come from the contract-generated client, not ad-hoc fetch",
  );
  check(
    /data\.eras\.map\(/.test(statusSrc),
    "/status renders era chips from API data (era provenance always labelled)",
    "SystemStatus.tsx no longer maps data.eras — era labels must come from the served snapshot, not hardcoded strings",
  );
  check(
    statusSrc.includes("Holder index unavailable"),
    "/status holder index has a fail-closed unavailable state",
    "SystemStatus.tsx lost its fail-closed 'Holder index unavailable' card",
  );
  const holderForbidden = [/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/, /entryWallet/, /entryTransaction/];
  check(
    !holderForbidden.some((re) => re.test(statusSrc)),
    "/status contains no address tokens or PII field names",
    "SystemStatus.tsx contains an address token or PII field name",
  );
}

console.log(`[guard:coverage] ${ok.length} checks passed.`);
if (errors.length) {
  console.error(`[guard:coverage] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(
  `[guard:coverage] PASS \u2014 ${surfaceClassification.length} surfaces fully classified.`,
);
