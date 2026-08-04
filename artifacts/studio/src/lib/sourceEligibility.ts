// sourceEligibility.ts — A REFERRAL LINK IS A BONUS ON A QUOTE, NEVER AN
// OBSTACLE TO A PURCHASE.
// ===========================================================================
// THE FOUNDER'S RULING, 2026-08-04 — THE CHAIN SAYS NO, NEVER US.
//
//   Asked whether this checkout may refuse to send a purchase on its own
//   («est-ce que j'ai le droit de laisser le checkout REFUSER d'envoyer un
//   achat tout seul ?»), he answered NO. So it cannot, and this file cannot
//   express it: there are TWO decisions, `apply` and `drop`, and no third.
//
//   What this code may do is IMPROVE the arguments it signs when it has PROOF
//   — remove an introduction the engine has demonstrably refused, so the
//   purchase goes through un-attributed instead of reverting. What it may
//   never do is decide a customer's purchase is hopeless and withhold it. If
//   the engine still refuses, the transaction goes to the chain, the chain
//   refuses it in public, and the receipt path says so honestly.
//
// WHY ANY OF THIS EXISTS. MembershipSaleV3 resolves a source inside buy(). Its
// refusal depends on the BUYER — a wallet already holding a seat, a wallet
// already linked to another introduction — and it is NOT visible in the
// read-only quote, which happily previews the commission for a buyer the
// purchase will refuse. Measured on mainnet 2026-08-04 (block 91,957,979):
//   buy(10 USDC, seat #5, sourceId)  → REVERT SourceNotEligible()
//   buy(10 USDC, seat #5, bytes32(0))→ SUCCEEDS
//   buy( 5 USDC, seat #13/#14, id)   → REVERT SourceAlreadyLinked()
//   quote(…, seat #5, sourceId).acquisitionCost = 250000  ← the false promise
// and that source's own `appliesToRepeatPurchases` is TRUE — so re-deriving
// eligibility from the source's TERMS gives the wrong answer. Only the engine
// knows, and only per buyer. So we ask it, twice, and compare.
// ===========================================================================

/** What the engine answered when asked to simulate one exact purchase. */
export type BuySimulationVerdict =
  /** The engine accepted the call — this purchase would go through. */
  | "accepted"
  /** The engine refused it (a genuine contract revert). Proven, not inferred. */
  | "refused"
  /** No answer (RPC failure). Proves NOTHING — never treated as a refusal. */
  | "unreadable";

/** What the checkout does with the introduction link the buyer arrived on. */
export type SourceApplicationDecision =
  /** Sign as intended, introduction included. */
  | "apply"
  /** Sign WITHOUT the introduction — and say so. */
  | "drop";

/**
 * The decision. Pure — no chain, no network, no clock.
 *
 * ONE combination and one only removes the introduction: the engine refused
 * the purchase WITH it and accepted the identical purchase WITHOUT it. That is
 * proof, and nothing weaker is, because a drop costs a referrer his commission
 * and his attribution permanently. Every other combination — including a
 * refusal we cannot explain and an unreadable probe — leaves the purchase
 * exactly as the buyer intended it and lets the chain answer for itself.
 */
export function decideSourceApplication(
  withSource: BuySimulationVerdict,
  withoutSource: BuySimulationVerdict,
): SourceApplicationDecision {
  return withSource === "refused" && withoutSource === "accepted" ? "drop" : "apply";
}

/**
 * Everything the question needs from the chain, injected — so this file stays
 * pure and a guard can EXECUTE the whole question with a fake engine.
 */
export interface EngineProbe {
  /** Simulate the exact purchase with this source id. Never signs. */
  simulate(sourceId: string): Promise<{ verdict: BuySimulationVerdict; error: unknown }>;
  /** The engine's own error name for a refusal, or null when undecodable. */
  refusalNameOf(error: unknown): string | null;
  /** The engine's no-source path. */
  readonly zeroSourceId: string;
}

