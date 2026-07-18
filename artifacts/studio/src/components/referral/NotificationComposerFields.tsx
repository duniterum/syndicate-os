// components/referral/NotificationComposerFields.tsx — NOTIF-2 (build once).
// ---------------------------------------------------------------------------
// The shared operator composer fields: an ICON PICKER (curated palette) + a
// DESTINATION dropdown (internal whitelist). Used by BOTH the Broadcast
// composer and the Member-ledger "Message this member" dialog so they can
// never drift. Both fields optional. Everything traces to the ONE os-contracts
// source; destinations are internal-only (never a free-text URL field) — the
// server re-validates by exact-match on send. Semantic tokens only (no raw
// color); no sub-12px text (ADR-001 readability floor).

import { Lock } from "lucide-react";
import {
  NOTIFICATION_ICON_PALETTE,
  NOTIFICATION_LINK_WHITELIST,
} from "@workspace/os-contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTIF_ICONS } from "@/lib/notificationIcons";

const NO_DEST = "__none__";

export interface NotificationComposerValue {
  icon: string | null;
  link: string | null;
}

export function NotificationComposerFields({
  value,
  onChange,
}: {
  value: NotificationComposerValue;
  onChange: (next: NotificationComposerValue) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 text-xs text-muted-foreground">
          Icon <span className="text-muted-foreground/70">(optional)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NOTIFICATION_ICON_PALETTE.map((key) => {
            const Icon = NOTIF_ICONS[key];
            const selected = value.icon === key;
            return (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={selected}
                onClick={() => onChange({ ...value, icon: selected ? null : key })}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            );
          })}
          <button
            type="button"
            aria-label="No icon"
            aria-pressed={value.icon === null}
            onClick={() => onChange({ ...value, icon: null })}
            className={`inline-flex h-8 items-center rounded-md border px-2.5 text-xs transition-colors ${
              value.icon === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            None
          </button>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-xs text-muted-foreground">
          Opens <span className="text-muted-foreground/70">(optional)</span>
        </div>
        <Select
          value={value.link ?? NO_DEST}
          onValueChange={(v) => onChange({ ...value, link: v === NO_DEST ? null : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_DEST}>No destination</SelectItem>
            {NOTIFICATION_LINK_WHITELIST.map((l) => (
              <SelectItem key={l.path} value={l.path}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Destinations stay inside the Syndicate — internal only, never an outside link.
        </p>
      </div>
    </div>
  );
}
