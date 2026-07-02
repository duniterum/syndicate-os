/**
 * Part B Pinned Expectations (SERVED-SAFE, CANON-FREE) — founder-approved.
 * ------------------------------------------------------------------------
 * The verified authority facts the Part B import gate must reconcile against.
 * This module contains NO contract addresses (engines are referenced by safe
 * internal key — addresses live only in protocolTargets.ts, server-side) and
 * NO member/wallet data. The root is a PUBLIC on-chain commitment (readable by
 * anyone via `V1_MEMBER_ROOT()`), not PII.
 *
 * Verified 2026-07-02 (founder-accepted): triple-match of on-chain V3
 * `V1_MEMBER_ROOT()` == recovered canonical artifact root == independent
 * in-memory recomputation. A tsx guard (partB-canon:guard) reconciles these
 * pins against vendored canon; drift = guard failure.
 */

/** Maps artifact `source` values (V2a/V2b casing) to the sale_generation enum. */
export const ARTIFACT_SOURCE_TO_GENERATION = {
  V1: "V1",
  V2a: "V2A",
  V2b: "V2B",
} as const;

export type ArtifactSource = keyof typeof ARTIFACT_SOURCE_TO_GENERATION;

export const PART_B_EXPECTATIONS = {
  /** Avalanche C-Chain. */
  chainId: 43114,
  /** The historical-member freeze block. */
  freezeBlock: 88496414,
  /**
   * THE authority root — public on-chain commitment exposed by the active V3
   * engine's `V1_MEMBER_ROOT()` view. Triple-match-verified.
   */
  expectedRoot:
    "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329",
  /** Safe internal key of the authority engine (never an address). */
  authorityEngineKey: "MEMBERSHIP_SALE_V3",
  authorityEngineLabel: "Membership Sale V3",
  /** The read-only on-chain view + its keccak selector. */
  method: "V1_MEMBER_ROOT()",
  selector: "0x360895d2",
  /** Exactly 8 historical members. */
  memberCount: 8,
  /** Seat distribution by first-seen generation (sums to memberCount). */
  distribution: { V1: 2, V2A: 3, V2B: 3 } as const,
  /**
   * Canonical artifact provenance — pinned to the authoring commit, NEVER
   * mutable `main`. Public repo metadata (no PII).
   */
  artifact: {
    repo: "duniterum/TheSyndicate",
    commitSha: "d87d68ac668f7d388da666dcc93e73f15a296695",
    outputPath:
      "contracts/script/output/v3-historical-members-root.freeze-88496414.json",
    inputPath:
      "contracts/script/input/v3-historical-members.freeze-88496414.json",
    schema: "syndicate.v3.historical-members.root.v1",
  },
  /**
   * Founder-accepted provenance caveat: the artifact's recorded inputHash does
   * NOT byte-match the committed snapshot (BOM/reformat drift ~5min after
   * generation). Recorded as caveat columns at import — NEVER a gate failure;
   * the root triple-match is the content authority.
   */
  inputHashNote:
    "Recorded inputHash does not byte-match the committed snapshot file (BOM/reformat drift after generation). Provenance caveat only — root triple-match is the content authority.",
} as const;

export type PartBExpectations = typeof PART_B_EXPECTATIONS;
