# The Syndicate — Hero + Header Design Handoff Export

**Purpose.** This is a *read-only ground-truth snapshot* of the real Syndicate Studio OS app as it exists today, produced so an external design/code generator can build a Grade-AAA **hero + header** package that (a) matches the binding reference image and (b) drops cleanly back into this exact codebase later.

**This document changed no app code.** It is documentation only.

**How to use it.** Treat the binding reference image as the *visual target* and this document as the *hard technical contract* the output must satisfy: same stack, same tokens, same honesty rules, same config-driven data. Anything in the reference that conflicts with the "Integration constraints" and "Protocol/data interfaces" sections below must yield to this document, because those are the parts that make the package installable and truthful.

**Environment snapshot (for reproducibility).** Node 24.13.0 · React 19.1.0 · Vite 7 · TypeScript 5.9 · Tailwind CSS v4 (4.x) · framer-motion 12 · wouter 3 · lucide-react 0.545 · shadcn/ui (new-york style). pnpm workspaces monorepo.

---

## 0. Orientation — what "hero + header" means here

The app has **two layouts**:

- **`PublicLayout`** — the marketing chrome (sticky header + footer) used on the public homepage `/` and other public routes. **This is the header you are redesigning.**
- **`Shell`** — a denser operator-console sidebar shell used under `/studio` and its sub-routes. **Out of scope** for this handoff.

The **hero** is the top of the public homepage `/`, rendered by `PublicHome.tsx`, composed from three hero sub-components (`SeatFlowDiagram`, `ProtocolOverviewPanel`, `HeroLedger`) plus inline narrative markup.

Files in scope for a header+hero package:

| Concern | File |
|---|---|
| Header (+ footer) chrome | `artifacts/studio/src/components/layout/PublicLayout.tsx` |
| Hero page host | `artifacts/studio/src/pages/PublicHome.tsx` |
| Hero centrepiece | `artifacts/studio/src/components/hero/SeatFlowDiagram.tsx` |
| Hero right panel | `artifacts/studio/src/components/hero/ProtocolOverviewPanel.tsx` |
| Hero ledger row | `artifacts/studio/src/components/hero/HeroLedger.tsx` |
| Count-up hook | `artifacts/studio/src/components/hero/useCountUp.ts` |
| Copy + hero data | `artifacts/studio/src/config/syndicateFacts.ts` (`heroSystem`) |
| Nav registry | `artifacts/studio/src/config/navigation.ts` |
| Route registry | `artifacts/studio/src/config/modules.ts` |
| Brand strings | `artifacts/studio/src/config/brand.ts` |
| Truth/honesty vocab | `artifacts/studio/src/config/truthStatus.ts` |
| Design tokens | `artifacts/studio/src/index.css` |
| Fonts | `artifacts/studio/index.html` |

---

## 1. Current header implementation

File: `artifacts/studio/src/components/layout/PublicLayout.tsx`

### Structure (as built)

```
<header sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md>
  <div container mx-auto flex h-16 items-center justify-between gap-4 px-4>
    LEFT cluster (gap-7):
      <Wordmark />                         # logo + brand + "Preview" pill
      <nav hidden lg:flex gap-5>           # desktop primary nav (hidden < lg / 1024px)
        headerNav.map(item => <Link>)
    RIGHT cluster (gap-2 sm:gap-3):
      <ChainPill />                        # "Avalanche C-Chain", red dot; hidden < xl / 1280px
      <ReadOnlyChip />                     # "Read-only" + Eye icon; hidden < sm / 640px
      <ThemeToggle />                      # light/dark switch
      <Link href={heroSystem.primaryCta.href} hidden md:inline-flex>
        <Button size=sm gold> {heroSystem.primaryCta.label} </Button>   # hidden < md / 768px
      <Sheet> ... </Sheet>                 # mobile menu trigger, lg:hidden
```

### The Wordmark (logo lockup)

- A **`Crown` lucide icon** (h-4 w-4) inside a `h-9 w-9` rounded-lg box: `border border-gold/40 bg-gold/10 text-gold`, hover `bg-gold/20`. **There is no logo image file — the mark is icon + CSS.**
- Two stacked text lines:
  - `brand.name` = **"The Syndicate"** — `font-mono text-sm font-bold uppercase tracking-[0.18em] text-foreground`
  - `brand.tagline` = **"A Living Protocol"** — `text-[9px] uppercase tracking-[0.22em] text-muted-foreground`
- A trailing **"Preview" pill**: `border border-gold/40 bg-gold/10 text-gold text-[8px] font-semibold uppercase tracking-wider`.
- The whole lockup is a `<Link href="/">`.

