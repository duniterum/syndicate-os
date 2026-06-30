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
];
// Single words: matched on word boundaries (bare "return"/"reward" are allowed).
const WORDS = ["jackpot", "wager", "betting", "payout", "profit", "yield", "airdrop", "farming"];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const matchers: { term: string; re: RegExp }[] = [
  ...PHRASES.map((p) => ({ term: p, re: new RegExp(escapeRe(p), "i") })),
  ...WORDS.map((w) => ({ term: w, re: new RegExp(`\\b${escapeRe(w)}\\b`, "i") })),
];

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
      if (re.test(line)) {
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
