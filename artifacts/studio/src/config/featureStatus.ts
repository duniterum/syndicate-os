// config/featureStatus.ts — THE DONE-IS-DONE REGISTRY (Founder law, 2026-07-19).
// ---------------------------------------------------------------------------
// Born from the Founder's order after the Settings "Notifications — Coming
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
  referrerKit: { status: "live", since: "2026-07-20", where: "/referral/tools" },
  joinInviteeCard: { status: "live", since: "2026-07-20", where: "/join?source= unfurl + the introduced-by strip" },
  activationIntake: { status: "live", since: "2026-07-22", where: "/referral (the Ask-for-activation door + live eligibility card)" },
  sourceReviewQueue: { status: "live", since: "2026-07-22", where: "/admin/sources (the Founder's review queue: preflight + verdicts + bell)" },
  sourcePerformance: { status: "live", since: "2026-07-22", where: "/admin/sources Performance tab (per-source table + screen-exact CSV)" },
  consoleReferralKpis: { status: "live", since: "2026-07-22", where: "/admin Dashboard (the wired referral band + live waiting counts)" },
  // S2b go-live (same commit as the page — DONE-IS-DONE): the board serves.
  seasonRanking: { status: "live", since: "2026-07-23", where: "/season (the live recognition board)" },
  // S2d go-live (same commit as the member cards — DONE-IS-DONE): the fed
  // quests serve own-row on /member. The weekly/recurrent quest classes and
  // Learn & Earn arrive WITH their feeders — their claims cite their own
  // future keys, never this one.
  seasonQuests: { status: "live", since: "2026-07-24", where: "/member (the Quests card — the fed ladder + first-act quests, auto-credit)" },
  theRegister: { status: "live", since: "2026-07-30", where: "/registry (the public per-seat register — #N · address↗ · chapter · rung · joined; the 2026-07-25 address-model surface, built on founder order)" },

  // The vault's holdings go-live (same commit as the card — DONE-IS-DONE). The
  // AVAX row was a hardcoded "Coming" placeholder with NO registry key, so no
  // guard could have caught it: the capability is registered here now, and the
  // placeholder is gone.
  //
  // WHAT IS VALUED AND SUMMED, stated from the code and not from memory: USDC
  // at one dollar, AVAX / BTC.b / WETH.e at live Chainlink prices, the USDC the
  // NFT sale holds (wallet + anything still resting in the contract), AND the
  // protocol's OWN SHARE of the SYN/USDC pool's USDC leg — our LP tokens over
  // the pair's total supply, both read live. SYN is never given a dollar value:
  // its only on-chain price is that same thin pool. Any unreadable component
  // makes the total say so rather than publish a partial sum.
  //
  // THIS ENTRY USED TO SAY "the pool is not summed ... a future key when that
  // slice comes". THAT WAS FALSE ON THE DAY IT WAS WRITTEN: the pool-share read
  // shipped in the very slice this key marks live (`d1b6e75`) — it is right
  // there in ProtocolAssetsCard (poolShare = LP owned / LP supply, folded into
  // the summed `priced` array) and in the home band (the same share taken in
  // exact integer maths). Corrected 2026-07-26 by reading the components. This
  // is the registry's own defect class: every session reads this file first,
  // so a wrong line here propagates into every slice that trusts it.
  //
  // AND THE `where` OMITTED THE PUBLIC HOME — the largest audience of the
  // three. ProtocolReservesBand renders these same holdings, the same summed
  // components and the same fail-closed total on `/`. The one-figure sweep of
  // 2026-07-26 hit the same shape of omission in the code: its first attempt
  // counted two projections and left the public home on the old half-up rule.
  // In prod right now the home and /contracts both print the vault's untouched
  // WETH.e as 0.026552 while /activity prints 0.026551; `11384f5` (committed,
  // awaiting its deploy) is what makes all three truncate alike. An inventory
  // of surfaces is what you enumerate, never what you remember.
  vaultHoldings: { status: "live", since: "2026-07-25", where: "/ (the Protocol Reserves band) + /contracts + /admin (the protocol's multi-token holdings — the vault, the operations wallet, the NFT-sale wallet and our pool share — plus the priced-holdings total)" },

  // ── FUTURE (the only keys a future-claim may cite) ──────────────────────
  avatarUpload: { status: "future", since: "2026-07-14", where: "Member Home arc (App Storage decided)" },
  aliasLayer: { status: "future", since: "2026-07-13", where: "IDENTITY-ALIAS (queued, Founder-approved)" },
  languageChoice: { status: "future", since: "2026-07-14", where: "i18n deferred (Founder decision)" },
  resetProfile: { status: "future", since: "2026-07-17", where: "profile settings (none exist yet)" },
  notificationPreferences: { status: "future", since: "2026-07-19", where: "per-category preferences (v2)" },
  // Seasons arc 2026-07-23 (harvest dossier §0.14-E): the single seasonEngine
  // key SPLIT into three — S1→S3 ship progressively and one key cannot
  // express it. Each flips LIVE in its own go-live commit, never before.
  // (seasonRanking flipped LIVE at S2b — it lives in the LIVE section above.)
  seasonBounty: { status: "future", since: "2026-07-23", where: "the seasons arc S3 (the merit primitive + the effort-reward rail — autonomous the moment the contract is live on mainnet, §8-⑧)" },
  // /archive's museum surface — registered 2026-07-30 (footer audit): the
  // page's three "gallery is still building" sentences were unpinned prose.
  archiveGallery: { status: "future", since: "2026-07-30", where: "/archive (the full museum/gallery surface — mints already publish on the live record; the GALLERY rendering is the unbuilt part)" },
  seasonOwnRow: { status: "future", since: "2026-07-24", where: "the /season YOU own-row highlight (auth-zone wiring; CANON_ACCESS_MODEL own-row exception)" },
  rateRaiseHistory: { status: "future", since: "2026-07-19", where: "the SOURCE_LIFECYCLE rescan micro-slice" },
  secondGeneration: { status: "future", since: "2026-07-19", where: "the 2nd-generation own-row view" },

  // Footer audit 2026-07-30: SEVEN public future claims stood entirely outside
  // this registry — FAQ modules, the Recognition standing figure, the /support
  // preview, and three protocolOsMap concept nodes. Registered here so the
  // widened guard-feature-truth (object-literal + prose pins) can force each
  // surviving "planned/future" sentence clean the day its capability ships.
  standingModel: { status: "future", since: "2026-07-30", where: "/recognition (the single long-term standing figure — cross-season contribution record; a design concept until its model is built)" },
  supportIntake: { status: "future", since: "2026-07-30", where: "/support (the intake channels + triage flow — a labelled preview today; the live doors are X and the official Telegram channels, from brand.ts)" },
  signalChamber: { status: "future", since: "2026-07-30", where: "the FAQ-named Signal Chamber concept (advisory member signals derived from public on-chain activity — no contract, no route)" },
  seatRecord: { status: "future", since: "2026-07-30", where: "the optional Seat Record identity candidate (a separate future ERC-721 — named in contract memory + FAQ; not deployed)" },
  trustCapital: { status: "future", since: "2026-07-30", where: "institutional trust capital (FAQ-named future recognition records — only when real gates exist)" },
  knowledgeOsGuided: { status: "future", since: "2026-07-30", where: "deeper guided Knowledge-OS tooling beyond the /learning map (protocolOsMap concept node)" },
  linkRegistry: { status: "future", since: "2026-07-30", where: "a governed runtime registry of outbound links/CTAs (protocolOsMap concept node — the forbidden-copy guard governs CTA copy today)" },

  // THE PUBLIC PROMISE NO KEY COVERED (registered 2026-07-26). The /activity
  // methodology note tells the world, in prose, "what the indexer adds next" —
  // and not one of those capabilities had a registry key, so guard-feature-truth
  // could not pin the sentence to anything: a future claim on the most public
  // feed we have, standing outside the mechanism that exists precisely to stop
  // a claim from outliving its slice. The two keys below are the ones the
  // Founder's 2026-07-26 ruling puts on the build path — a vault asset purchase
  // must reach members through the bell and the notification centre, and must
  // enter the Chronicle.
  //
  // NEITHER KEY RE-OPENS A LIVE ONE (DONE-IS-DONE, read it before citing them):
  // the notification centre itself is LIVE (`notifications`, 2026-07-18) and
  // the Chronicle register is LIVE and public. What is future is the RAIL — an
  // indexed chain event GENERATING a notification, and indexed events proposing
  // Chronicle candidates. A surface must cite these keys, never the live ones,
  // and must speak about the rail, never about the centre or the register.
  eventDerivedNotifications: { status: "future", since: "2026-07-26", where: "the indexer→bell rail: today a notification row is written by the Founder-gated operator zone (notify one seat / broadcast) or by a server-side verdict (a source decision) — nothing generates one from an indexed chain event the public feed already shows" },
  chronicleCandidatePipeline: { status: "future", since: "2026-07-26", where: "the events→candidates rail: today a candidate is hand-written into docs/chronicle/candidates/ and promoted by a Founder-signed commit (the console's Chronicle panel formats one and writes nothing) — nothing proposes candidates from indexed events" },
};
