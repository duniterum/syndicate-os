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
 *  prose beside its import is exactly what this codebase should do more of.
 *
 *  STRING-AWARE since 2026-07-30 (adversarial review, confirmed 2/2): the old
 *  regex stripper ran on RAW source, so an in-string slash-star (the literal
 *  "/receipt/*" inside seo-route-registry.ts:373) opened a phantom comment
 *  that swallowed ~1,000 lines of REAL code — a silent false-negative hole in
 *  a BLOCKING guard. Ported from guard-touch-target's commentRanges: string
 *  literals are walked with escapes, so a slash-star inside a string never
 *  opens a range, and facts inside strings are preserved. Trailing `//`
 *  comments are now stripped too (the old line-anchored regex kept them).
 *  KNOWN SOFT SPOT, lenient direction: a regex literal spelling // or a
 *  slash-star outside a string can open a phantom range — misses, never
 *  invents. */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      const start = i;
      i += 1;
      while (i < src.length) {
        if (src[i] === "\\") i += 2;
        else if (src[i] === ch) {
          i += 1;
          break;
        } else i += 1;
      }
      out += src.slice(start, i);
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl < 0 ? src.length : nl;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const close = src.indexOf("*/", i + 2);
      i = close < 0 ? src.length : close + 2;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
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
 * ratchet"), then HARDENED the same day (adversarial review, confirmed 2/2):
 * a COUNT pin let a pinned fact MIGRATE — delete one copy, paste the fact
 * into a brand-new file in the same commit, size stays equal, green. So each
 * entry now pins the exact FILE SET of its duplication: ANY membership change
 * (spread, shrink, migration) is a RED build, and a stale entry (no live
 * duplication) is RED too — a stale entry forgives the next reintroduction;
 * the touch guard's Button escape-hatch lesson, same day.
 *
 * The one duplication this arc itself introduced (the 87,157,852 scan floor)
 * was FIXED rather than listed: it is now `PROTOCOL_SCAN_FLOOR_BLOCK`, declared
 * once and imported.
 */
