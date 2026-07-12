// historicalMembers.ts — the V3 historical-member set + the C1.3 gate verdict.
// ===========================================================================
// WHY THIS FILE EXISTS (safety-critical — a duplicate seat already happened):
//
//   MembershipSaleV3's constructor sets memberCount = GENESIS_OFFSET (8) but
//   does NOT populate knownMember/memberNumberOf. The 8 historical members are
//   a NUMBER, not people, until each calls claimHistoricalMembership with a
//   Merkle proof against the immutable on-chain V1_MEMBER_ROOT. An UNCLAIMED
//   historical wallet that buys is seen as a first-time buyer and is minted a
//   SECOND seat — the contract does not stop it. This is not hypothetical:
//   historical member #7 bought without claiming and now also holds seat #11,
//   irreversibly, in production. This module is the gate the contract lacks.
//
// WHAT THE DATA IS (and why bundling it is lawful):
//   The 8 (wallet, memberNumber) pairs + per-wallet proofs are the freeze
//   artifact behind the on-chain root (origin repo,
//   contracts/script/output/v3-historical-members-root.freeze-88496414.json).
//   Every wallet here was emitted by public purchase events on V1/V2a/V2b —
//   the chain already publishes them (CANON_VISIBILITY_LAW: event-emitted
//   addresses are legible, not secret). This is NOT a directory: the UI only
//   ever checks the CONNECTED wallet against the set (own-row), never lists it.
//
// WHY A FROZEN SET IS NOT A STALE SNAPSHOT (guard-freshness doctrine):
//   V1_MEMBER_ROOT is an immutable constructor constant — the set it commits
//   to cannot change on-chain. And we still do not trust this file: every
//   verdict re-reads the LIVE root from the deployed contract and re-folds the
//   wallet's proof to it (the contract's exact math). If this artifact ever
//   disagreed with the chain, the verdict fails closed to BLOCKED — never open.
//
// LEAF + TREE (must match MembershipSaleV3._verifyHistoricalMember exactly):
//   leaf = keccak256(bytes.concat(keccak256(abi.encode(wallet, memberNumber))))
//   fold = sorted-pair keccak at each level (OpenZeppelin MerkleProof.verify).
// ===========================================================================

import { concat, encodeAbiParameters, keccak256 } from "viem";
import { readKnownMember, readV1MemberRoot } from "./chainReads";

type Hex32 = `0x${string}`;

export interface V3HistoricalMember {
  readonly memberNumber: number;
  readonly wallet: `0x${string}`;
  /** Which sealed engine era the seat comes from (provenance only). */
  readonly source: "V1" | "V2a" | "V2b";
  /** Merkle proof for (wallet, memberNumber) — verified against the LIVE root. */
  readonly proof: readonly Hex32[];
}

/**
 * Freeze-artifact root (block 88496414) — documentation/reference ONLY. The
 * AUTHORITY for every verdict is the live V1_MEMBER_ROOT() read from the
 * deployed contract; this constant is never used to verify anything.
 */
export const V3_HISTORICAL_MEMBER_ROOT_FREEZE =
  "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329" as const;

export const V3_HISTORICAL_MEMBERS: readonly V3HistoricalMember[] = [
  {
    memberNumber: 1,
    wallet: "0x244531C571966f90f4849e03a507543d90f9C721",
    source: "V1",
    proof: [
      "0xf1f56062bda188b35f757425cc90ac24c888a3afb50357b063666db4507a4209",
      "0x7e6356225594ba4ab1ae1d2b6afe9d269797002725ae45fbed3616b7a30ad5e2",
      "0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536",
    ],
  },
  {
    memberNumber: 2,
    wallet: "0x3488857b003104e2B08A1D198f8a23BFF28B0045",
    source: "V1",
    proof: [
      "0x748349d18f3661123556d4255df71826deee65aacd7bdf6aec544390e8d15e5a",
      "0x7e6356225594ba4ab1ae1d2b6afe9d269797002725ae45fbed3616b7a30ad5e2",
      "0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536",
    ],
  },
  {
    memberNumber: 3,
    wallet: "0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0",
    source: "V2a",
    proof: [
      "0xf41eee93a6dfa8def509e4c397775320f937cd620fbd41117f225e0522375006",
      "0xcecd90de18aa5e2bfdfaefe07fba9bf97496e76f187013046f49a9a0557f49ed",
      "0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536",
    ],
  },
  {
    memberNumber: 4,
    wallet: "0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a",
    source: "V2a",
    proof: [
      "0x7f2f2c090417335c191d571feef7dd34ba19a708a072430ee24a0b8782e90d92",
      "0xcecd90de18aa5e2bfdfaefe07fba9bf97496e76f187013046f49a9a0557f49ed",
      "0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536",
    ],
  },
  {
    memberNumber: 5,
    wallet: "0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD",
    source: "V2a",
    proof: [
      "0xef099fde9e9e90e0826ed7f41325e5d442e03bac6bc7167916dd98399b23390f",
      "0xb22f0011a15b37f3b819bd24a44ac6d8a1bddcb5f55d4ff792d4a2316656da68",
      "0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d",
    ],
  },
  {
    memberNumber: 6,
    wallet: "0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9",
    source: "V2b",
    proof: [
      "0xc274bb30e98757af0d3d2c8852478b42c8e39afdb7294afef2244193517206f5",
      "0xb22f0011a15b37f3b819bd24a44ac6d8a1bddcb5f55d4ff792d4a2316656da68",
      "0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d",
    ],
  },
  {
    // THE DUPLICATE (already on-chain): #7 bought on V3 without claiming and
    // also holds seat #11. knownMember is now true for this wallet, so the
    // gate stays silent for it — there is nothing left to prevent.
    memberNumber: 7,
    wallet: "0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F",
    source: "V2b",
    proof: [
      "0x6c1d25411a266596df8ea36b26f5a0f9a7abc8658acc5fd1d8dc175b9e7f56ab",
      "0x45c05dfc0408ab24a911c263b628d14c25845ffbb0c14e70ce75c730ecbe9558",
      "0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d",
    ],
  },
  {
    memberNumber: 8,
    wallet: "0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081",
    source: "V2b",
    proof: [
      "0xdf73f7d88e872a00992a7f5d889752625ce3ce03c920bb8240d522f16734b4ba",
      "0x45c05dfc0408ab24a911c263b628d14c25845ffbb0c14e70ce75c730ecbe9558",
      "0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d",
    ],
  },
] as const;

