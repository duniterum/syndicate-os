// config/supportIntake.ts
//
// Copy + states for the public /support surface. This is a labelled PREVIEW:
// no ticket is stored, transmitted, or written to any backend. The intake
// states describe the shape of a future triage flow, not a live one.
//
// Dependency-free except a type-only import → Node-loadable.

import type { DisplayLifecycle } from "./truthStatus";

export type SupportIntakeState =
  | "OPEN"
  | "TRIAGED"
  | "IN_REVIEW"
  | "RESOLVED"
  | "WONT_FIX";

export interface SupportIntakeStateInfo {
  state: SupportIntakeState;
  label: string;
  description: string;
}

export interface SupportChannel {
  id: string;
  label: string;
  description: string;
  lifecycle: DisplayLifecycle;
}

export const supportIntake = {
  heading: "Support",
  intro:
    "This is where help and review requests will live. It is an honest preview today — nothing you see here is stored, sent, or saved anywhere. The states below describe how requests would be triaged once support opens.",
  note: "Support isn't open yet — nothing here sends or stores anything.",
  channels: [
    {
      id: "question",
      label: "Ask a question",
      description: "General questions about how the protocol and this foundation work.",
      lifecycle: "PREVIEW",
    },
    {
      id: "issue",
      label: "Report an issue",
      description: "Something looks wrong, broken, or mislabelled on a surface.",
      lifecycle: "PREVIEW",
    },
    {
      id: "access",
      label: "Membership access",
      // AUD-TRUTH (2026-07-16): membership itself is LIVE — only this support
      // channel isn't open yet; the description now says which is which.
      description: "Questions about seats and membership — the sale itself is live on Join; this support channel isn't open yet.",
      lifecycle: "PREVIEW",
    },
    {
      id: "security",
      label: "Responsible disclosure",
      description: "Report a security or honesty concern. A real channel isn't open yet.",
      lifecycle: "PREVIEW",
    },
  ] as SupportChannel[],
  triage: [
    { state: "OPEN", label: "Open", description: "A request has been received and not yet reviewed." },
    { state: "TRIAGED", label: "Triaged", description: "Categorised and prioritised for review." },
    { state: "IN_REVIEW", label: "In review", description: "Actively being looked at by the foundation." },
    { state: "RESOLVED", label: "Resolved", description: "Addressed; the outcome is recorded." },
    { state: "WONT_FIX", label: "Closed", description: "Reviewed and intentionally not actioned, with a reason." },
  ] as SupportIntakeStateInfo[],
};
