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

## Status
- **Decision: founder-confirmed 2026-07-18.**
- **Applied pattern (the detailed `tier × surface-type` matrix + encodable full-screen rules +
  the sign-in-wall/conversion states + the critic's settled-law check): PENDING the benchmarked
  research (`wf_aa9e24e7`), appended to this doc when it returns.**
- Authority companions: `CANON_VISIBILITY_LAW.md` · `ADR-003` · `CANON_PROTOCOL_LANGUAGE.md` ·
  `surfaceNaming.ts` · `DESIGN_ROADMAP.md` (S7-d). `OPEN_QUEUE.md` + `SESSION_STATE.md` track status.
