# Slice 2.18I — GitHub Capability Harvest & Flexible MVP Adaptation Map

**Mode:** READ-ONLY / REPORT-ONLY. No code, routes, UI, API, SEO, contracts, assets,
domain, deployment, or config changed. Nothing published or committed by this slice.
2.19A not started.

**Doctrine applied:** "Protect truth and money. Keep product architecture flexible."
Guardrails are used here as *classification* (HARD BLOCK / FLEXIBLE-ADAPT / MVP-LOCK-LATER),
not as a reason to stop.

---

## 0. Critical scope caveat — what was actually available to harvest

The prompt named external files (`docs/PROTOCOL_KNOWLEDGE_INDEX.md`,
`docs/PROTOCOL_ORGANISM_GRAPH.md`, `docs/MODULE_INTEGRATION_STANDARD.md`,
`docs/SYNDICATE_OPERATING_SYSTEM.md`, `docs/MASTER_COMPLETION_PASS_REMAINING_WORK_MAP.md`,
`apps/product-os-studio/docs/*`, a Solidity `contracts/` tree, and `src/` route trees for
join/activity/my-syndicate/chronicle/etc.).

**None of those paths exist in this Replit workspace.** Verified by directory listing and
content search. This workspace is the **clean rebuild foundation**, not a clone of
`duniterum/TheSyndicate`. To avoid fabricating a harvest of files I cannot read, this
report harvests only from material that is genuinely present here:

| Harvest source actually present | What it gives us |
|---|---|
| `artifacts/api-server/src/canon/the-syndicate/` (vendored canon) | Real, pinned chain registry, contract registry, sale/archive ABIs, archive ID registry, protocol event registry, provenance |
| `artifacts/studio/src/config/` (config spine) | `modules.ts`, `truthStatus.ts`, `surfaceStatus`, `featureFlags.ts`, `navigation.ts`, `brand.ts`, `syndicateFacts.ts` — the live module/status inventory |
| `docs/phase1-slice-2.10 … 2.16` + `docs/audits/*` | Prior reconciliation of capabilities, archive posture, reference systems, integrity gate |
| `the-syndicate-master-operating-map.md` (repo root) | The founder's canon-vs-reference decision map, no-loss preservation map, risk firewall, future IA, 20-category model, phased ledger |

**Consequence:** this is a harvest of the **already-distilled canon + planning map**, which
itself was derived (read-only) from the upstream repo at pinned commit
`cf4ca34…` (see `PROVENANCE.md`). It is *not* a fresh read of the old app's live source
tree. Where the upstream repo claims a status (e.g. a contract marked `LIVE`), that is the
**upstream's own claim carried in vendored canon** — in *this* workspace nothing is wired
and the served posture is `POSTURE_ONLY`. Both facts are reported side by side below.

No contract addresses or member PII are reproduced in this report (doctrine: addresses are
server-side canon only; the member list was deliberately never vendored).

---

## 1. Executive Verdict

**What already exists that the new OS must not forget.** A large, coherent product
architecture is already captured — not as live code here, but as pinned canon + a master
map: a 20-category source-status model; a full module set (join/sale, member OS, proof,
source/verified-introduction, recognition, archive, chronicle, token, economy, treasury,
founder/operator, contracts, status, learning, entities, indexer, guardrails); a contract
registry naming every contract and wallet by role/status; vendored ABIs for sale, source
registry, and archive; a 9-ID archive registry; a protocol event taxonomy; and a phased
build ledger with per-phase gates. This is the institutional memory of the business.

**What is stronger than the current small Replit app.** The upstream/canon layer has depth
the current foundation does not yet surface: real ABIs + a contract registry with explorer
linking; an event/proof taxonomy; the treasury 70/20/10 routing doctrine; the
verified-introduction (source) model; the Archive1155 memory model; and reference
blueprints for the *missing* backend/auth/admin/indexer layer (from the Supa-Exchange and
entity-chain references) and a composable proof/eligibility pattern (from Boost). The
current Replit app is intentionally thin: a public front door + an operator console shell +
a posture-only `/api/source-status` + a truth-label/status spine.

