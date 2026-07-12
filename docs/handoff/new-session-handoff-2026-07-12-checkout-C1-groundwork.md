# Handoff — Checkout C1 groundwork (2026-07-12)

**Read after `docs/SESSION_STATE.md`.** This is the resume point for the `/join` real-money
checkout. Two C1 sub-slices are DONE + pushed; C1.1 is NEXT and fully specced below so it can be
built without re-reading anything. **NO PRODUCT CODE UNTIL FOUNDER GO. Diff → approval → publish.**

## What shipped this session (all on `main`, pushed)

- **Member fixes (earlier):** header re-sign; the real `/api/auth/member-standing` **500** fix
  (discipline-net lift, founder decision, reversible via `DISCIPLINE_ENFORCED`, ADR-003 amended);
  verify:canon cross-platform; header "Verify on-chain → your own receipt tx" + "Share my proof";
  narrative **Chapter** label. All confirmed live by the founder.
- **Step 1 — `4b250fd`:** `docs/direction/CANON_INVARIANT_VS_STATE.md` (TIER-0 anti-drift law,
  verbatim) + indexed + `moduleRegistry.ts` `membership-join.notes` re-marked as **STATE** +
  `SESSION_STATE` notes (law + poisoned-canon flag).
- **C1.0 — `9958169`:** money-path vocabulary guardrails in `guard-forbidden-copy` (bans
  `your share`/`your vault`/`the community's funds`/`shared funds`/`common pot`/`distributed`/
  `pooled`; documented non-bans `shared`/`contribution`); `referralProgram.ts` label
  "Routed through protocol" → "Sent to the Syndicate".

## Corrections to the prior stale picture (all verified, repo wins)

1. `WIRABLE_ACCESS_STATES` is already `["S1","S4","S7","S11"]` (`accessState.ts:53`) — S7 wired
   (`ff851b3`); the member IS recognized live. **The "app doesn't know you're a member" wall is
   already down.** S7-sequencing decision: **build checkout now, grow Member Home in parallel** (founder-accepted).
