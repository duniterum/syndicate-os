// guard-one-figure.ts — THE ONE TRUNCATION, made structural. BLOCKING.
// ---------------------------------------------------------------------------
// THE DEFECT (live in prod until 2026-07-26). FOUR independent projections of
// the same money coexisted and disagreed:
//   · /activity                      truncated  → 0.026551 WETH.e
//   · /contracts assets card         rounded up → 0.026552 WETH.e
//   · the PUBLIC HOME reserves band  rounded up → 0.026552 WETH.e (Number + Intl,
//     whose default rounding mode is halfExpand — half-up under another name)
//   · lib/rawUnits (member wallet + checkout) truncated, but with NO floor, so a
//     member holding 0.004 SYN read a flat "0" on their own wallet panel
// A member opening two tabs of the same site saw two different numbers for the
// same coins — the cross-surface mismatch the ONE-AUTHORITY rule exists to stop.
//
// THE RULE: base units → a displayed token amount happens through exactly ONE
// primitive, `truncateToDisplayUnits` in src/lib/amountFormat.ts, and it FLOORS.
// Rounding up states more money than is held — chain-refutable in one click.
// Truncation can only under-state. Every display helper carries the `< 0.0…1`
// floor so truncation can never print a false zero for a real holding.
//
// WHY THE FIRST VERSION OF THIS GUARD WAS NOT ENOUGH (and why this one is shaped
// differently): it keyed on two function NAMES and one bigint idiom. A twin under
// a third name — which already existed in lib/rawUnits.ts — tripped neither, and
// the rounding rule actually live on the home page was Intl, which no bigint
// regex can ever see. A guard that cannot fail on the defect in front of it is
// decoration. This one pins BEHAVIOUR first, and the allowlist second.
//
// WHY IT WAS AMENDED THE SAME DAY (2026-07-26, second pass). A senior review
// read the files this guard had just cleared and found TWO rendered projections
// it had never seen:
//   · wallet/ownReads.ts `usdFromRaw` — `n / 1_000_000n` plus a manual cents
//     padStart, rendered on FIVE member surfaces, with no floor (a real
//     sub-cent holding printed "$0.00") and no fail-closed (BigInt() threw, so
//     one malformed field took the member dashboard down). A DECIMAL bigint
//     literal is simply not the `10n ** …` idiom rule ① matches. Rule ⑥ below
//     closes that class.
//   · pages/admin/memberLedger.tsx `usd` — pure string slicing (padStart +
//     slice), no bigint, no float, no Intl. Rendered SIX times on the founder's
//     register. NO regex here could have seen it; it was found by reading.
// Both now project through the canon module.
//
// THE HONEST LIMIT OF §② (stated so no session mistakes it for a proof). Its
// rules match KNOWN projection idioms. A projection written in an idiom nobody
// has thought of is invisible to it — the memberLedger slicing is the proof,
// not the exception. And a file's presence in the ALLOWLIST says only that the
// sites §② MATCHED there were judged legitimate; it never says the file holds
// no OTHER projection. That is exactly how the memberLedger entry came to carry
// a reason ("a sort comparator — never rendered") that was true of the one line
// §② matched and false of the page. §⑤ is where a surface is PROVEN to call the
// one authority: grow §⑤, and never read a §② pass as completeness.
//
// WHAT THIS GUARD DELIBERATELY DOES NOT POLICE (stated so it is never guessed):
//   · EXACT rendering (rawUnits.formatRawUnits, protocolCommerceReceipt
//     .formatAmountExact and its api-server twin) — a different job, and the
//     receipt pair is pinned by guard-receipt-ticket.
//   · USD VALUATION — a fiat figure is an amount multiplied by a live price, a
//     DERIVED quantity, and float maths there is legitimate.
//   · Percentages, basis points and SVG geometry are not money.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const SRC = join(import.meta.dirname, "..", "src");
const CANON = "lib/amountFormat.ts";

