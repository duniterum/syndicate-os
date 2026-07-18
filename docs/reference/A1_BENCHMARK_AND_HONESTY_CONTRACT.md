# A1 — GRADE-AAA BENCHMARK + THE A1 HONESTY CONTRACT

**TIER-0 design canon for the A1 "My Activity" arc. Read this at the A1 slice (step 8 of
`MEMBER_HOME_FINISH_ORDER.md`) BEFORE the wireframe.** The two claude.ai artifacts (🧭 the
SYSTEM-FIRST inventory + 🎯 this benchmark) are the visual version; **this file is the durable
truth** (founder HARD RULE: nothing durable lives only in a chat or an artifact).

**Provenance.** Founder direction 2026-07-18/19 (emphatic): *for each slice, benchmark grade-AAA
best practices ONLINE and adapt them — do not start from a base we merely THINK is grade-AAA; the
origin built these things, we can improve them; expand beyond what I said and what you found.*
Produced by a 4-agent web-research workflow (`wf_1033299f-378`), sources credibility-graded.
See agent memory `benchmark-external-not-origin-ceiling`.

## The method (the standing way, not just for A1)
1. **Right reference class per surface** — a receipt binder learns from Stripe/Revolut/Rainbow, not
   a generic feed; a personal-vs-global feed from GitHub/Linear/Zerion/Etherscan.
2. **Adversarial filter** — take the CRAFT, reject the MANIPULATION. These products optimize for
   engagement (FOMO, number-go-up, streaks, leaderboards, email-back, confetti); we are the opposite.
3. **Our non-negotiable sieve** — every borrowed pattern must survive: verify-first · own-row
   (ADR-003) · anti-financialization · no-email · WORK-FIRST · the gold/paper design system. Else dropped.
4. **Synthesis, not copy** — lean into our unique edge (**on-chain provability**: every figure is
   PROVABLE, not asserted) so our version EXCEEDS both the origin and the external refs.
5. **Keep it tight — it FEEDS the wireframe**, it is not a thesis.

---

## THE A1 HONESTY CONTRACT (the reusable law)
Five invariants every A1 activity / receipt / history surface renders the SAME way, so they read as
one system. **This is the checklist the FIRST build of every A1 surface must pass — not a cleanup
pass after the founder complains.**

1. **VERIFY-FIRST ROW.** Every figure carries its own proof affordance — a compact `Verify ↗` that
   resolves to the mono tx-hash and links to the Avalanche explorer (Snowtrace). No number appears
   without a path to its proof; **a figure we can't prove, we don't show.** Same on desktop + mobile.
2. **OWN-ROW ONLY.** The surface shows the member's OWN events; the server never emits another
   member's address; **no leaderboard, no "others", no ranked comparison, ever** (ADR-003).
   Aggregates (pot, treasury, payout totals) are shown as the TRUE on-chain aggregate with their own
   proof link — never disaggregated into a roster of people.
3. **ANTI-FINANCIALIZATION SKIN.** Amounts are static and neutral — no animated counters, no
   green-pump, no ROI/APY/yield/%-gain, no all-time-high badges, no streaks, no countdowns, no
   confetti, no scarcity/urgency copy. State is carried by label + icon, never colour alone.
   Recognition (XP/tier) lives in a visibly different, non-monetary register and never converts to cash.
4. **HONEST THREE STATES.** Every surface ships LOADING (a skeleton matching the real layout that's
   coming — never a spinner/fake progress), EMPTY ("No receipts yet" + one true next step — never a
   teaser posing as data), and ERROR (what failed + retry — never a silent zero rendered as truth).
   **Pending stays Pending until the chain confirms; no optimistic "done".**
5. **ACCESSIBLE BY CONSTRUCTION.** Semantic `<table>`/`<th scope>` (or `role=feed` with
   `aria-posinset`/`aria-setsize`); `aria-busy` during loads; `aria-live="polite"` (never assertive)
   for new rows with no auto-scroll/flash; WCAG 2.2 AA contrast in BOTH themes (gold-on-paper
   included); full keyboard reach + visible focus + announced sort state; absolute timestamps always
   available; `prefers-reduced-motion` respected.

**Composition stays WORK-FIRST:** the surface opens on the member's real events/figures; verification
detail (full hash, block, method) is inline-on-expand or in a collapsed section at the bottom.

---

## PER-SURFACE BENCHMARK

