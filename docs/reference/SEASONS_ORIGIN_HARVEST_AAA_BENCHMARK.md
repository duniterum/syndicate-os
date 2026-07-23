# SEASONS — THE ORIGIN HARVEST + THE WORLD-CLASS BENCHMARK (engraved 2026-07-23)

> **Provenance:** founder order 2026-07-23 ("relis/recherche ce qui existe déjà chez Supa —
> ce n'est pas la base, on prend ça, on l'améliore avec les best practices grade AAA").
> An 8-agent pass (wf_6acc1c8f-e07): 4 readers over the origin quarry
> `C:\Users\kemal\OneDrive\Documents\GitHub\Supa-Exchange` (server engine · surfaces ·
> contract · completeness sweep) + 4 web researchers (crypto quest platforms · consumer
> engagement AAA · exchange/fintech reward rails · audited merkle engineering — sources
> fetched and dated 2026-07-23). §0 is the SYNTHESIS — the decisions this arc builds by.
> §1–§8 are the raw agent syntheses, kept whole so no session ever re-searches.
> MIRROR RULE: the origin is a QUARRY, never a LAW. Governed by `SETTLED_RULES` §8
> (the five 2026-07-23 rulings) + `SEASONS_SWAPRAIL_INTEGRATION_STUDY.md`.

---

## §0 — THE SYNTHESIS: what we build (Claude Code decisions, grade-AAA, doctrine-filtered)

### 0.1 The one-truth spine (kills the origin's worst disease)
The origin runs **7 parallel currencies** (Points, XP, Level, Tier, Season XP, Agent XP,
AI XP), XP mirrored in THREE tables, TWO distribution truths (member UI hardcodes one
policy, admin computes another), and a second "global XP" summed from agent counters.
**We build ONE truth:** a single append-only `season_xp_event` ledger on our existing
indexer; season XP, lifetime XP, rank, and axes are ALL projections of that one ledger
(one-authority figure rule). No mirrors, no denormalized copies, no parallel legacy
system. Levels = cumulative, **never drop** (NRC Run Levels model); the season adds a
**rotating seasonal crown** (Strava Local Legend model) for freshness WITHOUT demotion —
Duolingo's league-demotion anxiety engine is REJECTED.

### 0.2 Season = Era, structurally (kills the origin's two-clock confusion)
The origin gates "active season" on a MANUAL admin `status` field + wall-clock windows,
plus a separate funding status — two parallel state fields, cron payouts reading a
DIFFERENT leaderboard than the preview. **Ours:** season state is DERIVED from the chain
(era advancement = `memberCount` crossing `endSeat`, already indexed) — no admin status
field, no dates anywhere (Zealy sprints/our own law: seat thresholds only). One state
machine: `PLANNED → LIVE → SEALED → PUBLISHED`, transitions machine-derived; the ONLY
human clicks in the whole engine: Chronicle-promote (optional) and the funding decision.

### 0.3 Quests: chain-first, feeder-guaranteed (kills the orphan-quest class)
The origin seeded 101 quests over 60 metric keys — with 5 metrics unregistered and 4
never fed: **quests that can never complete** shipped to members. **Structural fix:** a
quest definition may only reference a metric key that EXISTS in the projection registry —
enforced by a BLOCKING guard (the featureStatus/guard-feature-truth pattern applied to
quest metrics). V1 metric classes are chain-first (Layer3's strongest pattern — verify
from chain state/logs, never screenshots): purchase receipt · converted introduction ·
burn · archive mint · LP act · quiz passed (the grid is the validator) · read-model
metrics (login-days class). Quest properties adopt Zealy's composable model: recurrence /
cooldown / claim-limit per quest. The origin's broken lazy reset (a claimed daily never
recycles — `checkNeedsReset` returns false on null) is NOT imported: resets are computed
from Protocol Time in the projection, stateless, with an immutable event trail (the
origin nulls history on reset — rejected).