### Primary desktop nav

- Source: `headerNav` from `config/navigation.ts` (see §5). Rendered only at `lg:flex` (≥1024px).
- Each link: `text-sm font-medium hover:text-gold`; active state (`location === item.path`) → `text-foreground`, else `text-muted-foreground`.
- Current items (labels → paths): **Protocol → /proof · Economy → /contracts · Chronicle → /archive · Recognition → /recognition · Membership → /member · Docs → /learning · Status → /status**.

### Right-side status chips (honesty-first, NON-functional by design)

There is **no wallet integration** in this foundation. Two chips replace the usual "Connect Wallet":

- **`ChainPill`** — pill: `border border-border bg-muted/40 text-muted-foreground text-[11px]`; a **red** dot (`bg-red-500`) + text **"Avalanche C-Chain"**; `title="Target network — not connected in this read-only foundation"`. Visible only `xl:inline-flex` (≥1280px).
- **`ReadOnlyChip`** — pill with `Eye` icon + **"Read-only"**; `title="Read-only foundation — no wallet, no writes"`. Visible only `sm:inline-flex` (≥640px).

> The red dot is intentional: it signals "not connected", not an error. A redesign must **not** turn this into a live/green "connected" indicator or a functional wallet button.

### Primary CTA

- A gold `Button size="sm"`: `bg-gold font-semibold text-gold-foreground hover:bg-gold/90`.
- Label + href come from **`heroSystem.primaryCta`** = `{ label: "Join the Protocol", href: "/member" }`. (i.e. the header CTA routes to `/member`, which is a labelled future-preview route, not a purchase flow.)
- Hidden below `md` (768px); in the mobile Sheet it reappears full-width.

### Theme toggle

- `<ThemeToggle />` (`components/ThemeToggle.tsx`) — light/dark switch, already accessibility-labelled. Default theme is **dark**, persisted to `localStorage`; `ThemeProvider` owns the `.dark` class on `<html>`.

### Mobile menu

- `Sheet` (shadcn) opening from the **right**, width `w-[300px] sm:w-[400px]`, trigger is a `Button variant="ghost" size="icon"` with a `Menu` icon (`lg:hidden`, with an `sr-only "Toggle menu"`).
- Contents: brand title (mono uppercase), the same `headerNav` links (larger `text-lg`), an inline copy of the Chain + Read-only chips, and the gold CTA full-width.

### Footer (same file, provided for completeness)

- `footerGroups` from `navigation.ts`, rendered as a 2/4-col grid; group headings mono uppercase; links `hover:text-gold`. Bottom bar: `© {year} The Syndicate. All rights reserved.` + `brand.foundationNote` = "Read-only foundation shell." A redesigned header should stay visually consistent with this footer.

---

## 2. Current hero implementation

Host file: `artifacts/studio/src/pages/PublicHome.tsx`. Data/copy: `heroSystem` in `config/syndicateFacts.ts`.

### Layout skeleton

The hero band is a responsive grid (single column on mobile, `xl:grid-cols-12` on wide):

- **Narrative column** — eyebrow, headline, subheadline, two CTAs, trust chips.
- **`SeatFlowDiagram`** — the circular centrepiece ("the seat is the center").
- **`ProtocolOverviewPanel`** — stats/activity card.
- **`HeroLedger`** — a full-width 3-card ledger row (sources · routed allocation · entry preview) beneath the top band.

An **`illustrative` SampleTag** + the disclaimer string sit at the top of the hero so the whole surface is visibly labelled as not-live.

### Narrative copy (from `heroSystem`)

- **eyebrow**: "The seat is the center"
- **headlineLead**: "Take your seat in a" · **headlineEmphasis**: "living protocol" (the emphasis word is rendered in **gold**)
- **subheadline**: "Transparent on-chain routing, verifiable by design, with memory that lasts. Every contribution feeds the center, every allocation is visible, and the gross record only grows. We build with purpose, honor the past, and shape the future — together."
- **primaryCta**: `{ label: "Join the Protocol", href: "/member" }`
- **secondaryCta**: `{ label: "Explore the Protocol", href: "/proof" }`
- **trustChips** (4): `Verifiable · On-chain records`, `Transparent · Every route`, `Permanent · Recorded to last`, `Read-only · No writes, no wallet`

### `SeatFlowDiagram` (centrepiece) — `components/hero/SeatFlowDiagram.tsx`

