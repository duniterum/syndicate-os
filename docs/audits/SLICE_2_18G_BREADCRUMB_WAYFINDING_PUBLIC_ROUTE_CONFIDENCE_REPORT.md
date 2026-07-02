# Slice 2.18G — Breadcrumb + Wayfinding + Public Route Confidence (Report)

> **Slice type:** BUILD (small, additive UX/structure layer). **Date:** 2026-06-30
> · **HEAD at start:** `7257c96` (Published). Prior relevant: `eea7b26`
> (Published), `6968aa3` (2.18E host-verification report), `a6b90b5` (2.18C
> per-route metadata), `d80b815` (2.18B SEO registry/sitemap/robots), `462b2e3`
> (scroll-reset, 2.18F).
> **Source of truth reused:** `src/lib/seo-route-registry.ts` (the single SEO/route
> registry). **No second route truth was created.** No `git add/commit/reset`.

---

## 1. Executive Summary

Slice 2.18G adds a small, reusable **wayfinding layer** to the operator console so a
visitor always knows *where they are* and *what kind of surface it is* — without
inventing any new route truth or wiring any data.

- A pinned **`RouteContextBar`** now renders once at the top of every console
  (`Shell`) route: a shallow **Home → current** breadcrumb plus a calm **posture
  chip** (Public / Pending / Internal / Utility) and, where it adds signal, an
  **index-status chip** (Indexed / Noindex / …).
- The **404 / unknown route** page was rebuilt into a **calm recovery surface**
  with safe CTAs (Back to home · View status · Verify proof · Request a seat).
- All breadcrumb labels and posture/index labels are **derived** from the existing
  SEO route registry via new pure helpers — there is **no competing label/route
  map**.
- The public front door (`/`, `PublicLayout`) intentionally gets **no breadcrumb**
  (a single top-level page does not need a Home → Home trail).

**Result:** typecheck clean; `seo:check` 93/93 PASS; `sitemap.xml`, `robots.txt`,
and `index.html` **byte-identical to HEAD**; `opengraph.jpg` unchanged (47 690 B);
no data wired; no forbidden copy introduced.

---

## 2. Scope & Constraints (honoured)

| Constraint | Status |
|---|---|
| Derive wayfinding from the **existing** SEO route registry; no second route truth | ✅ helpers added *inside* the registry, projecting existing fields |
| No transactions / source / analytics / JSON-LD / SSR | ✅ none added |
| Do **not** touch `api-server` or `/api/source-status` | ✅ untouched |
| Do **not** change SEO classifications, robots/sitemap, or `index.html` (unless unavoidable) | ✅ all three byte-identical to HEAD |
| Preserve header / menu / scroll behavior (2.18F) | ✅ bar sits **outside** `[data-scroll-root]`; scroll reset untouched |
| Mobile stays clean | ✅ breadcrumb wraps; secondary index chip hidden below `sm` |
| No copy drift / no forbidden financial copy | ✅ verified (see §11) |
| Read-only doctrine (no live values without a TruthLabel) | ✅ bar shows posture only, never a value |

---

## 3. Git / Scope Hygiene (read-only invariants)

- `git status --porcelain` (tracked) — exactly **3 modified + 1 new**, nothing else:
  - `M artifacts/studio/src/components/layout/Shell.tsx`
  - `M artifacts/studio/src/lib/seo-route-registry.ts`
  - `M artifacts/studio/src/pages/not-found.tsx`
  - `?? artifacts/studio/src/components/RouteContextBar.tsx`
  - (plus this untracked report; `.agents/` & `attached_assets/` remain untracked as before)
- `sitemap.xml` vs HEAD → **IDENTICAL**. `robots.txt` vs HEAD → **IDENTICAL**.
  `index.html` vs HEAD → **IDENTICAL**.
- `opengraph.jpg` → **47 690 bytes** (unchanged; restored-read-only invariant holds).
- No `git add` / `commit` / `reset` performed by this slice.

---

## 4. Design Decision & Architecture

**One injection point, not page-by-page.** Every console route in `App.tsx` is
wrapped in `<Shell>`, whose right pane already had a single scroll container
(`[data-scroll-root]`). The bar is injected **once** in `Shell`, as a sibling
**above** that scroll container:

