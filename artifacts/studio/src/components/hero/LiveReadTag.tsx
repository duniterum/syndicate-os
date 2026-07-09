import { Badge } from "@/components/ui/badge";

// Honesty chip for the hero's LIVE figures — the counterpart of SampleTag
// (which deliberately never renders "Live"). Three honest states only:
//   live        → the figure on screen is a real read-only on-chain read
//                 (served by the Protocol Reality Spine / Holder Index)
//   checking    → the live read is still loading
//   unavailable → the live read failed — fail-closed, nothing is invented
export type LiveReadState = "live" | "checking" | "unavailable";

const STATE_TEXT: Record<LiveReadState, string> = {
  live: "Live · read-only",
  checking: "Checking…",
  unavailable: "Live read unavailable",
};

const STATE_STYLES: Record<LiveReadState, string> = {
  live: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900/50",
  checking:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
  unavailable:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50",
};

export function LiveReadTag({ state, className = "" }: { state: LiveReadState; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[9px] sm:text-[10px] font-medium uppercase tracking-wider px-1.5 py-0 leading-4 whitespace-nowrap ${STATE_STYLES[state]} ${className}`}
    >
      {STATE_TEXT[state]}
    </Badge>
  );
}

/** The honest per-figure display for a live read: value, or checking/unavailable. */
export function liveFigure(value: string | null, loading: boolean): string {
  if (value !== null) return value;
  return loading ? "Checking…" : "Unavailable";
}
