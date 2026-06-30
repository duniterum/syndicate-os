# Slice 2.20E — Duniterum Capability Harvest & Syndicate OS Integration Atlas

> **Mode:** READ-ONLY / REPORT-ONLY prior-art harvest. No features implemented, no files copied
> into `syndicate-os`, no source/UI/API/route/canon/package changes, no live wiring, no deploy.
> Target authority repo: **`duniterum/syndicate-os`** (private), approved `main` at commit `6d578a5`.
> Prior-art was read from fresh, read-only `/tmp` clones and is **pattern source only** — never
> imported and never presented as Syndicate truth.

---

## 1. Executive Verdict

- **Did the Duniterum repos contain valuable future Syndicate OS capabilities?** Yes —
  substantially. The visible prior art is not noise; it is a deep reservoir of already-designed
  operator/member machinery (support/ticketing, admin broadcast, notification center, gamified
  recognition, learning loops, referral/source attribution, role-gated identity, AI assistant/worker
  seams, registry/explorer/transparency surfaces) plus an honesty-doctrine lineage that directly
  prefigures the current `syndicate-os` truth/canon model.
- **Which repos are most valuable and why?**
  1. **`TheSyndicate`** (HIGH) — the *direct product ancestor*: same brand, same proof-first
     doctrine, registry/transparency/member-cockpit/rank surfaces, and explicit defensive honesty
     copy. It is the richest source of *safe, on-brand* patterns.
  2. **`Supa-Exchange`** (HIGH) — the most *feature-complete operator/member platform*: mature
     support/ticketing, admin broadcast/audit/feature-flags, notification center, missions/badges,
     learn modules, role-gated auth — and, critically, it already carries a `the-syndicate` **canon +
     integrity-guard** lineage (the ancestor of `verify:canon`). Its commerce/yield framing is unsafe
     and must be excluded.
  3. **`entity-chain`** (MEDIUM) — strong *architecture concepts* (multi-agent registry, DAO/proposal
     UI, template-driven notification generator, quest engine) wrapped in heavy unsafe financial
     framing. Harvest the structure as CONCEPT; reject the framing.
  4. **`navi-portfolio-agent`** (LOW) — a small read-only multi-chain portfolio aggregator; useful
     only as a *read-model/provider-abstraction* concept. Its autonomous-trading framing is REJECT.
  5. **`auditclaw-site`** (LOW) — a tiny static "verify before you trust" storefront whose
     *evidence-first verdict* framing is strongly proof-aligned; its payments/referral funnel is REJECT.
- **Is it safe to use them as prior art?** Yes, with discipline. Everything is harvested as
  *mechanics / architecture / product-intelligence*, classified against Syndicate doctrine, and the
  unsafe surfaces are explicitly rejected. No values, addresses, secrets, or PII are reproduced here.
- **What must be preserved?** The proof-first *emotional and product* spine: radical-honesty truth
  states, registry/transparency, recognition-by-contribution (de-financialized), defensive
  "no financial promise" framing, and the canon + integrity-guard lineage.
- **What must be rejected?** Every financial-return frame (profit / yield / APY / ROI / passive-income
  / speculation / "alpha"), casino/gambling mechanics, fake-live or simulated balances presented as
  real, wealth leaderboards, autonomous trading "on your behalf", commerce/checkout funnels,
  client-side key generation, and any unauthenticated admin/member surface.
- **Senior one-paragraph interpretation.** The clean `syndicate-os` foundation is the *correct* core,
  but it is currently a small honest frontend; the prior art proves that a much larger, safe OS was
  already partially invented across these repos. The opportunity is to **harvest the safe machinery
  (support, notifications, broadcast, recognition, learning, identity, AI seams, registry/explorer)
  as specifications**, translate each into Syndicate-safe, posture-gated, read-only-first form, and
  reject the speculative/financial framing wholesale — *continuity without contamination*.

---

## 2. Repository Inventory

| Repo | Visibility | Language / Framework | Inspected? | Relevance | Reason |
| --- | --- | --- | --- | --- | --- |
| `duniterum/syndicate-os` | private | TypeScript · pnpm monorepo (React+Vite / Express / Drizzle) | context (authority) | TARGET | The private authority repo this harvest serves; not a prior-art source. |
| `duniterum/TheSyndicate` | public | TypeScript · TanStack Start (SSR/SPA) | Yes | HIGH | Direct product ancestor: same brand + proof-first doctrine; registry/transparency/member/rank surfaces; defensive honesty copy. |
| `duniterum/Supa-Exchange` | public | TypeScript · React+Vite / Express / Drizzle | Yes | HIGH | Most feature-complete operator/member platform; carries a `the-syndicate` canon + integrity-guard ancestor. Commerce/yield framing unsafe. |
| `duniterum/entity-chain` | public | TypeScript · React+Vite / Express / Drizzle | Yes | MEDIUM | Strong architecture concepts (multi-agent registry, DAO UI, notification generator, quest engine) under heavy unsafe financial framing. |
| `duniterum/navi-portfolio-agent` | public | JavaScript · React (CRA) + ethers | Yes | LOW | Small read-only multi-chain portfolio aggregator; autonomous-trading framing is REJECT. |
| `duniterum/auditclaw-site` | public | HTML (static) | Yes | LOW | Tiny evidence-first audit storefront; proof framing useful, payments/referral funnel REJECT. |
| `duniterum/cesium` | public | JavaScript (fork) | **No** | EXCLUDED | Out of scope by founder instruction — an upstream Duniter/Cesium webapp **fork** (2016), not Duniterum-authored prior art. Listed only; never inspected. |

