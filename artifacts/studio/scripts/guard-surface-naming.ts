// Guard: surface-naming canon (BLOCKING).
// ---------------------------------------------------------------------------
// Holds studio user-facing source to config/surfaceNaming.ts — the words the
// USER reads for the surfaces that reached FIFTY-TWO sites under eleven names.
// Surface naming had no guard; that is why it sprawled. This is the guard.
//
// FOUNDER-APPROVED SCOPE (2026-07-11, frozen in the recognition-live handoff):
//   • rendered labels the user reads → RENAME to the surfaceNames canon;
//   • agent prose / comments        → REWORD;
//   • internal id-key values (e.g. registryId:"member-cockpit", id:"public-
//     cockpit") → KEEP — not user-read; renaming breaks lookups for nothing;
//   • config/routeMemory.ts → KEEP + EXEMPT the whole file (recording old names
//     IS its job — a guard that flags the rename ledger is a stupid guard);
//   • file names + import paths → OUT OF SCOPE.
// The keep-vs-rename line is drawn MECHANICALLY: a banned term is a violation
// only as PROSE — bounded by non-identifier chars. When it is adjacent to
// "-", "_" or an alphanumeric it is part of a larger identifier/slug (a kept
// id-key like "member-cockpit", or camelCase like "MemberCockpit") and is left
// untouched. Multi-word banned terms ("member os", "control tower") contain a
// space and so only ever match prose.
//
// Node-loadable (Node >= 22.6 / 24); imports only the type-free config.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  surfaceNames,
  bannedSurfaceNames,
  surfaceNamingRationale,
} from "../src/config/surfaceNaming.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

// The config NAMES the banned terms to ban them; routeMemory RECORDS old names
// by design. Both are exempt from the scan.
const EXEMPT = new Set([
  path.resolve(srcDir, "config", "surfaceNaming.ts"),
  path.resolve(srcDir, "config", "routeMemory.ts"),
]);

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

// ── 1. The canon is declared and carries its WHY ────────────────────────────
check(
  surfaceNames.memberHome === "Member Home" &&
    surfaceNames.identityBlock === "Your Seat" &&
    surfaceNames.headerLink === "Membership" &&
    surfaceNames.console === "Console" &&
    surfaceNames.introductionNetwork === "My Syndicate",
  "surfaceNames canon intact (Member Home · Your Seat · Membership · Console · My Syndicate)",
  "surfaceNames canon drifted from the founder decision",
);
check(
  ["cockpit", "member os", "control tower", "proof surface"].every((t) =>
    bannedSurfaceNames.includes(t),
  ),
  "bannedSurfaceNames carries the core banned terms",
  "bannedSurfaceNames lost a core term",
);
check(
  surfaceNamingRationale.trim().length > 0,
  "the WHY (surfaceNamingRationale) is declared",
  "surfaceNamingRationale is empty — the reason must never be lost",
);

// ── 2. The scan ─────────────────────────────────────────────────────────────
function bannedRegex(term: string): RegExp {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // identifier-exempt: not preceded/followed by a word char, "_" or "-".
  return new RegExp(`(?<![\\w-])${esc}(?![\\w-])`, "i");
}
const matchers = bannedSurfaceNames.map((t) => ({ term: t, re: bannedRegex(t) }));

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
}
const files: string[] = [];
walk(srcDir, files);

const hits: string[] = [];
for (const f of files) {
  if (EXEMPT.has(f)) continue;
  const rel = path.relative(srcDir, f).split(path.sep).join("/");
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((line, i) => {
      // out of scope: import / from / require lines (file names are fine).
      if (/^\s*import\b|\bfrom\s*["']|require\s*\(/.test(line)) return;
      for (const { term, re } of matchers) {
        if (re.test(line)) {
          hits.push(`${rel}:${i + 1}  [${term}]  ${line.trim().slice(0, 84)}`);
        }
      }
    });
}
check(
  hits.length === 0,
  `no banned surface name in user-facing source (${files.length} .ts/.tsx scanned)`,
  `banned surface names still present (${hits.length}) — RENAME rendered labels, REWORD prose, KEEP id-keys:\n  ${hits.join("\n  ")}`,
);

// ── report ──────────────────────────────────────────────────────────────────
for (const o of ok) console.log(`[PASS] ${o}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`[FAIL] ${e}`);
  console.error(`\nguard-surface-naming: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nguard-surface-naming: all ${ok.length} checks passed.`);