const BY_WALLET = new Map(
  V3_HISTORICAL_MEMBERS.map((m) => [m.wallet.toLowerCase(), m]),
);

/** Own-row check: is THIS address in the historical set? (case-insensitive) */
export function getHistoricalMember(
  address: string | null | undefined,
): V3HistoricalMember | undefined {
  if (!address) return undefined;
  return BY_WALLET.get(address.toLowerCase());
}

// ── The contract's exact Merkle math ─────────────────────────────────────────

function leafFor(wallet: `0x${string}`, memberNumber: number): Hex32 {
  const inner = keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [wallet, BigInt(memberNumber)],
    ),
  );
  return keccak256(concat([inner]));
}

function hashPair(a: Hex32, b: Hex32): Hex32 {
  return BigInt(a) <= BigInt(b) ? keccak256(concat([a, b])) : keccak256(concat([b, a]));
}

/** OpenZeppelin MerkleProof.verify: fold the leaf through the proof, compare. */
function proofFoldsToRoot(leaf: Hex32, proof: readonly Hex32[], root: Hex32): boolean {
  let computed = leaf;
  for (const sibling of proof) computed = hashPair(computed, sibling);
  return computed.toLowerCase() === root.toLowerCase();
}

// ── The gate verdict ─────────────────────────────────────────────────────────

export type HistoricalGateVerdict =
  /** Not in the historical set — the gate does not apply. */
  | { readonly kind: "not_historical" }
  /** knownMember is TRUE live — the engine knows this wallet; no duplicate risk. */
  | { readonly kind: "claimed"; readonly memberNumber: number }
  /**
   * Historical, UNCLAIMED, and the local proof re-verifies against the LIVE
   * on-chain root — a buy from this wallet would mint a duplicate seat. BLOCK.
   */
  | { readonly kind: "blocked_unclaimed"; readonly memberNumber: number }
  /**
   * Historical, but the live state could not be verified (chain read failed,
   * or the proof does not fold to the live root). Fail closed: BLOCK, never guess.
   */
  | { readonly kind: "blocked_unverified"; readonly memberNumber: number };

/**
 * The C1.3 gate decision — reused by C2 before any buy button ever enables.
 *
 * ⚠️ RECIPIENT, not buyer: the contract checks knownMember[RECIPIENT]
 * (_membershipState runs on the recipient). Today recipient == the connected
 * wallet; when gifting lands (C4), this gate MUST be evaluated on the
 * RECIPIENT address, not on msg.sender.
 */
export async function resolveHistoricalGate(
  saleAddress: string | null,
  walletAddress: string | null | undefined,
): Promise<HistoricalGateVerdict> {
  const entry = getHistoricalMember(walletAddress);
  if (!entry) return { kind: "not_historical" };

  // A historical wallet with no live sale read available → fail closed.
  if (!saleAddress) {
    return { kind: "blocked_unverified", memberNumber: entry.memberNumber };
  }

  const [known, liveRoot] = await Promise.all([
    readKnownMember(saleAddress, entry.wallet),
    readV1MemberRoot(saleAddress),
  ]);

  // knownMember TRUE alone settles it: the engine already knows this wallet
  // (claimed — or, for #7, already duplicated). No block applies.
  if (known === true) return { kind: "claimed", memberNumber: entry.memberNumber };

  if (known === null || liveRoot === null) {
    return { kind: "blocked_unverified", memberNumber: entry.memberNumber };
  }

  // knownMember FALSE: prove the local artifact against the LIVE root before
  // asserting anything. The leaf is recomputed from (wallet, memberNumber) —
  // a corrupted artifact cannot lie its way past the fold.
  const verified = proofFoldsToRoot(
    leafFor(entry.wallet, entry.memberNumber),
    entry.proof,
    liveRoot,
  );
  return verified
    ? { kind: "blocked_unclaimed", memberNumber: entry.memberNumber }
    : { kind: "blocked_unverified", memberNumber: entry.memberNumber };
}
