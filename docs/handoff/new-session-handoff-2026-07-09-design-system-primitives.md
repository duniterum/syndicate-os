# New-Session Handoff — Design System Primitives (2026-07-09)

Compact boot brief for the next session on the **design-system workstream**. Live
production / DB / auth truth stays governed by the 2026-07-03 checkpoint
(`docs/handoff/new-session-handoff-2026-07-03-first-clean-schema-publish.md`) — this
handoff does not restate or override it. Doctrine sources: `docs/adr/ADR-001-design-system-et-methodologie.md`,
`docs/adr/ADR-002-protocole-anti-derive.md`, `docs/FOUNDATION_SPEC.md`, `CLAUDE.md`.

## 1. Where we are — foundation + primitives (~4/8)

- **Foundation ✓** — `artifacts/studio/src/index.css` tiered tokens (primitive → semantic;
  scales for type/space/elevation/z-index/motion/density/data-viz), brand fonts (Instrument
  Serif / Work Sans / IBM Plex Mono), two modes (light "museum" + dark "command-room").
  `--ring → gold` — the cyan focus-ring bug is dead at the root.
- **Amount ✓** — money presentation atom; BigInt-safe formatting stays upstream. Hero money
  renders identically NFT ↔ membership.
- **StatusPill ✓** — the single tokenized **status** atom. Tones: `proof` / `live` (cyan),
  `identity` (gold), `caution` (amber `--warning`), `danger` (red `--destructive`),
  `neutral` (muted). Absorbed the per-component badge sprawl: AccessStateChip, PostureBadge,
  LifecycleBadge, SampleTag, LiveReadTag, and RouteContextBar's posture chip.
- **Button + Tag ✓** — `Button` gained an **additive** gold `identity` variant (`--identity`
  + paired `--identity-foreground`); existing variants untouched. New `Tag` atom
  (`neutral` / `identity` / `proof`) for **taxonomy / metadata labels**, deliberately distinct
  from StatusPill (states); RouteContextBar's index chip now uses it.
- Tokens added along the way, all in the allowlisted token layer (`index.css`), never raw
  palette in components: `--warning`, `--color-identity-foreground`. `danger` reuses the
  existing `--destructive`.

Primitives done: **Amount · StatusPill · Button · Tag (4)**. Remaining core atoms:
**StatCard/KPI (next) · Table · Field/Input · Icon** (+ `Prose` for content surfaces).

## 2. Guard truth

- `no-raw-color` (dependency-free — `artifacts/studio/guards/no-raw-color.mjs`, run from the
  **repo root**): **108** sites (was 137 before StatusPill; 115 after StatusPill; 108 after
  Button+Tag). **REPORT-ONLY — not in the gate yet, by design.** It enters the gate once the
  remaining sites migrate; a dropping-but-nonzero count is expected. Every migrated primitive
  file is zero-raw-color.
- Full studio guard suite + typecheck + production build are green on Replit at `main`
  `5288a14`: `typecheck` PASS (all packages), studio guards **603/603**, seo:check + surface
  audit PASS, production build ✓ (~43s), auth-zone guard **597/597**. No migrations (design-
  system slices touch no `lib/db` schema).

## 3. Working setup (roles + loop) — see `CLAUDE.md` + ADR-002

- **Claude Code** = the only code author: boot canon → 4-line handshake → gate (plain text,
  4 lines) before each proposal → slice by slice → show diff → commit + push `main` on approval.
- **Founder (Astronaute)** approves each diff; never has to judge technical detail.
- **Replit** = deploy + runtime only: pulls `main`, builds, deploys, runs migrations, reports.
  It does not edit code. **GitHub `main` = single source of truth.**
- **Deploy verdict** is stated at the end of every slice (🚀 DEPLOY vs ✅ NO DEPLOY) with the
  one-line Replit instruction when deploying.
- **Build gate note:** the founder's checkout is inside OneDrive with no `node_modules`
  installed, so `tsc` / `vite build` can't run locally (a full pnpm install would flood
  OneDrive). The dependency-free `no-raw-color` guard runs locally; **Replit's build doubles
  as the authoritative build gate** for each visible slice.

## 4. Next slice — StatCard / KPI

FastPay-grade KPI card: **icon + label + value (reuses the `Amount` atom) + micro-trend**.
Tokens only; consumes the foundation + `Amount`, with `StatusPill` / `Tag` available for a
status or delta chip. The KPI-grid **pattern** comes after the atom (patterns follow primitives).

## 5. What NOT to do

- Don't put `no-raw-color` in the gate yet — still report-only until the remaining sites migrate.
- No new libraries — shadcn primitives only (ADR-001).
- No `lib/db` / schema / auth changes in a primitives slice (design-system scope only).
- Don't relitigate the 2026-07-03 production / DB / auth checkpoint — it stands as-is.
- Every new color → the semantic layer in `index.css` (allowlisted); never a raw palette
  shade in a component.
