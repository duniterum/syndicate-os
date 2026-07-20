// Prerender / SSG of the SHELL — Slice 2.0 (rendering fix).
//
// Runs AFTER `vite build` (wired into the studio `build` script). For each
// public route in the SEO registry it writes a FLAT `dist/public/<route>.html`
// (home stays `index.html`) = the built index.html with a per-route <head> baked
// into the SERVER HTML (title / description / robots / canonical / OG / Twitter)
// + Organization JSON-LD on the homepage. It also writes a real `404.html`.
//
// FLAT files, not `<route>/index.html` directories: a directory makes static
// hosts auto-redirect `/status` -> `/status/` (the directory redirect fires
// BEFORE any rewrite), which breaks "served URL == <link rel=canonical>". A flat
// file serves the no-slash path directly at 200 and needs no deploy-layer
// flattening. (Confirmed live on Replit, 2026-07-10.)
//
// HONEST SCOPE — this is NOT SSR. We never render React to a string (the app is
// `wagmi ssr:false`; SSR would break it). We inject the <head> + JSON-LD only;
// the SPA still hydrates #root at runtime and every live chain figure stays
// client-side. Nothing chain-derived is ever baked into this static HTML.
//
// ADDITIVE & REVERSIBLE — `vite build` output is untouched; per-route files are
// added on top afterwards. Rollback = drop the `&& node scripts/prerender-routes.ts`
// from the `build` script (and delete this file).
//
// SINGLE SOURCES OF TRUTH — routes/meta come from `src/lib/seo-route-registry.ts`
// (via resolveRouteHead) and the JSON-LD from `src/lib/seo-jsonld.ts`; this script
// invents no copy and no second route table.
//
// Node's native TypeScript support (Node >= 22.6 / 24), dependency-free:
//   pnpm --filter @workspace/studio run seo:prerender

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  seoRouteRegistry,
  resolveRouteHead,
} from "../src/lib/seo-route-registry.ts";
import {
  serializeOrganizationJsonLd,
  serializeWebSiteJsonLd,
  serializeBreadcrumbJsonLd,
  ORG_JSONLD_ID,
  WEBSITE_JSONLD_ID,
  BREADCRUMB_JSONLD_ID,
} from "../src/lib/seo-jsonld.ts";
import {
  serializeFaqJsonLd,
  FAQ_JSONLD_ID,
} from "../src/lib/seo-faq-jsonld.ts";
import {
  OG_IMAGE_ALT,
  OG_LOCALE,
  OG_SITE_NAME,
  X_HANDLE,
} from "../src/config/brand.ts";

// --- HTML head helpers. Escape for the two contexts we write into. -------------
function attr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
function text(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/** Replace the first match of `pattern`, or insert `tag` just before </head>. */
function replaceOrInsert(html: string, pattern: RegExp, tag: string): string {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/, `    ${tag}\n  </head>`);
}

function setTitle(html: string, value: string): string {
  return replaceOrInsert(html, /<title>[\s\S]*?<\/title>/, `<title>${text(value)}</title>`);
}
function setMetaName(html: string, name: string, content: string): string {
  const re = new RegExp(`<meta\\s+name="${name}"[^>]*>`);
  return replaceOrInsert(html, re, `<meta name="${name}" content="${attr(content)}" />`);
}
function setMetaProp(html: string, property: string, content: string): string {
  const re = new RegExp(`<meta\\s+property="${property}"[^>]*>`);
  return replaceOrInsert(html, re, `<meta property="${property}" content="${attr(content)}" />`);
}
/** Upsert or, when href is null (noindex routes), strip any canonical. */
function setCanonical(html: string, href: string | null): string {
  const re = /<link\s+rel="canonical"[^>]*>\s*/;
  if (href === null) return html.replace(re, "");
  return replaceOrInsert(html, re, `<link rel="canonical" href="${attr(href)}" />`);
}
/** Upsert-or-strip a keyed JSON-LD <script> (matches the runtime injectors). */
function setKeyedJsonLd(html: string, id: string, json: string | null): string {
  const re = new RegExp(`\\s*<script[^>]*id="${id}"[\\s\\S]*?</script>`);
  const stripped = html.replace(re, "");
  if (json === null) return stripped;
  const safe = json.replace(/</g, "\\u003c");
  const tag = `<script type="application/ld+json" id="${id}" data-seo-managed="true">${safe}</script>`;
  return stripped.replace(/<\/head>/, `    ${tag}\n  </head>`);
}
/** Route-specific JSON-LD: Organization + WebSite on the homepage, FAQPage on
 * /faq, BreadcrumbList on every INDEX route off-home (AUD-ROUTE — the builder
 * itself returns null for everything else; one policy, one source). */
