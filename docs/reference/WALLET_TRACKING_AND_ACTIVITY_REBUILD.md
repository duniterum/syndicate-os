# WALLET TRACKING & THE ACTIVITY NEWSROOM REBUILD — the dossier

*REFERENCE doc (durable — read at this arc's slices, never re-search). Founder-ordered capture,
2026-07-22 ("deep think avec toutes tes casquettes… update all files… pas qu'on revienne
rechercher"). Sources: disk-level harvest of the origin `TheSyndicate`, the live chain (public
RPC, re-verified from here), the served prod feed, and the external benchmark. Authority: the
founder, then the deployed contracts. Companion queue entries: OPEN_QUEUE (this arc's block).*

---

## 1. THE ORIGIN'S WALLET-TRACKING MECHANISM (the harvest — 3 layers)

The origin had the complete machine; we rebuilt only fragments. Harvest the MECHANISM
(never its constraints — mirror rule):

1. **ONE address registry** — `TheSyndicate/src/lib/syndicate-config.ts`: every address
   literal written exactly once; everything else references it.
2. **Attribution** —
   - `src/lib/known-addresses.ts`: `KNOWN_ADDRESSES` maps address → `role` + human `label`
     (founder / vault / liquidity / operations / membership-syn / burn; unknown → short form,
     never throws, never fabricates). Predicates: `isFounderWallet` (role founder ONLY),
     `isProtocolWallet`, `isBurnAddress`. Case-insensitive Map index.
   - `src/lib/founder-actions.ts`: `classifyFounderAction({from,to,kind})` → categories
     `founder-burn` · **`founder-funded-vault` · `founder-funded-operations` ·
     `founder-funded-liquidity`** · `founder-allocation-movement`, with rendered labels
     ("Founder funded Operations") + recognition-only legal note.
   - `src/lib/protocol-events.ts` `enrichEvent()`: ONE pipeline stamps `fromLabel`/`toLabel`/
     `founderAction` on every event from six scanners (purchases, LP add/remove, LP swaps,
     vault USDC flows, archive mints, SYN burns).
3. **Rendering** —
   - `src/lib/protocol-event-intelligence.ts` `eventAttribution()`: "Founder funded Vault: …"
     or "Vault Wallet → Founder Wallet"; plus per-event whatHappened/meaning/consequence.
   - `src/lib/protocol-ledger.ts`: money-movement ledger with a `founder-funding` category.
   - `src/lib/transaction-tags.ts`: **the manual off-chain purpose registry**
     (`TAGGED_TRANSACTIONS` — tag/description per tx: "LP seed", "advertising"…);
     `splitSpend()` = classified vs "untagged — awaiting classification". Purpose is NEVER
     inferred — untagged reads "unknown".
   - **Founder styled GOLD**: `ProofOfFireCard.tsx` title in `text-gradient-gold`
     ("Founder Burn"); gold Flame badge in `ProtocolIntelligenceBar.tsx`.
   - `src/lib/syn-burn-events.ts`: burn scanner with `isFounder` from the registry;
     Proof-of-Burn numbering ONLY on a gapless scan.
   - Also there: `protocol-metrics-registry.ts` (metric dictionary incl. per-wallet USDC),
     `treasury-hooks.ts` (any-wallet asset reads incl. BTC.b/WETH.e), visitor-memory
     ("since you were away" — future layer).

**REFUSE from the origin:** client-side reads as truth · config-exposed addresses on public
pages · LP swaps in the feed (market noise, not acts — confirmed scope-out unless the founder
pulls it in).

## 2. THE ADDRESS BOOK (verified 2026-07-22 — canon `protocolTargets.ts` == origin config)

**Wallets:**

| Label | Address | Role |
|---|---|---|
| **Founder** (allocation) | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` | founder |
| **Founder Private Wallet** (founder-named label, 2026-07-22; 9-year, duniter.eth, historical member #1, founder_root row 2) | `0x244531C571966F90F4849E03a507543D90f9C721` (full address chain-recovered from the block-87,350,581 mint log) | founder — **AW-1 CLOSED: joins the registry set, label "Founder Private Wallet"** |
| Vault | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` | pipe (70%) |
| Liquidity | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` | pipe (20%) |
| Operations | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` | pipe (10%) |
| Membership Distribution | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` | allocation |
| Partnerships | `0xf5BEdEEfe48f746d96C1847a5595318579bBcaCf` | allocation |
| Contributors | `0xa55132346C70e63d0c4E0Fb15F35075760dDEF7a` | allocation |
| Future Ecosystem | `0x2530393881820AFe789f1c5D83817B70e46d2963` | allocation |
| Burn (Proof of Fire) | `0x0000…dEaD` | burn |

**Contracts:** SYN `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` · USDC
`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` · Sale V1 `0x0020Df30C127306f0F5B44E6a6E4368D2855842d`
· V2a `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` · V2b `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b`
· **V3 (active)** `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` · SourceRegistry
`0x780013bB358be6be95b401901264FC7c22a595a6` · Archive1155
`0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` · LP pair
`0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389`. Treasury assets also tracked at the origin:
BTC.b `0x152b9d0FdC40C096757F570A51E494bd4b943E50`, WETH.e `0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB`.

## 3. CHAIN VERIFICATIONS DONE 2026-07-22 (do not redo)

- **The 6,666 SYN founder burn**: tx `0x8094bfea7dbee4963199e73087472ed0c96da8b412743e98995d8aafeb6ecad4`,
  block 90,936,916, from `0x88EC…Dd73` → dead. Indexed and served the same day,
  `senderLabel = "Founder"` — correctly tracked.
- **The 17 archive mints ("Community") — RESOLVED, not one wallet:**
  **7 mints by `0x244…c721` (the founder's private wallet)** — blocks 87,350,581 · 87,358,137 ·
  87,359,440 · 87,378,897 · 87,440,861 · 87,447,442 (×2 in range) — mislabeled "Community"
  ONLY because that wallet is not in the server's founder set. **10 mints by real members**:
  `0x03e…c6d0` (Seat #3, ×3) · `0x573…c2cd` (×2) · `0x3b1…ec6a` (×2) · `0x3ff…894f` ·
  `0xab8…e081` · `0xe41…d56f` (×2) — "Community" is CORRECT for them.
  → The fix is precise: add the private wallet to the founder set → 7 flip, 10 stay.

## 4. TODAY'S GAPS (syndicate-os vs the origin)

1. **Founder → organ funding says nothing**: an inflow renders "{amount} {token} entered
   {organ} — recorded on-chain" with no founder attribution (`founderAddresses` is never
   consulted on the treasury path — `protocolEventReadmodel.ts` treasury branch).
2. **The server's founder set CONFLATES founder + pipes** (`backboneRunner.ts:345-352` = founder
   allocation wallet + vault + liquidity + operations). A burn FROM the vault would say
   "Founder" instead of "Vault". Origin separated roles per address.
3. **The founder's private wallet is absent** from the set → its acts say "Community" (the 7 mints).
4. **No per-line Founder chip** — "Founder" exists only as a filter facet; sentences sometimes
   say "the founder" lowercase. Founder order: **capital-F "Founder", gold**, per line.
5. **Treasury out/internal sentences hardcode "founder-signed"** regardless of actual signer —
   with the role registry the sentence can say the truth per address.
6. **No off-chain purpose ledger** (origin's TAGGED_TRANSACTIONS never ported).

## 5. FOUNDER RULINGS ENGRAVED 2026-07-22 (binding; do not re-litigate)

- **BUSINESS-FIRST (emphatic)**: "on est un business pas une charité; si c'est légal on fait;
  RIEN qui nous bloque." Everything TRUE + legal is shown and SELLS: live auto-updating feed,
  historical FOMO ("14 of 333 Genesis seats — Chapter I seals forever"), milestone progress,
  bold CONVERSION voice. The ONLY red lines (the founder's own legal shield): ① never promise
  financial GAIN (yield/ROI/passive income); ② never a chain-refutable claim (no invented
  promos — no list price exists). Agent caution must NEVER masquerade as law
  (CANON_LOI_ANTIBLOCAGE applies). Memory: `business-first-true-urgency-allowed`.
- **"Founder" renders with capital F + distinct color (GOLD — the origin's own accent)** on
  every founder-act line.
- **Founder-funding doctrine**: money entering ANY protocol wallet from a founder wallet =
  the Founder advancing money to the protocol ("comme le Founder a prêté de l'argent au
  protocole") — the line NAMES it. Exact public wording = founder gate at slice A1.
- **Every known wallet is tracked for EVERY action** — burn from vault, founder funding of
  operations (e.g. to buy advertising), all of it renders labeled the moment it happens.

## 6. FOUNDER DECISIONS — ALL CLOSED (2026-07-22, same day; no agent re-opens)

1. ✅ **AW-1 CLOSED** — `0x244531C571966F90F4849E03a507543D90f9C721` joins the founder set,
   **label "Founder Private Wallet"** (the founder's own naming). The 7 archive mints flip
   to Founder; his future acts from it say Founder.
2. ✅ **AW-2 CLOSED — YES, the era-price meter ships** ("oui car c'est informatif"): factual
   bytecode disclosure ("Era 1: 100 SYN/$ — N seats before era 2 turns the page"). This
   OVERRIDES the H2-⑫ line-on-crossing pin by founder decision (dated); the guard pin is
   amended in the A3 slice; crypto-lawyer confirms at Phase 5 as planned.
3. ✅ **AW-3 CLOSED — GO** on the arc. **FOUNDER CADENCE ORDER: ONE Replit cycle for the
   whole arc** (each cycle costs him hours) — A1+A2+A3+A4 are built and gated separately
   but ride ONE deploy (all additive/fail-closed, no migration). Only A5 keeps its own
   cycle (real migration — never batched, the standing law).

## 7. THE WORK ORDER (the slices — nothing forgotten)

| # | Slice | Content | Deploy |
|---|---|---|---|
| **A0** | **Wireframe /activity** | `docs/design/activity-newsroom-mockup.html` — business version, desktop+mobile, founder approves ON SCREEN before any code (Visual Change Law) | none |
| **A1** | **The address registry + founder funding (server)** | Harvest `known-addresses` as ONE server registry (role+label per address; Founder = founder wallets ONLY; pipes labeled by their own names — kills gap 2) · add the private wallet on the founder's YES · burns/LP/mints/treasury all consume it · "The Founder funded {organ}" inflow lines (wording at gate) · out/internal sentences truthful per address · guards amended dated | 🚀 server (no migration) |
| **A2** | **Feed pagination (server)** | Cursor endpoint (block+logIndex desc, 12/page); whole-history read-model untouched (milestones intact); old endpoint stays fail-closed | 🚀 server — can ride A1's cycle |
| **A3** | **The /activity newsroom rebuild (client)** | Z1 one-line header + ONE-authority figure (14 live) with event counts subordinate · Z2 sticky facets (All · **Founder gold** · Membership · Burns · Treasury · Liquidity · Archive · Referral + "More"; counts; `?facet=` in URL) · Z3 THE FEED first: 12 lines newest-first, date-grouped, Founder gold chip, live auto-prepend (gold flash, scroll-position preserved), Load More · Z4 milestones condensed AFTER the work (+ historical-FOMO lines: "N of 333 Genesis…") · Z5 methodology in a collapsed expander · era meter if founder GO · mobile 375 / two themes / SEO meta same commit | 🚀 client — ONE cycle can carry A1+A2+A3 |
| **A4** | **Docs & truth rider** | DESIGN_ROADMAP tick · SESSION_STATE · OPEN_QUEUE close · one-authority pin in the activity guard | rides A3 |
| **A5** | **The off-chain purpose ledger (console)** | Harvest TAGGED_TRANSACTIONS as an operator write-zone module: the founder tags a tx's WHY ("advertising", "LP seed") from the console, audited; untagged reads "unclassified", never invented; feeds the ledger/economy surfaces | 🚀 ⚠ MIGRATION — its own cycle, never batched |
| *(A6 opt.)* | Era-price meter | Only on founder GO (decision 2) — rides A3 if yes | — |

**Cycle count: 2 deploys** (A1+A2+A3+A4 in one server+client cycle · A5 its own migration
cycle). **Then the standing order resumes: K4 → P (press kit) → recognition/season (slice 6).**
The event-intelligence expansion (per-line meaning/consequence) and "since you were away" are
recorded FUTURE layers — never re-research, they live in §1.

## 8. Benchmark (external, filtered — basis for A3)

Load More beats classic pagination and infinite scroll for registry-type feeds (Baymard via
Crocoblock/LogRocket) · date-grouped timeline pattern (uxpatterns.dev) · 5-6 visible facets,
rest collapsed, counts on chips (UXPin, Pencil & Paper) · the #1 explorer failure is human
readability — our §8 canon sentences ARE the differentiator (Muzli crypto-wallet activity
study) · URL-stateful filters; ARIA live regions for the live feed; skeleton states.
