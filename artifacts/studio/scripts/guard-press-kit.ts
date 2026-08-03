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
import { pressDescriptions, pressApprovedLanguage, pressBannedLanguage, pressProtocolFacts, pressMediaUsage } from "../src/config/pressKit.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const PAGE = path.join(srcDir, "pages", "PressKit.tsx");
const APP = path.join(srcDir, "App.tsx");
const MODULES = path.join(srcDir, "config", "modules.ts");
const CLASSIFICATION = path.join(srcDir, "config", "surfaceClassification.ts");
const SEO = path.join(srcDir, "lib", "seo-route-registry.ts");
const CONFIG = path.join(srcDir, "config", "pressKit.ts");
const PUBLIC_DIR = path.resolve(here, "..", "public");

function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1")
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
// Existence pins scan RAW source: the SEO registry carries `/*`-shaped glob
// STRINGS that open a phantom block for any naive stripper (the string-borne
// variant of the 2026-08-03 phantom-block trap — caught by this guard's own
// first run, which reported the entry missing while it existed).
check(page.length > 0, "press: the page exists", "press: pages/PressKit.tsx MISSING");
check(
  /path="\/press"/.test(read(APP)),
  "press: routed in App",
  "press: no /press route in App.tsx",
);
check(
  /path: "\/press"/.test(read(MODULES)),
  "press: in the modules registry (nav/footer authority)",
  "press: no /press entry in config/modules.ts — the footer and audits are registry-driven",
);
check(
  /routePath: "\/press"/.test(read(CLASSIFICATION)),
  "press: surface-classified",
  "press: no /press entry in surfaceClassification.ts",
);
check(
  /path: "\/press"/.test(read(SEO)),
  "press: in the SEO route registry",
  "press: no /press entry in seo-route-registry.ts — the sitemap and head are registry-driven",
);

// ── 2. ONE CHANNEL AUTHORITY ────────────────────────────────────────────────
check(
  /socialLinks/.test(page),
  "press: channels come from THE socialLinks authority",
  "press: the page does not import socialLinks — official channels are ONE fact in config/brand.ts",
);
check(
  !/x\.com\/|t\.me\//.test(page),
  "press: no retyped channel urls",
  "press: a channel url is retyped in the page — import socialLinks, never re-derive",
);

// ── 3. THE LEGAL VERBATIM IS IMPORTED ───────────────────────────────────────
check(
  /safetyCopy\.notInvestment/.test(page),
  "press: the not-investment line is the imported verbatim",
  "press: safetyCopy.notInvestment is not referenced — the legal line is imported, never retyped",
);
check(
  !/recognition and attribution protocol/.test(page),
  "press: the legal line is not retyped inline",
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
    !/mailto:|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text),
    `press: no invented contact in ${name}`,
    `press: ${name} carries an email/mailto — no press email exists in canon; inquiries go through the official channels`,
  );
}

// ── 6. THE SERVED ASSETS ARE REAL ───────────────────────────────────────────
for (const asset of ["brand/syn-mark-gold.png", "syn-mark-gold.svg", "opengraph.jpg"]) {
  check(
    existsSync(path.join(PUBLIC_DIR, asset)),
    `press: served asset real (${asset})`,
    `press: the page would offer /${asset} but public/${asset} does not exist — never promise an asset we do not serve`,
  );
}

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:press-kit] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:press-kit] PASS — ${ok.length}/${ok.length} press-kit pins hold.`);
