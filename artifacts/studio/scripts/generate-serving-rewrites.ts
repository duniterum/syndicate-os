// Generate the deploy-layer clean-URL rewrite rules in
// `.replit-artifact/artifact.toml` FROM the SEO route registry — one source of
// truth, so the rules can never drift from the prerendered routes and nobody
// hand-edits them (see the "one writer to the repo" standing rule in
// docs/00_START_HERE.md).
//
// Each PUBLIC/PENDING route (except home, served by index.html) gets two exact
// rewrites — `/route` and `/route/` → `/route.html` — so the static host serves
// the flat prerendered file directly (200, served URL == <link rel=canonical>),
// never a directory redirect. Unmatched paths fall through to the real 404.html.
//
// Modes:
//   (default) rewrite the generated block in artifact.toml in place.
//   --check   verify the file already matches (exit 1 on drift) — wired into
//             the release gate so a route added to the registry without
//             regenerating fails the build instead of shipping a 404.
//
// Node-loadable (Node >= 22.6 / 24), dependency-free:
//   pnpm --filter @workspace/studio run seo:rewrites          (write)
//   pnpm --filter @workspace/studio run seo:rewrites:check    (verify)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { seoRouteRegistry } from "../src/lib/seo-route-registry.ts";

const BEGIN =
  "# >>> GENERATED clean-URL rewrites — source: src/lib/seo-route-registry.ts (PUBLIC+PENDING, non-home).";
const END = "# <<< END generated clean-URL rewrites";
const ANCHOR = "[services.env]";

/** The routes that get a flat-file rewrite: PUBLIC/PENDING, excluding home + catch-all. */
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

/** Build the generated block (marker → rules → marker). Deterministic ordering = registry order. */
function buildBlock(): string {
  const lines: string[] = [
    BEGIN,
    "# Do NOT hand-edit. Regenerate: pnpm --filter @workspace/studio run seo:rewrites",
    "# (drift is caught by seo:rewrites:check in the release gate). Home is served",
    "# by index.html; unmatched paths fall through to the real 404.html.",
  ];
  for (const slug of rewriteRoutes()) {
    for (const from of [`/${slug}`, `/${slug}/`]) {
      lines.push(
        "",
        "[[services.production.rewrites]]",
        `from = "${from}"`,
        `to = "/${slug}.html"`,
      );
    }
  }
  lines.push("", END);
  return lines.join("\n");
}

/**
 * The SAME rewrite table as a JSON map for the studio's production Node server
 * (server/serve.mjs): every clean-URL path → its flat <route>.html. Generated
 * from the same rewriteRoutes() source so the server and the (static-era) TOML
 * rewrites can never diverge — the --check below guards BOTH outputs.
 */
function buildRouteTableJson(): string {
  const table: Record<string, string> = {};
  for (const slug of rewriteRoutes()) {
    table[`/${slug}`] = `/${slug}.html`;
    table[`/${slug}/`] = `/${slug}.html`;
  }
  return JSON.stringify(table, null, 2) + "\n";
}

const here = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.resolve(here, "..", ".replit-artifact", "artifact.toml");
const routeTablePath = path.resolve(here, "..", "server", "routeTable.generated.json");
const src = readFileSync(tomlPath, "utf8");

const anchorIdx = src.indexOf(ANCHOR);
if (anchorIdx === -1) {
  console.error(`[seo:rewrites] cannot find "${ANCHOR}" in artifact.toml — aborting (fail closed).`);
  process.exit(1);
}

// The generated region runs from the first of {BEGIN marker, a prior hand-written
// rewrites block, its Replit comment} up to the [services.env] anchor. This lets
// the first run subsume the hand-written rules and every later run replace the
// marker block cleanly.
function regionStart(): number {
  for (const needle of [
    BEGIN,
    "# Deploy-layer serving rules",
    "[[services.production.rewrites]]",
  ]) {
    const i = src.indexOf(needle);
    if (i !== -1 && i < anchorIdx) return i;
  }
  return anchorIdx; // no existing rules → insert at the anchor
}

const start = regionStart();
const next = `${src.slice(0, start)}${buildBlock()}\n\n${src.slice(anchorIdx)}`;
const count = rewriteRoutes().length;
const nextJson = buildRouteTableJson();
const currentJson = existsSync(routeTablePath) ? readFileSync(routeTablePath, "utf8") : "";

if (process.argv.includes("--check")) {
  const tomlDrift = next !== src;
  const jsonDrift = nextJson !== currentJson;
  if (tomlDrift || jsonDrift) {
    const which = [
      tomlDrift ? "artifact.toml" : null,
      jsonDrift ? "server/routeTable.generated.json" : null,
    ]
      .filter(Boolean)
      .join(" + ");
    console.error(
      `[seo:rewrites] DRIFT — ${which} out of sync with the SEO registry (${count} route(s), ${count * 2} rules expected). Run: pnpm --filter @workspace/studio run seo:rewrites`,
    );
    process.exit(1);
  }
  console.log(
    `[seo:rewrites] OK — artifact.toml + server route table match the registry (${count} routes, ${count * 2} rules).`,
  );
} else {
  writeFileSync(tomlPath, next, "utf8");
  writeFileSync(routeTablePath, nextJson, "utf8");
  console.log(
    `[seo:rewrites] wrote ${count * 2} clean-URL rewrite(s) for ${count} route(s) → artifact.toml + server/routeTable.generated.json`,
  );
}
