/**
 * guard-money-flow — THE ROUTED SPLIT IS SUMMED FROM THE CHAIN, NEVER DERIVED,
 * AND IT IS ANCHORED OUTSIDE THE INDEX.
 * ===========================================================================
 * THE DEFECT THIS GUARD EXISTS FOR (audit P0-1, 2026-08-06). The home page,
 * /tokenomics and /whitepaper published the 70/20/10 legs as shares of GROSS:
 *
 *     routedVault: routedShare(aggregateRaw, 7_000n)      ← 70% of gross
 *
 * while the deployed engine routes 70/20/10 of NET — gross minus the source
 * payment (MembershipSaleV3.verified.sol:498-503). Measured the same day: the
 * three legs totalled 1,410.00 against a true 1,408.75 — overstated by exactly
 * 1.25, which IS the source payment ever made. Under a VerifyOnChain anchor,
 * and growing with every referral. The pages already said "NET USDC is routed"
 * in prose, so the copy told the truth and the figures refuted it on the same
 * line.
 *
 * THE RULE NOW: the legs are not computed from a percentage of anything. They
 * are SUMMED from the amounts the chain emitted — every generation emits
 * vaultAmount / liquidityAmount / operationsAmount, and the backbone already
 * decodes all three per row. Exact by construction, and the legs sum to the
 * total without arithmetic.
 *
 * ⛔ AND THE SUM IS ANCHORED OUTSIDE ITSELF (founder, 2026-08-06). An identity
 * that only checks the fold against its own parts is SELF-REFERENTIAL: if the
 * index misses a purchase, every leg and the total drop together and the
 * identity stays GREEN while the published figure is short. So the fold is also
 * reconciled against counters the contract keeps itself —
 * totalGrossUsdc / totalAcquisitionCost / totalProtocolContribution on V3,
 * totalUsdcRaised on V1/V2a/V2b — which no indexing bug can move.
 * Measured 2026-08-06, all three axes exact:
 *     anchor net 1408.75 === folded legs · anchor gross 1410.00 === legs+payment
 *     · anchor payment 1.25 === folded payment
 *
 * SCOPE — what this guard does NOT prove: that the index is complete (only that
 * a short index is CAUGHT), that the RPC answered honestly, or that any surface
 * renders what it is served. It proves the fold's arithmetic, its anchor, the
 * absence of a derived share, and the vocabulary ratchet.
 * ===========================================================================
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const repo = join(import.meta.dirname, "..", "..", "..");
let failures = 0;
let checks = 0;
const pass = (m: string): void => {
  checks += 1;
  console.log(`  ✓ ${m}`);
};
const fail = (m: string): void => {
  failures += 1;
  checks += 1;
  console.error(`  ✗ ${m}`);
};
const check = (cond: boolean, ok: string, no: string): void => (cond ? pass(ok) : fail(no));

const stripComments = (s: string): string =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");

// ── ① THE IDENTITY, EXECUTED ON THE REAL FOLD ──────────────────────────────
// vault + liquidity + operations + sourcePayment === gross, in base units.
// Driven with fixtures through the production fold, never re-implemented here.
const FOLD_MODULE = join(repo, "artifacts", "api-server", "src", "lib", "protocol", "routedFold.ts");
check(
  existsSync(FOLD_MODULE),
  "money-flow: the routed fold module exists",
  "money-flow: src/lib/protocol/routedFold.ts is MISSING — the legs must be summed from indexed rows in ONE place, not derived as a share of an aggregate at the client",
);

if (existsSync(FOLD_MODULE)) {
  const mod = (await import(pathToFileURL(FOLD_MODULE).href)) as Record<string, unknown>;

  const fold = mod["foldRoutedTotals"];
  check(
    typeof fold === "function",
    "money-flow: foldRoutedTotals is exported and callable",
    "money-flow: routedFold.ts does not export foldRoutedTotals()",
  );

  const reconcile = mod["reconcileRoutedFold"];
  check(
    typeof reconcile === "function",
    "money-flow: reconcileRoutedFold is exported and callable",
    "money-flow: routedFold.ts does not export reconcileRoutedFold() — without it the fold is anchored to nothing and a short index publishes a short figure with every check green",
  );

  if (typeof fold === "function") {
    const f = fold as (rows: readonly Record<string, string | null>[]) => Record<string, string>;
    // Real shape, real numbers: the protocol's own measured totals, 2026-08-06.
    const ROWS = [
      { vaultRaw: "17500000", liquidityRaw: "5000000", operationsRaw: "2500000", sourcePaymentRaw: "0" },
      { vaultRaw: "968625000", liquidityRaw: "276750000", operationsRaw: "138375000", sourcePaymentRaw: "1250000" },
    ];
    let out: Record<string, string> | null = null;
    try {
      out = f(ROWS);
    } catch {
      out = null;
    }
    check(
      out !== null,
      "money-flow: the fold runs on well-formed rows",
      "money-flow: foldRoutedTotals threw on well-formed rows",
    );
    if (out !== null) {
      const b = (k: string): bigint => BigInt(out[k] ?? "-1");
      const identity =
        b("vaultRaw") + b("liquidityRaw") + b("operationsRaw") + b("sourcePaymentRaw") === b("grossRaw");
      check(
        identity,
        "money-flow: ① vault + liquidity + operations + sourcePayment === gross",
        `money-flow: ① THE IDENTITY IS BROKEN — the fold produced v=${out["vaultRaw"]} l=${out["liquidityRaw"]} o=${out["operationsRaw"]} pay=${out["sourcePaymentRaw"]} gross=${out["grossRaw"]}, which do not reconcile. A money document whose parts do not sum to its total is the defect this guard exists for`,
      );
      const netOk = b("vaultRaw") + b("liquidityRaw") + b("operationsRaw") === b("netProtocolContributionRaw");
      check(
        netOk,
        "money-flow: ① the three legs === net protocol contribution",
        "money-flow: ① the three legs do not sum to netProtocolContributionRaw",
      );
    }
  }

  // ── ④ THE ANCHOR — a SHORT INDEX MUST BE CAUGHT ─────────────────────────
  // This is the assertion the identity alone cannot make. Feed the reconciler a
  // fold that is internally consistent but SHORT against the contract counters
  // (exactly what a missed purchase looks like) and require a refusal.
  if (typeof reconcile === "function") {
    const rec = reconcile as (
      fold: Record<string, string>,
      anchor: Record<string, string>,
    ) => { ok: boolean; reason: string | null };

    const ANCHOR = { grossRaw: "1410000000", netProtocolContributionRaw: "1408750000", sourcePaymentRaw: "1250000" };
    const EXACT = {
      vaultRaw: "986125000", liquidityRaw: "281750000", operationsRaw: "140875000",
      sourcePaymentRaw: "1250000", netProtocolContributionRaw: "1408750000", grossRaw: "1410000000",
    };
    let agree: { ok: boolean; reason: string | null } | null = null;
    try {
      agree = rec(EXACT, ANCHOR);
    } catch {
      agree = null;
    }
    check(
      agree !== null && agree.ok === true,
      "money-flow: ④ the reconciler accepts a fold that matches the contract counters",
      "money-flow: ④ the reconciler refused a fold that exactly matches the anchor — it would black out a correct figure",
    );

    // One purchase missing from the index: internally consistent, externally short.
    const SHORT = {
      vaultRaw: "982625000", liquidityRaw: "280750000", operationsRaw: "140375000",
      sourcePaymentRaw: "1250000", netProtocolContributionRaw: "1403750000", grossRaw: "1405000000",
    };
    const selfConsistent =
      BigInt(SHORT.vaultRaw) + BigInt(SHORT.liquidityRaw) + BigInt(SHORT.operationsRaw) ===
      BigInt(SHORT.netProtocolContributionRaw);
    check(
      selfConsistent,
      "money-flow: ④ the short-index fixture is internally consistent (so ① alone would pass it)",
      "money-flow: ④ the short-index fixture is malformed — fix the fixture, not the code",
    );
    let short: { ok: boolean; reason: string | null } | null = null;
    try {
      short = rec(SHORT, ANCHOR);
    } catch {
      short = null;
    }
    check(
      short !== null && short.ok === false && typeof short.reason === "string" && short.reason.length > 0,
      "money-flow: ④ a fold short against the contract anchor is REFUSED, with a reason",
      "money-flow: ④ A SHORT INDEX WAS ACCEPTED. The fold summed to less than the contract's own counters and the reconciler said ok — this is the exact case the identity in ① cannot see: every leg drops together, the parts still sum to the whole, and the published figure is quietly short",
    );
  }
}

// ── ② NO DERIVED SHARE ANYWHERE IN THE STUDIO ──────────────────────────────
// The legs are summed, never computed as a percentage of an aggregate.
const STUDIO_SRC = join(repo, "artifacts", "studio", "src");
const walk = (d: string, acc: string[] = []): string[] => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist") continue;
      walk(p, acc);
    } else if (/\.(ts|tsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
};
const studioFiles = existsSync(STUDIO_SRC) ? walk(STUDIO_SRC) : [];
const DERIVED = /\b(7_000n|2_000n|1_000n)\b|routedShare/;
const derivedHits = studioFiles.filter((f) => DERIVED.test(stripComments(readFileSync(f, "utf8"))));
check(
  derivedHits.length === 0,
  "money-flow: ② no derived 70/20/10 share of any aggregate in the studio",
  `money-flow: ② a DERIVED SHARE is back in ${derivedHits.map((f) => relative(repo, f).split(sep).join("/")).join(", ")} — the legs are summed from what the chain emitted, never computed as a percentage of an inflow aggregate. That derivation is what published 1,410.00 where the chain said 1,408.75`,
);

// ── ③ THE VOCABULARY RATCHET ───────────────────────────────────────────────
// acquisitionCost / protocolContribution are ABI words. They may live in the
// decode layer and NOWHERE else. This is a DIRECTORY SWEEP, so a surface
// created tomorrow is covered the day it exists — not a named-file scan, which
// is the self-naming defect the 2026-08-06 audit found across the estate.
//
// ⛔ IT IS A RATCHET, NOT A CLEAN BAN, and the header says so honestly: 15
// files carried these words when it was written (50 code-only occurrences).
// 8 are the ABI/wire layer and are allowed FOREVER. 7 are real debt, pinned
// below to their exact COUNT — a new file is RED, and a debt file growing from
// 4 to 6 is RED too, because a ratchet that only stops new files lets the old
// ones spread.
const BANNED = ["acquisitionCost", "protocolContribution"] as const;
const ALLOWED_FOREVER: readonly string[] = [
  "lib/api-spec/openapi.yaml",
  "artifacts/api-server/src/canon/the-syndicate/contracts/abi/sale-abi.ts",
  "artifacts/api-server/src/lib/protocol/saleEventDecoders.ts",
  "artifacts/api-server/src/lib/protocol/sourceDecoders.ts",
  "artifacts/api-server/src/lib/protocol/saleEventSemantics.ts",
  "artifacts/api-server/src/backbone/backboneDb.ts",
  "artifacts/studio/src/lib/chainReads.ts",
  // THE edge translation named in CANON_PROTOCOL_LANGUAGE §4: it renames the
  // ABI word ONCE, which is precisely why it must be allowed to speak it.
  "artifacts/studio/src/lib/checkoutVocabulary.ts",
];
/** Measured 2026-08-06, comments stripped. The count may only go DOWN. */
const DEBT: Readonly<Record<string, number>> = {
  "artifacts/studio/src/wallet/JoinCheckout.tsx": 6,
  "artifacts/studio/src/lib/protocolCommerceReceipt.ts": 6,
  "artifacts/api-server/src/backbone/introductionRefresh.ts": 5,
  "artifacts/api-server/src/lib/protocol/introductionReadmodel.ts": 4,
  "artifacts/studio/src/lib/activityFeed.ts": 2,
  "artifacts/studio/src/wallet/receiptRowModel.ts": 2,
  "artifacts/studio/src/config/referralProgram.ts": 1,
};
const sweepRoots = [
  join(repo, "artifacts", "studio", "src"),
  join(repo, "artifacts", "api-server", "src"),
  join(repo, "lib"),
];
const sweepFiles: string[] = [];
for (const r of sweepRoots) {
  if (!existsSync(r)) continue;
  const acc: string[] = [];
  const w = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (["node_modules", "dist", "generated"].includes(e.name)) continue;
        w(p);
      } else if (/\.(ts|tsx|yaml)$/.test(e.name)) acc.push(p);
    }
  };
  w(r);
  sweepFiles.push(...acc);
}
let newOffenders = 0;
let grown = 0;
for (const f of sweepFiles) {
  const rel = relative(repo, f).split(sep).join("/");
  if (ALLOWED_FOREVER.includes(rel)) continue;
  const code = stripComments(readFileSync(f, "utf8"));
  let n = 0;
  for (const w of BANNED) n += (code.match(new RegExp(w, "g")) ?? []).length;
  if (n === 0) continue;
  const allowance = DEBT[rel];
  if (allowance === undefined) {
    newOffenders += 1;
    fail(
      `money-flow: ③ ${rel} uses an ABI-only money word (${n}×) and is neither the decode layer nor recorded debt. "acquisitionCost" / "protocolContribution" never leave the ABI layer — the source is paid at the ENTRANCE and never enters the treasury, so a word implying the protocol bore a cost tells the opposite of what MembershipSaleV3.verified.sol:278-282 does. Use sourcePaymentRaw / netProtocolContributionRaw`,
    );
  } else if (n > allowance) {
    grown += 1;
    fail(
      `money-flow: ③ ${rel} grew from ${allowance} to ${n} occurrence(s) of an ABI-only money word. The debt list is a RATCHET — it may only shrink`,
    );
  }
}
check(
  newOffenders === 0 && grown === 0,
  `money-flow: ③ the ABI-only money words stay in the ABI layer (${ALLOWED_FOREVER.length} allowed forever, ${Object.keys(DEBT).length} debt file(s) pinned to their exact counts)`,
  "money-flow: ③ an ABI-only money word escaped its layer — see the lines above",
);

