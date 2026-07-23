# CANON — THE ACCESS MODEL (tiers · the seat terminology law · the operator wall)

**TIER-0 · Founder-decided 2026-07-18 · binding on EVERY future change.**

## Why this exists
The founder caught two systemic problems: (1) a **not-signed-in / no-seat visitor was seeing
member data** (referral standing, `/wallet` balances), and (2) pages are **too constrained** (a
narrow centered column with huge empty margins). **Decision: establish the access + layout
PATTERN ONCE; every page we refactor follows it — we do not come back page by page.** Don't
reinvent the wheel — benchmark how world-class products do it (web3 **and** fintech/SaaS).

---

## 1. THE SEAT TERMINOLOGY LAW
**`seat` = the on-chain MEMBERSHIP, and nothing else.** Binary (you hold one or you don't),
numbered, permanent, written to the chain — canon in `CANON_PROTOCOL_LANGUAGE.md` +
`surfaceNaming.ts` ("a member owns a SEAT"). Reserved exclusively for membership.
- **NEVER** a SaaS "seat"/license/slot. **NEVER** a session. **NEVER** an access level.
- The internal **access-STATE codes `S1 / S4 / S7 / S11`** are machine labels for the auth STATE
  (`resolveWiredAccessState`, server-authoritative). They are **never shown to users** and
  **never conflated with a `Seat #N`** — `S7` is an access state, NOT "Seat 7". This collision is
  the exact confusion to prevent.
- Access **tiers are named by their MEANING** (visitor / connected / signed / member / operator),
  never by an `Sx` code, never by "seat".

## 2. TWO INDEPENDENT AXES (this is what makes "who has a seat" unambiguous)

**A) The MEMBERSHIP axis (public-facing):**
| Tier | What it is | Holds a seat? |
|---|---|---|
| **Visitor** | no wallet connected | no |
| **Connected** | wallet connected, not signed (e.g. to use a tool/swap) | no |
| **Signed, no seat** | SIWE session, but not a member | **no** → conversion to /join |
| **Member** | holds a **seat** on-chain | **YES — the real member** |

**B) The OPERATOR axis (admin) — orthogonal, NOT a seat:**
- Admin/console access is reached through the **NEUTRAL WALL**: `/admin`, `/studio`, `/os-map`,
  … return a **neutral 404 to the world** and are **revealed only when the server confirms the
  connected wallet holds an operator role**. Roles are enrolled **off-line** (the `founder_root`
  seed) — never self-service. This is the sealed **two-authorities** model (`/admin-in-prod`).
- **An operator need not hold a member seat; a member is not an operator.** Admin access is
  governed by the **operator axis (the wall)**, *never* by a seat.

## 3. THE GATING DECISION — by SURFACE TYPE
- **Member-account surfaces** (member home · wallet-as-member-view · referral standing · receipts ·
  toolkit member actions) → **SIGN-IN WALL.** Not signed → a public **value teaser + ONE
  "connect + sign in" CTA**, **zero personal figures** until signed. Connected-no-seat → a
  **conversion** view ("you're connected — you don't hold a seat yet → take your seat"), never a
  fake member dashboard. *(This fixes the logged-out-sees-data leak the founder found on /wallet
  and /referral.)*
- **Tool surfaces** (the future **swap/ramp**, public proof, verify) → **OPEN to a connected-no-seat
  user.** A swap is the **on-ramp to a seat**; gating it would be nonsense.
- **Public surfaces** (home, docs, proof) → open.
- **Operator console** → the **neutral wall** (operator axis).

## 4. THE FULL-SCREEN LAW (sharpen + enforce S7-d)
App surfaces = **fluid full-width**; prose = capped (1200–1440) for readability. The gap: some
pages (e.g. `/wallet`) **never adopted S7-d** → the narrow-column look. Every refactor makes the
app shell fill wide screens without feeling empty (multi-column / card grids / sidebar+main).
*(Concrete encodable rules appended from the benchmark — see Status.)*

## 5. GROUNDED IN SETTLED LAW (no conflict, do not relitigate)
- **Visibility Law (TIER-0):** own-wallet chain reads are permitted **where they are the surface's
  point** (tools); gating a *personal dashboard* behind sign-in is **not** "hiding a public fact"
  (the chain stays readable on any explorer). We still **show the money** everywhere it is shown.
- **ADR-003 anti-doxx:** own-row only, never a directory, never a wallet↔person link.
- **Q-B (settled):** the SIWE session **persists after wallet disconnect** (pattern 2). Gating is
  only about **NOT-signed** states — a signed member keeps the member view even with the wallet
  disconnected.
