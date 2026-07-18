// lib/notificationIcons.tsx — NOTIF-2 rendering vocabulary (studio side).
// ---------------------------------------------------------------------------
// The lucide component map + link-label + fail-closed helpers, built from the
// ONE os-contracts source (NOTIFICATION_ICON_PALETTE / _LINK_WHITELIST) so the
// renderer and the admin pickers never drift from the server validator. A
// served icon/link outside the source renders as NO icon / NON-clickable —
// never a guessed glyph, never a navigation to an unknown path (fail-closed).
// Shared by the member surfaces (public entry) AND the console composers; the
// vocabulary is public-safe (no operator-only strings).

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  Calendar,
  Flag,
  Flame,
  Frame,
  Gift,
  GraduationCap,
  Handshake,
  Megaphone,
  Receipt,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  UserPlus,
  Users,
  Vault,
} from "lucide-react";
import {
  NOTIFICATION_LINK_WHITELIST,
  type NotificationIcon,
} from "@workspace/os-contracts";

// Record<NotificationIcon, …> — tsc totality makes a palette key without its
// lucide component a RED BUILD, so the map can never fall out of sync with the
// os-contracts palette.
export const NOTIF_ICONS: Record<NotificationIcon, LucideIcon> = {
  bell: Bell,
  megaphone: Megaphone,
  flag: Flag,
  trophy: Trophy,
  award: Award,
  sparkles: Sparkles,
  "badge-check": BadgeCheck,
  "user-plus": UserPlus,
  users: Users,
  handshake: Handshake,
  "shield-check": ShieldCheck,
  "book-open": BookOpen,
  flame: Flame,
  calendar: Calendar,
  "graduation-cap": GraduationCap,
  "arrow-left-right": ArrowLeftRight,
  route: Route,
  store: Store,
  frame: Frame,
  gift: Gift,
  vault: Vault,
  receipt: Receipt,
  activity: Activity,
};

/** The lucide component for a served icon key, or null (fail-closed). */
export function iconFor(icon: string | null | undefined): LucideIcon | null {
  if (icon != null && Object.prototype.hasOwnProperty.call(NOTIF_ICONS, icon)) {
    return NOTIF_ICONS[icon as NotificationIcon];
  }
  return null;
}

// The client mirror of the internal link whitelist — the SAME os-contracts
// literal, so it cannot drift. A served path outside this map is treated as
// NON-clickable (a legitimately-new destination degrades safe/fail-closed
// until the client ships the updated shared literal).
const LINK_LABELS = new Map<string, string>(
  NOTIFICATION_LINK_WHITELIST.map((l) => [l.path, l.label]),
);

/** Human label for a whitelisted internal path, or null. */
export function linkLabel(path: string | null | undefined): string | null {
  return path != null ? (LINK_LABELS.get(path) ?? null) : null;
}

/** True only when the path is an exact member of the internal whitelist. */
export function isKnownLink(path: string | null | undefined): path is string {
  return path != null && LINK_LABELS.has(path);
}
