# Slice 2.18E — Compression / Cache / Asset / Soft-404 Host Verification (Report)

> **Slice type:** READ-ONLY / REPORT-FIRST. **No repo changes were made except this
> report.** No host/server/config edits, no product/behavior changes.
> **Date:** 2026-06-30 · **HEAD:** `a6b90b5` (2.18C metadata). Prior:
> `d80b815` (2.18B SEO registry/sitemap/robots), `462b2e3` (scroll-reset).
> **Live checks:** safe read-only `curl -I` / `-L` against production. No
> `git add/commit/reset`.

---

## 0. The headline (read this first)

Two origins were probed and **they are two different deployments**:

| Origin | What it actually is | Behaviour |
|---|---|---|
| **`syndicate-os.replit.app`** | **THIS** Replit project (Studio OS SPA), `serve = "static"` autoscale. | **STALE build** (predates 2.18B/2.18C). Soft-404 everywhere. No compression. `cache-control: private` on everything. |
| **`thesyndicate.money`** (founder-directed canonical) | A **separate, server-rendered site** — different product/codebase ("transparent on-chain membership protocol on Avalanche", RSC `data-precedence` markup, its own 24-URL sitemap, its own `robots.txt`, its own brand assets). | True-404s unknown paths; immutable-cached hashed assets. **Does NOT serve this Replit app, our `/status` route, our `sitemap.xml`, or our `opengraph.jpg`.** |

So the canonical origin our SEO foundation points at (`thesyndicate.money`) is **not
this app** today, and our actual deployment (`syndicate-os.replit.app`) is **behind
by two slices**. Neither 2.18B nor 2.18C is live on either probed origin (other
deployment targets were not enumerated). Both facts are founder
decisions to make — this slice only reports them.

---

## 1. Executive Verdict

- **Is production serving the latest SEO foundation?** **No.** `syndicate-os.replit.app`
  serves a build from before 2.18B/2.18C: deployed `index.html` still has the old
  `og:image = https://syndicate-os.replit.app/opengraph.jpg` and **no** `og:url`;
  live `robots.txt` is a 23-byte stub; `sitemap.xml` is not served at all (falls
  through to the SPA shell). The repo files are correct — they just haven't been
  redeployed.
- **Is soft-404 still present?** **Yes**, on the real app. `/`, `/status`, `/studio`,
  `/source`, `/member`, and unknown paths all return **HTTP 200** with the **identical
  1995-byte** shell. Root cause is repo-declared: `artifact.toml` `serve = "static"`
  + rewrite `/* → /index.html`.
- **Is compression enabled?** **No** (on `syndicate-os.replit.app`). No
  `content-encoding` on HTML/JS/CSS even when requesting `br,gzip`; a 414 KB JS bundle
  and 131 KB CSS are served uncompressed.
- **Is cache-control acceptable?** **No.** Everything returns `cache-control: private`
  with `expires ≈ now`, **including fingerprinted `/assets/*`** which should be
  `public, max-age=31536000, immutable`.
- **Are sitemap/robots correct live?** **No** (stale). Repo versions are correct;
  the live ones are the old stub/shell.
- **Is static-bot metadata still limited by SPA?** **Yes** — and worse than 2.18C
  assumed, because the *deployed* base HTML is the pre-2.18C one. Non-JS bots see one
  set of (stale) tags for every route.
- **Is any immediate repo-side fix needed?** **No.** The repo SEO files are already
  correct. The gaps are (a) a **redeploy** (founder action) and (b) **host-level**
  compression / cache / true-404 (out of scope here; options in §12).

## 2. Git / Scope Hygiene

- `git status --short`: working tree was **clean** before this report was created and
  through all live checks; after creating the report, the **only** change is this
  untracked markdown file (no code/config/asset changes; untracked until the founder
  commits).
- `public/opengraph.jpg`: **47690 bytes** (committed size). It drifted once during the
  session from a system-triggered studio restart and was restored read-only
  (`git show HEAD:… > …`); re-verified stable at 47690.
- `.agents/` and `attached_assets/`: in `.gitignore` (lines 52–53), **0 tracked**; no
  `MEMORY.md` or memory artifacts tracked.
- `seo:generate` was run as a verification no-op — it rewrote `sitemap.xml`
  byte-identically (git status stayed clean), confirming sitemap/robots still match
  the registry.
- **Lock note (honest):** `git --no-optional-locks diff --stat` was rejected by the
  main-agent guard (it pattern-matches `.git/index.lock`). This is a guard quirk, not a
  real lock — `git status --short` works and shows a clean tree, which is authoritative
  here. No destructive git op was attempted.

