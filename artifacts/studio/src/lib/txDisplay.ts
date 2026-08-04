// txDisplay.ts — how a transaction hash is SHOWN, decided once.
// ===========================================================================
// IMPORT, NEVER RE-DERIVE (CLAUDE.md ④). A transaction hash is 66 characters;
// every screen that names one shortens it, and each screen that re-types the
// slicing is one more place the same decision can drift. The money-path slice
// of 2026-08-04 added FOUR fresh copies of the same expression — in the very
// commit whose subject was the twin search — and review caught it.
//
// TWO FORMS, BOTH LIVING HERE (the sweep completed 2026-08-04). A hash written
// INSIDE A SENTENCE gets room to breathe (10…6); a hash rendered as a STANDALONE
// LABEL under a column or on a ticket is tighter (6…4). They are two deliberate
// decisions, not an accident — which is exactly why they belong in one file
// where the difference is visible, instead of being retyped in nine places
// where they can drift apart silently. Nothing here is a figure: it is
// presentation, and neither form is ever the value a caller compares.
// ===========================================================================

/**
 * A transaction hash as it is named inside a sentence: first 10 characters,
 * an ellipsis, last 6. Anything that is not a plausible hash is returned
 * unchanged rather than mangled — a display helper never invents.
 */
export function shortTxHash(hash: string): string {
  if (typeof hash !== "string" || hash.length < 20) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

/**
 * A hash or id rendered as a STANDALONE LABEL — a ticket line, a table cell,
 * a verify chip. Tighter than the in-sentence form because it stands alone and
 * competes with a column, not with prose. Anything too short to shorten is
 * returned unchanged rather than mangled.
 */
export function shortTxLabel(hash: string): string {
  if (typeof hash !== "string" || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}
