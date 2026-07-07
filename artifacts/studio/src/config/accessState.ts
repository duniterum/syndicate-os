// config/accessState.ts — Access-State shell config (Slice IA-1).
// ---------------------------------------------------------------------------
// Runtime metadata for the S1–S14 access-state vocabulary defined (types only)
// in @workspace/os-contracts. Authority: the checkpointed design doc
// WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md (§1–§3).
//
// HONESTY / SECURITY POSTURE — read before extending:
//   - NO authentication, session, wallet, or registry system exists. The only
//     real access state in the entire product is S1 (anonymous visitor), and
//     CURRENT_ACCESS_STATE_ID below is hardwired to it. Nothing here is, or
//     may pretend to be, evidence of auth wiring.
//   - Everything in this file is visibility/UX vocabulary. Frontend gating is
//     NEVER permission control; real enforcement is a future server-side,
//     founder-gated slice.
//   - Unknown/undefined state always resolves to S1 (fail closed).
//   - This file must stay Node-loadable for guard scripts: type-only imports,
//     no runtime dependencies, pure data + pure functions only.

import type {
  AccessEnforcement,
  AccessStateId,
  AccessTrack,
} from "@workspace/os-contracts";

/**
 * The FAIL-CLOSED DEFAULT access state (S2: no longer the only possible
 * state). Since the S2 wallet-session slice, the app-wide state may be wired
 * to the dev-only SIWE session (S1 ⇄ S4) through the AccessStateProvider's
 * restricted wire seam — but this constant remains the boot/default/fallback
 * value everywhere, and in production builds (wallet module code-excluded)
 * it is effectively the only value. Changing this constant is a founder-gated
 * act (guard-access-state pins it).
 */
export const CURRENT_ACCESS_STATE_ID: AccessStateId = "S1";

/**
 * S2 wire ceiling: the ONLY states a live session may drive app-wide.
 * The dev SIWE session is anonymous control-proof (server returns S1|S4 and
 * nothing else) — member (S7+) and privileged (S11+) states have no wired
 * source and may never be produced by the session seam (guard-enforced).
 */
export const WIRABLE_ACCESS_STATES = ["S1", "S4"] as const;
export type WiredAccessStateId = (typeof WIRABLE_ACCESS_STATES)[number];

/** Fail-closed wire resolver: anything that is not exactly "S4" is S1. */
export function resolveWiredState(value: unknown): WiredAccessStateId {
  return value === "S4" ? "S4" : "S1";
}

export interface AccessStateMeta {
  /** Human name from the design doc §2 heading. */
  name: string;
  /** Which of the three tracks (§1) the state belongs to. */
  track: AccessTrack;
  /** Short chip label (monospace badge copy). */
  chipLabel: string;
  /** One-line honest truth about what this state does and does not prove. */
  honestNote: string;
}

