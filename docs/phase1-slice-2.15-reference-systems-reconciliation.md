# Phase 1 — Slice 2.15: Reference Systems Reconciliation + Canonical Address / Link / Page Inventory

> **Posture:** `INSPECTION / REPORT-ONLY`. No implementation. No route, endpoint, UI,
> live read, indexer, DB, auth, codegen, write-flow, or wallet was added or changed.
> `/api/source-status` is unchanged (`POSTURE_ONLY`). The only product/served-code change is
> **none**; the sole deliverable is **this document**. (Agent memory under `.agents/` is updated
> as routine cross-session bookkeeping — it is not product or served code.)
>
> **Doctrine for this slice:** *"Inventory everything. Canonize nothing prematurely.
> Preserve the future surface. Build only from verified Syndicate truth."*
>
> **Address-handling rule (applies to every table below):** raw `0x` values are **never
> printed** in this report. Each canonical address/proof is referenced by **role + canon
> source file**; the raw hex lives only in the pinned vendored canon. This honors the
> standing doctrine (no full wallets / owner / treasury / holder addresses exposed) while
> still producing a complete *map*.
>
> **Trust rule:** Supa-Exchange, entity-chain/x402, and Boost are **reference-only** — never
> Syndicate canon, never a data source. External repo content is classified, never imported.

---

## 1. Executive verdict

The Syndicate vision is **already fully captured in local, founder-approved planning material**
— principally `the-syndicate-master-operating-map.md` (the canon-vs-reference decision map,
no-loss preservation map, risk firewall, future IA, 20-category model, phased ledger, source
hierarchy) plus the Phase-1 slice docs and the vendored canon. This slice reconciles those into
a single senior reference map and confirms the layering is clean:

- **Canon** lives in the current rebuild's vendored canon (pinned `duniterum/TheSyndicate@cf4ca34`)
  and the master map. It is the only thing treated as fact.
- **Three external systems** (Supa-Exchange, entity-chain/x402, Boost) are **architecture/UX/pattern
  references only**. Each carries forbidden framing (yield/APY/seasons/XP/casino/reward-farming) that
  must be rejected; only their *disciplined patterns* (backend/auth/admin shape, entity abstraction,
  metered-API concept, action/validator/allowlist/receipt proof spine) are candidates — never their
  data, numbers, or copy.
- **The rebuild is correctly minimal**: posture-only `/api/source-status` (20 categories, values
  null) + 4 internal fail-closed CLIs (canon-integrity, live-read, token-metadata, archive-posture).
  It contains **zero** live/event/indexer/member/auth surface — by design.

**Verdict:** no Syndicate surface is lost; nothing non-canon has leaked into canon. The right next
move remains *one bounded, internal, read-only proof step at a time*, with the heavier reference
patterns (backend/auth/indexer/entity/x402/action) deferred behind explicit founder decisions.

---

## 2. Source access report (probed this slice)

| Source | Type | Access status (probed) | How inventoried here |
|---|---|---|---|
| Current rebuild workspace | Local repo | **Full read/write access** | Inspected directly (canon, scripts, docs, studio routes, source-status). |
| `duniterum/TheSyndicate` (`main`) | Public GitHub — **canon** | **Reachable (public)** | Via the **local pinned-SHA inventory** already captured (`@cf4ca34`) in the 2.12 read-model doc + vendored canon + `PROVENANCE.md`. No fresh deep re-crawl performed this slice (avoids drift; classified record already local). |
| `duniterum/Supa-Exchange` | Public GitHub — **reference only** | **Reachable (public)** | Classified from founder-provided notes + master map (§1, §2, §3). No code imported. |
| `duniterum/entity-chain` (x402) | Public GitHub — **reference only** | **Reachable (public)** | Classified from founder notes + master map. No code imported. |
| `boostxyz/boost-protocol` | Public GitHub — **reference only** | **Reachable (public)** | Classified from founder notes + master map. No code imported. |
| Avalanche C-Chain RPC | Live verification layer | Reachable via existing CLIs (chainId 43114 verified) | Verification layer only; not re-run as part of this report. |