### 0.4 XP credits itself; celebrations are split in two cadences
Zero-operator (ruling ④): every V1 XP source is provable or self-verifying; anti-abuse =
seat/SIWE + per-source caps + unique-credit constraints, never a review queue.
Celebrations adopt Duolingo's 2023 split — **Personal Records** (frequent small wins:
quest done, level up) vs **Awards** (long-arc: season sealed, milestone) — riding OUR
existing machinery: notification center + painted share cards (M-EVO-3's pipeline) whose
figures are **chain-verifiable** — the differentiator no consumer app has. Recap/share
cards stay FREE forever (Strava's 2025 paywall = named anti-pattern).

### 0.5 The ranking page: full ladder visible, zones drawn, money shown
Battle-pass law: the ENTIRE ladder is visible up front. Zealy's 2026 tiered payouts are
the model: **rank bands, identical reward within a band, the zones drawn ON the
leaderboard** — predictable and contestable. Per ruling ② the per-member merit share
renders on the public ranking. Dual time-scope (Zealy): season rank AND all-time
standing shown together. Own-row pinned ("YOU"). Pseudonymous (seat + short address →
opt-in alias). The origin's fake-social-proof class (hardcoded "Recent Referral
Activity" mock, arithmetic-hack stats) is the exact class our guards already kill.

### 0.6 The money rail: auto-credit merit, no forfeiture, on-chain receipts
Fintech field verdicts applied: **auto-credit** (Kraken/Coinbase/Revolut) beats claim
rituals — merit lands in the wallet; Binance's expiring-voucher breakage engine is
REJECTED (no manufactured forfeiture; any escrow deadline + sweep destination published
UPFRONT or not at all). Robinhood's deposit-gate-before-earning = purchase-proportional =
REJECTED. Eligibility/discretion/tax lines stated in plain words on the bounty surface
(the lawyer pass at activation, as planned). **Our beat over every exchange:** their
reward history is a custodial "trust-me" tab; every bounty of ours is an on-chain USDC
transfer with tx anchor, amount, round, and reason — permanent, refutable, public.

### 0.7 The contract: SeasonBountyPool, hardened PAST the advisor spec
The origin contract's good bones are kept (CEI, nonReentrant, custom errors,
permissionless `fund()`, `verifyClaim` dry-run view). Its faults are named and fixed:
global `hasClaimed` lockout (a Season-1 claimant is locked out forever) · owner can
rotate the root anytime · `emergencyWithdraw` drains 100% anytime (rug vector) · no
pausability · deadline only in the DB. **Upgrades decided (AAA, from the audited state
of the art):**
- **Leaf = OZ standard double-hash `abi.encode`, domain-tagged:**
  `(chainId, address(this), roundId, account, amount)` — second-preimage safety BY
  CONSTRUCTION (not by accidental leaf width) + cross-round AND cross-deployment replay
  killed structurally. This SUPERSEDES the advisor's single-hash packed spec — the
  tooling (`season-merkle` v2) moves to OZ `StandardMerkleTree` with a **differential
  fixture checked into the repo** (a JSON tree the contract test must verify — the
  origin's tooling/contract-mismatch bug class dead forever).
- **Per-round roots, immutable once set** (`openRound` reverts on overwrite — even by
  owner); rounds isolated; the Merkl/Morpho cumulative-tree pattern is the documented
  scale path if cadence ever becomes high-frequency.
- **`claim(roundId, …)` + `claimFor`** (anyone may execute a member's claim — the URD
  pattern): push UX (member pays no gas, we can batch-execute) on pull rails, zero
  custody risk, escrow publicly verifiable.
- **`Ownable2Step` + timelocked root path · pause on `claim` only · rescue SCOPED**
  (only after a published deadline / only non-USDC) — the origin's drain-anytime owner
  power does not survive.
- **Foundry care protocol (ruling ①):** Murky-built trees inside fuzz tests ·
  invariants (conservation: escrow + Σpaid == Σfunded; paid ≤ tree amounts; claimed
  monotone) · proof-forgery fuzzing · the differential fixture · fork dry-run of every
  leaf via `verifyClaim` before any root · full Fuji round (fund → root → claim →
  sweep) → founder-signed mainnet deploy.

### 0.8 Admin: the origin's best patterns on our 2-rail console
Adopt from the origin's console (its genuinely excellent craft): the **next-step
engine** (every season row says what's next, prioritized) · **dry-run before anything
irreversible** (payout preview with tier breakdown) · **guarded toggles that name the
missing prerequisite** · destructive confirms that LIST the affected rows + criteria ·
status tooltips (meaning/source/next action) · airdrop-readiness checks against the
chain · reconciliation with anomaly classes · anti-stress copy ("You can close this
page — your status is saved on-chain"). Rejected from the origin: the two-truth
distribution policies, placeholder tabs, `document.getElementById` forms, the
7-currency explainer maze. One rail = recognition (auto), one rail = bounty
(founder-gated) — visually and architecturally separate.

### 0.9 What is REJECTED outright (the adversarial filter, consolidated)
Raffles / mystery boxes / lootboxes (gambling) · stake-for-multiplied-rewards
(pay-to-win) · paid streak repairs + daily-streak guilt pressure (loss-aversion
machinery; if streaks ship, they are WEEKLY, NRC-style) · league demotion · expiring
vouchers/points · deposit-gates before earning · rewards into locked products ·
FCFS scarcity quotas as urgency (an honest budget cap shown openly is fine) ·
opaque bot-detection skewing outcomes · "unlock future airdrop" deferred promises ·
XP→cash conversion (the origin's core design — filtered at the door by doctrine) ·
points shops / fee discounts / XP boosts (cash-convertible recognition class) ·
fake social proof / simulated payouts (the origin wrote fake txHashes marked
"completed" — the exact class our REAL-ROW law kills).

### 0.10 What this changes in the slice plan (S1–S3 refined)
- **S1 (data foundation)** now specifies: `season` projection (derived, no status
  column of authority) · `season_xp_event` single ledger · quest registry with
  guard-pinned metric feeders + the four quest classes (§0.11) · rank/axes/crown
  projections · Protocol-Time resets.
- **S2 (surfaces)** inherits: full-ladder ranking with drawn reward zones + dual
  time-scope + YOU row · member Season card + Quests strip (recognition) + separated
  effort-reward card · admin 2-rail console with next-step engine + dry-run.
- **S3 (contract + cash rail)** builds the §0.7 contract AS THE GENERIC PRIMITIVE
  (§0.12-②) + `season-merkle` v2 (OZ StandardMerkleTree, domain-tagged) + the §0.6
  rail (auto-credit via claimFor batches, published-upfront escrow rules). Lawyer
  pass at activation, as planned.

### 0.11 THE ENDLESS-ENGAGEMENT ARCHITECTURE (founder question 2026-07-23:
"si les quêtes finissent, après ils font quoi les membres — sur 9 ères?")
A fixed quest list ALWAYS exhausts (the origin's 101-quest checklist; every dead Zealy
board). The answer is structural: quests are never the engine — the engine is FOUR
GENERATORS that cannot run dry, plus a starter track that is DESIGNED to finish:
- **G1 — RECURRENTS (rhythm):** daily/weekly/monthly-class quests reset forever by
  Protocol Time (Zealy recurrence; NRC's weekly-not-daily ethics). Never exhausts by
  construction.
- **G2 — LADDERS (depth):** cumulative tiered ladders with the milestone constitution's
  density curve — dense early rungs, legendary far rungs (introductions 1→3→10→25→100→
  300-Summit; verification acts; patronage rungs; burn acts; the seat ladder to the
  1M FINAL SEAT). A ladder with a rare summit never finishes — it aspires (GitHub/NRC
  model, already our engraved milestone law).
- **G3 — ERA/SEASON RENEWAL (freshness):** every era transition auto-seals the season
  and opens the next — new seasonal crown, fresh seasonal rank over the permanent base,
  new bounty rounds at seat thresholds INSIDE each era. 9 eras = 9 built-in expansions;
  after era 9 the infinite season clock continues on its own cadence (canon §3.5) —
  and each era's quest set can derive from its chapter narrative.
- **G4 — MODULE FAMILIES (growth):** THE FAMILY LAW, extended from milestones to
  quests/XP: **every future module (Alias, SwapRail, Archive drops, Marketplace,
  Learn&Earn packs, /staff…) ships WITH its quest + XP-metric + milestone family in
  the same slice** — same invariant class as heartbeat completeness. New income
  streams = new act classes = new XP sources = new quests, automatically. The catalog
  is generative, not a list.
Above all four: the SOCIAL layer (ranking vs others, bands, crowns, bounty rounds) and
the CORE ACTS (introduce · verify · collect · burn — the business itself) are unbounded.
The one-shot Starter Track is the ONLY part meant to complete — completion there IS the
onboarding goal. S1 bakes the quest classes accordingly: `starter` (one-time) ·
`recurrent` (Protocol-Time reset) · `ladder` (cumulative tiers) · `era-scoped`
(auto-reopens per era).

### 0.12 THE EVOLUTIVE CONTRACT DOCTRINE (founder question 2026-07-23: "plein
d'income streams et XP possibles in future — comment tu résous ça?")
**Evolution by ACCRETION, never by mutation.** Five pillars:
- **① XP/recognition is OFF-CHAIN** (non-transferable, no cash value — settled): it
  evolves infinitely with ZERO contract work. New XP sources are registry rows +
  projections, never deploys. (Optional tamper-evidence: commit a merkle root of the
  sealed season state — one tx, reuses the same tree tooling.)
- **② ONE GENERIC MERIT-PAYMENT PRIMITIVE:** the S3 contract is designed as a
  general distributor, not a season-only pool — a round is `(roundId, root, budget)`
  with a metadata event (kind + published reward-file URI, Merkl transparency
  pattern). Season bounty rounds, future recognition campaigns, press bounties —
  ALL ride the same audited primitive forever. New programs = new rounds, never new
  contracts. (Name at build; "season bounty pool" remains the human label for the
  season rail.)
- **③ INBOUND INCOME STREAMS NEED NO CONTRACT:** fees/patronage/services route to
  NAMED pipe addresses (Visibility Law; the AW-5 pattern) — each new stream joins
  the address book + heartbeat scan targets in its introducing slice (engraved
  invariant). The evolutive machinery for income is the REGISTRY, not Solidity.
- **④ NEW CAPABILITIES = NEW SMALL IMMUTABLE MODULES,** registered in the contract
  registry with two-step wiring — the deployed Sale V3 already exposes exactly this
  attachment point (`commissionRouter()` + pending/accept two-step): the base was
  BUILT for accretion. Old modules stay immutable and readable forever (Uniswap
  V2/V3 coexistence model). Audit per module at the pro-firm horizon, as engraved.
- **⑤ NO UPGRADEABLE PROXIES ON MONEY PATHS — permanent.** A mutable money contract
  contradicts the protocol's core promise ("written on-chain, forever") and re-opens
  the rug-vector class the 0.7 hardening just closed. Immutability is the product.

---

## §1 — ORIGIN: THE SERVER ENGINE (agent synthesis, verbatim)

_See the agent report below — data model (~29 gamification tables + 9 agent-cosmetic),
the two-field season lifecycle, the XP engine (3 mirrored copies, level formula
`floor(totalXp/1000)+1`, 9 tiers Rookie→Astronaut), the quest engine (101 seeded quests,
60 metric keys, the orphan classes), badges/leaderboard, hooks, and the 9 traps._

# SERVER ENGINE — Supa-Exchange origin inventory (quarry, not law)

## 1) Data model (shared/schema.ts) — ~29 gamification tables (+9 agent-cosmetic)
Core: `user_progress` (points, xp, level — L106), `tiers` (minXp/maxXp/rankOrder — L1063), `xp_events` (type/sourceId/amount, can be negative — L1076), `quests` (slug/category/difficulty/baseXp/bonusXp/type/targetValue/metric — L1087), `user_quest_progress` (progressValue/status/lastResetAt — L1107), `badges` (conditionType/conditionValue/xpReward + agentId/agentXpReward — L1120), `user_badges`, `quest_reset_config` (dailyResetHourUtc=0, weeklyResetDayUtc=1 — L1146). Seasons: `seasons` (41 columns: status + fundingStatus, plannedRewardPoolUsd, fundedRewardPoolUsdc, merkleRoot/merkleSnapshot/claimDeadline, rollover* — L639), `season_xp` (xp, levelInSeason, rankSnapshot — L694), `season_claims`, `season_rewards`, `season_payouts` (merkleProof array, leafHash — L720), `trade_revenue_events` (feeBps=15 — L742), `payout_batches`, `reward_payouts`, `tax_reports`. Agent XP: `user_agent_xp` (7 integer columns, one per agent — L3030), `agent_xp_events` (L3056). Legacy parallel system: missions/userMissions/rewards/userRewards/referrals/referralConfigs/leaderboardSnapshots/learnModules/learnQuizzes/learnCompletions.

## 2) Season lifecycle — TWO parallel state fields (trap)
`status` (upcoming/active/completed, manual admin PATCH) AND `fundingStatus` PLANNED→FUNDING→ACTIVE→SETTLING→CLOSED/CANCELLED. `getActiveSeason` needs status="active" + date window (seasonService.ts:10). Auto: cron `/internal/tasks/close-expired-seasons-and-prepare-payouts` (routes.ts:14841) flips ended seasons to SETTLING and prepares proportional payouts — but from the GLOBAL lifetime-XP leaderboard, not season XP (routes.ts:14875) — a one-authority violation. Manual: refresh-balance (on-chain USDC → fundingStatus, :11106), generate-merkle (:11212 — calls the DEPRECATED throwing function; dead endpoint fossil), payout-preview (:9968, AAA policy: Top 200, G1 ranks 1-10=30%, G2 11-50=30%, G3 51-200=40%, XP-proportional within group, rounding clamp), rollover-unclaimed (:10415, 4 hard gates incl. rolloverExecutedAt null). Claims: Merkle (thirdweb Airdrop v2 spec, keccak256 packed leaf, sortPairs — seasonDistributionService.ts:1-51), 90-day claimDeadline, snapshot frozen in DB.

## 3) XP engine
`grantXp` (xpService.ts:78): insert xp_event (source of truth) → mirror to userProgress.xp AND users.xp (THREE copies) → tier check → tier badge → notifications → season XP if active season. Formula (xpService.ts:22): `Math.floor(totalXp/1000)+1`, no cap. Tiers ≠ levels: 9 seeded tiers Rookie 0 → Astronaut 1,000,000 (gamification-seed.ts:8-18). Season XP mirrors every grant while a season is active; same level formula; `snapshotSeasonRanks` writes rankSnapshot row-by-row at season end (seasonService.ts:125). Agent XP = 7 per-agent integer counters per user (dca/tax/alpha/guardian/assistant/technician/trader), own event log, own 10-level threshold table (0,100,250,500,1000,2000,3500,5500,8000,12000 — schema:3076); its "globalXp" = sum of the 7 — a SECOND global-XP notion, distinct from xp_events total (trap). Per-action amounts in agentXpService.ts:25 (e.g. assistant chat=2, trade_executed=10).

## 4) Quest engine
101 seeded quests (recounted), 118 slugs incl. 17 badges. Types: one_time/daily/weekly (+`repeatable` declared, unused). Categories seeded: getting_started, trading, learning, social, portfolio, streak, agents, dca, automation, marketplace, core, learn, referral (13). `QuestMetric` union = 60 keys (schema:2061-2085): 11 base + 18 legacy slug-style + 6 ai_tasks_* + 8 dca/automation + 4 trading + 7 marketplace + 3 core + 2 social + referrals_season. Feeders in questMetrics/*: trading (swaps, swap_volume_usd, bridges, bridge_networks_used, buys, trading_mix_combo, 6 marketplace), dca (dca_executions/_days/_active_plans/_no_cancellations/_pairs_used, automation_executions/_strategies_created, strategy_operator_combo), ai (ai_tasks_total + 5 per-agent), core/social (profile_complete, login_days, season_end_activity, social_profile_linked, feedback_submitted, referrals_season). ORPHANS: seed uses 5 metrics NOT in the union (quests_completed, badges_earned, ai_tasks_multi_core_agents ×3) and daily_streak/social_shares/watchlist_tokens/portfolio_protocols have NO feeder — those quests can never complete. Claim flow: completed→claim→grantXp(baseXp+bonusXp)→agent XP if agent-linked (slug-prefix heuristic, questService.ts:14)→quest badge→quest-count badges. No XP caps anywhere.

## 5) Badges/leaderboard
17 seeded badges (14 + 3 agent onboarding); BadgeConditionType union = 7 but seed/service use 12+ (agent_enabled, dca_plan, ai_task_complete, dca_executions, ai_tasks_* are unregistered strings). Global leaderboard (xpService.ts:276): groups ALL users in SQL then sorts in JS — no tie-breaking, no pagination. Season leaderboard: `orderBy desc(xp)` — ties arbitrary.

## 6) Hooks
grantXp callers (routes.ts): swap 25/bridge 50 on quote execution (:721), welcome_bonus 50 (:1028), mission_claim, referral activation (referrer 500/referred 100, config-driven, activation-gated :3853), buy 75, thirdweb swap/bridge/buy, yield_deposit 50/yield_withdraw 30, DCA automation_execute 25, lesson_complete, admin_grant/admin_deduct (floor check), feedback. Notifications on every grant + tier/level/badge/mission + claim reminders. Streak/daily-reward service: NOT FOUND.

## 7) TRAPS — do not import
① Daily/weekly reset is lazy AND broken: `checkNeedsReset` returns false when lastResetAt is null (questService.ts:301) — a claimed daily never recycles; only manual admin force-reset endpoints exist (routes.ts:12650), no cron. ② Payout batch writes FAKE txHash `0x${Date.now()}...` marked "completed" (routes.ts:~15000) — simulated money. ③ Cron payouts use global XP, preview uses season XP — two authorities for one figure. ④ generate-merkle endpoint wired to a function that throws. ⑤ Triple-mirrored XP (xp_events/user_progress/users) + second "global XP" from agent sum. ⑥ XP→USDC is the design (30% revenue share, XP-proportional) — gain-promise surface to filter through our red lines. ⑦ Orphan metrics/quests (5 unregistered + 4 unfed). ⑧ Mutable quest history: resets null completedAt/claimedAt — no immutable trail. ⑨ Manual admin `status` field gates getActiveSeason — wall-clock dates alone don't activate.


---

## §2 — ORIGIN: THE SURFACES, MEMBER + ADMIN (agent synthesis, verbatim)

# SUPA-EXCHANGE SURFACES INVENTORY (member + admin)

## 1) MEMBER SURFACES — 6 pages + 5 components
- **Seasons** (`client/src/pages/Seasons.tsx`, 1155L) — 10 sections: hero (status pill 4 variants + countdown), status-explainer card per state, reward-pool card distinguishing **funded (Live, "$X locked on-chain") vs planned ("Up to $X")** with "View on-chain proof" button (L526-567), Your Progress 3-stat (XP/rank/estimated reward), How-to-Earn 4 tiles, claim area with **6 states** (check→eligible summary→claim→success/not-eligible/disconnected/closed), 3-item FAQ, season leaderboard (Rank/User/Season XP/Est. Reward, own-row highlight + "You" badge), reward-distribution card (20%/15%/5%/0.5% for top 1/2-3/4-10/11-50), past-seasons archive cards.
- **Leaderboard** (`Leaderboard.tsx`, 604L) — referral hub ON TOP (link card + copy/X/Telegram/WhatsApp, 3-step how-it-works, 4 stat cards), then global table: **6 columns** (Rank/Wallet/Lifetime Points/Level/Swaps/Volume), RankBadge crown-gold/medal-silver/medal-bronze (L42-69), avatar, own-row `bg-primary/10`.
- **Missions** (`Missions.tsx`, 1764L) — quest board: season reward block, 4 earning-path cards, **sticky OverviewRail** (SVG progress ring, tier, points balance, pulsing "N Ready!" claimable alert, live daily/weekly reset countdowns, 4 quick links), **PriorityQuestsSection** (claimable first, then Starter Track with completion card), 5 tabs (All/Daily/Weekly/Achievements/Badges), QuestCard: difficulty badge (3), floating DAILY/WEEKLY badge, progress bar, RewardBar (global XP + per-agent XP), **10 metric→CTA deep-links** (L187-201), 9-tier ladder Rookie→Astronaut with Current/Next markers.
- **Badges** (`Badges.tsx`, 578L) — **4 rarities by XP** (Common/Rare/Epic/Legendary ≥500), 9 agent filter pills, ~10 condition types with human descriptions (L210-233), earned/locked tabs + dynamic category tabs, 4 stat cards; browsable while disconnected.
- **SeasonClaim** (`SeasonClaim.tsx`, 536L) — dedicated claim page, 7 states (connect/no-rewards/deadline-passed/processing/already-claimed/success/failed).
- **SeasonSummary** (`SeasonSummary.tsx`, 275L) — public archive: 4 stats (winners/total paid/participants/total XP) + top-winners table.
- **Components**: `SeasonHighlightBubble.tsx` (floating promo: pool, participants, progress bar, 7-day localStorage dismissal, 60s refetch); `ClaimBanner.tsx` (cross-page, **urgency escalation**: gift→amber clock ≤7d→red alert ≤1d, "You have X USDC to claim · N days left"); `badges/BadgeCelebrationModal+Provider.tsx` (**notification-driven** 30s poll, queue, skips initial-load flood, last-100 seen in localStorage, spring animation, dual global+agent XP); `seasons/SeasonStatusBadges.tsx` (shared badge vocabulary + FUNDING_STATUS_INFO meaning/source/nextAction tooltips); `Rewards.tsx` (915L: points-vs-XP-vs-level-vs-tier tooltips, XP history, season-claims history, marketplace).

## 2) ADMIN CONSOLE — ~34 actions
**AdminSeasons.tsx** (1652L), 10 actions: create; edit dialog (6-state funding select, planned pool, revenue-share %, contract addr, **7 explorer presets**, leaderboard metric ×3, archive toggle, audit txHash field **locked until explicit Edit click**); refresh on-chain balance; Run Season Closing (confirm lists affected seasons + criteria); Run Payouts (**destructive confirm**, "irreversible" alert); Generate Merkle (archived-disabled); toggle Claims (**guarded**: merkle+pool+contract, tooltip names missing prereqs); airdrop CSV; explorer link; lifecycle modal. **Next-step engine** `getNextStepForSeason` (L115-153): 6 rules, high/med/low priorities, rendered as table column. State machine = 3 orthogonal axes: time (Upcoming/Live/Ended, auto) × funding (PLANNED→FUNDING→ACTIVE→SETTLING→CLOSED, +CANCELLED) × claims (merkle/isClaimOpen).
**AdminSeasonDetails.tsx** (2741L), **7 tabs**: Basics · Revenue (add event, edit manual pool, CSV export) · Distribution (**Dry-Run payout preview**: Top-200 "AAA Reward Policy", tier breakdown Top10/11-50/51-200 %, entries table w/ share%, "No wallet" flags; Merkle snapshot w/ confirm) · On-chain (**PLACEHOLDER**) · Claims (overview snapshot/claimed/unclaimed; **Airdrop Readiness** 3 on-chain checks → nextAction SET_ROOT/FUND_USDC/READY; unclaimed **rollover** to next season, guarded by deadline; on-chain reconciliation inserting missed claims) · Reconcile (report, 3 exports, **4 anomaly classes**: Failed Claims/Missing TxHash/Outside Window/Duplicates, L2299-2439) · Audit (**PLACEHOLDER**).
**AdminGamification.tsx** — 5 tabs (overview/tiers/quests/badges/users), 12 mutations: CRUD ×3 for tiers/quests/badges, force-reset daily+weekly, refresh leaderboard.

## 3) PATTERNS WORTH KEEPING
Funded-vs-planned pool honesty + proof link; anti-stress copy "You can close this page. Your claim status is saved on-chain" (repeated 5×); next-step column; every dangerous action confirms with the affected list + criteria shown; guarded toggles explaining what's missing; dry-run before irreversible; claimable-first page ordering; deadline urgency banner; celebration queue; status tooltips (meaning/source/next); empty states with CTA ("Be the first…").

## 4) WHAT THEIR UI DID BADLY
- **7 currencies** (Points, XP, Level, Tier, Season XP, Agent XP, AI XP) — needed FAQ+tooltips+cross-link cards everywhere just to explain itself; recognition and cash live on the same screens.
- **Two distribution truths**: member UI hardcodes top-50 20/15/5/0.5% (Seasons.tsx L390-395, computed client-side twice) while admin policy is Top-200 3-tier — divergent est. rewards.
- **Fake social proof**: Leaderboard "Recent Referral Activity" is hardcoded mock data (L87-136); "Active Referrals" stat is an arithmetic hack (L335-337).
- Claim friction: per-quest claim clicks; `onClaimAll` prop exists but never wired.
- Referral UI duplicated 3× (Leaderboard hub, Missions ReferralCard + ReferralSection).
- Admin edit form reads `document.getElementById` (no form state, L330-370); 2 of 7 detail tabs are placeholders; `displayName.charAt(5)` avatar hack.
- Status machine so complex it ships a lifecycle modal + explainer accordions on both admin pages.

## 5) DESIGN INTENT DOCS
`design_guidelines.md` (224L): glassmorphism/neon system, Jumper/Uniswap/Phantom/Linear refs; Rewards page spec'd as "Coming Soon teaser" — far outgrown. `replit.md` (74L): claims 40+ user pages, 35+ admin pages, 86 DB tables; ambitions listed but thin in UI: skins/skills payment integration (TODO), rewards marketplace, AI XP soft-monetization tiers. NOT FOUND: no streak-specific UI (only a `daily_streak` quest metric + "streak" category label), no docs/ dossier on seasons (docs/ has only super-aggregator.md), no level-up (non-badge) celebration moment.


---

## §3 — ORIGIN: CONTRACT + DISTRIBUTION (agent synthesis, verbatim)

# CONTRACT + DISTRIBUTION — origin inventory (Supa-Exchange)

## 1) THE CONTRACT — `contracts/SeasonRewardsPool.sol` (221 lines, ^0.8.20, OZ Ownable+ReentrancyGuard+MerkleProof)
**Storage (3):** `address public immutable usdc` (L42) · `bytes32 public merkleRoot` (L45) · `mapping(address=>bool) public hasClaimed` (L48).
**Functions (7):** `constructor(address _usdc) Ownable(msg.sender)` (L95, zero-check) · `setMerkleRoot(bytes32) onlyOwner` (L113 — unrestricted overwrite, anytime) · `fund(uint256) nonReentrant` (L129, permissionless, transferFrom) · `claim(uint256 amount, bytes32[] calldata proof) nonReentrant` (L154) · `poolBalance() view` (L182) · `verifyClaim(address,uint256,bytes32[]) view` (L193, dry-run mirror of claim) · `emergencyWithdraw(address,uint256) onlyOwner nonReentrant` (L214 — owner can drain 100% anytime).
**Events (3):** MerkleRootUpdated, Funded, Claimed. **Errors (7):** InvalidUSDCAddress, ZeroFundAmount, ZeroClaimAmount, MerkleRootNotSet, AlreadyClaimed, InvalidMerkleProof, TransferFailed.
**Leaf/verify:** `keccak256(abi.encodePacked(msg.sender, amount))` (L160) → `MerkleProof.verify(proof, merkleRoot, leaf)` (L163). Claimant IS msg.sender — no receiver param.
**Posture:** CEI correct (`hasClaimed=true` L167 BEFORE transfer L170); nonReentrant on all movers; bool-checked raw IERC20 (not SafeERC20 — fine for USDC only); NO pausability; NO on-chain claim deadline (deadline is DB-only); owner powers = rotate root + drain.

## 2) hasClaimed GLOBAL LOCKOUT — the exact code
L48 `mapping(address => bool) public hasClaimed;` · L156 `if (hasClaimed[msg.sender]) revert AlreadyClaimed();` · L167 `hasClaimed[msg.sender] = true;`. Per-CONTRACT, not per-root: a Season-1 claimant is locked out of Season 2 forever on the same deployment. Header L24–30 admits it, offering new-contract-per-season / resetClaims / seasonId-in-leaf.

## 3) MERKLE TOOLING
- `test-merkle.mts` (35 lines, viem): single-leaf root=leaf, proof=[] — **the FAILED config: uses `encodeAbiParameters` = abi.encode (64 bytes, address left-padded)** while both SeasonRewardsPool L160 and thirdweb Airdrop expect `abi.encodePacked` (52 bytes). Targets distributor 0x9E202D189aB3092f4f550c47395F9AA6293E5630, chain 43114.
- Fixed version: `server/routes.ts` POST /api/admin/seasons/merkle-test (~L11250–11334) uses viem `encodePacked`; notes token is NOT in the leaf (per-token root lookup). Its header comment (~L11243) is stale — still says abi.encode. Companion merkle-selftest (~L11354+): 2-recipient tree, local verify + on-chain root comparison.
- Canonical spec: `server/services/seasonDistributionService.ts` (358 lines) — leaf = keccak(20-byte addr ‖ 32-byte uint) via js-sha3/Buffer.concat (L94–109); merkletreejs `{sortPairs:true}`, pre-hashed leaves (L159); USDC 6 decimals; 4 deprecated throw-only fns vs 3 active; rebuilds tree from `seasons.merkleSnapshot` JSONB and re-verifies computed==stored root (L262–272).
- Schema: `shared/schema.ts` L652/661–666/726 — payoutContractAddress, merkleRoot, merkleGeneratedAt, claimDeadline (+90d), merkleSnapshot, and `seasonPayouts.merkleProof[]` (stored proofs; "Merkle Guardian" endpoint routes.ts L9096 serves stored proofs only). `scripts/` has NO merkle scripts (i18n+seeds); `script/build.ts` = app bundler.

## 4) TESTS
Solidity tests: **NOT FOUND** — no foundry.toml, no hardhat config, no forge/hardhat deps; the .sol was never compiled in-repo. `tests/season-rank.test.ts` = 10 hand-rolled leaderboard-rank tests (not merkle). `server/dev/claimProof.ts` = 2 DB-level claim-safety proofs (SUCCESS never→EXPIRED; unique (seasonId,wallet) 23505 blocks double insert). Fuzz/invariant: NOT FOUND.

## 5) SeasonBountyPool EVOLUTION — minimal diff, good bones kept
Replace L45/L48 with `mapping(uint256=>bytes32) merkleRootOf` + `mapping(uint256=>mapping(address=>bool)) claimed`; leaf = `keccak256(abi.encodePacked(roundId, msg.sender, amount))`; add `openRound(roundId, root) onlyOwner` that REVERTS if merkleRootOf[roundId]!=0 (root immutable once set); `claim(roundId, amount, proof)` / `verifyClaim(roundId,...)` with per-round zero-root guard. Keep: immutable usdc, CEI, nonReentrant, custom errors, fund(), poolBalance.
**Foundry suite must cover:** (a) root rotation — overwrite of an opened round reverts, even by owner; (b) round replay — a valid round-N proof rejected on round-M (roundId in leaf); (c) cross-round leaf collision — fixed-width packed 32+20+32=84 bytes leaves no ambiguity, but fuzz field boundaries + assert leaf-preimage length ≠ 64 bytes (internal-node second-preimage separation under sortPairs); (d) double-claim per round + SAME account claims independently across rounds (the lockout bug's regression test); (e) claim on unopened round reverts; (f) insolvency across concurrent open rounds (sum of roots > balance — define behavior); (g) emergencyWithdraw during an open round; (h) zero amount/root guards.

## 6) DEPLOY STORY
SeasonRewardsPool itself: **never deployed from this repo** (no deploy script, no toolchain). Production used the pre-built **thirdweb Airdrop v2.0.2** at 0x9E202D…5630 on Avalanche (43114), verified on Snowtrace, USDC 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E, per-token roots via `claimERC20(token, receiver, quantity, proofs)` (service header L7–37). Distributor config = admin site settings (routes.ts L2500–2506) + per-season `payoutContractAddress`. Reusable: thirdweb-format CSV export (routes.ts L9861–9902), stored-proof serving, snapshot-rebuild-verify, self-test-vs-on-chain-root endpoint.


---

## §4 — ORIGIN: THE COMPLETENESS SWEEP — 18 CLASSES (agent synthesis, verbatim)

# Supa-Exchange gamification completeness sweep (origin quarry)

## 1) FULL CLASS LIST — 18 distinct classes, ~41 gamification tables (of ~89 in shared/schema.ts)
1. **XP + levels (dual)**: `xpEvents` ledger (schema.ts:1076, can be negative), global level = floor(xp/1000)+1 (server/services/xpService.ts:22), denormalized `users.xp/level` (schema.ts:59).
2. **Tiers**: 9 named tiers Rookie→Astronaut with icon/color/minXp (server/seeds/gamification-seed.ts:8-18), separate from levels.
3. **Quest engine**: 101 seeded quests, 45 distinct metrics, types one_time/daily/weekly/repeatable, categories incl. agents/dca/automation/marketplace/core/referral (seed:21-186); metric-driven `updateQuestProgress` + claim flow + UTC daily/weekly resets (`questResetConfig`, questService.ts:114,178,299,407). 4 domain metric-feeder services under server/services/questMetrics/ (ai, coreSocialReferral, dcaAutomation, tradingMarketplace).
4. **Badges**: 17 seeded, 8+ condition types (complete_quest, reach_tier, swap_count, volume, referral_count, quest_count, agent_enabled, ai_task_complete); badges grant XP **and agent XP** (schema.ts:1130-1131, A5.2).
5. **Missions (legacy parallel system)**: `missions`/`userMissions` with jsonb requirement (schema.ts:273) — coexists with quests.
6. **Streaks**: 4 streak quests on `daily_streak` metric + `streak_milestone` notification (notificationService.ts:365) — **no server feeder computes streaks (half-built)**; `login_days` = distinct-active-days IS fed (routes.ts:1038).
7. **Learn & Earn**: 100 lessons / 10 categories, quiz per lesson (see §2).
8. **Referral XP**: `referrals` (one-referral-per-user, pending→active) + `referralConfigs` (referrer 200/200, referee 100/100, activation minVolumeUSD:100) (schema.ts:349,629).
9. **Agent/AI XP**: per-agent XP for 7 agents, 18 event types, 10 level thresholds (schema.ts:3005-3097), `agentXpEvents` ledger.
10. **Cosmetics/collectibles**: `agentSkins`/`agentSkills` (rarity, xpRequired, priceUsdPlaceholder), `agentCosmetics` + owned/equipped tables (sourceType: badge/quest/marketplace/season), `agentBrainSkills` gated by agent level/global level/badge/quest/subscription with `expiresAt` (schema.ts:2909-3300).
11. **Seasons**: full lifecycle PLANNED→FUNDING→ACTIVE→SETTLING→CLOSED, per-season XP+level, merkle payouts, 90-day claim deadline, unclaimed rollover, 30% revenue share (schema.ts:639-735; contracts/SeasonRewardsPool.sol; tests/season-rank.test.ts).
12. **Leaderboard**: `leaderboardSnapshots` daily/weekly/monthly/all_time + share intents Twitter/Telegram/WhatsApp (client/src/pages/Leaderboard.tsx:170-186).
13. **Points shop / marketplace**: 100 seeded items, 15 types (access/boost/discount/nft/physical/subscription/token/credit…), economic-safety model isRealCost+stock+perUserLimit; redeem can unlock cosmetics/skills (schema.ts:301-332; scripts/seed-rewards.ts).
14. **Feedback→XP**: 5 categories, 25-100 XP (schema.ts:19-25).
15. **Notification triggers**: 20 typed notify functions — xp/points/level_up/tier_up/badge/mission/streak/season_start/end/reward/claim_open/reward_redeemed/welcome/broadcast (notificationService.ts:144-538).
16. **Marketing overlays**: `ctaCards` with XP-based visibility rules (minXp/maxXp/newUsersOnly, schema.ts:1010), `notificationBubbles` w/ partner branding, SeasonHighlightBubble with per-season dismissal (client/src/components/SeasonHighlightBubble.tsx:51).
17. **Admin surface**: 37 admin pages; AdminGamification = full CRUD tiers/quests/badges + leaderboard + reset config; plus RewardsAdmin, LearnAdmin, AdminSeasons/SeasonDetails, AdminMerkleTest, AdminSkinsSkills, AdminBroadcast, AdminCtaCards, AdminNotificationBubbles.
18. **Admin analytics**: Power-Users & **Ambassadors** insights endpoints (routes.ts:16833-16874), AdminPowerUsers.tsx/AdminAmbassadors.tsx.

Half-built: `daily_streak` and `social_shares` metrics have NO server feeder (Missions.tsx:195 maps social_shares→"Share Now" CTA only); agentGamificationService.ts is a 73-line stub.

## 2) Learn & Earn mechanics (content banned from harvest)
`learnModules` (category/difficulty/estimatedMinutes/xp+points/status draft→published) → one `learnQuizzes` row (questions jsonb, answerKey server-only — stripped from GET, routes.ts:8620) → POST submit grades server-side: score = correct/total, pass ≥ passingScore (70). **One-time completion enforced** (routes.ts:8660-8664 = the per-lesson cap). Award path on pass: grantXp("lesson_complete") → points → season XP → quest metrics lessons_completed + quizzes_passed → badge check → notification (routes.ts:8690-8726). Response returns per-question corrections + explanations.

## 3) Planned, not shipped (ambitions worth adopting)
- Streak engine (quests+notification exist, computation never built).
- Social-share XP verification loop.
- Season "Airdrop Readiness Check" w/ on-chain merkle verification + funding status (replit.md:40).
- attached_assets staged prompts: M1.1/M1.2 marketplace↔cosmetics integration, A3.3 quest-metric↔agent-action diagnostic, A5.2 badge→agent-XP — a written slice-order discipline.

## 4) Cross-link seams to mirror
Every award emits a typed notification (our notification center); season highlight bubble = ambient season promo on all pages except season pages (our Chronicle/milestones); Missions maps each metric to a CTA deep-link; XP-targeted ctaCards; leaderboard share intents; badges page + Dashboard XP/level card (design_guidelines.md:216) feed profile.

## 5) Money-adjacent — FLAG ONLY, do not adopt
Points→USDC/gift-card/physical redemptions; fee-**discount** and XP-**boost** reward types; `priceUsdPlaceholder` on skins/skills; subscription-gated brain skills; AI credits/soft monetization + x402 pay-per-call (server/ai/aiCreditsService.ts, aiPlansConfig.ts, server/payments/x402Client.ts); season pot = 30% of trade revenue; thirdweb airdrop payouts.


---

## §5 — BENCHMARK: CRYPTO QUEST PLATFORMS (agent synthesis, verbatim)

# Crypto quest/season platforms — state of the art 2025-26 (Zealy, Galxe, Layer3)

Sources fetched: Zealy docs + changelog (zealy.io/docs, /changelog; entries dated Jul 2025–Jan 2026), Galxe help center (help.galxe.com rewards article), Layer3 help/app (help.layer3.xyz, app.layer3.xyz), Domino comparison "Top 12 Web3 Quest Platforms" (domino.run, published 2025-12-02).

## 1) Quest taxonomy + XP/season mechanics
- **Zealy**: quest properties are composable — **recurrence** (resets 00:00 UTC; weekly=Monday, monthly=1st), **cooldown** (1 min → 1 month, or "no retry" = one shot), **claim limit** (only successful/pending claims count; a failed review frees a slot). **Sprints** = time-boxed leaderboards; only XP earned inside the window counts; one sprint at a time; leaderboard hidden outside the window; quests can be added mid-sprint. Sprint XP "reverts" after close — all-time XP persists separately.
- **Galxe**: campaign-centric (one-off quests), points capped "up to 1,000 points per task group"; task types span on-chain, QR event check-ins, DAO votes, GitHub contributions (Domino, 2025-12).
- **Layer3**: multi-step on-chain quests (swap/bridge/stake) → mint a **CUBE** (ERC-721 credential); XP + levels unlock further quests; **Seasons** (~100 days, progress resets; Season 3 live) with a Rewards Hub; **Gems** currency buys XP boosts and "Streak Repairs"; daily "GM" button XP. Streak-repair purchases = loss-aversion monetization — flag it.

## 2) Anti-sybil / auto-verification (zero-operator relevant)
- **Zealy 2025 arc is the blueprint**: "Proof of Humanity" bot detection (2025-07-03, activity-pattern + Twitter authenticity); **AI review** of submissions against operator-written criteria — auto approve/reject, no human queue (2025-07-05); **minimum holding period** on token/NFT tasks so flash-borrowed assets can't pass (2025-11-05); on-chain task auto-verified from contract logs between blocks (via Domino, 2024-07). Each quest has a boolean auto-validate vs review flag.
- **Galxe**: **Passport** SBT — KYC-doc-verified soulbound token as the sybil gate; also ran Gitcoin Passport stamp integration ("Anti-Sybil Assembly"). Bot detection also biases raffle odds ("real users are more likely to win") — opaque, avoid.
- **Layer3**: on-chain-only counting — "only Quests and Streaks with onchain requirements… count towards Referral Points"; CUBE mints as proof-of-action. **Strongest zero-operator pattern overall: verify from chain state/logs, never screenshots.**

## 3) Reward distribution UX
- **Zealy**: sprint **reward pools auto-distributed by Zealy** — USDC straight to wallet, proportional-to-XP, or (2026-01-21) **tiered**: rank bands each get a pool %, "users within the same tier always receive the exact same reward" (predictable, contestable — good). **Zaps** = cross-community points redeemable for **lootboxes** (gambling loop — rejected).
- **Galxe**: tokens via **FCFS** (off-chain, gasless) or **raffle** (on-chain draw, 15-day claim window then refund); Mystery Boxes with probability tables; OAT claim fee $0.08 unless sponsor pays gas.
- **Layer3**: some quests pay ERC-20 directly; CUBEs feed later airdrop allocation (deferred-promise pattern); L3 staking multiplies rewards (pay-to-win tilt).

## 4) Leaderboard craft
- Zealy shows **all-time AND sprint rank simultaneously** (changelog 2023-12-21) — dual time-scope is the engaging core; sprint boards visible only while live creates honest, bounded competition; **reward zones/tiers drawn on the board** make "what rank earns what" legible. Layer3 ties leaderboard to levels/perks unlocks. UNCERTAIN: own-row pinning and rank-delta arrows are visible in Zealy's product UI but not documented in fetched sources.

## 5) VERDICT TABLE
| Pattern | Verdict |
|---|---|
| Time-boxed sprint bound to an era, separate persistent all-time XP (Zealy) | **ADOPT** — maps 1:1 to seasons-on-eras |
| Tiered rank-band payouts, identical within tier, zones shown on board | **ADOPT** (bind to our USDC merit rail, human-worded) |
| Auto USDC distribution to wallet, no claim friction (Zealy 2025-09) | **ADOPT** |
| On-chain proof-of-action from contract logs; minimum-holding-period checks | **ADOPT** — our zero-operator core |
| Recurrence/cooldown/claim-limit as quest properties | **ADOPT** |
| AI-criteria auto-review for unavoidable off-chain tasks | **ADAPT** (publish criteria; chain-first preferred) |
| KYC-SBT passport gating (Galxe) | **ADAPT** — sybil-resistance idea yes; doc-KYC for XP no |
| CUBE-style on-chain achievement credential | **ADAPT** (credential yes, no airdrop-bait framing) |
| Raffles / lucky draws / Mystery Boxes / Zap lootboxes | **REJECT** — gambling loop (banned) |
| Stake-token-for-multiplied-rewards (Layer3 L3) | **REJECT** — pay-to-win |
| Paid streak repairs, daily-GM compulsion loops | **REJECT** — manufactured loss-aversion |
| "Unlock extra airdrop allocation at TGE" promises | **REJECT** — gain-promise red line |
| Bot-detection silently skewing raffle odds (Galxe) | **REJECT** — opaque; verification must be deterministic |


---

## §6 — BENCHMARK: CONSUMER ENGAGEMENT AAA (agent synthesis, verbatim)

# Consumer Engagement AAA — research synthesis (fetched 2026-07-23)

## 1) Progression psychology without lying
- **Visible next milestone**: NRC keeps race-distance + lifetime-distance badges (5K→marathon→100/500/1,000 mi) visible from day one; Trophy's NRC case study (trophy.so, 2026) shows day-one achievement completion → 33.96% retention vs 20.46% without; hardest-tier achievements → 74.17% retention. Lesson: always show the NEXT rung, keep far rungs visible.
- **Near-miss framing**: Duolingo's league window (~30 users, weekly XP) is sized so "any user who engages meaningfully that week can realistically finish near the top" (trophy.so Duolingo case study, 2026). Honest version: "X XP to the next tier" against a real threshold — never a fabricated rival.
- **Streaks + repair ethics**: Streak Freeze users keep streaks 48% longer (17.19 vs 11.62 days past day 7). But criticism is loud and specific: streaks "weaponize loss aversion," guilt notifications ("You made Duo sad") are named dark patterns (UX Magazine/Medium; screenwiseapp.com). **NRC's ethical alternative: weekly streaks, not daily** — accommodates injury/travel; a miss re-engages instead of punishing.
- **RANK NEVER DROPS — the honest equivalent exists**: NRC Run Levels are **cumulative lifetime distance tiers** (Yellow 0–49 km → Orange → Green → Blue 1,000 → Purple 2,500 → Black 5,000 → Volt 15,000+ km; nike.com/help). They only ascend — perfect fit for on-chain cumulative XP. Strava's parallel: PRs/medals are permanent; only the *Local Legend* laurel rotates (most efforts in rolling 90 days) — competition stays fresh WITHOUT demoting anyone's history. Duolingo's demotion is its strongest re-engagement lever (trophy.so) but is exactly the anxiety machine we reject; replace demotion with **rotating seasonal crowns on a permanent base**.

## 2) Celebration moments
- Duolingo: achievement redesign (2023) split **Personal Records** (frequent small wins) from **Awards** (long-arc milestones) — two celebration cadences; day-one achievement → 33.42% 14-day retention vs 20.36%.
- **Share cards**: Duolingo Year in Review = one scroll-free stat card built jointly by product+marketing (blog.duolingo.com, 2020); Strava Year in Sport = per-scene shareable images to IG/TikTok (support.strava.com). Strava paywalled Year in Sport behind its $80 sub in 2025 — widely criticized (escapecollective.com); our version stays free: recap cards are marketing, not product.
- Pattern: celebrate at the MOMENT of the milestone (full-screen ceremony + notification), then mint a shareable card whose figures are chain-verifiable — our provability is the differentiator no fitness app has.

## 3) Battle-pass free-track structure
- Season = 30–60 days, 50–110 tiers rendered as a **horizontal ladder with every reward visible up-front**; early tiers cheap, later tiers steeper (gamemakers.com; designthegame.com).
- **Catch-up mechanics**: Fortnite **Supercharged XP** — missed daily/weekly quests auto-grant multiplied XP (up to 4x) *until you've made up exactly what you missed*, then it ends (thegamer.com; epicgames.com help). This is honest catch-up: it restores missed opportunity, doesn't sell it. Halo Infinite's **non-expiring passes** eliminated season FOMO entirely (powerupgaming.co.uk, 2026).

## 4) Permanent vs seasonal
- GitHub: contribution graph is **cumulative — every green square stays forever on a professionally relevant profile**; that permanence, not the badge, is the retention engine (trophy.so GitHub case study). Caveat: ScienceDirect 2024 study found badge meaning unclear to the community and rising opt-outs — badges need legible criteria.
- Strava: permanent PR/trophy history + rolling-90-day Local Legend = fresh seasons layered over immutable record. Our era-bound seasons map cleanly: chain history IS the contribution graph.

## 5) Verdict table
| Pattern | Verdict |
|---|---|
| Cumulative never-drop levels (NRC) | **ADOPT** — core rank model |
| Lifetime graph permanence (GitHub) | **ADOPT** — on-chain native |
| Visible full reward ladder (battle pass) | **ADOPT** |
| Personal Records vs Awards split | **ADOPT** |
| Free shareable recap cards | **ADOPT** (chain-verifiable figures) |
| Supercharged-XP catch-up | **ADAPT** — restore missed windows, never sell them |
| Weekly (not daily) streaks | **ADAPT** — cadence fits governance rhythm |
| Rotating seasonal crown (Local Legend) | **ADAPT** — seasonal freshness without demotion |
| League demotion | **REJECT** — anxiety engine |
| Guilt notifications / sad-mascot pressure | **REJECT** — named dark pattern |
| Daily-streak loss-aversion pressure | **REJECT** |
| Paywalling the recap (Strava 2025) | **REJECT** |
| Paid streak repair / wagers | **REJECT** (UNCERTAIN: exact Duolingo repair pricing unverified) |

Sources: trophy.so (Duolingo/NRC/GitHub case studies, 2026) · nike.com/help NRC Run Levels · support.strava.com Year in Sport · escapecollective.com · blog.duolingo.com 2020 · thegamer.com + epicgames.com (Supercharged XP) · powerupgaming.co.uk 2026 · gamemakers.com · designthegame.com · sciencedirect.com (S0950584924001666) · UX Magazine/Medium, screenwiseapp.com (dark-pattern critiques).


---

## §7 — BENCHMARK: EXCHANGE/FINTECH REWARD RAILS (agent synthesis, verbatim)

# Exchange/fintech reward rails — field report (researched 2026-07-23)

## 1) Compliant real-money wording
- **Kraken** (legal/exclusive-incentive-50-btc-terms, promo Oct–Dec 2025, fetched): rewards framed as promotions with "Official Rules"; "legal residents of the United States, excluding residents of New York and Maine"; KYC/AML completion required; "Participants are solely responsible for all taxes" (may issue 1099/W-9); sponsor "may substitute a reward of equal or greater value, in its discretion". Separate Opt-In Rewards page: not available in the US; VPN/geo-circumvention = disqualification (support.kraken.com, searched).
- **Robinhood EU Crypto Learn & Earn** (fetched): "subject to availability and/or while supplies last"; reserves right to "modify or cancel the offer… at any time, for any reason"; explicit market-risk line — reward "may increase or decrease in value after being deposited"; employees/household excluded; taxes on the user.
- **Binance Learn & Earn** (support announcements, searched): KYC-verified only, first-come-first-served, per-country reward caps, "while supplies last".
- Pattern: every figure travels with (a) geo/KYC gate, (b) discretionary-modification clause, (c) tax responsibility, (d) market-risk note. None hides the money — they gate it and caveat it.

## 2) Auto-credit vs claim; expiry
- **Auto-credit**: Kraken ($50 BTC auto within 14 business days, one per person, no stated expiry once credited); Robinhood ("automatically deposited"); Revolut Learn & Earn (credited within seconds to 2 business days — help.revolut.com, searched); Coinbase Learning Rewards (auto to USDC balance within 48h).
- **Claim-required + expiring**: **Binance Rewards Hub** — vouchers must be manually activated; claim deadline + separate usage validity; expired voucher = forfeited, no extension; Learn & Earn token vouchers valid **14 days**; Binance Points expire ~1 year (binance.com support FAQs, searched). This is the industry's biggest breakage-by-design engine — **REJECT class** for us.
- Revolut RevPoints expire after 3 years (revolut.com/legal/RevPoints, searched) — softer, still breakage.

## 3) Learn & Earn mechanics
- **Coinbase**: video → quiz → small crypto ($2–5), one reward per quiz, unlimited attempts, single-account rule, geo-varied. **Discontinued 2025-05-27** (help.coinbase.com via search) — the standalone quiz-for-crypto rail was sunset; note as a signal, not a template.
- **Binance**: course+quiz → token voucher within 48h; one reward per course; per-country quotas; KYC gate as anti-sybil; some campaigns pay into Locked Products (forced-hold — dark-adjacent, REJECT).
- **Robinhood EU**: €20 deposit prerequisite before the lesson pays — a purchase-gate on "learning" (REJECT as pay-to-earn).
- Anti-abuse across all: one account per person, employee exclusion, fraud clawback, VPN detection.

## 4) History/proof — what to beat
- Binance: Rewards Hub "Past" tab + Points History (earned/spent/expired) — internal DB records only.
- Coinbase: rewards appear in transaction history within 48h; Kraken: ledger/statement exports. All are **custodial statements — trust-me records, not verifiable receipts**. UNCERTAIN: whether any surfaces a chain tx-hash per reward; none advertises it. Our beat: every USDC bounty = on-chain transfer with tx anchor, amount, era, and reason — publicly refutable, permanent, no "Past tab" needed.

## 5) Verdict table

| Practice | Verdict |
|---|---|
| Auto-credit to account (Kraken/Robinhood/Revolut) | **ADOPT** — merit lands without a claim ritual |
| Expiring vouchers / claim deadlines (Binance) | **REJECT** — manufactured forfeiture |
| Points that expire (Binance 1y, RevPoints 3y) | **REJECT** — our XP never expires, never cashes |
| Geo/KYC eligibility stated up front | **ADAPT** — plain-words eligibility on the bounty page |
| Tax-responsibility + discretionary-award clauses | **ADOPT** — matches our lawyer-gated discretionary rail |
| "May increase/decrease in value" risk line | **ADAPT** — USDC sidesteps it; keep a no-gain-promise line |
| Deposit-gate before earning (Robinhood €20) | **REJECT** — purchase-proportionality |
| Rewards into locked products (Binance) | **REJECT** — forced hold |
| First-come-first-served scarcity quotas | **REJECT** as urgency lever; honest budget cap shown openly is fine |
| Quiz→small-reward pacing, one-per-module caps | **ADAPT** — caps per member per season, merit-judged not chance |
| Internal-DB reward history | **BEAT** — on-chain receipts per payout |

Sources: kraken.com/legal (fetched 2026-07-23) · robinhood.com/eu support T&Cs (fetched) · binance.com support FAQs/announcements, help.coinbase.com, help.revolut.com, revolut.com/legal (via search snippets, 2026-07-23; binance.com direct fetch blocked).


---

## §8 — BENCHMARK: AUDITED MERKLE ENGINEERING (agent synthesis, verbatim)

# On-chain distribution engineering — audited state of the art (all sources fetched 2026-07-23)

## 1) Leaf standards & the compatibility trap
- **Uniswap MerkleDistributor** (canonical, minimal): leaf = `keccak256(abi.encodePacked(index, account, amount))`, verified with OZ `MerkleProof.verify`, claims tracked in a packed **BitMap** keyed by sequential index ([Uniswap/merkle-distributor](https://github.com/Uniswap/merkle-distributor/blob/master/contracts/MerkleDistributor.sol)). Its 72-byte pre-image (32+20+32… packed) is not exactly 64 bytes, which is why the classic attack doesn't bite there — but that safety is *accidental*, by leaf width, not by construction.
- **The attack**: an intermediate node's 64-byte pre-image (two child hashes concatenated) can be presented **as a leaf**; the verifier hashes it and walks a shortened proof to the same root ([RareSkills second-preimage article](https://rareskills.io/post/merkle-tree-second-preimage-attack); [Uniswap issue #35](https://github.com/Uniswap/merkle-distributor/issues/35)). Precondition: contract accepts 64-byte leaf pre-images. Mitigations: reject 64-byte leaves, domain-separate leaf vs node hashing, or double-hash.
- **OZ StandardMerkleTree** (current standard): `leaf = keccak256(bytes.concat(keccak256(abi.encode(addr, amount))))` — **abi.encode (padded), double keccak**. README: "The leaves are double-hashed to prevent second preimage attacks" ([OpenZeppelin/merkle-tree](https://github.com/OpenZeppelin/merkle-tree)). Double-hash chosen over a second hash function because it's cheap (no precompile).
- **THE TRAP (our origin's bug class)**: tooling and contract must agree on *encoding AND hash count*. A contract doing single-hash `abi.encodePacked` will reject every proof from OZ's JS `StandardMerkleTree` (double-hash `abi.encode`) — and vice versa. Symptom: 100% "invalid proof" with a correct root. `SimpleMerkleTree` exists for custom leaf hashing when you must match a legacy contract. Rule: one leaf spec, written once, asserted in tests via differential fixture.

## 2) Multi-round patterns
- **Per-round roots** (Uniswap-style, one contract or one root per round): simple, isolated blast radius, but N rounds = N claim txs per user and per-round funding/sweep ops.
- **Cumulative trees** (Merkl/Angle, Euler-via-Merkl, Morpho URD): each new root encodes each user's **lifetime cumulative claimable**; contract stores `claimed[account][token]` and pays `cumulative − claimed`. Morpho's URD enforces monotonicity — "the claimable amount … must always exceed the amount provided in the previous Merkle tree", else underflow revert ([morpho-org/universal-rewards-distributor](https://github.com/morpho-org/universal-rewards-distributor), audited; README credits yAudit reviewers — UNCERTAIN on full audit list, verify README before citing). Merkl pushes a fresh root every ~8–12h with a **1–2h dispute window** where new rewards are unclaimable and dispute bots recompute the published reward file ([Merkl technical overview](https://docs.merkl.xyz/merkl-mechanisms/technical-overview); Merkl contracts were a Code4rena contest 2025-11). **Pros**: one claim collects all history; missed rounds never strand funds; O(1) state per user-token. **Cons**: root updater is a живой trust point every epoch (needs timelock/dispute), a bad root can momentarily misprice *everyone*, and generation must be deterministic+reproducible. URD wrinkle: pending root has **no queue** — a new submission silently overwrites the pending one; update interval must exceed the timelock.

## 3) Push vs claim
- **Claim (pull)** is the audited default: recipient pays gas, contract escrows the budget, unclaimed funds are visible and sweepable after a deadline (`MerkleDistributorWithDeadline`). Aligns with our truth-first posture: the escrow balance is publicly verifiable.
- **Push** costs the operator ~21k base gas per transfer plus loop gas; academic measurement of real airdrops shows costs scale linearly and batching saves up to ~50% ([Fröwis & Böhme, arXiv:1907.12383](https://arxiv.org/pdf/1907.12383)). Audited push is only acceptable **bounded**: fixed-size batches from an off-chain list (Disperse-style), never unbounded loops over storage (DoS/gas-limit brick). Choose push only for tiny, operator-funded sets (e.g., our discretionary season bounties to a handful of laureates); choose claim+escrow for anything open-ended.
- URD detail worth copying: "anybody can make a claim on behalf of someone else" → multicall batch-claiming gives push UX on pull rails without custody risk.

## 4) SeasonBountyPool checklist
- [ ] Leaf = OZ standard double-hash `abi.encode`, **domain-tagged**: include `(chainId, address(this), roundId/eraId, account, cumulativeAmount)` — kills cross-round AND cross-deployment replay by construction.
- [ ] No 64-byte leaf pre-image ever accepted; differential test proofs from the JS tooling against the contract.
- [ ] Double-claim: `claimed` mapping (cumulative) or BitMap (per-round); test claim-twice reverts.
- [ ] Root rotation: 2-step — pending root + timelock + revoke (URD model); optionally a dispute window (Merkl model); publish the reward file for public recomputation (our chronicle-grade transparency).
- [ ] Rotation mid-flight: define semantics when root changes while claims are open (cumulative model makes this safe; per-round roots must freeze).
- [ ] Ownership: `Ownable2Step` + timelock; owner-rescue **scoped** (only after claim deadline, or only non-distribution tokens) — unlimited rescue is a rug vector auditors flag.
- [ ] Pausability on `claim` only; root updates never bypass timelock even when paused.
- [ ] Funding invariant: root never set unless escrow ≥ max claimable delta (or document under-funding policy).

## 5) Foundry practice
- **Murky** ([dmfxyz/murky](https://github.com/dmfxyz/murky)) generates roots/proofs in Solidity tests; itself fuzz-tested (10k runs) and differential-tested vs OZ and a JS reference — use it to build trees inside fuzz tests.
- **Fuzz**: random (account, amount, index) sets → valid proof claims succeed exactly once; mutated proofs/leaves/amounts always revert (proof-forgery resistance).
- **Invariants** (stateful, [Foundry book](https://book.getfoundry.sh/forge/invariant-testing); [RareSkills invariant guide](https://rareskills.io/post/invariant-testing-solidity)): (a) **conservation** — escrow balance + Σpaid == Σfunded; (b) Σpaid ≤ Σtree amounts; (c) per-account paid ≤ cumulative claimable; (d) claimed flags monotone.
- **Differential fixture**: JSON tree from OZ JS tooling checked into the repo; a test proves the contract verifies those exact proofs (kills the §1 trap forever).
- **Pre-mainnet**: fork-test the deployed bytecode + real root on a fork; `verifyClaim`/staticcall dry-run every leaf off-chain before rotation; full testnet round (Fuji) — fund, set root, claim, sweep — before Avalanche mainnet.

**Dark-pattern filter**: nothing here manufactures scarcity — claim deadlines are legitimate treasury hygiene *only if* the deadline and sweep destination are published upfront; silent sweeps or retroactive deadline shortening are the named dark pattern to reject. Dispute windows and published reward files are the craft to harvest.