No additional Duniterum-owned repositories were visible beyond the seven above.

---

## 3. Method & Safety Boundaries

- **Read-only clones.** Each prior-art repo was cloned fresh into `/tmp` (shallow; the two large repos
  blobless) and read only. Clones are removed after the harvest. The target `syndicate-os` clone's
  remote is tokenless; the GitHub token was used in-memory only and never printed or persisted.
- **No file copying.** No file, snippet, asset, schema, or config was copied from any prior-art repo
  into `syndicate-os`. Patterns are described, not transplanted.
- **No implementation.** Nothing in this slice changes runtime behavior. The only changes are this
  report file and one README pointer.
- **No sensitive value printing.** No wallet/contract addresses, transaction hashes, emails, phone
  numbers, API keys, secrets, mnemonics, or private strategy values appear in this document.
  Sensitive-looking finds are reported as **repo / path / category / count** only (§13).
- **Survey method.** Structure survey (file trees, extension histograms, package manifests) →
  capability keyword heatmap → targeted reads → subagent inventory passes for the large repos.
- **`syndicate-os` remains the authority.** Prior art informs the *roadmap*; the private
  `syndicate-os` repo remains the single source of truth for any future implementation, which stays
  founder-gated and posture-gated.

---

## 4. Cross-Repo Capability Matrix

> Maturity = state **in the prior-art repo**. Action = recommended posture **for Syndicate OS**.
> Surfaces use the target surface vocabulary. No prior-art code is endorsed for copying.

