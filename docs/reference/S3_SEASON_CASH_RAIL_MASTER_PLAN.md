# S3 — THE SEASON CASH RAIL · FULL-SYSTEM MASTER PLAN

**Status:** ✅ ARBITRATED (2026-07-24) — produced by the all-hats full-system consolidation
(wf_5fd58a55: 4 repo/canon deep-readers → 7 senior lenses [admin-console architect ·
front-end/design-system architect · read-model engineer · merkle-tooling engineer · contract/QA ·
whole-system adversarial · CTO] → completeness critic → master-plan arbiter; 13 agents, all green).
**Authority:** `MERITDISTRIBUTOR_CONTRACT_SPEC.md` (FROZEN — supreme law; nothing here bends it) ·
the harvest §0.2/0.5/0.6/0.8/0.15/0.17/0.18 · `SETTLED_RULES` §8 · the engraved CLAUDE.md laws.
**What this is:** the SYSTEM-FIRST inventory (the founder picks scope from THIS) + the ordered
slice plan with every gate, deploy verdict and featureStatus flip + the founder's decision points
placed at their right moments. **Execution starts at S3-0.**

---

## 1. THE COMPLETE SYSTEM (27 pieces — what "the season cash rail" actually contains)

**ON-CHAIN (3):**
① `contracts/src/MeritDistributor.sol` — frozen spec v4 = LAW; pragma 0.8.28; adds (arbitrated):
5 public timer getters · ADOPTED auto-close-on-drain (§4 hardening → in; the on-chain era gate
stays REJECTED) · explicit state guards with matched selectors.
② Vendored deps: OZ 5.x + Murky (test-only) + forge-std `6e8c4a9` — plain files, no submodules
(the OneDrive recipe); `foundry.toml` `evm_version=cancun` (mainnet-fork-validated, paris fallback).
③ The AAA test stack: unit + every-selector negatives · 15 stateful invariants ≥50k/depth25
(ghost ledger) · **Halmos symbolic** (conservation/ratchet/aggregate) · **Murky proof-forgery
fuzz** · **mutation ≥90%** on money+access · slither+aderyn 0 high/med · real-USDC fork incl.
Circle-blacklist-ON-the-pool · gas snapshot + the **empirical `claimForBatch` chunk test** (the ONE
chunk authority) · the checked-in differential fixture (Σ>budget AND Σ<budget AND 1-leaf
negatives), **two-phase address strategy** (CTO ruling; CREATE2 documented, not built).

**OFF-CHAIN TOOLING (3):**
④ `artifacts/api-server/src/season/`: `potPolicy.ts` = **the ONE share authority** (eligibility ·
delta-window money-ranks with the FULL §0.14-B tie-break — XP desc → earliest attaining block →
**seat number** (the third key, hashed AS TEXT in the rule sheet) · depth law `d=max(1,floor(eligible/10))`
with floor-trim · percentile curve stretch renormalized to 10 000 bp · bigint largest-remainder
`Σ==budget` EXACT · the roundId allocator `seasonId*1000+n` · **typed REFUSAL while the floor pair
is null OR `ANTI_FARM_IMPLEMENTED` is false** · projection base = `committed[s]+carryover`, served
`isProjection`) · `merkle.ts` (both builders, frozen leaf) · `rulesHash.ts` (the canonical sheet —
**the depth/stretch/tie-break algorithms hashed AS TEXT**) · `publishedFile.ts` (**FULL-ADDRESS
`rank/address/XP/amount` rows — founder ruling 2026-07-24: chain data is public, we SHOW; ANYONE
rebuilds the tree and verifies the root permissionlessly**; the file's own keccak rides
`PendingRound.uri` — the two-artifact hash model) · the `season-merkle` CLI
(build/verify/fixture, runnable by anyone) · `season-files/` committed history ·
`season-merkle.guard.ts` joins the blocking api chain.
⑤ **THE ANTI-FARM LAWS (§0.17-⑤) — now an OWNED slice (critic HIGH: it was ownerless):** burn/mint
holding period (the seasonReadmodel line-378 engraved promise) · referral-XP per-wallet-per-window
cap · floor-gated referral credit. Hard prerequisite of ANY round; `ANTI_FARM_IMPLEMENTED` flips
only when built + attack-tested (receipt-split, wash-loop, referral farm).
⑥ The EXECUTOR/SEALER runner — a dark-by-default backboneRunner step (NO second scheduler):
`EXECUTOR_PK` (openSeason · announcement-gated interim + season-close postRound · activate ·
claimForBatch in empirical chunks, ClaimSkipped left pull-claimable · sweepExpired · **skips the
close round when budget==0**) + `SEALER_PK` (sealSeason at the snipe-proof block; no money power).
Two DISTINCT Replit-secret hot wallets, single-flight, idempotent from contract state, fail-closed
to inaction (permissionless `activate` is the backstop). The api's first-ever signing keys —
custody + gas runbook included.

