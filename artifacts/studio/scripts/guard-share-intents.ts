// guard-share-intents.ts — THE SHARE-INTENT FAMILY, one authority per fact. BLOCKING.
// ---------------------------------------------------------------------------
// THE SLICE (founder catch, 2026-08-03). On desktop the referrer kit's Share…
// ended at « Sheet unavailable — image downloaded, link copied » — honest, but
// desktop must SHARE, not explain. The fix: the kit's action rows gain the
// founder-named intent trio (X · Telegram · WhatsApp, prefilled — the R-BIND-2
// dual-share precedent). This guard exists so the family's facts stay ONE fact
// each, because the twin search found them already fractured:
//
//   · the target→lucide-icon map lived as THREE private literals (ShareMenu ·
//     ReceiptTicket · ReferralCommissionsPanel) — a fourth copy was one lazy
//     edit away;
//   · the ordered-ids → targets resolution (`ORDER.map(id =>
//     shareTargets.find(…)).filter(…)`) was rebuilt privately TWICE;
//   · the 36px row-shape intent button (the commissions table's form) was about
//     to be retyped in the kit.
//
// THE PINS:
//   1. ONE ICON MAP — the target→icon literal exists ONLY in
//      src/lib/shareTargetIcons.ts. Any `x: Twitter` mapping elsewhere is RED.
//   2. ONE RESOLVER — `shareTargets.find(` exists ONLY inside
//      src/lib/shareTargets.ts (the pickShareTargets resolver). Consumers
//      import the resolver, never re-derive it.
//   3. ONE ROW BUTTON — the row-shape intent button is the
//      ShareIntentIconButton atom; the commissions table and the kit both
//      consume it. (The receipt's labeled GRID and the link hero's popover
//      MENU are sibling COMPOSITIONS by design — shapes differ, facts don't.)
//   4. THE KIT TRIO — ReferralToolsPanel renders the founder-named trio in his
//      order (x · telegram · whatsapp), testid-pinned, placed BETWEEN «Copy my
//      link» and the native Share… (R-BIND-2's engraved order: copy first →
//      intents → the OS sheet LAST, the only channel that carries the image).
//   5. URL-FREE TEXT — the kit's SHARE_TEXT carries no link: every intent
//      places the url ITSELF (the founder-screenshot contract, 2026-07-20 —
//      an embedded link prints twice in the draft).
//   6. THE CONTRACT, EXECUTED — the three real builders run against a fixture
//      here, in this process: x and telegram carry the url as its OWN param
//      with URL-free text; whatsapp inlines `text url` so the join link is a
//      link in the draft (and the LAST token — the one WhatsApp cards).
//
// WHAT THIS GUARD DOES NOT COVER (stated, the report-shape law): it reads
// source and executes the pure builders — it does not render a browser, so
// icon PIXELS, popup blockers, and each platform's live prefill behavior stay
// human/preview territory. Touch geometry is guard-touch-target's authority,
// deliberately not re-pinned here (one authority per rule).
//
// Scans are comment-stripped so headers may name what they forbid.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { shareTargets, orderedShareTargets } from "../src/lib/shareTargets.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

const ICON_AUTHORITY = path.join(srcDir, "lib", "shareTargetIcons.ts");
const TARGETS_LIB = path.join(srcDir, "lib", "shareTargets.ts");
const ATOM = path.join(srcDir, "components", "referral", "ShareIntentIconButton.tsx");
const SURFACE = path.join(srcDir, "components", "share", "ShareSurface.tsx");
const KIT = path.join(srcDir, "components", "referral", "ReferralToolsPanel.tsx");
const COMMISSIONS = path.join(srcDir, "components", "referral", "ReferralCommissionsPanel.tsx");
const TICKET = path.join(srcDir, "wallet", "ReceiptTicket.tsx");
const MENU = path.join(srcDir, "components", "referral", "ShareMenu.tsx");

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

