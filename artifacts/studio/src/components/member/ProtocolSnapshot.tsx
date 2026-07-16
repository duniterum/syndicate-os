// components/member/ProtocolSnapshot.tsx — the protocol at a glance (S7-b).
// ---------------------------------------------------------------------------
// The dashboard's "system state" card (the after-login standard: exchanges
// show market/system context beside YOUR balances). Five live protocol
// facts, every one a fail-closed chain read through the EXISTING hero
// reality hook (one spine, zero new read paths) — "—" when unreadable,
// never invented. Public data; the verify path is /proof.

import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { MembersProvenance } from "@/components/living/MembersProvenance";

function FactRow({ label, value, testId }: { label: string; value: string | null; testId: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/30 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground" data-testid={testId}>
        {value ?? "—"}
      </span>
    </li>
  );
}

export function ProtocolSnapshot() {
  const r = useHeroReality();

  return (
    <Card className="bg-card/40 border-border/50 p-5" data-testid="protocol-snapshot">
      <h3 className="text-base font-medium text-foreground mb-2">The protocol today</h3>
      <ul>
        <FactRow
          label="Seats on-chain"
          value={r.membersTotal}
          testId="snapshot-seats"
        />
        <FactRow
          label="SYN burned"
          value={r.burnedSyn !== null ? `${r.burnedSyn} SYN` : null}
          testId="snapshot-burned"
        />
        <FactRow
          label="Pool reserves"
          value={
            r.lpSyn !== null && r.lpUsdc !== null
              ? `${r.lpSyn} SYN · ${r.lpUsdc} USDC`
              : null
          }
          testId="snapshot-pool"
        />
        <FactRow
          label="Artifacts minted"
          value={r.nftMintedTotal}
          testId="snapshot-minted"
        />
        <FactRow
          label="Paid to referrers"
          value={r.paidToReferrersUsdc !== null ? `${r.paidToReferrersUsdc} USDC` : null}
          testId="snapshot-referrers"
        />
      </ul>
      {/* The live member figure carries its dual-authority provenance —
          founder rule: SHOW BOTH, never a bare live headline. */}
      <MembersProvenance
        variant="compact"
        className="mt-2"
        historicalFreeze={r.historicalFreeze}
        v3Emitted={r.v3Emitted}
        snapshotMemberTotal={r.snapshotMemberTotal}
        snapshotAsOf={r.snapshotAsOf}
        membersDiverged={r.membersDiverged}
        distinctWallets={r.distinctWallets}
        seatOverlap={r.seatOverlap}
      />
      <Link
        href="/proof"
        className="mt-3 inline-flex font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        Every figure is a live chain read — verify →
      </Link>
    </Card>
  );
}
