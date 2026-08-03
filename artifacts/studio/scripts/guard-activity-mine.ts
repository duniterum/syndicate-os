// guard-activity-mine.ts — THE MINE LENS'S TWO DOORS + THE LENS GEOMETRY. BLOCKING.
// ---------------------------------------------------------------------------
// THE CATCH (founder, 2026-08-03, live prod /activity?lens=mine): « VERIFY and
// RECEIPT c'est quoi la logique … les receipt links amènent à la page de
// receipts pas au receipt lui-même » + « les coins … des boutons ». Three
// defects, all verified in code before this guard existed:
//   · "verify" rendered as BARE TEXT — a dead label styled like its living
//     sibling; on the public Protocol feed, verify IS an anchor.
//   · "receipt" linked to /receipts (the whole binder) while the row already
//     carries its own transaction hash — the document's permanent page is
//     /receipt/{tx}, one interpolation away, zero re-scanning.
//   · the lens control's active gold ring is an inset shadow with SQUARE
//     corners inside a rounded, clipping container — the ring gets cut at the
//     container's rounded corners.
//
// THE PINS:
//   1. THE ROW CARRIES ITS HASH — LedgerRow declares `tx: string`.
//   2. THE DOCUMENT DOOR IS DIRECT — the receipt cell deep-links
//      /receipt/${row.tx}; the bare binder door ("/receipts") survives
//      EXACTLY ONCE (the footer's "Your full tickets live in Receipts").
//   3. VERIFY IS AN AFFORDANCE — never a bare "verify" string; the cell's
//      verify is an anchor, so the row's explorerUrl is referenced at least
//      twice (the hash anchor + the verify anchor).
//   4. THE LENS CORNERS — each lens segment carries its position radius
//      (rounded-l-md / rounded-r-md) so the focus ring and the active inset
//      ring follow the curve instead of being clipped square.
//
// NOT COVERED (stated): rendered pixels, the /receipt/:txHash route's own
// existence (the router and the receipt guards own it), explorer uptime.
// Scans are comment-stripped so this header may name what it forbids.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const LEDGER = path.join(srcDir, "wallet", "ActivityMineLedger.tsx");
const FEED = path.join(srcDir, "components", "activity", "LiveActivityFeed.tsx");

// LINE comments are stripped FIRST: a `/*` living inside a `//` line (this
// very ledger's header says `/api/auth/*`) would otherwise open a phantom
// block and swallow real code — pin 1 false-redded on exactly that at this
// guard's own RED cycle (2026-08-03). The (?!…\*\/) lookaheads keep a `//`
// line that CARRIES a block CLOSER: deleting it would hand the block the
// NEXT closer and swallow real code from the scan (the review-2 logic hat's
// executed counter-fixture, same day).
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

const ledger = stripComments(readFileSync(LEDGER, "utf8"));
const feed = stripComments(readFileSync(FEED, "utf8"));

// ── 1. THE ROW CARRIES ITS HASH ─────────────────────────────────────────────
// Extract the block FIRST, then test INSIDE it — a loose /tx:\s*string/
// false-greened on the short() helper's parameter, and a lazy cross-block
// span could false-green on a LATER interface's tx after LedgerRow lost the
// field (both from this guard's own adversarial cycles, 2026-08-03).
const ledgerRowBlock = /interface LedgerRow \{([\s\S]*?)\n\}/.exec(ledger)?.[1] ?? "";
check(
  /\btx: string;/.test(ledgerRowBlock),
  "ledger: LedgerRow carries the full transaction hash",
  "ledger: LedgerRow lacks `tx: string` — the row must carry its own hash so the document door is direct",
);

