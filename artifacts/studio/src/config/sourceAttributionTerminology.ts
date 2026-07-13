// config/sourceAttributionTerminology.ts
//
// The vocabulary + copy for the public source-attribution surface.
//
// DOCTRINE (founder directive, 2026-07-07 — corrected): a source is a verified
// introduction. Publicly it is presented as a bounded referral: an eligible,
// completed introduction carries a transparent acquisition commission, shown
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
  "Referral commissions are transparent acquisition payments for eligible completed member introductions — not passive income, not token yield, not downline, and not a profit promise. Membership is not an investment.";

export interface SourceModelStep {
  title: string;
  body: string;
}

export const sourceAttribution = {
  heading: "Source attribution",
  tagline: "A source opens the door. A member decides. The receipt records the introduction.",
  intro:
    "The Syndicate records verified introductions. When a source-linked member joins under active terms, the referral commission is paid directly to the introducer's wallet inside the buyer's own purchase transaction — on-chain, shown by receipt. The program is active under the current terms (founder-published). The public /source page only validates an introduction id and builds a shareable join link — it never creates, activates, or writes anything; a new source itself is a founder-signed on-chain act.",
  model: [
    {
      title: "A verified introduction",
      body: "An existing member introduces someone who joins. The link between them is recorded as the origin of that join.",
    },
    {
      title: "Commission, then recognition",
      body: "An eligible completed introduction carries a bounded acquisition commission under the current terms, and over time is reflected in non-financial recognition — never passive income, never a downline, and never a profit promise.",
    },
    {
      title: "Source wins over claims",
      body: "Attribution is only ever read from verified source records. No public claim of who introduced whom outranks the recorded source.",
    },
  ] as SourceModelStep[],
  currentState: [
    {
      title: "The registry is on-chain",
      body: "Verified introductions live in the protocol's on-chain source registry. It is real and readable today — no placeholder stands in for it.",
    },
    {
      title: "/source reads it, read-only",
      body: "The public /source page validates an introduction id against the live registry and, when the id is active, builds a shareable join link. It never creates, activates, or writes anything.",
    },
    {
      title: "Creating a source stays owner-gated",
      body: "Registering and activating a source are owner-side, on-chain acts. A valid active introduction is applied at purchase and the commission is paid inside the buyer's own transaction; any recognition tied to introductions remains a future, gated concept.",
    },
  ] as SourceModelStep[],
  boundaries: [
    "The on-chain source registry is live and readable; the public /source surface validates an introduction id and builds a shareable join link — strictly read-only.",
    "Registering or activating a source is an owner-side, on-chain act. Nothing is created, activated, or written from any public page.",
    "Attribution is only ever read from verified on-chain source records — no public page writes it; the purchase contract records it when a buyer joins through a valid link.",
    "The commission is a bounded acquisition payment under the current terms; any recognition tied to introductions remains a future, gated concept.",
    "Membership is not an investment. A referral commission is a bounded acquisition payment — not passive income, not token yield, not equity, and not a profit promise.",
  ],
};
