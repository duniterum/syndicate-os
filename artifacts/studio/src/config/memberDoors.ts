// config/memberDoors.ts — the member's doors (the MEMBER SHELL sidebar).
// ---------------------------------------------------------------------------
// THE APPROVED MENU (founder GO 2026-07-16, wireframes-2026-07-16.html §2,
// under THE VISUAL CHANGE LAW): 13 rows in FOUR groups —
//   MEMBER (the daily loop: 5 primaries + Receipts locked-visible) ·
//   THE RECORD (protocol memory) ·
//   GROWTH (navigation, not a member promise — the name stays; founder GO) ·
//   OFF-CHAIN COMFORT (Settings pinned LAST, visually separated).
// Icons are lucide KEYS (strings — this config stays dependency-free /
// Node-loadable for guards; MemberShell maps key → component).
// Doctrine pins (unchanged from Member Home spec §4.5 + the two-shells rule):
//   · LOCKED ≠ HIDDEN: a door not built yet stays VISIBLE with the EXISTING
//     lifecycle badge (never a second badge system) — the return-visit hook.
//     A door renders as a link ONLY when its surface exists today.
//   · OPERATOR DOORS ARE INVISIBLE to non-operators — none lives in this file.
//   · Zero twins: every live door targets an EXISTING surface.

import type { DisplayLifecycle } from "./truthStatus";

/** The approved door→icon table (wireframe §2, founder GO) — lucide keys. */
export type MemberDoorIcon =
  | "house"
  | "wallet"
  | "user-plus"
  | "activity"
  | "wrench"
  | "receipt"
  | "book-open"
  | "flame"
  | "archive"
  | "award"
  | "map"
  | "droplets"
  | "settings";

export interface MemberDoor {
  label: string;
  /** Approved lucide icon key — every MENU door carries one (guard-pinned). */
  icon?: MemberDoorIcon;
  /** Route (or in-page anchor) — ONLY for doors whose surface exists today. */
  href?: string;
  /** Honest posture for a door whose surface is not built yet (locked-visible). */
  lifecycle?: DisplayLifecycle;
  /** One-line plain reason / description under the label. */
  note: string;
}

export interface MemberDoorGroup {
  title: string;
  /** Visually separated from the groups above (Off-chain comfort — never protocol). */
  separated?: boolean;
  doors: readonly MemberDoor[];
}

export const MEMBER_DOOR_GROUPS: readonly MemberDoorGroup[] = [
  {
    title: "Member",
    doors: [
      { label: "Member Home", icon: "house", href: "/member", note: "Your seat, your standing — this page." },
      { label: "Wallet", icon: "wallet", href: "/wallet", note: "Your balances and approvals — revoke is your own signed act." },
      { label: "Referral", icon: "user-plus", href: "/member#referral-dashboard", note: "Your introductions, standing, and ladder progress." },
      { label: "Activity", icon: "activity", href: "/activity", note: "The public heartbeat — receipt-backed events, complete history served." },
      { label: "Toolkit", icon: "wrench", href: "/toolkit", note: "Every member action in one place — locks visible." },
      // The receipt product is LIVE at checkout (2026-07-17 seal); the BINDER
      // surface arrives at its slice (A1) — locked-visible per the doctrine pin.
      { label: "Receipts", icon: "receipt", lifecycle: "FUTURE", note: "Your receipts in one binder. Every confirmed purchase already prints its ticket at checkout — the binder surface is coming." },
    ],
  },
  {
    title: "The record",
    doors: [
      { label: "Chronicle", icon: "book-open", href: "/chronicle", note: "The solemn record — entry one: the duplicate seat." },
      { label: "Fire Ledger", icon: "flame", href: "/fire-ledger", note: "Supply retired in public — live total + the numbered Proof of Burn record." },
      { label: "Archive", icon: "archive", href: "/archive", note: "Artifacts as protocol memory — minted on-chain, counts read live." },
      { label: "Recognition", icon: "award", href: "/recognition", note: "How the protocol recognizes members." },
      { label: "Protocol graph", icon: "map", href: "/map", note: "The protocol, drawn — every surface on one map." },
    ],
  },
  {
    title: "Growth",
    doors: [
      // L-1: the LP-side door. The individual DEX links never travel without
      // their page context and Risk Notice — the door opens the PAGE.
      { label: "Liquidity", icon: "droplets", href: "/liquidity", note: "The SYN/USDC pool — why it exists, read live, LP-side actions." },
    ],
  },
  {
    title: "Off-chain comfort",
    separated: true,
    doors: [
      // S7-b (founder, 2026-07-16): the door list is the member's map, so the
      // Settings door exists — pinned last, separated: comfort, never protocol.
      { label: "Settings", icon: "settings", href: "/member#settings", note: "Theme, session, avatar — off-chain comfort; the seat is never a setting." },
    ],
  },
  // (FOUNDER DECISION 2026-07-14 stands: the possessive-network door is DEAD;
  // its content lives in the Referral dashboard.)
];

/** The §11 slots 3–5, reserved VISIBLY on Member Home (cards, not doors):
 * recognition speaks here later; nothing is faked today. */
export const MEMBER_HOME_RESERVED_SLOTS: readonly MemberDoor[] = [
  { label: "Season", lifecycle: "FUTURE", note: "The current season — your XP, your rank, the next quest. Recognition only, never a cash figure." },
  { label: "Quests", lifecycle: "FUTURE", note: "Daily and weekly recognition quests — Learn & Earn earns XP." },
  // S7 truth sweep: the event record itself is LIVE (the complete heartbeat)
  // — what's still to build is this member surface on top of it.
  { label: "While you were away", lifecycle: "FUTURE", note: "What the protocol lived since your last visit — the event record is live; this member surface arrives on it." },
];
