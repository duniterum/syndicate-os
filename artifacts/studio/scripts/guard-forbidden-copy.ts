// Guard: forbidden financial framing.
// Scans the studio app source (src/**) for banned financial-upside language.
// The product doctrine forbids framing SYN / membership as an investment.
//
// Exclusions:
//   - scripts/ (this file holds the banned list; it lives outside src/).
//   - src/config/routeMemory.ts (Phase-0 classification memory that names
//     rejected unsafe framings by category, not as rendered copy).
//
// Node-loadable (Node >= 22.6 / 24), dependency-free.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const EXCLUDE = new Set([path.resolve(srcDir, "config", "routeMemory.ts")]);

// Multi-word phrases: matched as case-insensitive substrings.
const PHRASES = [
  "passive income",
  "liquidity mining",
  "airdrop farming",
  "yield farming",
  "high yield",
  "win big",
  "reward pool",
  "earn rewards",
  "claim rewards",
  "guaranteed benefit",
  "guaranteed return",
  "financial return",
  // Slice 2.1 (first big public-copy page) — extend the financial-framing ban.
  "governance weight",
];
// Single words: matched on word boundaries (bare "return"/"reward" are allowed).
// All terms below are negation-aware (isNegated exempts honest disclaimers like
// "not an investment", "not equity", "not donations"). NOTE (repo wins, flagged):
// "contribution" and "package" are DELIBERATELY NOT banned — both appear in live
// approved/internal copy ("routed contribution", admin "package" copy + comments);
// banning them here would fail the guard on unrelated files. Revisit "package"
// when the admin/entry-tier surfaces are built.
const WORDS = [
  "jackpot", "wager", "betting", "payout", "profit", "yield", "airdrop", "farming",
  // Slice 2.1 additions (safe set — absent from src, or only in negated disclaimers):
  "invest", "invests", "investing", "investment", "investments", "investor", "investors",
  "donation", "donations", "dividend", "dividends", "equity",
  "apy", "apr", "roi", "pump", "100x",
  // NOT added (repo wins, flagged): "moon" (the lucide <Moon/> theme icon) and
  // "raised" ("Raised class" = a referral tier name) are legitimate existing copy.
];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// Global matchers so each hit's position is available (for negation-awareness).
const matchers: { term: string; re: RegExp }[] = [
  ...PHRASES.map((p) => ({ term: p, re: new RegExp(escapeRe(p), "gi") })),
  ...WORDS.map((w) => ({ term: w, re: new RegExp(`\\b${escapeRe(w)}\\b`, "gi") })),
];

// Negative-disclaimer awareness (founder directive, 2026-07-07).
// Doctrine BLOCKS positive financial-upside claims but MUST ALLOW honest
// negative disclaimers — e.g. "Referral commissions are not passive income,
// not token yield, and not a profit promise." A banned term is EXEMPT only when
// an explicit negation immediately governs it within the SAME clause (short
// window, no sentence break). "earn passive income" stays blocked; "not passive
// income" passes. Window chars exclude . ; : ! ? so a negation in an earlier
// clause never licenses a later positive claim.
const NEGATION_BEFORE =
  /\b(no|not|never|without|nor|neither|non|isn'?t|aren'?t|won'?t|don'?t|doesn'?t|cannot|can'?t|free of|rather than)\b[\s\w,'"()-]{0,28}$/i;
function isNegated(before: string): boolean {
  return NEGATION_BEFORE.test(before);
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (statSync(fp).isDirectory()) out.push(...walk(fp));
    else if (/\.(ts|tsx)$/.test(name)) out.push(fp);
  }
  return out;
}

const errors: string[] = [];
let scanned = 0;
for (const fp of walk(srcDir)) {
  if (EXCLUDE.has(fp)) continue;
  scanned++;
  const lines = readFileSync(fp, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { term, re } of matchers) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        const before = line.slice(0, m.index ?? 0);
        if (isNegated(before)) continue; // honest negative disclaimer — allowed
        errors.push(
          `${path.relative(srcDir, fp)}:${i + 1} forbidden framing "${term}" \u2014 ${line.trim().slice(0, 100)}`,
        );
      }
    }
  });
}

console.log(`[guard:copy] scanned ${scanned} source file(s).`);
if (errors.length) {
  console.error(`[guard:copy] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(`[guard:copy] PASS \u2014 no forbidden financial framing in studio src.`);
