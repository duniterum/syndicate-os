// components/referral/AdminReferralPanel.tsx
//
// Operator view of the referral/source program for the Admin Console.
// TRUTH SWEEP (founder order, 2026-07-17 — "remove all preview when it is not
// the truth; we are in live production mode"): the SAMPLE KPI cards, the
// fabricated "Top durable sources" rows, the invented abuse-review counts and
// the fake conversion chart are DEAD. The program is LIVE and paying on-chain;
// fabricated figures on the operator console violated the truth-first law even
// sample-tagged. What remains is REAL: the live on-chain source reads. The
// real per-source figures (introduced · durable · commission paid · promotion
// due) exist in the R5 read-model server-side and arrive on this console with
// the member-ledger slice (M-INT-1) — a wired read, never a sample.

import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";

export function AdminReferralPanel() {
  return (
    <Card id="referral" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <Megaphone className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Referral / Source program</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">Live · paying on-chain</span>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        The program is live: a referred join pays its source inside the buyer&apos;s
        own transaction, and the R5 introduction indexer serves real standing
        server-side. The reads below are live on-chain. Per-source figures
        (introduced · durable · commission paid · promotions due) join this
        console with the member-ledger slice — wired from the real read-model,
        never a sample.
      </p>

      {/* Live on-chain source reads — same truth-labelling as /status */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-foreground">Live source reads</h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary">On-chain</span>
        </div>
        <ProtocolRealityPanel groups={["source"]} />
      </div>
    </Card>
  );
}
