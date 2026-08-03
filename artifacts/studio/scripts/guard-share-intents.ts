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
// THE PINS (current design — the 2026-08-03 harmonization; earlier same-day
// forms, trio then loose row icons, are DEAD, killed by the founder's two
// corrections «nous avions plus» + «harmonisé comme ticket»):
//   1. ONE ICON MAP — the target→icon literal exists ONLY in
//      src/lib/shareTargetIcons.ts. Any `x: Twitter` mapping elsewhere is RED.
//   2. ONE RESOLVER + ONE ORDER — `shareTargets.find(`/`.filter(` exist ONLY
//      inside src/lib/shareTargets.ts; the six-network family and its
//      crypto-native order are the ONE export `orderedShareTargets`; a
//      private ordered-ids literal anywhere is RED.
//   3. ONE ROW BUTTON — the 36px icon intent button is the
//      ShareIntentIconButton atom; the commissions table is its one consumer.
//      ONE BOX — the R-BIND-2 dual-share surface is the ShareSurface
//      component; the receipt ticket and the kit both MOUNT it, and its
//      furniture (copy-first → six intents → «Share with other apps» LAST,
//      feature-detected) is pinned INSIDE the component. ONE SPLIT — the
//      whatsapp/email inline-text decision is shareIntentArgs, in the lib.
//   4. THE KIT MOUNT — ONE always-rendered Share… trigger per artifact row
//      (never conditionally gated on engine capability — the feature-detect
//      lives inside the box), a useId-unique surface id (the og artifact
//      mounts its actions TWICE — spec-derived ids collide), testid-pinned.
//   5. URL-FREE TEXT — the kit's SHARE_TEXT carries no link: every intent
//      places the url ITSELF (the founder-screenshot contract, 2026-07-20 —
//      an embedded link prints twice in the draft).
//   6. THE CONTRACT, EXECUTED — all SIX real builders run against a fixture
//      (which carries an `&` so an encoding-free builder cannot pass) plus
//      the exported order itself, compared to the engraved sequence.
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
import { shareTargets, orderedShareTargets, shareIntentArgs } from "../src/lib/shareTargets.ts";

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

