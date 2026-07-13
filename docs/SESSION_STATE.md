# SESSION_STATE — read FIRST, every session

Authoritative resume point. **The real repo always wins over any spec.**

> **▶ 🏁 SESSION SEAL (2026-07-14) — THREE ARCS SEALED IN PROD, Replit-verified 10/10 on
> thesyndicate.money (HEAD `92cf877`):** ① MEMBER HOME ARC — shell `cd1a14c` · A actions/link
> card `d068e54` · B pill/settings `2e8bc73` · C teasers `d509eb5` · D wallet/toolkit `06bdee8`;
> ② ORIGIN-HARVEST ARC — L-1 /liquidity `2086403` · ACT-1 activity/fire-ledger `65390f8` ·
> CHR-1 chronicle `5e8ef14`; ③ THE FIRST CHRONICLE PROMOTION `92cf877` ("The duplicate seat" =
> Entry 1, publicly readable + verifiable). Live-verified highlights: the activity feed
> rendered the REAL "Seat #14 was written on-chain — a first seat" ON PROD with its verify
> link; burn total 21,273 SYN live; sitemap exactly 21 INDEX; the three killed/console strings
> at 0 occurrences in 19 served chunks; introductions:check OK.
> **LOCKED DECISIONS (this session, do not re-litigate):** the "My Syndicate" door/name is
> DEAD (banned, guard-enforced) · avatar = THREE sources (founder §11: sigil default LIVE ·
> uploaded = future object-storage decision · NFT = chain-verified ownerOf + badge + verify
> tooltip) · the FLOW-SEPARATION LAW (LP links never leave /liquidity's context/Risk Notice) ·
> client-RPC feeds = HONEST RECENT WINDOW (never proof of absence; the indexer upgrades to
> complete history later) · Chronicle promotion = a FOUNDER ACT via commit, no DB, no
> automation · REUSE-BEFORE-CREATE is standing (every report ends REUSED vs CREATED).
> **NEXT, IN ORDER:** ① the founder picks M-map slice 1 ON SCREEN — M0 (refresh automation)
> vs M4 (event backbone) — nothing opens before the pick; ② Q-A/Q-B triage (OPEN_QUEUE — the
> two screenshot-sourced header observations); ③ pending founder decisions: avatar
> object-storage · the DEX deep-link URL if wanted · the snapshot-refresh cadence.
>
> **▶ Prior: 🏛️ THE FIRST CHRONICLE PROMOTION (founder GO, 2026-07-14): "The duplicate seat" is
> ENTRY 1 of the public register.** The candidate's text carried faithfully into
> `chronicleRegister.ts` (the counts stated as N/M with the as-lived 12/11 narrative — the
> entry records the day, the live pages record the present); the candidate file marked
> ✅ PROMOTED (kept as candidate-of-record); /chronicle FLIPPED PENDING→INDEX (sitemap 21
> INDEX, 3 noindex remain); the Chronicle door moved to "Open today". RUNTIME-VERIFIED:
> entry renders with its verify card, the empty-state honestly gone. Promotion = this commit —
> exactly the doctrine.
>
> **▶ Prior: ORIGIN-HARVEST ARC — SLICE CHR-1 ✅ BUILT (2026-07-14): CHRONICLE V1 — zero infra, the
> register is a COMMITTED FILE, promotion is a FOUNDER ACT.** `config/chronicleRegister.ts`
> (typed entries: id · dateUtc · title · sections · verifyNote; register discipline pinned in
> the header: protocol-institutional · identity-blind · amount-blind · verify-first; EMPTY at
> ship). /chronicle = TWO honest states: register empty → the designed teaser + "the first
> entry awaits the founder's promotion" (no invented history); register speaks → the solemn
> oldest-first record with per-entry verify cards + the no-silent-edits footer ("the
> register's own history is public in the repository"). The origin labs promotion screens
> ADAPTED into `components/admin/ChroniclePrepare.tsx` (Content section of the console,
> VERIFIED absent from the public bundle): formats a candidate into the exact entry shape for
> the founder's commit — writes NOTHING, no DB, no auto-promotion ever. /chronicle SEO stays
> PENDING/noindex per the rule (flips to INDEX only when the first entry is promoted). The
> 2026-07-12 duplicate-seat candidate is PRESENTED to the founder at the END of this order —
> the founder decides. Green: tsc 0 · 12 guards · seo 40 · rewrites 23/46 · surface 24 ·
> build 24 shells.
>
> **▶ Prior: ORIGIN-HARVEST ARC — SLICE ACT-1 ✅ BUILT (2026-07-14): ACTIVITY V1 + FIRE LEDGER
> DETAIL — one recent-window RPC feed spine, the teasers GREW into live pages.**
> `lib/activityFeed.ts`: client chunked getLogs over ~24h (43,200 blocks, 2000/chunk, address
> array), events RETARGETED VERBATIM from today's repo — MembershipPurchasedV3 (24 params from
> saleEventDecoders, SELF-CHECKED at module load: toEventSelector(signature) must equal the
> pinned topic0 or the module throws) · ERC20 Transfer filtered to==burnAddress · the 3
> SourceRegistryV1 lifecycle events (from the .sol). Addresses from verify-links, never
> hardcoded. Chain-time stamps from block headers (never a wall clock); fail-soft chunks
> (coverage shrinks HONESTLY, reported in the banner), fail-closed decode. THE HONESTY LAW
> rendered: the HealthBanner states the exact covered block range + "never evidence of
> absence" + "the complete indexed history arrives with the event indexer".
> `components/activity/LiveActivityFeed.tsx` (origin chrome adapted): type pills · memory
> anchor flag (receipt-thread doctrine) · per-row tx verify link · filter chips · summary row.
> /activity = the live feed + "what the indexer adds" vision block; /fire-ledger = live total
> + burn-only feed + vision block; both FLIPPED PENDING→INDEX (real live content; sitemap 20
> INDEX; lifecycle-guard exemptions removed — the pages render their badge directly); member
> doors: Activity + Fire Ledger moved to "Open today". **RUNTIME-VERIFIED against the real
> chain:** banner shows blocks 90,181,087→90,224,287; the feed rendered the REAL seat event
> (1 seat · 0 burns · 0 referral in-window) — and the "missing" referral events were PROVEN to
> sit at blocks 90,177,061/90,177,131, ~4k blocks BEFORE the window: the honest window doing
> exactly what it claims. CSP connect-src verified ('self' https: wss:). Green: tsc 0 · 12
> guards · seo 40 routes/20 INDEX · rewrites 23/46 · surface 24 · build 24 shells.
>
> **▶ Prior: ORIGIN-HARVEST ARC — SLICE L-1 ✅ BUILT (2026-07-14, autonomous work order): /liquidity.**
> Origin harvest ADAPTED (liquidity.tsx + rail/why/status): ① WhyLpMatters 3 cards, "small on
> purpose · early LPs shape the pool" framing KEPT; ② the Action Rail — Trade · Add Liquidity ·
> Become an LP (anchor) · View Pool · Verify Pair (verify-links lpPair, fail-closed).
> **LINK VERIFICATION (in-slice, dated):** DexScreener pair page FOUNDER-VERIFIED in browser;
> honest note: DexScreener's public API returns pairs:null for this micro-pair (both pair +
> token-pairs endpoints probed — API doesn't index it; the web page is the verified artifact).
> Trade + Add (origin traderjoexyz.com URLs) both HTTP 200 (403 on HEAD = bot filter; GET+UA
> clean; lfj.gg also 200). ③ LpStatus on the EXISTING spine reads — useTokenomics extended
> +lpReserveSyn/+lpReserveUsdc (financial.lp.* already served; no new read path). ④ LP Risk
> Notice (4 real risks) + the no-entitlement verbatim line ×2 (guard-forbidden-copy caught
> "pooled" in the impermanent-loss row → reworded, the guard working). ⑤ FLOW-SEPARATION LAW:
> zero Join CTA on the page; memberActions += exactly ONE "Liquidity & trading" → /liquidity;
> memberDoors += GROWTH group (Liquidity door); /wallet's pool card REPOINTED internal →
> /liquidity (the DEX links never travel without their page context + Risk Notice). SEO INDEX
> (real live content): registry 40 routes · sitemap 18 INDEX · rewrites 23/46 · build 24 shells.
> STEP 0 rides this commit: SEASONS_ENGINE re-staged fresh (the avatar bullet is now a FOUNDER
> DECISION — sigil default LIVE · uploaded = future object-storage decision · NFT = chain-
> verified ownerOf with badge + verify tooltip).
>
> **▶ Prior: MEMBER HOME ARC — SLICE D ✅ BUILT (2026-07-14) — THE ARC IS COMPLETE (shell + A + B +
> C + D, one commit each, all pushed):** the WALLET DOOR + the TOOLKIT (§11 point 7).
> **⚠️ ROUTE DEVIATION (infra truth wins, honest note):** the ordered /member/wallet would
> emit a `member/` DIRECTORY in dist and resurrect the 2.0 trailing-slash redirect on /member
> — routes are FLAT: **/wallet** + **/toolkit** (doors labeled Wallet · Toolkit; member shell
> on both; full lockstep: registry 39 routes · rewrites 22/44 · surface 23 public · prerender
> 23 shells = 17 INDEX + 6 noindex). **/wallet** = `wallet/MemberWalletPanel.tsx`: own SYN +
> USDC balances live (fail-closed) · THE APPROVALS PANEL (own allowances toward KNOWN
> spenders — USDC→Sale V3 today; "an approval is not a payment" in plain words; the checkout
> approves EXACT amounts, stated) · REVOKE = approve(spender, 0), the member's OWN signed
> wallet act, SIMULATE-FIRST + honest revert translation, NEVER a server write · the SYN/USDC
> pool as an EXTERNAL-posture link to the ON-CHAIN PAIR (verify-links lpPair; a DEX deep-link
> was deliberately NOT invented — the founder supplies the exact canonical URL if wanted;
> "pool is a courtesy" doctrine lines carried). **/toolkit** = the Slice-A action registry as
> the public conversion surface (visitor-verified live: 3 locked-visible actions with
> reasons + the open /join action + the 10-door shell). RUNTIME-VERIFIED on the local rig:
> /wallet honest connect state · /fire-ledger renders the REAL live burn (21,273 SYN — the
> chain figure) · /toolkit conversion state · a real duplicate-key bug in TeaserSurface
> caught in console and fixed (index keys for repeating preview shapes). Green: tsc 0 ·
> 12 guards · seo 39 routes · rewrites · surface · build 23 shells.
>
> **▶ Prior: MEMBER HOME ARC — SLICE C ✅ BUILT (2026-07-14): the §11 slot-2c DESIGNED TEASERS.**
> New chassis `components/TeaserSurface.tsx` (living-chassis pattern): one-paragraph
> what-this-will-be · existing posture badge · a "Design preview — the shape, not data" block
> (abstract rows, ZERO figures) · what-unlocks-it · return hook (historical FOMO only) + an
> optional LIVE slot for already-readable figures. THREE new PENDING/noindex routes in full
> 2.0 lockstep (registry + App + surfaceClassification + artifact.toml regen 20 routes/40
> rules + prerender 21 shells = 15 INDEX + 6 noindex): **/activity** (heartbeat teaser) ·
> **/chronicle** (the solemn record; the four lived chapters named as preview shapes) ·
> **/fire-ledger** — which CARRIES THE LIVE TOTAL BURN (useHeroReality burnedSyn + burnAddress
> verify link; readable ⇒ displayed; fail-closed). /archive (already honest with real
> contract-memory content) gained its missing teaser elements (unlocks + return hook) without
> being gutted. Sidebar coming-soon doors now OPEN their teasers (Activity/Chronicle/Archive/
> Fire Ledger), badges unchanged. guard-lifecycle-labels extended honestly: teaser pages exempt
> BECAUSE the chassis renders the badge — paid for by a new chassis check that goes red if
> TeaserSurface ever drops the LifecycleBadge. Green: tsc 0 · 12 guards · seo 37 routes ·
> rewrites 20/40 · surface 21 public · build 21 shells.
>
> **▶ Prior: MEMBER HOME ARC — SLICE B ✅ BUILT (2026-07-14, UI-ONLY — zero new server writes, zero
> new DB tables, as ordered):** ① the HEADER MEMBER PILL — the Q25 menu REHOUSED (never
> rebuilt): the trigger + menu header now carry the member's deterministic MemberSigil
> (18px pill / 36px header) instead of the generic hexagon; era badge unchanged; bell +
> trophy render as RESERVED header icons (visible, inert, honest "Coming soon" tooltips —
> notifications = event backbone; trophy = seasons, recognition-only); a "Settings" item
> joined the menu → /member#settings. ② `wallet/MemberSettings.tsx` (rule-15 lazy, anchored
> #settings on /member): Avatar = sigil default with uploaded(SOON)/nft(FUTURE) named
> abstraction · Alias SOON (IDENTITY-ALIAS) · Language SOON (no i18n — a dead switch would
> lie) · Theme REAL (existing ThemeToggle reused) · Notifications SOON · Session REAL
> (wallet + VerifyOnChain + Disconnect via the EXISTING logoutSession) · Reset profile SOON
> with "THE SEAT IS PERMANENT" stated · NO email field ever (ADR-003). Chrome learned from
> Supa AvatarUploader/Settings, copied nothing. AVATAR-STORAGE INFRA QUESTION → flagged for
> the founder report. Green: tsc 0 · 12 guards · build 18 shells.
>
> **▶ Prior: MEMBER HOME ARC — SLICE A ✅ BUILT (2026-07-14, autonomous work order, founder GO):**
> ① `config/memberActions.ts` — THE action registry (origin actions.ts harvested for shape,
> adapted): copy-my-referral-link (lock: session) · share-my-proof (lock: seat) ·
> expand-footprint→/join (open) · verify-my-seat-on-chain (lock: seat, real VerifyOnChain
> engine link); locked = visible + plain reason; NO operator action exists in the registry.
> Rendered by `components/member/MemberQuickActions.tsx` (own-row via the sanctioned dynamic
> walletSession import; fail-closed handlers) — replaced the old static row on /member.
> ② THE REFERRAL LINK CARD (§11 slot 2b) — the SAMPLE link/`SAMPLE-CODE` block in
> MemberReferralDashboard is GONE, replaced by `MyReferralLinkCard`: the member's PERMANENT
> link derived from their wallet (SPEC §③), TWO honest states read LIVE from the registry
> (ACTIVE → "commission paid inside the buyer's own transaction — live" + "Source active"
> pill · not-signed → "your link is permanent — commission activates when your source is
> founder-signed"), copy/QR/ShareMenu wired to the REAL link; no wallet → honest derive-note,
> no sample. Reused existing reads only (deriveSourceId · verify-links · readSourceConfig) —
> zero new endpoints. ③ GUIDE ON THE MEMBER SHELL — ALREADY TRUE by construction:
> `SyndicateGuide` mounts unconditionally in PublicLayout and /member is a PublicLayout page;
> verified, no fork, no change (reported, not rebuilt). guard-no-fake-live caught the bare
> "Active" pill → "Source active" (the guard working). Green: tsc 0 · 12 guards · seo 323 ·
> build 18 shells.
>
> **▶ Prior: MEMBER SHELL — Member Home slice 2, BUILT (founder GO; awaiting diff approval → deploy):**
> the two-shells rule realized — `components/member/MemberShell.tsx` (left sidebar of member
> doors, chosen BY THE PAGE inside the public chrome; public pages + prerender untouched) +
> `config/memberDoors.ts` — RECONCILED at staging time to SEASONS_ENGINE **§11 wireframe v2**
> (advisor harvest "agreed with the founder", discovered on disk during this slice; repo wins):
> the SHORT door list (every Coming-soon is a public promise) — Open today: Member Home ·
> Referral dashboard (anchor; LIVE day one) · Recognition · Protocol graph (/map) · Coming soon
> (existing LifecycleBadge, locked-visible): Activity PENDING_ADAPTER · Chronicle FUTURE ·
> Archive PENDING_ADAPTER; NO operator door exists in the config at all. **FOUNDER DECISION
> (2026-07-14): the "My Syndicate" door is DEAD** (downline connotation; content = the Referral
> dashboard) — removed from the naming canon, "my syndicate" added to bannedSurfaceNames, the
> guard adapted in lockstep. `MEMBER_HOME_PLAN` imported to docs/handoff/ as TIER-3 HISTORICAL
> with a SUPERSEDED banner naming its stale STATE lines (router NOT deployed · both walls down ·
> thresholds decided in CONNECTOR_LADDER_POLICY).
> PLUS §11 slots 3–5 RESERVED VISIBLY on the page (dashed coming-soon cards: Season · Quests ·
> "While you were away" — recognition-only copy, nothing simulated).
> §4 fold-ins landed: the RECEIPT + "Share my proof" MOVED from WalletSessionPanel into the
> Your Seat strip (moved, not rebuilt; one receipt surface) · live **SYN balanceOf** rendered in
> the strip (token address from verify-links, fail-closed) · the **Chapter** line rendered from
> `lib/chapters.ts` (the deferred item — the clean import path now exists). RETIRED (repo-wins
> honesty): the old identity-ribbon card + raw AccessStateChip on /member · the STALE "View your
> receipt — PENDING_ADAPTER" non-link (the receipt is real). The referral dashboard MOVED out of
> the Source tab to the anchored `#referral-dashboard` section (the sidebar door's target;
> ladder law "visible progress everywhere"). Verified on the local rig (api+studio): sidebar in
> DOM with all 10 doors · zero console errors · ribbon + stale link gone · anchor live.
> Green: tsc 0 · 12 guards · seo/rewrites/surface · build 18 shells. NEXT Member Home slices:
> quick-actions role registry · member doors deepening (per §4.3/4.5).
>
> **▶ Prior: LADDER-PROMOTION-SCREEN → ✅ SEALED IN PROD (`28ccbaa`, Replit-verified 4/4, 2026-07-13:
> source-standing fail-closed unchanged · intro guard 45/45 on their side · data-drift check OK
> with the head 1,466 blocks ahead · member banner IN the served bundle, founder panel ABSENT
> from it). R5 was sealed the same day (`93a69dd` + `56a7f4b` drift-fix, verified 4/4). The
> WHOLE REFERRAL ARC IS LIVE END-TO-END: terms (hash-committed) → first member source (founder-
> signed) → introduction indexer → ladder → promotion loop.** Original build state:
> the ladder's promotion loop end-to-end, on the R5 spine. **FOUNDER RULE ENGRAVED (2026-07-13,
> "simple + transparency"): NO compensation for the waiting gap between threshold crossing and
> signature — the rate applies at on-chain recording (never retroactive); the waiting is VISIBLE
> and DATED** (member screen: "Promotion due — awaiting founder signature" + the crossing date;
> the public `SourceTermsUpdated` event dates the raise — that IS the answer to "scam" criers).
> ① Read-model: per-source ladder facts — `currentBps` (live registry read at build),
> `entitledBps/Title` (from `connectorLadderCanon.ts`, guard-reconciled literal-for-literal
> against the studio config — one ladder, two artifacts), `promotionDue`, and the CROSSING
> chain-dated (`crossedAtBlock` = the k-th durable first-purchase block, `crossedAtDateUtc` from
> the block header — never a wall clock). ② The builder now emits TWIN snapshots — api
> `introductionSnapshot.ts` + studio `config/introductionIndexSnapshot.ts` (same run, same hash,
> guard-asserted equal; address-free by construction so the twin can sit in the client repo; it
> is imported ONLY by the operator-gated panel, verified absent from the public bundle).
> ③ `/api/auth/source-standing` serves the due fields own-row; `walletSession` parses them.
> ④ Member banner in the standing section renders the founder rule verbatim. ⑤ Founder console:
> `wallet/ProposeSourcePromotion.tsx` in /admin/sources — the PERSISTENT REMINDER (renders the
> due count until every promotion is signed), identity-free due rows, wallet-bind (founder
> enters the member wallet → derive sourceId → browser sha256 sourceKey must MATCH a due row →
> live record read → live-vs-indexed rate consistency assert, fail closed) → `updateSourceTerms`
> with ONLY `commissionBps` changed, all terms VERBATIM from the live record (contract reverts
> on wallet drift) → Form 2 signing with owner() gate + revert translation. `chainReads`
> SourceRecordRead extended with startTime/endTime/grossCap/perBuyerCap (exact decimal strings)
> for verbatim resubmission. Green: studio tsc 0 + 12 guards + seo/rewrites/surface + build 18
> shells + promotion code ABSENT from public bundle · api tsc 0 + auth-zone 656 + intro guard
> 45 (ladder fixtures: 10-durable → Trusted-due, crossing = 10th durable block) + canon +
> reality 138/138. Snapshot regenerated with ladder facts (asOfBlock 90184731, still 2/1/2,
> nothing due today — the BUILDER_SOURCE sits below Trusted).
>
> **▶ Prior: R5 — THE INTRODUCTION INDEXER, BUILT (2026-07-13, founder GO; awaiting diff approval →
> deploy):** the "one brick, five surfaces" read-model exists on the proven pattern (pure builder
> · founder-gated build script · guard suite), REUSING the existing scan engine (adaptive chunked
> zero-gap eth_getLogs over the V3 MembershipPurchasedV3 unit, in memory, no DB) — a snapshot is
> NEVER emitted from a scan with holes (the 2026-07-12 standing rule, enforced in code).
> **R5a:** `introductionReadmodel.ts` (pure, deterministic, fail-closed) + `introduction-index-build.ts`
> (+ `--check` drift mode) + `introduction-index.guard.ts` (27 checks) + the GENERATED served
> snapshot (committed): asOfBlock 90180944 · 2 attributed purchases · 1 source (BUILDER_SOURCE;
> the founder's member source has no referred buys yet) · 2 durable. **THE DURABLE TEST (founder
> GO, recommendation adopted — seats are bytecode-permanent so seat-held has no anti-fraud
> teeth): durable = the introduced member's wallet still holds SYN at index time**
> (`DURABLE_TEST = "SYN_BALANCE_HELD"`, one constant to change if re-ruled). The count may dip;
> a signed promotion never reverts. PRIVACY: the snapshot carries NO wallet/memberNumber/txHash
> and NO raw sourceId — per-source rows are keyed by the opaque `sourceKeyOf` hash.
> **R5b:** GET `/api/auth/source-standing` (own-row: session wallet → derived sourceId → own
> counters; registry existence/active read LIVE; auth zone stays registry-less via the spine
> helper `sourceStandingRead.ts` — guard-auth-zone 649 green). **R5c:** the member referral
> dashboard renders the REAL indexed standing (4 figures + as-of block) + the Connector LADDER
> progress (`config/connectorLadder.ts` — the 7 canon rungs; bar never empty, next rung named,
> summit stays rare); memberCards honestly flipped (introductions/pending/paid → READ_ONLY_PROOF;
> per-receipt rows stay PENDING_ADAPTER). **RIDER:** `commissionTiers` = the canon ladder preview
> (Emerging→Summit + Partner-as-class; Trusted 6%). REFRESH RULE: the snapshot is an honest
> SERVED SNAPSHOT (as-of labeled); re-run `introductions:build` (founder-gated) to advance it;
> `introductions:check` fails on drift. All green: studio tsc 0 + 12 guards + seo 323 + rewrites
> + surface 218 + build 18 shells · api tsc 0 + canon + reality 138/138 + auth-zone 649 + intro
> guard 27. LADDER-PROMOTION-SCREEN is now UNBLOCKED (consumes durableIntroductions directly).
> **POST-DEPLOY CORRECTION (2026-07-13, honesty register material):** Replit's point-3 "DRIFT =
> new attributed purchase" (and my own framing) was an OVER-READ — the totals never moved
> (2/1/2); the v1 `--check` hashed the FULL model including the moving `asOfBlock`, so it could
> NEVER pass. Fixed same-day: `readmodelContentJson` (head normalized out) + the check now
> compares DATA content and says "the head advancing alone is not drift" — proven live
> (committed 90183425 vs head 90183507 → OK). No new attributed purchase has occurred; the
> protocol's first indexed truth stands at 2 attributed / 1 source / 2 durable.
>
> **▶ Prior: 🏆 R2 IS DONE — THE FIRST CONVENTION-DERIVED MEMBER SOURCE IS LIVE ON-CHAIN (2026-07-13,
> both founder signatures):** sourceId `0x804e80f1…ae974` = keccak256("SYN.SOURCE.V1",
> `0x88EC79AF…Dd73`) — the FIRST source following the SPEC §③ convention. Chain-verified:
> class MEMBER_INTRODUCTION · 500 bps · LIFETIME · no caps · repeat=true · sourceWallet ==
> payoutWallet == the founder wallet · metadataHash EXACTLY `0xc8480867…1e6e48` (== the served
> terms document, verified on three planes) · created PAUSED 04:19:22Z → ACTIVATED 04:20:36Z
> (block ~90177188). The founder signed both acts in his own wallet through the PROPOSE screen
> (Form 2's first real use). LIVE PROOF: the prod quote
> `/api/join/quote?grossUsdc=5000000&sourceId=0x804e…` returns `sourceValid:true`,
> `acquisitionCostRaw:250000` (5% = $0.25 on $5), net 4.75 → the member referral link
> `https://thesyndicate.money/join?source=0x804e80f1…ae974` pays live. NOTE (process, honest):
> the founder signed create+activate back-to-back, so the planned PAUSED fail-closed spot-check
> between signatures was skipped — the born-PAUSED sequence itself is contract-enforced and both
> states were read back on-chain after the fact. UNLOCKED NEXT: the auto-derived member link
> card (the convention now has a real on-chain instance) · R5 the introduction indexer.
> LOCAL SIGNING RIG (now proven, reusable): api-server runs on Windows via
> `NODE_ENV=development; PORT=5000; npm run build; node dist/index.mjs` (the npm dev script is
> bash-only) · studio needs `.env.local` `VITE_WALLETCONNECT_PROJECT_ID` (public by design —
> recovered from the prod bundle) · vite dev /api proxy + the fail-closed verify-links read
> shipped in `8c4843c`.
>
> **▶ Prior: R1+R2 — THE FIRST MEMBER SOURCE, BUILT (2026-07-13, founder GO; signing = a founder act,
> pending):** ① **R1 the program terms document** exists and is PUBLIC:
> `artifacts/studio/public/referral-program-terms-v1.txt` served at
> `/referral-program-terms-v1.txt` (flat filename ON PURPOSE — a `referral/` directory would
> re-trigger the 2.0 trailing-slash auto-redirect on /referral) + linked from /referral. Its
> keccak256 IS the on-chain `metadataHash` (LIFETIME member sources revert `MissingMetadata`
> without it); the hash is NEVER hardcoded — `lib/termsDocument.ts` fetches the served file and
> hashes the raw bytes at need (edit the wording → the hash follows by construction). ② **R2 the
> PROPOSE screen** (Constitution §④ FORM 2, the first instance of the pattern that unblocks all
> admin): `wallet/ProposeSourceCreate.tsx`, mounted lazy in `/admin/sources` (operator console —
> dead-code-eliminated from public builds, VERIFIED absent from the default bundle). It reads the
> registry `owner()` LIVE and states which wallet must sign; derives
> `sourceId = keccak256("SYN.SOURCE.V1", wallet)` (`lib/sourceIdentity.ts` — the convention's
> first implementation); shows EVERY SourceTerms param in clear + the irreversibles (permanent
> sourceId · payoutWallet unchangeable by term updates); builds `createSource` (born PAUSED,
> contract-enforced) then `setSourceStatus(ACTIVE)` as TWO separate signed acts with the
> fail-closed /join?source= check stated between them; blocks activation on a metadataHash
> mismatch vs the served document. ABIs transcribed from `SourceRegistryV1.sol` read line-by-line;
> writes via wagmi in the founder's wallet ONLY. New reads: `readRegistryOwner` +
> `readSourceRecord` (chainReads). guard-access-state respected (raw I/O in lib, not wallet).
> All green: typecheck 0 · 12 guards + no-raw-color 0 · seo:check 323 · rewrites OK ·
> surface:audit 218 · build 18 shells; terms file byte-identical in dist
> (keccak256 `0xc8480867…1e6e48` as written — recomputed live at signing; the /referral display
> and the PROPOSE screen both hash the SERVED file, so they follow the bytes automatically).
> **HUMAN-READABLE PASS APPLIED (founder, 2026-07-13 — the §8 pattern everywhere: human words
> first, contract term in parentheses for verifiers):** scope line "member referral sources (the
> contract's MEMBER_INTRODUCTION class)"; header + §9 "the source's terms fingerprint (the
> contract's metadataHash field)"; header keccak256 introduced as "its digital fingerprint"
> (exact algorithm name kept for verifiers); the /referral sentence aligned. FOUNDER CORRECTION
> APPLIED (2026-07-13, settled canon — a referrer does NOT have to be a member; classes differ):
> the v1 document is SCOPED to the member program — title "MEMBER REFERRAL PROGRAM TERMS", id
> `SYN.REFERRAL.MEMBER.TERMS.V1`, scope line "MEMBER_INTRODUCTION sources only; other classes
> (partner, builder, affiliate) get their own versioned terms documents, one class · one doc ·
> one hash". **FINAL PRE-HASH REVIEW APPLIED (advisor-consolidated, founder-approved,
> 2026-07-13):** ⓐ escrow truth-fix VERIFIED against MembershipSaleV3.sol:296 —
> `claimSourceEscrow` reverts `SourceEscrowLocked` unless the source is ACTIVE; §8 now says
> escrow is claimable "whenever the source is ACTIVE", locked while paused/revoked (the old
> "at any time" was an overclaim). ⓑ **FOUNDER OVERRIDE — NO buyer clear/remove of a referral,
> anywhere** (the referral never changes the buyer's price; visibility — always shown before
> signing — is what makes it honest; a removal control only strips earned work): terms §8
> rewritten; `referralProgram.ts` antiAbuse line replaced, the "Cleared" program state REMOVED,
> the config comment fixed; checkout UI verified to contain no such control (none existed).
> ⓒ three standard clauses added as §6 THE REFERRER'S STANDING (independent participant ·
> link/source personal, not transferable · legal age + jurisdiction responsibility).
> ⓓ §1 "may be granted" (founder-signed creation, not an automatic right). ⓔ hash practicality:
> header declares UTF-8/LF; `.gitattributes` pins the file `text eol=lf` (the hash is an
> on-chain commitment — bytes must never be rewritten by autocrlf); /referral now renders the
> LIVE-computed keccak256 next to the terms link (fetched+hashed in-browser, fail-closed,
> never hardcoded) with a VerifyOnChain link to the registry; deploy verification must ALSO
> assert served-bytes == repo-bytes. LOCAL-ENV NOTE
> (Windows): the api-server dev script is bash-only → the local dev app renders blank on clean
> main too (A/B verified with git stash); NOT a slice regression — Replit is runtime truth.
> NEXT: founder approves the terms WORDING + the diff → push → deploy (the terms URL must be
> public before signing) → the founder signs create (PAUSED) → fail-closed check → signs ACTIVE
> → the first convention-following member source exists (unlocks the auto-derived member link
> card, a follow-up slice).
Direction specs now live IN this repo: `docs/direction/MASTER_BUILD_SPEC.md` ·
`docs/direction/CONTENT_SUITE_SPEC.md` · `docs/direction/WHITEPAPER_PLAN.md` ·
`docs/direction/WHITEPAPER_LIVING_DOCTRINE.md` (living-protocol soul + chassis) ·
`docs/direction/CONTENT_SURFACE_HARVEST_MAP.md` (content-page harvest map) ·
`docs/direction/GAMIFICATION_LEGAL_DOCTRINE.md` (recognition-only, legal shield).
Design tracker: `docs/DESIGN_ROADMAP.md`. Doctrine/roles: `docs/00_START_HERE.md`.

> **▶ 🏆 THE FIRST REAL PURCHASE HAPPENED (2026-07-12 23:32 UTC, sealed 2026-07-13).** C5 published by
> the founder; the $5 test THROUGH the referral link succeeded on the first attempt:
> tx `0x353bf2c0…c42178` — 5 USDC in → **0.25 USDC paid to the referrer's payoutWallet IN the same tx**
> (the referral rail works with real money) → net 4.75 split EXACTLY 3.325/0.95/0.475 (70/20/10) →
> 500 SYN delivered → **SEAT #13** (chain-verified: `memberCount=13`, `memberNumberOf(buyer)=13`,
> `memberByNumber(13)=buyer`). The living protocol did the rest BY ITSELF: the public headline reads 13
> everywhere and the honest readback recomputed to **"13 seats / 12 distinct wallets (1 holds two)"** —
> zero human edits, zero console errors, CSP clean. **The Syndicate OS sells seats in production.**
> **Post-C5 polish → ✅ SEALED in prod (founder-screenshot-verified):** member-aware seat line
> (`f950354` — a seated wallet reads "You hold seat #N … never a second seat", own-row live
> `memberNumberOf`; generic always-true line for everyone else) + the multichain-USDC trap named in
> the balance-short message (`a852da1` — founder-discovered on the first cross-device test: wallets
> aggregate balances across networks; the message now says on-Avalanche-native-USDC-only + what to do).
> **REFERRAL PUBLIC ACTIVATION → ✅ BUILT (this commit, founder GO):** `programLifecycle` +
> `sourceAttributionLifecycle` → **LIVE_ACTION** (the badge text is exactly true: the commission is
> paid inside the buyer's own signed tx — proven, seat #13); `activeCopy` (prepared since 2026-07-07)
> now renders via the lifecycle-selected `currentProgramCopy` on /source-attribution, the member
> referral dashboard and the admin panel; intro/model/boundaries rewritten to the active truth (new
> sources = founder-signed on-chain acts, R2; never "earn now"); memberCards honestly relabelled
> (link = usable via the /source builder · introductions/receipts/commissions = PENDING_ADAPTER, the
> R5 indexer is the gap · standing = FUTURE); `guard-safe-source` ADAPTED IN the slice per
> CANON_LOI_ANTIBLOCAGE and RE-LOCKED (pins now assert LIVE_ACTION; the protective disclaimers stay
> pinned forever — the copy guard even caught "payout"/"your share" during the build and the wording
> was corrected, working as designed). NOTE: the auto-derived member link card is NOT in this slice —
> the existing BUILDER_SOURCE id predates the `SYN.SOURCE.V1` derivation (verified: no variant
> matches); it lands with the first convention-following member source (R2).
> **REFERRAL-FIRST NAMING (founder order, 2026-07-13, same arc):** "Referral" is the USER word on
> every public surface — human-readable, no mental load; "Source" stays the PROTOCOL word in
> proof/registry/operator contexts ("powered by Source Attribution"). Renamed: footer/nav labels
> ("Source Attribution"→"Referral Program", "Verified Introduction"→"Referral Link"), page titles
> (/source-attribution → "Referral Program", /source → "Build your referral link"), SEO entries, the
> /join card ("Referral link detected"), quote lines, CTAs, learning/docs/facts copy ("introduction
> id"→"referral code"). This pass ALSO killed two claims the activation had made false ("never a
> payment/commission" on the builder card + the /source-attribution SEO description). The old
> language lock ("verified introduction — NOT referral", LIVING_ORGANISM §8) is SUPERSEDED by the
> founder's 2026-07-07-corrected word roles + this order. NEXT = R2 (the founder creates the first
> member source) or the R5 indexer, at the founder's signal.
>
> **▶ Prior: 🔴🚀 C5 GO-LIVE (founder GO, 2026-07-13) — THE FLIP IS IN THIS COMMIT.** `CHECKOUT_ENABLED = true`:
> the two-signature approve→buy is PUBLISHED on `/join` (checkout chunk verified PRESENT in the bundle;
> the boundary card verified GONE). The COMPLETE MUST-CHANGE sweep executed in the same commit: /join
> lead + badge (new lifecycle **LIVE_ACTION** — "Live — signed from your wallet", gold identity axis;
> `guard-posture-map` adapted to allow EXACTLY that one key; `PostureBadge` widened to full
> SourcePosture) · SEO title/description · surfaceClassification · modules + moduleRegistry STATE ·
> syndicateFacts ×3 · guide/docs content · FAQ 98/106/114 re-written to the live-buy truth ·
> whitepaper §05 · routeMemory · SERVER: sourceStatus sale note + buyReadiness **NOT_WIRED →
> LIVE_ACTION** (openapi enum + orval regen; the ONE live action, asserted by `verify-canon-integrity`
> in lockstep: LIVE_ACTION count === 1 === buyReadiness) · protocolTargets unitNotes ×3. All green:
> studio typecheck 0 + 12 guards + seo:check + rewrites:check · api-server typecheck 0 + verify:canon
> 35/35 + reality 138/138 + auth-zone 622. NEXT: Replit publish → **the founder's $5 test THROUGH the
> referral link** (protocol + the 3 wallet conditions in the C5 handoff) → expected seat #13, readback
> recomputes 13/12 → then the REFERRAL PUBLIC ACTIVATION slice (OPEN_QUEUE). Rollback = flip the
> literal back, one commit, one deploy.
>
> **▶ Prior: 🔴 AUDIT SESSION (2026-07-13) — full pre-flip audit DONE; verdict was "NOT BEFORE …"; the
> founder triaged it:** **GROUP A → ✅ SEALED in prod (`ed9af22`, Replit all-gates + live-verified:
> zero CSP violations on home//join//faq, quote intact under CSP, permanent disclaimer renders, new
> FAQ in the served JSON-LD, all 5 API headers measured on the live domain):** real wallet-chain check (`useAccount().chainId`)
> + ChainMismatch copy · sourceId passed to `buy()` ONLY when the fresh quote says `sourceValid===true`
> (quote/purchase divergence closed) · 4 source reverts translated (SourceAlreadyLinked/SourceNotEligible/
> SelfReferral/ReferrerNotSeated) · permanent "not an investment · total loss possible" line on the /join
> economy card (survives fail-closed) · FAQ 98/106/114 reconciled to today's read-only reality (re-rewritten
> at the C5 flip) · HTTP security headers: API (CSP none + XFO DENY + nosniff + Referrer-Policy +
> x-powered-by off) and PAGES (CSP meta baked by the prerender — script-src 'self', connect-src
> deliberately scheme-wide so wallet connect can't silently break; frame-ancestors for pages = Replit
> serving layer, see the C5 handoff infra notes) · C5 handoff checklist REPLACED by the complete
> ~20-item MUST-CHANGE table. **GROUP B (founder decision): ALL new guard machinery (audit 7.1–7.5, 3.1)
> → Phase 6 HARDEN & SEAL — per the anti-blocking law (founder file
> `GitHub/_research/AUDIT_TRIAGE_ET_LOI_ANTIBLOCAGE.md` — ⚠️ OUT-OF-REPO on the founder's disk; the HARD
> RULE wants it committed into docs/direction/ at the founder's GO).** **GROUP C → ✅ DECIDED + EXECUTED
> (founder, 2026-07-13, this commit): C1 DISCIPLINE_ENFORCED = LATER (founder decision — DO NOT RE-RAISE;
> returns at its own time, Phase 6 at the latest) · C2 Studio-OS teaser REMOVED from the public home (its
> intent → the future public Roadmap page, slice 2.8; config kept + annotated for that harvest — origin:
> protocol-evolution episodes/modules + the founder's raod_map.jpg 9-node design) · C3 "Raised class" note
> → "Higher commission rate for consistent, high-retention sources." (tier name "Trusted" kept) · C4
> whitepaper §05 rewritten with the founder-approved verbatim (same single seat · standing on the Capital
> axis · never a price/financial advantage).** **THE ANTI-BLOCKING LAW IS NOW IN-REPO CANON:
> `docs/direction/CANON_LOI_ANTIBLOCAGE.md` (TIER-0, indexed) — audits are proposals, never law; guards
> minimal until MVP; only legal/funds/truth-first are non-negotiable.** **Instance pinning → ✅ DONE (founder, 2026-07-13, Replit dashboard): autoscale
> max machines = 1** (4 vCPU / 8 GiB) — in-memory SIWE sessions/nonces are now single-instance-safe.
> Q21's Reserved-VM remains the durable option later; this closes the immediate risk.
>
> **▶ Prior: `docs/handoff/new-session-handoff-2026-07-13-c5-go-live-flip.md`** —
> **C5 = the GO-LIVE flip; the founder's GO is GIVEN (2026-07-13).** C2 approve→buy is BUILT + pushed
> OFF (`c7ad5c7`, proven folded out of the bundle). The flip was deliberately NOT rushed at
> end-of-context (the C1.3 lesson). The handoff carries the COMPLETE checklist: flip the literal +
> a new transactional DisplayLifecycle + the sitewide read-only-claims sweep (8 spots) + SEO title +
> registry STATE rewrites — ONE atomic commit, then Replit publish, then the founder's $5 real test
> (expected seat #13; the 12/11 readback recomputes to 13/12 by itself).
>
> **▶ Prior: `docs/handoff/new-session-handoff-2026-07-12-duplicate-seat-and-historical-gate.md`** —
> a PRODUCTION DUPLICATE SEAT exists on-chain (historical #7 `0x3FF01A0c` = also V3 seat #11, verified
> live), 7 historical wallets still ARMED (incl. the founder), 11 distinct wallets vs `memberCount()`=12.
> The V3 historical artifact is `TheSyndicate/src/lib/v3-historical-members.ts` (root MATCHES live V3);
> `v1-proof.ts` is POISON (V2b, wrong root + address-only leaf). **C1.3 the historical gate → ✅ SEALED
> in prod (`a019152`, Replit-verified 33/33 gates + live-domain checked: quote flow intact, zero console
> errors, gate invisible to normal visitors):** `lib/historicalMembers.ts` (frozen 8-member set + proofs, leaf recomputed + proof
> re-folded to the LIVE `V1_MEMBER_ROOT()` — the local artifact is never trusted), `chainReads.ts`
> `readKnownMember`/`readV1MemberRoot`, `wallet/JoinHistoricalGate.tsx` (own-row, fail-closed BLOCK,
> lazy-mounted on `/join`; verified against the live chain: all 8 proofs fold to the live root, exactly
> #7 knownMember=true → silent, 7 armed → BLOCK; recipient-not-buyer note in code for C4 gifting).
> C2 MUST call `resolveHistoricalGate` again before any buy button enables. v1-proof.ts NEUTRALIZED
> (origin repo `e4697ec`, header-only: V2b-ONLY, forbidden on any V3 path). **The honest 12/11
> readback → ✅ SEALED in prod (`8b486da`, Replit 33/33 gates + envelope emits
> memberCount=12/distinctWallets=11/seatOverlap=1 live; live-domain verified on /whitepaper, home
> hero and /join?source= USDC labels):** spine §5b derives `financial.members.distinctWallets` +
> `seatOverlap` LIVE (8 fixed `memberNumberOf` reads over the server-only freeze set
> `lib/protocol/historicalFreezeWallets.ts`; counts only, no wallet emitted; fail-closed;
> live-chain verified 12/11/1); `MembersProvenance` states "N seats issued · M distinct wallets —
> one wallet holds two seats" + verify link on home hero, `/whitepaper`, `/faq` (renders only when
> overlap > 0 and both figures live). Reality guard 138/138, targets 208/208. **Chronicle candidate
> → ✅ WRITTEN: `docs/chronicle/candidates/2026-07-12-the-duplicate-seat.md`** (protocol-institutional
> register, identity/amount-blind; PROMOTION IS A HUMAN ACT — it waits for the founder and for the
> Phase-5 `/chronicle` surface; it confers nothing by existing). **The 4-item duplicate-seat build
> order is COMPLETE.** **C1.4 economic proof → ✅ SEALED in prod (`f8bdec2`, live-domain verified:
> both prices live, the market-above-entry relation variant renders, all 5 doctrine lines verbatim):** `/join` "Two prices, read
> live" card — entry rate vs DEX market price DERIVED live on every render (the truthful relation in
> BOTH directions — the assumed "market below entry" has already flipped once; nothing hardcoded;
> fail-closed → no comparison, doctrine lines stand) + the never-cross lines ("The market is free.
> It may decide otherwise." · pool is a courtesy · SYN sent, not sold back · "Capital opens one
> axis." · "Not equity. Not yield. Not passive income."). C1 is now COMPLETE (C1.0→C1.4).
> **C2 approve→buy → ✅ BUILT, SHIPS OFF (this commit; BUILD ≠ GO-LIVE):** `wallet/JoinCheckout.tsx`
> behind `config/checkoutGate.ts` `CHECKOUT_ENABLED: boolean = false` (literal; the ternary folds —
> VERIFIED absent from the default bundle). The four C2 laws implemented: two SEPARATE signatures
> (buy only enables on live-confirmed allowance) · resumable (live `allowance` read, never approve
> twice) · fresh re-quote at the buy click → `computeMinSynOutRaw` · seat from the
> `MembershipPurchasedV3` event ONLY. Plus: chain-43114 assert + switch · USDC token read from the
> sale's own `USDC()` immutable (never hardcoded) · C1.3 gate RE-CONSULTED (blocks the flow) ·
> balance pre-check · honest revert translation (Q11 names). **GO-LIVE = a founder act:** flip the
> literal + the C5 lead/badge/boundary-card rewrite in the same commit (the page must never say
> read-only above a live buy button) + Q21 auth. Next = C5 + Q21 at the founder's signal.
> Founder decision: SHOW BOTH (12 seats / 11 wallets / one overlap), never fix silently.
>
> **▶ Prior (still valid): `docs/handoff/new-session-handoff-2026-07-12-checkout-proven-and-chain-truth.md`** —
> the biggest-decision session's resume point. The read-only `/join` checkout is COMPLETE + PROVEN in
> prod (C1.0→C1.2b, the referrer line validated on a REAL active source). Carries: the CHAIN TRUTH
> (9 contracts ever, CommissionRouter never deployed, ONE active BUILDER_SOURCE 5% LIFETIME), the two
> STANDING RULES (a public-RPC log scan is NOT proof of absence; a creation event is a STATE — read
> `sourceConfig()` live), the founder decisions (~~referral not-active-in-MVP~~ **← OVERRIDDEN
> 2026-07-13: active referral IS MVP — see the DECIDED block**, money is the company's,
> buyer pays two recipients in one tx, tiers-by-spend legal, rank never demotes, V4=router model), and
> the CONSOLIDATED SLICE LIST (A MVP / B after / C V4-contracts / D done). Prior C1-groundwork handoff
> stays valid for the C1.1–C1.4 spec detail.
>
> **▶ PRIOR HANDOFF: `docs/handoff/new-session-handoff-2026-07-11-recognition-live-and-member-home.md`** —
> the full recap: the member-recognition arc is **LIVE in prod** (auth on · SIWE signs canonical domain ·
> member identity menu · EVERY member recognized: genesis #1–#8 frozen roster + V3 #9–#12 live · own-receipt
> "Share my proof" · prod DB roster populated+verified 12=8+4, prod-write barrier restored). **ADR-003
> (anti-doxx) is canon.** That doc carries ALL settled founder decisions (naming canon · two shells · no twin
> pages · the authorized S7/S11 wire widening · Member Home spec · harvest source · APPROVE≠PAYMENT).
> **EXACT NEXT STEP (strict order):** (1) green main = 7 stale-guard fixes [this commit] → (2)
> `config/surfaceNaming.ts` + `guard-surface-naming` (BLOCKING) → (3) widen the wire S7/S11 → (4) Member Home →
> action registry → member doors → `/join` real purchase. The prior 2026-07-11-door-and-liveness handoff and
> the 2026-07-03 DB checkpoint remain valid history. Single source for "what's next" = this handoff + `OPEN_QUEUE.md`.

---

## ✅ DECIDED — DO NOT RE-OPEN (settled; do not re-litigate)

- **STANDING RULE (2026-07-12) — a PUBLIC-RPC `eth_getLogs` scan is NOT a proof of absence.** It chunks
  and drops. For any on-chain EXISTENCE question (does a source/contract/event exist?), use a COMPLETE
  scan (Routescan / an indexer), never a chunked public-RPC `getLogs`. This cost the project twice today.
- **STANDING RULE (2026-07-12) — a creation EVENT is a STATE; READ the current view live.** Terms get
  updated after creation (a source's scope read WINDOWED from its `SourceCreated` event; the live
  `sourceConfig()` said LIFETIME). Never decode an old event and call it today's truth. And: a comment
  is NEVER the authority for a status on a money surface — read `isActive()`/`sourceConfig()` live.
- **🔴 FOUNDER OVERRIDE, PERMANENT (2026-07-13) — "Referral not active in the MVP" is DEAD.**
  **Active referral IS part of the MVP** and lights up as soon as possible: C5 flip → the $5 test
  THROUGH the referral link (two proofs in one tx: checkout + the on-chain introduction payment) →
  then the PUBLIC referral-layer activation as its own founder-gated slice (programLifecycle switch +
  copy + member cards + the guard-safe-source adaptation proposed IN that slice, per the anti-blocking
  law). **No agent re-raises the old rule.** Everything else in the 2026-07-12 referral decisions
  STANDS: the buyer pays two recipients in ONE tx; the Syndicate pays nobody (no KYC/1099/float; copy
  says "the buyer pays you", never "we pay you"); tiers-by-spend legal; `HOME_RANK_LADDER` = the
  CAPITAL AXIS; the red line = never a better SYN price; rank never demotes; V4 target =
  CommissionRouterV1's model. *(Superseded that day: the "final economics = V4, ship dark" clause —
  the 2026-07-12 handoff lines saying "does NOT ship active in the MVP" are HISTORY, not law.)*
- **CANON (founder, 2026-07-12) — two authoritative specs are now IN-REPO (were on the founder's
  desktop): `docs/direction/CONSTITUTION_AUTORITE.md`** (the 4-level authority hierarchy — N0 immutable
  bytecode / N1 founder-on-chain / N2 server / N3 presentation; a lower level never contradicts a higher;
  the 3 admin control forms READ / PROPOSE(build-tx-founder-signs) / WRITE must look different) **and
  `docs/direction/SPEC_REFERRAL_SYSTEM.md`** (the full referral/source system, all decided). Both TIER-0
  in the canon index.
- **REFERRAL STATE (verified on-chain 2026-07-12, matches SPEC §①) + BUILD ORDER.** Sale V3 `0x2A6c…`
  live (era 1, 12 members); SourceRegistry `0x780013…` deployed (immutable in the Sale). **ONE source is
  ACTIVE** (`0x8338e9ff…1cf620` · BUILDER_SOURCE · 5% · LIFETIME · no caps · payoutWallet `0x2445…9C721`,
  re-activated block 89642946). ⚠️ **My earlier "ZERO sources" here was WRONG** — a lossy public-RPC
  `eth_getLogs` scan (NOT a proof of absence); the complete Routescan log scan found it. C1.2b is testable
  NOW: `/join?source=0x8338e9ff…1cf620` → live quote returns `acquisitionCost=$50`/$1000, the referrer line
  shows. CommissionRouterV1 is NOT deployed (confirmed on-chain — a V4 design, not an asset). V3 pays
  `payoutWallet` **directly** (`_payAcquisition`); it does NOT use a CommissionRouter. Order (SPEC §⑪):
  **R1** referral-program conditions doc (hashed → `metadataHash`; BLOCKING — `createSource(LIFETIME)`
  reverts `MissingMetadata` without it) → **R2** first source (founder signs `createSource(…PAUSED)`, test
  fail-closed, then `setSourceStatus(ACTIVE)`) → **R3** `&via=` channel (off-chain, no deps) → **R4**
  `/source` surface (`NOT_ACTIVE`, never "earn now") → **R5** event indexer → **R6** Connector staircase →
  **R7** the emitter contract (self-service). C1.2b already implements the SPEC §⑧ two-bug-corrected source
  line (rate=quote, address=`payoutWallet`, consistency fail-closed).

- **TIER-0 LAW (founder, 2026-07-12) — `docs/direction/CANON_VISIBILITY_LAW.md`.** On a chain, "hiding"
  does not exist — only making legible vs tedious; everything is already public. We hide nothing; we refuse
  to FABRICATE what the chain lacks. FORBIDDEN: a directory / search / reverse index (seat→wallet) / forced
  wallet↔person link / exposing a non-consenting member. ALLOWED (the chain already publishes it): INFRA
  addresses (Vault/Liquidity/Operations/Registry/Sale/Token — PIPES, nobody's wallet), any event-emitted
  address, YOUR own tx, an address the buyer must see BEFORE signing, opt-in self-publish. TWO disciplines:
  the SERVER emits no MEMBER address (no directory exists — member-standing own-row, source = 2 booleans,
  UNCHANGED); the CLIENT reads the chain like an explorer. Corollary: what PROVES is public, what GRANTS
  ACCESS is a secret (a contract address proves; an RPC token grants access). Loaded at every boot (TIER-0).
  FOLLOW-UP (tracked): `assertNoAddressLeak` (rpcTransport.ts + a twin in avalanche-live-read-check.ts) is
  MISNAMED — its comment now carries the correct doctrine (infra allowed, client out of scope), but a
  mechanical rename across its 24 call sites / 10 files is its own careful slice (do not rush; tsc-verified).
- **TIER-0 LAW (founder, 2026-07-12) — `docs/direction/CANON_INVARIANT_VS_STATE.md`.** The
  anti-drift law that ends the 6-rebuild loop: every repo statement is an **INVARIANT** (a rule
  about *how* — only the founder authors it; agents cite/obey, never invent) or a **STATE** (a
  photograph of today — any slice may make it obsolete; the slice that changes reality updates
  the STATE line in the SAME commit; a STATE is NEVER a permission gate or a reason not to build).
  Also fixes the `enabled` (founder decision, literal OK) vs `posture` (chain-derived, literal
  NEVER) collapse. Loaded at every boot (TIER-0 in `00_CANON_INDEX.md`).
- **CORRECTED (founder SPEC_REFERRAL_SYSTEM §⑨, 2026-07-12) — `HOME_RANK_LADDER` is the CAPITAL AXIS,
  NOT poison.** My earlier "poisoned canon" flag OVER-CALLED it. Per the spec: paliers-by-spend are
  universal + legal (Sephora/Ulta/Marriott/Uber/AA/Starbucks); `HOME_RANK_LADDER` unlocks NOTHING today
  (`{Citizen, $5, 500 SYN}` = just 100 SYN/$ = the era-1 rate everyone gets — a label, no bonus). It is
  the **CAPITAL recognition axis** (one of eleven axes; capital is one, never the throne). What ACTUALLY
  needs fixing (§⑨): (1) rename the colliding names — `Operator`/`Builder`/`Steward`/`Custodian`/
  `Cornerstone`/`Scout` (they are roles / axes / on-chain classes); (2) state clearly the capital is an
  AXIS, **never a MEMBER rank** — the SEAT IS BINARY ($5 and $10,000 buy the SAME seat); (3) the RED LINE
  a tier must NEVER cross — a better PRICE on SYN (more tokens/$) = a financial multiplier on a resellable
  asset = FORBIDDEN. The `/join` checkout cards stay AMOUNTS-ONLY (C1.1 ✅). NOTE: the stale
  `JOURNEY_STEPS {rank, status:"LIVE"}` the spec flags lives ONLY in the dormant vendored
  `syndicate-config.ts:687` (tsconfig-excluded, NOT served) — no live-app fix needed; label it honestly
  if that canon is ever reused. `RANKS_V2` named tiers are still not used on the checkout (numbers only).

- **DECIDED (founder, 2026-07-12) — narrative "Chapter" label pulled FORWARD from Phase 5
  (recognition only).** A small pure-function display: `artifacts/studio/src/lib/chapters.ts`
  (`chapterForSeat`, deterministic by seat number — I Genesis Signal #1–333 · II First Thousand
  #334–1000 · III The Expansion #1001–3333 · IV First Ten Thousand #3334–10000 · V Open Era
  #10001+) renders "Chapter I · Genesis Signal" in the header member menu. Own-row (member's own
  seat only, no directory, no address, no network call); **recognition only** — never a rank,
  tier, or financial advantage (SEASONS_ENGINE guardrail: earlier ≠ "better"). This is ONLY the
  label; the full chapters/eras/seasons auto-advance engine remains Phase 5 (harvest from origin).
  NOTE: header's existing "Genesis" pill badge = the ERA-provenance label (#1–8 freeze-root), a
  DIFFERENT thing from chapter "I Genesis Signal" (#1–333) — do not conflate.

- **DECIDED (founder, 2026-07-11) — the runtime served-payload discipline NET is LIFTED
  (reversible).** `assertProtocolRealityDiscipline` no longer throws on an address-leak /
  financial-framing payload; gated behind `DISCIPLINE_ENFORCED` (flip to re-arm). Recorded as
  an explicit founder amendment in `docs/adr/ADR-003-…-anti-doxx.md`. ADR-003's CORE stays in
  force (no KYC, no directory, own-row/aggregate, `memberNumber→wallet` server-only — never
  built into a served payload), and the build-time envelope leak scans still run — so nothing
  is doxxed today; only the automated runtime catch was lifted. Financial-framing net expected
  back at the Phase-5 crypto-lawyer pass. This ALSO resolved the member-standing **500** (the
  net was false-positiving a member's own 64-hex receipt tx as a 40-hex address).

- **DECIDED — the whole PROTOCOL is LIVING (`docs/direction/WHITEPAPER_LIVING_DOCTRINE.md`).** Not a
  whitepaper feature: EVERY surface reads live from the chain and updates itself ("read live · as of {ts} ·
  nothing hardcoded · don't trust, verify · we ask nothing · observe → join"). The whitepaper is the flagship
  written expression. **Live projections CAN'T diverge:** the same figure on many pages is FINE — they read
  ONE canonical source (`GET /api/protocol/reality` + the live hooks), so `/whitepaper` and `/tokenomics`
  show identical live numbers by construction, never a duplicated hardcode. (Proven in prod: the signature
  advances between reloads; both pages read the same distribution figures.)
- **DECIDED — the shared LIVING CHASSIS (`src/components/living/`) is REUSABLE; next pages COMPOSE from it,
  never rebuild:** `LivingSignature` (as-of live signature, from the reality envelope meta) · `TransparencyPosture`
  (ask-nothing / everything-here / don't-trust-verify / observe→join) · `SectionIndex` (sticky anchor TOC) ·
  `AllocationDonut` (live SVG donut) · `ReconciliationTable` (design-vs-live table) · `RoutingBar` (live
  70/20/10 split, sized by live amounts). Built on the atoms (`Prose · Amount · StatusPill · VerifyOnChain ·
  StatCard · DataTable`) — reuse, never parallel.
- **DECIDED — content-page harvest map = `docs/direction/CONTENT_SURFACE_HARVEST_MAP.md`.** All harvest
  sources are ON DISK under `C:\Users\kemal\OneDrive\Documents\GitHub\<repo>` (origin `TheSyndicate`,
  `Supa-Exchange`). Harvest = **adapt** structure/chrome, **never copy content raw**; repo + doctrine + legal win.
- **DECIDED — FAQ (2.3) build:** CHROME/structure harvested from **Supa** (`Supa-Exchange` FloatingAISupport /
  FAQ: search + category cards + accordion + FAQ JSON-LD + CTA) + an entity-chain hero-answer card; the
  CONTENT comes from the **origin** `TheSyndicate/src/routes/faq.tsx` + `components/syndicate/FaqRebuilt.tsx`
  (39 doctrine-perfect Q&A) — NEVER Supa/entity content (yield/APY/DAO/referral-bonus are BANNED). Composes
  from the living chassis.
- **DECIDED — Support + floating robot:** harvest Supa's floating bottom-right robot
  (`Supa-Exchange/client/src/components/FloatingAISupport.tsx`). **Tone exception granted** (cute/warm OK — it
  is a HELP assistant, NOT a truth surface). It is **NOT** the protocol's PENDING AI Layer; it **NEVER
  fabricates a figure** (always points to on-chain proof); recognition-only if ever gamified (see
  `docs/direction/GAMIFICATION_LEGAL_DOCTRINE.md`).
- **DECIDED — build order:** whitepaper ✅ → tokenomics ✅ → **FAQ (2.3) → Support (floating robot) → docs
  (2.4) → knowledge (2.5)** → then Risk · Glossary · Roadmap · Protocol-facts · Brand-facts · Join UI · footer.

- **Phase 1 — CLOSED.** 8 atoms (Amount · StatusPill · Button+Tag · StatCard · Table · Field · Icon).
  Color sprawl **137 → 0**, `no-raw-color` guard **BLOCKING** in the `guards` gate. Fluid `.type-*`
  scale adopted site-wide. Component states + a11y done. (1 documented raw-color exception: QrCodeBlock canvas.)
- **Phase 2.0 — Rendering fix → ✅ CODE-COMPLETE · verified green on Replit/Linux · awaiting live-domain
  verification after Publish.** Build-time prerender/SSG of the shell:
  `artifacts/studio/scripts/prerender-routes.ts` writes per-route `dist/public/<route>/index.html`
  (real title/description/OG/canonical + Organization JSON-LD in the server HTML) + a real noindex
  `404.html`; the soft-404 SPA rewrite was removed from `.replit-artifact/artifact.toml`. One shared
  JSON-LD source (`src/lib/seo-jsonld.ts`) feeds BOTH `SeoHeadManager` and the prerender. PENDING
  routes (`/recognition`, `/archive`) emitted as **noindex** shells (avoids reload-404, stays out of
  the index). NOT SSR (`wagmi ssr:false` untouched); live chain figures stay client-hydrated.
  **Live-domain checks (2026-07-10, post-Publish):** home ✅ (200 + Organization JSON-LD + apex
  canonical in raw HTML), unknown path ✅ (real **HTTP 404** + noindex `404.html` shell — soft-404 gone).
  `/status` returned **301 → `/status/`** — ROOT CAUSE (confirmed via Replit + Replit docs): emitting
  `<route>/index.html` **directories** makes the static host auto-redirect to the trailing slash, and
  that directory redirect fires BEFORE any rewrite, so "served URL == canonical" can't win.
  **FIX (in `main`, commit after `5502a57`):** the prerender now emits **flat `<route>.html`** files
  (no directory → no auto-redirect → the no-slash URL is served directly at 200 = canonical), so Replit
  needs **no** deploy-layer flatten step. Awaiting one more Publish to confirm `/status` = HTTP 200
  (no `location:` header).
- ~~**NEXT SLICE = Phase 2.1 — Prose atom + Whitepaper**~~ — superseded: Prose atom, Whitepaper, and
  Tokenomics are all DONE and relaunched on the living chassis (see the top living bullets). **2.3 FAQ +
  the deterministic Support Guide, and 2.4 Docs are SEALED in prod (Docs = `140d33e`, Replit-verified live).
  NEXT = 2.5 Knowledge base.**
- **DEPLOY DEBT — ✅ CLEARED.** No outstanding undeployed *product* commits — **`main` == production**
  (latest deploy: ⓪ member-liveness, `bc6102a`; docs-only commits after it don't require a deploy).
- **DECIDED — carte-blanche is CANON; our per-slice cadence is a FOUNDER CHOICE (2026-07-06).**
  `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md` (Compass §2/§7) grants
  **standing implementation authorization for Phases 1–10** — it LIFTS report-first, per-slice approval,
  "no implementation authorized", and the read-only-foundation gate; a phase defers only if its **input**
  is missing. It KEEPS every truth/safety invariant (no fake-live, no PII, no yield framing, single canon,
  read-only spine never gains write endpoints, **BUILD ≠ GO-LIVE**: real-money/auth-flip stays a founder
  act needing founder inputs). **Implication:** the tight show-diff→approve→push cadence we run is the
  founder's *choice*, tighter than canon requires — not a canon requirement; canon permits building
  Phases 1–10 without per-slice approval. (Repoints applied: Compass §5/§8; `/join` note = stale
  authorization gate, OPEN_QUEUE Q20.)
- **DECIDED — keep the newer OG image (`opengraph.jpg`), do NOT revert.** Replit regenerated the
  social-preview screenshot from the current live app (fresher UI + chain figures: inflow 235.50,
  **burned 21,273 SYN**, verify-on-chain links). Founder confirmed: additional burns happened since, so
  **21,273 is the true current figure** — the Compass's "16,500" is a **stale doc number, not canon**
  (chain > docs). **Implication for slice 2.2 (Tokenomics):** the burn MUST render as a **live chain
  read**, never a hardcoded 16,500; when 2.2 lands, reconcile/soften the Compass's "16,500" mention.
- **DEFERRED — www→apex 301 (NOT a 2.0 blocker; apex is canonical and serves today).** Do at
  **domain transfer (~Sept 2026)**: the domain was bought via **Lovable** and is registrar-locked
  ~60 days, and Lovable can only do a 302 (not a clean 301). After the lock, transfer to a proper
  registrar and add a **single-hop 301 `www.thesyndicate.money` → `https://thesyndicate.money`**, TLS
  covering both. `www` has no DNS entry until then. **HSTS/preload stays Phase 6.**
- **2.0 approach was DECIDED (ADR-002): build-time prerender / SSG of the SHELL** (kept for the record).
  Per-route static HTML with real `title`/`description`/OG **+ JSON-LD baked into the server HTML** +
  a real **404 status**. **NOT runtime SSR** — it breaks with `wagmi ssr:false`. Inject head/JSON-LD,
  do **not** prerender the React DOM.
- **2.0 scope — DECIDED: Head + JSON-LD + real 404 ONLY.** SEO guards (banned-word, sitemap-leak,
  index-only-real-content) and PENDING-page `noindex` are **end-of-Phase-2**, NOT part of 2.0.
- **Live chain figures stay client-hydrated, never hardcoded.** Static copy is prerendered; every number
  reads live from chain/config, labeled VERIFIED / PENDING / FUTURE / PAUSED / FOUNDER-GATED.
- **Replit coordination point:** serving per-route prerendered HTML (one file per path, not a single SPA
  fallback) needs a **Replit serving change** — founder/Replit handoff at end of the 2.0 slice.
- **Repo wins over spec.** Read the repo, adapt, flag any disagreement.
- **"package" is BANNED publicly** → use **"entry amount" / "entry tier"**; extend the forbidden-copy guard
  (`scripts/guard-forbidden-copy.ts`) to also ban: invest, raised, donation, contribution, package,
  governance weight, equity, APY, dividend, 100x, moon, pump.
- **Color meaning (canon):** **Gold = identity / seat / membership · Cyan = live / verification / activity.**
- **Link, don't duplicate** existing routes: `/status` `/learn` `/source` `/join` `/member` `/recognition`
  `/archive` `/proof` (contract-memory, os-map).

## Where we are (factual)

- **PHASE 1 → ✅ CLOSED.**
- **PHASE 2 — Content + rendering → 🔨 IN PROGRESS.**
  - **2.0 Rendering fix → ✅ SEALED in prod** — per-route flat `<route>.html` prerender (real
    title/description/OG/canonical + Organization JSON-LD in the server HTML) + a real **HTTP 404**; `/status`
    (and all routes) serve 200 with **no redirect** = canonical. www→apex 301 deferred to the domain transfer.
  - **Whitepaper → ✅ SEALED in prod as the flagship LIVING document** on the shared `living/` chassis —
    a short scannable manifesto (hero + `LivingSignature` + `TransparencyPosture` + sticky `SectionIndex`);
    **self-contained**: supply · burn · distribution (donut + design-vs-live `ReconciliationTable`) · 70/20/10
    routing are ALL live in-page, zero typed numbers. Built on the Prose atom + `useHeroReality`/`useTokenomics`.
  - **Tokenomics → ✅ SEALED in prod** on the same chassis (donut + `ReconciliationTable` + LP card +
    Founder vesting card + live `RoutingBar`). `/whitepaper` and `/tokenomics` read ONE
    `GET /api/protocol/reality` source — figures **identical & live** (verified in prod; the signature
    advances between reloads).
  - **Backend spine serves live** (fail-closed, no address emitted; guards pin invariants — targets 203/203,
    reality 131/131): chain identity · contract code presence · token metadata · sale figures · financial
    (inflow aggregate, vault/ops/LP/burn balances, memberCount) · **SYN `totalSupply`** · **7 allocation
    `balanceOf`**. Client hooks: `useHeroReality`, `useTokenomics` (+ market price from live LP reserves,
    entry rate from the live join-quote). Standing rule: **no PENDING for a readable figure.**
  - **FAQ (2.3) → ✅ SEALED in prod (`1c6a07d`, Replit-verified live).** `/faq` composed from the living chassis
    (`PublicPage` + `LivingSignature` + `TransparencyPosture` + `SectionIndex`) + one new interactive
    primitive `FaqAccordion` (search + category filter + accordion, tokens-only). Content = the origin's
    39 Q&A across 8 categories, **reframed doctrine-perfect: zero numerals, zero addresses, no banned
    words** ("package" → "featured entry amount / entry tier") — every live figure is a hero-card chain
    read (`useHeroReality`/`useTokenomics`, fail-closed) or a one-click link to `/tokenomics` `/status`
    `/join`. **FAQPage JSON-LD** baked into the server HTML from one shared builder (`seo-faq-jsonld.ts`,
    41 Q) feeding both prerender + a runtime injector — no drift, on-screen text == structured data.
    Wired end-to-end (registry INDEX+sitemap · surfaceClassification · modules "faq" Learn-footer · nav ·
    App route). Green locally: typecheck 0 · all 9 guards + no-raw-color · seo:check 303.
  - **Support · the DETERMINISTIC floating Guide → ✅ SEALED in prod (`56bc165`, Replit-verified live).**
    `SyndicateGuide` mounted globally in `PublicLayout` (public surfaces only) — a router + FAQ-corpus
    finder that "consults, never invents": surfaces the vetted number-free FAQ answers + routes to the
    proof surfaces, states no figure itself. Line-art mascot on tokens (gold frame / cyan face). Prerender-
    safe (localStorage/window in typeof-guarded effects); no fake "1" badge; no decorative live dot; header
    says "Guide", not "AI". NO LLM / NO wallet-awareness / NO backend (those = Phase 3). `guard-access-state`
    storage allowlist extended (greeting-seen boolean only). Green: typecheck 0 · 9 guards + no-raw-color.
  - **2.4 Docs → ✅ SEALED in prod (`140d33e`, Replit-verified live).** `/docs` composed from the living
    chassis — journey spine + grouped cards, each card's status **derived from the SEO route registry**
    (Ready/Pending, never hardcoded; `/recognition` `/archive` read honest Pending), real routes only,
    number-free. Header "Docs" repointed to `/docs`; `/learning` stays "Learn" (footer + linked from `/docs`).
  - **⓪ Liveness fix (member figure) → ✅ SEALED in prod (`bc6102a`, Replit-verified live).** The public
    member figure is now the **LIVE continuous `memberCount()`** (12), NOT the stale served snapshot (which
    said 10). Spine reads `GENESIS_OFFSET`+`nextSeatNumber`, reconciles server-side fail-closed (anchor
    `GENESIS_OFFSET==8` AND `nextSeatNumber==memberCount+1`), emits `financial.members.memberCount` +
    `financial.members.genesisOffset` (nextSeatNumber invariant-only, never emitted). `MembersProvenance`
    renders the dual authority (**8 freeze/root + 4 live V3-emitted, never collapsed**) + the STALE
    divergence one-liner ("snapshot 10 as of 2026-07-03 · live runs ahead"). New BLOCKING `guard-freshness`;
    `LivingSignature` dropped from `/docs`. **Standing rules added:** "no snapshot for a live-readable
    figure"; "semantics are reconciled, never inferred from ABI names" (worked example: V3-only would have
    shipped 8+12=20 — see `ORIGIN_RECLAMATION_LEDGER.md` §11). **12 is 12** — real on-chain purchases, no
    test-seat category. The holder-index snapshot is now verification-only (and 2 stale — OPEN_QUEUE Q18).
  - **NEXT = 2.5 Knowledge base → 2.6 Risk** — each COMPOSES from the `living/` chassis + harvests per
    `CONTENT_SURFACE_HARVEST_MAP.md`. Canonical order = the **frozen "Remaining Phase-2 slices, IN ORDER"**
    list below; new session work is captured separately under **"Phase 3–6 / later work"**.
- **PHASES 3–6 → ⬜ pending** (auth single-instance/Reserved-VM blocker open; admin/RBAC unseeded; event
  backbone / activity / gamification unbuilt; perf/a11y/responsive/security audits not run; fonts still Google-CDN).

## The 2.0 slice — concrete plan (derived; files not dictated by any spec)

1. Post-build script (e.g. `artifacts/studio/scripts/prerender-routes.ts`): for each public route in the SEO
   registry, write `dist/public/<route>/index.html` = base `index.html` + injected head (title/description/OG/canonical)
   + static JSON-LD. Reuse the registry — no new source of truth.
2. Real `404.html` with a true not-found status (replace the soft-404 SPA fallback).
3. Wire into the build pipeline (`build` → `postbuild`, or a `seo:prerender` script) without breaking
   `seo:generate` / `seo:check`.
4. Client unchanged: `wagmi ssr:false`, `SeoHeadManager`, live-figure hydration untouched.
5. End of slice: Replit handoff to serve prerendered HTML per path.

## Remaining Phase-2 slices, IN ORDER (from `docs/direction/MASTER_BUILD_SPEC.md` — do not re-plan)

*FROZEN LIST — items and order are canonical; do not drop, reword, or reorder a single item. Only status
markers update. New session work lives BELOW in "Phase 3–6 / later", never woven into this list.*

1. ~~**2.0 Rendering fix** — prerender/SSG shell, server HTML meta + JSON-LD, real 404.~~ ✅ **DONE.**
2. ~~**2.1 Prose atom + Whitepaper**~~ ✅ **DONE** — Prose atom (`components/prose/Prose.tsx`) + `/whitepaper`
   (15 sections, every figure a live chain read via `useHeroReality`/`Amount`/`VerifyOnChain` or a PENDING
   label — zero hardcoded numbers). Guard extended (safe set; `contribution`/`package`/`moon`/`raised`
   flagged as repo-wins exclusions). Supply, the 7 distribution shares, and both prices render PENDING —
   they need a live supply/price read (wire in 2.2). *(NEXT = 2.2.)*
3. ~~**2.2 Tokenomics (+ SYN token)**~~ ✅ **DONE** — `/tokenomics` on the Prose atom + the backend live
   reads it needed. Spine extended (SYN `totalSupply` + 7 allocation-wallet `balanceOf`, fail-closed, no
   address emitted; both protocol guards extended). `useTokenomics` reads them + market price (live LP
   reserves) + entry rate (live join-quote). **Whitepaper's 10 PENDINGs flipped to LIVE** (supply, 7
   allocation shares, both prices). Stale "16,500" burn retired — burn is a live read everywhere. Standing
   rule added: no PENDING for a readable figure. *(NEXT = 2.3 FAQ.)*
4. ~~**2.3 FAQ**~~ ✅ **DONE** (harvest: Supa chrome + origin 39 Q&A — see harvest map) · 5. ~~**Support + floating
   robot**~~ ✅ **DONE** (harvest: Supa `FloatingAISupport`; tone exception; NOT the AI Layer; never fabricates a figure)
6. ~~**2.4 Docs**~~ ✅ **DONE** (`140d33e`, live) · 7. 🔵 **2.5 Knowledge base** *(NEXT)* · 8. **2.6 Risk** · 9. **2.7 Glossary**
10. **2.8 Roadmap** (registry-driven) · 11. **2.9 Protocol-facts** · 12. **2.10 Brand-facts**
12. **2.11 Join / entry-tiers UI** — featured tiers + custom-amount compose + live quote preview
    (gross → source payment → net → 70/20/10) + 5-step flow; read-only; figures from chain.
13. **Footer IA + sitemap + per-page SEO guards** — footer per `CONTENT_SUITE_SPEC`; add banned-word,
    no-fake-live, sitemap-leak, index-only-real-content guards.

## Phase 3–6 / later work — captured this session (NOT scheduled into the frozen Phase-2 list above)

*A holding area for work decided/researched this session. It does NOT reorder the frozen Phase-2 list; each
item slots into Phases 3–6 at build time, after its prerequisites. Format: name · status · source doc.
Status: ⬜ PENDING · 🔒 DEFERRED (lawyer-gated). All money-touching items governed by
`SETTLED_RULES_DO_NOT_RELITIGATE.md` + a crypto-lawyer pass at Phase 5.*

**Phase 3 — the Guide's brain (deterministic Guide already SEALED; these extend it)**
- Guide **security spine** — isolated endpoint · token rate-limit · budget cap + circuit-breaker →
  deterministic · output forbidden-copy filter · monitoring · ⬜ PENDING · built BEFORE any LLM ·
  src `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md`.
- Guide **LLM escalation** — Groq + DeepSeek fallback · RAG-grounded on the content suite · degrades to
  deterministic · ⬜ PENDING · needs the security spine + a fuller corpus · src `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md`.
- Guide **user-level awareness** — visitor/holder/member from verified on-chain state (own wallet only) ·
  ⬜ PENDING · needs auth · src `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md` + `LIVING_ORGANISM_MASTER_PLAN.md` §6.

**Phase 5 — living-organism public surfaces (backend read-models FIRST, then the surface)**
- Event backbone — indexer → canonical `EVENT→SIGNAL→MEMORY→CHRONICLE candidate` pipeline (the read-models)
  · ⬜ PENDING · src `ACTIVITY_HEARTBEAT_READ_MODEL.md` + `LIVING_ORGANISM_MASTER_PLAN.md` §7.
- Economy macro `/economy` — Protocol Economy Observatory (evidence-labeled, not-a-yield-dashboard) ·
  ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §3.
- Activity `/activity` — public aggregate, recency-truthful, address-safe pulse over the heartbeat
  read-model · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §7.
- My Economy + cockpit narrative arc (Identity→Place→Ownership→Momentum→Action→Memory→Proof) · ⬜ PENDING ·
  src `LIVING_ORGANISM_MASTER_PLAN.md` §3.
- Chronicle `/chronicle` — memory pipeline + public solemn record (promotion = human act; two registers;
  oldest-first) · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §7.
- Register — the census / seat roster · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §3.

**Phase 5 — recognition engine = SEASONS · ERA · continuity (recognition-only; capture-now, build-at-phase)**
- Recognition engine — XP + quests + badges + season leaderboard + rank snapshot (harvest Supa's mechanism,
  reskin to our tokens/vocab; recognition only, off-chain/non-transferable) · ⬜ PENDING ·
  src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` (governed by `SETTLED_RULES` + `GAMIFICATION_LEGAL_DOCTRINE`).
- **Season = Era** binding — season boundaries are deterministic on-chain member milestones (era `endSeat`),
  built WITH the new sale/era contract · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §3.
- **Three clocks / continuity** — Eras (economic, finite) · Chapters (mythology, finite) · Seasons
  (engagement, **infinite** recognition heartbeat) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §3.5.
- **Learn & Earn = earn XP** — quiz + recognition loop on top of `/learning` (our content, never Supa's;
  reward = recognition, never cash) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §7.5 (SETTLED).
- Recognition catalog — badge · feature/access · cosmetic · collectible · physical (drop token/boost/
  cash-discount) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §7.
- Season/recognition **admin lifecycle** in the RBAC admin shell (state machine · next-step engine · audit ·
  archive) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §6.
- **Funding = company money, discretionary, effort-based, USDC-not-SYN, never touches 70/20/10** (the cash
  rail; reuse the Merkle infra) · 🔒 DEFERRED (lawyer-gated) · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §8 + `SETTLED_RULES`.

**Phase 5–6 — identity & income economy**
- **`/staff` — PUBLIC OPERATOR REGISTRY (anti-impersonation)** · ⬜ PENDING (record, do not build; own slice, CAN
  ship EARLY) · founder 2026-07-12. The #1 crypto fraud is "I'm Syndicate support" draining a wallet; the answer
  is MECHANICAL — every operator signs in with their EVM address, and that address is PUBLIC on the site with its
  STATUS (`Seat #3 · Member support · 0x9F4A…22B1 · ● ACTIVE` / `Content operator · 0x5D18…88A0 · ○ SUSPENDED`).
  An impostor can COPY an address but CANNOT SIGN with it ("ask them to sign this message with that address —
  if they can't, it isn't us"). HALF-BUILT already: `referralProgram.ts` has the 8 roles; `operator-context`
  returns `{isOperator, role}` from the ACTIVE registry row — the registry EXISTS, publishing it is a READ.
  A SUSPENDED operator MUST show SUSPENDED. Under the Visibility Law this is INFRASTRUCTURE identity — publishing
  it is REQUIRED, not merely permitted.
- **Public leaderboard — HONOUR ROLL, not a directory** · ⬜ PENDING (record; lands WITH the Standing slice, not
  before) · founder 2026-07-12. Public by default (it IS the engagement engine — Zealy/GitHub/Strava). The exact
  application of the Visibility Law: ❌ a directory (wallet→who, fabricated) — never; ✅ a RANKING (top-N
  Connectors, the chain already publishes it). Shows a SEAT + a STANDING ("Seat #12 · Foundational Connector · 47
  introductions"), an honour roll, NEVER a money ranking (retention/duration/quality). Alias stays opt-in: by
  default you are a SEAT NUMBER — a member who wants no name stays a number, BUT HIS RANK EXISTS (like GitHub).
- Internal explorer (harvest `MiniExplorer`) + extend `known-addresses` labeling (read-only) · ⬜ PENDING ·
  src `LIVING_ORGANISM_MASTER_PLAN.md` §9.
- Shareable cards / OG (consent-gated identity; viral) · ⬜ PENDING (non-financial) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Verifiable reputation (multi-axis; never wealth-ranking) · ⬜ PENDING (non-financial) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Address labeling **service** (verified, pay-to-label, never impersonate) · 🔒 DEFERRED (lawyer-gated) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Aliases (ENS-style, sold; tied to seat; non-tradeable) · 🔒 DEFERRED (lawyer-gated) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Guide premium tier (bundle into a recognition tier; free Guide stays fully truthful) · 🔒 DEFERRED (lawyer-gated) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- White-label truth-first Guide / verification kit (post-MVP, separate business) · 🔒 DEFERRED · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.

**Transparency signature moves (cheap, high-differentiation; interleave)**
- E1 "Prove it" — a verify link on every Guide answer + every figure (standing rule, folded into each slice) · ⬜ ongoing · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E2 Living FAQ — grows from real anonymized Guide questions · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E3 "Verify it yourself" kit — published read scripts · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E4 Honesty register — public log of corrections · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E5 "Never will" charter · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.

**Cross-cutting (design principles, not slices):** engagement psychology (`LIVING_ORGANISM_MASTER_PLAN.md`
§4 — honest levers only, **recency-truth**) applies to every surface. **Governance is banned** — reframe any
DAO/member-memory track as **permanently non-promoting recognition**. The remaining Phase 3–6 infra from
`MASTER_BUILD_SPEC.md` (single-instance/Reserved-VM, operator DB + founder seed, auth + admin ON/OFF toggle,
live checkout, referral read, RBAC + admin shell, perf/a11y/responsive/security audits) stays as specified
there — this block ADDS to it, never replaces it.

**Conflicts with existing canon — NONE found this session.** `SEASONS_ENGINE` reconciles the old `/learning`
"no reward" comment as "no **cash** reward" (consistent with earning **XP** = recognition), and the "new
sale/era contract" is a future lawyer+audit-gated design, not an override of a locked decision. No
genuine RED-LINE mechanism to flag: the seasons doc itself drops the banned mechanisms (XP→USDC,
SYN-as-reward, boost/multiplier, cash-convertible discount) and lawyer-gates the cash rail. Per
`SETTLED_RULES`, earn/referral/season/pot/Learn&Earn=XP are settled and NOT re-flagged.

## Slice protocol (every step)

Read the real repo → 4-line gate → **wait for founder GO** → build + guards (Replit is the build gate) →
show diff → founder approves → commit + push `main` → tick `DESIGN_ROADMAP` → deploy verdict (🚀 / ✅).


> **▶ REFERRAL-FIRST, FOR REAL — ✅ BOTH PARTS BUILT (2026-07-13, founder GO ×2, awaiting push GO):**
> ① THE DEEP SWEEP shipped (`6ac9977`): every rendered sentence referral-first; the builder success
> message's stale "not active yet" killed. ② HUMAN URL: **/referral is the canonical program URL**
> (App route + INDEX/sitemap entry + module/nav/CTA/docs repointed); /source-attribution stays a
> serving ALIAS (200, `REDIRECT` status → noindex,follow; canonical consolidation — no 301 exists at
> the static layer until the domain transfer); artifact.toml regenerated 17 routes/34 rules; sitemap
> regenerated (15 INDEX). ③ MONEY-FLOW VOCABULARY (founder decision, re-engraved by the advisor
> 2026-07-13 — FLOW-BASED, not a blanket word): `acquisitionCost` = bytecode/ABI word ONLY, banned
> from every public surface ("acquisition cost" is RESERVED for real future marketing costs — ads,
> CPA — never the referrer payment). BUYER-side money lines say "Paid to referrer" / referrer
> payment (never "commission" as the buyer money-line label, never "we pay you X%"). "Commission"
> stays the business word on the REFERRER's own surfaces (program terms, their dashboard:
> pending/paid commissions). The canonical formula everywhere: Gross purchase → referrer/source
> payment, if eligible → net protocol contribution → 70/20/10. The doctrinal sentence VERBATIM where
> the flow is explained (now in the /referral boundaries): "The referrer is not paid from Syndicate
> revenue after the fact. The referrer is paid from the purchase transaction before the net protocol
> contribution is routed." Data source rule unchanged: values from quote(), never registry
> commissionBps. Applied: /join fail-closed line → "A referrer payment of X% applies";
> "acquisitionCost" survives only as the cited contract word in the protocol map. `check-public-surface-audit` leak-check adapted IN the
> slice (own-path test — a REDIRECT alias's canonical pointing at the sitemap IS the consolidation
> working). Verified in built shells: referral.html canonical=/referral · source-attribution.html
> noindex,follow. All green: 12 guards · seo:check 34 routes · rewrites:check · surface:audit 218+ ·
> build 18 shells.