function setRouteJsonLd(html: string, location: string): string {
  let out = setKeyedJsonLd(html, ORG_JSONLD_ID, location === "/" ? serializeOrganizationJsonLd() : null);
  out = setKeyedJsonLd(out, WEBSITE_JSONLD_ID, location === "/" ? serializeWebSiteJsonLd() : null);
  out = setKeyedJsonLd(out, FAQ_JSONLD_ID, location === "/faq" ? serializeFaqJsonLd() : null);
  out = setKeyedJsonLd(out, BREADCRUMB_JSONLD_ID, serializeBreadcrumbJsonLd(location));
  return out;
}

// ── Security meta (audit fix, founder-approved 2026-07-13) ───────────────────
// The pages are served by the static artifact layer (no Express in front), so
// the CSP ships as a <meta http-equiv> baked into every prerendered shell —
// PRODUCTION ONLY by construction (this script never touches dev/index.html
// source, so Vite dev-mode inline scripts keep working). Built against what
// the app actually loads:
//   script-src 'self'            — all JS is same-origin Vite chunks (JSON-LD
//                                  <script type="application/ld+json"> blocks
//                                  are data, exempt from script-src);
//   style-src  self + inline +   — compiled Tailwind (self), runtime-injected
//              fonts.googleapis    <style> tags from UI libs (inline), Google
//                                  Fonts CSS (the one external stylesheet);
//   font-src   fonts.gstatic     — the Google Fonts files (+ data: for any
//                                  lib-embedded font);
//   img-src    self data: https: — local brand assets + wallet-connector icons
//                                  served from wallet-provider CDNs;
//   connect-src self https: wss: — same-origin API, the public Avalanche RPCs,
//                                  and WalletConnect/relay sockets. Deliberately
//                                  scheme-wide: an over-narrow allowlist here
//                                  could silently break wallet connect (the
//                                  money path) — script-src stays the strict
//                                  XSS boundary.
// NOTE: frame-ancestors is IGNORED in a meta CSP by spec — anti-framing for
// PAGES must be set at the Replit serving layer (handoff note); the API
// already sends X-Frame-Options: DENY server-side.
const SECURITY_META = [
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'; form-action 'self'" />`,
  `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
].join("\n    ");

function setSecurityMeta(html: string): string {
  // Idempotent (a re-run reads the already-injected home shell as template):
  // strip BOTH prior injected tags, then insert the fresh block before </head>.
  const stripped = html
    .replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, "")
    .replace(/\s*<meta name="referrer"[^>]*>/, "");
  return stripped.replace(/<\/head>/, `    ${SECURITY_META}\n  </head>`);
}

/** Bake a route's full <head> into the built index.html template. */
function renderRoute(template: string, location: string): string {
  const head = resolveRouteHead(location);
  let html = template;
  html = setSecurityMeta(html);
  html = setTitle(html, head.title);
  html = setMetaName(html, "description", head.description);
  html = setMetaName(html, "robots", head.robots);
  html = setCanonical(html, head.canonical);
  html = setMetaProp(html, "og:title", head.title);
  html = setMetaProp(html, "og:description", head.description);
  html = setMetaProp(html, "og:url", head.ogUrl);
  html = setMetaProp(html, "og:image", head.ogImage);
  // AUD-ROUTE: attribution + a11y of every social card (one brand source).
  html = setMetaProp(html, "og:site_name", OG_SITE_NAME);
  html = setMetaProp(html, "og:locale", OG_LOCALE);
  html = setMetaProp(html, "og:image:alt", OG_IMAGE_ALT);
  html = setMetaName(html, "twitter:card", head.twitterCard);
  html = setMetaName(html, "twitter:site", X_HANDLE);
  html = setMetaName(html, "twitter:title", head.title);
  html = setMetaName(html, "twitter:description", head.description);
  html = setMetaName(html, "twitter:image", head.ogImage);
  html = setRouteJsonLd(html, location);
  return html;
}

// --- Locate the built shell. ---------------------------------------------------
const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "..", "dist", "public");
const templatePath = path.join(distDir, "index.html");

if (!existsSync(templatePath)) {
  console.error(
    `[seo:prerender] ${templatePath} not found — run \`vite build\` first.`,
  );
  process.exit(1);
}
const template = readFileSync(templatePath, "utf8");

