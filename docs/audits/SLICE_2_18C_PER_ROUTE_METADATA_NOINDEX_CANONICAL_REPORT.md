# Slice 2.18C — Per-Route Metadata / Noindex / Canonical Harmonization (Implementation Report)

> **Slice type:** IMPLEMENTATION, strictly scoped. Per-route runtime metadata only.
> **No** SSR/prerender, **no** JSON-LD, **no** OG image/card redesign, **no**
> breadcrumbs, **no** analytics, **no** transaction/source/claim activation, **no**
> change to `/api/source-status`, **no** change to route UI/page copy, **no** scroll
> changes (2.18F preserved), **no** change to unknown-route HTTP status (soft-404
> unchanged — that is 2.18E).
>
> **Date:** 2026-06-30 · **Base commit:** `d80b815` (Slice 2.18B — SEO Registry
> Foundation). **Prior:** 2.18F `462b2e3`, 2.18A audit `838940e`.
> **Canonical origin:** `https://thesyndicate.money`.

---

## 1. Files changed

| File | Change | Notes |
|---|---|---|
| `artifacts/studio/src/components/SeoHeadManager.tsx` | **new** | Dependency-free runtime head manager (renders nothing). |
| `artifacts/studio/src/lib/seo-route-registry.ts` | **modified** | Added pure runtime helpers (`getRobotsDirective`, `toAbsoluteUrl`, `getCanonicalUrl`, `getOgImageUrl`, `normalizeLocation`, `matchRoute`, `resolveRouteHead`) + `TWITTER_CARD_TYPE`; refreshed comments. No route entries changed. |
| `artifacts/studio/src/App.tsx` | **modified** | Mounted `<SeoHeadManager />` inside `<WouterRouter>` (next to `RouteScrollManager`). 2 lines. |
| `artifacts/studio/index.html` | **modified** | Base OG/Twitter origin reconciled to `thesyndicate.money`; added default `og:url`. |
| `artifacts/studio/scripts/check-seo-registry.ts` | **modified** | Guard hardening (robots determinism, catch-all noindex, `/source` lock, broad-disallow guard, index.html origin checks). |
| `docs/audits/SLICE_2_18C_PER_ROUTE_METADATA_NOINDEX_CANONICAL_REPORT.md` | **new** | This report. |

No new dependency was added. `public/sitemap.xml` and `public/robots.txt` are
unchanged (regenerating the sitemap is byte-identical). `opengraph.jpg` unchanged
(47690 bytes — a transient restart re-encode was reverted to the committed bytes).
The api-server and `/api/source-status` were not touched.

## 2. Metadata manager design

- **`SeoHeadManager`** reads the current `wouter` location via `useLocation()`
  (mounted inside `<WouterRouter base=…>` so the base prefix is respected), resolves
  the matching registry entry, and on every navigation upserts: `document.title`,
  `meta[name=description]`, `meta[name=robots]`, `link[rel=canonical]`,
  `og:title/description/url/image`, `twitter:card/title/description/image`.
- **Registry is the single source of truth.** The manager holds no copy strings — it
  calls `resolveRouteHead(location)` which composes the pure helpers. The Node guard
  calls the same `getRobotsDirective`, so runtime and CI cannot disagree.
- **Upsert, don't duplicate.** Each tag is found by selector and updated in place
  (so the base `index.html` tags are overridden, not duplicated); missing tags are
  created and marked `data-seo-managed="true"`. Non-route tags (charset, viewport,
  favicon, fonts, `og:type`, `og:image:width/height`) are never touched.
- **Canonical is removed, not faked, on noindex routes.** `getCanonicalUrl` returns
  `null` for any non-INDEX route, and the manager *removes* a stale canonical so a
  noindex page never inherits the previous route's canonical during SPA navigation.
- **Conservative, dependency-free.** No `react-helmet`/head library was added; the
  manager is a tiny effect. Justification: a single effect over ~12 tags does not
  warrant a dependency, and staying dep-free keeps the helper layer shareable with
  the Node guard.

## 3. Registry fields changed

