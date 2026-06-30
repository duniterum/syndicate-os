// Generate artifacts/studio/public/sitemap.xml from the SEO route registry.
//
// Run with Node's native TypeScript support (Node >= 22.6 / 24):
//   pnpm --filter @workspace/studio run seo:generate
//
// The sitemap is DERIVED from `src/lib/seo-route-registry.ts` and must never be
// hand-edited. Only INDEX routes flagged sitemap=true are included.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  getSitemapRoutes,
  CANONICAL_ORIGIN,
} from "../src/lib/seo-route-registry.ts";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(): string {
  const routes = getSitemapRoutes();
  const urls = routes
    .map((route) => {
      const loc = xmlEscape(CANONICAL_ORIGIN + (route.canonicalPath ?? route.path));
      const lines = [`    <loc>${loc}</loc>`];
      if (route.changefreq) lines.push(`    <changefreq>${route.changefreq}</changefreq>`);
      if (typeof route.priority === "number") {
        lines.push(`    <priority>${route.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(here, "..", "public", "sitemap.xml");
const xml = buildSitemap();
writeFileSync(outPath, xml, "utf8");

const included = getSitemapRoutes().map((r) => r.canonicalPath ?? r.path);
console.log(`[seo:generate] wrote ${outPath}`);
console.log(
  `[seo:generate] ${included.length} INDEX route(s): ${included.join(", ")}`,
);
console.log(`[seo:generate] origin: ${CANONICAL_ORIGIN}`);
