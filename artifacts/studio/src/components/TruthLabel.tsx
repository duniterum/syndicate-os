import React from "react";
import { Badge } from "@/components/ui/badge";
import { TruthStatus, truthStatusText } from "@/config/truthStatus";

export type TruthLabelVariant = TruthStatus;

interface TruthLabelProps {
  variant: TruthLabelVariant;
  className?: string;
}

const variantStyles: Record<TruthStatus, string> = {
  NOT_LIVE: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50",
  DESIGN_PREVIEW: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-950/50",
  FUTURE_MODULE: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-950/50",
  EVENT_ADAPTER_NOT_WIRED: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  SOURCE_INDEXER_NOT_WIRED: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-900/50 hover:bg-teal-100 dark:hover:bg-teal-950/50",
  ARCHIVE_READS_NOT_WIRED: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900/50 hover:bg-violet-100 dark:hover:bg-violet-950/50",
  AWAITING_CHAIN_INDEX: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-950/50",
  SYNDICATE_INDEXER_NOT_WIRED: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-950/50",
  AWAITING_FOUNDER_APPROVAL: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-950/50",
  LIVE_SOURCE_MISSING: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900",
};

export function TruthLabel({ variant, className = "" }: TruthLabelProps) {
  return (
    <Badge variant="outline" className={`font-mono text-[10px] sm:text-xs font-medium px-2 py-0.5 whitespace-nowrap transition-colors ${variantStyles[variant]} ${className}`}>
      {truthStatusText[variant]}
    </Badge>
  );
}
