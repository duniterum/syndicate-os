import React from "react";
import { DataStatusNote } from "@/components/layout/Shell";
import { TruthLabel } from "@/components/TruthLabel";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProofDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Public Proof Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Verifiable truth surface for membership and protocol actions.</p>
      </div>

      <DataStatusNote description="This dashboard is a design preview. Proofs, memberships, and burns shown are placeholders. No real proof events are currently being indexed." />

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search proof events or addresses..." 
            className="pl-9 bg-card/30 border-border/50 text-sm h-10"
            disabled
          />
        </div>
        <TruthLabel variant="AWAITING_CHAIN_INDEX" className="self-center" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/30 border-border/40 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between opacity-80">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-sm font-medium text-foreground">Proof of Membership — 0x...{i}4A</h4>
                <TruthLabel variant="DESIGN_PREVIEW" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">Tx: Awaiting indexer source</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>Block: --</span>
              <TruthLabel variant="NOT_LIVE" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
