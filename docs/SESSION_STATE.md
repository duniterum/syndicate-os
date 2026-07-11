# SESSION_STATE — read FIRST, every session

Authoritative resume point. **The real repo always wins over any spec.**
Direction specs now live IN this repo: `docs/direction/MASTER_BUILD_SPEC.md` ·
`docs/direction/CONTENT_SUITE_SPEC.md` · `docs/direction/WHITEPAPER_PLAN.md` ·
`docs/direction/WHITEPAPER_LIVING_DOCTRINE.md` (living-protocol soul + chassis) ·
`docs/direction/CONTENT_SURFACE_HARVEST_MAP.md` (content-page harvest map) ·
`docs/direction/GAMIFICATION_LEGAL_DOCTRINE.md` (recognition-only, legal shield).
Design tracker: `docs/DESIGN_ROADMAP.md`. Doctrine/roles: `docs/00_START_HERE.md`.

---

## ✅ DECIDED — DO NOT RE-OPEN (settled; do not re-litigate)

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
- **DEPLOY DEBT — ✅ CLEARED.** The batched FAQ link-fix (`8bc3f1e`) rode the Support deploy. No outstanding
  undeployed *product* commits — **`main` == production** (latest deploy: 2.4 Docs, `140d33e`; docs-only
  commits after it don't require a deploy).
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
