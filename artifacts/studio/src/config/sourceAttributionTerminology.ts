// config/sourceAttributionTerminology.ts
//
// The vocabulary + copy for the public source-attribution surface.
//
// DOCTRINE (founder directive, 2026-07-07 — corrected): a source is a verified
// introduction. Publicly it is presented as a bounded referral: an eligible,
// completed introduction carries a transparent commission, shown
// by receipt — never passive income, never token yield, never a downline,
// never a profit promise, and never an investment.
// STATE — ACTIVE (founder-published 2026-07-13; the rail is proven with real
// money: the first purchase paid the introducer's payoutWallet inside the
// buyer's own transaction). New sources remain founder-signed on-chain acts
// (SPEC R2). Public "Referral" language lives in config/referralProgram.
//
// The list of UNSAFE framing terms lives in the safe-source-terminology guard
// script (not here), so this file holds only safe, rendered copy and can be
// scanned by the forbidden-copy guard like any other surface.
//
// Dependency-free except a type-only import → Node-loadable.

import type { DisplayLifecycle } from "./truthStatus";

/** Approved language for talking about source attribution. */
export const approvedSourceTerms: readonly string[] = [
  "verified introduction",
  "source attribution",
  "origin of a join",
  "introduced by",
  "growth contribution",
  "recognition of contribution",
];

/** Lifecycle of the attribution mechanism — ACTIVE (founder-published
 * 2026-07-13): the commission is paid inside the buyer's own signed purchase
 * transaction, which is exactly what LIVE_ACTION's badge text says. */
export const sourceAttributionLifecycle: DisplayLifecycle = "LIVE_ACTION";
/** Lifecycle of any incentive/recognition concept tied to introductions (future, gated). */
export const sourceRewardConceptLifecycle: DisplayLifecycle = "FUTURE";

/**
 * The non-negotiable disclaimer the safe-source-terminology guard asserts is
 * present on the source-attribution surface.
 */
export const sourceDisclaimer =
  "Referral commissions are transparent payments for eligible completed member introductions — not passive income, not token yield, not downline, and not a profit promise. Membership is not an investment.";

export interface SourceModelStep {
  title: string;
  body: string;
}

export const sourceAttribution = {
  // Human-readable, referral-first (founder, 2026-07-13): "Referral" is the
  // USER word on every public surface; "Source" stays the PROTOCOL word in
  // proof/registry contexts ("powered by Source Attribution").
  heading: "Referral Program",
  tagline: "A referral opens the door. A member decides. The receipt records it.",
  intro:
    "The Syndicate records every referral on-chain. When someone joins through a referral link under the active terms, the commission is paid directly to the referrer's wallet inside the buyer's own purchase transaction — on-chain, shown by receipt. The public /source page only validates a referral code and builds a shareable join link — it never creates, activates, or writes anything; a new referral code itself is a founder-signed on-chain act.",
  model: [
    {
      title: "A verified referral",
      body: "An existing member introduces someone who joins through their referral link. That link between the two is recorded on-chain as the origin of the join.",
    },
    {
      title: "Commission, then recognition",
      body: "An eligible completed referral carries a bounded commission under the current terms, and over time is reflected in non-financial recognition — never passive income, never a downline, and never a profit promise.",
    },
    {
      title: "The chain wins over claims",
      body: "Who referred whom is only ever read from the on-chain record. No public claim outranks it.",
    },
  ] as SourceModelStep[],
  currentState: [
    {
      title: "The registry is on-chain",
      body: "Referral records live in the protocol's on-chain registry (the protocol calls them sources). It is real and readable today — no placeholder stands in for it.",
    },
    {
      title: "/source reads it, read-only",
      body: "The public /source page validates a referral code against the live registry and, when it is active, builds a shareable join link. It never creates, activates, or writes anything.",
    },
    {
      title: "Creating a referral code stays founder-gated",
      body: "Registering and activating a referral code are founder-signed, on-chain acts. A valid active referral is applied at purchase and the commission is paid inside the buyer's own transaction; any recognition tied to referrals remains a future, gated concept.",
    },
  ] as SourceModelStep[],
  boundaries: [
    // The doctrinal money-flow sentence — VERBATIM (founder decision, re-engraved
    // by the advisor 2026-07-13): the flow is Gross purchase → referrer/source
    // payment, if eligible → net protocol contribution → 70/20/10.
    "The referrer is not paid from Syndicate revenue after the fact. The referrer is paid from the purchase transaction before the net protocol contribution is routed.",
    "The on-chain referral registry is live and readable; the public /source surface validates a referral code and builds a shareable join link — strictly read-only.",
    "Registering or activating a referral code is a founder-signed, on-chain act. Nothing is created, activated, or written from any public page.",
    "Who referred whom is only ever read from the on-chain record — no public page writes it; the purchase contract records it when a buyer joins through a valid link.",
    "The commission is a bounded, one-time payment under the current terms; any recognition tied to referrals remains a future, gated concept.",
    "Membership is not an investment. A referral commission is a bounded, one-time payment — not passive income, not token yield, not equity, and not a profit promise.",
  ],
};
