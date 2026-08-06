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
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    // `[^\n]*` not `.*$` — `.` does not match `\r`, and every file here is CRLF,
    // so the old form stripped NOTHING (fixtures below). The leading capture
    // keeps `https://…` intact: a stripper that eats the rest of a line after a
    // URL hides a real occurrence exactly as well as one that strips nothing.
    .map((l) => l.replace(/(^|[^:"'`])\/\/[^\n]*/, "$1"))
    .join("\n");

// ── ⓑ THE STRIPPER IS TESTED, BECAUSE IT WAS A NO-OP FOR ITS WHOLE LIFE ─────
// `/\/\/.*$/` never matched a `//` line in this repo: `.` does not match `\r`,
// `$` (no `m` flag) matches only end-of-input, and EVERY source file here is
// CRLF. So this guard's ② and ③ counted words inside COMMENTS for their entire
// existence — ③ was RED at the guard's own birth (`ded1596`) on a comment in
// JoinProtocol.tsx carried since `0d0011c`, and ② went red on the tombstone
// comment that RECORDED the deletion of the defect it hunts.
// A guard that cannot tell code from prose is measuring something other than
// what it claims, so the stripper is now driven by fixtures rather than trusted.
{
  const CRLF = "const a = 1;\r\n// acquisitionCost lives in this comment\r\nconst b = 2;\r\n";
  const LF = CRLF.replace(/\r/g, "");
  const BLOCK = "const a = 1;\r\n/* protocolContribution in a block */\r\nconst b = 2;\r\n";
  const KEEPS_CODE = 'const acquisitionCost = 1; // and a trailing comment\r\n';
  check(
    !/acquisitionCost/.test(stripComments(CRLF)),
    "money-flow: ⓑ a `//` comment is stripped on CRLF files (the whole repo)",
    "money-flow: ⓑ THE COMMENT-STRIPPER IS A NO-OP ON CRLF. `.` never matches `\\r`, so every `//` line survives and ②/③ count words inside COMMENTS. Every source file in this repo is CRLF — this guard has been measuring prose, not code",
  );
  check(
    !/acquisitionCost/.test(stripComments(LF)) && !/protocolContribution/.test(stripComments(BLOCK)),
    "money-flow: ⓑ `//` on LF and `/* */` blocks are stripped too",
    "money-flow: ⓑ the stripper missed an LF line comment or a block comment",
  );
  check(
    /acquisitionCost/.test(stripComments(KEEPS_CODE)),
    "money-flow: ⓑ CODE on a line that also carries a comment is KEPT",
    "money-flow: ⓑ the stripper ate real code that shared a line with a trailing comment — a stripper that over-reaches hides the defect as surely as one that under-reaches",
  );
  const URL_LINE = 'const u = "https://x.io/a"; const acquisitionCost = 2;\r\n';
  check(
    /acquisitionCost/.test(stripComments(URL_LINE)),
    "money-flow: ⓑ a `//` inside a URL does not swallow the rest of the line",
    "money-flow: ⓑ the stripper treated `https://` as a comment and ate the code after it — an occurrence sitting after any URL would be invisible",
  );
}

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

// ── ⓒ THE PROVENANCE PROPERTY — ② PINNED TO WHAT IS TRUE, NOT TO A SPELLING ─
// ② matches `routedShare` and the three bps literals. That is TODAY'S SPELLING
// of the defect, and the defect has no obligation to keep it: the same wrong
// figure written `(BigInt(aggregate) * 70n) / 100n` walks through ② GREEN. The
// hole is demonstrated below against the live matcher before the replacement is
// applied — a guard that cannot be shown failing has not been tested.
//
// THE PROPERTY: every value that reaches a `routed*` field must resolve, within
// a short chain, to `financial.routed.*` reads and NOTHING ELSE. Not "no
// arithmetic" — the founder-approved remainder (total − vault − liquidity) IS
// arithmetic, and a matcher that flags its own approved fix earns an exemption
// within the hour. What is forbidden is FOREIGN PROVENANCE: any other financial
// figure entering the chain. That kills every spelling of "a share of the
// aggregate" at once, including the ones nobody has written yet.
{
  /** Every financial id reachable from an expression, following local consts. */
  const provenanceOf = (code: string, expr: string, depth: number): string[] => {
    const ids = [...expr.matchAll(/"(financial\.[^"]+)"/g)].map((m) => m[1] as string);
    if (depth <= 0) return ids;
    const out = [...ids];
    for (const d of code.matchAll(/const\s+(\w+)\s*=\s*([\s\S]*?);\r?\n/g)) {
      const name = d[1] as string;
      const body = d[2] as string;
      if (new RegExp(`\\b${name}\\b`).test(expr) && !new RegExp(`\\b${name}\\b`).test(body)) {
        out.push(...provenanceOf(code, body, depth - 1));
      }
    }
    return out;
  };
  /**
   * The property, as a pure verdict so it can be driven by fixtures.
   *
   * ⛔ THE ENTRY SET, STATED SO IT IS INTENTIONAL: this property is
   * PROVENANCE-based, but it enters through fields NAMED `routed*` in files that
   * read `financial.routed.*`. A routed leg published under another name — say
   * `reserveUsdc` — sits OUTSIDE it until the field is renamed into the family
   * or the entry set is widened here. That is a real bound, not an oversight:
   * a matcher that tried to guess which arbitrary field "is a leg" would either
   * miss silently or flag half the page, and both teach people to write
   * exemptions. Widen it deliberately when a leg is named otherwise.
   */
  const routedProvenance = (src: string): { ok: boolean; reason: string | null } => {
    const code = stripComments(src);
    const assigns = [...code.matchAll(/\brouted[A-Z]\w*\s*:\s*([^,;\n]+(?:\n[^,;\n]+)*)/g)];
    if (assigns.length === 0) return { ok: true, reason: null };
    // ⛔ A TYPE IS NOT A VALUE. `routedVault: string | null` in the interface has
    // no provenance BY CONSTRUCTION, and the first version of this matcher read
    // it as a derivation with none — a false RED on correct code, which is how a
    // guard teaches people to add exemptions. Type unions are skipped; anything
    // that computes is not.
    const isTypeOnly = (e: string): boolean =>
      /^(?:\s|\||string|number|boolean|null|undefined|readonly|\[\]|<[^>]*>|[A-Z]\w*)+$/.test(e.trim());
    for (const a of assigns) {
      const expr = a[1] as string;
      if (isTypeOnly(expr)) continue;
      const field = (a[0] as string).split(":")[0]?.trim() ?? "?";
      const ids = provenanceOf(code, expr, 3);
      if (ids.length === 0) {
        return { ok: false, reason: `${field} has NO traceable provenance — it cannot be shown to come from the chain-summed legs at all` };
      }
      const foreign = ids.filter((i) => !i.startsWith("financial.routed."));
      if (foreign.length > 0) {
        return { ok: false, reason: `${field} is computed from ${[...new Set(foreign)].join(", ")} — a routed leg may only come from financial.routed.*, never from another figure by any arithmetic, under any name` };
      }
    }
    return { ok: true, reason: null };
  };

  // THE REWRITTEN DEFECT. No `routedShare`, no `7_000n` — the same wrong figure
  // in a spelling ② has never seen.
  const REWRITTEN_DEFECT = [
    'const aggregateRaw = findFinancial(financial, "financial.inflow.aggregate");',
    "return {",
    "  routedVault: formatBaseUnits(((BigInt(aggregateRaw) * 70n) / 100n).toString(), 6, 2),",
    "};",
  ].join("\r\n");
  const FLOAT_SPELLING = [
    'const agg = findFinancial(financial, "financial.inflow.aggregate");',
    "return { routedVault: usd(Number(agg) * 0.7) };",
  ].join("\r\n");
  const CORRECT_SHAPE = [
    "const routedDisplay = displayRoutedSplit(",
    '  findFinancial(financial, "financial.routed.vault"),',
    '  findFinancial(financial, "financial.routed.liquidity"),',
    '  findFinancial(financial, "financial.routed.netTotal"),',
    ");",
    "return { routedVault: routedDisplay?.vault ?? null };",
  ].join("\r\n");

  // ⛔ THE HOLE, MEASURED: ②'s own matcher passes the rewritten defect.
  check(
    !DERIVED.test(stripComments(REWRITTEN_DEFECT)),
    "money-flow: ⓒ ②'s literal matcher is blind to a rewritten derivation (the hole this property closes)",
    "money-flow: ⓒ ②'s literal matcher caught the rewritten defect — if that is now true, this note is stale, not the guard",
  );
  check(
    routedProvenance(REWRITTEN_DEFECT).ok === false,
    "money-flow: ⓒ a leg derived from the inflow aggregate is REFUSED, in a spelling ② cannot see",
    "money-flow: ⓒ THE REWRITTEN DEFECT PASSED. `(BigInt(aggregate) * 70n) / 100n` assigned to a routed leg must be refused — this is the same wrong figure that published 1,410.00, wearing different syntax",
  );
  check(
    routedProvenance(FLOAT_SPELLING).ok === false,
    "money-flow: ⓒ the float spelling (`* 0.7`) is refused too — the property is provenance, not syntax",
    "money-flow: ⓒ a float-derived leg passed the provenance check",
  );
  check(
    routedProvenance(CORRECT_SHAPE).ok === true,
    "money-flow: ⓒ the correct shape (routed reads → the sum-proven helper) PASSES",
    `money-flow: ⓒ the correct shape was refused — ${routedProvenance(CORRECT_SHAPE).reason ?? ""}. A property that flags its own approved fix will be exempted within the hour, and the exemption is the hole`,
  );
  // …and the real producers in the studio, discovered, never named.
  const producers = sweepFiles.filter(
    (f) => /\.tsx?$/.test(f) && /financial\.routed\./.test(readFileSync(f, "utf8")),
  );
  check(
    producers.length > 0,
    `money-flow: ⓒ the routed legs have a discoverable producer (${producers.map((f) => relative(repo, f).split(sep).join("/")).join(", ")})`,
    "money-flow: ⓒ no studio file reads financial.routed.* — the legs are not coming from the chain-summed envelope at all",
  );
  for (const f of producers) {
    const rel = relative(repo, f).split(sep).join("/");
    const verdict = routedProvenance(readFileSync(f, "utf8"));
    check(
      verdict.ok,
      `money-flow: ⓒ ${rel} — every routed leg traces to financial.routed.* only`,
      `money-flow: ⓒ ${rel} — ${verdict.reason ?? "foreign provenance"}`,
    );
  }
}

// ── ⑥ P-A — A QUANTITY NAMED ONCE IS COMPUTED ONCE ─────────────────────────
// THE CLASS (founder, 2026-08-06): a displayed total whose source is independent
// of the parts displayed beneath it. P-A is its SERVER half: where a model
// publishes the same field name in both its per-row and its totals shape, the
// total must be the sum of the rows. P1-03 is the real instance — the row
// subtracted escrow (`introductionReadmodel.ts:274-276`) while the total summed
// what was AWARDED (`:291`) and published it under the PAID name (`:306`). One
// name, two formulas, and the difference reaches the public
// `financial.referral.paidToReferrersTotal`.
//
// ⛔ WHY THIS IS EXECUTED AND NOT A TEXT MATCHER. The inventory came first
// (founder's condition): FIVE models in this package carry a `totals` shape —
// activityHeartbeat, protocolEvent, memberContinuity, memberLedgerService,
// introduction — and in FOUR of them every totals field is a CARDINALITY (how
// many rows), never a sum of a row field, so no same-name pair can exist. Only
// `introductionReadmodel` has same-name row/total pairs, and it has four:
// attributedPurchases · introducedMembers · durableIntroductions (all three the
// honest row sum) and commissionPaidRaw (the defect). A static matcher walking
// all read-models would therefore be a machine built to inspect four fields in
// one file — and it could be defeated by a rename. So the property is asserted
// on the BUILDER'S REAL OUTPUT instead: build with fixtures, then for every key
// the totals share with the rows, assert total === Σ rows. Adding a model to the
// list below is one line the day a second one grows the shape.
{
  const INTRO_MODULE = join(repo, "artifacts", "api-server", "src", "lib", "protocol", "introductionReadmodel.ts");
  check(
    existsSync(INTRO_MODULE),
    "money-flow: ⑥ P-A the introduction read-model exists",
    "money-flow: ⑥ P-A introductionReadmodel.ts is MISSING — the only model in this package with same-name row/total pairs",
  );
  if (existsSync(INTRO_MODULE)) {
    const m = (await import(pathToFileURL(INTRO_MODULE).href)) as {
      buildIntroductionReadmodel?: (i: unknown) => {
        totals: Record<string, unknown>;
        bySource: Record<string, Record<string, unknown>>;
      };
    };
    const build = m.buildIntroductionReadmodel;
    check(
      typeof build === "function",
      "money-flow: ⑥ P-A buildIntroductionReadmodel is exported and callable",
      "money-flow: ⑥ P-A introductionReadmodel.ts does not export buildIntroductionReadmodel — the property cannot be executed, only guessed at",
    );
    if (typeof build === "function") {
      // ⛔ THE FIXTURE IS THE DEFECT'S OWN CONDITION: escrow NON-ZERO. With
      // escrow at 0 — which is what the chain says today, measured across all 8
      // sources — the broken total and the honest total are IDENTICAL, and any
      // fixture built on today's reality would pass a defect that is fully
      // present. This is the case P1-03 fires in.
      const A = "0x" + "a".repeat(64);
      const B = "0x" + "b".repeat(64);
      const row = (sourceId: string, recipient: string, blockNumber: number, cost: string) => ({
        chainId: 43114,
        eventName: "MembershipPurchasedV3",
        blockNumber,
        logIndex: 0,
        sourceId,
        recipient,
        acquisitionCostRaw: cost,
      });
      const inputs = {
        rows: [
          row(A, "0x" + "1".repeat(40), 100, "1000000"),
          row(A, "0x" + "2".repeat(40), 101, "2000000"),
          row(B, "0x" + "3".repeat(40), 102, "4000000"),
        ],
        durableByRecipient: {
          ["0x" + "1".repeat(40)]: true,
          ["0x" + "2".repeat(40)]: true,
          ["0x" + "3".repeat(40)]: false,
        },
        // A has 0.50 stuck in escrow; B has none. Total AWARDED 7.00, total
        // actually PAID 6.50 — the two figures the defect conflates.
        escrowBySourceId: { [A]: "500000", [B]: "0" },
        currentBpsBySourceId: { [A]: 500, [B]: 500 },
        blockDateByNumber: { 100: "2026-01-01", 101: "2026-01-02", 102: "2026-01-03" },
        fromBlock: 1,
        asOfBlock: 200,
      };
      let model: { totals: Record<string, unknown>; bySource: Record<string, Record<string, unknown>> } | null = null;
      try {
        model = build(inputs);
      } catch (e) {
        model = null;
        fail(`money-flow: ⑥ P-A the builder threw on a well-formed fixture: ${e instanceof Error ? e.message : String(e)}`);
      }
      if (model !== null) {
        const rowsOut = Object.values(model.bySource);
        const shared = Object.keys(model.totals).filter((k) => rowsOut.every((r) => k in r));
        check(
          shared.length > 0,
          `money-flow: ⑥ P-A the totals share ${shared.length} field name(s) with the rows (${shared.join(", ")})`,
          "money-flow: ⑥ P-A no field name is shared between the rows and the totals — either the model changed shape or the property is looking at the wrong object",
        );
        const isDecimal = (v: unknown): v is string => typeof v === "string" && /^[0-9]+$/.test(v);
        for (const key of shared) {
          const t = model.totals[key];
          if (isDecimal(t)) {
            const sum = rowsOut.reduce((acc, r) => acc + BigInt(String(r[key])), 0n);
            check(
              BigInt(t) === sum,
              `money-flow: ⑥ P-A totals.${key} === Σ rows.${key} (${t})`,
              `money-flow: ⑥ P-A THE TOTAL IS NOT THE SUM OF ITS ROWS. totals.${key} = ${t}, Σ rows.${key} = ${sum}. One name, two formulas — and this figure is published to the public envelope. This is P1-03: the row subtracts escrow, the total sums what was AWARDED, and both are called "${key}". With escrow at 0 the two agree and the defect is invisible; this fixture puts 0.50 in escrow, which is the condition it fires in`,
            );
          } else if (typeof t === "number") {
            const sum = rowsOut.reduce((acc, r) => acc + Number(r[key]), 0);
            check(
              t === sum,
              `money-flow: ⑥ P-A totals.${key} === Σ rows.${key} (${t})`,
              `money-flow: ⑥ P-A totals.${key} = ${t} but Σ rows.${key} = ${sum} — a count published as a total must be the sum of the rows it claims to total`,
            );
          }
        }
        // ② EARNED IS NOT PAID (founder's amendment): the rows carry three
        // distinct quantities and the totals must not collapse them into one.
        // A surface that legitimately wants EARNED must be able to ask for it by
        // name instead of inheriting a total that quietly changed meaning.
        for (const [key, meaning] of [
          ["commissionPaidRaw", "what the referrers actually RECEIVED (escrow subtracted)"],
          ["commissionEarnedRaw", "what the engine AWARDED, escrowed or not"],
          ["escrowOwedRaw", "what is stuck, owed but not yet received"],
        ] as const) {
          check(
            key in model.totals,
            `money-flow: ⑥ P-A totals carry "${key}" — ${meaning}`,
            `money-flow: ⑥ P-A totals do not publish "${key}". The ROWS distinguish paid / earned / escrowed; the totals must too, or a consumer asking for one of them silently receives another. ${meaning}`,
          );
        }
      }
    }
  }
}

// ── ⑥ P-B — A RENDERED TOTAL SHARES ITS PARTS' PROVENANCE ──────────────────
// The CLIENT half of the same class. The real defect, live until 2026-08-06:
// the hero card printed `MEMBERSHIP ROUTED` from `reality.aggregateInflowUsdc`
// (the GROSS inflow) directly beneath three legs bound to `reality.routed*`
// (the chain-summed NET). Three figures that did not add up to the number under
// them, on the homepage, checkable by anyone with a calculator — and the source
// read plausibly, because the label says "routed" and the binding said "inflow".
// Three review passes walked past it; RENDERING it is what caught it.
//
// ⛔ NO BLOCK DETECTION, BY CONSTRUCTION. A matcher that hunts "totals" across
// unlike surfaces either misses silently or flags half the page, and the
// allowlist it then needs becomes the escape hatch under time pressure. So P-B
// is a REGISTRY: each (total, parts) pair is entered by hand, with anchors that
// are real identifiers in the file. Today there is one pair. A second is one
// entry, added deliberately, with its own fixture.
{
  /** For a source, the `reality.X` a labelled total renders, and the family its parts come from. */
  const totalVsParts = (
    src: string,
    totalAnchor: string,
    partsAnchor: string,
  ): { ok: boolean; total: string | null; parts: readonly string[]; reason: string | null } => {
    const code = stripComments(src);
    const partsAt = code.indexOf(partsAnchor);
    // ⛔ BOUND THE WINDOW TO THE LITERAL, not to a character count. A flat
    // 400-char slice ran past the parts object into the NEXT one and pulled in
    // `vaultUsdc`/`lpUsdc`, which share no family with the legs — a FALSE RED on
    // correct code, caught here before it could ever reach a build.
    const partsBlock =
      partsAt < 0
        ? ""
        : (() => {
            const rest = code.slice(partsAt);
            const end = rest.indexOf("};");
            return end < 0 ? rest.slice(0, 400) : rest.slice(0, end);
          })();
    const parts = [...partsBlock.matchAll(/reality\.(\w+)/g)].map((m) => m[1] as string);
    const totalAt = code.indexOf(totalAnchor);
    const total =
      totalAt < 0
        ? null
        : (/reality\.(\w+)/.exec(code.slice(totalAt, totalAt + 400))?.[1] as string | undefined) ?? null;
    if (parts.length === 0) return { ok: false, total, parts, reason: `the parts anchor "${partsAnchor}" resolved to no reality.* binding` };
    if (total === null) return { ok: false, total, parts, reason: `the total anchor "${totalAnchor}" resolved to no reality.* binding` };
    // The family is READ FROM THE PARTS, never hardcoded: the longest prefix
    // they all share. `routedVault|routedLiquidity|routedOperations` → "routed".
    let family = parts[0] as string;
    for (const p of parts) {
      let i = 0;
      while (i < family.length && i < p.length && family[i] === p[i]) i += 1;
      family = family.slice(0, i);
    }
    family = /^([a-z]+)/.exec(family)?.[1] ?? family;
    if (family.length < 3) return { ok: false, total, parts, reason: `the parts (${parts.join(", ")}) share no name family, so provenance cannot be compared` };
    return total.startsWith(family)
      ? { ok: true, total, parts, reason: null }
      : {
          ok: false,
          total,
          parts,
          reason: `the total renders reality.${total} while its parts come from reality.${family}* (${parts.join(", ")}) — a total whose source is independent of the parts printed beneath it`,
        };
  };

  // THE FIXTURE IS THE DEFECT ITSELF, lifted verbatim from HeroLedger.tsx as it
  // stood at 578e5e1 — the shape that shipped, not a synthetic imitation.
  const HISTORICAL_DEFECT = [
    "  const routedByTone: Record<string, string | null> = {",
    "    vault: reality.routedVault,",
    "    liquidity: reality.routedLiquidity,",
    "    operations: reality.routedOperations,",
    "  };",
    "        <div className=\"mt-3 flex items-center justify-between rounded-xl\">",
    "          <span>{heroSystem.routing.totalRoutedLabel}</span>",
    "          <span>",
    "            {reality.aggregateInflowUsdc !== null ? (",
    "              <>{reality.aggregateInflowUsdc} <span>USDC</span></>",
    "            ) : null}",
    "          </span>",
    "        </div>",
  ].join("\r\n");
  const histVerdict = totalVsParts(HISTORICAL_DEFECT, "totalRoutedLabel", "routedByTone");
  check(
    histVerdict.ok === false,
    `money-flow: ⑥ P-B the 578e5e1 hero binding is REFUSED (total reality.${histVerdict.total} under reality.routed* legs)`,
    "money-flow: ⑥ P-B THE HISTORICAL DEFECT PASSED. A total bound to reality.aggregateInflowUsdc beneath legs bound to reality.routed* must be refused — that exact shape published 1,410.00 under three legs summing to 1,408.75, on the homepage",
  );

  // …and the same function on the file as it stands.
  const REGISTRY = [
    {
      file: join(repo, "artifacts", "studio", "src", "components", "hero", "HeroLedger.tsx"),
      label: "the hero routed card",
      totalAnchor: "totalRoutedLabel",
      partsAnchor: "routedByTone",
    },
  ];
  for (const entry of REGISTRY) {
    const rel = relative(repo, entry.file).split(sep).join("/");
    if (!existsSync(entry.file)) {
      fail(`money-flow: ⑥ P-B ${rel} is MISSING — a registered (total, parts) pair whose file no longer exists is a pin measuring nothing`);
      continue;
    }
    const v = totalVsParts(readFileSync(entry.file, "utf8"), entry.totalAnchor, entry.partsAnchor);
    check(
      v.ok,
      `money-flow: ⑥ P-B ${entry.label}: the total (reality.${v.total}) shares its parts' provenance (${v.parts.join(", ")})`,
      `money-flow: ⑥ P-B ${rel} — ${v.reason ?? "provenance mismatch"}`,
    );
  }
}

console.log(
  failures === 0
    ? `\nguard-money-flow: ${checks} checks green. The legs are SUMMED from the chain, anchored against the contract's own counters, they SUM TO THEIR TOTAL on screen, a total is the sum of its own rows, and the ABI words stay in the ABI layer.\nNOT CHECKED, and each bound is deliberate:\n · that the index is complete — only that a SHORT one is caught; that the RPC answered honestly; or that a surface renders what it is served.\n · ⓒ enters through fields NAMED routed*. A leg published under another name is outside it until the entry set is widened here.\n · ⑥ P-A runs on models that publish the SAME NAME in their rows and their totals. The inventory (2026-08-06) found five models carrying a totals shape and only ONE with such pairs — in the other four every total is a CARDINALITY, never a sum of a row field. A total under a DIFFERENT name from its rows is outside P-A; so is any figure assembled in the database or in server-authored text.\n · ⑥ P-B is a REGISTRY, not a sweep: ${"1"} registered (total, parts) pair. Every other total on every other surface is UNCOVERED, by construction — block-detection across unlike surfaces either misses silently or flags half the page, and the allowlist it needs becomes the escape hatch. Add a pair deliberately, with its own fixture.`
    : `\nguard-money-flow FAILED: ${failures} violation(s) of ${checks} check(s).`,
);
if (failures > 0) process.exit(1);
