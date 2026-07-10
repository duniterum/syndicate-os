# 00 — START HERE (whole-protocol entry point)

> **STANDING DOCTRINE — not limited by what exists.** This protocol has **carte blanche to be
> world-class, grade-AAA.** Existing work is a **starting point, never a ceiling.** For anything
> you find in the repo, **judge it:** build on it and sharpen it where it's already strong; rebuild
> it cleanly where it isn't. Prefer **reuse over parallel truth ONLY where the existing code is
> already grade-AAA** — never shackle new work to weak code. **Own the reality calls:** Claude Code,
> reading the real repo, owns **code-reality**; Replit, seeing the real server, owns **infra-reality**.
> Own those decisions — don't wait to be handed the method.

> **STANDING RULE — build/deploy truth is Replit (Linux).** Never sink time fixing the founder's
> local **Windows** environment (native binaries, rollup optional-deps, path/separator quirks in
> tooling). Fix genuine **cross-platform code bugs**, but treat local Windows builds as **best-effort
> only**: if something fails **solely** on a Windows-only binary or env issue, **stop**, keep the
> committed diff clean, and let Replit run the real build. Local verification is a convenience,
> **never the source of truth.**

> **STANDING RULE — one writer to the repo; serving rules are generated.** Only **Claude Code** writes
> the repo (`main`). **Replit does not push** — its git is a normal client with no special power, and
> anything Replit could commit, Claude Code can commit, so this strands nothing. The `artifact.toml`
> clean-URL serving rewrites are **auto-generated from the SEO registry** by a build script
> (`seo:rewrites`, drift-guarded in the gate) — **one source, never hand-edited, never drifts.**
> **Replit keeps FULL authority over its own server** — deploy, TLS, runtime, publish — all server
> actions that never touch the repo, so they never need a push. When an infra need must be reflected in
> a repo file, **Replit states the need and Claude Code writes it** (generated from the registry):
> Replit communicates, it does not write the repo. **Safety net either way:** whoever writes always
> **fetch + reconcile before pushing**, never assumes sole ownership, never force-pushes a divergence.
> **ENFORCED 2026-07-10:** Replit's GitHub token is now **read-only** (Contents: read) and its publish
> auto-sync is off — Replit physically **cannot** push; it pulls to deploy only. **Claude Code is the
> sole writer to `main`.** (Two prior deploy auto-pushes — `57b9fc17`, empty `a4118d5` — are why.)

> **STANDING RULE — no PENDING for a readable figure (we are LIVE in production).** Any figure that is
> **on-chain-readable now** (or trivially derivable from what the spine already reads) must render **LIVE**,
> fail-closed to "Checking/Unavailable" — **never a typed fallback number.** **PENDING / FUTURE is reserved
> for the genuinely-not-readable** — a contract not deployed, or an adapter not wired — and every such case
> must be **listed with its reason**, never left as a silent gap. A readable figure shown as PENDING is a bug.
> When you build/extend a page, **sweep it (and the surface it touches)** and flip every newly-readable figure.

> **HARD RULE — no exceptions.** Every durable spec, plan, and decision lives **IN this repo**,
> never out-of-repo. Nothing on a desktop, in a chat, or "in your head." The DIRECTION specs are
> committed at `docs/direction/` (`MASTER_BUILD_SPEC.md` · `CONTENT_SUITE_SPEC.md` · `WHITEPAPER_PLAN.md` ·
> `WHITEPAPER_LIVING_DOCTRINE.md` · `CONTENT_SURFACE_HARVEST_MAP.md` · `GAMIFICATION_LEGAL_DOCTRINE.md`).
> **Every session boots by reading `docs/SESSION_STATE.md` FIRST** — it is the authoritative resume
> point (Phase 1 CLOSED; next = Phase 2.0 prerender/SSG rendering fix; DECIDED / DO-NOT-RE-OPEN list;
> ordered slice list). If a decision isn't captured there yet, capture it there before acting on it.

