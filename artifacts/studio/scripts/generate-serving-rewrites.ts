// Generate the studio server's clean-URL route table
// (server/routeTable.generated.json) FROM the SEO route registry — the ONE
// source of truth for routing, consumed at runtime by server/serve.mjs. Drift is
// caught by --check in the release gate, so a route added to the registry without
// regenerating fails the build instead of shipping a 404.
//
// Each PUBLIC/PENDING route (except home, served by index.html) maps both "/x"
// and "/x/" → "/x.html". The server serves those flat files directly; unmatched
// paths fall through to the real 404.html.
//
// HISTORY: until 2026-07 this also emitted the static-host
// [[services.production.rewrites]] block into artifact.toml. That block was
// retired when the studio moved from the platform's static handoff to
// server/serve.mjs (compression + caching); serve.mjs now owns routing, from
// this same registry-derived table. See artifact.toml for the switch.
//
// Node-loadable (Node >= 22.6 / 24), dependency-free:
//   pnpm --filter @workspace/studio run seo:rewrites          (write)
//   pnpm --filter @workspace/studio run seo:rewrites:check    (verify)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { seoRouteRegistry } from "../src/lib/seo-route-registry.ts";

/** The routes that get a clean-URL → flat-file entry: PUBLIC/PENDING, excluding home + catch-all. */
function rewriteRoutes(): string[] {
  return seoRouteRegistry
    .filter(
      (r) =>
        r.path !== "*" &&
        r.path !== "/" &&
        (r.routeType === "PUBLIC" || r.routeType === "PENDING"),
    )
    .map((r) => r.path.replace(/^\/+/, ""));
}

/** The clean-URL → flat-file map consumed by server/serve.mjs. Deterministic (registry order). */
function buildRouteTableJson(): string {
  const table: Record<string, string> = {};
  for (const slug of rewriteRoutes()) {
    table[`/${slug}`] = `/${slug}.html`;
    table[`/${slug}/`] = `/${slug}.html`;
  }
  return JSON.stringify(table, null, 2) + "\n";
}

const here = path.dirname(fileURLToPath(import.meta.url));
const routeTablePath = path.resolve(here, "..", "server", "routeTable.generated.json");
const nextJson = buildRouteTableJson();
const count = rewriteRoutes().length;

if (process.argv.includes("--check")) {
  const currentJson = existsSync(routeTablePath) ? readFileSync(routeTablePath, "utf8") : "";
  if (nextJson !== currentJson) {
    console.error(
      `[seo:rewrites] DRIFT — server/routeTable.generated.json is out of sync with the SEO registry (${count} route(s), ${count * 2} rules expected). Run: pnpm --filter @workspace/studio run seo:rewrites`,
    );
    process.exit(1);
  }
  console.log(
    `[seo:rewrites] OK — server route table matches the registry (${count} routes, ${count * 2} rules).`,
  );
} else {
  writeFileSync(routeTablePath, nextJson, "utf8");
  console.log(
    `[seo:rewrites] wrote ${count * 2} clean-URL rule(s) for ${count} route(s) → server/routeTable.generated.json`,
  );
}
