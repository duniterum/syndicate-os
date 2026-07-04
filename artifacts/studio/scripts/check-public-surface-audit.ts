// Public Surface Audit — release-readiness / anti-drift report.
//
// Run with Node's native TypeScript support (Node >= 22.6 / 24):
//   pnpm --filter @workspace/studio run surface:audit
//
// Purpose: in ONE place, show what every public route claims, whether it is
// indexed, whether it appears in header/footer nav + sitemap, and whether its
// truth posture is safe. It compares the EXISTING sources of truth — it invents
// no routes and adds no second route table:
//   - src/App.tsx                     (mounted router paths)
//   - src/lib/seo-route-registry.ts   (SEO/index posture — Node-loadable)
//   - src/config/modules.ts           (route/nav canon — parsed textually,
//                                       modules.ts imports lucide-react)
//   - src/config/navigation.ts        (header/footer curation — parsed textually)
//   - public/sitemap.xml, public/robots.txt
//
// It EXITS NON-ZERO ONLY on real safety/alignment problems (errors). Drift that
// is provably safe (e.g. an operator route linked from the footer but
// robots-disallowed + noindex + absent from the sitemap) is reported as a
// WARNING and does not fail the gate.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  seoRouteRegistry,
  getRoutePostureLabel,
  getRobotsDirective,
  CANONICAL_ORIGIN,
  type SeoRouteEntry,
} from "../src/lib/seo-route-registry.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = path.resolve(here, "..", "src", "config");
const appPath = path.resolve(here, "..", "src", "App.tsx");
const modulesPath = path.resolve(cfg, "modules.ts");
const navPath = path.resolve(cfg, "navigation.ts");
const sitemapPath = path.resolve(here, "..", "public", "sitemap.xml");
const robotsPath = path.resolve(here, "..", "public", "robots.txt");

const errors: string[] = [];
const warnings: string[] = [];
let checks = 0;

function ok(): void {
  checks++;
}
function expect(cond: boolean, failMsg: string): boolean {
  checks++;
  if (!cond) errors.push(failMsg);
  return cond;
}
function warn(msg: string): void {
  warnings.push(msg);
}

// --- Read the sources of truth. ----------------------------------------------
const appSrc = readFileSync(appPath, "utf8");
const modulesSrc = readFileSync(modulesPath, "utf8");
const navSrc = readFileSync(navPath, "utf8");

const routerPaths = new Set(
  Array.from(appSrc.matchAll(/path="([^"]+)"/g)).map((m) => m[1]),
);

// --- Parse modules.ts textually (it imports lucide-react → not Node-loadable). -
interface ParsedModule {
  id: string;
  path: string | null;
  visible: boolean;
  navHeader: boolean;
  navFooter: boolean;
  navSidebar: boolean;
  live: boolean;
  label: string | null;
  description: string | null;
}

const parsedModules: ParsedModule[] = [];
{
  const idMatches = Array.from(modulesSrc.matchAll(/\bid:\s*"([^"]+)"/g));
  for (let i = 0; i < idMatches.length; i++) {
    const start = idMatches[i].index ?? 0;
    const end =
      i + 1 < idMatches.length ? (idMatches[i + 1].index ?? modulesSrc.length) : modulesSrc.length;
    const block = modulesSrc.slice(start, end);
    const navBody = block.match(/\bnav:\s*\{([^}]*)\}/)?.[1] ?? "";
    parsedModules.push({
      id: idMatches[i][1],
      path: block.match(/\bpath:\s*"([^"]+)"/)?.[1] ?? null,
      visible: /\bvisible:\s*true\b/.test(block),
      navHeader: /header:\s*true/.test(navBody),
      navFooter: /footer:\s*true/.test(navBody),
      navSidebar: /sidebar:\s*true/.test(navBody),
      live: /\blive:\s*true\b/.test(block),
      label: block.match(/\blabel:\s*"([^"]+)"/)?.[1] ?? null,
      description: block.match(/\bdescription:\s*"([^"]*)"/)?.[1] ?? null,
    });
  }
}
const moduleById = new Map(parsedModules.map((m) => [m.id, m]));

