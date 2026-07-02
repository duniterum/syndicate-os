# Slice 2.18A — Technical SEO Route Registry Audit

> **Slice type:** READ-ONLY / REPORT-ONLY. No SEO changes; the SEO registry is **not**
> created. No edits to routes, UI, API, router, metadata, `robots.txt`, sitemap,
> `index.html`, vite config, server config, package files, analytics, breadcrumbs, scroll
> logic, transaction flows, or product copy. No product behavior changed. Source /
> Verified Introduction not activated; no claim UI; no source-aware public buy path;
> `/api/source-status` untouched. `.agents/` and `attached_assets/` not recreated. This
> slice adds **exactly one** file (this report).
>
> **Date:** 2026-06-30 · **Base commit:** `72c73c1` (Slice 2.18 report committed) · **Prior:** `81ffa00` (2.17). · **Canonical origin (observed):** `https://syndicate-os.replit.app`.
>
> **Purpose:** the precise route-by-route blueprint answering *"if we build
> `src/lib/seo-route-registry.ts` later, exactly what should be in it and why?"* This is a
> **blueprint, not an implementation** — every recommended value below is provisional and
> non-binding until the founder ratifies it in a later slice.
>
> **Grounding:** every "current" claim is from direct inspection this slice (router,
> `index.html`, `robots.txt`, `artifact.toml`, `vite.config.ts`, package manifests,
> `not-found.tsx`) plus a live `curl` soft-404 probe. Where founder-memory routes are
> absent, they are listed separately and nothing is invented.

---

## 1. Executive Verdict

- **Is the repo ready to implement a central SEO route registry?** **Yes — the blueprint is clear and the route set is small and stable (10 routes + catch-all + 2 API routes).** A registry can be implemented cleanly in a later slice. But **implementation must not begin in this slice.**
- **Is more discovery needed first?** **No new discovery is required for the registry itself** — this report is the complete blueprint. One item remains a *live verification* (prod cache/compression + whether the host can return a true 404), which belongs to **Slice 2.18E**, not here.
- **Highest SEO/indexing risk today:** **internal/operator surfaces are publicly indexable while the whole app emits one identical global card.** `/studio`, `/proof-studio`, `/founder`, `/source` currently return `index, follow` with the same title/description/OG as the homepage, and **unknown paths return HTTP 200** (confirmed by live probe) — so crawlers/AI engines can index operator tooling and infinite soft-404 URLs, all sharing one undifferentiated card.
- **What implementation should come next if the founder approves:** a choice between **2.18B (SEO Registry Foundation)** and **2.18F (Scroll Restoration)** — see §16. **Not chosen here; founder decides.**

> **Framing:** This slice is **not** implementation. It is the exact registry blueprint that 2.18B would build from.

---

## 2. Current Base / Git Hygiene

- **`git status --short`:** clean at slice start. Only change this slice introduces is this report.
- **Is 2.18 committed?** **Yes** — `docs/audits/SLICE_2_18_DISCOVERY_NAV_SEO_AI_CONVERSION_ARCHITECTURE.md` is committed (checkpoint `72c73c1`). `docs/audits/` holds **2 tracked files** (2.17 + 2.18) before this report.
- **Files changed by this slice:** one new untracked file — `docs/audits/SLICE_2_18A_TECHNICAL_SEO_ROUTE_REGISTRY_AUDIT.md`. Zero modified/deleted tracked files.
- **No product behavior changed:** confirmed (report-only).
- **`.agents/` / `attached_assets/`:** absent/0-tracked/ignored; not recreated.
- **Lock / checkpoint:** no `.git/index.lock` present. Read-only git only (`status`, `ls-files`); no `add`/`commit`/`reset`. The platform checkpoint commits the report at loop end.

---

## 3. Current Technical SEO Reality (unsoftened)

