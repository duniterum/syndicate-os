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
    note: "Your permanent link, derived from your wallet — the same link forever.",
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
    note: "Call the engine's own memberNumberOf with your address — the same read behind every figure here.",
    kind: "verify-seat",
    lock: "seat",
    lockReason: "Requires a seat — the engine answers for seated wallets.",
  },
];
