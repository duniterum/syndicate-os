// DataStatusNote — shared honesty chrome.
// Lives OUTSIDE the operator Shell module on purpose: public pages (e.g.
// /status) render it too, and the operator console must stay importable only
// through the gated OperatorConsole module (see config/operatorPreviewGate.ts).
import { Activity } from "lucide-react";

export function DataStatusNote({ description }: { description: string }) {
  return (
    <div className="mb-8 p-3 border border-border/50 bg-muted/20 rounded-lg flex items-start gap-3">
      <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0 mt-0.5">
        <Activity className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-foreground">Data Status</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
