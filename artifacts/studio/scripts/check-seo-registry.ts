// Guard / validation for the SEO route registry, sitemap.xml, and robots.txt.
//
// Run with Node's native TypeScript support (Node >= 22.6 / 24):
//   pnpm --filter @workspace/studio run seo:check
//
// Exits non-zero with a list of problems if any invariant is violated.
// This is a lightweight, dependency-free check (no XML parser, no test runner).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  seoRouteRegistry,
  getSitemapRoutes,
  getRobotsDisallowRoutes,
  getRobotsDirective,
  resolveRouteHead,
  CANONICAL_ORIGIN,
} from "../src/lib/seo-route-registry.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, "..", "src", "App.tsx");
const sitemapPath = path.resolve(here, "..", "public", "sitemap.xml");
const robotsPath = path.resolve(here, "..", "public", "robots.txt");
const indexHtmlPath = path.resolve(here, "..", "index.html");

const errors: string[] = [];
const ok: string[] = [];

function check(condition: boolean, passMsg: string, failMsg: string): void {
  if (condition) ok.push(passMsg);
  else errors.push(failMsg);
}

// --- 1. Router discovery: every route in App.tsx has a registry entry. ---------
const appSrc = readFileSync(appPath, "utf8");
const routerPaths = Array.from(
  new Set(Array.from(appSrc.matchAll(/path="([^"]+)"/g)).map((m) => m[1])),
);
const hasCatchAll = /<Route>\s/.test(appSrc);

const registryPaths = new Set(seoRouteRegistry.map((r) => r.path));

for (const p of routerPaths) {
  check(
    registryPaths.has(p),
    `router route ${p} has a registry entry`,
    `router route ${p} (from App.tsx) is MISSING a registry entry`,
  );
}
check(
  !hasCatchAll || registryPaths.has("*"),
  `catch-all route has a registry entry ("*")`,
  `App.tsx has a catch-all <Route> but the registry has no "*" entry`,
);

// Reverse: no invented registry routes (every non-"*" entry exists in the router).
for (const entry of seoRouteRegistry) {
  if (entry.path === "*") continue;
  check(
    routerPaths.includes(entry.path),
    `registry route ${entry.path} exists in the router`,
    `registry route ${entry.path} does NOT exist in App.tsx (invented route)`,
  );
}

// --- 2/3. Sitemap flag integrity. ---------------------------------------------
for (const entry of seoRouteRegistry) {
  if (entry.sitemap) {
    check(
      entry.indexStatus === "INDEX",
      `sitemap=true only on INDEX route ${entry.path}`,
      `route ${entry.path} has sitemap=true but indexStatus=${entry.indexStatus} (only INDEX may be in sitemap)`,
    );
  }
}

// --- 4. Canonical paths start with "/". ---------------------------------------
for (const entry of seoRouteRegistry) {
  if (entry.canonicalPath !== null) {
    check(
      entry.canonicalPath.startsWith("/"),
      `canonicalPath of ${entry.path} starts with "/"`,
      `route ${entry.path} canonicalPath "${entry.canonicalPath}" must start with "/"`,
    );
  }
}

// --- 5. INDEX routes have title + description + a canonical. -------------------
for (const entry of seoRouteRegistry) {
  if (entry.indexStatus === "INDEX") {
    check(
      entry.title.trim().length > 0 && entry.description.trim().length > 0,
      `INDEX route ${entry.path} has title + description`,
      `INDEX route ${entry.path} is missing title or description`,
    );
    check(
      entry.canonicalPath !== null && entry.canonicalPath.startsWith("/"),
      `INDEX route ${entry.path} has a valid canonicalPath`,
      `INDEX route ${entry.path} must have a canonicalPath starting with "/"`,
    );
  }
}

// --- 6. Priority within [0, 1]. -----------------------------------------------
for (const entry of seoRouteRegistry) {
  if (typeof entry.priority === "number") {
    check(
      entry.priority >= 0 && entry.priority <= 1,
      `priority of ${entry.path} within [0,1]`,
      `route ${entry.path} priority ${entry.priority} is out of range [0,1]`,
    );
  }
}

// --- 7. No duplicate paths. ---------------------------------------------------
{
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const entry of seoRouteRegistry) {
    if (seen.has(entry.path)) dups.add(entry.path);
    seen.add(entry.path);
  }
  check(
    dups.size === 0,
    `no duplicate registry paths`,
    `duplicate registry paths: ${Array.from(dups).join(", ")}`,
  );
}

