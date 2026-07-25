# HANDOFF REVIEW — 2026-07-25

> Ordered by the founder before handoff: a full senior re-read of the session as **committed to
> GitHub** (`1a9a0fe..add5bb8`), with GitHub as the source of truth. **9 agents · 7 independent
> senior lenses · 78 raw findings · 76 confirmed by an adversarial verifier whose default was to
> refute.** The BLOCKING and HIGH items were fixed immediately in `35d60fa`; **everything below is
> the REMAINDER, written down so it cannot be lost in a chat window.**

**How to use this file.** Each entry is actionable on its own: what is wrong, where, and the fix.
Nothing here blocks the handoff. Work them into slices when their surface is next touched — that is
cheaper than a dedicated cleanup pass, and it is how the repo’s standing rules already work
(SEO rides the slice, the design roadmap is ticked in the same commit, and so on).

| Severity | Open | Fixed in `35d60fa` |
|---|---|---|
| BLOCKING | 0 | 5 |
| HIGH | 0 | 13 |
| MEDIUM | 37 | 0 |
| LOW | 21 | 0 |

---

## ✅ Already fixed in `35d60fa` (recorded so the handoff is complete)

- **[BLOCKING]** The client feed parser rejects every BTC.b / WETH.e treasury line the add5bb8 lanes produce — the movements never render, and /activity reports them as "failed validation" — `artifacts/studio/src/lib/backboneFeedClient.ts:436`
- **[BLOCKING]** The client's runtime token allowlist was never widened — every BTC.b / WETH.e treasury line is dropped before it renders — `artifacts/studio/src/lib/backboneFeedClient.ts:436`
- **[BLOCKING]** DESIGN_ROADMAP standing rule violated — three design slices shipped with no tick and no colour-sprawl count — `docs/DESIGN_ROADMAP.md:64`
- **[BLOCKING]** SESSION_STATE DEPLOY BACKLOG names 1 commit; FOUR await deploy, two of them server-side — `docs/SESSION_STATE.md:17`
- **[BLOCKING]** The client drops every BTC.b / WETH.e treasury line — add5bb8's entire purpose never reaches the screen — `artifacts/studio/src/lib/backboneFeedClient.ts:436`
- **[HIGH]** Two live surfaces publish two different totals for the same money (ONE-AUTHORITY break): the home Reserves band omits financial.nftSale.contractUsdcBalance, which the /contracts + /admin card sums — `artifacts/studio/src/config/trackedAssets.ts:107`
- **[HIGH]** Two surfaces publish two different "what the protocol owns" totals — the NFT sale contract's USDC is summed on /contracts and /admin but omitted on the public home — `artifacts/studio/src/config/trackedAssets.ts:107`
- **[HIGH]** The home's reserves total and /contracts' holdings total are two different numbers for the same money — `artifacts/studio/src/config/trackedAssets.ts:110`
- **[HIGH]** The new word-law loop scans one registry while three served notes still render "PII" on the founder's admin — `artifacts/api-server/scripts/source-status-truth.guard.ts:94`
- **[HIGH]** backbone.guard pins neither the scan-target set nor the organ set — 4 new lanes and a 4th organ produced a zero delta (165 → 165) — `artifacts/api-server/scripts/backbone.guard.ts:686`
- **[HIGH]** Two surfaces publish 'what the protocol owns' from two different id sets — ONE-AUTHORITY-FIGURE broken, and unguarded — `artifacts/studio/src/config/trackedAssets.ts:106`
- **[HIGH]** The Protocol Reserves band (public home) is recorded in ZERO docs and ZERO registries — `docs/SESSION_STATE.md:10`
- **[HIGH]** BACKLOG.html — the doc the founder reads — presents a SHIPPED capability as open work (the exact DONE-IS-DONE fossil class) — `docs/direction/BACKLOG.html:203`
- **[HIGH]** The banned word "PII" is STILL rendered on the public /status page — three times. The session's word-law guard scans the wrong file. — `artifacts/api-server/src/lib/protocol/realityService.ts:1724`
- **[HIGH]** ONE-AUTHORITY-FIGURE broken: the home "Total value" and the /contracts "Value of the priced holdings" are computed from two different lists — `artifacts/studio/src/config/trackedAssets.ts:107`
- **[HIGH]** The member header trophy tooltip still says the season engine is coming — 2 days after /season went live — `artifacts/studio/src/wallet/MemberHeaderAffordance.tsx:294`
- **[HIGH]** The home band and /contracts publish two different totals for the same claim — the mockup promised they "can never disagree" — `artifacts/studio/src/config/trackedAssets.ts:107`
- **[HIGH]** The design/queue ledgers never record the biggest visible change of the session — the public home Protocol Reserves band — `docs/DESIGN_ROADMAP.md:64`

---

## 📋 The remainder — open, by theme

### Money & chain truth (3)

#### 1. [MEDIUM] The Reserves band's USDC row links visitors to the wrong address: `nftArchive` resolves to the Archive1155 contract, not the NFT Sale Wallet whose balance is summed

- **Where:** `artifacts/studio/src/config/trackedAssets.ts:116`
- **What is wrong:** The USDC row sums `financial.nftSale.walletUsdcBalance` — the balance of nftSaleWallet 0xe4178521946d2c54e2a2c5b154aae07319bbd56f (protocolTargets.ts:403). Its verify list is `["vaultWallet", "operationsWallet", "nftArchive", "lpPair"]`. `nftArchive` is defined in verifyLinks.ts:77 as `contractAddress("ARCHIVE_1155")` = 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d — the sale CONTRACT, whose USDC balance the band does not sum at all (see finding 1). The NFT Sale Wallet has no entry in the verify-links registry, so the summed leg is not linkable. The registry's own comment at trackedAssets.ts:102-103 ("every one of them stays checkable below") and the add5bb8 commit message ("all four stay indiv
- **Fix:** Add a LinkSpec `{ id: "nftSaleWallet", label: "NFT sale wallet", address: FINANCIAL_TARGETS.nftSaleWallet, kind: "address" }` to SPECS in artifacts/api-server/src/routes/verifyLinks.ts (and the LinkSpec id union at line 44-56 plus the generated VerifyLinkId type), then set the USDC row's verify list to ["vaultWallet","operationsWallet","nftSaleWallet","nftArchive","lpPair"] — nftArchive stays only once the contract balance is actually summed per finding 1.

#### 2. [LOW] The /contracts "NFT sales USDC" row bypasses the honest-dust guard and can print a false 0.00 next to a non-zero dollar figure

- **Where:** `artifacts/studio/src/components/ProtocolAssetsCard.tsx:150`
- **What is wrong:** Every other row's token amount is produced by `fmtAmount(rawString, decimals, dp)`, which runs `formatBaseUnits` in exact bigint math and then substitutes "< 0.01" when a non-zero balance would round to all zeros (lines 73-81). The NFT row alone builds its amount from summed JS numbers: `nftAmount = nftUsd.toLocaleString("en-US", {min/maxFractionDigits: 2})` (line 150), consumed at line 203 as `${nftAmount} USDC`. That path has no dust guard, so a sub-cent total renders as a flat "0.00 USDC" while the USD line beside it — which does have the guard (fmtUsd, line 64-67) — renders "< $0.01". The card contradicts itself in one row, and the honest-zero discipline the file was written to enforce i
- **Fix:** Sum the two raw base-unit strings as bigints and format through the same path as every other row: `const rawNftTotal = rawNftWallet !== null && rawNftContract !== null ? (BigInt(rawNftWallet) + BigInt(rawNftContract)).toString() : null;` then `const nftAmount = fmtAmount(rawNftTotal, 6, 2);`. This also removes the only place in the card where a displayed token amount passes through a JS float.

#### 3. [LOW] Guard comments state counts that contradict the assertions immediately below them (31 vs 35 items, 13 vs 15 balanceOf reads)

