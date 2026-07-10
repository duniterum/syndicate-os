# MASTER BUILD SPEC — The Syndicate OS → grade-AAA production MVP

**The single ordered build plan.** Read WITH: `docs/00_START_HERE.md` (doctrine/roles),
`docs/DESIGN_ROADMAP.md` (design tracker), `CONTENT_SUITE_SPEC.md` (content pages),
`WHITEPAPER_PLAN.md` (whitepaper sections).
**DIRECTION, not dictation:** the real `syndicate-os` repo ALWAYS wins. Before each phase,
Claude Code reads the repo, reports the true current state + the delta vs this spec, and
ADAPTS. Origin / Supa / mockups are inspiration only — never copied raw.

---

## Cross-cutting rules (every slice)
- **Truth-first:** figures read LIVE from chain (never hardcoded) · status labels
  (VERIFIED / PENDING / FUTURE / PAUSED / FOUNDER-GATED) · legal framing wherever SYN appears.
- **Our terms:** read the terms already live in the repo · banned public words (invest,
  yield, return, profit, contribution, package, dividend, passive income, guaranteed,
  governance weight, equity…) · approved words (seat, member, verify, receipt, vault,
  recognition…).
- **Positioning:** business selling access + recognition + services · recognition like a
  loyalty program (Cumulus / miles) · SYN = fixed-supply token that trades on a market
  (price can move, **protocol promises nothing**).
- **Design system:** build on tokens + atoms · no raw color · adopt the type scale ·
  light + dark.
- **Server-visible:** every public page must be crawlable/indexable (Phase 2.0).
- **Guards:** forbidden-copy · no-fake-live · SEO registry · color · lifecycle labels.

## The slice protocol (HOW each step runs)
Read the real repo → propose with the 4-line gate → **wait for founder GO** → build + run
guards (Replit is the build gate) → show the diff → founder approves → commit + push `main`
→ tick `DESIGN_ROADMAP` → give a deploy verdict (🚀 DEPLOY / ✅ NO DEPLOY). One paste, one action.

---

## PHASE 1 — Design substrate  ·  ~4 slices left  ·  IN PROGRESS
Done: Foundation · Amount · StatusPill · Button+Tag · StatCard · Table · Field · Icons (8 atoms).
- [ ] Migrate the hero KPI grid → StatCard/Amount/StatusPill (biggest color-sprawl drop)
- [ ] Migrate PublicHome + TruthLabel → StatusPill
- [ ] Adopt the fluid type scale across all surfaces
- [ ] Color sprawl → 0 → flip the color guard to **BLOCKING**
(Prose atom ships in Phase 2 with the Whitepaper — it needs a real content home.)

## PHASE 2 — Content + rendering foundation  ·  ~13 slices
- [ ] **2.0 Rendering fix (do FIRST):** make public pages **server-visible** (SSR / prerender
      / SSG — Claude Code picks per the real repo). JSON-LD + per-page title/description/OG in
      the **server HTML**, not JS-injected. Real **404 status**. *(Without this, content is
      invisible to Google + social + AI — so it gates the whole phase.)*
- [ ] 2.1 Prose atom + **Whitepaper** (per `WHITEPAPER_PLAN.md`)
- [ ] 2.2 Tokenomics (+ SYN token) · 2.3 FAQ · 2.4 Docs · 2.5 Knowledge base · 2.6 Risk
- [ ] 2.7 Glossary · 2.8 Roadmap · 2.9 Protocol-facts · 2.10 Brand-facts
- [ ] 2.11 **Join / entry-tiers UI** (featured tiers + custom-amount compose + **live quote
      preview**: gross → source payment → net → 70/20/10 + the 5-step flow; read-only preview;
      our terms; figures from chain) — design harvested from the origin, built better
- [ ] Footer IA + sitemap (add `lastmod`, cover all indexable routes) + per-page SEO guards
(Content + footer per `CONTENT_SUITE_SPEC.md`. Adapt origin structure; numbers from chain.)

