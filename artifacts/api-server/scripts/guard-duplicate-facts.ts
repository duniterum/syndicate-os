/**
 * GUARD — ONE FACT, ONE PLACE. (Founder ruling, 2026-07-27.)
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS, and it is not a style rule.
 *
 * On 2026-07-27 five adversarial review rounds confirmed 32 defects in one day's
 * work. Nearly all of them were ONE disease with six faces: a decision written in
 * two places, which then diverged.
 *   · the seat key had an `n:` space and a `w:` space for one seat
 *   · the LP-pair exclusion list was assembled privately inside the runner
 *   · a cursor-hold's admission test disagreed with its own builder's
 *   · the tail phase got a hold; the asked-history phase did not
 *   · that hold then covered ONE of the three drop paths its own commit named
 *   · the explorer's base URL was declared in two lane files
 *   · the AVAX purchase figure was written six times, and wrong in all six
 *
 * The founder's verdict on the proposed remedy — a new written law — was exact:
 * *"même en faisant ainsi tu fais encore des erreurs car tu ne les relis pas
 * quand tu travailles."* A rule I am supposed to REMEMBER is a rule I break at
 * the moment writing a second copy feels faster. So this is a rule that RUNS.
 *
 * WHAT IT CATCHES: a FACT — a contract address, an endpoint, a large pinned
 * block/amount literal — appearing verbatim in more than one source file. Those
 * are the things that must be declared once and imported.
 *
 * WHAT IT DOES NOT CATCH, stated so nobody reads a PASS as more than it is:
 * duplicated LOGIC (two functions computing one answer), a fact re-expressed in
 * a different form (a decimal beside a hex), or anything inside the allowlist.
 * It closes the cheapest and most common door, not every door.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..", "..");

const ROOTS = [
  path.join(repo, "artifacts", "api-server", "src"),
  path.join(repo, "artifacts", "studio", "src"),
];

/**
 * ALLOWLIST — each entry carries the reason it is legitimate, not merely known.
 * A file here is one where a repeat is CORRECT: canon registries that are the
 * source of a fact, and guards that deliberately recompute a value from scratch
 * so their check is independent of the code under test.
 */
const ALLOWED_DIRS: readonly { frag: string; why: string }[] = [
  { frag: `${path.sep}canon${path.sep}`, why: "the vendored canon registries ARE the source of these facts" },
  { frag: `${path.sep}config${path.sep}`, why: "client-side canon registries (tracked assets, deployment registry, chronicle)" },
];

/** A fact worth pinning, and the shape that identifies it. */
const FACT_PATTERNS: readonly { name: string; re: RegExp; minLen: number }[] = [
  { name: "contract/wallet address", re: /0x[0-9a-fA-F]{40}\b/g, minLen: 42 },
  { name: "http endpoint", re: /https?:\/\/[a-zA-Z0-9._~:/?#@!$&'()*+,;=%-]{12,}/g, minLen: 20 },
  { name: "pinned numeric literal", re: /\b\d{2,3}(?:_\d{3}){2,}\b/g, minLen: 9 },
];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const name of readdirSync(d)) {
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) {
        if (name === "node_modules" || name === "dist") continue;
        walk(p);
        continue;
      }
      if (/\.(ts|tsx)$/.test(name)) out.push(p);
    }
  };
  walk(dir);
  return out;
}

