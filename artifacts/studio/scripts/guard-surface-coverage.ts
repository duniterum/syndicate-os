// Guard: surface-classification coverage.
// Every real route is classified exactly once in surfaceClassification, matches a
// seo-route-registry entry, links to a real module, and its audience agrees with
// its layout (console => operator-preview; member-preview => pending/noindex).
//
// Node-loadable (Node >= 22.6 / 24).

import { readFileSync } from "node:fs";
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
    const entry = byPath.get(s.routePath);
    check(
      entry !== undefined && entry.indexStatus === "PENDING",
      `member-preview surface ${s.routePath} is PENDING (noindex)`,
      `member-preview surface ${s.routePath} must be indexStatus PENDING`,
    );
  }
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
