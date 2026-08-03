// scripts/join-card.guard.ts — K2 · the invitee-card pins (BLOCKING).
// The receipt-card guard's canon applied to the join-card zone: the card
// speaks the approved register only, fails closed to the generic image,
// derives the SHORT wallet form server-side, and ships the house faces.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const zone = path.resolve(here, "..", "src", "joincard");
const routeFile = path.resolve(here, "..", "src", "routes", "joinCard.ts");
const fontsDir = path.resolve(here, "..", "src", "receiptcard", "fonts");

const errors: string[] = [];
let checks = 0;
function check(cond: boolean, fail: string): void {
  checks++;
  if (!cond) errors.push(fail);
}

/** Read, or "" — an absent file fails its pins loudly instead of throwing. */
function tryReadOr(abs: string): string {
  return existsSync(abs) ? readFileSync(abs, "utf8") : "";
}

/**
 * COMMENT STRIPPING — added 2026-08-03 after a 7-agent review proved this file
 * had none, so several of its own pins were satisfied by the very documentation
 * that described them (`FACE_FALLBACK`, `displayRung`, and every word-parity
 * phrase lived in a comment on at least one side). A pin that its own header
 * can satisfy protects nothing.
 *
 * Line comments first, and a `//` line carrying a block CLOSER is preserved —
 * deleting it would hand the block the next closer and swallow real code (the
 * house stripper's shape, learned from guard-activity-mine's own RED cycle).
 *
 * The PRE-EXISTING pins deliberately keep reading RAW text: some of them assert
 * that a POSTURE IS DOCUMENTED (e.g. "introducerRead lost its fail-closed
 * posture"), which is a comment check on purpose.
 */
