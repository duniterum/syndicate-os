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
 *   G. Feed (M4-b): the projection is identity-blind (no member numbers, no
 *      log indexes), every verify anchor is EXACT-shape validated (an
 *      address can never pass), the feed gate masks only validated anchors
 *      and strict-scans the rest, newest-first + hard cap hold, and the
 *      route scans before sending.
 *   I. Treasury (H2-⑦): THE FOLD LAW holds — a treasury transfer inside an
 *      already-narrated transaction (purchase, lp, burn, archive) is folded,
 *      never a second line; genuine acts classify in/out/internal from the
 *      organ set (never from the stream); organ addresses NEVER reach the
 *      feed (labels only); the SYN decoder yields burn-address logs to the
 *      burn lane (the numbered record stays sovereign).
 *   H. Milestones (H2-⑬): the 11 canon defs hold (ids, vocabulary — always
 *      "routed", never fundraising register), crossings anchor to the EXACT
 *      transaction (USDC cumsum · seat ordinal · first mint), the live
 *      cross-check WITHHOLDS a contradicted milestone (fail-closed), a
 *      missing purchase amount fails the build closed, and milestone lines
 *      rank newer than their underlying event on a shared anchor.
 *   J. Eras (H2-⑫): the witness pattern holds — a transition anchors to the
 *      first purchase of the new era; the birth era is never a line; an era
 *      regression fails closed; the live currentEra() read withholds a
 *      contradicted transition; and NO approaching/progress shape exists
 *      (era bounds are bytecode, never framed as scarcity pressure).
 *   K. Capital axis (H2-⑰): the founder-named 12-rung register holds
 *      (thresholds ascending, $5 base); the RED LINE is structural (no
 *      financial-benefit vocabulary in the module — recognition only); the
 *      base rung never lines; one purchase crossing several rungs yields
 *      ONE line (the highest); V1 rows are excluded with an honest note;
 *      and NO approaching/progress shape exists.
 *
 * Run: pnpm --filter @workspace/api-server run backbone:guard
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertAddressSafeJson } from "../src/lib/protocol/addressSafety";
import {
  PROTOCOL_EVENT_SCAN_TARGETS,
  FINANCIAL_TARGETS,
} from "../src/data/protocolTargets";
import {
  BACKBONE_EXPOSURE_FLAG,
  MIN_INTERVAL_SEC,
  MAX_INTERVAL_SEC,
} from "../src/backbone/backboneConfig";
import { buildActivityHeartbeatReadModel } from "../src/backbone/activityHeartbeatReadmodel";
import { buildProtocolEventReadModel } from "../src/backbone/protocolEventReadmodel";
import {
  PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE,
  PROTOCOL_SCAN_CHUNK_DELAY_MS,
} from "../src/backbone/protocolEventScan";
import {
  buildPublicFeed,
  assertFeedSafeJson,
  FEED_MAX_ITEMS,
  TX_HASH_SHAPE_RE,
  sliceFeedPage,
} from "../src/backbone/feedProjection";
import {
  buildMilestoneReadModel,
  PROTOCOL_MILESTONES,
} from "../src/backbone/milestoneReadmodel";
import { buildEraReadModel } from "../src/backbone/eraReadmodel";
import {
  buildCapitalAxisReadModel,
  CAPITAL_AXIS_LADDER,
} from "../src/backbone/capitalAxisReadmodel";

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
  zoneFiles.length >= 6,
  `backbone zone present (${zoneFiles.length} files)`,
  "backbone zone missing or too small",
);

const DB_TOUCH_RE = /@workspace\/db/;
const dbTouchers = zoneFiles
  .filter((f) => DB_TOUCH_RE.test(stripComments(readFileSync(f, "utf8"))))
  .map((f) => path.relative(apiDir, f).split(path.sep).join("/"))
  .sort();
