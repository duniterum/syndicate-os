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

export interface RoutingSplit {
  readonly vaultRaw: string;
  readonly liquidityRaw: string;
  readonly operationsRaw: string;
}

/**
 * The 70 / 20 / 10 split of the NET sent to the company (protocolContribution),
 * computed EXACTLY as the contract's `_routeAmounts` does: vault = net*70/100,
 * liquidity = net*20/100, operations = the REMAINDER (so integer truncation never
 * loses or invents a base unit). Pure BigInt on the raw string. Returns null on a
 * malformed input — never a fabricated split.
 *
 * ⛔ DO NOT DELETE THIS AS "THE DERIVED SHARE" (P0-1, 2026-08-06). It looks like
 * the defect that slice killed and it is a DIFFERENT QUESTION, so the twin search
 * that removed `routedShare` deliberately left this alone:
 *   · `routedShare` derived HISTORICAL AGGREGATES — legs the chain had already
 *     emitted for 36 purchases — as a percentage of GROSS. Wrong base, and
 *     computing what was already published. Those legs are now SUMMED from the
 *     emitted amounts (`financial.routed.*`) and anchored to the engines' own
 *     counters.
 *   · this computes ONE PURCHASE NOBODY HAS SIGNED YET, for the checkout preview.
 *     There is no event to sum: the transaction does not exist. Mirroring
 *     `_routeAmounts` is the only honest way to tell a buyer where their money is
 *     about to go — and it is on NET, with operations as the true remainder,
 *     exactly as the engine does it.
 * A future sweep that "unifies" the two would either invent a figure for an
 * unsigned purchase or re-derive a published one. Keep both.
 */
export function computeRoutingSplit(netProtocolRaw: string): RoutingSplit | null {
  if (!/^[0-9]+$/.test(netProtocolRaw)) return null;
  const net = BigInt(netProtocolRaw);
  const vault = (net * 70n) / 100n;
  const liquidity = (net * 20n) / 100n;
  const operations = net - vault - liquidity;
  return {
    vaultRaw: vault.toString(10),
    liquidityRaw: liquidity.toString(10),
    operationsRaw: operations.toString(10),
  };
}
