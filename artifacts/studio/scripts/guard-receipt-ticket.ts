// Guard: THE RECEIPT TICKET (receipt slice, 2026-07-16; founder money-block
// correction 2026-07-17).
// The founder-approved ticket's hard filters, as structure — a receipt is an
// accounting document printed at the exact moment money moved, so its laws
// are pinned here and can never silently relax:
//
//   1. THE RED LINE: commerce-manipulation vocabulary (discount / coupon /
//      promo / reward / cashback / bonus / loyalty points…) can never appear
//      in the receipt module — a ticket proves a purchase, it never sells.
//   2. ANTI-SCARCITY (structural, the eras/capital precedent): no countdown,
//      urgency, or scarcity shape can exist in the module.
//   3. THE BUYER'S TONGUE (founder, 2026-07-17): machine plumbing never
//      reaches a buyer's eyes — "routed/routing" and "contribution" are
//      banned from every buyer-facing string; the document title speaks
//      commerce ("proof of purchase"), and the commerce block leads with the
//      PRODUCT line and TOTAL PAID before the proof block explains where the
//      money went.
//   4. EVOLUTIVE PRODUCT NAMING: the item line's product name derives from
//      RECEIPT_PRODUCT_NAMES[kind] — never hardcoded prose in a surface.
//   5. ONE DOOR MAX: the spine's door type is a single optional object
//      (never an array) and the ticket renders exactly ONE next-door node.
//   6. ORDINAL HONESTY: the witness line is data the caller proves, never a
//      literal typed in the module — absence renders as absence.
//   7. NO RECOMPUTE: the module performs no arithmetic on amounts — no
//      float parsing, no rounding calls, no percentage math; the 70/20/10
//      figures exist ONLY inside the three split label literals.
//   8. TICKET AMOUNTS ARE EXACT (ADR-001): the floored dashboard formatter
//      is banned in the module; the exact formatter is the only money path.
//   9. THE MIRROR FILTER: no PARTIAL/PREVIEW/PENDING status vocabulary can
//      exist — a ticket is confirmed by construction (txHash + blockNumber
//      demanded by the builder).
//  10. THE REAL-ROW CLASS PIN (founder, 2026-07-17 — the #14-mock class can
//      never return): no dollar-figure literal, no wallet/tx-hash literal in
//      the module; and NO page under src/pages ever mounts the ticket or the
//      builder — a ticket is born ONLY inside the wallet module, from a
//      confirmed event. (The dead mock was a page-mounted fake — this pin
//      kills the CLASS, not the instance.)
//  11. EXPORT PURITY (founder, 2026-07-17): one render, two projections —
//      the action bar carries print:hidden and lives OUTSIDE the rasterized
//      paper node; Save-image targets paperRef; the print stylesheet block
//      exists. Every export carries the paper alone.
//  12. READABILITY FLOOR (ADR-001): no sub-12px arbitrary text classes.
//  13. PLACEMENT: JoinCheckout actually renders the ticket at success — the
//      post-purchase dead end stays dead.
//  14. THE ROADMAP stays engraved in the spine header (/receipt/{txHash} ·
//      living ticket · receipt-as-artifact) so no future slice begins it
//      silently.
//
// Scans are comment-stripped so this documentation and the module headers may
// name what they forbid without self-matching. Node-loadable (Node >= 22.6).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

const SPINE = path.join(srcDir, "lib", "protocolCommerceReceipt.ts");
const TICKET = path.join(srcDir, "wallet", "ReceiptTicket.tsx");
const CHECKOUT = path.join(srcDir, "wallet", "JoinCheckout.tsx");
const INDEX_CSS = path.join(srcDir, "index.css");

function read(abs: string): string {
  return readFileSync(abs, "utf8");
}

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

/** Remove string/template literals — the arithmetic pins scan CODE only
 *  (Tailwind class strings like "bg-gold/10" are labels, not math). */