**Honesty note:** all four repos are reachable now, but this report's external classifications are
sourced from the **founder's already-captured local records**, not a fresh exhaustive re-crawl of
each repo. A deep per-file re-fetch of any repo is available on request as a separate inspection.

---

## 3. Missing access / needs founder link

All repos are reachable, so nothing is *unreachable*. What is **missing as verified truth** (and
must be supplied by the founder as fact, secret, decision, or link) before the relevant phase:

| Missing input | Blocks | Why it cannot be guessed |
|---|---|---|
| RPC provider / secret (production) | Any live read beyond the CLIs | Must be a founder-supplied secret, never invented. |
| Verified live-state of MembershipSaleV3 address | Sale surface (Phase 8) | Address is vendored; its *live sale state* is unverified. |
| Treasury / wallet balances + routing proof (tx-anchored) | Treasury/economy (Phase 7) | Requires indexer + founder anchor; never fabricated. |
| Indexer ownership + design | Events/holders/freshness (Phase 4–5) | Net-new; no indexer exists anywhere in workspace. |
| Auth provider + DB choice | Backend/member/founder (Phase 3, 9, 10) | Founder decision. |
| Member identity / privacy policy | Member history + PII (Phase 6, 9) | **Default: no PII** until founder rules. |
| Recognition formula | Recognition (Phase 5) | Founder-owned logic. |
| x402 / metered-API revenue decision | Entities/API (Phase 11) | Founder revenue decision. |
| Exchange/marketplace decision | `/exchange` (Phase 12) | Founder + real DEX only. |
| Final docs/FAQ/whitepaper source-of-truth | Docs lock (near MVP) | Drafts are raw material; final claims need founder verification. |

---

## 4. Sources inspected

- **Current rebuild:** `artifacts/api-server/src/canon/the-syndicate/**` (archive, chain, contracts,
  abi, proof, `PROVENANCE.md`), `src/data/sourceStatus.ts`, `scripts/*.ts` (4 CLIs),
  `artifacts/studio/src/App.tsx` + `src/pages/*`, `docs/*.md`, package scripts.
- **Planning canon:** `the-syndicate-master-operating-map.md` (§1–§10).
- **Prior slice docs:** `phase1-slice-2.10-readiness-map.md`, `phase1-slice-2.12-readmodel-reconciliation.md`,
  `phase1-slice-2.14-archive-posture-and-future-surface-inventory.md`.
- **Founder notes:** `attached_assets/*.txt` (Supa/entity-chain/Boost descriptions, source hierarchy,
  forbidden-framing rules, slice acceptances).
- **Access probe:** GitHub landing pages of the 4 repos (reachability only).

---

## 5. Canonical address inventory (roles only — no raw hex)

Source files: `contracts/contract-registry.ts` and `contracts/syndicate-config.ts` (vendored canon).
Columns: **Canon status** = registry status; **Rebuild** = vendored locally?; **Live-read** = has it
been on-chain-verified by a CLI this far?; **Exposure** = how it may surface.