// ── 2. THE DOCUMENT DOOR IS DIRECT ──────────────────────────────────────────
check(
  // The FULL hash, pinned exactly — a "simplified" `${r.anchorShort}` kept
  // the prefix pin green while re-breaking the founder-caught defect
  // (review-2 adversarial probe, 2026-08-03).
  /href=\{`\/receipt\/\$\{r\.tx\}`\}/.test(ledger),
  "ledger: the receipt cell deep-links the row's own /receipt/{tx} page with the FULL hash",
  "ledger: the receipt cell must deep-link `/receipt/${r.tx}` — the full hash, never a short form, never the binder (founder catch, 2026-08-03)",
);
// Prefix-open count: a `"/receipts?via=…"` second door escaped the
// closed-quote form (review-2 adversarial probe).
const binderDoors = (ledger.match(/["'`]\/receipts(?![a-z])/g) ?? []).length;
check(
  binderDoors === 1,
  "ledger: the binder door survives exactly once (the footer)",
  `ledger: "/receipts" appears ${binderDoors}× — the footer's binder door is the ONE allowed; a row's receipt is its own page`,
);

// ── 3. VERIFY IS AN AFFORDANCE ──────────────────────────────────────────────
check(
  !/[({]\s*["']verify["']\s*[)}]/.test(ledger),
  "ledger: no dead bare-text verify (either quote style)",
  'ledger: "verify" is rendered as a bare string — a dead label styled like a link; it must be an anchor to the row\'s explorerUrl (the public feed\'s own idiom)',
);
// THE FLOOR ON THE ROW'S ACTIONS (review-2 design hat, 2026-08-03): both
// action cells measured 16px live while the SAME row's hash anchor stood at
// 44 — the twin failed inside one <tr>. Both cells carry the floor now.
const actionCellFloors = (ledger.match(/inline-flex min-h-11 items-center[^"]*rounded-sm[^"]*text-proof/g) ?? []).length;
check(
  actionCellFloors >= 3,
  "ledger: the hash anchor AND both action cells stand at the 44px floor",
  `ledger: only ${actionCellFloors} proof link(s) carry inline-flex min-h-11 — the verify and receipt cells owe the same floor as the row's hash anchor (ADR-001 bis §4)`,
);
const explorerRefs = (ledger.match(/href=\{r\.explorerUrl\}/g) ?? []).length;
check(
  explorerRefs >= 2,
  "ledger: the verify cell is an explorer anchor (explorerUrl referenced by hash + verify)",
  `ledger: r.explorerUrl is anchored ${explorerRefs}× — the verify cell must be a real anchor alongside the hash anchor`,
);

// ── 4. THE LENS CORNERS ─────────────────────────────────────────────────────
const lensBlock = (() => {
  const i = feed.indexOf("activity-lens");
  return i === -1 ? "" : feed.slice(Math.max(0, i - 1200), i + 1200);
})();
check(
  // Position radii heal the ACTIVE inset ring only — an outset focus ring
  // is clipped by the overflow-hidden container whatever the radius
  // (review-2 design hat measured the survivor: a 2px seam).
  /rounded-l-md/.test(lensBlock) && /rounded-r-md/.test(lensBlock),
  "lens: segments carry their position radius (the ACTIVE inset ring follows the curve)",
  "lens: the segments lack rounded-l-md / rounded-r-md — the active inset ring gets clipped SQUARE at the container's rounded corners (founder catch, 2026-08-03)",
);
check(
  // THE INDICATOR MUST BE INSET **AND** MUST NOT BE A BARE TINT.
  // The founder's 2026-07-20 ruling bans the OUTSET boxing ring (an
  // overflow-hidden container cuts it to a seam) — it does not ban an
  // INSET one. And a focus TINT alone INVERTS here: on the SELECTED
  // segment `focus-visible:bg-gold/10` overrides the resting `bg-gold/15`
  // (higher specificity, later in the sheet), so focusing the active lens
  // makes it FAINTER — measured 1.07:1 light / 1.11:1 dark. No tint alpha
  // can reach 3:1 against a same-hue sibling tint (gold/55 = 1.90). An
  // inset ring measures 4.62:1 / 9.31:1. Four hats filed this
  // independently (the 2026-08-03 seven-hat audit).
  // Level, stated exactly: WCAG 1.4.11 Non-text Contrast (AA) + 2.4.7
  // Focus Visible (AA) — NOT 2.4.11, which is Focus Not Obscured.
  /focus-visible:shadow-\[inset_/.test(lensBlock) &&
    !/focus-visible:ring-/.test(lensBlock) &&
    !/focus-visible:bg-/.test(lensBlock),
  "lens: keyboard focus is an INSET ring (never an outset ring the container clips, never a tint that inverts the active fill)",
  "lens: the focus indicator must be INSET — `focus-visible:shadow-[inset_…]`. An outset ring survives as a 2px seam inside the overflow-hidden container, and a bare focus TINT makes the SELECTED segment FAINTER than at rest (measured 1.07:1 — the 2026-08-03 audit's inversion, filed by four hats)",
);
check(
  /aria-pressed=\{lens === l\}/.test(lensBlock),
  "lens: selection is spoken to assistive tech (aria-pressed)",
  "lens: the segments lack aria-pressed={lens === l} — selection is conveyed by color alone (the house pattern carries it: JoinProtocol's amount chips)",
);

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:activity-mine] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:activity-mine] PASS — ${ok.length}/${ok.length} mine-lens pins hold.`);
