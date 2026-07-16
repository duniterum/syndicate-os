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
      // ACT-1 opened these doors; M4-c completed them (served full histories).
      { label: "Activity", href: "/activity", note: "The public heartbeat — receipt-backed events, complete history served." },
      { label: "Fire Ledger", href: "/fire-ledger", note: "Supply retired in public — live total + the numbered Proof of Burn record." },
      // First promotion (founder, 2026-07-14): the Chronicle is open.
      { label: "Chronicle", href: "/chronicle", note: "The solemn record — entry one: the duplicate seat." },
      // S7 truth sweep (2026-07-16): the Archive door's "coming soon /
      // not live yet" badge DIED — /archive is open with artifacts minted
      // on-chain (counts and prices read live); the per-wallet holdings
      // view is the honest remaining gap, said on the page itself.
      { label: "Archive", href: "/archive", note: "Artifacts as protocol memory — minted on-chain, counts read live." },
      { label: "Protocol graph", href: "/map", note: "The protocol, drawn — every surface on one map." },
      // S7-b (founder, 2026-07-16): Settings was reachable only through the
      // header menu — the door list is the member's map, so the door exists.
      { label: "Settings", href: "/member#settings", note: "Theme, session, avatar — off-chain comfort; the seat is never a setting." },
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
  // (The "Coming soon" group emptied with the S7 truth sweep — every door
  // above opens a real page today. FOUNDER DECISION 2026-07-14 stands: the
  // possessive-network door is DEAD; its content lives in Referral dashboard.)
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
