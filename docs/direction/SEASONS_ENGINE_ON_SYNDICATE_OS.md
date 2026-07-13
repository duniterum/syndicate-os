# SEASONS & RECOGNITION ENGINE — ON SYNDICATE OS
*Harvest of Supa-Exchange's gamification, reframed to doctrine, aligned to the 9 eras.*

*DIRECTION doc. **Phase-5 (gamification), post-MVP** — captured now so nothing is lost; not
built yet. Founder is the authority; only **LEGAL + SECURITY + TRUTH-FIRST** bind. Governed by
`SETTLED_RULES_DO_NOT_RELITIGATE.md` + `GAMIFICATION_LEGAL_DOCTRINE.md`. A crypto lawyer
validates the money-touching items + the new contract before launch. Written 2026-07-11 after a
full read of the Supa engine (server + admin + contract).*

---

## 0. One line

Take Supa's **entire** seasons / XP / quests / badges / leaderboard / admin engine (it is
genuinely excellent), **reframe the reward** from "XP → USDC claim" to **recognition**, and
**bind the season cycle to the protocol's 9-era sale schedule** so economy + narrative +
recognition transition as one living rhythm.

---

## 1. What Supa actually built (the harvested architecture)

Read in full on disk at `C:\Users\kemal\OneDrive\Documents\GitHub\Supa-Exchange`:

- **XP engine** (`server/services/seasonService.ts` + `xpService` + `agentXpService`) — `seasons`
  + `seasonXp(userId, seasonId, xp, levelInSeason, rankSnapshot)`; add-XP, leaderboard by XP,
  end-of-season **rank snapshot**. Level formula shared global/season/agent. → pure recognition.
- **Quest engine** (`server/services/questService.ts` + `questMetrics/*`) — `quests(slug,
  category, metric, targetValue, baseXp, bonusXp, type: daily|weekly|one_time, sortOrder,
  isActive)`; per-user progress by **metric**, daily/weekly **reset** (UTC config), claim →
  grants XP + badges + notification; quest→agent-XP mapping.
- **Badge engine** (`server/services/badgeService.ts`) — `badges(slug, conditionType,
  conditionValue, tier, xpReward, agentId, icon, color)`; conditionTypes: swap_count, volume,
  referral_count, quest_count, agent-specific; tiers **novice → adept → expert → master →
  grandmaster**; award → XP + notification; agent progression summary (next badge + ratio).
- **Distribution** (`server/services/seasonDistributionService.ts`) — **the cash path.** "AAA
  Reward Policy" = Top 200, **XP-proportional**, 30/30/40. Builds a **Merkle tree** (thirdweb
  Airdrop v2 compatible), admin `generate-merkle` → stored snapshot → users **claim USDC**
  on-chain.
- **Contract** (`contracts/SeasonRewardsPool.sol`, or thirdweb Airdrop v2) — Merkle root + fund
  (USDC) + `claim(amount, proof)`, claimed-once per root, emergency withdraw.
- **Admin — Seasons** (`client/src/pages/admin/AdminSeasons.tsx`) — a **world-class operator
  console**: create season (name/dates) → configure pool (planned USDC + revenue-share %) → set
  contract/chain/explorer → fund → refresh on-chain balance → **funding state machine**
  `PLANNED → FUNDING → ACTIVE → SETTLING → CLOSED/CANCELLED` × time status `Upcoming/Live/Ended`
  → Run Season Closing (finalize rankings + payout records) → Generate Merkle → **Open/Close
  Claims** (guarded: needs merkle + pool + contract) → Run Payouts → **audit** (payout tx hash)
  → archive. Plus a **"next step" suggestion engine** and a lifecycle explainer. Supa itself
  labels the pool *"a manual **marketing budget**"* — confirming the founder's framing.
- **Admin — Rewards** (`client/src/pages/admin/RewardsAdmin.tsx`) — a redemption **catalog**:
  `rewards(name, type, pointsCost, stock, metadata{tier, rarity, requiredLevel, featured,
  duration, benefits, multiplier, discountPercent, permanent})`; types **badge / boost /
  discount / nft / token / feature / physical**; tier+rarity visual system; points-cost
  redemption.

---

## 2. The doctrine line — one, precise

