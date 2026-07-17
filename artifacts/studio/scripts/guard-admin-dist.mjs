// artifacts/studio/scripts/guard-admin-dist.mjs
// -----------------------------------------------------------------------------
// PUBLIC-SEES-ADMIN-NEVER — the dist-level guard (/admin-in-prod, Ruling ②).
// The named scar: five prior iterations leaked admin into the public frontend.
// This guard makes the class structurally dead at the BUILD OUTPUT level:
//
//   1. The ENTRY bundle (resolved from dist/public/index.html's script src —
//      never guessed) must contain NONE of the admin-vocabulary probes.
//   2. Every prerendered HTML shell (all *.html incl. 404.html) must contain
//      none of them either (the registry's INTERNAL entries are neutralized —
//      view-source at an INTERNAL path reads exactly like the catch-all 404).
//   3. The console must exist as its OWN chunk (OperatorConsole-*.js) — the
//      separate-chunk seam held; admin code did not fold into the entry.
//   4. The console chunk must still carry the OS-map banner probe — so the
//      probes stay meaningful (a probe set that matches nothing proves nothing).
//
// Runs at the END of the build (after precompress). Fails the build on a leak.
// Known carried nuance (recorded, deliberate): the wallet chunk carries the
// "Sign in as operator" menu-item string (OperatorSignInAction lives in the
// wallet module); it renders only inside the console's account menu. Moving it
// into the console graph touches the wallet module structure — its own slice.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "dist", "public");
const ASSETS = path.join(ROOT, "assets");

// Console-CODE / rendered-chrome / retired-fallback strings that must NEVER be
// in a public-facing default load — the genuinely dangerous class the neutral
// wall governs: their presence in the entry would mean the console code, the
// os-map/admin chrome, or the retired "surface exists" fallback leaked.
const PROBES = [
  "Internal preview is not enabled", // the retired fallback (admits a surface) — dead everywhere
  "INTERNAL FOUNDER PREVIEW",        // os-map internal banner — console chunk ONLY
  "Internal operator console",       // AdminShell help chrome — console chunk ONLY
];

// KNOWN, TRACKED, DELIBERATELY-EXCLUDED (Q39 — the immediate next sub-slice):
// the SHARED route/nav config (src/config/modules.ts) carries the operator
// modules' human labels/descriptions ("Admin Console", "Studio OS", "Operator
// console skeleton…"). Because /status + public chrome import modules.ts, those
// CONFIG-IDENTIFIER strings ride into the entry bundle — a PRE-EXISTING leak
// (predates the neutral wall), and NOT a rendered one: operator modules are
// header/footer-false and /status filters operator rows before render, so no
// public surface ever displays them. Killing it cleanly means relocating the
// operator display strings to a console-only source and threading the shared
// SurfaceMapSection's operator label as data — its own careful slice (Q39).
// This guard does NOT weaken the wall's new invariants; it scopes to the
// console-code class and leaves the config-label relocation to Q39.

const errors = [];
let checks = 0;
function check(cond, fail) {
  checks++;
  if (!cond) errors.push(fail);
}

// 1. Resolve the ENTRY bundle from the served HTML — never guessed.
const indexHtml = readFileSync(path.join(ROOT, "index.html"), "utf8");
const entryMatch = indexHtml.match(/src="\/assets\/(index-[A-Za-z0-9_-]+\.js)"/);
if (!entryMatch) {
  console.error("[guard:admin-dist] FAIL — cannot resolve the entry bundle from index.html");
  process.exit(1);
}
const entryName = entryMatch[1];
const entry = readFileSync(path.join(ASSETS, entryName), "utf8");
for (const probe of PROBES) {
  check(
    !entry.includes(probe),
    `entry bundle ${entryName} contains admin vocabulary ${JSON.stringify(probe)} — public-sees-admin-never violated`,
  );
}

// 2. Every prerendered HTML shell is admin-clean.
const shells = readdirSync(ROOT).filter((n) => n.endsWith(".html"));
for (const shell of shells) {
  const html = readFileSync(path.join(ROOT, shell), "utf8");
  for (const probe of PROBES) {
    check(
      !html.includes(probe),
      `shell ${shell} contains admin vocabulary ${JSON.stringify(probe)}`,
    );
  }
}

// 3. The console is its own chunk (the separate-chunk seam held).
const consoleChunks = readdirSync(ASSETS).filter(
  (n) => n.startsWith("OperatorConsole-") && n.endsWith(".js"),
);
check(
  consoleChunks.length === 1,
  `expected exactly one OperatorConsole-*.js chunk, found ${consoleChunks.length} — the separate-chunk seam broke`,
);

// 4. The probes stay meaningful: the console chunk carries the banner probe.
if (consoleChunks.length === 1) {
  const chunk = readFileSync(path.join(ASSETS, consoleChunks[0]), "utf8");
  check(
    chunk.includes("INTERNAL FOUNDER PREVIEW"),
    `console chunk ${consoleChunks[0]} lacks the OS-map banner probe — the probe set lost its proof target`,
  );
  check(
    !chunk.includes("Internal preview is not enabled"),
    "the retired fallback copy reappeared in the console chunk — the wall-violation class must stay dead",
  );
}

if (errors.length) {
  console.error(`[guard:admin-dist] ${errors.length} FAILURE(S) of ${checks} checks:`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(
  `[guard:admin-dist] PASS — ${checks} checks: entry (${entryName}) + ${shells.length} shells admin-clean; console isolated in ${consoleChunks[0]}.`,
);