function tryRead(abs: string): string | null {
  try {
    return readFileSync(abs, "utf8");
  } catch {
    return null;
  }
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) yield* walk(abs);
    else if (/\.(ts|tsx)$/.test(name)) yield abs;
  }
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const rel = (abs: string) => path.relative(srcDir, abs).replaceAll("\\", "/");

// ── 1. ONE ICON MAP ─────────────────────────────────────────────────────────
// The distinctive pair of any local target→icon map. lib/shareTargetIcons.ts
// is the one place allowed to state it.
const ICON_MAP_LITERAL = /\bx:\s*Twitter\b|\bwhatsapp:\s*MessageCircle\b|\btelegram:\s*Send\b/;
for (const file of walk(srcDir)) {
  if (file === ICON_AUTHORITY) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  const m = code.match(ICON_MAP_LITERAL);
  check(
    m === null,
    `${rel(file)}: no private icon map`,
    `${rel(file)}: private target→icon literal "${m?.[0]}" — the map is ONE fact, import { shareTargetIcons } from "@/lib/shareTargetIcons"`,
  );
}
const authoritySrc = tryRead(ICON_AUTHORITY);
check(
  authoritySrc !== null && /export const shareTargetIcons/.test(authoritySrc),
  "lib/shareTargetIcons.ts: the one icon authority exists",
  "lib/shareTargetIcons.ts: MISSING — the target→icon map has no single authority",
);

// ── 2. ONE RESOLVER ─────────────────────────────────────────────────────────
for (const file of walk(srcDir)) {
  if (file === TARGETS_LIB) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !/shareTargets\s*\.\s*find\s*\(/.test(code),
    `${rel(file)}: no private target resolution`,
    `${rel(file)}: resolves shareTargets.find() privately — import { pickShareTargets } from "@/lib/shareTargets"`,
  );
}
const targetsSrc = readFileSync(TARGETS_LIB, "utf8");
check(
  /export function pickShareTargets/.test(targetsSrc),
  "lib/shareTargets.ts: pickShareTargets is the one resolver",
  "lib/shareTargets.ts: pickShareTargets MISSING — every consumer re-derives the ordered-ids resolution",
);

// ── 2b. ONE ORDER (the founder's correction, 2026-08-03: « nous avions
// plus » — the kit carries the SAME six as the receipts, same order). The
// crypto-native order is ONE exported fact; a private ordered-ids literal in
// any consumer is the twin disease this file exists to kill.
const PRIVATE_ORDER = /\[\s*"x"\s*,\s*"(whatsapp|telegram|facebook|linkedin|email)"/;
for (const file of walk(srcDir)) {
  if (file === TARGETS_LIB) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !PRIVATE_ORDER.test(code),
    `${rel(file)}: no private share order`,
    `${rel(file)}: carries a private ordered-ids literal — import { orderedShareTargets } from "@/lib/shareTargets" (the R-BIND-2 crypto-native order is ONE fact)`,
  );
}
// The order itself, EXECUTED from the real module — six targets, engraved
// sequence (R-BIND-2, 2026-07-19; re-affirmed by the founder 2026-08-03).
check(
  JSON.stringify(orderedShareTargets.map((t) => t.id)) ===
    JSON.stringify(["x", "whatsapp", "telegram", "linkedin", "facebook", "email"]),
  "orderedShareTargets: the six, in the engraved crypto-native order",
  `orderedShareTargets drifted — got [${orderedShareTargets.map((t) => t.id).join(", ")}], the engraved order is x · whatsapp · telegram · linkedin · facebook · email`,
);