## 3. Production Header Matrix

**A) `syndicate-os.replit.app` — the real app** (request sent `Accept-Encoding: br,gzip`):

| URL | HTTP | content-type | cache-control | content-encoding | etag | content-length | verdict |
|---|---|---|---|---|---|---|---|
| `/` | 200 | text/html | private (expires≈now) | — none — | none | 1995 | stale base HTML |
| `/status` | 200 | text/html | private | none | none | 1995 | **soft-404 shell** |
| `/studio` | 200 | text/html | private | none | none | 1995 | **internal route = 200 shell** |
| `/source` | 200 | text/html | private | none | none | 1995 | **internal route = 200 shell** |
| `/member` | 200 | text/html | private | none | none | 1995 | soft-404 shell |
| `/this-route-…-xyz` | 200 | text/html | private | none | none | 1995 | **soft-404 (identical to `/`)** |
| `/robots.txt` | 200 | text/plain | private | none | none | **23** | **STALE stub** (`User-agent: *` / `Allow: /`) |
| `/sitemap.xml` | 200 | **text/html** | private | none | none | 1995 | **NOT served** → falls to shell (pre-2.18B build) |
| `/opengraph.jpg` | 200 | image/jpeg | private | none | none | **47690** | matches repo; but cache `private` |
| `/assets/index-Boa54jzA.js` | 200 | text/javascript | private | none | none | 414517 | **no compression, no immutable cache** |
| `/assets/index-D7ONwlsk.css` | 200 | text/css | private | none | none | 131120 | **no compression, no immutable cache** |

**B) `thesyndicate.money` — secondary diagnostic (a DIFFERENT, server-rendered deployment — the founder-directed canonical origin in repo metadata, but NOT the host currently serving this app):**

| URL | HTTP | content-type | cache-control | etag | content-length | note |
|---|---|---|---|---|---|---|
| `/` | 200 | text/html | private | — | (SSR page) | different product (Avalanche protocol) |
| `/status` | **404** | text/html | — | — | 6215 | **route absent** on this host |
| `/studio` | **404** | text/html | — | — | 6215 | true-404 |
| `/source` | **404** | text/html | — | — | 6215 | true-404 |
| unknown | **404** | text/html | — | — | 6215 | **true 404** |
| `/sitemap.xml` | 200 | application/xml | private, max-age=3600, s-maxage=86400, swr=604800 | — | 24 URLs | **foreign sitemap** (/token,/join,/vault,…) |
| `/robots.txt` | 200 | text/plain | private | yes | 105 | **foreign robots** (disallows /labs only) |
| `/opengraph.jpg` | **404** | text/html | — | — | 6215 | **our OG path does not exist here** |
| `/assets/styles-CIR7S9zR.css` | 200 | text/css | **private, max-age=31536000, immutable** | yes | 204732 | proper immutable caching + `vary: Accept-Encoding` |
| `/brand-v2-…/syn-og.png` | 200 | image/png | private | yes | 455097 | this site's real OG image |

## 4. Soft-404 Verification

On `syndicate-os.replit.app`, `/` vs an unknown route:

- **Status:** both `200`. **content-length:** both `1995` (byte-identical). **etag:**
  none on either. **Body:** identical SPA shell (`<div id="root">` + the same
  `/assets/index-*.js|css`). **Raw title/meta:** identical (the stale base
  `index.html` — `The Syndicate Studio OS`, `robots: index, follow`, no canonical).
- **Rendered:** 2.18C's runtime 404 card / per-route `noindex` is **not live** (stale
  build). Even once deployed, runtime `noindex` only helps **JS-rendering** crawlers;
  it does **not** change the HTTP status.
- **Conclusion:** this is a genuine **soft-404** (HTTP 200 for non-existent paths).
  Root cause is the repo-declared static rewrite `/* → /index.html` in
  `artifacts/studio/.replit-artifact/artifact.toml`. **True 404 needs a host/server
  capability or prerender/SSR** (a pure static SPA cannot distinguish a valid client
  route from a typo without a route allowlist or server). **Not fixed here** —
  changing the serving model is out of scope.

## 5. Sitemap Live Verification

- **Repo (correct, 2.18B/2.18C):** exists; valid XML; **only the 2 INDEX routes**
  (`/`, `/status`); origin `https://thesyndicate.money`; excludes
  internal/pending/unknown; **no fabricated `lastmod`**. `seo:check` PASS.
