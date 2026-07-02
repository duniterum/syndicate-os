# Slice 2.18 — Discovery, Navigation, SEO, AI-Traffic & Conversion Architecture Recovery

> **Slice type:** READ-ONLY / REPORT-ONLY. This document changes no product behavior:
> no routes, no UI, no API, no contracts, no guards, no `/api/source-status`, no
> `vite.config.ts`, no `robots.txt`, no sitemap, no metadata, no analytics, no tracking,
> no transaction flows, no package files. It adds exactly one file (this report). It does
> not recreate `.agents/` and does not intentionally add files under `attached_assets/`.
> It does not activate Source / Verified Introduction, does not create claim UI, and does
> not create any source-aware public buy path.
>
> **Date:** 2026-06-30 · **Base commit:** `81ffa00` (Slice 2.17 report committed) · **Repo:** `artifacts/*` monorepo (studio slug `studio` served at `/`; api-server at `/api`; prod `https://syndicate-os.replit.app`).
>
> **Authoring discipline:** Every "current state" claim below is grounded in the actual
> repo files inspected this slice. Where the founder's remembered material is not present,
> it is recorded as **"not present in this repo — external founder doctrine, recover later"**
> and nothing is invented in its place. All "recommended" architecture is **provisional and
> non-binding until the founder ratifies it** in a later slice — this report is not new canon
> and implements nothing.

---

## 1. Executive Verdict

- **Is the next step implementation or another architecture/report slice?** **Another report/architecture slice.** Implementation must stay blocked until the route / indexing / navigation / CTA architecture is mapped and ratified.
- **Is the current repo ready to expand pages?** **No — not safely yet.** The repo is a clean, healthy **client-rendered SPA foundation**, but it has **no discovery substructure**: no sitemap, no per-route metadata/canonical/title, no JSON-LD, no scroll restoration, no breadcrumbs, no SEO/indexing registry, and **internal operator routes are currently indexable**. Adding pages now would multiply these gaps page-by-page and bake in drift.
- **Biggest risk if pages are added now:** **Unmanaged discovery + navigation debt.** Every new route would inherit (a) one identical global `<title>`/description/OG card, (b) indexability of internal/console surfaces, (c) the live scroll-landing defect, and (d) no breadcrumb/wayfinding — producing duplicate-content signals, leaked internal surfaces to crawlers/AI engines, and a worsening "lands mid-page" UX, with no central place to fix any of it.
- **How 2.18 extends 2.17:** Slice 2.17 recovered the **OS + language** problem (what the protocol *is* and how to *speak* about it). Slice 2.18 recovers the **discovery + navigation + conversion** problem (how humans, crawlers, and AI answer-engines *find, move through, understand, and act* on the product). 2.17 answered "what may we say"; 2.18 answers "where does it live, how is it found, and how does a visitor move Discovery → Understanding → Trust → Action → Verification → Share → Return." Both remain **report-only** until the founder ratifies them.

---

## 2. Current Base / Git Hygiene

- **`git status --short`:** clean at slice start (no pending changes). The only change this slice introduces is this report.
- **Is 2.17 committed?** **Yes** — `docs/audits/SLICE_2_17_FULL_OS_LANGUAGE_CONSTITUTION_RECOVERY.md` is **tracked/committed** (checkpoint `81ffa00`). `docs/audits/` now holds **1 tracked file** before this report.
- **Only this report added by this slice?** Yes — verified in §Verification (only `docs/audits/SLICE_2_18_DISCOVERY_NAV_SEO_AI_CONVERSION_ARCHITECTURE.md` is new/untracked).
- **`.agents/`:** absent, **0 tracked**, gitignored.
- **`attached_assets/`:** present on disk but **gitignored, 0 tracked** (holds only the pasted Slice 2.18 brief). Not recreated as tracked content.
- **Stale git lock:** **none present** at slice start (`.git/index.lock` absent). No destructive git used; only read-only git (`status`, `ls-files`) plus normal file write for the report. (Note for history: a transient stale lock appeared during 2.17 from a blocked `git add -n` dry-run; the platform checkpoint cleared it — do **not** attempt `git add`/`commit`/`reset` to clear locks, they are guard-blocked here.)

---

## 3. What Slice 2.17 Established (implications for discovery/nav/conversion)

Highest-risk findings carried forward (not re-derived here), each mapped to its 2.18 consequence:

| 2.17 finding | 2.18 consequence (routes / nav / traffic / conversion) |
|---|---|
| **Doctrine corpus missing from repo** (~70 docs absent; `docs/` has only the phase1 set) | Any answer-engine/FAQ/landing copy must be sourced from code/config (`brand.ts`, `syndicateFacts.ts`, `sourceStatus.ts`, canon), **not** from remembered docs. AI-answer map (§8) is built only from in-repo truth. |
| **Doctrine is code/config/canon-resident** | The future SEO route registry (§6) and answer map (§8) must bind to the existing config spine, not a new parallel canon. |
| **Memory-loss / re-invention drift** | Without a central route/SEO registry, each new page re-invents metadata, indexing, and CTA wording → drift. §6 proposes the registry to stop this. |
| **Source / Verified Introduction boundary (PAUSED, ZERO_SOURCE_ID, registry deployed-not-wired)** | No public source-aware buy path, claim UI, or source dashboard may be designed as live. `/source` stays NOINDEX-candidate, education-only (§5, §8, §12). |
| **Supa / marketplace missing/external** | No Supa/marketplace/commerce routes may be invented; kept in the recovery queue (§15) and reserved-namespace only. |
| **Economy-language risk** | All organic/AI/share copy (§7, §8, §14) must state on-chain facts without profit/yield/ROI/dividend/passive-income framing. |
| **A5 sequencing drift (Member/Activity first = wrong; Registry↔Chain later)** | Confirms discovery/nav/indexing architecture (this 2.18 family) precedes any data/identity wiring; member/wallet pages stay placeholder + NOINDEX-candidate. |
| **Deferred ledger must not be forgotten** | 2.18 refines that ledger into discovery sub-slices (§16) and explains the renumbering rather than silently dropping items. |

