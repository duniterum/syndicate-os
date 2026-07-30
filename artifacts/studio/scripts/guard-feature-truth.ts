// guard-feature-truth.ts — THE DONE-IS-DONE GUARD (founder law, 2026-07-19).
// ---------------------------------------------------------------------------
// Kills the fossil class structurally: a user-visible "coming later" claim on
// a capability that is LIVE. Born from the /member Settings row that kept
// saying "Coming later" for notifications a full day after they sealed live.
//
// THE CONTRACT:
//   1. `config/featureStatus.ts` is the ONE live-vs-future truth, in code.
//   2. Every `lifecycle="FUTURE"` site in studio src is PINNED below to a
//      feature key; its key MUST be "future" in the registry. Making a
//      feature live without clearing (or re-keying) its claim sites = RED.
//   3. The site inventory is EXACT both ways: an unpinned FUTURE claim (a
//      new "coming" promise nobody registered) = RED; a pinned site whose
//      file dropped the claim = RED (the pin is stale — clean it, dated).
//   4. The human words "Coming later" live ONLY in the truthStatus atom —
//      hardcoding them anywhere else bypasses the badge system = RED.
// Comment-stripped scans (a pin can never be satisfied — or tripped — by a
// comment). Run in the guards chain; red build, never a founder explanation.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

// ── The PINNED future-claim sites (file → feature keys, one per claim) ──────
// Adding a "coming" promise anywhere = add its pin here, dated, with its
// registry key. Removing/going-live = flip the registry key in the SAME
// commit; this guard then forces the claim sites clean.
const PINNED_CLAIM_SITES: Record<string, readonly string[]> = {
  "wallet/MemberSettings.tsx": [
    "avatarUpload",
    "aliasLayer",
    "languageChoice",
    "resetProfile",
  ],
  // S2b (2026-07-23): the /season page's pot card — the effort rail's frame,
  // FUTURE-badged until S3 funds it (no figure without its escrow proof).
  "pages/SeasonRanking.tsx": ["seasonBounty"],
  // S2c (2026-07-24): the home season band's pot frame (same law, same key)
  // and the register band's "Your standing" card (own-row highlight arrives
  // with the auth-zone wiring — nothing is promised live before it is).
  "components/season/HomeSeasonSection.tsx": ["seasonBounty"],
  "components/season/HomeRegisterBand.tsx": ["seasonOwnRow"],
  // S2d (2026-07-24): the member Season card's pot column — the same frame
  // law as every pot surface (no figure without its escrow proof).
  "wallet/SeasonStandingCard.tsx": ["seasonBounty"],
  // S2d: the separate cash rail's frame on Member Home (two-layer law).
  "components/season/EffortRewardCard.tsx": ["seasonBounty"],
  // S2-final (2026-07-24): the admin Seasons rail-2 head — the pot frame's
  // one badge (the funding panel arrives WITH the contract at S3).
  "pages/admin/SeasonsRails.tsx": ["seasonBounty"],
  "components/referral/ReferralLadderPanel.tsx": [
    "rateRaiseHistory",
    // Seasons arc 2026-07-23: the single seasonEngine key split into
    // seasonRanking/seasonQuests/seasonBounty (§0.14-E). S2b shipped the
    // ranking LIVE — this panel's remaining future claim is the effort
    // rail ("that rail arrives with its own slice") = seasonBounty.
    "seasonBounty",
  ],
  "components/referral/ReferralIntroductionsPanel.tsx": ["secondGeneration"],
  "components/referral/ReferralLinkPanel.tsx": ["aliasLayer"],
  // Footer audit 2026-07-30 — the OBJECT-LITERAL claim sites the widened
  // FUTURE_MARK now sees (they rendered through badge components and were
  // invisible to the attribute-only scan):
  // /recognition's "Standing over time" card — the one future badge on the page.
  "pages/Recognition.tsx": ["standingModel"],
  // /contracts memory: the Seat Record ERC-721 candidate row.
  "config/contractMemory.ts": ["seatRecord"],
  // /status surface map: three concept nodes. The acknowledgement-moments node
  // cites the indexer→bell rail key (an indexed milestone generating its own
  // notice IS that rail) — never a new twin key for the same capability.
  "config/protocolOsMap.ts": [
    "knowledgeOsGuided",
    "eventDerivedNotifications",
    "linkRegistry",
  ],
};