**READ-MODEL + API (8):**
⑦ `seasonPotReadmodel.ts` (pure event fold; **runner step ③b6a BEFORE the season fold** — window
bounds are an INPUT to it): per-season 4-bucket · **`publicPot(s)` = spec-§2 = THE one served
headline** (arbitrated over §0.17-①/⑩ wordings; `déjà distribué`=totalPaid beside; committed in
the breakdown) · round states with pause-overlap reconstruction · the 5-state lifecycle map
(zero-budget sealed = terminal-for-money) · `conservationHolds` served-not-thrown (public goes
money-dark while false) · lastGood fail-closed.
⑧ Delta-window standings in `buildSeasonReadModel` (optional `deltaWindows[]`): windowXp/windowRank ·
final-window upper bound = seal block (trailing-XP exception) · attaining-block per window.
**Ships + tests green BEFORE any payout root exists.**
⑨ Public `/api/season` pot object: `state DARK|FUNDED` (money-dark law: DARK serves ZERO figures) ·
`publicPotRaw` (headline) · `distributedUsdcRaw` · `committedUsdcRaw` · `carryoverUsdcRaw` ·
`goalUsdcRaw|null` · **`announcedRound{amount, postsAfter}`** (the 48h rule's PUBLIC face) ·
`rounds[]` (masked proofTx, activateAfter/effectiveExpiry) · `servedClaimExpiry` (deadlines render
from chain, never copy) · `sealTransactionHash` (masked) · windowStandings with served
`shareUsdcRaw`/`isProjection`. Raw 6-dec strings; ONE `formatUsdcRaw`; ONE shared `PotFragment`
type module (ends the 4-way interface re-declaration).
⑩ Own-row `/api/auth/season-standing`: `shareBp/shareUsdcRaw` + **`claimStatus` — ONE enum
`none|round-pending|paid|skipped|expired-recycled`** (arbitrated: NO "claimable" state — zero-click
forbids claim-button semantics; `skipped` carries the honest recovery copy) + paid history with tx
anchors; all fields ABSENT pre-activation; the /member double-fetch hoisted to ONE shared fetch.
⑪ Operator `/api/operator/season-pot`: raw buckets + `conservationHolds` + **SERVER-side
recompute-vs-root **MATCH/MISMATCH verdict** (the founder's one-glance check — the PUBLIC
independently rebuilds the tree from the full-address published file, so the verdict is a
convenience, never the only check) +
rulesHash check + budget provenance + readyAt + role-wallet gas + alarms + lifecycle table.
⑫ ALARMS (read-model-computed → admin strip + bell): executor/sealer low gas (default ≈10
sealed-cycle costs) · stalled PENDING (activatable-now) · `roundReserved>0` unswept · any
PendingRound below the live era / `SeasonOpened.seasonId ≠ era` · `conservationHolds` false ·
deadline-drift · **"era seals soon — season N+1 sheet not anchored"** (critic HIGH: `setSeasonRules`
is a per-season OWNER act; without this alarm the autonomous rail stalls silently at every era
boundary) · paused + MAX_PAUSE countdown · sealCorrect window countdown.
⑬ NOTIFICATIONS — **both audiences** (critic HIGH: members had NONE — the bell is the only
channel): MEMBER: "your season bounty arrived — N USDC" with tx anchor (Mine tab) · "distribution
published for verification" · the season-sealed moment. FOUNDER: round-pending window-closes-at ·
low-gas · stalled-round · rules-not-anchored. Share-card painter hookup = named follow-on.
⑭ HEARTBEAT (activation commit): pool + executor + sealer + guardian + founder-funding wallets →
`MERIT_DISTRIBUTOR` scan target (full §6 event set) + `CONTRACT_TARGETS` + verifyLinks + /activity
FR sentences (ClaimSkipped = operator-notes only; raw revert bytes never served publicly). The
fork-rig config NEVER enters the prod build; only the LIVE mainnet addresses join protocolTargets.

**ADMIN (3):**
⑮ `/admin/seasons` RAIL 02 (WORK-FIRST, zero fake controls): **next-step engine** over live pool
state — frame → Accept ownership → **Transfer to 2-of-3 Safe** (first-class state) → Fund →
observe → **"Anchor season N+1 rules"** (armed near the era seal) → dispute window → withdrawal
countdown. Funding panel: **guided approve-EXACT→fund two-signature flow** (critic HIGH: permit was
rejected §11 and the approve step was designed NOWHERE — a naive fund button always reverts) ·
« Réserve » default · « Engager au pot » = gold warning + **typed-exact-amount confirm** · dollars
AND base units · seasonId pinned to `eraForSeatCount`, never free input. Rounds panel + dry-run
from potPolicy BEFORE any post. Dispute panel (server verdict; veto = the one destructive act;
consequence dialog naming the fromCommitted/fromCarry one-way merge). 4-figure ledger strip +
GOAL-vs-COMMITTED + conservation chip · withdrawal two-act timeline · health strip · sidebar badge
(null→absent, never fake zero). **Safe-aware pre-encoded-calldata flow ships BEFORE the Safe
transfer.** Reference in collapsed bottom expanders. The §0.8 anti-stress copy adopted on
admin/claim-adjacent surfaces ("You can close this page — your status is saved on-chain").
⑯ Wallet zone: lazy `src/wallet/SeasonPoolActs.tsx` + `SeasonRoundActs.tsx` — the
ProposeSourceCreate pattern verbatim (server-sourced address · hand-transcribed ABI with .sol line
refs · signingReady one gate · explainError from the §5 catalog · preflight probes).
⑰ GOAL: a separate **NON-hashed** founder_root server config (NEVER in `seasonConfig`, whose
serialization IS the hashed sheet); tests assert GOAL absent from the ABI AND the rulesHash input
set; served `nonBinding`, rendered outside the proof frame.

**FRONT-END (3):**
⑱ `/season`: pot card → **HERO** (serif publicPot figure + "Vérifier sur Snowtrace" — never a
number without its proof) + GOAL slim bar ("OBJECTIF — indicatif, jamais une promesse") + « déjà
distribué » beside-stat + the **« Fenêtre de récompense » money board** (the ONLY dollar board:
served shares · band tints both themes · **unnumbered AWAITING SEAT rows SHOW the projected share**
"si tu prenais ton seat maintenant" — §0.18 engraved conversion law, critic HIGH: the first design
had dropped it) + the **PUBLIC pending-round verification state** (standings + root + published-file
link + countdown + "published for verification, then paid" — critic HIGH: the window's teeth are
PUBLIC teeth) + the rule-sheet verify link (collapsed reference) + SeasonSealed anchors + the
**podium $ cells** (each top-3 medallion carries its $ amount once the vault exists — the engraved
mockup canon) + the **§0.18-④ seal-is-the-deadline caption on the money board** (unseated at the
seal = skipped; nothing was reserved so nothing is forfeited; XP/rank/recognition stay yours
forever; the next season opens the same day — the honest-deadline member promise). The
This-season/All-time XP tabs keep ZERO dollar columns.
⑲ Home + /member: home 3-stat strip leads with the pot + GOAL (hero keeps the ONE filled gold CTA) ·
SeasonStandingCard pot cell live-branch (one authority figure, no per-member dollars) ·
EffortRewardCard keeps its emerald identity, gains its FIRST fetch (hoisted), push voice, the
`skipped` honest state, and **the §0.6 UPFRONT triad** (2-year deadline from `servedClaimExpiry` ·
the plain-words **eligibility / discretion / TAX** lines ·
carryover sweep destination · discretion/eligibility in plain words — an engraved either/or that
was in no copy pack).
⑳ featureStatus: **EXACTLY ONE flip in all of S3** — `seasonBounty`→live in the activation commit;
all 6 FUTURE badges + all 6 guard pins removed the same commit (exact-count both ways); Rail 02's
static prose frame deleted wholesale; ReferralLadderPanel gains the floor-pair sentence; SEO/OG
same commit. Pre-activation slices keep badge counts byte-identical. `seasonOwnRow` UNTOUCHED.

**GOVERNANCE + TRUTH (7):**
㉑ Deploy params (engineering proposes, founder confirms in ONE plain line): **PENDING_DELAY=72h**
(the 48h proposal BREACHED frozen must-fix #7 — refused) · RESERVE_TIMELOCK=72h · CORRECTION_WINDOW
=7d · **MAX_PAUSE=14d** · CLAIM_EXPIRY=**2y**.
㉒ Interim authority (arbitrated — the only jointly-legal model): interim = a founder_root SERVER
announcement (amount named, bell + /season notice) → the executor posts on-chain **only off an
announcement ≥48h old**. The 48h pre-announcement clock and the ≥72h pending window are DIFFERENT,
ADDITIVE quantities (Rail 02 copy re-worded to state both). FINAL round = founder wallet-signed.
㉓ Governance: founder-signed mainnet deploy → acceptOwnership FROM the console → **EARLY 2-of-3
Safe transfer**. The founder's recurring acts are TWO (honest zero-click): funding at his cadence +
ONE `setSeasonRules` signature per season — both surfaced by the next-step engine + alarms.
㉔ **THE REHEARSAL — MAINNET-DIRECT (founder ruling 2026-07-24: "on déploie directement sur
mainnet"; the Fuji testnet detour is DROPPED):** ① the **MAINNET-FORK rehearsal** — an anvil fork
of Avalanche C-Chain (the REAL USDC contract, the REAL chain state — stronger than any testnet;
time-warpable so the strict timer bounds never loosen): TWO full season lifecycles event-asserted;
the founder rehearses acceptOwnership/fund/revoke **on the REAL console screens**, rig pointed at
the fork (rig-only env config, fail-closed, never in the prod build); the Safe act rehearsed on the
fork (mainnet Safe contracts ARE in the fork state). ② after the real deploy, **THE MAINNET
CANARY**: a TINY « Engager » amount → ONE real round end-to-end ON MAINNET (post → public window —
the phone-veto drill lives here → activate → claimForBatch → `Claimed` on Snowtrace → the member
bell observed live) → only then the Season-1 scale funding. Real chain, real USDC, bounded blast
radius — the rehearsal IS the reality, small first.
㉕ TRUTH FLOOR (fix NOW — S3-0): the frozen spec was untracked (the LAW not in git) · the 5 freeze
polish notes lived only in workflow transcripts · `SeasonsRails.tsx:425` "one year" vs the frozen
2-year window · harvest §0.17-⑥/⑨ same drift · contracts/README points at the harvest as contract
spec (now superseded by the frozen spec).
㉖ SCOPE FENCE — NOT S3: `seasonOwnRow` · SwapRail · EN copy · the served LIFETIME board +
past-seasons archive (**named WATCH item — hard trigger: ships BEFORE seats approach 333**, else the
live All-time tab starts lying at the era-1 seal) · seats gauge on /season · new XP feeders ·
Chronicle promotion · the share-card painter (named follow-on).
㉗ DOCS ride every slice (SESSION_STATE · BACKLOG.html · DESIGN_ROADMAP ticks · OPEN_QUEUE), one
consolidated update per slice, every figure recounted.

---

## 2. THE SLICE PLAN (14 — exactly TWO deploys, exactly ONE featureStatus flip)

| # | Slice | Gates | Deploy verdict |
|---|---|---|---|
| **S3-0** | TRUTH FLOOR + toolchain close-out: commit the spec+plan · retrue "1 year"→"2 years" (Rail 02 + harvest + BACKLOG) · re-word the two-clock interim sentence · Safe-transfer checklist line · vendor OZ 5.x + Murky · pin `evm_version` · prove Halmos/slither/aderyn/mutation on THIS box (WSL fallback decided now) | Guards green · **corrected FR copy FULL TEXT on screen** · tools green on a sentinel | 🚀 BATCHABLE |
| **S3-1** | `MeritDistributor.sol` + unit/negative suite (byte-exact from the frozen spec; auto-close-on-drain adopted) | forge green · branch 100% money+access | ✅ NO DEPLOY |
| **S3-2** | The adversarial stack: 15 invariants · Halmos · Murky fuzz · mutation ≥90% · slither+aderyn · fork tests · gas + empirical chunk | every §9 GREEN item except fixture+rehearsal | ✅ NO DEPLOY |
| **S3-3** | Tooling: potPolicy · merkle · rulesHash · publishedFile · fixture (two-phase) · verify CLI · guard | golden leaf vectors byte-verified vs independent viem · differential test green | ✅ NO DEPLOY |
| **S3-4** | **THE ANTI-FARM LAWS** (§0.17-⑤): holding period · referral window cap · floor-gated credit | per-attack unit tests · potPolicy refusal lifts only here | 🚀 BATCHABLE |
| **S3-5** | Server dark-wiring: delta windows · seasonPotReadmodel (③b6a) + alarms · pot object DARK · own-row claimStatus · operator dispute route (server recompute) · interim-announcement registry · GOAL config · **member + founder bell kinds** | typecheck ×2 · api guards · fail-closed proof (payload without pot renders today's surfaces) · FR bell sentences on screen · guard-forbidden-copy + CANON_PROTOCOL_LANGUAGE §5 amended SAME commit for the new money words (§8-③, "the guard follows the system") | 🚀 BATCHABLE |
| **S3-6** | **WIREFRAME GATE A** → admin Rail 02 build (next-step engine · funding approve→fund flow · rounds + dry-run · dispute panel · ledger · health · Safe-aware calldata) | **PREREQUISITE: the docs/design/seasons/ source mockups RE-EMITTED corrected first** (harvest §0.14-E, incl. the "Pendant ton absence" Fortnite-restore correction) · **founder wireframe approval** · preview both widths/themes · S2c-1b measurement · guards | 🚀 BATCHABLE |
| **S3-7** | **WIREFRAME GATE B** → front pot-LIVE build behind intact FUTURE badges (/season HERO + money board + public pending state · home strip · StandingCard branch · EffortRewardCard live) | **PREREQUISITE: corrected mockup re-emission** (§0.14-E) · **founder wireframe approval (4 temporal states)** · preview · measurement · full FR copy on screen (incl. the seal-is-the-deadline caption + the §0.6 triad + « Fenêtre de récompense »/GOAL wording — new copy is NOT settled until this gate) · guard-forbidden-copy amended same commit (§8-③) | 🚀 BATCHABLE |
| **S3-8** | **DEPLOY #1 — the dark batch** (carries the 5-commit backlog + S3-0/4/5/6/7; prod visibly unchanged) | Replit report pasted back · /api/season shape verified | 🚀 DEPLOY |
| **S3-9** | **THE MONEY-SHEET SEAL** (founder decision gate, zero code): the FULL sheet inline on screen → `seasonConfig` filled → `season1RulesHash` computed (NO null in the hashed sheet — every hashed input is a MAINNET blocker, never a build blocker) | decisions recorded · hash recounted | ✅ NO DEPLOY |
| **S3-10** | **MAINNET-FORK REHEARSAL** (closes GREEN — mainnet-direct ruling): anvil fork of Avalanche C-Chain (REAL USDC contract + chain state, time-warped) · 2 full lifecycles event-asserted · founder clicks acceptOwnership/fund/revoke on the REAL console screens (rig → fork) · Safe created + 1 Safe-signed act on the fork · fixture re-verified | §9 rehearsal checklist 100% event-asserted on the fork · report committed | ✅ NO DEPLOY |
| **S3-11** | **MAINNET + THE ACTIVATION COMMIT**: founder signs the deploy (params in one plain line) → **post-deploy verification BEFORE acceptOwnership** (bytecode provenance · timers/roles/USDC read back on-chain · fixture regenerated vs the LIVE address) → acceptOwnership → EARLY Safe transfer → ONE commit: heartbeat pins + `seasonBounty` flip + 6 badges/pins out + SEO | guard-feature-truth both ways · element-diff vs approved wireframes · preview on REAL prod data · Snowtrace verify · Replit deploy | 🚀 **DEPLOY #2 (activation — empties the backlog)** |
| **S3-12** | **THE MAINNET CANARY, then first real funding**: a TINY « Engager » (founder's amount) → ONE real canary round end-to-end ON MAINNET (post → public window — the phone-veto drill → activate → claimForBatch → `Claimed` on Snowtrace → the member bell observed live) → THEN « Réserve » + the Season-1 scale « Engager » (typed confirm) — the scale `Funded(committed)` lights the HERO figure; autonomy + alarms watched over the first full cycle | canary round 100% verified on Snowtrace · every surface shows the pot with its proof · founder's prod clicks = the living seal | — (the rail is autonomous, 8-8) |
| **WATCH** | The LIFETIME board + past-seasons archive — **ships before seats near 333** | own wireframe + preview when built | 🚀 at build time |

## 3. THE FOUNDER'S MOMENTS (9 — each at its right time)

1. **NOW (S3-0):** the corrected FR copy on screen (2-year sentence · two-clock interim · Safe line).
2. **Before S3-6:** approve **WIREFRAME A** (admin: composition · funding/signing flow · dispute panel).
3. **Before S3-7:** approve **WIREFRAME B** (front, in 4 temporal states) + 2 look calls (band labels
   visible vs tint-only · GOAL public from day one vs admin-first).
4. **S3-9 — THE MONEY SHEET** (the one hard gate): « Engager » S1 amount + cadence · GOAL figure ·
   XP weights (500/200/150/100/25) + footprint-rung yes/no · floor pair + $20 · per-source caps ·
   the interim-policy sentence (even "none planned" is written — the sheet is hashed) ·
   hors-concours + the AW-5 wallet name.
5. **Before S3-10/11:** name the 2 Safe co-signers · approve the executor/sealer hot keys as Replit
   secrets + fund their AVAX · confirm the timer line (72h/72h/7d/14d/2y).
6. **S3-10:** his fork-rehearsal session on the REAL console screens (acceptOwnership · fund · one
   revoke · one Safe-signed act — the rig points at the mainnet fork; no faucet, no testnet).
7. **S3-11:** the two mainnet signatures (deploy + acceptOwnership) → the Safe transfer.
8. **S3-12:** the CANARY first — a tiny real « Engager » + one real round watched end-to-end (his
   phone-veto drill lives here) — then the Season-1 scale funding; his prod clicks are the living
   seal. From then on: TWO recurring acts only (funding at his cadence + one rules signature per
   season).
9. **Standing:** EN copy fenced out of S3 · `seasonOwnRow` a separate future slice with its own wireframe.