- **Live on `syndicate-os.replit.app`:** **not served** — `/sitemap.xml` returns the
  1995-byte SPA shell (`content-type: text/html`). Confirms the deployed build
  predates 2.18B. Will be correct after a redeploy.
- **Cross-host issue (important):** the repo sitemap advertises
  `https://thesyndicate.money/status`, but on the live `thesyndicate.money` site that
  path **404s** (that site has no `/status`). The canonical origin and our route set
  do not currently match the same deployment — a founder reconciliation item, not a
  repo bug.

## 6. Robots Live Verification

- **Repo (correct, 2.18B):** `200`-worthy; disallows `/studio`, `/proof-studio`,
  `/founder`, `/source`; references `Sitemap: https://thesyndicate.money/sitemap.xml`;
  does **not** block assets; **no broad `Disallow: /`**.
- **Live on `syndicate-os.replit.app`:** stale **23-byte** stub — `User-agent: *` /
  `Allow: /` only (no internal disallows, no sitemap reference). Will be correct after
  a redeploy.
- **`thesyndicate.money` (different site):** 105-byte robots disallowing only `/labs`,
  referencing its own sitemap — unrelated to this app.

## 7. Compression Verification

- **`syndicate-os.replit.app`: not enabled.** No `content-encoding` and no `vary:
  Accept-Encoding` on HTML, JS, or CSS even when `Accept-Encoding: br,gzip` is sent.
  The 414 KB JS and 131 KB CSS travel uncompressed (~75–85% transfer savings left on
  the table).
- **`thesyndicate.money`:** assets carry `vary: Accept-Encoding` (compression-aware) —
  but that is a different host/stack.
- **Classification:** **host/platform-controlled** for the current `serve = "static"`
  deployment. **Recommended future fix:** enable Brotli/gzip at the host, or front the
  static build with a small server that runs compression middleware (out of scope;
  §12).

## 8. Cache-Control Verification

- **HTML (`/`):** `cache-control: private`, `expires ≈ now` → effectively not cached.
  Acceptable for freshness, but `private` also blocks shared/CDN caching. **Low.**
- **Fingerprinted `/assets/*.js|css`:** `cache-control: private`, **no `max-age`, no
  `immutable`**. Hashed filenames are safe to cache forever; serving them `private`
  forces revalidation/refetch. **Medium** (perf). For contrast, `thesyndicate.money`
  serves its hashed CSS as `max-age=31536000, immutable`.
- **`opengraph.jpg`:** `private` (no long cache). **Low.**
- **`robots.txt` / `sitemap.xml`:** stale/not-served live, so cache is moot until
  redeploy.
- **API:** not separately re-tested this slice; `/api/source-status` untouched.
- **Fixability:** all host/platform-controlled in a pure static deploy; the repo can
  only influence this by changing the serving model (custom server / platform config)
  — deferred.

## 9. Static Bot / Social Preview Reality

Raw (pre-JS) HTML a non-JS bot/scraper sees today on `syndicate-os.replit.app`:

| Route | title | description | og:url | og:image | robots | canonical |
|---|---|---|---|---|---|---|
| `/` | The Syndicate Studio OS | read-only foundation… | **(absent)** | `…replit.app/opengraph.jpg` | index, follow | **(absent)** |
| `/status` | *(same as `/`)* | *(same)* | absent | *(same)* | index, follow | absent |
| `/studio` | *(same as `/`)* | *(same)* | absent | *(same)* | index, follow | absent |
| unknown | *(same as `/`)* | *(same)* | absent | *(same)* | index, follow | absent |

- A non-JS bot gets **identical, stale, base** metadata for **every** route (the old
  pre-2.18C `index.html`).
- **What 2.18C solves (once deployed):** correct per-route title/description/robots/
  canonical/OG for **JS-rendering** crawlers (e.g. Googlebot render).
- **What remains unsolved:** non-JS static bots / most social + AI link-preview
  fetchers still read base `index.html` only → **per-route social/AI previews require
  SSR/prerender** (a server-rendered head).
- **New consequence to flag:** 2.18C points `og:image`/`og:url`/canonical at
  `https://thesyndicate.money`. That host currently **404s `/opengraph.jpg`** and is a
  different site. So once 2.18C deploys to `syndicate-os.replit.app`, social cards
  would reference an **OG image that 404s** until `thesyndicate.money` actually serves
  this app (or hosts `/opengraph.jpg`). Founder-directed canonical → reported, not
  changed.

## 10. Internal Route Exposure

On `syndicate-os.replit.app`, `/studio`, `/proof-studio`, `/founder`, `/source`:

- **HTTP status:** all `200` with the identical 1995-byte shell (no server-level
  protection; expected for a static SPA).
