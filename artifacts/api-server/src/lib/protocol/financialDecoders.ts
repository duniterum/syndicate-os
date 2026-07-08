/**
 * Pure aggregate financial read selectors + decoders (SERVED, canon-free) — N1.
 * -----------------------------------------------------------------------------
 * The financial group of the protocol-reality envelope reads ONLY aggregate,
 * public on-chain figures — never per-wallet data, never a canon constant:
 *   - totalUsdcRaised()  — cumulative gross USDC inflow on the V2-family sale
 *     engines (V2a superseded/sealed + V2b sealed);
 *   - balanceOf(address) — ERC-20 balance of a single well-known protocol
 *     address (vault reserve wallet; canonical burn address);
 *   - getReserves()/token0() — the public AMM pair reserves, oriented against
 *     the canon token addresses SERVER-SIDE only;
 *   - memberCount()      — the active V3 engine's aggregate member tally.
 *
 * Every figure is surfaced as an EXACT raw base-unit decimal STRING (never a
 * JS number, never humanized). Selectors are canonical keccak256(signature)[:4];
 * the targets-reconcile guard re-derives each one.
 */

// keccak256(signature)[:4]
export const SELECTOR_TOTAL_USDC_RAISED = "0xc6a1d7eb" as const; // totalUsdcRaised()
export const SELECTOR_BALANCE_OF = "0x70a08231" as const; // balanceOf(address)
export const SELECTOR_GET_RESERVES = "0x0902f1ac" as const; // getReserves()
export const SELECTOR_TOKEN0 = "0x0dfe1681" as const; // token0()
export const SELECTOR_MEMBER_COUNT = "0x11aee380" as const; // memberCount()

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/**
 * ABI-encode a single-address-argument call: selector + the address left-padded
 * to one 32-byte word. Returns null on a malformed address (fail closed — the
 * caller must NOT issue the call).
 */
export function encodeAddressArg(selector: string, address: string): string | null {
  if (!ADDRESS_RE.test(address)) return null;
  return selector + address.slice(2).toLowerCase().padStart(64, "0");
}

/**
 * Strictly decode a Uniswap-V2-style getReserves() result: exactly 3 words
 * (uint112 reserve0, uint112 reserve1, uint32 timestamp). Returns the two
 * reserves as exact base-10 strings, or null on ANY malformation. The block
 * timestamp word is deliberately dropped (not a financial figure).
 */
export function decodeReservesPair(
  hex: unknown,
): { reserve0: string; reserve1: string } | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 192) return null;
  try {
    const reserve0 = BigInt("0x" + data.slice(0, 64));
    const reserve1 = BigInt("0x" + data.slice(64, 128));
    const MAX_UINT112 = (1n << 112n) - 1n;
    if (reserve0 > MAX_UINT112 || reserve1 > MAX_UINT112) return null;
    return { reserve0: reserve0.toString(10), reserve1: reserve1.toString(10) };
  } catch {
    return null;
  }
}

/**
 * Sum exact decimal base-unit strings with bigint arithmetic. Returns null if
 * ANY component is null or malformed (the aggregate fails closed rather than
 * summing a partial truth).
 */
export function sumDecimalStrings(components: readonly (string | null)[]): string | null {
  let total = 0n;
  for (const c of components) {
    if (c === null || !/^\d+$/.test(c)) return null;
    total += BigInt(c);
  }
  return total.toString(10);
}