| Capability | Source repo(s) | Evidence path(s) | Maturity | Action | Target surface | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Registry / transparency / event feed | TheSyndicate | `src/routes/registry.tsx`, `src/routes/transparency.tsx`, `src/components/syndicate/ProtocolEventsFeed.tsx`, `src/lib/protocol-event-registry.ts` | WORKING | PRESERVE | PUBLIC_VISITOR · API_READ_MODEL | Already on-brand proof surface; maps onto Syndicate truth/posture model. Values stay canon-gated. |
| Public health / no-PII snapshot API | TheSyndicate | `src/routes/api/public/protocol-health.ts`, `src/lib/protocol-health-registry.ts` | WORKING/PARTIAL | ADAPT | API_READ_MODEL | A registry-projected, no-PII status read model — strong fit for `/status` + api-server read model. |
| Member cockpit / "My Syndicate" dashboard | TheSyndicate | `src/routes/my-syndicate.tsx`, `src/components/syndicate/cockpit/MemberCockpit.tsx`, `.../CockpitProgression.tsx` | WORKING | DEFER (spec now) | AUTHENTICATED_MEMBER | Member surface concept; spec only until auth + read model exist. |
| Honesty banners (stale-build / activity / pending-module) | TheSyndicate | `src/components/syndicate/StaleBuildBanner.tsx`, `.../ActivityHealthBanner.tsx`, `.../PendingModuleNotice.tsx` | WORKING | ADAPT | PUBLIC_VISITOR · PRIVATE_OPERATOR_ADMIN | Honesty-aligned notification primitives; reframe as truth/posture-bound notices. |
| FAQ / glossary / archive literacy | TheSyndicate · Supa-Exchange | `src/routes/faq.tsx`, `src/components/syndicate/ArchiveFaq.tsx`, `.../ArchiveGlossary.tsx`; `client/src/pages/FAQ.tsx` | WORKING | ADAPT | FUTURE_LEARNING_SYSTEM · PUBLIC_VISITOR | Protocol-literacy content surface; content must derive from canon, not invented. |
| Recognition / ranks / "Proof of Fire" | TheSyndicate | `src/routes/ranks.tsx`, `src/components/syndicate/RankHub.tsx`, `.../ProofOfFireCard.tsx`, `.../MilestoneApproachingTile.tsx` | WORKING | REWRITE | AUTHENTICATED_MEMBER | Recognition is on-doctrine, but **de-financialize**: rank by contribution/participation, never by wealth/holdings ranking. |
| Source attribution / referral | TheSyndicate · Supa-Exchange | `src/lib/referral-attribution.ts`, `src/components/syndicate/SourceAttributionProofCard.tsx`; `server/services/questMetrics/coreSocialReferralQuestMetricsService.ts`, `client/src/pages/admin/AdminAmbassadors.tsx` | PARTIAL/CONCEPT | ADAPT | API_READ_MODEL · AUTHENTICATED_MEMBER | "Who introduced whom" attribution as proof, **not** paid affiliate commission. Reject commission/payout framing. |
| Wallet connect / identity | TheSyndicate · Supa-Exchange | `src/components/syndicate/Web3Provider.tsx`, `.../HeaderWalletChip.tsx`, `src/lib/use-global-identity.ts`; `client/src/lib/thirdwebAuth.ts`, `client/src/lib/wallets.ts` | WORKING | DEFER (spec now) | AUTHENTICATED_MEMBER | Identity-by-ownership concept; privacy-safe proof of membership only — never expose wallet values. No client-side key generation. |
| Role-gated admin auth | Supa-Exchange | `client/src/pages/admin/Login.tsx`, `server/security.ts` | WORKING | ADAPT | PRIVATE_OPERATOR_ADMIN | Role separation pattern for the future operator console; must be authenticated + audited. |
| Support / feedback / ticketing | Supa-Exchange · auditclaw-site | `client/src/pages/Feedback.tsx`, `client/src/pages/admin/FeedbackAdmin.tsx`, `.../FeedbackDetail.tsx`; `auditclaw-site/index.html` (contact form) | WORKING | ADAPT | FUTURE_SUPPORT_SYSTEM | Public intake → operator review queue. No email dependency; no PII leakage. |
| Admin broadcast / announcement center | Supa-Exchange · entity-chain | `client/src/pages/admin/AdminBroadcast.tsx`, `client/src/pages/admin/AdminNotificationBubbles.tsx`; `server/notification-generator.ts` | WORKING | ADAPT | PRIVATE_OPERATOR_ADMIN · API_READ_MODEL | Operator → member broadcast with audit + role gates; template-driven generation is reusable as concept. |
| Notification center (user history + toasts) | Supa-Exchange · entity-chain | `client/src/pages/Notifications.tsx`, `client/src/components/ui/toast.tsx`, `use-toast.ts`; `client/src/components/NotificationBell.tsx` | WORKING | ADAPT | AUTHENTICATED_MEMBER · API_READ_MODEL | Member inbox + transient toasts; persist as read model behind auth. |
| Admin audit log | Supa-Exchange | `client/src/pages/admin/AdminAudit.tsx` | WORKING | ADAPT | PRIVATE_OPERATOR_ADMIN | Every operator action logged; required for broadcast/support governance. |
| Feature flags | Supa-Exchange | `client/src/pages/admin/Flags.tsx` | WORKING | DEFER | PRIVATE_OPERATOR_ADMIN | Useful for staged rollout once a backend exists. |
| Missions / quests / badges / XP | Supa-Exchange · entity-chain | `client/src/pages/Missions.tsx`, `Badges.tsx`, `server/services/xpService.ts`, `badgeService.ts`; `client/src/pages/Quests.tsx`, `server/questData.ts` | WORKING | REWRITE | FUTURE_LEARNING_SYSTEM · AUTHENTICATED_MEMBER | Keep learning/onboarding/contribution loops; strip points-as-money, seasonal pools, and any earn/reward-pool framing. |
| Learning / literacy modules | Supa-Exchange · entity-chain | `client/src/pages/Learn.tsx`, `client/src/pages/admin/LearnAdmin.tsx`, `scripts/seed-lessons.ts`; `client/src/pages/Whitepaper.tsx`, `Documentation.tsx` | WORKING | REWRITE | FUTURE_LEARNING_SYSTEM | Strong "learn" structure; rename away from "learn & **earn**"; tie content to canon literacy, not rewards. |
| Multi-AI-agent registry / archetypes | entity-chain · Supa-Exchange | `client/src/lib/agents.ts`, `client/src/components/AIAgentChat.tsx`; `server/ai/runTask.ts`, `server/ai/handlers/*` | PARTIAL/WORKING | ADAPT | FUTURE_AI_WORKER | Registry-of-workers architecture is reusable for support/triage/operator copilots; reject "trader/alpha" agent roles. |
| AI assistant (chat) seam | TheSyndicate · Supa-Exchange | `src/routes/ai.tsx`, `src/routes/api.chat.ts`, `src/lib/ai-gateway.server.ts`; `client/src/pages/Assistant.tsx` | CONCEPT/PARTIAL | ADAPT | FUTURE_AI_WORKER · FUTURE_SUPPORT_SYSTEM | Gateway-backed assistant scoped to protocol literacy + support; no financial advice. |
| DAO / proposal / governance UI | entity-chain | `client/src/components/DAOGovernance.tsx`, `client/src/pages/DAO.tsx` | PARTIAL (mock) | DEFER | AUTHENTICATED_MEMBER | Proposal/quorum/progress UI is a clean concept for future recognition/governance; values must be real, never simulated. |
| Block explorer / monitoring UI | entity-chain · TheSyndicate | `client/src/components/BlockExplorer.tsx`, `server/blockchain-simulator.ts`; `src/routes/transparency.tsx` | WORKING (simulated) | REWRITE | API_READ_MODEL · PUBLIC_VISITOR | Explorer UX is valuable; the simulator presents fake-live data — **reject simulation**, wire only to verified reads later. |
| Design system / primitives / theme | All TS repos | `src/components/syndicate/Primitives.tsx`, `src/components/ui/*`; `client/src/components/ui/*`, `ThemeProvider.tsx` | WORKING | PRESERVE (as reference) | PUBLIC_VISITOR | Same shadcn/Radix lineage as `syndicate-os`; reference for component coverage, not import. |
| Charts / analytics / data views | All TS repos | `src/components/syndicate/TreasuryComposition.tsx`, `TokenomicsDonut.tsx`, `LpStatus.tsx`; `client/src/pages/Analytics.tsx`, `components/ui/chart.tsx` | WORKING | ADAPT | API_READ_MODEL · PRIVATE_OPERATOR_ADMIN | Data-view pattern library; bind to truth labels, never to simulated numbers. |
| Route registry (single source) | Supa-Exchange | `client/src/lib/routeRegistry.ts` | WORKING | PRESERVE (already adopted) | PUBLIC_VISITOR | Validates `syndicate-os`'s existing SEO/route-registry single-source decision. |
| Sitemap / SEO / OG generation | TheSyndicate · Supa-Exchange | `src/routes/api/og/`; `client/src/pages/Sitemap.tsx`, `scripts/generate-sitemap.ts` | WORKING | DEFER | PUBLIC_VISITOR | Dynamic OG + sitemap generation for the pre-deploy SEO slice. |
| Canon + integrity-guard lineage | Supa-Exchange | `artifacts/api-server/src/canon/the-syndicate/contracts/syndicate-config.ts`, `artifacts/api-server/scripts/verify-canon-integrity.ts`, `src/data/sourceStatus.ts` | WORKING | PRESERVE | SERVER_SIDE_CANON | **Direct ancestor** of `syndicate-os` canon + `verify:canon`. Confirms the integrity-guard doctrine predates and validates the current design. |
| Evidence-first verdict framing | auditclaw-site | `index.html` (USE/CAUTION/AVOID, provenance/confidence, contradiction flags) | WORKING | PRESERVE | PUBLIC_VISITOR | Verdict + provenance + contradiction-flag language is the purest expression of Syndicate proof-first honesty. |
| Read-only portfolio aggregation | navi-portfolio-agent | `src/portfolioService.js`, `src/defiService.js`, `src/portfolioTokenService.js` | PARTIAL | ADAPT | API_READ_MODEL · FUTURE_AUTOMATION_INDEXER | Provider-abstraction + read aggregation pattern only; reject trading/autonomy and client wallet generation. |

