# FULL-SCREEN HARMONIZATION AUDIT — 2026-07-25

**Status: SEALED LIVE as `a6b5294` (Replit green, founder-pasted 2026-07-25 — the DEPLOYED prod build
on thesyndicate.money). The whole harmonization + home recomposition (`38623f1`→`224dd9a`→`a6b5294`:
every home section a uniform framed card on ONE background, the hero simplified, the header type scale
lifted, Prose caps PER TEXT ELEMENT, the Faq/Whitepaper rail 240px, More-menu Whitepaper-over-Join,
TrustStatusStrip removed, dead CSS/component cleaned) is LIVE — 8/8 blob-verified, byte-identity ×2,
atomic swap no downtime, full green battery. The senior-review cleanup `498f498` (Tokenomics bound +
last dead-code/doc sync) is PUSHED, batchable — rides the next deploy.** This doc is the single record
so these surfaces are never re-audited.

---

## THE RULING (founder, 2026-07-25 — the QuickNode benchmark)
Different screens make a FIXED cap a defect (empty margins on wide screens). Grade-AAA =
**edge-to-edge, NO fixed-pixel page cap anywhere.** Fill wide screens by **multiplying columns**
(auto-fit), never by stretching. Bound readability by a **RELATIVE character measure (ch)**, never
px/rem. This SHARPENS and, where they conflict, SUPERSEDES `CANON_ACCESS_MODEL §C`'s earlier
"`max-w-2xl` body / `max-w-3xl` headline / optional 1200–1440 band" phrasing (that named a
Tailwind px/rem cap; the true rule is the ch MEASURE, and the frame is always full-width).

## THE PATTERN (the standard every surface follows)
- **Shell** (header · `<main>` · footer): `w-full` + unified gutters `px-4 sm:px-6 lg:px-8`,
  no page cap. Header/footer edges align.
- **App/data pages**: `PublicPage variant="app"` (or a bespoke `w-full px-4 sm:px-6 lg:px-8`
  wrapper). Card grids use the **`.auto-grid`** primitive.
- **Primitives** (`artifacts/studio/src/index.css`):
  - `.auto-grid` = `grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--auto-grid-col, 18rem)), 1fr))`.
    Columns multiply to fill; `min(100%,…)` guards sub-min viewports; per-grid card width via `[--auto-grid-col:NNrem]`.
  - `.measure` = `max-width: var(--measure)` where `--measure: 68ch` — the relative reading bound.
  - Hero title measure = `max-w-[34ch]` (ch, not px).
- **Mobile AAA**: footer `<details>` accordion (tap targets ≥44px), no horizontal overflow
  320→2560, safe-area `env()` padding, `clamp()` fluid type, reduced-motion neutralises the
  chevron transition, `no maximum-scale=1`.
- **Guard**: `scripts/guard-fluid-surface.ts` (BLOCKING, in the `guards` chain) reds any new
  `container mx-auto`. Allowlist = 0 — the prose shell was widened to a full-width frame + `.measure`, so the page-cap debt is ZERO.

---

## SEALED THIS SLICE (applied + verified — the shell + 20 surfaces)
- **Shell** — `PublicLayout`: header edge-to-edge (dropped `max-w-[1840px]`); footer `w-full` +
  gutters + mobile `<details>` accordion (link tap targets `min-h-11`).
- **`PublicPage`** — `variant="app"` frame + hero title `max-w-[34ch]` + lead `.measure`.
- **`index.css`** — `.auto-grid` primitive added; `.measure` (68ch) adopted; reduced-motion
  extended to transition-driven motion; `--auto-grid-col` (renamed from a collision-prone `--col`).
- **app pages → `variant="app"`** (9): ProofDashboard, ProtocolMap, ContractMemory, JoinProtocol,
  SourceLinkBuilder, Support, Learning, Docs, **SourceAttribution** (fixes /source-attribution AND
  the anon face of /referral). `/status` (SystemStatus) dropped its own `max-w-6xl`.
- **PublicHome** — 5 bands (`container mx-auto`/`max-w-6xl`) + the hero `max-w-[1840px]` → `w-full`
  + gutters; heading wrapper → `.measure`. **FOLLOW-ON (`224dd9a`→`a6b5294`):** every home section
  then recomposed as a uniform framed card (`border-border · bg-card/40 · rounded-2xl · shadow-sm`) on
  ONE background; the hero SIMPLIFIED (command-island gold band + decorations + gold cockpit card
  removed → standard card; dead CSS `syn-command-*` / `syn-season-band` + the dead `TrustStatusStrip`
  component cleaned); the redundant live-verification strip removed from the home; header type scale
  lifted (nav 11→13px, chips/descriptor/path 10-11px); Prose now caps text PER ELEMENT (cards/figures/
  tables span full-width); Faq/Whitepaper rail 240px; Tokenomics bounded; More-menu Whitepaper-over-Join.
- **MemberAppPage** — connected-branch lead `max-w-3xl` → `.measure` (systemic: fixes Recognition,
  Archive, ChronicleTeaser, Liquidity, Activity, FireLedger heads).
- **MemberAccess** — signed-out door `container mx-auto max-w-5xl` → `w-full` + gutters; h1 → `max-w-[34ch]`; leads → `.measure`.
- **admin/util caps → `w-full`** — OsMap, OperatorOverview, OperatorPreview, ProofStudio.
- **card grids → `.auto-grid`** — ProofDashboard ×2, Learning ×2, Docs, Support, ContractMemory,
  SourceAttribution ×4, Liquidity ×2, Archive, Recognition, MemberQuickActions, SystemStatus, MemberAccess.
