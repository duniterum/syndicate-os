/**
 * season-merkle.guard — BLOCKING (joins the api guards chain, master plan §1-④).
 * ---------------------------------------------------------------------------
 * The tooling's own adversarial bench: potPolicy exactness + refusals, the
 * builder's fences (over/under-budget, dupes, uint128), rulesHash canonical
 * stability + null refusals, publishedFile hash stability, AND the differential
 * fixture DRIFT check (the committed fixture must equal a fresh regeneration —
 * tooling drift against the pinned vector = RED).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { applyCurve, allocateRoundId, type PotInputRow } from "../src/season/potPolicy.js";
import { buildPayoutRoot, buildSealRoot, verifyPayoutProof } from "../src/season/merkle.js";
import {
  buildV1SheetSkeleton,
  canonicalSerialize,
  hashRuleSheet,
} from "../src/season/rulesHash.js";
import { buildPublishedFile } from "../src/season/publishedFile.js";
import {
  ANTI_FARM_PROPOSED,
  filterForMoneyWindow,
  type MoneyWindowEventInput,
} from "../src/season/antiFarm.js";
import { generateFixtureJson } from "./season-merkle-fixture.js";

let checks = 0;
function ok(cond: boolean, label: string): void {
  checks++;
  if (!cond) {
    console.error(`[guard:season-merkle] RED — ${label}`);
    process.exit(1);
  }
}
function refuses(fn: () => unknown, label: string): void {
  checks++;
  try {
    fn();
  } catch {
    return;
  }
  console.error(`[guard:season-merkle] RED — expected refusal: ${label}`);
  process.exit(1);
}

// ─── deterministic PRNG (no Math.random in a guard) ───
let seed = 0x5eed;
function rnd(max: number): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % max;
}

const A = (n: number): `0x${string}` =>
  `0x${(n + 1).toString(16).padStart(40, "0")}` as `0x${string}`;

// ═══ 1. potPolicy — refusals first (fail-closed is the posture) ═══
const openKnobs = {
  antiFarmImplemented: true,
  floorPair: { minQualifyingPurchaseUsdc: 50, minXpForBounty: 100 },
} as const;
const rows3: PotInputRow[] = [
  { account: A(1), seat: 3, windowXp: 900, attainingBlock: 100, horsConcours: false },
  { account: A(2), seat: 1, windowXp: 500, attainingBlock: 90, horsConcours: false },
  { account: A(3), seat: 2, windowXp: 500, attainingBlock: 90, horsConcours: false },
];
{
  // Refusal order: the null floor pair fires FIRST (the founder's figures gate
  // everything); with floors provided, the anti-farm gate fires next.
  const r0 = applyCurve(rows3, 1_000_000_000n, { isProjection: false });
  ok(!r0.ok && r0.refusal === "floor-pair-unset", "config floors are null → refusal (production today)");
  const r = applyCurve(rows3, 1_000_000_000n, {
    isProjection: false,
    antiFarmImplemented: false, // the refusal BRANCH stays enforced (config is true since S3-4)
    floorPair: { minQualifyingPurchaseUsdc: 50, minXpForBounty: 100 },
  });
  ok(!r.ok && r.refusal === "anti-farm-unbuilt", "the anti-farm refusal branch holds");
  const r2 = applyCurve(rows3, 1_000_000_000n, {
    isProjection: false,
    antiFarmImplemented: true,
    floorPair: { minQualifyingPurchaseUsdc: null, minXpForBounty: 100 },
  });
  ok(!r2.ok && r2.refusal === "floor-pair-unset", "refuses a null floor pair");
  const r3 = applyCurve(rows3, 0n, { isProjection: false, ...openKnobs });
  ok(!r3.ok && r3.refusal === "zero-budget", "refuses a zero budget");
  const noSeat: PotInputRow[] = [
    { account: A(9), seat: null, windowXp: 9_999, attainingBlock: 1, horsConcours: false },
  ];
  const r4 = applyCurve(noSeat, 1_000_000n, { isProjection: false, ...openKnobs });
  ok(!r4.ok && r4.refusal === "no-eligible-rows", "THE POT REQUIRES THE SEAT — no-seat pays nothing");
}

// ═══ 2. potPolicy — the three-key tie-break + hors-concours occupancy ═══
{
  const r = applyCurve(rows3, 1_000_000_000n, { isProjection: false, ...openKnobs });
  ok(r.ok, "3-row happy path computes");
  if (r.ok) {
    ok(r.paidSlots[0].account === A(1), "rank 1 = highest windowXp");
    ok(r.paidSlots.length === 1 && r.depth === 1, "depth law: 3 eligible → max(1, floor(3/10)) = 1");
  }
  // Tie on XP and block → seat number decides (the hashed third key).
  const tied = applyCurve(
    [
      { account: A(2), seat: 7, windowXp: 500, attainingBlock: 90, horsConcours: false },
      { account: A(3), seat: 2, windowXp: 500, attainingBlock: 90, horsConcours: false },
    ],
    100_000_000n,
    { isProjection: false, ...openKnobs },
  );
  ok(tied.ok && tied.ok === true && tied.paidSlots[0].seat === 2, "tie-break third key: lower seat wins");
  // Hors-concours never consumes a slot.
  const hc = applyCurve(
    [
      { account: A(1), seat: 1, windowXp: 999_999, attainingBlock: 1, horsConcours: true },
      { account: A(2), seat: 2, windowXp: 10, attainingBlock: 5, horsConcours: false },
    ],
    100_000_000n,
    { isProjection: false, antiFarmImplemented: true, floorPair: { minQualifyingPurchaseUsdc: 50, minXpForBounty: 1 } },
  );
  ok(hc.ok && hc.ok === true && hc.paidSlots[0].account === A(2), "hors-concours consumes no slot");
}

// ═══ 3. potPolicy — EXACT-SUM property over 200 deterministic fields ═══
for (let t = 0; t < 200; t++) {
  const n = 1 + rnd(120);
  const rows: PotInputRow[] = [];
  for (let i = 0; i < n; i++) {
    rows.push({
      account: A(1000 + t * 200 + i),
      seat: rnd(10) === 0 ? null : i + 1,
      windowXp: 1 + rnd(5_000),
      attainingBlock: 1 + rnd(100_000),
      horsConcours: rnd(25) === 0,
    });
  }
  const budget = BigInt(1 + rnd(1_000_000)) * 1_000_000n; // 1..1M USDC
  const r = applyCurve(rows, budget, { isProjection: false, ...openKnobs, minPrizeUsdc: 20 });
  if (r.ok) {
    const sum = r.paidSlots.reduce((a, s) => a + s.amountRaw, 0n);
    ok(sum === budget, `EXACT-SUM broke at t=${t}: Σ=${sum} budget=${budget}`);
    ok(r.depth === r.paidSlots.length, "depth equals slot count");
    for (let i = 1; i < r.paidSlots.length; i++) {
      ok(
        r.paidSlots[i - 1].amountRaw >= r.paidSlots[i].amountRaw,
        `monotone prizes broke at t=${t} rank ${i}`,
      );
    }
    const last = r.paidSlots[r.paidSlots.length - 1];
    ok(
      r.depth === 1 || last.amountRaw >= 20_000_000n,
      `min-cash floor broke at t=${t}: last=${last.amountRaw}`,
    );
  }
}
ok(allocateRoundId(7, 3) === 7003, "roundId allocator = seasonId*1000+seq");
refuses(() => allocateRoundId(1, 1000), "seq 1000 refused (cap 999)");

// ═══ 4. merkle builder — fences + round-trip ═══
const CH = 31337n;
const POOL = "0x00000000000000000000000000000000000A11cE" as `0x${string}`;
{
  const leaves = [
    { account: A(21), amountRaw: 600_000_000n },
    { account: A(22), amountRaw: 400_000_000n },
  ];
  const t = buildPayoutRoot({ chainId: CH, pool: POOL, roundId: 2001, budgetRaw: 1_000_000_000n, leaves });
  for (const l of leaves) {
    ok(
      verifyPayoutProof({
        root: t.root, chainId: CH, pool: POOL, roundId: 2001,
        account: l.account, amountRaw: l.amountRaw,
        proof: t.proofs.get(l.account)!,
      }),
      "round-trip proof verifies",
    );
  }
  ok(
    !verifyPayoutProof({
      root: t.root, chainId: CH, pool: POOL, roundId: 2002,
      account: leaves[0].account, amountRaw: leaves[0].amountRaw,
      proof: t.proofs.get(leaves[0].account)!,
    }),
    "cross-round replay fails verification",
  );
  refuses(
    () => buildPayoutRoot({ chainId: CH, pool: POOL, roundId: 1, budgetRaw: 999_999_999n, leaves }),
    "over-budget (Σ>budget) refused",
  );
  refuses(
    () => buildPayoutRoot({ chainId: CH, pool: POOL, roundId: 1, budgetRaw: 1_000_000_001n, leaves }),
    "under-budget (Σ<budget) refused — the round-3 catch",
  );
  refuses(
    () =>
      buildPayoutRoot({
        chainId: CH, pool: POOL, roundId: 1, budgetRaw: 2n,
        leaves: [
          { account: A(21), amountRaw: 1n },
          { account: A(21), amountRaw: 1n },
        ],
      }),
    "duplicate account refused",
  );
  refuses(
    () =>
      buildPayoutRoot({
        chainId: CH, pool: POOL, roundId: 1, budgetRaw: 1n << 129n,
        leaves: [{ account: A(21), amountRaw: 1n << 129n }],
      }),
    "amount past uint128 refused",
  );
  const seal = buildSealRoot({
    chainId: CH, pool: POOL, seasonId: 1,
    rows: [
      { account: A(21), seasonXp: 900 },
      { account: A(22), seasonXp: 0 },
      { account: A(23), seasonXp: 100 },
    ],
  });
  ok(seal.proofs.size === 2, "seal tree keeps only XP>0 wallets");
  ok(seal.root !== t.root, "seal root ≠ payout root (kind byte)");
}

// ═══ 5. rulesHash — canonical stability + refusals ═══
{
  const sk = buildV1SheetSkeleton(1);
  refuses(() => hashRuleSheet(sk), "skeleton (nulls) refused — every hashed input is a mainnet blocker");
  const sealed = {
    ...sk,
    minQualifyingPurchaseUsdc: 50,
    minXpForBounty: 100,
    perSourceCaps: { "introduction-converted": 10 },
    interimPolicy: "no interims planned for season 1",
  };
  const h1 = hashRuleSheet(sealed);
  const shuffled = JSON.parse(canonicalSerialize(sealed));
  const h2 = hashRuleSheet(shuffled);
  ok(h1 === h2, "hash is canonical (key order irrelevant)");
  const amended = { ...sealed, minXpForBounty: 101 };
  ok(hashRuleSheet(amended) !== h1, "any value change changes the hash");
  refuses(
    () => hashRuleSheet({ ...sealed, curveBp: [{ fromRank: 1, toRank: 1, bpEach: 9999 }] }),
    "curve not summing to 10,000 bp refused",
  );
}

// ═══ 6. publishedFile — full addresses + stable keccak ═══
{
  const rowsIn = [
    { rank: 1, account: A(31), seat: 4, windowXp: 800, amountRaw: 700_000_000n, sampledBp: 2250 },
    { rank: 2, account: A(32), seat: 9, windowXp: 300, amountRaw: 300_000_000n, sampledBp: 1450 },
  ];
  const p1 = buildPublishedFile({
    chainId: CH, pool: POOL, seasonId: 1, roundId: 1001,
    budgetRaw: 1_000_000_000n, root: "0x" + "ab".repeat(32) as `0x${string}`, paidSlots: rowsIn,
  });
  ok(p1.file.rows[0].address === A(31), "the file carries FULL addresses (founder ruling)");
  const p2 = buildPublishedFile({
    chainId: CH, pool: POOL, seasonId: 1, roundId: 1001,
    budgetRaw: 1_000_000_000n, root: "0x" + "ab".repeat(32) as `0x${string}`, paidSlots: rowsIn,
  });
  ok(p1.fileKeccak === p2.fileKeccak, "file keccak is deterministic");
}

// ═══ 6b. ANTI-FARM (§0.17-⑤) — the PER-ATTACK bench (S3-4) ═══
{
  const knobs = {
    holdingPeriodSeconds: ANTI_FARM_PROPOSED.holdingPeriodSeconds,
    referralWindowCap: ANTI_FARM_PROPOSED.referralWindowCap,
    floorPair: { minQualifyingPurchaseUsdc: 50, minXpForBounty: 100 },
  };
  const T0 = 1_700_000_000;
  const ev = (over: Partial<MoneyWindowEventInput> & { sourceKey: MoneyWindowEventInput["sourceKey"] }): MoneyWindowEventInput => ({
    wallet: A(500),
    xp: 150,
    blockNumber: 100,
    logIndex: 0,
    blockTimestamp: T0,
    ...over,
  });

  // ATTACK 1 — THE WASH LOOP: buy → burn an hour later farms NOTHING; a real
  // holder (≥ the period) counts. Unknown acquisition = fail-closed excluded.
  const wash = filterForMoneyWindow(
    [
      ev({ sourceKey: "burn-act", lastAcquisitionTimestamp: T0 - 3600, logIndex: 0 }),
      ev({ sourceKey: "burn-act", lastAcquisitionTimestamp: T0 - 8 * 24 * 3600, logIndex: 1 }),
      ev({ sourceKey: "archive-mint", lastAcquisitionTimestamp: null, xp: 100, logIndex: 2 }),
    ],
    knobs,
  );
  ok(wash.included.length === 1 && wash.excluded.length === 2, "wash-loop: only the held burn counts");
  ok(wash.excluded[0].reason === "holding-period", "fresh-buy burn excluded: holding-period");
  ok(wash.excluded[1].reason === "holding-unknown", "unknown acquisition excluded fail-closed");
  ok(wash.perWalletMoneyXp.get(A(500).toLowerCase()) === 150, "money XP = the held burn only");

  // ATTACK 2 — THE REFERRAL FARM: 15 conversions in one window → the cap keeps
  // the EARLIEST 10; below-floor referrals credit nothing toward money.
  const farm: MoneyWindowEventInput[] = [];
  for (let i = 0; i < 15; i++) {
    farm.push(
      ev({
        sourceKey: "introduction-converted",
        xp: 500,
        blockNumber: 200 + i,
        referredPurchaseUsdc: 80,
        referredWalletXp: 250,
      }),
    );
  }
  const farmed = filterForMoneyWindow(farm, knobs);
  ok(farmed.included.length === 10, "referral farm capped at the window cap (10)");
  ok(
    farmed.included.every((e) => e.blockNumber <= 209) &&
      farmed.excluded.every((x) => x.reason === "referral-window-cap" && x.event.blockNumber >= 210),
    "the cap keeps the EARLIEST credits (deterministic)",
  );

  // ATTACK 3 — THE FLOOR GATES: under-floor purchase · under-floor XP · unknown
  // context · unset pair — none pays; a clean referral passes.
  const floors = filterForMoneyWindow(
    [
      ev({ sourceKey: "introduction-converted", referredPurchaseUsdc: 30, referredWalletXp: 250, logIndex: 0 }),
      ev({ sourceKey: "introduction-converted", referredPurchaseUsdc: 80, referredWalletXp: 40, logIndex: 1 }),
      ev({ sourceKey: "introduction-converted", referredPurchaseUsdc: null, referredWalletXp: 250, logIndex: 2 }),
      ev({ sourceKey: "introduction-converted", referredPurchaseUsdc: 80, referredWalletXp: 250, logIndex: 3 }),
    ],
    knobs,
  );
  ok(floors.included.length === 1 && floors.included[0].logIndex === 3, "only the floor-clearing referral pays");
  ok(floors.excluded[0].reason === "referral-floor-purchase", "under-floor purchase excluded");
  ok(floors.excluded[1].reason === "referral-floor-xp", "under-floor referred XP excluded");
  ok(floors.excluded[2].reason === "referral-context-unknown", "unknown referred context excluded fail-closed");
  const unset = filterForMoneyWindow(
    [ev({ sourceKey: "introduction-converted", referredPurchaseUsdc: 9999, referredWalletXp: 9999 })],
    { ...knobs, floorPair: { minQualifyingPurchaseUsdc: null, minXpForBounty: 100 } },
  );
  ok(
    unset.included.length === 0 && unset.excluded[0].reason === "referral-floor-unset",
    "null floor pair → NO referral pays (the founder's figures gate everything)",
  );

  // RECEIPT-SPLIT note: purchase XP is ONCE per wallet per season UPSTREAM (the
  // readmodel's purchaseCredited set, live since S1); here a single purchase
  // event passes through exactly once.
  const pass = filterForMoneyWindow([ev({ sourceKey: "purchase-receipt", xp: 200 })], knobs);
  ok(pass.included.length === 1 && pass.excluded.length === 0, "purchase passes through once");

  // END-TO-END: window events → anti-farm filter → potPolicy → EXACT slots.
  const e2e = filterForMoneyWindow(
    [
      ev({ sourceKey: "introduction-converted", wallet: A(601), xp: 500, blockNumber: 300, referredPurchaseUsdc: 80, referredWalletXp: 250 }),
      ev({ sourceKey: "burn-act", wallet: A(602), xp: 150, blockNumber: 301, lastAcquisitionTimestamp: T0 - 30 * 24 * 3600 }),
      ev({ sourceKey: "burn-act", wallet: A(603), xp: 150, blockNumber: 302, lastAcquisitionTimestamp: T0 - 60 }), // wash — dies
    ],
    knobs,
  );
  const potRows: PotInputRow[] = [...e2e.perWalletMoneyXp.entries()].map(([w, xp], i) => ({
    account: w as `0x${string}`,
    seat: i + 1,
    windowXp: xp,
    attainingBlock: 300 + i,
    horsConcours: false,
  }));
  const paid = applyCurve(potRows, 500_000_000n, {
    isProjection: false,
    antiFarmImplemented: true,
    floorPair: { minQualifyingPurchaseUsdc: 50, minXpForBounty: 100 },
  });
  ok(paid.ok, "end-to-end: filtered window computes");
  if (paid.ok) {
    const sum = paid.paidSlots.reduce((a, s) => a + s.amountRaw, 0n);
    ok(sum === 500_000_000n, "end-to-end exact sum");
    ok(paid.paidSlots[0].account === A(601).toLowerCase(), "the clean introducer ranks first");
    ok(!paid.paidSlots.some((s) => s.account === A(603).toLowerCase() && s.windowXp > 0), "the washer earned no money-XP rank");
  }
}

// ═══ 7. THE DIFFERENTIAL FIXTURE — drift check against the committed file ═══
{
  const fresh = generateFixtureJson();
  const committedPath = resolve(
    import.meta.dirname,
    "../../../contracts/test/fixtures/merkle-fixture.json",
  );
  let committed = "";
  try {
    committed = readFileSync(committedPath, "utf8");
  } catch {
    console.error(
      "[guard:season-merkle] RED — the differential fixture is missing; run: pnpm run season-merkle:fixture",
    );
    process.exit(1);
  }
  ok(
    committed.replace(/\r\n/g, "\n") === fresh.replace(/\r\n/g, "\n"),
    "fixture DRIFT — the committed contracts/test/fixtures/merkle-fixture.json no longer matches the builder; regenerate + re-run the Foundry fixture test",
  );
}

console.log(`[guard:season-merkle] PASS — ${checks} checks (potPolicy exact-sum ×200 fields · refusals · tie-break · merkle fences · rulesHash canon · published-file · fixture drift).`);