---

## 5. Repo-by-Repo Findings

### `syndicate-os` (target / authority — context only)
- **Contains:** clean pnpm monorepo — `artifacts/studio` (public homepage + Studio OS console),
  `artifacts/api-server` (Express + server-side canon + `verify:canon` integrity guard),
  `lib/*` (API spec, generated hooks, Zod schemas, db scaffold, `os-contracts` posture types),
  SEO route registry, truth-label/posture surfaces, and a `docs/` set (architecture + audits).
- **Role:** the authority. Everything below is measured against its doctrine; nothing is imported.
- **Use:** receive harvested patterns as *specifications* only, posture-gated and founder-approved.

### `TheSyndicate` (HIGH)
- **Contains:** the direct product ancestor on TanStack Start — registry, transparency center,
  protocol-event feed, member cockpit ("My Syndicate"), ranks/recognition ("Proof of Fire"),
  honesty banners, FAQ/glossary, wagmi identity, reserved AI layer, OG/SEO, treasury/tokenomics
  charts, internal "labs" inspection area, and a public no-PII protocol-health API.
- **Valuable patterns:** registry/transparency/event-feed; no-PII health read model; honesty banners;
  member cockpit; recognition surface; defensive "no financial promise / no rewards / not equity,
  debt, or promises of profit" copy (the *emotional* spine to preserve).
- **Unsafe/stale patterns:** hardcoded public contract/treasury addresses and creation-tx references
  in config/registry (canon-gated, never for public docs); `/labs` appears reachable behind `noindex`
  only (treat as unauthenticated-surface risk).
- **Best ideas to adapt:** registry/transparency as the public proof spine; protocol-health as the
  `/status` read model; honesty banners as posture-bound notices.
- **What not to copy:** any address/tx values; the `/labs` access posture; treasury framing that
  could read as financial upside.
- **Recommended Syndicate OS use:** anchor the public proof surface and the read-model/status spine;
  keep member cockpit + recognition as DEFER/REWRITE specs.

### `Supa-Exchange` (HIGH)
- **Contains:** the most complete operator/member platform — route registry, user + admin layouts,
  support/feedback/FAQ + admin ticketing, admin broadcast / notification bubbles / audit / feature
  flags, notification center, missions/badges/leaderboard + XP/badge services, learn modules +
  admin + lesson seeding, ambassadors/referral metrics, thirdweb wallet auth + admin login + roles,
  marketplace cosmetics, analytics/charts, Drizzle schema + object storage — **and** a
  `the-syndicate` canon with a `verify-canon-integrity` guard and `sourceStatus`.