The Supa loop is `quests → XP → leaderboard → rank determines your share of a USDC pool → claim
USDC`. The **XP → USDC conversion** is the one banned mechanism (recognition becomes cash-value
currency; plus a compete-for-a-pot casino energy). **Everything else is recognition and
harvestable.**

| Component | Verdict |
|---|---|
| XP · levels · quests · quest-metrics · daily/weekly reset · leaderboard · **rank snapshot** · badges · tiers · celebration modals · notifications · the whole **admin lifecycle** (state machine, next-step engine, guarded actions, audit, archive) | ✅ **KEEP** — harvest the mechanism, reskin to our tokens/vocab |
| The **reward** a season/quest yields | 🔁 **REFRAME** → recognition (rank, badge, access, cosmetic, a place in the Chronicle) — *not* a USDC-from-XP claim |
| `SeasonRewardsPool.sol` Merkle claim **keyed to XP/rank** (XP → USDC) | ❌ **DROP** as the season reward. (Reuse the Merkle *infrastructure* only for the legitimate cash rail — §8.) |
| RewardsAdmin `token` type · `boost`/`multiplier` (2× XP, priority routing, gas rebates) · `discount` with cash value | ❌ **DROP / heavily REFRAME** — these are financial advantages/tokens (security/wealth path). Keep badge/feature/access/cosmetic/collectible/physical; a discount is OK only on *our own* services, non-cash-convertible |

---

## 3. Season = Era — the alignment (the core idea)

Two existing protocol systems (both in the origin `TheSyndicate`):

- **5 CHAPTERS** (`src/lib/chapters.ts`) — narrative coordinates by member number: I Genesis
  Signal #1–333 · II First Thousand #334–1 000 · III The Expansion #1 001–3 333 · IV First Ten
  Thousand #3 334–10 000 · V Open Era #10 001+. Doctrine: historical only, **earlier ≠
  financially better**, no rewards/yield/governance tied to a chapter, deterministic function of
  member number, seals at `endN` / next opens at `startN`.