// --- Parse navigation.ts curation (header spec ids + footer group item ids). --
const headerSpecBody = navSrc.match(/headerSpec[\s\S]*?=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
const headerIds = Array.from(headerSpecBody.matchAll(/id:\s*"([^"]+)"/g)).map((m) => m[1]);
const footerIds = new Set<string>();
for (const m of navSrc.matchAll(/itemIds:\s*\[([^\]]*)\]/g)) {
  for (const s of m[1].matchAll(/"([^"]+)"/g)) footerIds.add(s[1]);
}
const navIds = new Set<string>([...headerIds, ...footerIds]);

// Rendered nav membership by route path (mirrors navigation.ts runtime filters:
// header = spec id + module.visible; footer = spec id + module.visible + nav.footer).
function headerRenders(routePath: string): boolean {
  return headerIds.some((id) => {
    const m = moduleById.get(id);
    return m?.path === routePath && m.visible;
  });
}
function footerRenders(routePath: string): boolean {
  return Array.from(footerIds).some((id) => {
    const m = moduleById.get(id);
    return m?.path === routePath && m.visible && m.navFooter;
  });
}

// --- sitemap.xml + robots.txt. ------------------------------------------------
const sitemapSrc = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";
const sitemapLocs = new Set(
  Array.from(sitemapSrc.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]),
);
function inSitemapXml(entry: SeoRouteEntry): boolean {
  return sitemapLocs.has(CANONICAL_ORIGIN + (entry.canonicalPath ?? entry.path));
}

const robotsSrc = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "";
const robotsDisallow = new Set(
  Array.from(robotsSrc.matchAll(/^\s*Disallow:\s*(\S+)\s*$/gim)).map((m) => m[1]),
);

// --- Forbidden financial/gambling copy (founder check #9). --------------------
// Codes are matched with word boundaries; multi-word phrases stay specific so
// legitimate copy ("live chain", "financial reward" negations) is not tripped.
const FORBIDDEN: { label: string; re: RegExp }[] = [
  { label: "yield", re: /\byield\b/i },
  { label: "APY", re: /\bAPY\b/i },
  { label: "profit", re: /\bprofit(s|able|ability)?\b/i },
  { label: "ROI", re: /\bROI\b/i },
  { label: "passive income", re: /\bpassive\s+income\b/i },
  { label: "airdrop", re: /\bairdrop/i },
  { label: "claim reward", re: /\bclaim(ing)?\s+rewards?\b/i },
  { label: "referral bonus", re: /\breferral\s+bonus(es)?\b/i },
  { label: "downline", re: /\bdownline\b/i },
  { label: "casino", re: /\bcasino\b/i },
  { label: "lottery", re: /\blottery\b/i },
  { label: "guaranteed return", re: /\bguaranteed\s+returns?\b/i },
];

