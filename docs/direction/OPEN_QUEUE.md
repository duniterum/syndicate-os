# OPEN QUEUE — in-flight decisions (anti-entropy, one level up)
*DIRECTION doc, TIER-0 (read every boot). The living list of decisions IN FLIGHT, RECONSTRUCTED FROM
EVIDENCE (session history + repo on disk), not from memory. Companion to
`ORIGIN_RECLAMATION_LEDGER.md`. Founder is the authority.*

> **HARD RULE — RESTATE THE FULL QUEUE AT EVERY GATE.** At every gate, Claude Code restates this
> ENTIRE queue, not just the new ask. **Nothing closes until the founder closes it explicitly.** A new
> question never evaporates an old one. When an item closes, move it to CLOSED with the commit /
> decision that closed it — never delete it silently.

> **WHY THIS FILE EXISTS.** The founder must not be the shared memory of three agents (Replit / Claude
> Code / advisor). Neither is Claude Code reliable at it — proven this session: one message after
> diagnosing exactly the from-memory failure, it wrote a from-memory queue. **The queue lives on disk
> or it does not live.** An item that exists only in a chat does not exist. This list was rebuilt by
> re-reading the whole session + citing files; it supersedes any from-memory list.

Status vocab: 🟡 OPEN · 🔴 BLOCKED-ON-FOUNDER · 🔵 BLOCKED-ON-CLAUDE-CODE · ⏳ GATE-PENDING (built/
analysed, awaiting GO) · ✅ CLOSED (founder-confirmed) · ⏸ DEFERRED (tracked, not in-flight).

---

## Merge report vs the founder's from-memory A–K list

- **Agreed (A–K all still open, none already closed):** A→Q1 · B→Q2 · C→Q3 · D→Q4 · E→Q9 · F→Q10 ·
  G→Q11 · H→Q12 · I→Q13 · J→Q14 · K→Q15.
- **MISSED by A–K (the valuable part), all evidenced below:**
  - **Q5** — the `/knowledge` route name + title confirm I asked for and never got an answer.
  - **Q6** — the permanence-declared-vs-derived confirm I asked in the 2.5 gate; never ratified.
  - **Q7** — `/docs` renders `LivingSignature` ("read live from Avalanche") while showing **no live
    figure** — a decorative liveness claim, the SAME disease as the §4 audit. Found by re-reading.
  - **Q8** — `MASTER_BUILD_SPEC.md` Phase-1 checkboxes are still unticked while `SESSION_STATE` says
    "PHASE 1 → CLOSED" — a doc-vs-doc drift (the disease itself).
  - **Q16** — the ⓪ fix touches the hero KPI grid (`ProtocolOverviewPanel`), which is ALSO an
    un-migrated DESIGN_ROADMAP Phase-3 item — overlap to handle deliberately.
  - **Q17** — dev-server selection: I asked which of studio/api-server/mockup-sandbox to start; no
    answer; held.
- **UNSURE / flagged, not resolved:** **Q9** (server-only-homes "Option A" wording) — I have **no
  record in THIS session** of proposing an Option A/B for it; it may belong to an advisor thread I did
  not see. Recorded, not invented — founder confirms provenance.
- **Wrong / already-closed in A–K:** none. (I did not silently close anything.)

---

## Open

