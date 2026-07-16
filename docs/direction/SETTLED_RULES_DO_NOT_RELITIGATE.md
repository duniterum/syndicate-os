# SETTLED RULES — DO NOT RE-LITIGATE
*DIRECTION doc. **Purpose: kill the recurring "is X allowed?" questions at the root** so no
session — founder, Claude (advisor), or Claude Code — ever wastes time re-deciding them. The
founder is the authority; only **LEGAL + SECURITY + TRUTH-FIRST** bind. Not legal advice — a
crypto lawyer validates the money-touching items before any launch (Phase-5 / post-MVP).*

*Written 2026-07-11. Companion to `GAMIFICATION_LEGAL_DOCTRINE.md` (full recognition-points
structure) and `src/config/sourceAttributionTerminology.ts` (referral/introduction copy).
Register TIER-0 in `00_CANON_INDEX.md` — read every boot.*

---

## THE TEST (resolves any NEW case in 10 seconds — apply this before flagging anything)

A thing is **SAFE** when it is EITHER:
- **Recognition** — non-financial, **non-transferable, no cash value, not convertible**:
  status · XP · badge · level · rank · access · cosmetic · a place in the Chronicle; OR
- **Service payment** — cash/USDC paid for **WORK DONE** (introducing a customer, completing
  a defined task, a contribution). A fee for effort, not a return on capital.

A thing is a **RED LINE** when it is ANY of:
- **Yield / security** — a return paid on **capital the person supplied**, or profit expected
  from the protocol's / others' efforts (Howey). *(This is the MetaMask-"earn-4%-APY" kind.)*
- **Token-as-reward** — our own **SYN handed out as a reward/incentive** for engagement,
  promo, or tasks (the SEC "Tomahawk bounty" trap). SYN leaves the treasury only via the
  sale/seat path.
- **Gambling** — pay-to-enter **+ random chance + prize**.
- **Cash-convertible recognition** — recognition points that can be **redeemed/converted to
  money** (that turns the recognition layer into currency).

**The WORD is never the deciding factor.** "earn", "referral", "commission", "reward", "pot",
"season", "cagnotte" are ordinary business vocabulary — the **MECHANISM** decides, not the word.

---

## Settled cases (do not re-open)

### 1. EARN / COMMISSION / REFERRAL → **SETTLED YES.** It is the business model.
A member **introduces** another; an eligible completed introduction may pay a transparent
**acquisition commission in USDC, shown by receipt**. This is a **service fee** (the introducer
does their own work — not a passive return on capital), so it is **not a security** — the same
model as Amazon Associates, Binance, Crypto.com.
- **Hard rails:** paid in **USDC/fiat, NEVER in SYN**; **single-level, no downline / multi-level**
  (multi-level resembles a pyramid); **transparent / disclosed** (FTC). Public framing =
  "verified introduction / introduced by"; "referral / commission" is fine as mechanism
  vocabulary. Currently **PAUSED** (CommissionRouterV1 not deployed) — *paused ≠ forbidden.*
- **Never framed as:** passive income, token yield, downline, profit promise, investment.

### 2. XP / GAMIFICATION / SEASONS / "CAGNOTTE" → **SETTLED** (structure fixed).
- **"Learn & Earn" = "Learn & earn XP."** XP · badges · levels · rank · season leaderboards ·
  a place in the Chronicle = **recognition → always safe, always free, on-brand, the default.**
  Recognition stays the throne (never a richest-payer / wealth ranking).
- **The founder's marketing insight is endorsed:** instead of paying an external quest vendor
  (Zealy), the marketing budget flows **to members / stays inside the ecosystem**. The living
  protocol (Guide, Activity, Chronicle) is its own marketing engine, so engagement is near-free.
- **The reward money is the COMPANY's, not the members'** (clarified 2026-07-11). Exactly like
  **Fortnite / Netflix reward with their own revenue** — the company voluntarily spends part of
  ITS money. A member buys a **seat** (the product), never "a share of a returns pool." So the
  "pooling = security" concern applies ONLY to *members' money redistributed to members by rank*
  — which is NOT our model. A company-funded reward for effort is a legal marketing **gift**.
