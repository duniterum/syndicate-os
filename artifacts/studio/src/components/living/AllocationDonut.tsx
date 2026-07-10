import { cn } from "@/lib/utils";

// AllocationDonut — an SVG donut of a LIVE distribution (each segment's percent
// read from chain, never hardcoded). Token-only colors from the data-viz palette
// (+ identity/gold for the 7th). Fail-closed: until every segment resolves it
// shows a muted "reading…" ring rather than a partial/guessed chart. The legend
// carries the accessible labels; the SVG is aria-hidden. Reused by tokenomics.
export interface DonutSegment {
  key: string;
  label: string;
  /** Live percent (0–100), or null when the live read is unavailable. */
  pct: number | null;
}

// Literal classes so Tailwind emits them (no dynamic `stroke-${x}`).
const STROKE = [
  "stroke-viz-1", "stroke-viz-2", "stroke-viz-3",
  "stroke-viz-4", "stroke-viz-5", "stroke-viz-6", "stroke-identity",
];
const SWATCH = [
  "bg-viz-1", "bg-viz-2", "bg-viz-3",
  "bg-viz-4", "bg-viz-5", "bg-viz-6", "bg-identity",
];

// r chosen so the circumference ≈ 100 → dasharray math is in raw percent.
const R = 15.915;

export function AllocationDonut({
  segments,
  className,
}: {
  segments: readonly DonutSegment[];
  className?: string;
}) {
  const ready = segments.every((s) => s.pct !== null);

  let cumulative = 0;

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row sm:items-center", className)}>
      <svg viewBox="0 0 42 42" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="SYN allocation, live">
        {/* track */}
        <circle cx="21" cy="21" r={R} fill="none" className="stroke-border" strokeWidth="4" />
        {ready
          ? segments.map((s, i) => {
              const pct = s.pct as number;
              const dash = `${pct} ${100 - pct}`;
              const offset = 25 - cumulative; // start at 12 o'clock
              cumulative += pct;
              return (
                <circle
                  key={s.key}
                  cx="21"
                  cy="21"
                  r={R}
                  fill="none"
                  className={STROKE[i % STROKE.length]}
                  strokeWidth="4"
                  strokeDasharray={dash}
                  strokeDashoffset={offset}
                />
              );
            })
          : (
            <circle
              cx="21"
              cy="21"
              r={R}
              fill="none"
              className="stroke-muted-foreground/40 animate-pulse"
              strokeWidth="4"
              strokeDasharray="100 0"
            />
          )}
      </svg>

      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2" aria-label="Allocation legend">
        {segments.map((s, i) => (
          <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", SWATCH[i % SWATCH.length])} aria-hidden />
              <span className="truncate text-foreground/90">{s.label}</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {s.pct === null ? "…" : `${s.pct.toFixed(2)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
