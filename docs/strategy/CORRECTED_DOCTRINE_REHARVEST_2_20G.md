# Corrected-Doctrine Intelligent Re-Harvest (Slice 2.20G)

**Slice:** Judgment-led second-pass capability harvest under corrected mechanics-vs-framing doctrine (inspection-only)
**Date:** 2026-07-02
**Doctrine:** Reject unsafe framing and unsafe implementation; preserve/adapt useful business mechanics. See `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md` §"Business Mechanics vs Unsafe Financial Framing".
**Checkpoint status of this doc:** **workspace-only** until a future founder-approved docs checkpoint. Do not push without explicit approval.
**Hard boundaries honored:** no feature implementation, no code integration, no push, no publish/deploy, no route/API/UI change, no unsafe code copy, no PII/wallet/proof exposure. All GitHub access was read-only (tree + content GETs, code search).

---

## 1. Source universe inspected

| Source | Availability class | Method | Result |
|---|---|---|---|
| Workspace monorepo (studio, api-server, lib, scripts, docs, master map, vendored canon) | 1 — PRESENT+SEARCHED | prior slices + this-slice grep | Already inventoried in the map; no new local sources appeared |
| `duniterum/syndicate-os` (private) | 1 | full tree (295 files) | Our own checkpoint; no un-inventoried assets |
| `duniterum/TheSyndicate` (public) | 1 | full tree (2,581 files) + content search + targeted file reads | **Richest re-harvest yield — see §3–§5** |
| `duniterum/Supa-Exchange` (public) | 1 | full tree (992 files) + path-family scans | Operator/admin, quests/seasons, aggregator machinery |
| `duniterum/entity-chain` (public) | 1 | full tree (177 files) | Confirms prior CONCEPT-only posture |
| `duniterum/navi-portfolio-agent` (public) | 1 | full tree (13 files) | Unchanged: provider-abstraction idea only |
| `duniterum/auditclaw-site` (public) | 1 | full tree (6 files) | Unchanged: verdict/provenance language only |
| `duniterum/cesium` (public) | 2 — PRESENT+SEARCHED, NOTHING RELEVANT | full tree (389 files, last push 2016) | Upstream Duniter/Cesium AngularJS wallet fork; **exclusion posture kept** — tree fetched only to upgrade its claim from "excluded by policy" to "searched, nothing relevant" |
| attached_assets (workspace) | 1 | prior slice search | Directive pastes only; no link-boost source |
| Repos outside the 7 visible to `duniterum` | 4 — EXISTS ELSEWHERE, FOUNDER MUST PROVIDE | n/a | Cannot inspect |

Search families applied at tree + content level: link/boost/backlink/UTM/campaign/promo/invite/share/tracking/partner; referral/source/attribution/sourceId; commerce/purchase/checkout/payment/funnel; recognition/rank/badge/mission/quest/season/leaderboard; admin/broadcast/support/notification/audit/flags; cohort/analytics/dashboard/metrics/revenue; learn/onboarding/glossary/FAQ/cockpit; scripts/pipelines/adapters; ambassador/power-user/CTA/SEO/sitemap/social/ads.

## 2. External Link Boost — resolution

**Classification: NOT FOUND in current workspace or searched GitHub sources; cannot rule out external/non-duniterum source unless founder names it.**

