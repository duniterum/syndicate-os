import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Icon — the tokenized icon atom. Wraps a lucide icon (no new lib) with a fixed
// size scale (kills the h-3.5/h-4/h-5 drift) and a semantic tone (kills raw
// text-emerald/cyan/violet… on icons). Decorative by default (aria-hidden); pass
// `label` to make it a meaningful image with an accessible name. The 5 brand
// pictos (Seat/Chain/Vault/Seal/Archive) are a separate registry slice once their
// SVG artwork exists — this atom is the shared wrapper they'll also use.
export type IconSize = "xs" | "sm" | "md" | "lg";
export type IconTone =
  | "current" // inherit the surrounding text color (default)
  | "default"
  | "muted"
  | "identity"
  | "proof"
  | "live"
  | "danger";

const SIZE: Record<IconSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const TONE: Record<IconTone, string> = {
  current: "",
  default: "text-foreground",
  muted: "text-muted-foreground",
  identity: "text-identity",
  proof: "text-proof",
  live: "text-live",
  danger: "text-destructive",
};

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  /** Accessible name; when set the icon is meaningful, otherwise it's decorative. */
  label?: string;
  strokeWidth?: number;
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = "sm",
  tone = "current",
  label,
  strokeWidth,
  className,
}: IconProps) {
  return (
    <IconComponent
      className={cn(SIZE[size], TONE[tone], className)}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
