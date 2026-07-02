/**
 * Merkle utilities for the Part B historical-member freeze (SERVER-ONLY use).
 * ---------------------------------------------------------------------------
 * Reproduces the canonical generator's algorithm EXACTLY (confirmed by the
 * verified root triple-match):
 *   leaf  = keccak256(bytes.concat(keccak256(abi.encode(address wallet, uint256 memberNumber))))
 *   tree  = first-seen ordered leaves; adjacent pair hashing with SORTED
 *           bytes32 pairs at each level; odd leaf promoted; proofs verify with
 *           OpenZeppelin MerkleProof.verify (commutative pair hashing).
 *
 * Used ONLY by scripts/guards (tsx). Never imported by served route code.
 */

import { keccak_256 } from "@noble/hashes/sha3";

/** keccak256 self-test vectors (guards assert these before any real use). */
export const KECCAK_EMPTY =
  "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
export const KECCAK_ABC =
  "0x4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45";

const HEX_64_RE = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export function bytesToHex0x(bytes: Uint8Array): string {
  let out = "0x";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

export function hex0xToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) {
    throw new Error("hex0xToBytes: malformed hex input");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function keccakHex(bytes: Uint8Array): string {
  return bytesToHex0x(keccak_256(bytes));
}

/** keccak256 of an ASCII string (for selectors + EIP-55). */
export function keccakOfAscii(s: string): string {
  return keccakHex(new TextEncoder().encode(s));
}

/** First 4 bytes of keccak256(signature) — e.g. "V1_MEMBER_ROOT()" → 0x360895d2. */
export function selectorFor(signature: string): string {
  return keccakOfAscii(signature).slice(0, 10);
}

/** EIP-55 checksum form of a 0x address. Throws on malformed input. */
export function toChecksumAddress(address: string): string {
  if (!ADDRESS_RE.test(address)) {
    throw new Error("toChecksumAddress: malformed address input");
  }
  const lower = address.slice(2).toLowerCase();
  const hash = keccakOfAscii(lower).slice(2);
  let out = "0x";
  for (let i = 0; i < 40; i++) {
    out +=
      Number.parseInt(hash[i]!, 16) >= 8 ? lower[i]!.toUpperCase() : lower[i]!;
  }
  return out;
}

/** Strict address policy: well-formed AND exactly EIP-55 checksummed. */
export function isStrictChecksumAddress(address: string): boolean {
  if (!ADDRESS_RE.test(address)) return false;
  try {
    return toChecksumAddress(address) === address;
  } catch {
    return false;
  }
}

/** abi.encode(address, uint256) — 32-byte left-padded address + 32-byte BE uint. */
export function abiEncodeAddressUint256(
  address: string,
  value: number,
): Uint8Array {
  if (!ADDRESS_RE.test(address)) {
    throw new Error("abiEncodeAddressUint256: malformed address");
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("abiEncodeAddressUint256: value must be a non-negative integer");
  }
  const out = new Uint8Array(64);
  out.set(hex0xToBytes(address), 12);
  let v = BigInt(value);
  for (let i = 63; i >= 32 && v > 0n; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

/** The canonical double-hash leaf. */
export function computeLeaf(wallet: string, memberNumber: number): string {
  const inner = keccak_256(abiEncodeAddressUint256(wallet, memberNumber));
  return bytesToHex0x(keccak_256(inner));
}

/** Commutative sorted-pair hash of two bytes32 hex values (OZ-compatible). */
export function hashPair(a: string, b: string): string {
  if (!HEX_64_RE.test(a) || !HEX_64_RE.test(b)) {
    throw new Error("hashPair: inputs must be bytes32 hex");
  }
  const [lo, hi] =
    a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a];
  const buf = new Uint8Array(64);
  buf.set(hex0xToBytes(lo), 0);
  buf.set(hex0xToBytes(hi), 32);
  return keccakHex(buf);
}

/**
 * Root of first-seen ordered leaves: adjacent pair hashing per level, sorted
 * bytes32 within each pair, odd leaf promoted unchanged.
 */
export function computeRoot(leaves: readonly string[]): string {
  if (leaves.length === 0) throw new Error("computeRoot: no leaves");
  let level = leaves.map((l) => {
    if (!HEX_64_RE.test(l)) throw new Error("computeRoot: malformed leaf");
    return l.toLowerCase();
  });
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) next.push(hashPair(level[i]!, level[i + 1]!));
      else next.push(level[i]!); // odd leaf promoted
    }
    level = next;
  }
  return level[0]!;
}

/** OZ MerkleProof.verify-compatible proof check. */
export function verifyProof(
  leaf: string,
  proof: readonly string[],
  root: string,
): boolean {
  if (!HEX_64_RE.test(leaf) || !HEX_64_RE.test(root)) return false;
  let computed = leaf.toLowerCase();
  for (const p of proof) {
    if (!HEX_64_RE.test(p)) return false;
    computed = hashPair(computed, p);
  }
  return computed === root.toLowerCase();
}
