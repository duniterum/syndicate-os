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

/** PARAM routes (paths containing "/:", the /receipt/{txHash} class,
 *  2026-07-20) are EXCLUDED from the literal table and emitted as param
 *  rules instead — serve.mjs step 3b serves the route's ONE shell for
 *  shape-valid tails only; any other tail under the prefix stays a real 404
 *  (the no-SPA-fallback invariant holds at its tightest). */
function isParamPath(p: string): boolean {
  return p.includes("/:");
}

/** The routes that get a clean-URL → flat-file entry: PUBLIC/PENDING, excluding home + catch-all + param routes. */
function rewriteRoutes(): string[] {
  return seoRouteRegistry
    .filter(
      (r) =>
        r.path !== "*" &&
        r.path !== "/" &&
        !isParamPath(r.path) &&
        (r.routeType === "PUBLIC" || r.routeType === "PENDING"),
    )
    .map((r) => r.path.replace(/^\/+/, ""));
}

/** The param-rule structures consumed by serve.mjs step 3b. Fail LOUD on any
 *  shape the serving layer could not enforce (a shapeless prefix would be a
 *  soft-200 wildcard — the exact class the invariant forbids). */
function paramRules(): { prefix: string; tailPattern: string; shell: string }[] {
  const rules: { prefix: string; tailPattern: string; shell: string }[] = [];
  const seenPrefixes = new Set<string>();
  for (const r of seoRouteRegistry) {
    if (r.path === "*" || !isParamPath(r.path)) continue;
    if (r.routeType !== "PUBLIC" && r.routeType !== "PENDING") continue;
    const m = r.path.match(/^\/([^/:]+)\/:[A-Za-z]+$/);
    if (!m) {
      throw new Error(
        `[seo:rewrites] param route ${r.path} must be exactly "/<segment>/:<param>" — extend this generator deliberately for deeper shapes`,
      );
    }
    if (!r.paramTailPattern) {
      throw new Error(
        `[seo:rewrites] param route ${r.path} declares no paramTailPattern — the serving layer refuses shapeless prefixes`,
      );
    }
    new RegExp(r.paramTailPattern); // throws at generate time on an invalid pattern
    const prefix = `/${m[1]}/`;
    // serve.mjs gives each prefix to exactly ONE rule (first match, then
    // 404) — a second rule under the same prefix would be silently
    // shadowed, so it fails HERE, at generate time, deliberately.
    if (seenPrefixes.has(prefix)) {
      throw new Error(
        `[seo:rewrites] duplicate param prefix ${prefix} — one prefix, one rule (extend serve.mjs deliberately before sharing a prefix)`,
      );
    }
    seenPrefixes.add(prefix);
    rules.push({
      prefix,
      tailPattern: r.paramTailPattern,
      shell: `/${m[1]}.html`,
    });
  }
  return rules;
}

/** The param-rule JSON consumed by server/serve.mjs. Deterministic (registry order). */
function buildParamRulesJson(): string {
  return JSON.stringify(paramRules(), null, 2) + "\n";
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
const paramRulesPath = path.resolve(here, "..", "server", "paramRoutes.generated.json");
const nextJson = buildRouteTableJson();
const nextParamJson = buildParamRulesJson();
const count = rewriteRoutes().length;
const paramCount = paramRules().length;

if (process.argv.includes("--check")) {
  const currentJson = existsSync(routeTablePath) ? readFileSync(routeTablePath, "utf8") : "";
  const currentParamJson = existsSync(paramRulesPath) ? readFileSync(paramRulesPath, "utf8") : "";
  if (nextJson !== currentJson || nextParamJson !== currentParamJson) {
    console.error(
      `[seo:rewrites] DRIFT — server/routeTable.generated.json or server/paramRoutes.generated.json is out of sync with the SEO registry (${count} literal route(s) + ${paramCount} param rule(s) expected). Run: pnpm --filter @workspace/studio run seo:rewrites`,
    );
    process.exit(1);
  }
  console.log(
    `[seo:rewrites] OK — server route table matches the registry (${count} routes, ${count * 2} rules + ${paramCount} param rule(s)).`,
  );
} else {
  writeFileSync(routeTablePath, nextJson, "utf8");
  writeFileSync(paramRulesPath, nextParamJson, "utf8");
  console.log(
    `[seo:rewrites] wrote ${count * 2} clean-URL rule(s) for ${count} route(s) + ${paramCount} param rule(s) → server/routeTable.generated.json · server/paramRoutes.generated.json`,
  );
}
