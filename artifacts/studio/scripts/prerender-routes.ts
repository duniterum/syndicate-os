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
  ORG_JSONLD_ID,
} from "../src/lib/seo-jsonld.ts";

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
/** Homepage-only JSON-LD (matches the runtime manager); strip on other routes. */
function setJsonLd(html: string, json: string | null): string {
  const re = new RegExp(`\\s*<script[^>]*id="${ORG_JSONLD_ID}"[\\s\\S]*?</script>`);
  const stripped = html.replace(re, "");
  if (json === null) return stripped;
  const safe = json.replace(/</g, "\\u003c");
  const tag = `<script type="application/ld+json" id="${ORG_JSONLD_ID}" data-seo-managed="true">${safe}</script>`;
  return stripped.replace(/<\/head>/, `    ${tag}\n  </head>`);
}

/** Bake a route's full <head> into the built index.html template. */
function renderRoute(template: string, location: string): string {
  const head = resolveRouteHead(location);
  let html = template;
  html = setTitle(html, head.title);
  html = setMetaName(html, "description", head.description);
  html = setMetaName(html, "robots", head.robots);
  html = setCanonical(html, head.canonical);
  html = setMetaProp(html, "og:title", head.title);
  html = setMetaProp(html, "og:description", head.description);
  html = setMetaProp(html, "og:url", head.ogUrl);
  html = setMetaProp(html, "og:image", head.ogImage);
  html = setMetaName(html, "twitter:card", head.twitterCard);
  html = setMetaName(html, "twitter:title", head.title);
  html = setMetaName(html, "twitter:description", head.description);
  html = setMetaName(html, "twitter:image", head.ogImage);
  html = setJsonLd(html, location === "/" ? serializeOrganizationJsonLd() : null);
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
  const html = renderRoute(template, route.path);
  let outPath: string;
  if (route.path === "/") {
    outPath = path.join(distDir, "index.html");
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
