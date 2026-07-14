/**
 * Introduction read-model — LIVE IN-MEMORY HOLDER (M0, founder GO).
 * -------------------------------------------------------------------
 * The backbone's introduction refresh SETS the freshest verified model here;
 * the served standing reads PREFER it over the committed snapshot (which
 * remains the boot fallback — the server is never worse than the last
 * founder-gated build). Pure state, no imports, no I/O — safe for any layer
 * to read without creating a dependency cycle.
 *
 * Honesty: the holder carries the model's own asOfBlock and content hash;
 * a consumer serves those verbatim (asOfBlock always honest — M0 law).
 */

import type { IntroductionReadmodel } from "./introductionReadmodel";

export interface LiveIntroductionModel {
  readonly model: IntroductionReadmodel;
  readonly modelHash: string;
  /** Ops metadata (wall clock) — never chain truth. */
  readonly refreshedIso: string;
}

let live: LiveIntroductionModel | null = null;

/** Set by the backbone's introduction refresh ONLY (guard-pinned). */
export function setLiveIntroductionModel(next: LiveIntroductionModel): void {
  live = next;
}

/** Freshest verified model, or null (boot / refresh never succeeded yet). */
export function getLiveIntroductionModel(): LiveIntroductionModel | null {
  return live;
}
