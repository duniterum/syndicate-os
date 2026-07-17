// components/member/MemberDoorsGrid.tsx — ③ HOME Z8: THE DOORS, as cards.
// ---------------------------------------------------------------------------
// Approved wireframe 2026-07-16 §3: "DOORS (grouped grid — mirrors the left
// menu groups)" — the Linear/Stripe grammar: navigation as cards AFTER the
// work, never before. ONE source: MEMBER_DOOR_GROUPS + the same exported
// icon table the sidebar uses — the grid can never drift from the menu.
// A locked door stays visible with the existing lifecycle badge (locked ≠
// hidden); its live-count teaser arrives at its slice, never early.

import { Link } from "wouter";
import { useLocationProperty } from "wouter/use-browser-location";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { DOOR_ICONS, makeSameDoorClick } from "@/components/member/MemberShell";
import { MEMBER_DOOR_GROUPS } from "@/config/memberDoors";
import type { MemberDoor } from "@/config/memberDoors";

const currentPathWithHash = () => window.location.pathname + window.location.hash;

function DoorCard({ door, active }: { door: MemberDoor; active: boolean }) {
  const Icon = door.icon ? DOOR_ICONS[door.icon] : null;
  const inner = (
    <>
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
        <span className="text-sm font-medium text-foreground">
          {door.label}
        </span>
        {door.lifecycle ? (
          <span className="ml-auto">
            <LifecycleBadge lifecycle={door.lifecycle} />
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted-foreground leading-snug">
        {door.note}
      </p>
    </>
  );
  return door.href ? (
    <Link
      href={door.href}
      // Same-URL cards (Member Home on /member, by construction) must not
      // push dead history entries — same guard as the sidebar doors.
      onClick={makeSameDoorClick(door.href, active)}
      className="block rounded-lg border border-border/50 bg-card/30 p-3 transition-colors hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/65 focus-visible:ring-offset-2 ring-offset-background"
      data-testid={`door-card-${door.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
    >
      {inner}
    </Link>
  ) : (
    <div
      className="rounded-lg border border-border/40 bg-card/20 p-3 opacity-70"
      data-testid={`door-card-${door.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
    >
      {inner}
    </div>
  );
}

export function MemberDoorsGrid() {
  const activePath = useLocationProperty(currentPathWithHash);
  return (
    <section data-testid="member-doors-grid">
      <h2 className="text-base font-medium text-foreground mb-3">Your doors</h2>
      <div className="grid gap-4">
        {MEMBER_DOOR_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {group.title}
            </p>
            <div className="grid gap-2">
              {group.doors.map((door) => (
                <DoorCard
                  key={door.label}
                  door={door}
                  active={door.href === activePath}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