check(
  JSON.stringify(dbTouchers) ===
    JSON.stringify([
      "src/backbone/backboneDb.ts",
      // M0: the introduction refresh — the zone's SECOND (and last) DB file.
      "src/backbone/introductionRefresh.ts",
    ]),
  "exactly two zone files touch @workspace/db (backboneDb + introductionRefresh)",
  `zone DB boundary broken: [${dbTouchers.join(", ")}]`,
);
for (const rel of ["src/backbone/backboneDb.ts", "src/backbone/introductionRefresh.ts"]) {
  const src = stripComments(read(rel));
  check(
    /import\s*\(\s*["']@workspace\/db["']\s*\)/.test(src) &&
      !/from\s*["']@workspace\/db["']/.test(src) &&
      !/import\s*["']@workspace\/db["']/.test(src) &&
      !/require\s*\(\s*["']@workspace\/db["']\s*\)/.test(src),
    `${rel} reaches @workspace/db via lazy dynamic import() only`,
    `${rel} uses a static/bare/require @workspace/db form`,
  );
}
const dbSrc = stripComments(read("src/backbone/backboneDb.ts"));

const routeSrc = stripComments(read("src/routes/backboneStatus.ts"));
const feedRouteSrc = stripComments(read("src/routes/backboneFeed.ts"));
for (const [label, src] of [
  ...zoneFiles.map(
    (f) =>
      [path.relative(apiDir, f), stripComments(readFileSync(f, "utf8"))] as const,
  ),
  ["src/routes/backboneStatus.ts", routeSrc] as const,
  ["src/routes/backboneFeed.ts", feedRouteSrc] as const,
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

// Inserts target exactly the five sanctioned tables (M4-c added the
// protocol-event lane: its cursor upsert + its raw rows).
{
  const insertTargets = [...dbSrc.matchAll(/\.insert\(([^)]*)\)/g)].map(
    (m) => (m[1] ?? "").trim(),
  );
  const allowed = [
    "cursorTable",
    "saleEventRaw",
    "blockTimestamp",
    "protocolEventCursor",
    "protocolEventRaw",
  ];
  check(
    insertTargets.length === 5 &&
      insertTargets.every((t) => allowed.includes(t)),
    "inserts target exactly {indexerCursor, saleEventRaw, blockTimestamp, protocolEventCursor, protocolEventRaw}",
    `insert targets drifted: [${insertTargets.join(", ")}]`,
  );
}

// The zone reads decodedJson ONLY in backboneDb (whitelists pinned below and
// by activity-heartbeat.guard.ts); protocolEventScan.ts WRITES decodedJson
// (it decodes logs into rows — the lane's job); the pure builder carries the
// WORDS in its doctrine strings but can perform no access. Everything else
// in the zone stays clean.
for (const f of zoneFiles) {
  if (f.endsWith(`${path.sep}backboneDb.ts`)) continue;
  if (f.endsWith(`${path.sep}activityHeartbeatReadmodel.ts`)) continue;
  if (f.endsWith(`${path.sep}protocolEventScan.ts`)) continue;
  if (f.endsWith(`${path.sep}introductionRefresh.ts`)) continue; // own whitelist below
  const src = stripComments(readFileSync(f, "utf8"));
  check(
    !src.includes("decodedJson") && !src.includes("rawJson"),
    `${path.relative(apiDir, f)}: no decodedJson/rawJson access`,
    `${path.relative(apiDir, f)} touches decodedJson/rawJson outside the loader/lane`,
  );
}

// M0 — the introduction refresh's own discipline: its decodedJson whitelist
// is exactly {sourceId, recipient, acquisitionCost} + the slice-⑤ AMOUNT
// fields {grossUsdc, protocolContribution, vaultAmount, liquidityAmount,
// operationsAmount, commissionBps} (deliberate amendment 2026-07-19, the
// receipt-backed commission anatomy: amounts and a bps only — NUMBERS, never
// addresses; the event's address-typed fields buyer/sourceWallet stay
// forbidden), and the built model is leak-scanned BEFORE it is ever held;
// nothing else in src may set the live model.
{
  const introSrc = stripComments(read("src/backbone/introductionRefresh.ts"));
  const introAccesses = [...introSrc.matchAll(/\bp\.(\w+)/g)]
    .map((m) => m[1])
    .filter((k): k is string => Boolean(k));
  const allowedIntro = new Set([
    "sourceId",
    "recipient",
    "acquisitionCost",
    "grossUsdc",
    "protocolContribution",
    "vaultAmount",
    "liquidityAmount",
    "operationsAmount",
    "commissionBps",
  ]);
  check(
    introAccesses.length > 0 && introAccesses.every((k) => allowedIntro.has(k)),
    "introduction refresh decodedJson whitelist is exactly {sourceId, recipient, acquisitionCost} + the slice-⑤ amount fields",
    `introduction refresh reads non-whitelisted decodedJson keys: ${introAccesses
      .filter((k) => !allowedIntro.has(k))
      .join(", ")}`,
  );
  // The prod-measured literal lesson (2026-07-14): the completeness check
  // must speak the CURSOR TABLE's persisted vocabulary ("complete"/"idle" —
  // saleEventIndexer:485), never the in-memory summary's "ok".
  check(
    introSrc.includes('r.status === "complete"') &&
      !introSrc.includes('r.status === "ok"'),
    "introduction refresh checks the PERSISTED cursor vocabulary (complete/idle, never the summary's ok)",
    "introduction refresh compares the cursor against a status literal the table never carries",
  );
  const leakIdx = introSrc.indexOf("assertAddressSafeAggregate(JSON.stringify(model))");
  const setIdx = introSrc.indexOf("setLiveIntroductionModel(");
  check(
    leakIdx !== -1 && setIdx !== -1 && leakIdx < setIdx,
    "the refreshed model is leak-scanned BEFORE it is held",
    "introduction refresh holds a model without the leak scan first",
  );
  const setters = walk(path.resolve(apiDir, "src")).filter((f) =>
    stripComments(readFileSync(f, "utf8")).includes("setLiveIntroductionModel("),
  );
  check(
    setters.length === 2 &&
      setters.some((f) => f.endsWith(`${path.sep}introductionRefresh.ts`)) &&
      setters.some((f) => f.endsWith(`${path.sep}introductionLiveModel.ts`)),
    "the live introduction model is set ONLY by the refresh (holder + refresh, nothing else)",
    `unexpected setLiveIntroductionModel caller(s): [${setters
      .map((f) => path.relative(apiDir, f))
      .join(", ")}]`,
  );
  // Slice-④/⑤ ROWS-MODEL pins (the f436c42 prod lesson made durable — the
  // rows payload carries legitimate 64-hex anchors, so its gate must be the
  // BOUNDARY-AWARE scan, and it must run BEFORE the model is held): the
  // boundary-aware regex appears in this file and precedes the set call, and
  // only the refresh (+ the holder module) may set the rows model.
  const rowsGateIdx = introSrc.indexOf("(?![0-9a-fA-F])");
  const rowsSetIdx = introSrc.indexOf("setIntroductionRowsModel(");
  check(
    rowsGateIdx !== -1 && rowsSetIdx !== -1 && rowsGateIdx < rowsSetIdx,
    "the rows model is boundary-aware leak-scanned BEFORE it is held",
    "introduction refresh holds the rows model without the boundary-aware scan first",
  );
  const rowSetters = walk(path.resolve(apiDir, "src")).filter((f) =>
    stripComments(readFileSync(f, "utf8")).includes("setIntroductionRowsModel("),
  );
  check(
    rowSetters.length === 2 &&
      rowSetters.some((f) => f.endsWith(`${path.sep}introductionRefresh.ts`)) &&
      rowSetters.some((f) => f.endsWith(`${path.sep}introductionRowsModel.ts`)),
    "the rows model is set ONLY by the refresh (holder + refresh, nothing else)",
    `unexpected setIntroductionRowsModel caller(s): [${rowSetters
      .map((f) => path.relative(apiDir, f))
      .join(", ")}]`,
  );
}

// Burn-loader decodedJson whitelist: exactly {from, valueRaw} via the `b.`
// accessor (the sale loader's `d.` whitelist is pinned by activity:guard).
{
  const burnAccesses = [...dbSrc.matchAll(/\bb\.(\w+)/g)]
    .map((m) => m[1])
    .filter((k): k is string => Boolean(k));
  const allowedBurnKeys = new Set(["from", "valueRaw"]);
  check(
    burnAccesses.length > 0 && burnAccesses.every((k) => allowedBurnKeys.has(k)),
    "burn loader decodedJson access whitelist is exactly {from, valueRaw}",
    `burn loader reads non-whitelisted decodedJson keys: ${burnAccesses
      .filter((k) => !allowedBurnKeys.has(k))
      .join(", ")}`,
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

// M4-c convergence discipline (the measured prod 403 lesson):
{
  const laneSrc = stripComments(read("src/backbone/protocolEventScan.ts"));
  const persistIdx = laneSrc.indexOf("await upsertProtocolCursor");
  const loopIdx = laneSrc.indexOf("for (\n        let start");
  check(
    laneSrc.includes("PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE - 1") &&
      PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE >= 100_000 &&
      PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE <= 1_000_000,
    "protocol lane: per-cycle block budget applied and sanely bounded",
    "protocol lane budget missing or out of bounds",
  );
  check(
    PROTOCOL_SCAN_CHUNK_DELAY_MS >= 50 && PROTOCOL_SCAN_CHUNK_DELAY_MS <= 2_000,
    "protocol lane: inter-chunk throttle present and sane",
    "protocol lane throttle missing or out of bounds",
  );
  check(
    persistIdx !== -1 &&
      laneSrc.includes("lastScannedBlock: end") &&
      (loopIdx === -1 || persistIdx > loopIdx),
    "protocol lane: the cursor persists after EVERY chunk (the convergence law)",
    "protocol lane lost per-chunk cursor persistence — a rate-limit cut would loop forever",
  );
  check(
    !/^\s*throw /m.test(
      laneSrc.slice(laneSrc.indexOf("export async function runProtocolEventScan")),
    ),
    "protocol lane: stream faults are recorded, never thrown across streams",
    "protocol lane throws across streams — one fault would darken the cycle",
  );
  const runnerSrc2 = stripComments(read("src/backbone/backboneRunner.ts"));
  check(
    runnerSrc2.includes("cyclesPartial") &&
      runnerSrc2.includes("streamFaults"),
    "runner isolates the protocol lane: a stream fault = a PARTIAL cycle, the serving state still refreshes",
    "runner lost the lane isolation — a protocol fault would darken the seats again",
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
// Address law (2026-07-25): a full 40-hex address PASSES (public + linkable);
// the scanner trips only on OVER-LONG hex (0x + 41+) and bare 32-byte hashes.
assertAddressSafeJson(JSON.stringify({ note: "0x" + "ab".repeat(20) }));
ok.push("scanner PASSES a full 40-hex address (address law — public)");
expectThrow("scanner trips on over-long hex (0x + 41+)", () =>
  assertAddressSafeJson(JSON.stringify({ note: "0x" + "ab".repeat(21) })),
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
  ).match(/\/0x\[0-9a-fA-F\]\{41,\}\/|\/\\b\[0-9a-fA-F\]\{64\}\\b\//g);
  const scriptPatterns = stripComments(
    read("scripts/member-continuity-readmodel.ts"),
  ).match(/\/0x\[0-9a-fA-F\]\{41,\}\/|\/\\b\[0-9a-fA-F\]\{64\}\\b\//g);
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
// G. Feed (M4-b): identity-blind projection + exact-shape verify anchors.
// ---------------------------------------------------------------------------

// Runtime-built fixture hex (never literal long hex — leak-guard discipline).
const txA = "0x" + "ab".repeat(32);
const txB = "0x" + "cd".repeat(32);
const CHAIN = 43114;
const T0 = 1_700_000_000;
const fixtureModel = buildActivityHeartbeatReadModel({
  expectedChainId: CHAIN,
  rawEvents: [
    {
      chainId: CHAIN,
      generation: "V1",
      eventName: "TokensPurchased",
      blockNumber: 100,
      logIndex: 0,
      transactionHash: txA,
      firstSeat: null,
      memberNumber: null,
      usdcGrossRaw: null,
      era: null,
      // H2-P: a pre-amendment-shaped row — the fallback voice must hold.
      memberAddress: null,
      referredBySource: false,
      referrerAddress: null,
    },
    {
      chainId: CHAIN,
      generation: "V3",
      eventName: "MembershipPurchasedV3",
      blockNumber: 200,
      logIndex: 1,
      transactionHash: txB,
      firstSeat: true,
      memberNumber: 424242,
      usdcGrossRaw: null,
      era: 1,
      // H2-P: the pride voice; override A — the referrer named from the
      // SAME event (a planted full address that must never serialize).
      memberAddress: "0x" + "bb".repeat(20),
      referredBySource: true,
      referrerAddress: "0x" + "cc".repeat(20),
    },
  ],
  blockTimestamps: [
    { chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 },
    { chainId: CHAIN, blockNumber: 200, blockTimestampSec: T0 + 86_400 },
  ],
});
// The protocol-event lane fixture (M4-c): two burns (one Founder, one
// Community — the second sharing block 100 with the seat) + one lifecycle
// line. The planted sender addresses must NEVER reach any serialized output.
const founderAddr = "0x" + "aa".repeat(20);
const communityAddr = "0x" + "bb".repeat(20);
// H2-⑦ fixture organs + an external counterparty (planted — must never leak).
const vaultAddr = "0x" + "cc".repeat(20);
const opsAddr = "0x" + "dd".repeat(20);
const externalAddr = "0x" + "77".repeat(20);
const txJ = "0x" + "6d".repeat(32);
const txK = "0x" + "7e".repeat(32);
// A1 (2026-07-22): a genuine founder-funding inflow row (founder → vault).
const txL = "0x" + "8f".repeat(32);
const txC = "0x" + "ef".repeat(32);
const txD = "0x" + "0d".repeat(32);
const txE = "0x" + "5e".repeat(32);
const txF = "0x" + "1f".repeat(32);
const txG = "0x" + "2a".repeat(32);
const txH = "0x" + "3b".repeat(32);
const txI = "0x" + "4c".repeat(32);
const fixtureProtocolModel = buildProtocolEventReadModel({
  expectedChainId: CHAIN,
  burns: [
    {
      blockNumber: 150,
      logIndex: 2,
      transactionHash: txD,
      fromAddress: communityAddr,
      valueRaw: "5" + "0".repeat(18),
    },
    {
      blockNumber: 100,
      logIndex: 7,
      transactionHash: txC,
      fromAddress: founderAddr,
      valueRaw: "1000" + "0".repeat(18),
    },
  ],
  lifecycle: [
    { eventName: "SourceCreated", blockNumber: 150, logIndex: 5, transactionHash: txE },
    // H1a ⑧: a terms update at the Trusted rung's exact bps = a PROMOTION.
    {
      eventName: "SourceTermsUpdated",
      blockNumber: 150,
      logIndex: 6,
      transactionHash: txE,
      commissionBps: 600,
    },
    // H1a ⑯: a wallet rotation — one public lifecycle kind.
    {
      eventName: "SourcePayoutWalletUpdated",
      blockNumber: 150,
      logIndex: 8,
      transactionHash: txE,
    },
  ],
  // H1a ⑤⑥: an lp-add whose depositor is identified by the SAME-TX LP-token
  // mint (Community here) + an lp-remove whose withdrawer is the founder.
  // H1a-fix: amounts are NEUTRAL in the pair's real order — token0 = USDC,
  // token1 = SYN (the prod-verified orientation; the inversion bug is pinned
  // below and can never return).
  lpLiquidity: [
    {
      eventName: "Mint",
      blockNumber: 160,
      logIndex: 3,
      transactionHash: txF,
      amount0Raw: "25" + "0".repeat(6),
      amount1Raw: "1000" + "0".repeat(18),
    },
    {
      eventName: "Burn",
      blockNumber: 170,
      logIndex: 4,
      transactionHash: txG,
      amount0Raw: "1" + "0".repeat(6),
      amount1Raw: "10" + "0".repeat(18),
      withdrawer: founderAddr,
    },
  ],
  lpTokenMints: [
    { blockNumber: 160, logIndex: 2, transactionHash: txF, depositor: communityAddr },
  ],
  // H1a ⑪: an artifact mint — labeled, minter never stored.
  archiveMints: [
    // H2-P: the minter enters SERVER-ONLY (short form serves).
    { blockNumber: 180, logIndex: 1, transactionHash: txH, artifactId: 1, quantityRaw: "1", minter: communityAddr },
  ],
  // H1a ⑨: a ceremonial pause.
  archivePauses: [
    { eventName: "Paused", blockNumber: 190, logIndex: 0, transactionHash: txI },
  ],
  // H2-⑦ — four treasury rows exercising THE FOLD LAW + classification:
  //   · txB = the seat purchase's routing transfer → FOLDED (the sale set)
  //   · txF = the lp-add's funding transfer → FOLDED (own-model narration)
  //   · txJ = a genuine vault outflow to an external counterparty → "out"
  //   · txK = a vault → operations transfer → "internal"
  treasury: [
    { token: "USDC", blockNumber: 200, logIndex: 9, transactionHash: txB, fromAddress: externalAddr, toAddress: vaultAddr, valueRaw: "42" + "0".repeat(6) },
    { token: "USDC", blockNumber: 160, logIndex: 8, transactionHash: txF, fromAddress: vaultAddr, toAddress: externalAddr, valueRaw: "25" + "0".repeat(6) },
    { token: "USDC", blockNumber: 165, logIndex: 1, transactionHash: txJ, fromAddress: vaultAddr, toAddress: externalAddr, valueRaw: "7" + "0".repeat(6) },
    { token: "SYN", blockNumber: 175, logIndex: 2, transactionHash: txK, fromAddress: vaultAddr, toAddress: opsAddr, valueRaw: "1500" + "0".repeat(18) },
    // A1 (2026-07-22): a genuine founder-funding inflow — the Founder
    // advances USDC to the vault; the sentence must SAY the Founder.
    // (Block 190 — never 200: the shared-anchor tie-break pin owns that block.)
    { token: "USDC", blockNumber: 190, logIndex: 11, transactionHash: txL, fromAddress: founderAddr, toAddress: vaultAddr, valueRaw: "9" + "0".repeat(6) },
  ],
  blockTimestamps: [
    { chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 },
    { chainId: CHAIN, blockNumber: 150, blockTimestampSec: T0 + 3_600 },
    { chainId: CHAIN, blockNumber: 160, blockTimestampSec: T0 + 4_600 },
    { chainId: CHAIN, blockNumber: 165, blockTimestampSec: T0 + 5_100 },
    { chainId: CHAIN, blockNumber: 170, blockTimestampSec: T0 + 5_600 },
    { chainId: CHAIN, blockNumber: 175, blockTimestampSec: T0 + 6_100 },
    { chainId: CHAIN, blockNumber: 180, blockTimestampSec: T0 + 6_600 },
    { chainId: CHAIN, blockNumber: 190, blockTimestampSec: T0 + 7_600 },
    { chainId: CHAIN, blockNumber: 200, blockTimestampSec: T0 + 8_600 },
  ],
  founderAddresses: new Set([founderAddr]),
  // A1 (2026-07-22): the PURE founder-wallet subset (organs excluded) —
  // drives the treasury counterpartFounder attribution.
  founderWalletAddresses: new Set([founderAddr]),
  organLabelByAddress: new Map([
    [vaultAddr, "the vault"],
    [opsAddr, "the operations wallet"],
  ]),
  saleTransactionHashes: new Set([txB]),
  // WHO HOLDS A SEAT (2026-07-26). `communityAddr` burns in this fixture and is
  // deliberately IN this set, so the member class is exercised by a real row
  // rather than asserted in a comment. `externalAddr` is deliberately OUT.
  seatHolderAddresses: new Set([communityAddr.toLowerCase()]),
  lpToken0IsSyn: false,
});

// ── THE FOUR ACTOR CLASSES (Founder ruling 2026-07-26) ──────────────────────
// "il faut quand même les distinguer, car dans notre système c'est un qui a
// acheté un seat, les autres sont différents." Each class below is decided by a
// set the CHAIN populates, so each one gets a row that proves it — a chip nobody
// tests is a chip that silently mislabels a member as a stranger.
{
  const classOf = (from: string): string | undefined =>
    buildProtocolEventReadModel({
      expectedChainId: CHAIN,
      burns: [
        {
          blockNumber: 100,
          logIndex: 1,
          transactionHash: txD,
          fromAddress: from,
          valueRaw: "1" + "0".repeat(18),
        },
      ],
      lifecycle: [],
      lpLiquidity: [],
      lpTokenMints: [],
      archiveMints: [],
      archivePauses: [],
      treasury: [],
      blockTimestamps: [{ chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 }],
      founderAddresses: new Set([founderAddr]),
      founderWalletAddresses: new Set([founderAddr]),
      organLabelByAddress: new Map([[vaultAddr, "the vault"]]),
      seatHolderAddresses: new Set([communityAddr.toLowerCase()]),
      saleTransactionHashes: new Set(),
      lpToken0IsSyn: false,
    }).burnLedger[0]?.actorClass;

  check(classOf(founderAddr) === "founder", "actor class: an allocation-registry address is the Founder", "the founder class broke");
  check(classOf(vaultAddr) === "organ", "actor class: a protocol wallet is an organ, never a person", "the organ class broke");
  check(classOf(communityAddr) === "member", "actor class: a wallet that HOLDS A SEAT is a member", "the member class broke");
  check(classOf(externalAddr) === "visitor", "actor class: a wallet with no seat is a visitor (the fail-closed default)", "the visitor class broke");
  // PRECEDENCE, and it is not cosmetic: the Founder holds seats, so founder must
  // outrank member or his own burns would read as an ordinary member's.
  check(
    buildProtocolEventReadModel({
      expectedChainId: CHAIN,
      burns: [{ blockNumber: 100, logIndex: 1, transactionHash: txD, fromAddress: founderAddr, valueRaw: "1" + "0".repeat(18) }],
      lifecycle: [], lpLiquidity: [], lpTokenMints: [], archiveMints: [], archivePauses: [], treasury: [],
      blockTimestamps: [{ chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 }],
      founderAddresses: new Set([founderAddr]),
      founderWalletAddresses: new Set([founderAddr]),
      organLabelByAddress: new Map(),
      // the Founder ALSO holds a seat here — the ambiguous case, made explicit
      seatHolderAddresses: new Set([founderAddr.toLowerCase()]),
      saleTransactionHashes: new Set(),
      lpToken0IsSyn: false,
    }).burnLedger[0]?.actorClass === "founder",
    "actor class precedence: a Founder who also holds a seat is still the Founder",
    "the founder/member precedence broke",
  );
  // A missing set must never take the heartbeat down over a chip (it did, once).
  check(
    buildProtocolEventReadModel({
      expectedChainId: CHAIN,
      burns: [{ blockNumber: 100, logIndex: 1, transactionHash: txD, fromAddress: externalAddr, valueRaw: "1" + "0".repeat(18) }],
      lifecycle: [], lpLiquidity: [], lpTokenMints: [], archiveMints: [], archivePauses: [], treasury: [],
      blockTimestamps: [{ chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 }],
      founderAddresses: new Set([founderAddr]),
      founderWalletAddresses: new Set([founderAddr]),
      organLabelByAddress: new Map(),
      seatHolderAddresses: undefined as unknown as ReadonlySet<string>,
      saleTransactionHashes: new Set(),
      lpToken0IsSyn: false,
    }).burnLedger[0]?.actorClass === "visitor",
    "actor class fails closed: a missing seat set yields visitor, never a crash",
    "a missing seat set crashed the projection or invented a member",
  );
}

// H2-⑦ pins: THE FOLD LAW + classification + label discipline.
check(
  fixtureProtocolModel.treasuryItems.length === 3 &&
    fixtureProtocolModel.totals.treasuryRowsFolded === 2,
  "THE FOLD LAW holds: routing transfers inside narrated transactions fold (2 folded, 3 genuine — A1 added the founder-funding row)",
  `the Fold Law broke (items=${fixtureProtocolModel.treasuryItems.length}, folded=${fixtureProtocolModel.totals.treasuryRowsFolded})`,
);
check(
  fixtureProtocolModel.treasuryItems[0]!.movement === "out" &&
    fixtureProtocolModel.treasuryItems[0]!.organLabel === "the vault" &&
    fixtureProtocolModel.treasuryItems[0]!.toOrganLabel === null &&
    fixtureProtocolModel.treasuryItems[1]!.movement === "internal" &&
    fixtureProtocolModel.treasuryItems[1]!.organLabel === "the vault" &&
    fixtureProtocolModel.treasuryItems[1]!.toOrganLabel === "the operations wallet",
  "treasury movements classify in/out/internal from the ORGAN SET (never from the stream)",
  "treasury movement classification broke",
);
// A1 pins (founder funding doctrine, 2026-07-22): the counterparty is said
// truthfully per address — the founder→vault inflow carries the flag; an
// external out and an internal rebalance never do.
check(
  fixtureProtocolModel.treasuryItems[2]!.movement === "in" &&
    fixtureProtocolModel.treasuryItems[2]!.organLabel === "the vault" &&
    fixtureProtocolModel.treasuryItems[2]!.counterpartFounder === true &&
    fixtureProtocolModel.treasuryItems[0]!.counterpartFounder === false &&
    fixtureProtocolModel.treasuryItems[1]!.counterpartFounder === false,
  "founder funding attribution: in-from-founder carries counterpartFounder; external/internal never do (A1, 2026-07-22)",
  "the founder-funding attribution broke",
);
// H1a-fix pin (the prod-caught inversion, dead forever): with token0 = USDC,
// the read-model must map amount1 → SYN and amount0 → USDC.
check(
  fixtureProtocolModel.lpItems[0]!.amountSynRaw === "1000" + "0".repeat(18) &&
    fixtureProtocolModel.lpItems[0]!.amountUsdcRaw === "25" + "0".repeat(6),
  "LP amounts orient via the pinned token0 canon (token0=USDC ⇒ amount1 is SYN)",
  "the LP amount orientation inverted again",
);
// H1a pins: the promotion reading, the liquidity labels (Community add via
// the same-tx depositor join; Founder remove via the event's withdrawer),
// the artifact label, and the ceremonial action.
check(
  fixtureProtocolModel.lifecycleItems.some(
    (l) => l.kind === "source-terms" && l.risenToTitle === "Trusted",
  ),
  "a terms update at a rate-raising rung reads as the promotion (risenToTitle)",
  "the ladder-promotion reading broke",
);
check(
  fixtureProtocolModel.lifecycleItems.some((l) => l.kind === "source-wallet"),
  "wallet rotations join the lifecycle lane as source-wallet",
  "the source-wallet kind broke",
);
check(
  fixtureProtocolModel.lpItems.length === 2 &&
    fixtureProtocolModel.lpItems[0]!.kind === "lp-add" &&
    fixtureProtocolModel.lpItems[0]!.actorLabel === "Community" &&
    fixtureProtocolModel.lpItems[1]!.kind === "lp-remove" &&
    fixtureProtocolModel.lpItems[1]!.actorLabel === "Founder",
  "liquidity lines carry Founder/Community labels (depositor join + withdrawer)",
  "the liquidity labeling broke",
);
check(
  fixtureProtocolModel.archiveMintItems[0]!.artifactLabel === "First Signal" &&
    fixtureProtocolModel.archivePauseItems[0]!.action === "paused",
  "artifact mints carry canon labels; pauses carry their ceremonial action",
  "archive lane labeling broke",
);
check(
  fixtureProtocolModel.burnLedger.length === 2 &&
    fixtureProtocolModel.burnLedger[0]!.proofOfBurnNumber === 1 &&
    fixtureProtocolModel.burnLedger[0]!.blockNumber === 100 &&
    fixtureProtocolModel.burnLedger[0]!.senderLabel === "Founder" &&
    fixtureProtocolModel.burnLedger[1]!.proofOfBurnNumber === 2 &&
    fixtureProtocolModel.burnLedger[1]!.senderLabel === "Community",
  "Proof of Burn numbering is 1-based oldest-first; Founder/Community labels derive from the known set",
  "burn ledger numbering or labeling broke",
);

// ---------------------------------------------------------------------------
// H. Milestones (H2-⑬): canon defs + crossing derivation + fail-closed paths.
// ---------------------------------------------------------------------------

// The 11 canon defs hold: unique ids, the vocabulary law (usdc labels speak
// "routed" — the routing register; the fundraising register never enters),
// seat milestones ARE the chapter boundaries.
check(
  // M-EVO-1 (founder GO 2026-07-22): 11 → 66 defs across the 6 families
  // (MILESTONE_SYSTEM_EVOLUTION.md §2). Unique ids; the 11 origin labels
  // survive VERBATIM inside the grown registry.
  // + the patronage money ladder (founder "prix ok" 2026-07-22): 66 → 71.
  PROTOCOL_MILESTONES.length === 71 &&
    new Set(PROTOCOL_MILESTONES.map((m) => m.id)).size === 71 &&
    PROTOCOL_MILESTONES.some((m) => m.id === "patronage-100") &&
    ["first-seat", "seats-333", "routed-100", "first-signal-mint"].every((id) =>
      PROTOCOL_MILESTONES.some((m) => m.id === id),
    ) &&
    PROTOCOL_MILESTONES.some((m) => m.id === "seats-1000000") &&
    new Set(PROTOCOL_MILESTONES.map((m) => m.family)).size === 6,
  "the 71 family-ladder milestones hold with unique ids (M-EVO-1 + patronage; the FINAL SEAT rung present)",
  `milestone defs drifted (count=${PROTOCOL_MILESTONES.length})`,
);
check(
  PROTOCOL_MILESTONES.filter((m) => m.kind === "usdc").every((m) =>
    m.label.includes("routed"),
  ) && PROTOCOL_MILESTONES.every((m) => !/raised?/i.test(m.label)),
  'usdc milestone labels speak "routed" — the fundraising register never enters',
  "a milestone label broke the routed-never-raised vocabulary law",
);
check(
  PROTOCOL_MILESTONES.some((m) => m.id === "seats-333" && m.target === 333) &&
    PROTOCOL_MILESTONES.some((m) => m.id === "seats-1000" && m.target === 1000) &&
    PROTOCOL_MILESTONES.some((m) => m.id === "seats-3333" && m.target === 3333) &&
    PROTOCOL_MILESTONES.some((m) => m.id === "seats-10000" && m.target === 10000),
  "the seat milestones are the chapter boundaries (333 · 1,000 · 3,333 · 10,000)",
  "the seat milestones drifted from the canon chapter boundaries",
);

// A clean milestone fixture: two purchases (V1 50 USDC · V3 seat #2, 60 USDC
// — cumulative 110 crosses the $100 threshold AT the V3 purchase) + the
// protocol model's First Signal mint. Live reads AGREE (memberCount 2,
// inflow 110) — three crossings seal, each anchored to its exact tx.
const milestonePurchases = [
  {
    chainId: CHAIN,
    generation: "V1",
    eventName: "TokensPurchased",
    blockNumber: 100,
    logIndex: 0,
    transactionHash: txA,
    firstSeat: null,
    memberNumber: null,
    usdcGrossRaw: "50" + "0".repeat(6),
    era: null,
    memberAddress: null,
    referredBySource: false,
    referrerAddress: null,
  },
  {
    chainId: CHAIN,
    generation: "V3",
    eventName: "MembershipPurchasedV3",
    blockNumber: 200,
    logIndex: 1,
    transactionHash: txB,
    firstSeat: true,
    memberNumber: 2,
    usdcGrossRaw: "60" + "0".repeat(6),
    era: 1,
    memberAddress: null,
    referredBySource: false,
    referrerAddress: null,
  },
];
const milestoneTs = [
  { chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 },
  { chainId: CHAIN, blockNumber: 200, blockTimestampSec: T0 + 86_400 },
];
const fixtureMilestoneModel = buildMilestoneReadModel({
  expectedChainId: CHAIN,
  rawEvents: milestonePurchases,
  blockTimestamps: milestoneTs,
  archiveMintItems: fixtureProtocolModel.archiveMintItems,
  // M-EVO-1 (2026-07-22): the fire/referral/liquidity families ride the
  // protocol fixture's own lanes (items carry verified time — no new ts).
  burnItems: fixtureProtocolModel.burnLedger,
  lifecycleItems: fixtureProtocolModel.lifecycleItems,
  lpItems: fixtureProtocolModel.lpItems,
  liveMemberCount: 2,
  liveInflowAggregateRaw: "110" + "0".repeat(6),
  liveArtifactRevenueRaw: null,
});
check(
  // M-EVO-1 (2026-07-22): 3 → 6 sealed — the family walks retro-seal the
  // fixture's own lanes (first burn act · first source creation · first LP
  // add), each at its EXACT historical transaction. Chain order.
  fixtureMilestoneModel.sealed.length === 6 &&
    fixtureMilestoneModel.sealed[0]!.id === "first-seat" &&
    fixtureMilestoneModel.sealed[0]!.blockNumber === 100 &&
    fixtureMilestoneModel.sealed[0]!.transactionHash === txA &&
    fixtureMilestoneModel.sealed[1]!.id === "burn-act-1" &&
    fixtureMilestoneModel.sealed[1]!.blockNumber === 100 &&
    fixtureMilestoneModel.sealed[1]!.transactionHash === txC &&
    fixtureMilestoneModel.sealed[2]!.id === "source-1" &&
    fixtureMilestoneModel.sealed[2]!.blockNumber === 150 &&
    fixtureMilestoneModel.sealed[3]!.id === "lp-add-1" &&
    fixtureMilestoneModel.sealed[3]!.blockNumber === 160 &&
    fixtureMilestoneModel.sealed[4]!.id === "first-signal-mint" &&
    fixtureMilestoneModel.sealed[4]!.blockNumber === 180 &&
    fixtureMilestoneModel.sealed[5]!.id === "routed-100" &&
    fixtureMilestoneModel.sealed[5]!.blockNumber === 200 &&
    fixtureMilestoneModel.sealed[5]!.transactionHash === txB &&
    fixtureMilestoneModel.sealed.every((s) => typeof s.family === "string"),
  "milestone crossings anchor to the EXACT transaction (purchase · burn · source · LP · mint · the $100 crossing — retro-seal law)",
  "milestone crossing anchors broke",
);
check(
  // M-EVO-1: approaching = the NEXT rung per (family, kind) lane — 8 lanes,
  // each carrying its OWN honest current figure.
  // 8 → 9 lanes: the archive-usdc patronage lane joins ("prix ok").
  fixtureMilestoneModel.approaching.length === 9 &&
    fixtureMilestoneModel.approaching.some((a) => a.id === "patronage-100") &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "routed-1k" && a.currentUsdcRaw === "110" + "0".repeat(6),
    ) &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "seats-10" && a.currentSeats === 2,
    ) &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "burn-act-10" && a.currentCount === 2,
    ) &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "burned-10k" && a.currentSynRaw === "1005" + "0".repeat(18),
    ) &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "sources-5" && a.currentCount === 1,
    ) &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "lp-add-10" && a.currentCount === 1,
    ) &&
    fixtureMilestoneModel.approaching.some(
      (a) => a.id === "artifacts-25" && a.currentCount === 1,
    ) &&
    fixtureMilestoneModel.approaching.some((a) => a.id === "patron-seal-mint"),
  "approaching = next-per-lane with honest per-ladder progress (M-EVO-1)",
  "approaching milestone progress broke",
);
// The live cross-check WITHHOLDS a contradicted crossing (fail-closed): the
// events say $100 crossed, the live inflow read says 90 — the line is
// withheld and the note says so.
{
  const contradicted = buildMilestoneReadModel({
    expectedChainId: CHAIN,
    rawEvents: milestonePurchases,
    blockTimestamps: milestoneTs,
    archiveMintItems: fixtureProtocolModel.archiveMintItems,
    burnItems: fixtureProtocolModel.burnLedger,
    lifecycleItems: fixtureProtocolModel.lifecycleItems,
    lpItems: fixtureProtocolModel.lpItems,
    liveMemberCount: 2,
    liveInflowAggregateRaw: "90" + "0".repeat(6),
    liveArtifactRevenueRaw: null,
  });
  check(
    !contradicted.sealed.some((s) => s.id === "routed-100") &&
      contradicted.approaching.some((a) => a.id === "routed-100") &&
      contradicted.notes.some((n) => n.includes("withheld")),
    "a live-read contradiction WITHHOLDS the milestone with an honest note (fail-closed)",
    "the milestone live cross-check no longer withholds a contradicted crossing",
  );
}
// Live-read unavailability never suppresses event-derived truth — it only
// removes the extra check, and the notes say so.
{
  const noLive = buildMilestoneReadModel({
    expectedChainId: CHAIN,
    rawEvents: milestonePurchases,
    blockTimestamps: milestoneTs,
    archiveMintItems: fixtureProtocolModel.archiveMintItems,
    burnItems: fixtureProtocolModel.burnLedger,
    lifecycleItems: fixtureProtocolModel.lifecycleItems,
    lpItems: fixtureProtocolModel.lpItems,
    liveMemberCount: null,
    liveInflowAggregateRaw: null,
    liveArtifactRevenueRaw: null,
  });
  check(
    // M-EVO-1: 3 → 6 (the family retro-seals ride the same fixture).
    noLive.sealed.length === 6 &&
      noLive.notes.some((n) => n.includes("live cross-check unavailable")),
    "live-read unavailability keeps event-derived truth serving, honestly noted",
    "milestone posture on missing live reads broke",
  );
}
expectThrow("milestone build fails closed on a purchase without its amount", () =>
  buildMilestoneReadModel({
    expectedChainId: CHAIN,
    rawEvents: [{ ...milestonePurchases[0]!, usdcGrossRaw: null }],
    blockTimestamps: milestoneTs,
    archiveMintItems: [],
    burnItems: [],
    lifecycleItems: [],
    lpItems: [],
    liveMemberCount: null,
    liveInflowAggregateRaw: null,
    liveArtifactRevenueRaw: null,
  }),
);

// ---------------------------------------------------------------------------
// I. Era transitions (H2-⑫): the witness pattern + fail-closed paths.
// ---------------------------------------------------------------------------

// Two V3 purchases: era 1 (the engine's birth — never a line) then era 2 —
// ONE witnessed transition, anchored to the era-2 purchase's exact tx.
const eraPurchases = [
  {
    chainId: CHAIN,
    generation: "V3",
    eventName: "MembershipPurchasedV3",
    blockNumber: 100,
    logIndex: 0,
    transactionHash: txA,
    firstSeat: true,
    memberNumber: 1,
    usdcGrossRaw: null,
    era: 1,
    memberAddress: null,
    referredBySource: false,
    referrerAddress: null,
  },
  {
    chainId: CHAIN,
    generation: "V3",
    eventName: "MembershipPurchasedV3",
    blockNumber: 200,
    logIndex: 1,
    transactionHash: txB,
    firstSeat: true,
    memberNumber: 2,
    usdcGrossRaw: null,
    era: 2,
    memberAddress: null,
    referredBySource: false,
    referrerAddress: null,
  },
];
const fixtureEraModel = buildEraReadModel({
  expectedChainId: CHAIN,
  rawEvents: eraPurchases,
  blockTimestamps: milestoneTs,
  liveActiveEngineEra: 2,
  activeEngine: "V3",
});
check(
  fixtureEraModel.transitions.length === 1 &&
    fixtureEraModel.transitions[0]!.era === 2 &&
    fixtureEraModel.transitions[0]!.engine === "V3" &&
    fixtureEraModel.transitions[0]!.blockNumber === 200 &&
    fixtureEraModel.transitions[0]!.transactionHash === txB,
  "an era transition anchors to its witnessing purchase; the birth era is never a line",
  "the era witness derivation broke",
);
// Scarcity-pressure structural pin: the era model exposes NO approaching/
// progress/countdown shape — line-on-crossing only (the §8 canon note).
{
  const eraJson = JSON.stringify(fixtureEraModel);
  check(
    !eraJson.includes("approaching") &&
      !eraJson.includes("progress") &&
      !eraJson.includes("remaining") &&
      !eraJson.includes("countdown"),
    "the era model carries NO approaching/progress shape — never scarcity framing",
    "an era progress/approaching shape appeared — the anti-scarcity doctrine broke",
  );
}
// Overclaim protection: a live era read BELOW the indexed witness withholds.
{
  const contradicted = buildEraReadModel({
    expectedChainId: CHAIN,
    rawEvents: eraPurchases,
    blockTimestamps: milestoneTs,
    liveActiveEngineEra: 1,
    activeEngine: "V3",
  });
  check(
    contradicted.transitions.length === 0 &&
      contradicted.notes.some((n) => n.includes("withheld")),
    "a live-era contradiction WITHHOLDS the transition with an honest note (fail-closed)",
    "the era live cross-check no longer withholds a contradicted transition",
  );
}
// Live-read unavailability keeps event-derived truth serving, honestly noted.
{
  const noLive = buildEraReadModel({
    expectedChainId: CHAIN,
    rawEvents: eraPurchases,
    blockTimestamps: milestoneTs,
    liveActiveEngineEra: null,
    activeEngine: "V3",
  });
  check(
    noLive.transitions.length === 1 &&
      noLive.notes.some((n) => n.includes("live era cross-check unavailable")),
    "era live-read unavailability keeps the witnessed transition serving, honestly noted",
    "era posture on a missing live read broke",
  );
}
// An engine born beyond era 1: honest note, never an invented anchor.
{
  const bornLate = buildEraReadModel({
    expectedChainId: CHAIN,
    rawEvents: [{ ...eraPurchases[1]!, era: 3 }],
    blockTimestamps: milestoneTs,
    liveActiveEngineEra: 3,
    activeEngine: "V3",
  });
  check(
    bornLate.transitions.length === 0 &&
      bornLate.notes.some((n) => n.includes("left no purchase witness")),
    "an engine born beyond era 1 yields a note, never an invented anchor",
    "the unwitnessed-birth posture broke",
  );
}
expectThrow("era build fails closed on an era regression", () =>
  buildEraReadModel({
    expectedChainId: CHAIN,
    rawEvents: [
      { ...eraPurchases[0]!, era: 2 },
      { ...eraPurchases[1]!, era: 1 },
    ],
    blockTimestamps: milestoneTs,
    liveActiveEngineEra: null,
    activeEngine: "V3",
  }),
);
expectThrow("era build fails closed on an era-engine purchase without its era", () =>
  buildEraReadModel({
    expectedChainId: CHAIN,
    rawEvents: [{ ...eraPurchases[0]!, era: null }],
    blockTimestamps: milestoneTs,
    liveActiveEngineEra: null,
    activeEngine: "V3",
  }),
);

// ---------------------------------------------------------------------------
// K. Capital axis (H2-⑰): the founder-named register + the witness walk.
// ---------------------------------------------------------------------------

// The register holds: 12 rungs, founder-named at the gate, thresholds
// strictly ascending from the $5 base — and the RED LINE is structural: no
// financial-benefit vocabulary can exist anywhere in the module.
check(
  CAPITAL_AXIS_LADDER.length === 12 &&
    CAPITAL_AXIS_LADDER[0]!.title === "Citizen" &&
    CAPITAL_AXIS_LADDER[0]!.usdc === 5 &&
    CAPITAL_AXIS_LADDER[11]!.title === "Monolith" &&
    CAPITAL_AXIS_LADDER[11]!.usdc === 10_000 &&
    CAPITAL_AXIS_LADDER.map((r) => r.title).join("|") ===
      "Citizen|Resident|Advocate|Patron|Strategist|Vanguard|Architect|Benefactor|Guardian|Keystone|Inner Circle|Monolith" &&
    CAPITAL_AXIS_LADDER.every(
      (r, i) => i === 0 || r.usdc > CAPITAL_AXIS_LADDER[i - 1]!.usdc,
    ),
  "the capital register holds: 12 founder-named rungs, thresholds strictly ascending ($5 → $10,000)",
  "the capital register drifted from the founder-approved table",
);
check(
  !/(bonus|discount|multiplier|reward|yield|cashback|better rate)/i.test(
    stripComments(read("src/backbone/capitalAxisReadmodel.ts")),
  ),
  "the RED LINE holds: no financial-benefit vocabulary exists in the capital module (recognition only)",
  "financial-benefit vocabulary entered the capital module — the red line broke",
);

// The witness walk: seat 2 buys $5 (the BASE rung — silent) then $20 (cum
// $25 — crossing Resident AND Advocate in one purchase = ONE line, the
// highest); seat 3 buys $5 only (never a line); a V1 row with no ordinal is
// excluded with an honest note.
const fixtureCapitalModel = buildCapitalAxisReadModel({
  expectedChainId: CHAIN,
  rawEvents: [
    {
      chainId: CHAIN,
      generation: "V3",
      eventName: "MembershipPurchasedV3",
      blockNumber: 100,
      logIndex: 0,
      transactionHash: txA,
      firstSeat: true,
      memberNumber: 2,
      usdcGrossRaw: "5" + "0".repeat(6),
      era: 1,
      memberAddress: null,
      referredBySource: false,
      referrerAddress: null,
    },
    {
      chainId: CHAIN,
      generation: "V3",
      eventName: "MembershipPurchasedV3",
      blockNumber: 100,
      logIndex: 5,
      transactionHash: txC,
      firstSeat: false,
      memberNumber: 2,
      usdcGrossRaw: "20" + "0".repeat(6),
      era: 1,
      memberAddress: null,
      referredBySource: false,
      referrerAddress: null,
    },
    {
      chainId: CHAIN,
      generation: "V3",
      eventName: "MembershipPurchasedV3",
      blockNumber: 200,
      logIndex: 1,
      transactionHash: txB,
      firstSeat: true,
      memberNumber: 3,
      usdcGrossRaw: "5" + "0".repeat(6),
      era: 1,
      memberAddress: null,
      referredBySource: false,
      referrerAddress: null,
    },
    {
      chainId: CHAIN,
      generation: "V1",
      eventName: "TokensPurchased",
      blockNumber: 100,
      logIndex: 9,
      transactionHash: txD,
      firstSeat: null,
      memberNumber: null,
      usdcGrossRaw: "50" + "0".repeat(6),
      era: null,
      memberAddress: null,
      referredBySource: false,
      referrerAddress: null,
    },
  ],
  blockTimestamps: milestoneTs,
});
check(
  fixtureCapitalModel.rises.length === 1 &&
    fixtureCapitalModel.rises[0]!.seatNumber === 2 &&
    fixtureCapitalModel.rises[0]!.rung === "Advocate" &&
    fixtureCapitalModel.rises[0]!.blockNumber === 100 &&
    fixtureCapitalModel.rises[0]!.logIndex === 5 &&
    fixtureCapitalModel.rises[0]!.transactionHash === txC,
  "the footprint walk: the base rung is silent, one purchase crossing two rungs yields ONE line (the highest), anchored to its purchase",
  "the capital witness walk broke",
);
check(
  fixtureCapitalModel.notes.some((n) => n.includes("honestly excluded")),
  "V1 rows without a seat ordinal are excluded with an honest note — never guessed",
  "the V1 exclusion honesty broke",
);
// Anti-scarcity extends to this class: no approaching/progress shape exists.
check(
  !JSON.stringify(fixtureCapitalModel).includes("approaching") &&
    !JSON.stringify(fixtureCapitalModel).includes("progress") &&
    !JSON.stringify(fixtureCapitalModel).includes("remaining"),
  "the capital model carries NO approaching/progress shape — never scarcity framing",
  "a capital approaching/progress shape appeared — the anti-scarcity doctrine broke",
);
// S7 — the standing fold (the walk's end state, one derivation): seat 2 ends
// on Advocate ($25 cum), seat 3 stands on the BASE rung Citizen (a STATE
// readback includes the base — LINE-ON-RISE governs the feed, not this), an
// unwalked seat is ABSENT (V1 exclusion honesty). S7-b (FOUNDER DECISION
// 2026-07-16, THE OWN-ACCOUNT DISPLAY RULE — GAMIFICATION_LEGAL_DOCTRINE):
// the row ALSO carries the seat's cumulative gross USDC so the member's own
// dashboard can show footprint + ladder + next rung (the Sephora account
// pattern; public chain data). THE FEED'S VOICE IS UNTOUCHED — the feed-line
// no-amount pin below still holds.
check(
  fixtureCapitalModel.standingBySeat.length === 2 &&
    fixtureCapitalModel.standingBySeat[0]!.seatNumber === 2 &&
    fixtureCapitalModel.standingBySeat[0]!.rung === "Advocate" &&
    fixtureCapitalModel.standingBySeat[0]!.cumulativeUsdcRaw === "25000000" &&
    fixtureCapitalModel.standingBySeat[1]!.seatNumber === 3 &&
    fixtureCapitalModel.standingBySeat[1]!.rung === "Citizen" &&
    fixtureCapitalModel.standingBySeat[1]!.cumulativeUsdcRaw === "5000000" &&
    !fixtureCapitalModel.standingBySeat.some((s) => s.seatNumber === 99),
  "the standing fold: walked seats carry their current rung + exact cumulative (base included), unwalked seats are absent — never guessed",
  "the capital standing fold broke",
);
check(
  fixtureCapitalModel.standingBySeat.every(
    (s) => Object.keys(s).join("|") === "seatNumber|rung|cumulativeUsdcRaw",
  ),
  "a standing row is {seatNumber, rung, cumulativeUsdcRaw} EXACTLY (S7-b own-account rule) — the FEED line still never carries the amount",
  "a capital standing row drifted from its founder-decided exact shape",
);
// ── D-TRUTH D1 (FOUNDER DECISION 2026-07-16 — no retroactive lines) ─────────
// The frozen-roster join folds early-era rows (V1 + V2B sentinel-0) into
// STANDING only. The same rows built WITH and WITHOUT the roster input must
// keep the rise record BYTE-IDENTICAL (the witnessed feed can never change);
// the joined seat gains its full footprint; an honest note says so; and the
// source pins the founder's flag OFF.
const genesisWallet = "0x" + "ab".repeat(20);
const joinFixtureRows = [
  {
    chainId: CHAIN,
    generation: "V3",
    eventName: "MembershipPurchasedV3",
    blockNumber: 100,
    logIndex: 0,
    transactionHash: txA,
    firstSeat: true,
    memberNumber: 2,
    usdcGrossRaw: "5" + "0".repeat(6),
    era: 1,
    memberAddress: null,
    referredBySource: false,
    referrerAddress: null,
  },
  {
    chainId: CHAIN,
    generation: "V1",
    eventName: "TokensPurchased",
    blockNumber: 100,
    logIndex: 9,
    transactionHash: txD,
    firstSeat: null,
    memberNumber: null,
    usdcGrossRaw: "50" + "0".repeat(6),
    era: null,
    memberAddress: genesisWallet,
    referredBySource: false,
    referrerAddress: null,
  },
  {
    // A V2B pairing sentinel (memberNumber 0) by the same genesis wallet —
    // joined per-era to the frozen seat, never treated as a seat itself.
    chainId: CHAIN,
    generation: "V2B",
    eventName: "Purchased",
    blockNumber: 150,
    logIndex: 2,
    transactionHash: txD,
    firstSeat: false,
    memberNumber: 0,
    usdcGrossRaw: "10" + "0".repeat(6),
    era: 1,
    memberAddress: genesisWallet,
    referredBySource: false,
    referrerAddress: null,
  },
];
const joinBase = buildCapitalAxisReadModel({
  expectedChainId: CHAIN,
  rawEvents: joinFixtureRows,
  blockTimestamps: milestoneTs,
});
const joinApplied = buildCapitalAxisReadModel({
  expectedChainId: CHAIN,
  rawEvents: joinFixtureRows,
  blockTimestamps: milestoneTs,
  genesisSeatByWallet: new Map([[genesisWallet, 1]]),
});
check(
  JSON.stringify(joinApplied.rises) === JSON.stringify(joinBase.rises),
  "the roster join changes NO rise — the witnessed feed record is byte-identical with and without it (the founder's no-retroactive-lines decision)",
  "the roster join altered the rise record — the no-retroactive-lines decision broke",
);
check(
  joinApplied.standingBySeat.some(
    (s) =>
      s.seatNumber === 1 &&
      s.rung === "Patron" &&
      s.cumulativeUsdcRaw === "60000000",
  ) &&
    !joinBase.standingBySeat.some((s) => s.seatNumber === 1),
  "the roster join gives the genesis seat its FULL footprint in standing (V1 + sentinel rows summed; $60 → Patron), absent without the join",
  "the genesis standing join broke",
);
check(
  joinApplied.notes.some((n) => n.includes("joined to their frozen genesis seats")) &&
    !joinApplied.notes.some((n) => n.includes("honestly excluded")),
  "the join is said in an honest note, and no excluded-rows note remains when every early-era row joined",
  "the genesis-join honesty note broke",
);
check(
  read("src/backbone/capitalAxisReadmodel.ts").includes(
    "GENESIS_JOIN_EMITS_RISES = false",
  ),
  "the founder's no-retroactive-lines flag is pinned OFF in source (flipping it is a founder gate)",
  "GENESIS_JOIN_EMITS_RISES drifted from the founder's decision",
);
expectThrow("capital build fails closed on an attributed purchase without its amount", () =>
  buildCapitalAxisReadModel({
    expectedChainId: CHAIN,
    rawEvents: [
      {
        chainId: CHAIN,
        generation: "V3",
        eventName: "MembershipPurchasedV3",
        blockNumber: 100,
        logIndex: 0,
        transactionHash: txA,
        firstSeat: true,
        memberNumber: 2,
        usdcGrossRaw: null,
        era: 1,
        memberAddress: null,
        referredBySource: false,
        referrerAddress: null,
      },
    ],
    blockTimestamps: milestoneTs,
  }),
);

const feed = buildPublicFeed({
  model: fixtureModel,
  protocolModel: fixtureProtocolModel,
  milestoneModel: fixtureMilestoneModel,
  eraModel: fixtureEraModel,
  capitalModel: fixtureCapitalModel,
  state: "idle",
  headBlock: 300,
  finishedIso: "2026-07-13T00:00:00.000Z",
  burnsAsOfBlock: 250,
  lifecycleAsOfBlock: 250,
});
check(
  feed.coverage.burnsAsOfBlock === 250 &&
    feed.coverage.lifecycleAsOfBlock === 250,
  "the feed states the protocol lane's honest coverage bounds (cursors)",
  "feed coverage lost the lane asOf bounds",
);
const feedJson = JSON.stringify(feed);
check(
  // A1 (2026-07-22): 18 → 19 with the founder-funding treasury row.
  // M-EVO-1 (2026-07-22): 19 → 22 — the retro-sealed family milestones
  // (first burn act · first source · first LP add) join as feed lines.
  feed.items.length === 22 &&
    feed.items[0]!.blockNumber === 200 &&
    feed.items[21]!.blockNumber === 100,
  "feed serves newest first across ALL kinds (seats, burns, lifecycle, lp, archive, treasury, milestones, eras, capital)",
  `feed ordering broke (items=${feed.items.length})`,
);
check(
  feed.lanes.capital === true &&
    feed.items.filter((i) => i.kind === "capital-rise").length === 1 &&
    feedJson.includes('"rung":"Advocate"') &&
    feedJson.includes('"seatNumber":2'),
  "the capital lane serves its witnessed rise (seat ordinal + rung title as public facts)",
  "the capital lane broke",
);
// H2-⑦: the treasury lines ride the feed with LABELS only — an organ or
// counterparty address must never appear ON A TREASURY LINE.
//
// SCOPE CORRECTED 2026-07-26, and the correction is the point: this check used to
// scan the WHOLE payload for those addresses. Once the address law put public
// full addresses on the purchase/burn/liquidity lanes, a Founder address
// published legitimately on a SEAT line tripped a check about TREASURY lines —
// the assertion was answering a different question than the one it asked. Pin the
// scope to the lines the rule is about (CLAUDE.md verification protocol ③: ask
// what a query would return if the filter were missing, BEFORE reading it).
const treasuryJson = JSON.stringify(
  feed.items.filter((i) => i.kind === "treasury-move"),
);
check(
  // A1 (2026-07-22): 2 → 3 treasury lines (the founder-funding inflow).
  feed.lanes.treasury === true &&
    feed.items.filter((i) => i.kind === "treasury-move").length === 3 &&
    !treasuryJson.includes(vaultAddr) &&
    !treasuryJson.includes(opsAddr) &&
    !treasuryJson.includes(externalAddr) &&
    !treasuryJson.includes(founderAddr) &&
    treasuryJson.includes('"organLabel":"the vault"'),
  "treasury lines serve organ LABELS only — no organ or counterparty address on a treasury line",
  "the treasury label discipline broke",
);
// A1 pin (2026-07-22): the founder-funding flag SERVES as a boolean label —
// exactly one true (the founder→vault inflow), never an address beside it.
check(
  feedJson.includes('"counterpartFounder":true') &&
    (feedJson.match(/"counterpartFounder":true/g) ?? []).length === 1,
  "the founder-funding counterpart flag serves (one true row, boolean only)",
  "the founder-funding served flag broke",
);
// Static pin — burn sovereignty: the treasury SYN decoder must yield logs
// whose recipient is the burn address (the numbered Proof of Burn record owns
// the (chain, tx, logIndex) unique key; a treasury row must never displace it).
check(
  stripComments(read("src/backbone/protocolEventScan.ts")).includes(
    "to === synBurnAddress.toLowerCase()",
  ),
  "the treasury SYN decoder yields burn-address logs to the burn lane (Proof of Burn sovereign)",
  "the burn-sovereignty yield disappeared from the treasury decoder",
);
expectThrow("feed gate trips on an address-shaped treasury organ label", () =>
  buildPublicFeed({
    model: null,
    protocolModel: {
      ...fixtureProtocolModel,
      treasuryItems: [
        {
          ...fixtureProtocolModel.treasuryItems[0]!,
          organLabel: "0x" + "ee".repeat(20),
        },
      ],
    },
    milestoneModel: null,
    eraModel: null,
    capitalModel: null,
    state: "idle",
    headBlock: 300,
    finishedIso: null,
    burnsAsOfBlock: null,
    lifecycleAsOfBlock: null,
  }),
);
// H2-⑬/⑫: derived lines share their anchor with the event that crossed/
// witnessed them — in the newest-first feed the crossing reads as the
// CONSEQUENCE (both derived kinds rank newer than the underlying purchase).
check(
  feed.items[0]!.kind === "milestone" &&
    feed.items[1]!.kind === "era-transition" &&
    feed.items[2]!.kind === "purchase" &&
    feed.items[2]!.blockNumber === 200,
  "derived lines (milestone + era) rank newer than their underlying event on a shared anchor",
  "the derived tie-break broke — a crossing no longer reads as the consequence",
);
check(
  feed.lanes.eras === true &&
    feed.items.filter((i) => i.kind === "era-transition").length === 1 &&
    feedJson.includes('"era":2') &&
    feedJson.includes('"engine":"V3"'),
  "the era lane serves its witnessed transition (era + engine as public facts)",
  "the era lane broke",
);
check(
  feed.lanes.liquidity === true && feed.lanes.archive === true,
  "the feed declares the liquidity + archive lanes honestly",
  "the new lane flags broke",
);
check(
  // M-EVO-1 (2026-07-22): 3 → 6 sealed; approaching = the 8 lanes, each
  // with family + its own current figure serving.
  feed.lanes.milestones === true &&
    feed.milestones !== null &&
    feed.milestones.sealed.length === 6 &&
    feed.milestones.sealed[0]!.milestoneId === "first-seat" &&
    feed.milestones.approaching.length === 9 &&
    feed.milestones.approaching.every(
      (a) => typeof (a as { family?: unknown }).family === "string",
    ) &&
    JSON.stringify(feed.milestones.approaching).includes('"currentSynRaw"'),
  "the feed serves the Milestones panel block (6 sealed + the 8 family lanes, honest flags)",
  "the milestones block broke",
);
expectThrow("feed gate trips on a planted bare 64-hex in a milestone label", () =>
  assertFeedSafeJson(
    JSON.stringify(
      buildPublicFeed({
        model: null,
        protocolModel: null,
        milestoneModel: {
          ...fixtureMilestoneModel,
          approaching: [
            {
              id: "seats-100",
              label: "ee".repeat(32),
              kind: "seats",
              target: 100,
              currentSeats: 2,
              currentUsdcRaw: null,
            },
          ],
        },
        state: "idle",
        headBlock: 300,
        finishedIso: null,
        burnsAsOfBlock: null,
        lifecycleAsOfBlock: null,
      }),
    ),
  ),
);
check(
  feed.burnLedger.length === 2 &&
    feed.burnLedger[0]!.proofOfBurnNumber === 1 &&
    feed.lanes.burns === true &&
    feed.lanes.referralLifecycle === true,
  "the complete numbered burn ledger is served oldest-first with honest lane flags",
  "burn ledger serving broke",
);
// H2-P — THE PRIDE OF THE PUBLIC RECORD (founder amendment, ADR-003
// 2026-07-15), AMENDED 2026-07-26 BY THE SETTLED ADDRESS LAW (2026-07-24/25).
//
// WHAT CHANGED AND WHY. This check used to assert that a full 40-hex address
// NEVER serialized — including under the very field names the feed now publishes
// on purpose. That was the address-HIDING reflex, and the Founder's ruling with
// its legal research killed it: a bare address is PSEUDONYMOUS, not personal
// data (EDPB Guidelines 02/2025 · CJEU C-413/23 P · the CCPA "reasonably linked"
// test); the short form is READABILITY, never masking; and "any code that masks
// or fail-closes on an address as if it were a secret is a BUG against this law."
// The sibling leak scan already agreed — activity-heartbeat.guard.ts:335 reads
// "leak scan ALLOWS a public 40-hex address (address law 2026-07-25)". This
// guard was the last holdout, and it is why /activity rendered dead grey text
// where every comparable surface (Etherscan · Hyperliquid · DeBank) renders a
// verifiable anchor.
//
// WHAT DID NOT CHANGE — the actual red line. The regulated artifact is the
// name↔address MAPPING, never the address; and the readmodel's SERVER-SIDE input
// field names must still never appear in a public payload, because their presence
// means an internal shape escaped rather than a projection being published.
check(
  !feedJson.includes("fromAddress") &&
    !feedJson.includes("senderAddress") &&
    !feedJson.includes("referrerAddress") &&
    !feedJson.includes("decodedJson") &&
    !feedJson.includes("rawJson") &&
    !feedJson.includes("walletIndex"),
  "boundary discipline: server-side input field names and server-only payloads never serialize",
  "the feed leaked a server-only field name or payload",
);
// The PUBLIC address fields are published deliberately, and each one must arrive
// beside the short form it makes clickable — a short form with no full value is
// the dead-end this amendment exists to remove.
check(
  feedJson.includes('"memberAddress"') &&
    feedJson.includes('"referredByAddress"') &&
    feedJson.includes(communityAddr) &&
    feedJson.includes('"memberShort"'),
  "address law: the public full address ships beside its short form, so every rendered address is verifiable",
  "the public address fields stopped shipping — a rendered short form would become a dead end",
);
// THE FOUNDER VOICE RULE SURVIVES THE AMENDMENT: on the lanes where the sentence
// speaks his NAME instead of an address (burns, liquidity), the projection nulls
// both forms — so his address must not appear through THOSE fields. This is an
// editorial rule about whose voice the line carries, NOT address hiding: the
// same address is public everywhere else, including on the explorer.
check(
  !feedJson.includes(`"actorShort":"${founderAddr}"`) &&
    !feedJson.includes(`"actorAddress":"${founderAddr}"`),
  "the Founder voice rule holds: his acts say the Founder, never an address, on the burn and liquidity lanes",
  "the Founder voice rule broke on a burn or liquidity line",
);
check(
  feedJson.includes('"memberNumber":424242') &&
    feedJson.includes('"memberShort":"0xbbb…bbbb"') &&
    feedJson.includes('"referred":true') &&
    // Founder override A (2026-07-15): the referrer named from the SAME
    // event — short form, no join; the growth engine's pride.
    feedJson.includes('"referredByShort":"0xccc…cccc"') &&
    feedJson.includes('"minterShort":"0xbbb…bbbb"'),
  "the pride voice serves: member number + SHORT-FORM signatures + the named referrer (override A)",
  "the pride fields broke — number/short-form/referred-by missing from the feed",
);
check(
  feed.burnLedger[0]!.senderLabel === "Founder" &&
    feed.burnLedger[0]!.actorShort === null &&
    feed.burnLedger[1]!.senderLabel === "Community" &&
    feed.burnLedger[1]!.actorShort === "0xbbb…bbbb",
  "the founder voice rule stands: founder acts say the founder (no short form); Community pride carries it",
  "the founder-voice/short-form split broke on burns",
);
check(
  feedJson.includes('"senderLabel":"Founder"') &&
    feedJson.includes('"senderLabel":"Community"'),
  "burn lines carry their Founder/Community labels",
  "burn labels missing from the feed",
);
expectThrow("projection fails closed on a non-lowercase/full pride actor", () =>
  buildPublicFeed({
    model: {
      ...fixtureModel,
      items: [
        { ...fixtureModel.items[1]!, memberAddress: "0x" + "AB".repeat(20) },
      ],
    },
    protocolModel: null,
    milestoneModel: null,
    eraModel: null,
    capitalModel: null,
    state: "idle",
    headBlock: 300,
    finishedIso: null,
    burnsAsOfBlock: null,
    lifecycleAsOfBlock: null,
  }),
);
assertFeedSafeJson(feedJson);
ok.push("feed gate passes a well-formed feed (anchors masked, rest clean)");
check(
  feedJson.includes(txA) && feedJson.includes(txB) && feedJson.includes(txC),
  "feed carries the verify anchors (public chain data — the point of the line)",
  "feed lost its verify anchors",
);
expectThrow("feed gate trips on planted over-long hex (0x + 41+)", () =>
  assertFeedSafeJson(feedJson.replace(txA, "0x" + "ee".repeat(21))),
);
expectThrow("feed gate trips on planted bare 32-byte hex", () =>
  assertFeedSafeJson(feedJson + JSON.stringify({ x: "ff".repeat(32) })),
);
expectThrow("projection fails closed on an address-shaped verify anchor", () =>
  buildPublicFeed({
    model: {
      ...fixtureModel,
      items: [
        { ...fixtureModel.items[0]!, transactionHash: "0x" + "ee".repeat(20) },
      ],
    },
    protocolModel: null,
    milestoneModel: null,
    eraModel: null,
    capitalModel: null,
    state: "idle",
    headBlock: 300,
    finishedIso: null,
    burnsAsOfBlock: null,
    lifecycleAsOfBlock: null,
  }),
);
expectThrow("projection fails closed on a non-canonical sender label", () =>
  buildPublicFeed({
    model: null,
    protocolModel: {
      ...fixtureProtocolModel,
      burnLedger: [
        {
          ...fixtureProtocolModel.burnLedger[0]!,
          senderLabel: "0x" + "ee".repeat(20) as never,
        },
      ],
    },
    milestoneModel: null,
    eraModel: null,
    capitalModel: null,
    state: "idle",
    headBlock: 300,
    finishedIso: null,
    burnsAsOfBlock: null,
    lifecycleAsOfBlock: null,
  }),
);
{
  const empty = buildPublicFeed({
    model: null,
    protocolModel: null,
    milestoneModel: null,
    eraModel: null,
    capitalModel: null,
    state: "disabled",
    headBlock: null,
    finishedIso: null,
    burnsAsOfBlock: null,
    lifecycleAsOfBlock: null,
  });
  check(
    empty.items.length === 0 &&
      empty.coverage.itemsTotal === 0 &&
      empty.burnLedger.length === 0 &&
      empty.lanes.seats === false &&
      empty.lanes.burns === false &&
      empty.lanes.treasury === false &&
      empty.lanes.milestones === false &&
      empty.lanes.eras === false &&
      empty.lanes.capital === false &&
      empty.milestones === null,
    "null models serve an honest empty feed with honest lane flags (never invented)",
    "empty-feed posture broke",
  );
}
check(
  FEED_MAX_ITEMS === 100 &&
    stripComments(read("src/backbone/feedProjection.ts")).includes(
      ".slice(0, FEED_MAX_ITEMS)",
    ),
  "feed hard cap present (newest-first slice at FEED_MAX_ITEMS=100)",
  "feed cap drifted or is not applied",
);
check(
  TX_HASH_SHAPE_RE.source === "^0x[0-9a-fA-F]{64}$",
  "verify-anchor shape is the exact 0x+64-hex transaction form",
  "verify-anchor shape regex drifted",
);
check(
  feedRouteSrc.includes("assertFeedSafeJson(serialized)") &&
    feedRouteSrc.indexOf("assertFeedSafeJson(serialized)") <
      feedRouteSrc.indexOf(".send(serialized)") &&
    // A2 (2026-07-22): BOTH response paths (whole feed + the paged envelope)
    // pass the fail-closed gate — one scan per send, never a bare send.
    (feedRouteSrc.match(/assertFeedSafeJson\(serialized\)/g) ?? []).length ===
      (feedRouteSrc.match(/\.send\(serialized\)/g) ?? []).length,
  "feed route scans the serialized payload BEFORE sending it (every path, A2)",
  "feed route sends without the fail-closed gate",
);
// A2 pins (2026-07-22): pagination is ADDITIVE (bare request = the whole
// envelope) and fail-closed (malformed limit/cursor = 400, never a guess);
// pages are CLUSTER-CLOSED (a shared-anchor derived line never splits from
// its underlying event across a page boundary).
check(
  feedRouteSrc.includes("rawLimit === undefined && rawCursor === undefined") &&
    feedRouteSrc.includes('"bad_limit"') &&
    feedRouteSrc.includes('"bad_cursor"') &&
    feedRouteSrc.includes("kindCounts") &&
    feedRouteSrc.includes("nextCursor"),
  "feed pagination: additive bare path + fail-closed 400s + served kindCounts/nextCursor (A2)",
  "the feed pagination contract drifted",
);
// M-EVO hardening (adversarial verify, 2026-07-22): the page logic is a
// PURE function and these pins are BEHAVIORAL — string presence alone let
// a flipped comparison or a deleted cluster loop ship green.
// The route must page over the WHOLE history, never the capped window.
check(
  feedRouteSrc.includes("buildPublicFeedWithLines") &&
    feedRouteSrc.includes("sliceFeedPage(allLines") &&
    feedRouteSrc.includes("totalCount: allLines.length") &&
    feedRouteSrc.includes("for (const i of allLines)"),
  "feed pagination speaks from allLines (whole history), never the capped items window",
  "the pagination whole-history discipline drifted back to the capped window",
);
{
  // A synthetic 5-line history, newest first, with a CLUSTER at (90, 4):
  // two derived-style lines sharing (block, logIndex).
  const mk = (blockNumber: number, logIndex: number, tag: string) =>
    ({
      kind: "burn",
      proofOfBurnNumber: 1,
      amountSynRaw: "1" + "0".repeat(18),
      senderLabel: "Community",
      actorShort: null,
      blockNumber,
      blockTimestampSec: T0,
      isoDayUtc: "2026-07-01",
      transactionHash: "0x" + tag.repeat(32).slice(0, 64),
      logIndex,
    }) as unknown as import("../src/backbone/feedProjection").PublicFeedLine;
  const lines = [
    mk(100, 1, "aa"),
    mk(90, 4, "bb"),
    mk(90, 4, "bc"),
    mk(90, 2, "bd"),
    mk(80, 0, "cc"),
  ];
  const p1 = sliceFeedPage(lines, 2, null);
  check(
    p1.pageItems.length === 3 &&
      p1.pageItems[2]!.logIndex === 4 &&
      p1.nextCursor === "90:4",
    "sliceFeedPage closes a cluster: a page never splits lines sharing (block, logIndex)",
    "the cluster-closed page law broke",
  );
  const p2 = sliceFeedPage(lines, 2, { blockNumber: 90, logIndex: 4 });
  check(
    p2.pageItems.length === 2 &&
      p2.pageItems[0]!.blockNumber === 90 &&
      p2.pageItems[0]!.logIndex === 2 &&
      p2.pageItems[1]!.blockNumber === 80 &&
      p2.nextCursor === null,
    "sliceFeedPage continues STRICTLY older than the cursor — no duplicate, no skip, honest end",
    "the strictly-older cursor law broke",
  );
  const p3 = sliceFeedPage(lines, 2, { blockNumber: 10, logIndex: 0 });
  check(
    p3.pageItems.length === 0 && p3.nextCursor === null,
    "sliceFeedPage past the end serves an honest empty page",
    "the past-the-end page behavior broke",
  );
}
check(
  !DB_TOUCH_RE.test(feedRouteSrc) && !feedRouteSrc.includes("fetch("),
  "feed route reads memory only (no DB, no network)",
  "feed route grew a DB/network dependency",
);

// ---------------------------------------------------------------------------
// THE LANE/ORGAN COMPLETENESS PINS (senior review, 2026-07-25).
// Four new treasury lanes and a fourth organ were added and this guard's total
// did not move by a single check — it pinned neither the scan-target set nor
// the organ set, so a lane could be declared and never wired (or wired and
// never declared) in silence. These pins close that.
// ---------------------------------------------------------------------------
{
  const scanSrc = stripComments(read("src/backbone/protocolEventScan.ts"));
  const declared = PROTOCOL_EVENT_SCAN_TARGETS.map((t) => t.streamKey);

  // ① Every declared stream has a STREAM_CONFIG entry (declared ⇒ wired).
  const unwired = declared.filter((k) => !new RegExp(`\\b${k}:\\s*\\{`).test(scanSrc));
  check(
    unwired.length === 0,
    `every declared scan target is wired in STREAM_CONFIG (${declared.length} streams)`,
    `declared scan target(s) with no STREAM_CONFIG entry: ${unwired.join(", ")}`,
  );

  // ② Every treasury lane's scanned contract is one of the canon token
  //    addresses — the CONTRACT is what identifies the token downstream, so a
  //    lane pointed at the wrong contract would mislabel real money.
  const treasuryTargets = PROTOCOL_EVENT_SCAN_TARGETS.filter((t) =>
    t.streamKey.startsWith("TREASURY_"),
  );
  const tokenAddrs = new Set(
    [
      FINANCIAL_TARGETS.usdcTokenAddress,
      FINANCIAL_TARGETS.synTokenAddress,
      FINANCIAL_TARGETS.btcbTokenAddress,
      FINANCIAL_TARGETS.wethTokenAddress,
    ].map((a) => a.toLowerCase()),
  );
  check(
    treasuryTargets.length === 8 &&
      treasuryTargets.every((t) => tokenAddrs.has(t.address.toLowerCase())),
    `all 8 treasury lanes scan a canon token contract (USDC · SYN · BTC.b · WETH.e, IN+OUT each)`,
    `a treasury lane scans a non-canon contract, or the lane count moved (${treasuryTargets.length})`,
  );

  // ③ Every treasury lane pairs IN with OUT — a one-directional lane would
  //    show money arriving and never leaving (or the reverse).
  const bases = [...new Set(treasuryTargets.map((t) => t.streamKey.replace(/_(IN|OUT)$/, "")))];
  const unpaired = bases.filter(
    (b) => !declared.includes(`${b}_IN`) || !declared.includes(`${b}_OUT`),
  );
  check(
    unpaired.length === 0,
    `every treasury lane declares BOTH directions (${bases.length} token lanes)`,
    `treasury lane(s) missing a direction: ${unpaired.join(", ")}`,
  );

  // ④ The organ set the SCANNER filters on and the organ set the RUNNER labels
  //    must be the same four wallets. If a wallet were filtered but unlabelled
  //    its moves would be dropped; if labelled but unfiltered, never seen.
  const runnerSrc = stripComments(read("src/backbone/backboneRunner.ts"));
  const organFields = ["vaultWallet", "liquidityWallet", "operationsWallet", "nftSaleWallet"];
  const filtered = organFields.filter((f) =>
    new RegExp(`addressToTopic\\(FINANCIAL_TARGETS\\.${f}\\)`).test(scanSrc),
  );
  const labelled = organFields.filter((f) =>
    new RegExp(`FINANCIAL_TARGETS\\.${f}\\.toLowerCase\\(\\)`).test(runnerSrc),
  );
  check(
    filtered.length === organFields.length && labelled.length === organFields.length,
    `the scanner's organ filter and the runner's organ labels cover the same 4 organs`,
    `organ set mismatch — filtered: [${filtered.join(", ")}] labelled: [${labelled.join(", ")}]`,
  );
}

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