/**
 * THE WHOLE QUESTION, ASKED IN ONE PLACE — and this is a SAFETY fix, not tidying
 * (founder ruling 2026-08-04, his answer ③: harden before deploying).
 *
 * The previous shape left the call site holding two loose simulations whose
 * MEANING lived entirely in the order of their arguments. A second review proved
 * what that costs: the two calls could be swapped so the fix did the exact
 * OPPOSITE — dropping every valid referral and keeping every refused one — with
 * all 39 guard pins still green, because a scanner cannot see which id went into
 * which call. Nothing outside this function can make that mistake now: the
 * caller hands over ONE source id and gets back a decision.
 *
 * The order is the invariant: the FIRST question is always «with the buyer's
 * introduction», the SECOND always «with none». A guard executes this against a
 * fake engine and asserts exactly that.
 */
export async function askEngineAboutSource(
  sourceId: string,
  probe: EngineProbe,
): Promise<{ decision: SourceApplicationDecision; refusalName: string | null }> {
  const withSource = await probe.simulate(sourceId);
  // Not a refusal → nothing is proven against the introduction, and the second
  // question is not even worth asking.
  if (withSource.verdict !== "refused") return { decision: "apply", refusalName: null };
  const withoutSource = await probe.simulate(probe.zeroSourceId);
  const decision = decideSourceApplication(withSource.verdict, withoutSource.verdict);
  return {
    decision,
    // The reason belongs to the refusal we are acting on — the WITH-source one.
    refusalName: decision === "drop" ? probe.refusalNameOf(withSource.error) : null,
  };
}

/**
 * The engine's own refusal names, in human words, for the ONE place a dropped
 * introduction is explained to the buyer.
 *
 * THIS MAP EXISTS BECAUSE I INVENTED A CAUSE ONCE (2026-08-04, caught in
 * review before it ever shipped). The first version of this notice told the
 * buyer «this wallet's introduction is already settled on-chain» — a statement
 * about HIS OWN WALLET that the chain refutes for the very wallet the fix was
 * built from (seat #5 quotes a commission of 0 on a zero source id, so it has
 * no settled introduction; the engine had refused it for a different reason
 * entirely, and that reason was sitting decoded one line away, discarded).
 * A claim the chain can refute is one of the two business red lines. So the
 * reason now comes FROM the engine, verbatim per name, and an unrecognised
 * refusal says only what is certain.
 */
const REFUSAL_WORDS: Readonly<Record<string, string>> = {
  SourceNotEligible: "the engine does not accept this introduction for your wallet",
  SourceAlreadyLinked: "your wallet is already linked to a different introduction, and the engine keeps the first one",
  SelfReferral: "an introduction cannot pay its own buyer",
  ReferrerNotSeated: "the introducer's wallet no longer holds SYN",
};

/**
 * What the buyer reads about an introduction the engine will not attach. Human
 * words only — no selector, no function name, no protocol jargon. Nothing of
 * his has failed: the join is unaffected, and this explains the one thing that
 * is different.
 *
 * `refusalName` is the engine's own error name when it could be decoded, and
 * null when it could not. **Null never invents a cause.**
 *
 * `when` is the only thing that differs between the two places this is shown —
 * BEFORE the signature (the join has not happened yet) and AFTER it (the
 * receipt is on screen). Both sentences live here so neither can be assembled
 * by string surgery at the call site.
 */
export function droppedSourceNotice(
  refusalName: string | null,
  when: "before" | "after" = "after",
): string {
  const because =
    refusalName !== null && refusalName in REFUSAL_WORDS
      ? ` — ${REFUSAL_WORDS[refusalName]}`
      : " — the engine would not accept it for this wallet";
  const tail =
    when === "before"
      ? "Your join is unaffected: it goes through without it, at the price shown."
      : "Your purchase went through without it: your SYN and your seat are exactly as shown below.";
  return `The introduction link could not be attached to this purchase${because}. ${tail}`;
}
