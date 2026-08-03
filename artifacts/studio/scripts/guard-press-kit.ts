// guard-press-kit.ts — THE PUBLIC PRESS & BRAND KIT (/press). BLOCKING.
// ---------------------------------------------------------------------------
// THE SLICE (E — the engraved sequence; founder «go décide pour moi»,
// 2026-08-03). The origin's press.tsx is the QUARRY (8 sections), the MIRROR
// RULE the sieve: we publish ONLY what is true and served today. The
// founder-delegated decisions, recorded: V1 scope = descriptions · brand ·
// official channels · protocol facts · approved/banned language · media
// usage; the channels ARE the site's own socialLinks authority; NO press
// email exists in canon so none is invented — inquiries go through the
// official channels.
//
// THE PINS:
//   1. THE ROUTE EXISTS EVERYWHERE a route must exist — page file, App route,
//      modules registry, surface classification, SEO registry (the other
//      route guards enforce their own deeper laws; this pin is the tripwire).
//   2. ONE CHANNEL AUTHORITY — the page imports socialLinks; a retyped
//      x.com/t.me literal in the page is RED (the twin disease).
//   3. THE LEGAL VERBATIM IS IMPORTED — safetyCopy.notInvestment is
//      referenced, never retyped.
//   4. THE CONTENT AUTHORITY HOLDS — pressKit.ts is imported and EXECUTED
//      here: the three descriptions frozen verbatim, the banned list carries
//      the core banned words, approved ∩ banned = ∅, every protocol fact's
//      door is an internal path.
//   5. NO INVENTED CONTACT — no mailto: and no email-shaped literal in the
//      page or the config.
//
// NOT COVERED (stated): rendered pixels/themes (the rig + preview gate), the
// truth of the served brand FILES (the page links what public/ actually
// holds — checked at build by the asset pins below), the facts' deeper truth
// (their doors lead to the surfaces that prove them live).
// Scans are comment-stripped (LINE comments first — the phantom-block trap).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pressDescriptions, pressApprovedLanguage, pressBannedLanguage, pressProtocolFacts, pressMediaUsage, pressAssets } from "../src/config/pressKit.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const PAGE = path.join(srcDir, "pages", "PressKit.tsx");
const APP = path.join(srcDir, "App.tsx");
const MODULES = path.join(srcDir, "config", "modules.ts");
const CLASSIFICATION = path.join(srcDir, "config", "surfaceClassification.ts");
const SEO = path.join(srcDir, "lib", "seo-route-registry.ts");
const CONFIG = path.join(srcDir, "config", "pressKit.ts");
const PUBLIC_DIR = path.resolve(here, "..", "public");

