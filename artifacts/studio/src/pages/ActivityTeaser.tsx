// pages/ActivityTeaser.tsx — /activity, LIVE V1 (ARC ACT-1; the teaser GREW).
// The public heartbeat: a recent-window feed read live from the chain, every
// line receipt-backed and verify-linked (the feed spine carries the honesty
// banner). The old teaser's vision block stays at the bottom as "what the
// indexer adds" — the deeper history is a promise the indexer keeps, not us.

import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";

export default function ActivityTeaser() {
  return (
    <PublicPage
      eyebrow="Activity"
      title="The public heartbeat."
      lead="The protocol speaks through verified receipts. Every line below is an on-chain event from the recent window, rendered as a plain sentence with its own verify link — aggregate and address-safe, never a claim."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveActivityFeed />

      {/* What the indexer adds — the old teaser's vision, honestly scoped. */}
      <Card className="bg-card/20 border-dashed border-border/60 p-5 mt-10">
        <h2 className="text-base font-medium text-foreground mb-1.5">What the event indexer adds</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This page reads a recent window directly from the chain, in your
          browser. The event indexer — the same machinery already counting
          referral introductions — will serve the COMPLETE history from the
          first block: full pagination, per-member feeds, and the candidate
          pipeline that feeds the Chronicle. Until then, the window above is
          exactly what it says it is.
        </p>
      </Card>
    </PublicPage>
  );
}
