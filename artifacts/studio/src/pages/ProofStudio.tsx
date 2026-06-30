import React from "react";
import { DataStatusNote } from "@/components/layout/Shell";
import { TruthLabel } from "@/components/TruthLabel";
import { Card } from "@/components/ui/card";
import { BoxSelect } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ProofStudio() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-foreground tracking-tight flex items-center gap-3">
            <BoxSelect className="h-8 w-8 text-primary" />
            Proof Studio
          </h1>
          <p className="text-muted-foreground mt-2">Configure rules for protocol recognition events.</p>
        </div>
        <TruthLabel variant="DESIGN_PREVIEW" />
      </div>

      <DataStatusNote description="Proof Studio is in a read-only draft state. Do not add transaction parsing or call any RPCs. Form elements are disabled until the live proof adapters and sources are wired." />

      <Card className="bg-card/40 border-border/50 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/30">
          <h2 className="text-lg font-medium text-foreground">Rule Builder</h2>
          <TruthLabel variant="NOT_LIVE" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Chain ID</Label>
                <TruthLabel variant="EVENT_ADAPTER_NOT_WIRED" />
              </div>
              <Input value="" disabled placeholder="e.g. 1" className="bg-muted/30 border-border/50" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Target Contract</Label>
                <TruthLabel variant="LIVE_SOURCE_MISSING" />
              </div>
              <Input value="" disabled placeholder="0x..." className="bg-muted/30 border-border/50 font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Event Signature</Label>
              <TruthLabel variant="EVENT_ADAPTER_NOT_WIRED" />
            </div>
            <Input value="" disabled placeholder="Transfer(address,address,uint256)" className="bg-muted/30 border-border/50 font-mono" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Claimant Field</Label>
              <TruthLabel variant="FUTURE_MODULE" />
            </div>
            <Input value="" disabled placeholder="Awaiting event parser" className="bg-muted/30 border-border/50" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Proof Type</Label>
              <TruthLabel variant="FUTURE_MODULE" />
            </div>
            <Select disabled>
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="burn">Burn</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="recognition">Recognition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6 border-t border-border/30 flex justify-end">
            <Button disabled variant="outline" className="bg-transparent border-border/50 text-muted-foreground opacity-50">
              Save Rule Configuration
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
