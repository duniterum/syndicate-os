# REFERRAL PAGE — grade-AAA design canon (benchmark · system inventory · the 5-tab plan)

**TIER-0 design canon for the /referral rebuild arc. Read at each referral slice.** The durable
record of the 2026-07-19 deep research; the **visual mockups live in the repo**:
`docs/design/referral-page-mockup.html` (the single-page redesign) and
`docs/design/referral-tabs-mockup.html` (the interactive 5-tab version — click through it).
Method + honesty contract: `docs/reference/A1_BENCHMARK_AND_HONESTY_CONTRACT.md`. Founder GO
2026-07-19: **5 tabs · do it ALL in the right order · elevate now · GO-LIVE.**

**Provenance.** Two 4-agent web+repo workflows: the design benchmark (`wf_8d4fae85`) and the
SYSTEM-FIRST inventory + sub-nav benchmark (`wf_81dd540b`). Sources credibility-graded.

## The doctrine that binds every referral surface
- **Own-row.** The member's own standing only.
- **VISIBILITY LAW (address ≠ identity).** We HIDE NOTHING on-chain — chain-emitted addresses
  (the buyer/recipient the chain publishes, the wallet that pays you / the one you pay) ARE shown
  short-form (the client reads the chain like an explorer). The RED LINE is the wallet↔PERSON link:
  **never a name / alias / email** (no PII; alias = opt-in self-publish), never a directory/search/
  reverse-index, never exposing a non-consenting member. `CANON_VISIBILITY_LAW.md`.
- **NO MLM.** No downline tree, no "recruit N more", no leaderboard of other members, no multi-tier
  override commissions. One completed introduction, one bounded commission.
- **Legal line (pinned).** "A referral commission is a bounded, one-time payment for a completed
  introduction — not token yield, not passive income, not equity, not a guarantee of appreciation."
- **CHARTS = records, not returns.** No "your commissions going up" line; a chart plots a dated,
  verifiable record, framed as a statement, in an evolutive slot honest when sparse (2 payments ≠ a
  trend). `A1_BENCHMARK_AND_HONESTY_CONTRACT.md` CHARTS POLICY.
- **WORK-FIRST + Visibility Law composition.** The money (the figures) stays ABOVE the tabs — never
  behind a tab; reference (terms/eligibility/anti-abuse) collapses to the bottom.

## The benchmark — craft taken, manipulation rejected
**Studied (credibility-graded):** PartnerStack · Binance Referral · Dub · Rewardful · Stripe
Connect/Express · Patreon · Gumroad · YouTube Studio · Voucherify · ReferralCandy · Avark Web3-UX —
and NN/g · Baymard · deceptive.design · FTC.
**Adopt (craft):** one-screen standing (no drill-down) · a KPI stat spine · the referral link as a
hero utility block (code+link+QR+share, the Binance cluster) · the ladder as a HORIZONTAL RAIL (a
road, never a leaderboard; the bar floored, never empty) · settled-vs-owed each labelled (Stripe's
trust discipline) · verify-first on every figure · honest three states.
**Reject (dark patterns):** downline/"who you introduced" roster · leaderboards/"top referrers" ·
earnings projections / "earn up to X" / EPC calculators · countdowns/FOMO/"1 invite away" · recruit-
more / multi-tier overrides · confetti/number-go-up · vague-reward/hidden-rules · asserted
unverifiable balances. (Patreon REMOVED its payout progress bar — a bar filling toward money
misleads; our ladder bar is a COUNT-progress toward a durable-introduction threshold, never money.)
**Our edge:** the payment is paid ON-CHAIN, INSIDE the buyer's own transaction, and every figure is
independently verifiable — provability + instant-in-tx is the thing no affiliate dashboard can match.

## SYSTEM-FIRST inventory — what we can ADD (the whole system, not 4 lanes)
Deep-searched code (48 pieces) + canon/roadmap + the origin quarry. Beyond today's standing +
ladder + link, the system justifies:
1. **`&via` channel analytics (SPEC R3)** — the biggest gap: add `&via=twitter/blog` to your link →
   clicks · conversions per channel, each tied to an on-chain receipt. Self-service, off-chain,
   zero founder/zero transaction — "the thing nobody can copy." (The click STORE = a small backend.)
