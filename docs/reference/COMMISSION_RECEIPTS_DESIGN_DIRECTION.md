# COMMISSION RECEIPTS — the grade-AAA design direction (slice 5.1)

**Provenance.** Founder order 2026-07-19: ALL receipts past+future (never only the latest) ·
deep external AAA benchmark · harmonize, no patchwork. Built by the 5-lens research workflow
`wf_55016fd7-5a0` (fintech histories: Stripe/Wise/Mercury/PayPal/Ramp · on-chain records:
Safe/Etherscan/Blockscout/Binance/Zerion · receipt craft: Apple/Shopify/Square/wallet-passes ·
harmonization law: NN-g/Baymard/WCAG/ARIA-APG/Material/Carbon · the repo harmony audit),
synthesized 2026-07-19. **Durable — never re-search** (RESEARCH LEDGER discipline). The mockup:
`docs/design/commissions-receipts-mockup.html`. Founder approval of the mockup gates the build.

---

# /referral/commissions — THE ONE DESIGN DIRECTION
Senior synthesis of the five lenses (Fintech · On-chain · Receipt craft · Harmony law · Repo audit). One recommendation, no options. All paths under `C:/Users/kemal/OneDrive/Documents/GitHub/syndicate-os/`.

---

## §1 THE VERDICT — the disclosure pattern

**A single vertical stack of identical receipt-ticket rows that expand IN PLACE (ARIA accordion, multiple open allowed) into the full 7-zone commission receipt. No modal, no drawer, no separate page. This is the ONLY disclosure idiom on the tab.**

Why this pattern, from the benchmarks:

- **Safe{Wallet} proves it at institutional grade**: history rows grouped by date, expanding in-place into full detail (timestamps, signers, hash, explorer link) — the closest existing analogue to "receipts, not a table," and the pattern chosen by the product whose users audit money for a living.
- **Apple Wallet proves the row↔document unity**: header fields ("the only fields visible when the pass is stacked") ARE the collapsed row; the full pass is the same object opened. Row → document must read as one artifact unfolding, not a table linking to a page.
- **NN/g's decision rules eliminate the alternatives**: modals are explicitly proscribed for row detail (they hide sibling rows); a drawer's one advantage — detail beside the list for comparison — is void because a commission's split is per-transaction arithmetic, not comparison data; a dedicated page is for detail that is a destination, and the on-chain receipt already HAS its canonical destination (Snowtrace). Carbon's escape clause covers growth: if the expanded ticket ever feels cramped (it won't — it's a fixed 7-zone artifact), the migration is to a page for ALL rows, never a second coexisting pattern.
- **Etherscan/Blockscout prove the anatomy fits the container**: a tx detail is a bounded, fixed field set with progressive disclosure — exactly what an accordion panel holds well.

**Why it stays AAA at 2 rows AND at 300:**

