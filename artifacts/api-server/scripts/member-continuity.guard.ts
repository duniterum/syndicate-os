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
  canonicalJson,
  MEMBER_CONTINUITY_DOCTRINE,
  MEMBER_CONTINUITY_READ_MODEL_META,
  type BuildInput,
  type DdlExtensionInput,
  type HistoricalMemberInput,
  type RoutedRowInput,
  type V2PurchaseRowInput,
  type V3PurchaseEventInput,
} from "./member-continuity-readmodel";
import { selectorFor } from "../src/lib/protocol/merkleFreeze";
import { SALE_V3_ABI } from "../src/canon/the-syndicate/contracts/abi/sale-abi";

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
// Import-syntax matching per guard doctrine: the snapshot's builderVersion
// provenance value legitimately contains the text "member-continuity", so the
// scan targets import/require SPECIFIERS, not arbitrary text.
const READMODEL_IMPORT_RE =
  /(?:from\s*|import\s*\(?\s*|require\s*\(\s*)["'][^"']*member-continuity[^"']*["']/;
check(
  "served src/ NEVER imports the member-continuity read-model (import-syntax scan)",
  servedFiles.every((f) => !READMODEL_IMPORT_RE.test(readFileSync(f, "utf8"))),
  `servedFiles=${servedFiles.length}`,
);

const routeFiles = readdirSync("src/routes").sort();
check(
  "public route surface pinned (backboneFeed, backboneStatus, capitalStanding, health, holderIndex, index, joinQuote, protocolReality, publicReadThrottle, receiptLookup, sourceStatus, sourceValidate, verifyLinks only)",
  JSON.stringify(routeFiles) ===
    JSON.stringify([
      // Founder-approved backbone feed route (M4-b): receipt lines only —
      // public chain data; output gate pinned by backbone.guard.ts.
      "backboneFeed.ts",
      // Founder-approved backbone status route (M4-a): address-safe aggregate
      // snapshot only; its output gate is pinned by backbone.guard.ts.
      "backboneStatus.ts",
      // S7 capital-standing route: one PUBLIC seat ordinal in, a rung TITLE
      // out — the canon walk's end state (capitalAxisReadmodel), no wallet
      // material on the path, no amount served; same output gate as the feed.
      "capitalStanding.ts",
      "health.ts",
      "holderIndex.ts",
      "index.ts",
      "joinQuote.ts",
      "protocolReality.ts",
      "publicReadThrottle.ts",
      // The /receipt/{txHash} public read (Q44 sealed whole 2026-07-19;
      // founder-approved slice 2026-07-20): ONE shape-validated 64-hex tx
      // hash in, that purchase's OWN receipt row out — the binder's exact
      // fact shape, short-form actors by construction, payload-discipline +
      // boundary-aware leak gates, publicReadThrottle. It reads the
      // tx-keyed projection only; the wallet-keyed map stays server-only
      // and this route stays under the blanket word bans below.
      "receiptLookup.ts",
      "sourceStatus.ts",
      "sourceValidate.ts",
      "verifyLinks.ts",
    ]),
  `routes=${JSON.stringify(routeFiles)}`,
);
// holderIndex.ts is the SINGLE founder-approved aggregate-only surface (its
// discipline — import-free static snapshot, allow-listed props, no per-seat
// rows — is enforced by holder-index:guard). index.ts may only mount it.
// verifyLinks.ts is the founder-approved explorer-links surface (July 2026): it
// emits ONLY protocol-INFRASTRUCTURE addresses (contracts, treasury, LP pair,
// burn) sourced from the served target constants, NEVER member/per-person
// wallets — and its own doctrine strings say so ("Never member wallets"). It is
// therefore exempt from the blanket word-bans and pinned instead to its REAL
// invariant below (infra-only, no hardcoded address, no member-data import).
// All OTHER routes are scanned comment-stripped: wallet/proof/continuity stay
// banned EVERYWHERE, member/holder banned outside the approved surfaces.
{
  const stripRoute = (src: string): string =>
    src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const holderAllowed = new Set(["holderIndex.ts", "index.ts"]);
  const addressEmitApproved = new Set(["verifyLinks.ts"]);
  check(
    "no wallet/proof/continuity route code exists (comment-stripped; verifyLinks pinned separately)",
    routeFiles.every(
      (f) =>
        addressEmitApproved.has(f) ||
        !/wallet|proof|continuity/i.test(
          stripRoute(readFileSync(join("src/routes", f), "utf8")),
        ),
    ),
  );
  check(
    "no member route code; holder code only in the approved aggregate surface",
    routeFiles.every((f) => {
      if (addressEmitApproved.has(f)) return true;
      const code = stripRoute(readFileSync(join("src/routes", f), "utf8"));
      if (/member/i.test(code)) return false;
      if (/holder/i.test(code) && !holderAllowed.has(f)) return false;
      return true;
    }),
  );
  // Positive pin for the approved address-emitting surface: verifyLinks must
  // source addresses ONLY from the served infra target constants, carry NO
  // hardcoded per-person (40-hex) address literal, and import NO member/holder/
  // continuity data module. This keeps the member-wallet-leak protection real
  // while allowing the legitimate infrastructure-explorer route.
  {
    const vl = stripRoute(
      readFileSync(join("src/routes", "verifyLinks.ts"), "utf8"),
    );
    check(
      "verifyLinks emits protocol-infrastructure addresses only (infra constants, no hardcoded 40-hex, no member-data import)",
      /CONTRACT_TARGETS|SALE_SCAN_TARGETS/.test(vl) &&
        !/0x[a-fA-F0-9]{40}/.test(vl) &&
        !/memberContinuity|historical_member|holderIndex|member-continuity|holder-index/.test(
          vl,
        ),
    );
  }
}

const pkg = readFileSync("package.json", "utf8");
check(
  "package scripts registered (derive + guard), tsx script-side only",
  pkg.includes('"member-continuity:derive"') &&
    pkg.includes('"member-continuity:guard"'),
);

// ---------------------------------------------------------------------------
// 3. S3a DDL-shaped dry-run doctrine (fixtures + static scans).
// ---------------------------------------------------------------------------

const v2Purchase = (
  txN: number,
  generation: string,
  token: number | null,
  blockNumber: number,
): V2PurchaseRowInput => ({
  chainId: 43114,
  generation,
  eventName: "Purchased",
  blockNumber,
  logIndex: 0,
  transactionHash: synTx(txN),
  memberNumberToken: token,
});
const routedRow = (
  txN: number,
  generation: string,
  token: number | null,
  over: Partial<RoutedRowInput> = {},
): RoutedRowInput => ({
  chainId: 43114,
  generation,
  eventName: "Routed",
  transactionHash: synTx(txN),
  memberNumberToken: token,
  vaultAmount: "1000",
  liquidityAmount: "2000",
  operationsAmount: "3000",
  ...over,
});

// Pairing tokens (11, 12, 0) are DELIBERATELY unequal to the Part B member
// numbers (2, 3) they end up folded next to: tokens are opaque pairing keys,
// never a numbering source. Token 0 is the V2B sentinel — it pairs fine but
// no member record ever references its transaction.
const DDL_EXT: DdlExtensionInput = {
  v2Purchases: [
    v2Purchase(2, "V2A", 11, 102),
    v2Purchase(3, "V2B", 12, 103),
    v2Purchase(90, "V2B", 0, 300),
  ],
  routedRows: [
    routedRow(2, "V2A", 11),
    routedRow(3, "V2B", 12, { vaultAmount: "7000" }),
    routedRow(90, "V2B", 0),
  ],
  blockTimestamps: [
    { chainId: 43114, blockNumber: 101, blockTimestampSec: 1_700_000_001 },
    { chainId: 43114, blockNumber: 102, blockTimestampSec: 1_700_000_002 },
    { chainId: 43114, blockNumber: 103, blockTimestampSec: 1_700_000_003 },
    { chainId: 43114, blockNumber: 2_000, blockTimestampSec: 1_700_000_004 },
    // block 2_100 deliberately uncovered: timestamps are additive, never blocking
  ],
  onchainMemberCount: 5,
  inputSaleEventCount: 9,
  inputMaxSaleEventRawId: 106,
  builderVersion: "guard-fixture/0",
};
const DDL_HAPPY: BuildInput = {
  ...HAPPY,
  v3Purchases: [
    v3Row(4, 2_000, { saleEventRawId: 104 }),
    v3Row(5, 2_100, { saleEventRawId: 105 }),
    v3Row(4, 2_200, { firstSeat: false, saleEventRawId: 106 }),
  ],
  ddl: DDL_EXT,
};

const ddlHappy = buildMemberContinuityReadModel(DDL_HAPPY);
const ddl = ddlHappy.ddl;
check(
  "ddl happy: consistent, 5 shaped records, persistence-eligible (data-wise)",
  ddlHappy.consistent &&
    ddl !== undefined &&
    ddl.records.length === 5 &&
    ddl.persistenceEligible,
);
if (ddl) {
  const dr = ddl.records;
  check(
    "ddl happy: V1 record — Part B lineage, seat 'unknown', no fold, no raw lineage",
    dr[0]!.numberingAuthority === "PART_B_FREEZE_ROOT" &&
      dr[0]!.freezeBlock === 1_000 &&
      dr[0]!.entryFirstSeat === "unknown" &&
      dr[0]!.entryRoutedFold === null &&
      dr[0]!.saleEventRawId === null,
  );
  check(
    "ddl happy: V2 records fold exact raw base-unit strings by entry transaction",
    dr[1]!.entryRoutedFold?.vaultAmount === "1000" &&
      dr[1]!.entryRoutedFold?.liquidityAmount === "2000" &&
      dr[1]!.entryRoutedFold?.operationsAmount === "3000" &&
      dr[2]!.entryRoutedFold?.vaultAmount === "7000" &&
      dr[1]!.entryFirstSeat === "true",
  );
  check(
    "ddl happy: fold shape is structurally referral-free (exactly 3 keys)",
    Object.keys(dr[1]!.entryRoutedFold!).length === 3 &&
      !Object.keys(dr[1]!.entryRoutedFold!).some((k) =>
        /referral|source|commission|attribution/i.test(k),
      ),
  );
  check(
    "ddl happy: V3 records — emitted authority, raw lineage, no freeze lineage, no fold",
    dr[3]!.numberingAuthority === "V3_EMITTED" &&
      dr[3]!.saleEventRawId === 104 &&
      dr[4]!.saleEventRawId === 105 &&
      dr[3]!.freezeBlock === null &&
      dr[3]!.entryRoutedFold === null &&
      dr[3]!.entryFirstSeat === "true",
  );
  check(
    "ddl happy: Protocol Time copy is additive (covered blocks set, missing block → null)",
    dr[0]!.entryBlockTimestampSec === 1_700_000_001 &&
      dr[3]!.entryBlockTimestampSec === 1_700_000_004 &&
      dr[4]!.entryBlockTimestampSec === null &&
      ddl.timestampCoverage.recordsWithTimestamp === 4 &&
      ddl.timestampCoverage.recordsTotal === 5,
  );
  check(
    "ddl happy: sentinel pair folds but never attaches (paired=3, recordsWithFold=2)",
    ddl.foldSummary.routedRowsPaired === 3 &&
      ddl.foldSummary.recordsWithFold === 2 &&
      ddl.foldSummary.pairingViolations === 0,
  );
  check(
    "ddl happy: run row — VERIFIED-only, totals reconcile, provenance carried",
    ddl.run.status === "VERIFIED" &&
      ddl.run.memberTotal === 5 &&
      ddl.run.historicalCount === 3 &&
      ddl.run.v3Count === 2 &&
      ddl.run.onchainMemberCount === 5 &&
      ddl.run.inputSaleEventCount === 9 &&
      ddl.run.inputMaxSaleEventRawId === 106 &&
      /^[0-9a-f]{64}$/.test(ddl.run.determinismHash),
  );
  check(
    "ddl happy: blockedReasons ALWAYS carries the S3b write gate (pure builder never persists)",
    ddl.blockedReasons.some((r) => r.includes("S3B_WRITE_GATE")),
  );
  let runScanThrew = false;
  try {
    assertAddressSafeJson(JSON.stringify(ddl.run));
  } catch {
    runScanThrew = true;
  }
  check(
    "ddl run row is NOT address-safe (must never be printed; aggregates only)",
    runScanThrew,
  );
  let recordsScanThrew = false;
  try {
    assertAddressSafeJson(JSON.stringify(ddl.records));
  } catch {
    recordsScanThrew = true;
  }
  check(
    "ddl records are NOT address-safe (server-only; must never be printed)",
    recordsScanThrew,
  );
}

// DDL determinism: rebuild + shuffled extension arrays → identical output.
const ddlAgain = buildMemberContinuityReadModel(DDL_HAPPY);
const ddlShuffled = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  historicalMembers: [...DDL_HAPPY.historicalMembers].reverse(),
  v3Purchases: [...DDL_HAPPY.v3Purchases].reverse(),
  ddl: {
    ...DDL_EXT,
    v2Purchases: [...DDL_EXT.v2Purchases].reverse(),
    routedRows: [...DDL_EXT.routedRows].reverse(),
    blockTimestamps: [...DDL_EXT.blockTimestamps].reverse(),
  },
});
check(
  "ddl determinism: rebuild byte-identical, shuffled inputs hash-identical",
  JSON.stringify(ddlHappy) === JSON.stringify(ddlAgain) &&
    JSON.stringify(ddlHappy) === JSON.stringify(ddlShuffled) &&
    ddlHappy.ddl!.run.determinismHash === ddlShuffled.ddl!.run.determinismHash,
);
const ddlOnchainDrift = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: { ...DDL_EXT, onchainMemberCount: 7 },
});
check(
  "determinism hash EXCLUDES the live memberCount read (reconciliation ≠ identity)",
  ddlOnchainDrift.ddl!.run.determinismHash ===
    ddlHappy.ddl!.run.determinismHash &&
    !ddlOnchainDrift.consistent &&
    !ddlOnchainDrift.ddl!.persistenceEligible,
);
const ddlAmountDrift = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: {
    ...DDL_EXT,
    routedRows: [
      routedRow(2, "V2A", 11, { vaultAmount: "1001" }),
      routedRow(3, "V2B", 12, { vaultAmount: "7000" }),
      routedRow(90, "V2B", 0),
    ],
  },
});
check(
  "determinism hash is SENSITIVE to shaped record content",
  ddlAmountDrift.ddl!.run.determinismHash !==
    ddlHappy.ddl!.run.determinismHash && ddlAmountDrift.ddl!.persistenceEligible,
);

