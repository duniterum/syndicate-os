// config/featureStatus.ts — THE DONE-IS-DONE REGISTRY (founder law, 2026-07-19).
// ---------------------------------------------------------------------------
// Born from the founder's order after the Settings "Notifications — Coming
// later" fossil (notifications had been LIVE since 2026-07-18; the copy stood
// still): "on avance de quelques pas et tu nous fais reculer d'un pas — plus
// jamais." The named failure mode: copy written while a capability was future
// survives the slice that makes it live, and a living feature keeps telling
// members it is coming.
//
// THE MECHANISM (structural, never memorial):
//   · This file is the ONE source of truth for live-vs-future, in CODE.
//   · Every user-visible future-claim site (a `lifecycle="FUTURE"` badge or
//     future-tense copy) is PINNED in `guard-feature-truth` to a key here.
//   · A slice that makes a capability LIVE flips its key here IN THE SAME
//     COMMIT — the guard then turns every surviving "coming" claim RED at
//     the gate. A fossil can no longer outlive its slice.
//   · A NEW future claim requires registering its site in the guard — a
//     deliberate, dated act, never an accident.
// Dependency-free and Node-parsable (the guard reads this file's text).

export type FeatureStatus = "live" | "future";

export interface FeatureEntry {
  readonly status: FeatureStatus;
  /** ISO date the status last flipped (live: the prod seal date). */
  readonly since: string;
  /** The member-facing door when live, or the engraved home of the plan. */
  readonly where: string;
}

export const FEATURE_STATUS: Record<string, FeatureEntry> = {
  // ── LIVE (sealed in prod; no surface may call these "coming") ───────────
  notifications: { status: "live", since: "2026-07-18", where: "/notifications" },
  receiptsBinder: { status: "live", since: "2026-07-19", where: "/receipts" },
  checkoutTicket: { status: "live", since: "2026-07-17", where: "/join" },
  referralTabs: { status: "live", since: "2026-07-19", where: "/referral" },
  channelAnalytics: { status: "live", since: "2026-07-19", where: "/referral/link" },
  introductionRows: { status: "live", since: "2026-07-19", where: "/referral/introductions" },
  receiptPublicPage: { status: "live", since: "2026-07-20", where: "/receipt/{txHash}" },
  paintedPreviewCards: { status: "live", since: "2026-07-20", where: "/receipt/{txHash} link previews (4 faces + rotation)" },
  commissionRegister: { status: "live", since: "2026-07-20", where: "/referral/commissions" },

  // ── FUTURE (the only keys a future-claim may cite) ──────────────────────
  avatarUpload: { status: "future", since: "2026-07-14", where: "Member Home arc (App Storage decided)" },
  aliasLayer: { status: "future", since: "2026-07-13", where: "IDENTITY-ALIAS (queued, founder-approved)" },
  languageChoice: { status: "future", since: "2026-07-14", where: "i18n deferred (founder decision)" },
  resetProfile: { status: "future", since: "2026-07-17", where: "profile settings (none exist yet)" },
  notificationPreferences: { status: "future", since: "2026-07-19", where: "per-category preferences (v2)" },
  seasonEngine: { status: "future", since: "2026-07-19", where: "recognition/season Phase-5" },
  rateRaiseHistory: { status: "future", since: "2026-07-19", where: "the SOURCE_LIFECYCLE rescan micro-slice" },
  secondGeneration: { status: "future", since: "2026-07-19", where: "the 2nd-generation own-row view" },
};
