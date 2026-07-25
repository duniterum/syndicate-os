// guard-fluid-surface.ts — THE EDGE-TO-EDGE FULL-SCREEN LAW, made structural.
// ---------------------------------------------------------------------------
// FOUNDER RULING (2026-07-25, the QuickNode benchmark): every app/data/chrome
// surface is FLUID FULL-WIDTH — `w-full` + the unified gutters
// `px-4 sm:px-6 lg:px-8`, NO fixed page cap. Wide screens are filled by
// MULTIPLYING COLUMNS (`.auto-grid` = auto-fit minmax), never by stretching one;
// readability is bounded by the RELATIVE `.measure` (68ch), never a fixed px/rem
// cap. Authority: CANON_ACCESS_MODEL §C (S7-d) + its 2026-07-25 amendment.
//
// THE NAMED DRIFT: Tailwind's `container mx-auto` utility re-introduces the exact
// FIXED per-breakpoint max-widths the ruling bans — the "narrow centered column
// with empty margins" that started this whole arc. It crept back onto the footer,
// PublicHome's bands, MemberAccess's door and the season band even after the
// header went edge-to-edge, so three width regimes coexisted. This guard makes a
// NEW `container mx-auto` a RED BUILD anywhere in studio src — the regime can
// never silently fork again.
//
// ALLOWLIST: the ONE consciously-deferred consumer (PublicPage's "prose" shell),
// whose 6 text/rail pages get their frame widened + reading-column treatment in
// the dedicated prose-harmonization slice. This entry is the live "page-cap debt"
// counter — it drops to zero when that slice lands, and the guard then runs with
// no allowlist at all.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

// file (repo-relative to src) → why this single occurrence is permitted, dated.
// EMPTY as of 2026-07-25: the prose shell was widened to a full-width frame + .measure,
// so the page-cap debt is ZERO — every surface is edge-to-edge with no `container mx-auto`.
const ALLOWLIST: Record<string, string> = {};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// `container` immediately paired with `mx-auto` (either order), the Tailwind
// fixed-breakpoint-max-width centering idiom — matched in raw text so it catches
// className attrs AND ternary string literals (e.g. PublicPage's shell).
const CONTAINER_RE = /\bcontainer\s+mx-auto\b|\bmx-auto\s+container\b/;

let failures = 0;
let scanned = 0;
let allowed = 0;

for (const file of walk(SRC)) {
  const rel = file.slice(SRC.length + 1).split("\\").join("/");
  const text = readFileSync(file, "utf8");
  scanned += 1;
  const lines = text.split("\n");
  lines.forEach((ln, i) => {
    if (!CONTAINER_RE.test(ln)) return;
    if (rel in ALLOWLIST) {
      allowed += 1;
      return;
    }
    failures += 1;
    console.error(
      `  ✗ ${rel}:${i + 1} — 'container mx-auto' reintroduces a FIXED per-breakpoint page cap ` +
        `(the banned narrow-column-with-empty-margins pattern). Use 'w-full px-4 sm:px-6 lg:px-8' ` +
        `(fluid full-width frame) and bound readability with '.measure' (68ch) or '.auto-grid'. ` +
        `CANON_ACCESS_MODEL §C.`,
    );
  });
}

if (failures > 0) {
  console.error(`[guard:fluid-surface] ${failures} FAILURE(S) across ${scanned} files.`);
  process.exit(1);
}
console.log(
  `[guard:fluid-surface] PASS — no fixed 'container mx-auto' page cap (${scanned} files scanned; ` +
    `${allowed} allowlisted deferred occurrence${allowed === 1 ? "" : "s"} — the page-cap debt counter).`,
);
