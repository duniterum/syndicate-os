# Handoff — 2026-07-12 · Checkout proven + chain truth + the road to the first real buyer

**Read FIRST after `docs/SESSION_STATE.md`.** The biggest-decision session so far. Everything
durable is captured here so a cold session boots from the repo, never from a chat or a desktop.
**Chain read as provenance, never memory.**

## THE MILESTONE (proven, in production)
The read-only `/join` checkout is complete and validated end-to-end: **C1.0** (money-path vocab
guards) → **C1.1** (amounts + human quote) → **C1.2a** (net + 70/20/10 with per-wallet proof links)
→ **C1.2b** (the referrer line + the first CLIENT chain-read layer). C1.2b was **proven against a
real ACTIVE source in prod**: `/join?source=0x8338e9ff…1cf620` at $100 → referrer 5% $5 → net $95 →
Vault 66.5 / Liquidity 19 / Ops 9.5, each with a clickable explorer proof. Every dollar has a
verifiable destination BEFORE signing. That is the anti-MLM mechanic, live.

## CHAIN TRUTH (live, block ~90.14M, from a COMPLETE Routescan scan — not a public-RPC chunk)
- Deployer `0xa2e538…6e2f` created **EXACTLY NINE contracts, ever**: SYN Token · Owner · Owner ·
  SyndicateMembershipSale (V1) · SyndicateArchive1155 · SyndicateSaleV2 (V2a) · SyndicateSaleV2
  (V2b `0x507E…B88b`) · SourceRegistryV1 (`0x780013…`) · MembershipSaleV3 (`0x2A6c…132E`).
- **CommissionRouterV1: NEVER DEPLOYED.** Not in that list. `V2.commissionRouter()==0x0`; V3 has
  no `commissionRouter()` at all (the `eth_call` REVERTS). It is a **DESIGN, not an asset — V4
  territory. CLOSED. Do not re-investigate.**
- **ONE SOURCE EXISTS AND IS ACTIVE** (read live, `sourceConfig`):
  - `sourceId` `0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`
  - `sourceWallet` = `payoutWallet` = `0x244531C5…9C721` (a historical member — FIRST in
    `RECOGNIZED_MEMBERS`, `v1-proof.ts`)
  - class **BUILDER_SOURCE** → the "must hold SYN" check does NOT apply (that is MEMBER_INTRODUCTION
    only) · rate **500 bps = 5%** · scope **LIFETIME** · startTime/endTime **0/0** · caps **0/0** ·
    `appliesToRepeatPurchases` true · `metadataHash` `0x1f78…b75d` present · status **ACTIVE**
    (re-activated block 89642946).
- Sale V3 live: not paused, not concluded, **era 1**, **12 members**, `SOURCE_REGISTRY`=`0x780013…`.

## THE TWO LESSONS — STANDING RULES (not a session note)
1. **A PUBLIC-RPC `eth_getLogs` SCAN IS NOT A PROOF OF ABSENCE.** It chunks and it drops. For any
   on-chain EXISTENCE question, use a COMPLETE scan (Routescan / an indexer). This cost us twice
   today ("zero sources" reported; the spec inherited the error).
2. **A CREATION EVENT IS A STATE — it describes the day it was written; terms get updated.** (scope
   read `WINDOWED` from the SourceCreated event; the live `sourceConfig` says `LIFETIME` today.)
   **READ `sourceConfig()` LIVE.** Never decode an old event and call it the truth.

## FOUNDER DECISIONS SETTLED TODAY — never re-litigate
- **The referral does NOT ship active in the MVP.** It is built (C1.2b), it works, it stays as-is.
  Its final economics arrive with V4. Changing it between V3 and V4 would cost trust.
- **The 12 members are the FOUNDER's OWN TESTS**, not customers. The site says so ("incl. founder
  tests") — that honesty STAYS. The real milestone is not 12; it is **ONE stranger who pays his own
  money because he UNDERSTOOD.**
- **The money is THE COMPANY'S.** "No member has a claim on it" stays on the money screen.
- **The buyer pays TWO recipients in ONE transaction; the Syndicate pays NOBODY.** The contract
  splits at the source → no KYC, no 1099, no commission accounting, no float. Copy must NEVER say
  "we pay you 5%" — it says **"the buyer pays you, in his transaction."**
- **A referrer has SIGNED A CONTRACT** — the `createSource` tx, his private key, committing him to
  the terms whose `metadataHash` is in that source. Stronger than paper.
- **Tiers by spend are LEGAL** (Sephora/Ulta/Marriott/Uber/AA/Starbucks). `HOME_RANK_LADDER` is NOT
  poison — it is the **CAPITAL AXIS**. THE RED LINE: a tier must **NEVER give a better SYN price** —
  access + recognition, never a financial multiplier on a tradeable asset.
