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

> **▶ 2026-07-17 (later) — THE SAFE-SEO GATE: founder decisions, split by self-adapting vs
> content-bound.** External audit flagged near-raw served assets (transport/perf). Founder
> firewall: transport/static-layer only; nothing near MetaMask/chain reads/reality spine.
>
> **DO NOW (self-adapting, done once, alive forever):**
> - **① Compression — MEASURED 2026-07-17 (Claude ran the live header read):** the host serves
>   assets **RAW** — `/assets/index-BfqGonuU.js` returned `Content-Length: 1622905` (full 1.62MB)
>   with **NO `Content-Encoding`, NO `Vary`** despite `Accept-Encoding: br,gzip`; `Server: Google
>   Frontend`. So outcome **(a) is FALSE** (no on-the-fly compression; the audit was right, not
>   stale). (b) vs (c) — whether the static host serves pre-compressed `.br/.gz` siblings — is a
>   **Replit host capability** (same class as www→apex; `artifact.toml` is rewrites-only, no
>   header/encoding mechanism; the api-server serves `/api/*` only, never the studio dist).
>   NEXT: one question to Replit — *enable host compression, or confirm sibling-serving?* → then
>   a safe additive build-emit slice (vite-plugin-compression2, br q11 + gzip l9, threshold 1KB,
>   `deleteOriginalAssets:false`, js/css/svg/json + post-prerender HTML pass; byte-identity
>   proven) **OR** the deferred Express-front topology slice (do NOT touch asset delivery).
>   🔴 awaiting founder GO + the Replit answer.
> - **② Q31 favicon — founder CHOSE the gold `syn-mark-gold` mark** (retire the off-brand cyan
>   shield). Reality: the mark exists ONLY as a 544×427/284KB PNG (no inline SVG; header+receipt
>   render the PNG), and NO image tooling is installed. So it is the Q31 micro-slice (pure-JS
>   icon generator → small square favicon/apple-touch PNGs from the existing asset + `<head>`
>   link updates), one commit. ⏳ built on founder GO; batches with ① in one deploy cycle.
>
> **WAIT FOR MVP-FINAL (content-bound → `docs/direction/MVP_FINAL_CHECKLIST.md`, the AUTHORITY
> for these; do NOT restate their detail here — no parallel truth):**
> - **Q32** (the 23 over-budget meta descriptions) → **MVP_FINAL_CHECKLIST Item 1.**
> - **llms.txt** (full drafted text engraved there, ready; founder chose to wait, not
>   post-and-patch) → **Item 2.**
> - **goal-3 SSR** (full-body prerender; recorded NO_ACTION-for-now — seat framing + verify
>   promise already reach crawlers via baked head meta) → **Item 3.**
>   **FIRING MECHANISM (founder, explicit): the checklist does NOT auto-fire — no trigger, no
>   date, no code path. It runs ONLY when the founder says "MVP final, run the checklist," and
>   Claude executes it manually, item by item, each through the normal gate. Committed + pushed
>   so it survives across sessions.**

