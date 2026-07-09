import { Tag } from "@/components/tag/Tag";
import { cn } from "@/lib/utils";

// Calm, on-brand placeholder shown where a wallet sign-in entry would appear
// while the auth zone is dark. In this state no RainbowKit verify flow is
// mounted, so a visitor never sees the raw "Error preparing message" — just an
// honest "not open yet, come back" note. Consistent with observe-first.
export function WalletAuthComingSoon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3",
        className,
      )}
      data-testid="wallet-auth-coming-soon"
    >
      <Tag tone="neutral">Coming soon</Tag>
      <span className="text-sm text-muted-foreground">
        Wallet sign-in isn’t open yet — explore the protocol now and come back when it opens.
      </span>
    </div>
  );
}
