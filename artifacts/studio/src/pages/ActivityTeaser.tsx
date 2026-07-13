// pages/ActivityTeaser.tsx — /activity, LIVE V2 (ARC ACT-1 grew it; ARC M5
// wired the event backbone). The public heartbeat: seat history is now SERVED
// by the unattended indexer — the complete record from the first block —
// while burns and referral lifecycle stay an honest recent client window.
// The vision block below states exactly what the indexer adds NEXT.

import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";

export default function ActivityTeaser() {
  return (
    <PublicPage
      eyebrow="Activity"
      title="The public heartbeat."
      lead="The protocol speaks through verified receipts. Seat history is served by the event indexer — the complete on-chain record, newest first — and recent burns and referral events are read live from the chain. Every line carries its own verify link — aggregate and address-safe, never a claim."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveActivityFeed />

      {/* What the indexer adds NEXT — the promise, honestly re-scoped (M5). */}
      <Card className="bg-card/20 border-dashed border-border/60 p-5 mt-10">
        <h2 className="text-base font-medium text-foreground mb-1.5">What the event indexer adds next</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The indexer arrived for seats: their history above is the complete
          served record, not a window. What it adds next: the same complete
          history for burns and referral lifecycle, pagination beyond the
          newest lines, per-seat feeds, and the candidate pipeline that feeds
          the Chronicle. Until each arrives, every source above states exactly
          what it covers.
        </p>
      </Card>
    </PublicPage>
  );
}
