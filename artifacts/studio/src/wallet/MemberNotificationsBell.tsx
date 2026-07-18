// wallet/MemberNotificationsBell.tsx — THE MEMBER BELL (NOTIF-1, founder-
// approved wireframe 2026-07-18; the no-email canon: in-app is the ONLY
// channel, so the bell is the front door).
// ---------------------------------------------------------------------------
// Mounted by MemberHeaderAffordance in the §11 RESERVED HEADER SLOT (next to
// the season trophy, which stays reserved for the seasons engine) — the slot
// the origin harvest recorded for exactly this. Renders NOTHING without an
// S4 session (a visitor sees no bell). Signed in:
//   • badge = the OWN unseen count (server-side, cross-device) capped "9+";
//   • opening the popover marks SEEN (the badge clears; items stay unread —
//     the two-tier model of the world-class centers, never read-on-open);
//   • tabs All / Protocol / Mine; an item CLICK marks it read;
//   • footer: Mark all as read + View all → /notifications.
// Fail-closed everywhere: unavailable reads render an honest quiet bell (no
// badge, honest line in the popover), never a guessed count.

import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchOwnInbox,
  postInboxSeen,
  postInboxRead,
  type OwnInboxReadback,
  type OwnInboxRow,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Tab = "all" | "protocol" | "mine";

/** Compact honest recency from the row's own server timestamp. */
export function relativeDay(iso: string | null): string {
  if (iso === null) return "";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return iso.slice(0, 10);
}

export function filterRows(rows: OwnInboxRow[], tab: Tab): OwnInboxRow[] {
  if (tab === "protocol") return rows.filter((r) => r.scope === "all");
  if (tab === "mine") return rows.filter((r) => r.scope === "you");
  return rows;
}

const POPOVER_LIMIT = 7;

export default function MemberNotificationsBell() {
  // undefined = in-flight · null = failed/unavailable · readback = served.
  const [inbox, setInbox] = useState<OwnInboxReadback | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("all");

  const read = useCallback(() => {
    void fetchOwnInbox().then(setInbox);
  }, []);

  useEffect(() => {
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, [read]);

  // No session (or nothing served yet) → no bell at all.
  if (inbox === undefined || inbox === null || inbox.state !== "S4") return null;

  const rows = inbox.rows ?? [];
  const unseen = inbox.unseenCount ?? 0;
  const visible = filterRows(rows, tab).slice(0, POPOVER_LIMIT);

  function handleOpenChange(open: boolean) {
    if (!open || unseen === 0) return;
    // Seen ≠ read: the badge clears, the dots stay until each item is clicked.
    void postInboxSeen().then((ok) => {
      if (ok && inbox && inbox.state === "S4") {
        setInbox({ ...inbox, unseenCount: 0 });
      }
    });
  }

  function markRead(id: string) {
    void postInboxRead(id).then((ok) => {
      if (ok && inbox && inbox.rows !== null) {
        setInbox({
          ...inbox,
          rows: inbox.rows.map((r) => (r.id === id ? { ...r, unread: false } : r)),
        });
      }
    });
  }

  function markAllRead() {
    void postInboxRead().then((ok) => {
      if (ok && inbox && inbox.rows !== null) {
        setInbox({
          ...inbox,
          unseenCount: 0,
          rows: inbox.rows.map((r) => ({ ...r, unread: false })),
        });
      }
    });
  }

  const tabButton = (key: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        tab === key
          ? "border-gold/40 bg-gold/10 font-semibold text-foreground"
          : "border-border/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {/* Chrome matches the neighboring reserved trophy slot exactly —
            the bell simply went from reserved to live in place. */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-lg border border-border/50"
          aria-label={
            unseen > 0 ? `Notifications — ${unseen} new` : "Notifications"
          }
          data-testid="header-bell-live"
        >
          <Bell className="h-3.5 w-3.5" />
          {unseen > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 min-w-4 rounded-full bg-destructive px-1 text-center font-mono text-xs leading-4 text-destructive-foreground"
            >
              {unseen > 9 ? "9+" : unseen}
            </span>
          )}
        </Button>
      </PopoverTrigger>
        <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-3">
          <div className="flex items-center gap-2 mb-2.5">
            {tabButton("all", "All")}
            {tabButton("protocol", "Protocol")}
            {tabButton("mine", "Mine")}
          </div>
          {inbox.rows === null && (
            <p className="py-2 text-sm text-muted-foreground">
              {inbox.failureReason ??
                "The inbox is unavailable right now — nothing is assumed."}
            </p>
          )}
          {inbox.rows !== null && visible.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">
              You&apos;re all caught up — nothing here yet.
            </p>
          )}
          {visible.length > 0 && (
            <div className="divide-y divide-border/50 border-t border-border/50">
              {visible.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => markRead(r.id)}
                  className="flex w-full items-start gap-2 py-2 text-left hover:bg-border/30 rounded-sm px-1"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      r.unread ? "bg-gold" : "bg-transparent"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={`truncate text-sm ${r.unread ? "font-semibold" : ""}`}
                      >
                        {r.title}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                        {relativeDay(r.createdAtIso)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {r.scope === "you" ? "To you · " : "All members · "}
                      {r.body}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-2.5 flex items-center gap-2 border-t border-border/50 pt-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={markAllRead}
              disabled={rows.every((r) => !r.unread)}
            >
              Mark all as read
            </Button>
            <Button asChild variant="ghost" size="sm" className="flex-1 text-xs">
              <Link href="/notifications">View all</Link>
            </Button>
          </div>
        </PopoverContent>
    </Popover>
  );
}