```
<div class="flex-1 flex flex-col …">      ← console right pane
  <div class="absolute inset-0 …gradient" /> (unchanged)
  <RouteContextBar />                       ← NEW: pinned, shrink-0, z-10
  <div data-scroll-root> {children} </div>  ← unchanged (scroll + per-page h-full intact)
</div>
```

Why **above** the scroll root rather than inside it:

- The 2.18F `RouteScrollManager` resets `[data-scroll-root]` on navigation. Putting
  the bar outside that node means scroll-reset behavior is **completely unaffected**.
- Pages render `h-full` layouts inside the scroll root; keeping the bar outside means
  no page layout had to change (no per-page edits, no overflow surprises).
- The bar becomes a **pinned context strip** — it stays put while content scrolls,
  which is the desired wayfinding affordance.

**Home (`/`) is excluded by construction** — it uses `PublicLayout`, not `Shell`,
so it never receives the bar. This satisfies "simplify on home": a single-level
front door does not need a breadcrumb.

---

## 5. What Changed (files)

1. **`src/lib/seo-route-registry.ts`** — appended a pure, dependency-free
   **"Wayfinding helpers"** block (no edits to existing entries/fields/helpers):
   - `getRoutePostureLabel(entry)` → `RoutePosture` projected from `routeType`.
   - `getRouteIndexLabel(entry)` → `RouteIndexLabel` projected from `indexStatus`.
   - `getRouteLabel(entry)` → short label derived from the SEO `title` (text before
     a separating em/en dash; falls back to the full title).
   - `getRouteSeoByPath(location)` → named alias over `matchRoute`.
   - `getRouteBreadcrumb(location)` → `{ home, current, posture, indexLabel, isHome,
     isNotFound }` — the one call the bar consumes.
2. **`src/components/RouteContextBar.tsx`** (NEW) — the wayfinding strip; uses the
   existing `ui/breadcrumb` primitives + `ui/badge`, wouter `useLocation`/`Link`.
3. **`src/components/layout/Shell.tsx`** — import + render `<RouteContextBar />`
   above `[data-scroll-root]` (2 lines; scroll container untouched).
4. **`src/pages/not-found.tsx`** — rebuilt as a calm recovery card with 4 safe CTAs.

No other files touched. The registry stays Node-loadable (the `seo:check` /
`seo:generate` scripts import it directly), so the new exports do not break them.

---

## 6. The Wayfinding Model (how labels/posture are derived)

**No new data was added to the registry.** Every displayed value is a deterministic
projection of fields that already existed:

- **Breadcrumb label** = `title` split on a spaced em/en dash, first segment.
  e.g. `"Status — What's Live vs Pending"` → **Status**; `"Take Your Seat —
  Membership"` → **Take Your Seat**; `"Recognition"` (no dash) → **Recognition**.
- **Posture** (`routeType` → label): `PUBLIC→Public`, `PENDING→Pending`,
  `INTERNAL→Internal`, `UTILITY→Utility` (`API`/`RETIRED→Internal`,
  `UNKNOWN→Utility`).
- **Index status** (`indexStatus` → label): `INDEX→Indexed`, `NOINDEX→Noindex`,
  `INTERNAL→Internal`, `PENDING→Pending`, `REDIRECT→Noindex`, `UTILITY→Utility`.
- **Trail shape** is intentionally shallow (Home → current) because the route table
  is flat — there are no nested segments to model.

**Redundancy guard:** the index chip renders **only when it differs from the posture
chip**. For Internal/Pending/Utility routes the two axes coincide, so a second
identical chip would read as debuggy noise; it is suppressed. It appears for public
routes where it adds real signal (e.g. `/status` → **Public** + **Indexed**).

---

## 7. Route-by-Route Behavior

| Route | Layout | Breadcrumb | Posture chip | Index chip |
|---|---|---|---|---|
| `/` | PublicLayout | *(none — by design)* | — | — |
| `/status` | Shell | Home → Status | Public | Indexed |
| `/proof` | Shell | Home → Proof | Pending | *(suppressed = posture)* |
| `/member` | Shell | Home → Take Your Seat | Pending | *(suppressed)* |
| `/learning` | Shell | Home → Learn | Pending | *(suppressed)* |
| `/recognition` | Shell | Home → Recognition | Pending | *(suppressed)* |
| `/studio` | Shell | Home → Studio OS | Internal | *(suppressed)* |
| `/proof-studio` | Shell | Home → Proof Studio | Internal | *(suppressed)* |
| `/founder` | Shell | Home → Founder | Internal | *(suppressed)* |
| `/source` | Shell | Home → Source | Internal | *(suppressed)* |
| unknown (`*`) | Shell | Home → Page Not Found | Utility | *(suppressed)* |