- **Season "cagnotte" — the compliant structures (harvest Supa's MECHANISM, reframe it):**
  - ❌ **Do NOT copy Supa's XP→USDC conversion** (recognition points redeemable for real money).
    That is banned by `GAMIFICATION_LEGAL_DOCTRINE.md` for a real reason: it makes XP a currency.
  - ✅ **Default (free, safest, on-brand, autonomous forever):** the season pays **recognition /
    access / cosmetic / featured placement**. No pot, no money, no operator — runs itself.
  - ✅ **If real cash to members is wanted:** company money, **discretionary + effort-based**
    (a task→USDC bounty, "do X → receive Y USDC"), kept **separate from XP** (XP stays
    non-cashable). Rails: **USDC never SYN · effort-based not purchase-proportional · not
    pay-to-enter-random-draw · automate the DISTRIBUTION but keep the DECISION to fund
    discretionary (no fixed perpetual auto-route of a % into a member pot; never touch the
    locked 70/20/10) · transparent.** Security comes from **structure, not secrecy** — done this
    way it is legal AND sayable. A **founder call per season**, within these rails — not a blocker.

### 3. YIELD / APY ON CAPITAL → **SETTLED NO.** The MetaMask-style security path. Not our model.

### 4. SYN AS A REWARD / INCENTIVE → **SETTLED NO.** SYN is distributed only via the sale/seat
path — never as a promo, quest, season, or engagement reward.

### 5. GAMBLING (paid entry + random chance + prize) → **SETTLED NO.**

### 6. RECEIPT & OUTWARD-ARTIFACT SETTLED BLOCK → **SETTLED** (founder-ordered engraving,
2026-07-17 — this session regressed on THREE already-settled rules: banned vocabulary
returning (coupon · payout · contribution · routing in buyer-facing text), the dead #14
mock returning, and amount-hiding against the Visibility Law. Each cost the founder a
re-explanation. This block exists so the NEXT violation is a RED BUILD, never a founder
explanation. Enforcement: `artifacts/studio/scripts/guard-receipt-ticket.ts` — blocking
in the studio gate.)

- **① AMOUNTS ARE NEVER HIDDEN — on any surface or any artifact** (`CANON_VISIBILITY_LAW.md`,
  TIER-0: on a chain, "hiding" does not exist; the amount is ALREADY public in the very
  transaction our verify links and QR codes open. Hiding it on a card/ticket/page while
  linking to it is THEATRE — the exact class the law forbids. **We have NO SHAME.**) The one
  structural discipline stays what it always was: the SERVER never emits a MEMBER address —
  nothing else is ever concealed. "Recognition, never money" governs RANKS and the public
  feed's own-voice (the capital red line: rung without amount) — it is NOT a license to
  strip real figures from a member's own receipt artifacts. *Guard: the share card must
  render the commerce total (amounts-visible pin); the ticket's money zones are pinned.*
- **② THE BUYER-FACING LEXICON IS SETTLED.** Affirmative: **"proof of purchase" · "TOTAL
  PAID" · "WHERE YOUR MONEY WENT" · "paid first"**. Dead and staying dead in buyer-facing
  text: **contribution · routed/routing · payout · coupon (even negated — the truncation
  law) · net-routed**. *Guard: buyer's-tongue pins + red-line vocabulary pins on the whole
  receipt module; `guard-forbidden-copy` site-wide.*
- **③ REAL-ROW ONLY — the mock class can never return.** Every figure on a money document
  is a real indexed event's own field (ADR-001 REAL-ROW + TICKET-AMOUNTS-ARE-EXACT); no
  dollar-figure or wallet/tx-hash literal may exist in the receipt module, and NO page may
  ever mount the ticket/builder. *Guard: the REAL-ROW CLASS pins.*
- **④ READABILITY BEFORE DECORATION.** Nothing decorative may cost contrast or size
  (ADR-001 floor: ≥12px, no italic/serif on the ticket surface, full-contrast doctrine
  line). *Guard: readability pins (italic/font-serif banned, sub-12px banned).*

---

## For Claude (advisor) and Claude Code — behavioral rule

**Do NOT re-flag** "earn / referral / commission / reward / season / cagnotte / XP" as doctrine
risks — the founder has settled them here. **Flag ONLY a genuine RED-LINE mechanism** (yield on
capital · SYN-as-reward · gambling · cash-convertible recognition), and flag it **once**, then
proceed. When a new case appears, apply **THE TEST** above and resolve it yourself — do not send
the founder into a repeat explanation. This doc is authoritative; the money-touching items still
get a crypto-lawyer pass at Phase-5 before launch.