// --- Affirmative "this surface is live/launched" claims (founder check #10). ---
// High precision + negation-aware: only unambiguous launch-ANNOUNCEMENT phrases
// count, and only when NOT preceded by a negator. Honest copy is deliberately
// full of the word "live" — as a data-source adjective ("read the live
// membership engine", "live chain reads") or in truthful negations ("No protocol
// data is live yet", "NOINDEX until the model is live", "where help requests will
// live"). None of those may trip this check. Component-level live honesty is
// separately enforced by guard-no-fake-live.
const LIVE_CLAIM_PHRASES = [
  "now live",
  "is now live",
  "goes live",
  "going live",
  "officially live",
  "has launched",
  "fully operational",
];
const NEGATOR = /\b(no|not|never|until|yet|when|once|isn't|aren't|won't|would|will|soon|pending|awaiting)\b/i;

function claimsLiveWithoutWiring(text: string): boolean {
  const lower = text.toLowerCase();
  for (const phrase of LIVE_CLAIM_PHRASES) {
    let idx = lower.indexOf(phrase);
    while (idx !== -1) {
      const context = lower.slice(Math.max(0, idx - 40), idx);
      if (!NEGATOR.test(context)) return true;
      idx = lower.indexOf(phrase, idx + phrase.length);
    }
  }
  return false;
}

function scanForbidden(label: string, text: string): void {
  for (const f of FORBIDDEN) {
    if (f.re.test(text)) {
      errors.push(`${label}: forbidden copy "${f.label}" in metadata → ${JSON.stringify(text.slice(0, 120))}`);
    }
  }
}

// =============================================================================
// Report + checks.
// =============================================================================
const PUBLIC_TYPES = new Set(["PUBLIC", "PENDING"]);
const publicRoutes = seoRouteRegistry.filter((r) => PUBLIC_TYPES.has(r.routeType));
const internalRoutes = seoRouteRegistry.filter((r) => r.routeType === "INTERNAL");
const otherRoutes = seoRouteRegistry.filter(
  (r) => !PUBLIC_TYPES.has(r.routeType) && r.routeType !== "INTERNAL",
);

function yn(b: boolean): string {
  return b ? "yes" : "no";
}

interface Row {
  path: string;
  seo: string;
  sitemap: string;
  nav: string;
  footer: string;
  posture: string;
  verdict: string;
}
const rows: Row[] = [];

for (const entry of publicRoutes) {
  const rowErrorsBefore = errors.length;

  // 1. Route exists in App.tsx.
  expect(
    routerPaths.has(entry.path),
    `public route ${entry.path} is not mounted in App.tsx`,
  );

  const isIndex = entry.indexStatus === "INDEX";
  const inXml = inSitemapXml(entry);

  if (isIndex) {
    // 3. INDEX routes have canonicalPath and sitemap=true (and are in sitemap.xml).
    expect(
      entry.canonicalPath !== null && entry.canonicalPath.startsWith("/"),
      `INDEX route ${entry.path} must have a canonicalPath starting with "/"`,
    );
    expect(
      entry.sitemap === true,
      `INDEX route ${entry.path} must have sitemap=true`,
    );
    expect(
      inXml,
      `INDEX route ${entry.path} is missing from public/sitemap.xml (run seo:generate)`,
    );
  } else {
    // 4. Non-INDEX (PENDING) public routes must NOT be in the sitemap.
    expect(
      entry.sitemap === false,
      `${entry.indexStatus} route ${entry.path} must have sitemap=false`,
    );
    expect(
      !inXml,
      `${entry.indexStatus} route ${entry.path} leaked into public/sitemap.xml`,
    );
  }

  // 9. No forbidden copy in route metadata (SEO copy + module label/description).
  scanForbidden(`route ${entry.path} (seo)`, `${entry.title} ${entry.description} ${entry.notes ?? ""}`);
  const mod = moduleById.get(
    parsedModules.find((m) => m.path === entry.path)?.id ?? "",
  );
  if (mod) {
    scanForbidden(`route ${entry.path} (module)`, `${mod.label ?? ""} ${mod.description ?? ""}`);
  }
  ok(); // counted: forbidden-copy scan ran for this route

  // 10. No affirmative "surface is live/launched" claim unless the module is wired.
  const wired = mod?.live === true;
  const claimText = `${entry.title} ${entry.description} ${mod?.description ?? ""}`;
  expect(
    wired || !claimsLiveWithoutWiring(claimText),
    `route ${entry.path} claims live/launched status but module.live is not true (honesty drift)`,
  );

  const verdict = errors.length === rowErrorsBefore ? "PASS" : "FAIL";
  rows.push({
    path: entry.path,
    seo: entry.indexStatus,
    sitemap: yn(entry.sitemap),
    nav: yn(headerRenders(entry.path)),
    footer: yn(footerRenders(entry.path)),
    posture: `${getRoutePostureLabel(entry)} · ${entry.ownerSurface}`,
    verdict,
  });
}

// --- 5. Header/footer nav references only real, public-reachable routes. ------
for (const id of navIds) {
  const m = moduleById.get(id);
  if (!expect(m !== undefined, `nav references unknown module id "${id}"`)) continue;
  if (!expect(m!.path !== null, `nav module "${id}" has no path`)) continue;
  const entry = seoRouteRegistry.find((r) => r.path === m!.path);
  if (!expect(entry !== undefined, `nav route ${m!.path} (id "${id}") has no registry entry`)) continue;

  // 6. Internal routes should not be in public nav/footer. When one is (the
  //    operator-console teaser), it is only acceptable with full defense-in-depth
  //    (noindex + robots-disallow + absent from sitemap); otherwise it's a FAIL.
  if (entry!.routeType === "INTERNAL") {
    const noindex = getRobotsDirective(entry!).startsWith("noindex");
    const disallowed = robotsDisallow.has(entry!.path);
    const notSitemapped = entry!.sitemap === false && !inSitemapXml(entry!);
    const surfaces: string[] = [];
    if (headerRenders(m!.path)) surfaces.push("header");
    if (footerRenders(m!.path)) surfaces.push("footer");
    const where = surfaces.length ? surfaces.join("+") : "nav-spec";
    if (noindex && disallowed && notSitemapped) {
      warn(
        `internal route ${entry!.path} is linked from public ${where} — SAFE (noindex + robots-disallow + not in sitemap + operator build-gated) and appears intentional; remove id "${id}" from navigation.ts if it should be operator-only.`,
      );
    } else {
      errors.push(
        `internal route ${entry!.path} is in public ${where} WITHOUT full protection (noindex=${noindex}, robots-disallow=${disallowed}, not-sitemapped=${notSitemapped})`,
      );
    }
  }
}

// --- 7 + 8. Internal route posture: noindex + robots-disallow + not sitemapped. -
const internalRows: Row[] = [];
for (const entry of internalRoutes) {
  const before = errors.length;
  expect(
    getRobotsDirective(entry).startsWith("noindex"),
    `INTERNAL route ${entry.path} must resolve a noindex robots directive`,
  );
  expect(
    entry.sitemap === false && !inSitemapXml(entry),
    `INTERNAL route ${entry.path} must be absent from the sitemap`,
  );
  expect(
    robotsDisallow.has(entry.path),
    `INTERNAL route ${entry.path} must be Disallow-ed in robots.txt`,
  );
  scanForbidden(`route ${entry.path} (seo)`, `${entry.title} ${entry.description} ${entry.notes ?? ""}`);
  ok();
  internalRows.push({
    path: entry.path,
    seo: entry.indexStatus,
    sitemap: yn(entry.sitemap),
    nav: yn(headerRenders(entry.path)),
    footer: yn(footerRenders(entry.path)),
    posture: `${getRoutePostureLabel(entry)} · ${entry.ownerSurface}`,
    verdict: errors.length === before ? "PASS" : "FAIL",
  });
}

// --- Catch-all / utility routes: must be noindex + out of the sitemap. --------
for (const entry of otherRoutes) {
  expect(
    getRobotsDirective(entry).startsWith("noindex"),
    `${entry.routeType} route ${entry.path} must resolve a noindex robots directive`,
  );
  expect(
    entry.sitemap === false && !inSitemapXml(entry),
    `${entry.routeType} route ${entry.path} must be absent from the sitemap`,
  );
}

// =============================================================================
// Render.
// =============================================================================
function renderTable(title: string, data: Row[]): void {
  const cols: [keyof Row, string][] = [
    ["path", "route"],
    ["seo", "seo"],
    ["sitemap", "sitemap"],
    ["nav", "nav"],
    ["footer", "footer"],
    ["posture", "posture · surface"],
    ["verdict", "verdict"],
  ];
  const widths = cols.map(([key, head]) =>
    Math.max(head.length, ...data.map((r) => String(r[key]).length)),
  );
  const line = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join("  ");
  console.log(`\n${title}`);
  console.log(line(cols.map(([, h]) => h)));
  console.log(line(widths.map((w) => "-".repeat(w))));
  for (const r of data) console.log(line(cols.map(([k]) => String(r[k]))));
}

renderTable(
  `PUBLIC ROUTE AUDIT (${rows.length} public/pending routes)`,
  rows,
);
renderTable(
  `INTERNAL ROUTE POSTURE (${internalRows.length} operator routes — must be gated)`,
  internalRows,
);

if (warnings.length) {
  console.log(`\n[surface:audit] ${warnings.length} warning(s) (non-blocking):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

console.log(`\n[surface:audit] ${checks} checks run.`);
if (errors.length > 0) {
  console.error(`[surface:audit] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(
  `[surface:audit] PASS — ${rows.length} public routes aligned, ${internalRows.length} internal routes gated, sitemap/robots posture consistent.`,
);
