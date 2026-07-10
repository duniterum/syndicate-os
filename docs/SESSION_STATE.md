# SESSION_STATE — read FIRST, every session

Authoritative resume point. **The real repo always wins over any spec.**
Direction specs now live IN this repo: `docs/direction/MASTER_BUILD_SPEC.md` ·
`docs/direction/CONTENT_SUITE_SPEC.md` · `docs/direction/WHITEPAPER_PLAN.md`.
Design tracker: `docs/DESIGN_ROADMAP.md`. Doctrine/roles: `docs/00_START_HERE.md`.

---

## ✅ DECIDED — DO NOT RE-OPEN (settled; do not re-litigate)

- **Phase 1 — CLOSED.** 8 atoms (Amount · StatusPill · Button+Tag · StatCard · Table · Field · Icon).
  Color sprawl **137 → 0**, `no-raw-color` guard **BLOCKING** in the `guards` gate. Fluid `.type-*`
  scale adopted site-wide. Component states + a11y done. (1 documented raw-color exception: QrCodeBlock canvas.)
- **NEXT SLICE = Phase 2.0 — Rendering fix.** It GATES all of Phase 2 (no content page ships before it).
- **2.0 approach — DECIDED (ADR-002): build-time prerender / SSG of the SHELL.** Emit per-route static
  HTML with real `title`/`description`/OG **+ JSON-LD baked into the server HTML** (not JS-injected) +
  a real **404 status**. **NOT runtime SSR** — it breaks with `wagmi ssr:false`. We inject the head/JSON-LD,
  we do **not** prerender the React DOM.
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

- **PHASE 1 → ✅ CLOSED** (see DECIDED above).
- **PHASE 2 — Content + rendering → ⬜ NOT STARTED. Phase 2.0 is next.**
  - No content pages exist yet (whitepaper/tokenomics/token/docs/faq/knowledge/risk/glossary/roadmap/protocol-facts/brand-facts).
  - **Prose atom NOT built** (ships in slice 2.1 with the Whitepaper).
  - Rendering is a **pure client SPA** (Vite + `wouter`, `wagmi ssr:false`, single `index.html` → `dist/public`,
    api-server SPA-fallback). `SeoHeadManager` is client-only. SEO route registry / sitemap / robots infra
    already exist (`artifacts/studio/src/lib/seo-route-registry.ts`) — reuse it as the single source for per-route meta.
- **PHASES 3–6 → ⬜ pending** (auth single-instance/Reserved-VM blocker open; admin/RBAC unseeded; living-protocol
  + gamification unbuilt; perf/a11y/responsive/security audits not run; fonts still Google-CDN).

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

1. **2.0 Rendering fix** — prerender/SSG shell, server HTML meta + JSON-LD, real 404. *(NEXT — the gate.)*
2. **2.1 Prose atom + Whitepaper** — per `docs/direction/WHITEPAPER_PLAN.md` (15 sections; figures live).
3. **2.2 Tokenomics (+ SYN token)** — 1B fixed, 7 buckets (35/25/12/10/8/5/5), burn, 70/20/10; figures live.
4. **2.3 FAQ** · 5. **2.4 Docs** · 6. **2.5 Knowledge base** · 7. **2.6 Risk** · 8. **2.7 Glossary**
9. **2.8 Roadmap** (registry-driven) · 10. **2.9 Protocol-facts** · 11. **2.10 Brand-facts**
12. **2.11 Join / entry-tiers UI** — featured tiers + custom-amount compose + live quote preview
    (gross → source payment → net → 70/20/10) + 5-step flow; read-only; figures from chain.
13. **Footer IA + sitemap + per-page SEO guards** — footer per `CONTENT_SUITE_SPEC`; add banned-word,
    no-fake-live, sitemap-leak, index-only-real-content guards.

## Slice protocol (every step)

Read the real repo → 4-line gate → **wait for founder GO** → build + guards (Replit is the build gate) →
show diff → founder approves → commit + push `main` → tick `DESIGN_ROADMAP` → deploy verdict (🚀 / ✅).
