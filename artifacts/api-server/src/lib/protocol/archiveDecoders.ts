/**
 * Pure Archive1155 view decoders + calldata encoders (SERVED, canon-free) — 2.23A.
 * ------------------------------------------------------------------------------
 * The smallest read surface for the archive group of the protocol-reality
 * envelope: the global pause flag and per-id "configured-on-chain" existence.
 * Network-free and strict — any malformation returns a failure so the caller
 * emits an explicit reason instead of fabricating data. Deliberately does NOT
 * decode supply, eligibility, price, wallet limits, or uris (deferred).
 *
 * Selectors are canonical keccak256(signature)[:4]; a reconcile guard verifies
 * these hardcoded selectors still match the derived selectors.
 */

// keccak256("paused()")[:4]
export const SELECTOR_PAUSED = "0x5c975abb" as const;
// keccak256("getArtifactCore(uint256)")[:4]
export const SELECTOR_GET_ARTIFACT_CORE = "0x0f1a0fba" as const;

/** ABI-encode a single uint256 argument as a 32-byte word (no 0x prefix). */
export function encodeUint256(value: bigint): string {
  if (value < 0n) throw new Error("encodeUint256: negative value");
  return value.toString(16).padStart(64, "0");
}

/** Build eth_call calldata: selector + concatenated 32-byte arg words. */
export function callData(selector: string, words: string[] = []): string {
  return selector + words.join("");
}

/** Decode a single boolean word (0 → false, 1 → true). Null on anything else. */
export function decodeBool(hex: unknown): boolean | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  let n: bigint;
  try {
    n = BigInt("0x" + data);
  } catch {
    return null;
  }
  if (n === 0n) return false;
  if (n === 1n) return true;
  return null;
}

export type ArtifactCoreExists =
  | { ok: true; configured: boolean }
  | { ok: false; reason: string };

/**
 * Minimal strict decode of getArtifactCore(uint256). The real return is a
 * 9-field tuple; we surface ONLY word 0 (the `configured` boolean) and ignore
 * the rest (those carry supply/eligibility/price data this slice does not read).
 * Requires at least 9 packed words so a truncated/garbage return fails closed.
 */
export function decodeArtifactCoreExists(hex: unknown): ArtifactCoreExists {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]*$/.test(hex)) {
    return { ok: false, reason: "non-hex return" };
  }
  const data = hex.slice(2);
  if (data.length === 0) return { ok: false, reason: "empty return" };
  if (data.length % 64 !== 0) return { ok: false, reason: "unaligned return" };
  const words = data.length / 64;
  if (words < 9) return { ok: false, reason: `tuple too short (${words} words, expected >= 9)` };
  let n: bigint;
  try {
    n = BigInt("0x" + data.slice(0, 64));
  } catch {
    return { ok: false, reason: "word 0 not parseable" };
  }
  if (n !== 0n && n !== 1n) return { ok: false, reason: "word 0 not a boolean" };
  return { ok: true, configured: n === 1n };
}
