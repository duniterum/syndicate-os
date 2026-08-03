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
// Comments are invisible to every textual scan (the guard-operator-gate house
// pattern; AUD-ROUTE 2026-07-17): a prose comment containing `path: "/x"`
// must never inject a phantom module path that masks a deleted entry.
// The block pass is LINE-COMMENT-AWARE (2026-08-03, the b2a8bbb disease): a
// `/*` inside a `//` line comment (`/api/auth/*`, `src/**`) must never open a
// phantom block that swallows real routes from the scan. The `//` pass below
// then deletes the line tail itself, exactly as before.
function stripBlockComments(t: string): string {
  let kept = "";
  for (let i = 0; i < t.length; ) {
    if (t[i] === "/" && t[i + 1] === "/") {
      let nl = t.indexOf("\n", i);
      if (nl === -1) nl = t.length;
      kept += t.slice(i, nl);
      i = nl;
    } else if (t[i] === "/" && t[i + 1] === "*") {
      const close = t.indexOf("*/", i + 2);
      if (close === -1) {
        kept += t.slice(i, i + 2); // unclosed opener: the old regex kept it
        i += 2;
        continue;
      }
      i = close + 2;
    } else {
      kept += t[i];
      i += 1;
    }
  }
  return kept;
}
const stripComments = (t: string) => stripBlockComments(t).replace(/\/\/[^\n]*/g, "");
const appSrc = stripComments(
  readFileSync(path.resolve(here, "..", "src", "App.tsx"), "utf8"),
);
const modulesSrc = stripComments(
  readFileSync(path.resolve(cfg, "modules.ts"), "utf8"),
);
const navSrc = stripComments(
  readFileSync(path.resolve(cfg, "navigation.ts"), "utf8"),
);

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

// AUD-ROUTE (2026-07-17) — THE REVERSE DIRECTION the audit proved missing:
// every public-facing route must have a module entry, or it is structurally
// invisible to all public chrome (navigation.ts builds header/footer from
// module ids only — six live routes were unreachable this way). REDIRECT
// aliases are the one legitimate module-less class (they are the target's
// shadow, never their own destination).
const modulePathSet = new Set(modulePaths);
for (const r of seoRouteRegistry) {
  if (r.path === "*") continue;
  if (r.routeType !== "PUBLIC" && r.routeType !== "PENDING") continue;
  if (r.indexStatus === "REDIRECT") continue;
  // PARAM class (dated 2026-07-20, the /receipt/{txHash} slice — mirrors the
  // REDIRECT exemption above): a per-transaction permalink is structurally
  // not a nav destination — no header/footer chrome can link "a receipt";
  // the page is reached by shared links only, deliberately module-less.
  if (r.path.includes("/:")) continue;
  check(
    modulePathSet.has(r.path),
    `public route ${r.path} has a module entry (chrome-visible)`,
    `public route ${r.path} has NO modules.ts entry — structurally invisible to header/footer (the six-invisible-routes class; add a module or classify the route deliberately)`,
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

// ---------------------------------------------------------------------------
// Sectioned admin shell lockstep (Phase 2 slice 1) — STRICTER, three-way:
// the ADMIN_SECTIONS nav table in components/admin/AdminShell.tsx, the
// mounted /admin* router paths in App.tsx, and the registry's /admin* entries
// must be EXACTLY the same set (10 sections: /admin + 9 sub-routes). A nav
// item without a mounted route, a mounted route without a nav item, or an
// unregistered section all fail here.
// Stripped like every other scanned file (2026-08-03): this read was RAW, so a
// commented-out `path: "/admin/…"` entry was COUNTED — a pure comment could
// red the build (proven live: 3 errors from one comment) or pad the exact-11
// count while a real entry was deleted. The guard's own header law (a prose
// comment must never inject a phantom path) covers this scan too.
const adminShellSrc = stripComments(
  readFileSync(
    path.resolve(here, "..", "src", "components", "admin", "AdminShell.tsx"),
    "utf8",
  ),
);
const sectionsBlock = adminShellSrc.match(
  /ADMIN_SECTIONS\s*=\s*\[([\s\S]*?)\]\s*as const/,
);
check(
  sectionsBlock !== null,
  "AdminShell declares the ADMIN_SECTIONS table",
  "AdminShell.tsx no longer declares `ADMIN_SECTIONS = [...] as const` — the admin nav lockstep audit has nothing to bind to",
);
const adminNavPaths = new Set(
  sectionsBlock
    ? Array.from(sectionsBlock[1].matchAll(/path:\s*"(\/admin[^"]*)"/g)).map(
        (m) => m[1],
      )
    : [],
);
const adminRouterPaths = new Set(
  [...routerPaths].filter((p) => p === "/admin" || p.startsWith("/admin/")),
);
const adminRegistryPaths = new Set(
  [...registryPaths].filter((p) => p === "/admin" || p.startsWith("/admin/")),
);
check(
  adminNavPaths.size === 11,
  `AdminShell declares 11 admin sections`,
  `expected exactly 11 ADMIN_SECTIONS entries (/admin + 10 sub-routes; /admin/seasons joined at S2-final 2026-07-24), found ${adminNavPaths.size} — update this guard deliberately if the section model changed`,
);
for (const p of adminNavPaths) {
  check(
    adminRouterPaths.has(p),
    `admin nav ${p} is mounted in App.tsx`,
    `AdminShell nav path ${p} is not mounted in App.tsx`,
  );
  check(
    adminRegistryPaths.has(p),
    `admin nav ${p} is registered`,
    `AdminShell nav path ${p} has no seo-route-registry entry`,
  );
}
for (const p of adminRouterPaths) {
  check(
    adminNavPaths.has(p),
    `mounted admin route ${p} is in the AdminShell nav`,
    `mounted admin route ${p} has no AdminShell nav entry — orphan admin route`,
  );
}
for (const p of adminRegistryPaths) {
  check(
    adminNavPaths.has(p),
    `registered admin route ${p} is in the AdminShell nav`,
    `registered admin route ${p} has no AdminShell nav entry — stale registry row`,
  );
}

console.log(
  `[guard:drift] ${ok.length} checks passed (${routerPaths.size} routes, ${navIds.size} nav refs, ${adminNavPaths.size} admin sections).`,
);
if (errors.length) {
  console.error(`[guard:drift] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(
  `[guard:drift] PASS \u2014 router, registry, modules, and nav are in lockstep.`,
);
