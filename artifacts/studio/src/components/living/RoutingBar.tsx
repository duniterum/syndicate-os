import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// RoutingBar — a horizontal stacked bar of a LIVE routed split (e.g. the 70/20/10
// Reserve/Liquidity/Operations routing), sized by the live routed amounts (never
// a hardcoded width). Each segment shows its live figure + a labelled design
// target. Fail-closed: until every weight resolves it renders a muted "reading…"
// track. Token-only. Reusable by tokenomics + the future economy/status surfaces.
export interface RoutingSegment {
  key: string;
  label: string;
  /** Numeric weight for the bar width (e.g. the routed USDC amount), or null. */
  weight: number | null;
  /** The live figure to display (an <Amount/> or text). */
  figure: ReactNode;
  /** Design-target label, e.g. "70% target". */
  target: string;
  /** Token background class for this segment (bg-identity / bg-proof / bg-viz-*). */
  colorClass: string;
}

export function RoutingBar({
  segments,
  className,
}: {
  segments: readonly RoutingSegment[];
  className?: string;
}) {
  const ready = segments.every((s) => s.weight !== null && s.weight >= 0);
  const total = ready
    ? segments.reduce((sum, s) => sum + (s.weight as number), 0)
    : 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label="Live routed split"
      >
        {ready && total > 0
          ? segments.map((s) => (
              <div
                key={s.key}
                className={s.colorClass}
                style={{ width: `${((s.weight as number) / total) * 100}%` }}
              />
            ))
          : (
            <div className="h-full w-full animate-pulse bg-muted-foreground/20" />
          )}
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", s.colorClass)} aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm text-foreground/90">{s.label}</span>
              <span className="block font-mono text-xs text-muted-foreground">
                {s.figure} · {s.target}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
