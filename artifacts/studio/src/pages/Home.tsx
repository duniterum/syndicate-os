import React from "react";
import { DataStatusNote } from "@/components/layout/Shell";
import { TruthLabel, TruthLabelVariant } from "@/components/TruthLabel";
import { Card } from "@/components/ui/card";
import { TerminalSquare } from "lucide-react";
import { surfaceStatus } from "@/config/truthStatus";

export default function Home() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground tracking-tight flex items-center gap-3">
          <TerminalSquare className="h-8 w-8 text-primary" />
          Public Proof OS
        </h1>
        <p className="text-muted-foreground mt-2">Read-only foundation shell for The Syndicate protocol.</p>
      </div>

      <DataStatusNote description="This console is a read-only foundation. No live sources, databases, or chains are connected. All metrics and surfaces are awaiting source wiring." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Active Members", label: surfaceStatus.membership as TruthLabelVariant, desc: "Membership indexer not wired" },
          { title: "Recognized Proofs", label: surfaceStatus.proofEventParser as TruthLabelVariant, desc: "Event adapter not wired" },
          { title: "Attribution Paths", label: surfaceStatus.sourceAttribution as TruthLabelVariant, desc: "Source indexer not wired" },
        ].map((metric, i) => (
          <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{metric.title}</h3>
            <div className="mt-auto">
              <TruthLabel variant={metric.label} className="mb-2 block w-fit" />
              <p className="text-xs text-muted-foreground font-mono">{metric.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6 shadow-sm min-h-[300px] flex items-center justify-center border-dashed">
        <div className="text-center flex flex-col items-center">
          <TruthLabel variant="FUTURE_MODULE" className="mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Protocol Activity Feed</h3>
          <p className="text-sm text-muted-foreground max-w-md">The activity feed requires event parsers and chain indexers to be operational before displaying public proof events.</p>
        </div>
      </Card>
    </div>
  );
}
