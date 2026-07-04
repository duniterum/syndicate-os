// config/sourceAttributionTerminology.ts
//
// The vocabulary + copy for the public source-attribution surface.
//
// DOCTRINE: source attribution is recognition of a verified introduction and a
// growth contribution — NOT compensation. No payment or financial benefit is
// implied or paid. The operator source surface stays paused; any incentive
// concept is explicitly future and gated.
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

/** Lifecycle of the attribution mechanism today (paused, not wired). */
export const sourceAttributionLifecycle: DisplayLifecycle = "NOT_ACTIVE";
/** Lifecycle of any incentive/recognition concept tied to introductions (future, gated). */
export const sourceRewardConceptLifecycle: DisplayLifecycle = "FUTURE";

/**
 * The non-negotiable disclaimer the safe-source-terminology guard asserts is
 * present on the source-attribution surface.
 */
export const sourceDisclaimer =
  "Source attribution is recognition of a verified introduction, never compensation. Membership is not an investment and attribution promises no financial benefit.";

export interface SourceModelStep {
  title: string;
  body: string;
}

export const sourceAttribution = {
  heading: "Source attribution",
  tagline: "Recognition of who opened the door — never a payment.",
  intro:
    "A verified introduction is the origin of a join — recognition of a growth contribution, not compensation. No payment or financial benefit is implied or paid. Today the on-chain source registry can already be read: the public /source page validates an introduction id and, when it is active, builds a shareable join link. Creating or activating a source stays an owner-side, on-chain act — public pages only read and explain.",
  model: [
    {
      title: "A verified introduction",
      body: "An existing member introduces someone who joins. The link between them is recorded as the origin of that join.",
    },
    {
      title: "Recognition, not compensation",
      body: "Attribution is acknowledged as a growth contribution and reflected in recognition — it is never framed as commission, payment, or financial benefit.",
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
      title: "Everything else stays owner-gated",
      body: "Registering and activating a source are owner-side, on-chain acts. Recording attribution into a join is not active yet, and any incentive tied to introductions remains a future, gated concept.",
    },
  ] as SourceModelStep[],
  boundaries: [
    "The on-chain source registry is live and readable; the public /source surface validates an introduction id and builds a shareable join link — strictly read-only.",
    "Registering or activating a source is an owner-side, on-chain act. Nothing is created, activated, or written from any public page.",
    "Attribution is only ever read from verified on-chain source records — no public page writes it, and recording it into a join is not active yet.",
    "Any incentive tied to introductions is a future concept, gated behind founder approval and real wiring.",
    "Membership is not an investment and attribution promises no financial benefit.",
  ],
};
