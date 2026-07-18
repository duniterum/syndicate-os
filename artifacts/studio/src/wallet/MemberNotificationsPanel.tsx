// wallet/MemberNotificationsPanel.tsx — /notifications (NOTIF-1, founder-
// approved wireframe 2026-07-18): the dedicated notification center behind
// the bell's "View all". Own-row ONLY: the session's messages (Mine) + the
// broadcasts (Protocol), joined to the member's own read receipts. The
// no-email canon: this page IS the channel of record — real messages from
// the Syndicate appear only here (and nothing unread ever expires).
// Honest states: signed-out prompt · unavailable (fail-closed) · empty ·
// served rows grouped Today / Earlier. Clicking an item marks it read.

import { useCallback, useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  fetchOwnInbox,
  postInboxRead,
  type OwnInboxReadback,
  type OwnInboxRow,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import { relativeDay } from "./MemberNotificationsBell";

type PageTab = "all" | "protocol" | "mine" | "unread";
const PAGE_STEP = 20;

function pageFilter(rows: OwnInboxRow[], tab: PageTab): OwnInboxRow[] {
  if (tab === "protocol") return rows.filter((r) => r.scope === "all");
  if (tab === "mine") return rows.filter((r) => r.scope === "you");
  if (tab === "unread") return rows.filter((r) => r.unread);
  return rows;
}

function isToday(iso: string | null): boolean {
  return iso !== null && iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function NotificationCard({
  row,
  onRead,
}: {
  row: OwnInboxRow;
  onRead: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => row.unread && onRead(row.id)}
      className={`w-full px-4 py-3 text-left transition-colors ${
        row.unread ? "hover:bg-border/30" : "opacity-80"
      }`}
    >
      <span className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
            row.unread ? "bg-gold" : "bg-transparent"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`text-sm ${row.unread ? "font-semibold" : ""}`}>
              {row.title}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                row.scope === "you"
                  ? "bg-gold/10 text-gold"
                  : "bg-border/40 text-muted-foreground"
              }`}
            >
              {row.scope === "you" ? "to you" : "all members"}
            </span>
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
              {relativeDay(row.createdAtIso)}
            </span>
          </span>
          <span className="mt-1 block whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {row.body}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function MemberNotificationsPanel() {
  const [inbox, setInbox] = useState<OwnInboxReadback | null | undefined>(undefined);
  const [tab, setTab] = useState<PageTab>("all");
  const [shown, setShown] = useState(PAGE_STEP);

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

  if (inbox === undefined) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Reading your inbox…</p>
      </Card>
    );
  }
  if (inbox === null) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          The inbox is unavailable right now (fail-closed) — nothing is assumed.
        </p>
      </Card>
    );
  }
  if (inbox.state !== "S4") {
    return (
      <Card className="p-6">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-foreground">
          <BellRing className="h-5 w-5 text-muted-foreground" />
          Your notifications
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Sign in with your wallet on Member Home to read your own inbox —
          your messages and the announcements to all members are waiting here.
        </p>
      </Card>
    );
  }

  const rows = inbox.rows ?? [];
  const filtered = pageFilter(rows, tab);
  const visible = filtered.slice(0, shown);
  const today = visible.filter((r) => isToday(r.createdAtIso));
  const earlier = visible.filter((r) => !isToday(r.createdAtIso));

  const tabButton = (key: PageTab, label: string, count?: number) => (
    <button
      type="button"
      onClick={() => {
        setTab(key);
        setShown(PAGE_STEP);
      }}
      className={`rounded-full border px-3.5 py-1 text-xs transition-colors ${
        tab === key
          ? "border-gold/40 bg-gold/10 font-semibold text-foreground"
          : "border-border/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {count !== undefined && count > 0 ? ` · ${count}` : ""}
    </button>
  );

  const group = (title: string, groupRows: OwnInboxRow[]) =>
    groupRows.length === 0 ? null : (
      <div key={title} className="mb-4">
        <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
        <div className="divide-y divide-border/50 rounded-lg border border-border/50">
          {groupRows.map((r) => (
            <NotificationCard key={r.id} row={r} onRead={markRead} />
          ))}
        </div>
      </div>
    );

  return (
    <Card className="p-6">
      {/* WORK-FIRST (founder, 2026-07-18): the panel opens on the work — tabs
          + mark-all in ONE row; the page band above already said what this
          is, exactly once. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <BellRing className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {tabButton("all", "All")}
        {tabButton("protocol", "Protocol")}
        {tabButton("mine", "Mine")}
        {tabButton("unread", "Unread", rows.filter((r) => r.unread).length)}
        <span className="font-mono text-xs uppercase tracking-wider text-primary hidden sm:inline">
          Live · your own row
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs"
          onClick={markAllRead}
          disabled={rows.every((r) => !r.unread)}
        >
          Mark all as read
        </Button>
      </div>

      {filtered.length === 0 && (
        <p className="py-2 text-sm text-muted-foreground">
          {tab === "unread"
            ? "You're all caught up — nothing unread."
            : "Nothing here yet — announcements and personal messages appear here."}
        </p>
      )}
      {group("Today", today)}
      {group("Earlier", earlier)}

      {filtered.length > shown && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setShown((n) => n + PAGE_STEP)}
          >
            Load more
          </Button>
        </div>
      )}
    </Card>
  );
}
