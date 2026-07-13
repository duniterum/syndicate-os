// config/memberDoors.ts — the member's doors (the MEMBER SHELL sidebar).
// ---------------------------------------------------------------------------
// Member Home spec §4.5 + the two-shells rule (2026-07-11 handoff §3) +
// SEASONS_ENGINE §11 "wireframe v2" (advisor harvest, agreed with the founder):
// the door list stays SHORT — every "Coming soon" is a public promise.
// Doctrine pins:
//   · LOCKED ≠ HIDDEN: doors not built yet stay VISIBLE with the EXISTING
//     lifecycle badge (never a second badge system) — the return-visit hook.
//     A door renders as a link ONLY when its surface exists today.
//   · OPERATOR DOORS ARE INVISIBLE to non-operators — none lives in this file.
//   · Zero twins: every live door targets an EXISTING surface.
// Dependency-free except the lifecycle type → Node-loadable for guards.

import type { DisplayLifecycle } from "./truthStatus";

export interface MemberDoor {
  label: string;
  /** Route (or in-page anchor) — ONLY for doors whose surface exists today. */
  href?: string;
  /** Honest posture for a door whose surface is not built yet (locked-visible). */
  lifecycle?: DisplayLifecycle;
  /** One-line plain reason / description under the label. */
  note: string;
}

export interface MemberDoorGroup {
  title: string;
  doors: readonly MemberDoor[];
}

// The §11 slot-6 list (minus the founder-killed possessive-network door):
// Referral LIVE day one; Activity · Chronicle · Archive · Recognition ·
// Protocol graph on the existing posture system.
export const MEMBER_DOOR_GROUPS: readonly MemberDoorGroup[] = [
  {
    title: "Open today",
    doors: [
      { label: "Member Home", href: "/member", note: "Your seat, your standing — this page." },
      { label: "Referral dashboard", href: "/member#referral-dashboard", note: "Your introductions, standing, and ladder progress." },
      { label: "Recognition", href: "/recognition", note: "How the protocol recognizes members." },
      { label: "Wallet", href: "/wallet", note: "Your balances and approvals — revoke is your own signed act." },
      { label: "Toolkit", href: "/toolkit", note: "Every member action in one place — locks visible." },
      // ACT-1: the teasers GREW into live recent-window pages — open doors now.
      { label: "Activity", href: "/activity", note: "The public heartbeat — receipt-backed events, read live." },
      { label: "Fire Ledger", href: "/fire-ledger", note: "Supply retired in public — live total + recent burns." },
      { label: "Protocol graph", href: "/map", note: "The protocol, drawn — every surface on one map." },
    ],
  },
  {
    title: "Growth",
    doors: [
      // L-1: the LP-side door. The individual DEX links never travel without
      // their page context and Risk Notice — the door opens the PAGE.
      { label: "Liquidity", href: "/liquidity", note: "The SYN/USDC pool — why it exists, read live, LP-side actions." },
    ],
  },
  {
    title: "Coming soon",
    doors: [
      // §11 slot 2c — coming-soon doors open their DESIGNED TEASERS, badges
      // honest. (Activity + Fire Ledger went LIVE in ACT-1 → moved above.)
      { label: "Chronicle", href: "/chronicle", lifecycle: "FUTURE", note: "The institutional story — founder-promoted turning points." },
      { label: "Archive", href: "/archive", lifecycle: "PENDING_ADAPTER", note: "Artifacts as protocol memory — reads not wired yet." },
      // FOUNDER DECISION (2026-07-14): the possessive-network door is DEAD
      // (bannedSurfaceNames carries the term + the why); its content lives in
      // the Referral dashboard door.
    ],
  },
];

/** The §11 slots 3–5, reserved VISIBLY on Member Home (cards, not doors):
 * recognition speaks here later; nothing is faked today. */
export const MEMBER_HOME_RESERVED_SLOTS: readonly MemberDoor[] = [
  { label: "Season", lifecycle: "FUTURE", note: "The current season — your XP, your rank, the next quest. Recognition only, never a cash figure." },
  { label: "Quests", lifecycle: "FUTURE", note: "Daily and weekly recognition quests — Learn & Earn earns XP." },
  { label: "While you were away", lifecycle: "PENDING_ADAPTER", note: "What the protocol lived since your last visit — recency-truthful, from the event indexer." },
];
