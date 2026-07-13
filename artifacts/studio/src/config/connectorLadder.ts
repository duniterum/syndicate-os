// config/connectorLadder.ts — the Connector ladder (display data + progress).
// ---------------------------------------------------------------------------
// SOURCE OF TRUTH: docs/direction/CONNECTOR_LADDER_POLICY.md (founder-decided
// 2026-07-13, FINAL — supersedes every earlier ladder). Two decoupled ladders:
// TITLES (dense, free) and RATES (rare, irreversible — a rate never decreases,
// never retroactive). All-automatic: the threshold decides, the founder's
// signature only executes. "Durable introduction" = counted by the R5 indexer
// (an introduced member whose wallet still holds SYN — the founder-decided
// test). The COUNT may go down as well as up; a signed promotion never
// reverts. Partner is a negotiated CLASS, never a rung — deliberately absent.
// Dependency-free → Node-loadable for guards.

export interface LadderRung {
  title: string;
  /** Durable introductions required (the R5 counter unit). */
  durableThreshold: number;
  /** The rung's commission rate in basis points. */
  bps: number;
  /** false = title + season points only (Active raises no rate). */
  raisesRate: boolean;
}

/** The seven rungs, in order. Summit = MAX_MEMBER_INTRO_BPS (bytecode cap). */
export const LADDER_RUNGS: readonly LadderRung[] = [
  { title: "Emerging", durableThreshold: 0, bps: 500, raisesRate: true },
  { title: "Active", durableThreshold: 3, bps: 500, raisesRate: false },
  { title: "Trusted", durableThreshold: 10, bps: 600, raisesRate: true },
  { title: "Established", durableThreshold: 25, bps: 700, raisesRate: true },
  { title: "Durable", durableThreshold: 60, bps: 800, raisesRate: true },
  { title: "Foundational", durableThreshold: 150, bps: 1000, raisesRate: true },
  { title: "Summit", durableThreshold: 300, bps: 1200, raisesRate: true },
] as const;

export interface LadderProgress {
  /** The highest rung whose threshold the count meets (>= Emerging always). */
  current: LadderRung;
  /** The next rung up, or null at the summit. */
  next: LadderRung | null;
  /** 0..1 toward the next threshold — NEVER 0 (the UI law: the bar is never
   * empty; a member at zero sees the road, not a void). */
  ratio: number;
  durable: number;
}

export function ladderProgress(durable: number): LadderProgress {
  const d = Number.isFinite(durable) && durable > 0 ? Math.floor(durable) : 0;
  let idx = 0;
  for (let i = 0; i < LADDER_RUNGS.length; i += 1) {
    if (d >= LADDER_RUNGS[i].durableThreshold) idx = i;
  }
  const current = LADDER_RUNGS[idx];
  const next = idx + 1 < LADDER_RUNGS.length ? LADDER_RUNGS[idx + 1] : null;
  if (!next) return { current, next: null, ratio: 1, durable: d };
  const span = next.durableThreshold - current.durableThreshold;
  const into = d - current.durableThreshold;
  // Floor at 0.04 so the bar is never visually empty (the pinned UI law).
  const ratio = Math.max(0.04, Math.min(1, span > 0 ? into / span : 0));
  return { current, next, ratio, durable: d };
}
