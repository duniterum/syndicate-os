// components/referral/ReferralCommissionsPanel.tsx — TAB 3 · Commissions.
//
// The money, by state (paid / escrow — each labelled, the Stripe trust
// discipline), the anatomy of one commission at the member's OWN current
// rate, the evolutive chart-as-record slot (CHARTS POLICY: the record, never
// a projection — and no decorative fake bars while the record is unserved),
// and the pinned legal boundary line.

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { ladderProgress } from "@/config/connectorLadder";
import { referralProgram } from "@/config/referralProgram";
import { usd, type StandingReadback } from "@/components/referral/referralStanding";

/** $5.00 seat purchase at `bps` → the commission in dollars, two decimals. */
function commissionOnFiveDollars(bps: number): string {
  return `$${((5 * bps) / 10_000).toFixed(2)}`;
}

export function ReferralCommissionsPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  const rateBps = s ? ladderProgress(s.durableIntroductions).current.bps : 500;

  return (
    <div>
      {/* The money by state — only when the member's own read answered. */}
      {s ? (
        <Card className="bg-card/40 border-border/50 p-5 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The money — by state
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusPill tone="proof">Paid {usd(s.commissionPaidRaw)}</StatusPill>
            <StatusPill tone="identity">Escrow {usd(s.escrowOwedRaw)}</StatusPill>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Paid = already in your wallet, routed inside each buyer&apos;s own
            transaction. Escrow = owed and held on-chain — released while your
            source is active. Both are your own indexed record, up to block{" "}
            {s.asOfBlock.toLocaleString("en-US")}.
          </p>
        </Card>
      ) : null}

      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
          The anatomy of one commission
        </p>
        {/* "commission", plainly — the referrer-surface word (CANON §4).
            "acquisitionCost" is the bytecode/ABI word ONLY, banned from every
            public surface (recorded ruling 2026-07-13, SESSION_STATE + the
            master brief: never "acquisition cost"). */}
        <p className="text-sm text-foreground/90 leading-relaxed">
          A $5.00 seat purchase → {s ? "your" : "a"} {rateBps / 100}%
          commission = <span className="font-medium text-gold">{commissionOnFiveDollars(rateBps)}</span> —
          paid to {s ? "your" : "the introducer's"} wallet inside the
          buyer&apos;s own transaction, in the same block.
        </p>
      </Card>

      {/* The evolutive chart slot — a record, never a return. No bars render
          until the per-payment record is served (a decorative sparkline would
          be a fake figure). */}
      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Your commissions — the record</span>
          <LifecycleBadge lifecycle="PENDING_ADAPTER" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A chart appears here once the per-payment record is served — the
          record, never a projection. Each point will tie to its on-chain
          receipt.
        </p>
      </Card>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {referralProgram.boundaryLine}
      </p>
    </div>
  );
}