// File sets measured 2026-07-30 by this guard's own RED run — never estimated.
const DEBT: Readonly<Record<string, readonly string[]>> = {
  "contract/wallet address::0x244531c571966f90f4849e03a507543d90f9c721": [
    "artifacts/api-server/src/data/protocolTargets.ts",
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0x3488857b003104e2b08a1d198f8a23bff28b0045": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0x03e99f09f0fc8d04864466bc37fd73dd7ba3c6d0": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0x3b1396b1ff61b79c742751cfb6f0f04eac25ec6a": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0x5734c19d1907857d1e54f95d12300e2fc7b0c2cd": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0x8deb56b4db62f48a6e1bc226220e24845b592cb9": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0x3ff01a0c3e70101bfb1dbb3742e135e7ed9e894f": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "contract/wallet address::0xab87e74ff69ee0b6c1a73b884a80b737988de081": [
    "artifacts/api-server/src/lib/protocol/historicalFreezeWallets.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  "http endpoint::https://api.avax.network/ext/bc/c/rpc": [
    "artifacts/api-server/src/lib/protocol/rpcTransport.ts",
    "artifacts/studio/src/lib/chainReads.ts",
  ],
  "http endpoint::https://avalanche-c-chain-rpc.publicnode.com": [
    "artifacts/api-server/src/lib/protocol/rpcTransport.ts",
    "artifacts/studio/src/lib/chainReads.ts",
  ],
  "http endpoint::https://thesyndicate.money/opengraph.jpg": [
    "artifacts/api-server/src/routes/joinCard.ts",
    "artifacts/api-server/src/routes/receiptCard.ts",
  ],
  // "join?source=" DEBT entry DELETED 2026-07-30 (footer audit): the five
  // hand-assembled copies in this entry were PAID BY IMPORT (buildJoinLink,
  // studio lib/joinLink.ts, canonical origin from the SEO registry);
  // /source's window.location.origin variant died with them. ⛔ The first
  // version of this comment said "every share surface now calls buildJoinLink"
  // — the adversarial review (confirmed 2/2) found a SIXTH survivor this
  // entry never covered (ProposeSourceCreate — a template split invisible to
  // the fact regex, this guard's own documented truncation gap). That one is
  // paid too, and the fact's protection now lives STRUCTURALLY in the studio
  // guard-surface-coverage join-link sweep: constructing `/join?source=${`
  // anywhere but lib/joinLink.ts is a RED build — single-occurrence copies
  // included, which this guard's 2+-files rule can never see.
  "http endpoint::https://thesyndicate.money/receipt/$": [
    "artifacts/studio/src/components/referral/ReferralCommissionsPanel.tsx",
    "artifacts/studio/src/components/referral/ReferralToolsPanel.tsx",
    "artifacts/studio/src/wallet/ReceiptTicket.tsx",
  ],
  "http endpoint::http://www.w3.org/2000/svg": [
    "artifacts/studio/src/components/referral/ReferralToolsPanel.tsx",
    "artifacts/studio/src/components/referral/referrerKit.tsx",
  ],
  "pinned numeric literal::86_400_000": [
    "artifacts/api-server/src/operator/memberLedgerService.ts",
    "artifacts/studio/src/components/activity/LiveActivityFeed.tsx",
  ],
  // The four below entered with the 2026-07-30 pattern widening — each REVIEWED,
  // not merely counted:
  // · V3 historical-member root: the server's expectation AND the client's own
  //   verification pin. The client cannot import the server, and the whole point
  //   of the client pin is INDEPENDENT verification of the same chain fact.
  "32-byte topic/hash::0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329": [
    "artifacts/api-server/src/data/partBExpectations.ts",
    "artifacts/studio/src/lib/historicalMembers.ts",
  ],
  // · MembershipPurchasedV3 topic0: server decoder + the client decoding the
  //   same public log independently (an explorer does not import the server).
  "32-byte topic/hash::0x4ae1104be21836909353b0af3cd82a339d2ac380eda00ad26313d8fce198c1bf": [
    "artifacts/api-server/src/lib/protocol/saleEventDecoders.ts",
    "artifacts/studio/src/lib/activityFeed.ts",
  ],
  // · USDC base units: ONE declaration per artifact (financialDecoders ·
  //   rawUnits) — client and server cannot import each other.
  "pinned numeric literal::1_000_000n": [
    "artifacts/api-server/src/lib/protocol/financialDecoders.ts",
    "artifacts/studio/src/lib/rawUnits.ts",
  ],
  // · Same NUMERAL, unrelated facts: three milestone TARGETS (1M seats · $1M ·
  //   1M SYN, intra-file) · the explorer index page base · a millions display
  //   divisor. Not one fact — one import would COUPLE unrelated decisions.
  //   AMENDED 2026-08-03 (M3, founder GO): studio lib/chapters.ts joins as
  //   STORY_FINAL_SEAT — the studio's ONE declaration of the story-final-seat
  //   fact (the cross-artifact twin of milestoneReadmodel's seats-1000000
  //   target; client and server cannot import each other — the USDC-base
  //   pattern above). SeatFlowDiagram's copy stays the UNRELATED USDC display
  //   divisor; studio code needing the story fact imports chapters.ts.
  //   AMENDED AGAIN 2026-08-03 (K1.7, founder GO « je veux chaque image »): the
  //   server's lib/protocol/chapters.ts joins as STORY_FINAL_SEAT, the DECLARED
  //   MIRROR of the studio line blessed above. Reason for the spread, stated:
  //   the join-card painter needs the story-final seat to write the collectible
  //   preview's seniority sentence, and importing it from milestoneReadmodel
  //   would drag the BACKBONE into the share-card zone — a read-model pulled in
  //   to paint a picture. It goes beside the chapter table it belongs to, in
  //   the file that is ALREADY the studio table's declared twin, and
  //   backbone.guard now reconciles the constant across the two artifacts by
  //   VALUE (not just the five chapter rows) — so this pair cannot drift.
  "pinned numeric literal::1_000_000": [
    "artifacts/api-server/src/backbone/milestoneReadmodel.ts",
    "artifacts/api-server/src/backbone/nativeAvaxScan.ts",
    "artifacts/api-server/src/lib/protocol/chapters.ts",
    "artifacts/studio/src/components/hero/SeatFlowDiagram.tsx",
    "artifacts/studio/src/lib/chapters.ts",
  ],
};

let duplicated = 0;
let forgiven = 0;
for (const [key, entry] of sites) {
  if (entry.files.size < 2) continue;
  duplicated += 1;
  const pinnedSet = DEBT[key];
  if (pinnedSet !== undefined) {
    forgiven += 1;
    const actual = [...entry.files].sort();
    const same =
      actual.length === pinnedSet.length && actual.every((f, idx) => f === pinnedSet[idx]);
    if (!same) {
      fail(
        `${entry.kind} "${entry.fact}" MOVED: its DEBT pin names [${pinnedSet.join(", ")}] but it now ` +
          `lives in [${actual.join(", ")}]. A DEBT entry blesses ONE reviewed set of files — a new copy, ` +
          `a migration into a different file, or a payment all change the set and must change the pin ` +
          `IN THE SAME COMMIT, with the reason (spread is never re-blessed silently).`,
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
    `pinned to its exact FILE SET (any membership change — spread, shrink, migration — and staleness are all RED). ` +
    `A NEW duplication is a red build. ` +
    `NOT CHECKED: duplicated LOGIC (two functions computing one answer), a fact re-expressed in another ` +
    `form (a decimal beside a hex), and the ${ALLOWED_DIRS.length} allowlisted canon directories.`,
);