| # | Item (one line) | Status | Next move | Evidence |
|---|---|---|---|---|
| Q1 | **Ledger append** (§4 correction · §11 memberCount reconciliation · §12 agent-drift · §13 approve≠payment · §14 + the 3 additions) | ⏳ | founder: push GO | this diff |
| Q2 | **⓪ liveness fix** — dual-provenance composite; empirical reconciliation gate | ⏳ 🔴 | founder GO (after Q1) | ledger §11 |
| Q3 | **2.5a** — purity-leaf `knowledge-registry.ts` + BLOCKING `guard-knowledge-map.ts` (no page) | 🟡 | Claude Code gate (after Q2) | ledger §5/§8/§11 |
| Q4 | **2.5b** — `/knowledge` page + `PagePurpose` atom | 🟡 | after Q3 | ledger; 2.5 gate |
| Q5 | **`/knowledge` route name** (`/knowledge` vs `/knowledge-map`) **+ title** — asked, never answered | 🔴 | founder decides | 2.5 gate ("one confirm before code") |
| Q6 | **Permanence: declared vs derived** — status-as-derived ratified; permanence-as-declared not confirmed | 🔴 | founder confirms at Q3 | 2.5 gate question; ledger §8 |
| Q7 | **`/docs` decorative LivingSignature** — "read live" on a page with no live figure (overclaim, §4 family) | 🟡 🔴 | decide: drop signature on `/docs`, or accept | `pages/Docs.tsx:36` (badge) + no `useHeroReality`/`useTokenomics` in file |
| Q8 | **Doc drift** — `MASTER_BUILD_SPEC` Phase-1 boxes unticked vs `SESSION_STATE` "PHASE 1 → CLOSED" | 🟡 🔵 | reconcile the stale checkboxes | `MASTER_BUILD_SPEC.md` §Phase-1 vs `SESSION_STATE.md` "Where we are" |
| Q9 | **SERVER-ONLY HOMES wording** — exact copy (Option A, system level, ZERO counts/dates/addresses); belongs to 2.5b; founder may cut. **Provenance unsure** (no in-session origin). | 🟡 | Claude Code drafts at Q4; founder confirms provenance | founder msg; not found in this session |
| Q10 | **`protocolOsMap` `knowledge-os` node** → repoint to `/knowledge` once it ships (operator/server-only file) | 🟡 🔵 | after Q4 | `config/protocolOsMap.ts:249` (`id:"knowledge-os"`) |
| Q11 | **HEADER DEFECT** — `PublicLayout` has NO wallet connect / sign-in; ~10 existing members land with only "take a seat". Not investigated. | 🟡 🔵 | investigate → founder decides scope | `components/layout/PublicLayout.tsx` (no `ConnectButton`/`useAccount`; only a SIWE comment) |
| Q12 | **CHECKOUT — V3 ABI**: purchase fn confirmed `buy(usdcAmount)` (approve→buy, two txns); slippage/min-out + USDC EIP-2612 permit NOT examined; no `permit` on the sale | 🟡 🔵 | Phase-3 investigation | `sale-abi.ts:33` (`buy`); no `permit` in sale ABI; ledger §13 |
| Q13 | **2.11 flow**: "5-step flow" must become **2 steps**; whether checkout **jumps ahead of 2.6–2.10** is a FOUNDER call | 🔴 | founder decides ordering | `SESSION_STATE` frozen-list 2.11 |
| Q14 | **Reserved-VM / session durability** — does NOT block checkout (purchase is wallet→contract) | 🔴 | founder/Replit, Phase-3 | `SESSION_STATE` Phase-3 #16 |
| Q15 | **DESIGN_ROADMAP boxes ticked per slice** — standing obligation, same commit as each slice | 🟡 STANDING | Claude Code every slice | `docs/DESIGN_ROADMAP.md` governance §|
| Q16 | **Hero KPI grid migration** (`ProtocolOverviewPanel` → StatCard/StatusPill) — un-migrated; ⓪ touches this same component | 🟡 | fold awareness into ⓪; migrate later | DESIGN_ROADMAP Phase-3; `components/hero/ProtocolOverviewPanel.tsx:45` |
| Q17 | **Dev-server selection** — which of studio/api-server/mockup-sandbox to start; asked, unanswered, held | 🔴 | founder says which | `.claude/launch.json`; launch turn |

## Deferred (tracked, not in-flight)
- ⏸ www→apex 301 → domain transfer ~Sept 2026 (`SESSION_STATE`). · ⏸ HSTS/preload → Phase 6.
- ⏸ Phase 3–6 holding-area (Guide LLM/security/user-level · living-organism surfaces · seasons engine
  · identity/income · transparency E1–E5 · #5-enforcement · #8 structural invariants) — captured in
  `SESSION_STATE` "Phase 3–6 / later work".

## Closed
*(none yet — items move here with the closing commit/decision when the founder closes them.)*