- **Valuable patterns:** the entire support → operator-review pipeline; admin broadcast + audit;
  notification center; role-gated admin; learn module structure; **canon + integrity-guard lineage**
  (proves `syndicate-os`'s `verify:canon` is a continuation, not an invention).
- **Unsafe/stale patterns:** yield surfaces (`Yield.tsx`, `YieldsAdmin.tsx`); "learn & **earn**"
  framing; leaderboard (wealth-ranking risk); swap/DCA trading automation; marketplace cosmetics.
  Note: its own integrity guards already block forbidden financial promise strings — evidence the
  team had begun self-correcting toward the honesty doctrine.
- **Best ideas to adapt:** support/ticketing, broadcast, notifications, audit, roles, learn structure.
- **What not to copy:** yield/earn/leaderboard/trading surfaces; any canon address values.
- **Recommended Syndicate OS use:** primary source for the FUTURE_SUPPORT_SYSTEM and
  PRIVATE_OPERATOR_ADMIN specs; reinforce the SERVER_SIDE_CANON integrity-guard doctrine.

### `entity-chain` (MEDIUM)
- **Contains:** a Web3 ecosystem demo — multi-AI-agent registry (archetypes/roles), DAO/proposal UI,
  block explorer over a blockchain *simulator*, template-driven notification generator, quest engine +
  "beta agent program" narrative, member dashboard/profile, whitepaper/docs pages, Drizzle schema.
- **Valuable patterns:** the agent **registry/orchestration** architecture; the server-side
  **notification generator** (lifecycle templates → UI); the DAO proposal/quorum UI; the quest engine
  structure.
- **Unsafe/stale patterns (heavy):** hardcoded staking APY claims; a "14 passive income streams"
  marketing claim; "expected return"/ROI/"trading master" reward language; a blockchain **simulator**
  presenting precise fake balances/prices as real; public wealth leaderboard ("Top Accounts");
  a plaintext `password` field and an API-keys table in schema; ~30 mock addresses + ~10 example tx
  hashes.
- **Best ideas to adapt:** agent registry + notification generator + DAO UI as *concepts only*.
- **What not to copy:** the simulator, any financial framing, the leaderboard, the schema's
  password/API-key shapes, any address/tx values.
- **Recommended Syndicate OS use:** mine the architecture for FUTURE_AI_WORKER and notification
  read-model design; reject everything financial/simulated.

### `navi-portfolio-agent` (LOW)
- **Contains:** a small CRA app — connect-wallet UI, a portfolio dashboard (ETH balance, tokens,
  DeFi stable/volatile summary), and read services (provider abstraction, balance/price/portfolio,
  DeFi) over ethers + Infura/CoinGecko keys; `walletManager` includes a client-side `generateWallet`.
- **Valuable patterns:** the read-only **provider abstraction + portfolio aggregation** service split.
- **Unsafe/stale patterns:** README framing of an "autonomous" manager that makes "decisions on your
  behalf" (passive holder / active trader / rebalancing); **client-side wallet generation** (against
  Syndicate safety rules).
- **Best ideas to adapt:** the read-aggregation/provider pattern as a future indexer/read-model shape.
- **What not to copy:** autonomy/trading framing; `generateWallet`; any key handling.
- **Recommended Syndicate OS use:** a minor reference for FUTURE_AUTOMATION_INDEXER read shaping only.

### `auditclaw-site` (LOW)
- **Contains:** a single static `index.html` — nav, hero ("verify before you pay"), CTA to external
  paid certs/audits, SEO/OG, a verdict pill row (USE/CAUTION/AVOID, evidence links, provenance +
  confidence, contradiction flags, consistency verdict), a "what we detect" pattern-card grid, an
  offerings list, and a Formspree contact form; plus a draft `PAYMENTS.md` for off-platform USDC flow.
- **Valuable patterns:** the **evidence-first verdict** vocabulary (verdict + provenance + confidence +
  contradiction flags) — the cleanest distillation of Syndicate proof-first honesty; a lightweight,
  email-free contact-form intake concept.
- **Unsafe/stale patterns:** an external commerce/checkout + referral funnel; "buy audit" CTAs;
  reliance on third-party paid endpoints.
- **Best ideas to adapt:** the verdict/provenance/contradiction-flag framing for proof surfaces.
- **What not to copy:** the payments/referral funnel; external paid CTAs.
- **Recommended Syndicate OS use:** language/UX reference for proof verdicts and a no-email support
  intake.

---

## 6. Feature Harvest by Future Surface

### Public Visitor Surface
- **Navigation/layout:** single route-registry source (validated by Supa-Exchange; already adopted),
  `PageShell`/eyebrow nav + breadcrumbs (TheSyndicate) — keep the curated front-door governance.
- **Learning/literacy:** FAQ + glossary + archive literacy as canon-derived content.
- **Proof/registry exploration:** registry + transparency center + protocol-event feed; explorer UX
  *without* simulation.
- **Shareability/SEO:** dynamic OG + sitemap generation (defer to the pre-deploy SEO slice).
- **Onboarding/safe engagement:** evidence-first verdict framing (auditclaw) + honesty banners.

### Authenticated Member Surface
- **Member dashboard:** "My Syndicate" cockpit + progression (DEFER spec).
- **Progress/recognition:** ranks / "Proof of Fire" / milestones — REWRITE to de-financialized,
  contribution/participation-based recognition (never wealth ranking).
- **Notifications:** member inbox + toasts backed by a read model.
- **Support/feedback:** member support intake feeding an operator queue.
- **Wallet/account identity:** privacy-safe proof of membership by ownership; never expose values; no
  client-side key generation.
- **Member-to-admin communication:** structured feedback channel with audit, not email.

### Private Operator/Admin Surface
- **Broadcast center / announcement controls:** operator → member broadcast with role gates + audit.
- **Support/bug triage:** ticket queue with status lifecycle and review states.
- **Member management:** role-gated, audited; minimal PII, privacy-first.
- **Operator cockpit / system-health:** no-PII protocol-health snapshot + registry status.
- **Audit log:** every operator action recorded.
- **Feature flags:** staged rollout (defer until backend exists).

### API / Read Model Layer
- **Notifications, support tickets, recognition progress, learning progress** as read models with
  member-safe aggregates only.
- **Public proof data:** registry/health projections bound to truth labels and posture.
- **Attribution:** "who introduced whom" as proof, not paid commission.

### Future Automation / AI Workers
- **Support assistant / onboarding assistant / protocol-literacy guide:** gateway-backed, scoped to
  literacy + support; no financial advice.
- **Admin triage worker / analytics worker / operator copilot:** built on a worker-registry pattern
  (entity-chain/Supa-Exchange), reading verified data only.

---

## 7. Gamification & Retention Doctrine

