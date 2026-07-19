// components/member/MemberShell.tsx — the MEMBER SHELL (two-shells rule).
// ---------------------------------------------------------------------------
// WHO composes the shell (founder rule 2026-07-18, CANON_ACCESS_MODEL): a
// member DOOR page composes it via <MemberAppPage> AND ONLY when the viewer is
// CONNECTED — so the member stays oriented (never leaves the dashboard). A
// general public page (/whitepaper) never does (a signed member reading it keeps
// the public shell — not trapped in a bubble), and the ANONYMOUS/prerender view
// is always the standalone public page (Google never sees the shell → the 2.0
// prerender is untouched). This is a PRESENTATIONAL wrapper INSIDE the public
// chrome: a left sidebar of member doors + the page content. It renders for
// everyone — locked doors are the spec's return-visit hook (locked ≠ hidden);
// operator doors do not exist in the config at all.
//
// THE APPROVED MENU RENDER (founder GO 2026-07-16, wireframe §2): compact icon
// rows; active = gold/10 tint + persistent 2px left bar + weight 600 — shape
// AND color, never color alone (WCAG 1.4.1) — plus aria-current="page";
// hover = border/45 tint; keyboard focus = a visible gold ring. Hash doors
// (e.g. /member#settings) match by pathname+hash via useLocationProperty —
// wouter's location is pathname-only and blind to them. (Referral was elevated
// to its own route /referral on 2026-07-19; it is no longer a hash door.)

import { Link } from "wouter";
import { useLocationProperty } from "wouter/use-browser-location";
import {
  Activity,
  Archive,
  Award,
  Bell,
  BookOpen,
  DoorOpen,
  Droplets,
  Flame,
  House,
  Map as MapIcon,
  Receipt,
  Settings,
  UserPlus,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { scrollToHash } from "@/components/RouteScrollManager";
import { MEMBER_DOOR_GROUPS } from "@/config/memberDoors";
import type { MemberDoor, MemberDoorIcon } from "@/config/memberDoors";
import type { MouseEvent, ReactNode } from "react";

// Approved icon table (config carries Node-loadable string keys; the map to
// components lives here — exported so the Z8 doors grid renders the SAME
// icons, one table, never two drifting copies). Record<MemberDoorIcon, …>
// makes tsc enforce totality: a new icon key without its component is a red
// build.
export const DOOR_ICONS: Record<MemberDoorIcon, LucideIcon> = {
  house: House,
  bell: Bell,
  wallet: Wallet,
  "user-plus": UserPlus,
  activity: Activity,
  wrench: Wrench,
  receipt: Receipt,
  "book-open": BookOpen,
  flame: Flame,
  archive: Archive,
  award: Award,
  map: MapIcon,
  droplets: Droplets,
  settings: Settings,
};

const doorSlug = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-");

// pathname+hash — subscribed to pushState/replaceState/popstate/hashchange,
// so /member and /member#settings are DIFFERENT active states (exact match).
const currentPathWithHash = () => window.location.pathname + window.location.hash;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/65 focus-visible:ring-offset-2 ring-offset-background";

// Re-click on the already-active door: preventDefault stops wouter from
// pushing a duplicate history entry (its Link has no same-URL guard and
// never reaches the browser's native same-hash re-scroll) — instead a hash
// door re-scrolls to its section, a plain door returns to the top.
// Exported: the Z8 doors grid carries same-URL cards by construction
// (Member Home on /member) and needs the same guard.
export function makeSameDoorClick(href: string, active: boolean) {
  if (!active) return undefined;
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const hashIndex = href.indexOf("#");
    if (hashIndex >= 0) scrollToHash(href.slice(hashIndex));
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };
}

function DoorRow({ door, active }: { door: MemberDoor; active: boolean }) {
  const Icon = door.icon ? DOOR_ICONS[door.icon] : null;
  const inner = (
    <>
      {Icon ? (
        <Icon
          className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-muted-foreground"}`}
          aria-hidden="true"
        />
      ) : null}
      <span className={`text-sm ${active ? "font-semibold" : ""}`}>{door.label}</span>
      {door.lifecycle ? (
        <span className="ml-auto">
          <LifecycleBadge lifecycle={door.lifecycle} />
        </span>
      ) : null}
    </>
  );
  // A door is a LINK only when its surface exists today; a coming-soon door is
  // visible but inert — the badge says why (never hidden, never a dead link).
  return door.href ? (
    <Link
      href={door.href}
      aria-current={active ? "page" : undefined}
      onClick={makeSameDoorClick(door.href, active)}
      className={`flex items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-foreground transition-colors ${FOCUS_RING} ${
        active ? "border-gold bg-gold/10" : "border-transparent hover:bg-border/45"
      }`}
      data-testid={`door-${doorSlug(door.label)}`}
    >
      {inner}
    </Link>
  ) : (
    <div
      className="flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-2.5 py-2 text-foreground opacity-70"
      data-testid={`door-${doorSlug(door.label)}`}
    >
      {inner}
    </div>
  );
}

export function MemberShell({ children }: { children: ReactNode }) {
  const activePath = useLocationProperty(currentPathWithHash);
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
              aria-current={door.href === activePath ? "page" : undefined}
              onClick={makeSameDoorClick(door.href, door.href === activePath)}
              className={`inline-flex items-center shrink-0 rounded-full border px-4 min-h-11 text-xs transition-colors ${FOCUS_RING} ${
                door.href === activePath
                  ? "border-gold/40 bg-gold/10 font-semibold text-foreground"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`door-chip-${doorSlug(door.label)}`}
            >
              {door.label}
            </Link>
          ) : (
            // An inert chip carries its badge — on mobile the chip row is the
            // ONLY menu, and a dead tap with no "why" would break the
            // locked-visible doctrine (the badge says why, never a dead link).
            <span
              key={door.label}
              className="inline-flex items-center gap-2 shrink-0 rounded-full border border-border/40 bg-card/20 px-4 min-h-11 text-xs text-muted-foreground"
              data-testid={`door-chip-${doorSlug(door.label)}`}
            >
              {door.label}
              {door.lifecycle ? <LifecycleBadge lifecycle={door.lifecycle} /> : null}
            </span>
          ),
        )}
      </nav>
      <aside className="hidden lg:block">
        <nav
          aria-label="Member doors"
          className="lg:sticky lg:top-24 rounded-xl border border-border/50 bg-card/30 p-3 space-y-3"
        >
          <div className="flex items-center gap-2 px-1">
            <DoorOpen className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Your doors
            </span>
          </div>
          {MEMBER_DOOR_GROUPS.map((group) => (
            <div
              key={group.title}
              className={group.separated ? "border-t border-border/50 pt-3" : ""}
            >
              {/* text-xs, not the wireframe's 11px — ADR-001 readability floor
                  (nothing user-visible under 12px) outranks a mockup token. */}
              <p className="px-2.5 mb-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.doors.map((door) => (
                  <DoorRow
                    key={door.label}
                    door={door}
                    active={door.href === activePath}
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