- **SPA / static `index.html` posture:** Vite React SPA. `main.tsx` does `createRoot(...).render(<App/>)`. **One static `index.html`** is the entire delivered head for every URL.
- **Metadata posture:** **every route shares one global card** — identical `<title>` ("The Syndicate Studio OS"), description, OG, and Twitter tags. **No per-route title/description anywhere.** No head-management library is installed (no `react-helmet`/`next-themes`-for-head/etc.; `next-themes` present is for theming only).
- **Canonical posture:** **none.** No `<link rel="canonical">` on any route.
- **Sitemap posture:** **none.** No `sitemap.xml`, no sitemap route, no generator, no build script (`scripts/` contains only `hello.ts`).
- **Robots posture:** `public/robots.txt` = `User-agent: *` / `Allow: /` (served live, `200`, `text/plain`). **Allow-all, no sitemap reference, no disallows.**
- **noindex / internal posture:** **none.** Global `index, follow`. Internal/operator routes are **indexable**.
- **Dynamic route posture:** **no dynamic routes exist** (no `:param` routes). All routes are static literals.
- **404 / soft-404 posture:** **soft-404 confirmed by live probe** — `GET /` and `GET /this-route-does-not-exist-xyz` returned **identical HTTP 200, Content-Length 70517, same ETag**. `not-found.tsx` renders "404 — Page Not Found" text but the HTTP status is **200**, the page is **indexable** (no noindex), under the `Shell` chrome, and has **no "back to home" link** (only "use the navigation").
- **OG / social posture:** one **global static** card; single `public/opengraph.jpg` (~47 KB, declared 1280×720) at a hardcoded absolute prod URL. Same preview for every URL.
- **JSON-LD / schema posture:** **none** (no `schema.org` structured data; the shadcn `ui/breadcrumb.tsx` `BreadcrumbList` is an unused React component, not JSON-LD).
- **SSR posture:** **none.** No server render / prerender. Non-JS crawlers see only the static shell.
- **Cache / compression posture:** **unverified for production.** The dev probe showed `Cache-Control: no-cache` and no `Content-Encoding` — but that is the **Vite dev server**, not the prod static serve. True gzip/brotli/cache-control belongs to the **live-header check in Slice 2.18E**; not asserted here.
- **Route-ownership posture:** routes derive labels/visibility from the config spine (`modules.ts` → `navigation.ts`), but there is **no SEO/indexing ownership map** — nothing declares which surface owns a route's indexability, canonical, or card.

---

## 4. Complete Route Inventory

From `artifacts/studio/src/App.tsx` (wouter `<Switch>`). **10 explicit routes + 1 catch-all.** `/` uses `PublicLayout`; all others use `Shell`. "Current index/sitemap posture" reflects the *global* `index, follow` + no-sitemap reality (every route is effectively INDEX, none in any sitemap).

| Route | Source | Type | Current index | Rec. index | Current sitemap | Rec. sitemap | Canonical needed | Title needed | Desc needed | OG needed | Schema candidate | AI-answer value | CTA value | Risk if indexed now | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | `PublicHome` + `PublicLayout` | PUBLIC | INDEX (global) | **INDEX** | none | **YES (HIGH)** | yes | yes | yes | route-specific | Organization + WebSite | High | High (4 CTAs) | Low | brand front door |
| `/studio` | `Home` + `Shell` | INTERNAL | INDEX | **NOINDEX/INTERNAL** | none | **NO** | no | (internal) | (internal) | no | none | Low | none | **operator console exposed** | dead-end |
| `/proof` | `ProofDashboard` | PUBLIC (preview) | INDEX | **PENDING→NOINDEX until wired** | none | NO (until wired) | yes (later) | yes | yes | WebPage | High | medium | placeholder data indexed | DESIGN_PREVIEW |
| `/proof-studio` | `ProofStudio` | INTERNAL | INDEX | **NOINDEX/INTERNAL** | none | **NO** | no | (internal) | (internal) | no | none | Low | none | **draft tooling exposed** | disabled forms |
| `/member` | `MemberAccess` | PENDING (gated) | INDEX | **NOINDEX-PENDING now → INDEX when it has content/CTA** | none | NO (until promoted) | yes (when promoted) | yes | yes | WebPage/FAQPage | High (join) | **none (dead-end)** | thin/dead-end page indexed | no CTA today |
| `/founder` | `PlaceholderRoute id=founder` | INTERNAL | INDEX | **NOINDEX/INTERNAL** | none | **NO** | no | (internal) | (internal) | no | none | None | none | **operator surface exposed** | placeholder |
| `/source` | `PlaceholderRoute id=source` | PENDING/INTERNAL (PAUSED) | INDEX | **NOINDEX/INTERNAL** | none | **NO** | no | (internal) | (internal) | no | none | High (concept) | none | **premature source surface** | Verified-Introduction PAUSED |
| `/recognition` | `PlaceholderRoute id=recognition` | PENDING | INDEX | **NOINDEX-PENDING** | none | NO | no | (later) | (later) | no | none | Medium | none | future module indexed empty | FUTURE_MODULE |
| `/learning` | `PlaceholderRoute id=learning` | PENDING | INDEX | **NOINDEX-PENDING → INDEX when content** | none | NO (until content) | yes (later) | yes | yes | FAQPage/WebPage | Medium | none | empty edu page indexed | FUTURE_MODULE |
| `/status` | `SystemStatus` | PUBLIC | INDEX | **INDEX** | none | **YES (MEDIUM)** | yes | yes | yes | WebPage | High (live-vs-pending) | medium | Low | authoritative trust ledger |
| `*` | `not-found` + `Shell` | UTILITY | INDEX (200) | **NOINDEX + true 404** | none | **NO** | no | generic | generic | no | none | None | none (no back-home link) | **soft-404 indexable** | returns 200 |