- **Naming canon / Human-First:** tiers spoken in human words; `seat` = membership only.

## 6. HOW WE APPLY IT
Every page refactor applies, **in the same slice**: the §3 matrix (per surface type) + the §4
full-screen law + the §1 terminology law. Reference both worlds (web3 for connect/sign/seat/own
reads; fintech/SaaS for access tiers, empty/teaser/conversion states, and full-screen layout).

---

## THE APPLIED PATTERN (benchmarked + critic-verified — `wf_aa9e24e7`, 2026-07-18)

### A. The matrix — `tier × surface type`
| Surface type | Visitor | Connected-no-seat | Member (holds a seat) | Operator |
|---|---|---|---|---|
| **Member-account** (member home · `/wallet` · referral standing · receipts · toolkit member actions · the notification **"Mine"** inbox + **the header bell's own unread count**) | **Sign-in wall** — teaser + one "Connect + sign in" CTA · **zero personal figures** | **not signed** → still the wall ("connected — sign in to read your account"); **signed, no seat (S4)** → **conversion** (own reads that ARE the point render · seat-only value shown LOCKED with its reason · CTA "Take your seat") | full dashboard (Member #N · KPIs · own reads · seat actions unlocked) | membership decides; operator adds nothing here |
| **Tool** (future swap/ramp · verify · proof) | fully usable to settlement; only the terminal button says "Connect wallet" | **stays open + live** (a swap is the on-ramp TO a seat); the only gate is the signature at settlement | identical tool | operator adds nothing |
| **Public** (home · proof · docs · status · contracts · `/referral` program page · notifications **"All/Protocol"**) | fully open, truth + tease, no personal figures | identical (public never personalizes; only the deterministic referral-**link** hash derives from a connected address — **tool-open, NOT gated**) | identical | identical (+ the `/studio` pointer = 404 for non-operators) |
| **Operator console** (`/admin/*`) | **neutral 404** | same 404 | **same 404 — a seat NEVER grants admin** | revealed only on server-confirmed operator role (founder_root = off-line seed) |

### B. The SignInWall — one shared component, resolved from `fetchSessionState()`, **NEVER `wagmi` address**
Four states: (1) **Not connected** → teaser; (2) **Connected-not-signed** → **still the wall** ("connected — sign in to read your account", zero figures) — *the branch missing today that causes the leak*; (3) **Signed-no-seat (S4)** → conversion; (4) **Member (S7)** → wall gone. Rule: the member account is a **curated off-chain private composition** → it opens only on a **proven S4 session**; raw read-from-address-alone lives on the OPEN tool/verify surfaces. Gates **NOT-SIGNED only** — never a disconnected-but-still-signed member (Q-B).

### C. Full-screen law (S7-d sharpened + guarded)
Every page is exactly ONE mode, by FUNCTION:
- **App / data / console** (hosts `MemberShell` or a data grid) = **fluid full-width**: `w-full` + gutters `px-4 sm:px-6 lg:px-8` only, **no page-level max-width**; readability bounded **PER CARD** (`container-type: inline-size`). Fill wide screens by **multiplying columns** (`grid repeat(auto-fit, minmax(280–360px, 1fr))`), never stretching one. Prime top band = a 4–6 tile KPI strip (Work-First).
- **Prose** (hero · whitepaper · terms · docs) = cap the running **text measure** ~65–70ch (`max-w-2xl` body / `max-w-3xl` headline), optionally in a 1200–1440 band. The cap is the MEASURE, never the page.
- Breakpoints **add panes** (single-col → sidebar+main ~905px). Ultra-wide (>1600): app caps card count, gutters absorb slack; prose margins grow. 320→2560 · `svh/dvh` · `viewport-fit=cover` + safe-areas · targets ≥44px · never `maximum-scale=1`.

### D. The diagnosed LEAK (founder-found) + fixes
- **`/wallet` (`MemberWalletPanel.tsx:141`) gates on `if (!address)` (wagmi), NOT the session** → a connected-but-unsigned wallet (or an expired session = "logged out") renders own SYN/USDC/Archive/allowance. **FIX: gate on `fetchSessionState()==='S4'` + add the connected-not-signed branch.** (Doubly wrong per Q-B: it would also blank a still-signed member who disconnected.)
- **`/wallet` + `/toolkit` host `<MemberShell>` inside PublicPage's `max-w-5xl` (1024px) body** → the narrow column with huge margins. **FIX: `PublicPage variant='app'` drops the body cap (keeps the hero text caps).**
- **`/member`**: door + dashboard already correct (session-gated, fluid). Keep the referral-**link** generation **tool-open** (public non-sensitive hash — do NOT session-gate it; critic).

### E. Two new BLOCKING guards
- **`guard-fluid-surface`**: any file rendering `<MemberShell>` must NOT sit inside a `max-w-*` body (red on today's `/wallet` + `/toolkit`).
- **`guard-seat-vocab`**: no member/visitor-facing string contains an `Sx` literal (scrub `AccessBlockedPanel`'s "(S1)"), and no copy equates "session"/"license" with "seat" — **EXEMPT the operator-console diagnostic surfaces** (`AccessStateSimulator`, `AccessStateChip`, behind the neutral wall) where `Sx` IS the intended internal vocabulary.

### F. Grounded (no relitigation)
Visibility Law (own reads live on tools/verify; a private dashboard behind sign-in ≠ hiding a public fact; we still SHOW the money everywhere it's shown) · ADR-003 (own-row; the only memberNumber↔wallet pairing = the founder_root-gated §D member-ledger) · Q-B (session persists → gate NOT-SIGNED only) · naming canon.

### G. Operator wall (2-D, server-authoritative, fail-closed)
`membership rung × operator role`. CLIENT wall = the neutral 404 (`OperatorRoute`, reveals only on server `operator-context` `isOperator && role`, reads no client identity signals). SERVER wall = `/api/operator` behind `authExposureGate` (dark by default), throttle → session account → ACTIVE registry role; `WRITE_ROLES={founder_root, protocol_admin}`; **founder_root-only** for operator create/suspend, notification writes, and the §D member-ledger. Keep the server role distinction authoritative; the client only needs "revealed or not".

### H. Connected opens on the WORK — NO explanatory hero (founder, 2026-07-18)
A member-account page shows the explanatory hero (eyebrow/title/lead) **ONLY when NOT signed** —
it is the visitor's teaser. **When signed/connected, the page opens directly on the work,
full-width, with NO hero** (the WORK-FIRST PAGE LAW: a member came for the work, not an
explanation). Encoded in `components/member/MemberAppPage.tsx` (session-aware via the entry-safe
`useSignedIn` hook; defaults to the work layout while resolving so a member never flashes the
hero). Applies to EVERY member-account surface — general rule, not per-page.

---

## Status
- **Decision + applied pattern: founder-confirmed 2026-07-18; benchmarked + critic-verified (SOUND with 3 adjustments, all folded in above).**
- **✅ SLICE 1 SEALED IN PROD (`b2e3e85`):** the session-gated sign-in wall on
  member-account surfaces (`/wallet` leak closed — gate on the SESSION, not the
  wagmi address; Q-B handled), full-width `/wallet`+`/toolkit` (S7-d), the
  no-hero-when-connected rule (§H), the `/member` "Your referral" dedup. Pieces:
  `SignInWall`, `MemberAppPage`, `lib/useSignedIn`.
- **🚀 SLICE 2 COMMITTED (`1b0c51b`), pending deploy:** `MemberAppPage` is now THE
  general member-surface wrapper (`kind` = content|account). SHELL CONTINUITY DONE
  — the 6 content doors (Chronicle · Activity · Archive · Recognition · Fire
  Ledger · Liquidity) render INSIDE the shell when connected. Hero copy HUMANIZED
  (session ≠ SEAT, plain words); `guard-access-state` + the `guard-auth-zone` dist
  probe re-pinned to the same honesty invariant in human words ("proves control
  of a wallet" kept verbatim). Client-only, no migration → Replit pull/deploy/report.
- **Next: (1) pagination — `/activity` newest-first feed + the newsroom Chronicle
  sort/filter/pagination (`chr-newsroom-page`); (2) `/member` full migration to
  `MemberAppPage` (the one bespoke page left).** Each through the preview gate.
- Authority companions: `CANON_VISIBILITY_LAW.md` · `ADR-003` · `CANON_PROTOCOL_LANGUAGE.md` ·
  `surfaceNaming.ts` · `DESIGN_ROADMAP.md` (S7-d). `OPEN_QUEUE.md` + `SESSION_STATE.md` track status.

---

## Amendement 2026-07-23 — /season (arc seasons S2b)
/season est une surface PUBLIQUE (classement pseudonyme, lignes seat-keyed/short-form).
EXCEPTION RÉGLÉE (dossier harvest §0.14-D, ruling §8-②): la ligne YOU (own-row
highlight, session-derived) est permise sur cette surface publique — own-row
uniquement, jamais un annuaire; le câblage arrive avec la tranche S2c/auth-zone.
