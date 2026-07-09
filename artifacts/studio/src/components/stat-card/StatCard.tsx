import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// StatCard — the FastPay-grade KPI atom: an optional toned icon, a label, a value
// slot, an optional micro-trend chip and an optional meta footer. The value is
// `children`, so the caller composes it: pass <Amount .../> for on-chain money, or
// a plain figure for counts. Tokens only — icon/trend colors come from semantic
// roles (identity/proof/neutral · proof/danger), never a hand-picked palette shade.
export type StatTone = "identity" | "proof" | "neutral";
export type TrendDirection = "up" | "down" | "flat";

const ICON_TONE: Record<StatTone, string> = {
  identity: "text-identity",
  proof: "text-proof",
  neutral: "text-muted-foreground",
};

// Micro-trend maps to status tones already in the system: a rise reads on the proof
// (cyan) axis, a fall is danger (red), flat is neutral. The direction is the honest
// direction of the figure, not a good/bad judgement.
const TREND_TONE: Record<TrendDirection, string> = {
  up: "text-proof",
  down: "text-destructive",
  flat: "text-muted-foreground",
};
const TREND_GLYPH: Record<TrendDirection, string> = {
  up: "▲",
  down: "▼",
  flat: "→",
};

interface StatCardProps {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  trend?: { direction: TrendDirection; label: string };
  meta?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function StatCard({
  label,
  children,
  icon,
  tone = "neutral",
  trend,
  meta,
  className,
  ...rest
}: StatCardProps) {
  return (
    <div
      className={cn("rounded-lg border border-border/60 bg-card/40 p-3.5", className)}
      {...rest}
    >
      <div className="mb-2 flex items-center gap-2">
        {icon ? (
          <span className={cn("inline-flex shrink-0 [&_svg]:size-4", ICON_TONE[tone])}>{icon}</span>
        ) : null}
        <span className="syn-label text-muted-foreground">{label}</span>
      </div>
      <div className="font-mono text-xl font-black text-foreground">{children}</div>
      {trend ? (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-1 font-mono text-[11px] font-semibold",
            TREND_TONE[trend.direction],
          )}
        >
          <span aria-hidden>{TREND_GLYPH[trend.direction]}</span>
          <span>{trend.label}</span>
        </div>
      ) : null}
      {meta ? <div className="mt-1.5 text-[11px] leading-tight text-muted-foreground">{meta}</div> : null}
    </div>
  );
}