- **Where:** `artifacts/api-server/scripts/protocol-reality-check.guard.ts:419`
- **What is wrong:** The comment above the financial-group size check reads "31 items — the 25 before this slice + vault BTC.b / WETH.e / native AVAX + the 3 Chainlink USD feeds" while the assertion on the next line is `e.groups.financial.length === 35` and the enumerated id list below it contains exactly 35 entries (the comment omits the 2 LP-share reads and the 2 NFT-sale reads; 25+3+3+2+2 = 35, not 31). The same slip repeats at line 547: "balanceOf calldata discipline: exactly 13 reads (vault + ops USDC; vault BTC.b + WETH.e; the pair's LP tokens…; the burn address + the 7 allocation wallets)" — the list enumerated omits the two NFT-sale balanceOf reads, and the assertion five lines down correctly requires `b
- **Fix:** Recount both comments against their own lists: "35 items — the 25 before this slice + 3 vault crypto holdings + 3 Chainlink feeds + 2 LP-share reads + 2 NFT-sale reads" at line 419, and "exactly 15 reads (vault + ops + 2 NFT-sale USDC; vault BTC.b + WETH.e; the pair's LP share; burn + 7 allocations on SYN)" at line 547.


### Server / indexer (4)

#### 1. [MEDIUM] Widening organTopics has no retroactive effect — the four pre-existing treasury cursors are already past the NFT sale wallet's whole history

- **Where:** `artifacts/api-server/src/backbone/protocolEventScan.ts:553`
- **What is wrong:** `organTopics` now contains four organs, and that array feeds TREASURY_USDC_IN/OUT and TREASURY_SYN_IN/OUT as well as the new BTC.b/WETH.e lanes. But those four USDC/SYN lanes have been running since H2-⑦ and their cursors sit at (or near) head. `runProtocolEventScan` resumes at `Math.max(target.fromBlock, cursor.lastScannedBlock + 1 - 50)` (lines 528-534) — the widened filter is only ever applied to blocks AHEAD of the cursor. Nothing in the 6-commit range resets those cursors, and grepping the whole repo shows `upsertProtocolCursor` (backboneDb.ts:298) is the sole writer of `protocol_event_cursor` — there is no reset/rescan script for the protocol lane at all (only `archive:minter-backfill`
- **Fix:** Ship a one-shot founder-gated cursor reset (or a documented Replit SQL step) that sets `last_scanned_block = from_block - 1` for the four TREASURY_USDC_*/TREASURY_SYN_* rows so the widened organ filter re-walks history — inserts are idempotent on (chainId, txHash, logIndex), so a full re-scan cannot duplicate a row. Structurally: make the organ-set membership part of a lane's identity (e.g. a `filterVersion` on the target that forces a cursor rewind when it changes), so widening the organ set can never again produce a silently half-covered lane.

#### 2. [MEDIUM] Artifact-mint income still never appears — mints pay the sale CONTRACT, which is not in the organ set

- **Where:** `artifacts/api-server/src/backbone/protocolEventScan.ts:557`
- **What is wrong:** The comment added at protocolEventScan.ts:548-552 justifies the change with "artifact mints pay into it [the NFT sale wallet], so a member seeing 'moved into the NFT sale wallet' is reading real, checkable income. Until now its inflows were invisible, which is why the patronage rungs could never seal against a transaction." The code contradicts that. Per the canon ABI (archive-nft-abi.ts:102) `treasury()` is "the address withdrawUSDC pays out to", and realityService's own note (line 1597) says mint payments "rest here [in the contract] until they are withdrawn to the declared payout wallet" — that is why `financial.nftSale.contractUsdcBalance` exists at all. Only `nftSaleWallet` was added to
- **Fix:** Make the money ride the line that already narrates the transaction: carry the mint's USDC amount on the ARCHIVE_MINT item (price x quantity from the artifact core read, or the same-tx USDC Transfer to nftSaleContract read the way LP_TOKEN_MINT identifies its depositor) so the archive-mint sentence itself states the money. Adding nftSaleContract to organTopics alone does NOT fix this — the Fold Law swallows it. Also correct the comment at lines 548-552, which currently asserts something the code does not do.

#### 3. [MEDIUM] ProtocolAssetsCard's header law comment now contradicts its own code — it says the pool is not valued or summed, and the code values and sums it

- **Where:** `artifacts/studio/src/components/ProtocolAssetsCard.tsx:12`
- **What is wrong:** Lines 12-19 still state "THE POOL IS NOT VALUED AND NOT SUMMED... So the pool is shown as reserves, in tokens, plainly labelled, and left out of the total. Valuing our real share needs a pool-share read (balanceOf(pair)/totalSupply(pair)) — a named follow-up, never a guess." The same commit implemented exactly that read (realityService 3b: financial.lp.totalSupply + financial.lp.protocolBalance) and this file now computes `poolUsd` at line 140 and includes it in `priced` at line 154. The stated law and the shipped behaviour disagree in the same file, and the user-facing copy at lines 292-296 correctly describes the NEW behaviour — so the comment is the only stale artefact.
- **Fix:** Rewrite lines 12-19 to state the law as it now stands: the pool IS valued, but only the protocol's own share (LP balance / total supply) of the USDC leg; the SYN leg is never priced. Keep the reasoning about why doubling the USDC reserve is forbidden — that part is still the live rule.

#### 4. [LOW] treasuryTokenForStream's throw permanently freezes the whole backbone, and nothing pins the map to the scan targets

- **Where:** `artifacts/api-server/src/backbone/backboneDb.ts:68`
- **What is wrong:** Traced honestly: the throw is NOT caught per-row and NOT caught per-lane. `loadProtocolEventRows()` is awaited bare at backboneRunner.ts:391 inside `runCycle()`; the only catch is `runCycleSafe`'s outer handler (line 750), which fails the ENTIRE cycle — sale lane, activity read-model, season, milestones, capital — and keeps serving the last-good state. Because the offending row is already PERSISTED in protocol_event_raw, every subsequent cycle re-loads it and throws again: the serving state freezes permanently (no new seats, no new activity, no new season standings) until someone hand-deletes rows from the production DB. The pre-existing `else` branch at line 513 has the same property for a 
- **Fix:** Add a blocking guard check that every `streamKey` in PROTOCOL_EVENT_SCAN_TARGETS beginning with `TREASURY_` resolves through TREASURY_TOKEN_BY_PREFIX (and vice versa) — the miss then goes red at build time instead of poisoning prod. Optionally soften the runtime blast radius by skipping+counting the unlabellable row (an honest gap in one lane) rather than aborting the cycle that also carries the seat lane, since the row's amount is never shown without a token label anyway.


### Client & design system (8)

#### 1. [MEDIUM] The merged USDC row's "verify" links do not include the NFT sale wallet — the dollars they claim to prove are not on any linked page

- **Where:** `artifacts/studio/src/config/trackedAssets.ts:116`
- **What is wrong:** The USDC row sums vault + operations + the NFT SALE WALLET (0xe417…) + the pool share, and the registry comment promises `verify` carries "one per wallet the amount was summed from, so a merged row stays fully checkable". But `verify: ["vaultWallet", "operationsWallet", "nftArchive", "lpPair"]` — and `nftArchive` resolves in verifyLinks.ts:77 to ARCHIVE_1155 (0xB2AE1eb7…), the sale CONTRACT, not the payout wallet. verifyLinks.ts has no id for `FINANCIAL_TARGETS.nftSaleWallet` at all (LinkSpec union, lines 48-60). ProtocolAssetsCard has the identical mistake (`"nft-sales": ["nftArchive"]`, line 36) on a row whose dominant term is the wallet balance.
- **Fix:** Add a `nftSaleWallet` LinkSpec to artifacts/api-server/src/routes/verifyLinks.ts (it is protocol infrastructure like vaultWallet/operationsWallet, and the address law makes it publishable), then use that id in trackedAssets.ts:116 and in ProtocolAssetsCard's `assetVerifyIds["nft-sales"]` (keeping `nftArchive` only for the in-transit contract leg).

#### 2. [MEDIUM] ProtocolAssetsCard's governing header comment now states the opposite of what the file does

- **Where:** `artifacts/studio/src/components/ProtocolAssetsCard.tsx:12`
- **What is wrong:** Lines 12-19 declare, as a founder-ruling-level law, "THE POOL IS NOT VALUED AND NOT SUMMED … no read here establishes the protocol's share … Valuing our real share needs a pool-share read (balanceOf(pair)/totalSupply(pair)) — a named follow-up, never a guess." Lines 135-140 perform exactly that read and line 154 puts `poolUsd` into the summed `priced` array. The same stale claim was propagated into featureStatus.ts (`vaultHoldings` comment: "the pool is not summed") and into the /contracts SEO entry notes ("the pool's reserves are excluded from the total", seo-route-registry.ts).
- **Fix:** Rewrite the header block to the shipped law (pool IS valued, at the protocol's LP share of the USDC leg only, from two live reads; only other providers' liquidity is excluded), and correct the two mirrored claims in featureStatus.ts and the /contracts `notes` in seo-route-registry.ts in the same pass.

#### 3. [MEDIUM] The USDC card renders four full-length verify labels instead of the approved single compact link, blowing out all four card heights

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:224`
- **What is wrong:** VerifyOnChain renders one compact "Verify on-chain" only when `ids.length === 1`; with 2+ ids it renders a "Verify:" prefix plus each link's FULL label (VerifyOnChain.tsx:54-72), and `SHORT_LABELS` has entries only for the four membershipSale ids — so vaultWallet/operationsWallet/nftArchive/lpPair print as "Vault reserve wallet", "Operations wallet", "Archive 1155 (NFT artifacts)", "SYN/USDC LP pair (Trader Joe)". The approved mockup shows exactly one `Verify on-chain ↗` per card (mockup lines 194, 206, 218, 230, 242).
- **Fix:** Add SHORT_LABELS entries for the treasury ids ("Vault", "Operations", "NFT sales", "Pool") in VerifyOnChain.tsx, or give the multi-link branch a compact variant that renders one "Verify on-chain" trigger with the short labels beside it, so the four cards keep equal height.

#### 4. [MEDIUM] Adding the NFT sale wallet to the shared organ topic filter cannot backfill — its historical inflows stay invisible after deploy

- **Where:** `artifacts/api-server/src/backbone/protocolEventScan.ts:553`
- **What is wrong:** `organTopics` (now 4 organs) is shared by the pre-existing TREASURY_USDC_IN/OUT and TREASURY_SYN_IN/OUT streams, whose cursors are already far past their `fromBlock` in production. The scan resumes at `Math.max(target.fromBlock, cursor.lastScannedBlock + 1 - PROTOCOL_REORG_OVERLAP)` (lines 528-534), so widening the filter only affects blocks from the current cursor forward. No cursor reset, backfill script, or stream rename accompanies the change, and the deploy notes in SESSION_STATE record none.
- **Fix:** Either delete the four TREASURY_USDC_*/TREASURY_SYN_* cursor rows as part of this deploy so the widened filter replays from `fromBlock`, or add a one-shot founder-gated backfill script for the NFT sale wallet's Transfer logs — the same pattern already used for `archive:minter-backfill`. Record whichever is chosen in the deploy instruction.

