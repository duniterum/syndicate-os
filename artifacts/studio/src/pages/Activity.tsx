// pages/Activity.tsx — /activity, LIVE V3 (ARC ACT-1 grew it; ARC M5
// served the seat history; ARC M4-c + H1a completed the heartbeat: burns,
// referral lifecycle, liquidity and archive join the seats; H2-⑬ added the
// MILESTONE layer — canonical crossings derived from the same gapless
// history, each anchored to its exact transaction. The ~24h client window
// stays the freshness layer between cycles. The vision block states exactly
// what arrives NEXT.

import { MemberAppPage } from "@/components/member/MemberAppPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";

export default function Activity() {
  return (
    <MemberAppPage
      eyebrow="Activity"
      title="The public heartbeat."
      lead="The protocol speaks through verified receipts. Seats, burns, referral events, liquidity, archive mints, treasury movements, milestone crossings, era turns and footprint rises are served by the event indexer — the complete on-chain record, newest first — refreshed live from the chain between cycles; Chronicle promotions and the protocol's deployments join from the committed canon. Every line names its act the way the chain wrote it — member number, short-form signature — and carries its own verify link to the full transaction. Never a claim, never more than the chain itself publishes."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveActivityFeed />

      {/* What the indexer adds NEXT — the promise, honestly re-scoped. */}
      <Card className="bg-card/20 border-dashed border-border/60 p-5 mt-10">
        <h2 className="text-base font-medium text-foreground mb-1.5">What the event indexer adds next</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The heartbeat above is the complete served record — seats, burns,
          referral lifecycle, liquidity, archive, treasury movements,
          milestone crossings and era turns — not a window. What it adds
          next: pagination beyond the newest lines, per-seat feeds,
          notifications, and the candidate pipeline that feeds the Chronicle.
          Until each arrives, every source above states exactly what it
          covers.
        </p>
      </Card>
    </MemberAppPage>
  );
}