**Safe uses (PRESERVE/REWRITE):** learning progress, onboarding completion, contribution and
participation recognition, protocol-literacy milestones, support participation, and history/archive
exploration. Recognition should celebrate *verified contribution and understanding*, surfaced with
truth labels, and must never imply financial benefit.

**Rejected (REJECT):** yield, passive income, APY, ROI, profit promises, speculation/"alpha",
wealth/holdings ranking leaderboards, points-as-currency, seasonal reward pools framed as earnings,
and any casino/gambling mechanic. Prior art (`entity-chain`, `Supa-Exchange`) implements several of
these — they are explicitly out of bounds.

**Rule of thumb:** if a mechanic rewards *learning, contributing, or proving*, adapt it; if it rewards
*depositing, holding, speculating, or ranking by wealth*, reject it.

---

## 8. Support Robot / Help / Bug Submission Direction

A future, email-free support system (sources: Supa-Exchange ticketing, auditclaw contact form):
- **Public help entry:** FAQ/glossary + a structured intake form (no email dependency).
- **Authenticated member support:** member-scoped tickets tied to identity, with status lifecycle.
- **Bug submission:** structured fields (area, expected/actual, context) — never auto-collecting PII.
- **AI-assisted triage:** assistant suggests category/priority/known-answer; humans decide.
- **Operator review queue:** role-gated queue with states (new/triaged/answered/closed).
- **Audit trail:** every operator action logged.
- **Privacy rules:** minimal data, no PII leakage, no public exposure of submissions.

---

## 9. Admin ↔ Member Communication Direction

(Sources: Supa-Exchange admin broadcast/notification bubbles/audit; entity-chain notification
generator; TheSyndicate honesty banners.)
- **Admin broadcast:** operator → member announcements, role-gated, audited, template-driven.
- **Member inbox:** persistent per-member notification history (read model).
- **Notifications:** transient toasts + persistent center; posture/truth-bound where they describe
  protocol state.
- **Popups/banners:** reserved for honesty/system notices (stale build, pending module, activity).
- **Announcement center:** curated, versioned announcements.
- **Member-to-admin feedback:** structured channel (see §8).
- **Role-gated controls + privacy/audit rules:** authenticated, least-privilege, fully logged; no
  public leakage of recipients or content.

---

## 10. Login / Wallet / Identity Direction

(Sources: TheSyndicate wagmi identity; Supa-Exchange thirdweb auth + admin login + roles. **No auth is
implemented in this slice** — spec only.)
- **Member login:** identity tied to verified membership; privacy-first.
- **Wallet optionality:** wallet connect as one identity path; never required to *view* public proof.
- **Privacy-safe wallet proof:** prove membership/ownership without exposing wallet values/addresses.
- **Role gates + admin separation:** distinct operator/admin auth, least privilege.
- **No public PII, no exposed wallet values, no client-side key generation** (hard Syndicate rules).

---

## 11. Blockchain Learning / Protocol Literacy Direction

Translate generic crypto concepts into *Syndicate-specific* literacy (sources: Supa-Exchange learn
modules; entity-chain whitepaper/docs; TheSyndicate glossary):
- **Wallet literacy:** what a wallet proves about membership — without custody or key handling.
- **Transaction literacy:** how to read a verified on-chain event (when a verified source exists).
- **Contract literacy:** what the registry's contracts are and how to verify them.
- **Proof/canon literacy:** how truth labels and postures express what is/ isn't verified.
- **Registry literacy:** how to navigate the registry/transparency surfaces.
- **Source-attribution literacy:** how introductions are recorded as proof, not commission.
- **Treasury/economy literacy:** how protocol economics are described **without** investment framing —
  no profit/yield/return language.

---

## 12. Design / Navigation / Shareability Direction

(Sources: shared shadcn/Radix lineage; TheSyndicate `PageShell`/header/breadcrumbs; Supa-Exchange
route registry + sitemap/OG.)
- **Header/footer/menu:** keep `syndicate-os`'s curated front-door + console split; reference
  `PageShell` for consistent chrome.
- **Public routes:** continue single route-registry source of truth.
- **SEO / OpenGraph / share previews:** adopt dynamic OG + sitemap generation in the pre-deploy SEO
  slice (defer).
- **Mobile navigation:** reference the sidebar/menu patterns for responsive console nav.
- **CTAs:** proof-oriented ("verify"/"explore"), never commerce ("buy"/"earn").
- **Dashboard discoverability + long-session retention:** cockpit + notification center + recognition,
  all posture-gated and de-financialized.

---

## 13. Rejected / Unsafe Patterns

Rejected categories (must never enter Syndicate OS):
- **Financial-return framing:** profit / yield / APY / ROI / passive-income / "expected return"
  claims (`entity-chain` README + staking/notification code; `Supa-Exchange` yield surfaces).
- **Speculation / "alpha":** opportunity-scanner / trading-master framing (`Supa-Exchange` AI handler;
  `entity-chain`).
- **Casino/gambling mechanics:** none adopted; rejected on principle.
- **Fake-live / simulated balances presented as real:** blockchain simulator with precise fake prices
  (`entity-chain` `server/blockchain-simulator.ts`, DAO mock state).
- **Wealth leaderboards:** "Top Accounts" / balance ranking (`entity-chain` Leaderboard;
  `Supa-Exchange` leaderboard).
- **Autonomous trading "on your behalf":** `navi-portfolio-agent` framing.
- **Commerce/checkout + referral funnel:** `auditclaw-site` paid CTAs + referral funnel; off-platform
  USDC payment draft.