export const accessStates: Record<AccessStateId, AccessStateMeta> = {
  S1: {
    name: "Anonymous visitor",
    track: "USER",
    chipLabel: "S1 · VISITOR",
    honestNote:
      "Public pages, open to everyone. No wallet, no sign-in, and nothing about you is tracked.",
  },
  S2: {
    name: "Logged-out visitor",
    track: "USER",
    chipLabel: "S2 · SESSION ENDED",
    honestNote:
      "Same as a normal visitor. Once you sign out, you're fully signed out.",
  },
  S3: {
    name: "Wallet connected, unsigned",
    track: "USER",
    chipLabel: "S3 · CONNECTED — UNSIGNED",
    honestNote:
      "Connecting a wallet just links it in your browser — it doesn't sign you in yet.",
  },
  S4: {
    name: "Signed in, membership not verified",
    track: "USER",
    chipLabel: "S4 · SIGNED — UNVERIFIED",
    honestNote:
      "Signing proves the wallet is yours right now. It doesn't make you a member or grant any special access.",
  },
  S5: {
    name: "Web2 account (reserved)",
    track: "USER",
    chipLabel: "S5 · WEB2 (RESERVED)",
    honestNote:
      "Reserved future convenience login. A provider account is never authority.",
  },
  S6: {
    name: "Embedded wallet (reserved)",
    track: "USER",
    chipLabel: "S6 · EMBEDDED (RESERVED)",
    honestNote:
      "Reserved future convenience wallet. Never eligible for operator authority.",
  },
  S7: {
    name: "Verified member",
    track: "USER",
    chipLabel: "S7 · VERIFIED MEMBER",
    honestNote:
      "Membership verified server-side against membership truth. Own-record reads only.",
  },
  S8: {
    name: "Member, recovery pending",
    track: "USER",
    chipLabel: "S8 · RECOVERY PENDING",
    honestNote:
      "Restricted read-only while a recovery case is open; identity-mutating actions frozen.",
  },
  S9: {
    name: "Restricted user",
    track: "USER",
    chipLabel: "S9 · RESTRICTED",
    honestNote:
      "Honest restriction notice with a contact path. Public surfaces still render.",
  },
  S10: {
    name: "Member with introducer privileges",
    track: "USER",
    chipLabel: "S10 · INTRODUCER",
    honestNote:
      "S7 plus own attribution status. Own records only; separately founder-gated.",
  },
  S11: {
    name: "Operator / admin",
    track: "PRIVILEGED",
    chipLabel: "S11 · OPERATOR",
    honestNote:
      "Requires an ACTIVE server-side registry row. The operator shell is never the member skin.",
  },
  S12: {
    name: "Founder / root",
    track: "PRIVILEGED",
    chipLabel: "S12 · FOUNDER/ROOT",
    honestNote:
      "Apex scope with extra friction. No online root-replacement workflow exists.",
  },
  S13: {
    name: "Auditor (read-only)",
    track: "PRIVILEGED",
    chipLabel: "S13 · AUDITOR",
    honestNote: "Read-only shell skin. Zero mutations, evidence redacted.",
  },
  S14: {
    name: "Worker / agent identity",
    track: "MACHINE",
    chipLabel: "S14 · WORKER/AGENT",
    honestNote:
      "No surface of its own. Proposal-only; cannot approve recovery or identity changes.",
  },
};

export const ACCESS_STATE_IDS = Object.keys(accessStates) as AccessStateId[];

/** Fail-closed resolver: anything unknown is an anonymous visitor (§3). */
export function resolveAccessState(value: unknown): AccessStateId {
  return typeof value === "string" &&
    (ACCESS_STATE_IDS as string[]).includes(value)
    ? (value as AccessStateId)
    : "S1";
}

/**
 * Pure §3-matrix projection: would `stateId` be allowed on a surface whose
 * FUTURE requirement is `requiredState`? Encodes the three requirement tiers
 * present in the surface registry today; anything unmodelled fails closed.
 *
 *  - "S1"  (public pages row): every human state may view; S14 worker has no
 *    frontend surface of its own ("—" in the matrix).
 *  - "S7"  (member cockpit row): own-scope member states (S7 · S8 read-only ·
 *    S10) plus least-data support views (S11 · S12 read-only). S13 is "—".
 *  - "S11" (operator shell row): S11 · S12, plus S13 in the read-only skin.
 *
 * This is vocabulary/preview logic ONLY — it authorizes nothing, because no
 * state other than S1 can occur (no auth system exists).
 */
export function matrixAllows(
  stateId: AccessStateId,
  requiredState: AccessStateId,
): boolean {
  switch (requiredState) {
    case "S1":
      return stateId !== "S14";
    case "S7":
      return ["S7", "S8", "S10", "S11", "S12"].includes(stateId);
    case "S11":
      return ["S11", "S12", "S13"].includes(stateId);
    default:
      return false;
  }
}

export interface AccessEvaluation {
  allowed: boolean;
  /** Honest one-word mode for chips/simulator output. */
  outcome: "PREVIEW" | "ALLOW" | "BLOCK";
}

/**
 * Evaluate a surface for a given state under the two-field registry design:
 * PREVIEW_LABELLED surfaces render exactly as today (the matrix column is
 * recorded truth, not enforcement); GATED surfaces consult the matrix and
 * fail closed. No surface is GATED in IA-1 (guard-enforced).
 */
export function evaluateAccess(
  stateId: AccessStateId,
  requiredState: AccessStateId,
  enforcement: AccessEnforcement,
): AccessEvaluation {
  if (enforcement !== "GATED") return { allowed: true, outcome: "PREVIEW" };
  return matrixAllows(resolveAccessState(stateId), requiredState)
    ? { allowed: true, outcome: "ALLOW" }
    : { allowed: false, outcome: "BLOCK" };
}