- A square (`max-w-[440px]`) radial diagram built in **SVG + absolutely-positioned divs** — **no raster/throne image**. The "seat" is a **`Crown` icon** inside a circular node.
- Radial layout via a `polar(angleDeg, radiusPct)` helper on a 100×100 viewBox.
- **Inbound sources** (green `#10b981` lines, emerald dot nodes): Membership (128°), LP NFT (164°), Package (196°), Introductions (232°).
- **Outbound routes** (gold lines, labelled pills): Vault 70% (52°, cyan), Liquidity 20% (0°, blue), Operations 10% (−52°, violet).
- Central seat node: `border border-gold/40 bg-gradient-to-b from-card to-background`, gold glow shadow; shows the **count-up** figure, a small sparkline SVG, "The Seat" label, and a `SampleTag kind="simulated"`.
- The count-up target is `heroSystem.seat.coreValue = 16_500_000`; label "Gross all-time capital inflow", note "Recorded · cumulative · never decreases". **Rendering caveat:** the diagram shows the animated `useCountUp` value formatted with `toLocaleString("en-US")`, so it ends at **`$16,500,000` with NO trailing `+`**. The config's `coreDisplay: "$16,500,000+"` string exists but is **not** consumed by `SeatFlowDiagram`. Count-up = `useCountUp` (starts on scroll-into-view via IntersectionObserver, cubic ease-out, **respects `prefers-reduced-motion`** by jumping to final value).
- Ambient motion: two dashed/solid rotating rings (`animate-[spin_48s...]`, `animate-[spin_36s...reverse]`) + the `.syn-*` keyframe utilities (see §3). All motion is deliberately slow/premium and reduced-motion-safe.

### `ProtocolOverviewPanel` — `components/hero/ProtocolOverviewPanel.tsx`

- Card: `rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm`, header "Protocol overview" + `SampleTag simulated`.
- **6 stat tiles** (2-col): Members `9,245`; Gross all-time `$16.50M` (emerald); Vault holdings `$11.55M` (cyan, "70% of routed inflow"); Liquidity `$3.30M` (blue, "20% of routed inflow"); LP Fees `$1.42M`; Burned (Proof of Fire) `2,000 SYN`.
- **Chapter tile**: "Genesis Signal", "Chapter #1" (gold-accented).
- **Seats progress**: filled `214 / 333`, `64%` recognised — animated bar (`bg-gold`, `whileInView` width).
- **Recent activity** list (4 items) with relative times (12m/17m/30m/41m). All figures are `kind: "simulated"`.

### `HeroLedger` — `components/hero/HeroLedger.tsx`

Three cards (`rounded-2xl border bg-card/50 backdrop-blur-sm`):

1. **Cumulative capital sources** — `SampleTag simulated`. Rows: Membership Sales $11.25M, NFT Sales $2.65M, Package Sales $1.35M, LP Fees $1.42M, Introductions $820K, Future streams $430K. Values emerald. Note: "Gross inflows are cumulative and never decrease."
2. **Current routed allocation** — `SampleTag canonical`. Vault 70% · $11.55M (cyan), Liquidity 20% · $3.30M (blue), Operations 10% · $1.65M (violet); animated bars; total routed $16.50M. Caption: "Ratios are canonical; amounts simulated."
3. **Entry preview** — `SampleTag illustrative`. Amount chips `[$5, $10, $25, $50, $75]` (default $5); on select, splits the amount by the **canonical 0.7 / 0.2 / 0.1** ratio into Vault/Liquidity/Operations. **Deliberately no per-SYN price and no "you receive N SYN" framing.** Note: "Illustrative — a simulated entry routes by the canonical split."

### Route-tone color taxonomy (used across hero)

`vault → cyan`, `liquidity → blue`, `operations → violet`; **inflow / positive → emerald/green**; **brand / CTA / seat → gold**. Keep this mapping — it is consistent between the diagram, the overview, and the ledger.

### Honesty labels used in the hero (critical — see §3/§4)

The hero uses **`SampleTag`**, not `TruthLabel`, for its figures:
- `simulated` (amber) — a made-up number shown to convey shape.
- `canonical` (cyan) — a fixed structural fact (the 70/20/10 split).
- `illustrative` (slate) — a non-numeric mock element.

Disclaimer string (rendered on the surface): *"Illustrative preview — figures are simulated, not live protocol data. Structural ratios are canonical."*

> **Hard rule for the redesign:** every hero number stays labelled and **nothing may ever render as "Live".** The hero is intentionally *not* wired to the backend reality API (see §4) — it reads static `heroSystem` config. Keep it that way unless the founder explicitly approves live wiring in a later phase.

---

## 3. Current design system (tokens, fonts, components)

### 3a. Tailwind v4 + theme tokens — `src/index.css`