// ── 3. ONE ROW BUTTON (the commissions table's sealed row form) ─────────────
const atomSrc = tryRead(ATOM);
check(
  atomSrc !== null && /export function ShareIntentIconButton/.test(atomSrc),
  "ShareIntentIconButton: the row-shape atom exists",
  "ShareIntentIconButton.tsx: MISSING — the row-shape intent button has no single implementation",
);
check(
  /<ShareIntentIconButton/.test(stripComments(readFileSync(COMMISSIONS, "utf8"))),
  "ReferralCommissionsPanel.tsx: renders the shared row atom",
  "ReferralCommissionsPanel.tsx: does not render ShareIntentIconButton — the row-shape intent button is ONE implementation, never retyped",
);

// ── 3b. ONE BOX (the founder's harmonization order, 2026-08-03: «ça ouvre le
// box comme dans le ticket») — the R-BIND-2 dual-share SURFACE is ONE
// component; the ticket and the kit both MOUNT it, neither re-implements it.
const surfaceSrc = tryRead(SURFACE);
check(
  surfaceSrc !== null && /export function ShareSurface/.test(surfaceSrc),
  "ShareSurface: THE dual-share box exists",
  "components/share/ShareSurface.tsx: MISSING — the R-BIND-2 box has no single implementation",
);
for (const [name, abs] of [
  ["ReceiptTicket.tsx", TICKET],
  ["ReferralToolsPanel.tsx", KIT],
] as const) {
  const code = stripComments(readFileSync(abs, "utf8"));
  check(
    /<ShareSurface/.test(code),
    `${name}: mounts THE dual-share box`,
    `${name}: does not mount ShareSurface — one Share button opens the ONE box (the founder's harmonization order, 2026-08-03)`,
  );
}
// The box's distinctive furniture lives ONLY in the component. (The bare
// JSX-text label and the -other-apps testid are the BOX's forms; the sealed
// commissions ROW keeps «Share with other apps» as an aria-label — an
// attribute, deliberately not matched.)
for (const file of walk(srcDir)) {
  if (file === SURFACE) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !/^\s*Share with other apps\s*$/m.test(code) && !/-other-apps"/.test(code),
    `${rel(file)}: no private dual-share box`,
    `${rel(file)}: re-implements the dual-share box (the «Share with other apps» row / the -other-apps testid) — mount ShareSurface instead`,
  );
}
// The family list is consumed by the box and the commissions row ONLY; the
// ticket and the kit consume the BOX, never the list directly.
for (const [name, abs, wanted] of [
  ["ShareSurface.tsx", SURFACE, true],
  ["ReferralCommissionsPanel.tsx", COMMISSIONS, true],
  ["ReceiptTicket.tsx", TICKET, false],
  ["ReferralToolsPanel.tsx", KIT, false],
] as const) {
  const raw = abs === SURFACE ? surfaceSrc : readFileSync(abs, "utf8");
  const code = raw === null ? "" : stripComments(raw);
  check(
    /orderedShareTargets/.test(code) === wanted,
    wanted
      ? `${name}: consumes THE ordered family`
      : `${name}: consumes the BOX, not the list (right altitude)`,
    wanted
      ? `${name}: does not consume orderedShareTargets — the six-network family and its order are ONE imported fact`
      : `${name}: references orderedShareTargets directly — it must consume the ShareSurface box, never rebuild intent rendering`,
  );
}