- **At 2**: each collapsed row is a substantial ticket-sliver (paper chrome, top perforation edge as genre marker), so two rows read as *two documents in a register*, not a failed query (the Lens-1 sparse-state finding). A month group header ("July 2026 · 2 commissions · $0.50") makes 2 rows read as "this month, complete." The record header (count + exact lifetime total) carries the page. No pagination chrome, no filters, no chart — nothing that assumes volume (PayPal's filter bar over 3 rows is the named anti-pattern).
- **At 300**: month grouping with exact subtotals gives landmarks (the "complete auditable book" feeling, vs infinite undifferentiated scroll); rows are fixed-height and identical (NN/g list-entry law — scannability comes from rigid anatomy); "Load earlier months" appears only when a boundary exists; virtualization is a pure implementation add (Ramp precedent) with zero visual change. Filters (date presets) and CSV export switch on at scale — the CSV schema IS the receipt schema, so nothing is redesigned. The document anatomy is fixed per receipt; only the list layer grows.

Rows are **collapsed by default, always** — no special-casing low N with pre-opened tickets. One state model, born scale-ready. The row alone already answers Baymard's overview question (when · who · how much · state · verify) without opening anything.

---

## §2 THE PAGE STRUCTURE — the harmonized tab, top to bottom

The frame stays as canon (heading + LifecycleBadge, gold callout with block height, ReferralLinkHero once, the FOUR StatCard figures above the tab strip — Visibility Law — then the underline tabs). Inside the **Commissions tab**:

**1. THE RECORD HEADER (one line, the work opens the tab).**
A single quiet strip in frame grammar: sans-medium title "Your commissions — the record" + `StatusPill` state summary, then the factual readback: **N commissions · lifetime total (usdExact) · latest date**. Money-by-state (paid vs in escrow) is expressed HERE as two labeled mono figures — never inside pills — and only because the four tiles above show the same figures at page altitude; the tab-level line exists to seat the list, not to duplicate a dashboard. **The current pills card is deleted** (it duplicated the tiles, put dollars in pills, and contradicted their color semantics — audit sins #4, #5, #6). Record, never returns: no trend arrow, no chart, no projection. Mercury's invariant binds: this header must equal the sum of the receipts below and the chain.

**2. THE RECEIPTS (the body — 90% of the tab).**
Month-grouped stack, newest first. Month header: mono `.syn-label` eyebrow — "JULY 2026" + right-aligned exact subtotal + count. Under it, the receipt rows (§3). Multiple rows may be open at once; same caret affordance, same position, same motion, `aria-expanded`/`aria-controls` on every trigger. The static worked example ($5.00 → $0.25) **leaves the main flow**: it moves to the reference expander (below) and doubles as the empty state's companion. A member with real receipts never scrolls past an example to reach their record (WORK-FIRST).

**3. THE REFERENCE EXPANDER (collapsed, bottom).**
One chevron section, closed by default: "How a commission is computed" — the worked example rendered in receipt grammar but chipped **"Worked example"** (neutral chip, never a state pill, never "Live · your own row" — audit sin #16 honored). One click away, never in the way.

**4. THE LEGAL SEAL (the tab's foot).**
The boundaryLine stops floating naked (sin #13). It becomes the tab's sealed footer: a dashed ZoneRule above it, then the pinned legal register text (`referralProgram.ts` boundaryLine verbatim), muted, max-w-2xl. The tab closes the way the ticket closes — boundary text sealed inside the system, not orphaned after it.

---

## §3 THE RECEIPT ROW + THE RECEIPT DOCUMENT

### The row (the stacked pass — header-tier facts only)

One fixed template, identical slot order on every row, drawn on ticket-sliver chrome (`rounded-[10px] border border-border bg-card`, a dashed top edge as the perforation genre marker):

`[date] · [who joined] ————— [state pill] [+$0.25] [caret]`

- **Date**: absolute, ONE format page-wide (e.g. "Jul 14, 2026"), sans, muted, `text-[13px]`. Absolute leads (paper-receipt semantics; relative ages go stale).
- **Who joined**: mono middle-ellipsis short address, ONE truncation rule everywhere (`0x1a2b…3c4d`), copy-on-tap in the document.
- **State pill**: `StatusPill`, status WORDS only — "Paid" (tone=live) or "In escrow" (tone=neutral); "Durable" (tone=identity) when it applies. Emphasis budget ≤2 pills per row. Money never rides inside a pill again.
- **Amount**: the primary field — `font-mono tabular-nums text-gold font-semibold`, right-aligned, exact via `usdExact` (promoted as THE one referral money formatter; the flooring `usd()` is retired from every referral surface — kills sin #7 dead).
- **Caret**: the one disclosure affordance, right edge, rotates on open.

Values wrap, never truncate. Nothing under 12px. Tap target ≥44px.

### The document (the expanded 7-zone anatomy — the ticket's sibling, re-implemented in `components/` per guard-access-state; the wallet ticket is never imported)

Opens in place below the row, same paper, dashed `ZoneRule` separators, ticket grammar throughout: mono gold zone titles `tracking-[0.18em]`, rows `text-[13px] leading-[1.9]`, sans muted labels · mono right-aligned values.

1. **HEADLINE** (Etherscan Transaction-Action pattern — plain sentence above the anatomy): "0x1a2b…3c4d joined through your introduction."
2. **RECORD LINE**: date + time · block number · receipt ID = short tx hash. The tx hash IS the receipt number — stronger than any Stripe serial.
3. **THE MONEY STORY** (Stripe gross/fee/net, Wise headline-first): Buyer paid **$5.00** → Your commission — *5% of $5.00* — **+$0.25** (gold, `text-[15px] font-semibold`) → To the company **$4.75**. The math is printed, not implied.
4. **THE SPLIT** (Blockscout internal-txns rendering): indented `pl-3.5`, one-string labels exactly as the ticket pins them — "Vault · 70%" $3.325 · "Liquidity · 20%" $0.95 · "Operations · 10%" $0.475 — decimal-spined with tabular-nums, **visibly summing to $4.75**. Arithmetic that closes on the page is the deepest trust device a receipt has. Split figures stay neutral ink — the company's anatomy, not the member's gain; gold belongs to the commission line only.
5. **STATE**: "Final — settled on-chain" for paid (Avalanche truth: ~1–2s finality, NO confirmation counters — that's an Ethereum idiom and wrong here); "In escrow" with one honest sentence of what releases it. No PARTIAL/PENDING vocabulary (guard pin).
6. **PROOF**: mono short hash + copy affordance + "Verify on Snowtrace ↗" — the ONE verify idiom (see §4). No QR here; the QR stays the wallet checkout ceremony and returns on the share card (§7).
7. **THE PERFORATION FOOT**: dashed rule, then DON'T TRUST — VERIFY, mono, letterspaced, word-for-word the checkout liturgy.

Guard compliance baked in: no arithmetic on amount fields (server-verbatim strings), exact amounts only, no truncate/whitespace-nowrap on receipt surfaces, no sub-12px/italic/serif, no dollar or hex literals in the component.

---

## §4 THE HARMONY RULES — one system, each sin named

Harmony = one shared token sheet + ONE idiom per function — never monoculture. The ticket's perforation/gold/mono grammar is propagated, not sanded off. The checklist (each rule fixes a named audit sin):

1. **One header grammar per register.** Page-furniture cards: sans-medium sentence-case title + optional xs StatusPill (the frame's grammar). Receipt paper: mono gold zone titles (the ticket's grammar). The hand-rolled weight-400 `tracking-widest` eyebrow is deleted; where an eyebrow is needed (month headers), it is the `.syn-label` token, nothing hand-rolled. *(Fixes sins #1, #2.)*
2. **One spacing rhythm.** Card inset `p-5`, header gap `mb-3`, inter-card `mb-6` — from the house scale, everywhere; any raw drifting px is a defect. *(Sin #3.)*
3. **Pills carry status words only; money is always a mono figure.** One tone = one meaning page-wide: live=paid state, neutral=escrow state, identity-gold=durable/member's money accent, proof-cyan=verification only, caution/danger=honest failure. *(Sins #4, #5.)*
4. **One figure, one render.** No figure appears twice on one screen in two formatters or two tones; the tab defers to the four tiles for page-altitude money. *(Sin #6.)*
5. **One money formatter.** `usdExact` everywhere in referral (rows, header, subtotals, tiles' meta); the flooring `usd()` is removed from the flow — the same receipt can never show two different dollar figures one card apart. Extends to the Introductions table in the same sweep. *(Sin #7.)*
6. **One verify idiom** (WCAG 3.2.4 — this is conformance, not polish): same label text everywhere, same mono short-hash format, same slot position in every unit, ONE hover polarity — rest `text-proof/80`, hover `text-proof` (brighten on approach) — and the frame tiles are corrected to match in the same slice. *(Sin #8.)*
7. **Receipt grammar is the ticket's grammar, exactly.** Dashed ZoneRules (never solid `border-border/40`), `pl-3.5` split indent, 13px/1.9 rows, "Vault · 70%" one-string labels. The anatomy card stops being a divergent re-implementation because it becomes the expanded receipt itself. *(Sin #9.)*
8. **The 12px floor holds.** All `text-[11px]` annotations on this tab are raised to 12px; the StatCard/StatusPill atom-level 11px/9px tension is flagged for its own atom slice, not copied. *(Sin #10.)*
9. **One list grammar for sibling records.** The receipt-row template defined here becomes the row grammar; the Introductions `<table>` migrates to it in a follow-up slice — designed now so zero rework. *(Sin #11.)*
10. **One money type ramp**: row amount mono semibold gold · document emphasized value 15px semibold · story/split values mono regular neutral · tile value stays StatCard's. Weight-900 sprawl ends. *(Sin #12.)*
11. **The legal line is sealed** in the tab's foot behind a dashed rule, pinned register verbatim. *(Sin #13.)*
12. **One chip family**: StatusPill for status; `.syn-label` for eyebrows; the ticket chapter chip only on ticket paper. No third rounded-full inventions. *(Sin #14.)*
13. **Two chromes total, on purpose**: frame card chrome (Card token) and ticket paper chrome — each applied whole. A card either IS a ticket or is plain furniture; no half-tickets. *(Sin #15.)*
14. **The example never impersonates the record**: "Worked example" chip, reference expander, no state pill. *(Sin #16.)*
15. **Audit method**: screenshot every unit in all four theme×width combos; every style cell cites a token or is flagged; fixed by token substitution in one pass.

---

## §5 ADOPT / REJECT LEDGER

**FINTECH — adopt**: Stripe gross/fee/net as the two-level money anatomy; "payout detail is a receipt"; summary header above the list; Mercury's header-equals-rows invariant; Wise headline-number-first + calculation shown (the 70%-vs-30% tested winner); tabular lining numerals + trailing-zeros trust typography; month grouping; green-in/+, neutral for the split, red reserved for error. **Reject**: Revolut's fragmented fees and in-surface nags; Stripe's expiring receipt links (ours are permanent by construction); PayPal's 30-day default window (our list is the complete record, forever); "repeat this" CTAs recast as recruitment ("invite another member" — banned); analytics theater at n=2; rounding; confetti/streaks.

**ON-CHAIN — adopt**: Etherscan Transaction Action (plain sentence above anatomy); Blockscout's indented internal-split rendering (literally names referral distributions as its purpose); Safe's date-grouped accordion + export-as-accounting-deliverable; Zerion's link-AND-copy proof affordance; Avalanche finality truth ("Final," never confirmation counters); Snowtrace as the canonical explorer; UID-style pseudonymous identity; middle-ellipsis mono addresses, full form one gesture away. **Reject**: Bybit's funnel analytics (conversion rates, top channels, sub-tiers); Binance's rounded BUSD aggregate-first burying of the event; Coinbase/Kraken's lagged off-platform accounting (the anti-pattern our receipts beat — embodied quietly, never stated); Robinhood-class celebration choreography; APY/projection framing.

**RECEIPT CRAFT — adopt**: the seven-block trustworthy-receipt anatomy; arithmetic-closes-on-the-page; Apple Wallet header-fields = the row recipe; front/back split as WORK-FIRST's twin; label-over-value pairs; every $0.25 gets the full anatomy (Apple's consistency — smallness never downgrades the record); Susie Lu's stay-in-the-medium discipline; flat-drawn skeuomorphism only (perforation = semantics); canonical permalink model; calm "boring in the right way" tone. **Reject**: ornamental textures/curling paper/noise; Wrapped-genre rank-flexing and FOMO share mechanics; promotional footers; exclamation marks on money. (Lu's inline proportion bar: rejected for the receipt — the "· 70%" label already carries the share, and a bar-per-receipt is decoration; charts-policy discipline wins.)

**HARMONY LAW — adopt**: the disclosure decision tree (⇒ inline expansion, one idiom); NN/g list-entry consistency law + emphasis budget; WCAG 3.2.4 as the verify-idiom anchor; ARIA APG accordion semantics; tabular-nums law; Curtis spacing vocabulary; the §6 pass/fail checklist; the unification-trap warning (harmony ≠ flattening the ticket). **Reject**: nothing — but the Frankenstein nomenclature stays internal, never founder-facing.

**REPO AUDIT — adopt**: every named sin as a work item; the token inventory as the only palette; the constraint list (no wallet imports, guard pins, vocabulary guards) as hard walls; `usdExact` promotion; the frame as fixed canon. **Reject**: copying the atoms' own 11px/9px violations into new work.

---

## §6 MOBILE + THEMES + EVOLUTIVE STATES

**Mobile (375px)**: row compresses to two lines — line 1: who joined (mono) + amount (right, tabular); line 2: date + state pill; caret persists right-center. Expanded document is the same single-column anatomy full-width (the ticket is already a 340px artifact — it's mobile-native by birth). No hover-only affordances: copy and verify are visible tap targets ≥44px. Amounts never wrap mid-figure. Accordion is NN/g-endorsed as strongest on mobile — the pattern needs no mobile fork.

**Themes**: paper is a surface token, not a picture of paper — `bg-card` in both themes, the dark-theme gold (42 92% 60%) carrying the accent. Every pill tone, the dashed rules, the proof-cyan link, and the perforation edge verified in dark AND light; contrast 1.4.3 holds; no meaning by color alone (state pills always carry words). Visual Change Law ④: all four theme×width combos verified before the preview URL is handed over.

**0 rows**: honest and calm — "No commissions yet. When someone joins through your introduction, its receipt appears here — anchored on-chain." One sentence, plus the reference expander with the worked example. No ghost rows, no teaser receipts (a projection in disguise), no growth nudge.
**1–2 rows**: exactly the full system — month header, substantial ticket-sliver rows, record header. Designed to look intentional and complete, not sparse (§1).
**300 rows**: month groups + exact subtotals + "Load earlier months" at the data boundary; date-preset filters and CSV export activate; row virtualization under the hood; identical row anatomy throughout — the member reads year three the way they read week one.
**Loading**: skeleton of the REAL row shape (not a spinner, not a generic block).
**Failed**: explicit and honest — "Couldn't reach the chain — your record is unchanged. Retry." Never a silent empty list impersonating "no commissions"; fetch state is never conflated with chain state (a rendered receipt is always Final).

---

## §7 WHAT EXTENDS LATER — zero rework

- **Share card per receipt**: the document's zones map 1:1 onto the existing `ReceiptShareCard` grammar (story-ratio, QR + short hash baked in, issuer + date inside the artifact). A quiet "Share receipt" action joins the document foot — the share artifact is the factual receipt only, self-verifying via QR/hash (a property Receiptify never had). No aggregate "I earned $X" flex cards, ever.
- **The binder**: month groups already define the book's chapters. CSV export (Safe's accounting framing: date · address · tx · amounts · split — the receipt schema verbatim), the print stylesheet (nearly free — the design is already a print genre; the receipt print block exists in index.css), and a canonical permalink per receipt (tx-anchored, Stripe `receipt_url` model) all bolt onto the fixed anatomy.
- **Filters/search at scale**: date presets and address search attach to the month-list layer; the row template never changes.
- **Introductions-tab convergence**: the receipt-row grammar becomes the one list grammar for sibling records — a token-substitution migration, already specified in §4.9.
- **Escape hatch on record**: if a receipt ever needs to be a destination (deep-linked from a notification), the permalink renders the same document standalone — Carbon's migration clause, pre-decided, never a second coexisting idiom.

**One line for the founder**: the Commissions tab becomes a register of till receipts — every commission, past and future, is the same gold-and-paper ticket, collapsed to one clean line you can scan and opened in place to the full story of the money, with the proof one tap away — one system, from the first receipt to the three-hundredth.