// Files permitted to contain a base-unit→display projection or an Intl/float
// fraction render, each with the written reason. This list is the live
// "second-authority debt" counter — it should only ever shrink.
const ALLOWLIST: Record<string, string> = {
  "lib/amountFormat.ts": "the one authority itself",
  "lib/rawUnits.ts": "EXACT rendering (full value, trailing zeros trimmed); its truncation is borrowed from the canon module",
  "lib/protocolCommerceReceipt.ts": "EXACT receipt rendering; twinned with the api-server copy and pinned by guard-receipt-ticket",
  "components/ProtocolReservesBand.tsx": "USD valuation floats + the pool-share caption; token amounts go through the canon module",
  "components/ProtocolAssetsCard.tsx": "USD valuation floats; token amounts go through the canon module",
  "components/activity/MilestonesPanel.tsx": "progress-bar percentages (not a rendered money figure)",
  "components/hero/SeatFlowDiagram.tsx": "USD figures in a diagram, derived from a computed total",
  "components/tokenomics/useTokenomics.ts": "an exact bigint price ratio + a basis-points percentage",
  // Corrected 2026-07-26: the old reason ("a sort comparator — never rendered")
  // was true of the ONE line §② matches here — the Footprints ranking's
  // comparator, which narrows a bigint DIFFERENCE to a Number for its SIGN only
  // — but it read as a claim about the page, under which a string-slicing
  // projection rendered six money figures. That projection is gone (the page
  // calls the canon module), and §⑤ now PINS the call rather than trusting this
  // sentence.
  "pages/admin/memberLedger.tsx":
    "the Footprints ranking's sort comparator narrows a bigint DIFFERENCE to a Number for its sign only, and is never rendered; every rendered figure on the register goes through the canon module — pinned in ⑤",
};

