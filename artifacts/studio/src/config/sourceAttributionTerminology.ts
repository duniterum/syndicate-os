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
    "When membership becomes live, The Syndicate can record a verified introduction: the origin of a join. This is recognition of a growth contribution, not compensation. No payment or financial benefit is implied or paid, and nothing is wired today.",
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
  boundaries: [
    "The source registry is deployed but intentionally inactive — paused by precaution.",
    "No attribution is read or written in this foundation.",
    "Any incentive tied to introductions is a future concept, gated behind founder approval and real wiring.",
    "Membership is not an investment and attribution promises no financial benefit.",
  ],
};