The breadcrumb's **Home** crumb is always a live link back to `/`, giving every
console route a one-click path to the public front door.

---

## 8. Honesty / Truth-Label Posture

- The bar communicates **wiring posture only** — it never renders a protocol value,
  count, balance, or any data. It is consistent with the read-only doctrine.
- Posture vocabulary here is **route-level** (Public/Pending/Internal/Utility) and is
  deliberately kept **separate** from the source-status `PostureBadge` enum
  (`READ_ONLY_PROOF`, `NOT_WIRED`, …). The two systems answer different questions
  (route posture vs source-wiring posture) and are not conflated.
- Existing per-page `TruthLabel` / `DataStatusNote` content is unchanged; the bar is
  additive context, not a replacement.

---

## 9. Public-vs-Internal Confidence & Not-Found Recovery

- **Public confidence:** indexable public surfaces read as polished and reassuring —
  `/status` shows **Public · Indexed**; nothing looks technical/debuggy.
- **Internal honesty:** operator routes clearly read **Internal**; pending modules
  read **Pending** — calm, no alarm language.
- **Calm recovery (404):** an unknown route now lands on a composed card —
  "*This route isn't part of the foundation … Nothing is broken — pick a live
  surface below*" — with four safe CTAs: **Back to home** (`/`), **View status**
  (`/status`), **Verify proof** (`/proof`), **Request a seat** (`/member`, the
  canonical `seatCta`). Combined with the bar's Home crumb, an unknown URL has
  multiple one-click exits to real surfaces.

---

## 10. QA & Verification

- **Typecheck:** `pnpm --filter @workspace/studio run typecheck` → **clean** (run
  twice; once after the refinement). `build` intentionally not used from shell.
- **SEO guard:** `pnpm --filter @workspace/studio run seo:check` → **93 checks
  passed; PASS** (registry 11 routes, sitemap 2 INDEX, robots OK).
- **Sitemap stability:** `seo:generate` re-run; `sitemap.xml` / `robots.txt` /
  `index.html` diff vs HEAD → **IDENTICAL** (the wayfinding additions do not touch
  sitemap/robots/canonical inputs).
- **Read-only asset:** `opengraph.jpg` = **47 690 bytes** (unchanged).
- **Browser console:** only Vite HMR + the React DevTools notice — **no errors**.
- **Visual QA (desktop + mobile 402×874):** `/studio` (Internal, single chip),
  `/status` (Public + Indexed), `/proof` mobile (Pending; secondary chip hidden,
  clean), `/this-route-does-not-exist` (Utility + recovery CTAs), `/` (no bar). All
  render as designed in dark mode.

---

## 11. Doctrine / Forbidden-Copy Compliance

- No forbidden financial terms (profit, yield, return, payout, passive income,
  rewards, airdrop, jackpot, betting, etc.) appear in any added copy. The only new
  copy strings are wayfinding labels, the 404 recovery sentence, and CTA labels —
  all neutral and reusing the existing `seatCta` ("Request a seat").
- Visual direction preserved: premium/institutional, deep navy + cyan accent,
  calm — chips are subtle and dual-mode (light + `dark:`).
- No new inline status literals were introduced into `PublicHome.tsx`; homepage
  governance is untouched (the bar never appears on `/`).

---

## 12. Deferred / Out-of-Scope / Next Steps

Intentionally **not** done in 2.18G (unchanged from prior slices):

- **Host-level items** (founder/host decisions, tracked in 2.18E): soft-404 →
  true-404, `cache-control: private`, no compression, `www` not configured,
  SPA static-bot social-preview limits, and the stale `syndicate-os.replit.app`
  deployment being behind. None are touched here.
- **Deeper trails / dynamic segments:** the breadcrumb is deliberately shallow; if
  nested routes ever appear, extend `getRouteBreadcrumb` (still from the registry).
- **Deferred 2.18 binding cleanup** (bind hero `badge`/`coreStatus` to
  `surfaceStatus`; move stray inline strings/status literals in `PublicHome.tsx`
  into config) — still pending; out of scope for this slice.
- **No data wiring** of any kind (per the phased, founder-gated doctrine).

**Stop point:** per instruction, work halts after 2.18G pending founder review.