// Fail-closed DDL doctrine fixtures.
const ddlOnchainNull = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: { ...DDL_EXT, onchainMemberCount: null },
});
check(
  "live memberCount unavailable → fail closed (ineligible, reason recorded, NOT NULL unwritable)",
  !ddlOnchainNull.consistent &&
    !ddlOnchainNull.ddl!.persistenceEligible &&
    ddlOnchainNull.ddl!.run.onchainMemberCount === null &&
    ddlOnchainNull.ddl!.blockedReasons.some((r) => r.includes("unavailable")) &&
    ddlOnchainNull.checks.some(
      (c) => c.name.includes("on-chain memberCount") && !c.pass,
    ),
);
const ddlMissingRouted = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: {
    ...DDL_EXT,
    routedRows: [routedRow(3, "V2B", 12), routedRow(90, "V2B", 0)],
  },
});
check(
  "missing Routed companion for a V2 entry → reconciliation fail, ineligible",
  !ddlMissingRouted.consistent && !ddlMissingRouted.ddl!.persistenceEligible,
);
const ddlDoubleRouted = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: {
    ...DDL_EXT,
    routedRows: [...DDL_EXT.routedRows, routedRow(2, "V2A", 11)],
  },
});
check(
  "two Routed rows in one entry transaction → pairing violation, ineligible",
  !ddlDoubleRouted.consistent &&
    !ddlDoubleRouted.ddl!.persistenceEligible &&
    ddlDoubleRouted.ddl!.foldSummary.pairingViolations > 0,
);
const ddlTokenMismatch = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: {
    ...DDL_EXT,
    routedRows: [
      routedRow(2, "V2A", 99),
      routedRow(3, "V2B", 12, { vaultAmount: "7000" }),
      routedRow(90, "V2B", 0),
    ],
  },
});
check(
  "purchase/Routed token mismatch in a tx → pairing violation, ineligible",
  !ddlTokenMismatch.consistent && !ddlTokenMismatch.ddl!.persistenceEligible,
);
const ddlBadAmount = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: {
    ...DDL_EXT,
    routedRows: [
      routedRow(2, "V2A", 11, { vaultAmount: "10.5" }),
      routedRow(3, "V2B", 12, { vaultAmount: "7000" }),
      routedRow(90, "V2B", 0),
    ],
  },
});
check(
  "non-raw-base-unit amount string → reconciliation fail (EXACT strings only)",
  !ddlBadAmount.consistent && !ddlBadAmount.ddl!.persistenceEligible,
);
const ddlNoRawId = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  v3Purchases: [
    v3Row(4, 2_000),
    v3Row(5, 2_100, { saleEventRawId: 105 }),
    v3Row(4, 2_200, { firstSeat: false, saleEventRawId: 106 }),
  ],
});
check(
  "V3 record without sale_event_raw lineage → reconciliation fail, ineligible",
  !ddlNoRawId.consistent &&
    !ddlNoRawId.ddl!.persistenceEligible &&
    ddlNoRawId.checks.some(
      (c) => c.name.includes("sale_event_raw lineage") && !c.pass,
    ),
);
const ddlWrongChainExt = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  ddl: {
    ...DDL_EXT,
    blockTimestamps: [
      { chainId: 1, blockNumber: 101, blockTimestampSec: 1_700_000_001 },
    ],
  },
});
check(
  "ddl extension rows on the wrong chain → reconciliation fail",
  !ddlWrongChainExt.consistent,
);
const ddlGateFail = buildMemberContinuityReadModel({
  ...DDL_HAPPY,
  freeze: { ...FREEZE, validationStatus: "PENDING" },
});
check(
  "gate failure never produces a ddl projection (fail closed, zero shapes)",
  !ddlGateFail.gatePassed && ddlGateFail.ddl === undefined,
);