- **Client-side key generation:** `navi-portfolio-agent` `walletManager.generateWallet`.
- **Insecure identity shapes:** plaintext `password` field + API-keys table in schema
  (`entity-chain` `shared/schema.ts`).
- **Unauthenticated operator surface:** `TheSyndicate` `/labs` (behind `noindex` only).
- **Stale Cesium-era assumptions:** `cesium` excluded entirely (not inspected).

**Sensitive-looking values — repo / path / category / count only (no values reproduced):**

| Repo | Path (category) | Category | Approx. count |
| --- | --- | --- | --- |
| TheSyndicate | `src/lib/syndicate-config.ts`, `src/routes/registry.tsx` | contract/wallet addresses | ~25 |
| TheSyndicate | `src/lib/syndicate-config.ts` | creation transaction hashes | ~5 |
| Supa-Exchange | `artifacts/api-server/src/canon/the-syndicate/contracts/syndicate-config.ts` | contract addresses | ~15–20 |
| Supa-Exchange | repo root | committed UI screenshots (e.g. admin/login surfaces) | ~6 (PNG) |
| entity-chain | `client/src/lib/agents.ts`, `shared/agentAddresses.ts` | mock 0x addresses | ~30 |
| entity-chain | `server/blockchain-simulator.ts` + UI examples | example transaction hashes | ~10 |
| entity-chain | `shared/schema.ts` | insecure identity shapes (password field, API-keys table) | 2 shapes |
| navi-portfolio-agent | `src/walletManager.js` | client-side key/mnemonic generation reference | 1 |
| navi-portfolio-agent | `.env.example`, `.env.filled.example` | third-party API-key *names* (no values committed) | 2 keys |

No emails, phone numbers, private keys, mnemonics, or live secrets were reproduced; counts above were
derived without printing any value.

---

## 14. Integration Backlog

> All items are **specifications/roadmap** — none authorize implementation here. Each is founder-gated
> and posture-gated. `no-touch` = boundaries that must hold while the item is specced.

| ID | Title | Source repo(s) | Target surface | Action | Priority | Dependencies | No-touch boundaries | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HARVEST-01 | Support Robot / Help & Bug Intake | Supa-Exchange, auditclaw-site | FUTURE_SUPPORT_SYSTEM | ADAPT | P1 | none (spec) | no auth, no backend writes, no email, no PII capture | A written intake→queue spec + read-model shape; no runtime change |
| HARVEST-02 | Admin Broadcast / Member Inbox | Supa-Exchange, entity-chain | PRIVATE_OPERATOR_ADMIN, AUTHENTICATED_MEMBER | ADAPT | P1 | HARVEST-06 (roles), HARVEST-08 | no live send, no PII, role-gated + audited in spec | Broadcast/inbox spec with audit + privacy rules |
| HARVEST-03 | Safe Gamified Onboarding & Recognition | TheSyndicate, Supa-Exchange | FUTURE_LEARNING_SYSTEM, AUTHENTICATED_MEMBER | REWRITE | P2 | HARVEST-09 | no points-as-money, no wealth ranking, no earn framing | De-financialized recognition model spec |
| HARVEST-04 | Blockchain Learning / Protocol Literacy | Supa-Exchange, entity-chain, TheSyndicate | FUTURE_LEARNING_SYSTEM | REWRITE | P2 | none | content canon-derived; no investment framing | Literacy curriculum outline bound to canon |
| HARVEST-05 | Public Header/Footer/Nav/Shareability Upgrade | TheSyndicate, Supa-Exchange | PUBLIC_VISITOR | DEFER | P2 | pre-deploy SEO slice | homepage governance cap respected; no commerce CTAs | Nav/OG/sitemap spec respecting front-door governance |
| HARVEST-06 | Member Login / Wallet Identity Spec | TheSyndicate, Supa-Exchange | AUTHENTICATED_MEMBER | DEFER | P1 | none | no auth code, no client key-gen, no wallet-value exposure | Identity/role/privacy spec (no implementation) |
| HARVEST-07 | Private Admin Operator Console Spec | Supa-Exchange | PRIVATE_OPERATOR_ADMIN | DEFER | P1 | HARVEST-06 | authenticated + audited in spec; no public surface | Operator console + audit-log spec |
| HARVEST-08 | Notification Center (read model) | Supa-Exchange, entity-chain | API_READ_MODEL, AUTHENTICATED_MEMBER | ADAPT | P1 | none | read-only model; no live push; member-safe aggregates | Notification read-model schema spec |
| HARVEST-09 | Dashboard / Data-View Pattern Library | All TS repos | API_READ_MODEL, PRIVATE_OPERATOR_ADMIN | ADAPT | P2 | none | truth-label bound; no simulated data | Catalogued chart/data-view patterns with truth binding |
| HARVEST-10 | AI Operator / Support Worker Direction | entity-chain, Supa-Exchange, TheSyndicate | FUTURE_AI_WORKER | ADAPT | P2 | HARVEST-01 | reads verified data only; no financial advice | Worker-registry + assistant scope spec |
| HARVEST-11 | Registry / Transparency / Event-Feed Spine | TheSyndicate | PUBLIC_VISITOR, API_READ_MODEL | PRESERVE | P0 | none | canon-gated values; no fake-live | Mapping of registry/transparency onto current truth/posture model |
| HARVEST-12 | No-PII Protocol-Health Read Model | TheSyndicate | API_READ_MODEL | ADAPT | P1 | none | no PII; posture-bound; no live writes | Health read-model spec feeding `/status` |
| HARVEST-13 | Source-Attribution-as-Proof | TheSyndicate, Supa-Exchange | API_READ_MODEL, AUTHENTICATED_MEMBER | ADAPT | P3 | HARVEST-06 | no commission/payout framing | Attribution proof spec (no affiliate economics) |
| HARVEST-14 | Canon Integrity-Guard Continuity | Supa-Exchange | SERVER_SIDE_CANON | PRESERVE | P0 | none | no canon value exposure | Documented continuity of `verify:canon` lineage |

