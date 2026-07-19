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

## THE PAGE STRUCTURE — CANON (founder order 2026-07-19 + the page benchmark `wf_317c67c8`:
## Binance/Bybit/OKX/Kraken/Coinbase + FirstPromoter/Rewardful/PartnerStack/Impact)
**Vertical order, binding: heading → truth banner → THE LINK HERO → the 4 figures → tabs.**
- **THE LINK HERO** (`ReferralLinkHero.tsx`): the ONE canonical link block — full URL + Copy +
  QR + Share + the two-state honesty — ABOVE the tabs, visible on EVERY tab, **exactly ONCE
  on the whole page** ("nothing scrolls between a new member and the link"). NO surface may
  repeat the bare link: the Channels composer shows only the TAGGED variant (no tag → a hint,
  never a second copy). Top padding tight (24/32px, uniform via MemberAppPage).
- 5 of 6 exchanges open on the link block; no serious portal duplicates the link — the
  2026-07-19 "mixed" duplication (link in Overview + Link-tab card + composer) is the named
  failure mode; never rebuild it.

## The 5 tabs (own-row)
1. **Overview** (default) — the standing summary ("Where you stand" → Ladder deep-link) + the
   §7 conversion claim (the words a member shares — the link itself lives in the hero above).
   No link duplication, ever.
2. **Introductions** — the per-introduction rows (M10) + "durable = still holds SYN" + 2nd-gen (later).
3. **Commissions** — money by state (paid/escrow) + the commission anatomy + the evolutive chart-
   record slot + the legal line.
4. **Ladder & recognition** — the 7-rung rail + dated raise history + own-row recognition + the season slot.
5. **Channels** (route `/referral/link`, label renamed 3.2 — the link lives in the page hero) —
   the channel composer (chips + live tagged URL + copy-per-row table, benchmark `wf_b01f310a`)
   + collapsed reference (how-it-works · eligibility · anti-abuse · terms + keccak verify) +
   alias (later).

## The ordered arc (slice by slice → preview → gate → deploy)
- ✅ **SLICE 1 — THE ELEVATION, SEALED IN PROD (`d29765d`, 2026-07-19).** `/referral` = the member
  referral SURFACE (`ReferralSurface` fork: connected → dashboard in shell; anon+prerender →
  SourceAttribution, SEO intact). Door → `/referral`; referral left `/member` (one door, one surface);
  guards updated. Reuses the proven MemberReferralDashboard as-is (no new content code).
- ✅ **SLICE 2 — THE 5 TABS, SEALED IN PROD (`5d9cb58`, Replit 7/7 green 2026-07-19;
  founder preview-approved + GO-Live).** The deep-linkable sub-routes
  `/referral/{introductions,commissions,ladder,link}` (REDIRECT-class, canonical → /referral,
  off-sitemap) + underline gold tabs (nav+links, aria-current) + figures-above with verify↗ on the
  money tiles + content split into the 5 panels + the §7 conversion hero verbatim (+VerifyOnChain)
  + the evolutive chart slot (honest — NO decorative bars) + honest-future shells for every add.
  Truth deviations from the mockup (deliberate): no sample introduction rows, no fake sparkline;
  the by-state money card renders only when the own read answered.
- ✅ **SLICE 3 — THE `&via` CHANNELS ANALYTICS (SPEC R3 whole), SEALED IN PROD (`a65df77`,
  Replit MIGRATION cycle green 2026-07-19: neondb tables + unique indexes confirmed, beacons
  204, Privacy V2 served, byte-identity; founder wording + GO-Live approved).**
  The third sanctioned write zone `src/channel/` (constitutional mechanism, guard section 10):
  anonymous 204-always beacons, daily AGGREGATE counters (no visitor identity ever — ADR-003),
  conversions receipt-verified on-chain by the server, own-row breakdown live in the Link &
  channels tab, Privacy V2 + Terms §7 legal sweep in the same commit.
- ✅ **SLICE 4 — PER-INTRODUCTION ROWS, BUILT + COMMITTED (founder GO 2026-07-19; rides the
  next deploy with 3.3).** The row model lives in memory off the existing sale lane (no
  migration): Introductions tab = the live rows table (date · who SHORT-FORM · durable pill ·
  commission · verify↗); Commissions tab = the dated record list (CHARTS POLICY: lines while
  sparse). **RECORDED GAP — rate-raise history:** SourceTermsUpdated is indexed WITHOUT its
  sourceId (topics not persisted) → per-source raise history needs decodeLifecycleLog +
  topics[1] + a SOURCE_LIFECYCLE rescan (own micro-slice); the shell stays honest meanwhile.
- **SLICES 5–6 — THE REMAINING ADDS (in order, NEXT = 5):** commission anatomy (receipt-backed
  breakdown; the static anatomy card shipped in slice 2) · recognition/season (Phase-5).

## RESEARCH LEDGER (never re-search these — the findings are canon here)
- `wf_8d4fae85` + `wf_81dd540b` (2026-07-19) — the page benchmark + SYSTEM-FIRST inventory
  (§ above: adopt/reject lists, the 5 tabs, the 48-piece system map).
- `wf_b01f310a` (2026-07-19) — the CHANNEL COMPOSER web benchmark (GA URL Builder ·
  Bitly Campaigns · FirstPromoter · Amazon/Impact/PartnerStack/Rewardful + NN/g/Baymard +
  adversarial): verdict = stateless composer, chips + live full-URL + copy-per-row table;
  REJECT shorteners / saved link objects / localStorage / per-visitor tags / QR-in-composer.
- `wf_317c67c8` (2026-07-19) — the PAGE-STRUCTURE benchmark (Binance/Bybit/OKX/Kraken/
  Coinbase/Gate + FirstPromoter/Rewardful/PartnerStack/Impact): verdict = banner → LINK HERO
  → figures → tabs; "nothing scrolls between a new member and the link"; the link exactly
  ONCE page-wide (duplication = the named failure mode).
- `wf_21cebd15` (2026-07-19) — the ROWS map: sale_event_raw holds all 24 V3 fields + tx-hash
  column; block_timestamp coverage enforced; durable per-wallet computed each cycle;
  D3 member-purchases = the serving pattern; SourceTermsUpdated indexed WITHOUT sourceId.
- `wf_9fabf210` (2026-07-19) — the &via INVARIANT map: the constitution names the channel log
  a permitted server write (§③ N2); the three-zone amendment grammar; every "read-only/zero
  analytics" claim that had to move (Privacy V2, Terms §7, COMPASS #11, replit.md).
