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
 *
 * SHAPES STILL OPEN after the 2026-07-30 widening — declared with their live
 * instances so the next slice starts from evidence, not a re-survey:
 *   · plain-digit numerics: chain id 43114 sits in ~25 non-allowlisted files;
 *     the freeze block 88496414 in 3. Closing this = import the constant at
 *     every site — a mass refactor, its own slice, not a regex tweak.
 *   · decimal figures ("4.5398", "3.325" — the named check-③ family).
 *   · template-literal URLs: the match truncates at `${`, so a template site
 *     and a literal site of the SAME URL never collide.
 *   · one fact in two FORMATS: `87157852` (plain, inside the frozen referral
 *     snapshot — correct there: a sealed measurement pins its values) vs
 *     `87_157_852` (the live constant). The key is the raw text.
 *   · INTRA-file repeats (files.size < 2 never flags — the "six times in one
 *     file" shape; protocolTargets' 17 were paid by import on 2026-07-30).
 *   · the allowlist asymmetry: a canon fact copied into exactly ONE non-canon
 *     file stays invisible (canon files are dropped before counting).
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

/**
 * A fact worth pinning, and the shape that identifies it.
 *
 * WIDENED 2026-07-30 (the 2nd adversarial pass: "the regex misses literal
 * shapes", each proven with a live instance before widening):
 *   · numerics: `\d{2,3}` required TWO leading digits, so `1_000_000` escaped
 *     (live in 3 files across BOTH artifacts); a BigInt `n` suffix defeated the
 *     trailing `\b`, so `87_703_847n` escaped. Now `\d{1,3}` + optional `n`.
 *   · 4-byte selectors (`0x` + 8 hex): no pattern at all — `0x95d89b41` and
 *     `0x313ce567` each lived in tokenDiscoveryScan AND erc20Decoders, and
 *     `0x11aee380`'s own trailing comment NAMED its twin in financialDecoders.
 *   · 32-byte topics/hashes (`0x` + 64 hex): no pattern — the ERC-20 Transfer
 *     topic lived in protocolEventScan AND tokenDiscoveryScan.
 *   · wss:// endpoints: the scheme was hardcoded `https?`.
 * The hex lengths are exact (8 · 40 · 64) and `\b` keeps them disjoint: a
 * 40-hex address can never half-match the 8-hex or 64-hex shape.
 */
const FACT_PATTERNS: readonly { name: string; re: RegExp; minLen: number }[] = [
  { name: "contract/wallet address", re: /0x[0-9a-fA-F]{40}\b/g, minLen: 42 },
  { name: "4-byte selector", re: /0x[0-9a-fA-F]{8}\b/g, minLen: 10 },
  { name: "32-byte topic/hash", re: /0x[0-9a-fA-F]{64}\b/g, minLen: 66 },
  { name: "http endpoint", re: /(?:https?|wss):\/\/[a-zA-Z0-9._~:/?#@!$&'()*+,;=%-]{12,}/g, minLen: 20 },
  { name: "pinned numeric literal", re: /\b\d{1,3}(?:_\d{3}){2,}n?\b/g, minLen: 9 },
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
 * RATCHETED 2026-07-30 (the 2nd adversarial pass's finding: "DEBT has no
 * ratchet"). Each entry now pins the EXACT file count of its duplication, and
 * every direction of movement is a RED build: the fact spreading into one more
 * file · the duplication shrinking (lower the pin in the same commit) · the
 * entry going stale (delete it — a stale entry forgives the next
 * reintroduction; the touch guard's Button escape-hatch lesson, same day).
 * Before this, appending a 16th entry — or a DEBT fact spreading into ten more
 * files — was a green build.
 *
 * The one duplication this arc itself introduced (the 87,157,852 scan floor)
 * was FIXED rather than listed: it is now `PROTOCOL_SCAN_FLOOR_BLOCK`, declared
 * once and imported.
 */
// Counts measured 2026-07-30 by this guard's own RED run — never estimated.
const DEBT: Readonly<Record<string, number>> = {
  "contract/wallet address::0x244531c571966f90f4849e03a507543d90f9c721": 3,
  "contract/wallet address::0x3488857b003104e2b08a1d198f8a23bff28b0045": 2,
  "contract/wallet address::0x03e99f09f0fc8d04864466bc37fd73dd7ba3c6d0": 2,
  "contract/wallet address::0x3b1396b1ff61b79c742751cfb6f0f04eac25ec6a": 2,
  "contract/wallet address::0x5734c19d1907857d1e54f95d12300e2fc7b0c2cd": 2,
  "contract/wallet address::0x8deb56b4db62f48a6e1bc226220e24845b592cb9": 2,
  "contract/wallet address::0x3ff01a0c3e70101bfb1dbb3742e135e7ed9e894f": 2,
  "contract/wallet address::0xab87e74ff69ee0b6c1a73b884a80b737988de081": 2,
  "http endpoint::https://api.avax.network/ext/bc/c/rpc": 2,
  "http endpoint::https://avalanche-c-chain-rpc.publicnode.com": 2,
  "http endpoint::https://thesyndicate.money/opengraph.jpg": 2,
  "http endpoint::https://thesyndicate.money/join?source=$": 5,
  "http endpoint::https://thesyndicate.money/receipt/$": 3,
  "http endpoint::http://www.w3.org/2000/svg": 2,
  "pinned numeric literal::86_400_000": 2,
  // The four below entered with the 2026-07-30 pattern widening — each REVIEWED,
  // not merely counted:
  // · V3 historical-member root: the server's expectation AND the client's own
  //   verification pin. The client cannot import the server, and the whole point
  //   of the client pin is INDEPENDENT verification of the same chain fact.
  "32-byte topic/hash::0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329": 2,
  // · MembershipPurchasedV3 topic0: server decoder + the client decoding the
  //   same public log independently (an explorer does not import the server).
  "32-byte topic/hash::0x4ae1104be21836909353b0af3cd82a339d2ac380eda00ad26313d8fce198c1bf": 2,
  // · USDC base units: ONE declaration per artifact (financialDecoders ·
  //   rawUnits) — client and server cannot import each other.
  "pinned numeric literal::1_000_000n": 2,
  // · Same NUMERAL, unrelated facts: three milestone TARGETS (1M seats · $1M ·
  //   1M SYN, intra-file) · the explorer index page base · a millions display
  //   divisor. Not one fact — one import would COUPLE unrelated decisions.
  "pinned numeric literal::1_000_000": 3,
};

let duplicated = 0;
let forgiven = 0;
for (const [key, entry] of sites) {
  if (entry.files.size < 2) continue;
  duplicated += 1;
  const ceiling = DEBT[key];
  if (ceiling !== undefined) {
    forgiven += 1;
    if (entry.files.size > ceiling) {
      fail(
        `${entry.kind} "${entry.fact}" SPREAD: its DEBT pin says ${ceiling} file(s), it is now in ` +
          `${entry.files.size} — [${[...entry.files].join(", ")}]. A DEBT entry is a counted stain, ` +
          `not a license to copy. Remove the new copy (import the fact) — raising the pin needs a ` +
          `written reason.`,
      );
    } else if (entry.files.size < ceiling) {
      fail(
        `${entry.kind} "${entry.fact}" shrank: pinned at ${ceiling} file(s), now ${entry.files.size}. ` +
          `Good — lower the pin to ${entry.files.size} in this same commit so the payment cannot be ` +
          `silently undone.`,
      );
    }
    continue;
  }
  fail(
    `${entry.kind} "${entry.fact}" is declared in ${entry.files.size} files — ` +
      `[${[...entry.files].join(", ")}]. ONE FACT, ONE PLACE: declare it once and import it. ` +
      `Two copies of one fact always drift; the only question is when. ` +
      `(If this repeat is genuinely correct, add it to DEBT with the reason — never silently.)`,
  );
}

// A DEBT key that no longer marks a live duplication is a FOSSIL: it would
// silently forgive the fact being duplicated AGAIN later. Delete it the moment
// the duplication is paid.
for (const key of Object.keys(DEBT)) {
  const entry = sites.get(key);
  if (entry === undefined || entry.files.size < 2) {
    fail(
      `DEBT entry "${key}" is STALE — that fact is no longer duplicated anywhere. DELETE the entry ` +
        `in this same commit; a stale entry is a pre-armed pardon for the next reintroduction.`,
    );
  }
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
    `${duplicated} duplicated, all ${forgiven} inside the ${Object.keys(DEBT).length}-entry DEBT list, each ` +
    `pinned to its exact file count (spread, shrink and staleness are all RED). A NEW duplication is a red build. ` +
    `NOT CHECKED: duplicated LOGIC (two functions computing one answer), a fact re-expressed in another ` +
    `form (a decimal beside a hex), and the ${ALLOWED_DIRS.length} allowlisted canon directories.`,
);
