// txDisplay.ts — how a transaction hash is SHOWN, decided once.
// ===========================================================================
// IMPORT, NEVER RE-DERIVE (CLAUDE.md ④). A transaction hash is 66 characters;
// every screen that names one shortens it, and each screen that re-types the
// slicing is one more place the same decision can drift. The money-path slice
// of 2026-08-04 added FOUR fresh copies of the same expression — in the very
// commit whose subject was the twin search — and review caught it.
//
// SCOPE, stated honestly: this module owns the WRITTEN form used when a hash
// is named inside a sentence («your purchase was sent (0x1234abcd…f0e1d2)»).
// It does NOT yet own the tighter 6…4 form the receipt tickets and the
// referral tables use for a hash rendered as a standalone label — that sweep
// is its own slice, and until it happens this file is the authority for the
// in-sentence form only. Nothing here is a figure: it is presentation.
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
