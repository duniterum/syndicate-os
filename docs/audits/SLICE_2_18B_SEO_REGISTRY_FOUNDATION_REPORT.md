# Slice 2.18B — SEO Registry Foundation (Implementation Report)

> **Slice type:** IMPLEMENTATION, strictly scoped. Foundation only — central SEO
> route registry + derived sitemap.xml + robots.txt update + guard/check script +
> this report. **No** per-route `<head>`/meta rewrite, **no** SSR/prerender, **no**
> JSON-LD, **no** OG redesign, **no** breadcrumbs, **no** scroll-logic changes,
> **no** product-copy changes, **no** change to `/api/source-status`, **no** change
> to unknown-route HTTP behavior, **no** Source/Verified-Introduction activation,
> **no** claim UI. No product behavior changed except the availability of
> `robots.txt` directives and `sitemap.xml`.
>
> **Date:** 2026-06-30 · **Base commit:** `462b2e3` (Slice 2.18F — scroll restoration).
> **Prior context:** 2.18 `72c73c1`, 2.18A audit `838940e`.
> **Canonical origin (founder-directed for this slice):** `https://thesyndicate.money`.

---

## 1. Files changed

| File | Change | Notes |
|---|---|---|
| `artifacts/studio/src/lib/seo-route-registry.ts` | **new** | Single source of truth: types + `seoRouteRegistry` (11 entries) + `CANONICAL_ORIGIN` + helpers (`getSitemapRoutes`, `getRobotsDisallowRoutes`). Dependency-free so Node scripts can load it. |
| `artifacts/studio/scripts/generate-sitemap.ts` | **new** | Derives `public/sitemap.xml` from the registry (INDEX + sitemap=true only). |
| `artifacts/studio/scripts/check-seo-registry.ts` | **new** | Guard: validates registry ↔ router ↔ sitemap ↔ robots. Exits non-zero on any violation. |
| `artifacts/studio/public/sitemap.xml` | **new (generated)** | Derived artifact; do not hand-edit. |
| `artifacts/studio/public/robots.txt` | **modified** | Added operator-route disallows + `Sitemap:` reference (kept `Allow: /`). |
| `artifacts/studio/package.json` | **modified** | Added `seo:generate` and `seo:check` scripts. |
| `docs/audits/SLICE_2_18B_SEO_REGISTRY_FOUNDATION_REPORT.md` | **new** | This report. |

Not touched: `index.html` (no per-route meta rewrite), router/components/scroll logic
(2.18F), `vite.config.ts`, `tsconfig.json`, the api-server (`/api/source-status`
unchanged), product copy, analytics, OG image bytes (`opengraph.jpg` = 47690 bytes,
unchanged).

## 2. Registry design

- TypeScript shape per the founder brief: `SeoRouteType`, `SeoIndexStatus`,
  `SeoChangeFreq`, `SeoRouteEntry { path, routeType, indexStatus, sitemap, title,
  description, canonicalPath, changefreq?, priority?, ogImage?, ownerSurface,
  primaryIntent, primaryCTA?, proofRoute?, notes? }`, plus `CANONICAL_ORIGIN` and
  `DEFAULT_OG_IMAGE`.
- **Single source of truth.** Sitemap and the robots disallow-list are *derived*
  from the registry (via `getSitemapRoutes` / `getRobotsDisallowRoutes`); the guard
  re-checks the on-disk files against the registry so they cannot silently drift.
- **Dependency-free + no imports** so the `.ts` Node scripts load it directly via
  Node 24's native TypeScript support (no `tsx`/`ts-node`, no new dependencies).
  It lives in `src/lib/` so it is typechecked by `tsc`, but is **not yet imported by
  any route component** — per-route consumption is 2.18C.
- The registry contains **every actual route in `src/App.tsx`** (10 explicit + the
  catch-all `*`). Founder-memory routes that do not exist in the app were **not**
  invented (see §9).
- **Origin note:** the brief directs `https://thesyndicate.money`. The current
  `index.html` OG/Twitter tags still hardcode `https://syndicate-os.replit.app`.
  Reconciling that absolute OG URL is a per-route metadata concern **deferred to
  2.18C** — this slice does not rewrite `index.html`.

## 3. Route classification summary (counts by status)

| indexStatus | routes | count | in sitemap |
|---|---|---|---|
| `INDEX` | `/`, `/status` | 2 | yes (2) |
| `PENDING` | `/proof`, `/member`, `/learning`, `/recognition` | 4 | no |
| `INTERNAL` | `/studio`, `/proof-studio`, `/founder`, `/source` | 4 | no |
| `UTILITY` | `*` (catch-all → not-found) | 1 | no |
| **Total** | | **11** | **2** |

By `routeType`: PUBLIC 2, PENDING 4, INTERNAL 4, UTILITY 1.

## 4. Sitemap contents

Origin `https://thesyndicate.money`. Only INDEX + `sitemap===true` routes; `lastmod`
omitted (not fabricated):

