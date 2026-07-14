import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";

// Honesty chip for the hero's LIVE figures — the counterpart of SampleTag
// (which deliberately never renders "Live"). Three honest states only:
//   live        → the figure on screen is a real read-only on-chain read
//                 (served by the Protocol Reality Spine / Holder Index)
//   checking    → the live read is still loading
//   unavailable → the live read failed — fail-closed, nothing is invented
export type LiveReadState = "live" | "checking" | "unavailable";

// M1-b truth sweep: "Live · read-only" DIED — it framed the PROTOCOL as
// read-only while seats sell live, in-page, with real money. The tag's honest
// claim is about the FIGURE: it is a live chain read. States stay fail-closed.
const STATE_TEXT: Record<LiveReadState, string> = {
  live: "Live chain read",
  checking: "Checking…",
  unavailable: "Live read unavailable",
};

// State → tokenized tone. A real live read is the `live` (cyan) state; loading is
// inert → neutral; a failed read is `danger` (red) — fail-closed, never invented.
const STATE_TONE: Record<LiveReadState, StatusTone> = {
  live: "live",
  checking: "neutral",
  unavailable: "danger",
};

export function LiveReadTag({ state, className = "" }: { state: LiveReadState; className?: string }) {
  return (
    <StatusPill tone={STATE_TONE[state]} size="xs" className={className}>
      {STATE_TEXT[state]}
    </StatusPill>
  );
}

/** The honest per-figure display for a live read: value, or checking/unavailable. */
export function liveFigure(value: string | null, loading: boolean): string {
  if (value !== null) return value;
  return loading ? "Checking…" : "Unavailable";
}
