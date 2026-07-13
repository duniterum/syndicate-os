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
> | Q30 | **Member Home** (`/member`) — identity strip "Your Seat" · empty-state conversion → `/join` · role-filtered quick actions (locked-visible, operator cats removed) · live figures (MOVE receipt, render SYN balanceOf) · nav. Then action registry → doors → `/join` purchase (APPROVE≠PAYMENT). | 🟡 NEXT | build slice by slice |

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