- `https://thesyndicate.money/` — changefreq weekly, priority 1.0
- `https://thesyndicate.money/status` — changefreq weekly, priority 0.8

Excluded (correctly): all INTERNAL, PENDING, and the UTILITY catch-all. No dynamic
routes exist, so none are enumerated.

## 5. Robots changes

- Kept `User-agent: *` / `Allow: /` (public crawling preserved; render assets —
  favicon, og image, fonts, JS/CSS — stay crawlable; `/api` is **not** disallowed).
- Added `Disallow:` for the four INTERNAL operator surfaces: `/studio`,
  `/proof-studio`, `/founder`, `/source`.
- Added `Sitemap: https://thesyndicate.money/sitemap.xml`.
- **PENDING routes are deliberately NOT disallowed** in robots — they should receive
  page-level `noindex` later so crawlers can read the noindex; a robots `Disallow`
  would block that. They are simply excluded from the sitemap for now.
- **robots is not a security control.** A disallowed-but-linked URL can still be
  indexed without a snippet. Internal routes still need page-level `noindex`/auth in
  a later slice (2.18C/2.18D).

## 6. Guard / check behavior (`seo:check`)

Dependency-free Node script; exits non-zero and lists every failure. It validates:

1. every literal route in `App.tsx` has a registry entry; the catch-all `<Route>`
   maps to the `*` entry; and no registry route is invented (reverse check).
2. `sitemap===true` only when `indexStatus==="INDEX"`.
3. every non-null `canonicalPath` starts with `/`.
4. every INDEX route has a non-empty title + description **and** a valid canonical.
5. `priority`, when present, is within `[0,1]`.
6. no duplicate paths; no duplicate canonical paths among INDEX routes.
7. `sitemap.xml` exists, is well-formed (xml decl + `<urlset>`), has exactly the
   expected INDEX `loc`s, and no non-INDEX route leaked in.
8. `robots.txt` references the sitemap and disallows every INTERNAL route.

Latest run: **PASS — 51 checks passed; registry (11 routes), sitemap (2 INDEX),
robots OK.**

## 7. Commands run

- `pnpm --filter @workspace/studio run seo:generate` → wrote `public/sitemap.xml`
  (2 INDEX routes).
- `pnpm --filter @workspace/studio run seo:check` → PASS (51 checks).
- `pnpm --filter @workspace/studio run typecheck` → clean (exit 0).
- Read-only `git --no-optional-locks status --short` / `diff --stat` for scope
  verification. No `git add` / `commit` / `reset` were run.

## 8. Soft-404 limitation (recorded, not fixed here)

Unknown routes still return **HTTP 200** with the SPA shell (soft-404). This slice
does not change unknown-route HTTP behavior. The registry/sitemap correctly exclude
unknown routes, but a registry cannot by itself fix a host-level soft-404 — a true
404 status + host fallback verification remains **deferred to 2.18E**. The catch-all
is registered as `UTILITY` so future slices have a single place to attach `noindex`.

## 9. Founder-memory routes NOT present (not added as live)

Per the 2.18A audit, routes such as `/protocol`, `/activity`, `/chronicle`,
`/register`, `/archive`(+`/nft`), `/economy`/`/token`/`/tokenomics`, `/vault`,
`/transparency`, `/members`/`/ranks`/`/chapters`, identity/dynamic routes
(`/member/:id`, `/wallet/:addr`, `/milestone/:id`), and `/knowledge`/`/docs`/`/faq`
do not exist in the app and were **not** added. The Source public *education* page
(distinct from the paused `/source` operator placeholder) is a future route, not
created here.

## 10. Source / Verified-Introduction boundary

`/source` is classified **INTERNAL / NOINDEX**, sitemap=false, robots-disallowed.
Nothing was activated: no source-aware buy path, no claim UI, no referral implication,
`/api/source-status` unchanged. A future public source-education page is recommended
but **report-only** here.

## 11. Deferred

- **2.18C:** per-route `<head>`/meta mechanism (SSR/prerender/build-time HTML/runtime
  head manager) so `title`/`description`/`canonical`/OG can vary per route; page-level
  `noindex` for INTERNAL/PENDING; reconcile `index.html` OG origin
  (`syndicate-os.replit.app` → `thesyndicate.money`); JSON-LD (Organization/WebSite/
  WebPage); promote `/member`/`/proof`/`/learning` to INDEX when they gain real
  content + CTA (registry flip → auto-included in sitemap).
- **2.18D:** dynamic-route policy + identity/privacy rules (no full wallets/PII; invalid
  IDs must 404).
- **2.18E:** true HTTP 404 for unknown routes; live prod header/cache/compression
  verification; confirm host serves `sitemap.xml`/`robots.txt` with correct content-type.
- **2.18L:** verified milestone/Chronicle OG + Article schema (only where data is
  verified).
- **Environment-specific robots:** serve `Disallow: /` (or `X-Robots-Tag: noindex`) on
  preview/dev domains so non-prod builds are not indexed (2.18C/2.18E).