- Tailwind v4 via `@import "tailwindcss"` + `@tailwindcss/vite` plugin (no `tailwind.config.js`). Plugins: `tw-animate-css`, `@tailwindcss/typography`.
- Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`.
- Colors are **HSL channel triplets** in CSS variables, exposed to Tailwind via `@theme inline` as `--color-*: hsl(var(--*))`. So utilities like `bg-background`, `text-foreground`, `border-border`, `bg-gold`, `text-gold-foreground`, `bg-primary`, etc. all resolve to these tokens.

**Light (`:root`)**

| Token | HSL | Note |
|---|---|---|
| `--background` | `210 40% 98%` | near-white |
| `--foreground` | `222 47% 11%` | ink |
| `--border` / `--input` | `214 32% 91%` | |
| `--primary` | `190 90% 40%` | cyan/teal accent |
| `--primary-foreground` | `0 0% 100%` | |
| `--card` | `0 0% 100%` | |
| `--muted` | `210 40% 96%` | |
| `--muted-foreground` | `215 16% 47%` | |
| `--destructive` | `0 84% 60%` | |
| `--gold` | `38 74% 44%` | brand accent (light) |
| `--gold-foreground` | `0 0% 100%` | |
| `--ring` | `190 90% 40%` | |
| `--radius` | `.5rem` | |

**Dark (`.dark`) — default theme**

| Token | HSL | Note |
|---|---|---|
| `--background` | `224 71% 4%` | deep navy/near-black |
| `--foreground` | `213 31% 91%` | |
| `--border` / `--input` | `216 34% 17%` | |
| `--primary` | `190 90% 50%` | brighter cyan |
| `--primary-foreground` | `222 47% 11%` | |
| `--card` | `222 47% 7%` | |
| `--muted` | `223 47% 11%` | |
| `--muted-foreground` | `215.4 16.3% 56.9%` | |
| `--destructive` | `0 63% 31%` | |
| `--gold` | `42 92% 60%` | brand accent (dark, warmer/brighter) |
| `--gold-foreground` | `240 30% 8%` | |
| `--ring` | `190 90% 50%` | |

> **Palette summary:** deep navy/black + a cyan/teal `primary` + a **gold** brand accent, with a semantic secondary palette (emerald=inflow, cyan=vault, blue=liquidity, violet=operations). Institutional/premium, **never** casino/DeFi/meme. Gold and primary are distinct roles: **gold = brand/CTA/seat**, **primary(cyan) = interactive/ring/links-ish**.

**Radius scale:** `--radius-sm = radius−4px`, `md = radius−2px`, `lg = radius`, `xl = radius+4px` (base `.5rem`).

**Component-level color vars used by shadcn primitives:** `--button-outline` and `--badge-outline` are referenced by `button.tsx` (outline variant) and `badge.tsx` (outline variant). These are injected by the Replit shadcn theme layer, **not** declared in `index.css`. Also note the custom `hover-elevate` / `active-elevate` / `active-elevate-2` utilities used by Button/Badge (Replit shadcn convention). If you rebuild these primitives standalone, preserve those class hooks or provide equivalents.

### 3b. Motion system — `src/index.css`

Ambient, low-frequency, **premium not casino**; all respect `prefers-reduced-motion` (globally disabled under reduce, including `animate-[spin...]`).

| Utility | Keyframe | Feel |
|---|---|---|
| `.syn-glow` | `syn-glow` 4s | opacity pulse 0.45↔1 |
| `.syn-float` | `syn-float` 6s | translateY ±6px |
| `.syn-shimmer` | `syn-shimmer` 2.4s | opacity 0.35↔0.95 |
| `.syn-flow` | `syn-dash` 6s linear | dashed stroke flow (stroke-dashoffset) |

framer-motion is used for entrance/reveal (`initial`/`animate`/`whileInView`, `viewport={{ once: true }}`) throughout the hero.

### 3c. Fonts — `index.html` + tokens

- **Inter** (weights 400/500/600/700) loaded from Google Fonts (`<link rel="preconnect">` + `css2?family=Inter...`).
- Token families: `--app-font-sans: 'Inter', sans-serif` (→ `font-sans`), `--app-font-serif: Georgia, serif` (→ `font-serif`), `--app-font-mono: Menlo, monospace` (→ `font-mono`).
- **Usage convention:** `font-mono` is used for the wordmark, numeric/tabular figures (`tabular-nums`), and truth/sample chips; body is `font-sans` (Inter). Numbers frequently use `tabular-nums`.

### 3d. Component primitives (shadcn/ui, new-york)

- `components.json`: style `new-york`, `rsc: false`, `tsx: true`, baseColor `neutral`, cssVariables `true`, aliases `@/components`, `@/lib/utils` (`cn`), `@/components/ui`, `@/hooks`.
- **Button** (`ui/button.tsx`): variants `default | destructive | outline | secondary | ghost | link`; sizes `default (min-h-9 px-4) | sm (min-h-8 px-3 text-xs) | lg (min-h-10 px-8) | icon (h-9 w-9)`; uses `hover-elevate active-elevate-2`, `rounded-md`, focus ring `ring-ring`. The gold CTA is `<Button>` + `className="bg-gold text-gold-foreground hover:bg-gold/90"` (gold is applied via className, not a Button variant).
- **Badge** (`ui/badge.tsx`): variants `default | secondary | destructive | outline`; `rounded-md`, `text-xs font-semibold`, `whitespace-nowrap`. Both truth chips wrap this with `variant="outline"`.
- **Card** (`ui/card.tsx`): `rounded-xl border bg-card text-card-foreground shadow`; parts `Card/Header/Title/Description/Content/Footer`. (Hero cards mostly use raw `rounded-2xl border bg-card/xx backdrop-blur-sm` divs rather than `<Card>`.)
- Mobile menu uses `ui/sheet.tsx`. Icons are **lucide-react** (Crown, Eye, Menu, Activity, Users, Network, Database, ShieldCheck, TerminalSquare, etc.).

### 3e. The two honesty-chip components (do not conflate)

- **`TruthLabel`** (`components/TruthLabel.tsx`) — reports **live wiring status** of a module/surface. `variant` is a `TruthStatus` reason code (see §4). Renders `<Badge variant="outline">` with per-variant color classes (dual light+dark), mono `text-[10px] sm:text-xs`, text from `truthStatusText`.
- **`SampleTag`** (`components/SampleTag.tsx`) — reports that a **figure is illustrative**. `kind` ∈ `simulated (amber) | canonical (cyan) | illustrative (slate)`; mono `text-[9px] sm:text-[10px] uppercase tracking-wider`. **This is what the hero uses.** SampleTag never renders "Live".

---

## 4. Current protocol / data interfaces

> **Key fact for the hero:** the public hero is **not** wired to any of the interfaces below — it renders static `heroSystem` config tagged with `SampleTag`. These interfaces exist server-side and are documented here so the redesign is *forward-compatible* (knows the real shapes) without being wired now. Do not introduce live reads into the hero/header in this package.

### 4a. API endpoints (`artifacts/api-server`, base `/api`)

- `GET /api/healthz` — liveness (the only unconditionally "real" endpoint).
- `GET /api/protocol/reality` — returns the **reality envelope** (below).
- `GET /api/source-status` — per-surface source posture.

### 4b. Reality envelope shape

Top-level: `{ mode: "READ_ONLY_PROTOCOL_REALITY", expectedChainId: 43114 (Avalanche C-Chain), asOf, cached, groups }`, where **`groups` is a keyed object (NOT an array)**: `{ chain: Item[], contracts: Item[], tokens: Item[], archive: Item[] }` (`ProtocolRealityGroups`).

Each item:
```
{
  id, label,
  value,            // boolean | number | string | null  (null = unavailable)
  valueType,
  sourceType,       // e.g. chain read vs canon constant
  sourceRef,        // provenance pointer (never a full raw 0x address)
  chainId,
  contractRole,
  asOf,
  confidence,
  lifecycle,        // reason code (see 4d)
  publicSafe,       // payload discipline flag
  note,
  failureReason     // populated when value is null
}
```
Unavailable data is represented as `value: null` + a `lifecycle`/`failureReason` — **never** a fabricated number and **never** "Live".

**Payload discipline:** responses must not leak full 0x contract addresses, and reject forbidden financial framing (see §6 forbidden copy).

### 4c. What is actually chain-readable vs canon vs not-indexed

- **Live-readable (RPC, view-only):** `eth_chainId`, `eth_getCode` (code-present probe), ERC-20 `symbol`/`decimals`, `Archive1155` `paused()` + `getArtifactCore(...)`.
- **Canon constants (vendored, not a live read):** `ACCESS_RATE_USDC_PER_SYN = 0.01`; **routing split `0.70 / 0.20 / 0.10`** (Vault/Liquidity/Operations); token spec (1B supply); rank table; contract addresses/roles (SYN, USDC, Sale V1/V2/V3, Archive1155). The hero's **canonical** SampleTag maps exactly to this 70/20/10 split.
- **NOT indexed (no live source):** ERC-20 Transfer events, ERC-1155 mint events, sale `TokensPurchased` events, archive content reads, burn scans. Anything depending on these is `NOT_WIRED`.

### 4d. Truth / lifecycle vocabularies (single source: `config/truthStatus.ts`)

- **`TruthStatus`** (10 wiring reason-codes) with display text:
  `NOT_LIVE`→"Not Live", `DESIGN_PREVIEW`→"Design Preview", `FUTURE_MODULE`→"Future Module", `EVENT_ADAPTER_NOT_WIRED`→"Event Adapter Not Wired", `SOURCE_INDEXER_NOT_WIRED`→"Source Indexer Not Wired", `ARCHIVE_READS_NOT_WIRED`→"Archive Reads Not Wired", `AWAITING_CHAIN_INDEX`→"Awaiting Chain Index", `SYNDICATE_INDEXER_NOT_WIRED`→"Indexer Not Wired", `AWAITING_FOUNDER_APPROVAL`→"Awaiting Founder Approval", `LIVE_SOURCE_MISSING`→"Live Source Missing".
- **`surfaceStatus`** maps each protocol surface to a `TruthStatus` (e.g. `membership: SYNDICATE_INDEXER_NOT_WIRED`, `proofOfFire: EVENT_ADAPTER_NOT_WIRED`, `sourceAttribution: SOURCE_INDEXER_NOT_WIRED`, `archive: ARCHIVE_READS_NOT_WIRED`, `recognition: FUTURE_MODULE`).
- **`homepageStatus`** = `{ heroBadge: NOT_LIVE, heroCore: AWAITING_CHAIN_INDEX }` (homepage-only statuses).
- **`DisplayLifecycle`** (10 human-facing) with text: `READ_ONLY_PROOF`, `HISTORICAL_PROOF`, `PAUSED_BY_PRECAUTION`, `PENDING_ADAPTER`, `NOT_ACTIVE`, `FOUNDER_GATED`, `AUTH_REQUIRED`, `PREVIEW`, `DESIGN_CONCEPT`, `FUTURE`.
- Both `TruthStatus` and `DisplayLifecycle` **project onto** the canonical `SourcePosture` (from `@workspace/os-contracts`) via `truthStatusToPosture` / `displayLifecycleToPosture`. **Nothing maps to a live write.**

> For a hero/header package you generally only need `SampleTag` (illustrative figures) and, if you surface a module's wiring state, `TruthLabel` + `surfaceStatus`. Do not invent new status strings — reuse these.

---

## 5. Menu / routes + truth status

Single route source of truth: **`config/modules.ts`**. Nav curation: **`config/navigation.ts`**. Router: **wouter**, wired in `App.tsx` (public routes wrapped in `PublicLayout`; console routes in `Shell`).

### 5a. Header nav (what the redesigned header must render)

`headerNav` is built from `headerSpec` (in `navigation.ts`), gated only on `module.visible`. **Current order and labels:**

| Label | Path | Backing module | Truth status |
|---|---|---|---|
| Protocol | `/proof` | proof | `EVENT_ADAPTER_NOT_WIRED` |
| Economy | `/contracts` | contracts | `LIVE_SOURCE_MISSING` |
| Chronicle | `/archive` | archive | `ARCHIVE_READS_NOT_WIRED` |
| Recognition | `/recognition` | recognition | `FUTURE_MODULE` |
| Membership | `/member` | member | `AWAITING_FOUNDER_APPROVAL` |
| Docs | `/learning` | learning | none (no `truthStatus`; `phase: live`, `module.live = false`) |
| Status | `/status` | status | none (no `truthStatus`; `phase: live`, `module.live = false`) — honesty hub |

Header CTA target: `heroSystem.primaryCta.href` = `/member`.

> Note the deliberate label↔route indirection: the header shows curated labels ("Protocol", "Economy", "Chronicle", "Docs") that differ from the module's own `label`. Preserve `navigation.ts` as the place that maps label→module; do not hardcode links in the header JSX.

### 5b. Full route registry (all `visible: true` today)

**Public (rendered in `PublicLayout`):**

| Path | Module label | phase | enabled | Truth status |
|---|---|---|---|---|
| `/` | Home | live | ✓ | none (front door) |
| `/proof` | Proof | live | ✓ | `EVENT_ADAPTER_NOT_WIRED` |
| `/status` | Status | live | ✓ | none (honesty hub) |
| `/learning` | Learn | live | ✓ | none |
| `/contracts` | Contracts | live | ✓ | `LIVE_SOURCE_MISSING` |
| `/source-attribution` | Source Attribution | live | ✓ | `SOURCE_INDEXER_NOT_WIRED` |
| `/support` | Support | live | ✓ | `NOT_LIVE` |
| `/archive` | Archive | future | ✓ | `ARCHIVE_READS_NOT_WIRED` |
| `/recognition` | Recognition | future | ✓ | `FUTURE_MODULE` |
| `/member` | Member OS | future | ✗ | `AWAITING_FOUNDER_APPROVAL` |

**Operator console (rendered in `Shell`, sidebar-only — NOT in public header):**

| Path | Module label | phase | enabled | Truth status |
|---|---|---|---|---|
| `/studio` | Studio OS | live | ✓ | none |
| `/proof-studio` | Proof Studio | draft | ✓ | `DESIGN_PREVIEW` |
| `/source` | Source (Operator) | future | ✗ | `SOURCE_INDEXER_NOT_WIRED` |
| `/founder` | Founder OS | future | ✗ | `AWAITING_FOUNDER_APPROVAL` |

### 5c. Footer groups (from `navigation.ts`, gated on `visible && nav.footer`)

- **Protocol:** Proof, Status, Contracts, Source Attribution
- **Learn:** Learn, Recognition, Archive
- **Membership:** Member OS, Support
- **Console:** Studio OS

### 5d. SEO / index posture (for canonical + robots, if the package touches `<head>`)

- **Indexable:** `/`, `/proof`, `/status`, `/learning`, `/contracts`, `/source-attribution`, `/support`.
- **noindex (pending / future public):** `/member`, `/recognition`, `/archive`.
- **noindex (internal console):** `/studio`, `/proof-studio`, `/source`, `/founder`.
- Canonical origin is `https://thesyndicate.money`. Per-route canonical/OG is owned at runtime by a `SeoHeadManager`; `index.html` holds base OG defaults. If your header package adds nav, it must not add a parallel route/breadcrumb config — the route registry (`modules.ts` + the SEO route registry) is the single source.

