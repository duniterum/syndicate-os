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
// guard's own RED cycle (2026-08-03).
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

const ledger = stripComments(readFileSync(LEDGER, "utf8"));
const feed = stripComments(readFileSync(FEED, "utf8"));

// ── 1. THE ROW CARRIES ITS HASH ─────────────────────────────────────────────
// Anchored INSIDE the interface block — a loose /tx:\s*string/ false-greened
// on the short() helper's parameter (caught at this guard's own RED run).
check(
  /interface LedgerRow \{[\s\S]*?\btx: string;[\s\S]*?\n\}/.test(ledger),
  "ledger: LedgerRow carries the full transaction hash",
  "ledger: LedgerRow lacks `tx: string` — the row must carry its own hash so the document door is direct",
);

// ── 2. THE DOCUMENT DOOR IS DIRECT ──────────────────────────────────────────
check(
  /href=\{`\/receipt\/\$\{/.test(ledger),
  "ledger: the receipt cell deep-links the row's own /receipt/{tx} page",
  "ledger: the receipt cell does not deep-link /receipt/${row.tx} — it must open the document itself, never the whole binder (founder catch, 2026-08-03)",
);
const binderDoors = (ledger.match(/["'`]\/receipts["'`]/g) ?? []).length;
check(
  binderDoors === 1,
  "ledger: the binder door survives exactly once (the footer)",
  `ledger: "/receipts" appears ${binderDoors}× — the footer's binder door is the ONE allowed; a row's receipt is its own page`,
);

// ── 3. VERIFY IS AN AFFORDANCE ──────────────────────────────────────────────
check(
  !/[({]\s*"verify"\s*[)}]/.test(ledger),
  "ledger: no dead bare-text verify",
  'ledger: "verify" is rendered as a bare string — a dead label styled like a link; it must be an anchor to the row\'s explorerUrl (the public feed\'s own idiom)',
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
  /rounded-l-md/.test(lensBlock) && /rounded-r-md/.test(lensBlock),
  "lens: segments carry their position radius (the gold ring follows the curve)",
  "lens: the segments lack rounded-l-md / rounded-r-md — the active inset ring and focus ring get clipped SQUARE at the container's rounded corners (founder catch, 2026-08-03)",
);

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:activity-mine] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:activity-mine] PASS — ${ok.length}/${ok.length} mine-lens pins hold.`);