- **9 ERAS** (the sale contract's immutable `_eraParams`, mirrored in `src/lib/eras.ts`) — the
  **pricing schedule** (SYN/$, min entry, endSeat): I 100/$5/≤333 · II 50/$10/≤1k · III
  40/$10/≤3 333 · IV 16/$25/≤10k · V 12/$25/≤25k · VI 6/$50/≤50k · VII 4/$50/≤100k · VIII
  2/$100/≤250k · IX 1/$100/≤1M. The era **auto-advances on-chain** when `memberCount ≥ endSeat`
  or the cap can't fit a min entry. The purchase UI shows only the live `quote()`, never a stale
  estimate.

**The design:** a **Season = an Era.** Season boundaries are **deterministic on-chain member
milestones** (the era `endSeat`), not arbitrary admin dates. When the era fills and advances
(economy), the season seals and the next opens (recognition) — **they transition together,
driven by real membership growth.** Era (economics) + Chapter (narrative) + Season (recognition)
= one living rhythm. `syndicate-os` today has only `holderIndexEra` in the Holder Index; the
chapters/eras systems get harvested from the origin.

**The non-negotiable guardrail (inherited from the chapter doctrine):** a season/era gives
**recognition** ("member of Era III", a permanent place in the Chronicle) — **never a financial
advantage; earlier is never cheaper or better-paid.** This is exactly what keeps the whole
system off securities ground and consistent with `SETTLED_RULES`.

**Why this matters for the smart contract:** the current Sale contract is immutable (and has the
known per-wallet cap defect), and `syndicate-os` is a fresh build — **a new sale/era contract is
going to be deployed anyway.** So the seasons/recognition mechanism is designed **together with**
the new 9-era schedule: they share era boundaries and transition atomically. **Do not build a
standalone season contract now** — build it aligned, at the moment the new sale/era contract is
built.

---

## 3.5 Continuity & autonomy — how the organism runs FOREVER (three clocks)

The founding structures (eras, chapters) are **finite by design**; the **season heartbeat is
infinite.** Never conflate them — that conflation is the whole confusion. Three clocks, three
lifespans, three roles:

- **ERAS = the economic clock. FINITE, and that is CORRECT.** The 9-era price schedule
  (100 → 1 SYN/$) is the **sale / bootstrap** mechanism. It ends when the sale concludes
  (~1M / allocation exhausted) — like **Bitcoin's halving schedule**: a finite distribution
  calendar with a natural end. After it, SYN just trades on the market; there is no more "era
  price." A finite end is *right* — the economic birth, not the engagement engine.
- **CHAPTERS = the mythology clock. FINITE (founding), and that IS the scarcity.** The 5 chapters
  (Genesis → Open Era, by member number) are the **origin saga** — your permanent founding
  cohort. They seal because the founding is a **one-time, precious** event: you are only ever
  Genesis #47 once. Chapter V "Open Era" is the permanent post-founding state. **Sealing is the
  value**, not a defect.
- **SEASONS = the engagement clock. INFINITE. This is what runs in year 100.** The recurring
  cycle (theme + recognition + leaderboard + one Chronicle entry), numbered 1 → ∞. It runs
  **during** the founding (aligned to era milestones — the extra-special "founding seasons")
  **and forever after** on its own deterministic cadence. This is the **Netflix / Fortnite
  engine** that never stops: in Fortnite, seasons are **nested inside chapters**, ~quarterly,
  running since 2017, numbering resetting per chapter — you never run out, you just add the next.
  Optionally group seasons into recurring **"Volumes / Ages"** so the "a new chapter opened!"
  hook recurs eternally.

**So "Season = Era" is refined:** *during* the founding, seasons marry the 9 eras; *after*, the
economic-era clock stops but the **season heartbeat beats on, alone, forever.** That resolves
"if chapters stop at 5, how do we continue?" — **chapters/eras were never the infinite engine;
seasons are.**

**The Netflix hook on two timescales:** ONCE (founding) — "get in before Genesis / Era I seals"
(scarce, never repeats); FOREVER (seasons) — "what's Season 48's theme, where do I rank"
(recurring, eternal).

**AUTONOMY — self-running for 100 years:** the eternal engine is **RECOGNITION**, which costs
nothing and needs no human. Triggers are **deterministic**: on-chain member-milestone (era
`endSeat`) during the founding, then a time/activity cadence after. Zero money, zero
intervention → it re-runs itself forever. *This is exactly why the DEFAULT season reward is
recognition, not cash:* recognition is the only reward that can run autonomously, eternally,
with no funding and no operator.

---

## 4. How Syndicate OS does it better than Supa

1. **Recognition-first, not cash-first.** The season reward is rank/badge/access/Chronicle
   placement — free, on-brand, and *more durable* (status/legacy outlasts a one-time payout).
2. **XP is provable, not a DB number.** Progress derives from **verifiable on-chain actions**
   (receipts, introductions, contributions) — the leaderboard is provable ("don't trust,
   verify"), not a declarative row.
3. **Season boundaries are deterministic + on-chain** (era `endSeat`), not admin dates — no
   arbitrary start/end, non-gameable, self-sealing on membership growth.
4. **Wired into our RBAC + admin shell** (`IDENTITY_ROLES_SPINE_CANON` Founder/Admin/Operator/
   Auditor + `ADMIN_SHELL_SPEC`): founder-gated, **step-up auth**, audit-logged — stronger
   governance than Supa's standalone admin.
5. **No casino.** Compete for **status/legacy**, not a money pot — removes the toxic
   compete-for-cash energy while keeping the healthy levers (progression, collection, status).
6. **A season is a chapter of the living protocol.** Seasons integrate into Activity / Chronicle
   / Evolution (a sealed season → a Chronicle entry), not a bolted-on module.
7. **The excellent Merkle infra is reused where cash is legitimate** (§8), not thrown away.

---

## 5. Data model (reframed tables)

Harvest Supa's schema, reframed: `seasons` (id, label, **eraIndex**, startSeat/endSeat derived,
status, no merkle/claim fields on the recognition path) · `seasonXp`/`seasonRecognition`
(userId, seasonId, xp, levelInSeason, rankSnapshot) · `quests` (slug, category, metric,
targetValue, baseXp, type, reset) · `userQuestProgress` · `badges` (slug, conditionType,
conditionValue, tier, icon) · `userBadges` · `recognitions` (the closed-loop, non-transferable,
no-cash-value catalog — see §7). **XP/recognition are off-chain or explicitly non-transferable**
per `GAMIFICATION_LEGAL_DOCTRINE` (never a tradeable token). Where possible, the leaderboard
inputs derive from the on-chain read spine (receipts/introductions), not arbitrary grants.

---

## 6. Admin model (harvest AdminSeasons, reframe + RBAC)

Keep the whole lifecycle UX — the **funding/status state machine, the next-step engine, the
guarded actions, the audit trail, the archive, the lifecycle explainer**. Reframe:

- On the **recognition path** (default): "fund/merkle/claim/payout" collapse to "seal season →
  snapshot ranks → publish recognition" (no money, no merkle, no claim). The state machine
  becomes `PLANNED → LIVE (era open) → SEALED (era advanced) → PUBLISHED (recognition live)`.
- Wire every action into **RBAC + step-up** (founder/admin-gated, auditor-visible), inside the
  admin shell — not a standalone console.
- Keep the **explorer/verify chips** and the audit records (they fit truth-first).

---

## 7. Recognition catalog (reframe RewardsAdmin)

Keep the catalog CRUD + tier/rarity visual system. Reframe the **types**:

- ✅ Keep: **badge · feature/access · cosmetic · collectible (SeatRecord/1155) · physical**
  (real-world memorabilia) — closed-loop, non-financial.
- ❌ Drop: **token** (handing out SYN/tokens), **boost/multiplier** on financial outcomes (2× XP
  is fine as *recognition pacing* but never a financial multiplier / better price / yield),
  cash-convertible **discount**. A discount is allowed **only** on our *own* services and
  non-cash-convertible.
- Carry the closed-loop wording from `GAMIFICATION_LEGAL_DOCTRINE` (no cash value · not
  redeemable for cash · non-transferable · company property · modifiable).

---

## 7.5 Learn & Earn — education → recognition (harvest of Supa's Learn engine)

Supa has a full **Learn & Earn** module (`client/src/pages/Learn.tsx`, `admin/LearnAdmin.tsx`,
`scripts/seed-lessons.ts`): `learnModules` (title, category, difficulty, HTML content, xpReward,
pointsReward, status draft/published) + `learnQuizzes` (questions, passingScore, answerKey).
**Member flow:** browse lessons (filter by difficulty) → read → **take a quiz → pass (≥70%) →
earn XP + points**; simple admin CRUD + publish toggle; a 100-lesson seed; a "Starter Track"
(Season 0) onboarding mapped to quests.

**Verdict — the engine is excellent and harvestable** (module + quiz + pass→reward + admin +
seed). Reframe:
- ✅ **Reward = XP / recognition ONLY** — never Supa's "points" that convert to a cash rewards
  catalog. Pass a lesson → earn recognition (a **Verifier / Historian** axis, a badge, a Chronicle
  mention). Non-cashable per `GAMIFICATION_LEGAL_DOCTRINE`.
- ✅ **OUR content, not Supa's.** Supa's 100 lessons teach DeFi trading (yield farming, APY,
  leverage, perps, arbitrage) — banned vocab + off-brand. We use our own honest lessons (already
  in `learningModules.ts`: what The Syndicate is, reading the foundation, wallets,
  transactions/proof, membership/recognition, safety) + new ones (how to verify on-chain, source
  vs claims, seat vs holder). Take the ENGINE, **zero of Supa's lesson content.**
- ✅ **Builds on the existing `/learning`** (Phase-2 education page): Learn & Earn adds the quiz +
  recognition loop ON TOP, turning passive education into an engagement loop. The old
  `/learning` code comment "not learn and earn / no reward" meant **no CASH/unlock reward** —
  fully consistent with earning **XP** (XP is recognition, not cash). No conflict; this is the
  already-settled "Learn & Earn = Learn & earn XP" (`SETTLED_RULES`).
- ✅ **Wired into the recognition spine + eras/seasons** — "Learn" is a recognition SOURCE like a
  quest; completing the verification lessons earns the **Verifier** axis. Unified with the engine.

**Better than Supa:** (1) recognition, not points-to-cash; (2) truth-first content that teaches
you to **verify** the protocol, each lesson **linking to the live proof surface** (learn about
the vault → see the live vault read) — education that is itself alive; (3) the quiz teaches
(explanations) and earns recognition, no cash gate. **Phase-5**, same recognition engine as
seasons, on the `/learning` base. Content stays number-free / banned-word-free like every surface.

---

## 8. Funding — company money, discretionary, for effort (the cash rail)

**Clarified 2026-07-11 (founder corrected an over-cautious earlier take).** The reward money is
the **COMPANY's**, given voluntarily — exactly like **Fortnite / Netflix reward with their own
revenue**, NOT a pot fed by members' money. A member buys a **seat** (access/recognition = the
product), never "a share of a returns pool." So a company-funded reward for effort is a legal
marketing **gift**, not a security. The "pooling = security" concern applies ONLY to "members'
money redistributed to members by rank" — which is **not** this model.

