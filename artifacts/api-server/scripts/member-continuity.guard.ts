/**
 * Member Continuity Read-Model GUARD (SERVER-ONLY, fixture + static).
 * -------------------------------------------------------------------
 * Verifies the Layer-4 read-model foundation without touching the database:
 *   - fixture-based builder doctrine (determinism, sentinel exclusion,
 *     Part-B-only historical numbering, V3 emitted authority, dup/gap
 *     detection, corroboration semantics, address-safe reporting)
 *   - static source scans (pure module stays pure; derive stays read-only and
 *     print-safe; served src/ never imports the read-model; no member/holder
 *     route exists; public route surface unchanged)
 *
 * All fixture identities are SYNTHETIC (runtime-generated hex) — no real
 * wallet, transaction, leaf, proof or root material appears in this file.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  buildMemberContinuityReadModel,
  toAddressSafeReport,
  assertAddressSafeJson,
  MEMBER_CONTINUITY_DOCTRINE,
  MEMBER_CONTINUITY_READ_MODEL_META,
  type BuildInput,
  type HistoricalMemberInput,
  type V3PurchaseEventInput,
} from "./member-continuity-readmodel";

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed += 1;
    console.log(`[PASS] ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.error(`[FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ---------------------------------------------------------------------------
// Synthetic fixtures (runtime-built hex; obviously fake, never real material).
// ---------------------------------------------------------------------------

const synWallet = (n: number): string =>
  `0x${n.toString(16).padStart(2, "0").repeat(20)}`;
const synTx = (n: number): string =>
  `0x${n.toString(16).padStart(2, "0").repeat(32)}`;
const SYN_ROOT = `0x${"ab".repeat(32)}`;

const FREEZE = {
  chainId: 43114,
  freezeBlock: 1_000,
  root: SYN_ROOT,
  memberCount: 3,
  validationStatus: "VERIFIED",
};

const histMember = (
  memberNumber: number,
  source: "V1" | "V2A" | "V2B",
  over: Partial<HistoricalMemberInput> = {},
): HistoricalMemberInput => ({
  chainId: 43114,
  freezeBlock: 1_000,
  memberNumber,
  wallet: synWallet(memberNumber),
  source,
  firstBlock: 100 + memberNumber,
  logIndex: memberNumber,
  firstTransaction: synTx(memberNumber),
  ...over,
});

const v3Row = (
  memberNumber: number,
  blockNumber: number,
  over: Partial<V3PurchaseEventInput> = {},
): V3PurchaseEventInput => ({
  chainId: 43114,
  generation: "V3",
  eventName: "MembershipPurchasedV3",
  blockNumber,
  logIndex: 1,
  transactionHash: synTx(50 + memberNumber),
  memberNumber,
  firstSeat: true,
  buyerWallet: synWallet(50 + memberNumber),
  recipientWallet: synWallet(50 + memberNumber),
  era: "3",
  chapter: "1",
  receiptId: `${memberNumber}`,
  receiptVersion: "3",
  ...over,
});

const HAPPY: BuildInput = {
  freeze: FREEZE,
  historicalMembers: [
    histMember(1, "V1"),
    histMember(2, "V2A"),
    histMember(3, "V2B"),
  ],
  v3Purchases: [
    v3Row(4, 2_000),
    v3Row(5, 2_100),
    v3Row(4, 2_200, { firstSeat: false }),
  ],
  corroboration: {
    v1DistinctBuyerCount: 1,
    v2aFirstSeatTrueCount: 1,
    v2bFirstSeatTrueNonSentinelCount: 1,
    v2bSentinelRowCount: 2,
  },
};

// ---------------------------------------------------------------------------
// 1. Fixture/behavioral doctrine checks.
// ---------------------------------------------------------------------------

const happy = buildMemberContinuityReadModel(HAPPY);
check("happy path: gate passes and result is consistent", happy.gatePassed && happy.consistent);
check(
  "happy path: 5 records = 3 historical + 2 post-freeze V3",
  happy.totals.total === 5 &&
    happy.totals.historical === 3 &&
    happy.totals.postFreezeV3 === 2,
  `totals=${JSON.stringify(happy.totals)}`,
);
check(
  "firstSeat=false event excluded from records but counted",
  happy.totals.additionalSeatEventsExcluded === 1 &&
    !happy.records.some(
      (r) => r.memberNumber === 4 && r.entry.blockNumber === 2_200,
    ),
);
check(
  "continuity contiguous 1..5, no duplicates",
  happy.continuity.contiguous &&
    happy.continuity.min === 1 &&
    happy.continuity.max === 5 &&
    happy.continuity.duplicateCount === 0,
);
check(
  "generation totals derived (V1:1 V2A:1 V2B:1 V3:2)",
  happy.generationTotals.V1 === 1 &&
    happy.generationTotals.V2A === 1 &&
    happy.generationTotals.V2B === 1 &&
    happy.generationTotals.V3 === 2,
);
check(
  "numbering authority labels: Part B for #1..#3, emitted V3 for #4..#5",
  happy.records
    .filter((r) => r.memberNumber <= 3)
    .every((r) => r.numberingAuthority === "PART_B_FREEZE_ROOT") &&
    happy.records
      .filter((r) => r.memberNumber >= 4)
      .every((r) => r.numberingAuthority === "V3_EMITTED_MEMBER_NUMBER"),
);
check(
  "records carry server-only entry identity in memory (model completeness)",
  happy.records[0]!.entry.wallet === synWallet(1) &&
    happy.records[3]!.entry.wallet === synWallet(54),
);
check(
  "source attribution stays GATED_PENDING on every record",
  happy.records.every((r) => r.sourceAttribution.status === "GATED_PENDING"),
);
check(
  "Merkle material is referenced, never copied, into records",
  happy.records
    .filter((r) => r.receipt.kind === "HISTORICAL_MERKLE")
    .every((r) => !("leaf" in r.receipt) && !("proof" in r.receipt)),
);

// Determinism.
const again = buildMemberContinuityReadModel(HAPPY);
check(
  "determinism: rebuild produces byte-identical result",
  JSON.stringify(happy) === JSON.stringify(again),
);
const shuffled = buildMemberContinuityReadModel({
  ...HAPPY,
  historicalMembers: [...HAPPY.historicalMembers].reverse(),
  v3Purchases: [...HAPPY.v3Purchases].reverse(),
});
check(
  "determinism: input order does not change the result",
  JSON.stringify(happy) === JSON.stringify(shuffled),
);

// Address-safe report.
const report = toAddressSafeReport(happy);
const reportJson = JSON.stringify(report);
check(
  "address-safe report contains NO fixture wallet",
  !HAPPY.historicalMembers.some((m) => reportJson.includes(m.wallet)) &&
    !HAPPY.v3Purchases.some((r) => reportJson.includes(r.buyerWallet)),
);
check(
  "address-safe report contains NO fixture transaction hash",
  !HAPPY.v3Purchases.some((r) => reportJson.includes(r.transactionHash)) &&
    !HAPPY.historicalMembers.some((m) =>
      reportJson.includes(m.firstTransaction),
    ),
);
check(
  "address-safe report shortens the root (no full 64-hex root)",
  !reportJson.includes(SYN_ROOT) && report.freeze.rootShort.length === 11,
  `rootShort=${report.freeze.rootShort}`,
);
check("address-safe report exposes no records field", !("records" in report));
let scanThrew = false;
try {
  assertAddressSafeJson(`{"x":"${synWallet(9)}"}`);
} catch {
  scanThrew = true;
}
check("leak scanner fail-closes on a 40-hex address", scanThrew);
scanThrew = false;
try {
  assertAddressSafeJson(`{"x":"${"cd".repeat(32)}"}`);
} catch {
  scanThrew = true;
}
check("leak scanner fail-closes on a bare 64-hex value", scanThrew);

// Sentinel + authority doctrine.
const sentinelV3 = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [...HAPPY.v3Purchases, v3Row(0, 2_300)],
});
check(
  "V2B-style memberNumber=0 sentinel in post-freeze input → gate fail, zero records",
  !sentinelV3.gatePassed && sentinelV3.records.length === 0,
);
const sentinelHist = buildMemberContinuityReadModel({
  ...HAPPY,
  historicalMembers: [
    histMember(0, "V2B"),
    histMember(2, "V2A"),
    histMember(3, "V2B"),
  ],
});
check(
  "historical memberNumber=0 sentinel → gate fail, zero records",
  !sentinelHist.gatePassed && sentinelHist.records.length === 0,
);
const wrongChain = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [v3Row(4, 2_000, { chainId: 1 }), v3Row(5, 2_100)],
});
check(
  "post-freeze row on the wrong chainId → gate fail, zero records",
  !wrongChain.gatePassed && wrongChain.records.length === 0,
);
const nonV3 = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [
    ...HAPPY.v3Purchases,
    v3Row(6, 2_400, { generation: "V2B", eventName: "Purchased" }),
  ],
});
check(
  "raw V1/V2 events can NEVER number members (non-V3 row → gate fail)",
  !nonV3.gatePassed && nonV3.records.length === 0,
);
const histFromV3 = buildMemberContinuityReadModel({
  ...HAPPY,
  historicalMembers: [
    histMember(1, "V1"),
    histMember(2, "V2A"),
    histMember(3, "V3" as never),
  ],
});
check(
  "historical source must be pre-V3 generation (V3 source → gate fail)",
  !histFromV3.gatePassed,
);
const dupV3 = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [v3Row(4, 2_000), v3Row(4, 2_100)],
});
check(
  "duplicate emitted memberNumber among firstSeat rows → gate fail",
  !dupV3.gatePassed && dupV3.records.length === 0,
);
const inRange = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [v3Row(2, 2_000)],
});
check(
  "firstSeat memberNumber inside the freeze range → gate fail",
  !inRange.gatePassed,
);
const gap = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [v3Row(6, 2_000)],
});
check(
  "gap in combined numbering → flagged inconsistent (records still derivable)",
  gap.gatePassed && !gap.consistent && !gap.continuity.contiguous,
);
const badFreeze = buildMemberContinuityReadModel({
  ...HAPPY,
  freeze: { ...FREEZE, validationStatus: "PENDING" },
});
check(
  "freeze not VERIFIED → gate fail, zero records (fail-closed)",
  !badFreeze.gatePassed && badFreeze.records.length === 0,
);
const countMismatch = buildMemberContinuityReadModel({
  ...HAPPY,
  historicalMembers: HAPPY.historicalMembers.slice(0, 2),
});
check(
  "historical rows ≠ freeze memberCount → gate fail",
  !countMismatch.gatePassed,
);
const emittedAuthority = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [v3Row(5, 2_000), v3Row(4, 2_100)],
});
check(
  "emitted memberNumber stays the authority when chain order disagrees (ordering is check-only)",
  emittedAuthority.gatePassed &&
    emittedAuthority.records.some((r) => r.memberNumber === 4) &&
    emittedAuthority.records.some((r) => r.memberNumber === 5) &&
    !emittedAuthority.consistent &&
    emittedAuthority.checks.some(
      (c) => c.name.includes("monotone") && !c.pass,
    ),
);
const orphan = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [
    v3Row(4, 2_000),
    v3Row(5, 2_100),
    v3Row(7, 2_200, { firstSeat: false }),
  ],
});
check(
  "non-firstSeat event referencing unknown member → reconciliation fail",
  orphan.gatePassed && !orphan.consistent,
);
const divergentWallets = buildMemberContinuityReadModel({
  ...HAPPY,
  v3Purchases: [
    v3Row(4, 2_000, { buyerWallet: synWallet(99) }),
    v3Row(5, 2_100),
  ],
});
check(
  "buyer ≠ recipient on a firstSeat row → reconciliation fail",
  divergentWallets.gatePassed && !divergentWallets.consistent,
);
const badCorro = buildMemberContinuityReadModel({
  ...HAPPY,
  corroboration: {
    v1DistinctBuyerCount: 9,
    v2aFirstSeatTrueCount: 1,
    v2bFirstSeatTrueNonSentinelCount: 1,
    v2bSentinelRowCount: 2,
  },
});
check(
  "raw-event corroboration mismatch → reconciliation fail (corroborating only)",
  badCorro.gatePassed && !badCorro.consistent,
);

// Doctrine + vocabulary binding.
const doctrine = MEMBER_CONTINUITY_DOCTRINE.join(" ");
for (const phrase of [
  "Privy is not membership truth",
  "SYN transfer does not auto-transfer historical identity",
  "Rank is not identity",
  "Activity is not identity authority",
  "Chronicle is not a member feed",
  "sentinel",
  "emitted V3 memberNumber",
  "freeze/root",
  "SeatRecord721",
  "Source attribution never owns a member",
  "No manual fields, no stored eligibility",
  "never public exposure",
]) {
  check(`doctrine asserts: "${phrase}"`, doctrine.includes(phrase));
}
check(
  "meta binds existing os-contracts vocabulary (no new taxonomy)",
  MEMBER_CONTINUITY_READ_MODEL_META.domain === "WALLET_MEMBER_IDENTITY" &&
    MEMBER_CONTINUITY_READ_MODEL_META.surface === "SERVER_SIDE_CANON" &&
    MEMBER_CONTINUITY_READ_MODEL_META.adapterKind ===
      "RECEIPT_READ_MODEL_ADAPTER" &&
    MEMBER_CONTINUITY_READ_MODEL_META.persistence === "NONE_IN_MEMORY_ONLY",
);

// ---------------------------------------------------------------------------
// 2. Static source scans (purity, read-only posture, no public surface).
// ---------------------------------------------------------------------------

const builderSrc = readFileSync(
  "scripts/member-continuity-readmodel.ts",
  "utf8",
);
const deriveSrc = readFileSync("scripts/member-continuity-derive.ts", "utf8");

check(
  "builder module is pure: no DB import",
  !builderSrc.includes("@workspace/db"),
);
check(
  "builder module is pure: no server/network surface",
  !/from "express"|router\.|res\.json|fetch\(/.test(builderSrc),
);
check(
  "builder module is clock-free (deterministic)",
  !/Date\.now|new Date\(/.test(builderSrc),
);
check(
  "derive script performs no writes (no insert/update/delete)",
  !/\.insert\(|\.update\(|\.delete\(|drizzle-kit|CREATE TABLE|INSERT INTO|UPDATE |DELETE FROM/i.test(
    deriveSrc,
  ),
);
const printLines = deriveSrc
  .split("\n")
  .filter((l) => l.includes("console.log") || l.includes("console.error"));
check(
  "derive script print statements never reference wallet/proof/decoded/raw material",
  printLines.length > 0 &&
    printLines.every(
      (l) =>
        !/wallet|proof|decodedJson|rawJson|firstTransaction|transactionHash|leaf/i.test(
          l,
        ),
    ),
  `printLines=${printLines.length}`,
);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}
const servedFiles = walk("src");
check(
  "served src/ NEVER imports the member-continuity read-model",
  servedFiles.every((f) => !readFileSync(f, "utf8").includes("member-continuity")),
  `servedFiles=${servedFiles.length}`,
);

const routeFiles = readdirSync("src/routes").sort();
check(
  "public route surface unchanged (health, index, protocolReality, sourceStatus only)",
  JSON.stringify(routeFiles) ===
    JSON.stringify([
      "health.ts",
      "index.ts",
      "protocolReality.ts",
      "sourceStatus.ts",
    ]),
  `routes=${JSON.stringify(routeFiles)}`,
);
check(
  "no member/holder/wallet/proof/continuity route exists",
  routeFiles.every(
    (f) =>
      !/member|holder|wallet|proof|continuity/i.test(
        readFileSync(join("src/routes", f), "utf8"),
      ),
  ),
);

const pkg = readFileSync("package.json", "utf8");
check(
  "package scripts registered (derive + guard), tsx script-side only",
  pkg.includes('"member-continuity:derive"') &&
    pkg.includes('"member-continuity:guard"'),
);

// ---------------------------------------------------------------------------

console.log(`member-continuity guard: ${passed}/${passed + failed} passed`);
if (failed > 0) process.exit(1);