- **running text → `.measure`** — SourceAttribution, SeasonRanking, MemberNotifications, Liquidity,
  Archive, ChronicleTeaser, HomeRegisterBand, MemberAccess, ContractMemory, ProtocolMap, JoinProtocol,
  SourceLinkBuilder, Docs, SystemStatus.
- **gutters normalised** — SeasonRanking (`px-5/sm:px-8/xl:px-16` → standard); HomeRegisterBand band → `w-full`.
- **PublicReceipt** — noted for the same `w-full` + `.measure` treatment (see OUTSTANDING; small centered ticket, low urgency).

**Rig-verified (real prod data):** header+footer 1905px aligned @1920; home bands 1905px; /proof
grids 4/3 cols; SourceAttribution 6/2/3/3 cols; MemberWallet 1905px; **0 horizontal overflow** at
390px and 1920px; mobile accordion collapsed w/ 44px targets; all images load.

---

## OUTSTANDING (still owed — tracked, not forgotten)
1. **PROSE-HARMONIZATION SLICE — ✅ DONE (2026-07-25).** `PublicPage` prose shell widened to
   `w-full px-4 sm:px-6 lg:px-8` (full-width frame); Terms/Privacy/Risk section bodies + intro cards
   got `.measure`; Tokenomics dropped `max-w-none` (Prose back to 68ch); Whitepaper/Faq keep their
   68ch `<Prose>`. Rig-verified: frame 1905px, reading column 744px (~68ch), 0 overflow. **Guard
   allowlist = 0 → page-cap debt ZERO.**
2. **PublicReceipt** `mx-auto max-w-3xl` → `w-full` + inner `.measure` (low urgency).
3. **CORRECTNESS — MemberNotifications renders `<MemberShell>` UNCONDITIONALLY** (`:50`): an anon
   visitor sees the member sidebar — an access/shell-gating concern touching the settled notification
   access model (public All/Protocol vs member Mine). NOT a layout fix; needs a focused, careful pass.
4. **a11y polish** — unify in-page link focus rings to the gold ring; footer duplicate-DOM
   (`aria-hidden` the inactive breakpoint copy or single-source + CSS switch); header CLS (reserve
   chip label width + skeleton for lazy header slots).
5. **SLICE 2 (truth fossils, founder-decided):** `/fire-ledger` pagination-coming line; `/whitepaper`
   lists "seasons" as a future module (seasons are LIVE — re-true copy, verify the season key);
   **Recognition reframe-to-live** (founder GO 2026-07-25); **Support keep-honest + humanize** (founder GO).
6. **SLICE 3 (systemic):** the sub-12px readability-floor sweep (~50 files carry `text-[9/10/11px]`,
   incl. JoinProtocol routing-% money data — compound size+contrast fail); developer-speak humanize
   ("read-only / not wired / fail-closed / RPC / null / bytes32", ~11 pages).
7. **DECISION (founder):** `.type-h2` is serif by design → pages stack multiple serif section heads
   vs the "one serif display per page" intent. Decide once: keep serif (house style) or demote section
   heads to Work Sans. No per-page edits either way — record the decision so it's never re-flagged.

---

## FONT HARMONIZATION (same session, 2026-07-25 — the /season "patchwork" complaint)
**Founder-caught:** IBM Plex Mono was used for DESCRIPTIVE SENTENCES (the /season lead, the pot
description, table footnotes) — serif + sans + mono mixing on one page. **Benchmarked** (Butterick
"Monospaced fonts": *in body text there are no good reasons to use monospace*; NN/g; EightShapes).
**THE FONT LAW (crisp):** Instrument Serif = display HEADINGS only · Work Sans = ALL body,
descriptions, UI labels, and stat numbers · IBM Plex Mono = ONLY on-chain data VALUES,
addresses/hashes/ids, code, and short UPPERCASE eyebrow labels — **never a descriptive sentence.**
- **Audit:** 11-agent sweep (`wf_fb4da1fb-89f`) classified all **609 mono/serif usages across 115
  files** — **555 legit (91%)**, **54 flagged** (mono-on-prose / serif-on-stat), concentrated in
  Season/home/admin surfaces; the 21 misc components were 100% clean.
- **Fixed 51 elements** across ~20 files (the drift guard then caught 15 more → 3 additional prose
  fixed, 12 confirmed legit UPPERCASE eyebrows): dropped `font-mono` on prose sentences → Work Sans;
  dropped `font-serif` on stat numbers → Work Sans (or mono for raw data counts); split captions so
  only the number/address stays mono; bumped touched sub-12px sizes to `text-xs` (readability floor).
  Rig-verified on /season: lead/footnote/pot-description now **Work Sans 12px**; a data value
  ("2,050" XP) correctly **stays IBM Plex Mono**.
- **Guard:** `scripts/guard-font-discipline.ts` (BLOCKING, in the chain) reds any `font-mono`/
  `font-serif` on a multi-word mixed-case PROSE sentence; skips UPPERCASE eyebrows + code endpoints.
- **Known small limit:** the live-register line (`HomeRegisterBand:78`) is now fully Work Sans — its
  embedded short-address can't stay mono because the shared `sentenceForServedLine()` returns a flat
  string; a proper split needs a lib refactor (also feeds the hero mini-feed + /activity). Tracked.

## REVIEW PROVENANCE
7-lens senior workflow (`wf_3e725614-509`) → 49 findings (11 HIGH · 22 MED · 12 LOW · 4 NIT);
5 HIGH adversarially verified — **all CONFIRMED, 0 refuted.** Preceded by the 25-page footer-link
audit (`wf_3daceb01-0c2`).
