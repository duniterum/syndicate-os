// sourceIdentity.ts — the deterministic member sourceId convention.
// ---------------------------------------------------------------------------
// SPEC_REFERRAL_SYSTEM §③ (founder-decided, closed list §⑫):
//
//   sourceId = keccak256(abi.encodePacked("SYN.SOURCE.V1", wallet))
//
// One wallet → exactly one possible sourceId. Zero collisions, zero squatting,
// no name registry. The future emitter contract (SPEC §⑦) computes the same
// derivation on-chain; an alias is a convenience layered on top and NEVER
// changes the sourceId. Pure function, no I/O — safe everywhere.

import { encodePacked, getAddress, isAddress, keccak256 } from "viem";

export const SOURCE_ID_NAMESPACE = "SYN.SOURCE.V1";

/**
 * Derive the canonical member sourceId for a wallet. Null when the input is
 * not a valid address (callers render nothing rather than a wrong id).
 */
export function deriveSourceId(wallet: string): `0x${string}` | null {
  if (!isAddress(wallet)) return null;
  return keccak256(
    encodePacked(["string", "address"], [SOURCE_ID_NAMESPACE, getAddress(wallet)]),
  );
}
