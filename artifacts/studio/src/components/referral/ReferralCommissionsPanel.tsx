// components/referral/ReferralCommissionsPanel.tsx — TAB 3 · Commissions.
//
// The money, by state (paid / escrow — each labelled, the Stripe trust
// discipline), the anatomy of one commission at the member's OWN current
// rate, the evolutive chart-as-record slot (CHARTS POLICY: the record, never
// a projection — and no decorative fake bars while the record is unserved),
// and the pinned legal boundary line.

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ladderProgress } from "@/config/connectorLadder";
import { referralProgram } from "@/config/referralProgram";
import {
  usd,
  useOwnIntroductions,
  type StandingReadback,
} from "@/components/referral/referralStanding";

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

      {/* Slice ④ — the dated commission RECORD, live from the per-row model.
          CHARTS POLICY: the record, never a projection — while the history
          is sparse the record renders as dated receipt lines (each tied to
          its on-chain anchor); a chart takes over as the story grows. */}
      <CommissionRecordCard />

      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {referralProgram.boundaryLine}
      </p>
    </div>
  );
}

// The dated record — REAL rows only; honest states, never a sample.
function CommissionRecordCard() {
  const intro = useOwnIntroductions();
  const rows = intro?.rows ?? null;
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-foreground">Your commissions — the record</span>
        {rows !== null ? (
          <StatusPill tone="live" size="xs">Live · your own row</StatusPill>
        ) : null}
      </div>
      {rows === null ? (
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          title={intro?.failureReason ?? undefined}
        >
          {intro === null
            ? "The record read is resolving — nothing is assumed, nothing is invented."
            : "The record is unavailable right now — nothing is assumed, nothing is invented. Try again in a moment."}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          No commissions on your record yet — each one appears here dated,
          with its on-chain proof.
        </p>
      ) : (
        <div className="mt-2">
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li
                key={r.transaction}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border/40 pt-1.5 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.isoDayUtc}</span>
                <span className="font-mono text-sm text-gold">{usd(r.commissionRaw)}</span>
                <a
                  href={r.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2 ml-auto"
                >
                  verify ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            The record, never a projection — each line is its own on-chain
            receipt; a chart takes over as the history grows.
          </p>
        </div>
      )}
    </Card>
  );
}

