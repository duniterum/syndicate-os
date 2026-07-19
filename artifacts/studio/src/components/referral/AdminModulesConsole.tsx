// components/referral/AdminModulesConsole.tsx
//
// Plugin-style module manager for the Admin Console: each module in the
// real moduleRegistry gets an activate/deactivate switch, plus create / edit /
// delete affordances — the "WordPress plugins" surface.
//
// PREVIEW ONLY (comment re-trued 2026-07-19). Toggling a switch changes local
// UI state, never anything real: the founder-gated operator write zone is
// live and stood up, but the MODULE-MANAGEMENT writes (enable/disable,
// create/edit/delete) are their own queued slice (Q42). Until that slice
// lands, this console shows how management will feel while persisting nothing.

import { useState } from "react";
import { Puzzle, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TruthLabel } from "@/components/TruthLabel";
import { moduleRegistry } from "@/config/moduleRegistry";

const RISK_LABEL: Record<string, string> = {
  READ_ONLY_PUBLIC: "Public · read-only",
  SESSION_SELF_READBACK: "Session self-readback",
  SERVER_ONLY_PII: "Server-only · PII",
  OWNER_SIDE_ONCHAIN_ACTION: "Owner on-chain action",
  CONTENT_ONLY: "Content only",
};

export function AdminModulesConsole() {
  const [disabled, setDisabled] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card id="modules" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <Puzzle className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Modules</h2>
        <TruthLabel variant="DESIGN_PREVIEW" />
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Activate or deactivate each module like a plugin. This is a preview: toggles and create / edit / delete
        change nothing yet — module management lands with its own slice.
      </p>

      <div className="mb-4">
        <Button variant="outline" size="sm" disabled title="Lands with the module-management slice">
          <Plus className="h-4 w-4 mr-1.5" />
          New module
        </Button>
      </div>

      <div className="divide-y divide-border/50 rounded-md border border-border/50">
        {moduleRegistry.map((m) => {
          const off = disabled.has(m.title);
          return (
            <div key={m.title} className="flex items-center gap-3 p-3">
              <Switch checked={!off} onCheckedChange={() => toggle(m.title)} aria-label={`Toggle ${m.title}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">{m.title}</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {RISK_LABEL[m.riskClass] ?? m.riskClass}
                  </Badge>
                  {off ? <span className="text-[10px] text-muted-foreground">deactivated (preview)</span> : null}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {m.route ?? "no public route yet"}
                </div>
              </div>
              <Button variant="ghost" size="sm" disabled aria-label={`Edit ${m.title}`} title="Lands with the module-management slice">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled aria-label={`Delete ${m.title}`} title="Lands with the module-management slice">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
