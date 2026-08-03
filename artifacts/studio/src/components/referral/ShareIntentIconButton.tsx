// components/referral/ShareIntentIconButton.tsx — THE row-shape intent button.
//
// One implementation of the icon-square intent button (the R-BIND-2 family's
// ROW form). Its one consumer is the commissions table's share row — the kit
// briefly rendered it too (2026-08-03, first cut) before the founder's
// harmonization order moved the kit onto the ShareSurface BOX. The box, the
// receipt's labeled GRID and the link hero's popover MENU are sibling
// COMPOSITIONS by design — shapes differ, facts don't; the target→icon map
// and the url builders are imported, never retyped (guard-share-intents).
//
// Geometry (guard-touch-target): the visual box stays h-9 — the established
// scale of the rows that host it — and the HIT AREA reaches the 44px floor
// structurally: relative + after:absolute after:-inset-1 (36 + 4 + 4), the
// guard's own prescribed expansion form. An atom is never debt.
//
// The shareTargets contract rides the props: url-param intents want URL-FREE
// text (the platform places the url itself); a text-only intent (whatsapp)
// inlines `${text} ${url}` in its own builder — the CALLER decides the split,
// this button just opens the official intent in a new tab.

import { Share2 } from "lucide-react";
import { shareTargetIcons } from "@/lib/shareTargetIcons";
import type { ShareTargetDef } from "@/lib/shareTargets";

export function ShareIntentIconButton({
  target,
  url,
  text,
  testid,
  onOpened,
}: {
  target: ShareTargetDef;
  url: string;
  text: string;
  testid: string;
  /** Optional post-open hook (the receipts family advances its face rotation). */
  onOpened?: () => void;
}) {
  const Icon = shareTargetIcons[target.id] ?? Share2;
  return (
    <button
      type="button"
      aria-label={`Share on ${target.label}`}
      onClick={() => {
        window.open(target.build(url, text), "_blank", "noopener,noreferrer");
        onOpened?.();
      }}
      className="relative after:absolute after:-inset-1 h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-testid={testid}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