## PHASE 3 — Operational activation  ·  ~5 slices
- [ ] Prod → single-instance (Reserved VM) **or** externalize sessions (so auth is reliable)
- [ ] Provision operator DB + one-time seed founder_root
- [ ] Auth enablement + **founder admin ON/OFF toggle** (env break-glass + DB flag, audit-logged, default OFF)
- [ ] Live checkout (wallet transaction: take seat / acquire SYN)
- [ ] Referral: **read** from the deployed contract (payout stays PENDING / future-labeled)

## PHASE 4 — Admin console + RBAC  ·  ~5 slices
- [ ] RBAC spine (Founder / Admin / Operator / Auditor / Worker) + step-up for sensitive actions
- [ ] Module/plugin registry — **activate/deactivate like WordPress** (incl. the entry-tiers module)
- [ ] CRUD + graphical tools per module (members, sources, operators, content, modules, broadcast, audit, support, settings)
- [ ] Admin broadcast + audit log + feature flags (adapt from Supa-Exchange)
- [ ] Content management from admin (edit docs/pages without touching code)

## PHASE 5 — Living protocol + gamification  ·  ~9 slices
- [ ] Event backbone: indexer → **Activity feed / Chronicle** → notifications (center + admin)
- [ ] **Register** (institutional memory) · **My Syndicate** cockpit · **Evolution** page (status command center)
- [ ] **"Since You Were Away"** return recap · **share / proof cards**
- [ ] **Economy / GDP** page (Protocol Economy · User/MyEconomy · Treasury composition)
- [ ] **Gamification** (adapt from Supa): XP · badges · quests (learn / verify / refer) · **recognition leaderboard**
- [ ] **Seasons** (9 eras → 9 seasons): read the existing seasons contract → document what
      works in an MD → **protocol-funded prizes**, merkle-snapshot claims (contract rewrite = future)
- [ ] The **AI assistant "robot"** (multilingual, explains the protocol, **no financial advice**)
(Recognition/status only — never money rewards/yield. Prizes protocol-funded, free-to-enter, anti-Sybil.)

## PHASE 6 — Harden & seal (grade-AAA)  ·  ~6 slices
- [ ] **Performance:** self-host fonts (woff2 · font-display swap · preload) · images AVIF/WebP
      + width/height + preload the LCP image · Brotli + immutable cache headers +
      stale-while-revalidate · CDN + HTTP/3 (Claude Code + Replit choose) · keep JS bundle lean
- [ ] **Indexability:** submit sitemap to **Google Search Console + Bing** (FOUNDER action) ·
      llms.txt (optional) · AEO content structure (answer-first, verifiable facts)
- [ ] **Monitoring:** web-vitals RUM · Lighthouse CI (block CWV regressions) · privacy-respecting analytics (Plausible/Umami)
- [ ] **Accessibility:** WCAG AA / APCA contrast · keyboard · focus · hit targets ≥44px · screen reader
- [ ] **Responsive:** fluid · container queries · 320 → 2560 · folding
- [ ] **Security:** OWASP pass · secrets hygiene · rate limits
(CWV targets: **LCP ≤ 2.5s · INP ≤ 200ms · CLS < 0.1**)

---

## Totals
**~42 slices across 6 phases.** 8 design atoms already done; the expensive foundation is built.
Most remaining slices are **small, verified, one-approval-each** — mechanical wiring, not invention.

## Founder-only actions (nobody else can do these)
- Choose Reserved VM (Phase 3) · flip the admin ON/OFF toggles · submit to Google Search
  Console + Bing (Phase 6) · approve each diff · set up CDN / analytics accounts if chosen.

## Ordering logic (why this order)
Understandable before transactable (content before checkout) · server-render before content
(else it's invisible) · reversible before irreversible (auth toggle before any on-chain write)
· the design substrate underpins everything · hardening seals it at the end. Phases can
overlap where safe (Prose bridges 1↔2; auth can advance in parallel).