- **Raw HTML metadata:** the stale base tags (`index, follow`, no canonical) — i.e.
  internal routes currently look indexable to non-JS bots.
- **Live robots disallow:** **not present** (stale 23-byte robots). **Runtime noindex:**
  not live. Both arrive only on redeploy.
- **Sufficiency:** even after redeploy, `robots: Disallow` + runtime `noindex` are
  **not access control** — they discourage indexing, they do not prevent access.
  Page-level auth remains a later slice (no auth added here).

## 11. Asset / opengraph.jpg Stability

- **Repo:** `47690` bytes, stable (one session drift from a studio restart, restored
  read-only). Image URL in repo `index.html` + registry = `https://thesyndicate.money/
  opengraph.jpg`.
- **Live:** `syndicate-os.replit.app/opengraph.jpg` → `200 image/jpeg`, **47690**
  (matches repo), `cache-control: private`. **`thesyndicate.money/opengraph.jpg` →
  404** (different host).
- **Net:** the preview-card image is reachable **only at the Replit origin**, while our
  markup now advertises it at the **canonical origin where it 404s** (see §9). No
  re-encode performed; image untouched.

## 12. Implementation Options for True 404 / Headers (proposals only — do NOT implement now)

**True 404 (soft-404 fix):**
1. **Prerender (SSG)** each known route to a real `*.html` + a `404.html` returned
   with HTTP 404. Fixes true-404 *and* static-bot previews. Largest payoff; needs a
   build step + per-route head.
2. **SSR / server routing** (small Node/Express in front of the build): a route
   allowlist returns `index.html` (200); everything else returns `404.html` (404).
   Also enables compression + cache headers in one place.
3. **Platform custom-404**: depends on whether Replit static hosting supports a
   404-status fallback distinct from the SPA rewrite; if it only supports `/* →
   index.html`, valid client routes would also 404 unless prerendered.
4. **Keep soft-404, rely on runtime `noindex`** (status quo once 2.18C deploys):
   acceptable for JS-rendering crawlers, wrong for HTTP semantics / non-JS bots.

**Compression:** enable Brotli/gzip at the host, or via `compression` middleware in
option (2)'s server.

**Cache:** serve fingerprinted `/assets/*` as `public, max-age=31536000, immutable`
and HTML as `no-cache`/short — achievable via option (2) or a platform asset-cache
setting; a pure static deploy gives the repo little control today.

All of the above touch `artifact.toml` / a new server (use the artifacts skill) →
**explicitly deferred**; this slice changes nothing.

## 13. Recommended Next Slice

**Step 0 (founder action, not a slice): redeploy `syndicate-os.replit.app`** so 2.18B
+ 2.18C actually go live, then re-run §3–§10. Much of what reads "wrong" above is
pure staleness and resolves on redeploy.

Then, with tradeoffs:

- **SSR / prerender investigation (recommended):** single lever that fixes true-404
  (§4), static-bot social/AI previews (§9), *and* gives a clean path to resolve the
  canonical-origin split (§0/§5). Largest effort; highest strategic value.
- **2.18E-FIX (host headers) — fast infra win:** enable compression + immutable asset
  cache (and optionally a 404.html). Small, high ROI, but host-level (artifact.toml /
  small server). Does **not** fix non-JS social previews.
- **2.18L Share / Social / AI Preview:** highest if link-preview quality is the
  priority — but **blocked** by the SPA limitation; effectively requires the
  SSR/prerender work first.
- **2.18G Breadcrumb / Wayfinding** or **2.18I AI Answer Map:** content-layer slices,
  fine to do now **if** the founder accepts current infra (soft-404 + no compression)
  as "good enough" until SSR.

**Suggested order:** redeploy + re-verify → decide between a quick **2.18E-FIX**
(compression/cache now) and committing to the **SSR/prerender** track (the real fix
for 404 + previews + canonical reconciliation).

## 14. Report

- **This file:** `docs/audits/SLICE_2_18E_COMPRESSION_CACHE_SOFT404_HOST_VERIFICATION_REPORT.md`.
- **Repo changes:** **none except this report.** No code, config, product, route,
  sitemap, robots, registry, or asset changes were made.
- **Verification run:** `seo:check` PASS (93 checks); `typecheck` clean;
  `seo:generate` byte-identical (sitemap/robots still match registry);
  `opengraph.jpg` unchanged (47690); `git status --short` shows only this untracked
  report file (no code/config/asset changes). No `git add/commit/reset`.

**Stopped after 2.18E. No next slice started.**