// LINE comments are stripped FIRST: a `/*` inside a `//` line (e.g. a route
// glob like `/api/auth/*` in a header) would otherwise open a phantom block
// and swallow real code from the scan — the class was caught live by
// guard-activity-mine's own RED cycle (2026-08-03). The (?!…\*\/) lookaheads
// keep a `//` line that CARRIES a block CLOSER: deleting it would hand the
// block the NEXT closer and swallow real code (review-2 logic hat, executed
// counter-fixture, same day).
function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/(?![^\n]*\*\/).*$/gm, "")
    .replace(/([^:"'])\/\/(?![^\n"']*\*\/)[^\n"']*$/gm, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
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
const ICON_MAP_LITERAL = /["']?\bx["']?\s*:\s*Twitter\b|["']?\bwhatsapp["']?\s*:\s*MessageCircle\b|["']?\btelegram["']?\s*:\s*Send\b/;
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
    !/shareTargets\s*\.\s*(find|filter)\s*\(/.test(code),
    `${rel(file)}: no private target resolution`,
    `${rel(file)}: resolves shareTargets.find()/filter() privately — import { pickShareTargets } (or orderedShareTargets) from "@/lib/shareTargets"`,
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
// ANY two adjacent family ids in an array literal (any order, either quote
// style) — the 2026-08-03 adversarial review proved the old head-anchored
// form let a REORDERED private list through (the worse twin escaped). If a
// future non-share list legitimately pairs two of these six words, it is
// almost certainly this family anyway — import from the lib.
const PRIVATE_ORDER =
  /\[\s*["'](x|whatsapp|telegram|linkedin|facebook|email)["']\s*,\s*["'](x|whatsapp|telegram|linkedin|facebook|email)["']/;
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
    !/^\s*\{?["']?Share with other apps["']?\}?\s*$/m.test(code) && !/-other-apps[`"']/.test(code),
    `${rel(file)}: no private dual-share box`,
    `${rel(file)}: re-implements the dual-share box (the «Share with other apps» row / the -other-apps testid) — mount ShareSurface instead`,
  );
}
// The family list is consumed by the box and the commissions row ONLY; the
// ticket and the kit consume the BOX, never the list directly.
// ShareMenu joined the wanted-TRUE side 2026-08-03 (seven-hat audit): the
// de-twinning left it iterating the BASE registry — declaration order
// (x · facebook · whatsapp · …) — while lib/shareTargets.ts asserts «every
// intent surface of the family carries the SAME six, in THIS order». It is
// live on two surfaces (ReferralLinkHero, ReferralLinkPanel), so the law
// had a public counter-example. The former carve-out comment below is gone.
for (const [name, abs, wanted] of [
  ["ShareSurface.tsx", SURFACE, true],
  ["ReferralCommissionsPanel.tsx", COMMISSIONS, true],
  ["ShareMenu.tsx", MENU, true],
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
// The split's signature is whatsapp AND email co-deciding one disjunction —
// pinning the pair (either order) instead of any lone `"whatsapp" ||` keeps
// unrelated channel-slug logic (ReferralLinkPanel's share channels) out of
// this pin's blast radius (2026-08-03 adversarial review, FP finding).
const PRIVATE_SPLIT =
  /["']whatsapp["']\s*\|\|[^\n]*["']email["']|["']email["']\s*\|\|[^\n]*["']whatsapp["']/;
for (const file of walk(srcDir)) {
  if (file === TARGETS_LIB) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !PRIVATE_SPLIT.test(code),
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
  // Either JSX conditional spelling is the same feature-detect (the ternary
  // pin alone was a false red on a behavior-identical `&&` refactor —
  // 2026-08-03 adversarial review).
  check(
    /\{\s*nativeAvailable\s*(\?|&&)/.test(s),
    "box: the OS sheet is feature-detected (never a dead button)",
    "box: the native row must render only when nativeAvailable — feature-detected, never a dead button",
  );
}

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
  // The CLASS of gating, not one spelling: `{nativeShareAvailable ? (` AND
  // `{nativeShareAvailable && (` both hide the door on desktop — the exact
  // founder-caught defect. A legitimate prop pass (`nativeAvailable=
  // {nativeShareAvailable}`) is followed by `}`, never `?`/`&&`, so it
  // cannot match (2026-08-03 adversarial review, the critical finding).
  !/\{\s*nativeShareAvailable\s*(\?|&&)/.test(kit),
  "kit: the Share… trigger is ALWAYS rendered (the feature-detect moved INTO the box)",
  "kit: the share trigger is conditionally gated on nativeShareAvailable — every engine gets the box; only the OS-sheet row inside it is feature-detected",
);
check(
  /const surfaceId = useId\(\)/.test(kit) && /id=\{surfaceId\}/.test(kit) && /aria-controls=\{surfaceId\}/.test(kit),
  "kit: the box id is useId-unique per mount (the og artifact mounts its actions twice)",
  "kit: the box id must derive from useId() (const surfaceId = useId(); id={surfaceId}; aria-controls={surfaceId}) — a spec-derived id collides on the double-mounted og artifact (duplicate DOM id + crossed aria-controls)",
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
// The WHOLE initializer, stopping only at a BARE semicolon. The first form
// captured to the first `;` ANYWHERE — including one INSIDE the string —
// so a link placed after a semicolon in the copy passed unseen (seven-hat
// audit, 2026-08-03; measured matrix: real source green→green · semicolon+url
// green→RED · template+semicolon green→RED · concat RED→RED).
const shareTextMatch =
  /const SHARE_TEXT =((?:[^;"'`]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)*);/.exec(
    kitRaw,
  );
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
// The fixture CARRIES an `&` (a channel tag, the kit's real link shape): an
// encodeURIComponent-free builder would leak it as a stray top-level intent
// param and fail the exact-param assertions below (2026-08-03 adversarial
// review — the all-benign fixture let an enc-free builder pass).
const FIX_URL = "https://thesyndicate.money/join?via=0x1234abcd&via2=youtube";
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
  // Parse the mailto like an intent: subject and body are their own params —
  // text+url stuffed into the subject with an empty body passed the old
  // whole-href includes() (2026-08-03 adversarial review).
  const emUrl = new URL(em.build(FIX_URL, FIX_TEXT));
  check(
    emUrl.protocol === "mailto:" &&
      emUrl.searchParams.get("subject") === "The Syndicate" &&
      emUrl.searchParams.get("body") === `${FIX_TEXT} ${FIX_URL}`,
    "email: mailto carries its subject + the inline «text url» BODY",
    `email: inline contract drifted — got ${em.build(FIX_URL, FIX_TEXT)}`,
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

// ── 7. THE PICTURE TRAVELS — and the channel tag rides with it ──────────────
// THE SLICE (founder catch, 2026-08-03, screenshots of /referral/tools + an X
// composer): every artifact row's Share… produced the SAME picture, and it was
// none of the artifacts. The mechanism, traced end to end: all 16 rows hand the
// box ONE url (the bare join link) → an intent url carries text + a link and
// CANNOT carry an image (X/Telegram/WhatsApp/LinkedIn/Facebook all render the
// LINK's unfurl) → serve.mjs sendJoinShell points og:image at
// /api/join-card/<sourceId>.png → the K2 invitee card. So the artifact the
// member is looking at never travelled, and nothing on screen said so.
//
// The platform half is PHYSICS, not our bug — no web share intent on any
// network accepts media. What was ours: the UI promised 16 different shares and
// delivered one, and the six network links carried NO &via= tag while the same
// page prints « the channel tag is already in each link — Channels counts
// everything ». Both are pinned here:
//   · the artifact's PNG is delivered on an intent act (the member attaches it)
//     by the SAME one function the OS-sheet fallback uses — never a second
//     private raster+download sequence;
//   · the box states what travels (intentHint), between the grid and the sheet;
//   · the shared link is resolved per network through linkForTarget, so the
//     kit can tag it — and &via= is composed in ONE place for the whole studio.
//
// THE TWIN SEARCH that shaped this (run 2026-08-03, pasted in the commit): the
// `&via=` composition lived in THREE homes — withVia() in referrerKit.tsx plus
// two hand-built templates in ReferralLinkPanel.tsx (the channels composer and
// the per-row copy button). The kit's new per-network tag would have been a
// FOURTH. So withVia moved to lib/joinLink.ts (beside buildJoinLink — the join
// link and its channel tag are one fact) and pin 7a keeps it alone there.
//
// NOT COVERED (the report-shape law): this reads source. It does not run a
// browser, so whether a given network's composer actually suppresses the link
// card once media is attached, and whether the download lands, stay preview
// territory. The unfurl PICTURE itself is join-card.guard's authority.
const JOINLINK_LIB = path.join(srcDir, "lib", "joinLink.ts");

// 7a — ONE &via= COMPOSER. Matches COMPOSITION only (`&via=${…}` in a template,
// or a quoted "&via=" concatenation) — never the JSX display text the kit prints
// to name a channel to the member (`<span>&via=youtube</span>`).
const VIA_COMPOSITION = /&via=\$\{|["'`]&via=["'`]\s*\+/;
for (const file of walk(srcDir)) {
  if (file === JOINLINK_LIB) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !VIA_COMPOSITION.test(code),
    `${rel(file)}: no private channel-tag composition`,
    `${rel(file)}: composes "&via=" privately — import { withVia } from "@/lib/joinLink" (the channel tag is ONE fact; three homes were found 2026-08-03)`,
  );
}
const joinLinkSrc = tryRead(JOINLINK_LIB);
check(
  joinLinkSrc !== null && /export function withVia/.test(joinLinkSrc),
  "lib/joinLink.ts: withVia is the one channel-tag composer",
  "lib/joinLink.ts: withVia MISSING — the &via= channel tag must live beside buildJoinLink, the one join-link authority",
);

// 7c/7d/7e — the box's side of the contract.
if (surfaceSrc !== null) {
  const s = stripComments(surfaceSrc);
  check(
    /linkForTarget/.test(s) && /shareIntentArgs\(\s*t\s*,/.test(s),
    "box: the intent link is resolved per target (linkForTarget) before the split",
    "box: the intent link is not resolved through linkForTarget — every network gets the same untagged url and Channels cannot count a single social share",
  );
  check(
    /onIntent\s*\?\.\(/.test(s),
    "box: an intent act fires onIntent (the mount decides what else travels)",
    "box: onIntent is never fired — the kit cannot hand the member the artifact the intent could not carry",
  );
  const gridIdx = s.indexOf("orderedShareTargets.map");
  // The RENDER site, via its testid — `intentHint` itself first appears in the
  // destructured props, above everything, and would pass this order test while
  // rendering nowhere.
  const hintIdx = s.indexOf("-intent-hint");
  const nativeIdx = s.indexOf("-other-apps");
  check(
    gridIdx !== -1 && hintIdx !== -1 && nativeIdx !== -1 && gridIdx < hintIdx && hintIdx < nativeIdx,
    "box: the honest what-travels line sits under the six, above the OS sheet",
    "box: intentHint must render BETWEEN the six-network grid and «Share with other apps» — the member is told what a link intent can and cannot carry, where he decides",
  );
}

// 7f/7g — the kit's side: it opts in to all three, and the PNG delivery is ONE
// function (the OS-sheet fallback and the intent path share it — the twin law).
for (const [prop, why] of [
  ["linkForTarget", "each network's link carries its own &via= channel tag"],
  ["onIntent", "the artifact's picture is delivered when the intent cannot carry it"],
  ["intentHint", "the box states what actually travels on a link intent"],
] as const) {
  check(
    // Either JSX spelling — `prop={…}` or the plain string literal a copy prop
    // takes. TypeScript already refuses a string where a function is typed, so
    // pinning the PROPERTY (is it passed at all?) is the whole job here; a
    // brace-only pin would go red on correct idiomatic JSX.
    new RegExp(`${prop}=[{"]`).test(kit),
    `kit: opts in to ${prop}`,
    `kit: does not pass ${prop} to ShareSurface — ${why}`,
  );
}
check(
  /function deliverArtifactPng/.test(kit) &&
    (kit.match(/deliverArtifactPng\s*\(/g) ?? []).length >= 3,
  "kit: ONE artifact-PNG delivery, used by both the OS-sheet fallback and the intent path",
  "kit: the artifact-PNG delivery must be ONE function (deliverArtifactPng) called by BOTH the native fallback and the intent path — a second private rasterize+download sequence is the twin disease this file exists to kill",
);
check(
  /linkForTarget=\{\s*\(t\)\s*=>\s*withVia\(/.test(kit),
  "kit: tags each network through THE composer (withVia), never a private string",
  "kit: linkForTarget must compose the tag through withVia(joinLink, t.id) — the channel tag is one imported fact",
);

// 7h — THE TAGGED CONTRACT, EXECUTED. The real split + the real builders run
// on a link ALREADY carrying its channel tag: what a click actually produces,
// measured, not reasoned about. The risk this covers is encoding — a tag lost,
// doubled, or leaked as a stray top-level intent param — and the inline body
// (whatsapp · email) carrying the UNTAGGED link while the url-param intents
// carry the tagged one.
//
// The fixture's tag is written here as INPUT DATA, not a second composer: this
// script is plain node and cannot import lib/joinLink.ts (its "@/" alias does
// not resolve without the bundler), so withVia's one-line body is held by the
// scan pins 7a/7b above, and this block executes everything downstream of it.
// Verified against prod the same day: /join?source=…&via=x serves the SAME
// painted og:image as the bare link — a tag never costs the unfurl.
const FIX_JOIN = "https://thesyndicate.money/join?source=0xabc123";
for (const t of orderedShareTargets) {
  const tagged = `${FIX_JOIN}&via=${t.id}`;
  const inline = `${FIX_TEXT} ${tagged}`;
  const [intentUrl, intentText] = shareIntentArgs(t, tagged, FIX_TEXT, inline);
  const built = new URL(t.build(intentUrl, intentText));
  const carried =
    built.searchParams.get("url") ??
    built.searchParams.get("u") ??
    built.searchParams.get("text") ??
    built.searchParams.get("body") ??
    "";
  check(
    carried === tagged || carried === inline,
    `${t.id}: carries the CHANNEL-TAGGED link, encoding intact`,
    `${t.id}: the tagged link did not survive the intent — expected "${tagged}" (or the inline "${inline}"), the draft carries "${carried}"`,
  );
  check(
    (built.href.match(/via%3D|via=/g) ?? []).length === 1,
    `${t.id}: the tag rides exactly once (never doubled, never a stray top-level param)`,
    `${t.id}: the &via= tag appears ${(built.href.match(/via%3D|via=/g) ?? []).length}× in ${built.href} — an encoding-free builder leaks it as its own intent param`,
  );
}
check(
  new Set(orderedShareTargets.map((t) => t.id)).size === orderedShareTargets.length,
  "channels: the six networks tag six DISTINCT channels (the breakdown can tell them apart)",
  "channels: two networks share a &via= tag — their shares collapse into one Channels row",
);

// ── 8. EACH ARTIFACT'S OWN PICTURE (founder ruling 2026-08-03, «je veux chaque
// image») ───────────────────────────────────────────────────────────────────
// The first cut of this slice accepted one picture for all sixteen artifacts as
// a platform limit. It is not: a preview shows what the shared URL DECLARES,
// and the URL is ours. So every artifact ships its own `&card=` face, the api
// paints it, and serve.mjs points og:image at it. These pins keep the chain
// unbroken end to end — a break anywhere silently restores the old defect,
// because a wrong face still unfurls a valid picture.
//
// NOT COVERED here (the api owns them, join-card.guard pins them): what each
// face contains, its parity with the downloaded card, and the fail-closed
// fallback. This file pins only that the STUDIO asks for the right face.
const FACES = ["invite", "standing", "seat", "record"] as const;
const kitArtifacts = stripComments(readFileSync(path.join(srcDir, "components", "referral", "referrerKit.tsx"), "utf8"));

// 8a — THE COMPOSERS, EXECUTED. A name pin is theatre: the 7-agent review
// (2026-08-03) proved that replacing withCard's BODY with `return joinLink`
// disabled this entire slice — sixteen artifacts back to one picture — with
// 2285/2285 here and 60/60 in join-card.guard, both green. The guard cannot
// import lib/joinLink.ts (its "@/" alias does not resolve in plain node), so
// the two pure one-liners are LIFTED from the source and RUN.
function runComposer(name: string, src: string): ((link: string, v: string) => string) | null {
  const m = new RegExp(`export function ${name}\\(([^)]*)\\)[^{]*\\{([\\s\\S]*?)\\n\\}`).exec(src);
  if (m === null) return null;
  try {
    const params = m[1]!.split(",").map((a) => a.split(":")[0]!.trim());
    // eslint-disable-next-line no-new-func -- the point IS to run the real body
    return new Function(params[0]!, params[1]!, m[2]!) as (l: string, v: string) => string;
  } catch {
    return null;
  }
}
const FIX_BASE = "https://thesyndicate.money/join?source=0xabc123";
const runVia = joinLinkSrc === null ? null : runComposer("withVia", joinLinkSrc);
const runCard = joinLinkSrc === null ? null : runComposer("withCard", joinLinkSrc);
check(
  runCard !== null && runCard(FIX_BASE, "seat") === `${FIX_BASE}&card=seat`,
  "lib/joinLink.ts: withCard EXECUTES to the face-bearing link",
  `lib/joinLink.ts: withCard's BODY does not compose "&card=" — got "${runCard === null ? "(unparseable)" : runCard(FIX_BASE, "seat")}". Every artifact would share the same link again, and every name-based pin would stay green.`,
);
check(
  runVia !== null && runVia(FIX_BASE, "x") === `${FIX_BASE}&via=x`,
  "lib/joinLink.ts: withVia EXECUTES to the channel-tagged link",
  `lib/joinLink.ts: withVia's BODY does not compose "&via=" — got "${runVia === null ? "(unparseable)" : runVia(FIX_BASE, "x")}". Channels would count nothing and every name pin would stay green.`,
);
check(
  runCard !== null && runVia !== null && runVia(runCard(FIX_BASE, "record"), "telegram") === `${FIX_BASE}&card=record&via=telegram`,
  "lib/joinLink.ts: the two compose — face then channel, both surviving",
  "lib/joinLink.ts: composing withVia over withCard does not yield both params — the kit stacks them on every intent",
);
const CARD_COMPOSITION = /&card=\$\{|["'`]&card=["'`]\s*\+/;
for (const file of walk(srcDir)) {
  if (file === JOINLINK_LIB) continue;
  const code = stripComments(readFileSync(file, "utf8"));
  check(
    !CARD_COMPOSITION.test(code),
    `${rel(file)}: no private face composition`,
    `${rel(file)}: composes "&card=" privately — import { withCard } from "@/lib/joinLink"`,
  );
}

// 8b — EVERY artifact declares a face. An artifact without one would silently
// fall back to the invitation, which is exactly the defect being fixed.
// Extract the TABLE BLOCK first: the KitArtifactSpec interface declares
// `previewFace: "invite" | "standing" | …`, whose first quoted token would
// otherwise count as a 17th artifact and make the count pin lie (caught by its
// own first run — the union's head read as a declaration).
const kitTable = /export const KIT_ARTIFACTS[\s\S]*?\n\];/.exec(kitArtifacts)?.[0] ?? "";
check(
  kitTable.length > 0,
  "kit table: the KIT_ARTIFACTS block was located",
  "kit table: KIT_ARTIFACTS could not be extracted from referrerKit.tsx — the face pins below cannot judge anything",
);
const specIds = [...kitTable.matchAll(/\{\s*id:\s*"([a-z0-9]+)"/g)].map((m) => m[1]!);
const faceDecls = [...kitTable.matchAll(/previewFace:\s*"([a-z]+)"/g)].map((m) => m[1]!);
check(
  specIds.length > 0 && faceDecls.length === specIds.length,
  `kit table: all ${specIds.length} artifacts declare a preview face`,
  `kit table: ${specIds.length} artifacts but ${faceDecls.length} previewFace declaration(s) — an artifact with no face silently shares the invitation, the very defect this slice closed`,
);
for (const f of faceDecls) {
  check(
    (FACES as readonly string[]).includes(f),
    `kit table: "${f}" is a real painted face`,
    `kit table: previewFace "${f}" is not a painted face — the api would degrade it to the invitation (faces: ${FACES.join(" · ")})`,
  );
}
// The three messages must each actually be claimed by some artifact — a face
// painted server-side that nothing ever asks for is dead weight, and a message
// with no face is a picture that never travels.
for (const f of FACES) {
  check(
    faceDecls.includes(f),
    `kit table: the "${f}" face is claimed by at least one artifact`,
    `kit table: no artifact declares the "${f}" face — either the message lost its picture or the painter carries a face nobody shares`,
  );
}

// 8c — the row's doors hand out the FACE-BEARING link. Copy, the six intents
// and the OS sheet must all carry it; a door still handing out the bare
// joinLink is a door whose preview is somebody else's picture.
check(
  /const faceLink = withCard\(joinLink, spec\.previewFace\)/.test(kit),
  "kit: the row derives its face-bearing link once, from its own spec",
  "kit: the artifact row does not derive faceLink = withCard(joinLink, spec.previewFace) — its doors would hand out a link whose preview is not this artifact",
);
for (const [door, needle] of [
  ["the box + Copy link", "pageUrl={faceLink}"],
  ["the six intents", "linkForTarget={(t) => withVia(faceLink, t.id)}"],
  ["the inline text (whatsapp · email)", "textInline={`${SHARE_TEXT} ${faceLink}`}"],
] as const) {
  check(
    kit.includes(needle),
    `kit: ${door} carries the face`,
    `kit: ${door} does not carry the face-bearing link (\`${needle}\`) — that door's share previews the wrong picture`,
  );
}
// The row's own Copy button and the OS sheet, by absence of the bare link:
// inside ArtifactActions nothing may reference joinLink except faceLink's
// derivation (the panel below still uses joinLink for the creator blocks).
const actions = kit.slice(kit.indexOf("function ArtifactActions"), kit.indexOf("function CopyButton"));
check(
  (actions.match(/joinLink/g) ?? []).length === 3,
  "kit: inside the artifact row, joinLink survives ONLY as faceLink's input (prop, type, derivation)",
  `kit: ArtifactActions still reads joinLink ${(actions.match(/joinLink/g) ?? []).length}× (expected 3: the prop, its type, and the faceLink derivation) — a door is handing out the un-faced link`,
);

// 8d — THE SERVED HEAD. The chain ends at serve.mjs: it must accept the face
// and point og:image at it, or every face above paints for nothing.
const serveSrc = tryRead(path.resolve(srcDir, "..", "server", "serve.mjs"));
check(serveSrc !== null, "serve.mjs is readable", "server/serve.mjs could not be read — the served head cannot be pinned");
if (serveSrc !== null) {
  const s = stripComments(serveSrc);
  check(
    /JOIN_CARD_FACE_RE\s*=\s*\/\^\(invite\|standing\|seat\|record\)\$\//.test(s),
    "serve.mjs: the face vocabulary mirrors the painter's JOIN_CARD_FACES",
    "serve.mjs: the accepted face list drifted from the painter's JOIN_CARD_FACES (invite · standing · seat · record) — a face the studio hands out would be dropped from the head",
  );
  check(
    /searchParams\.get\("card"\)/.test(s) && /sendJoinShell\([^)]*cardParam/.test(s),
    "serve.mjs: the face is read from the query and reaches the shell",
    "serve.mjs: ?card= is not read into sendJoinShell — every shared artifact would unfurl the invitation again",
  );
  check(
    /join-card\/\$\{sourceId\}\.png`?\s*\+[\s\S]{0,160}\?card=\$\{cardFace\}/.test(s),
    "serve.mjs: og:image carries the requested face",
    "serve.mjs: the join-card image url does not carry ?card= — the head would declare one picture for every artifact (the original defect)",
  );
  // THE PIN THAT WAS BACKWARDS (caught by the 7-agent review, 2026-08-03, before
  // any deploy). It used to demand og:url stay CANONICAL — enshrining a choice
  // that defeats the whole slice on Facebook and LinkedIn, which resolve a
  // preview against og:url as the object's identity. The receipt shell has
  // always done the right thing (`?f=` rides its og:url); the join shell must
  // match. The face rides; the CHANNEL TAG must not — `via` is tracking and
  // would fragment one object into six.
  check(
    /const pageUrl = `\$\{CANONICAL_ORIGIN\}\/join\?source=\$\{sourceId\}\$\{faceSuffix\}`/.test(s) &&
      /faceSuffix[\s\S]{0,120}`&card=\$\{cardFace\}`/.test(s),
    "serve.mjs: og:url carries the FACE (each faced link is its own share-graph object — the receipt precedent)",
    "serve.mjs: og:url does not carry the face — Facebook and LinkedIn resolve the preview against og:url, so every artifact would unfurl the invitation again on those two networks",
  );
  check(
    !/pageUrl[\s\S]{0,200}via=/.test(s),
    "serve.mjs: the channel tag stays OUT of og:url (tracking never fragments the object)",
    "serve.mjs: og:url carries a &via= channel tag — one share-graph object would split into six, one per network",
  );
}

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:share-intents] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:share-intents] PASS — ${ok.length}/${ok.length} share-intent pins hold.`);