function stripStrings(code: string): string {
  return code
    .replace(/`[^`]*`/g, '""')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");
}

/** Every string/template literal in comment-stripped code. */
function literalsOf(code: string): string[] {
  return code.match(/`[^`]*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g) ?? [];
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

const spineRaw = read(SPINE);
const ticketRaw = read(TICKET);
const checkoutRaw = read(CHECKOUT);
const spine = stripComments(spineRaw);
const ticket = stripComments(ticketRaw);
const moduleFiles: readonly (readonly [string, string])[] = [
  ["protocolCommerceReceipt.ts", spine],
  ["ReceiptTicket.tsx", ticket],
];

// ── 1. THE RED LINE ──────────────────────────────────────────────────────────
const RED_LINE =
  /\b(discounts?|coupons?|promos?|promotions?|promotional|rewards?|cash-?backs?|bonus(es)?|loyalty)\b|\bpoints\s+(earned|balance|program)\b/i;
for (const [name, code] of moduleFiles) {
  const m = code.match(RED_LINE);
  check(
    m === null,
    `${name}: red-line commerce vocabulary absent`,
    `${name}: red-line commerce vocabulary "${m?.[0]}" — a ticket proves a purchase, it never sells`,
  );
}

// ── 2. ANTI-SCARCITY ─────────────────────────────────────────────────────────
const SCARCITY =
  /\b(countdown|hurry|expires?|expiring|limited[- ]time|last chance|only \d+ (left|remaining)|running out|act now|don'?t miss)\b/i;
for (const [name, code] of moduleFiles) {
  const m = code.match(SCARCITY);
  check(
    m === null,
    `${name}: no scarcity/urgency shape`,
    `${name}: scarcity/urgency shape "${m?.[0]}" — the anti-scarcity law binds the ticket`,
  );
}

// ── 3. THE BUYER'S TONGUE ────────────────────────────────────────────────────
for (const [name, code] of moduleFiles) {
  const lits = literalsOf(code);
  const plumbing = lits.find((l) => /\brout(ed|ing|es?)\b/i.test(l));
  check(
    plumbing === undefined,
    `${name}: no machine-plumbing vocabulary in buyer-facing strings`,
    `${name}: plumbing vocabulary in a string: ${plumbing?.slice(0, 60)} — a buyer never reads the pipes`,
  );
  const contribution = lits.find((l) => /\bcontribution/i.test(l));
  check(
    contribution === undefined,
    `${name}: "contribution" absent from buyer-facing strings`,
    `${name}: banned word in a string: ${contribution?.slice(0, 60)}`,
  );
}
check(
  spineRaw.includes('"Membership receipt — proof of purchase"'),
  "spine: the document title speaks commerce (proof of purchase)",
  'spine: RECEIPT_DOC_TITLES.membership must stay "Membership receipt — proof of purchase"',
);
check(
  !/routing proof/i.test(spine) && !/routing proof/i.test(ticket),
  "module: the dead machine title cannot return",
  'module: "routing proof" resurfaced — the founder killed it 2026-07-17',
);
check(
  spineRaw.includes('"TOTAL PAID"'),
  "spine: the commerce block closes on TOTAL PAID",
  'spine: the commerce total label must stay "TOTAL PAID"',
);
check(
  spineRaw.includes('"WHERE YOUR MONEY WENT"') &&
    /remainderLead/.test(spineRaw) &&
    /`The remaining \$\{remainder \?\? gross\}:/.test(spineRaw),
  "spine: the proof block leads with the human title + plain remainder sentence",
  "spine: the proof block must carry WHERE YOUR MONEY WENT and the remainder lead built from the event's own field",
);

// ── 4. EVOLUTIVE PRODUCT NAMING ──────────────────────────────────────────────
check(
  /RECEIPT_PRODUCT_NAMES:\s*Record<ReceiptKind,\s*string>/.test(spineRaw),
  "spine: product names are a total map over ReceiptKind",
  "spine: RECEIPT_PRODUCT_NAMES must stay a Record<ReceiptKind, string>",
);
check(
  /\$\{productName\} — Seat #\$\{seatDisplay\}/.test(spineRaw),
  "spine: the item line derives from the kind's product name + the event's seat",
  "spine: the item line must be built from RECEIPT_PRODUCT_NAMES, never hardcoded prose",
);

// ── 5. ONE DOOR MAX ──────────────────────────────────────────────────────────
check(
  !/ReceiptDoor\[\]/.test(spine) && !/ReceiptDoor\[\]/.test(ticket),
  "module: no door array type anywhere",
  "module: ReceiptDoor[] found — ONE DOOR MAX is structural",
);
const doorNodes = ticket.match(/data-testid="receipt-next-door"/g) ?? [];
check(
  doorNodes.length === 1,
  "ticket: exactly one next-door node renders",
  `ticket: expected exactly 1 receipt-next-door node, found ${doorNodes.length}`,
);
check(
  !/\.map\([^)]*[Dd]oor/.test(ticket),
  "ticket: doors are never mapped/listed",
  "ticket: a door list render was introduced — ONE DOOR MAX",
);

// ── 6. ORDINAL HONESTY ───────────────────────────────────────────────────────
check(
  /witnessLine:\s*input\.witnessLine\s*\?\?\s*null/.test(spine),
  "spine: witness line is caller-proven data, defaulting to null",
  "spine: the witness line must be `input.witnessLine ?? null` — never invented",
);
const ticketLiterals = literalsOf(ticket);
check(
  !ticketLiterals.some(
    (lit) => /witness/i.test(lit) && lit !== '"receipt-witness-line"',
  ),
  "ticket: no literal witness sentence typed in the surface",
  "ticket: a witness sentence literal was typed in the surface — witness lines arrive as proven data only",
);
check(
  /model\.living\.witnessLine\s*\?/.test(ticket),
  "ticket: the witness line renders only from the model field",
  "ticket: the witness line must render only from model.living.witnessLine",
);

// ── 7. NO RECOMPUTE ──────────────────────────────────────────────────────────
const AMOUNT_IDS =
  /(grossUsdc\w*|acquisitionCost\w*|protocolContribution\w*|vaultAmount\w*|liquidityAmount\w*|operationsAmount\w*|synOut\w*)/;
for (const [name, code] of moduleFiles) {
  const codeOnly = stripStrings(code);
  const arithmetic = new RegExp(`${AMOUNT_IDS.source}\\s*[*/+-]\\s*[\\w.]`).exec(codeOnly);
  check(
    arithmetic === null,
    `${name}: no arithmetic on amount fields`,
    `${name}: arithmetic on an amount field ("${arithmetic?.[0]}") — figures are the event's own fields, never recomputed`,
  );
  const floaty = /\b(parseFloat|toFixed)\s*\(/.exec(codeOnly);
  check(
    floaty === null,
    `${name}: no float parsing / rounding calls`,
    `${name}: "${floaty?.[0]}" found — exact string math only on a receipt`,
  );
  const pctMath = /[*/]\s*(0\.\d+|100|70|20|10)\b/.exec(codeOnly);
  check(
    pctMath === null,
    `${name}: no percentage arithmetic`,
    `${name}: percentage arithmetic ("${pctMath?.[0]}") — 70/20/10 exist only as label text`,
  );
}
for (const label of ['"Vault · 70%"', '"Liquidity · 20%"', '"Operations · 10%"']) {
  check(
    spineRaw.includes(label),
    `spine: split label ${label} present as label text`,
    `spine: split label ${label} missing — the published split names the lines`,
  );
}

// ── 8. EXACTNESS ─────────────────────────────────────────────────────────────
for (const [name, code] of moduleFiles) {
  check(
    !/formatRawUnitsDisplay/.test(code),
    `${name}: floored display formatter banned`,
    `${name}: formatRawUnitsDisplay found — TICKET AMOUNTS ARE EXACT (ADR-001)`,
  );
}
check(
  /formatAmountExact/.test(spine) && /padEnd\(2, "0"\)/.test(spine),
  "spine: exact formatter present with the 2-decimal minimum",
  "spine: formatAmountExact with the 2-decimal minimum is the required money path",
);

// ── 9. THE MIRROR FILTER ─────────────────────────────────────────────────────
for (const [name, code] of moduleFiles) {
  const m = /\b(PARTIAL|PREVIEW|PENDING)\b/.exec(code);
  check(
    m === null,
    `${name}: no speculative status vocabulary`,
    `${name}: status vocabulary "${m?.[0]}" — a ticket is confirmed by construction`,
  );
}
check(
  /0x\[0-9a-fA-F\]\{64\}/.test(spineRaw) && /proof\.blockNumber/.test(spine),
  "spine: the builder demands the confirmed anchor (txHash + blockNumber)",
  "spine: the builder must validate txHash (64 hex) and blockNumber before any ticket exists",
);

// ── 10. THE REAL-ROW CLASS PIN ───────────────────────────────────────────────
for (const [name, code] of moduleFiles) {
  const lits = literalsOf(code);
  const dollarFig = lits.find((l) => /\$\d/.test(l));
  check(
    dollarFig === undefined,
    `${name}: no dollar-figure literal (every amount flows from the event)`,
    `${name}: hardcoded dollar figure ${dollarFig?.slice(0, 40)} — the #14-mock class`,
  );
  const hexLit = lits.find((l) => /0x[0-9a-fA-F]{40}/.test(l));
  check(
    hexLit === undefined,
    `${name}: no wallet/tx-hash literal`,
    `${name}: hardcoded chain literal ${hexLit?.slice(0, 40)} — figures and anchors arrive from the event only`,
  );
}
{
  const pagesDir = path.join(srcDir, "pages");
  const offenders: string[] = [];
  for (const abs of walk(pagesDir)) {
    const code = stripComments(read(abs));
    if (/ReceiptTicket|buildMembershipReceipt/.test(code)) {
      offenders.push(path.relative(srcDir, abs));
    }
  }
  check(
    offenders.length === 0,
    "pages: no page ever mounts the ticket or the builder (the mock class is structurally dead)",
    `pages: ticket/builder referenced outside the wallet module: ${offenders.join(", ")} — a ticket is born ONLY from a confirmed event in the wallet module (amend this pin, dated, at the /receipt/{txHash} slice)`,
  );
}

// ── 11. EXPORT PURITY ────────────────────────────────────────────────────────
check(
  /print:hidden/.test(ticketRaw) &&
    /Zone G[\s\S]*?print:hidden/.test(ticketRaw),
  "ticket: the action bar is print-hidden",
  "ticket: the Zone G action bar must carry print:hidden — exports carry the paper alone",
);
check(
  /toSvg\(node\)/.test(ticketRaw) && /paperRef\.current/.test(ticketRaw),
  "ticket: Save-image rasterizes the paper node only",
  "ticket: handleSaveImage must rasterize paperRef.current (the paper), never the wrapper",
);
{
  const idx = ticketRaw.indexOf("ref={paperRef}");
  const actionsIdx = ticketRaw.indexOf('data-testid="button-receipt-save-image"');
  check(
    idx !== -1 && actionsIdx > idx,
    "ticket: the action bar sits outside (after) the paper node",
    "ticket: the action bar must live outside the rasterized paper",
  );
}
check(
  /@media print/.test(read(INDEX_CSS)) && /receipt-print-root/.test(read(INDEX_CSS)),
  "index.css: the print-clean stylesheet block exists",
  "index.css: the receipt print stylesheet block is missing",
);

// ── 12. READABILITY FLOOR ────────────────────────────────────────────────────
const SUB12 = /text-\[(9|10|11)(\.\d+)?px\]/.exec(ticketRaw);
check(
  SUB12 === null,
  "ticket: no sub-12px text classes",
  `ticket: sub-12px class "${SUB12?.[0]}" — the readability floor binds new surfaces`,
);
// ⑩ (founder, 2026-07-17): READABILITY FIRST on the ticket — nothing
// decorative may cost contrast or size. Italic and the display serif are
// banned on this surface; the doctrine line renders upright at full contrast.
for (const styleClass of ["italic", "font-serif"]) {
  check(
    !new RegExp(`\\b${styleClass}\\b`).test(ticketRaw),
    `ticket: "${styleClass}" absent — readability first`,
    `ticket: "${styleClass}" found — legibility is never traded for decoration (founder ⑩)`,
  );
}
// ⑨ (founder, 2026-07-17): THE STRESS LAW — exact values never round, shrink
// or truncate; wide values WRAP to their own right-aligned line. The wrap
// mechanics (flex-wrap + ml-auto) must stay on the value rows, and no
// truncation/nowrap utility may enter the paper.
check(
  (ticketRaw.match(/flex-wrap/g) ?? []).length >= 6,
  "ticket: value rows carry the graceful-wrap mechanics",
  "ticket: the flex-wrap graceful degrade left the value rows (founder ⑨)",
);
for (const banned of ["truncate", "whitespace-nowrap", "text-ellipsis", "overflow-hidden"]) {
  check(
    !ticketLiterals.some((l) => l.includes(banned)),
    `ticket: "${banned}" utility absent (values never truncate)`,
    `ticket: "${banned}" utility found — a receipt value never truncates (founder ⑨)`,
  );
}
// ⑪ (founder, 2026-07-17): the share artifact carries the member's own link
// via THE one resolver (Ruling ① — reused, never rebuilt); the link never
// enters the paper (the print/PDF proof stays clean) and the door zone stays
// ONE door.
check(
  /payingSourceId/.test(ticketRaw) && /from "@\/lib\/sourceIdentity"/.test(ticketRaw),
  "ticket: the referral link comes from the ONE resolver (payingSourceId)",
  "ticket: the share link must reuse payingSourceId from sourceIdentity — never a rebuilt derivation (founder ⑪)",
);
check(
  (ticket.match(/join\?source=/g) ?? []).length === 1,
  "ticket: exactly one share-link construction site",
  "ticket: the referral link must be built exactly once (the share artifact), never scattered",
);
{
  const paperStart = ticketRaw.indexOf("ref={paperRef}");
  const linkIdx = ticketRaw.indexOf("join?source=");
  const paperEnd = ticketRaw.indexOf("Zone G");
  check(
    paperStart !== -1 && linkIdx !== -1 && paperEnd !== -1 && (linkIdx < paperStart || linkIdx > paperEnd),
    "ticket: the referral link stays OFF the paper (print/PDF proof clean)",
    "ticket: the referral link entered the paper region — the accounting document stays clean (founder ⑪)",
  );
}

// ── 13. PLACEMENT ────────────────────────────────────────────────────────────
check(
  /ReceiptTicket/.test(checkoutRaw) && /buildMembershipReceipt/.test(checkoutRaw),
  "checkout: the confirmed purchase renders the ticket (the dead end stays dead)",
  "checkout: JoinCheckout must build + render the ReceiptTicket at success",
);

// ── 13b. ⑫ HISTORICAL HONESTY (founder, 2026-07-17) ─────────────────────────
// Every past purchase has its ticket: older engines emitted fewer fields, so
// the spine types absence and the surface renders absence — never a guess.
check(
  /era: number \| null;/.test(spineRaw) && /synPerUsdc: string \| null;/.test(spineRaw),
  "spine: historical fields are typed nullable (absence exists in the type)",
  "spine: era/synPerUsdc must stay `| null` — older events never carried them (founder ⑫)",
);
check(
  /moneyProof:[\s\S]{0,900}?\} \| null;/.test(spineRaw),
  "spine: the proof block is nullable (an event without splits prints none)",
  "spine: moneyProof must stay nullable — honest absence, never a guessed split (founder ⑫)",
);
check(
  /ev\.era === null \? null :/.test(spineRaw),
  "spine: a missing era renders NO era line — never a fabricated Era 1",
  "spine: the era label must be null-guarded on ev.era (founder ⑫)",
);
check(
  /model\.moneyProof !== null \?/.test(ticketRaw) &&
    /model\.context\.eraLabel !== null \?/.test(ticketRaw),
  "ticket: proof zone and era line render only when the event carried them",
  "ticket: absent fields must render ABSENCE (conditional zones — founder ⑫)",
);
check(
  /EVERY PAST PURCHASE/.test(spineRaw) && /TokensPurchased/.test(spineRaw),
  "spine: the historical coverage doctrine stays engraved",
  "spine: the ⑫ historical-coverage note (V1 TokensPurchased honesty) must not be removed",
);
// THE FOUR-ENGINES PRECISION (AUD-TRUTH-3's lesson carried here): the spine
// names V2a AND V2b — an ambiguous bare "V2" can never describe the history.
check(
  /V2a \(0x0b883F/.test(spineRaw) &&
    /V2b \(0x507E9c/.test(spineRaw) &&
    // the doctrine sentence may NAME the banned form in quotes — nothing else may
    !/[^ab(]V2[^ab0-9]/.test(spineRaw.replace(/V2a|V2b|"V2"/g, "")),
  "spine: all four engines named precisely (V1 · V2a · V2b · V3, no bare V2)",
  "spine: the four-engines truth must stay precise — V2a and V2b by name and address, never a bare V2",
);

// ── 14. THE ROADMAP ──────────────────────────────────────────────────────────
check(
  /\/receipt\/\{txHash\}/.test(spineRaw) && /LIVING TICKET/i.test(spineRaw),
  "spine: the receipt roadmap stays engraved",
  "spine: the engraved roadmap (/receipt/{txHash} · living ticket · receipt-as-artifact) must not be removed",
);

// ── verdict ──────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:receipt] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:receipt] PASS — ${ok.length}/${ok.length} receipt-ticket pins hold.`);