#### 5. [MEDIUM] The per-card USD figure uses text-proof, which fails AA contrast in the light theme

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:209`
- **What is wrong:** `text-proof` resolves to `--proof: var(--cyan-500)` = `hsl(190 90% 40%)` in the light theme (index.css:82, 96) → rgb(10,163,194), relative luminance 0.302. Against the light `--background` (210 40% 98%, luminance ≈0.955) that is a contrast ratio of ~2.9:1. The USD amount is rendered at `text-[13px] font-semibold` — normal-size text requiring 4.5:1. The dark theme is fine; only light fails.
- **Fix:** Darken the light-theme `--proof` token (roughly `190 90% 30%` reaches ~4.6:1 on the light background) — the token is used in 66 places, so fixing it in index.css corrects the whole system at once rather than patching this band.

#### 6. [LOW] The reserves grid hardcodes 4 columns where the approved mockup specifies auto-fit — the registry cannot grow without an orphan card

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:190`
- **What is wrong:** The built grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. The approved mockup uses `.assets{grid-template-columns:repeat(auto-fit,minmax(228px,1fr))}` (docs/design/protocol-owned-assets-mockup.html:56). Two consequences: (a) the card count is frozen at 4 while trackedAssets.ts is explicitly built to grow (the LINK entry is pre-written and commented, lines 121-132, with the file's stated purpose being "the day the founder buys LINK … one entry"); (b) at 1024px the four columns are 213px wide, below the mockup's 228px minimum, so the price line wraps in a way the mockup never showed.
- **Fix:** Replace the fixed column counts with the mockup's rule: `grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]` (a literal class, so Tailwind generates it), which restores the 228px floor and makes the layout follow the registry length automatically.

#### 7. [LOW] The reserves band claims "Live chain read" but shows no as-of — the mockup's provenance line was dropped

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:138`
- **What is wrong:** The band renders `<LiveReadTag state="live">` beside a dollar total and no freshness anchor at all. The approved mockup carries `As of block 91,209,340 · updates live` in its footer (mockup line 63 `.asof`, rendered at the `.foot`). The envelope already exposes `data.asOf` at the top level — ProtocolReality.tsx:167 renders it — and every other live money surface on the site carries its provenance (MembersProvenance on the season band, the guard-freshness law).
- **Fix:** Render `reality.data.asOf` (and the head block if available) in the band's footer beside the disclaimer, matching the mockup's `.asof` treatment and the site's existing provenance pattern.

#### 8. [LOW] The composition legend prints "0%" for a real, non-zero holding — the file's own never-a-false-zero discipline is not applied to it

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:179`
- **What is wrong:** The legend renders `{Math.round(m.p)}%`, while the surrounding helpers go out of their way to avoid false zeros (`usd()` returns "< $0.01", `amount()` returns "< 0.0…1"). `mix` only filters `p > 0`, so any share under 0.5% survives the filter and is then rounded to 0 for display.
- **Fix:** Mirror the helpers: render `< 1%` when `m.p > 0 && Math.round(m.p) === 0`.


### Guards & coverage (8)

#### 1. [MEDIUM] `recognition` was promoted to READ_ONLY_PROOF but never added to the guard's anti-regression PROMOTED pin

- **Where:** `artifacts/api-server/scripts/source-status-truth.guard.ts:49`
- **What is wrong:** This session flipped `recognition` in sourceStatus.ts from `posture: "FUTURE"` / `confidence: "low"` to `posture: "READ_ONLY_PROOF"` / `confidence: "high"`. The PROMOTED map — whose stated purpose is "these surfaces are LIVE and can never silently regress to NOT_WIRED/FUTURE without this guard going red" — still holds the same 13 keys it held before (proof, membership, treasury, routing, chronicle, learning, indexer, archive, source, sale, buyReadiness, receipt, operator). It should have become 14. This is a pinned count that should have moved and did not, in the guard whose entire reason for existing is the fossil class the DONE-IS-DONE law names.
- **Fix:** Add `recognition: "READ_ONLY_PROOF"` to PROMOTED with the dated comment, in the same style as the 2026-07-19 receipt/operator entries. Same pass: add a positive truth pin alongside lines 80-84, e.g. `check("note[recognition] names the live season board", /season board/i.test(cats.recognition?.note ?? ""))`, so the note cannot rot back either.

#### 2. [MEDIUM] `formatTreasuryRaw` — the only thing between an 8-decimal BTC.b amount and a public sentence — has zero test or guard coverage

- **Where:** `artifacts/studio/src/lib/backboneFeedClient.ts:709`
- **What is wrong:** The new per-token decimal map and formatter are exercised by nothing. `grep -rn formatTreasuryRaw artifacts/studio` matches only its own definition and its single call site at line 805; the studio guards chain (package.json:39) contains no test runner and no guard that reads this file. The server-side sibling `treasuryTokenForStream` (backboneDb.ts:57) is equally uncovered — backbone.guard's treasury fixtures are USDC/SYN only (see the separate backbone finding). The commit message names the failure mode itself: "would have printed a BTC.b amount at 6 decimals — a figure wrong by a factor of 100, on a public feed."
- **Fix:** Add a small studio guard (or a node self-test in the guards chain) that pins formatTreasuryRaw against a fixture table: BTC.b 77818 → '0.00077818'; WETH.e 26551703798238159 → '0.026551'; USDC 25500000 → '25.50'; SYN 16000e18 → '16,000.00'; 1 wei BTC.b → '< 0.00000001'; unknown token → null. Six assertions, and the mis-scaling class dies.

#### 3. [MEDIUM] The incomplete deploy gate diagnosed in f7f9e57 was never closed — seo:check and surface:audit are still outside both `guards` and `build`

- **Where:** `artifacts/studio/package.json:39`
- **What is wrong:** f7f9e57's own message states the root cause of Replit's refused deploy cycle: "the root cause was an INCOMPLETE local gate (seo:check + surface:audit are not part of guards or build)". Verified still true at HEAD: `guards` (line 39) lists 21 scripts and includes neither `check-seo-registry.ts` nor `check-public-surface-audit.ts`; `build` (line 8) runs vite, prerender-routes, precompress, precompress-verify and guard-admin-dist — also neither. The scripts exist (`seo:check` line 19, `surface:audit` line 20) but nothing invokes them. The commit shipped the regenerated sitemap.xml (the symptom) and left the gate (the cause) exactly as it was — a direct miss against the PRE-HANDOFF GATE's fix-fr
- **Fix:** Append `&& node scripts/check-seo-registry.ts && node scripts/check-public-surface-audit.ts` to the studio `guards` script. If either needs the built dist, put them in `build` after prerender-routes instead. Either way the SEO-rides-the-slice law becomes a red build rather than a Replit discovery.

#### 4. [MEDIUM] guard-feature-truth cannot see the fossil this session just fixed — it matches only `lifecycle="FUTURE"` and the exact string "Coming later"

- **Where:** `artifacts/studio/scripts/guard-feature-truth.ts:146`
- **What is wrong:** The DONE-IS-DONE detector has exactly two probes: `FUTURE_MARK = /lifecycle="FUTURE"/g` (line 104) and `!code.includes("Coming later")` (line 146). The placeholder this session removed was the bare word `Coming` — verified: `git show 1a9a0fe:artifacts/studio/src/components/ProtocolAssetsCard.tsx` line 116 renders the literal text `Coming`. Neither probe matches it, which the session's own registry comment admits ("a hardcoded 'Coming' placeholder with NO registry key, so no guard could have caught it"). The session registered the `vaultHoldings` key but left the detector exactly as narrow as before, so the class stays open for the next surface.
- **Fix:** Replace the single `includes("Coming later")` with a phrase class matched on the same comment-stripped source: /\b(coming(\s+(later|soon))?|arrives?\s+(later|soon)|available\s+soon|not\s+yet\s+available)\b/i, exempting the truthStatus atom. Run it once and pin any legitimate survivors as exceptions in the same commit, exactly as the forbidden-copy guard documents its 'repo wins' exemptions.

#### 5. [MEDIUM] The USD valuation law — SYN never priced, the pool at our share of the USDC leg only — is enforced by nothing

- **Where:** `artifacts/studio/src/components/ProtocolAssetsCard.tsx:154`
- **What is wrong:** 'SYN is NEVER given a USD value' and 'only directly-held deep-market assets are valued and summed' are named founder laws, implemented entirely in unguarded client TSX. Verified: `grep -rln "ProtocolAssetsCard|ProtocolReservesBand|trackedAssets" artifacts/studio/scripts artifacts/studio/guards` returns nothing — no guard reads any of the three files. The api guard proves only that `financial.price.*` items are SERVED and that their note string contains the substring 'never priced'; it proves nothing about what the client does with them. The guarding is one comment deep on both sides.
- **Fix:** Add a studio guard over trackedAssets.ts + the two components: no TRACKED_ASSETS entry may have symbol SYN (or any priceId resolving to a SYN price); ProtocolAssetsCard's `priced` array must contain `poolUsd` and must NOT contain a raw `lpUsdcNum`; and no `fmtUsd(` call may take a SYN-derived value. Three pins turn a comment into a red build.

#### 6. [LOW] The negative-int256 and future-dated-round fail-closed branches are claimed but never tested

- **Where:** `artifacts/api-server/src/lib/protocol/financialDecoders.ts:114`
- **What is wrong:** Two fail-closed branches guard the price path and neither has a fixture. (1) `answer >= 1n << 255n` (financialDecoders.ts:114) rejects a negative int256 — the guard's own comment at test 7k says "a Chainlink round reporting 0 (or a negative int256)" but the fixture only sends `encRoundData(0n, ...)`. The positive-zero case and the negative case travel different halves of the same condition. (2) `ageS < -CLOCK_SKEW_MAX_S` (realityService.ts, the readPrice closure) rejects a future-dated round — the guard's stale test only sends a 25h-OLD round, so the one-sided-check bug that the code comment says a senior review caught would silently return if someone deleted that clause.
- **Fix:** Two more fixtures in protocol-reality-check.guard.ts, both trivial given encRoundData already exists: a negative answer (`encRoundData((1n << 256n) - 1n, PRICE_UPDATED_AT)` — two's-complement −1) must yield value null + failureReason; and a future-dated round (`encRoundData(BTC_USD_FIX, BigInt(PRICE_NOW_S + 90_000))`) must also fail closed while its siblings read exact.

#### 7. [LOW] All three address-safe self-tests skip the actual boundary (41 hex), so a widened pattern stays green

- **Where:** `artifacts/api-server/scripts/member-continuity.guard.ts:233`
- **What is wrong:** The pattern boundary is 41. Every self-test probes 40 (must pass) and 42 (must fail), never 41: member-continuity.guard.ts:233 uses `synWallet(9)+"ab"` = 42 hex; activity-heartbeat.guard.ts:340 uses `"ab".repeat(21)` = 42 hex; backbone.guard.ts:461 uses the same 42. The re-authoring carried the gap into all three at once.
- **Fix:** Change one of the three (or add a fourth line to each) to the exact boundary: `"0x" + "a".repeat(41)` must throw, and keep `"0x" + "a".repeat(40)` passing. Two adjacent lengths pin the boundary exactly; two lengths two apart do not.

#### 8. [LOW] The comment above the 35-item pin recounts to 31 — a figure written into a truth surface that was not recounted

- **Where:** `artifacts/api-server/scripts/protocol-reality-check.guard.ts:420`
- **What is wrong:** The pin itself is correct: `e.groups.financial.length === 35` (line 423), and the id list literally contains 35 entries (counted: `sed -n '/fin: exact id set/,/].join/p' | grep -c '\"financial\.'` returns 35), and the check's own label string recounts correctly (16+3+3+2+2+1+7+1 = 35). But the comment immediately above it (lines 419-421) says "31 items — the 25 before this slice + vault BTC.b / WETH.e / native AVAX + the 3 Chainlink USD feeds", omitting the 2 LP-share reads and the 2 NFT-sale reads. 25+10 = 35, not 31.
- **Fix:** Correct the comment to '35 items — the 25 before this slice + 3 vault crypto holdings + 3 Chainlink feeds + 2 LP-share reads + 2 NFT-sale reads', matching the check's own label string.


### Docs, ledgers & handoff (10)

#### 1. [MEDIUM] OPEN_QUEUE has no evidence line for 4 of this session's 6 commits

- **Where:** `docs/direction/OPEN_QUEUE.md:3`
- **What is wrong:** `git log 1a9a0fe..HEAD -- docs/direction/OPEN_QUEUE.md` returns only `d1b6e75`. The newest block is line 3 "▶ 2026-07-25 (PM-3) — THE TRUTH SWEEP + THE NFT SALE MONEY". There is no entry for `f7f9e57` (the sitemap regeneration and its engraved gate lesson), `352a904` (season board rows made verifiable — the founder-caught masking-reflex incident), `6953972` (the Protocol Reserves band), `35c5083` (the three founder-caught defects), or `add5bb8` (the treasury lanes, the fourth organ, the two binary defects). Grepping OPEN_QUEUE for "reserves|trackedAssets|352a904|6953972|35c5083|add5bb8" returns nothing relevant. The standing rule: read OPEN_QUEUE at boot, restate at gates, append evidence be
- **Fix:** Append one evidence block per slice at the top of OPEN_QUEUE, each with its sha, what landed, the gates run, and the deploy verdict — in particular the `352a904` entry must record that seasonReadmodel is Tier-2 stage-2 COMPLETE so item ①-2 is down to six remaining services, and the `f7f9e57` entry must carry the sitemap/seo-battery gate lesson.

#### 2. [MEDIUM] featureStatus.ts — the DONE-IS-DONE registry — carries a claim its own commit's code refutes

- **Where:** `artifacts/studio/src/config/featureStatus.ts:60`
- **What is wrong:** featureStatus.ts:59-62 states, in the `vaultHoldings` entry: "SYN is never priced and the pool is not summed (valuing the protocol's real pool SHARE needs its own read — a future key when that slice comes, never a claim on this one)." The SAME commit `d1b6e75` shipped that read and that sum: `ProtocolAssetsCard.tsx:99-100` reads `financial.lp.totalSupply` + `financial.lp.protocolBalance`, :138-140 computes `poolShare` and `poolUsd`, and :154 includes `poolUsd` in `const priced = [usdcUsd, opsUsd, avaxUsd, btcbUsd, wethUsd, poolUsd, nftUsd]` which produces the total. SESSION_STATE ⑨ and BACKLOG.html both correctly record the pool share as SHIPPED. The registry — declared "the ONE source of tr
- **Fix:** Rewrite the `vaultHoldings` comment to match the shipped code: the pool IS counted, at the protocol's real LP share of the USDC leg only (two live reads), and SYN is never priced. Same correction is needed at `ProtocolAssetsCard.tsx:12-19` and `seo-route-registry.ts:506`.

#### 3. [MEDIUM] ProtocolAssetsCard's own header comment states the opposite of the code beneath it

- **Where:** `artifacts/studio/src/components/ProtocolAssetsCard.tsx:12`
- **What is wrong:** Lines 12-19 read: "THE POOL IS NOT VALUED AND NOT SUMMED. ... AND the pair's reserves belong to every liquidity provider, not to the protocol alone: **no read here establishes the protocol's share**. So the pool is shown as reserves, in tokens, plainly labelled, and left out of the total. Valuing our real share needs a pool-share read (balanceOf(pair)/totalSupply(pair)) — a named follow-up, never a guess." Lines 99-100, 135-140 and 154 of the SAME FILE do exactly that read and put `poolUsd` in the total. The rendered copy at :292-295 is honest ("From the pool, only the protocol's own share of the USDC side — its LP tokens over the total supply, both read live") — so the SURFACE is correct an
- **Fix:** Replace the third bullet of the header block with the shipped law: the pool IS counted at the protocol's own LP share (`financial.lp.protocolBalance` / `financial.lp.totalSupply`, both live), USDC leg only, never the SYN leg; only the LIQUIDITY wallet counts as protocol-owned, never the founder's personal LP position.

#### 4. [MEDIUM] The /contracts SEO registry entry states the pool is excluded from the total — it is included

- **Where:** `artifacts/studio/src/lib/seo-route-registry.ts:506`
- **What is wrong:** The `/contracts` entry's `notes` field, rewritten in `d1b6e75` under the SEO-rides-the-slice rule, reads: "...a priced-holdings total that fails closed on any missing read; SYN is shown as an amount only and **the pool's reserves are excluded from the total**...". The same commit made `poolUsd` a component of that total (`ProtocolAssetsCard.tsx:154`). The served `description` on the same entry is accurate, so nothing wrong reaches Google — but the registry is the internal record of what each route serves, and it now describes a figure the route does not produce.
- **Fix:** Correct the notes to: '...SYN is shown as an amount only and the pool contributes only the protocol's own LP share of its USDC leg (two live reads), never a doubled reserve.'

#### 5. [MEDIUM] The '8 rows' figure is wrong in two truth docs — the card has 9

- **Where:** `docs/SESSION_STATE.md:73`
- **What is wrong:** SESSION_STATE.md:73-76 says "`ProtocolAssetsCard` rewritten — 8 rows (Vault USDC · Operations USDC · Vault AVAX · BTC.b · WETH.e · Vault SYN · the SYN/USDC pool · the renamed **\"Seat-sale reserve\"**)" and DESIGN_ROADMAP.md:65-66 repeats it verbatim in French ("**8 lignes**", same eight). The committed card has NINE rows — `ProtocolAssetsCard.tsx` ids at :181 vault, :190 ops, :199 nft-sales, :208 vault-avax, :217 vault-btcb, :226 vault-weth, :235 vault-syn, :244 pool, :256 seat-reserve. The missing one is "NFT sales USDC", added in the SAME commit `d1b6e75` and described three paragraphs lower in SESSION_STATE (③-bis) — so the doc contradicts itself. PRE-HANDOFF GATE §③: "Every figure writt
- **Fix:** Recount and correct both docs to 9 rows, inserting 'NFT sales USDC' into the enumeration in SESSION_STATE.md:73 and DESIGN_ROADMAP.md:65.

#### 6. [MEDIUM] DESIGN_ROADMAP's deploy verdict is stale — it names a prod sha and a batch that already shipped

- **Where:** `docs/DESIGN_ROADMAP.md:73`
- **What is wrong:** Lines 73-75: "**DEPLOY : 🚀 GROUPÉ MAINTENANT** — le commit des avoirs change des lectures SERVEUR, donc il n'est pas batchable : il emporte `f2642aa` · `3b32f2c` · `29f8559` · `469882d` au-dessus de prod `e21a036` en un seul déploiement." That deploy HAPPENED — SESSION_STATE:11 records prod = `f7f9e57` sealed live, carrying exactly that batch. The roadmap still presents it as pending. BACKLOG.html:200 carries the identical stale claim ("Prod = <span class=\"mono\">e21a036</span>").
- **Fix:** Update DESIGN_ROADMAP.md:73-75 and BACKLOG.html:200 to prod = `f7f9e57` (sealed 2026-07-25, carrying f2642aa · 3b32f2c · 29f8559 · 469882d · d1b6e75 · f7f9e57), and state the CURRENT pending batch: 352a904 · 6953972 · 35c5083 · add5bb8.

#### 7. [LOW] featureStatus has no key for the Reserves band, and vaultHoldings' `where` no longer names its surfaces

- **Where:** `artifacts/studio/src/config/featureStatus.ts:63`
- **What is wrong:** `vaultHoldings: { status: "live", since: "2026-07-25", where: "/contracts + /admin (the vault's multi-token holdings + the priced-holdings total)" }` — the same valued-holdings capability now also serves on the PUBLIC HOME via `ProtocolReservesBand` (`PublicHome.tsx:290`), which the `where` does not name. No separate key was registered for the reserves band either. `guard-feature-truth` will not go red (the band carries no `lifecycle="FUTURE"` claim — I grepped both new files for coming/future/soon and found none), so this is not a guard failure; it is a registry-completeness gap. DONE-IS-DONE §① calls this file "the ONE source of truth for live-vs-future", and §④ requires the resume block t
- **Fix:** Either extend `vaultHoldings.where` to '/ + /contracts + /admin (the vault's multi-token holdings, the priced-holdings total, and the public home Reserves band)', or register a distinct `protocolReserves` key as live since 2026-07-25 pointing at '/ (the registry-driven Protocol Reserves band)'. Record the flip in the SESSION_STATE resume block as DONE-IS-DONE §④(a) requires.

#### 8. [LOW] SESSION_STATE's remaining-work list cites copy fossils that were already fixed this session

- **Where:** `docs/SESSION_STATE.md:57`
- **What is wrong:** Item ①-6 lists as REMAINING: "Copy fossils reworded (THREE phrasings across ~6 sites, incl. SERVED SEO/meta — the SEO-rides-the-slice rule): `seo-route-registry.ts`:496,504 · `ProtocolMap.tsx`:172 · `protocolOsMap.ts`:72 · `moduleRegistry.ts`:199 · `panels.tsx`:209,559-561." The `seo-route-registry.ts` sites were already fixed in `d1b6e75`: grepping the file for 'pre-masked|never reach a client|never a full address' returns nothing, and lines 496-506 now read 'Contracts & Holdings' with 'Addresses render short-form with a Snowtrace link per the 2026-07-25 address law; the name-to-address mapping is what never leaves the server.' The other four sites (ProtocolMap:172, protocolOsMap:72, module
- **Fix:** Strike the `seo-route-registry.ts:496,504` reference from ①-6 and note it as done in d1b6e75, leaving the four genuinely-open sites (ProtocolMap.tsx:172 · protocolOsMap.ts:72 · moduleRegistry.ts:199 · panels.tsx:209,559-561) with their verified line numbers.

#### 9. [LOW] The resume block does not hold the DONE-IS-DONE §④ order, and marks committed-not-deployed work as SHIPPED without saying so

- **Where:** `docs/SESSION_STATE.md:24`
- **What is wrong:** CLAUDE.md DONE-IS-DONE §④ requires the WHERE-WE-ARE block to name, in this order, (a) what went LIVE with its registry flips, (b) what is IN FLIGHT with its exact next step, (c) the founder's pending decisions. The block instead opens with an OPEN-work index and interleaves states by a frozen numbering: ① IN FLIGHT, ② open, ③ ✅ SHIPPED, ④ open, ⑤ ✅ DONE, ⑥ open, ⑦ open, ⑧ ✅ SHIPPED, ⑨ ✅ SHIPPED, ⑩ open. There is no (a) live section and no (c) founder-pending section at the top — the only '(c) FOUNDER-PENDING' heading sits at line 402, buried inside the S3 block, and is explicitly "the S3-GATE SUBSET" that defers to BACKLOG.html for the rest (a doc this audit found stale). Separately, ⑧ is he
- **Fix:** Restructure the resume block head into the three §④ sections before the numbered index: (a) LIVE IN PROD at f7f9e57 with the registry flips (vaultHoldings); (b) COMMITTED-NOT-DEPLOYED, four commits with their next step (one grouped deploy) — moving ⑧ here with an explicit 'shipped in repo, not yet live' marker; (c) FOUNDER-PENDING, consolidated. Keep the ①-⑩ numbering below as the detail index.

#### 10. [LOW] No consolidated FOUNDER-PENDING list exists for the handoff — the items are scattered and the doc they defer to is stale

- **Where:** `docs/SESSION_STATE.md:402`
- **What is wrong:** The only FOUNDER-PENDING heading (line 402) says "the S3-GATE SUBSET, placed at their moments — *(the full open set is `docs/direction/BACKLOG.html`...)*" and BACKLOG.html is stale (prod sha wrong, ⑧ shown as open though shipped, no reserves band). The decisions genuinely waiting on him, verbatim from the committed docs, are: (1) SESSION_STATE:156 and :181 — "the founder's rider ruling on the 2 artifacts the NFT sale wallet itself minted" (:182 gives the choice: "relabel as a protocol mint, or leave them as Community") — this is AW-5's open rider, AW-5's NAME itself being closed ("✅ NAMED BY THE FOUNDER 2026-07-25: 'NFT Sale Wallet'", :178); (2) :120 — "the `.type-h2` serif DECISION (Seasons
- **Fix:** Add a (c) FOUNDER-PENDING section to the top of the resume block listing all six groups verbatim as above, with the near-term three (AW-5 rider ruling, .type-h2 serif, ⑩ final public words) separated from the S3-gate set that arrives at its own moments, and stop deferring to BACKLOG.html until BACKLOG.html is refreshed.


### Truth fossils (public claims) (14)

#### 1. [MEDIUM] /contracts contradicts itself: five contract-memory notes deny the exact addresses, balances and prices the new holdings card shows at the top of the SAME page

- **Where:** `artifacts/studio/src/config/contractMemory.ts:178`
- **What is wrong:** d1b6e75 mounted `ProtocolAssetsCard` at the top of /contracts (ContractMemory.tsx:27) — it renders Vault USDC / AVAX / BTC.b / WETH.e / SYN balances, live Chainlink USD prices, the SYN/USDC pool reserves + our share %, and a `VerifyOnChain` Snowtrace link on every row. It did NOT sweep the contract-memory notes rendered directly below, which still say the opposite: line 178 vault-wallet "The treasury wallet role in canon. No address or balance is shown."; line 187 liquidity-wallet "Structure only — no address, balance, or price."; line 196 operations-wallet "No address or balance is shown."; line 205 founder-wallet "No address, schedule figure, or balance is shown."; line 213 liquidity-pair 
- **Fix:** Re-true all five notes to today's reality (the 2026-07-25 address law: an address is PUBLIC). 178: "The protocol's primary treasury wallet. Its live balances and its Snowtrace page are shown in the holdings card above." 187: "The wallet that provides protocol liquidity. Its pool position is read live in the holdings card above." 196: "The wallet funding protocol operations — its live USDC balance is shown above." 205: "The vested founder allocation. Its schedule is canon; its wallet is verifiable on Snowtrace." 213: "The SYN/USDC pair. Its reserves and the protocol's own share of them are read live in the holdings card above." ContractMemory.tsx:35-37 → "The contract memory below is roles an

#### 2. [MEDIUM] The commission denial and the REMOVED legal gate survive in canon — and a guard actively pins them in place

- **Where:** `artifacts/api-server/src/canon/the-syndicate/proof/protocol-event-registry.ts:214`
- **What is wrong:** The exact falsehood the founder caught still lives in `FUTURE_EVENT_NAMESPACES`. Line 214 (referral-attribution): "…No commission is implied or paid until verified source records are created, read back, legally approved, and wired live." Line 222 (referral-reward): "…Commission status stays PENDING and pays nothing until verified source records are created, read back, legally approved, and wired live." Two defects each: (a) commissions ARE paid on-chain inside the buyer's own transaction (proven at seat #13; contractMemory.ts:137 and referralProgram.ts:178 both say so); (b) "legally approved" re-states the LAWYER GATE that SETTLED_RULES §8-⑧ (2026-07-24) removed everywhere and forbids mentio
- **Fix:** protocol-event-registry.ts:214 → "Records who brought whom into The Syndicate: buyer/member number, USDC routed, SYN sold. An eligible attributed purchase pays its bounded commission to the introducer inside the buyer's own transaction — real money, already paid, verifiable on-chain." :222 → delete the `referral-reward` namespace entirely (the settlement it describes as future is live), or retitle it to the genuine remaining future and strip "legally approved" from any wording. GUARD: change sale-event-semantics-reconcile.guard.ts:108-109 to assert the namespaces are NOT PENDING (or drop the two checks) in the same commit. Regenerate referralAttributionSnapshot.ts via the founder-gated build

#### 3. [MEDIUM] The session planted four NEW public notes claiming "the wallet address stays server-side" — while the same session links those wallets to Snowtrace

- **Where:** `artifacts/api-server/src/lib/protocol/realityService.ts:1463`
- **What is wrong:** d1b6e75 added four served notes ending "Aggregate balance only — the wallet address stays server-side.": line 1463 (vault BTC.b), 1491 (vault WETH.e), 1521 (vault native AVAX), 1576 (NFT sale wallet USDC). Every one of these notes renders publicly (ProtocolReality.tsx:104 on /status and /map). Every one is FALSE: the same commit gives those wallets `VerifyOnChain` Snowtrace links on /contracts (ProtocolAssetsCard.tsx:29-39 → vaultWallet, nftArchive) and on the home Reserves band (trackedAssets.ts:75,86,97,116), served by /api/protocol/verify-links. Three pre-existing siblings carry the same string: lines 1249, 1277, 2033. This is the address-hiding reflex the founder ruled a BUG on 2026-07-2
- **Fix:** Delete the clause from all seven notes and replace it with the law's own framing: "…exact 8-decimal base units. The wallet is public — verify it yourself on Snowtrace." (adjust the decimal count per row: 1463 8-decimal, 1491/1521 18-decimal, 1576/1249/1277 6-decimal, 2033 18-decimal). GUARD: add a check to protocol-reality-check.guard.ts that no served `note` contains /address(es)? (stays?|are|is) (held )?server-side/i — the phrase class is now a doctrine violation, not a virtue.

#### 4. [MEDIUM] /status still tells the public that full contract addresses are held server-side only

- **Where:** `artifacts/api-server/src/data/sourceStatus.ts:128`
- **What is wrong:** The `contracts` posture note renders verbatim on the public /status table (SystemStatus.tsx:252): "Contract registry and ABIs are vendored and pinned from TheSyndicate main canon; full addresses are held server-side only and never exposed in this payload." The first clause is false — /api/protocol/verify-links deliberately publishes them (rpcTransport.ts:126: "INFRASTRUCTURE addresses ARE deliberately emitted — verifyLinks publishes…"), /contracts links every holdings row to Snowtrace, and JoinProtocol.tsx:282 reconstructs full addresses from those URLs client-side. It also preaches address-hiding as a protection, which the 2026-07-25 ruling forbids.
- **Fix:** Replace with: "Contract registry and ABIs are vendored and pinned from TheSyndicate main canon. Contract addresses are public: every one is published as a Snowtrace verify-link so you can check the code yourself. This payload carries posture only — no values. Live contract reads are served by the protocol reality spine." GUARD: source-status-truth.guard.ts should pin a positive assertion (note[contracts] mentions verifiable/Snowtrace) rather than leaving the field free-form.

#### 5. [MEDIUM] /status calls the per-transaction treasury ledger "the remaining future layer" — the heartbeat has served it for ten days, and this session added two more token lanes to it

- **Where:** `artifacts/api-server/src/data/sourceStatus.ts:223`
- **What is wrong:** The `treasury` note (rewritten by this very session) still ends: "A per-transaction anchored treasury ledger is the remaining future layer." That is false. protocolEventScan.ts:594-634 serves eight treasury lanes — TREASURY_USDC_IN/OUT, TREASURY_SYN_IN/OUT, and (added in add5bb8, this session) TREASURY_BTCB_IN/OUT + TREASURY_WETH_IN/OUT. backboneFeedClient.ts:804-826 renders one sentence per movement with its transaction anchor ("open the transaction for the exact amount"), and the `proof` note two rows above on the SAME table already says the feed "carries a transaction verify anchor on every line" including "treasury movements". The session hardened the very ledger it kept calling future.
- **Fix:** Replace the final sentence with: "Every treasury movement is also indexed per transaction and served on /activity — in, out and internal rebalances across USDC, SYN, BTC.b and WETH.e, each anchored to its own transaction." GUARD: add a source-status-truth.guard check that note[treasury] names /activity and does not contain /remaining future layer/i — the same shape as the checks already at lines 83-85.

#### 6. [MEDIUM] /status claims the server never echoes an address; the season API now serves full addresses publicly

- **Where:** `artifacts/api-server/src/data/sourceStatus.ts:327`
- **What is wrong:** The `walletSession` note reads "The server stores no identity and never echoes an address". 352a904 added `wallet` and `explorerUrl` to `SeasonStandingPublic` (seasonReadmodel.ts:152-162, populated at :525-526), so /api/season/standings now returns the full chain-emitted address for every public board row — correctly, per the address law. On a public honesty table the sentence reads as a protocol-wide guarantee, and it is no longer true. Same class: line 213 (`token`) says "addresses leave the server only as explorer verify-links" — also outdated by the season endpoint.
- **Fix:** Line 327 → "Public SIWE wallet session: a signed session proves control of a wallet right now — never membership. The server stores no name, alias or email, and the membership self-readback returns only the active engine's own figure for the signed wallet." Line 213 → "…token and contract addresses are vendored and pinned in the canon config, and published openly as explorer verify-links. Live token figures — supply, the burn total, the pool — serve on the Tokenomics page from the reality spine." GUARD: extend the sourceStatus payload-discipline `FORBIDDEN_PATTERNS` (line 431) with /never echoes an address/i and /addresses? (stay|are held) server-side/i so the hiding framing throws at module

#### 7. [MEDIUM] The "recognition is a future concept" family survived in its sibling node — acknowledgement still says "nothing is wired"

- **Where:** `artifacts/studio/src/config/protocolOsMap.ts:279`
- **What is wrong:** d1b6e75 fixed the `recognition` node (lines 225-233) but left its direct sibling four entries down: `acknowledgement` — label "Acknowledgement & recognition moments", summary "Acknowledgement of verified member milestones", reality "Concept only. Recognition is structural, never a financial benefit; nothing is wired." All three parts are false today: the milestone layer joined the served heartbeat at H2-⑬ (protocolEventScan milestone lanes; MilestonesPanel.tsx renders canonical crossings anchored to their transactions on /activity), seasonQuests credit real acts own-row (featureStatus.ts:54), and the notification center delivers member moments (featureStatus.ts:33). It also still binds `life
- **Fix:** Rebind to `binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" }`, summary → "Acknowledgement of verified member milestones — live.", reality → "LIVE — milestone crossings are indexed and anchored to their transactions on /activity, quests credit real acts own-row on /member, and the notification center delivers the moment. Recognition is structural, never a financial benefit." Do it in the same pass as the widened guard regex above so the node stops being an unpinned FUTURE site.

#### 8. [MEDIUM] The public /map page still tells visitors contract addresses stay server-side

- **Where:** `artifacts/studio/src/pages/ProtocolMap.tsx:172`
- **What is wrong:** /map is a PUBLIC route rendering `ProtocolRealityPanel` (line 166). Its footer copy reads: "Archive artifacts are deliberately not bound on this page yet — that wiring is a future founder-approved slice. Contract addresses stay server-side; this page never connects a wallet and never sends a transaction." The address clause is false under the 2026-07-25 law and is contradicted by /contracts, the home Reserves band, /season and /join — all of which publish those addresses as Snowtrace links. Same phrase class as the sourceStatus and realityService findings, on a third public surface.
- **Fix:** Replace the second sentence with: "Contract addresses are public — every one is a Snowtrace link away. This page never connects a wallet and never sends a transaction." Keep the archive-artifacts sentence (that wiring is genuinely unbuilt), but register it: it is an unpinned future claim on a public page and needs a featureStatus key (e.g. `mapArchiveBinding`) once the guard regex is widened.

#### 9. [MEDIUM] Three surfaces claim the pool is excluded from the holdings total; the shipped code sums it

- **Where:** `artifacts/studio/src/config/featureStatus.ts:61`
- **What is wrong:** The `vaultHoldings` registry comment (lines 60-62) states "the pool is not summed (valuing the protocol's real pool SHARE needs its own read — a future key when that slice comes, never a claim on this one)". ProtocolAssetsCard.tsx's own header (lines 12-19) says "THE POOL IS NOT VALUED AND NOT SUMMED... Valuing our real share needs a pool-share read (balanceOf(pair)/totalSupply(pair)) — a named follow-up, never a guess." Both are contradicted by the same commit's code: lines 135-140 compute `poolShare` from exactly that read and `poolUsd`, and line 154 puts `poolUsd` in the summed `priced` array. The same false statement reached `seo-route-registry.ts:506` — "the pool's reserves are excluded
- **Fix:** featureStatus.ts:59-62 → "...A USD figure is served for the directly-held deep-market assets, plus the protocol's own share of the pool's USDC leg (LP balance over total supply, both read live). SYN is never priced." ProtocolAssetsCard.tsx:12-19 → rewrite the paragraph to describe what the code does: the pool is counted at our real share of its USDC leg only, never by doubling the reserve, and the SYN leg is never priced. seo-route-registry.ts:506 → replace "the pool's reserves are excluded from the total" with "the pool counts only at the protocol's own share of its USDC leg".

#### 10. [LOW] /status publishes "As of 2026-07-19" over canon this session rewrote on 2026-07-25

- **Where:** `artifacts/api-server/src/data/sourceStatus.ts:97`
- **What is wrong:** `CANON_AS_OF = "2026-07-19T00:00:00.000Z"` and SystemStatus.tsx:197 renders it as "As of 2026-07-19". d1b6e75 changed four notes and one posture in this file (receipt, recognition posture FUTURE→READ_ONLY_PROOF, membership, treasury) without bumping the constant. The file's own header (lines 91-93) states the rule: "Whoever changes the protocol's reality updates the matching entry IN THE SAME SLICE."
- **Fix:** Set `const CANON_AS_OF = "2026-07-25T00:00:00.000Z";`. GUARD: add a check to source-status-truth.guard.ts that fails if `git log -1 --format=%cs` for sourceStatus.ts is newer than the date encoded in CANON_AS_OF — the date can then never lag a note change again.

#### 11. [LOW] The public /status posture table points five categories at routes that do not exist

- **Where:** `artifacts/api-server/src/data/sourceStatus.ts:224`
- **What is wrong:** SystemStatus.tsx:255-257 renders `Surface · {item.surface}` for every row. Five values name routes absent from App.tsx's route table: `treasury` → "/treasury" (line 224), `routing` → "/treasury" (line 234), `economy` → "/economy" (line 244), `entities` → "/entities" (line 284), `indexer` → "/indexer" (line 294), `guardrails` → "/guardrails" (line 318). The identical defect was already fixed once for the `token` row (its comment at line 211 records "the phantom /token surface" dying); the siblings were never swept.
- **Fix:** Repoint to the real homes: treasury → "/contracts", routing → "/contracts", economy → "/tokenomics", indexer → "/activity", entities and guardrails → drop the field to a non-route marker or reuse "/status". GUARD: source-status-truth.guard.ts should assert every `surface` value is either a path present in the studio seo-route-registry or an explicitly allow-listed non-route token — a cross-artifact check the studio's own route registry already makes cheap.

#### 12. [LOW] /recognition was flipped to PUBLIC+INDEX carrying an unregistered FUTURE claim the DONE-IS-DONE guard structurally cannot see

- **Where:** `artifacts/studio/src/pages/Recognition.tsx:39`
- **What is wrong:** The "Standing over time" dimension carries `lifecycle: "FUTURE"` (object-property form) and renders a FUTURE LifecycleBadge at line 55. `guard-feature-truth.ts:105` detects only `/lifecycle="FUTURE"/g` — the JSX-attribute form. `lifecycle: "FUTURE"` never matches, so check 3 ("No unpinned FUTURE claim anywhere in src") passes while an unpinned claim renders. There is no registry key for a cross-season standing figure in featureStatus.ts. d1b6e75 promoted this page from PENDING/noindex to PUBLIC/INDEX/sitemap (seo-route-registry.ts:476-479) — so an unregistered future promise is now Google-indexed. The same blind spot hides `config/contractMemory.ts:158` (Seat Record) and `config/protocolOsMa
- **Fix:** Register the key: add `crossSeasonStanding: { status: "future", since: "2026-07-25", where: "/recognition (the single long-term standing figure across seasons)" }` to the FUTURE block of featureStatus.ts, and pin `"pages/Recognition.tsx": ["crossSeasonStanding"]` in PINNED_CLAIM_SITES. GUARD: broaden the detector at guard-feature-truth.ts:105 to `/lifecycle\s*[:=]\s*"FUTURE"/g` so both the JSX and object forms count — then pin contractMemory.ts (seat-record-721 → a new `seatRecord721` key) and protocolOsMap.ts's three FUTURE nodes in the same pass, or the widened regex turns the build red.

#### 13. [LOW] The financial group's public description was not updated when the group grew from 25 reads to 35

- **Where:** `artifacts/studio/src/components/ProtocolReality.tsx:39`
- **What is wrong:** `groupBlurb.financial` renders above the financial table on /status and /map and reads as an exhaustive inventory: "...cumulative USDC inflow ... vault + operations balances ..., pool reserves, burned SYN, the live member tally, the referral attribution activity count, and the cumulative USDC paid to referrers...". d1b6e75 added ten reads it never mentions: vault BTC.b, vault WETH.e, vault native AVAX, three Chainlink USD price feeds, LP totalSupply, the protocol's LP balance, and the two NFT-sale USDC balances. The founder's standing rule is that a slice changing a page's reality updates that page's descriptive layer in the same commit.
- **Fix:** Extend the enumeration after "vault + operations balances": "..., the vault's native AVAX, BTC.b and WETH.e holdings valued at live Chainlink USD prices, the SYN/USDC pair's total LP supply and the protocol's own LP balance (which give our exact pool share), the USDC held by the NFT sale wallet and by the sale contract itself, pool reserves, burned SYN, ...". GUARD: guard-posture-map or check-public-surface-audit should assert every served financial item id has a counterpart mention — or at minimum that the blurb's word count moved in any commit that changes the financial item count.

#### 14. [LOW] The home page promises unnamed "Other / Future Streams" — an internal plan published as a public promise

- **Where:** `artifacts/studio/src/config/syndicateFacts.ts:478`
- **What is wrong:** `{ id: "future", label: "Other / Future Streams", status: "Coming" }` renders in the home hero's capital-sources ledger (HeroLedger.tsx:143 renders `{item.status}`). It names no stream, cites no registry key, and is invisible to guard-feature-truth (which bans only the literal "Coming later"). This is the same rule the deleted Attribution Router card broke — "an internal plan never becomes a public promise" — in vaguer form, on the highest-traffic page. The neighbouring row `{ id: "lpfees", label: "LP Fee Flow", status: "Not tracked yet" }` is true today but equally unregistered.
- **Fix:** Delete the `future` row (the ledger is stronger listing only real, verifiable streams). If the founder wants the slot held, register it: add a `revenueStreams` future key to featureStatus.ts, pin config/syndicateFacts.ts in guard-feature-truth's PINNED_CLAIM_SITES, and name the actual stream in the label. Keep "LP Fee Flow — Not tracked yet" (it is true) but pin it to the same key so it cannot outlive its slice.


### Scope & completeness (11)

#### 1. [MEDIUM] Four false "no balance / no address / no live price" cards still publish on /contracts, beside the new live assets card

- **Where:** `artifacts/studio/src/config/contractMemory.ts:214`
- **What is wrong:** The truth sweep deleted the Attribution Router card (contractMemory.ts:126-135) because the founder pointed at it, and the commit's own doctrine is "fossils travel in packs". It then swept the RECOGNITION family and stopped. On the SAME page (ContractMemory.tsx:27 renders ProtocolAssetsCard, then line 60 renders every `note`), four treasury cards still deny exactly what the new card publishes three inches above them: `liquidity-pair` :214 "No live price, reserve, or quote is read in this foundation"; `vault-wallet` :178 "No address or balance is shown"; `liquidity-wallet` :187 "Structure only — no address, balance, or price"; `operations-wallet` :196 "No address or balance is shown". The ver
- **Fix:** Rewrite all four notes to today's reality in the same voice as the Source Registry card, e.g. liquidity-pair → "The canon SYN/USDC pair. Its reserves, the protocol's own LP share and our side of the USDC leg are read live and shown above — verifiable on Snowtrace."; vault/liquidity/operations → "…its address and its live balance are shown above, each verifiable on Snowtrace." Then grep contractMemory.ts for every remaining "No …is shown" / "not read" phrase and re-verify each against the served card before commit.

#### 2. [MEDIUM] The NFT-sales money links to the sale CONTRACT, not the wallet that holds it — the 25.50 USDC claim is unverifiable

- **Where:** `artifacts/studio/src/config/trackedAssets.ts:116`
- **What is wrong:** The USDC row's verify list uses "nftArchive", and ProtocolAssetsCard.tsx:36 does the same for its "NFT sales USDC" row. verifyLinks.ts:77 resolves nftArchive to CONTRACT_TARGETS ARCHIVE_1155 = 0xB2AE1eb7…D54d — the sale/mint contract (identical to FINANCIAL_TARGETS.nftSaleContract), whose USDC balance the server itself documents as "normally zero" (realityService.ts:1603). The money actually sits in FINANCIAL_TARGETS.nftSaleWallet = 0xe417…d56f, and that wallet has NO entry in verifyLinks.ts SPECS (:72-85). The registry's own contract says one link "per wallet the amount was summed from, so a merged row stays fully checkable" (trackedAssets.ts:48-50) — that contract is violated for the leg t
- **Fix:** Add a `nftSaleWallet` LinkSpec to verifyLinks.ts (label "NFT Sale Wallet", address FINANCIAL_TARGETS.nftSaleWallet, kind address) — it is protocol infrastructure exactly like the vault and operations wallets — then swap "nftArchive" for "nftSaleWallet" in trackedAssets.ts:116 and ProtocolAssetsCard.tsx:36 (keep nftArchive on the card's row only if contractUsdcBalance stays in that sum).

#### 3. [MEDIUM] Past NFT-sale inflows will never be indexed — adding a 4th organ does not rewind the existing USDC/SYN cursors

- **Where:** `artifacts/api-server/src/backbone/protocolEventScan.ts:557`
- **What is wrong:** add5bb8 added the NFT Sale Wallet to `organTopics`, which is the topic filter for ALL eight treasury lanes. But TREASURY_USDC_IN/OUT and TREASURY_SYN_IN/OUT already have persisted cursors at head, and the resume logic (protocolEventScan.ts:528-534) only ever moves forward: `resumeFrom = max(target.fromBlock, cursor.lastScannedBlock + 1 - REORG_OVERLAP)`. There is no cursor reset, no backfill script, and no migration in the commit. Only the brand-new BTCB/WETH lanes (no cursor) actually backfill from block 87,157,852. The commit message, SESSION_STATE ⑧ and CANON_PROTOCOL_LANGUAGE all assert this "is what unblocks the patronage rungs, which could never seal while their money arrived unseen" —
- **Fix:** Either reset the four TREASURY_USDC_*/TREASURY_SYN_* cursors to FINANCIAL_TARGETS-era fromBlock (87,157,852) so the widened filter replays history — the inserts are idempotent on (chain, tx, logIndex) — or give the NFT Sale Wallet its own dedicated lane pair with its own fresh cursor. Until one of those ships, correct the "unblocks the patronage rungs" claim in the commit trail, SESSION_STATE ⑧ and CANON_PROTOCOL_LANGUAGE to say forward-only.

#### 4. [MEDIUM] ProtocolAssetsCard's governing header comment still says the pool is NOT valued and NOT summed — the code does both

- **Where:** `artifacts/studio/src/components/ProtocolAssetsCard.tsx:12`
- **What is wrong:** Lines 12-19 state as law: "THE POOL IS NOT VALUED AND NOT SUMMED. … So the pool is shown as reserves, in tokens, plainly labelled, and left out of the total. Valuing our real share needs a pool-share read (balanceOf(pair)/totalSupply(pair)) — a named follow-up, never a guess." That follow-up shipped in the SAME commit: lines 135-140 compute poolShare from exactly those two reads, and line 154 puts `poolUsd` inside the `priced` array that produces the total. The comment is the first thing any session (or reviewer) reads in the file, and it now teaches the opposite of the code.
- **Fix:** Rewrite the third bullet to the shipped law: the pool counts at OUR REAL SHARE of the USDC leg only (financial.lp.protocolBalance / financial.lp.totalSupply applied to financial.lp.reserveUsdc); the SYN leg is never priced; only the liquidity WALLET counts as protocol-owned. Keep the doubling-is-forbidden rationale — that part is still the law.

#### 5. [MEDIUM] The served /contracts SEO note claims the pool is excluded from the total — it is included

- **Where:** `artifacts/studio/src/lib/seo-route-registry.ts:506`
- **What is wrong:** The `/contracts` registry entry's notes say "…SYN is shown as an amount only and the pool's reserves are excluded from the total". At HEAD the protocol's share of the pool's USDC leg IS in the total (ProtocolAssetsCard.tsx:154). The SEO-rides-the-slice rule says the metadata is updated in the SAME commit as the reality change; here the reality moved inside the very commit that wrote the note.
- **Fix:** Replace that clause with the shipped law: "SYN is shown as an amount only; the pool counts at the protocol's own share of its USDC leg (LP balance over total supply, both read live) and never by doubling the USDC reserve." Then re-run seo:check + surface:audit (the sitemap lesson this session engraved).

#### 6. [MEDIUM] The home band's live tag is derived from USD values, not from the reads — the exact defect fixed on the sibling card the same day

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:121`
- **What is wrong:** `const anyLive = parts.some((p) => p !== null)` where `parts` are the per-row USD VALUES, then `tagState = anyLive ? "live" : …`. ProtocolAssetsCard was explicitly corrected this session for precisely this — its comment at line 159-160 reads "The live tag speaks about the READS, not about the valuation: token amounts can serve perfectly while a price feed is down, and vice versa" — and its `anyAmountLive` (line 161) checks the AMOUNTS. The new public surface reintroduced the pattern that the senior review killed on the old one.
- **Fix:** Mirror the sibling: compute `anyAmountLive` from `rows.some(r => r.amt !== null)` and drive tagState from that, leaving the valuation's honesty to the total's own null state.

#### 7. [MEDIUM] No guard fixture covers the two defects add5bb8 says it killed — treasuryTokenForStream and formatTreasuryRaw are untested

- **Where:** `artifacts/api-server/scripts/backbone.guard.ts:661`
- **What is wrong:** The commit's headline is two binaries that would have mislabelled/misscaled a third token. Neither replacement has a self-test. backbone.guard.ts's treasury fixture (:661-670) still plants only USDC and SYN rows; nothing exercises treasuryTokenForStream (backboneDb.ts:64) with a TREASURY_BTCB_* key or its throw-on-unknown branch, and nothing on the studio side exercises formatTreasuryRaw at 8 decimals. This absence is precisely why the client-side parseLine drop (finding 1) shipped green through api tsc, studio tsc, the full guard chain and the build.
- **Fix:** Extend the backbone.guard treasury fixture with a BTC.b row (8-decimal valueRaw) and assert the projected sentence carries the 8-decimal figure; add an unknown-lane case asserting treasuryTokenForStream throws. Mirror it with a studio-side assertion that parseLine ACCEPTS a BTC.b treasury line — that one test would have caught finding 1.

#### 8. [MEDIUM] Built band deviates from the approved mockup: missing as-of-block footer and gold hairline, smaller flat total, and a 4-link verify row where the mockup shows one

- **Where:** `artifacts/studio/src/components/ProtocolReservesBand.tsx:230`
- **What is wrong:** Element-by-element diff against docs/design/protocol-owned-assets-mockup.html, per the PRE-HANDOFF GATE. (a) The mockup's `.foot` carries "As of block 91,209,340 · updates live" (:251) — the built footer (:230-233) has only the disclaimer; the freshness anchor is gone even though the reality envelope carries asOf/block. (b) `.totalfig` is clamp(38-68px), weight 800, with a gold gradient fill and a muted `.cents` span (:42-45); built is `text-4xl … sm:text-5xl` flat foreground (:146) — smaller and without either treatment. (c) The band's gold top hairline `.band::before` (:36-37) and gradient background are not reproduced (built: rounded-2xl, bg-card/40, :130). (d) The mockup shows ONE "Verif
- **Fix:** Restore the as-of-block line from the reality envelope's asOf/headBlock; apply the mockup's total treatment (larger clamp, muted cents span, gold gradient) and the band's top hairline; and add SHORT_LABELS entries for vaultWallet/operationsWallet/nftSaleWallet/lpPair ("Vault", "Operations", "NFT sales", "Pool") so a merged row stays one compact line.

#### 9. [LOW] The extensibility promise the founder approved is only half built — the registry is client-side and adding LINK still needs a server pair

- **Where:** `artifacts/studio/src/config/trackedAssets.ts:11`
- **What is wrong:** The approved mockup §4 (docs/design/protocol-owned-assets-mockup.html:292-306) promises "You buy Chainlink tomorrow → one line", shows the registry at `artifacts/api-server/src/data/trackedAssets.ts` (the SERVER), and says "Adding an asset is one entry … so this really is one line." What shipped is `artifacts/studio/src/config/trackedAssets.ts` — CLIENT only. The file's own header is honest about it ("the SERVER must also read that token's balance + price feed (two reads in buildFinancialGroup + two target addresses) … adding an asset is one entry HERE plus that server pair — not one line total"), and the LINK entry sits commented out at :122-132. So the honesty is in the code, but the found
- **Fix:** Either raise the shared registry to a workspace package that both buildFinancialGroup and the band consume (the real fix the file names), or — at minimum this session — add "unify the tracked-asset registry across server + client" as a numbered open item in OPEN_QUEUE/SESSION_STATE and tell the founder in one line that adding a coin is currently two edits, not one.

#### 10. [LOW] 44 coin logos vendored, not the top 50 the approved mockup promised

- **Where:** `artifacts/studio/public/coins/LICENSE.txt:1`
- **What is wrong:** The mockup §4 states: "I vendor the top 50 by CoinMarketCap rank as local SVG files … So the day you buy anything in the top 50, the logo is already there." `ls artifacts/studio/public/coins/*.svg` returns 44. Six top-50 symbols have no file. The failure is soft — CoinMark's onError falls back to a lettered disc (ProtocolReservesBand.tsx:66-71) — but the promise as written is not met and nothing records the shortfall.
- **Fix:** Vendor the missing six from the same MIT set, or state the real coverage in the LICENSE note and in the founder-facing record ("the 44 most likely holdings; a missing symbol falls back to a lettered disc").

#### 11. [LOW] featureStatus vaultHoldings 'where' omits the public home, the surface with the largest audience

- **Where:** `artifacts/studio/src/config/featureStatus.ts:63`
- **What is wrong:** The registry entry records `where: "/contracts + /admin (the vault's multi-token holdings + the priced-holdings total)"`. Since 6953972 the same capability leads the PUBLIC HOME as the Protocol Reserves band. featureStatus.ts is the ONE live-vs-future truth that guard-feature-truth pins claims against and that CLAUDE.md orders every session to read before writing any coming/future copy — an incomplete `where` weakens exactly that lookup.
- **Fix:** Update `where` to "/ (Protocol Reserves band) + /contracts + /admin" in the next commit that touches the band.

---

## ❌ Refuted by the adversarial pass (do NOT act on these)

- **SEO verified in sync — no defect, recorded so the handoff can assert it** — Verified as a genuine PASS, and the finding says so itself. sitemap.xml has exactly 28 <loc> entries and includes /recognition at :94, matching seo-route-registry.ts's PUBLIC/INDEX/sitemap:true flip. Correctly filed as not a defect.
- **/activity tells the public notifications are still coming from the indexer** — REFUTED on its own text. LiveActivityFeed.tsx:1008 reads 'What the indexer adds next: per-seat feeds, notifications generated FROM THESE EVENTS, and the candidate pipeline that feeds the Chronicle.' The subject is event-DERIVED notification generation, which is genuinely unbuilt — not the notification centre, which the sentence never claims is coming. The finding itself concedes the distinction. T
