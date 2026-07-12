# SESSION_STATE — read FIRST, every session

Authoritative resume point. **The real repo always wins over any spec.**
Direction specs now live IN this repo: `docs/direction/MASTER_BUILD_SPEC.md` ·
`docs/direction/CONTENT_SUITE_SPEC.md` · `docs/direction/WHITEPAPER_PLAN.md` ·
`docs/direction/WHITEPAPER_LIVING_DOCTRINE.md` (living-protocol soul + chassis) ·
`docs/direction/CONTENT_SURFACE_HARVEST_MAP.md` (content-page harvest map) ·
`docs/direction/GAMIFICATION_LEGAL_DOCTRINE.md` (recognition-only, legal shield).
Design tracker: `docs/DESIGN_ROADMAP.md`. Doctrine/roles: `docs/00_START_HERE.md`.

> **▶ 🔴 AUDIT SESSION (2026-07-13) — full pre-flip audit DONE; verdict was "NOT BEFORE …"; the
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
> RULE wants it committed into docs/direction/ at the founder's GO).** **GROUP C (founder-only, PENDING —
> untouched): DISCIPLINE_ENFORCED re-arm · homepage Studio-OS teaser · "Raised class" rename · whitepaper
> §05 tier sentence.** **Instance pinning → ✅ DONE (founder, 2026-07-13, Replit dashboard): autoscale
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
> `sourceConfig()` live), the founder decisions (referral not-active-in-MVP, money is the company's,
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
- **REFERRAL DECISIONS (founder, 2026-07-12; full detail in the 2026-07-12 handoff).** Referral is built
  (C1.2b) + works but does NOT ship active in the MVP (final economics = V4). The buyer pays two
  recipients in ONE tx; the Syndicate pays nobody (no KYC/1099/float; copy says "the buyer pays you",
  never "we pay you"). Tiers-by-spend are legal; `HOME_RANK_LADDER` = the CAPITAL AXIS, not poison; the
  red line = never a better SYN price. Rank never demotes. V4 target = CommissionRouterV1's model.
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
