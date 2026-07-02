/**
 * Activity Heartbeat Read-Model — GUARD SUITE.
 * ---------------------------------------------
 * Fixture checks exercise the pure builder fail-closed paths and the
 * address-safe report; static scans (comment-stripped) hold the boundary:
 * pure builder, read-only derive, whitelisted decodedJson access, no served
 * import, no route, taxonomy reconciled to the vendored canon.
 *
 * Run: pnpm --filter @workspace/api-server run activity:guard
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  buildActivityHeartbeatReadModel,
  toAddressSafeActivityReport,
  ACTIVITY_EVENT_KIND,
  ACTIVITY_EVENT_CATEGORY,
  ACTIVITY_HEARTBEAT_READ_MODEL_META,
  type ActivityBuildInput,
  type RawSaleEventInput,
} from "./activity-heartbeat-readmodel";
import { assertAddressSafeJson } from "./member-continuity-readmodel";

const here = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(here, "..");

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

/** Strip block and line comments before scanning code. */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

// ---------------------------------------------------------------------------
// Fixtures — synthetic, chain-shaped, NO real hashes/wallets/numbers.
// ---------------------------------------------------------------------------

const CHAIN = 43114;
const T0 = 1_700_000_000; // chain-verified-shaped epoch seconds (fixture)

function ev(partial: Partial<RawSaleEventInput>): RawSaleEventInput {
  return {
    chainId: CHAIN,
    generation: "V1",
    eventName: "TokensPurchased",
    blockNumber: 100,
    logIndex: 0,
    transactionHash: "tx-a",
    firstSeat: null,
    memberNumber: null,
    ...partial,
  };
}

const happyInput: ActivityBuildInput = {
  expectedChainId: CHAIN,
  rawEvents: [
    ev({ blockNumber: 100, logIndex: 0, transactionHash: "tx-a" }),
    ev({
      generation: "V2A",
      eventName: "Purchased",
      blockNumber: 200,
      logIndex: 1,
      transactionHash: "tx-b",
      firstSeat: true,
      memberNumber: 424242,
    }),
    ev({
      generation: "V2A",
      eventName: "Routed",
      blockNumber: 200,
      logIndex: 2,
      transactionHash: "tx-b",
      memberNumber: 424242,
    }),
    ev({
      generation: "V2B",
      eventName: "Purchased",
      blockNumber: 250,
      logIndex: 0,
      transactionHash: "tx-e",
      firstSeat: false,
      memberNumber: 0, // sentinel: valid opaque pairing token, never identity
    }),
    ev({
      generation: "V2B",
      eventName: "Routed",
      blockNumber: 250,
      logIndex: 1,
      transactionHash: "tx-e",
      memberNumber: 0,
    }),
    ev({
      generation: "V3",
      eventName: "MembershipPurchasedV3",
      blockNumber: 87654321,
      logIndex: 3,
      transactionHash: "tx-c",
      firstSeat: true,
      memberNumber: 515151,
    }),
  ],
  blockTimestamps: [
    { chainId: CHAIN, blockNumber: 100, blockTimestampSec: T0 },
    { chainId: CHAIN, blockNumber: 200, blockTimestampSec: T0 + 86_400 },
    { chainId: CHAIN, blockNumber: 250, blockTimestampSec: T0 + 90_000 },
    { chainId: CHAIN, blockNumber: 87654321, blockTimestampSec: T0 + 172_800 },
  ],
};

const happy = buildActivityHeartbeatReadModel(happyInput);
check(
  happy.totals.items === 4 &&
    happy.totals.purchaseEvents === 4 &&
    happy.totals.routedRowsFolded === 2 &&
    happy.totals.rawRowsConsidered === 6,
  "happy path: 6 raw rows → 4 items with 2 Routed folded",
  `happy path totals wrong: ${JSON.stringify(happy.totals)}`,
);
check(
  happy.firstSeatBuckets.true === 2 &&
    happy.firstSeatBuckets.false === 1 &&
    happy.firstSeatBuckets.unknown === 1,
  "firstSeat buckets: V1 stays unknown (never inferred), flags pass through",
  `firstSeat buckets wrong: ${JSON.stringify(happy.firstSeatBuckets)}`,
);
check(
  happy.items.every(
    (i) => i.kind === ACTIVITY_EVENT_KIND && i.category === ACTIVITY_EVENT_CATEGORY,
  ),
  "every item carries the canonical kind/category",
  "item kind/category drifted from the canonical taxonomy literals",
);
check(
  happy.items.map((i) => i.blockNumber).join(",") === "100,200,250,87654321",
  "items ordered by (blockNumber, logIndex)",
  "item ordering broke",
);
check(
  happy.consistent,
  "happy path: all internal checks pass",
  "happy path: internal checks failed",
);