---

## 15. Recommended Implementation Sequence

> Live data / indexers / `LIVE_ACTION` are **not** recommended next — evidence is rich but the
> safe path is spec-first. Each slice below is small, founder-gated, and source-boundary-safe.

1. **2.20F — Operator↔Member Communication & Support Intake Spec** (HARVEST-01, -02, -08)
   - *Purpose:* turn the strongest, member-safe prior art (support, broadcast, notifications) into a
     written spec + read-model shapes.
   - *Allowed:* docs + optional type-only contracts in `lib/os-contracts`.
   - *No-touch:* no auth, no backend writes, no UI behavior, no canon values, no packages/lockfile.
   - *Acceptance:* spec merged; `typecheck` + `verify:canon` green; zero runtime change.
2. **2.20G — Registry/Transparency Spine Mapping** (HARVEST-11, -12, -14)
   - *Purpose:* map TheSyndicate's registry/transparency/health onto the current truth/posture model;
     document the canon integrity-guard continuity.
   - *Allowed:* docs (+ optional type-only contracts).
   - *No-touch:* no canon value changes, no live reads.
   - *Acceptance:* mapping doc + `verify:canon` green.
3. **2.20H — Member Identity & Role Spec** (HARVEST-06, -07)
   - *Purpose:* specify privacy-safe identity, roles, and operator separation (no implementation).
   - *Allowed:* docs (+ type-only role/posture contracts).
   - *No-touch:* no auth code, no client key-gen, no wallet-value exposure.
   - *Acceptance:* identity/role spec; gates green.
4. **2.20I — Recognition & Learning Doctrine Spec** (HARVEST-03, -04)
   - *Purpose:* de-financialized recognition + canon-bound literacy curriculum outline.
   - *Allowed:* docs.
   - *No-touch:* no points-as-money, no wealth ranking, no earn framing.
   - *Acceptance:* doctrine spec consistent with §7/§11.
5. **2.20J — Data-View Pattern Library & Notification Read-Model Schema** (HARVEST-09, -08)
   - *Purpose:* catalog truth-bound chart/data-view patterns; define notification read-model schema.
   - *Allowed:* docs (+ type-only schema contracts; optional db schema *draft* not pushed).
   - *No-touch:* no simulated data, no live writes, no `db push`.
   - *Acceptance:* pattern catalog + schema spec; gates green.
6. **2.20K — AI Operator/Support Worker Direction** (HARVEST-10)
   - *Purpose:* worker-registry + assistant scope (literacy/support only) spec.
   - *Allowed:* docs.
   - *No-touch:* no AI runtime, no financial advice scope.
   - *Acceptance:* worker-direction spec.
7. **2.20L — Pre-Deploy SEO / Nav / Shareability** (HARVEST-05)
   - *Purpose:* OG/sitemap/nav upgrade plan honoring homepage governance (sequence before any deploy).
   - *Allowed:* docs (+ implementation only if separately approved).
   - *No-touch:* homepage section cap; no commerce CTAs.
   - *Acceptance:* SEO/nav plan.

(Items HARVEST-13 and any later live-read work remain deferred until a verified source and explicit
approval exist.)

---

## 16. Architect's Readback

- **What kind of bigger OS can this become?** A *proof-first membership operating system*: a public
  transparency/registry front door; an authenticated member surface with honest recognition and
  literacy; a private, audited operator console for broadcast/support/health; a read-model API that
  never lies; and a future, narrowly-scoped AI worker layer for support and literacy — all built on
  the existing truth/posture/canon spine, with live data added last and only when verified.
- **What should be preserved emotionally/product-wise?** The radical-honesty identity: truth labels,
  registry/transparency, recognition for *contribution and understanding*, and the defensive
  "no financial promise" posture that already lives in TheSyndicate's copy. That voice is the brand.
- **What should be rejected legally/safely?** Every investment/financial-return frame, simulated data
  presented as real, wealth ranking, autonomous trading, commerce funnels, client key handling, and
  any unauthenticated privileged surface.
- **What should future Replit/Codex slices keep in mind?** Spec before build; posture-gate everything;
  keep `syndicate-os` the authority; never import prior-art files or values; preserve the
  homepage/front-door governance; and treat the canon integrity guard as a load-bearing inheritance.
- **One-sentence doctrine.** *Harvest the machinery and the honesty, reject the speculation and the
  simulation — continuity without contamination.*

---

## 17. Final Verdict

The visible Duniterum prior art (excluding Cesium) is a rich, safe-to-harvest reservoir of operator,
member, support, recognition, learning, identity, and proof-surface capabilities whose honesty and
canon-integrity lineage directly validate `syndicate-os` — and the right immediate next step is the
spec-only **2.20F — Operator↔Member Communication & Support Intake Specification**, not live data.