// ── ⑤ THE DISPLAY REMAINDER, EXECUTED ──────────────────────────────────────
// THE SECOND, INDEPENDENT ERROR the 2026-08-06 audit found in this card (A12):
// even with the right base, the three legs were each floored at 7000/2000/1000
// bps while the contract makes operations the EXACT REMAINDER
// (verified.sol:503, `operationsAmount = protocolContribution - vault - liquidity`).
// So the displayed parts could not sum to the displayed total: the real legs are
// 986.125 / 281.75 / 140.875, and no 2-decimal display of them adds to 1,408.75
// unless operations absorbs the halves — 140.88, not 140.87.
// THE RULE: floor vault and liquidity at display precision, then
// operations = total − vault − liquidity. Executed against the studio's own
// module, with the sum asserted on every fixture.
{
  const AMOUNT_MODULE = join(repo, "artifacts", "studio", "src", "lib", "amountFormat.ts");
  check(
    existsSync(AMOUNT_MODULE),
    "money-flow: ⑤ the one-truncation module exists",
    "money-flow: ⑤ artifacts/studio/src/lib/amountFormat.ts is MISSING — the display remainder must live beside THE ONE truncation, never in a page",
  );
  if (existsSync(AMOUNT_MODULE)) {
    const mod = (await import(pathToFileURL(AMOUNT_MODULE).href)) as {
      displayRoutedSplit?: (
        v: string | null,
        l: string | null,
        t: string | null,
      ) => { vault: string; liquidity: string; operations: string; total: string } | null;
    };
    const split = mod.displayRoutedSplit;
    check(
      typeof split === "function",
      "money-flow: ⑤ displayRoutedSplit is exported and callable",
      "money-flow: ⑤ amountFormat.ts does not export displayRoutedSplit() — without ONE home for the remainder each surface floors its own legs, and the parts stop summing to the total",
    );
    if (typeof split === "function") {
      const cents = (s: string): bigint => BigInt(s.replace(/[^0-9]/g, ""));
      // vault · liquidity · netTotal (raw 6-dec base units) · what operations must read
      const ROWS: readonly (readonly [string, string, string, string])[] = [
        // THE REAL ONE, measured on chain 2026-08-06 — the founder-approved figures.
        ["986125000", "281750000", "1408750000", "140.88"],
        // Clean tenths — nothing to absorb; a naive floor would pass this one too.
        ["700000", "200000", "1000000", "0.10"],
        // Both legs floor away a fraction: operations must absorb BOTH.
        ["2333333", "666666", "3333333", "0.34"],
        // A single 5.00 purchase, exact on every leg.
        ["3500000", "1000000", "5000000", "0.50"],
      ];
      let summed = 0;
      for (const [v, l, t, wantOps] of ROWS) {
        const out = split(v, l, t);
        const ok =
          out !== null &&
          out.operations === wantOps &&
          cents(out.vault) + cents(out.liquidity) + cents(out.operations) === cents(out.total);
        if (ok) summed += 1;
        check(
          ok,
          `money-flow: ⑤ net ${t} → ${out?.vault} / ${out?.liquidity} / ${out?.operations} sums to ${out?.total}`,
          `money-flow: ⑤ THE PARTS DO NOT SUM TO THE TOTAL. vault=${v} liquidity=${l} net=${t} produced ${JSON.stringify(out)} — operations must read ${wantOps} (total − vault − liquidity, mirroring verified.sol:503). Three money figures that do not add up to the total printed beside them is the second defect the audit found in this card, and anyone with a calculator can see it`,
        );
      }
      check(
        summed === ROWS.length,
        `money-flow: ⑤ every fixture sums exactly (${summed}/${ROWS.length})`,
        `money-flow: ⑤ only ${summed}/${ROWS.length} fixtures summed`,
      );
      // AT EVERY PRECISION, not only the 2 decimals the surfaces use today. The
      // rule is arithmetic, not a display convention: whatever precision a future
      // surface picks, the parts must still add to the total it prints.
      const anySplit = split as unknown as (
        v: string,
        l: string,
        t: string,
        d: number,
        dd: number,
      ) => { vault: string; liquidity: string; operations: string; total: string } | null;
      let precisionsOk = 0;
      const PRECISIONS = [0, 1, 2, 3, 4, 5, 6];
      for (const dd of PRECISIONS) {
        const out = anySplit("986125000", "281750000", "1408750000", 6, dd);
        if (out === null) continue;
        const c = (s: string): bigint => BigInt(s.replace(/[^0-9]/g, ""));
        if (c(out.vault) + c(out.liquidity) + c(out.operations) === c(out.total)) precisionsOk += 1;
      }
      check(
        precisionsOk === PRECISIONS.length,
        `money-flow: ⑤ the parts sum to the total at every display precision (${precisionsOk}/${PRECISIONS.length}: 0→6 decimals)`,
        `money-flow: ⑤ the sum broke at ${PRECISIONS.length - precisionsOk} of ${PRECISIONS.length} display precisions — the remainder rule must be arithmetic, not tuned to the 2 decimals today's surfaces happen to use`,
      );
      // FAIL-CLOSED: a malformed leg, or a remainder that would go negative,
      // publishes NOTHING — a negative or invented leg is worse than a gap.
      check(
        split("abc", "281750000", "1408750000") === null &&
          split("986125000", null, "1408750000") === null &&
          split("986125000", "281750000", "900000000") === null,
        "money-flow: ⑤ a malformed leg or a negative remainder serves null, never a fabricated figure",
        "money-flow: ⑤ displayRoutedSplit returned a split for malformed input, or for a total smaller than its own legs",
      );
    }
  }
}

console.log(
  failures === 0
    ? `\nguard-money-flow: ${checks} checks green. The legs are SUMMED from the chain, anchored against the contract's own counters, they SUM TO THEIR TOTAL on screen, and the ABI words stay in the ABI layer.\nNOT CHECKED: that the index is complete (only that a short one is caught), that the RPC answered honestly, or that a surface renders what it is served.`
    : `\nguard-money-flow FAILED: ${failures} violation(s) of ${checks} check(s).`,
);
if (failures > 0) process.exit(1);
