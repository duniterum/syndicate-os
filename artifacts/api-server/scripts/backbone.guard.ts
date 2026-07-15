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
} from "../src/backbone/feedProjection";

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
// is exactly {sourceId, recipient, acquisitionCost} (gated fields, legitimate
// ONLY in this file server-side), and the built model is leak-scanned BEFORE
// it is ever held; nothing else in src may set the live model.
{
  const introSrc = stripComments(read("src/backbone/introductionRefresh.ts"));
  const introAccesses = [...introSrc.matchAll(/\bp\.(\w+)/g)]
    .map((m) => m[1])
    .filter((k): k is string => Boolean(k));
  const allowedIntro = new Set(["sourceId", "recipient", "acquisitionCost"]);
  check(
    introAccesses.length > 0 && introAccesses.every((k) => allowedIntro.has(k)),
    "introduction refresh decodedJson whitelist is exactly {sourceId, recipient, acquisitionCost}",
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
  const leakIdx = introSrc.indexOf("assertNoAddressLeak(JSON.stringify(model))");
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
    { blockNumber: 180, logIndex: 1, transactionHash: txH, artifactId: 1, quantityRaw: "1" },
  ],
  // H1a ⑨: a ceremonial pause.
  archivePauses: [
    { eventName: "Paused", blockNumber: 190, logIndex: 0, transactionHash: txI },
  ],
  blockTimestamps: [
    { chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 },
    { chainId: CHAIN, blockNumber: 150, blockTimestampSec: T0 + 3_600 },
    { chainId: CHAIN, blockNumber: 160, blockTimestampSec: T0 + 4_600 },
    { chainId: CHAIN, blockNumber: 170, blockTimestampSec: T0 + 5_600 },
    { chainId: CHAIN, blockNumber: 180, blockTimestampSec: T0 + 6_600 },
    { chainId: CHAIN, blockNumber: 190, blockTimestampSec: T0 + 7_600 },
  ],
  founderAddresses: new Set([founderAddr]),
  lpToken0IsSyn: false,
});
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

const feed = buildPublicFeed({
  model: fixtureModel,
  protocolModel: fixtureProtocolModel,
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
  feed.items.length === 11 &&
    feed.items[0]!.blockNumber === 200 &&
    feed.items[10]!.blockNumber === 100,
  "feed serves newest first across ALL kinds (seats, burns, lifecycle, lp, archive)",
  `feed ordering broke (items=${feed.items.length})`,
);
check(
  feed.lanes.liquidity === true && feed.lanes.archive === true,
  "the feed declares the liquidity + archive lanes honestly",
  "the new lane flags broke",
);
check(
  feed.burnLedger.length === 2 &&
    feed.burnLedger[0]!.proofOfBurnNumber === 1 &&
    feed.lanes.burns === true &&
    feed.lanes.referralLifecycle === true,
  "the complete numbered burn ledger is served oldest-first with honest lane flags",
  "burn ledger serving broke",
);
check(
  !feedJson.includes("memberNumber") &&
    !feedJson.includes("424242") &&
    !feedJson.includes(founderAddr) &&
    !feedJson.includes(communityAddr) &&
    !feedJson.includes("fromAddress") &&
    !feedJson.includes("senderAddress"),
  "feed is identity-blind: no member numbers, and burn senders appear ONLY as labels — never an address",
  "feed leaked a pairing token or a burn sender address",
);
check(
  feedJson.includes('"senderLabel":"Founder"') &&
    feedJson.includes('"senderLabel":"Community"'),
  "burn lines carry their Founder/Community labels",
  "burn labels missing from the feed",
);
assertFeedSafeJson(feedJson);
ok.push("feed gate passes a well-formed feed (anchors masked, rest clean)");
check(
  feedJson.includes(txA) && feedJson.includes(txB) && feedJson.includes(txC),
  "feed carries the verify anchors (public chain data — the point of the line)",
  "feed lost its verify anchors",
);
expectThrow("feed gate trips on a planted 20-byte address", () =>
  assertFeedSafeJson(feedJson.replace(txA, "0x" + "ee".repeat(20))),
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
      empty.lanes.burns === false,
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
      feedRouteSrc.indexOf(".send(serialized)"),
  "feed route scans the serialized payload BEFORE sending it",
  "feed route sends without the fail-closed gate",
);
check(
  !DB_TOUCH_RE.test(feedRouteSrc) && !feedRouteSrc.includes("fetch("),
  "feed route reads memory only (no DB, no network)",
  "feed route grew a DB/network dependency",
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
