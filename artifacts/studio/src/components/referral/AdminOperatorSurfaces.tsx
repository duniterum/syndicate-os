// components/referral/AdminOperatorSurfaces.tsx
//
// The remaining operator surfaces (Dave's directive + the roles permission
// matrix): broadcast, audit log, feature flags, support queue — now exported
// individually so the sectioned admin shell can rehome each card on its own
// route (moved, not rewritten).
//
// PREVIEW ONLY. Broadcast send, flag toggles, and support actions are writes
// owned by the founder-gated operator write zone; the audit log is read-only by
// nature and shown here with sample rows. Nothing persists yet.

import { Megaphone, ScrollText, ToggleLeft, LifeBuoy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SampleTag } from "@/components/SampleTag";
import { TruthLabel } from "@/components/TruthLabel";
import { featureFlagsSample, auditLogSample, supportQueueSample } from "@/config/referralProgram";

function Head({ icon: Icon, title, sample }: { icon: typeof Megaphone; title: string; sample?: boolean }) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <TruthLabel variant="DESIGN_PREVIEW" />
      {sample ? <SampleTag kind="simulated" /> : null}
    </div>
  );
}

export function BroadcastPanel() {
  return (
    <Card id="broadcast" className="p-6 scroll-mt-24">
      <Head icon={Megaphone} title="Broadcast" />
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Send an official announcement to members. Preview: composing works, sending is enabled with the operator
        write zone (broadcast approval is a step-up action).
      </p>
      <Input placeholder="Announcement title" className="mb-3" />
      <textarea
        placeholder="Write the announcement…"
        rows={3}
        className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground mb-3"
      />
      <Button disabled title="Enabled with the operator write zone">
        <Megaphone className="h-4 w-4 mr-1.5" />
        Send broadcast
      </Button>
    </Card>
  );
}

export function FeatureFlagsPanel() {
  return (
    <Card id="flags-preview" className="p-6 scroll-mt-24">
      <Head icon={ToggleLeft} title="Feature flags" />
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Staged rollout and kill switches. Preview: toggles change local state only; flipping a real flag is a
        step-up write in the operator write zone.
      </p>
      <div className="space-y-2">
        {featureFlagsSample.map((f) => (
          <div key={f.key} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
            <span className="text-sm text-foreground">{f.label}</span>
            <Switch checked={f.on} disabled aria-label={f.label} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AuditLogPanel() {
  return (
    <Card id="audit" className="p-6 scroll-mt-24">
      <Head icon={ScrollText} title="Audit log" sample />
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Every privileged action is recorded — who did what, to what, and when. Read-only. Sample rows today; real
        entries appear once the write zone is enabled and actions start being logged.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="font-normal pb-2">Actor</th>
            <th className="font-normal pb-2">Action</th>
            <th className="font-normal pb-2">Target</th>
            <th className="font-normal pb-2 text-right">When</th>
          </tr>
        </thead>
        <tbody>
          {auditLogSample.map((row, i) => (
            <tr key={i} className="border-t border-border/40">
              <td className="py-2 text-foreground/80">{row.actor}</td>
              <td className="py-2 text-muted-foreground">{row.action}</td>
              <td className="py-2 font-mono text-xs text-muted-foreground">{row.target}</td>
              <td className="py-2 text-right text-muted-foreground">{row.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function SupportQueuePanel() {
  return (
    <Card id="support" className="p-6 scroll-mt-24">
      <Head icon={LifeBuoy} title="Support queue" sample />
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Member questions routed to operators. Preview: replies and status changes are writes in the operator
        write zone.
      </p>
      <div className="rounded-md border border-border/50 divide-y divide-border/50">
        {supportQueueSample.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3">
            <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">{t.id}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground truncate">{t.subject}</div>
              <div className="font-mono text-xs text-muted-foreground truncate">{t.requester}</div>
            </div>
            <Badge variant="outline" className="text-[10px] font-normal shrink-0">{t.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
