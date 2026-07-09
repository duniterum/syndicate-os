import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// StatusPill — the single tokenized status atom. It replaces the per-component
// badge sprawl (AccessStateChip / PostureBadge / LifecycleBadge / SampleTag) so
// status color lives in ONE place and is expressed only through semantic tokens,
// never a hand-picked Tailwind palette shade:
//   proof / live → --proof / --live (cyan · verified / read-only-proof / live)
//   identity     → --identity (gold · seat / recognition / privileged)
//   caution      → --warning  (amber · pending / paused / simulated)
//   danger       → --destructive (red · failed / unavailable / fail-closed)
//   neutral      → --muted    (inert · not-wired / historical / illustrative)
// The tint is one token value at low alpha for the fill/border and full strength
// for the text, so both light and dark modes stay coherent from a single source.
export type StatusTone = "proof" | "live" | "identity" | "caution" | "danger" | "neutral";
type StatusSize = "sm" | "xs";

const TONE: Record<StatusTone, string> = {
  proof: "bg-proof/10 text-proof border-proof/25 dark:bg-proof/15 dark:border-proof/35",
  live: "bg-live/10 text-live border-live/25 dark:bg-live/15 dark:border-live/35",
  identity: "bg-identity/10 text-identity border-identity/30 dark:bg-identity/15 dark:border-identity/40",
  caution: "bg-warning/10 text-warning border-warning/30 dark:bg-warning/15 dark:border-warning/40",
  danger: "bg-destructive/10 text-destructive border-destructive/25 dark:bg-destructive/15 dark:border-destructive/35",
  neutral: "bg-muted text-muted-foreground border-border",
};

const SIZE: Record<StatusSize, string> = {
  sm: "text-[10px] sm:text-xs px-2 py-0.5",
  xs: "text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0 leading-4",
};

interface StatusPillProps {
  tone: StatusTone;
  size?: StatusSize;
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}

export function StatusPill({ tone, size = "sm", className, children, ...rest }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border font-mono font-medium transition-colors",
        SIZE[size],
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
