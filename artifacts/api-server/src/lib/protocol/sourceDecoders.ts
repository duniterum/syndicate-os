/**
 * Source / join read selectors + decoders (SERVED, canon-free) — Public MVP.
 * ---------------------------------------------------------------------------
 * Strictly read-only helpers for the Verified Introduction (source) surface:
 *   - SourceRegistryV1: sourceExists(bytes32) / isActive(bytes32) booleans ONLY
 *     from THIS module. (Doc corrected 2026-07-16: since M0 the backbone's
 *     introduction refresh reads sourceConfig server-side for the live rate —
 *     and D2 keeps its wallet-of-record edge server-only. No wallet or term is
 *     ever SURFACED; that discipline stands.)
 *   - MembershipSaleV3: SOURCE_REGISTRY() linkage check (address compared
 *     SERVER-SIDE only, never emitted) and quote(uint256,address,bytes32) as
 *     EXACT raw base-unit strings (never humanized, never a JS number).
 *
 * No wallet, no write, no transaction. Selectors are canonical
 * keccak256(signature)[:4]; a reconcile guard verifies each hardcoded selector
 * against the vendored canon ABI.
 */

// keccak256(signature)[:4]
export const SELECTOR_SOURCE_EXISTS = "0xc528db26" as const; // sourceExists(bytes32)
export const SELECTOR_SOURCE_IS_ACTIVE = "0x5c36901c" as const; // isActive(bytes32)
export const SELECTOR_SOURCE_REGISTRY = "0xee9ab677" as const; // SOURCE_REGISTRY()
export const SELECTOR_QUOTE = "0x502ee2af" as const; // quote(uint256,address,bytes32)
export const SELECTOR_MEMBER_NUMBER_OF = "0xcc82559c" as const; // memberNumberOf(address)

/** Strict bytes32 hex shape: 0x + exactly 64 hex chars. */
export const BYTES32_HEX_RE = /^0x[0-9a-fA-F]{64}$/;

/** Canonical no-source id: the engine accepts bytes32(0) as the no-source path. */
export const ZERO_SOURCE_ID = ("0x" + "0".repeat(64)) as `0x${string}`;

/** Zero address used as the anonymous quote recipient (SERVER-SIDE only). */
export const ZERO_ADDRESS = ("0x" + "0".repeat(40)) as `0x${string}`;

export function isBytes32Hex(v: unknown): v is string {
  return typeof v === "string" && BYTES32_HEX_RE.test(v);
}

/** A validated bytes32 hex string → its 64-hex calldata word (lowercased). */
export function bytes32Word(v: string): string {
  if (!isBytes32Hex(v)) throw new Error("bytes32Word: input is not 0x+64-hex");
  return v.slice(2).toLowerCase();
}

/** A 0x40-hex address → its left-padded 64-hex calldata word (lowercased). */
export function addressWord(address: string): string {
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error("addressWord: input is not 0x+40-hex");
  }
  return address.slice(2).toLowerCase().padStart(64, "0");
}

/**
 * Strictly decode a single 32-byte return word as an ABI address: the first
 * 12 bytes MUST be zero padding. Returns the lowercased 0x40-hex address for
 * SERVER-SIDE comparison ONLY (never emit it), or null on any malformation.
 */
export function decodeAddressWord(hex: unknown): string | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  if (!/^0{24}/.test(data)) return null;
  return "0x" + data.slice(24).toLowerCase();
}

/** EXACT raw base-unit strings decoded from the V3 quote() return tuple. */
export type QuoteFigures = {
  synOutRaw: string;
  era: number;
  synPerUsdcRaw: string;
  seatIfFirstRaw: string;
  acquisitionCostRaw: string;
  protocolContributionRaw: string;
};

/**
 * Strictly decode the 6-word quote() return tuple
 * (synOut uint256, era uint16, synPerUsdc uint64, seatIfFirst uint256,
 *  acquisitionCost uint256, protocolContribution uint256) into exact raw
 * base-10 strings (era as a small JS number after a uint16 bound check).
 * Returns null on any malformation — never a partial or normalized value.
 */
export function decodeQuoteFigures(hex: unknown): QuoteFigures | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64 * 6) return null;
  const words: bigint[] = [];
  for (let i = 0; i < 6; i++) {
    try {
      words.push(BigInt("0x" + data.slice(i * 64, (i + 1) * 64)));
    } catch {
      return null;
    }
  }
  const eraBig = words[1]!;
  if (eraBig > 65_535n) return null; // uint16 bound — anything larger is malformed
  return {
    synOutRaw: words[0]!.toString(10),
    era: Number(eraBig),
    synPerUsdcRaw: words[2]!.toString(10),
    seatIfFirstRaw: words[3]!.toString(10),
    acquisitionCostRaw: words[4]!.toString(10),
    protocolContributionRaw: words[5]!.toString(10),
  };
}
