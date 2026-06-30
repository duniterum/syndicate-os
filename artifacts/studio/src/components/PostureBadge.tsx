import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * Posture badge for the /status honesty hub. Mirrors the TruthLabel visual
 * language (same Badge primitive, same class patterns) but is keyed by the
 * source-status `posture` enum returned by GET /api/source-status.
 *
 * This is posture-only: it communicates wiring posture, never a live value.
 */
export type Posture =
  | "READ_ONLY_PROOF"
  | "ADAPTER_REQUIRED"
  | "NOT_WIRED"
  | "NOT_LIVE"
  | "FUTURE"
  | "EXTERNAL";

export const postureText: Record<Posture, string> = {
  READ_ONLY_PROOF: "Read-only proof",
  ADAPTER_REQUIRED: "Adapter required",
  NOT_WIRED: "Not wired",
  NOT_LIVE: "Not live",
  FUTURE: "Future module",
  EXTERNAL: "External",
};

const postureStyles: Record<Posture, string> = {
  READ_ONLY_PROOF:
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-950/50",
  ADAPTER_REQUIRED:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  NOT_WIRED:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900",
  NOT_LIVE:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50",
  FUTURE:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-950/50",
  EXTERNAL:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-950/50",
};

interface PostureBadgeProps {
  posture: Posture;
  className?: string;
}

export function PostureBadge({ posture, className = "" }: PostureBadgeProps) {
  const style = postureStyles[posture] ?? postureStyles.NOT_WIRED;
  const text = postureText[posture] ?? posture;
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[10px] sm:text-xs font-medium px-2 py-0.5 whitespace-nowrap transition-colors ${style} ${className}`}
    >
      {text}
    </Badge>
  );
}