### 4.1 API routes (api-server, `/api`)

| Route | File | Type | Index | Sitemap | Notes |
|---|---|---|---|---|---|
| `GET /api/healthz` | api-server `routes/` | API/UTILITY | n/a (noindex) | NO | health only |
| `GET /api/source-status` | route `src/routes/sourceStatus.ts`, data `src/data/sourceStatus.ts` | API | n/a (noindex) | NO | powers `/status`; **must not change**. (Brief originally mis-cited `src/sourceStatus.ts`.) |

### 4.2 Founder-memory routes NOT present in repo

| Founder-memory route | Likely future type | Status |
|---|---|---|
| `/protocol` | PUBLIC | not present |
| `/activity` | PUBLIC (anonymized) | not present |
| `/chronicle` | PUBLIC | not present |
| `/register` | PUBLIC | not present |
| `/archive` (+ `/nft`) | PUBLIC / DYNAMIC | not present |
| `/economy`, `/token`, `/tokenomics` | PUBLIC | not present |
| `/vault`, `/liquidity` | PUBLIC (aggregate) | not present |
| `/transparency` (standalone) | PUBLIC | not present (`/proof`+`/status` cover today) |
| `/members`, `/ranks`, `/chapters` | PUBLIC / DYNAMIC | not present |
| `/wallet`, `/my-syndicate`, `/member/:id`, `/wallet/:id`, `/milestone/:id` | DYNAMIC (identity) | not present |
| `/knowledge`, `/docs`, `/faq`, `/whitepaper`, `/risk`, `/roadmap` | PUBLIC | not present |
| `/source` public education | PUBLIC (gated) | not present (only operator placeholder exists) |
| `/labs`, `/admin` | INTERNAL | not present |

---

## 5. Internal / Private / Console Route Audit (must NOT be indexed)

| Route | Why NOINDEX/blocked | Robots disallow enough? | Page-level noindex needed? | Exclude from sitemap? | Auth/private later? |
|---|---|---|---|---|---|
| `/studio` | operator console; not a public destination | No | **Yes** | Yes | consider auth in member/operator phase |
| `/proof-studio` | draft proof tooling, disabled forms | No | **Yes** | Yes | **Yes — operator-only later** |
| `/founder` | founder/operator surface | No | **Yes** | Yes | **Yes — auth later** |
| `/source` | Verified-Introduction PAUSED; premature if public | No | **Yes** | Yes | gated; public *education* page is separate (§17) |
| `*` (404) | error surface | n/a | **Yes (noindex)** | Yes | n/a |

**Rule applied:** robots `Disallow` alone is **not sufficient** for sensitive/internal pages — a disallowed-but-linked URL can still be indexed without a snippet, and robots is public reconnaissance. Internal routes need **page-level `noindex` (or removal from public availability / auth)** *in addition to* (or instead of) robots. Because this is an SPA with no per-route meta today, true page-level `noindex` requires either SSR/prerender for those routes or a head-injection mechanism — a constraint to record now and solve in 2.18C/2.18D.

---

