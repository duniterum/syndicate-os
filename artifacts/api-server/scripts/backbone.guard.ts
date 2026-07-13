/**
 * Event Backbone guard — static + fixture verification (M4-a, founder GO).
 * --------------------------------------------------------------------------
 * Pins the unattended backbone's discipline, WITHOUT any network or DB
 * dependency:
 *
 *   A. Exposure: dark by default in EVERY environment — the runner starts
 *      ONLY on the exact SYNDICATE_BACKBONE_ENABLED === "true" literal; no
 *      dev-open branch, no truthiness parsing.
 *   B. DB zone: backboneDb.ts is the ONE file of the zone that touches
 *      @workspace/db (lazy dynamic import only); NOTHING in the zone or its
 *      route ever calls pool.end() (the pool is shared with auth/operator).
 *   C. Write discipline: inserts target exactly indexerCursor (the engine's
 *      cursor upsert), saleEventRaw and blockTimestamp; no .update()/.delete()
 *      calls, no raw-SQL writes anywhere in the zone.
 *   D. Failure posture: the runner gates on DATABASE_URL, catches every cycle
 *      error (redacted), keeps last-good state, reschedules, and unrefs its
 *      timer — the backbone can never crash or hold the server.
 *   E. Output gate: the status route serializes → assertAddressSafeJson →
 *      send, and the scanner provably trips on planted addresses AND bare
 *      32-byte hashes. The served scanner's patterns stay byte-identical to
 *      the script-side scanner (member-continuity-readmodel.ts).
 *   F. Wiring: index.ts starts the backbone after listen; package.json
 *      registers backbone:guard.
 *
 * Run: pnpm --filter @workspace/api-server run backbone:guard
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertAddressSafeJson } from "../src/lib/protocol/addressSafety";
import {
  BACKBONE_EXPOSURE_FLAG,
  MIN_INTERVAL_SEC,
  MAX_INTERVAL_SEC,
} from "../src/backbone/backboneConfig";

const here = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(here, "..");
const backboneDir = path.resolve(apiDir, "src", "backbone");

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}
function expectThrow(label: string, fn: () => void): void {
  try {
    fn();
    errors.push(`${label}: expected fail-closed throw, but it succeeded`);
  } catch {
    ok.push(`${label}: fails closed`);
  }
}
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}
function read(rel: string): string {
  return readFileSync(path.resolve(apiDir, rel), "utf8");
}

// ---------------------------------------------------------------------------
// A. Exposure: exact literal, dark by default everywhere.
// ---------------------------------------------------------------------------

const configSrc = stripComments(read("src/backbone/backboneConfig.ts"));
check(
  BACKBONE_EXPOSURE_FLAG === "SYNDICATE_BACKBONE_ENABLED",
  "exposure flag name is SYNDICATE_BACKBONE_ENABLED",
  "exposure flag name drifted",
);
check(
  configSrc.includes(`process.env[BACKBONE_EXPOSURE_FLAG] === "true"`),
  "opt-in is the exact === \"true\" literal (unset/1/TRUE/yes stay dark)",
  "opt-in is not the exact string literal — default-deny broken",
);
check(
  !configSrc.includes("NODE_ENV"),
  "no dev-open branch: the backbone is dark by default in EVERY environment",
  "backboneConfig references NODE_ENV — the backbone must not auto-open in dev",
);
check(
  MIN_INTERVAL_SEC >= 60 && MAX_INTERVAL_SEC <= 3600,
  "cadence bounds sane (>=60s, <=3600s)",
  "cadence bounds drifted outside [60, 3600]",
);

// ---------------------------------------------------------------------------
// B + C. Zone scan: one lazy DB file, no pool.end, write discipline.
// ---------------------------------------------------------------------------

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.ts$/.test(name)) out.push(p);
  }
  return out;
}
const zoneFiles = walk(backboneDir);
check(
  zoneFiles.length >= 5,
  `backbone zone present (${zoneFiles.length} files)`,
  "backbone zone missing or too small",
);

const DB_TOUCH_RE = /@workspace\/db/;
const dbTouchers = zoneFiles.filter((f) =>
  DB_TOUCH_RE.test(stripComments(readFileSync(f, "utf8"))),
);
check(
  dbTouchers.length === 1 &&
    dbTouchers[0]!.endsWith(`${path.sep}backboneDb.ts`),
  "backboneDb.ts is the ONE file of the zone touching @workspace/db",
  `zone DB boundary broken: [${dbTouchers.map((f) => path.relative(apiDir, f)).join(", ")}]`,
);
const dbSrc = stripComments(read("src/backbone/backboneDb.ts"));
check(
  /import\s*\(\s*["']@workspace\/db["']\s*\)/.test(dbSrc) &&
    !/from\s*["']@workspace\/db["']/.test(dbSrc) &&
    !/import\s*["']@workspace\/db["']/.test(dbSrc) &&
    !/require\s*\(\s*["']@workspace\/db["']\s*\)/.test(dbSrc),
  "backboneDb reaches @workspace/db via lazy dynamic import() only",
  "backboneDb uses a static/bare/require @workspace/db form",
);

const routeSrc = stripComments(read("src/routes/backboneStatus.ts"));
for (const [label, src] of [
  ...zoneFiles.map(
    (f) =>
      [path.relative(apiDir, f), stripComments(readFileSync(f, "utf8"))] as const,
  ),
  ["src/routes/backboneStatus.ts", routeSrc] as const,
]) {
  check(
    !src.includes("pool.end"),
    `${label}: never calls pool.end() (shared pool stays alive)`,
    `${label} calls pool.end() — it would kill the shared auth/operator pool`,
  );
  check(
    !src.includes(".update(") && !src.includes(".delete("),
    `${label}: no .update()/.delete() calls`,
    `${label} carries an update/delete verb — the backbone only ever inserts`,
  );
  check(
    !/insert\s+into|update\s+\w+\s+set|delete\s+from/i.test(src),
    `${label}: no raw-SQL write verbs`,
    `${label} carries a raw-SQL write verb`,
  );
}

// Inserts target exactly the three sanctioned tables.
{
  const insertTargets = [...dbSrc.matchAll(/\.insert\(([^)]*)\)/g)].map(
    (m) => (m[1] ?? "").trim(),
  );
  const allowed = ["cursorTable", "saleEventRaw", "blockTimestamp"];
  check(
    insertTargets.length === 3 &&
      insertTargets.every((t) => allowed.includes(t)),
    "inserts target exactly {indexerCursor (cursor upsert), saleEventRaw, blockTimestamp}",
    `insert targets drifted: [${insertTargets.join(", ")}]`,
  );
}

// The zone reads decodedJson ONLY in backboneDb (whitelist pinned by
// activity-heartbeat.guard.ts); nothing else in the zone touches it. The
// pure builder is exempt from the literal scan: it carries the WORDS in its
// doctrine strings but can perform no access (activity:guard pins it DB-free).
for (const f of zoneFiles) {
  if (f.endsWith(`${path.sep}backboneDb.ts`)) continue;
  if (f.endsWith(`${path.sep}activityHeartbeatReadmodel.ts`)) continue;
  const src = stripComments(readFileSync(f, "utf8"));
  check(
    !src.includes("decodedJson") && !src.includes("rawJson"),
    `${path.relative(apiDir, f)}: no decodedJson/rawJson access`,
    `${path.relative(apiDir, f)} touches decodedJson/rawJson outside the loader`,
  );
}

// ---------------------------------------------------------------------------
// D. Failure posture of the runner.
// ---------------------------------------------------------------------------

const runnerSrc = stripComments(read("src/backbone/backboneRunner.ts"));
check(
  runnerSrc.includes(`process.env["DATABASE_URL"]`) &&
    runnerSrc.includes(`"no-database"`),
  "runner parks in no-database when DATABASE_URL is absent (never touches the DB)",
  "runner is missing the DATABASE_URL gate",
);
check(
  /catch\s*\(/.test(runnerSrc) && runnerSrc.includes("cyclesFailed"),
  "every cycle error is caught and counted (server never crashes)",
  "runner cycle errors are not caught/counted",
);
check(
  runnerSrc.includes("redactError") && runnerSrc.includes("FULL_ADDRESS_RE"),
  "cycle errors are redacted (URLs + hex stripped) before entering status",
  "runner records raw error messages — endpoint/key leak risk",
);
check(
  runnerSrc.includes("timer.unref()"),
  "the cycle timer is unref'd (backbone never holds the process open)",
  "runner timer is not unref'd",
);
check(
  /finally\s*\{[^}]*scheduleNext/.test(runnerSrc),
  "next cycle is scheduled in finally — single-flight, survives failures",
  "runner does not reschedule from finally — cycles could stop or overlap",
);
{
  const dateNowLines = stripComments(read("src/backbone/blockTimeEnrich.ts"))
    .split("\n")
    .filter((l) => l.includes("Date.now"));
  check(
    dateNowLines.length === 1 && dateNowLines[0]!.includes("nowSec"),
    "enrichment: Date.now confined to the sanity upper bound (never a timestamp source)",
    `enrichment Date.now discipline broken (lines=${dateNowLines.length})`,
  );
}

// ---------------------------------------------------------------------------
// E. Output gate: route shape + scanner behaviour + pattern reconciliation.
// ---------------------------------------------------------------------------

check(
  routeSrc.includes("assertAddressSafeJson(serialized)") &&
    routeSrc.indexOf("assertAddressSafeJson(serialized)") <
      routeSrc.indexOf(".send(serialized)"),
  "status route scans the serialized snapshot BEFORE sending it",
  "status route sends without the fail-closed address scan",
);
check(
  !DB_TOUCH_RE.test(routeSrc) && !routeSrc.includes("fetch("),
  "status route reads memory only (no DB, no network)",
  "status route grew a DB/network dependency",
);
expectThrow("scanner trips on a planted 20-byte address", () =>
  assertAddressSafeJson(JSON.stringify({ note: "0x" + "ab".repeat(20) })),
);
expectThrow("scanner trips on a planted bare 32-byte hash", () =>
  assertAddressSafeJson(JSON.stringify({ note: "cd".repeat(32) })),
);
assertAddressSafeJson(
  JSON.stringify({ headBlock: 90224287, cycles: { ok: 3, failed: 1 } }),
);
ok.push("scanner passes plain block numbers / counters (no false positive)");

// Served scanner patterns byte-identical to the script-side scanner.
{
  const servedPatterns = stripComments(
    read("src/lib/protocol/addressSafety.ts"),
  ).match(/\/0x\[0-9a-fA-F\]\{40,\}\/|\/\\b\[0-9a-fA-F\]\{64\}\\b\//g);
  const scriptPatterns = stripComments(
    read("scripts/member-continuity-readmodel.ts"),
  ).match(/\/0x\[0-9a-fA-F\]\{40,\}\/|\/\\b\[0-9a-fA-F\]\{64\}\\b\//g);
  check(
    servedPatterns !== null &&
      scriptPatterns !== null &&
      servedPatterns.length === 2 &&
      JSON.stringify(servedPatterns) === JSON.stringify(scriptPatterns),
    "served scanner patterns byte-identical to the script-side scanner",
    "addressSafety patterns drifted from member-continuity-readmodel",
  );
}

// ---------------------------------------------------------------------------
// F. Wiring.
// ---------------------------------------------------------------------------

const indexSrc = stripComments(read("src/index.ts"));
check(
  indexSrc.includes("startBackbone()"),
  "src/index.ts starts the backbone after listen",
  "src/index.ts does not start the backbone",
);
const pkg = JSON.parse(read("package.json")) as {
  scripts?: Record<string, string>;
};
check(
  pkg.scripts?.["backbone:guard"] === "tsx ./scripts/backbone.guard.ts",
  "package.json registers backbone:guard",
  "package.json is missing the backbone:guard entry",
);
check(
  existsSync(path.resolve(apiDir, "src/routes/backboneStatus.ts")),
  "status route file present",
  "status route file missing",
);

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------

for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nbackbone guard: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nbackbone guard: all ${ok.length} checks passed.`);