- Exact + semantic searches (workspace: prior slice; GitHub: this slice, tree-path level across all 7 repos + content-level code search): `external link boost`, `link boost`, `backlink`, `utm_source`, `boost` — zero matches for any external-link mechanic.
- Every `boost` content hit in `TheSyndicate` (15 files) refers to **referral-commission/reputation multipliers** (SYN-balance boosts = ABANDONED, forbidden by "never wealth"; rank/NFT boosts = never adopted or explicitly V3/future) — an internal commission concept, not link amplification.
- **Nearest real semantic equivalents found (the growth/link-amplification lane prior art):**
  - `?ref=<memberNumber>` first-touch link capture — `TheSyndicate@src/components/syndicate/ReferralCapture.tsx` + `src/lib/referral-attribution.ts` (attribution-only, no reward, localStorage first-touch)
  - Member share-card PNG export — `MemberShareCard.tsx` + `ShareActions` (`html-to-image` pattern documented in that repo's agent memory) — an off-site shareable link/asset generator
  - Ads/campaign-readiness corpus — `docs/FINAL_PRE_ADS_LOCK_REPORT.md`, `FINAL_PRE_ADS_QA_AND_MEASUREMENT_REPORT.md`, `LIGHTHOUSE_PRE_ADS_AUDIT.md`, `SEARCH_SUBMISSION_NOTES.md`, `sitemap[.]xml.ts` — off-site traffic preparation
  - Social-referral quest metrics — `Supa-Exchange@server/services/questMetrics/coreSocialReferralQuestMetricsService.ts`; ambassador program admin — `client/src/pages/admin/AdminAmbassadors.tsx`
- If the founder's "External Link Boost" is a distinct named system, it lives outside the 7 visible repos (class 4) or under a name not yet given (class 5). Founder input needed: the system's real name, or where it lives.

## 3. Headline reclassification — the 4 "missing" identity doctrine docs are FOUND

All four docs previously carried as **NEED SOURCE** in the capability map (class 5 = "exists elsewhere" under that map's pre-2.20G legend; the map is now renumbered to the founder-canonical scheme) exist in the public `duniterum/TheSyndicate` repo (availability class 1 — PRESENT+SEARCHED+FOUND, tree + filename verified):

- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md`
- `docs/HOLDER_INDEX_ARCHITECTURE.md`
- `docs/NFT_ARCHIVE_METADATA_PHILOSOPHY.md`
- `docs/DOCUMENTATION_AUTHORITY_MAP.md`

This unblocks holder-index/identity-attribution design work without founder file-provision: a future inspection-only slice can read them directly from the repo. The old holder-index posture (REFERENCE_PATTERN_ONLY; era-based numbering authority) still governs — found ≠ adopt.

## 4. Rediscovered / reclassified mechanics (corrected doctrine)

Decisions legend: ADAPT = ADAPT UNDER SYNDICATE DOCTRINE. All rows are availability class 1 unless noted; source form `repo@path`.

| Mechanic | Source | Old class | Corrected class | Asset type | Decision | Lane |
|---|---|---|---|---|---|---|
| First-touch `?ref=` link capture (attribution-only, no reward implied) | TheSyndicate@`src/components/syndicate/ReferralCapture.tsx`, `src/lib/referral-attribution.ts` | REJECT (referral lens) | SAFE MECHANIC — attribution-first discipline is the doctrine we already hold | source/referral mechanic | ADAPT — DEFER UNTIL SOURCE SAFETY | referral/source |
| Reserved future-referral event model (PENDING-only status; kept OUT of the live event registry) | TheSyndicate@`src/lib/future-referral.ts` | never inventoried at file level | doctrine-grade guard pattern | guard utility + data model | ADAPT (the reservation discipline now; wiring later) | referral/source |
| Verified-introduction commission architecture (fixed 5% carved ONLY from Operations tranche; vault/liquidity never diluted; escrow fallback; atomic payment) | TheSyndicate@`contracts/src/CommissionRouterV1.sol` + `docs/proposals/SALE_V2_REFERRAL_*` + `docs/COMMISSION_ROUTER_V1_*` | REJECT (commission = financial) | legitimate business mechanic; unsafe part is only wealth-tiered boosts | commerce/acquisition flow + data model | ADAPT ARCHITECTURE — DEFER UNTIL SOURCE SAFETY + legal | referral/source |
| Referral legal-framing corpus (disclosure, doctrine-recovery audits, revenue-attribution layer) | TheSyndicate@`docs/LEGAL_DISCLOSURE_REFERRAL.md`, `docs/REVENUE_ATTRIBUTION_LAYER.md`, `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md`, proposals series | never inventoried | doctrine source | copy pattern + workflow | ADAPT as doctrine input | referral/source |
| Identity/holder-index doctrine docs (4) | TheSyndicate@`docs/` (see §3) | NEED SOURCE | FOUND (class 1) | data model + doctrine | NEED-SOURCE **RESOLVED** → read-only inspection slice when founder approves | member-auth / identity |
| Seat purchase → receipt → proof journey (two-step live purchase UX, payment-flow state machine, protocol commerce receipt, purchase-events canonical/cache/incremental pipeline) | TheSyndicate@`src/components/syndicate/LivePurchase.tsx`, `src/lib/payment-flow.ts`, `src/lib/protocol-commerce-receipt.ts`, `src/lib/purchase-events-*` | REJECT (buy-flow lens) | core preserved business mechanic | commerce/acquisition flow + analytics/read-model | ADAPT — DEFER UNTIL PUBLIC APPROVAL (wallet/purchase UI is phase-gated); event pipeline partially ALREADY INTEGRATED (Part A indexer) | membership/commerce acquisition |
| Per-purchase treasury routing transparency ("MyPurchaseRouting": 70 Vault · 20 Liquidity · routed splits shown to the buyer) | TheSyndicate@`src/components/syndicate/MyPurchaseRouting.tsx`, agent memory `revenue-routing-by-stream` | REJECT-adjacent | flagship honesty mechanic | UI shape + copy pattern | ADAPT — DEFER UNTIL PUBLIC APPROVAL | membership/commerce acquisition |
| Verified-introduction buyer experience | TheSyndicate@`src/components/syndicate/VerifiedIntroductionBuyerExperience.tsx` + tests | REJECT (referral lens) | on-doctrine (verified introduction is founder-locked vocabulary) | UI shape + workflow | ADAPT — DEFER UNTIL SOURCE SAFETY | referral/source |
| Member cockpit (single progression surface, member/visitor gating, protocol heartbeat band, widget inventory) | TheSyndicate@`docs/COCKPIT_WIDGET_INVENTORY.md` + `.agents/memory/cockpit-*` + mockups | partially inventoried | member-standing surface | UI shape + design pattern | ADAPT — DEFER UNTIL AUTH | recognition/member-standing |
| Rank constitution + distribution spec (standing-based, "never wealth" ruled inside prior art itself) | TheSyndicate@`docs/RANK_CONSTITUTIONAL_RULING.md`, `docs/RANK_DISTRIBUTION_SPEC.md` | DEFER | recognition doctrine source | recognition/progression model | ADAPT | recognition/member-standing |
| Chronicle promotion/admission registry (curated-history admission rules + tests) | TheSyndicate@`src/lib/chronicle-promotion*.ts` | never inventoried at file level | editorial governance mechanic | workflow + guard utility | ADAPT | Activity/Chronicle/cohorts |
| Member share-card PNG export (off-site shareable identity asset) | TheSyndicate@`src/components/syndicate/MemberShareCard.tsx` + ShareActions pattern | never inventoried | growth/share mechanic (nearest link-boost equivalent) | design/component pattern | ADAPT — DEFER UNTIL IDENTITY DOCTRINE | source/growth/link amplification |
| Ads/search/traffic readiness discipline (pre-ads lock + QA/measurement, Lighthouse pre-ads, search submission, sitemap route) | TheSyndicate@`docs/FINAL_PRE_ADS_*`, `docs/SEARCH_SUBMISSION_NOTES.md`, `src/routes/sitemap[.]xml.ts` | never inventoried | campaign-readiness workflow | workflow + analytics | ADAPT (we already have SEO registry; add campaign-readiness gate idea) | source/growth/link amplification |
| Truth-guard script family (check-live-state-truth, check-ownership-wording, check-attention-hierarchy, check-execution-gates, check-homepage-content, check-explorer-canonical, …) | TheSyndicate@`scripts/check-*.mjs` | partially integrated as pattern | ancestor of our guard suite | guard utility | ADAPT selectively; several ALREADY INTEGRATED in spirit | guard/utilities |
| Freeze/root export pipeline (export-members, gen-v1-root, validate-snapshot, verify-deploy + RUNBOOK) | TheSyndicate@`contracts/tools/*`, `contracts/script/generate-v3-historical-members-root.mjs` | inventoried | authority ancestry of Part B | workflow | ALREADY INTEGRATED (never regenerate; artifact + on-chain root are authority) | guard/utilities |
| Operator admin shell (sidebar/topbar/layout-context), broadcast, audit log, reports, monitoring, exports, feature flags, notification bell/bubbles | Supa-Exchange@`client/src/pages/admin/*`, `client/src/components/admin/*` | DEFER (auth) | operator machinery, framing-safe | admin logic + UI shape | ADAPT — DEFER UNTIL AUTH | operator/admin |
| Support intake (feedback form/page, floating support, notification center) | Supa-Exchange@`client/src/components/FeedbackForm.tsx`, `client/src/pages/Feedback.tsx`, `Notifications.tsx` | DEFER | member-support mechanic | workflow + UI shape | ADAPT — DEFER UNTIL AUTH | operator/admin |
| Ambassador program management | Supa-Exchange@`client/src/pages/admin/AdminAmbassadors.tsx` | REJECT (growth lens) | verified-introducer program ≈ on-doctrine growth ops | admin logic | REBUILD USING IDEA ONLY — DEFER UNTIL SOURCE SAFETY | source/growth/link amplification |
| Power-user identification & CTA card management | Supa-Exchange@`client/src/pages/admin/AdminPowerUsers.tsx`, `AdminCtaCards.tsx` | never inventoried | business analytics + operator-managed conversion copy | analytics/read-model + admin logic | REBUILD USING IDEA ONLY — DEFER UNTIL AUTH | public dashboard/business analytics |
| Season/cohort cadence (time-boxed cohorts, season summary surfaces) | Supa-Exchange@`server/services/seasonService.ts`, `client/src/pages/Seasons.tsx` etc. | REJECT (rewards pool) | cadence concept is safe; **SeasonRewardsPool.sol + claim flow stay HARD REJECT** | recognition/progression model | REBUILD USING IDEA ONLY (de-financialized cohort "eras") | Activity/Chronicle/cohorts |
| Social-referral quest metrics | Supa-Exchange@`server/services/questMetrics/coreSocialReferralQuestMetricsService.ts` | REJECT (gamification) | share/introduction activity measurement | analytics/read-model | REBUILD USING IDEA ONLY — DEFER UNTIL SOURCE SAFETY | source/growth/link amplification |
| Provider-abstraction adapter registry (14 aggregator adapters behind one interface) | Supa-Exchange@`server/lib/aggregators/*` | REJECT (trading) | architecture pattern for multi-source reads (e.g. multi-RPC failover) | data model + workflow | REBUILD USING IDEA ONLY | guard/utilities |
| Server notification generator + quest banner + DAO/proposal UI + agent activity log | entity-chain@`server/*`, `client/src/components/*` | CONCEPT only | unchanged | varies | REBUILD USING IDEA ONLY (framing remains unsafe) | operator/admin |
| Verdict/provenance/contradiction-flag evidence language | auditclaw-site (6 files) | PRESERVE language | unchanged | copy pattern | ADAPT | design/components |

## 5. Still HARD REJECT (unchanged by corrected doctrine)

- Wealth-tiered anything: SYN-balance/rank/NFT commission **boosts**, wealth leaderboards, "Compounder Score" (prior art itself abandoned these under its "never wealth" rule)
- `SeasonRewardsPool.sol`, season claim flows, reward-pool/claim-rewards framing
- APY/yield/passive-income/profit-promise surfaces (entity-chain wealth dashboards; Supa yield/commerce surfaces)
- Fake-live/simulated balances presented as real; autonomous-trading framing (navi)
- Client-side wallet generation (navi `generateWallet`); unsafe copied payment/auth code; x402 payment code copy
- ACP referral funnel of auditclaw `PAYMENTS.md`
- Any public claim not backed by protocol truth

## 6. Impact on operator auth / roles design

The Supa admin corpus + TheSyndicate cockpit gating give a concrete role model for the future design slice: **founder/operator** (broadcast, audit, exports, flags, reports, ambassador/introducer management), **member** (cockpit, standing, receipts, share card), **visitor** (public proof surfaces). Key inherited patterns: role-gated admin shell with its own layout context; every operator action audit-logged; feature-flag gating for progressive exposure; notification fan-out separated from broadcast authorship; support intake queue. Referral/source tooling and share-card issuance both land **behind** operator/member auth — auth design should reserve those surfaces now.

## 7. Founder inputs still needed

1. "External Link Boost" — real name or external location (class 4/5, see §2).
2. Approval before any slice reads the 4 identity doctrine docs in depth (inspection-only, from the public repo).
3. Freeze trio raw files — unchanged posture (only if vendoring is ever wanted; privacy decision).
4. Any repos outside the 7 visible to `duniterum`.