| # | Item / role | Canon status | Rebuild vendored | Live-read status | Exposure class | Notes / risk |
|---|---|---|---|---|---|---|
| 1 | **SYN token** (ERC-20) | LIVE | Yes | **Verified deployed** + metadata (decimals **18**) | PUBLIC_PROOF (via explorer link) | Strong canon (TOKEN_SPEC). |
| 2 | **USDC token** (stablecoin) | LIVE | Yes | **Verified** (decimals **6**, read-as-is) | PUBLIC_PROOF | No token-metadata canon → report as-read, never mint canon. |
| 3 | **MembershipSaleV1** (sale) | sealed/historical | Yes | Not read | INSTITUTIONAL_PUBLIC_SALE_SAFE | Historical origin record. |
| 4 | **MembershipSaleV2a** (sale) | historical | Yes | Not read | INSTITUTIONAL_PUBLIC_SALE_SAFE | Historical. |
| 5 | **MembershipSaleV2b** (sale) | LIVE (paused) | Yes | Not read | INSTITUTIONAL_PUBLIC_SALE_SAFE | Paused. |
| 6 | **MembershipSaleV3** (sale) | LIVE (active target) | Yes | **Not yet verified** | INSTITUTIONAL_PUBLIC_SALE_SAFE | Phase 8; live-state gate. |
| 7 | **CommissionRouterV1** | PENDING | Yes | Not read | FOUNDER_DECISION | Pending. |
| 8 | **SourceRegistryV1** | DEPLOYED | Yes | Not read | SAFE_PUBLIC | Source attribution (Phase 5). |
| 9 | **Archive1155** | LIVE | Yes | **Verified deployed + posture (ids 1–8; id 9 NOT_CONFIGURED)** | PUBLIC_MEMORY_SAFE | Slice 2.14 posture confirmed. |
| 10 | **SeatRecord721** | PENDING | Yes | Not read | SAFE_PUBLIC | Archive id 2 reserved → future ERC-721. |
| 11 | **Trader Joe SYN/USDC LP pair** | LIVE | Yes | Not read | ECONOMIC_DASHBOARD_SAFE | DEX is external; link out only. |
| 12 | **Vault wallet** (reserve) | LIVE | Yes | Not read | **DO_NOT_EXPOSE_RAW** / aggregate-only | Treasury/wallet PII rule. |
| 13 | **Liquidity wallet** | LIVE | Yes | Not read | **DO_NOT_EXPOSE_RAW** / aggregate-only | Same. |
| 14 | **Operations/Community wallet** | LIVE | Yes | Not read | **DO_NOT_EXPOSE_RAW** / aggregate-only | Same. |
| 15 | **Founder wallet** | LIVE | Yes | Not read | **DO_NOT_EXPOSE_RAW** / founder-only | Same. |
| 16 | **Membership SYN distribution wallet** | LIVE | Yes | Not read | **DO_NOT_EXPOSE_RAW** / aggregate-only | Same. |
| 17 | **SYN burn address** (standard dead) | canon | Yes | Not read (snapshot possible via `balanceOf`) | PUBLIC_PROOF | Burn *history* needs an ERC-20 `Transfer` fragment + indexer. |
| 18 | **Proof of Fire #001** (founder burn tx) | canon | Yes | Not read | PUBLIC_PROOF (tx hash) | Signature proof artifact (Phase 5). |

**Rule reaffirmed:** no external (Supa/entity-chain/Boost) address is ever printed as Syndicate
canon. None were found that qualify; if any exist they are external/reference only.

---

## 6. Full link inventory

| Link / route | Class | Status |
|---|---|---|
| `/` (studio `PublicHome`) | **Current rebuild route** (canon) | Live in rebuild |
| `/studio`, `/proof`, `/proof-studio`, `/member`, `/status` | Current rebuild console routes | Live (posture/placeholder) |
| `/founder`, `/source`, `/recognition`, `/learning` | Current rebuild routes (`PlaceholderPage`) | Stub |
| `GET /api/healthz` | Current rebuild API | Live (real health) |
| `GET /api/source-status` | Current rebuild API | Live (POSTURE_ONLY, 20 cats, values null) |
| `/home /join /token /economy /treasury /archive /chronicle /contracts /entities /indexer /guardrails` | **Future canon routes** (master map §4) | Planned, not built |
| `/exchange` (swap) | Future, **founder-approval-gated** | Deferred (no real product) |
| `/api` (x402 metered) | Future, **founder-revenue-gated** | Deferred |
| Snowtrace / Avascan / Routescan builders | Explorer links (canon `chain-registry.ts`) | Canon, safe public proof |
| Trader Joe SYN/USDC LP | External DEX link | Reference/external (link out only) |
| `github.com/duniterum/TheSyndicate` | **Canon source repo** | Reachable (public) |
| `github.com/duniterum/Supa-Exchange` | **Supa reference** | Reachable (reference-only) |
| `github.com/duniterum/entity-chain` | **entity-chain/x402 reference** | Reachable (reference-only) |
| `github.com/boostxyz/boost-protocol` | **Boost reference** | Reachable (reference-only) |
| `learn/docs/whitepaper`, `apps/product-os-studio/docs/` (in old-main) | Docs/raw material | Reference; not finalized |