---

## 6. Integration constraints

### 6a. Stack the output must target

- **React 19 + Vite 7 + TypeScript 5.9**, **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`), **shadcn/ui** (new-york), **framer-motion 12**, **wouter 3** (use `<Link href>` / `useLocation`, **not** react-router), **lucide-react** icons. Node 24.
- Path aliases: `@/*` → `artifacts/studio/src/*`; `@assets` → repo `attached_assets/`. Use these, not deep relative paths.
- Tailwind utilities must resolve against the tokens in §3 (`bg-background`, `text-foreground`, `border-border`, `bg-gold`, `text-gold-foreground`, `bg-card`, `text-muted-foreground`, `bg-primary`, …). Prefer tokens over hardcoded hex so light/dark both work.

### 6b. Monorepo / commands (pnpm workspaces)

- Install: `pnpm install` (root). Add a dep: `pnpm --filter @workspace/studio add <pkg>` (client/static deps go to `devDependencies`; if a `catalog:` entry exists, it is used automatically).
- **Verify with typecheck, NOT build:** `pnpm --filter @workspace/studio run typecheck`. (`build` requires workflow-injected `PORT` + `BASE_PATH` and will fail from a bare shell.)
- Do **not** run `pnpm dev` at the repo root; the app runs via the `artifacts/studio: web` workflow (injects `PORT`/`BASE_PATH`; `base` in `vite.config.ts` comes from `BASE_PATH`, served at `/`).

### 6c. Files a hero+header package may modify

- `components/layout/PublicLayout.tsx` (header/footer chrome)
- `pages/PublicHome.tsx` and `components/hero/*` (hero)
- Config it may extend (prefer extending over inlining strings): `config/syndicateFacts.ts` (`heroSystem`), `config/navigation.ts`, `config/brand.ts`.

### 6d. Files / concerns the package must NOT touch or violate

- **No backend/chain wiring.** Do not touch `artifacts/api-server`, do not add live reads, wallet connect, RPC, or contract calls. The hero/header stay config-driven + SampleTag-labelled.
- **Do not weaken the honesty system.** Keep `TruthLabel`/`SampleTag` semantics; never render "Live"; never show an unlabelled figure; keep the ChainPill as a red "target, not connected" marker.
- **Do not create a parallel route/nav/breadcrumb registry.** Extend `modules.ts`/`navigation.ts`.
- **Do not add wallet/purchase/checkout UI.** "Join the Protocol" routes to `/member` (a labelled preview), not a buy flow. No monetization/provider integration is in scope.

### 6e. Homepage Governance (from `replit.md`) — binding for `/`

1. `/` is a curated **front door**, not an archive of everything.
2. Section model is **capped**: Hero · Promoted Strip · How-It-Works · Real-vs-Pending Summary · Studio Teaser · Expectations. A hero redesign lives inside the **Hero** slot; adding new top-level sections is out of scope.
3. Promoted Strip stays capped at **4 cards** (add one ⇒ remove one).
4. Homepage copy should come from `syndicateFacts.ts` / `brand.ts`, not inline strings.
5. Truth labels/statuses bind to `surfaceStatus` / `truthStatus`, not new inline literals.
6. Live values never appear on `/` without a `TruthLabel`.

### 6f. Forbidden product copy (must NEVER appear in UI)

profit · yield · return (financial) · payout · passive income · guaranteed benefit · earn/claim rewards · reward pool · farming · liquidity mining · airdrop farming · jackpot · win big · betting · wager. **Never frame SYN as investment upside.** Membership is *recognized*, not sold. (This is why the entry preview has no price and no "you receive N SYN".)

### 6g. Responsive breakpoints (Tailwind defaults + one hook)

- Tailwind: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- `hooks/use-mobile.tsx`: `MOBILE_BREAKPOINT = 768`.
- Header responsive rules recap: desktop nav `≥lg`; ChainPill `≥xl`; ReadOnlyChip `≥sm`; CTA `≥md`; mobile Sheet `<lg`.
- Theme: default **dark**, `.dark` on `<html>` owned by `ThemeProvider`; keep every color dual-mode (`... dark:...`).

---

## 7. Asset situation

### 7a. What exists

Only these static files, in `artifacts/studio/public/` (served at site root):

- `favicon.svg`
- `opengraph.jpg` (1280×720, referenced by OG/Twitter meta as `https://thesyndicate.money/opengraph.jpg`)
- `robots.txt`
- `sitemap.xml`

### 7b. What does NOT exist (important)

- **No throne / seat raster image.** The hero "seat" is a lucide **`Crown`** icon inside an SVG/CSS diagram (`SeatFlowDiagram`). If the reference implies a rendered throne, either keep the icon+SVG approach or supply a new asset per §7c.
- **No logo / wordmark image, no interlock/monogram asset.** The brand mark is `Crown` icon + text (`brand.name`).
- **No hero background image / texture files.** Backgrounds are token gradients + CSS glow.
- The binding reference image lives in `attached_assets/` (a handoff input), not wired into the app.

### 7c. Where new assets should go (if the package ships any)

- **Served-at-root assets** (favicons, OG, static images referenced by URL): `artifacts/studio/public/`, referenced as `/<file>` (the app is served at base `/`). Keep OG at 1280×720 if you replace it.
- **Imported/build-time assets** (images bundled by Vite): import via the `@assets` alias (`attached_assets/…`) or colocate under `src/` and import directly. Prefer **SVG** for marks/diagrams to match the current vector-first approach and keep light/dark theming clean.
- **Icons:** use `lucide-react` (already a dependency) rather than shipping icon files.
- **Fonts:** Inter is loaded from Google Fonts in `index.html`; if the design needs another face, add it there and wire a `--app-font-*` token — don't hardcode font-family in components.
- Naming: kebab-case; keep transparent PNG only when transparency is required (otherwise prefer SVG/optimized JPG).

> Deliverable format tip: an external generator should hand back **self-contained `.tsx` + any `public/` assets** using the tokens/aliases above, so integration is a copy-in + `typecheck`. Avoid new heavy dependencies; reuse framer-motion, lucide-react, shadcn primitives already present.

---

## Appendix — quick facts card

- **Brand:** name "The Syndicate"; tagline "A Living Protocol"; product "Studio OS"; foundation note "Read-only foundation shell."
- **Accent:** gold — light `hsl(38 74% 44%)`, dark `hsl(42 92% 60%)`; on-gold text token `--gold-foreground`.
- **Primary (cyan/teal):** light `hsl(190 90% 40%)`, dark `hsl(190 90% 50%)`.
- **Dark bg:** `hsl(224 71% 4%)`; **light bg:** `hsl(210 40% 98%)`.
- **Fonts:** Inter (sans) · Menlo (mono, used for wordmark/figures/chips) · Georgia (serif).
- **Radius base:** `.5rem`.
- **Canonical split:** 70 / 20 / 10 (Vault / Liquidity / Operations).
- **Hero centrepiece figure:** count-up to `$16,500,000` gross all-time (SIMULATED). Config `coreDisplay` has a trailing `+`, but the diagram renders the count-up value with no `+`.
- **Header CTA:** "Join the Protocol" → `/member`.
- **Chain:** Avalanche C-Chain (chainId 43114), shown as a *target*, not connected.
- **Golden rule:** everything unwired is truth-labelled; nothing renders "Live"; no financial/investment framing; recognition, not rewards.
