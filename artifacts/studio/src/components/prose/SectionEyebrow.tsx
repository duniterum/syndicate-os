// components/prose/SectionEyebrow.tsx — THE ONE prose-section eyebrow.
// ---------------------------------------------------------------------------
// Footer audit 2026-07-30: Tokenomics and Whitepaper each RE-DERIVED this
// helper (Check ④ — import, never re-derive), and all 19 call sites hardcoded
// status="VERIFIED" — so when the live read failed, the pages rendered
// VERIFIED section headers directly above "PENDING · live read" fail-closed
// pills: a self-contradiction. The status is now DERIVED from the page's own
// read state and can never be typed as a literal again:
//   · VERIFIED    — the page's live reads resolved (earned, not asserted);
//   · CHECKING    — the first read is still in flight;
//   · UNAVAILABLE — the read failed (matches the fail-closed pills below it);
//   · FUTURE      — a deliberately future-scoped section (hand-set tone only).

import { ProseIndex } from "@/components/prose/Prose";
import { StatusPill } from "@/components/status-pill/StatusPill";

export type SectionReadState = "VERIFIED" | "CHECKING" | "UNAVAILABLE" | "FUTURE";

/** Derive the one state every section eyebrow on a page shares. */
export function sectionReadState(loading: boolean, anyRead: boolean): SectionReadState {
  if (anyRead) return "VERIFIED";
  return loading ? "CHECKING" : "UNAVAILABLE";
}

const TONE: Record<SectionReadState, "proof" | "caution" | "neutral"> = {
  VERIFIED: "proof",
  CHECKING: "caution",
  UNAVAILABLE: "caution",
  FUTURE: "neutral",
};

export function SectionEyebrow({ n, state }: { n: number; state: SectionReadState }) {
  return (
    <>
      <ProseIndex n={n} />
      <StatusPill tone={TONE[state]} size="xs">
        {state}
      </StatusPill>
    </>
  );
}