2. **Per-introduction rows (M10)** — the attributed joins row-by-row (on-chain address short-form ·
   amount · tx · status — never name/alias/email). Needs the row-level adapter (server).
3. **Ladder & recognition as a sub-system** — the full 7 rungs, a dated history of rate raises
   (SourceTermsUpdated), promotion-due detail, the member's OWN recognition rank (`goodRankings` +
   `rankingDoctrine` exist; own-row, NEVER a board of others).
4. **The season / competition axis** — XP, recognition rankings, the lawyer-gated merit pot
   (Phase-5; the Supa gamification engine is the quarry). Recognition, never a cash promise.
5. **The flagship conversion copy (REFERRAL-SHOWCASE)** — the unique-claim lines ("the payout is
   part of the purchase" · "can never break a sale — and can never be lost" · "nothing to claim") —
   canon, never yet applied.
6. **Commission anatomy + state machine** ($5 → 5% → paid-in-tx; Active/Applied/Eligible/Pending/
   Paid/Ineligible/Flagged/Paused/Expired) · the receipt breakdown (gross→commission→net→70/20/10) ·
   escrow claim · the Referrer Kit / OG card · the alias layer (M8) · 2nd-generation own-row view.
Ladder truth (`config/connectorLadder.ts`): Emerging 5% (0) · Active 5% (3, title) · Trusted 6% (10)
· Established 7% (25) · Durable 8% (60) · Foundational 10% (150) · Summit 12% (300, the on-chain cap).

## The sub-nav benchmark (Linear · Stripe · Vercel · NN/g · Material)
- **UNDERLINE text tabs** (level-2), NOT the pill/segmented control (reserve segmented for in-CARD
  lenses). Three distinct nav treatments (left doors · underline tabs · mobile chips) — never stacked
  look-alikes.
- The tab strip sits under the H1 + honesty banner; **the four figures stay ABOVE it** (Visibility
  Law — money never behind a tab). A tab click re-renders only the panel below.
- **Real deep-linkable routes** `/referral` · `/referral/introductions` · `/referral/commissions` ·
  `/referral/ladder` · `/referral/link` — the URL decides the tab (refresh/back/bookmark/**share** all
  land right; vital for a share surface). This is the ENABLING architecture change.
- Hold to ~5 tabs; if the season/leaderboard later pushes past ~5, promote to a sub-sidebar (never a
  "More…" overflow, never a tab-in-a-tab). Title-Case destination nouns. Radix Tabs + keyboard +
  gold underline (shape+weight, not colour-alone). Instant switch, no spinner.
- **Anti-patterns to avoid:** nested tabs · overflow carousel · mixing in-page tabs with nav-tabs ·
  client-only-no-URL · colour-only active · jargon labels · burying the work/money behind a tab ·
  "remember my last tab" overriding a deep link · fake loading on tab switch.

## The 5 tabs (own-row)
1. **Overview** (default) — the conversion hero + standing summary + ladder mini + the verified-
   introducer share card.
2. **Introductions** — the per-introduction rows (M10) + "durable = still holds SYN" + 2nd-gen (later).
3. **Commissions** — money by state (paid/escrow) + the commission anatomy + the evolutive chart-
   record slot + the legal line.
4. **Ladder & recognition** — the 7-rung rail + dated raise history + own-row recognition + the season slot.
5. **Link & channels** — link/QR/share/Referrer-kit + the `&via` channels analytics + collapsed
   reference (how-it-works · eligibility · anti-abuse · terms + keccak verify) + alias (later).

## The ordered arc (slice by slice → preview → gate → deploy)
- ✅ **SLICE 1 — THE ELEVATION, SEALED IN PROD (`d29765d`, 2026-07-19).** `/referral` = the member
  referral SURFACE (`ReferralSurface` fork: connected → dashboard in shell; anon+prerender →
  SourceAttribution, SEO intact). Door → `/referral`; referral left `/member` (one door, one surface);
  guards updated. Reuses the proven MemberReferralDashboard as-is (no new content code).
- **SLICE 2 — THE 5 TABS** on this stable base (the deep-linkable sub-routes + underline tabs +
  figures-above + content reorganised + the conversion hero + the evolutive chart slot).
- **SLICES 3–6 — THE ADDS (in order):** `&via` channels analytics · per-introduction rows · commission
  anatomy · recognition/season. Backend pieces land as honest-future states; the shell exists first.
