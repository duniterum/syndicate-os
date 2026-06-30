// Guard: route / nav drift.
// The mounted router (App.tsx), the SEO route registry, the module registry, and
// the navigation config must stay in lockstep:
//   - every router path has a registry entry and vice-versa (catch-all ignored);
//   - every module path is a real registry route;
//   - every module id referenced by the nav config exists in the module registry.
//
// Module ids/paths and nav refs are read textually because modules.ts imports
// lucide-react at runtime (not Node-loadable). The registry stays import-clean.
//
// Node-loadable (Node >= 22.6 / 24).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { seoRouteRegistry } from "../src/lib/seo-route-registry.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = path.resolve(here, "..", "src", "config");
const appSrc = readFileSync(path.resolve(here, "..", "src", "App.tsx"), "utf8");
const modulesSrc = readFileSync(path.resolve(cfg, "modules.ts"), "utf8");
const navSrc = readFileSync(path.resolve(cfg, "navigation.ts"), "utf8");

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

// Router paths from App.tsx (ignore the pathless catch-all).
const routerPaths = new Set(
  Array.from(appSrc.matchAll(/path="([^"]+)"/g))
    .map((m) => m[1])
    .filter((p) => p !== "*"),
);
const hasCatchAll = /<Route>\s/.test(appSrc);
const registryPaths = new Set(
  seoRouteRegistry.filter((r) => r.path !== "*").map((r) => r.path),
);

for (const p of routerPaths) {
  check(
    registryPaths.has(p),
    `router ${p} is in the registry`,
    `router route ${p} has no registry entry`,
  );
}
for (const p of registryPaths) {
  check(
    routerPaths.has(p),
    `registry ${p} is mounted in App.tsx`,
    `registry route ${p} is not mounted in App.tsx`,
  );
}
check(
  !hasCatchAll || seoRouteRegistry.some((r) => r.path === "*"),
  'catch-all route is registered ("*")',
  'App.tsx has a catch-all <Route> but the registry has no "*" entry',
);

// Module ids + paths (textual).
const moduleIds = new Set(
  Array.from(modulesSrc.matchAll(/\bid:\s*"([^"]+)"/g)).map((m) => m[1]),
);
const modulePaths = Array.from(modulesSrc.matchAll(/\bpath:\s*"([^"]+)"/g))
  .map((m) => m[1])
  .filter((p) => p.startsWith("/"));
for (const p of modulePaths) {
  check(
    registryPaths.has(p),
    `module path ${p} is a real route`,
    `module path ${p} is not a registered route`,
  );
}

// Nav id references (ordered([...]) + itemIds: [...]) must resolve to modules.
const navIdRegions = [
  ...Array.from(navSrc.matchAll(/ordered\(\[([^\]]*)\]/g)).map((m) => m[1]),
  ...Array.from(navSrc.matchAll(/itemIds:\s*\[([^\]]*)\]/g)).map((m) => m[1]),
];
const navIds = new Set<string>();
for (const region of navIdRegions) {
  for (const m of region.matchAll(/"([^"]+)"/g)) navIds.add(m[1]);
}
for (const id of navIds) {
  check(
    moduleIds.has(id),
    `nav references real module "${id}"`,
    `nav references unknown module id "${id}"`,
  );
}

console.log(
  `[guard:drift] ${ok.length} checks passed (${routerPaths.size} routes, ${navIds.size} nav refs).`,
);
if (errors.length) {
  console.error(`[guard:drift] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(
  `[guard:drift] PASS \u2014 router, registry, modules, and nav are in lockstep.`,
);