**Three lines keep it clean (security comes from STRUCTURE, not secrecy):**
1. **Discretionary + effort-based, NOT proportional to purchase.** Reward participation / tasks /
   contribution; never "you paid more → you get more" (that is a return on capital = security).
   Effort = a gift for work; purchase-proportional = an investment return.
2. **USDC or perks — NEVER SYN as the reward** (the "Tomahawk" trap: distributing your own token
   for engagement is a securities offer). Burns are a separate deflationary mechanism — fine.
3. **Automate the DISTRIBUTION; keep the DECISION to fund discretionary.** Automate snapshot /
   compute / pay. **Avoid a fixed, perpetual auto-route** (e.g. "X% of every membership routes
   into a rewards pot") — that edges back toward "a share of each purchase flows to a member
   pot," and it must never touch the locked **70/20/10** routing. Clean model: the company
   **decides** to allocate $X of its revenue (a marketing choice), then the machine distributes
   automatically. Automation **+** discretion.

Structured this way (company money · discretionary · effort-based · USDC not SYN) it is legal AND
*sayable* ("we reward contribution") — nothing needs to be hidden; the **structure** protects,
not the silence. The harvested **Merkle distribution** (`seasonDistributionService` + pool
pattern) is legitimately reused for these discretionary bounties and for the **introduction
commission** (CommissionRouter) — payment for defined work, never a conversion of recognition
into cash. Lawyer-gated at launch.

---

## 9. Build phasing + dependencies

**Phase 5 (gamification), and only after its prerequisites:**
- Content suite (Phase 2) · auth + wallet identity · **RBAC + admin shell** (Phase 3–4) · the
  **event backbone / Activity** (the on-chain action feed that XP derives from) · and the **new
  sale/era contract** (the 9-era schedule the seasons align to).
- Order inside Phase 5: (1) recognition XP + quests + badges (off-chain-safe, no money) → (2)
  season=era binding + admin lifecycle in the shell → (3) recognition catalog → (4) *optional*
  cash bounty rail + the aligned on-chain contract (lawyer-gated).

Do **not** pull this ahead of the content suite / auth / RBAC; it depends on them. Capture-now,
build-at-phase.

---

## 10. Open decisions / lawyer gates

- **New sale/era contract design** — the 9-era schedule + the recognition/season binding, built
  together (fixes the per-wallet cap defect too). Lawyer + audit.
- **Any USDC to members** (bounty rail / commission) — lawyer-gated (structure per §8 + SETTLED_RULES).
- **On-chain vs off-chain recognition** — keep non-transferable either way; decide storage at
  build (off-chain DB is simplest and safe; on-chain SeatRecord/1155 for durable collectibles).
- **Which on-chain actions feed XP** — receipts, introductions, contributions (derive from the
  read spine; avoid arbitrary grants to keep it provable).

---

## 11. Member Home projection — the recognition slot in the shell (advisor harvest, 2026-07-13)

*How the seasons engine SURFACES on Member Home. Captured during the Member Home shell slice so
the shell reserves the right slots now and Phase 5 drops into them without a redesign. This
section is a DESIGN DIRECTION (STATE, not law); the shell being built today ships these slots as
visible "Coming soon" doors/cards on the EXISTING posture system — never hidden, never faked.*

### The member-side chrome worth harvesting (read on disk 2026-07-13)

**Supa-Exchange** (`client/src/`):
- `SeasonHighlightBubble.tsx` — the compact "current season" card pattern: name + status badge +
  countdown (`Xd Yh`) + participant count + a thin progress bar + one CTA. Dismissable with a
  7-day memory. **Harvest the chrome**; REFRAME the copy — never "Compete for rewards!" /
  "Join & Earn Rewards" (cash framing); ours says the season name + "earn recognition" /
  "your standing this season".
- `Seasons.tsx` — own-row **your XP + your rank** next to the leaderboard; **rank-tier visuals**
  (top-3 crown/medal · top-10 · top-50 ring colors) — pure recognition theater, keep it; past
  seasons as an **archive accordion** (memory-over-noise, keep).
- `questHelpers.ts` — quests carry `baseXp + bonusXp` and map to a **per-agent XP axis** on top
  of global XP. **This is our multi-axis recognition, already engineered**: swap agent-axes for
  our recognition axes (Capital / Builder / Connector / Operator / Verifier / Historian /
  Steward…). A quest feeds global XP + its axis XP.
- `BadgeCelebrationModal.tsx` + provider — the **moment of recognition** (award → celebration →
  notification). Keep the mechanism; reskin to our tokens (gold = identity).
- `Feedback.tsx` + `admin/FeedbackAdmin.tsx`/`FeedbackDetail.tsx` — **gamified support/error
  submission** (founder-remembered, re-found 2026-07-13): 5 categories (Bug · UX · Feature idea ·
  Question · Other), each SHOWING its XP+points reward up front (`FEEDBACK_REWARDS` /
  `FEEDBACK_XP_RANGE` in `shared/schema.ts` — read exact values at build); screenshot
  drag-and-drop · star rating · submit → XP + notification; admin side = the triage console
  (the ticketing module). DOCTRINE FIT: rewarding the ACT of reporting = recognition for effort
  (SETTLED-safe). Axis mapping: Bug/UX report → **Verifier** XP · Feature idea → **Builder** XP ·
  a question promoted into the Living FAQ (master plan E2) → **Historian** XP. Support becomes a
  recognition engine, not a cost center. Ships as an admin-managed module (enabled switch +
  triage page in the shell), Phase 3+ with the Guide; XP wiring lands Phase 5.

**entity-chain** (`client/src/pages/Dashboard.tsx`):
- Grouped feature cards each carrying a **mini stat badge** ("8 active", "Live data") — the
  per-door teaser number. On Member Home doors: Referral door shows the member's live
  introduction count; season door shows days remaining. A door with a number pulls a click.
- The **quick-stats strip** at the top of the dashboard (we already apply it as the live-figure
  card row). Entity CONTENT stays banned (APY/DAO/staking/faucet) — chrome only.

### Profile · Settings · Header (harvest from Supa, doctrine-filtered — 2026-07-13)

Sources on disk: `Supa-Exchange/client/src/components/AvatarUploader.tsx`, `UserAvatar.tsx`,
`Header.tsx`, `pages/Settings.tsx` (profile carries level/xp/points — confirms XP belongs on
the profile surface).

- **Avatar** — Supa's default is a wallet-seeded identicon (dicebear) with an upload dialog
  (preview · type/size validation · remove→default). SAME mentality as our `MemberSigil`
  (already built, deterministic from the wallet): the sigil IS the default avatar. "Change
  image" = opt-in self-expression (Visibility Law: opt-in self-publish — allowed). **The slot
  is DESIGNED to later accept an NFT avatar** (founder's held-back NFT concept; Archive1155
  era): keep the avatar source abstraction `sigil | uploaded | nft(FUTURE)` from day one so the
  NFT lands without a redesign. Never a paid financial advantage — identity/vanity only.
- **Alias** — opt-in display name, DEFAULT = the seat number (honour-roll canon: a member who
  wants no name stays a number). Free alias field lands with the Standing slice (Phase 5);
  SOLD aliases stay lawyer-gated (LIVING_ORGANISM §5). Never required.
- **Email — NOT harvested.** Supa stores email + verification; storing an email is identity
  data and cuts against the anti-doxx minimal posture (ADR-003). Notifications stay ON-SITE;
  any email channel is a separate founder decision, never a silent add.
- **Settings sections (ours):** Profile (sigil/avatar + alias) · Display (language, theme) ·
  Notifications on-site (SOON) · Session (wallet · verify · disconnect — LIVE today) · Danger
  zone = **off-chain profile reset ONLY** ("the seat is permanent" — bytecode; nothing on-chain
  is deletable and the copy says so).
- **Header** — the member pill = sigil/avatar + seat # + era badge → opens the existing
  identity menu (Member Home · Settings · Verify · Disconnect). Reserve two header slots:
  notification bell + season trophy (both SOON; the Supa `SeasonHighlightBubble` docks off the
  trophy at Phase 5).
- **Feedback XP timing rule (anti-spam):** XP is credited when the OPERATOR validates the
  submission in the triage console, never on raw submission — the reward follows the
  contribution being real.

### Notification center — in-app only, three channels (harvest Supa, 2026-07-13)

Sources on disk: `Supa-Exchange/server/services/notificationService.ts` (+
`adminNotificationService.ts`), `client/src/pages/admin/AdminBroadcast.tsx`,
`AdminNotificationBubbles.tsx`, `components/NotificationBell.tsx`, `pages/Notifications.tsx`;
entity's template-driven notification generator (ADAPT per the 2.20E audit). **FOUNDER RULE:
no web2 email — everything lives inside Syndicate OS.** Supa's system is already 100% in-app
(bell + list page + bubbles), so the harvest fits the rule natively.

Three channels (all one storage, one bell):
1. **Targeted 1-to-1** — `createNotification(userId,…)` with typed generators. Ours (each
   carries type · title · body · metadata · CTA): seat confirmed (welcome) · referral events
   ("a seat was taken through your link" — chain-derived, R5) · **ladder promotion due /
   promotion signed** (the founder rule made visible: crossing date + "awaiting founder
   signature") · badge/XP/quest (Phase 5) · security alert. Admin can also hand-send to ONE
   member (delivered own-row to the session wallet — no directory involved, ADR-003 clean).
2. **Broadcast → everyone** — the AdminBroadcast console pattern kept whole: title + body +
   optional CTA + auto-expire + PREVIEW-before-send + history (Active/Expired) + delete +
   stats. This is the operator's news channel; it is N2/N3 operator COMMUNICATION and must be
   LABELED as such ("From the operator") — never dressed as chain truth.
3. **Protocol notifications (automatic)** — derived from the event backbone (M4): season
   start/end, era transitions, protocol milestones → broadcast; personal on-chain events →
   targeted. TRUTH-FIRST twist on Supa: any notification about an on-chain fact carries a
   VERIFY link (explorer/tx), not just a CTA — the notification is a pointer to proof, never
   the proof itself.

Rules engraved: in-app ONLY (no email/SMS — a future channel is a founder decision) · one
notification store, one bell, one list page (never parallel systems) · admin side ships as a
managed MODULE in the shell (enabled switch · broadcast console · audit of what was sent) ·
notifications never contain another member's wallet/identity (own-row discipline) · the
header bell slot is already reserved in the Member Home shell wireframe.

### The Member Home slots (wireframe v2, agreed with the founder)

1. **"Your Seat" strip** (LIVE today) — sigil · Member #N · Seat Held · wallet · chapter ·
   receipt/Share-my-proof.
2. **Live-figure card row** (partly LIVE today) — SYN balance (live) · Referral standing (live,
   R5) · USDC routed (Coming soon — receipt adapter).
2b. **"My referral link" card (founder decision 2026-07-13 — every member, day one).** The
   member's sourceId is DERIVABLE (`keccak256("SYN.SOURCE.V1", wallet)` — lib/sourceIdentity),
   so every member gets their PERMANENT `/join?source=` link with TWO honest states: source
   ACTIVE → "commission paid inside the buyer's own transaction — live"; source NOT YET signed
   → "your link is permanent — commission activates when your source is founder-signed" (the
   link never changes; activation upgrades it in place). This is the auto-derived member link
   card SESSION_STATE marked UNLOCKED after R2. Never a dead or lying copy button.
2c. **TEASER-page pattern (founder decision 2026-07-13 — the grade-AAA answer to doors onto
   not-yet-built surfaces).** A door NEVER opens onto an empty shell and is never hidden: the
   target renders a designed teaser — one paragraph of what the surface will be · an honest
   posture badge · a small preview explicitly labeled "design preview" (never a fake figure) ·
   what unlocks it · a return hook ("it will appear here"). Applies to Activity · Chronicle ·
   Archive · My Syndicate; existing real pages (Recognition, Protocol graph) stay open doors.
3. **Season card slot** (Coming soon — Phase 5, needs the event backbone) — the reframed
   SeasonHighlightBubble: season name (=era binding) · countdown · own XP · own rank · next
   quest chip. NO pool figure, NO USDC, NO claim on Member Home — the cash rail (§8) is
   operator-side and lawyer-gated; recognition is the ONLY thing this card speaks.
4. **Quests strip slot** (Coming soon — Phase 5) — 2–3 quest chips (daily/weekly) with XP +
   axis tag; Learn & Earn = earn **XP** quests ride here (SETTLED).
5. **"While you were away"** (Coming soon — event indexer) — the return-visit engine from the
   origin's member-home; recency-truthful.
6. **Doors (left sidebar)** — short list only (every "Coming soon" is a public promise):
   Activity · Chronicle · Archive · Recognition · My Syndicate · Protocol graph, each on the
   existing posture/badge system; Referral door LIVE day one; operator doors invisible to
   non-operators.
7. **Recovered from MEMBER_HOME_PLAN (2026-07-13 harmonization — the plan file enters the repo
   as TIER-3 historical with a SUPERSEDED banner; these are its still-live pieces):**
   — **Wallet door** (`/member/wallet`): own SYN balance + the **APPROVALS PANEL** (the plan's
   "most important of all"): read the member's own allowances toward known spenders (Sale V3),
   explain APPROVE ≠ PAYMENT in plain words, and offer REVOKE (`approve(0)`) — a member-signed
   own-wallet transaction, never a server write; simulate-first. Plus an EXTERNAL-posture link
   to the canonical Trader Joe SYN/USDC pool (in-house add-liquidity stays deferred, LI.FI).
   Chrome harvest: entity `Wallet.tsx`/`EnhancedWallet.tsx`.
   — **Toolkit** (public): the FULL action registry rendered as the conversion engine — every
   member action visible, locks visible with reasons, operator categories absent.
   — **Fire Ledger** (`/fire`): teaser page carrying the LIVE total burn read (readable ⇒
   displayed — law #1); per-burn detail lights with the event indexer.
   — **Door cuts confirmed by the plan** (one truth = one page): Protocol graph → targets
   `/map` · Economy = `/tokenomics` · Registry = `/contracts` · SeatRecord cut (721 not
   deployed). **My Syndicate: advisor recommends DEAD** (the word evokes the downline tree;
   its content already lives in the Referral dashboard) — founder word is final; on kill,
   update the naming canon + any config reference in the same commit.
   — **Explorer**: internal explorer harvest (entity `Explorer.tsx`/`BlockExplorer.tsx` +
   origin MiniExplorer) stays the Phase 5–6 item already recorded in LIVING_ORGANISM §9.
   — Superseded plan lines (do NOT re-import): "CommissionRouterV1 deployed" (chain-verified
   NOT deployed 2026-07-12) · the two walls (both down: S7 wired, /join sells — seat #13) ·
   "thresholds to decide" (decided in CONNECTOR_LADDER_POLICY 2026-07-13).

### Alignment notes

- **MVP_FINAL_MASTER_BRIEF pieces 2+3+7** (sharebility · collectible/vanity · Referrer Kit/OG
  card) interlock with slots 3–4: the vanity layer is the acquisition tool; the season card is
  its heartbeat. The shell reserves the slots; the pieces land per the M0–M10 map.
- Ethical FOMO only: "Coming soon" + historical place-in-the-story; never a financial tease.
- One badge system (the existing posture set) for every "Coming soon" — a second system is the
  drift this doc exists to prevent.
- Harvest render source files re-confirmed on disk: `Supa-Exchange/client/src/pages/Seasons.tsx`,
  `components/SeasonHighlightBubble.tsx`, `components/badges/*`, `lib/questHelpers.ts`;
  `entity-chain/client/src/pages/Dashboard.tsx`.
