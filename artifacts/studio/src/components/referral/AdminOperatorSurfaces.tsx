// components/referral/AdminOperatorSurfaces.tsx
//
// The remaining operator surfaces (Dave's directive + the roles permission
// matrix): broadcast, audit log, feature flags, support queue — now exported
// individually so the sectioned admin shell can rehome each card on its own
// route (moved, not rewritten).
//
// BROADCAST IS LIVE (NOTIF-1, Q43): Send posts to the founder-gated write zone
// (one persisted audience=ALL row — the member-inbox read model; no push, no
// email) and the sent history reads back from the real table. Flag toggles and
// support actions remain previews owned by later Q42 slices; the audit-log
// panel still shows sample rows.

import { useEffect, useState } from "react";
import { Megaphone, ScrollText, ToggleLeft, LifeBuoy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SampleTag } from "@/components/SampleTag";
import { TruthLabel } from "@/components/TruthLabel";
import { useToast } from "@/hooks/use-toast";
import {
  sendBroadcast,
  fetchNotifications,
  type NotificationListItem,
} from "@/lib/operatorClient";
import {
  NotificationComposerFields,
  type NotificationComposerValue,
} from "./NotificationComposerFields";
import { iconFor, linkLabel } from "@/lib/notificationIcons";
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

// NOTIF-1: honest reason→message map for the broadcast write.
function broadcastFailureText(reason: string | null): string {
  switch (reason) {
    case "throttled":
      return "Too many requests in a short window — wait a moment and retry.";
    case "no_session":
      return "Your operator session is gone. Sign in again, then resend.";
    case "insufficient_role":
      return "Broadcasting is founder-gated; this session's role cannot send.";
    case "address_in_text":
      return "The announcement contains a raw wallet address — remove it; served messages never carry addresses.";
    case "bad_title":
    case "bad_body":
    case "bad_request":
      return "Title and announcement are both required (title ≤ 120, text ≤ 2000 characters).";
    case "bad_icon":
      return "That icon is not in the palette — pick one from the set (or None).";
    case "bad_link":
      return "That destination is not allowed — pick one from the list (internal only).";
    case "unavailable":
      return "The write zone is unavailable (fail-closed) — nothing was sent.";
    case "unreachable":
      return "The API was unreachable — check the connection and retry.";
    default:
      return `The send was refused (${reason ?? "unknown"}) — nothing was sent.`;
  }
}

// LIVE (NOTIF-1): the broadcast composer posts to the founder-gated write zone
// and the sent history below reads back from the real notification table.
export function BroadcastPanel() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opts, setOpts] = useState<NotificationComposerValue>({ icon: null, link: null });
  const [sent, setSent] = useState<NotificationListItem[] | "denied" | "unavailable" | null>(null);

  useEffect(() => {
    let active = true;
    void fetchNotifications().then((r) => {
      if (!active) return;
      setSent(r.status === "ok" ? r.notifications : r.status);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSend() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await sendBroadcast(title, body, opts.icon, opts.link);
    setSubmitting(false);
    if (result.ok) {
      toast({ title: "Broadcast sent to all members" });
      setTitle("");
      setBody("");
      setOpts({ icon: null, link: null });
      // Re-read the real table — live readback, never an optimistic guess.
      const r = await fetchNotifications();
      setSent(r.status === "ok" ? r.notifications : r.status);
      return;
    }
    setError(broadcastFailureText(result.reason));
  }

  return (
    <Card id="broadcast" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <Megaphone className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Broadcast</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Live · founder-gated writes
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Send an official announcement to every member&apos;s inbox (single members are
        messaged from their Member-ledger row). Founder-gated and audit-logged;
        delivered on each member&apos;s next visit — no email or push exists.
      </p>
      <Input
        placeholder="Announcement title"
        className="mb-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />
      <Textarea
        placeholder="Write the announcement…"
        rows={3}
        className="mb-3"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
      />
      <div className="mb-3">
        <NotificationComposerFields value={opts} onChange={setOpts} />
      </div>
      {error !== null && <p className="text-sm text-destructive mb-3">{error}</p>}
      <Button
        onClick={() => void handleSend()}
        disabled={submitting || title.trim().length === 0 || body.trim().length === 0}
      >
        <Megaphone className="h-4 w-4 mr-1.5" />
        {submitting ? "Sending…" : "Send broadcast"}
      </Button>

      {/* Sent history — the real table read back, newest first. */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground mb-2">Sent</h3>
        {sent === null && <p className="text-xs text-muted-foreground">Reading the sent list…</p>}
        {sent === "denied" && (
          <p className="text-xs text-muted-foreground">
            The sent list answers only a founder-root session.
          </p>
        )}
        {sent === "unavailable" && (
          <p className="text-xs text-muted-foreground">
            The sent list is unavailable right now (fail-closed) — nothing is guessed.
          </p>
        )}
        {Array.isArray(sent) && sent.length === 0 && (
          <p className="text-xs text-muted-foreground">Nothing has been sent yet.</p>
        )}
        {Array.isArray(sent) && sent.length > 0 && (
          <div className="rounded-md border border-border/50 divide-y divide-border/50">
            {sent.map((n) => {
              const Icon = iconFor(n.icon);
              const dest = linkLabel(n.linkPath);
              return (
                <div key={n.id} className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {Icon !== null && (
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    )}
                    <span className="text-sm text-foreground">{n.title}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {n.audience === "ALL" ? "all members" : `member ${n.recipientShort ?? ""}`}
                    </Badge>
                    {n.createdAtIso !== null && (
                      <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                        {n.createdAtIso.slice(0, 16).replace("T", " ")} UTC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                  {dest !== null && (
                    <p className="text-[11px] text-muted-foreground/80 mt-1">↳ opens {dest}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
