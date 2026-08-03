// config/memberActions.ts — THE member action registry (one source, no drift).
// ---------------------------------------------------------------------------
// Member Home §4.3 + the origin's actions.ts pattern (HARVESTED for shape —
// visibility vocabulary, lock reasons — adapted, never copied; the origin was
// a simulated prototype, ours renders only real acts). Rules:
//   · LOCKED ACTIONS STAY VISIBLE with a plain reason — a visitor SEES what a
//     seat unlocks (locked ≠ hidden).
//   · OPERATOR ACTIONS DO NOT EXIST in this registry — removed entirely for
//     non-operators; the console is their only home.
//   · Every action is REAL today (no "future" filler): copy a derived link,
//     share an on-chain receipt, open /join, verify a seat on the engine.
// Dependency-free → Node-loadable for guards.

/** What must be true before the action is usable (locked-visible otherwise). */
export type MemberActionLock = "none" | "session" | "seat";

export interface MemberAction {
  id: string;
  label: string;
  /** One plain line under the label — what this does. */
  note: string;
  /** How the surface executes it (the component maps kind → handler). */
  kind: "copy-referral-link" | "share-proof" | "route" | "verify-seat";
  /** Route target for kind "route". */
  href?: string;
  lock: MemberActionLock;
  /** The plain-words reason shown ON the locked action. */
  lockReason?: string;
}

export const MEMBER_ACTIONS: readonly MemberAction[] = [
  {
    id: "copy-referral-link",
    label: "Copy my referral link",
    // Footer audit 2026-07-30: "derived from your wallet — the same link
    // forever" died — the handler copies the PAYING source id, which can be
    // founder-signed and can change with the paying source. Say what it IS.
    note: "The link that pays you — resolved from the source that pays you.",
    kind: "copy-referral-link",
    lock: "session",
    lockReason: "Sign in with your wallet to use this.",
  },
  {
    id: "share-proof",
    label: "Share my proof",
    note: "Your seat's on-chain receipt — show it, never argue it.",
    kind: "share-proof",
    lock: "seat",
    lockReason: "Requires a seat — the receipt is the proof it exists.",
  },
  {
    id: "expand-footprint",
    label: "Expand your footprint",
    note: "A further purchase adds SYN to the same seat — never a second seat.",
    kind: "route",
    href: "/join",
    lock: "none",
  },
  {
    id: "liquidity-trading",
    label: "Liquidity & trading",
    note: "The SYN/USDC pool — trade, add liquidity, verify the pair. LP-side flow, with its Risk Notice.",
    kind: "route",
    href: "/liquidity",
    lock: "none",
  },
  {
    id: "verify-seat",
    label: "Verify my seat on chain",
    note: "The public engine answers for your seat — the same live record behind every figure here.",
    kind: "verify-seat",
    lock: "seat",
    lockReason: "Requires a seat — the engine answers for seated wallets.",
  },
  // Footer audit 2026-07-30: the registry's completeness claim ("every member
  // action, in one place") had gone stale-complete — two member acts shipped
  // after it and were absent. The registry is the one source; it grows in the
  // same slice as the act, never later.
  {
    id: "ask-activation",
    label: "Ask for referral activation",
    // NO SEAT LOCK (2026-08-03): introducing needs SYN in the wallet, never a
    // seat — the chain gates on the balance (SPEC_REFERRAL_SYSTEM §262/§436).
    // The lock hid Member Home's only signposted route to the door from the
    // very people entitled to use it: signed-in holders who bought on a DEX.
    note: "The activation door on your referral page — you ask, the Founder decides, you see the verdict. Introducing needs SYN in your wallet, not a seat.",
    kind: "route",
    href: "/referral",
    lock: "session",
    lockReason: "Sign in with your wallet to ask for activation.",
  },
  {
    id: "wallet-approvals",
    label: "Review wallet approvals",
    note: "See your USDC approval toward the sale engine and revoke it — a real signed act, from your wallet page.",
    kind: "route",
    href: "/wallet",
    lock: "session",
    lockReason: "Sign in with your wallet to review.",
  },
];