// Determinism: shuffled input → identical result.
const shuffled = buildActivityHeartbeatReadModel({
  ...happyInput,
  rawEvents: [...happyInput.rawEvents].reverse(),
  blockTimestamps: [...happyInput.blockTimestamps].reverse(),
});
check(
  JSON.stringify(happy) === JSON.stringify(shuffled),
  "determinism: input order never changes the output",
  "determinism violated: shuffled input produced a different result",
);

// Fail-closed paths.
expectThrow("missing verified timestamp", () =>
  buildActivityHeartbeatReadModel({
    ...happyInput,
    blockTimestamps: happyInput.blockTimestamps.slice(1),
  }),
);
expectThrow("wrong chain id on event", () =>
  buildActivityHeartbeatReadModel({
    ...happyInput,
    rawEvents: [ev({ chainId: 1 })],
  }),
);
expectThrow("wrong chain id on timestamp", () =>
  buildActivityHeartbeatReadModel({
    ...happyInput,
    blockTimestamps: [
      { chainId: 1, blockNumber: 100, blockTimestampSec: T0 },
    ],
  }),
);
expectThrow("unpaired Routed row", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [
      ev({
        generation: "V2A",
        eventName: "Routed",
        transactionHash: "tx-x",
        memberNumber: 7,
      }),
    ],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);
expectThrow("two purchases in one transaction", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [
      ev({ transactionHash: "tx-dup", logIndex: 0 }),
      ev({ transactionHash: "tx-dup", logIndex: 1 }),
    ],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);
expectThrow("Routed/purchase token mismatch", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [
      ev({
        generation: "V2A",
        eventName: "Purchased",
        transactionHash: "tx-m",
        firstSeat: true,
        memberNumber: 5,
      }),
      ev({
        generation: "V2A",
        eventName: "Routed",
        transactionHash: "tx-m",
        logIndex: 1,
        memberNumber: 6,
      }),
    ],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);
expectThrow("Routed generation mismatch", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [
      ev({
        generation: "V2A",
        eventName: "Purchased",
        transactionHash: "tx-g",
        firstSeat: true,
        memberNumber: 5,
      }),
      ev({
        generation: "V2B",
        eventName: "Routed",
        transactionHash: "tx-g",
        logIndex: 1,
        memberNumber: 5,
      }),
    ],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);
expectThrow("unknown event name", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [ev({ eventName: "Transfer" })],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);
expectThrow("unknown generation", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [ev({ generation: "V9" })],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);
expectThrow("V1 Routed impossible", () =>
  buildActivityHeartbeatReadModel({
    expectedChainId: CHAIN,
    rawEvents: [ev({ eventName: "Routed" })],
    blockTimestamps: happyInput.blockTimestamps,
  }),
);

// Address-safe report: whitelist projection + planted-value absence.
const report = toAddressSafeActivityReport(happy);
const reportJson = JSON.stringify(report);
check(
  !reportJson.includes("424242") &&
    !reportJson.includes("515151") &&
    !reportJson.includes("87654321"),
  "report leaks no pairing tokens (member numbers) and no block numbers",
  "report leaked a planted member number or block number",
);
check(
  !reportJson.includes("tx-a") && !reportJson.includes("items\":["),
  "report carries no transaction keys and no per-item rows",
  "report leaked transaction keys or per-item rows",
);
check(
  report.dateRangeUtc.first !== null &&
    /^\d{4}-\d{2}-\d{2}$/.test(report.dateRangeUtc.first),
  "report date range is day-granularity ISO (UTC)",
  "report date range malformed",
);
check(
  report.meta === ACTIVITY_HEARTBEAT_READ_MODEL_META &&
    report.meta.publicProjection === "NONE" &&
    report.meta.persistence === "NONE_IN_MEMORY_ONLY",
  "report meta binds ACTIVITY_HEARTBEAT posture (no projection, no persistence)",
  "report meta drifted from the declared posture",
);
expectThrow("leak scan trips on planted hex address", () =>
  assertAddressSafeJson(
    JSON.stringify({ note: "0x" + "ab".repeat(20) }),
  ),
);

// ---------------------------------------------------------------------------
// Static scans (comment-stripped).
// ---------------------------------------------------------------------------

const readmodelSrc = stripComments(
  readFileSync(path.resolve(here, "activity-heartbeat-readmodel.ts"), "utf8"),
);
const deriveSrc = stripComments(
  readFileSync(path.resolve(here, "activity-heartbeat-derive.ts"), "utf8"),
);

// Builder purity: no db / network / rpc / clock.
for (const banned of [
  '"@workspace/db"',
  "drizzle-orm",
  '"pg"',
  "node:http",
  "node:https",
  "node:net",
  "fetch(",
  "viem",
  "ethers",
  "Date.now",
]) {
  check(
    !readmodelSrc.includes(banned),
    `builder purity: no ${banned}`,
    `builder must not reference ${banned}`,
  );
}
check(
  !/new Date\(\)/.test(readmodelSrc),
  "builder purity: no zero-arg new Date() (wall clock)",
  "builder reads the wall clock via zero-arg new Date()",
);