/** Comments are documentation, not a second declaration — a fact explained in
 *  prose beside its import is exactly what this codebase should do more of. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

let failures = 0;
const fail = (msg: string): void => {
  failures += 1;
  console.error(`  ✗ ${msg}`);
};

const files = ROOTS.flatMap(sourceFiles);
const allowed = (f: string): string | null =>
  ALLOWED_DIRS.find((a) => f.includes(a.frag))?.why ?? null;

// fact → the files that DECLARE it (comments excluded)
const sites = new Map<string, { fact: string; kind: string; files: Set<string> }>();

for (const file of files) {
  if (allowed(file) !== null) continue;
  const src = stripComments(readFileSync(file, "utf8"));
  for (const { name, re, minLen } of FACT_PATTERNS) {
    for (const m of src.matchAll(re)) {
      const fact = m[0];
      if (fact.length < minLen) continue;
      const key = `${name}::${fact.toLowerCase()}`;
      const entry = sites.get(key) ?? { fact, kind: name, files: new Set<string>() };
      entry.files.add(path.relative(repo, file).replace(/\\/g, "/"));
      sites.set(key, entry);
    }
  }
}

/**
 * THE DEBT LIST — every duplication that already existed when this guard was
 * written (2026-07-27), recorded so the number can only SHRINK. It is not
 * forgiveness: each entry is a real duplicated fact and a real future drift.
 * A NEW duplication is a RED BUILD, which is the whole point — the rule now
 * runs instead of waiting to be remembered.
 *
 * The one duplication this arc itself introduced (the 87,157,852 scan floor)
 * was FIXED rather than listed: it is now `PROTOCOL_SCAN_FLOOR_BLOCK`, declared
 * once and imported.
 */
const DEBT: readonly string[] = [
  "contract/wallet address::0x244531c571966f90f4849e03a507543d90f9c721",
  "contract/wallet address::0x3488857b003104e2b08a1d198f8a23bff28b0045",
  "contract/wallet address::0x03e99f09f0fc8d04864466bc37fd73dd7ba3c6d0",
  "contract/wallet address::0x3b1396b1ff61b79c742751cfb6f0f04eac25ec6a",
  "contract/wallet address::0x5734c19d1907857d1e54f95d12300e2fc7b0c2cd",
  "contract/wallet address::0x8deb56b4db62f48a6e1bc226220e24845b592cb9",
  "contract/wallet address::0x3ff01a0c3e70101bfb1dbb3742e135e7ed9e894f",
  "contract/wallet address::0xab87e74ff69ee0b6c1a73b884a80b737988de081",
  "http endpoint::https://api.avax.network/ext/bc/c/rpc",
  "http endpoint::https://avalanche-c-chain-rpc.publicnode.com",
  "http endpoint::https://thesyndicate.money/opengraph.jpg",
  "http endpoint::https://thesyndicate.money/join?source=$",
  "http endpoint::https://thesyndicate.money/receipt/$",
  "http endpoint::http://www.w3.org/2000/svg",
  "pinned numeric literal::86_400_000",
];

let duplicated = 0;
let forgiven = 0;
for (const [key, entry] of sites) {
  if (entry.files.size < 2) continue;
  duplicated += 1;
  if (DEBT.includes(key)) {
    forgiven += 1;
    continue;
  }
  fail(
    `${entry.kind} "${entry.fact}" is declared in ${entry.files.size} files — ` +
      `[${[...entry.files].join(", ")}]. ONE FACT, ONE PLACE: declare it once and import it. ` +
      `Two copies of one fact always drift; the only question is when. ` +
      `(If this repeat is genuinely correct, add it to DEBT with the reason — never silently.)`,
  );
}

if (failures > 0) {
  console.error(
    `\n[guard:duplicate-facts] ${failures} duplicated fact(s). ` +
      `This guard exists because a decision written twice diverged six times in one day.`,
  );
  process.exit(1);
}

console.log(
  `[guard:duplicate-facts] PASS — ${sites.size} distinct fact(s) across ${files.length} source file(s); ` +
    `${duplicated} duplicated, all ${forgiven} inside the ${DEBT.length}-entry DEBT list — the counter that can ` +
    `only shrink. A NEW duplication is a red build. ` +
    `NOT CHECKED: duplicated LOGIC (two functions computing one answer), a fact re-expressed in another ` +
    `form (a decimal beside a hex), and the ${ALLOWED_DIRS.length} allowlisted canon directories.`,
);
