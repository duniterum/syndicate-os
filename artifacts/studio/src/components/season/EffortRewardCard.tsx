// EffortRewardCard — the SEPARATE cash rail's frame on Member Home (S2d;
// the corrected member mockup's .bounty card, truth-amended: the "$40
// eligible" figure was illustrative — NO figure renders before the committed
// escrow exists; seasonBounty stays FUTURE until S3 activates the rail).
// ---------------------------------------------------------------------------
// WHY A SEPARATE CARD (the two-layer law, §0.14): recognition (XP, ranks —
// never cash) and the effort reward (real company USDC — merit, published,
// then PUSHED) never blend on one surface. The emerald identity marks the
// cash rail; the push voice is the whole promise: nothing to claim from an
// operator, ever (§0.15 zero-click).
// Static frame, no data fetch — the day the rail activates, the committed
// figures arrive with their proof links, never before.

import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";

export function EffortRewardCard() {
  return (
    <Card
      className="border-success/35 bg-gradient-to-br from-success/[0.06] to-card p-5"
      data-testid="member-effort-card"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-medium text-foreground">Effort reward</h3>
        <span className="rounded border border-success/40 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-success">
          USDC · a separate rail
        </span>
        <LifecycleBadge lifecycle="FUTURE" />
      </div>
      <p className="text-sm text-foreground">
        <b>By merit, never chance.</b> Company money for measured effort — published for
        verification, then paid.
      </p>
      <p className="mt-2 text-[13px] font-semibold text-success">
        The USDC lands directly in your wallet — nothing to claim.
      </p>
      <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
        Separate from recognition on purpose: this is payment for a measured effort — never
        chance, never a yield on what you hold. The committed figures stand here, with their
        proof, the day the rail activates.
      </p>
    </Card>
  );
}
