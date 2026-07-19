import { Tag } from "@/components/tag/Tag";
import { cn } from "@/lib/utils";

// Calm, on-brand placeholder shown where a wallet sign-in entry would appear
// when the auth-availability read fails. Auth is LIVE in production
// (2026-07-11) — this state is a transient outage, not a future promise
// (copy re-trued 2026-07-19: the old "coming soon" told a falsehood in the
// live-auth era). No RainbowKit verify flow is mounted in this state, so a
// visitor never sees the raw "Error preparing message" — just an honest
// unavailable note.
export function WalletAuthComingSoon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3",
        className,
      )}
      data-testid="wallet-auth-coming-soon"
    >
      <Tag tone="neutral">Unavailable</Tag>
      <span className="text-sm text-muted-foreground">
        Sign-in is unavailable right now — try again shortly.
      </span>
    </div>
  );
}