---

## 4. Founder External Doctrine Added After 2.17

Treated as **founder-provided product-memory input, not repo-verified truth until reconciled.**

| Founder doctrine item | Present in repo? | Absent/missing? | Code-supported today? | Risk if ignored | Where it belongs later |
|---|---|---|---|---|---|
| SEO / organic / AI-ready traffic as **foundation** (not polish) | Partial (global meta + robots only) | Sitemap, per-route meta, canonical, JSON-LD, SSR all missing | Minimal | Invisible to search + AI engines; duplicate-content signals | 2.18A–2.18C, 2.18I/J |
| Site readable by humans, crawlers, AI engines, Telegram/X, crypto-natives, skeptics, returning + future members | Partial | Per-audience surfaces/cards missing | Static OG only | Misread or unread by key audiences | 2.18I, 2.18L |
| **Scroll-to-top / nav landing defect** (lands bottom/middle) | **Defect present** (no scroll code) | Scroll restoration absent | Bug confirmed in code | Live UX defect on every navigation | **2.18F** |
| Navigation rule (no-hash=top, hash=anchor+offset, back/fwd=restore, deep-link only by design) | Absent | All four behaviors absent | None | Inconsistent landing; broken anchors | 2.18F |
| **Breadcrumbs** + route-family wayfinding | UI primitive exists, **unused** | Breadcrumb usage + family model missing | shadcn `ui/breadcrumb.tsx` available | No wayfinding as routes grow | 2.18G |
| Transaction-step reduction (without hiding legal/proof/risk) | **No transaction code exists yet** | Entire buy/approve/connect flow absent | None | Premature/confusing flows if built ad-hoc | 2.18K |
| Heatmap / CTA / funnel intelligence (privacy-safe) | Absent | No analytics/tracking | None (clean slate) | CTA decisions made blind | 2.18H |
| Organic traffic intent mapping | Absent | Intent map missing | Routes exist to map | Pages with no intent/proof/action | 2.18J |
| AI answer-engine traffic (AEO/GEO) | Absent | Canonical short answers missing | Facts exist in config/canon | AI engines hallucinate or omit | 2.18I |
| Social / share previews (per-route, dynamic) | Single static OG | Per-route + dynamic OG, share components missing | One `opengraph.jpg` | Weak/duplicate previews; no member proof sharing | 2.18L |
| Privacy-safe analytics later | Absent | No event taxonomy | None | No measurement framework | 2.18H |
| No legal/investor hype | Enforced (guards + forbidden-copy) | — | Strong | (already protected) | ongoing |
| Source / Verified Introduction language | Code-supported (PAUSED posture) | Public education page absent | `sourceStatus.ts` posture | MLM/earn drift; premature exposure | 2.24 |
| Activity/Chronicle/Register/Archive distinction | Doctrine-level (2.17), not yet surfaced | Dedicated routes absent | Reserved namespaces in canon | History-layer confusion | 2.22 |

---

## 5. Route Inventory and Surface Classification

Built from `artifacts/studio/src/App.tsx` (wouter `<Switch>`, `base = import.meta.env.BASE_URL`). **Ten explicit routes + one catch-all.** `/` uses `PublicLayout` (document scroll); all others use `Shell` (sidebar + inner `overflow-y-auto` scroll container).

### 5.1 Surface + intent + action

| Route | Source file | Class | State | Primary intent | Owner engine | Current CTA / next action | Dead-end risk |
|---|---|---|---|---|---|---|---|
| `/` | `pages/PublicHome.tsx` (+`PublicLayout`) | public | live (truth-labelled) | brand / discovery | Transparency + Story | 4 CTAs: "Request a seat"→`/member`, "Verify proof"→`/proof`, "View Full Status Hub"→`/status`, "Open Studio OS"→`/studio` | Low |
| `/studio` | `pages/Home.tsx` (`Shell`) | internal/operator | live (no data) | operator overview | cross-engine | sidebar nav; `DataStatusNote` | Medium (no forward CTA) |
| `/proof` | `pages/ProofDashboard.tsx` | public-facing preview | DESIGN_PREVIEW | verification | Transparency | sidebar nav | Medium |
| `/proof-studio` | `pages/ProofStudio.tsx` | internal | draft (DESIGN_PREVIEW) | proof tooling | Transparency | disabled form elements | High (tooling stub) |
| `/member` | `pages/MemberAccess.tsx` | pending (gated) | placeholder (AWAITING_FOUNDER_APPROVAL) | join intent | Identity | **none — no button/CTA** | **High (dead-end)** |
| `/founder` | `PlaceholderRoute id=founder` | internal | placeholder | operator/founder | Governance/Operator | none | High |
| `/source` | `PlaceholderRoute id=source` | pending (gated) | placeholder (SOURCE_INDEXER_NOT_WIRED) | source/introduction | Source | none | High |
| `/recognition` | `PlaceholderRoute id=recognition` | pending | placeholder (FUTURE_MODULE) | recognition | Community/Reputation | none | High |
| `/learning` | `PlaceholderRoute id=learning` | pending | placeholder (FUTURE_MODULE) | education | Story | none | High |
| `/status` | `pages/SystemStatus.tsx` | public | live (dynamic from `/api/source-status`) | live-vs-pending verification | Transparency | sidebar nav | Medium |
| `*` (catch-all) | `pages/not-found.tsx` (`Shell`) | utility | live | error recovery | — | none (no "back home" link verified) | High |

