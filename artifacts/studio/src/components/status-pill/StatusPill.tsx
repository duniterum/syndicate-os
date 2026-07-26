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

// THE READABILITY FLOOR (ADR-001 amendment 2026-07-16 §4 — "RIEN d'utilisateur-visible
// sous 12px", which bans the arbitrary 9px / 10px / 11px font sizes outright; applied
// to this atom 2026-07-26). The literals are spelled out in words here on purpose: the
// guard §4 promises must strip comments, and a rule should never be undocumentable.
// The defect: both sizes CAPPED below the floor. "xs" rendered 9px, widening only to
// 10px at the sm breakpoint; "sm" rendered 10px under 640px. Because the sub-floor value
// was the MAX of a responsive pair — not a mobile-only compromise widened later — a
// 2560px monitor was still served 10px, forever. This atom carries the /activity feed's
// kind badge, once per row, which makes 9px the most repeated string on the site.
// The fix is a real scale step, not another arbitrary size: both variants now sit ON the
// 12px floor (text-xs, which also owns a 1rem line box) and separate by SHAPE instead of
// by an illegal type step — "sm" keeps the roomier gutters, "xs" stays the compact
// uppercase chip (tighter gutters, wider tracking, its 16px line box pinned so the
// bordered pill still reads as a chip and not as a button).
// Geometry moved (measured, borders included): "sm" is unchanged at >=640px (22px box —
// text-xs was already its desktop value) and grows 18px -> 22px under 640px, which IS the
// fix; "xs" grows 18px -> 20px at every width.
const SIZE: Record<StatusSize, string> = {
  sm: "text-xs px-2 py-0.5",
  xs: "text-xs uppercase tracking-wider px-1.5 py-px leading-4",
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
