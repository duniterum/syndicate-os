# SESSION_STATE — resume here (read FIRST, then 00_START_HERE + CLAUDE.md)

Factual snapshot for the next session. **The real repo always wins over any spec.**
Build plan of record: `MASTER_BUILD_SPEC.md` · `CONTENT_SUITE_SPEC.md` · `WHITEPAPER_PLAN.md`
(these live on the founder's desktop — DIRECTION, not in-repo). Design tracker: `docs/DESIGN_ROADMAP.md`.

## Where we are

**PHASE 1 — Design substrate → ✅ CLOSED.**
- 8 atoms shipped: Amount · StatusPill · Button+Tag · StatCard · Table (DataTable) · Field · Icon.
- Color sprawl **137 → 0**; `no-raw-color` guard is **BLOCKING** and in the `guards` gate
  (`artifacts/studio/guards/no-raw-color.mjs`, cwd-independent, per-line `no-raw-color-allow:` exceptions).
- Fluid type scale `.type-*` adopted on all headings site-wide (~17 pages, Instrument Serif for display/h1/h2).
- Component states + a11y done (Field states; DataTable empty/loading + keyboard-sortable headers).
- Dark-mode `--viz-*` brightening restored. Only 1 documented raw-color exception: QrCodeBlock `#ffffff` canvas.

**PHASE 2 — Content + rendering → ⬜ NOT STARTED. This is next.**
- **No content pages exist** (whitepaper/tokenomics/token/docs/faq/knowledge/risk/glossary/roadmap/protocol-facts/brand-facts).
- **Prose atom NOT built** (it ships in slice 2.1 with the Whitepaper).
- **Rendering is a pure client SPA** — `SeoHeadManager` is client-only (self-documented); SEO route
  registry + sitemap + robots infra already exist, but static/AI bots see only base `index.html`.

**PHASES 3–6 → ⬜ pending** (auth production-dark + single-instance/Reserved-VM blocker open; admin/RBAC unseeded;
living-protocol + gamification unbuilt; perf/a11y/responsive/security audits not run; fonts still Google-CDN).

## The immediate next slice — 2.0 Rendering fix (the gate; do FIRST)

Public pages must be **server-visible** or all content is invisible to Google/social/AI. **Do NOT build
content pages before this.**

**Gate (ADR-002):**
- **Altitude:** CLASSE → build/serve architecture (make public routes server-visible). Unblocks all of Phase 2.
- **Contexte lu:** Vite SPA (`wagmi ssr:false`) + api-server SPA-fallback; `SeoHeadManager` client-only;
  existing SEO route registry / sitemap / robots (`artifacts/studio/src/lib/seo-route-registry.ts`).
- **Si faux (non-surveillé):** wrong serving → broken routes / hydration mismatch on the live site (visible;
  no chain/DB touched). Needs Replit coordination on serving per-route HTML.
- **Fit système:** reuse the SEO route registry for per-route title/description/OG/**JSON-LD** in **static HTML**;
  live figures keep hydrating client-side from the read-only reality spine.
- **Recommended approach:** **prerender / SSG at build time** (NOT runtime SSR) — emit static HTML per public
  route with real meta + JSON-LD + real 404; client hydrates for live numbers. Lowest risk on this SPA+api-server.
  Requires a **Replit serving change** (serve prerendered HTML per path, not one fallback) — founder/Replit handoff.

## Locked decisions (do not re-litigate)
- **Repo wins over spec.** Read the repo, adapt, flag any disagreement.
- **"package" is banned on-site** → use **"entry amount" / "entry tier"**; **extend the forbidden-copy guard**
  (`scripts/guard-forbidden-copy.ts`) to also ban: invest, raised, donation, contribution, package, governance
  weight, equity, APY, dividend, 100x, moon, pump (current guard covers only a subset).
- **Live numbers hydrate client-side; static copy is prerendered.** Every figure reads live from chain/config —
  never hardcoded. Status labels everywhere (VERIFIED / PENDING / FUTURE / PAUSED / FOUNDER-GATED).
- **Link, don't duplicate** existing routes: `/status` `/learn` `/source` `/join` `/member` `/recognition`
  `/archive` `/proof` (contract-memory, os-map).
- **On-site terms (from the repo, not mockups):** The Syndicate · Studio OS · "A Living Protocol" ·
  "On-chain membership protocol." Vocabulary: seat · member · receipt · vault · recognition · chapter · era ·
  chronicle · register · archive · readback · source/verified introduction · proof · verify · "Observe → join when ready."
- **Color meaning (canon):** **Gold = identity/seat/membership · Cyan = live/verification/activity.**
- **Official channels:** X @TheSyndicateOne · Telegram Announcements @TheSyndicateOfficial · Telegram Community @TheSyndicateMoney.
- **Positioning:** business selling access + recognition + services; recognition = loyalty-program (Cumulus/miles);
  SYN = fixed-supply token that trades on a market, price can move, **protocol promises nothing**; legal framing
  (not a security · no profit promise · total loss possible) wherever SYN appears.

## Remaining Phase-2 slices, IN ORDER (from MASTER_BUILD_SPEC — do not re-plan)
1. **2.0 Rendering fix** — prerender/SSG, server HTML meta + JSON-LD, real 404 status. *(GATE — this session's next slice.)*
2. **2.1 Prose atom + Whitepaper** — per `WHITEPAPER_PLAN.md` (15 sections; numbers live from chain).
3. **2.2 Tokenomics (+ SYN token)** — 1B fixed, 7 buckets (35/25/12/10/8/5/5), burn, 70/20/10, supply visual; figures live.
4. **2.3 FAQ**
5. **2.4 Docs** — how it works / join / verify / contracts hub.
6. **2.5 Knowledge base** — by domain (Membership · Routing · SYN · Archive · Source · Proof · Risk).
7. **2.6 Risk**
8. **2.7 Glossary**
9. **2.8 Roadmap** — registry-driven module statuses.
10. **2.9 Protocol-facts** — dry factual for AI/verifiers.
11. **2.10 Brand-facts** — approved one-liner, vocab, official links.
12. **2.11 Join / entry-tiers UI** — featured tiers + custom-amount compose + **live quote preview**
    (gross → source payment → net → 70/20/10) + 5-step flow; read-only preview; figures from chain.
13. **Footer IA + sitemap + per-page SEO guards** — footer grouping per `CONTENT_SUITE_SPEC`; add banned-word,
    no-fake-live, sitemap-leak, index-only-real-content guards.

## Slice protocol (every step)
Read the real repo → 4-line gate → **wait for founder GO** → build + guards (Replit is the build gate) →
show diff → founder approves → commit + push `main` → tick `DESIGN_ROADMAP` → deploy verdict (🚀 / ✅).
