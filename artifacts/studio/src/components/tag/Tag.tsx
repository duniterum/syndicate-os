import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Tag — the tokenized general-purpose label atom for taxonomy / metadata: a route
// index status, a category, a kind, a count. It is NOT a status — system STATES
// (proof / live / caution / danger …) belong on StatusPill. Tag is neutral by
// default; identity (gold) / proof (cyan) are for light emphasis. Tokens only,
// never a hand-picked palette shade.
export type TagTone = "neutral" | "identity" | "proof";
type TagSize = "sm" | "xs";

const TONE: Record<TagTone, string> = {
  neutral: "bg-muted/40 text-muted-foreground border-border/60",
  identity: "bg-identity/10 text-identity border-identity/30",
  proof: "bg-proof/10 text-proof border-proof/25",
};

const SIZE: Record<TagSize, string> = {
  sm: "text-[10px] sm:text-xs px-2 py-0.5",
  xs: "text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0 leading-4",
};

interface TagProps {
  tone?: TagTone;
  size?: TagSize;
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}

export function Tag({ tone = "neutral", size = "sm", className, children, ...rest }: TagProps) {
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