// ── §⑥ THE PROSE CLAIM SITES — the hole this guard shipped with ──────────────
// Sections 2-3 above can only see a `lifecycle="FUTURE"` BADGE. A future promise
// written as an ENGLISH SENTENCE was invisible to them, and the most public one
// we have proved it: /activity's methodology note told the world "what the
// indexer adds next" in prose. On 2026-07-26 two keys were registered for that
// sentence — and pinned to NOTHING, because no map like this existed; the guard
// stayed green at 598 checks while the sentence it was supposed to govern sat
// outside the mechanism entirely. A registry entry is not enforcement.
//
// Each entry pins a FILE to (a) the keys its prose cites and (b) a verbatim
// FRAGMENT of that prose. Both directions are checked: the key must be "future"
// (a live capability described as coming = the fossil), and the fragment must
// still be present (a stale pin outlives the copy it guarded = RED, clean it,
// dated). The fragment is what stops this from being a comment.
const PROSE_CLAIM_SITES: Record<
  string,
  { readonly keys: readonly string[]; readonly fragment: string }
> = {
  // /activity Z5 methodology note. It USED to open with "per-seat feeds" — a
  // capability that already SHIPS (`/member` serves a seat's own rows, each with
  // its verify anchor and its door into the live receipts binder), i.e. the exact
  // fossil the DONE-IS-DONE law exists to kill, standing on our most public feed.
  // Corrected 2026-07-26; the two survivors are genuinely unbuilt rails.
  "components/activity/LiveActivityFeed.tsx": {
    keys: ["eventDerivedNotifications", "chronicleCandidatePipeline"],
    fragment: "What the indexer adds next",
  },
  // /fire-ledger's closing card — the opt-in name layer for burners.
  "pages/FireLedger.tsx": {
    keys: ["aliasLayer"],
    fragment: "What arrives next",
  },
  // /archive's museum promise (footer audit 2026-07-30): THREE sentences on
  // one page say the gallery surface is still building — previously standing
  // entirely outside this mechanism, the exact hole this guard's own header
  // names. The day the gallery ships, flipping the key forces all three
  // sentences clean in the same commit.
  "pages/Archive.tsx": {
    keys: ["archiveGallery"],
    fragment: "the full gallery",
  },
  // Footer audit 2026-07-30 — the PROSE claims that stood outside the
  // mechanism on four more files:
  // /faq's corpus: the Signal Chamber, the Seat Record, institutional trust
  // capital, and "future identity and verification modules" (the seat-record +
  // alias identity layer).
  "content/faq-content.ts": {
    keys: ["signalChamber", "seatRecord", "trustCapital", "aliasLayer"],
    fragment: "A planned future module",
  },
  // /support: the page's own future heading…
  "pages/Support.tsx": {
    keys: ["supportIntake"],
    fragment: "What you'll be able to raise",
  },
  // …and the config file that carries all its preview copy.
  "config/supportIntake.ts": {
    keys: ["supportIntake"],
    fragment: "once support opens",
  },
  // /docs' Support card ("nothing is stored until intake is wired").
  "content/docs-content.ts": {
    keys: ["supportIntake"],
    fragment: "until intake is wired",
  },
  // /whitepaper §9-§10: "what is still ahead" names the standing model and
  // the season reward pot, and §10 tells the reader the module lists are
  // GUARDED — this pin is what makes that sentence true. The day either key
  // flips live, both sections must be rewritten in the same commit.
  "pages/Whitepaper.tsx": {
    keys: ["standingModel", "seasonBounty"],
    fragment: "the season reward pot",
  },
};

// ── §⑦ REGISTERED BUT CLAIMED NOWHERE ───────────────────────────────────────
// A future key that no surface cites is dead weight that reads as coverage: the
// next session finds it in the registry and assumes something guards it. Every
// future key must be cited by a badge pin or a prose pin — or be listed here,
// dated, with the reason it exists without a claim site.
const REGISTERED_WITHOUT_CLAIM: Record<string, string> = {
  notificationPreferences:
    "2026-07-19 · per-category preferences (v2). Registered when notifications sealed live; no surface promises it yet, so there is no copy to pin. Delete this entry the day a claim site appears — or the day the capability ships.",
};

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) yield* walk(abs);
    else if (/\.(ts|tsx)$/.test(name)) yield abs;
  }
}

const errors: string[] = [];
let checks = 0;
function pin(cond: boolean, fail: string): void {
  checks += 1;
  if (!cond) errors.push(fail);
}