- **Rank NEVER demotes** ("you don't demote a friend for resting"); the rate goes up and stays. What
  lives is the **season leaderboard** (the present — like GitHub: this year's graph, old commits stay).
- **V4 target = CommissionRouterV1's model**: Vault never touched · referral cost structurally capped
  at 10% of gross · auto-promoting `referredCount` ladder · checks `knownMember` = THE SEAT (closes
  the V3 hole where `ReferrerNotSeated` checks `balanceOf`, the token, not the seat). Recorded so
  nobody rediscovers it.
- **Canon: two authority docs are now in-repo TIER-0** — `CONSTITUTION_AUTORITE.md` (4-level authority
  hierarchy) + `SPEC_REFERRAL_SYSTEM.md` (the full referral system). Plus the two laws from earlier
  today: `CANON_INVARIANT_VS_STATE.md`, `CANON_VISIBILITY_LAW.md`.

## CONSOLIDATED SLICE LIST — everything between here and the first real buyer

**A — THE MVP (must exist before a stranger buys and lands somewhere real)**
- **C1.3 · historical-seat gate** — before any buy button: read `knownMember`+`V1_MEMBER_ROOT` live
  (reuses C1.2b `chainReads`); an unclaimed historical member who buys gets a SECOND seat,
  irreversibly. **READY.** Unblocks: C2.
- **C2 · approve → buy** — two SEPARATE signatures (never fused), exact-amount approve, resumable
  (detect allowance, skip to buy), seat from the `MembershipPurchasedV3` event, honest reverts,
  testnet/simulate first. **BLOCKED BY** founder go-live + the kept invariants (APPROVE≠PAYMENT, no
  copied payment code w/o review). Unblocks: the first real buyer.
- **C5 · wire `/join`** — remove the stale "transaction sending not enabled" gate (Q20). **Rides C2.**
- **Auth go-live (Q21)** — Replit sets `SYNDICATE_AUTH_ENABLED="true"` + `REPLIT_DOMAINS`, restart,
  e2e `/member`. So the new member lands RECOGNIZED (S7 already wired), not an empty room. **BLOCKED
  BY** Replit action (founder-decided YES). Unblocks: the real landing after purchase.
- **C1.4 · economic proof** — the market-below-entry-rate → "mechanically not an investment" surface +
  the 3 never-cross lines. **READY.** Arguably MVP (it is why the buyer "understood"); founder's call
  whether it gates the first buyer.

**B — AFTER THE MVP (useful, not blocking)**
- **Source-status LIVE read surface** — the app READS `isActive()`/`sourceConfig()` instead of a
  comment (founder's "make it derivable"). NEW slice (proposed today; no slice existed). READY.
- **Guard rename** — `assertNoAddressLeak` (misnamed; comment already fixed) → mechanical rename across
  24 call sites / 10 files. READY, tsc-verified.
- **`/staff` · public operator registry (anti-impersonation)** — CAN ship early; registry exists
  (`operator-context`), publishing it is a READ. READY.
- **Session durability (Q14)** — DB-backed sessions so a member never re-signs across deploys. Does
  NOT block the purchase (wallet→contract). BLOCKED BY infra decision.
- **Phase-2 content** — 2.5 Knowledge (Q3/Q4/Q5/Q6 open) · 2.6 Risk · 2.7 Glossary · 2.8 Roadmap ·
  2.9 Protocol-facts · 2.10 Brand-facts (frozen list in SESSION_STATE).
- **`enabled` on moduleRegistry** — module governance (WordPress-style show/hide). Its own slice.
- **Holder-index snapshot rebuild (Q18)** — 2 members stale (10 vs live 12); founder-gated. Record-only.
- **Hero KPI grid migration (Q16)** · **Compass handoff repoint (Q22)** · **doc-drift reconcile (Q8)**.

**C — FAR HORIZON (a SOMEDAY, NOT a track in this plan)** — after the MVP ships and real people have
used it. Do NOT schedule, do NOT treat as a bucket. Recorded only so nobody rediscovers it:
- New contracts require a fresh deploy + audit. The V4 economics model (CommissionRouterV1: Vault
  untouched · referral cost capped at 10% of gross · auto-promoting `referredCount` ladder · checks
  `knownMember` = the seat) and the self-service emitter (R7) are that someday. Not now.
- The public `MEMBER_INTRODUCTION` referral program (its own source + the R1 conditions doc hashed) is
  also deferred — the referral does NOT ship active in the MVP (founder decision today).

**D — DONE TODAY (do not redo)**
- Checkout C1.0 / C1.1 / C1.2a / C1.2b (pushed, C1.2b proven live on the real source).
- Member fixes (header re-sign · member-standing 500 fix · verify-on-chain→own receipt tx · share
  proof · Chapter label). Discipline-net lift (founder decision, reversible). verify:canon
  cross-platform. WSS env reader (PENDING).
- Two TIER-0 laws authored + the two authority docs committed in-repo (constitution + referral spec).
- Chain-truth corrections (the active source; router never deployed) with chain as provenance.

**Decisions with NO slice yet (flagged, slices proposed above):** the V4 sale/router (→ C group), the
source-status live-read surface (→ B), the Console "PROPOSE" form (Constitution §④ — the admin builds
a tx, the founder signs; proposed as a B/C slice), the alias table + `&via=` channel + connector
staircase + event indexer (referral spec §③/§④/§⑤/R5 — B/C).

## Slice protocol (unchanged)
Read the repo → 4-line gate → wait for founder GO → build + guards → show diff → founder approves →
commit + push `main` → tick DESIGN_ROADMAP → deploy verdict (🚀 / ✅). Chain > docs; `.sol` > ABI;
founder live > everything. A public-RPC log scan is not a proof of absence. A comment is not authority.
