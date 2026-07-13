# THE CONNECTOR LADDER — FINAL (founder-decided 2026-07-13, binding)

**Status: DECIDED. This document supersedes every earlier ladder version** — including
`SPEC_REFERRAL_SYSTEM.md` §⑤'s rate table (5/7/9/10.5/12) and any older 15/20/30%
demotion ladder (dead). Advisor source: the founder's `_research/ESCALIER_CONNECTOR.md`
(out-of-repo working file); **this in-repo document is the canonical capture** per the
HARD RULE (every durable decision lives IN the repo). Authority: the founder, then the
deployed smart contracts.

---

## 1. Two decoupled ladders

| | TITLES | RATES |
|---|---|---|
| Nature | dense, **free** | rare, **irreversible** |
| At every rung | badge + public event + season points | — |
| Changes | often (engagement heartbeat) | seldom; **a rate never decreases, never retroactive** |

A title celebrates; a rate pays. They advance together at some rungs and separately at
others (Active raises the title only). Decoupling keeps recognition generous while the
money curve stays conservative and irreversible-safe.

## 2. The rungs — all-automatic

**The threshold decides; nobody grants or refuses. The founder's signature only executes.**

| Rung | Durable introductions | Commission rate |
|---|---|---|
| **Emerging** | 0 | **5%** (500 bps) |
| **Active** | 3 | 5% — *title + season points only, no raise* |
| **Trusted** | 10 | **6%** (600 bps) |
| **Established** | 25 | **7%** (700 bps) |
| **Durable** | 60 | **8%** (800 bps) |
| **Foundational** | 150 | **10%** (1000 bps) |
| **Summit** | 300 | **12%** (1200 bps) — **= `MAX_MEMBER_INTRO_BPS`, the bytecode cap** |

- **Partner is not a rung.** It is a negotiated separate CLASS (up to 30%), signed
  agreement, founder-opened — never reachable by climbing the member ladder.
- No rung name collides with the banned list (`Cornerstone` / `Operator` / `Builder` /
  `Steward` / `Custodian` / `Scout` remain banned — they are roles, axes, or on-chain
  classes).

## 3. "Durable introduction" — the counting unit

An introduced member **still holding their seat**, counted by the **R5 indexer**.
This is also the natural anti-fraud: disposable introductions never count. The ladder
therefore **depends on R5** — no indexer, no counters, no automatic thresholds.

## 4. Promotion mechanics (verified against the deployed SourceRegistryV1)

1. The R5 count crosses a threshold → the promotion is **due** (automatic — no human
   judgment enters).
2. The PROPOSE screen (Constitution §④ Form 2) builds `updateSourceTerms` with **ONLY
   `commissionBps` changed** — all current terms resubmitted verbatim. Contract-enforced
   constraints (read from the .sol): `sourceWallet` must match the record
   (`SourceWalletMismatch`) and `payoutWallet` must match (`PayoutWalletChangeRequiresRecovery`
   — payout changes are a separate owner recovery act, never mixed into a promotion).
3. The founder signs — one click. `SourceTermsUpdated` is a public on-chain event:
   **no silent edits** is a consequence, not a promise.
4. A **persistent reminder** stays visible until every due promotion is signed.
5. A rate change is never retroactive: `_previewCommissionBps` reads the rate at the
   moment of each purchase (SPEC §⑪ R6 — correct and fair).

## 5. FOUNDER DECISION — no new smart contract for ~6 months

The deployed registry's `onlyOwner` surface + its 7 source classes cover the entire
plan. Moved to the **"professional firm on traction (~6 months)" horizon, mandatory
audit each**:

- the zero-touch promotion contract,
- the self-service issuer (SPEC §⑦),
- Router V4.

The registry is **Ownable2Step**, so that future handover is a clean two-step transfer.

## 6. UI spec notes (for the promotion screen slice — depends on R5)

- The progress bar is **never empty** (a member at 0 sees the road, not a void).
- **Visible progress everywhere** — the counters render on every surface where the
  member meets their referral standing.
- The **season leaderboard** carries the recurring competition (the present); the
  ladder carries the acquired (the past — it never demotes).
- **The summit stays rare** — 300 durable introductions IS the story; the UI never
  cheapens it.
