import React from "react";
import { Badge } from "@/components/ui/badge";

// Honesty label for the hero's illustrative figures. Deliberately SEPARATE from
// TruthLabel (which reports live wiring status). SampleTag never renders "Live":
//   - simulated   → a made-up figure shown to convey shape, not a live read
//   - canonical   → a fixed structural fact (e.g. the 70/20/10 routing ratio)
//   - illustrative→ a non-numeric mock element
export type SampleKind = "simulated" | "canonical" | "illustrative";

const KIND_TEXT: Record<SampleKind, string> = {
  simulated: "Preview",
  canonical: "Canonical",
  illustrative: "Preview",
};

const KIND_STYLES: Record<SampleKind, string> = {
  simulated:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50",
  canonical:
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900/50",
  illustrative:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
};

interface SampleTagProps {
  kind: SampleKind;
  className?: string;
}

export function SampleTag({ kind, className = "" }: SampleTagProps) {
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[9px] sm:text-[10px] font-medium uppercase tracking-wider px-1.5 py-0 leading-4 whitespace-nowrap ${KIND_STYLES[kind]} ${className}`}
    >
      {KIND_TEXT[kind]}
    </Badge>
  );
}