## 6. Public Route Audit (recommended for indexing)

| Route | Intent | Canonical answer | Proof route | Primary CTA | Rec. title | Rec. description | Sitemap priority | changefreq | OG need | Schema |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | brand | "The Syndicate is a proof-first membership protocol; the site is a read-only foundation today." | `/status` | Request a seat | "The Syndicate — Proof-First Membership Protocol" | brand + read-only honesty | **HIGH** | weekly | route-specific | Organization + WebSite |
| `/status` | product / live-vs-pending | "`/status` is the authoritative live-vs-pending ledger; most data is posture-only today." | self / `/api/source-status` | (add Request a seat) | "Status — What's Live vs Pending" | live wiring ledger | MEDIUM | daily/weekly | recommended | WebPage |
| `/proof` *(when wired)* | verify | "Public, auditable proof of protocol facts." | self | Verify | "Proof — Verify The Syndicate" | verification surface | MEDIUM | weekly | recommended | WebPage |
| `/member` *(when promoted)* | join | "Membership is founder-gated; here is how a seat works." | `/status` | Request a seat | "Take Your Seat — Membership" | join education | HIGH | weekly | recommended | WebPage/FAQPage |
| `/learning` *(when content)* | education | "How the protocol works." | `/proof`,`/status` | Learn → Join | "Learn — How The Syndicate Works" | education | MEDIUM | monthly | recommended | FAQPage |

**Intent classes mapped to current/near routes:** brand=`/`; product/status=`/status`; verify=`/proof`; join=`/member`; education=`/learning`; source/introduction-education=future public `/source` education page; token/liquidity/risk/history/members=future routes (§4.2). Each public route must keep **one intent, one proof path, one dominant action** and obey the forbidden-copy boundary (no profit/yield/ROI/dividend/passive-income framing).

---

## 7. Pending / Future Route Audit (exist but should NOT be indexed yet)

| Route | Content status | Why not ready | Rec. status | Keep public but noindex? | Remove from nav? | Slice that makes it indexable |
|---|---|---|---|---|---|---|
| `/proof` | DESIGN_PREVIEW (placeholder data) | no real proof adapters | **NOINDEX-PENDING** | yes (public, noindex) | keep | when proof wired (post-2.27) |
| `/member` | thin placeholder, **no CTA** | no real join content/action | **NOINDEX-PENDING** | yes | keep | 2.18C/2.18J (content+CTA) |
| `/recognition` | placeholder (FUTURE_MODULE) | no content | **NOINDEX-PENDING** | yes | consider hiding | when module built |
| `/learning` | placeholder (FUTURE_MODULE) | no content | **NOINDEX-PENDING** | yes | keep | 2.18I (FAQ/answers) |
| `/source` | placeholder, PAUSED | premature public exposure | **NOINDEX/INTERNAL** | no (internal) | hide from public nav | 2.24 (+ separate education page) |

---

## 8. Dynamic Route Policy

**No dynamic routes exist in the current app** (no `:param`/wildcard data routes; the only wildcard is the catch-all 404). Recorded honestly. The policy below is **forward-looking** for routes named in founder memory but not built:

