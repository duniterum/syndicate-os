/**
 * Routed split — LIVE IN-MEMORY HOLDER (P0-1, founder 2026-08-06).
 * -------------------------------------------------------------------
 * The backbone cycle SETS the fold it measured and anchored here; the reality
 * envelope READS it and publishes `financial.routed.*`. Pure state, one type
 * import, no I/O — safe for any layer to read without creating a dependency
 * cycle. Modeled on `introductionLiveModel`, deliberately: that seam already
 * exists for exactly this (a backbone-derived model reaching a served read),
 * and a second shape for the same relationship is how two subsystems drift.
 *
 * ⛔ WHY THIS IS NOT BUILT IN THE ROUTE. The P0-1 handoff said the items should
 * be appended in `routes/protocolReality.ts`, because `realityService` is
 * live-chain-only and "the fold cannot live there". The first half is still
 * true; the conclusion is not, and it stopped being true when the fold landed
 * in the backbone cycle (step 1): what the envelope needs now is not a database
 * read, it is one in-memory object. So the items are built where every other
 * financial item is built, beside their siblings, and this holder is the seam —
 * exactly as `introductionLiveModel` is for `financial.referral.*`.
 *
 * HONESTY: the model carries its own `asOfBlock` and it travels verbatim to the
 * envelope. The holder never invents freshness, and a consumer never restates
 * the block as anything other than what the fold covered.
 */

import type { RoutedFold } from "./routedFold";

export interface RoutedFinancialModel extends RoutedFold {
  /** The last block the folded rows cover — never the cycle's head. */
  readonly asOfBlock: number;
}

export interface RoutedFinancialState {
  /** The measured fold, or null when nothing may be published. */
  readonly model: RoutedFinancialModel | null;
  /**
   * WHY there is no model, or why a held one is stale — the reconciler's own
   * measured sentence, verbatim: the figure named, both values in USDC, the
   * direction, the size, the row count. Carried, never reduced to a flag.
   * `null` only when the model is fresh and exact.
   */
  readonly reason: string | null;
  /** The publishing cycle's head, so a reader can compare it to `asOfBlock`. */
  readonly headBlock: number | null;
}

const EMPTY: RoutedFinancialState = { model: null, reason: null, headBlock: null };

let state: RoutedFinancialState = EMPTY;

/** Set by the backbone cycle ONLY. */
export function setRoutedFinancial(next: RoutedFinancialState): void {
  state = next;
}

/**
 * The routed split as last measured, or the reason there is none. Before the
 * first cycle completes this is `{model: null, reason: null}` — nothing has been
 * measured yet and nothing is claimed; the envelope reports it as unavailable
 * with that stated, never as zero.
 */
export function getRoutedFinancial(): RoutedFinancialState {
  return state;
}
