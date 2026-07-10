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
  Tokenomics are all DONE and relaunched on the living chassis (see the top living bullets). **2.3 FAQ is
  SEALED in prod (`1c6a07d`, Replit-verified live). NEXT = Support (floating robot).**
- **⚠️ DEPLOY DEBT — `main` is ONE cosmetic commit ahead of production.** `8bc3f1e` (in-card links on `/faq`
  now render cyan + underlined instead of plain text — founder-reported) is pushed to `main` but **NOT yet
  deployed** — founder decided to **batch it with the next slice's deploy** (Support), so Replit does one
  pull, not two. No data/SEO impact; purely visual. When the next deploy runs, it carries BOTH — no separate
  action needed. (Clear this note once prod is at `8bc3f1e` or later.)
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
  - **NEXT = Support · the DETERMINISTIC floating Guide (no LLM yet) → 2.4 Docs → 2.5 Knowledge** — each
    COMPOSES from the `living/` chassis + harvests per `CONTENT_SURFACE_HARVEST_MAP.md`. Full build order =
    **THE ONE ORDERED SEQUENCE** below.
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

## THE ONE ORDERED SEQUENCE — the single build order (all phases · Tracks A–E woven in)

*Supersedes the old Phase-2-only list. This is THE canonical order — do not reorder without founder sign-off.
Sources: `MASTER_BUILD_SPEC.md` (6 phases) · `LIVING_ORGANISM_MASTER_PLAN.md` §11 (Tracks A–E) ·
`GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md` · `CONTENT_SUITE_SPEC.md` / `CONTENT_SURFACE_HARVEST_MAP.md`.
Status legend: ✅ DONE · 🔵 NEXT · ⬜ PENDING · 🔒 DEFERRED (lawyer-gated).
**Dependency rules honored:** backend read-models before their public surfaces · content suite before the
Guide's LLM grounding · lawyer-gated identity/income items placed LAST and marked DEFERRED.*

