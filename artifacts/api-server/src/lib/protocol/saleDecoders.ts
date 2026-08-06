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
// ⛔ THE ANCHOR (P0-1, 2026-08-06). The routed legs are summed from indexed
// rows, and a sum of indexed rows cannot detect its own gaps: miss a purchase
// and every leg drops together while the parts still sum to the whole. These
// two counters are kept by the CONTRACT ITSELF, so no indexing bug can move
// them — `routedFold.reconcileRoutedFold` compares the fold against them and
// WITHHOLDS the figures on any divergence. Declared in the vendored ABI
// (sale-abi.ts:189-190) and, until this slice, read by nothing.
// The ABI spelling is the legacy bytecode word; it stops here (CANON §4-bis).
export const SELECTOR_TOTAL_ACQUISITION_COST = "0xe919b146" as const; // totalAcquisitionCost()
export const SELECTOR_TOTAL_PROTOCOL_CONTRIBUTION = "0x8a18bbe9" as const; // totalProtocolContribution()

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