// Canonical serialization primitives.
check(
  "canonicalJson sorts object keys recursively",
  canonicalJson({ b: 1, a: { d: 2, c: 3 } }) === '{"a":{"c":3,"d":2},"b":1}',
);
let canonThrew = false;
try {
  canonicalJson({ a: undefined });
} catch {
  canonThrew = true;
}
check("canonicalJson hard-fails on undefined (hash integrity)", canonThrew);

// --- Static scans for the S3a slice (comment-stripped where the scan term
// legitimately appears in doc headers — see guard doctrine). ---
const buildSrc = readFileSync("scripts/member-continuity-build.ts", "utf8");
const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
const builderCode = stripComments(builderSrc);
const buildCode = stripComments(buildSrc);

check(
  "gated referral/source namespace structurally absent (builder + dry-run, comment-stripped)",
  !/referralAmount|sourceWallet|sourceId|commissionBps|attributionScope|attributionWindow/.test(
    builderCode + buildCode,
  ),
);
// --- S3b write-mode invariants (approved founder gate; comment-stripped) ---
const txInsertCount = (buildCode.match(/tx\s*\.insert\(/g) ?? []).length;
const txDeleteCount = (buildCode.match(/tx\s*\.delete\(/g) ?? []).length;
const nonTxWriteResidue = buildCode
  .replace(/tx\s*\.insert\(/g, "")
  .replace(/tx\s*\.delete\(/g, "");
check(
  "write primitives are transaction-scoped ONLY (exactly 2 tx.insert + 1 tx.delete; zero non-tx insert/update/delete)",
  txInsertCount === 2 &&
    txDeleteCount === 1 &&
    !/\.insert\(|\.update\(|\.delete\(/.test(nonTxWriteResidue),
  `txInsert=${txInsertCount} txDelete=${txDeleteCount}`,
);
check(
  "no upsert / raw-SQL writes / DDL anywhere (no ON CONFLICT, comment-stripped)",
  !/onConflict|ON CONFLICT|INSERT INTO|DELETE FROM|CREATE TABLE|ALTER TABLE|TRUNCATE|drizzle-kit/i.test(
    buildCode,
  ) && !/\bUPDATE\s+[a-z_]+\s+SET\b/i.test(buildCode),
);
check(
  "write mode is founder-armed: --write flag + exact env arming value; dry-run stays the no-write default posture",
  buildCode.includes('process.argv.includes("--dry-run")') &&
    buildCode.includes('process.argv.includes("--write")') &&
    buildCode.includes("MEMBER_CONTINUITY_WRITE_APPROVED") &&
    buildCode.includes("S3B_WRITE_NOT_ARMED") &&
    /process\.env\[WRITE_ARMING_ENV\]\s*!==\s*WRITE_ARMING_VALUE/.test(
      buildCode,
    ) &&
    /if\s*\(mode\s*!==\s*"WRITE"\)\s*return null/.test(buildCode),
);
check(
  "replay semantics explicit: exact-replay no-op, same-provenance hash drift hard-fails, shrunk/diverged provenance hard-fails, orphan rows refused",
  buildCode.includes("REPLAY_NOOP") &&
    buildCode.includes("HASH_DRIFT_SAME_PROVENANCE") &&
    buildCode.includes("PROVENANCE_SHRUNK_OR_DIVERGED") &&
    buildCode.includes("GROWN_PROVENANCE_REBUILD") &&
    buildCode.includes("ORPHAN_ROWS_ANOMALY"),
);
check(
  "write is ONE transaction with in-tx post-insert verification (rollback on mismatch); failed builds never memorialized",
  buildCode.includes(".transaction(") &&
    buildCode.includes(
      "S3B write rollback: post-insert verification failed",
    ) &&
    buildCode.includes("S3B write refused") &&
    buildCode.includes("never memorialized"),
);
check(
  "dry-run type-binds shaped rows to the real Drizzle insert types (compile-time net)",
  buildCode.includes("MemberContinuityRecordInsert") &&
    buildCode.includes("MemberContinuityVerificationRunInsert") &&
    buildCode.includes("_assertDdlShapesMatchSchema"),
);
check(
  "selector recompute memberCount() == 0x11aee380 (canon-reconciled, viewOnly)",
  selectorFor("memberCount()") === "0x11aee380" &&
    buildCode.includes('"0x11aee380"') &&
    SALE_V3_ABI.some(
      (e) =>
        e.type === "function" &&
        e.name === "memberCount" &&
        e.stateMutability === "view" &&
        (e.inputs ?? []).length === 0,
    ),
);
const buildPrintLines = buildSrc
  .split("\n")
  .filter((l) => l.includes("console.log") || l.includes("console.error"));
check(
  "dry-run print statements never reference wallet/proof/decoded/raw material",
  buildPrintLines.length > 0 &&
    buildPrintLines.every(
      (l) =>
        !/wallet|proof|decodedJson|rawJson|firstTransaction|transactionHash|leaf/i.test(
          l,
        ),
    ),
  `printLines=${buildPrintLines.length}`,
);
check(
  "dry-run self-scans its report and splits the hash display (no bare 64-hex output)",
  buildCode.includes("assertAddressSafeJson(json)") &&
    buildCode.includes("splitHashDisplay"),
);

// DDL schema reconciliation (text-level; type-level lives in the dry-run).
const schemaSrc = readFileSync(
  "../../lib/db/src/schema/memberContinuity.ts",
  "utf8",
);
const ddlColumns = [
  "chain_id",
  "member_number",
  "numbering_authority",
  "freeze_block",
  "entry_wallet",
  "entry_block",
  "entry_log_index",
  "entry_transaction",
  "entry_first_seat",
  "entry_block_timestamp_sec",
  "entry_routed_fold",
  "sale_event_raw_id",
  "build_id",
  "freeze_root",
  "member_total",
  "historical_count",
  "v3_count",
  "onchain_member_count",
  "determinism_hash",
  "input_sale_event_count",
  "input_max_sale_event_raw_id",
  "builder_version",
  "verification",
];
check(
  "DDL schema reconcile: every mirrored column exists in lib/db memberContinuity",
  ddlColumns.every((c) => schemaSrc.includes(`"${c}"`)),
);
check(
  "DDL schema reconcile: CHECK vocab matches builder output exactly",
  schemaSrc.includes("'PART_B_FREEZE_ROOT', 'V3_EMITTED'") &&
    schemaSrc.includes("'true', 'unknown'") &&
    schemaSrc.includes("= 'VERIFIED'"),
);
check(
  "package scripts registered: member-continuity:dry-run (--dry-run pinned) + member-continuity:write (--write pinned)",
  pkg.includes('"member-continuity:dry-run"') &&
    pkg.includes("member-continuity-build.ts --dry-run") &&
    pkg.includes('"member-continuity:write"') &&
    pkg.includes("member-continuity-build.ts --write"),
);

// ---------------------------------------------------------------------------

console.log(`member-continuity guard: ${passed}/${passed + failed} passed`);
if (failed > 0) process.exit(1);
