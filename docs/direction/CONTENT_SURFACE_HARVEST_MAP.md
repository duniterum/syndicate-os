# CONTENT & SURFACE HARVEST MAP — build plan for the content suite
*DIRECTION doc. The real syndicate-os repo always wins; adapt, never copy raw. The founder is
the authority; only legal + security + truth-first bind. All source repos are on disk at
`C:\Users\kemal\OneDrive\Documents\GitHub\<repo>`.*

Captured 2026-07-10 from deep review of the founder's own repos (except cesium). Purpose:
every content/UI surface is built ONCE, grade-AAA, by harvesting existing superior work —
so the founder never has to come back and redo a page.

---

## Build order (supersedes "next = 2.3")

1. **/whitepaper** — flagship LIVING document (in progress). Extracts the shared chassis.
2. **/tokenomics** — relaunch on the same chassis + data-viz.
3. **/faq (2.3)**
4. **/support (new)** — with the floating robot.
5. **/docs (2.4)** · **/knowledge (2.5)** · then 2.6→2.11 per SESSION_STATE.

Each surface: gate (4-line) → founder GO → diff → approve → commit → publish. Live-production
(every readable figure live, no artificial PENDING). Banned-copy guard green.

---

## Shared chassis — `src/components/living/` (build once, reuse everywhere)

- **LivingSignature** — "read live from Avalanche · as of {ts} · nothing hardcoded" (harvested
  from our own `/status`). Protocol-wide.
- **TransparencyPosture** — the manifesto strip: we ask nothing · everything is here · don't
  trust, verify · observe → join if it suits you.
- **SectionIndex** — sticky, anchor-linked TOC.
- **AllocationDonut** — live SVG donut (token-only colors, a11y).
- **ReconciliationTable** — design-target vs live-current table.
- Reuse (never re-build): Prose/ProseSection, Amount, StatusPill, VerifyOnChain, DataTable,
  StatCard, Card, tokens, useHeroReality/useTokenomics.

---

## FAQ (slice 2.3)

**Structure to harvest = Supa** `Supa-Exchange/client/src/pages/FAQ.tsx`:
- client-side **search** filtering question + answer
- **category cards** with icons + shadcn **Accordion**
- **count badge** ("N questions across M categories")
- **empty state** ("No results")
- **FAQ JSON-LD** (great for AI crawlers) + breadcrumb JSON-LD
- closing **CTA** card
Plus **entity-chain's hero-answer card** at the top (`entity-chain/…/pages/FAQ.tsx`) to frame
the page before categories.

**Content = OUR origin**, never Supa/entity: `TheSyndicate/src/routes/faq.tsx` +
`src/components/syndicate/FaqRebuilt.tsx` — 39 doctrine-perfect Q&A across 8 categories
(Basics · SYN Token · Membership & Sale · Vault & Routing · Liquidity · Ranks & Identity ·
Archive · Risk & Legal). Reframe per doctrine (no yield/APY/DAO/referral-bonus/"package").

Render saved: `faq_design_render_supa_vs_entity.html` (in outputs).

---

## Support (new slice) + the floating robot

**Harvest the floating robot from Supa** `Supa-Exchange/client/src/components/FloatingAISupport.tsx`:
- bottom-right floating SVG robot (blinking cyan eyes, pulsing smile, antenna, glow, "1" notif)
- contextual greeting bubble after a delay (page-aware text)
- click → chat panel: suggested questions, input, minimizable/closable

**Tone exception (founder-granted):** the robot MAY be cute/warm/lively — it is a HELP
ASSISTANT for consulting/navigating, NOT a truth surface (whitepaper/tokenomics/status stay
serious).

**Key distinction:** this support robot is NOT the protocol's "AI Layer" (Analyst/Governance/
Risk — PENDING in the whitepaper). It is a separate consultation helper, buildable NOW without
the AI Layer. LATER, once the AI Layer exists, consider connecting the robot to it.

**Firm guardrails (legal/truth, not style):**
- the robot NEVER fabricates a figure — it helps consult and points to the proof
  (FAQ / knowledge / on-chain). Consults, never invents.
- presented as a help assistant, not "the protocol's AI" (avoid confusion with the PENDING AI Layer).
- any gamification attached to support = **recognition only**, never spendable-for-money points
  (see `GAMIFICATION_LEGAL_DOCTRINE.md`).

**Our current support** (`syndicate-os/…/pages/Support.tsx`) is honest but static (NOT_ACTIVE
posture, channel cards + triage). Keep the truthful triage structure, put it on the shared
chassis, and add the floating robot globally.

**entity-chain support** (`AIAgentChat.tsx`) = in-page multi-agent chat, off-doctrine framing —
NOT the model; only the agent-header (avatar · role · live status) is a nice touch.

Render saved: `support_design_render_ours_vs_supa_vs_entity.html` (in outputs).

---

## Docs (2.4) / Knowledge (2.5) — origin sources (already inventoried)

- **/docs** → `TheSyndicate/src/routes/docs.tsx` — "Protocol Journey Spine" (read in the order a
  member experiences it) + cards with STATUS + AUDIENCE tags.
- **/knowledge-map** → `TheSyndicate/src/routes/knowledge-map.tsx` + `src/lib/protocol-knowledge-map.ts`
  — "where every fact lives": live projection vs durable memory; anti-fragmentation rules; fact
  lifecycle (Observed → Interpreted → Promoted).

Compose from the shared chassis; harvest each origin pattern; reframe per doctrine.

---

## Cross-cutting doctrine (applies to all surfaces)

- **Living = protocol-wide** (Activity/Chronicle/Receipts/MySyndicate/Status all read live); the
  whitepaper is the flagship written expression. See `WHITEPAPER_LIVING_DOCTRINE.md`.
- **Live projections can't diverge:** the same live figure can appear on many pages (one
  canonical source, many projections) — every page stays self-contained on its pillars.
- **Harvest = adapt, never copy raw.** Structure/UX yes; off-doctrine content no.
- **Banned public words:** invest/raised/yield/return/dividend/APY/passive income/guaranteed/
  100x/moon/pump/package/governance-weight/equity/market-cap/FDV.
