// pages/FireLedgerTeaser.tsx — /fire-ledger, LIVE V1 (ARC ACT-1; the teaser
// GREW). The live TOTAL burn (already shipped) + the per-burn RECENT-WINDOW
// feed from the shared spine (kind: burn only). The vision block stays at the
// bottom — the complete ledger from block one arrives with the indexer.

import { Flame } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";

// The one figure that is always readable — live, fail-closed.
function LiveTotalBurn() {
  const { burnedSyn } = useHeroReality();
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-md bg-primary/10 text-primary" aria-hidden="true">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Total SYN retired — read live</p>
            <p className="text-[11px] text-muted-foreground">
              The burn address balance, read from the chain on every load. It
              only ever grows.
            </p>
          </div>
        </div>
        <div className="text-right">
          {burnedSyn !== null ? (
            <p className="font-mono text-xl text-foreground" data-testid="text-live-burn-total">
              {burnedSyn} <span className="text-xs text-muted-foreground">SYN</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Checking the chain…</p>
          )}
          <VerifyOnChain ids={["burnAddress"]} />
        </div>
      </div>
    </Card>
  );
}

export default function FireLedgerTeaser() {
  return (
    <PublicPage
      eyebrow="Fire Ledger"
      title="Supply, retired in public."
      lead="Proof of Fire is a costly signal: SYN sent to the burn address is gone for everyone, forever — never minting, never a price promise. Below: the live total, and every burn the recent window carries, each with its own verify link."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveTotalBurn />

      <h2 className="text-base font-medium text-foreground mb-3">Recent burns</h2>
      <LiveActivityFeed onlyKinds={["burn"]} showFilters={false} />

      <Card className="bg-card/20 border-dashed border-border/60 p-5 mt-10">
        <h2 className="text-base font-medium text-foreground mb-1.5">What the event indexer adds</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The complete ledger — every burn since the first block, who chose the
          fire (opt-in), page by page — arrives with the event indexer. The
          total above is already whole; the window above it is exactly what it
          says it is.
        </p>
      </Card>
    </PublicPage>
  );
}