### 5.2 Discovery / indexing / navigation posture (current truth)

> **Global truth:** the app is a **single static `index.html`** SPA. **Every route currently shares the same `<title>`, description, OG/Twitter card, and `robots: index, follow`.** There is **no per-route control of any of these.** Production serves static with a SPA rewrite `/* → /index.html`, so **unknown paths return `200` + index.html**, not a real 404.

| Route | Index posture (actual) | Sitemap posture | Breadcrumb | Scroll/nav risk | AI-answer value | Recommended future treatment |
|---|---|---|---|---|---|---|
| `/` | INDEX (global) | none (no sitemap) | none | leaves long scroll → next route lands offset | High | INDEX; canonical; rich card; primary org schema |
| `/studio` | INDEX (should be INTERNAL) | none | none | Shell scroll model switch | Low | **NOINDEX/INTERNAL** |
| `/proof` | INDEX | none | none | medium | High | INDEX when wired; PENDING noindex meanwhile |
| `/proof-studio` | INDEX (should be INTERNAL) | none | none | medium | Low | **NOINDEX/INTERNAL** |
| `/member` | INDEX | none | none | medium | High (join) | INDEX (education) — but dynamic member data NOINDEX |
| `/founder` | INDEX (should be INTERNAL) | none | none | medium | None | **NOINDEX/INTERNAL** |
| `/source` | INDEX | none | none | medium | High (introduction) | NOINDEX until education page approved |
| `/recognition` | INDEX | none | none | medium | Medium | PENDING noindex until live |
| `/learning` | INDEX | none | none | medium | Medium | INDEX when content exists; PENDING meanwhile |
| `/status` | INDEX | none | none | medium | High (live-vs-pending) | INDEX; strong trust surface |
| `*` | INDEX (returns 200) | none | none | high | None | proper soft-404 + canonical/noindex policy |

### 5.3 API routes (api-server artifact, `/api`)

| Route | File | Class | State | Notes |
|---|---|---|---|---|
| `GET /api/healthz` | api-server `routes/` | API/utility | live | health check only |
| `GET /api/source-status` | api-server `routes/sourceStatus.ts` + `data/sourceStatus.ts` | API | live (POSTURE_ONLY) | 20 null categories, chain 43114; powers `/status`. **Must not change this slice.** |

> **Doc-drift note (honest):** the 2.18 brief cited `artifacts/api-server/src/sourceStatus.ts`; the **actual path is `artifacts/api-server/src/data/sourceStatus.ts`** (route handler at `src/routes/sourceStatus.ts`). No change made — recorded for accuracy.

### 5.4 Founder-memory routes NOT present in repo

These were named in the brief's wayfinding/route-family lists but **do not exist as routes today.** Do not treat as live. Each must be designed against 2.17 language + this report before becoming a route.

| Founder-memory route | Likely future family | Status / note |
|---|---|---|
| `Protocol` | Protocol | not present |
| `Activity` | Activity | not present — public (anonymized) when built |
| `Chronicle` | Chronicle | not present — curated canon |
| `Register` (institutional) | Register | not present — institutional durable record |
| `Archive` / `NFT` (public) | Archive | not present — posture-only artifact layer exists in canon |
| `Economy` | Economy | not present |
| `Token` | Token | not present — SYN facts live in canon |
| `Tokenomics` | Token | not present |
| `Vault` | Vault/Liquidity | not present — wallets pinned server-side only |
| `Liquidity` | Vault/Liquidity | not present |
| `Transparency` (standalone) | Transparency | not present — `/proof` + `/status` cover this today |
| `Members` | Members | not present |
| `Wallet` / `My Syndicate` | Member/Wallet | not present — identity (NOINDEX dynamic when built) |
| `Ranks` | Members | not present |
| `Chapters` | Members | not present |
| `Knowledge` | Knowledge/Docs | not present — `/learning` is the nearest current placeholder |
| `Docs` | Knowledge/Docs | not present (footer shows a "Pending" non-link only) |
| `FAQ` | Knowledge/Docs | not present |
| `Whitepaper` | Knowledge/Docs | not present |
| `Risk` | Knowledge/Docs | not present |
| `Roadmap` | Knowledge/Docs | not present |
| `Source` / `Verified Introduction` (public education) | Source | `/source` exists as placeholder; public education page not present |
| `Labs` / internal | Labs/internal | not present |
| `milestone` | Members | not present |
| dynamic `/member/:id`, `/wallet/:id` | Member/Wallet | not present — dynamic identity routes (NOINDEX policy in 2.18D) |

> The footer (`PublicLayout`) also renders **non-link "Pending" labels** (Source Policy, Archive, Docs, Contact) — honest placeholders, but they are dead text with no destination (discovery gap, not a route).

---

## 6. Technical SEO / Indexing / SSR / Sitemap / Robots Architecture

### 6.1 Current state (grounded)