---

## 7. Page / surface map

Classification keys: **MVP-now** (built or imminent) · **MVP-later** · **post-MVP** · plus gate flags.

| Surface | Audience | Tier | Gates |
|---|---|---|---|
| Public homepage `/` | public | **MVP-now** (built) | copy scrub |
| `/status` truth hub | public/internal | **MVP-now** (built/binding) | none |
| `/guardrails` (internal) | internal | MVP-now | none |
| `/contracts` (address/ABI truth) | public | MVP-now→later | verified-addr labels only |
| `/learning` / `/chronicle` (static canon) | public | MVP-later | admission rules |
| `/proof` (events/tx/Proof of Fire) | public | MVP-later | RPC + indexer |
| `/source` (verified introduction) | public | MVP-later | indexer + anonymize |
| `/recognition` (standing/merit) | public | MVP-later | **formula = founder** + indexer |
| `/archive` (Archive1155 + artifact detail + media/URI) | public | MVP-later | Archive addr (verified); **URI unreadable on-chain today** → media pipeline gate |
| `/join` (membership/sale) | public→member | post-MVP | V3 addr + RPC + copy scrub |
| `/token` `/economy` `/treasury` (routing/Proof-of-Fire economics) | public/dashboard | post-MVP | RPC + indexer + scrub |
| `/member` (cockpit, receipts/statements, source status, settings/privacy) | member | post-MVP | **real auth + privacy gate** |
| `/founder` (operator console + approvals) | founder | post-MVP | **real auth + roles** |
| `/entities` (entity meta-registry) | internal | post-MVP | concept lock (entity-chain ref) |
| `/indexer` (data health) | internal/operator | post-MVP | indexer design |
| `/exchange` (swap/marketplace) | public | **reference-only / do-not-build** unless approved | founder approval + real DEX |

---

## 8. Backend capability map

| Capability | In rebuild | In old-main | Supa ref | entity/Boost ref | Tier | Gate |
|---|---|---|---|---|---|---|
| Health endpoint | **Yes** (`/api/healthz`) | — | — | — | MVP-now | none |
| Posture status (no values) | **Yes** (`/api/source-status`) | data-posture | data-posture pattern | — | MVP-now | none |
| Internal fail-closed chain CLIs | **Yes** (4 CLIs) | viem hooks (browser) | — | — | MVP-now | none |
| Auth / session | No | No (no real auth) | **Yes** (session blueprint) | — | Phase 3 | auth provider |
| DB / schema | No (Drizzle present, empty) | No | **Yes** (Drizzle/Postgres) | entity explorer schema | Phase 3 | DB choice |
| Admin / operator console | No | studio (simulated) | **Yes** (admin) | — | Phase 3/10 | real auth |
| Referral / source attribution | No | source-* | **Yes** (referral + Merkle) | — | Phase 5 | indexer + anonymize |
| Proof validation (action/validator/allowlist/receipt) | No | proof/source | Merkle claim | **Boost pattern** | Phase 5 | pattern-only, drop payouts |
| Event scan / indexer | No | burn-event scan (browser) | — | — | Phase 4 | indexer design + ABI events |
| Statement / receipt exports | No | source-attributed-receipts | billable sessions | — | Phase 6–9 | auth + privacy |
| Metered API (x402) | No | — | `ai_billable_sessions` | **x402Verifier** | Phase 11 | **founder revenue decision** |
| Entity registry | No | registries | — | **entity-chain concept** | Phase 11 | concept lock |
| Webhooks / cron / workers | No | No | possibly | — | future | per-feature |

