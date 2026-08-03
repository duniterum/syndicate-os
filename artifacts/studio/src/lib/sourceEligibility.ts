// sourceEligibility.ts — A REFERRAL LINK IS A BONUS ON A QUOTE, NEVER AN
// OBSTACLE TO A PURCHASE.
// ===========================================================================
// THE LAW, and why this file is pure:
//
//   THE ENGINE DECIDES WHETHER A SOURCE APPLIES. WE ONLY ASK IT.
//
// MembershipSaleV3 resolves a source inside buy(). Its refusal depends on the
// BUYER — a wallet that already holds a seat, a wallet already linked to
// another introduction — and it is NOT visible in the read-only quote: the
// quote happily previews the commission for a buyer the purchase will refuse.
// Measured on mainnet 2026-08-04 (block 91,957,979):
//   buy(10 USDC, seat #5, sourceId)  → REVERT SourceNotEligible()
//   buy(10 USDC, seat #5, bytes32(0))→ SUCCEEDS
//   buy( 5 USDC, seat #13/#14, id)   → REVERT SourceAlreadyLinked()
//   quote(…, seat #5, sourceId).acquisitionCost = 250000  ← the false promise
// and the source's own `appliesToRepeatPurchases` is TRUE — so re-deriving
// eligibility from the source's TERMS gives the wrong answer. (An earlier
// handoff named that flag as the cause; the chain says otherwise.)
//
// So the client asks the engine the only question that cannot be wrong: would
// this exact purchase go through? Twice — WITH the introduction and WITHOUT it.
// The difference between those two answers is the whole decision, and it lives
// here, pure and executable, so a guard can run its entire truth table.
// ===========================================================================

/** What the engine answered when asked to simulate one exact purchase. */
export type BuySimulationVerdict =
  /** The engine accepted the call — this purchase would go through. */
  | "accepted"
  /** The engine refused it (a revert). Proven, not inferred. */
  | "refused"
  /** No answer (RPC failure). Proves NOTHING — never treated as a refusal. */
  | "unreadable";

/** What the checkout must do with the introduction link the buyer arrived on. */
export type SourceApplicationDecision =
  /** Sign as intended, introduction included. */
  | "apply"
  /** Sign WITHOUT the introduction — and say so. */
  | "drop"
  /** Sign nothing: this purchase is refused either way. */
  | "abort";

/**
 * The decision. Pure — no chain, no network, no clock.
 *
 * THE ASYMMETRY IS DELIBERATE, and it is the point of the whole function:
 *
 *  · A DROP COSTS A REFERRER HIS COMMISSION AND HIS ATTRIBUTION, permanently.
 *    So a drop demands PROOF — the engine refused the purchase WITH the
 *    introduction and accepted it WITHOUT. Nothing weaker may ever drop it.
 *  · AN UNREADABLE PROBE PROVES NOTHING, so it changes nothing: the purchase
 *    proceeds exactly as it does today. A read failure must never block a
 *    buyer, and must never silently strip a referral that may be perfectly
 *    valid.
 *  · A REFUSAL WE CANNOT EXPLAIN AWAY IS STILL A REFUSAL: once the engine has
 *    said no to the purchase as configured, signing it anyway only spends the
 *    buyer's gas on a transaction that cannot succeed. We abort and tell him.
 */
export function decideSourceApplication(
  withSource: BuySimulationVerdict,
  withoutSource: BuySimulationVerdict,
): SourceApplicationDecision {
  if (withSource !== "refused") return "apply";
  return withoutSource === "accepted" ? "drop" : "abort";
}

/**
 * What the buyer is told when his purchase went through un-attributed. Human
 * words only: no selector, no function name, no "source". The introduction is
 * not "invalid" — it simply cannot attach to this wallet, and that is the
 * engine's rule, not a failure of his.
 */
export const SOURCE_DROPPED_NOTICE =
  "The introduction link could not be attached to this purchase — this wallet's introduction is already settled on-chain, so the engine would not record another. Your purchase went through without it: your SYN and your seat are exactly as shown below.";
