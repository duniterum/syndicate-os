// checkoutVocabulary.ts — the ONE edge translation from the engine/ABI field
// names to product vocabulary, plus the slippage-floor computation. Renamed ONCE
// here so no UI ever reads the legacy contract names.
//
// The engine's "acquisitionCost" tells a false story — that the protocol collects
// the money and then reimburses the referrer. Structurally the referrer is paid
// FROM the purchase transaction, BEFORE the net is sent; the protocol never
// receives that portion. And "protocolContribution" must never reach a buyer (we
// write "net"). See the checkout brief + docs/handoff/…-checkout-C1-groundwork.md
// (money-path doctrine). The money is the company's; no member has a claim on it.

/** The engine's public quote view, exact raw base-unit strings (GET /api/join/quote). */
export interface RawJoinQuote {
  readonly synOutRaw: string;
  readonly era: number;
  readonly synPerUsdcRaw: string;
  readonly seatIfFirstRaw: string;
  readonly acquisitionCostRaw: string; // legacy engine name — do not surface
  readonly protocolContributionRaw: string; // legacy engine name — do not surface
}

/** The same quote in product vocabulary. UI reads ONLY this shape. */
export interface CheckoutQuote {
  readonly synOutRaw: string;
  readonly era: number;
  readonly synPerUsdcRaw: string;
  readonly seatIfFirstRaw: string;
  /** acquisitionCost — the amount paid to the referrer/source, from the tx (0 with no source). */
  readonly sourcePaymentRaw: string;
  /** protocolContribution — the net sent to the company (then split 70/20/10). */
  readonly netProtocolRaw: string;
}

/** Rename the engine fields to product vocabulary. The ONLY place the legacy
 *  names are read. */
export function toCheckoutQuote(raw: RawJoinQuote): CheckoutQuote {
  return {
    synOutRaw: raw.synOutRaw,
    era: raw.era,
    synPerUsdcRaw: raw.synPerUsdcRaw,
    seatIfFirstRaw: raw.seatIfFirstRaw,
    sourcePaymentRaw: raw.acquisitionCostRaw,
    netProtocolRaw: raw.protocolContributionRaw,
  };
}

/**
 * The slippage floor for a future buy()'s minSynOut: the quoted SYN out minus a
 * small tolerance. Pure BigInt math on the exact raw 18-decimal string (never a
 * float). The rate is exact within an era; the tolerance only absorbs an era flip
 * between the quote and the signature. Returns the raw floor as a base-10 string,
 * or null if the input is not a clean non-negative integer or the tolerance is out
 * of range (fail closed — never a fabricated floor).
 */
export function computeMinSynOutRaw(synOutRaw: string, toleranceBps = 50): string | null {
  if (!/^[0-9]+$/.test(synOutRaw)) return null;
  if (!Number.isInteger(toleranceBps) || toleranceBps < 0 || toleranceBps > 10_000) return null;
  const out = BigInt(synOutRaw);
  const floor = (out * BigInt(10_000 - toleranceBps)) / 10_000n;
  return floor.toString(10);
}