---

## 9. Data / source classification matrix (representative)

| Item | Classification | Gates |
|---|---|---|
| Chain (43114) | Syndicate canon + verified live truth | none |
| SYN/USDC token metadata | Verified live truth (SYN canon; USDC as-read) | none |
| Contract registry addresses | Vendored proof subset (canon) | live-verify per-addr |
| Archive1155 posture (ids 1–9) | Verified live truth (subset) + canon | none |
| Member history / wallets (#1–#8 freeze) | Syndicate canon **but PII** | **privacy policy + founder publish** |
| Treasury 70/20/10 routing | Canon doctrine, **needs tx anchor** | indexer + anchor |
| Recognition standing | Canon concept, **formula missing** | founder formula |
| Supa backend/auth/admin/referral/Merkle | **Backend architecture reference** | strip reward/yield |
| entity-chain entity + x402 | **Concept reference** | reject APY/sim numbers |
| Boost action/validator/allowlist/receipt | **Pattern reference** | drop incentive economics |
| Docs/FAQ/whitepaper drafts | **Docs-only raw material** | finalize near MVP lock |
| Mock data / simulated roles / fake-live | **Unsafe / reject** | never import |

---

## 10. Current rebuild inventory

- **Vendored canon** (`artifacts/api-server/src/canon/the-syndicate`): `archive/archive-id-registry.ts`
  (ids 1–9), `chain/chain-registry.ts` (43114 + explorer builders), `contracts/contract-registry.ts`
  (15 keyed entries), `contracts/syndicate-config.ts` (token spec, allocations, ranks, addresses,
  burn, Proof of Fire), `contracts/abi/sale-abi.ts` (+ events), `contracts/abi/archive-nft-abi.ts`,
  `proof/protocol-event-registry.ts`, `index.ts`, `PROVENANCE.md` (pinned `@cf4ca34`).
- **Status model:** `src/data/sourceStatus.ts` — 20 categories, `POSTURE_ONLY`, values null.
- **CLIs:** `verify-canon-integrity.ts`, `avalanche-live-read-check.ts`,
  `avalanche-token-metadata-check.ts`, `avalanche-archive-posture-check.ts` (+ guards).
- **Studio routes:** `/` public; `/studio /proof /proof-studio /member /status` console; `/founder
  /source /recognition /learning` placeholders; `*` NotFound.
- **Docs:** slice 2.10, 2.12, 2.14, (this) 2.15.

---

## 11. Old-main / TheSyndicate main inventory (from pinned-SHA record)

Two trees (per 2.12 doc): **`src/` (root)** = the *real production app* (TanStack Start + viem/wagmi)
holding live read-model hooks (sale/activity/holder/archive reads, burn-event scan, source policy,
transparency/verify) — **browser client hooks, not server modules**; and **`apps/product-os-studio/`**
= a *simulated mirror* carrying the doctrine (public-proof matrix, role-visibility matrix, production
boundary, known-simulations ledger, adapter seams). Canon facts (registries, ABIs, constants) are the
only parts vendored. Member-personal data, write/mint paths, and browser hooks are **not** ported.

---

## 12. Supa-Exchange fit analysis (reference-only)

| Fits TheSyndicate (architecture only) | Reject (framing/product) |
|---|---|
| Express + Drizzle/Postgres + Zod + **session auth** backend blueprint | Swap / DEX product |
| **Admin / operator console** shape | Yield / Seasons / XP / Quests / Badges / Tiers / Leaderboards |
| **Referral schema** → `/source` (anonymized) | Rewards / DCA / gamification |
| **Merkle claim proofs** → eligibility proof | Any reward/casino framing or copy |
| Object-storage patterns; `ai_billable_sessions` → x402 concept | Importing data/numbers as live |

**Confusion risk:** never let Supa product surfaces read as Syndicate canon. Adopt *structure*, not
*surfaces*.

---

## 13. entity-chain / x402 fit analysis (reference-only)

| May inspire (concept) | Does not fit / reject |
|---|---|
| **Entity** abstraction unifying members/sources/contracts/archives → `entities` | "14 passive income streams", 18.5% APY, staking |
| **x402 metered pay-per-use API** → non-yield revenue *option* | Simulated chain data / simulated rewards |
| Explorer schema *shape* | Any yield/passive-income framing |

**Requires separate design later** + an explicit **founder revenue decision** before any x402 work.

---

## 14. Boost / proof-action fit analysis (reference-only)

| May inspire (pattern) | Risk / reject |
|---|---|
| **Action registry** → verifiable member/protocol action | Incentive/reward economics (ERC20/1155/Points payout) |
| **Validator** → proof of an action | Reward farming / campaign-as-payout |
| **AllowList** → gating; **Receipt** → attestation | Casino / airdrop-farming framing |
| RBAC + clone-factory registry shape | — |

**Keep institutional:** adopt the *proof/eligibility/action spine*, drop all payout/incentive modules.

---

## 15. Docs / FAQ / whitepaper backlog (collect + classify only — not finalized)

| Raw claim family | Classification | Action |
|---|---|---|
| Chain = Avalanche 43114 | **Verified by live read** | safe final-docs candidate |
| SYN decimals 18 / USDC decimals 6 | **Verified by live read** | safe candidate (USDC as-read) |
| Contract roster (roles) | **Verified by canon** (addresses pinned) | per-addr live-verify before "LIVE" |
| Archive1155 has 9 ids; ids 1–8 configured | **Verified by canon + live posture** | safe candidate |
| Treasury 70/20/10 routing | **Needs verification** (tx anchor) | future / rewrite later |
| Recognition / standing model | **Future / not built** | needs founder formula |
| Any profit/ROI/yield/passive/payout claim | **Unsafe / legal risk** | **delete / never publish** |
| Member roster / wallets | **Unsafe until privacy policy** | gate |

**Final-docs doctrine:** finalize docs/FAQ/whitepaper only near MVP lock, after live routes/API/canon/
proof surfaces are verified. No promotional copy now.

---

## 16. MVP fit matrix

| Tier | Surfaces |
|---|---|
| **MVP now** | `/` homepage, `/status` truth hub, `/guardrails`, `/contracts` (registry-only labels), internal CLIs, posture API |
| **MVP later** | `/proof`, `/source`, `/recognition`, `/archive` (+ artifact detail), `/learning`, `/chronicle` — all need RPC/indexer/anonymize + (archive) a media pipeline |
| **Post-MVP** | `/join` (sale), `/token` `/economy` `/treasury`, `/member` (auth), `/founder` (auth), `/entities`, `/indexer` |
| **Reference-only / do-not-build (unless approved)** | `/exchange` (swap/marketplace), `/api` x402 |

---

## 17. Future surface preservation map (no-loss)

Every preserved surface and its source/phase/gate is captured in `the-syndicate-master-operating-map.md`
§2 (No-loss Preservation Map) and §4 (Future IA), and — for the Archive specifically — in
`phase1-slice-2.14-…inventory.md` §2. **Nothing is erased for not being MVP.** Preserved-not-built:
sale/join, tokenomics, SYN/USDC accounting, USDC routing, treasury, member history (PII-gated),
proof/event systems, Proof of Fire, source/referral, recognition, Archive1155 + chronicle,
transparency/tx-proof, economy dashboards, Member OS, founder/operator cockpit, backend/admin/auth,
entity registry, x402, Boost action/validator/allowlist/receipt.

---

## 18. Unsafe / do-not-copy list

- **Copy/framing:** guaranteed profit/return, ROI, passive income, yield, payout, jackpot, betting/
  wagering, reward farming, liquidity-mining hype, "buy for upside", casino FOMO, airdrop farming.
- **Data:** mock/`mock-data.ts`, simulated values rendered as live, fake freshness, `SIMULATED`/
  `LIVE_READ`/`PROTOTYPE` posture pre-verification, unverified `LIVE` status.
- **Surfaces:** Supa swap/yield/seasons/XP/quests/badges/tiers/leaderboards/DCA/gamification;
  entity-chain APY/14-streams/staking/simulated chain; Boost incentive/reward/points payout modules.
- **Security/privacy:** public PII (member names/wallets), raw wallet/treasury/owner/holder addresses,
  simulated role-gating treated as auth, RPC-as-secret-in-code.
- **Process:** branch wholesale merge; treating any external reference as canon; importing external
  code/data into TheSyndicate.

---

## 19. Recommended staged roadmap

Adopt the master map's **Phased Build Ledger** (§6) unchanged: 0 plan/canon-lock → 1 truth/status
spine → 2 UI binding + guardrails → 3 backend/auth/admin → 4 RPC/contracts/indexer verification →
5 proof/source/recognition → 6 archive/chronicle/member-history → 7 token/economy/treasury → 8 sale/
join → 9 Member OS → 10 founder/operator → 11 entities/x402 (if approved) → 12 exchange (if approved).
We are inside **Phase 1**, having completed the posture spine + internal read-only verification CLIs
(canon-integrity, live-read, token-metadata, archive-posture).

---

## 20. Next recommended implementation slice

**Slice 2.16 — Internal CLI-only Registry↔Chain Reconciliation (report/exit-code only).** All inputs
now exist: compare each `contract-registry` entry's declared status/flags against on-chain reality
(`getCode` presence; Archive `getArtifactCore.configured`; token metadata) and emit a posture-only
reconciliation (`MATCH` / `DRIFT` / `UNVERIFIED`), fail-closed, address-free — **no served route, no
`/api/source-status` change, no UI, no events/indexer, no member/auth/treasury/sale/LP reads.** It is
the smallest next proof step and was the founder's previously-flagged direction (now explicitly held
until approved).

