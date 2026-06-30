import React from "react";
import { Badge } from "@/components/ui/badge";
import type { NonLivePosture } from "@workspace/os-contracts";

/**
 * Posture badge for the /status honesty hub. Mirrors the TruthLabel visual
 * language (same Badge primitive, same class patterns) but is keyed by the
 * canonical @workspace/os-contracts SourcePosture vocabulary returned by
 * GET /api/source-status.
 *
 * This is posture-only: it communicates wiring posture, never a live value. The
 * prop is typed as NonLivePosture — the canon's read / display / gated postures
 * with LIVE_ACTION deliberately excluded, so a badge can never imply a live write.
 */
export type BadgePosture = NonLivePosture;

export const postureText: Record<BadgePosture, string> = {
  READ_ONLY_PROOF: "Read-only proof",
  NOT_WIRED: "Not wired",
  VERIFIED_SOURCE_PENDING_ADAPTER: "Verified source pending adapter",
  AUTH_REQUIRED: "Auth required",
  ADMIN_ONLY: "Admin only",
  FUTURE: "Future",
};

const postureStyles: Record<BadgePosture, string> = {
  READ_ONLY_PROOF:
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-950/50",
  VERIFIED_SOURCE_PENDING_ADAPTER:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  NOT_WIRED:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900",
  AUTH_REQUIRED:
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-950/50",
  ADMIN_ONLY:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/50",
  FUTURE:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-950/50",
};

interface PostureBadgeProps {
  posture: BadgePosture;
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