- **Sitemap:** **none.** No `sitemap.xml`, no sitemap route, no generator.
- **Robots:** `public/robots.txt` = `User-agent: *` / `Allow: /`. Allows all; **does not reference a sitemap**.
- **Canonical:** **none.** No `<link rel="canonical">` anywhere.
- **Route metadata / head strategy:** **none per-route.** All `<meta>` live in the single static `index.html`; identical for every route. No `react-helmet`/head manager (Helmet count = 0).
- **noindex strategy:** **none.** Global `robots: index, follow`; internal/console routes (`/studio`, `/proof-studio`, `/founder`, `/source`) are **currently indexable**.
- **OG / Twitter:** present but **global + static** — one card (title, description, `og:type=website`, `og:image=https://syndicate-os.replit.app/opengraph.jpg` 1280×720, twitter `summary_large_image`). One static `public/opengraph.jpg` (~47 KB). Same preview for every URL.
- **JSON-LD / schema.org:** **none** (`schema.org` count = 0; the `Breadcrumb`/`BreadcrumbList` matches are the unused shadcn `ui/breadcrumb.tsx` component, not structured data).
- **SSR / server-rendered metadata:** **none.** Vite SPA; `main.tsx` does `createRoot(...).render(<App/>)`. Crawlers/AI engines that don't execute JS see only the static `index.html` shell (global tags only); no per-route content or metadata in initial HTML.
- **Dynamic route indexing:** **n/a** — no dynamic routes exist; SPA rewrite makes unknown paths return `200` index.html (soft-404 risk).
- **Sitemap cache:** n/a (no sitemap).
- **Asset / compression / cache posture:** not configured in repo (`vite.config.ts` has no compression plugin; `artifact.toml` production = `serve = "static"`). gzip/brotli/cache-control are whatever the Replit static/deploy layer applies by default → **must be verified via live headers** (Slice 2.18E), not asserted here.
- **Gaps summary:** no sitemap, no canonical, no per-route meta/title, no noindex for internal surfaces, no JSON-LD, no SSR/prerender, no per-route OG, soft-404 on unknown paths, unverified compression/cache.

### 6.2 Proposed target architecture (DESIGN ONLY — do not implement now)

A future **central SEO route registry**, e.g. `src/lib/seo-route-registry.ts`, as the single source of truth that sitemap, head tags, canonical, OG, and indexing all derive from (binds to the existing config spine, not a new canon). Recommended fields per entry:

`path` · `canonical` · `title` · `description` · `indexingStatus` (`INDEX` / `NOINDEX` / `INTERNAL` / `PENDING` / `REDIRECT` / `DYNAMIC`) · `sitemapInclusion` (bool) · `sitemapPriority` · `sitemapChangefreq` · `ogImage` · `twitterImage` · `schemaType` (e.g. `WebPage` / `Organization` / `FAQPage` / `BreadcrumbList`) · `ownerEngine` · `liveStatus` (live/pending) · `routeAliases` · `dynamicRoutePolicy`.

> **Do not build this now.** Implementation is **Slice 2.18B**, and only after the founder approves the route-by-route matrix produced in **Slice 2.18A**. Sitemap must be *derived from* the registry (never hand-maintained), and only generated after approval.

---

## 7. Organic Traffic Doctrine

Each public/future route should serve **one** search intent, link **one** proof path, offer **one** dominant action, and respect the forbidden-copy boundary.