// ── 1 · Parse the registry (text-level — dependency-free) ───────────────────
const registryRaw = readFileSync(
  path.join(srcDir, "config", "featureStatus.ts"),
  "utf8",
);
const statusByKey = new Map<string, string>();
for (const m of registryRaw.matchAll(
  /^\s{2}(\w+):\s*\{\s*status:\s*"(live|future)"/gm,
)) {
  statusByKey.set(m[1] as string, m[2] as string);
}
pin(
  statusByKey.size >= 10,
  `featureStatus.ts parsed only ${statusByKey.size} entries — the registry shape drifted`,
);

// ── 2 · Every pinned site's key is FUTURE; counts match exactly ─────────────
// WIDENED 2026-07-30 (footer audit): the JSX-attribute form alone let every
// OBJECT-LITERAL claim (`lifecycle: "FUTURE"` in a data/config file, rendered
// through a badge component) stand invisible — Recognition's standing card,
// contractMemory's seat-record row and three protocolOsMap nodes all carried
// FUTURE claims the badge scan could not see. Both forms are one claim class.
const FUTURE_MARK = /lifecycle(?:="FUTURE"|:\s*"FUTURE")/g;
for (const [rel, keys] of Object.entries(PINNED_CLAIM_SITES)) {
  const abs = path.join(srcDir, rel);
  const code = stripComments(readFileSync(abs, "utf8"));
  const found = [...code.matchAll(FUTURE_MARK)].length;
  pin(
    found === keys.length,
    `${rel}: ${found} FUTURE claim(s) but ${keys.length} pinned — register or clean, dated`,
  );
  for (const key of keys) {
    const status = statusByKey.get(key);
    pin(
      status === "future",
      `${rel}: claims "${key}" is coming, but the registry says "${status}" — A LIVING FEATURE IS TOLD AS FUTURE (the fossil class; flip the surface copy in this commit)`,
    );
  }
}

// ── 3 · No unpinned FUTURE claim anywhere in src ────────────────────────────
{
  const pinnedFiles = new Set(
    Object.keys(PINNED_CLAIM_SITES).map((r) => path.join(srcDir, r)),
  );
  for (const f of walk(srcDir)) {
    if (pinnedFiles.has(f)) continue;
    const code = stripComments(readFileSync(f, "utf8"));
    const n = [...code.matchAll(FUTURE_MARK)].length;
    pin(
      n === 0,
      `${path.relative(srcDir, f)}: ${n} UNPINNED lifecycle="FUTURE" claim(s) — a "coming" promise must be registered here with its feature key`,
    );
  }
}

// ── §⑥ · Every PROSE claim cites a future key, and its copy still exists ────
for (const [rel, { keys, fragment }] of Object.entries(PROSE_CLAIM_SITES)) {
  const raw = readFileSync(path.join(srcDir, rel), "utf8");
  const code = stripComments(raw);
  pin(
    code.includes(fragment),
    `${rel}: the pinned prose "${fragment}" is GONE — the copy moved and this pin is now guarding nothing. Delete or re-point it, dated, in this commit.`,
  );
  for (const key of keys) {
    const status = statusByKey.get(key);
    pin(
      status === "future",
      `${rel}: its prose promises "${key}", but the registry says "${status}" — A LIVING FEATURE IS TOLD AS FUTURE IN PROSE (the fossil class the badge scan cannot see; rewrite the sentence in this commit)`,
    );
  }
}

// ── §⑦ · No future key is registered without a claim site ───────────────────
{
  const cited = new Set<string>([
    ...Object.values(PINNED_CLAIM_SITES).flat(),
    ...Object.values(PROSE_CLAIM_SITES).flatMap((s) => s.keys),
  ]);
  for (const [key, status] of statusByKey) {
    if (status !== "future") continue;
    pin(
      cited.has(key) || key in REGISTERED_WITHOUT_CLAIM,
      `featureStatus.ts: "${key}" is registered FUTURE but no surface cites it — an orphan key reads as coverage and guards nothing. Pin its claim site, or record it in REGISTERED_WITHOUT_CLAIM with a dated reason.`,
    );
  }
  // The allowlist is a debt list, so it must not outlive its debt.
  for (const key of Object.keys(REGISTERED_WITHOUT_CLAIM)) {
    const status = statusByKey.get(key);
    pin(
      status === "future",
      `REGISTERED_WITHOUT_CLAIM holds "${key}", but the registry says "${status}" — delete the entry in the commit that flips the key.`,
    );
    pin(
      !cited.has(key),
      `REGISTERED_WITHOUT_CLAIM holds "${key}", but a claim site now cites it — delete the entry; it is no longer claimless.`,
    );
  }
}

// ── 4 · "Coming later" words live ONLY in the truthStatus atom ──────────────
{
  const atom = path.join(srcDir, "config", "truthStatus.ts");
  for (const f of walk(srcDir)) {
    if (f === atom) continue;
    const code = stripComments(readFileSync(f, "utf8"));
    pin(
      !code.includes("Coming later"),
      `${path.relative(srcDir, f)}: hardcoded "Coming later" outside the truthStatus atom — the badge system is the one voice for future`,
    );
  }
}

if (errors.length > 0) {
  console.error(`[guard:feature-truth] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(
  `[guard:feature-truth] PASS — ${checks} checks; every future claim cites a future feature (DONE-IS-DONE holds).`,
);
