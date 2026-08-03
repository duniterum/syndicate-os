/**
 * THE ONE introduction-model pick (M0 law).
 * ---------------------------------------------------------------------------
 * PREFER the backbone's live-refreshed model when it is at least as fresh as
 * the committed snapshot; the snapshot stays the boot fallback, so the server
 * is never worse than the last founder-gated build. The model's own asOfBlock
 * and content hash travel verbatim — a consumer never restates them.
 *
 * EXTRACTED 2026-08-03 (the twin law): this decision lived privately inside
 * sourceStandingRead, and the join card's new face read was about to retype it
 * — a second home for one rule is how the two answers drift apart.
 */

import { INTRODUCTION_SNAPSHOT } from "./introductionSnapshot";
import { getLiveIntroductionModel } from "./introductionLiveModel";
import { sourceKeyOf } from "./introductionReadmodel";
import type {
  IntroductionReadmodel,
  IntroductionSourceStats,
} from "./introductionReadmodel";

export interface ActiveIntroductionModel {
  model: IntroductionReadmodel;
  /** The active model's own content hash (live hash or the snapshot's). */
  hash: string;
}

/** The freshest verified model — live if at least as fresh, else committed. */
export function activeIntroductionModel(): ActiveIntroductionModel {
  const live = getLiveIntroductionModel();
  return live !== null && live.model.asOfBlock >= INTRODUCTION_SNAPSHOT.model.asOfBlock
    ? { model: live.model, hash: live.modelHash }
    : { model: INTRODUCTION_SNAPSHOT.model, hash: INTRODUCTION_SNAPSHOT.snapshotHash };
}

/**
 * One source's row in the active model, or null — no attributed purchase yet,
 * or an id that is not a bytes32 (sourceKeyOf throws on shape; fail closed,
 * never a fabricated row).
 */
export function sourceStatsFor(sourceIdHex: string): IntroductionSourceStats | null {
  try {
    return activeIntroductionModel().model.bySource[sourceKeyOf(sourceIdHex)] ?? null;
  } catch {
    return null;
  }
}