| Future pattern | Source | Finite? | Verified? | Index now? | Sitemap enumerate? | Canonical | Invalid behavior | OG | Schema | Risk | Slice |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/member/:id` | member data (unwired) | finite-ish | verified-only | **No** | No | self or `/member` | true 404 | default | none/Profile | privacy / scraping | 2.18D |
| `/wallet/:addr` | chain | infinite | public-chain | **No** | No | self | true 404 | default (no full wallet) | none | privacy / abuse | 2.18D |
| `/milestone/:id` | curated | finite | verified | maybe (later) | yes if finite+verified | self | true 404 | dynamic-if-verified | Article | fake-claim risk | 2.18D/2.18L |
| `/chapters/:id` | curated | finite | verified | maybe (later) | yes if finite | self | true 404 | default | none | low | 2.18D |
| `/archive/:id` | ERC-1155 (posture-only) | finite | verified | **No (until wired)** | No | self | true 404 | dynamic-if-verified | Product? (defer) | legal framing | post-2.27 |

**Rule:** index dynamic routes only when **finite + verified**; never enumerate user/identity routes in the sitemap; never expose full wallet addresses or PII; invalid IDs must return a **true 404**, not a 200 placeholder.

---

## 9. Sitemap Blueprint (design only)

- **Source of truth:** the future `src/lib/seo-route-registry.ts` — the sitemap is **derived**, never hand-maintained.
- **Include only `INDEX` routes.** **Exclude** `INTERNAL`, `PENDING`, `NOINDEX`, `REDIRECT`, `API`, `UTILITY`.
- **Dynamic routes:** include only if **finite AND verified** (none qualify today).
- **`robots.txt` must reference the sitemap** (`Sitemap: https://syndicate-os.replit.app/sitemap.xml`).
- **Content-type:** `application/xml`. **Cache-control:** modest TTL appropriate to deploy (e.g. a few hours), set at the static/deploy layer (verify in 2.18E).
- **Validation:** proper XML escaping + schema validity required (guard test, §15).
- **Initial sitemap contents (today's INDEX set):** `/` and `/status` only. `/member`, `/proof`, `/learning` join once promoted from PENDING.
- **Proposed fields:** `loc` (required); `lastmod` (**omit unless reliably derived** — do not fabricate); `changefreq` (optional, low-confidence hint); `priority` (optional, relative only). Recommendation: **omit `lastmod`** until a trustworthy source (git/build time per route) exists; keep `changefreq`/`priority` minimal.

---

## 10. Robots Blueprint (design only)

```
User-agent: *
Allow: /
# public assets must stay crawlable (favicon, og image, fonts)
Disallow: /studio
Disallow: /proof-studio
Disallow: /founder
Disallow: /source
# (do NOT disallow /api here; APIs are non-pages, handled by noindex/headers)
Sitemap: https://syndicate-os.replit.app/sitemap.xml
```

- **Allow** public routes and **all important public assets** (do not block `/opengraph.jpg`, `/favicon.svg`, fonts, JS/CSS — blocking JS/CSS harms rendering for crawlers).
- **Disallow** internal/operator/draft surfaces **as defense-in-depth**, but **do not rely on robots alone** for them — pair with page-level `noindex`/auth (§5).
- **Reference the sitemap.**
- **Environment-specific behavior:** preview/dev domains (e.g. `*.replit.dev`) should serve a **`Disallow: /`** robots (or `X-Robots-Tag: noindex`) so preview builds are not indexed; only the canonical prod domain serves the allow-list above. (Implementation detail for 2.18B; verify reachable env signal.)

---

## 11. Metadata / Canonical / OG Blueprint (design only)

**Per indexable route, define:** `title`, `description`, `canonical`, `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.

**Defaults:**
- **Canonical origin:** `https://syndicate-os.replit.app` (matches the existing absolute OG URL).
- **`og:url`:** canonical origin + route path; **self-canonical** per route (no cross-route canonical collisions — guard in §15).
- **Default OG image:** keep `/opengraph.jpg` as the **fallback**. Standardize new cards to **1200×630** (current asset is 1280×720 — acceptable ratio, but standardize going forward).
- **Route-specific OG:** required for `/` and recommended for `/status`, `/member`, `/proof` once public.
- **Dynamic OG:** allowed **only where data is verified**; never for posture-only values; **no fake/live claims** in any card.
- **SPA constraint (record honestly):** with no SSR/head manager today, per-route `title`/`description`/`canonical`/OG **cannot vary** at HTML-delivery time. 2.18C must choose a mechanism (SSR, prerender, build-time per-route HTML, or a runtime head manager) — runtime head changes help JS-executing crawlers but **not** static-fetch crawlers/preview bots. This is the single biggest implementation decision for metadata.

---

## 12. JSON-LD / Schema Blueprint (design only)

| Schema | Where | Why it helps AI/search | Legal/product risk | Implement when |
|---|---|---|---|---|
| **Organization** | `/` | identity, knowledge-panel, AEO grounding | low | 2.18B/2.18C |
| **WebSite** | `/` | site name + (later) search | low | 2.18B/2.18C |
| **WebPage** | each INDEX route | per-page typing | low | 2.18C |
| **FAQPage** | `/learning` / future `/faq` | AEO answer surfacing | low **if answers stay safe** | 2.18I |
| **BreadcrumbList** | all (once breadcrumbs exist) | wayfinding in SERP/AI | low | after 2.18G |
| **Article/NewsArticle** | Chronicle/milestone (future) | history surfacing | low | when those routes exist |
| **FinancialProduct** | — | — | **HIGH — avoid** (implies investment) | **do not implement** without counsel |
| **Product** | membership (future) | sale rich-results | **HIGH — defer** (sale-wording legal risk) | defer to counsel-reviewed slice |
| **SoftwareApplication** | tools (future) | app rich-results | low | only if tools become real |

Rule: schema must mirror the §8 (2.18) safe answers — **no yield/ROI/dividend/passive-income/investment framing in any structured data.**

---

## 13. Soft-404 / Unknown Route Strategy

**Current (proven):** unknown paths return **HTTP 200 + the SPA shell** (identical bytes/ETag to `/`), and `not-found.tsx` shows "404" text at a 200 status — a classic **soft-404**, currently indexable, with **no back-home link**.

**Recommended future strategy:**
- Serve a **true HTTP 404** for unknown paths **if the static host supports it** (keep SPA routing/rewrite for *valid* routes only). On Replit static serve, the current `artifact.toml` rewrite `/* → /index.html` is what produces the 200; achieving a real 404 needs either host-level 404 support or a known finite allow-list with a 404 fallback — **verify host capability in 2.18E** before committing.
- The 404 page must be **`noindex`**, render helpful recovery (**add a "Back to Home" link** + key nav), and not leak internal labels.
- Preserve SPA client routing for all valid routes (no regression).

**Future verification examples (for 2.18E, not run as fixes now):**
- `curl -I https://syndicate-os.replit.app/this-does-not-exist` → expect `404` (currently `200`).
- `curl -I https://syndicate-os.replit.app/` → expect `200`.
- Browser-load an unknown path → expect 404 page, noindex, recovery link.
- A future route-status script asserts unknown→404 and known→200.

---

## 14. Proposed SEO Route Registry Shape (blueprint only — DO NOT CREATE)

```ts
// src/lib/seo-route-registry.ts  (BLUEPRINT — do not implement in this slice)

export type IndexStatus =
  | "INDEX"        // public, in sitemap, full metadata
  | "NOINDEX"      // reachable but excluded from search
  | "INTERNAL"     // operator/console; noindex + (later) auth
  | "PENDING"      // exists but not ready; noindex until promoted
  | "REDIRECT"     // 3xx to canonicalPath
  | "DYNAMIC";     // param route; policy decides per-id

export type RouteType =
  | "PUBLIC" | "INTERNAL" | "PENDING" | "DYNAMIC" | "UTILITY" | "API" | "RETIRED";

export interface SeoRouteEntry {
  path: string;                 // "/", "/status", "/member/:id"
  routeType: RouteType;
  indexStatus: IndexStatus;
  sitemap: boolean;             // include in sitemap (only ever true when INDEX)
  canonicalPath: string;        // self by default; target if REDIRECT
  title: string | null;         // null for INTERNAL/UTILITY
  description: string | null;
  ogImage: string | null;       // defaults to "/opengraph.jpg"
  twitterImage: string | null;
  schema: Array<"Organization" | "WebSite" | "WebPage" | "FAQPage" | "BreadcrumbList" | "Article">;
  changefreq: "daily" | "weekly" | "monthly" | null;
  priority: number | null;      // 0.0–1.0, relative only
  ownerSurface: string;         // e.g. "transparency" | "identity" | "operator"
  proofRoute: string | null;    // where this route's claims are verifiable
  primaryCTA: { label: string; href: string } | null;
  dynamicPolicy?: {             // only for DYNAMIC
    finite: boolean;
    verifiedOnly: boolean;
    enumerateInSitemap: boolean;
    invalidId: "notfound";      // must 404, never 200 placeholder
  };
  notes?: string;
}

export const CANONICAL_ORIGIN = "https://syndicate-os.replit.app";
```

**Example entries (illustrative values, founder-ratifiable):**

```ts
const REGISTRY: SeoRouteEntry[] = [
  { path: "/", routeType: "PUBLIC", indexStatus: "INDEX", sitemap: true,
    canonicalPath: "/", title: "The Syndicate — Proof-First Membership Protocol",
    description: "A read-only foundation for The Syndicate: verifiable membership and public proof. No protocol data is live yet.",
    ogImage: "/opengraph.jpg", twitterImage: "/opengraph.jpg",
    schema: ["Organization", "WebSite"], changefreq: "weekly", priority: 1.0,
    ownerSurface: "brand", proofRoute: "/status",
    primaryCTA: { label: "Request a seat", href: "/member" } },

  { path: "/member", routeType: "PENDING", indexStatus: "PENDING", sitemap: false,
    canonicalPath: "/member", title: "Take Your Seat — Membership",
    description: "Membership is founder-gated and not live yet; this explains how a seat works.",
    ogImage: "/opengraph.jpg", twitterImage: "/opengraph.jpg",
    schema: ["WebPage"], changefreq: "weekly", priority: 0.7,
    ownerSurface: "identity", proofRoute: "/status",
    primaryCTA: { label: "Request a seat", href: "/member" },
    notes: "Promote to INDEX once it has real content + CTA (2.18C/2.18J)." },

  { path: "/studio", routeType: "INTERNAL", indexStatus: "INTERNAL", sitemap: false,
    canonicalPath: "/studio", title: null, description: null,
    ogImage: null, twitterImage: null, schema: [], changefreq: null, priority: null,
    ownerSurface: "operator", proofRoute: null, primaryCTA: null,
    notes: "Operator console; noindex now, auth later." },

  { path: "/source", routeType: "INTERNAL", indexStatus: "INTERNAL", sitemap: false,
    canonicalPath: "/source", title: null, description: null,
    ogImage: null, twitterImage: null, schema: [], changefreq: null, priority: null,
    ownerSurface: "source", proofRoute: null, primaryCTA: null,
    notes: "Verified Introduction PAUSED; public education page is a SEPARATE future route." },

  // 404 / unknown policy (not a registry row per se):
  // unknown path -> true 404 status + noindex 404 page (see §13).
];
```

> This is **blueprint only.** The file is **not created** in this slice.

---

## 15. Guard / Test Blueprint (design only — do not implement)

- Every route in the router has a registry entry (and vice-versa) — no orphans.
- No `INTERNAL`/`PENDING`/`NOINDEX`/`REDIRECT`/`API`/`UTILITY` route appears in the sitemap.
- Sitemap contains **only** `INDEX` routes.
- `robots.txt` references the sitemap; prod robots allow-list matches registry.
- Every `INDEX` route has non-empty `title`, `description`, and a self `canonicalPath`.
- Canonical origin equals `CANONICAL_ORIGIN`; **no duplicate canonical paths**.
- No Source/claim/referral **activation** copy leaks into any public route/card (forbidden-copy scan).
- No `INTERNAL`/labs/operator route is indexable.
- Soft-404 guard: unknown path returns 404 (no false 200 pass).
- Sitemap XML validates (well-formed + escaped).
- If SSR/prerender is added later, assert metadata appears in **server-delivered HTML**; otherwise **document the SPA limitation explicitly** (runtime head ≠ static-fetch crawler).

---

## 16. Implementation Slice Recommendation (founder approval required — NOT chosen here)

| Option | Scope | Pros | Cons |
|---|---|---|---|
| **A — Slice 2.18B (SEO Registry Foundation)** | create `seo-route-registry.ts`; generate sitemap from it; add `Sitemap:` to robots + internal disallows; add guard tests; **no broad metadata rewrite yet** | addresses the **highest-risk** issues (internal routes indexable, no sitemap) and **surfaces/guards the soft-404** risk — note a true HTTP 404 status needs host-capability verification in 2.18E, so 2.18B alone does not change the 200→404 status; establishes the single source of truth that 2.18C/2.18D/2.18L depend on; mostly additive/low-regression | invisible to end-users short-term; per-route metadata still pending (2.18C); needs the SSR/head decision soon after |
| **B — Slice 2.18F (Scroll Restoration & Navigation Landing QA)** | fix the live "lands mid/bottom" navigation bug; hash + back/forward; mobile drawer close; **no SEO change** | fixes the **only live, user-felt functional defect**; small, contained, independent; immediate UX win | leaves all discovery/indexing debt in place; does not unblock the SEO chain |

**Tradeoff in one line:** 2.18B fixes *invisible-but-compounding discovery/indexing risk and unblocks the SEO chain*; 2.18F fixes *the one bug a human actually feels today*.

**Recommended default (subject to founder approval — not silently chosen):** **2.18F first, then 2.18B.** Rationale: 2.18F is small, low-risk, independent, and removes a live defect on every navigation now (consistent with the §16.2 flag in Slice 2.18); 2.18B is the strategic foundation and should follow immediately. **However**, if the founder's priority is discovery/indexing/AI-traffic architecture over the live UX nit, **2.18B should go first** — it is the natural continuation of this very blueprint. **Founder chooses; this slice does not start either.**

---

## 17. Founder Decisions Needed

| # | Decision | Options | Recommended default |
|---|---|---|---|
| 1 | Build SEO registry now or fix scroll bug first? | 2.18B / 2.18F | **2.18F then 2.18B** (or 2.18B first if discovery is the priority) — founder picks |
| 2 | Internal routes: noindex-only or auth-protected later? | noindex / auth / both | **both** — noindex now (2.18B/C), auth in member/operator phase |
| 3 | Robots block `/studio` `/proof-studio` `/founder` `/source` immediately? | yes / no | **Yes (defense-in-depth)** — but pair with page-level noindex; robots alone insufficient |
| 4 | Sitemap before per-route metadata? | sitemap-first / metadata-first | **sitemap-first** (2.18B) — small INDEX set (`/`,`/status`); metadata in 2.18C |
| 5 | Is SPA acceptable short-term, or evaluate SSR/prerender? | keep SPA / SSR / prerender | **keep SPA short-term**, but **evaluate prerender/SSR in 2.18C** for internal noindex + per-route cards (SPA can't vary head for static-fetch crawlers) |
| 6 | Which public routes deserve custom OG images? | list | **`/` now**; `/status`, `/member`, `/proof` when public; reuse default elsewhere |
| 7 | Should wallet/member dynamic routes ever be indexable? | yes / no | **No** — identity/privacy; NOINDEX, never enumerated, no full wallets (2.18D) |
| 8 | **Should `/source` have a public education route before activation?** | yes / no | **Yes** — a separate **public, NOINDEX-until-ratified** education page (concept only, no claim UI, no activation); the current `/source` placeholder stays INTERNAL |
| 9 | **Should unknown routes return a true 404 if the platform allows?** | yes / no | **Yes** — serve real `404` for unknown paths (keep SPA for valid routes) + noindex 404 page with a recovery link; **verify host capability in 2.18E** first |

---

## 18. Final Recommendation

- **Clean enough to proceed?** **Yes.** Working tree clean, 2.18 committed (`72c73c1`), no stale lock, `/api/source-status` intact. The route set is small and stable and the registry blueprint is complete — ready for an implementation slice **once the founder picks the order**.
- **Exact recommended next founder-approved slice:** **Slice 2.18F (Scroll Restoration)** as the default next step (fix the live bug), **immediately followed by Slice 2.18B (SEO Registry Foundation)** — *or* **2.18B first** if the founder prioritizes discovery/indexing architecture. **Do not start either in this slice.**
- **What must NOT be touched yet:** routes/router, UI/components, `index.html`, `robots.txt`, sitemap (generation), per-route metadata/canonical/OG, JSON-LD, `vite.config.ts`, server/static config, package files, analytics/tracking, breadcrumbs, scroll logic, transaction flows, product copy, `/api/source-status`, Source/Verified-Introduction activation/claim UI, `.agents/`, `attached_assets/`. All remain future, founder-gated slices.

---

## Verification (run for this slice)

- `git status --short` → only `docs/audits/SLICE_2_18A_TECHNICAL_SEO_ROUTE_REGISTRY_AUDIT.md` is new/untracked; 2.17 + 2.18 remain committed; zero modified/deleted tracked files.
- No route/UI/API/config/robots/sitemap/metadata changes; no product behavior changed.
- No `git add`/`commit`/`reset`; read-only git only; no stale lock.
- `.agents/` and `attached_assets/` remain absent/untracked/ignored (not recreated).
- This slice intends, and delivers, exactly one new report file.
