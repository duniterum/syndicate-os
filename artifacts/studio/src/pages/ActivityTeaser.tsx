// pages/ActivityTeaser.tsx — /activity, LIVE V3 (ARC ACT-1 grew it; ARC M5
// served the seat history; ARC M4-c completed the heartbeat: burns and
// referral lifecycle join the seats — ALL THREE histories served complete by
// the unattended indexer, with the ~24h client window as the freshness layer
// between cycles). The vision block states exactly what arrives NEXT.

import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";

export default function ActivityTeaser() {
  return (
    <PublicPage
      eyebrow="Activity"
      title="The public heartbeat."
      lead="The protocol speaks through verified receipts. Seats, burns and referral events are served by the event indexer — the complete on-chain record, newest first — refreshed live from the chain between cycles. Every line carries its own verify link — aggregate and address-safe, never a claim."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveActivityFeed />

      {/* What the indexer adds NEXT — the promise, honestly re-scoped (M5). */}
      <Card className="bg-card/20 border-dashed border-border/60 p-5 mt-10">
        <h2 className="text-base font-medium text-foreground mb-1.5">What the event indexer adds next</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The indexer arrived for all three kinds: seats, burns and referral
          lifecycle above are the complete served records, not a window. What
          it adds next: pagination beyond the newest lines, per-seat feeds,
          notifications, and the candidate pipeline that feeds the Chronicle.
          Until each arrives, every source above states exactly what it
          covers.
        </p>
      </Card>
    </PublicPage>
  );
}