// --- 8. No duplicate canonical paths among INDEX routes. ----------------------
{
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const entry of seoRouteRegistry) {
    if (entry.indexStatus !== "INDEX" || entry.canonicalPath === null) continue;
    if (seen.has(entry.canonicalPath)) dups.add(entry.canonicalPath);
    seen.add(entry.canonicalPath);
  }
  check(
    dups.size === 0,
    `no duplicate INDEX canonical paths`,
    `duplicate INDEX canonical paths: ${Array.from(dups).join(", ")}`,
  );
}

// --- 9. sitemap.xml exists and contains exactly the INDEX routes. -------------
const expectedSitemap = getSitemapRoutes();
const expectedLocs = new Set(
  expectedSitemap.map((r) => CANONICAL_ORIGIN + (r.canonicalPath ?? r.path)),
);
if (!existsSync(sitemapPath)) {
  errors.push(`sitemap.xml not found at ${sitemapPath} (run seo:generate)`);
} else {
  const sitemapSrc = readFileSync(sitemapPath, "utf8");
  const locs = Array.from(sitemapSrc.matchAll(/<loc>([^<]+)<\/loc>/g)).map(
    (m) => m[1],
  );
  check(
    locs.length === expectedSitemap.length,
    `sitemap.xml has ${expectedSitemap.length} url(s)`,
    `sitemap.xml has ${locs.length} url(s), expected ${expectedSitemap.length} — regenerate (seo:generate)`,
  );
  for (const loc of locs) {
    check(
      expectedLocs.has(loc),
      `sitemap loc ${loc} is an expected INDEX route`,
      `sitemap.xml contains unexpected/non-INDEX loc: ${loc}`,
    );
  }
  // Ensure no internal/pending/utility path leaked into the sitemap.
  for (const entry of seoRouteRegistry) {
    if (entry.indexStatus === "INDEX") continue;
    const leaked = locs.some((loc) => loc.endsWith(entry.path) && entry.path !== "/");
    check(
      !leaked,
      `non-INDEX route ${entry.path} absent from sitemap`,
      `non-INDEX route ${entry.path} leaked into sitemap.xml`,
    );
  }
  check(
    sitemapSrc.includes("<?xml") && sitemapSrc.includes("<urlset"),
    `sitemap.xml is well-formed (xml decl + urlset)`,
    `sitemap.xml missing xml declaration or <urlset>`,
  );
}

