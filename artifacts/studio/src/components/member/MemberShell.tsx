// components/member/MemberShell.tsx — the MEMBER SHELL (two-shells rule).
// ---------------------------------------------------------------------------
// The PAGE chooses the shell: Member Home composes this; public pages never
// do (a signed-in member browsing /whitepaper keeps the public shell — he is
// not trapped in a bubble; Google is always an anonymous visitor, so the 2.0
// prerender is untouched). This is a PRESENTATIONAL wrapper INSIDE the public
// chrome: a left sidebar of member doors + the page content. It renders for
// everyone — locked doors are the spec's return-visit hook (locked ≠ hidden);
// operator doors do not exist in the config at all.

import { Link, useLocation } from "wouter";
import { DoorOpen } from "lucide-react";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MEMBER_DOOR_GROUPS } from "@/config/memberDoors";
import type { DisplayLifecycle } from "@/config/truthStatus";
import type { ReactNode } from "react";

function DoorRow({ label, href, lifecycle, note, active }: {
  label: string;
  href?: string;
  lifecycle?: DisplayLifecycle;
  note: string;
  active: boolean;
}) {
  const inner = (
    <div
      className={`rounded-md px-3 py-2 transition-colors ${
        active
          ? "bg-gold/10 border border-gold/25"
          : href
            ? "hover:bg-card/60 border border-transparent"
            : "border border-transparent opacity-80"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm ${href ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
        {lifecycle ? <LifecycleBadge lifecycle={lifecycle} /> : null}
      </div>
      <p className="text-xs text-muted-foreground leading-snug mt-0.5">{note}</p>
    </div>
  );
  // A door is a LINK only when its surface exists today; a coming-soon door is
  // visible but inert — the badge says why (never hidden, never a dead link).
  return href ? (
    <Link href={href} className="block" data-testid={`door-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
      {inner}
    </Link>
  ) : (
    <div data-testid={`door-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{inner}</div>
  );
}

export function MemberShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const allDoors = MEMBER_DOOR_GROUPS.flatMap((g) => g.doors);
  return (
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      {/* Below lg the tall door list becomes ONE horizontally scrollable chip
          row (S7-b: the sidebar must never push the member's own record a
          full screen down on mobile). Same doors, same truth, two renders. */}
      <nav
        aria-label="Member doors"
        className="lg:hidden mb-6 -mx-4 px-4 flex gap-2 overflow-x-auto pb-2"
      >
        {allDoors.map((door) =>
          door.href ? (
            <Link
              key={door.label}
              href={door.href}
              className={`inline-flex items-center shrink-0 rounded-full border px-4 min-h-11 text-xs transition-colors ${
                door.href === location
                  ? "border-gold/40 bg-gold/10 text-foreground"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`door-chip-${door.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              {door.label}
            </Link>
          ) : (
            <span
              key={door.label}
              className="inline-flex items-center shrink-0 rounded-full border border-border/40 bg-card/20 px-4 min-h-11 text-xs text-muted-foreground/70"
              data-testid={`door-chip-${door.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              {door.label}
            </span>
          ),
        )}
      </nav>
      <aside className="hidden lg:block">
        <nav
          aria-label="Member doors"
          className="lg:sticky lg:top-24 rounded-xl border border-border/50 bg-card/30 p-3 space-y-4"
        >
          <div className="flex items-center gap-2 px-1">
            <DoorOpen className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Your doors
            </span>
          </div>
          {MEMBER_DOOR_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-1 mb-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.doors.map((door) => (
                  <DoorRow
                    key={door.label}
                    label={door.label}
                    href={door.href}
                    lifecycle={door.lifecycle}
                    note={door.note}
                    active={door.href === location}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
