/**
 * Pure Membership-Sale read selectors + decoder (SERVED, canon-free) — Sprint 2.
 * -----------------------------------------------------------------------------
 * The sale group of the protocol-reality envelope reads ONLY:
 *   - lifecycle booleans: paused() (shared with the archive; see archiveDecoders)
 *     and isConcluded() (V2/V3);
 *   - a small, founder-approved set of public V3 sale figures surfaced as EXACT
 *     raw uint256 base units (availableSyn / totalGrossUsdc / receiptCount).
 *
 * It deliberately does NOT read wallets, per-account balances, prices, caps,
 * eras, or any write path. Numeric views are returned as a base-10 STRING so a
 * 256-bit value is never truncated to a JS number and is never normalized or
 * humanized (the exact on-chain integer is the truth; decimals are metadata).
 *
 * Selectors are canonical keccak256(signature)[:4]; a reconcile guard verifies
 * each hardcoded selector still matches the derived selector.
 */

// keccak256(signature)[:4]
export const SELECTOR_IS_CONCLUDED = "0x6b41a6e9" as const; // isConcluded()
export const SELECTOR_AVAILABLE_SYN = "0xaabd9a2f" as const; // availableSyn()
export const SELECTOR_TOTAL_GROSS_USDC = "0x4f10fcdd" as const; // totalGrossUsdc()
export const SELECTOR_RECEIPT_COUNT = "0x7f038f3c" as const; // receiptCount()

/**
 * Strictly decode a single uint256 word to its exact base-10 string, or null on
 * any malformation. Never returns a JS number (256 bits overflow Number) and
 * never normalizes — the returned string is the exact on-chain integer.
 */
export function decodeUint256Decimal(hex: unknown): string | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  try {
    return BigInt("0x" + data).toString(10);
  } catch {
    return null;
  }
}