> **▶ 2026-07-17 — QUEUE RECONCILIATION (the session's read-back sweep; this file had not been
> updated since 2026-07-14 while four slices sealed in prod — the exact drift this file exists to
> kill; caught by the founder's "last check" order). NOTHING below is closed by me — closure is
> the founder's act; these are EVIDENCE NOTES + NEW items.**
>
> **Overtaken by prod-sealed evidence (founder closes or keeps open):**
> - **Q18 (stale holder-index snapshot)** — the founder-armed regeneration ran: memberTotal **14**,
>   snapshot hash 65acf2f1…, reconciled 66/66, SEALED in prod 2026-07-16 (`768c3c1` + the DOUBLE
>   DEPLOY seal). Cadence half already closed 2026-07-14 (weekly + always before signing a promotion).
> - **Q20 (/join stale "transaction sending deliberately not enabled" note)** — the fossil was
>   truthed in the RECEIPT slice (`2f1ed57`, 2026-07-16/17); checkout is LIVE in prod.
> - **Q11 / Q21 / Q30** — already marked closed above; all now prod-sealed several times over.
> - **Q15 (roadmap ticked per slice)** — STANDING and held: ② MENU · ③ HOME ticked in their commits
>   (AUD-* slices are audit-workstream, not design entries — consistent with AUD-P0/T/TRUTH practice).
>
> **NEW OPEN items (2026-07-16/17 sessions):**
> - 🔴 **Q31 — THE ICON ARTWORK CALL.** `public/favicon.svg` is an OFF-BRAND cyan shield (#0DCCF2 —
>   not a token; the mark is the gold monogram). The apple-touch/PNG/manifest icon micro-slice is
>   BLOCKED on the founder choosing the artwork; no local SVG rasterizer exists (its own micro-slice:
>   devDep + generate-icons script + assets + link/manifest lines in ONE commit — never link tags
>   before the files exist). Evidence: AUD-ROUTE reconcile fleet, `7e6d8ee` deferral note.
> - ⏳ **Q32 — THE 23-DESCRIPTIONS META WAVE.** 23 SEO descriptions exceed the ~160-char SERP budget
>   (worst /activity 273; the protective "Not a security; no promise of gain" tails sit past the cut
>   on /faq /docs /tokenomics). Rewrite ALL on screen for the founder + add the guard length ceiling
>   in the same slice (ceiling before rewrites = red gate). Evidence: AUD-ROUTE reconcile, F2.
> - ⏸ **Q33 — *Teaser filename renames** (ActivityTeaser/ChronicleTeaser/FireLedgerTeaser serve LIVE
>   surfaces; comment-truthed in `7e6d8ee`, files queued for their own mechanical rename).
> - 🔵 **Q34 — ConnectModal setState-in-render dev warning** (pre-existing, proven at HEAD via stash
>   2026-07-17; spun off as its own task/session by the founder — running independently).
> - 🔴 **Q35 — THE AUD-T LEGAL DECISION SET (carried from 2026-07-16, restated here so the queue is
>   whole):** entity + governing law · durable contact channel · log retention window · eligibility
>   floor · checkout acceptance mechanics · on-chain hash commitment of the legal docs ·
>   never-message-first policy · counsel review lifts the draft label.
>
> **Prod state at this reconciliation:** ② MENU + ③ HOME + AUD-ROUTE sealed (`e5de807`/`7e6d8ee`,
> bundles byte-verified); deploy backlog EMPTY; next slice per the acted order = /admin-in-prod.

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

> **▶ 2026-07-14 — THE PROTOCOL LANGUAGE CONSTITUTION SLICE (docs-only). NEW CANON:
> `CANON_PROTOCOL_LANGUAGE.md` (TIER-0, registered). FOUR DECISIONS CLOSED by founder order
> (this commit):**
> - ✅ **CLOSED — Avatar storage = Replit App Storage.** Decision recorded; the build rides the
>   avatar slice of the Member Home arc (sigil default stays LIVE; NFT source stays
>   chain-verified ownerOf + badge + verify tooltip).
> - ✅ **CLOSED — DEX deep-link on /wallet = NO.** Closed by the flow-separation law: the
>   wallet's pool card keeps pointing internal → /liquidity; the DEX links never travel
>   without their page context + Risk Notice. No agent re-proposes the deep-link.
> - ✅ **CLOSED — Referral snapshot cadence = WEEKLY + always re-run before signing any
>   promotion.** (Closes the cadence half of Q18; the stale-snapshot refresh itself remains a
>   founder-gated run.) Full automation of the refresh lands with M0.
> - ✅ **CLOSED — Dedicated prod RPC = YES, founder-optional.** The founder sets
>   `AVALANCHE_RPC_URL` (QuickNode) in Replit when convenient — an ops act, nothing to build;
>   the public RPC remains sufficient at cruise cadence.
>
> **Horizon note (recorded, no build):** the white-label referral-rail SaaS idea sits at the
> existing "professional firm on traction (~6 months)" horizon (`CONNECTOR_LADDER_POLICY.md`
> §5), alongside the zero-touch promotion contract · the self-service issuer · Router V4.
>
> **Horizon note — i18n (founder-decided 2026-07-14, DEFERRED):** internationalization is
> deferred by founder decision. When opened: harvest Supa-Exchange's COMPLETE i18n mechanism
> (12 locales already exist there); start EN+FR only; legal surfaces stay English ("the
> English version prevails"); extend the copy guards PER LOCALE before adding any language
> (a guard cannot catch a lie it has no word for — in any language).

- **⏳ QUEUED SLICE — PIPELINE-CHRONICLE (founder direction 2026-07-14, recorded verbatim;
  EXECUTE ONLY ON FOUNDER GO at its M-map moment).**
  ① The organism detects Chronicle-grade events itself, WRITES the candidate itself in the
  §8 solemn-alive voice, and proposes it with a persistent reminder (the ladder-promotion
  pattern applied to memory: the threshold decides, the signature executes).
  ② FOUNDER SWITCH at the top: protocol-pure event classes (burns, era advances — the
  machine observes, nothing human to judge) MAY be AUTO-PROMOTED into the Chronicle; every
  person-touching event ALWAYS waits for the founder's promotion. The exact class list = a
  founder decision at that slice's gate.
  ③ Off-chain events are first-class Chronicle entries (proof = repo history / bytecode
  constant / dated decision — Entry 4 is the precedent).
  ④ Auto NEVER means invented: the organism observes and writes, never fabricates (M4-a's
  fail-closed cycle 1 is the model).
  **Harvest sources (all on disk, origin `TheSyndicate/src/lib/`):**
  `protocol-event-intelligence.ts` (per-event meaning · consequence · attribution ·
  Chronicle disposition CANDIDATE vs "Activity only" WITH reason) · `chronicle-admission.ts`
  + `chronicle-admission-registry.ts` (pure deterministic admission verdicts; copy checked
  against protocol-language; member-living entries NEVER candidates — P0) · the full
  `chronicle-*` family + `institutional-register-*` · `use-unread-protocol-events.ts` +
  `visitor-memory.ts` + `last-visit.functions.ts` ("Since you were away" — already coded,
  feeds the Member Home reserved slot).
  **Sequencing:** rides the backbone — M4-c gives it the generic protocol-event lane;
  opens at its M-map moment, founder's pick.

- **⏳ QUEUED SLICE — REFERRAL-SHOWCASE (founder-decided 2026-07-14; EXECUTE ONLY ON FOUNDER
  GO).** Apply the CONVERSION register (`CANON_PROTOCOL_LANGUAGE.md` §7) to the REFERRAL
  surfaces: /referral, the /join referral card, and the future Referrer Kit / OG card (MVP
  brief piece 7). The material = the four flagship §7 lines ("You don't wait to get paid…" ·
  "Nothing to claim…" · "A referral payment can never break a sale — and can never be lost." ·
  "The referral program where the payout is part of the purchase."), each under the register's
  one law: bold claim + verify link; legal verbatim lines never move. **RATIONALE (recorded):
  the instant in-transaction referrer payment is the protocol's UNIQUE claim AND sits inside
  the 30-day proof metric (≥5 seats via referral links) — it must never dissolve into
  M1/M2/M3, which do not cover these surfaces.**

## Open

> **▶ 2026-07-11 (later) — SESSION UPDATE.** The member-recognition arc SHIPPED + is LIVE. **CLOSED this
> session:** Q11 (member menu, `00676d4`) · Q21 (auth go-live, live-verified) · Q18 (snapshot staleness —
> superseded: recognition now reads V3 live for #9+ and the frozen roster for #1–#8, `87f7a1d`; the roster is
> populated on prod) · Q22 (Compass handoff repoint — supersede with the new handoff at next Compass edit) .
> **New canon:** ADR-003 anti-doxx (`e4f07ba`). **New settled founder decisions live in the handoff
> `…recognition-live-and-member-home.md`** (naming canon · two shells · no twin pages · S7/S11 wire widening
> AUTHORIZED · Member Home spec · APPROVE≠PAYMENT). **New OPEN items below: Q27–Q30.** Full detail: the handoff.
>
> | # | New item | Status | Next |
> |---|---|---|---|
> | Q27 | **Green main — 7 stale-guard fixes** (all STALE, two adversarially verified). | ✅ CLOSED `a83d812` (16/16 Linux) | — |
> | Q28 | **`surfaceNaming.ts` + `guard-surface-naming` (BLOCKING) + 52-site sweep** — naming canon locked; all cockpit/Member-OS/control-tower leaks cleared. | ✅ CLOSED `c1d6700` | — |
> | Q29 | **Widen the wire (S7/S11)** — `WIRABLE = [S1,S4,S7,S11]`; server-side elevation `resolveWiredAccessState` (S4→S7→S11, fail→S1, never a client claim); guard-access-state 688; false comment rewritten. | ✅ CLOSED [this commit] | — |
> | Q30 | **Member Home** (`/member`) — identity strip "Your Seat" · empty-state conversion → `/join` · role-filtered quick actions (locked-visible, operator cats removed) · live figures (MOVE receipt, render SYN balanceOf) · nav. Then action registry → doors → `/join` purchase (APPROVE≠PAYMENT). | ✅ CLOSED (arc 2026-07-14 shell/A–D + **S7/S7-b dashboard 2026-07-16**: door + world-standard dashboard, KPI tiles, capital card, pulse; sealed via SESSION_STATE) | — |

| # | Item (one line) | Status | Next move | Evidence |
|---|---|---|---|---|
| Q3 | **2.5a** — purity-leaf `knowledge-registry.ts` + BLOCKING `guard-knowledge-map.ts` (no page) | 🟡 | Claude Code gate (after Q2) | ledger §5/§8/§11 |
| Q4 | **2.5b** — `/knowledge` page + `PagePurpose` atom | 🟡 | after Q3 | ledger; 2.5 gate |
| Q5 | **`/knowledge` route name** (`/knowledge` vs `/knowledge-map`) **+ title** — asked, never answered | 🔴 | founder decides | 2.5 gate ("one confirm before code") |
| Q6 | **Permanence: declared vs derived** — status-as-derived ratified; permanence-as-declared not confirmed | 🔴 | founder confirms at Q3 | 2.5 gate question; ledger §8 |
| Q8 | **Doc drift** — `MASTER_BUILD_SPEC` Phase-1 boxes unticked vs `SESSION_STATE` "PHASE 1 → CLOSED" | 🟡 🔵 | reconcile the stale checkboxes | `MASTER_BUILD_SPEC.md` §Phase-1 vs `SESSION_STATE.md` "Where we are" |
| Q9 | **SERVER-ONLY HOMES wording** — exact copy (Option A, system level, ZERO counts/dates/addresses); belongs to 2.5b; founder may cut. **Provenance unsure** (no in-session origin). | 🟡 | Claude Code drafts at Q4; founder confirms provenance | founder msg; not found in this session |
| Q10 | **`protocolOsMap` `knowledge-os` node** → repoint to `/knowledge` once it ships (operator/server-only file) | 🟡 🔵 | after Q4 | `config/protocolOsMap.ts:249` (`id:"knowledge-os"`) |
| Q11 | **HEADER member sign-in → Q11-v2 (built, awaiting push).** v1 (static link, `92809f9`) pointed at the dead-end `/member` → SUPERSEDED. v2 = `MemberHeaderAffordance` (@/wallet, **lazy + auth-gated** on `useAuthAvailability`) reusing the **admin one-modal pattern**: `openConnectModal()` connect+SIWE, resolves standing IN PLACE via `SESSION_CHANGED_EVENT`/`fetchMemberStanding` (visitor→"Member sign-in" · S4+seat→"Member · seat #N" · S4+no-seat honest). Hidden while dark; auto-appears on go-live. + `/member` **verify-it-yourself** link (`VerifyOnChain membershipSaleV3`, real engine, not an ornament). Green: tsc 0 · access-state 686 · all guards. | ⏳ built, awaiting push GO | founder reviews diff | `wallet/MemberHeaderAffordance.tsx` · `PublicLayout.tsx` · `WalletSessionPanel.tsx` |
| Q21 | **AUTH GO-LIVE (founder-decided YES) — Replit action.** Confirm `REPLIT_DOMAINS` incl. `thesyndicate.money`; set `SYNDICATE_AUTH_ENABLED="true"`; restart; e2e-verify `/member` (connect→sign→S4→standing→logout). One env flag; no DB/secret. Lights up the existing one-button SIWE + the Q11-v2 header affordance. | 🔵 Replit-pending | Replit executes + reports | `authExposure.ts`; §3 handoff |
| Q22 | **Repoint Compass "current handoff"** (§2/§4/§6) from `…2026-07-03…` to `…2026-07-11-door-and-liveness.md` — the 2026-07-03 tag stays the DB/durability checkpoint. Recorded (not done — deferred under low context). | 🟡 | Claude Code, next session | `THE_SYNDICATE_OS_COMPASS.md` §2/§4/§6 |
| Q12 | **CHECKOUT — V3 ABI (INVESTIGATED, corrected).** The V3 buy is `buy(grossUsdc, recipient, sourceId, **minSynOut**, v1Proof)` — it **HAS slippage protection** (`minSynOut` floor). `quote(grossUsdc,recipient,sourceId)` → synOut/era/synPerUsdc/seatIfFirst/acquisitionCost/protocolContribution (compute `minSynOut` from it). Approve→buy two-tx; **no EIP-2612 permit on the sale** (standard USDC approve). Seat read from `MembershipPurchasedV3.memberNumber` (event). Per-address-per-era cap enforced on-chain (`usdcByAddressEra`/`maxUsdcPerAddressPerEra`). **My earlier `buy(usdcAmount)` note was the V1 ABI (wrong).** | 🟡 build-authorized (GR §6 Ph8); go-live = founder | checkout slice + APPROVE≠PAYMENT | `sale-abi.ts:146-228` `SALE_V3_ABI`; ledger §13 |
| Q13 | **2.11 flow**: "5-step flow" must become **2 steps**; whether checkout **jumps ahead of 2.6–2.10** is a FOUNDER call | 🔴 | founder decides ordering | `SESSION_STATE` frozen-list 2.11 |
| Q14 | **Reserved-VM / session durability** — does NOT block checkout (purchase is wallet→contract) | 🔴 | founder/Replit, Phase-3 | `SESSION_STATE` Phase-3 #16 |
| Q15 | **DESIGN_ROADMAP boxes ticked per slice** — standing obligation, same commit as each slice | 🟡 STANDING | Claude Code every slice | `docs/DESIGN_ROADMAP.md` governance §|
| Q16 | **Hero KPI grid migration** (`ProtocolOverviewPanel` → StatCard/StatusPill) — un-migrated; ⓪ touches this same component | 🟡 | fold awareness into ⓪; migrate later | DESIGN_ROADMAP Phase-3; `components/hero/ProtocolOverviewPanel.tsx:45` |
| Q18 | **Holder-index snapshot is 2 members stale** (builtAt 2026-07-03, memberTotal 10; live 12). Re-run the founder-gated snapshot rebuild so the VERIFIED attestation catches up — and at what cadence? Touches the founder-gated build script. **Record only — do not act.** | 🔴 record-only | founder decides | `holderIndexSnapshot.ts` (builtAt/memberTotal); founder ruling |
| Q20 | **`/join` "transaction sending deliberately not enabled" is a STALE authorization gate.** GR §1a(4) supersedes read-only-foundation; §6 Phase 8 (join) is standing-approved and the V3 address is in hand. **BUILDING** the transaction path is authorized; **GOING LIVE** rides the checkout slice + the kept invariants (§1b(4) no copied payment code w/o review) + APPROVE≠PAYMENT (ledger §13) + explicit founder go-live. **Do NOT touch the page yet** — it rides the checkout slice. Record only. | 🟡 record-only | rides checkout (Q12) | `seo-route-registry.ts` `/join` note; `GRAND_RECONCILIATION…` §1a/§6 |

## Deferred (tracked, not in-flight)
- ⏸ www→apex 301 → domain transfer ~Sept 2026 (`SESSION_STATE`). · ⏸ HSTS/preload → Phase 6.
- ⏸ Phase 3–6 holding-area (Guide LLM/security/user-level · living-organism surfaces · seasons engine
  · identity/income · transparency E1–E5 · #5-enforcement · #8 structural invariants) — captured in
  `SESSION_STATE` "Phase 3–6 / later work".

## Closed
- **Q19** Read GRAND_RECONCILIATION — ✅ read in full + reported (this session); stale lines repointed (Compass §5/§8, SESSION_STATE, `/join`→Q20); founder closed.
- **Q2** ⓪ liveness fix — ✅ SEALED in prod (`bc6102a`, Replit-verified live): `memberCount`=12 + `genesisOffset`=8 in the payload, `nextSeatNumber` absent (invariant-only), provenance line + STALE divergence rendered, `guard:freshness` + `protocol-targets` 206/206 green vs the live chain, 0 addresses. The public member figure is now the LIVE continuous `memberCount`; the snapshot is verification-only.
- **Q1** Ledger append — ✅ closed `206c103` (founder, this session).
- **Q7** `/docs` decorative LivingSignature — ✅ folded into Q2 (⓪): the signature is dropped from `/docs`; the freshness guard now forbids a decorative live signature.
- **Q17** Dev-server selection — ✅ founder ruling: start api-server + studio locally to verify the ⓪ reconciliation (read-only chain reads); Replit stays the deploy gate.

## 2026-07-12 — Checkout PROVEN + chain truth (biggest-decision session)
Full detail + the consolidated **A/B/C/D slice list** live in
`docs/handoff/new-session-handoff-2026-07-12-checkout-proven-and-chain-truth.md`. Highlights:
- **Q12 (checkout V3 ABI) → BUILT + LIVE.** C1.0 vocab guards · C1.1 amounts+quote · C1.2a net+70/20/10
  proof · C1.2b referrer line + the first CLIENT chain-read layer (`lib/chainReads.ts`) — all pushed;
  C1.2b **PROVEN in prod** on a real ACTIVE `BUILDER_SOURCE` (5% LIFETIME, `0x8338e9ff…1cf620`).
- **Q20 (`/join` stale gate) → rides C2** (record-only; removed when approve→buy ships).
- **CommissionRouterV1 → CLOSED.** Never deployed (9 contracts ever; `V2.commissionRouter()==0x0`; V3
  has no such view — reverts). A V4 DESIGN, not an asset. Do not re-investigate.
- **MVP remainder (group A):** ~~C1.3 historical-seat gate~~ ✅ SEALED · ~~C1.4 economic proof~~ ✅
  SEALED · ~~C2 approve→buy~~ ✅ **BUILT, SHIPS OFF** (`CHECKOUT_ENABLED=false` literal; folded out of
  the default bundle — go-live = founder flips it + C5 in one commit) · C5 wire `/join` (lead/badge/
  boundary-card rewrite WITH the flip) · Q21 auth go-live (Replit).
- **🔴 FOUNDER OVERRIDE (2026-07-13): ACTIVE REFERRAL IS MVP** — "not active in MVP" is DEAD, no agent
  re-raises it. Post-C5 queue, in order: ① ~~C5 flip~~ ✅ **SEALED IN PROD** → ② ~~the founder's $5 test THROUGH the referral link~~ ✅ **DONE 2026-07-12 23:32 UTC** (tx `0x353bf2c0…c42178`: seat #13 · $0.25 referral paid on-chain · 70/20/10 exact · readback recomputed 13/12 by itself)
  (`?source=0x8338e9ff…1cf620`, ACTIVE 5% LIFETIME — proves checkout + the on-chain introduction payment
  in one tx; buyer wallet must NOT be the payoutWallet/sourceWallet, must not be an unclaimed historical,
  needs $5 USDC + AVAX gas) → ③ ~~**REFERRAL PUBLIC ACTIVATION slice**~~ ✅ **BUILT (2026-07-13):** lifecycles → LIVE_ACTION,
  activeCopy renders, memberCards honest (indexer = the gap), guard-safe-source adapted + re-locked.
  → ④ next referral steps at the founder's signal: **R2** (founder signs the first member
  `createSource` — unlocks the auto-derived member link card via the `SYN.SOURCE.V1` convention) ·
  **R5** (the introduction read-model/indexer — unlocks introductions/receipts/commissions histories).
- **NEW slices proposed (no prior slice):** source-status LIVE-read surface (B) · guard rename `assertNoAddressLeak` (B) ·
  `/staff` public operator registry (B, can ship early) · V4 sale+CommissionRouter (C) · the emitter (C) ·
  Console "PROPOSE" form per Constitution §④ (B/C).
- **STANDING RULES added:** a public-RPC `eth_getLogs` scan ≠ proof of absence; a creation event is a
  STATE — read `sourceConfig()` live (see SESSION_STATE).

- **🔴 FOUNDER ORDER (2026-07-13) — REFERRAL-FIRST, FOR REAL (next session, first slice; "deep search
  think do not assume"):** the naming pass was INCOMPLETE — it renamed titles/labels but left protocol
  jargon in USER-VISIBLE BODY COPY (the founder caught "source-linked member", "introduction id",
  "a new source" in the /source-attribution intro THAT THE PASS ITSELF wrote). TWO parts, one goal:
  ① **THE DEEP JARGON SWEEP** — read EVERY user-visible string (pages, config copy, content, FAQ,
  guide, SEO, quote lines, checkout, share links) with fresh eyes and replace protocol vocabulary in
  user copy: "source-linked" → "referral-linked / who joins through a referral link", "introduction
  id" → "referral code", "a new source" → "a new referral code", etc. RULE: "Referral" = the user
  word EVERYWHERE a user reads; "Source" survives ONLY in the "Powered by Source Attribution" credit
  + proof/registry/operator contexts. Verify by READING the rendered pages, not by grepping labels.
  ② **HUMAN URLS** — /referral as the canonical route for the program page (people search "referral
  program"; the URL is part of the search result). Constraint (real): no 301 at the static layer
  until the domain transfer → new route = canonical, old /source-attribution keeps serving with
  canonical → /referral (links never break, Google consolidates). Registry + sitemap + artifact.toml
  regen + guards lockstep. Consider /source → /referral-link the same way.

- **✅ R1+R2 — DONE ON-CHAIN (2026-07-13): the first convention-derived MEMBER_INTRODUCTION
  source is ACTIVE** (sourceId `0x804e80f1…ae974`, founder-signed create+activate, metadataHash
  == the published terms `0xc8480867…1e6e48`, prod quote pays 5% live — full state in
  SESSION_STATE). Founder confirms closure. NEXT unlocked: the auto-derived member link card ·
  R5 indexer.
  *(Original entry, for the record:)* R1+R2 — the first MEMBER_INTRODUCTION source (founder GO
  2026-07-13; BUILT, awaiting diff approval → deploy → the founder's TWO signatures). R1 terms doc public
  (`/referral-program-terms-v1.txt`, hashed live → metadataHash) + R2 PROPOSE screen
  (Constitution §④ Form 2) in /admin/sources: owner() read live, sourceId derived
  (`SYN.SOURCE.V1`), createSource born PAUSED → fail-closed /join check → setSourceStatus(ACTIVE),
  each a separate founder-signed act. Full state: SESSION_STATE top bullet. 2.5a stays PARKED at
  its posted gate (Q3/Q4 held; Q5/Q6 unanswered). NOTE (doc-drift, non-decision): Q11/Q21 below
  are CLOSED per the 2026-07-11 session-update block; their table rows are historical. Q20 looks
  superseded by the live C5 checkout — closing it stays a FOUNDER confirm, not taken here.

- **⏳ R5 — BUILT (2026-07-13, founder GO; awaiting diff approval → deploy).** The introduction
  read-model + own-row `/api/auth/source-standing` + the dashboard standing/ladder surfaces +
  the commissionTiers rider. Durable test = SYN-still-held (founder GO on the recommendation;
  one constant). Full state: SESSION_STATE top bullet. LADDER-PROMOTION-SCREEN's R5 dependency
  is now SATISFIED once deployed.

- **✅ LADDER-PROMOTION-SCREEN — SEALED IN PROD (`28ccbaa`, Replit-verified 4/4, 2026-07-13).
  Founder confirms closure.** R5 likewise sealed (`93a69dd`/`56a7f4b`). Remaining referral-arc
  items: the snapshot-refresh cadence (founder decision) · per-receipt row histories (future
  slice) · the auto-derived member link card (still open, small). All four pinned UI rules + the founder's simple-transparency rule (no gap
  compensation; waiting visible + chain-dated) implemented; full state in SESSION_STATE.
  *(Original entry, for the record:)* LADDER-PROMOTION-SCREEN (registered 2026-07-13; DEPENDS
  ON R5; execute only on founder GO). The Connector-ladder promotion flow per
  `CONNECTOR_LADDER_POLICY.md`: R5's durable-introduction count crosses a threshold → the
  promotion is DUE (automatic, nobody grants/refuses) → the PROPOSE screen builds
  `updateSourceTerms` with ONLY `commissionBps` changed (all other terms verbatim;
  sourceWallet/payoutWallet must match the record or the registry reverts) → founder signs →
  `SourceTermsUpdated` public event → persistent reminder until every due promotion is signed.
  UI spec (binding): progress bar never empty · visible progress everywhere · the season
  leaderboard carries the recurring competition · the summit stays rare.

- **⏸ PRO-FIRM HORIZON (founder-decided 2026-07-13; ~6 months, on traction; MANDATORY AUDIT
  each; not in-flight).** No new smart contract until then — the deployed registry's onlyOwner
  surface + 7 classes cover the whole plan. Deferred to the professional firm: the zero-touch
  promotion contract · the self-service issuer (SPEC §⑦) · Router V4. The registry is
  Ownable2Step → the eventual ownership handover is a clean two-step transfer.

- **✅ Q-A — CLOSED (founder decision A1, 2026-07-14, triage slice).** Root cause: the pill
  is server-resolved (SIWE standing) while the hero CTA was a static config — two truth
  sources, one screen. DECIDED + BUILT: the home-hero primary CTA is session-aware — a
  seated member sees "Expand your footprint" → /join (title: "You hold your seat — a further
  purchase adds SYN to it, never a second seat."); everyone else, all loading/failure paths,
  and the dark auth zone keep "Take your seat" (fail-closed generic; the /join page's
  member-aware JoinSeatLine pattern reused via lazy wallet module `wallet/HeroSeatCta.tsx`).
  Scope: home hero only; teaser/archive CTAs stay generic (extendable later on founder ask).

- **✅ Q-B — CLOSED as BY-DESIGN, DOCUMENTED (founder decision B2-plus, 2026-07-14, triage
  slice; supersedes the briefly-built B1 sentence, reverted same slice).** Two different
  truths, both correct: the pill speaks the SERVER SIWE session (durable cookie; standing
  reads need no live wallet link); MetaMask's "Not connected" speaks the EXTENSION's own
  site-connection (its own lock/timeout/revoke schedule). Industry patterns researched by
  the founder: (1) header follows the extension + silent resume (AppKit/Reown
  signOutOnDisconnect default) vs (2) session survives wallet disconnect (the official
  wagmi SIWE example: "disconnect your wallet, and you are still securely logged in").
  **FOUNDER DECISION: we are pattern 2 — the pill is the SEAT (institutional standing, not
  a trading connection); it renders while the server session lives; NO
  sign-out-on-wallet-disconnect; NO explanatory sentence (explaining an oddity admits it's
  visible).** SILENT-RESUME VERIFICATION (repo-verified, this slice): ① the pill resolves
  ONLY from fetchMemberStanding (server) and re-reads ONLY on SESSION_CHANGED_EVENT; ② that
  event fires exclusively from sign-in success, logout, and the RainbowKit adapter's
  verify/signOut — NO repo code couples wallet-extension events (accountsChanged /
  disconnect) to the session; ③ the /member panel's accountsChanged listener clears a LOCAL
  display only ("the anonymous server session is unaffected", in code); ④ re-link of the
  same address is fully silent — the re-sign path renders only in the signedOut branch, so
  a living session never prompts; ⑤ RainbowKit's auth status derives from the SERVER
  session (fetchSessionState), not the wagmi connection. Nuance recorded (no action): an
  explicit per-site REVOKE inside MetaMask may — version-dependent, inside the RainbowKit
  library — end the server session; that is a deliberate user act resolving to a clean
  signed-out state, not a flicker; prod evidence (the founder's own screenshot: locked
  extension + living pill) confirms the installed version does NOT sign out on extension
  lock. FORWARD PATH: CLEAN — no patch needed, none made.
  **MIRRORED DIRECTION (founder question 2026-07-14, answered + recorded):** when the SITE
  session ends (e.g. a deploy wipes the in-memory sessions) while MetaMask still shows
  connected — ALSO by design, pattern 2 mirrored. The wallet link is the USER'S grant to the
  site, owned and managed inside the wallet; the site never reaches in to revoke it (no
  grade-AAA dapp force-revokes on session end). Keeping the link alive is what makes
  recovery one click: the header's "Sign in" re-sign path uses the still-connected wallet —
  no reconnect ceremony. The two truths end independently in BOTH directions.

- **🔴 THE MVP-FINAL MASTER BRIEF + THE 30-DAY MAP ARE CANON (founder-decided 2026-07-14):
  `docs/direction/MVP_FINAL_MASTER_BRIEF.md`** — the complete final MVP scope (the challenge ·
  the 30-day proof metric with FLOOR/TARGET · the seven pieces · the voice · standing laws ·
  facts corrections · the ordered M0–M10 map with THIN-V1 definitions, critical path = M4
  event backbone, early win = M1+M2+M3). **The founder picks slice 1 from the map; nothing
  opens before that pick.** All existing queue items are folded into the map (this queue stays
  the item-level truth; the map is the sequence).

- **⏳ QUEUED SLICE — GIFT-A-SEAT (founder-approved 2026-07-13; opens POST-HAND-SELLING-PHASE
  unless the founder signals earlier; EXECUTE ONLY ON FOUNDER GO).** The checkout learns the
  contract's EXISTING recipient parameter (`buy(gross, recipient, …)` — deployed, unused).
  SPEC: ① optional "Gift this seat to: 0x…" field; ② **ALL recipient-side guards move to the
  RECIPIENT** (the C4 trap, flagged three times: `knownMember`, the historical gate, and era
  caps are recipient-based; the QUOTE already computes on recipient — the screen must too);
  ③ honest copy: "the seat will be written to THEIR wallet, permanently"; ④ referral applies
  normally to gifted purchases; ⑤ the receipt records buyer ≠ recipient so the story can later
  read "bought as gift". DEPENDS ON: the live C5 checkout (satisfied); pairs naturally with
  IDENTITY-ALIAS for the label rendering. **FOUNDER CONTEXT — FINAL (2026-07-14 ADDENDUM,
  MASTER BRIEF §7 is the authority): the founder's own seat is HISTORICAL #1 (Genesis, his
  9-year wallet `0x2445…9C721`). ALL V3 test seats are GIFTS awaiting adoption — #13
  (`0x0Dd8…c4D20`) AND #14 (`0xEA88…35881`); historical #2–#8 are likewise destined gifts
  (one holds the known double #7+#11 — the future Chronicle chapter "the first duplicate was
  a gift").** Founder-test label until adoption; then "bought as gift" renders from receipt
  truth (buyer ≠ eventual identity). Recipient identities stay OFF-repo/OFF-surface until each
  opts in via IDENTITY-ALIAS. GIFT-A-SEAT is the clean path for FUTURE gifts (recipient
  field); #13/#14 are the pre-slice generation, adopted-wallet path.

- **⏳ QUEUED SLICE — IDENTITY-ALIAS (founder-approved 2026-07-13; opens POST-HAND-SELLING-PHASE
  unless the founder signals earlier; EXECUTE ONLY ON FOUNDER GO).** The opt-in identity layer
  ABOVE the seat (blueprint slice 7 + the pseudonymity doctrine; natural home: the Member Home
  arc). SPEC: ① a member may attach an ALIAS to their seat — opt-in, default invisible,
  own-row (SPEC_REFERRAL_SYSTEM §③: the alias layers OVER the sourceId, never replaces it;
  ADR-003 binds); ② labels like "bought as gift" render from RECEIPT TRUTH (buyer ≠ recipient),
  never hand-entered; ③ wallet lineage: an identity resolves to a wallet over time, every
  change a dated public record (the founder-succession design from EVENT_BACKBONE_BLUEPRINT
  applies to members too); ④ the chain stays pseudonymous — the site is NEVER the
  de-pseudonymization tool; no forced wallet↔identity directory, ever. DEPENDS ON: Member Home
  (Q30 arc) + the event backbone for lineage records. **FOUNDER CONTEXT (docs truth): the
  wallet `0x244531C5…9C721` (historical member #1, the BUILDER source payout destination) is
  the FOUNDER'S OWN PRIVATE WALLET — a 9-year-old personal wallet (ENS `duniter.eth` on
  mainnet). In the identity layer it carries the founder's chosen label (e.g. "founder private
  wallet"), opt-in like everything in that layer. No future session may mistake it for a
  third party.**

- **⏳ QUEUED SLICE (founder-approved for queuing 2026-07-13; EXECUTE ONLY ON FOUNDER GO):
  SEO-301 — /source-attribution permanent redirect.** Rationale (advisor-verified vs Google
  canonicalization docs + our ZERO-twin-pages law): the live noindex-alias works, but grade AAA for
  a RENAMED page is a permanent redirect — an alias that SERVES is a twin; an alias that REDIRECTS
  is a moved-sign. SPEC: ① /source-attribution returns a server-side **301 → /referral** at the
  serving/rewrites layer; ② query strings preserved INTACT (a `?source=…` link must survive — shared
  referral links must keep paying); ③ /referral keeps its self-canonical; sitemap lists only
  /referral; all internal links point only to /referral (already true); ④ VERIFY after:
  `curl -I /source-attribution` → 301 + `Location: /referral`; a ?source= link lands on /referral
  with the parameter intact. EXECUTION NOTE (infra-reality): the Replit static artifact layer has
  not previously exposed custom 301s (the 2.0 /status lesson; www→apex deferred to the domain
  transfer ~Sept 2026) — Replit states what its host supports; if a true 301 is impossible before
  the domain transfer, the slice waits for that transfer rather than shipping a fake redirect.