No `SeoRouteEntry` data changed. Added **behavioral helpers** (all pure, no imports,
so `scripts/*.ts` still load the registry via Node's native TS support) and the
`TWITTER_CARD_TYPE` constant. Comments updated to reflect that the registry is now
consumed at runtime and that the origin is reconciled (the old "deferred to 2.18C"
notes were removed).

## 4. index.html origin reconciliation

- `og:image` and `twitter:image`: `https://syndicate-os.replit.app/opengraph.jpg`
  → `https://thesyndicate.money/opengraph.jpg`.
- Added default `og:url` = `https://thesyndicate.money/`.
- The old deploy origin `syndicate-os.replit.app` no longer appears anywhere in
  `index.html` (guard-enforced).
- **Deliberately did NOT add a hardcoded base `<link rel="canonical">`** to
  `index.html`: a static (non-JS) bot fetching `/status` receives the SPA shell, and
  a hardcoded `/` canonical would mis-canonicalize every deep route to the homepage.
  Canonicals are emitted per route at runtime instead; default title/description/
  robots remain safe homepage defaults.

## 5. Route metadata / status summary

| Route | indexStatus | robots | canonical |
|---|---|---|---|
| `/` | INDEX | `index, follow` | `https://thesyndicate.money/` |
| `/status` | INDEX | `index, follow` | `https://thesyndicate.money/status` |
| `/proof` | PENDING | `noindex, follow` | (none) |
| `/member` | PENDING | `noindex, follow` | (none) |
| `/learning` | PENDING | `noindex, follow` | (none) |
| `/recognition` | PENDING | `noindex, follow` | (none) |
| `/studio` | INTERNAL | `noindex, nofollow` | (none) |
| `/proof-studio` | INTERNAL | `noindex, nofollow` | (none) |
| `/founder` | INTERNAL | `noindex, nofollow` | (none) |
| `/source` | INTERNAL | `noindex, nofollow` | (none) |
| `*` (unknown) | UTILITY | `noindex, nofollow` | (none) |

All routes emit a route-specific `document.title`/`description` and an absolute
`og:image`/`twitter:image` on the canonical origin.

## 6. Noindex behavior for INTERNAL / PENDING / UTILITY

- **INTERNAL** (`/studio`, `/proof-studio`, `/founder`, `/source`) →
  `noindex, nofollow`: kept out of the index entirely; also robots-disallowed
  (2.18B) and not in the sitemap. `/source` (Verified Introduction) stays paused —
  guard now hard-fails if it ever becomes INDEX or sitemap=true.
- **PENDING** (`/proof`, `/member`, `/learning`, `/recognition`) →
  `noindex, follow`: not indexable yet, but links remain crawlable so the page can
  flip to INDEX cleanly once it has real content + CTA. Intentionally NOT
  robots-disallowed (so the future noindex/index decision is crawler-visible).
- **UTILITY** (`*`) → `noindex, nofollow`: unknown routes render the 404 card and are
  never indexed. (The HTTP status is still 200 — true 404 is 2.18E.)

## 7. Commands run

- `pnpm --filter @workspace/studio run seo:check` → **PASS, 79 checks**.
- `pnpm --filter @workspace/studio run seo:generate` → byte-identical sitemap
  (2 INDEX: `/`, `/status`; origin `thesyndicate.money`).
- `pnpm --filter @workspace/studio run typecheck` → clean (exit 0).
- Deterministic `resolveRouteHead` dump for all 11 routes + an unknown route
  (verified robots/canonical/og values).
- Playwright browser QA (see §8).
- Read-only `git --no-optional-locks status/diff` for scope verification. No
  `git add` / `commit` / `reset` were run.

## 8. Guard / typecheck / browser QA results

- **Guard:** `seo:check` PASS — 79 checks (was 51 in 2.18B). New checks: deterministic
  robots directive per route + INDEX⇒index / non-INDEX⇒noindex; catch-all is noindex;
  `/source` stays non-INDEX & out of sitemap; no broad `Disallow: /`; `index.html`
  no longer references the old origin and uses the canonical origin for OG image +
  default `og:url`.
- **Typecheck:** clean (exit 0).
- **Browser QA (Playwright):** **success.** Verified in a real browser on `/`,
  `/status`, `/studio`, `/source`, `/proof`, and an unknown route that
  `document.title`, `description`, `robots`, canonical presence/absence, `og:url`,
  `og:image`, and `twitter:image` match the table in §5; homepage/`/status` use the
  `thesyndicate.money` origin; `/studio`/`/source` are `noindex, nofollow` with
  canonical ABSENT; `/proof` is `noindex, follow` with canonical ABSENT; the unknown
  route renders the visible "404 — Page Not Found" card with title "Page Not Found".
  No runtime React errors; only expected Vite dev-noise in the console. Scroll/nav
  (RouteScrollManager) unaffected.

## 9. SPA limitation / what remains unsolved

- This is **client/runtime metadata** for a client-rendered SPA. It improves browser
  state and JS-executing crawlers (e.g. Googlebot rendering).
- **Static bots that do not execute JS may still read only the base `index.html`.**
  So per-route social/AI link previews (Slack, X, iMessage, many AI fetchers) are
  **not** fully solved by 2.18C — they may show the homepage defaults until a
  server-rendered/prerendered head exists.
- 2.18C is still valuable: it establishes the route-level metadata contract (single
  source of truth + guard), fixes the canonical origin, and makes browser/rendered
  crawler state correct — the foundation any later SSR/prerender will reuse.

## 10. Deferred items

- **SSR / prerender / server-rendered head** for static-bot social/AI previews
  (the real fix for non-JS crawlers).
- **JSON-LD** (Organization / WebSite / WebPage) — intentionally not added here.
- **True HTTP 404** for unknown routes + live header/content-type verification — 2.18E.
- **Promote `/member` / `/proof` / `/learning` / `/recognition` to INDEX** when they
  gain real content + CTA (flip `indexStatus`→INDEX + `sitemap`→true; sitemap & robots
  follow automatically).
- **Environment-specific robots** (`noindex` on preview/dev origins).
- **Page-level auth** for INTERNAL routes (robots/noindex is not access control).
- Optional AST-based route extraction in the guard (deferred as previously agreed).

## 11. Confirmations

- **`/api/source-status` untouched:** api-server has zero changes; studio's existing
  `SystemStatus.tsx` consumer is unchanged.
- **No product UI / copy / transaction behavior changed:** no route component or page
  copy edited; no claim UI, buy path, wallet, or Source/Verified-Introduction
  activation introduced (grep-confirmed in the new/edited SEO files). The only
  user-visible change is per-tab document titles and head metadata.
- **Scroll (2.18F) preserved:** `RouteScrollManager` untouched; browser QA showed no
  navigation/scroll regressions.
- **Hygiene:** `git status` shows only the intended files; `.agents/` and
  `attached_assets/` are gitignored and absent from status; `opengraph.jpg` reverted
  to the committed 47690 bytes; no `.git/index.lock`; no `git add/commit/reset` run.