// --- Which routes get a static shell. ------------------------------------------
// PUBLIC/INDEX → indexable shell (robots: index, follow).
// PENDING      → noindex shell (robots: noindex, follow; no canonical; not in the
//                sitemap) so the new real-404 fallback does not turn a reload of a
//                live client route (/recognition, /archive) into a hard 404.
// INTERNAL / catch-all → intentionally excluded (operator surfaces are build-gated
//                out of production; unmatched paths resolve to 404.html).
const routes = seoRouteRegistry.filter(
  (r) => r.path !== "*" && (r.routeType === "PUBLIC" || r.routeType === "PENDING"),
);

let written = 0;
for (const route of routes) {
  let html = renderRoute(template, route.path);
  // PARAM routes: the ONE shell serves every URL of the class, so a baked
  // og:url would be the literal pattern ("…/receipt/:txHash") — a URL the
  // serving layer 404s, and the address crawlers would canonicalize EVERY
  // share onto. Strip it: serve.mjs substitutes each url's OWN og:url (and
  // the painted card image — the painted-cards slice, 2026-07-20) into this
  // shell at serve time, and the runtime head manager stamps it for humans.
  if (route.path.includes("/:")) {
    html = html.replace(/\s*<meta property="og:url"[^>]*>/, "");
  }
  let outPath: string;
  if (route.path === "/") {
    outPath = path.join(distDir, "index.html");
  } else if (route.path.includes("/:")) {
    // PARAM route (the /receipt/{txHash} class, 2026-07-20): ONE shell serves
    // every shape-valid URL (serve.mjs param rules). ":" is illegal in Windows
    // file names, so the shell is named by the literal prefix (receipt.html);
    // the baked head is the entry's own (noindex, no canonical, static OG) —
    // per-URL heads are the engraved NEXT slice (painted preview cards).
    outPath = path.join(
      distDir,
      `${route.path.replace(/^\/+/, "").split("/:")[0]}.html`,
    );
  } else {
    // Flat file (e.g. /status -> status.html) — never a directory, so the static
    // host cannot auto-redirect /status -> /status/. Public routes are
    // single-segment today; dirname() keeps this correct if a nested route is
    // ever added, and fails closed nowhere (mkdir of an existing dir is a no-op).
    outPath = path.join(distDir, `${route.path.replace(/^\/+/, "")}.html`);
    mkdirSync(path.dirname(outPath), { recursive: true });
  }
  writeFileSync(outPath, html, "utf8");
  written++;
}

// --- Real 404 shell (noindex, nofollow; no canonical; no JSON-LD). -------------
// The file is branded + crawler-honest; the serving layer returns it with a real
// HTTP 404 status for unmatched paths (Replit handoff), replacing the soft-404.
const notFoundHtml = renderRoute(template, "/404");
writeFileSync(path.join(distDir, "404.html"), notFoundHtml, "utf8");

const indexCount = routes.filter((r) => r.indexStatus === "INDEX").length;
const pendingCount = routes.length - indexCount;
console.log(
  `[seo:prerender] wrote ${written} route shell(s) (${indexCount} INDEX, ${pendingCount} PENDING/noindex) + 404.html → ${distDir}`,
);