// The shape of a base-unit projection: a scale derived from a token's decimals,
// or a float narrowing of a bigint, or an Intl/toFixed fraction render.
const PROJECTION = [
  [/10n\s*\*\*/, "a bigint scale (10n ** …) — a base-unit projection"],
  [/Number\s*\(\s*BigInt\s*\(/, "Number(BigInt(…)) — a float narrowing of base units"],
  [/10\s*\*\*\s*\w*[dD]ecimals/, "10 ** decimals — a float base-unit scale"],
  [/(maximum|minimum)FractionDigits/, "Intl fraction digits — rounds HALF-UP by default"],
  [/padStart\s*\(\s*\w*(ecimals|isplay)/, "a manual decimal-point insertion"],
  // ⑥ added 2026-07-26 — a DECIMAL bigint literal scale, the idiom `usdFromRaw`
  // hid in for months (`raw / 1_000_000n`). Deliberately bounded to 10^6 and
  // ABOVE, which is the token-decimals range this protocol renders (USDC 6 ·
  // BTC.b 8 · SYN/WETH.e 18). That bound is what keeps the rule honest: the
  // raw→raw arithmetic that legitimately divides by 10_000n (checkoutVocabulary's
  // slippage floor, useHeroReality's basis-point share) or by 100n (the 70/20/10
  // split) is excluded BY CONSTRUCTION — not by three more allowlist entries
  // whose reasons a reader would have to take on trust.
  [/[\/%]\s*1(?:_?0){6,}n\b/, "a decimal bigint scale (÷ 10^6 or larger) — a base-unit projection"],
  // NOT `.toFixed(` on its own: it is overwhelmingly percentages, basis points and
  // SVG coordinates. Reaching a token amount with toFixed requires narrowing base
  // units to a float FIRST, which the rules above already catch at the narrowing.
] as const;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(SRC, p).split("\\").join("/");

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};

const files = walk(SRC);

// ── ① ONE TRUNCATION, defined once, in the canon module ─────────────────────
const DEF_RE = /(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s+truncateToDisplayUnits\b|const\s+truncateToDisplayUnits\s*=)/;
const defs = files.filter((f) => DEF_RE.test(readFileSync(f, "utf8"))).map(rel);
if (defs.length === 0) fail(`truncateToDisplayUnits is defined NOWHERE — the one authority has gone missing (expected ${CANON}).`);
else if (defs.length > 1) fail(`truncateToDisplayUnits is defined ${defs.length} times (${defs.join(", ")}) — the figure has FORKED.`);
else if (defs[0] !== CANON) fail(`truncateToDisplayUnits is defined in ${defs[0]}; it belongs in ${CANON} and nowhere else.`);

// ── ② no unlisted second projection anywhere in src ─────────────────────────
let projectionSites = 0;
for (const file of files) {
  const r = rel(file);
  const text = readFileSync(file, "utf8");
  text.split("\n").forEach((ln, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(ln)) return; // comments are not code
    for (const [re, why] of PROJECTION) {
      if (!re.test(ln)) continue;
      projectionSites += 1;
      if (r in ALLOWLIST) return;
      fail(
        `${r}:${i + 1} — ${why}. A displayed token amount must come from ${CANON} ` +
          `(formatAmount / formatBaseUnits). If this is a USD valuation, a percentage or exact ` +
          `rendering, add the file to this guard's ALLOWLIST with a written reason.`,
      );
      return;
    }
  });
}

// ── ③ BEHAVIOUR — the real module against real values ───────────────────────
const m = (await import(pathToFileURL(join(SRC, "lib", "amountFormat.ts")).href)) as Record<string, Function>;
const rawMod = (await import(pathToFileURL(join(SRC, "lib", "rawUnits.ts")).href)) as Record<string, Function>;

// The vault's real holdings on 2026-07-26 — the values that exposed the fork.
// Half-up answers 0.026552 / 4.5399 and would OVERSTATE what the vault holds.
const CASES: [string, unknown, unknown][] = [
  ["vault WETH.e (18,6) truncates", m.formatBaseUnits("26551703798238159", 18, 6), "0.026551"],
  ["the swap's AVAX (18,4) truncates", m.formatBaseUnits("4539867625602041000", 18, 4), "4.5398"],
  ["vault USDC (6,2) truncates", m.formatBaseUnits("16475000", 6, 2), "16.47"],
  ["BTC.b at full precision", m.formatBaseUnits("77818", 8, 8), "0.00077818"],
  ["thousands are localized", m.formatBaseUnits("6989000000000000000000000", 18, 0), "6,989,000"],
  ["floor: real dust never reads zero", m.formatAmount("1", 18, 6), "< 0.000001"],
  ["floor: a sub-1 SYN burn", m.formatAmount("900000000000000000", 18, 0), "< 1"],
  ["a true zero stays zero", m.formatAmount("0", 18, 6), "0.000000"],
  ["malformed fails closed", m.formatBaseUnits("12x", 18, 6), null],
  ["sum is exact", m.sumRawUnits(["16475000", "20925000", "25500000"]), "62900000"],
  ["a missing leg voids the sum", m.sumRawUnits(["16475000", null]), null],
  // Live 2026-07-26: the pair holds 55.7842 USDC and the protocol's liquidity
  // wallet holds 76.612% of the LP supply → 42.737261 USDC, exact integer maths.
  ["pool share is integer maths", m.rawShare("55784200", "296023740620949", "386394614171674"), "42737261"],
  ["a zero denominator fails closed", m.rawShare("1", "1", "0"), null],
  // the member-money defect this slice closed
  ["member wallet: 0.004 SYN is not zero", rawMod.formatRawUnitsDisplay("4000000000000000", 18, 2), "< 0.01"],
  ["member wallet: 0.004 USDC is not zero", rawMod.formatRawUnitsDisplay("4000", 6, 2), "< 0.01"],
  ["member wallet keeps its trimmed style", rawMod.formatRawUnitsDisplay("50000000", 6, 2), "50"],
  ["member wallet still floors", rawMod.formatRawUnitsDisplay("2998916", 6, 2), "2.99"],
];
for (const [label, got, want] of CASES) {
  if (got !== want) fail(`behaviour — ${label}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}.`);
}

// ── ④ the three money surfaces agree on (decimals, dp) per token ────────────
// The feed's token map, the /contracts assets card and the public home's tracked-asset
// registry all render the SAME vault holdings. A precision fork between them is the
// defect wearing another face.
const feed = readFileSync(join(SRC, "lib", "backboneFeedClient.ts"), "utf8");
const card = readFileSync(join(SRC, "components", "ProtocolAssetsCard.tsx"), "utf8");
const registry = readFileSync(join(SRC, "config", "trackedAssets.ts"), "utf8");

const PINS = [
  { token: "USDC", feedKey: "USDC", cardVar: "vaultUsdc", regSymbol: "USDC", decimals: 6, dp: 2 },
  { token: "BTC.b", feedKey: '"BTC.b"', cardVar: "vaultBtcb", regSymbol: "BTC", decimals: 8, dp: 8 },
  { token: "WETH.e", feedKey: '"WETH.e"', cardVar: "vaultWeth", regSymbol: "ETH", decimals: 18, dp: 6 },
];
for (const p of PINS) {
  const want = `${p.decimals},${p.dp}`;
  const f = new RegExp(`${p.feedKey.replace(".", "\\.")}\\s*:\\s*\\{\\s*decimals:\\s*(\\d+),\\s*dp:\\s*(\\d+)`).exec(feed);
  const c = new RegExp(`${p.cardVar}\\s*=\\s*fmtAmount\\([^,]+,\\s*(\\d+),\\s*(\\d+)\\)`).exec(card);
  // The USDC entry's balanceIds array is long and commented, so the window is
  // generous; `dp` must still follow `decimals` closely within the same entry.
  const g = new RegExp(`symbol:\\s*"${p.regSymbol}"[\\s\\S]{0,1200}?decimals:\\s*(\\d+),[\\s\\S]{0,120}?dp:\\s*(\\d+)`).exec(registry);
  // A pin that cannot be READ is a FAILURE, never a silent pass.
  if (!f) { fail(`${p.token}: not found in the feed's token map (lib/backboneFeedClient.ts) — the pin cannot be checked.`); continue; }
  if (!c) { fail(`${p.token}: ${p.cardVar} not found as an fmtAmount(…) call in ProtocolAssetsCard.tsx — the pin cannot be checked.`); continue; }
  if (!g) { fail(`${p.token}: "${p.regSymbol}" not found with decimals+dp in config/trackedAssets.ts — the pin cannot be checked.`); continue; }
  const got = { feed: `${f[1]},${f[2]}`, card: `${c[1]},${c[2]}`, home: `${g[1]},${g[2]}` };
  if (got.feed !== want || got.card !== want || got.home !== want) {
    fail(
      `${p.token} precision has FORKED — /activity (${got.feed}) · /contracts (${got.card}) · home band (${got.home}), ` +
        `pinned at (${want}). Three public surfaces would print the same holding differently.`,
    );
  }
}

// ── ⑤ the authority is actually USED on every money surface ─────────────────
// ② proves no SECOND authority exists; the allowlist necessarily opens a door in
// the four files that legitimately hold float valuation maths. These positive
// pins close it: each money surface must be seen CALLING the canon module for
// its token amount, so a regression inside an allowlisted file still goes red.
const USES: [string, RegExp, string][] = [
  ["components/ProtocolReservesBand.tsx", /formatAmount\(\s*r\.amtRaw\s*,\s*r\.decimals\s*,\s*r\.dp\s*\)/, "the public home band must render each row's amount through formatAmount on RAW base units"],
  ["components/ProtocolReservesBand.tsx", /sumRawUnits\(\s*legs\s*\)/, "the band must sum its legs in raw base units, never as floats"],
  ["components/ProtocolReservesBand.tsx", /rawShare\(\s*poolUsdcRaw/, "the pool share must be exact integer maths, never a float ratio"],
  ["components/ProtocolAssetsCard.tsx", /import\s*\{\s*formatAmount as fmtAmount\s*\}\s*from\s*"@\/lib\/amountFormat"/, "the /contracts card must alias the canon formatter, never define its own"],
  ["lib/backboneFeedClient.ts", /return formatAmount\(amountRaw, spec\.decimals, spec\.dp\)/, "the feed's treasury amounts must come from the canon formatter"],
  ["lib/rawUnits.ts", /truncateToDisplayUnits\(raw, decimals, display\)/, "the member wallet / checkout renderer must borrow the canon truncation"],
  ["lib/rawUnits.ts", /dustFloorText\(clampDisplay\(decimals, display\)\)/, "the member wallet renderer must carry the false-zero floor"],
  ["lib/activityFeed.ts", /formatAmount\(raw\.toString\(\), 18, 0\)/, "the window-scanned burn line must carry the floor too"],
  // Added 2026-07-26 with the second pass: the two dollar helpers the review
  // caught. Each renders many figures through ONE local helper, so pinning the
  // helper's call pins every figure it prints — and turns each file's allowlist
  // sentence from something to believe into something CHECKED.
  ["wallet/ownReads.ts", /const shown = formatAmount\(raw, 6, 2\);/, "the member surfaces' dollar helper (capital card, KPI footprint tile, attention lane, recent activity) must project with the canon formatter, never its own bigint scale"],
  ["pages/admin/memberLedger.tsx", /const shown = formatAmount\(raw, 6, 2\);/, "the founder's register renders six money figures through one helper; that helper must project with the canon formatter, never its own string slicing"],
];
for (const [file, re, why] of USES) {
  if (!re.test(readFileSync(join(SRC, file), "utf8"))) {
    fail(`${file} — expected call NOT FOUND: ${why}. Either the surface stopped using ${CANON}, or this pin needs updating in the same commit as the refactor.`);
  }
}

if (failures > 0) {
  console.error(`[guard:one-figure] ${failures} FAILURE(S). One truncation, one figure, never rounded up.`);
  process.exit(1);
}
// The PASS line states ONLY what ran. It used to say "N projection site(s) …
// all inside the allowlist", which reads as "src holds N projections" — a
// completeness §② does not have and cannot have (see THE HONEST LIMIT above).
// A guard that overstates its own coverage teaches the next session to trust it
// past its edge; that is how two rendered projections lived inside a green
// build on the morning of 2026-07-26.
console.log(
  `[guard:one-figure] PASS — one truncation in ${CANON}; ` +
    `${projectionSites} site(s) MATCHED by the ${PROJECTION.length} projection rules across ${files.length} files, ` +
    `each in a file the ${Object.keys(ALLOWLIST).length}-entry allowlist covers with a written reason ` +
    `(these rules match known idioms — a pass is not proof that no other projection exists); ` +
    `${CASES.length} behaviour cases green; ` +
    `${PINS.length} token precisions agreed across /activity, /contracts and the public home band; ` +
    `${USES.length} surfaces PROVEN to call the one authority.`,
);
