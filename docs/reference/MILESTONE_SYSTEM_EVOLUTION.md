# THE MILESTONE SYSTEM — the evolutive design (the full-picture rethink)

*REFERENCE doc (durable — read at the M-EVO slices, never re-search). Founder-ordered
2026-07-22 ("une dizaine de milestones ce n'est pas suffisant… pense avec la full picture…
s'arrêter à First 10K is laughable"). Research: goal-gradient/achievement psychology +
community-milestone marketing (sources at foot). Companion: the A-arc dossier
(WALLET_TRACKING_AND_ACTIVITY_REBUILD.md) · milestoneReadmodel.ts (the 11-def v1).*

---

## 1. THE MILESTONE CONSTITUTION (the design laws — founder-approvable once, then forever)

1. **THE LADDER LAW — no family ever ends.** Every family always shows a NEXT rung; the
   seat ladder runs to the bytecode's FINAL SEAT (1,000,000). "First 10K" was a start,
   never a ceiling.
2. **THE DENSITY CURVE (goal-gradient).** Dense rungs early (1 · 10 · 25 · 50 · 100 —
   celebration is frequent while the story is young), log-spaced at scale (100k · 250k ·
   1M) so each seal stays RARE enough to matter (badge inflation kills meaning — the
   research is unambiguous).
3. **EVERY MILESTONE HAS A NAME.** "The First Hundred", "Genesis sealed", "One percent of
   the supply burned" — an institution names its moments; a bare number is bookkeeping.
4. **MONOTONIC-ONLY.** A milestone can never un-happen. Cumulative counts and
   crossed-ever thresholds only; no market states (pool depth may fall — it is a figure,
   never a milestone).
5. **TRUTH LAWS unchanged.** Sealed = anchored to the exact crossing transaction from the
   gapless indexed history; approaching bars only over real figures; retro-sealing is
   LEGITIMATE (a newly registered rung the chain already crossed seals at its TRUE
   historical anchor — the history exists, nothing is invented).
6. **THE CELEBRATION PIPELINE (company view — every seal works for the business).** One
   crossing automatically becomes: ① the activity line (live today) · ② a notification
   (the auto-generator when it lands; founder broadcast until then) · ③ a PAINTED SHARE
   CARD (the R-CARDS painter reused — the founder's and the referrers' zero-writing
   ammo; joins the kit's living-moments rail) · ④ a Chronicle CANDIDATE for
   chapter-grade crossings (promotion stays a human act) · ⑤ later, the member
   co-witness line ("you held seat #N when the protocol crossed X" — M3's substance).
7. **MEMBER-SATISFYING, never member-paying.** A milestone yields recognition, story and
   shareable pride — never cash, never a rate, never a draw (SETTLED_RULES).
8. **THE EVOLUTIVE REGISTRY (the point).** `MilestoneDef` gains a `family` axis; adding a
   protocol module (Alias · Swap/Bridge · NFT · Marketplace…) = adding its FAMILY of
   defs + its read source in the module's OWN slice — the heartbeat-completeness
   invariant extends to milestones: **a module ships with its milestone family or the
   slice is incomplete.**

## 2. THE FAMILIES + LADDERS (the v2 registry — ~70 defs now, unbounded by design)

**MEMBERSHIP (seats — the master ladder; the era ends ARE rungs: one ladder, double
meaning — chapter sealed + the rate table's page turn):**
1 (sealed) · 10 · 25 · 50 · 100 (sealed) · 250 · **333 Genesis/Ch I seals + era 2** ·
500 · **1,000 Ch II + era 3** · 2,000 · **3,333 Ch III + era 4** · 5,000 ·
**10,000 Ch IV + era 5** · **25,000 era 6** · **50,000 era 7** · **100,000 era 8** ·
**250,000 era 9** · 500,000 · **1,000,000 — THE FINAL SEAT** (the bytecode's own end).

**ECONOMY (cumulative USDC routed through the sale, 70/20/10):**
$100 (sealed) · $1k (sealed) · $10k · $25k · $50k · $100k · $250k · $500k · **$1M** ·
$2.5M · $5M · **$10M** · $25M · $50M · **$100M**.

**FIRE (the burn record — two rungs kinds):**
acts: first burn · 10 · 25 · 50 · 100 · 333 Proof-of-Burn acts;
cumulative SYN: 10k · 50k · 100k · 500k · **1M** · 5M · **10M = 1% of the supply** ·
25M (2.5%) · 50M (5%) · **100M = 10% of the supply** (institutional register: percent
of the fixed 1B reads like history).

**REFERRAL (the growth engine's own story):**
first source active (sealed — Seat #3, 2026-07-22!) · 5 · 10 · 25 · 50 · 100 active
sources · first commission paid (sealed) · $100 · $1k · $10k · $100k paid to referrers ·
**the first second-generation introduction** (the MVP brief's queen proof — a named
milestone the day it happens).

**LIQUIDITY (acts only — monotonic):** first LP add (sealed) · 10 · 25 · 50 adds.

**ARCHIVE / MEMORY:** first of EACH artifact kind (auto per new label — evolutive) ·
25 · 50 · 100 · 333 artifacts minted.

**PROTOCOL TIME (v2 candidates):** chain anniversaries (6 months · 1 year · each year —
block-time derived, never a wall clock).

**RESERVED FAMILIES (labels, not locks — each ships WITH its module):**
ALIAS: first alias claimed · 10 · 100 · 1,000 · 10,000 aliases.
RAMP (Swap/Bridge): first swap through the house ramp · 100 swaps · volume $10k ·
$100k · $1M · $10M.
NFT / MARKETPLACE: first listing · first sale · 100 · 1,000 sales · volume ladder.

## 3. THE PANEL v2 (what members see — every family satisfying)

Per-FAMILY lanes: sealed count + THE NEXT rung with its honest progress bar
(goal-gradient per family — several bars near their goal at any time, not one distant
number) · the full sealed history in the collapsed expander (the newsroom's Z4 grammar
holds) · each family named + iconed in the house language · the Genesis FOMO line stays
the headline. Every new seal: gold flash line in the live feed + its painted card.

## 4. THE SLICES

> **STATUS 2026-07-22: M-EVO-1 ✅ + M-EVO-2 ✅ BUILT (AW-4 GO; one cycle with the
> A-arc; backbone guard 160). RESERVED, dated, never re-invent: commissions-paid
> + second-generation ladders (the sale-lane raw input carries no commission
> field yet — its own input-widening micro-slice); PROTOCOL-TIME anniversaries
> (v2); the celebration layer = M-EVO-3 (own cycle); alias/ramp/nft families
> ride their modules (law 8).**

| # | Slice | Content | Deploy |
|---|---|---|---|
| **M-EVO-1** | The registry v2 (server) | `family` axis + the §2 ladders on the EXISTING read models (seats/usdc/burn acts+cumulative/referral/lp-adds/archive counts — all already indexed; zero new scans) + retro-sealing at true anchors + guard pins (ladder monotonicity · density · anchors) | 🚀 server |
| **M-EVO-2** | The panel v2 (client) | per-family lanes + next-per-family + the expander history; /activity Z4 swaps in | 🚀 client — same cycle as M-EVO-1 |
| **M-EVO-3** | The celebration layer | the painted milestone card (painter reuse, 1200×630, real anchors + QR verify) + share door + the kit's living-moments rail pickup; notification-on-seal rides the auto-generator (or founder broadcast until it lands) | own cycle |
| — | Future families | Alias/Ramp/NFT/Marketplace families ride their module slices (Constitution §1.8 — invariant, never a backlog) | with each module |

## 5. Research grounding (external, filtered by our laws)

Goal-gradient effect — motivation intensifies near a visible goal; break big goals into
visible rungs (Raw.Studio, Learning Loop, LogRocket). Celebration matched to
achievement — celebrate meaningfully, not constantly; badge inflation damages
engagement (Learning Loop achievements, Guul). Variety + surprise sustain long-term
engagement (Sam Liberty's progress-mechanics taxonomy). Crypto community practice:
milestones as collective celebration + announcement beats across X/PR — measurable
community-growth signals (Coinbound, Blockchain-Ads, EAK). REJECTED by our laws:
invented urgency, paid-entry draws, cash-convertible recognition, fake scarcity.
