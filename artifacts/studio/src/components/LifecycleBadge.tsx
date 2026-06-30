import { Badge } from "@/components/ui/badge";
import { type DisplayLifecycle, displayLifecycleText } from "@/config/truthStatus";

interface LifecycleBadgeProps {
  lifecycle: DisplayLifecycle;
  className?: string;
}

// Dual-mode (light + dark) styles, coherent with TruthLabel. None of these
// read as an affirmative "live" state — the strongest is "Read-only proof".
const variantStyles: Record<DisplayLifecycle, string> = {
  READ_ONLY_PROOF:
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-950/50",
  HISTORICAL_PROOF:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900",
  PAUSED_BY_PRECAUTION:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  PENDING_ADAPTER:
    "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-900/50 hover:bg-teal-100 dark:hover:bg-teal-950/50",
  NOT_ACTIVE:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900",
  FOUNDER_GATED:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-950/50",
  AUTH_REQUIRED:
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-950/50",
  PREVIEW:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-950/50",
  DESIGN_CONCEPT:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900/50 hover:bg-violet-100 dark:hover:bg-violet-950/50",
  FUTURE:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-950/50",
};

export function LifecycleBadge({ lifecycle, className = "" }: LifecycleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[10px] sm:text-xs font-medium px-2 py-0.5 whitespace-nowrap transition-colors ${variantStyles[lifecycle]} ${className}`}
    >
      {displayLifecycleText[lifecycle]}
    </Badge>
  );
}