2. Contract SOURCE is on disk: `TheSyndicate/contracts/src/MembershipSaleV3.sol` +
   `SourceRegistryV1.sol` (+ their `.t.sol` tests). Cite these for behavior; the syndicate-os
   `sale-abi.ts` is only signatures. **Caveat: the `.sol` header says "candidate/not deployed" —
   that is STALE (V3 is live, #9–#12). Final truth before a real tx = `eth_call` simulation
   against the deployed `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`.**
3. Amount config exists but is **poisoned**: `syndicate-config.ts:558` `PURCHASE_PRESETS_USDC =
   [5,10,25,50,75,100,250,500,1000]` (reuse these numbers; $5 = era-1 on-chain minimum) and
   `RANKS_V2`/`HOME_RANK_LADDER` (named tiers Citizen→Cornerstone + badges — **DEAD**, violate the
   binding naming law; neutralize in a later slice; flagged in SESSION_STATE).
4. Admin is NOT read-only — `AdminOperatorsCrud`/`AdminReferralCrud` already POST to the DB
   (`operatorClient.ts` → `operator/router.ts`, founder_root-gated, fail-closed behind
   `SYNDICATE_AUTH_ENABLED`+`DATABASE_URL`). An admin amount-editor would REUSE this pattern, not
   be the first write surface.

## Contract facts — Q1–Q12, cited (MembershipSaleV3.sol unless noted)

- **Q1 seat is BINARY:** `_membershipState :597-604` → repeat buyer gets `firstSeat=false` + existing
  number; `_recordPurchase :507-512` only mints on `firstSeat`. Repeat = more `grossContributed`,
  no new seat. Two distinct numbers ⇒ two distinct recipients (so #11 & #12 are two wallets).
- **Q2 70/20/10 IS showable pre-sign:** `_routeAmounts :498-504` = fixed 70/20/10 of
  `protocolContribution` (no `*Bps` view). `quote() :311-333` returns `protocolContribution` → compute
  the split client-side. Event confirms actual figures `:80-82`.
- **Q3 source cut = acquisitionCost:** `quote :331` `acquisitionCost = gross×bps/1e4`; paid to source
  `_payAcquisition :528-536`. **Default public buy (sourceId=0, no link) → bps=0 (`_previewCommissionBps
  :574-578`) → acquisitionCost=0, 100% to the split.**
- **Q4 bounds on-chain:** min per era `BelowEraMinimum :387` (`_eraParams :716-724`: era1 $5, 100 SYN/$);
  `MAX_USDC_PER_TX :388`; per-address-per-era cap `:390-392`.
- **Q5 slippage:** `SlippageExceeded :395`. UI: re-quote right before signing, `minSynOut = fresh synOut`
  (−tiny tolerance). Only real risk = an era flip lowering the rate.
- **Q6 rate moves:** `synPerUsdc` per era 100→50→40→16→12→6→4→2→1 (`:716-724`); advances `_syncEra :645-666`.
  **NEVER print a SYN figure on a card — only inside the live quote.**
- **Q7 approve:** token `USDC :111`; spender = sale contract (`buy` pulls from `msg.sender` `:278`);
  ERC20 `approve(spender, exact grossUsdc)`; assert chain 43114 client-side.
- **Q8 event:** `MembershipPurchasedV3.memberNumber :76`, emitted `:541-545`. ONLY source of the seat.
- **Q10 v1Proof:** `buy :270` **`if (v1Proof.length > 0) revert InvalidProof()`** → normal buyer passes
  **empty `[]`**. This would have broken the signature if guessed.
- **Q11 closed/failure states:** `isConcluded() :364-368`; `quote()` reverts `SaleConcluded :325`. Buy
  reverts: SaleConcluded `:384`, BelowEraMinimum `:387`, ExceedsTxMax `:388`, AddressEraCapExceeded `:392`,
  SlippageExceeded `:395`, EraInventoryInsufficient `:398`, InsufficientInventory `:401`,
  ReserveFloorViolation `:408`, `whenNotPaused :267`. Pre-check `paused()`, `sellableSynForNextSeat() :354`.
- **Q12 gifting works:** buyer pays (`msg.sender :278`), **recipient** gets seat (`:508-511`) + SYN
  (`:283`); cap checked on recipient `:390`. Pass `recipient` EXPLICITLY = connected wallet.

## 🔴 The two must-not-forget items

- **HISTORICAL GATE (mints a duplicate seat, irreversibly).** Constructor `:226` sets
  `memberCount=genesisOffset` but does NOT populate `knownMember`/`memberNumberOf`. The 8 historical
  members (incl. the founder) are NOT `knownMember` until they call `claimHistoricalMembership :256,
  :766-777` (Merkle vs `V1_MEMBER_ROOT`). An UNCLAIMED historical member who buys → `_membershipState
  :597-604` sees `knownMember==false` → `firstSeat=TRUE` → **a SECOND seat. The contract does not stop
  it.** C1 MUST: read `knownMember[wallet]`; if false, check the historical set via `V1_MEMBER_ROOT()`
  from the DEPLOYED contract; if historical+unclaimed → block with "Claim your seat first"; fail closed
  on any read/verify failure. **Check runs on RECIPIENT** (matters when gifting lands).
- **SourceRegistryV1 caps (anti-MLM, on-chain).** `MAX_COMMISSION_BPS=3000` (:35),
  `MAX_MEMBER_INTRO_BPS=1200`/`PUBLIC_AUTOMATIC_MAX_BPS=1200` (:36-37); `_validateTerms :312-317`
  reverts if a MEMBER_INTRODUCTION exceeds **12%**. 30% only for the 6 other classes, each REQUIRING a
  `metadataHash` (signed agreement) `:330-340`. 7 classes `:40-48`, 4 statuses `:50-55`, 5 scopes
  `:57-63`. Every source **created PAUSED** `:165`. `updateSourceTerms` cannot change `payoutWallet`
  `:194`. Source STICKS once linked (`_resolveSource` auto-applies a linked id; a different id →
  `SourceAlreadyLinked`) — a "clear" button would be a lie after linking. Referrer must hold SYN
  (`ReferrerNotSeated`). Self-referral reverts. Payout is instant with an escrow fallback
  (`_payAcquisition` try/catch). `sourceConfig() :252` is a public view → the CLIENT reads the referrer
  address + rate directly (founder decision: server keeps its 2-boolean discipline; client does what an
  explorer does — PUBLIC infra/source addresses only, never member wallets).

## The money-path doctrine (binding)

The referrer is **paid FROM the purchase tx, before the net is sent** — the Syndicate receives 950, not
1000; it never had the referrer's cut. Word mapping, translated ONCE at the edge:
`acquisitionCost → sourcePaymentRaw`, `protocolContribution → netProtocolRaw`. Buyer reads **"sent to"
+ the wallet + its proof link**, never "routed"/"contribution"/"distributed"/"pooled"/"your share". The
money is the COMPANY'S; **no member has a claim on the Vault.** "Sent to The Syndicate" says WHO.

## The verified quote wiring (for C1.1)

- `GET /api/join/quote?grossUsdc=<raw 6-dec USDC>&sourceId=0x…` → `{ inputValid, chainVerified,
  sourceProvided, sourceValid, quote|null, decimals{usdc:6,syn:18}, failureReason }`. `quote =
  { synOutRaw, era, synPerUsdcRaw, seatIfFirstRaw, acquisitionCostRaw, protocolContributionRaw }` (exact
  raw base-unit strings). Recipient is ZERO_ADDRESS (anonymous) → `seatIfFirstRaw` = next seat preview.
  Fail-closed. Route: `artifacts/api-server/src/routes/joinQuote.ts`. Type: `QuoteFigures`
  (`sourceDecoders.ts:65`). Client hook: `useGetJoinQuote` (`@workspace/api-client-react`).
- Current surface `artifacts/studio/src/pages/JoinProtocol.tsx` = free-text amount input + live quote
  (raw base units) + "buy-readiness" note. REUSE it; do not rebuild. Reuse `?source=` validation +
  `MemberHeaderAffordance` (do NOT build a second wallet affordance).

## Remaining C1 slices (each: diff → approval → publish)

- **C1.1 — Amounts + quote core (NEXT).** First: build the edge decoder
  (`acquisitionCostRaw→sourcePaymentRaw`, `protocolContributionRaw→netProtocolRaw`) against the verified
  `QuoteFigures`. Then: `PURCHASE_PRESETS_USDC` amount row (NO names/badges/tiers/bands) + free custom
  input (reuse) + live quote (what I pay · what I get with **Era N · live rate**, never a frozen SYN
  card figure · "Seat #N — if you sign now" from `seatIfFirstRaw`, honest that the real number is the
  event) + honest revert states (Q11 list) + computed `minSynOut` (Q5). Single-column Apple/Coinbase
  form (detail unfolds), tokens-only, **light AND dark verified**, motion tokens. Amounts reviewed by
  the founder ON THE SCREEN once it renders.
- ~~**C1.2a — Money path + proof (default case).**~~ ✅ **DONE** (`a19182b`, live). Net "Sent to the
  Syndicate" + 70/20/10 client-computed from `netProtocolRaw` (BigInt, ops=remainder) → Vault/Liquidity/
  Operations rows, each with amount + truncated address + explorer proof link. Addresses SERVER-SOURCED
  (verifyLinks infra emission; truncated address derived from the `/address/0x…` URL — client holds no
  address). All-or-nothing on proofs. Buyer's own address never shown. `liquidityWallet` READ from the
  deployed `LIQUIDITY()` immutable and reconciled == canon (all 3 MATCH via `sale-routing:reconcile` — a
  re-runnable script; offline `protocol-targets` guard pins served==canon). openapi enum + orval regen.
- **C1.2b — the source-payment line (NEXT; corrected design — the founder caught two bugs).** Introduce the
  FIRST client chain-read layer: `lib/chainReads.ts` — a viem `publicClient` (Avalanche 43114, **public RPC**
  `api.avax.network` + publicnode fallback; `VITE_AVALANCHE_RPC_URL`/`_FALLBACK` validated overrides) +
  `readSourceConfig(sourceId)`. **Put the CLIENT/SERVER BOUNDARY LAW at the top of the file in plain words**
  (server serves the protocol — cached aggregate reads for everyone; client reads WHAT IS YOURS — live,
  personal, per connected wallet; public RPC is enough because client volume is tiny). The SourceRegistry
  address + explorer base are DERIVED from the existing `verifyLinks` `sourceRegistry` entry (no hardcoded
  client address). The source line renders ONLY when a valid `?source=` is applied. **THE TWO CORRECTIONS
  (verified against MembershipSaleV3.sol):**
    · **RATE + AMOUNT come from the QUOTE** (`acquisitionCost/gross` = `sourcePaymentRaw/gross`), the
      contract's own EFFECTIVE computation. NEVER `sourceConfig.commissionBps` — `_previewCommissionBps`
      (:569-595) returns 0 in 6 cases where the configured bps is nonzero (referrer no longer holds SYN,
      repeat + !appliesToRepeatPurchases, gross/per-buyer cap exceeded, status≠ACTIVE, payoutWallet==recipient).
      Showing the configured rate when the chain applies 0% is a lie before signature.
    · **ADDRESS comes from `sourceConfig(sourceId).payoutWallet`** (client read) — NOT `sourceWallet`.
      `_payAcquisition` pushes to `payoutWallet` (:279, :528-536); `sourceWallet` is the identity;
      `updateSourceTerms` can't even change `payoutWallet` (deliberate separation).
  **CONSISTENCY ASSERTION, fail-closed:** quote `sourcePaymentRaw` > 0 BUT `sourceConfig` says inactive/unknown
  → CONTRADICTION → NO line. `sourcePaymentRaw` == 0 → NO source line, 100% to the split (say it plainly).
  `sourceConfig` read fails → NO amount without proof. The QUOTE WINS on the money; show nothing rather than
  something wrong. Line shape: "Paid to your referrer −$X · Y% · `payoutWallet ↗`", above "Sent to the
  Syndicate". Server discipline UNCHANGED (2 booleans; source terms never leave the server). This layer is
  reused by C1.3 (`knownMember`/`V1_MEMBER_ROOT`), Member Home SYN `balanceOf`, and C2 `allowance`.
- **C1.3 — The historical gate (safety-critical).** The 🔴 above. In C1, before any buy button exists.
  Reuses the C1.2b `chainReads` layer.
- **C1.4 — Economic proof + polish.** The "you overpaid vs the DEX → mechanically not an investment"
  proof (era rate $0.01 vs market kept below it), the 3 never-cross lines ("The market is free. It may
  decide otherwise." · liquidity is a courtesy · tokens are sent not sold), copy. 2-mode VERIFIED.
  Tick DESIGN_ROADMAP: Mouvement · 2 modes · Adoption. Update `membership-join` STATE + handoff.

Copy (binding, write negations as SEPARATE short sentences — the guard's negation window is 28 chars):
"Capital opens one axis. The other ten, you earn." · "Every seat is equal." · "The market is free. It
may decide otherwise." · "Not equity. Not yield. Not passive income."

C2 (later, real tx, go-live gated): approve → buy, two SEPARATE signatures (never a fused "Approve &
Sign"), resumable (detect on-chain allowance, skip to buy, never approve twice), seat read from the
event only. Design C1 so C2 cannot fuse the two.

## Open / waiting on founder

- **Publish** the pending Replit build (chapter `e85a75c` + the docs/guard commits) if not done — these
  are ✅ no-deploy or already-staged; nothing public-facing is blocked.
- C1.2 client-chain-read approach (gate before building).
- The amount set — founder reviews on the C1.1 screen (default = `PURCHASE_PRESETS_USDC`).
