/**
 * @workspace/os-contracts — Access-State vocabulary (IA-1)
 *
 * TYPE-ONLY. The fourteen access states (S1–S14) and three tracks from
 * `docs/architecture/WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md`
 * (§1 tracks, §2 states, §3 matrix), checkpointed as authority at private
 * commit 27136c2.
 *
 * Hard rules (same doctrine as source-boundary.ts):
 *  - These types are NOT evidence that any authentication, session, wallet,
 *    registry, or state machine exists. As of IA-1 nothing does: the only
 *    real state anywhere is S1 (anonymous visitor), hardwired in the studio.
 *  - Ids and tracks live here (shared vocabulary); labels, copy, and runtime
 *    maps live in the studio (artifacts/studio/src/config/accessState.ts),
 *    mirroring the TruthStatus pattern.
 *  - Tracks are NOT one ladder. Progress on one track never grants standing
 *    on another; permissions never merge (§1 binding rules).
 *  - Unknown/undefined state always resolves to S1 (fail closed, §3).
 *  - No "SIMULATED" value exists in this vocabulary and none may be added;
 *    preview-simulator warning copy is UI copy only, never a state.
 */

/**
 * The fourteen access states (design doc §2):
 *  - S1  anonymous visitor
 *  - S2  logged-out visitor (previously authenticated, session ended)
 *  - S3  wallet connected, unsigned
 *  - S4  wallet signed/authenticated, membership not verified
 *  - S5  future Web2 logged-in account (reserved)
 *  - S6  embedded-wallet user (reserved)
 *  - S7  verified member
 *  - S8  verified member with pending recovery
 *  - S9  suspended / revoked / restricted user
 *  - S10 member with source/referral (verified-introduction) privileges
 *  - S11 operator / admin
 *  - S12 founder / root
 *  - S13 auditor / read-only
 *  - S14 worker / agent identity
 */
export type AccessStateId =
  | "S1"
  | "S2"
  | "S3"
  | "S4"
  | "S5"
  | "S6"
  | "S7"
  | "S8"
  | "S9"
  | "S10"
  | "S11"
  | "S12"
  | "S13"
  | "S14";

/**
 * The three separately-modelled tracks (design doc §1). A single session
 * carries exactly one track's authority; tracks never merge.
 *  - USER ........ Visitor → Connected → Authenticated → Verified Member →
 *                  Member Cockpit (authority: membership truth)
 *  - PRIVILEGED .. Operator → Protocol Admin → Founder/Root (authority:
 *                  operator registry ACTIVE row)
 *  - MACHINE ..... Worker/Agent, proposal-only scoped identity (authority:
 *                  registry scope + expiry)
 */
export type AccessTrack = "USER" | "PRIVILEGED" | "MACHINE";

/**
 * Per-surface enforcement mode for the access-state shell (IA-1 two-field
 * registry design, founder-approved):
 *  - PREVIEW_LABELLED .. the surface renders exactly as it does today
 *    (truth-labelled preview); its `requiredState` records the FUTURE §3
 *    matrix truth only. Every surface starts here.
 *  - GATED ............. the fail-closed AccessGate enforces the matrix for
 *    this surface. No surface may be GATED until a real, wired state machine
 *    exists (guarded); frontend gating is visibility/UX, never security.
 */
export type AccessEnforcement = "PREVIEW_LABELLED" | "GATED";

/** Type-only contract for the studio's state → track runtime map. */
export type AccessStateTrackMap = Record<AccessStateId, AccessTrack>;