| Intent | Canonical page (current or future) | Question it answers | Proof it links to | CTA | Must NOT imply |
|---|---|---|---|---|---|
| Brand | `/` | "What is The Syndicate?" | `/status`, `/proof` | Request a seat | investment upside |
| Join | `/member` | "How do I take a seat?" | `/status` (what's live) | Request a seat | guaranteed access / returns |
| Verification | `/proof`, `/status` | "What is verifiably real?" | on-chain facts (when wired) | Verify | yield/ROI from proof |
| Token | (future `/token`) | "What is SYN?" | contract addresses, supply facts | Verify contract | profit claim / dividend |
| Liquidity | (future `/liquidity`) | "Where do protocol assets sit?" | wallet facts (aggregate) | Verify | payout pool |
| Risk / legal | (future `/risk`) | "What are the risks/posture?" | `/status` | Read + Join (informed) | safe/guaranteed |
| Protocol education | `/learning` (future Docs/FAQ) | "How does it work?" | `/proof`, `/status` | Learn → Join | financial advice |
| Member / social proof | (future `/members`, member cards) | "Who belongs?" | anonymized counts (when wired) | Join | "holders profit" |
| Chronicle / history | (future `/chronicle`) | "What is the protocol's story?" | curated canon | Read | hype timeline |
| Source / introduction | `/source` (future education) | "What is a verified introduction?" | source posture | Learn (no claim) | MLM / earn / downline |
| Future-module curiosity | `/recognition`, future `/labs` | "What's coming?" | `/status` posture | Follow updates | live when pending |

---

## 8. AI-Ready Traffic / Answer Engine Optimization (AEO / GEO / LLM)

Canonical short answers, built **only** from in-repo truth. Rules: short, factual, legally safe, consistent; no yield/ROI/dividend/passive-income framing; no fake data; mark missing where the repo lacks a fact.

| # | Question | Canonical route/source | Approved short answer | Proof route | Forbidden wording | Missing content |
|---|---|---|---|---|---|---|
| 1 | What is The Syndicate? | `/`, `brand.ts` | An experimental, proof-first membership protocol with on-chain, auditable records; the site is currently a read-only foundation. | `/status` | "investment", "fund" | full public "about" page |
| 2 | What is SYN? | canon (token), 2.17 | SYN is the membership/seat token (fixed supply), an experimental utility/recognition token — not a profit claim. | future `/token` | "share", "dividend", "ROI" | public token page |
| 3 | How do I join? | `/member`, `seatCta` | Membership is founder-gated and **not live yet**; the join path is an honest placeholder until wiring is approved. | `/status` | "buy in", "get returns" | live join flow (intentionally absent) |
| 4 | What happens when I buy? | 2.17, canon | A purchase creates a **receipt and routing record**, not an ownership/return claim; no public buy path is live today. | `/status` | "earn", "payout" | live receipt surface |
| 5 | Where does USDC go? | 2.17 (70/20/10), `sourceStatus.ts` | When live, funds route deterministically across protocol-controlled wallets (the 70/20/10 routing); values are posture-only today. | `/status` | "profit split", "returns" | wired routing data |
| 6 | Is this an investment? | `replit.md` guards | **No.** The Syndicate is not framed as an investment; SYN carries no profit rights, yield, dividends, or guaranteed return. | `/status` | any upside framing | dedicated `/risk` page |
| 7 | What are Activity / Chronicle / Register / Archive? | 2.17 | Activity = live heartbeat/raw ledger; Chronicle = curated canon/memory; Register = institutional durable record; Archive = carried artifact memory. | future routes | conflating them | the four routes themselves |
| 8 | What is the Archive / NFT / artifact layer? | canon (Archive1155) | An on-chain artifact memory layer (ERC-1155); posture-only today, no public mint surface. | `/status` | "buy NFT for upside" | public archive page |
| 9 | What is Source Attribution / Verified Introduction? | `/source`, `sourceStatus.ts` | A record of who introduced whom — a **source attribution**, never a payout; registry is deployed but **not wired**. | `/status` | "referral reward", "downline", "commission" | public education page |
| 10 | Is referral live? | `sourceStatus.ts` | **No.** Public purchases default to ZERO_SOURCE_ID; the one internal test is PAUSED (observability only); no public source-aware path exists. | `/status` | "earn by referring" | — |
| 11 | Where can I verify contracts? | canon contract registry | Contract addresses are pinned in protocol canon on Avalanche (chain 43114); a public verify surface is planned. | future `/token`/`/proof` | — | public contract-verify page |
| 12 | What is live vs pending? | `/status`, `/api/source-status` | `/status` is the authoritative live-vs-pending ledger; most categories are posture-only/awaiting source today. | `/status` | "everything is live" | — |
| 13 | What changed since my last visit? | — | **Missing** — no episodic/"what changed" surface exists (needs indexer + identity). | future `/activity`/`/chronicle` | fabricated activity | the feature itself |
| 14 | How can a member share proof? | — | **Missing** — no share component or member proof card exists yet. | future share cards (§14) | fake/live claims | ShareActions + dynamic OG |

---

## 9. Navigation Ergonomics and Scroll Restoration

### 9.1 Current state (grounded)

- **Scroll restoration defined?** **No.** `scrollTo`, `ScrollRestoration`, `restoreScroll`, `location.hash`, `useScroll` all return **zero matches** in `artifacts/studio/src`.
- **Do route changes scroll to top?** **No.** wouter does not auto-scroll on navigation, and there is no `ScrollToTop` effect. The browser keeps the prior scroll offset across route changes.
- **Hash anchors used?** **No** (no `location.hash` / anchor handling).
- **Sticky header offset?** Header in `PublicLayout` is `sticky top-0 z-50` (h-16 = **64px**). There is **no `scroll-margin-top` / scroll-padding** to offset future anchor jumps under the sticky bar (latent once hash links are added).
- **Mobile drawer landing?** `PublicLayout` uses a shadcn `Sheet`; nav `Link`s inside it have **no explicit close-on-click**, so the drawer can remain open over the new route (latent mobile defect).
- **Long-page → outbound/internal links preserve scroll incorrectly?** **Yes — this is the defect.** `/` (`PublicHome`) is long and uses **document scroll** (`PublicLayout`); console routes use a **different scroll container** (`Shell`'s inner `overflow-y-auto`). Navigating from a scrolled `/` to a `Shell` route (or between routes) leaves the new view at a stale offset → **lands mid/bottom instead of top.**
- **Redirects/retired routes preserve bad scroll?** No redirects/retired routes exist; the catch-all renders under `Shell` (same scroll-model switch).
- **Transaction deep-links intentional?** No transaction routes exist; nothing is intentionally deep-linked.

### 9.2 Likely root cause

**Two compounding causes:** (1) **no scroll-reset on navigation** (wouter + no `ScrollToTop`), and (2) **two different scroll models** — `PublicLayout` scrolls the document; `Shell` scrolls an inner `overflow-y-auto` div inside a `h-[100dvh] overflow-hidden` frame. Switching between them does not reset either, so the destination inherits a stale offset.

### 9.3 Future QA reproduction matrix (for Slice 2.18F — do not fix now)

| # | From | Action | To | Expected | Likely current |
|---|---|---|---|---|---|
| 1 | `/` scrolled to footer | click "Open Studio OS" | `/studio` | top | mid/bottom |
| 2 | `/` scrolled mid | click "Verify proof" | `/proof` | top | offset |
| 3 | `/studio` scrolled | sidebar → `/status` | `/status` | top | offset |
| 4 | any | browser Back | prior route | restore prior scroll | indeterminate |
| 5 | mobile `/` | open drawer → tap nav | new route | drawer closed + top | drawer may stay open, offset |
| 6 | future hash link | click `#section` | anchor | anchor minus 64px sticky offset | n/a (no hash yet) |

### 9.4 Required future behavior (ratify in 2.18F)

- New route **without hash → top**.
- **Hash → anchor** with **sticky-header offset** (~64px).
- **Back/forward → restore** previous scroll where expected.
- **Mobile nav → close drawer + top**.
- **Explicit transaction deep-link → allowed only when intentionally designed.**

> **Future slice: Slice 2.18F — Scroll Restoration & Navigation Landing QA.**

---

## 10. Breadcrumbs and Route-Family Wayfinding

**Current:** shadcn `ui/breadcrumb.tsx` exists but is **never imported or used.** No breadcrumbs anywhere. Wayfinding is limited to `PublicLayout` header nav (Home, Proof, Studio, Status) + the `Shell` sidebar.

**Recommended route-family map (design only):**

| Family | Parent | Child routes (current → future) | Breadcrumb label | Public wording | Visibility |
|---|---|---|---|---|---|
| Home | `/` | — | Home | Home | public |
| Protocol | `/` (future `/protocol`) | learning, future docs | Protocol | Protocol | public |
| Activity | future `/activity` | — | Activity | Activity | public (anonymized) |
| Chronicle | future `/chronicle` | — | Chronicle | Chronicle | public |
| Register | future `/register` | — | Register | Institutional Register | public |
| Archive | future `/archive` | artifact IDs | Archive | Archive | public |
| Economy | future `/economy` | token, liquidity | Economy | Economy | public |
| Token | future `/token` | tokenomics | Token | Token | public |
| Vault / Liquidity | future `/liquidity` | — | Liquidity | Protocol-controlled assets | public (aggregate) |
| Transparency | `/proof`, `/status` | proof-studio (internal) | Transparency | Transparency | public + internal |
| Members | future `/members` | `/member`, wallet, ranks, chapters | Members | Members | public + dynamic |
| Member / Wallet / My Syndicate | `/member` | `/member/:id` (future) | My Syndicate | My Syndicate | identity (NOINDEX dynamic) |
| Knowledge / Docs / FAQ / Risk | future | whitepaper, risk | Docs | Docs | public |
| Source / Verified Introduction | `/source` | education (future) | Source | Verified Introduction | gated education |
| Labs / internal | `/studio`, `/founder`, `/proof-studio` | — | Studio | (internal) | INTERNAL/NOINDEX |

> **Future slice: Slice 2.18G — Breadcrumb + Wayfinding Model.**

---

## 11. CTA and Dead-End Page Architecture

**Principle:** one dominant action per viewport/zone. **Join = primary; Verify = trust; Registry/Token/Liquidity/Docs/Risk = utility; Member/Wallet/My Syndicate = identity; Activity/Chronicle/Register/Archive = memory/history.**

| Route | Primary action | Secondary proof action | Dead-end? | Mobile preserves action? | CTA vs proof clarity | Verdict |
|---|---|---|---|---|---|---|
| `/` | Request a seat | Verify proof / Status | No | Yes (sticky CTA + drawer) | balanced | OK |
| `/studio` | (none forward) | — | **Yes (soft)** | sidebar only | n/a | needs forward CTA |
| `/proof` | (none) | — | Medium | sidebar | n/a | add Join/Status CTA when wired |
| `/proof-studio` | disabled tooling | — | **Yes** | sidebar | n/a | internal; out of public funnel |
| `/member` | **none — no button** | none | **Yes (hard)** | sidebar | n/a | **add primary "Request a seat" affordance / honest next step** |
| `/founder` | none | — | **Yes** | sidebar | n/a | internal |
| `/source` | none | — | **Yes** | sidebar | n/a | add education CTA (no claim) |
| `/recognition` | none | — | **Yes** | sidebar | n/a | "follow updates" CTA |
| `/learning` | none | — | **Yes** | sidebar | n/a | "Learn → Join" CTA |
| `/status` | none | — | Medium | sidebar | n/a | add "Request a seat" CTA |
| `*` (404) | none verified | — | **Yes** | — | n/a | add "Back to Home" |

**Flags:** the placeholder/console routes are nearly all **dead-ends** (no forward CTA); `/member` is the most important offender (it is the *join intent* page yet offers no action). No page currently has *too many* CTAs; `/` (4 CTAs) is acceptable but should keep **one dominant** "Request a seat." No CTA currently risks investor framing (guards hold).

---

## 12. Transaction Step-Reduction Architecture (report only)

**Current truth: there is NO transaction code.** No wallet connect, network switch, USDC approve, buy, verify, share, or liquidity flow exists (`wallet`=0, `buy`=0; `connect`/`approve`/`transaction` matches are all prose/comments). Therefore every path below is **planned/future**, and there is **nothing to shorten yet** — the goal is to design the *minimum safe* flow before it is built, never to retrofit shortcuts.

| Planned action path | Entry points | Required state | Likely steps | Reduce safely? | Must NOT shortcut |
|---|---|---|---|---|---|
| Join / buy SYN | `/member`, hero CTA | wallet + network + approval | many | combine status checks | skip receipt/disclaimer |
| Connect wallet | global | none | 1–2 | persist connection | hide network mismatch |
| Switch network | on connect | wrong chain | 1 | auto-prompt | silent switch |
| Approve USDC | before buy | connected | 1 | clear single approve | bundle approve+buy invisibly |
| Buy preset / custom | `/member` | approved | 1–2 | preset chips | hide amount confirmation |
| Verify transaction | post-buy | tx hash | 1 | deep-link to explorer | fake confirmation |
| Share member proof | post-buy | member | 1 | one-tap share | fabricate/claim data |
| Add / remove liquidity | future `/liquidity` | LP state | many | only if surfaced | imply yield |
| Archive / artifact / mint | future `/archive` | gated | many | defer | "mint for upside" |
| Source / Verified Introduction buy | future, gated | founder ceremony | n/a | **blocked** | any live source-aware path now |

**Rule:** reduce steps only where it removes confusion; never hide risk/legal/proof; no one-click shortcut before wallet, network, amount, approval, and receipt clarity are all safe.

> **Future slice: Slice 2.18K — Conversion Path Step-Reduction Audit.**

---

## 13. Heatmap / CTA / Funnel Intelligence Plan (privacy-safe, report only)

**Do not add analytics, tracking, or dependencies now** (current state: zero analytics/heatmap/funnel code).

**Future first-party, aggregate event taxonomy (proposed):**
`hero_join_click` · `hero_verify_click` · `utility_registry_click` · `utility_token_click` · `utility_liquidity_click` · `connect_wallet_click` · `network_switch_prompt` · `approve_usdc_start` · `approve_usdc_success` · `buy_start` · `buy_success` · `transaction_verify_click` · `share_member_card_click` · `share_milestone_click` · `docs_to_join_click` · `risk_to_join_click` · `source_intro_page_view` · `noindex_pending_route_view` · `route_scroll_depth_25/50/75/100` · `internal_link_landing_top_failure` (only if measurable later).

**Privacy boundaries:** no invasive fingerprinting; no secret wallet tracking beyond user-visible connected-wallet context; no third-party trackers unless founder approves; prefer first-party aggregate events; no tracking on sensitive/internal review surfaces without approval.

> **Future slice: Slice 2.18H — Privacy-Safe CTA / Heatmap Intelligence Plan.**

---

## 14. Share / Social / Telegram / AI Preview Cards

**Current:** one **global static** OG/Twitter card (from `index.html`) + one `public/opengraph.jpg` (1280×720), absolute prod URL. **No** dynamic OG routes, **no** share components (`Share`=0), **no** per-route cards, **no** member/milestone/proof sharing. Telegram/X previews will work but show the **same** card for every URL.

**Recommended (design only):** a canonical default OG image (keep current as fallback); route-specific OG for major public routes (`/`, `/proof`, `/status`, `/member`, future `/token`); **dynamic OG only where data is verified** (never for posture-only values); Telegram-safe preview copy (short, factual, proof-anchored); **no internal labels** in public share cards; **no fake/live claims**; AI-readable one-sentence summaries per route (reuse §8 answers).

> **Future slice: Slice 2.18L — Share / Social / AI Preview Cards.**

---

## 15. Missing Doctrine / External Recovery Queue

Because 2.17 found the remembered corpus missing, this queue tracks external material to recover. **Contents are not invented here** — only founder-provided memory from the briefs is preserved as external doctrine and marked for recovery.

| Missing material | Likely source | Why it matters | Risk if not recovered | Becomes | Priority |
|---|---|---|---|---|---|
| Prior two large TheSyndicate OS prompts | founder records / chat history | Original product intent | re-invention drift | product map / external ref | **High** |
| Old doctrine docs (VISION/NORTH_STAR/canon/etc.) | upstream `duniterum/TheSyndicate`, founder records | Constitutional canon | language/posture drift | repo docs (ratified) | **High** |
| Supa.exchange / Supa tools / marketplace material | founder records | Future utility shape | lost product memory; wrong framing | external ref → maybe docs | Medium (2.25) |
| Prior SEO / organic / AI-traffic discussion | founder records | Discovery foundation | inconsistent SEO architecture | feeds 2.18A–2.18L | **High** |
| Screenshots / founder briefs | founder records | Design intent | UI drift | external ref | Medium |
| Telegram / social style doctrine | founder records | Share voice | off-brand previews | feeds 2.18L | Medium |
| Commerce / package / service doctrine | founder records | Future commerce | premature/unsafe commerce | external ref (2.25) | Medium |
| Old product-memory docs | founder records | Return/identity loops | lost roadmap | repo docs later | Medium |
| Heatmap / CTA ideas | founder records | Conversion intelligence | blind CTA decisions | feeds 2.18H | Low–Med |
| Transaction ergonomics discussions | founder records | Safe step-reduction | unsafe flows | feeds 2.18K | Medium |

---

## 16. Updated Deferred Ledger and Step Order

> **Reconciliation note (not a silent reorder):** Slice 2.17's ledger used coarse buckets `2.18–2.26`. This slice **expands the discovery work into sub-slices `2.18A–2.18L`** and **shifts the product/copy/reconciliation slices to `2.19–2.27`**. Nothing is dropped; items are refined and renumbered, and the one substantive *recommendation* is flagged below (§16.2) rather than silently applied.

### 16.1 Founder-specified sequence (preserved)

| Slice | Scope | Type |
|---|---|---|
| **2.18** | This report only | report-only ✅ (this file) |
| **2.18A** | Technical SEO Route Registry Audit — route-by-route SEO/indexing matrix | report-only |
| **2.18B** | SEO Registry Foundation — create central registry; derive/validate sitemap **after founder approval** | impl (gated) |
| **2.18C** | Public Route Metadata Harmonization — metadata/OG/canonical/noindex | impl (gated) |
| **2.18D** | Dynamic Route Indexing Policy — `/member`,`/wallet`,`/milestone`,`/chapters` index/noindex/canonical | impl (gated) |
| **2.18E** | Compression / Cache / Asset Verification — live header check (brotli/gzip/cache) | verify |
| **2.18F** | Scroll Restoration & Navigation Landing QA — fix bottom/middle landing; hash + back/forward | impl (gated) |
| **2.18G** | Breadcrumb + Wayfinding Model — route-family breadcrumbs + parent links | impl (gated) |
| **2.18H** | Privacy-Safe CTA / Heatmap Intelligence Plan — taxonomy + boundaries; no tracking w/o approval | plan |
| **2.18I** | AI-Ready Answer Map / FAQ Canonicalization — canonical short answers across FAQ/Docs/Home/Risk | impl (gated) |
| **2.18J** | Organic Landing Page Intent Map — one intent / one proof / one action per public route | plan/impl |
| **2.18K** | Conversion Path Step-Reduction Audit — Join/Approve/Buy/Verify/Share/LP/Archive/Source futures | report |
| **2.18L** | Share / Social / AI Preview Cards — OG/Twitter/Telegram/dynamic harmonization | impl (gated) |
| **2.19** | Master Product Map + Page/Action/Language Reconciliation (uses 2.17 + 2.18) | report |
| **2.20** | Copy Migration Guardrails + Lint/Scan Plan | plan |
| **2.21** | Controlled Public Copy Harmonization (safe copy only) | impl (gated) |
| **2.22** | Activity / Chronicle / Register / Archive Pipeline Reconciliation | report/impl |
| **2.23** | My Syndicate / Member OS Reconciliation | report/impl |
| **2.24** | Verified Introduction / Source Attribution Product Boundary (review only; no activation) | report |
| **2.25** | Supa / Tools / Marketplace External Memory Recovery | report |
| **2.26** | Optional Repo Config Cleanup (e.g. unused dangling `@assets` alias) | impl (gated) |
| **2.27** | Registry↔Chain Technical Reconciliation (only after architecture locked) | report/impl |

### 16.2 Proposed adjustment (founder approval required — not applied)

**Recommendation:** consider pulling **2.18F (Scroll Restoration)** earlier (e.g. right after 2.18A), because it is the **only live functional UX defect** in the current build — every other 2.18 slice is *additive architecture*, while 2.18F *fixes an existing bug* affecting all navigation today. **Why surfaced not applied:** the founder explicitly set the order and asked not to silently reorder; the SEO-first sequence is defensible (it establishes the registry that later slices depend on). **Default if no decision:** keep the founder's order as-is.

---

## 17. Founder Decisions Needed

| # | Decision | Options | Recommended default |
|---|---|---|---|
| 1 | Reconstruct missing external doctrine into repo docs? | (a) recover into ratified `docs/` · (b) keep code-canon + reports as canon · (c) hybrid | **(c) hybrid** — code canon is truth; recover language/story/source docs externally first |
| 2 | Build SEO registry before product copy harmonization? | registry-first vs copy-first | **registry-first** (2.18A→2.18B before 2.21) |
| 3 | Which dynamic routes should be indexed? | index member/milestone vs noindex | **NOINDEX dynamic identity routes**; index only static education |
| 4 | Should wallet pages be indexable? | yes / no | **No (NOINDEX)** — identity/privacy |
| 5 | Should member pages be indexable? | static education yes; per-member no | **education INDEX, per-member NOINDEX** |
| 6 | Should protocol-health become a public trust surface? | yes / internal | **Yes** — `/status` already trends public; keep authoritative |
| 7 | Should `/risk` be sitemap-listed? | yes / no | **Yes** — legal/trust transparency |
| 8 | Expand mobile sticky Join/Verify? | yes / no | **Yes, later** (after 2.18F/2.18K), one dominant action |
| 9 | Analytics first-party only? | first-party / third-party | **First-party aggregate only** |
| 10 | Public Verified-Introduction education page before activation? | yes / no | **Yes (education only)**, NOINDEX until ratified; **no activation without ceremony** |
| 11 | **Should Supa / marketplace stay external until recovered?** | keep external / adopt now | **Keep external / reference-only until recovered in Slice 2.25** — material is not in the repo; adopting now would invent product memory |

---

## 18. Final Recommendation

- **Clean enough to proceed?** **Yes** — the base is clean and healthy (working tree clean, 2.17 committed, no stale lock, `/api/source-status` intact at POSTURE_ONLY). It is ready for the **next report/architecture slice**, **not** for product implementation.
- **Exact recommended next slice:** Proceed to a **report-only Slice 2.18A — Technical SEO Route Registry Audit** (route-by-route SEO/indexing matrix), **or** pause for **founder review of 2.17 + 2.18 together** before any implementation. Do not begin 2.18A in this slice.
- **What must NOT be touched yet (until the founder approves the exact next implementation slice):** `/api/source-status`; Source / Verified Introduction activation; transaction/buy/approve/connect paths; UI copy; `robots.txt`; sitemap generation; route metadata / canonical / OG / noindex; analytics / tracking / heatmap; `vite.config.ts`; package files; `.agents/`; `attached_assets/`. No live data wiring, no claim UI, no source-aware public buy path, no scroll/breadcrumb code changes — all remain future, founder-gated slices.

---

## Verification (run for this slice)

- `git status --short` → only `docs/audits/SLICE_2_18_DISCOVERY_NAV_SEO_AI_CONVERSION_ARCHITECTURE.md` is new/untracked; the 2.17 report remains committed; no other tracked changes.
- No `git add`, `git commit`, or destructive git used — read-only git only.
- No product files modified; no existing report modified.
- `.agents/` and `attached_assets/` remain absent/untracked/ignored (not recreated).
- This slice intends, and delivers, exactly one new report file.
