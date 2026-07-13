// connectorLadderCanon.ts — the Connector ladder rungs (server-side mirror).
// ---------------------------------------------------------------------------
// SOURCE OF TRUTH: docs/direction/CONNECTOR_LADDER_POLICY.md (founder, FINAL).
// This mirrors artifacts/studio/src/config/connectorLadder.ts EXACTLY — the
// introduction guard reconciles the two literal tables and fails on drift
// (one ladder, two artifacts, zero divergence). Used by the read-model to
// compute each source's ENTITLED rung from its durable count.
// FOUNDER RULE (2026-07-13, "simple + transparency"): no compensation for the
// waiting gap — the rate applies at on-chain recording (never retroactive);
// the waiting is visible and dated instead.

export interface LadderRungCanon {
  title: string;
  durableThreshold: number;
  bps: number;
  raisesRate: boolean;
}

export const LADDER_RUNGS_CANON: readonly LadderRungCanon[] = [
  { title: "Emerging", durableThreshold: 0, bps: 500, raisesRate: true },
  { title: "Active", durableThreshold: 3, bps: 500, raisesRate: false },
  { title: "Trusted", durableThreshold: 10, bps: 600, raisesRate: true },
  { title: "Established", durableThreshold: 25, bps: 700, raisesRate: true },
  { title: "Durable", durableThreshold: 60, bps: 800, raisesRate: true },
  { title: "Foundational", durableThreshold: 150, bps: 1000, raisesRate: true },
  { title: "Summit", durableThreshold: 300, bps: 1200, raisesRate: true },
] as const;

/** The highest RATE-RAISING rung whose threshold the durable count meets. */
export function entitledRateRung(durable: number): LadderRungCanon {
  let rung = LADDER_RUNGS_CANON[0];
  for (const r of LADDER_RUNGS_CANON) {
    if (durable >= r.durableThreshold && r.raisesRate) rung = r;
  }
  return rung;
}
