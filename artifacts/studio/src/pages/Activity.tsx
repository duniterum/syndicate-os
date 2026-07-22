// pages/Activity.tsx — /activity, THE NEWSROOM (A3 rebuild, wireframe
// founder-approved "GO and GO-Live" 2026-07-22 — WORK-FIRST: the visitor
// lands on the news. The composition lives in LiveActivityFeed: Z1 header
// band (ONE-authority seat figure + era band) → Z2 facets → Z3 the feed,
// 12 lines newest-first with Load more → Z4 milestones condensed → Z5 the
// methodology expander. History: ACT-1 grew it; M5 served the seat history;
// M4-c + H1a completed the heartbeat; H2-⑬ added milestones; A2 gave the
// served record pagination (the old "adds next: pagination" promise is LIVE
// — DONE-IS-DONE: the card that claimed it future died in this commit; the
// remaining honest futures moved into the Z5 expander's closing sentence).

import { MemberAppPage } from "@/components/member/MemberAppPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";

export default function Activity() {
  return (
    <MemberAppPage
      eyebrow="Activity"
      title="The public heartbeat."
      lead="The protocol speaks through verified receipts — every line below is an on-chain event, newest first, with its own verify link. Never a claim, never more than the chain itself publishes."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveActivityFeed />
    </MemberAppPage>
  );
}