**What should be adapted, not copied.** UI structure, information architecture, role/surface
gating *doctrine*, and the data-posture taxonomy should be adapted. The old app's risk-framed
copy, mock data, localStorage "roles", demo/stale banners, and any reward/yield/DEX/gamified
surfaces must **not** be copied.

**What should remain flexible until MVP lock.** Surface layout, content placement,
future-module planning, private/founder-only surfaces, and clearly-labelled inactive modules
can stay flexible. Truth (status labels, real-vs-pending), money (routing, prices, sale
state), PII, and any `LIVE` claim must be locked to verified sources, never flexible.

---

## 2. Existing Capability Inventory

Status legend (two axes kept honest):
- **Canon status** = what the vendored registry / master map asserts about the *upstream* business.
- **Here status** = what is actually wired in *this* workspace today.

`✅ present here` = material is vendored/configured in this repo · `📄 map-only` = described in
the master map but the source is **not** in this workspace.

| Capability | Source (present here?) | Canon status | Here status | Useful for NEW OS | Adaptation notes |
|---|---|---|---|---|---|
| Membership / Join (sale) | `sale-abi.ts` ✅; `contract-registry` ✅ (MembershipSaleV3 = active buy target, V1/V2 sealed); join UI 📄 | Sale contracts on-chain; V3 active, V2 paused/sealed | Not wired (ABI vendored, no RPC/indexer; no `/join` route) | Yes | Adapt sale ABI + state truthfully; scrub FOMO ("buy for upside"); needs V3 addr + RPC before any live state |
| Wallet (read-only reality layer) | `chain-registry.ts` ✅ (explorer/RPC helpers); wallet UI 📄 | Read-only EIP-1193 detection, no write path | Not wired (no wallet surface) | Yes | Keep read-only; never hold keys server-side; defer write/connect |
| Activity / event history | `proof/protocol-event-registry.ts` ✅; `sale-abi` events ✅ | Event taxonomy exists | Not wired (net-new indexer required) | Yes | Indexer is net-new; `sale-abi` *does* carry sale event fragments, but a full activity feed still lacks coverage (e.g. no ERC-20 Transfer, no Archive1155 mint events) — design the indexer deliberately |
| Member cockpit / My Syndicate | `MemberAccess.tsx` (placeholder) ✅; cockpit 📄 | Member-facing product | Future — `member` module `enabled:false`, `AWAITING_FOUNDER_APPROVAL` | Yes | PII-gated; needs real auth (Phase 3) + privacy policy; no member data until then |
| Source / Verified Introduction | `sale-abi.ts` (SourceRegistryV1 ABI) ✅; `contract-registry` ✅ (SourceRegistryV1 deployed, paused); source UI 📄 | Registry deployed + owner-accepted, paused; referral UI inactive | Not wired (`source` module `enabled:false`, `SOURCE_INDEXER_NOT_WIRED`) | Yes | Adapt as "verified introduction", anonymized; **never** "affiliate income" framing; needs source indexer |
| Archive / NFT memory | `archive-nft-abi.ts` ✅; `archive/archive-id-registry.ts` ✅ (9 IDs); `contract-registry` ✅ (Archive1155) | Archive1155 live; ID 1 public mint open, ID 3 gated | Not wired (`ARCHIVE_READS_NOT_WIRED`; canon present, no live reads) | Yes | Canon exists → status is "reads not wired", **not** "future"; never "mint for gains" |
| Chronicle / protocol memory | chronicle source 📄 | Institutional narrative | Map-only (no chronicle module/route here) | Yes | Static-first `READ_ONLY_PROOF` once admitted; needs admission rules; no embellishment |
| Institutional register (roster) | register source 📄; member freeze (#1–#8) **deliberately not vendored** | The business roster; origin freeze is irreplaceable | Map-only + intentionally absent (PII) | Yes (aggregate) | Founder-decision class; default = no public PII; aggregate/anonymized only |
| Transparency / economy / treasury | treasury doctrine (70/20/10) 📄; `contract-registry` wallets ✅ (vault/liquidity/operations by role) | Append-only, tx-anchored routing proof | Not wired (no economy/treasury route here) | Yes | Tx-anchored only; scrub profit/APR; needs RPC + indexer |
| Tokenomics / DEX / liquidity | `contract-registry` ✅ (SYN, USDC, Trader-Joe LP pair); tokenomics UI 📄 | SYN ERC-20 fixed supply; USDC; live LP pair | Not wired (`realChainReads:false`) | Partial | Factual token mechanics only; **discard** DEX-swap product + liquidity-mining/APR copy |
| Product OS Studio (console) | `artifacts/studio` ✅ (Shell, PublicHome, Home, ProofDashboard, ProofStudio, SystemStatus) | Operator console + posture mgmt | **Live (UI foundation)** — read-only, posture-only | Yes | This is the vessel; extend incrementally; never big-bang rewrite |
| Action toolkit (proof/eligibility) | Boost pattern 📄 (reference, not vendored) | Action / Validator / AllowList / Receipt pattern | Future (reference only) | Yes | Adopt proof/eligibility spine; **drop** reward/payout economics |
| Scripts / checks | `artifacts/api-server/scripts/avalanche-*-check(.guard).ts` ✅ | Fail-closed internal CLIs | **Live but internal** (outside TS program + server bundle; no route) | Yes | Keep fail-closed; never serve their raw reads; great basis for an indexer health surface |
| Contracts (registry) | `contracts/contract-registry.ts` ✅ + ABIs ✅; Solidity sources 📄 | See §2a | Vendored canon; **not imported by served code** | Yes | Treat upstream `LIVE/DEPLOYED/PENDING` as *claims*; locally render `NOT_WIRED` until RPC-verified |
| Truth/status spine | `truthStatus.ts` ✅ `surfaceStatus` ✅ `featureFlags.ts` ✅ | Honesty engine | **Live here** | Yes (core) | The single cross-page status map; extend, don't fork |
| Served API | `/api/source-status` ✅ (`POSTURE_ONLY`, 20 cats, null values), `/api/healthz` ✅ | Posture-only canon endpoint | **Live here** | Yes | Keep posture-only until real reads verified; guard rejects addresses + financial framing |

### 2a. Contract registry (names only — no addresses)

| Contract / wallet (by name) | Role | Upstream canon status | Honest local posture |
|---|---|---|---|
| SYN Token | ERC-20 (fixed supply, no mint/tax) | LIVE | Not wired (no live read) |
| USDC (Avalanche) | Stablecoin (sale/treasury) | LIVE | Not wired |
| Syndicate Membership Sale (V1) | Sale | LIVE (sealed/closed, kept for history) | Not wired |
| Syndicate Membership Sale V2 | Sale | LIVE (paused, historical scan source) | Not wired |
| MembershipSaleV3 | Sale (current buy target) | LIVE (funded, owner-accepted; source/claim UI inactive) | Not wired |
| SourceRegistryV1 | Source policy registry | DEPLOYED (owner-accepted, paused) | Not wired |
| CommissionRouterV1 | Referral routing | PENDING (address null) | Not wired |
| SyndicateArchive1155 | ERC-1155 artifact memory | LIVE (ID 1 open, ID 3 gated) | Not wired (`ARCHIVE_READS_NOT_WIRED`) |
| SyndicateSeatRecord721 | Future ERC-721 identity | PENDING (address null) | Future |
| Trader Joe v1 SYN/USDC Pair | LP pair | LIVE | Not wired |
| Vault / Liquidity / Operations wallets | 70/20/10 USDC routing recipients (70% / 20% / 10%) | LIVE | Not wired |
| Membership Distribution wallet | Holds SYN inventory for membership purchases | LIVE | Not wired |
| Founder wallet | Founder allocation (public, vested) | LIVE | Not wired |

> Honesty note: upstream "LIVE" means *verifiable on-chain*, not *wired into this app*.
> Until an RPC secret + per-address verification exist (Phase 4), every one of these renders
> `NOT_WIRED` / posture-only here. Pending entries keep `address: null` — no placeholders.

---

## 3. Adapt / Copy / Defer / Discard Matrix

| Capability | Classification | Reason |
|---|---|---|
| Truth/status spine, `surfaceStatus`, `/api/source-status` posture model | **COPY STRUCTURE** (already here) | Honesty engine; the foundation everything binds to |
| Product OS Studio console (layout, dual-layout shell, gating doctrine) | **ADAPT MODEL** | Keep structure + role/surface gating doctrine; replace simulated roles with real auth later |
| Contract registry + ABIs (sale, source, archive) + chain registry | **KEEP AS REFERENCE** → ADAPT on wiring | Real pinned canon; wire read-only per phase, never expose addresses |
| Archive1155 + 9-ID archive registry + protocol event taxonomy | **ADAPT MODEL** | Canon present; build live reads + indexer against it |
| Verified-introduction (source) model | **ADAPT MODEL** | Reframe referral → verified introduction; anonymize; drop affiliate-income wording |
| Member cockpit / institutional register / member freeze | **PRIVATE ONLY** (until policy) | PII + founder-decision class; aggregate/anonymized, real auth first |
| Founder / operator cockpit | **PRIVATE ONLY** | Control plane; real auth + roles before any exposure |
| Token factual mechanics / treasury 70/20/10 routing | **ADAPT MODEL** | Factual + tx-anchored only; scrub APR/yield/profit |
| Backend / auth / admin / indexer (Supa-Exchange blueprint) | **ADAPT MODEL** (architecture only) | The missing layer; strip all reward/season/XP/quest/gamification schema |
| Entity registry concept + x402 metered-API (entity-chain) | **DEFER TO V2** | Concept-only; founder revenue decision; reject APY/passive-income/simulated chain |
| Boost action/validator/allowlist/receipt | **ADAPT MODEL** (pattern only) | Proof/eligibility spine; drop incentive/reward payout economics |
| Mock data, localStorage roles, demo/stale banners | **DISCARD** | Fake-live / security-theatre / implies broken — doctrine violations |
| DEX/swap product, liquidity-mining, seasons/quests/leaderboards/rewards | **DISCARD** | Reward/casino/yield framing — HARD BLOCK class |
| Risk-framed sale copy (FinalMintCTA / MintProgress / vault FOMO) | **DISCARD** copy, **ADAPT** the underlying factual surface | Calm institutional "take your seat" replaces upside framing |
| Branch/labs wholesale merges | **KEEP AS REFERENCE** | Cherry-pick ideas, re-derive from canon; never bulk import |

---

## 4. Flexibility Before MVP Lock

| Can remain flexible now | Must be truthful now | Must be blocked until verified | Founder decides later |
|---|---|---|---|
| Surface layout & content placement | Every status/truth label (real vs pending) | Any `LIVE` chain-read claim (needs RPC + per-address verify) | Member/PII privacy policy (default: no public PII) |
| Information architecture / nav ordering | Real-vs-not-wired posture on every module | Sale state / prices / inventory (needs V3 addr + RPC) | DB + auth provider choice |
| Future-module planning & naming | No fake data anywhere | Treasury/economy numbers (tx-anchored only) | Recognition formula (standing logic) |
| Private/founder-only surfaces (gated, inactive) | Forbidden-copy discipline (no profit/yield/ROI) | Member roster / historical freeze (PII + policy) | x402 / metered-API revenue decision |
| Clearly-labelled inactive/preview modules | Contracts shown by status, addresses server-side only | Source/referral attribution (needs indexer + anonymization) | Exchange/marketplace (only if real + approved) |
| Copy tone iteration (within guardrails) | `/api/source-status` stays posture-only until reads verified | Archive live reads (needs verified Archive read path) | Public sale framing |

---

## 5. Guardrail Recalibration

**Principle: protect truth and money; keep product architecture flexible.**

**Necessary HARD guardrails (keep — these are real risk):**
- Fake money, fake prices, fake sale/treasury/economy numbers rendered as live.
- Fake contract claims / unverified address marked `LIVE` / inferred or placeholder addresses.
- Fake source payments, fake live activation, fake dashboard data, simulated values shown as real.
- Unauthorized transactions / any write path before real auth.
- Public PII (member wallets/identities) without an explicit founder privacy decision.
- Public legal-risk claims and forbidden financial framing (profit/yield/ROI/passive income/payout/reward farming/casino).

**Overblocking guardrails that have slowed progress (recalibrate to FLEXIBLE/ADAPT):**
- Treating *UI structure, IA, layout, and content placement* as if they were truth/money claims — they are not; they can iterate freely as long as values stay truth-labelled.
- Treating *private/founder-only or clearly-inactive modules* as forbidden — building a gated, labelled, non-live surface is allowed planning, not a fake-live violation.
- Treating *vendored canon whose ABI/registry already exists* as "awaiting canon" — the honest gap is **live wiring** (`…_NOT_WIRED`), not missing canon. Calling it "future" understates what exists.
- Blanket-blocking anything that *mentions* a forbidden word even inside an anti-financial negation or ban-list (these are guardrail definitions, not promotional copy).

**How future prompts avoid being blocked by unnecessary caution:**
1. Classify each item up front: HARD BLOCK vs FLEXIBLE-ADAPT vs MVP-LOCK-LATER.
2. Separate the two axes — *does it touch truth/money/PII?* (lock) vs *is it just structure/placement?* (flexible).
3. For anything not-yet-wired, label it honestly (`NOT_WIRED` / posture) and keep building the structure around it.
4. Reserve "stop" for the HARD BLOCK list only; everything else proceeds with a truth label.

---

## 6. NEW Syndicate OS Implications (bigger than the old app, still using its tested models)

The new OS can exceed the old app because the old app contributes **tested models**, while the
new OS adds the **missing backend/auth/indexer/honesty spine** the old app lacked. Layered:

1. **Visitor layer** — public front door + proof/status/learning. *Fed by:* studio config spine + static canon (here today). Bigger: SEO/wayfinding/route-confidence already shipped (2.18 series) gives institutional discoverability the old app didn't have.
2. **Member layer** — Member OS cockpit (receipts, standing, own data). *Model from:* MemberShell/cockpit + register canon. Bigger: gated behind **real auth** (new), strict own-data-only, no PII leak.
3. **Founder / admin layer** — operator control plane + approvals. *Model from:* founder-review/role-gate doctrine. Bigger: real roles replace localStorage theatre.
4. **Source / introduction layer** — verified introduction attribution. *Model from:* SourceRegistryV1 ABI + source files. Bigger: anonymized, indexer-backed, non-affiliate framing.
5. **Activity / proof layer** — events, tx-proof, Proof of Fire. *Model from:* protocol event taxonomy + sale ABIs + Boost validator/receipt pattern. Bigger: a real indexer (net-new) + honest freshness reporting.
6. **Archive / memory layer** — Archive1155 + chronicle. *Model from:* archive-id-registry + archive ABI. Bigger: live reads + admitted chronicle, labelled, no speculation.
7. **Economy layer** — token mechanics, treasury 70/20/10, economy observatory. *Model from:* contract registry + treasury doctrine. Bigger: tx-anchored, scrubbed, dashboard-grade — never yield framing.
8. **Private operating / control layer** — indexer health, entity meta-registry, guardrail/test status, optional x402. *Model from:* internal CLIs (here) + entity-chain/Supa references. Bigger: a real internal control plane with fail-closed checks.

---

## 7. Missing External Sources (not in this workspace; founder said may exist elsewhere)

| External source | Not present here | What it could influence (if/when supplied, treated as untrusted until vendored) |
|---|---|---|
| **Other GitHub repos** — `duniterum/TheSyndicate` full tree (root TanStack app, `apps/product-os-studio`, Solidity `contracts/`, PROTOCOL_* docs), branches/`labs.*`, `boostxyz/boost-protocol`, `duniterum/entity-chain` | Only a pinned, partial canon subset is vendored here | Full module/route harvest (join/activity/my-syndicate/chronicle/etc.); Solidity source for verification; Boost proof/eligibility pattern; entity registry + x402 concept. Influence = breadth of modules + the proof/entity spine. **Never** import branches wholesale or treat references as canon. |
| **Supa / exchange references** — `duniterum/Supa-Exchange` | Not vendored (reference only) | The missing **backend/auth/admin/indexer** blueprint (Express + Drizzle/Postgres + Zod + session), referral schema, Merkle claim proofs, object storage. Influence = Phase 3 backend foundation. **Strip** all swap/yield/seasons/XP/quests/badges/leaderboard/reward/DCA/gamification. Supa is never a Syndicate data source/canon. |
| **Old prompts / screenshots** | Conversation/Canvas artifacts, not repo files | Historical intent + prior decisions. Influence = product memory and "do-not-repeat" lessons. Risk: stale/contradictory; never a source of truth over code/canon. (Recent diagnostic confirmed such text is Canvas-overlay only, not production.) |
| **External tested models** — boost-protocol (Action/Validator/AllowList/Receipt), entity-chain (Entity abstraction, x402 metered API) | Reference-only, not vendored | Influence = proof/eligibility architecture (Boost) and a **non-yield** revenue + entity meta-registry concept (entity-chain). Adopt **patterns only**; reject incentive/reward economics, APY/passive-income, and any simulated chain/numbers. |

> To harvest any of these for real, the honest path is: vendor read-only at a pinned commit
> (as `PROVENANCE.md` already does), treat contents as untrusted data, and label everything
> `NOT_WIRED` until verified — not paste claims from memory or screenshots.

---

## 8. Recommended Next Slice (one step — not implementation)

**Slice 2.18J — Product Intelligence & Content Placement Map (READ-ONLY / planning).**

Take this harvest as input and produce a single planning document that decides, per surface,
*what content goes where* and *in what truth posture* — **without building anything**:

- Map each harvested capability (§2) to a target surface in the future IA (visitor / member /
  founder / source / activity / archive / economy / private layers), with its honest posture
  (`live` / `not-wired` / `future` / `private` / `founder-decision`).
- For each public surface, specify the **content blocks** and which come from existing config
  (`syndicateFacts.ts` / `brand.ts` / `surfaceStatus`) vs. which need a new (labelled) source.
- Respect Homepage Governance (the `/` section model stays capped; depth lives on module routes).
- Output: `docs/audits/SLICE_2_18J_PRODUCT_INTELLIGENCE_CONTENT_PLACEMENT_MAP.md` for founder
  approval — the bridge between "what exists" (this report) and the first real build slice.

Explicitly **not** this next step: no implementation, no homepage rewrite, no route/API/contract
wiring, no real-data binding. Those wait for explicit founder approval and verified sources.

---

### Provenance of this report
Sources read (present in this workspace): `the-syndicate-master-operating-map.md`;
`artifacts/studio/src/config/{modules,truthStatus,featureFlags,navigation}.ts`;
`artifacts/api-server/src/canon/the-syndicate/{PROVENANCE.md, contracts/contract-registry.ts}`;
and a synthesis of `docs/phase1-slice-2.10…2.16` + `docs/audits/*`. No external network reads,
no addresses, no PII. Read-only; nothing wired, committed, or published.