### S0 · The receipt binder
The member's own confirmed purchases gathered into one **permanent, browsable** surface — a scannable
list, each row openable as the full receipt/ticket, with factual roll-up totals. Replaces today's
transient checkout ticket (which vanishes after purchase and can't be reopened).

**Studied:** Stripe (receipts + customer portal, *primary docs*) · Rainbow Wallet (expanded
transaction — proof as a built-in row, *primary docs*) · Apple Wallet Orders (list↔detail, *primary
docs*) · Coinbase (history + CSV/statements) · Wise/Revolut (PDF confirmations, neutral statements) ·
Baymard receipt benchmark + NN/g transactional confirmations (*authoritative UX*) · W3C WAI Tables (*W3C*).

**Adopt (craft):** two-tier list→detail · a fixed, learnable receipt anatomy (what+status+time →
reference № → itemization with any fee shown honestly → total → proof block) · status always reflects
the LATEST chain truth (incl. reversals), never a stale "success" · a roll-up that is a neutral
STATEMENT ("N receipts · total · since date"), not a scoreboard · the record belongs to the member,
retrievable at will (Save-as-PDF) · scannable + accessible (reverse-chron, right-aligned mono
figures, scoped headers) · an empty state that teaches, never fakes · **proof as a built-in row.**

**Reject (dark patterns):** expiring receipts (Stripe links die in 30 days) — ours are **permanent**
(on-chain-anchored → verifiable forever, even independently of us) · email-as-canonical-receipt
(NO-EMAIL) · upsell/cross-sell on the receipt ("buy again", promos) · "you spent X" spend-framing &
Revolut/Monzo spend-analytics nudges · any buyer directory/leaderboard (ADR-003) · countdown/scarcity
on a record · re-engagement "you have a new receipt!" pings · asserted "Verified" badges (trust
theatre) · loyalty/gamified purchase-count badges.

**Our version:** opens on THE WORK (the receipt list), no hero/marketing. Roll-up strip: factual
("N receipts · [total] USDC · since [date]"), gold accent reserved for the total only. List: each
purchase one row = date · item (human name) · amount (right-aligned mono) · status pill (Confirmed /
Refunded, latest chain truth) · a small proof handle; the whole row is a link; own-row only. Detail =
the full permanent ticket, fixed anatomy ending in a PROOF block (tx hash → Snowtrace, block/
confirmations, copy actions) + Save-as-PDF. No expiry/email/upsell. Explainers collapse to the bottom.

**Our edge:** every other product hands the member a CLAIM; here every receipt and the roll-up total
are RECONSTRUCTED FROM and LINK TO the actual Avalanche tx — the status is block-confirmed, the total
is the auditable sum of provable rows. A receipt that is **true**, not merely stated, and stays theirs
even if we disappeared.

**Founder decisions (none blocking):** (1) roll-up = lifetime total only, or grouped by year;
(2) PDF/CSV export in S0 or a fast-follow; (3) the exact human item label (read on screen);
(4) row = total-only with fee detail in the ticket (recommended) vs fee on the row.

### S1 · The "My | Protocol" pulse lens
One chronological feed with a toggle between the member's OWN events ("Mine") and the whole protocol's
public events ("Protocol"). Today the pulse is Protocol-only; the lens is what A1 adds.

**Studied:** GitHub (your-activity vs feed + the anti-doxx lesson from its gaps) · Linear inbox
(*primary docs*) · Zerion/Zapper/Rainbow/Etherscan (decode raw logs → human intent, from the viewer's
perspective) · segmented-control-vs-tabs blueprint (*Material/HIG-aligned*) · NN/g empty states +
Eleken notification UX (*teardown*) · the "N new" news-feed refresh pattern.

**Adopt (craft):** a **segmented control, not tabs** (Mine|Protocol switch the LENS on one shared
grammar, in place) · one scannable event-line grammar, decoded to human INTENT (one "You were
recognized", not a stack of raw transfers) · time-bucket sticky day headers + honest batching ("12
joined today") · **on-demand "N new" pill** (background poll, user merges, scroll preserved) — never
a silent auto-inject · read/unread is earned/calm (ideally owned by the bell, not the feed) · proof
inline per row · work-first (raw log/addresses/block-№ in a bottom expander).

**Reject (dark patterns):** silent auto-injection to fake liveliness · red-dot/unread pressure on
non-actionable events · flattening signal (trivial = important, to inflate activity) · cross-channel
stacking + any email · FOMO/scarcity/countdown · streaks-as-pressure · number-go-up / PnL badges on
rows · a directory/social-graph feed of other members (ADR-003) · vanity/comparison metrics ("top 5%").

**Our version:** one feed, a two-segment `[ Mine | Protocol ]` control (gold on the selected side).
Event row = restrained honest-function type token → plain-language sentence (human labels) → amount
where real → relative time (absolute on expand) → inline `Verified on-chain` chip (tx → Snowtrace) +
confirmed/pending/failed dot; grouped under sticky day headers. **Mine** = strictly own-row, behind
the sign-in wall (not-connected → conversion state, never others' data as a teaser). **Protocol** =
public events but **member-level de-identified** ("A member joined" / "12 today") with contract-level
facts shown in full — completeness of the pulse without a directory of who. Refresh = "N new" pill +
an "as of block N" freshness stamp (no fake ticker).

**Our edge:** every row is provable and we make provability the primary citizen of the line. Mine
becomes a personal ledger where every self-figure is independently verifiable; Protocol turns public
chain facts into a trustworthy, **non-doxxing** pulse; "as of block N" is verifiable freshness. The
exact inverse of an engagement feed.

**Founder decisions:** (1) default lens for a connected member = **Mine-first** (fallback to Protocol
when Mine is empty) vs Protocol-as-universal-default — recommend Mine-first; (2) section name stays
"Pulse", toggle = Mine/Protocol; (3) confirm the ADR-003 de-identification line for Protocol member
events; (4) recommend the feed stays a calm ledger with NO unread state — the bell owns "unread".

### S2 · Per-row histories & detail (M10)
The member's OWN itemized histories — introductions (who/when), receipts, commissions — each a
scannable row expanding to a verifiable detail. Today introductions are a COUNT only.

**Studied:** NN/g Data Tables (four user tasks; human-readable first column; NON-modal side panel for
detail) + Progressive Disclosure + Empty States (*authoritative UX*) · Stripe Payment Details
(*primary docs*) · Mercury transactions redesign (amount next to label; detail = timeline) · Coinbase
(row→explorer verify) · Carbon status-indicator pattern (colour+icon+text) · Baymard self-service
(sort AND filter, both visible).

**Adopt (craft):** lead each row with a HUMAN label + mono date (not a hash) · build for the four
table tasks (scan/compare/detail/act) with a visible FILTER and a visible SORT (distinct jobs) ·
row→detail in a **non-modal right-side drawer** (list stays visible; never a modal covering
neighbours, never an inline accordion) · the collapsed row carries enough to decide to open it (strong
scent; two levels max) · status = colour + icon + text, legible in grayscale · right-align tabular
figures adjacent to their label; zebra/hover · the detail is an EVENT TIMELINE (submitted → confirmed
at block N), not a field dump · empty state = onboarding.

**Reject (dark patterns):** a "total earned" hero ticker framing the ledger as growth · scarcity/FOMO
in the history · streak/leaderboard/social-proof comparison of intro counts · **directory temptation**
(linking an introduced person's row to their profile/balance/downline — ADR-003) · colour-only status
· email-a-copy receipts · asserted figures with no proof · infinite-scroll with no anchor/total ·
cross-sell promo rows in the ledger.

**Our version:** opens on the itemized record ("47 entries — every one verifiable"); controls row =
type-filter chips (All / Introductions / Receipts / Commissions) + a date sort. Row = mono date +
serif human label + privacy-safe counterpart hint (**a pseudonymous handle the member already knows —
NEVER the other's address or a profile link**) + right-aligned amount (**introductions carry a neutral
NON-CASH marker, never $0** — an intro is never read as a payout) + status pill + a persistent VERIFY
handle **on the row**. Row → non-modal right drawer **headlined by the proof** (full hash + copy +
explorer) → event timeline → the figure with a "how this was computed" trace to the on-chain event →
in-app download of THIS record (no email). Mobile: stacked cards, full-height sheet, bounded
pagination with an explicit count (no infinite scroll).

**Our edge:** provability is the PRIMARY column, not a footnote (Coinbase hides the explorer one level
down; Stripe/Mercury hand you a receipt you must trust). Here the drawer's HEADLINE is the proof and
the whole history can be independently re-derived by the member (or their accountant) without trusting
us. A commission isn't a server claim — it's a pointer to the chain.

**Founder decisions:** (1) how much "who" on an intro row (warm pseudonymous handle vs minimal "a
member you introduced") — both ADR-003-safe; (2) one unified stream (filter) vs three tabs — recommend
unified stream; (3) do introductions (no cash) share the list with commissions/receipts (chrono-honest)
or sit in their own lane (removes payout ambiguity); (4) "Confirmed on-chain" (leans into the edge) vs
a quieter "Confirmed" — recommend the louder pill.

---

## The mirror rule (leave the origin's baggage behind)
Harvest the origin's completeness/ambition, never its constraints. Do NOT let ride back with the
harvest: the read-only-era hedging ("pending / not portable / candidate, not official"), the XP/level
gain-framing (Supa's `xp_earned`/`level_up`/`streak_milestone`), or the email/DB reflex. Today's
system is more advanced; we take what the origin had MORE of, rebuilt WORK-FIRST and honest.
See `docs/direction/MEMBER_HOME_FINISH_ORDER.md` (the finish order) + the SYSTEM-FIRST inventory.

## Sources (credibility-graded)
Primary/product docs: Stripe (receipts, customer-portal, payment-details) · Rainbow · Apple Wallet ·
Coinbase · Wise/Revolut · Linear · Etherscan · W3C WAI-ARIA feed pattern · Zerodha (anti-dark-pattern
doctrine). Authoritative UX: Nielsen Norman Group (data tables, progressive disclosure, empty states,
transactional confirmations, sneaking) · Baymard (receipt benchmark, self-service) · W3C WAI Tables ·
Carbon Design System (status) · FTC "Bringing Dark Patterns to Light" (2022) · deceptive.design
(Brignull's 18-pattern taxonomy). Teardown: Zerion/Zapper decoding · Mercury transactions · Eleken
notification UX · Cryptowisser crypto UX dark patterns · segmented-control blueprints.
