// components/referral/ReferralIntroductionsPanel.tsx — TAB 2 · Introductions.
//
// The member's own introduction record. The COUNTS are live (the figures
// above the tabs); the per-introduction ROWS honestly wait for row-level
// serving (S7 truth sweep law: never a fake table, never a sample dollar).
// Visibility Law: rows will show the chain-emitted address short-form —
// never a name, alias, or email (address ≠ identity).

import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import type { StandingReadback } from "@/components/referral/referralStanding";

export function ReferralIntroductionsPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;

  return (
    <div>
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Your introductions — your own record
        </p>
        {s ? (
          <p className="text-sm text-foreground/90 leading-relaxed mb-2">
            <span className="font-medium text-foreground">
              {s.durableIntroductions} durable
            </span>{" "}
            · {s.introducedMembers} total — indexed from the chain, recorded up
            to block {s.asOfBlock.toLocaleString("en-US")}.
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground leading-relaxed">
          A durable introduction is an introduced member whose wallet still
          holds SYN. The count may move down as well as up; a signed promotion
          never reverts. Each introduction is an on-chain purchase the chain
          published — the record shows the joining wallet&apos;s address
          short-form, never a name, alias, or email.
        </p>
      </Card>

      {/* Per-receipt introduction history — the ONE genuinely-not-served
          piece, said honestly (the counts above are already indexed and
          live). Never a fake table, never a sample dollar (S7 truth sweep). */}
      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Per-introduction receipts</span>
          <LifecycleBadge lifecycle="PENDING_ADAPTER" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Receipt-backed proof of each individual introduction — which join,
          which receipt, which amount — arrives with row-level serving. Your
          counts above are already indexed and live.
        </p>
      </Card>

      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Second generation</span>
          <LifecycleBadge lifecycle="FUTURE" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Who they brought — the introductions your introductions made, as your
          own record. Own-row only, never a directory of other members.
        </p>
      </Card>
    </div>
  );
}