// Derive: read-only — no write verbs, no DDL, no RPC.
for (const banned of [
  ".insert(",
  ".update(",
  ".delete(",
  "INSERT INTO",
  "UPDATE ",
  "DELETE FROM",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "migrate",
  "fetch(",
  "viem",
  "ethers",
  "JsonRpcProvider",
  "Date.now",
]) {
  check(
    !deriveSrc.includes(banned),
    `derive read-only: no ${banned}`,
    `derive must not reference ${banned}`,
  );
}

// decodedJson whitelist: exactly {firstSeat, memberNumber} accessed; gated
// economics literals never appear in either activity script.
const decodedAccesses = [
  ...deriveSrc.matchAll(/\bd\.(\w+)|"(\w+)" in d\b/g),
]
  .map((m) => m[1] ?? m[2])
  .filter((k): k is string => Boolean(k));
const allowedKeys = new Set(["firstSeat", "memberNumber"]);
check(
  decodedAccesses.length > 0 &&
    decodedAccesses.every((k) => allowedKeys.has(k)),
  "derive decodedJson access whitelist is exactly {firstSeat, memberNumber}",
  `derive reads non-whitelisted decodedJson keys: ${decodedAccesses
    .filter((k) => !allowedKeys.has(k))
    .join(", ")}`,
);
const gatedLiterals = [
  "referral" + "Amount",
  "source" + "Wallet",
  "source" + "Id",
  "source" + "Class",
  '"buyer"',
  '"recipient"',
  "usdc" + "In",
  "syn" + "Out",
  "gross" + "Usdc",
];
for (const lit of gatedLiterals) {
  check(
    !readmodelSrc.includes(lit) && !deriveSrc.includes(lit),
    `gated economics literal absent: ${lit}`,
    `activity scripts must never reference gated field ${lit}`,
  );
}

// Divergence-witness cross-check present in derive.
check(
  deriveSrc.includes("blockHash") && deriveSrc.includes("cacheHashByBlock"),
  "derive cross-checks raw block_hash against the Protocol Time cache",
  "derive is missing the block-hash divergence cross-check",
);

// Taxonomy reconciliation: local literals must match the vendored canon.
const canonPath = path.resolve(
  apiDir,
  "src",
  "canon",
  "the-syndicate",
  "proof",
  "protocol-event-registry.ts",
);
check(existsSync(canonPath), "canon protocol-event-registry present", "canon protocol-event-registry missing");
if (existsSync(canonPath)) {
  const canonSrc = readFileSync(canonPath, "utf8");
  const mapping = new RegExp(
    `${ACTIVITY_EVENT_KIND}:\\s*"${ACTIVITY_EVENT_CATEGORY}"`,
  );
  check(
    mapping.test(canonSrc),
    `canon maps kind "${ACTIVITY_EVENT_KIND}" to category "${ACTIVITY_EVENT_CATEGORY}"`,
    `canon does not map ${ACTIVITY_EVENT_KIND} → ${ACTIVITY_EVENT_CATEGORY}; taxonomy drifted`,
  );
  check(
    new RegExp(`\\|\\s*"${ACTIVITY_EVENT_KIND}"`).test(canonSrc),
    `canon declares kind "${ACTIVITY_EVENT_KIND}"`,
    `canon no longer declares kind "${ACTIVITY_EVENT_KIND}"`,
  );
}

// Served code never imports the activity scripts; no activity route exists.
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "canon" || name === "node_modules") continue;
      out.push(...walk(p));
    } else if (/\.ts$/.test(name)) out.push(p);
  }
  return out;
}
const servedFiles = walk(path.resolve(apiDir, "src"));
for (const f of servedFiles) {
  const code = stripComments(readFileSync(f, "utf8"));
  check(
    !code.includes("activity-heartbeat"),
    `served ${path.relative(apiDir, f)}: no activity import`,
    `served file ${path.relative(apiDir, f)} references activity-heartbeat — the read-model must stay script-only`,
  );
}
const routesFiles = servedFiles.filter((f) => /routes?/i.test(f));
for (const f of routesFiles) {
  const code = stripComments(readFileSync(f, "utf8")).toLowerCase();
  check(
    !code.includes("/activity"),
    `${path.relative(apiDir, f)}: no /activity route`,
    `${path.relative(apiDir, f)} declares an /activity route — no public activity surface is approved`,
  );
}

// package.json wiring.
const pkg = JSON.parse(
  readFileSync(path.resolve(apiDir, "package.json"), "utf8"),
) as { scripts?: Record<string, string> };
check(
  pkg.scripts?.["activity:derive"] === "tsx ./scripts/activity-heartbeat-derive.ts" &&
    pkg.scripts?.["activity:guard"] === "tsx ./scripts/activity-heartbeat.guard.ts",
  "package.json registers activity:derive / activity:guard",
  "package.json is missing the activity script entries",
);

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------

for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nactivity-heartbeat guard: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nactivity-heartbeat guard: all ${ok.length} checks passed.`);
