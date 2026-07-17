// pages/MemberToolkit.tsx — /toolkit (ARC SLICE D).
// The full member action registry rendered as the PUBLIC CONVERSION SURFACE:
// a visitor sees every action a seat unlocks, locked ones visibly locked with
// their plain reason (locked ≠ hidden — the spec's return-visit hook);
// operator actions do not exist in the registry at all. FLAT route for the
// same infra reason as /wallet.

import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberShell } from "@/components/member/MemberShell";
import { MemberQuickActions } from "@/components/member/MemberQuickActions";

export default function MemberToolkit() {
  return (
    <PublicPage
      eyebrow="Toolkit"
      title="What a seat can do."
      lead="Every member action, in one place — real acts only. What your wallet unlocks is shown unlocked; what a seat unlocks stays visible with the plain reason, so you can see exactly what joining opens."
      badge={<LifecycleBadge lifecycle="LIVE_ACTION" />}
    >
      <MemberShell>
        <MemberQuickActions />
      </MemberShell>
    </PublicPage>
  );
}