function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/(?![^\n]*\*\/).*$/gm, "")
    .replace(/([^:"'])\/\/(?![^\n"']*\*\/)[^\n"']*$/gm, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const painter = readFileSync(path.join(zone, "joinCardPainter.ts"), "utf8");
const reader = readFileSync(path.join(zone, "introducerRead.ts"), "utf8");
const mark = readFileSync(path.join(zone, "synMark.ts"), "utf8");
const route = readFileSync(routeFile, "utf8");
const all = painter + reader + route;
// LIVE-CODE twins for sections 12-13 (see stripComments above).
const painterCode = stripComments(painter);
const readerCode = stripComments(reader);
const routeCode = stripComments(route);
const allCode = painterCode + readerCode + routeCode;

// 1 · the approved register, verbatim — the card never improvises copy.
check(painter.includes("You were introduced."), "painter lost the approved hook 'You were introduced.'");
check(painter.includes("recorded on-chain when you take your seat."), "painter lost the recorded-on-chain line");
check(
  painter.includes("Every purchase is a verifiable receipt. Proof, not promises."),
  "painter lost the provable hook line",
);
check(
  painter.includes("SEATS ARE OPEN — SEE HOW MEMBERSHIP WORKS"),
  "painter lost the approved door line",
);
check(painter.includes("THE SYNDICATE"), "painter lost the masthead");

// 2 · the red line — promo/urgency/price vocabulary can never enter the card.
const RED_LINE =
  /\b(discount|promo|offer|sale ends|limited|hurry|urgent|bonus|reward|free|fixed price|price is)\b/i;
check(!RED_LINE.test(painter), "red-line vocabulary entered the painter");

// 3 · no recompute, no arithmetic on facts — the card carries a wallet, never money.
check(!/parseFloat|toFixed/.test(all), "float arithmetic entered the join-card path");
check(!/\$\d/.test(painter), "a dollar figure entered the painter — the invitee card carries no money");

// 4 · ADR-003 — the SHORT form is derived server-side; the full address never leaves.
check(reader.includes("slice(0, 6)") && reader.includes("slice(-4)"), "the short-form derivation left introducerRead");
check(!/getAddress\(/.test(route) && !/0x[0-9a-fA-F]{40}/.test(route), "a full address surfaced in the route");

// 5 · fail-closed serving — the generic picture, never a broken card.
check(route.includes("opengraph.jpg") && route.includes("302"), "the 302 generic fallback left the route");
check(route.includes("paintJoinCard") && route.includes("png === null"), "the null-paint fallback left the route");
check(route.includes("facts === null"), "the unresolved-introducer fallback left the route (M2-v2: the enriched read's null → the generic image)");
check(reader.includes("fail closed") || reader.includes("fail-closed"), "introducerRead lost its fail-closed posture");

// 6 · the real emblem + the house faces ship with the bundle.
check(mark.includes("data:image/svg+xml;base64,"), "the interlock emblem data URI left synMark");
check(painter.includes("SYN_MARK_DATA_URI"), "the painter no longer mounts the real emblem");
for (const f of [
  "IBMPlexMono-Regular.ttf",
  "IBMPlexMono-SemiBold.ttf",
  "WorkSans-Regular.ttf",
  "WorkSans-SemiBold.ttf",
  "OFL-NOTICE.md",
]) {
  check(existsSync(path.join(fontsDir, f)), `font asset missing: ${f}`);
}

// 7 · the share standard + the ceiling (WhatsApp-safe).
check(painter.includes("CARD_W = 1200") && painter.includes("CARD_H = 630"), "the 1200×630 share standard left the painter");
check(painter.includes("CARD_MAX_BYTES = 300_000") && painter.includes("<= CARD_MAX_BYTES"), "the 300KB ceiling left the painter");

// 8 · the read discipline — chain probed, selector computed never hand-typed.
check(reader.includes("probeChain"), "the chain-identity probe left introducerRead");
check(reader.includes('keccak256') && reader.includes('sourceConfig(bytes32)'), "the computed selector left introducerRead");

// 9 · THE STATUS GATE (adversarial verify 2026-07-21): only an ACTIVE source
// unfurls an attribution — a paused/revoked source's card must fall to the
// generic image, exactly as the /join page's own validation denies it.
check(reader.includes("SELECTOR_SOURCE_IS_ACTIVE"), "the isActive status gate left introducerRead");
check(reader.includes("decodeBool(activeData) === true"), "the strict active check left introducerRead");

// 10 · the mutable-fact cache law: the painted bytes expire — never immortal.
check(route.includes("CACHE_TTL_MS"), "the PNG cache TTL left the route");
check(!route.includes("max-age=86400"), "the day-long HTTP cache returned over a mutable fact");

// 11 · M2-v2 — THE LIVING IDENTITY LINE (founder « go dans l'ordre »,
//     2026-08-03): the card carries the introducer's SEAT + CHAPTER when the
//     continuity spine resolves them (wallet↔seat is PUBLIC chain data — the
//     /registry precedent; the full address STILL never leaves the reader),
//     and degrades to the plain short-wallet card when it cannot — fail
//     closed, never an invented seat.
check(reader.includes("introducerFacts"), "the enriched introducer read (introducerFacts) is missing");
check(reader.includes("seatLine"), "introducerRead no longer derives the living seat line");
check(reader.includes("memberContinuityRecord"), "the seat resolution no longer reads the continuity spine");
check(reader.includes("chapterForSeat"), "the chapter identity left the seat-line derivation");
check(painter.includes("seatLine"), "the painter no longer accepts the living identity line");
check(painter.includes("seatLine !== null"), "the painter lost the honest degradation branch (plain card when no seat)");
check(route.includes("introducerFacts"), "the card route no longer uses the enriched read");

// 12 · THE FACES (founder GO 2026-08-03, after he refused «une seule image pour
//     les seize»). A link preview shows what the LINK declares, and the link is
//     ours — so each artifact's share now declares ITS OWN face:
//       no ?card=          → the invitation (unchanged, the K2 approved card)
//       ?card=standing     → his standing card   (client twin: CardOg)
//       ?card=seat         → his collectible     (client twin: CardVanityOg)
//       ?card=record       → his record card     (client twin: RecordCard)
//     Every face is 1200×630 — the ONE shape all five preview networks render
//     (X · Facebook · LinkedIn · WhatsApp · Telegram; checked in their specs
//     2026-08-03). Email has no preview at all: its picture rides the download.
//
//     THE PARITY THIS SECTION EXISTS FOR: these three faces are a DELIBERATE
//     cross-artifact twin — the same card painted in React for the download and
//     in satori for the preview (the receipt-card precedent). A member must
//     never post a preview that contradicts the picture he downloaded, so the
//     WORDS are reconciled here against the studio source, value by value.
// The parity CORPUS is both studio files that speak these cards: referrerKit
// paints the artifacts, ReferralToolsPanel assembles the standing/record lines
// that go on them. A phrase living in either one is the download's wording.
const studioRef = path.resolve(here, "..", "..", "studio", "src", "components", "referral");
const kitCode = ["referrerKit.tsx", "ReferralToolsPanel.tsx"]
  .map((f) => (existsSync(path.join(studioRef, f)) ? readFileSync(path.join(studioRef, f), "utf8") : ""))
  .join("\n");
check(kitCode.length > 0, "the studio referral sources could not be read — the face parity cannot be reconciled");

// 12a · the face registry is ONE list, in the painterCode, and the routeCode admits
//       exactly it (never a private second spelling).
check(/export const JOIN_CARD_FACES/.test(painterCode), "JOIN_CARD_FACES missing — the face list must be ONE exported fact in the painterCode");
// The routeCode must admit a face through THE one admitter (faceFromParam, which
// closes over JOIN_CARD_FACES) — never by re-testing the string itself.
check(
  routeCode.includes("faceFromParam") && !/["'](standing|seat|record)["']\s*(===|==)/.test(routeCode),
  "the routeCode does not admit faces through faceFromParam — an unknown ?card= must degrade to the invitation, and the face list is not re-tested at the call site",
);
check(
  /faceFromParam\s*\(\s*req\.query\[/.test(routeCode),
  "the routeCode does not read the face from the request query — ?card= would never reach the painterCode",
);
for (const face of ["standing", "seat", "record"]) {
  check(painterCode.includes(`"${face}"`), `the painterCode does not declare the "${face}" face`);
}

// 12b · THE RUNG TRAP (found by the twin search, 2026-08-03, BEFORE any line
//       was written). The server already carries `entitledTitle` — but that is
//       the RATE ladder (entitledRateRung filters raisesRate), while the card
//       the member downloads shows the TITLE ladder (highest threshold met).
//       They DIVERGE at 3–9 durable introductions: the download says «Active
//       Connector», entitledTitle says «Emerging». Using it here would have
//       shipped a preview that contradicts his own card. The join-card zone
//       must therefore never touch entitledTitle.
check(
  !/entitledTitle/.test(painterCode + readerCode),
  "entitledTitle entered the join-card zone — that is the RATE ladder; the card shows the TITLE ladder (they disagree at 3–9 durable introductions). Use the display rung.",
);
check(
  readerCode.includes("displayRung"),
  "the readerCode does not resolve the rung through displayRung — the title ladder is ONE function in connectorLadderCanon, never re-derived",
);
check(
  /export function displayRung/.test(
    readFileSync(path.resolve(here, "..", "src", "lib", "protocol", "connectorLadderCanon.ts"), "utf8"),
  ),
  "connectorLadderCanon.displayRung MISSING — the TITLE ladder needs its own named function beside entitledRateRung, on the same table",
);

// 12c · WORD PARITY with the downloaded card, reconciled against the studio.
//       Each pair is a phrase that must read identically on both artifacts.
for (const [phrase, why] of [
  ["Connector", "the rung suffix — the ONLY standing word a face may carry"],

  ["introduced", "the record line's verb"],
  ["DON'T TRUST — VERIFY", "the verify seal"],
] as const) {
  // BOTH corpora are ZONES, not single files: on our side a phrase may be
  // composed in the readerCode (the standing/record lines) or printed in the
  // painterCode (the verify seal); on the studio side, in the kit or the panel.
  check(
    allCode.includes(phrase) && kitCode.includes(phrase),
    `face parity broken: "${phrase}" (${why}) is not present on BOTH the join-card zone and the studio artifact — the preview would contradict the download`,
  );
}

// 12d · FAIL CLOSED, per face. A face whose facts do not resolve must fall back
//       to the invitation — never a half-empty boast, never an invented figure
//       (the client's own rule: the record card mounts only on a real record).
// THE NO-FALLING-FIGURE LAW (founder ruling 2026-08-03, option (a)). A painted
// preview may never carry a figure that can go DOWN: the networks cache a
// scraped og:image per URL for months, so a brand-new referrer would have
// frozen "0 durable introductions" onto the very link he recruits with. The
// rung (a TITLE) and the record count (monotone UP — a stale value understates)
// are the only standing facts a face may print.
// NO SEAT IS NOT NO CARD (founder correction 2026-08-03). A signed-in SYN
// holder with no seat is a legitimate referrer — the chain gates on the SYN
// balance, never the seat (SPEC_REFERRAL_SYSTEM §262/§436). His standing face
// must degrade to the same fallback headline his DOWNLOAD uses, never refuse
// to paint, or his every share falls back to the invitation.
check(
  painterCode.includes('f.seatLineFull ?? "An on-chain introduction record"'),
  'the standing face refuses to paint without a seat — a seatless SYN holder is a real referrer, and his card must degrade to the studio fallback headline, not to the invitation',
);
check(
  painterCode.includes("rungLine") && painterCode.includes("recordLine"),
  "the painter no longer carries rungLine/recordLine — the member faces lost their standing facts",
);
check(
  !/durable introduction/.test(allCode),
  "a DURABLE-INTRODUCTION COUNT re-entered the join-card zone — that figure can FALL, and a network's image cache outlives ours by months (the frozen-zero defect). Print the rung, never the count.",
);
// THE FALLBACK ITSELF, in live code. This pin used to accept the token
// `FACE_FALLBACK` — which existed ONLY in the route's own comment, so deleting
// the entire fallback expression left it green (7-agent review, 2026-08-03).
// It now matches the expression that does the work.
check(
  /paintJoinCard\(facts, face[\s\S]{0,40}\?\?[\s\S]{0,160}paintJoinCard\(facts, "invite"/.test(routeCode),
  "the route has no live fallback to the invitation face — a member face whose facts do not resolve must repaint as the invitation, never 302 to the generic site image",
);

// 12e · the cache is keyed BY FACE — four faces per source, never one bucket
//       serving another face's bytes (the mutable-fact cache law, per face).
check(
  /cache\.get\(\s*(`|[A-Za-z]+Key)/.test(routeCode) && routeCode.includes("face"),
  "the painted-bytes cache is not keyed by face — one face's picture would be served for another",
);

// 13 · THE QR ON THE MEMBER FACES (founder order 2026-08-03: «il y a plus les
//     qr codes, ajoutes — ajuste aussi la taille»). The inherited header said
//     «No QR — the unfurl IS the link» and I carried it onto the new faces. He
//     refused it, rightly: a card is SCREENSHOT and re-posted as an image, and
//     at that moment the link is gone — the code is the only way back. Two real
//     defects were then found by reading the rendered PIXELS back, neither of
//     them visible in the source:
//       · satori resolves an absolute child against the PADDING box, so the
//         plate declared at left:64 renders at x=66 on a 2px-bordered card,
//         while the grid is injected in raw SVG coordinates — the code sat 2px
//         off its own plate and ate the quiet zone on two sides;
//       · a hand-picked 12px pad left 10px ≈ 2.6 modules where the QR standard
//         asks FOUR — and the right pad depends on the link's length, so a
//         pixel constant is a guess by construction.
//     Verified after the fix by sampling the painted pixels module by module
//     against the expected encoding: 1681/1681 identical, quiet zone 4.15
//     modules. NOT COVERED: an actual optical scan by a phone camera.
const qrLib = tryReadOr(path.resolve(here, "..", "src", "lib", "cards", "qrGrid.ts"));
check(
  /export function qrSvgGroup/.test(qrLib) && /export function injectQr/.test(qrLib),
  "lib/cards/qrGrid.ts MISSING its injector — the painted-card QR grid must have ONE home (the receipt card and the join card both draw it)",
);
check(
  /export function quietZonePad/.test(qrLib) && /4 \* box\) \/ \(n \+ 8\)/.test(qrLib),
  "quietZonePad is missing or no longer derives FOUR MODULES from the payload's own density — a pixel pad is a guess that goes under-spec on a longer link",
);
// No second injector anywhere: the receipt card must consume the shared one.
const receiptPainter = tryReadOr(path.resolve(here, "..", "src", "receiptcard", "painter.ts"));
check(
  /injectQr\(/.test(receiptPainter) && !/function qrSvgGroup/.test(receiptPainter),
  "receiptcard/painterCode.ts re-implements the QR injector — it must consume lib/cards/qrGrid (one wrong quiet zone in a copy is an unscannable code nobody notices)",
);
// The join painterCode: a reserved plate, the border offset applied, the computed
// pad used, and the INVITATION deliberately left without a code.
check(
  /position: "relative"/.test(painterCode) && /function qrPlate/.test(painterCode),
  "the join painterCode no longer reserves a positioned QR plate — the injected grid would land on the raw card, off any white background",
);
check(
  /const CARD_BORDER = 2/.test(painterCode) && /x: QR_X \+ CARD_BORDER/.test(painterCode) && /y: QR_Y \+ CARD_BORDER/.test(painterCode),
  "the join painterCode dropped the border offset — satori positions the plate against the PADDING box while the grid is injected in raw SVG coordinates; without it the code sits 2px off its plate and loses quiet zone on two sides (measured 2026-08-03)",
);
check(
  /pad: quietZonePad\(QR_BOX, joinLink\)/.test(painterCode),
  "the join painterCode hand-picks its QR pad again — the quiet zone must be computed from the link's own density (four modules)",
);
check(
  /face === "invite" \|\| joinLink === null[\s\S]{0,40}\? null/.test(painterCode),
  "the invitation face is no longer excluded from the QR — its layout is founder-approved without one, and a null link must never draw an empty plate",
);

// 14 · THE FIRST SCRAPE IS PERMANENT — the deadline + single flight.
//     A network caches what it got on its FIRST scrape for months, so a slow
//     chain during a member's first share used to glue "no preview" to his link
//     for good: three sequential RPC legs × two endpoints × an 8s abort, plus a
//     DB pool with no acquire timeout, could take 16–40s while Facebook gives up
//     around 10. And one share fans out to five networks at once, so the same
//     cold key ran every one of those reads and paints in parallel — on the same
//     event loop that serves members' auth, with resvg's render being a
//     SYNCHRONOUS native call.
//     MEASURED 2026-08-03, both on a real rig: unreachable chain → 302 in
//     2.02s (was 16–40s) and NOT cached as a negative (a second attempt still
//     tried); 8 simultaneous cold requests → 3ms spread, i.e. ONE paint served
//     all eight (undeduped they stagger by ~200ms each).
//     NOT COVERED: the budget's VALUE against a given network's real patience —
//     that is a live-crawler fact, not a source fact.
check(
  /FACTS_BUDGET_MS\s*=\s*\d/.test(readerCode) && /withDeadline\(/.test(readerCode),
  "the introducer read lost its deadline — a slow chain answers after the crawler has gone, and its FIRST scrape is what a network keeps",
);
check(
  /if \(raced === TIMED_OUT\)[\s\S]{0,120}return null;/.test(readerCode) &&
    !/rememberFacts\([^)]*TIMED_OUT/.test(readerCode),
  "a timed-out read is being cached — a slow chain is not a decided negative, and caching it pins 'no card' for the whole negative TTL over one hiccup",
);
for (const [file, code, what] of [
  ["introducerRead.ts", readerCode, "the chain+spine read"],
  ["routes/joinCard.ts", routeCode, "the satori paint"],
] as const) {
  check(
    /inFlight|singleFlight|painting/.test(code),
    `${file}: ${what} has no single-flight map — one share fans out to five networks and every one of them would pay for it separately`,
  );
}

if (errors.length > 0) {
  console.error(`[guard:join-card] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`[guard:join-card] PASS — ${checks}/${checks} invitee-card pins hold.`);