// --- 10/11. robots.txt references the sitemap and disallows INTERNAL routes. ---
if (!existsSync(robotsPath)) {
  errors.push(`robots.txt not found at ${robotsPath}`);
} else {
  const robotsSrc = readFileSync(robotsPath, "utf8");
  check(
    robotsSrc.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`),
    `robots.txt references the sitemap`,
    `robots.txt does not reference "Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml"`,
  );
  const disallowLines = Array.from(
    robotsSrc.matchAll(/^\s*Disallow:\s*(\S+)\s*$/gim),
  ).map((m) => m[1]);
  for (const entry of getRobotsDisallowRoutes()) {
    check(
      disallowLines.includes(entry.path),
      `robots.txt disallows internal route ${entry.path}`,
      `robots.txt is missing "Disallow: ${entry.path}" for INTERNAL route`,
    );
  }
  // Guard against an accidental site-wide block.
  check(
    !disallowLines.includes("/"),
    `robots.txt has no site-wide "Disallow: /"`,
    `robots.txt contains a broad "Disallow: /" — this would deindex the whole site`,
  );
}

// --- 12. Every route resolves to a deterministic, valid robots directive. -----
const VALID_ROBOTS = new Set([
  "index, follow",
  "noindex, follow",
  "noindex, nofollow",
]);
for (const entry of seoRouteRegistry) {
  const directive = getRobotsDirective(entry);
  check(
    VALID_ROBOTS.has(directive),
    `route ${entry.path} has a valid robots directive (${directive})`,
    `route ${entry.path} produced an unexpected robots directive: "${directive}"`,
  );
  if (entry.indexStatus === "INDEX") {
    check(
      directive === "index, follow",
      `INDEX route ${entry.path} is index,follow`,
      `INDEX route ${entry.path} must be "index, follow" but got "${directive}"`,
    );
  } else {
    check(
      directive.startsWith("noindex"),
      `non-INDEX route ${entry.path} is noindex`,
      `non-INDEX route ${entry.path} must be noindex but got "${directive}"`,
    );
  }
}

// --- 13. Catch-all / unknown route must be noindex. ---------------------------
{
  const catchAll = seoRouteRegistry.find((r) => r.path === "*");
  check(
    catchAll !== undefined && getRobotsDirective(catchAll).startsWith("noindex"),
    `catch-all "*" is noindex`,
    `catch-all "*" route is missing or not noindex`,
  );
}

// --- 14. /source must never become INDEX or enter the sitemap. ----------------
{
  const source = seoRouteRegistry.find((r) => r.path === "/source");
  check(
    source !== undefined &&
      source.indexStatus !== "INDEX" &&
      source.sitemap === false,
    `/source stays non-INDEX and out of the sitemap`,
    `/source must be non-INDEX with sitemap=false (Verified Introduction stays paused)`,
  );
}

// --- 15. index.html base metadata uses the canonical origin. ------------------
if (!existsSync(indexHtmlPath)) {
  errors.push(`index.html not found at ${indexHtmlPath}`);
} else {
  const indexSrc = readFileSync(indexHtmlPath, "utf8");
  check(
    !indexSrc.includes("syndicate-os.replit.app"),
    `index.html no longer references the old deploy origin`,
    `index.html still references "syndicate-os.replit.app" — reconcile to ${CANONICAL_ORIGIN}`,
  );
  check(
    indexSrc.includes(`${CANONICAL_ORIGIN}/opengraph.jpg`),
    `index.html OG/Twitter image uses the canonical origin`,
    `index.html OG/Twitter image must use "${CANONICAL_ORIGIN}/opengraph.jpg"`,
  );
  check(
    indexSrc.includes(`property="og:url" content="${CANONICAL_ORIGIN}/"`),
    `index.html default og:url uses the canonical origin`,
    `index.html must set default og:url to "${CANONICAL_ORIGIN}/"`,
  );
}

// --- resolveRouteHead contract (the 2.18C runtime metadata guarantees). --------
// These lock the canonical/og policy the SeoHeadManager relies on, so a future
// registry edit cannot silently break it without browser QA catching it.
for (const route of seoRouteRegistry) {
  const head = resolveRouteHead(route.path);
  if (route.indexStatus === "INDEX") {
    check(
      head.canonical === `${CANONICAL_ORIGIN}${route.canonicalPath ?? route.path}`,
      `resolveRouteHead("${route.path}") emits a self-canonical on the canonical origin`,
      `INDEX route "${route.path}" must resolve a canonical of "${CANONICAL_ORIGIN}${route.canonicalPath ?? route.path}" (got ${String(head.canonical)})`,
    );
    check(
      head.ogUrl === head.canonical,
      `resolveRouteHead("${route.path}") og:url matches its canonical`,
      `INDEX route "${route.path}" must have og:url === canonical (canonical=${String(head.canonical)}, ogUrl=${String(head.ogUrl)})`,
    );
  } else {
    check(
      head.canonical === null,
      `resolveRouteHead("${route.path}") (${route.indexStatus}) emits no canonical`,
      `non-INDEX route "${route.path}" must resolve canonical=null (got ${String(head.canonical)})`,
    );
  }
}

// --- SeoHeadManager must actually be mounted (the whole slice is inert otherwise).
check(
  appSrc.includes("SeoHeadManager"),
  `App.tsx mounts <SeoHeadManager />`,
  `App.tsx must import and render <SeoHeadManager /> or per-route metadata never updates`,
);

// --- Report. ------------------------------------------------------------------
console.log(`[seo:check] ${ok.length} checks passed.`);
if (errors.length > 0) {
  console.error(`[seo:check] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(
  `[seo:check] PASS — registry (${seoRouteRegistry.length} routes), sitemap (${expectedSitemap.length} INDEX), robots OK.`,
);