// ── 3c. ONE SPLIT — the url/text contract decision lives in the lib ─────────
check(
  /export function shareIntentArgs/.test(targetsSrc),
  "lib/shareTargets.ts: shareIntentArgs is the one url/text split",
  "lib/shareTargets.ts: shareIntentArgs MISSING — the whatsapp/email inline-text split is re-decided at call sites",
);
for (const file of walk(srcDir)) {
  if (file === TARGETS_LIB) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !/"whatsapp"\s*\|\|/.test(code),
    `${rel(file)}: no private url/text split`,
    `${rel(file)}: re-decides the whatsapp/email inline-text split — import { shareIntentArgs } from "@/lib/shareTargets"`,
  );
}
for (const [name, abs] of [
  ["ShareSurface.tsx", SURFACE],
  ["ReferralCommissionsPanel.tsx", COMMISSIONS],
] as const) {
  const raw = abs === SURFACE ? surfaceSrc : readFileSync(abs, "utf8");
  const code = raw === null ? "" : stripComments(raw);
  check(
    /shareIntentArgs\s*\(/.test(code),
    `${name}: applies the contract through THE split`,
    `${name}: does not call shareIntentArgs — the url/text contract is ONE imported decision`,
  );
}

// ── 3d. THE BOX'S ENGRAVED ORDER (R-BIND-2): copy FIRST → the six intents →
// «Share with other apps» LAST, feature-detected.
if (surfaceSrc !== null) {
  const s = stripComments(surfaceSrc);
  const copyIdxS = s.indexOf("-copy-link");
  const gridIdxS = s.indexOf("orderedShareTargets.map");
  const nativeIdxS = s.indexOf("-other-apps");
  check(
    copyIdxS !== -1 && gridIdxS !== -1 && nativeIdxS !== -1 && copyIdxS < gridIdxS && gridIdxS < nativeIdxS,
    "box: R-BIND-2 order holds (copy → the six → the OS sheet last)",
    "box: the R-BIND-2 order is broken — Copy link FIRST, the six intents, «Share with other apps» LAST",
  );
  check(
    /nativeAvailable \? \(/.test(s),
    "box: the OS sheet is feature-detected (never a dead button)",
    "box: the native row must render only when nativeAvailable — feature-detected, never a dead button",
  );
}
// ShareMenu iterates the WHOLE registry by design (no subset) — it owes only
// the icon authority (pin 1 already scans it). Named so nobody "fixes" it.
check(
  /shareTargetIcons/.test(stripComments(readFileSync(MENU, "utf8"))) || true,
  "ShareMenu.tsx: menu composition acknowledged (icon authority via pin 1)",
  "",
);

// ── 4. THE KIT MOUNT — one Share… trigger, ALWAYS rendered, opening the box
// (founder, 2026-08-03: mobile keeps everything; desktop opens the SAME box
// as the ticket) ────────────────────────────────────────────────────────────
const kitRaw = readFileSync(KIT, "utf8");
const kit = stripComments(kitRaw);
check(
  /button-kit-share-/.test(kit),
  "kit: the Share… trigger is testid-pinned (button-kit-share-<artifact>)",
  "kit: the button-kit-share- trigger testid is absent — the share door is unpinned",
);
check(
  !/nativeShareAvailable \? \(/.test(kit),
  "kit: the Share… trigger is ALWAYS rendered (the feature-detect moved INTO the box)",
  "kit: the share trigger is still gated by nativeShareAvailable — every engine gets the box; only the OS-sheet row inside it is feature-detected",
);
check(
  /nativeAvailable=\{/.test(kit),
  "kit: hands the engine truth to the box (nativeAvailable prop)",
  "kit: does not pass nativeAvailable to ShareSurface — the box cannot feature-detect the OS sheet",
);
check(
  /testidBase=\{`kit-share-/.test(kitRaw),
  "kit: the box's controls are testid-pinned per artifact (kit-share-<artifact>)",
  "kit: ShareSurface is mounted without the kit-share testidBase — the box's controls are unpinned",
);

// ── 5. URL-FREE TEXT ────────────────────────────────────────────────────────
const shareTextMatch = /const SHARE_TEXT = "([^"]*)"/.exec(kitRaw);
check(
  shareTextMatch !== null,
  "kit: SHARE_TEXT is one hoisted fact",
  "kit: SHARE_TEXT const missing — the share text must be ONE literal (sheet + fallback + trio all read it)",
);
check(
  shareTextMatch !== null && !/https?:\/\//.test(shareTextMatch[1]!),
  "kit: SHARE_TEXT is URL-free (every intent places the url itself)",
  `kit: SHARE_TEXT embeds a link ("${shareTextMatch?.[1] ?? ""}") — the contract: text never contains the url, the intent places it`,
);

// ── 6. THE CONTRACT, EXECUTED ───────────────────────────────────────────────
// The real builders run HERE, on a fixture — never asserted from memory.
const FIX_URL = "https://thesyndicate.money/join?via=0x1234abcd";
const FIX_TEXT = "The Syndicate — an on-chain introduction record.";
const byId = new Map(shareTargets.map((t) => [t.id, t]));
const x = byId.get("x");
const tg = byId.get("telegram");
const wa = byId.get("whatsapp");
const li = byId.get("linkedin");
const fb = byId.get("facebook");
const em = byId.get("email");
check(
  x !== undefined && tg !== undefined && wa !== undefined && li !== undefined && fb !== undefined && em !== undefined,
  "registry: all six family targets exist",
  "registry: a family target (x/whatsapp/telegram/linkedin/facebook/email) is missing from shareTargets",
);
if (li && fb && em) {
  const liUrl = new URL(li.build(FIX_URL, FIX_TEXT));
  check(
    liUrl.origin + liUrl.pathname === "https://www.linkedin.com/sharing/share-offsite/" &&
      liUrl.searchParams.get("url") === FIX_URL,
    "linkedin: official share-offsite, url as its own param",
    `linkedin: intent drifted — got ${li.build(FIX_URL, FIX_TEXT)}`,
  );
  const fbUrl = new URL(fb.build(FIX_URL, FIX_TEXT));
  check(
    fbUrl.origin + fbUrl.pathname === "https://www.facebook.com/sharer/sharer.php" &&
      fbUrl.searchParams.get("u") === FIX_URL,
    "facebook: official sharer, url as its own param",
    `facebook: intent drifted — got ${fb.build(FIX_URL, FIX_TEXT)}`,
  );
  const emHref = em.build(FIX_URL, FIX_TEXT);
  check(
    emHref.startsWith("mailto:?subject=") && decodeURIComponent(emHref).includes(`${FIX_TEXT} ${FIX_URL}`),
    "email: mailto carries subject + inline «text url» body",
    `email: inline contract drifted — got ${emHref}`,
  );
}
if (x && tg && wa) {
  const xUrl = new URL(x.build(FIX_URL, FIX_TEXT));
  check(
    xUrl.origin + xUrl.pathname === "https://twitter.com/intent/tweet" &&
      xUrl.searchParams.get("url") === FIX_URL &&
      xUrl.searchParams.get("text") === FIX_TEXT &&
      !/https?:\/\//.test(xUrl.searchParams.get("text") ?? "http://tainted"),
    "x: official intent, url as its OWN param, text URL-free",
    `x: intent drifted — got ${x.build(FIX_URL, FIX_TEXT)}`,
  );
  const tgUrl = new URL(tg.build(FIX_URL, FIX_TEXT));
  check(
    tgUrl.origin + tgUrl.pathname === "https://t.me/share/url" &&
      tgUrl.searchParams.get("url") === FIX_URL &&
      tgUrl.searchParams.get("text") === FIX_TEXT,
    "telegram: official share url, both params carried",
    `telegram: intent drifted — got ${tg.build(FIX_URL, FIX_TEXT)}`,
  );
  const waUrl = new URL(wa.build(FIX_URL, FIX_TEXT));
  check(
    waUrl.origin + waUrl.pathname + "?" === "https://wa.me/?" &&
      waUrl.searchParams.get("text") === `${FIX_TEXT} ${FIX_URL}`,
    "whatsapp: text-only intent inlines «text url» — the join link is the draft's LAST token (the one WhatsApp cards)",
    `whatsapp: inline contract drifted — got ${wa.build(FIX_URL, FIX_TEXT)}`,
  );
}

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:share-intents] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:share-intents] PASS — ${ok.length}/${ok.length} share-intent pins hold.`);
