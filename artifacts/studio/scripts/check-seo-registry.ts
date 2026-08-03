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
  getRouteBreadcrumb,
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

// --- 14. Source split: /source is public, /os-source stays INTERNAL. ----------
// Public Online Integration MVP (founder-approved): /source is now the public
// Verified-Introduction link builder (read-only), while the operator source
// console moved to /os-source and must never be indexed.
{
  const source = seoRouteRegistry.find((r) => r.path === "/source");
  check(
    source !== undefined &&
      source.routeType === "PUBLIC" &&
      source.indexStatus === "INDEX" &&
      source.sitemap === true,
    `/source is the public Verified-Introduction link builder (INDEX, sitemapped)`,
    `/source must be PUBLIC/INDEX/sitemapped (public link builder)`,
  );
  const osSource = seoRouteRegistry.find((r) => r.path === "/os-source");
  check(
    osSource !== undefined &&
      osSource.routeType === "INTERNAL" &&
      osSource.indexStatus === "INTERNAL" &&
      osSource.sitemap === false,
    `/os-source stays INTERNAL and out of the sitemap`,
    `/os-source must be INTERNAL with sitemap=false (operator console)`,
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
  // AUD-ROUTE (2026-07-17): the template description must MIRROR the registry
  // "/" entry — the old template carried a dead-era text ("read-only,
  // fail-closed") for five slices while the registry moved on; one homepage
  // description, one source, parity guarded.
  const homeEntry = seoRouteRegistry.find((r) => r.path === "/");
  check(
    homeEntry !== undefined &&
      indexSrc.includes(`name="description" content="${homeEntry.description}"`),
    `index.html base description mirrors the registry "/" entry verbatim`,
    `index.html's <meta name="description"> must equal the registry "/" description verbatim (the dev-served template must never drift from the canon head)`,
  );
  // Pre-S3 audit (2026-07-24): the S2c-② sync missed og:/twitter: — the same
  // one-source law covers ALL THREE description metas, guarded here.
  check(
    homeEntry !== undefined &&
      indexSrc.includes(`property="og:description" content="${homeEntry.description}"`),
    `index.html og:description mirrors the registry "/" entry verbatim`,
    `index.html's <meta property="og:description"> must equal the registry "/" description verbatim`,
  );
  check(
    homeEntry !== undefined &&
      indexSrc.includes(`name="twitter:description" content="${homeEntry.description}"`),
    `index.html twitter:description mirrors the registry "/" entry verbatim`,
    `index.html's <meta name="twitter:description"> must equal the registry "/" description verbatim`,
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
  } else if (route.indexStatus === "REDIRECT") {
    // AUD-ROUTE (2026-07-17): the REDIRECT class MUST emit its cross-canonical
    // — the consolidation the alias entry documents (noindex,follow +
    // cross-canonical). Before this, the old blanket null-check actively
    // enforced the gap the audit found.
    check(
      route.canonicalPath !== null && route.canonicalPath !== route.path,
      `REDIRECT route "${route.path}" declares a CROSS canonicalPath`,
      `REDIRECT route "${route.path}" must declare a canonicalPath pointing at its target (never itself, never null)`,
    );
    const target = seoRouteRegistry.find((r) => r.path === route.canonicalPath);
    check(
      target !== undefined && target.indexStatus === "INDEX",
      `REDIRECT route "${route.path}" canonicalizes into a registered INDEX route`,
      `REDIRECT route "${route.path}" must point its canonical at a registered INDEX route (never into a noindex page) — got target "${String(route.canonicalPath)}"`,
    );
    check(
      head.canonical === `${CANONICAL_ORIGIN}${route.canonicalPath}`,
      `resolveRouteHead("${route.path}") emits the cross-canonical to its target`,
      `REDIRECT route "${route.path}" must resolve canonical="${CANONICAL_ORIGIN}${String(route.canonicalPath)}" (got ${String(head.canonical)})`,
    );
    check(
      head.ogUrl === head.canonical,
      `resolveRouteHead("${route.path}") og:url matches its cross-canonical`,
      `REDIRECT route "${route.path}" must have og:url === canonical`,
    );
  } else {
    check(
      head.canonical === null,
      `resolveRouteHead("${route.path}") (${route.indexStatus}) emits no canonical`,
      `non-INDEX route "${route.path}" must resolve canonical=null (got ${String(head.canonical)})`,
    );
  }
}

// --- THE BREADCRUMB TRAIL (founder: Option A + "oui Q2 pour tout", 2026-07-28).
// The trail is what BOTH the visible breadcrumb and the BreadcrumbList JSON-LD
// read, so one resolver has to be right for two consumers. Pinned here, written
// BEFORE the resolver changed and watched fail.
//
// THE DEFECT IT ENCODES: the trail used to be two levels by construction, so the
// FIVE /referral/* pages all resolved to "Home › Referral Program" — the same
// answer on five different pages, from the one component whose only job is to say
// where you are.
//
// AND THE FAIL-CLOSED RULE: a parent crumb appears ONLY when that parent is a real
// registry route. /referral and /admin exist; /receipt does NOT, so
// /receipt/:txHash must never grow a crumb that links to a 404.
{
  // A shape-VALID sample: the matcher now enforces paramTailPattern, so a short
  // fake hash is (correctly) not a receipt at all.
  const VALID_RECEIPT = "/receipt/0x" + "a".repeat(64);
  const labelsOf = (loc: string) => getRouteBreadcrumb(loc).trail.map((c) => c.label);
  const pathsOf = (loc: string) => getRouteBreadcrumb(loc).trail.map((c) => c.path);

  const trailCases: Array<[string, string[], string]> = [
    ["/", ["Home"], "the front door is one crumb and links nowhere"],
    ["/join", ["Home", "Join The Syndicate"], "a flat route stays two levels"],
    ["/contracts", ["Home", "Contracts & Holdings"], "a flat route stays two levels"],
    ["/referral", ["Home", "Referral Program"], "the parent itself is two levels"],
    ["/referral/link", ["Home", "Referral Program", "Channels"], "a nested route gains its parent"],
    ["/referral/commissions", ["Home", "Referral Program", "Commissions"], "and each child keeps its OWN name"],
  ];
  for (const [loc, want, why] of trailCases) {
    const got = labelsOf(loc);
    check(
      JSON.stringify(got) === JSON.stringify(want),
      `breadcrumb trail for "${loc}" is ${JSON.stringify(got)} — ${why}`,
      `breadcrumb trail for "${loc}" must be ${JSON.stringify(want)}, got ${JSON.stringify(got)}`,
    );
  }

  // The five referral children must no longer share one answer.
  const referralChildren = ["/referral/link", "/referral/introductions", "/referral/commissions", "/referral/ladder", "/referral/tools"];
  const lastCrumbs = referralChildren.map((p) => labelsOf(p).at(-1));
  check(
    new Set(lastCrumbs).size === referralChildren.length,
    `the ${referralChildren.length} /referral/* pages each end on their own crumb`,
    `the /referral/* pages must not share a final crumb — got ${JSON.stringify(lastCrumbs)}`,
  );

  // THE NEUTRAL WALL OUTRANKS THE TRAIL (found by sweeping every route's trail
  // after the parent level landed, 2026-07-28 — my own regression, not a
  // pre-existing one). INTERNAL routes deliberately carry NEUTRAL_WALL_TITLE so
  // view-source at an admin path reads exactly like the catch-all 404 (Ruling ②);
  // `getRouteLabel` therefore returns "Page Not Found" for BOTH the parent and the
  // child, and adding a parent level turned the console's breadcrumb into
  // "Home > Page Not Found > Page Not Found" on all ten admin screens. An internal
  // route gets NO parent crumb: the registry cannot name it without leaking the
  // admin vocabulary the wall exists to keep out of the public bundle.
  for (const loc of ["/admin/members", "/admin/settings", "/admin/audit"]) {
    check(
      labelsOf(loc).length === 2,
      `internal route "${loc}" gets no parent crumb (the neutral wall has no label to give)`,
      `internal route "${loc}" must stay two levels — got ${JSON.stringify(labelsOf(loc))}; the neutral wall makes every crumb read "Page Not Found"`,
    );
  }

  // A SHAPE-INVALID PARAM TAIL IS NOT THAT ROUTE (founder review, 2026-07-28).
  // matchesParamPath accepted ANY non-empty tail, so /receipt/junk resolved to the
  // receipt entry and the new public breadcrumb rendered "Home > Receipts >
  // Membership Receipt" ON TOP OF the not-found body PublicReceipt deliberately
  // renders for a bad hash. The authoritative shape already existed twice — the
  // registry's own `paramTailPattern` and PublicReceipt's TX_SHAPE_RE — and the
  // matcher read neither: three answers to "what is a valid receipt tail", and the
  // breadcrumb picked the laxest.
  {
    const good = "/receipt/0x" + "a".repeat(64);
    check(
      JSON.stringify(labelsOf(good)) === JSON.stringify(["Home", "Receipts", "Membership Receipt"]),
      `a shape-VALID receipt tail still resolves to the receipt trail`,
      `a valid receipt tail must read Home > Receipts > Membership Receipt, got ${JSON.stringify(labelsOf(good))}`,
    );
    for (const bad of ["/receipt/junk", "/receipt/0xabc", "/receipt/" + "0x" + "a".repeat(63), "/receipt/0xZZ" + "a".repeat(62)]) {
      check(
        getRouteBreadcrumb(bad).isNotFound === true,
        `shape-invalid tail "${bad}" resolves to the catch-all, not to the receipt route`,
        `"${bad}" must resolve to the catch-all — the breadcrumb otherwise claims a receipt the page renders as not found; got ${JSON.stringify(labelsOf(bad))}`,
      );
    }
  }

  // THE CRUMB LABELS ARE PINNED TO THE TAB LABELS — the guard the registry's own
  // comment promised and nobody had written (2026-07-28 review: "no script
  // anywhere references MemberReferralDashboard's TABS"). Only two of the five
  // values were asserted; a typo in the other three shipped green. The tab list is
  // the SOURCE — the surface a member actually reads — so the registry must agree
  // with it, verbatim, or this build is red.
  {
    const dash = readFileSync(
      path.resolve(here, "..", "src", "components", "referral", "MemberReferralDashboard.tsx"),
      "utf8",
    );
    // COMMENTED-OUT CODE IS NOT LIVE DATA (2026-07-29 review). This reader scraped
    // label/href pairs out of the raw block, so a commented-out tab was read as a
    // real one. It could BOTH mask the drift this pin exists to catch and turn a
    // correct build RED — and because a later `set` overwrites an earlier one, the
    // outcome depended on whether the comment sat above or below the real line.
    // Comments are stripped before the pairs are read.
    // The block pass is LINE-COMMENT-AWARE (2026-08-03, the b2a8bbb disease):
    // a `/*` inside a `//` note (the `/referral/*` glob idiom) must never open
    // a phantom block across the entries — with these fail-closed pins a
    // phantom reads as a MISSING TAB and turns a CORRECT build red. The
    // whole-line `//` delete below is unchanged (commented-out tabs are not
    // live data — 2026-07-29).
    function stripTabsComments(raw: string): string {
      let kept = "";
      for (let i = 0; i < raw.length; ) {
        if (raw[i] === "/" && raw[i + 1] === "/") {
          let nl = raw.indexOf("\n", i);
          if (nl === -1) nl = raw.length;
          kept += raw.slice(i, nl);
          i = nl;
        } else if (raw[i] === "/" && raw[i + 1] === "*") {
          const close = raw.indexOf("*/", i + 2);
          if (close === -1) {
            kept += raw.slice(i, i + 2); // unclosed opener: the old regex kept it
            i += 2;
            continue;
          }
          i = close + 2;
        } else {
          kept += raw[i];
          i += 1;
        }
      }
      return kept.replace(/^[^\n]*\/\/.*$/gm, "");
    }
    const rawTabsBlock = /const TABS[^=]*=\s*\[([\s\S]*?)\n\];/.exec(dash)?.[1] ?? null;
    const block = rawTabsBlock === null ? null : stripTabsComments(rawTabsBlock);
    check(
      block !== null,
      `MemberReferralDashboard's TABS block is readable (the crumb labels are pinned to it)`,
      `MemberReferralDashboard's TABS block could not be parsed — the crumbLabel pin cannot be checked. Keep the block shape or update this reader in the SAME commit.`,
    );
    if (block !== null) {
      const tabLabel = new Map();
      for (const m of block.matchAll(/label:\s*"([^"]+)",\s*href:\s*"([^"]+)"/g)) tabLabel.set(m[2], m[1]);
      let pinned = 0;
      for (const entry of seoRouteRegistry) {
        if (!entry.path.startsWith("/referral/")) continue;
        const want = tabLabel.get(entry.path);
        check(
          want !== undefined,
          `"${entry.path}" has a tab in MemberReferralDashboard`,
          `"${entry.path}" carries a crumbLabel but no TAB names it — the two lists have drifted`,
        );
        if (want === undefined) continue;
        pinned += 1;
        check(
          entry.crumbLabel === want,
          `crumbLabel for "${entry.path}" is the tab's own label ("${want}")`,
          `crumbLabel for "${entry.path}" is ${JSON.stringify(entry.crumbLabel)} but its TAB reads ${JSON.stringify(want)} — the breadcrumb and the page would name the same screen differently`,
        );
      }
      check(
        pinned === 5,
        `all 5 /referral/* crumb labels are pinned to their tab`,
        `expected 5 pinned /referral/* crumb labels, checked ${pinned}`,
      );
    }
  }

  // Fail-closed: never a crumb pointing at a path the registry does not serve.
  const registryPaths = new Set(seoRouteRegistry.map((r) => r.path));
  for (const loc of [VALID_RECEIPT, "/referral/link", "/join", "/"]) {
    const linked = pathsOf(loc).slice(0, -1); // every crumb except the current page
    const bad = linked.filter((p) => !registryPaths.has(p));
    check(
      bad.length === 0,
      `every linked crumb for "${loc}" is a real registry route`,
      `"${loc}" links crumb(s) the registry does not serve: ${JSON.stringify(bad)} — a breadcrumb may never point at a 404`,
    );
  }
  // FOUNDER-CORRECTED 2026-07-28: "receipt existe dans le menu gauche des membres
  // donc il doit avoir son /receipt link?!" — and he is right. My rule derived the
  // parent from the first PATH SEGMENT, so it looked for "/receipt" (singular),
  // which is indeed not a route, and concluded a single receipt has no parent. The
  // parent exists and is spelled differently: "/receipts" — the member's receipts
  // binder, live, INDEX, and the "Receipts" door in config/memberDoors.ts. A
  // derivation that only knows how to spell is not a derivation; the entry now
  // DECLARES its parent, and the fail-closed check below still proves that parent
  // is a route the registry really serves.
  check(
    JSON.stringify(labelsOf(VALID_RECEIPT)) === JSON.stringify(["Home", "Receipts", "Membership Receipt"]),
    `"/receipt/:txHash" sits under its real parent, the /receipts binder`,
    `"/receipt/:txHash" must read Home › Receipts › Membership Receipt, got ${JSON.stringify(labelsOf(VALID_RECEIPT))}`,
  );
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