> **▶ BOOT SEQUENCE — run this exact first prompt in every new session:**
> 1. Read `docs/00_START_HERE.md` + `docs/SESSION_STATE.md` + `docs/direction/MASTER_BUILD_SPEC.md`
>    (open `CONTENT_SUITE_SPEC.md` / `WHITEPAPER_PLAN.md` when the current slice needs them).
> 2. Confirm the true repo state against SESSION_STATE (repo wins; flag any drift).
> 3. Propose the current slice (per SESSION_STATE's ordered list) with the **4-line ADR-002 gate**.
> 4. **Wait for founder GO** before touching code. Do not re-open anything in "DECIDED — DO NOT RE-OPEN."

**The one doc. Read this first — it orients you across the ENTIRE Syndicate OS.**
Everything else is reference you open only if needed. If this disagrees with an older
doc, this wins; if it disagrees with the chain, the chain wins.
Deep canon: `THE_SYNDICATE_OS_COMPASS.md` (constitution) · `the-syndicate-master-operating-map.md`
(full phase/surface ledger) · `docs/00_CANON_INDEX.md` (library map).

---

# 1. What The Syndicate OS is
An on-chain **membership & attribution protocol** on Avalanche C-Chain (43114), wrapped in
a full product + admin OS. You join by acquiring SYN; you get a permanent, verifiable,
numbered **seat** + recognition. Proof-first, truth-first. **"Observe, then join when ready."**
It is a **business**, not a charity — it sells access, recognition, and services.

## 2. Locked doctrine — never re-litigate (founder decision = identity + legal shield)
- **Business = yes.** Revenue from SYN, patronage/NFT, paid verification, Avalanche infra.
- **SYN is a seat, not a security.** NO yield · ROI · dividend · passive income · equity ·
  claim · rewards · earnings. Not an AI guardrail — the founder's model + its legal shield.
- **Chain > docs.** Every public figure is a live chain read, labeled VERIFIED / PENDING /
  FUTURE / PAUSED / FOUNDER-GATED. Never fake-live.
- **Pseudonymity preserved** — never a wallet↔identity de-anonymization tool.
- **Forbidden words** (user-facing): ROI, yield, dividend, passive income, guaranteed return,
  profit share, downline, casino, jackpot, investment contract.

## 3. What the OS is made of (the layers)
- **Product / access:** Visitor · Connected User (swap/bridge/NFT-mint, no membership) ·
  Member (seat + recognition). Public surfaces: Home, Join, Archive, Recognition, Source,
  Proof/Status, Economy/GDP, Map.
- **Content:** Whitepaper, Tokenomics, Docs, FAQ, Knowledge, Risk *(missing — Phase 2)*.
- **Admin console:** WordPress-style modules (plugins, activatable, CRUD + graphical) +
  **RBAC**: Super-Admin/Founder (root, step-up) · Admin · Operator · Auditor · Worker.
- **Economy:** 1B SYN fixed (35/25/12/10/8/5/5), burn read **live** on-chain (grows with each burn —
  never a fixed doc figure; the stale "16,500" is retired), routing 70/20/10,
  treasury (AVAX/USDC/BTC.b/WETH.e/SYN). Contracts: SYN, Sale V3 (active), Archive1155,
  LP, SourceRegistry (paused), CommissionRouter (not deployed).
- **Proof spine + backbone:** live chain reads, verify-links, status ledger; event backbone
  (indexer → activity feed → notifications) *(pending)*.
- **Referral / attribution:** source/referrer payment, verified introduction *(PENDING —
  contract not deployed; read-only today)*.
- **Design system:** foundation → atoms → patterns → surfaces *(in progress)*.
- **Infra:** Avalanche RPC · QuickNode Streams+Webhooks · api.thirdweb.com · Replit deploy
  (auth needs single-instance).

## 4. The ORDER — whole OS to grade-AAA production (we do not jump around)
1. **Design substrate** *(in progress)* — finish atoms (Field/Form, Icons) → harmonize the big
   surfaces → color guard to 0/blocking. *The skin everything wears.*
2. **Content** *(unblocking now)* — Whitepaper (**+ Prose atom together**) → Tokenomics → FAQ →
   Docs → Risk → Knowledge. Harvested + truth-first. *Understandable before transactable.*
3. **Operational activation** — wallet auth (single-instance → **founder admin ON/OFF toggle**)
   → checkout (join / buy SYN) → **referral last** (read from the contract). *Transactable.*
4. **Admin console + RBAC** — modules/plugins + operator roles. *Run the business.*
5. **Living protocol** — event backbone (indexer → activity → notifications), Economy/GDP page.
6. **Harden & seal** — accessibility / responsive / performance audits + security. *Grade-AAA.*

**Where we are:** Phase 1 — Foundation ✅, atoms 5/8 (Amount, StatusPill, Button+Tag, StatCard,
Table). Phase 2 content next. Auth dark (Phase 3). Referral pending (Phase 3, read-only).
*(Phases 1 & 2 overlap: the Prose atom bridges them.)*

## 5. How we work — roles (nobody goes off on their own)
- **Founder** = directs, approves diffs, flips switches, makes product calls.
- **Claude Code** = the **only code author**: reads the real repo, proposes with the 4-line
  gate, builds + guards, shows the diff, commits + pushes `main`, ticks `DESIGN_ROADMAP`,
  gives a **deploy verdict** (🚀 / ✅) each slice.
- **Replit** = deploy + runtime only: pulls `main`, builds, deploys, migrates, reports.
- **Claude (advisor)** = second opinion + plain-language translation + unblocking, **only on
  request.** Not a mandatory relay.
- **Rules:** WAIT is the default (no speculative prompts) · one step / one question · plain
  language · only what was asked · `main` = single source of truth (only Claude Code edits).
  Veto words: **"wait" / "human" / "stop".** Reliable channel to advisor = **screenshots**.

## 6. Reusing the origin repo (content harvest — safe rule)
When building content pages (Phase 2), the origin repo is a **source to adapt, never to copy raw**:
keep structure, approved copy, doctrine, and the forbidden-vocabulary list; but **read every
number from the live chain/config** (never copy a figure from any doc), **reuse the existing
syndicate-os truth spine** (do not build a parallel registry), and label anything not yet live
as PENDING/FUTURE. The founder pre-approves what to harvest before you build it.