**Alternative (founder-decision gate, not code):** lock the early decisions that unblock Phases 3–4 —
RPC secret ownership, indexer ownership/design, auth provider + DB choice, and the member/PII privacy
default. None block Phase 1, but locking them prevents rework.

---

## 21. Open questions

1. Should Slice 2.16 be the internal reconciliation CLI, or should we pause for the founder-decision
   gate first?
2. Member/PII privacy default — confirm "no PII until policy"?
3. RPC provider + secret ownership (who supplies, when)?
4. Indexer ownership/design (required before any event/holder/history surface)?
5. Auth provider + DB choice (gates Phase 3)?
6. Recognition formula owner + definition (gates Phase 5)?
7. x402 / metered-API revenue: pursue as a concept, or shelve?
8. Archive media/URI: since on-chain `uri()` is currently unreadable, is a future media pipeline in
   scope, or is the Archive a registry/posture surface only for MVP?

---

### Verification (this slice)

- **No product/served-code change.** No source/route/API/UI/`/api/source-status`/canon/live-read/
  import behavior was changed.
- The git diff contains: this report (the deliverable), routine **agent-memory bookkeeping** under
  `.agents/` (not served code), and the founder's own pasted `attached_assets/*` inputs (not a
  deliverable change). No file under `artifacts/**` or `lib/**` changed.
- `/api/source-status` unchanged: `POSTURE_ONLY`, 20 categories.
- Guards re-run green: canon-integrity, live-read, token-metadata, archive-posture. Both typechecks
  (api-server, studio) clean.