**RECONCILIATION (this session, flagged — not a silent reorder):** the old list had "Support + floating
robot" as ONE item. The new plan splits the Guide into **deterministic** (needs only the FAQ corpus, which
is DONE) vs **LLM / security / user-level** (need the fuller content suite + auth). So **Support stays NEXT
but is now explicitly DETERMINISTIC-only** (#5); its LLM/security/user-level parts move to Phase 3
(#19–#21, #24). This is a refinement consistent with the founder's own Support locks — **no existing
canonical decision is overwritten.** No other conflicts found.

### PHASE 2 — content suite + the deterministic Guide  (Track A + Track B1/B5-UI)
1. ✅ **2.0 Rendering fix** — prerender/SSG shell, server HTML meta + JSON-LD, real 404. **DONE.**
2. ✅ **2.1 Whitepaper (+ Prose atom)** — every figure a live chain read or PENDING. **DONE.**
3. ✅ **2.2 Tokenomics (+ SYN reads)** — supply/allocations/prices/burn live; whitepaper PENDINGs flipped. **DONE.**
4. ✅ **2.3 FAQ** (A1) — **SEALED prod** (`1c6a07d`); living chassis + `FaqAccordion`; 39 Q&A number-free;
   FAQPage JSON-LD in server HTML. *(cosmetic `8bc3f1e` batched with next deploy — see DEPLOY DEBT above.)*
5. 🔵 **Support · the DETERMINISTIC floating Guide** (B1 + robot UI) — **NEXT.** Deterministic router:
   FAQ-corpus search + suggested questions + quick-routes to proof surfaces + honest triage; floating
   mascot on our tokens; drop the fake "1" badge. **NO LLM · NO wallet/member awareness** (those → Phase 3).
   src: `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md` + `LIVING_ORGANISM_MASTER_PLAN.md` §6/§11-B.
6. ⬜ **2.4 Docs** (A2) · 7. ⬜ **2.5 Knowledge** (A3) · 8. ⬜ **2.6 Risk** (A4) · 9. ⬜ **2.7 Glossary** (A5)
10. ⬜ **2.8 Roadmap**, registry-driven (A6) · 11. ⬜ **2.9 Protocol-facts** (A7) · 12. ⬜ **2.10 Brand-facts** (A8)
13. ⬜ **2.11 Join / entry-tiers UI** — featured tiers + custom-amount + live read-only quote preview
    (gross → source payment → net → routing) + 5-step flow; figures from chain.
14. ⬜ **Footer IA + sitemap + per-page SEO guards** (A9) — banned-word / no-fake-live / sitemap-leak /
    index-only-real-content guards.
15. ⬜ **Transparency signature pages** — E4 Honesty register · E5 "Never will" charter (cheap content,
    interleave in the content suite). src: `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.

### PHASE 3 — operational activation + the Guide's brain  (MASTER_BUILD_SPEC P3 + Track B2/B3/B4 + E2)
16. ⬜ Prod single-instance / Reserved VM (or externalize sessions) — reliable auth.
17. ⬜ Operator DB + one-time `founder_root` seed.
18. ⬜ Auth enablement + **founder admin ON/OFF toggle** (env break-glass + DB flag, audit-logged, default OFF).
19. ⬜ **Guide security spine** (B2) — isolated endpoint, token-based rate-limit, global budget cap +
    circuit-breaker → deterministic, output forbidden-copy filter, monitoring. **Built BEFORE any LLM.**
20. ⬜ **Guide LLM escalation** (B3) — Groq primary + DeepSeek fallback, RAG-grounded on the content suite,
    degrades to deterministic. Needs #19 + a fuller corpus (#6–#12).
21. ⬜ **Guide user-level awareness** (B4) — visitor/holder/member from verified on-chain state (own wallet
    only). Needs auth (#18). src: `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md` + `LIVING_ORGANISM` §6.
22. ⬜ Live checkout (wallet tx: take seat / acquire SYN).
23. ⬜ Referral: **read** from the deployed source registry (payout stays PAUSED/future-labeled).
24. ⬜ **E2 Living FAQ** — grows from real anonymized Guide questions (needs #20 logging).

### PHASE 4 — admin console + RBAC  (MASTER_BUILD_SPEC P4, unchanged)
25. ⬜ RBAC spine (Founder/Admin/Operator/Auditor/Worker) + step-up.
26. ⬜ Module/plugin registry — activate/deactivate WordPress-style.
27. ⬜ CRUD + graphical tools per module (incl. a **Guide monitoring** panel).
28. ⬜ Admin broadcast + audit log + feature flags. · 29. ⬜ Content management from admin.

### PHASE 5 — the living organism  (backend read-models FIRST, then surfaces · P5 + Track C + Track D non-financial)
30. ⬜ **Event backbone** — indexer → canonical pipeline `EVENT→SIGNAL→MEMORY→CHRONICLE candidate` (the
    read-models). src: `ACTIVITY_HEARTBEAT_READ_MODEL.md` + `LIVING_ORGANISM` §7.
31. ⬜ **C1 · Economy macro** — Protocol Economy Observatory `/economy` (evidence-labeled, not-a-yield-dashboard).
32. ⬜ **C2 · Activity** `/activity` — public aggregate, **recency-truthful, address-safe** pulse over the
    proven heartbeat read-model.
33. ⬜ **C3 · My Economy + cockpit** narrative arc (Identity→Place→Ownership→Momentum→Action→Memory→Proof).
34. ⬜ **C4 · Chronicle** `/chronicle` — memory pipeline + public solemn record (promotion = human act; two
    registers; oldest-first, no feed/casino).
35. ⬜ **C5 · Register** — the census / seat roster.
36. ⬜ **D1 · Internal explorer** (harvest `MiniExplorer`) + extend `known-addresses` labeling (read-only).
37. ⬜ **D4 · Shareable cards / OG** (consent-gated identity; viral) — non-financial.
38. ⬜ **D5 · Verifiable reputation** (multi-axis; never wealth-ranking) — recognition, non-financial.
39. ⬜ **Gamification** (recognition-only) · **Seasons** (protocol-funded prizes, free-entry, anti-Sybil).
    src: `GAMIFICATION_LEGAL_DOCTRINE.md`.

### PHASE 6 — harden & seal (grade-AAA)  (MASTER_BUILD_SPEC P6 + Track E kit)
40. ⬜ Performance (self-host fonts, AVIF/WebP, Brotli/cache, CWV). · 41. ⬜ Indexability (GSC+Bing submit —
    founder action; llms.txt; AEO). · 42. ⬜ Monitoring (web-vitals RUM, Lighthouse CI, privacy analytics).
43. ⬜ Accessibility (WCAG AA / APCA, keyboard, focus, ≥44px). · 44. ⬜ Responsive (320→2560, container
    queries, folding). · 45. ⬜ Security (OWASP, secrets hygiene, rate limits).
46. ⬜ **E3 · "Verify it yourself" kit** — published read scripts. src: `LIVING_ORGANISM` §11-E.

### 🔒 DEFERRED — lawyer-gated identity & income economy (Track D paid tier) — do NOT build before crypto-lawyer sign-off
- 🔒 **D2 · Address labeling service** (verified, pay-to-label, never impersonate) — the strongest income
  stream. src: `LIVING_ORGANISM` §5.
- 🔒 **D3 · Aliases** (ENS-style, sold; tied to seat; non-tradeable).
- 🔒 **D6 · Guide premium tier** (bundle into a recognition tier; the **free Guide stays fully truthful**).
- 🔒 **White-label** truth-first Guide / verification kit (post-MVP, separate business).

**Cross-cutting (design principles, not slices):** Engagement psychology (`LIVING_ORGANISM` §4 — honest
levers only, **recency-truth**) applies to every surface. **E1 "Prove it"** (a verify link on every Guide
answer + every figure) is a standing rule folded into each slice. **Governance is banned** — reframe any
DAO/member-memory track as **permanently non-promoting recognition**, never "awaiting DAO ratification."

## Slice protocol (every step)

Read the real repo → 4-line gate → **wait for founder GO** → build + guards (Replit is the build gate) →
show diff → founder approves → commit + push `main` → tick `DESIGN_ROADMAP` → deploy verdict (🚀 / ✅).