// Line-first, with (?!…\*\/) lookaheads: a `//` line carrying a block CLOSER
// must survive pass 1, or the block adopts the NEXT closer and swallows real
// code (review-2 logic hat, executed counter-fixture, 2026-08-03).
function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/(?![^\n]*\*\/).*$/gm, "")
    .replace(/([^:"'])\/\/(?![^\n"']*\*\/)[^\n"']*$/gm, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const read = (p: string): string => (existsSync(p) ? readFileSync(p, "utf8") : "");
const page = stripComments(read(PAGE));
const configRaw = read(CONFIG);

// ── 1. THE ROUTE EXISTS EVERYWHERE ──────────────────────────────────────────
// Existence pins scan RAW source (the SEO registry carries `/*`-shaped glob
// STRINGS that phantom-trap naive strippers) but are LINE-ANCHORED so a
// commented-out entry (`// path: "/press"` · `{/* <PublicRoute…`) can never
// count as live (review-2 adversarial probes, 2026-08-03).
check(page.length > 0, "press: the page exists", "press: pages/PressKit.tsx MISSING");
check(
  /^\s*<PublicRoute path="\/press">/m.test(read(APP)),
  "press: routed in App (live line, not a comment)",
  "press: no live /press route line in App.tsx",
);
check(
  /^\s*path: "\/press",$/m.test(read(MODULES)),
  "press: in the modules registry (live line)",
  "press: no live /press entry line in config/modules.ts — the footer and audits are registry-driven",
);
check(
  /^\s*routePath: "\/press",$/m.test(read(CLASSIFICATION)),
  "press: surface-classified (live line)",
  "press: no live /press entry line in surfaceClassification.ts",
);
check(
  /^\s*path: "\/press",$/m.test(read(SEO)),
  "press: in the SEO route registry (live line)",
  "press: no live /press entry line in seo-route-registry.ts — the sitemap and head are registry-driven",
);

// ── 2. ONE CHANNEL AUTHORITY ────────────────────────────────────────────────
check(
  /socialLinks/.test(page),
  "press: channels come from THE socialLinks authority",
  "press: the page does not import socialLinks — official channels are ONE fact in config/brand.ts",
);
check(
  // Legacy domain spellings joined the ban (review-2 adversarial probe:
  // twitter.com/telegram.me literals passed the two-domain form).
  !/x\.com\/|t\.me\/|twitter\.com\/|telegram\.me\//.test(page),
  "press: no retyped channel urls (canonical or legacy spellings)",
  "press: a channel url is retyped in the page — import socialLinks, never re-derive",
);

// ── 2b. THE PAGE CONSUMES EVERY AUTHORITY IT CLAIMS (review-2 adversarial
// CRITICAL: the config was frozen but nothing tied the PAGE to it — retyped
// drifted copy rendered with 26/26 green). One reference pin per export.
// BIND THE RENDER, NOT THE NAME (2026-08-03 seven-hat audit): a bare
// identifier pin is satisfied by the IMPORT LINE ALONE, so it could not
// catch the realistic partial drift — one description retyped inline while
// the others still render from the authority. Member access / .map() is the
// shape that proves the page actually RENDERS the fact.
for (const [name, re] of [
  ["pressDescriptions.oneLine", /pressDescriptions\.oneLine/],
  ["pressDescriptions.short", /pressDescriptions\.short/],
  ["pressDescriptions.long", /pressDescriptions\.long/],
  ["pressProtocolFacts", /pressProtocolFacts\.map\(/],
  ["pressApprovedLanguage", /pressApprovedLanguage\.map\(/],
  ["pressBannedLanguage", /pressBannedLanguage\.map\(/],
  ["pressMediaUsage", /pressMediaUsage\.map\(/],
  ["pressAssets", /pressAssets\.map\(/],
] as const) {
  check(
    re.test(page),
    `press: the page RENDERS ${name} from the authority`,
    `press: the page no longer renders ${name} — frozen config with a retyped page is the twin disease (2026-08-03 adversarial CRITICAL); an import line alone is not a render`,
  );
}

// ── 3. THE LEGAL VERBATIM IS IMPORTED ───────────────────────────────────────
check(
  /safetyCopy\.notInvestment/.test(page),
  "press: the not-investment line is the imported verbatim",
  "press: safetyCopy.notInvestment is not referenced — the legal line is imported, never retyped",
);
check(
  !/recognition[ -]and[ -]attribution/.test(page),
  "press: the legal line is not retyped inline (hyphenated variants included)",
  "press: the not-investment sentence is RETYPED in the page — import safetyCopy.notInvestment",
);

// ── 4. THE CONTENT AUTHORITY, EXECUTED ──────────────────────────────────────
const FROZEN_DESCRIPTIONS: Record<string, string> = {
  oneLine:
    "The Syndicate is an on-chain membership protocol on Avalanche: every seat, purchase and introduction is a public, verifiable record.",
  short:
    "The Syndicate is a membership protocol on Avalanche C-Chain. A seat is bought in USDC from your own wallet; the purchase, the seat and every introduction are written on-chain as permanent, independently verifiable records. The protocol publishes what the chain publishes — never more.",
  long:
    "The Syndicate is a membership protocol on Avalanche C-Chain. A seat is bought in USDC from your own wallet; the purchase, the seat and every introduction are written on-chain as permanent, independently verifiable records. Treasury flows follow a published split — Vault 70% · Liquidity 20% · Operations 10% — and the referral program pays an introducer's commission inside the buyer's own transaction. The rule of record: never a claim beyond what the chain itself publishes.",
};
for (const [key, text] of Object.entries(FROZEN_DESCRIPTIONS)) {
  check(
    (pressDescriptions as Record<string, string>)[key] === text,
    `press: description «${key}» frozen verbatim`,
    `press: description «${key}» drifted — the founder-delegated copy is frozen; expected «${text.slice(0, 60)}…»`,
  );
  // THE MIRROR NEGATIVE (seven-hat audit, 2026-08-03): freezing the config
  // while the PAGE retypes the words is the twin disease the reference pins
  // in §2b were written for — this closes the other half, making a retype
  // structurally impossible rather than merely detectable.
  check(
    !page.includes(text),
    `press: description «${key}» is not retyped as page text`,
    `press: the «${key}» description literal appears IN THE PAGE — it must render from pressDescriptions, never be retyped`,
  );
}
const CORE_BANNED = ["investment", "yield", "ROI", "passive income", "guaranteed", "MLM"];
for (const word of CORE_BANNED) {
  check(
    pressBannedLanguage.some((b) => b.toLowerCase().includes(word.toLowerCase())),
    `press: banned list carries «${word}»`,
    `press: the banned-language list lost «${word}» — the editorial red line thinned`,
  );
}
const bannedLower = pressBannedLanguage.map((b) => b.toLowerCase());
const overlap = pressApprovedLanguage.filter((a) => bannedLower.includes(a.toLowerCase()));
check(
  overlap.length === 0,
  "press: approved ∩ banned = ∅",
  `press: «${overlap.join(", ")}» appears in BOTH language lists — one word, one verdict`,
);
check(
  pressProtocolFacts.length >= 5 && pressProtocolFacts.every((f) => f.href.startsWith("/")),
  "press: every protocol fact carries an internal verify door",
  "press: a protocol fact lost its internal verify door (href must start with /) — a fact without a door is a claim",
);
check(
  pressMediaUsage.length >= 3,
  "press: media-usage rules present",
  "press: the media-usage rules vanished",
);

// ── 5. NO INVENTED CONTACT ──────────────────────────────────────────────────
for (const [name, text] of [
  ["the page", page],
  ["the config", stripComments(configRaw)],
] as const) {
  check(
    // The host must start with a LETTER: `syn-mark-gold@2x.png` parsed as an
    // email under the loose form (review-2 adversarial false-positive probe).
    !/mailto:|[A-Za-z0-9._%+-]+@[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/.test(text),
    `press: no invented contact in ${name}`,
    `press: ${name} carries an email/mailto — no press email exists in canon; inquiries go through the official channels`,
  );
}

// ── 6. THE SERVED ASSETS ARE REAL — driven by THE pressAssets authority
// (review-2 adversarial: the hardcoded trio let a fourth, dead entry ship
// green despite this pin's own failure text). Every entry the page offers is
// checked on disk; the trio floor keeps the section from silently emptying.
check(
  pressAssets.length >= 3,
  "press: the asset list keeps its served trio",
  `press: pressAssets shrank to ${pressAssets.length} — the mark (PNG+SVG) and the link-preview card are the served minimum`,
);
for (const a of pressAssets) {
  check(
    a.href.startsWith("/") && existsSync(path.join(PUBLIC_DIR, a.href.replace(/^\//, ""))),
    `press: served asset real (${a.href})`,
    `press: the page offers ${a.href} but public${a.href} does not exist — never promise an asset we do not serve`,
  );
}

// ── 7. THE MARK IS NEVER DISTORTED (review-2 design hat, 2026-08-03: the
// served PNG is 544×427 — a square h-16 w-16 box squashed it ~21% directly
// above the page's own «never distorted» rule). The img keeps natural aspect.
check(
  /className="h-16 w-auto"/.test(page) && !/img[^>]*w-16/.test(page),
  "press: the mark renders at natural aspect (h-16 w-auto)",
  "press: the mark img must be h-16 w-auto — a square box distorts the 544×427 interlock under the page's own usage rule",
);

// ── 8. NO RETYPED BRAND PATH (seven-hat audit, 2026-08-03: the page
// imported the authority for the MARK and retyped the path for the LOCKUP,
// seven lines apart inside ONE Card).
check(
  !/src="\/brand\//.test(page) && !/src="\/syn-/.test(page),
  "press: no retyped brand asset path — every file comes from the brandAssets authority",
  "press: a brand asset path is retyped in the page — import it from config/brand.ts's brandAssets, never re-derive (TWIN SEARCH)",
);

// ── 9. THE LOCKUP RENDERS ON ITS OWN GROUND (seven-hat audit, 2026-08-03).
// The lockup's ink is BAKED LIGHT (#E1E7EF wordmark, #7F8EA3 tagline — the
// generator's fixed-ink canon) and the light theme's --card is pure white,
// so the page's brand hero measured 1.24:1: the wordmark was invisible to a
// journalist in light mode, directly above the page's own «never distorted /
// use as provided» rule. A logotype is WCAG-exempt (SC 1.4.3) — this is a
// TRUTH-and-composition pin, not an AA pin. The plate is theme-INVARIANT
// (a local `dark` scope over the token layer — no raw hex).
check(
  /className="dark [^"]*bg-card[^"]*"/.test(page),
  "press: the lockup sits on a theme-invariant dark plate (the ground its ink was built for)",
  "press: the lockup must render on a theme-invariant dark plate (`className=\"dark … bg-card …\"`) — its ink is baked light, so on the light theme's white card the wordmark measures 1.24:1 (2026-08-03 audit)",
);

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:press-kit] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:press-kit] PASS — ${ok.length}/${ok.length} press-kit pins hold.`);
