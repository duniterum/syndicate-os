// Guard: THE PAINTED PREVIEW CARDS (the painted-cards slice, founder-approved
// faces 2026-07-20). The card is the receipt's outward projection — its laws
// are the proven share card's, pinned here so they can never silently relax:
//
//   1. AMOUNTS ARE NEVER HIDDEN (CANON_VISIBILITY_LAW, TIER-0): the seat face
//      and the money face carry TOTAL PAID; the split labels are the
//      protocol's published names, present as LABEL TEXT only.
//   2. NO RECOMPUTE: the facts module mirrors the studio spine's exact
//      formatters — no float parsing, no percentage arithmetic; 70/20/10
//      exist only inside label strings.
//   3. THE RED LINE + buyer's tongue: commerce-manipulation vocabulary and
//      machine plumbing never enter the painting zone.
//   4. THE SHARE STANDARD: 1200×630, the 300KB WhatsApp ceiling (the proven
//      card's own constant), the 90px safe zone.
//   5. FAIL-CLOSED: the route falls back to the generic site image on any
//      unpaintable state — never an invented card, never an echoed fault.
//   6. THE FONTS ARE THE SITE'S OWN, present with their OFL notice.
//
// Node-loadable (Node >= 22.6), dependency-free, comment-stripped scans.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const zone = path.resolve(here, "..", "src", "receiptcard");
const route = path.resolve(here, "..", "src", "routes", "receiptCard.ts");

function read(p: string): string {
  return readFileSync(p, "utf8");
}
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}
function stripStrings(code: string): string {
  return code
    .replace(/`[^`]*`/g, '""')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");
}

const errors: string[] = [];
let ok = 0;
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok += 1;
  else errors.push(fail);
}

const factsRaw = read(path.join(zone, "cardFacts.ts"));
const facesRaw = read(path.join(zone, "faces.ts"));
const painterRaw = read(path.join(zone, "painter.ts"));
const routeRaw = read(route);
const zoneFiles: readonly (readonly [string, string])[] = [
  ["cardFacts.ts", stripComments(factsRaw)],
  ["faces.ts", stripComments(facesRaw)],
  ["painter.ts", stripComments(painterRaw)],
  ["receiptCard.ts", stripComments(routeRaw)],
];

// 1. AMOUNTS VISIBLE — the label pins.
check(
  facesRaw.includes('"TOTAL PAID"'),
  "faces: TOTAL PAID present",
  "faces: TOTAL PAID left the painted card — amounts are NEVER hidden (Visibility Law)",
);
for (const label of ['"Vault · 70%"', '"Liquidity · 20%"', '"Operations · 10%"']) {
  check(
    factsRaw.includes(label),
    `facts: split label ${label} present as label text`,
    `facts: split label ${label} missing — the published split names the lines`,
  );
}
check(
  facesRaw.includes('"ONE WALLET · ONE SEAT"') && facesRaw.includes("DON’T TRUST — VERIFY"),
  "faces: the house seal lines present",
  "faces: the house seal lines (ONE WALLET · ONE SEAT / DON'T TRUST — VERIFY) must stay on the painted faces",
);

// 2. NO RECOMPUTE — code-only scans (strings stripped).
for (const [name, code] of zoneFiles) {
  const codeOnly = stripStrings(code);
  const floaty = /\b(parseFloat|toFixed)\s*\(/.exec(codeOnly);
  check(
    floaty === null,
    `${name}: no float parsing / rounding calls`,
    `${name}: "${floaty?.[0]}" found — exact string math only on a receipt artifact`,
  );
  const pctMath = /[*/]\s*(0\.\d+|100|70|20|10)\b/.exec(codeOnly);
  check(
    pctMath === null,
    `${name}: no percentage arithmetic`,
    `${name}: percentage arithmetic ("${pctMath?.[0]}") — 70/20/10 exist only as label text`,
  );
}

// 3. THE RED LINE + buyer's tongue.
const RED_LINE =
  /\b(discounts?|coupons?|promos?|promotions?|promotional|rewards?|cash-?backs?|bonus(es)?|loyalty|payouts?)\b/i;
for (const [name, code] of zoneFiles) {
  const m = code.match(RED_LINE);
  check(
    m === null,
    `${name}: red-line commerce vocabulary absent`,
    `${name}: red-line commerce vocabulary "${m?.[0]}" — a card proves a purchase, it never sells`,
  );
  const plumbing = /\brout(ed|ing)\b/i.exec(code);
  check(
    plumbing === null,
    `${name}: no machine-plumbing vocabulary`,
    `${name}: plumbing vocabulary "${plumbing?.[0]}" — a buyer never reads the pipes`,
  );
}

// 4. THE SHARE STANDARD.
check(
  /CARD_W = 1200/.test(facesRaw) && /CARD_H = 630/.test(facesRaw),
  "faces: pinned to the 1200×630 share standard",
  "faces: the share standard dimensions (1200×630) must not drift",
);
check(
  /CARD_MAX_BYTES = 300_000/.test(painterRaw) && /<= CARD_MAX_BYTES/.test(painterRaw),
  "painter: the 300KB WhatsApp ceiling holds (over-cap never serves)",
  "painter: the <300KB export ceiling and its enforcement must stay",
);
check(
  /padding: "56px 90px"/.test(facesRaw),
  "faces: the 90px central safe zone holds",
  "faces: text must live inside the central safe zone (90px padding)",
);

// 5. FAIL-CLOSED at the route.
check(
  /opengraph\.jpg/.test(routeRaw) && /302/.test(routeRaw),
  "route: unpaintable states 302 to the generic site image",
  "route: the generic-image fallback left — an unpaintable card must never invent",
);
check(
  /paintReceiptCard/.test(routeRaw) && /png === null/.test(stripComments(routeRaw)),
  "route: an over-ceiling paint falls back, never serves",
  "route: the over-ceiling fallback check must stay",
);

// 6. THE FONTS.
for (const f of [
  "IBMPlexMono-Regular.ttf",
  "IBMPlexMono-SemiBold.ttf",
  "WorkSans-Regular.ttf",
  "WorkSans-SemiBold.ttf",
  "OFL-NOTICE.md",
]) {
  check(
    existsSync(path.join(zone, "fonts", f)),
    `fonts: ${f} present`,
    `fonts: ${f} missing — the painter's embedded faces (and their license notice) ship with the zone`,
  );
}

if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:receipt-card] ${errors.length} FAILURE(S) (${ok} pins green).`);
  process.exit(1);
}
console.log(`[guard:receipt-card] PASS — ${ok}/${ok} painted-card pins hold.`);
