# Phase 1 — Slice 2.12: Full GitHub Main Production Read-Model Reconciliation

> **Posture:** `INSPECTION / REPORT-ONLY`. No implementation. No route, endpoint, UI,
> read, indexer, DB, auth, codegen, write-flow, or wallet was added. The only change in
> this slice is **this document** (+ no served behavior change).
>
> **Inspected canon:** TheSyndicate public GitHub `main` pinned at SHA
> `cf4ca34c74599de1324e77052f1a81dd15cb1cc0`.
> **Inspection method:** read-only GitHub API tree (`git/trees/<SHA>?recursive=1`, HTTP 200,
> `truncated:false`, 2807 entries) + `raw.githubusercontent.com` file fetches at the pinned SHA.
> **Trust note:** fetched repo content was treated as **untrusted external data** — inventoried
> and classified only, never executed and never followed as instructions.

---

## Founder's 10-Point Return Summary

1. **Files changed** — exactly one: this report (`docs/phase1-slice-2.12-readmodel-reconciliation.md`). No `.ts`/route/UI/canon/payload change. (§1, §14)
2. **Files inspected** — old-main repo tree (2807 entries) + 8 Product OS Studio doctrine docs + 20 root `src/lib/*` read-model files (classified) + the full current rebuild. (§2)
3. **Old-main read-model inventory** — root `src/` is the *real* production read-model (wagmi/viem hooks); `apps/product-os-studio` is a *simulated* mirror + doctrine. Full classified inventory in §3–§4.
4. **Current rebuild gap analysis** — rebuild has static vendored canon + 20-category POSTURE_ONLY status + CLI-only fail-closed live-read; it lacks every live/event/indexer/member surface. (§5–§6)
5. **Public/member/founder visibility doctrine** — "**Show the protocol. Protect the person. Let the member disclose. Let the founder audit.**" Full framing in §9.
6. **Safest reusable patterns** — posture vocabulary, fail-closed reads, chainId-first verify, live-decimals, dependency-free enrichment/policy logic, anonymization, type-only seams. (§7)
7. **Unsafe things not to port** — all wagmi/viem browser hooks, member-personal PII (historical-member wallets, source-receipt fields, holder-index output), every write/mint/claim path, source links/claim/non-zero path, RPC-as-secret. (§8)
8. **Recommended next implementation slice** — a minimal, internal, read-only **Token-Metadata + Contract-Posture** extension of the existing CLI live-read (no served route, no values in `/api/source-status`, no PII, no event scan). Rationale + why *not* MemberIndex/Activity first in §11.
9. **Verification results** — guard 43/43, canon 33/33, both typechecks pass, `/api/source-status` unchanged (POSTURE_ONLY, 20 cats, `value:null`), diff is docs-only. (§14)
10. **Remaining open questions** — founder decisions on served-vs-internal posture, indexer ownership, ABI event-completeness, auth timing, member-disclosure design. (§15)

---

## 1. Executive Verdict

The premise of this slice is confirmed: **old production read-model machinery is not absent — it is extensive, and it already exists in the public `main` repo.** It lives in **two distinct trees**, and the distinction is the single most important finding:

- **`src/` (repo root)** — the **real production app** (TanStack Start + `viem`/`wagmi`). This is where the genuine read-model machinery lives: wallet gating, RPC/chain reads, sale/activity/holder hooks, archive reads, burn-event scanning, source-policy observability, transparency/verify logic. These are **browser client hooks**, not server modules.
- **`apps/product-os-studio/`** — a **simulated mirror** (Vite + React) that contains **no live data** but carries the **doctrine**: the public-proof matrix, role-visibility matrix, production boundary, known-simulations ledger, adapter seams, live-read reality layer, and the bridge/porting map.

The current rebuild is a **clean posture/proof vessel**: it has safely vendored the *static canon* (registries, ABIs, constants) and exposes a *posture-only* status model (20 categories, `value:null`) plus a *CLI-only, fail-closed* live-read. It contains **zero** of the old read-model's live behavior — by design.

**Verdict:** the rebuild is correctly positioned. The right next move is **not** to port the old read-model wholesale (it is browser-bound, write-adjacent, and member-personal in places), but to graduate **one bounded, non-personal, read-only** seam at a time, server-side, behind explicit founder approval. The old-main porting map's own "first adapter = MemberIndex + Activity" recommendation is **wrong for this rebuild's current phase** because both produce member-personal data and require an event indexer + auth. A safer first adapter is identified in §11.

---

## 2. Files Inspected

### Old-main repo (pinned SHA), structure
- Repo tree via GitHub API: 2807 entries, not truncated. Confirmed monorepo: `src/` (production app), `apps/product-os-studio/` (simulated mirror, 203 paths), `contracts/` (Solidity + scripts), `src/lib/__tests__/`.

### Old-main Product OS Studio doctrine docs (fetched + read in full)
- `apps/product-os-studio/docs/STUDIO_PUBLIC_PROOF_MATRIX.md`
- `apps/product-os-studio/docs/STUDIO_ROLE_VISIBILITY_MATRIX.md`
- `apps/product-os-studio/docs/PRODUCTION_BOUNDARY.md`
- `apps/product-os-studio/docs/STUDIO_KNOWN_SIMULATIONS.md`
- `apps/product-os-studio/docs/STUDIO_LIVE_READ_REALITY_LAYER.md`
- `apps/product-os-studio/docs/STUDIO_ADAPTER_SEAMS.md`
- `apps/product-os-studio/docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`
- `apps/product-os-studio/STATUS.md`
- **Present but not deep-read** (header-confirmed in tree): `STUDIO_BRIDGE_READINESS_AUDIT.md`, `STUDIO_DATA_MODEL_MAP.md`, `STUDIO_PRODUCTION_ADAPTATION_PLAN.md`, `STUDIO_ROUTE_MAP.md`, `STUDIO_COMPONENT_MAP.md`, `STUDIO_COVERAGE_RECONCILIATION.md`, `STUDIO_LEDGER_REGISTER_ARCHITECTURE.md`, `STUDIO_ACTION_TOOLKIT_MAP.md`, `STUDIO_QA_SECURITY_BUG_AUDIT.md`, `STUDIO_ADAPTER_SEAMS.md`, `STUDIO_PROMOTION_TO_ROOT.md`, `STUDIO_CODEX_HANDOFF.md`, `CODEX_BRIDGE_CONTRACT.md`, `DO_NOT_MERGE_TO_PRODUCTION.md`, `REPLIT_SYNC_GUIDE.md`.

### Old-main production read-model files (fetched + classified by dependency footprint)
All 20 founder-listed `src/lib/*` read-model files were fetched and classified (wagmi / viem / react / react-query / DOM / localStorage usage): `wagmi.ts`, `useWalletGate.ts`, `wallet-freshness.ts`, `chain-time.ts`, `archive-rpc-health.ts`, `freshness-signals.ts`, `sale-hooks.ts`, `activity-hooks.ts`, `onchain-events.ts`, `protocol-events.ts`, `holder-index.ts`, `v3-historical-members.ts`, `archive-nft-hooks.ts`, `archive-safe-reads.ts`, `archive-mint-events.ts`, `syn-burn-events.ts`, `source-policy-observability.ts`, `source-registry-lifecycle.ts`, `protocol-truth.ts`, `data-verification-registry.ts`. (Founder-listed components/routes confirmed present in the tree and inventoried via the porting map; not individually re-fetched because the porting map already documents their behavior.)

### Actual-path notes (where founder list differs from repo)
- Founder listed `apps/product-os-studio/docs/...` for some files and `src/lib/...` for others. **Both trees exist.** The doctrine docs are under `apps/product-os-studio/docs/`; the production read-model is under repo-root `src/lib/`.
- `contract-registry` resolves to **two** files: production `src/lib/contract-registry.ts` and the Studio mirror `apps/product-os-studio/src/lib/protocol-truth-registry.ts`.
- `syn-burn-events` has a companion `src/lib/syn-burn-events-cache.ts` (local cache).
- Several listed libs have `__tests__` (e.g. `wallet-freshness`, `holder-index`, `syn-burn-events`, `source-policy-observability`, `source-registry-lifecycle`, `protocol-event-registry`, `chain-registry`, `explorer-preference`, `v3-historical-members`).

### Current rebuild
- `artifacts/api-server/src/**` (app, routes, data, vendored canon, scripts), `artifacts/studio/src/**` (pages, config spine, components), root `the-syndicate-master-operating-map.md`, `docs/phase1-slice-2.10-readiness-map.md`.

---

## 3. Old-Main Production Read-Model Inventory (root `src/lib/`)

Classification legend: **BROWSER** = depends on wagmi/viem/react hooks (client runtime); **PURE** = dependency-free logic (server-adaptable); **PII** = carries member/source-personal data; **WRITE-ADJ** = part of, or supports, a write flow.

### 3a. Wallet / network / read infrastructure
| File | LOC | Footprint | Class | Notes |
|---|---|---|---|---|
| `wagmi.ts` | 66 | wagmi+viem | BROWSER | `wagmiConfig`, injected connector, RPC `fallback`. Pure client config. |
| `useWalletGate.ts` | 119 | wagmi+react | BROWSER, WRITE-ADJ | Action gate (`unsupported/disconnected/wrongNetwork/ready`) + connect/switch/disconnect. Reusable **state vocabulary**, not the code. |
| `wallet-freshness.ts` | 118 | DOM | BROWSER, WRITE-ADJ | Pre-write freshness checks for sale/mint. Write-flow support → out of scope now. |
| `chain-time.ts` | 126 | wagmi+react-query | BROWSER | Shared chain-tip reads. Concept adaptable server-side (tip via RPC). |
| `archive-rpc-health.ts` | 100 | wagmi+react | BROWSER | `eth_chainId` health probe. **Same fail-closed idea already in the rebuild's 2.11 CLI.** |
| `freshness-signals.ts` | 142 | react+react-query | BROWSER | Combines RPC head / event head / indexer / lag. Concept feeds a future `indexer`/`status` posture. |

### 3b. Sale / member / activity read model
| File | LOC | Footprint | Class | Notes |
|---|---|---|---|---|
| `sale-hooks.ts` | 627 | wagmi+viem+react-query | BROWSER, WRITE-ADJ | `useSaleStats/useUserBalances/useWalletEraCap/useBuyerPurchaseTotals/useQuoteSyn/useLpStats/useAllocationBalances` + `ZERO_SOURCE_ID`. Quote/stats are read; they feed buy. |
| `activity-hooks.ts` | 602 | wagmi+viem+react-query+DOM | BROWSER, **PII** | `useLivePurchaseEvents`: V1/V2a/V2b/V3 purchase-event scan; parses `MembershipPurchasedV3` **incl. source-receipt fields**; chunked 2k-block scans, reorg overlap, cache. This is the **event-indexer core** and a **privacy landmine**. |
| `onchain-events.ts` | 353 | viem+react-query | BROWSER | `useUsdcFlows/useLpSwaps/useLpLiquidityEvents/firstSeenBuyers`. Event scans → ADAPTER REQUIRED. |
| `protocol-events.ts` | 464 | react (no wagmi/viem) | **PURE** (mostly) | `useProtocolEvents` unifier + `enrichEvent` (category/labels/verification link/status/metric effects/chronicle eligibility/recommended surfaces). The **enrichment/taxonomy layer is server-adaptable** (minus the data source). |
| `holder-index.ts` | 364 | react+DOM | BROWSER, **PII** | `buildHolderIndex()` is a pure derive-from-events function, but its **output is member-personal** (wallet, rank, capital footprint, chapter, eligibility). Aggregate-only for public. |
| `v3-historical-members.ts` | 39 | none | **PURE, PII** | Frozen historical members #1–#8, **real wallets**, block `88496414`. Canon input but **never public, never served raw**. |

### 3c. Archive / burn / source / transparency
| File | LOC | Footprint | Class | Notes |
|---|---|---|---|---|
| `archive-nft-hooks.ts` | 254 | wagmi+viem | BROWSER | Read-only aggregate Archive reads. **Best-practice rule: "unknown stays unknown; unreadable pause ≠ mint open."** |
| `archive-safe-reads.ts` | 102 | wagmi | BROWSER | Safer granular Archive reads. Fail-closed pattern. |
| `archive-mint-events.ts` | 114 | wagmi+viem+react-query | BROWSER | Archive mint-event scanner → ADAPTER REQUIRED (event scan). |
| `syn-burn-events.ts` (+ `-cache.ts`) | 168 | wagmi+viem+react-query | BROWSER | `useSynBurnEvents` scans SYN `Transfer`→burn address; `assignProofOfFireNumbers` **numbers only when scan is complete + gapless**; distinguishes Founder vs community burn. Excellent **fail-closed numbering** pattern. |
| `source-policy-observability.ts` | 433 | none | **PURE** | `ZERO_SOURCE_ID`, `INTERNAL_PROTOCOL_TEST_SOURCE_001`, `CURRENT_SOURCE_POLICY_SNAPSHOT`, `buildSourcePolicySnapshot()`, capability map. Source is **PAUSED** — observability only, no payouts. Server-adaptable. |
| `source-registry-lifecycle.ts` | 224 | none | **PURE** | Lifecycle event vocabulary + public boundary summaries. Server-adaptable. |
| `protocol-truth.ts` | 324 | viem (checksum only) | **PURE** (mostly) | Transparency truth registry. Logic adaptable; drop chain reads. |
| `data-verification-registry.ts` | 105 | none | **PURE** | "Verify everything" claim registry. Drives a transparency/verify surface. Server-adaptable. |

### 3d. Canonical constants / ABIs (from the porting map)
- `src/lib/syndicate-config.ts` — `AVALANCHE_CHAIN_ID = 43114`, RPC config (HTTPS-only, comments warn `VITE_` RPC is browser-visible), and the deployed contract/wallet constants + `SYN_BURN_ADDRESS` + `PROOF_OF_FIRE_001`.
- `src/lib/sale-abi.ts` (`SALE_ABI/SALE_V2_ABI/SALE_V3_ABI/ERC20_ABI/PAIR_ABI`), `src/lib/archive-nft-abi.ts`, `src/lib/source-registry-abi.ts`.
- (Addresses are intentionally **not duplicated into this report**; they already live, verified, in the rebuild's vendored canon and the porting map.)

---

## 4. Product OS Studio Doctrine Inventory (`apps/product-os-studio/docs/`)

| Doc | Doctrine it donates |
|---|---|
| `PRODUCTION_BOUNDARY.md` | Studio = prototype/blueprint (mock data, simulated roles); Production = chain truth + real routes/reads/guards. **No Studio file is copied into production `src/` as truth.** |
| `STATUS.md` | Posture stack `SIMULATED · PROTOTYPE ONLY · NOT PRODUCTION AUTH · NOT CHAIN TRUTH`; "Safety truths (do not weaken)"; one real read-only EIP-1193 wallet reality layer; everything else simulated or `READ-ONLY PRODUCTION PROOF`. |
| `STUDIO_PUBLIC_PROOF_MATRIX.md` | **Three visibility layers** (public proof / member personal / founder); public↔member mapping declared once so they can't drift; **anonymization rules** (strip personal heartbeat; public recognition board relabels numeric seats to opaque letters; the connect-CTA is the *only* public→personal bridge). |
| `STUDIO_ROLE_VISIBILITY_MATRIX.md` | Roles are **simulated `localStorage` flags — UI gating only, not security**; real access control must be server-side; **founder UI is hidden, not just blocked**; **no silent redirects** (every gate explains itself); one `RouteRequirement` vocabulary drives nav + routes + actions. |
| `STUDIO_KNOWN_SIMULATIONS.md` | The definitive simulated/real line; canonical truths (70/20/10, `ZERO_SOURCE_ID`, doctrine line, status vocab); production-posture vocabulary; **`ADAPTER REQUIRED` never implies a live read**; one real burn `PROOF_OF_FIRE_001`. |
| `STUDIO_LIVE_READ_REALITY_LAYER.md` | The key precedent for safe live reads: **raw EIP-1193 only (no wagmi/viem), read-only, no write path, `isProductionAuth=false`, decimals read live (never hardcode 18), a value is `LIVE READ` only when actually read this session** else it degrades to `ADAPTER REQUIRED`. |
| `STUDIO_ADAPTER_SEAMS.md` | **Type-only** seams (Wallet, ContractRegistry, MembershipSale, MemberIndex, Activity, SourcePolicy, Archive, BurnProof, Transparency) with hard rules baked in: sale `approveUsdc/buy` return `Promise<never>`; burn exposes `proofs()` with **no `execute()`**; source `publicLinkActive/claimUiActive` literal `false`; archive `memoryOnly` literal `true`; `RoutingSplit` `70/20/10`. |
| `STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md` | The **bridge inventory**: production truth inventory, canonical constants, the 8 adapter seams to create, what may be copied vs must-not-be-copied-as-live, and its own (rebuild-inappropriate) "first adapter = MemberIndex + Activity" recommendation. |

**Doctrine through-line:** *the protocol may be proven publicly; the person must be protected; simulation must never masquerade as live; auth is server-side and real, never a localStorage flag.*

---

## 5. Current Rebuild Inventory

### 5a. `artifacts/api-server` (Express 5, Node runtime)
- **Real:** `GET /api/healthz`; `GET /api/source-status` (POSTURE_ONLY — 20 categories, `value:null`, **no addresses**).
- **Vendored static canon** under `src/canon/the-syndicate/`: `archive/archive-id-registry.ts`, `chain/chain-registry.ts`, `contracts/abi/{archive-nft-abi,sale-abi}.ts`, `contracts/contract-registry.ts`, `contracts/syndicate-config.ts`, `proof/protocol-event-registry.ts`, `index.ts`, `PROVENANCE.md`. All **inert**.
- **CLI-only live-read** (`scripts/avalanche-live-read-check.ts`, Slice 2.11): chainId-first (`43114`/`0xa86a`), fail-closed, `eth_getCode` only after verify, emits `{key,deployed,error}` only — **never served**.
- **Guards:** `verify:canon` (PROVENANCE present + pinned SHA cited), `live-read:guard`, `live-read:check`.

### 5b. `artifacts/studio` (React + Vite + wouter + Tailwind v4 + shadcn)
- **Pages:** `PublicHome` (`/`), `Home` (`/studio`), `ProofDashboard`, `ProofStudio`, `MemberAccess`, `SystemStatus` (`/status`), `PlaceholderPage`, `not-found`.
- **Config spine** (`src/config/`): `brand.ts`, `featureFlags.ts`, `modules.ts`, `navigation.ts`, `syndicateFacts.ts`, `truthStatus.ts`.
- **Honesty system:** `TruthLabel`; dual layout (`PublicLayout` + console `Shell`).
- **No wallet, no wagmi/viem, no chain reads, no event scans, no member data.**

### 5c. The 20 source-status categories (current postures)
| Posture | Categories | Count |
|---|---|---|
| `READ_ONLY_PROOF` | chain, contracts, token, archive, guardrails | 5 |
| `NOT_WIRED` | proof, source, membership, treasury, routing, chronicle, learning | 7 |
| `FUTURE` | action, receipt, recognition, economy, entities, indexer, operator | 7 |
| `NOT_LIVE` | sale | 1 |

---

## 6. Gap Analysis (old-main read-model vs current rebuild)

| Dimension | State |
|---|---|
| **What the rebuild already has** | Static vendored canon (registries/ABIs/constants); 20-category posture model (`value:null`); truth-label UI; CLI-only fail-closed live-read (deployed-code existence check); provenance + guard scripts. |
| **What the rebuild lacks (present in old-main)** | Any *served* live read; event scanning (purchase/burn/archive/LP/USDC flows); holder/member index; source-policy snapshot surface; archive aggregate reads; burn-proof numbering; transparency/verify data; freshness signals; a read-only wallet reality layer. |
| **Already safely vendored** | Archive ID registry, chain registry, contract registry (subset), sale + archive ABIs, syndicate-config (source-equivalent w/ documented Node shim), protocol-event-registry. **Canon inputs only — inert.** |
| **Documented but not implemented** | All 8 adapter seams; the live-read reality layer; the event indexer. |
| **Must NOT import directly** | Every wagmi/viem hook (browser runtime ≠ Express server); all write flows; `v3-historical-members` raw wallets; `activity-hooks` source-receipt fields; `holder-index` member-personal output. |

**Net:** the rebuild is a **posture/proof foundation with zero live data**, which is exactly the intended state. The gap to the old read-model is large and **mostly intentional** — closing it means selectively re-deriving *server-side, read-only, non-personal* slices, not importing browser hooks.

---

## 7. Reusable Patterns (safest first)

1. **Posture vocabulary** — old-main's `READ-ONLY PRODUCTION PROOF / ADAPTER REQUIRED / NOT WIRED / SIMULATED` already maps onto the rebuild's `Posture` enum. Keep them reconciled (see §13 drift risk).
2. **Fail-closed reads** — "unknown stays unknown; unreadable pause ≠ mint open" (`archive-nft-hooks`) and "number burns only when the scan is complete + gapless" (`syn-burn-events`). Adopt as **server read principles**.
3. **chainId-first verification** before any read — already in the 2.11 CLI; matches old-main's chain derivation + `archive-rpc-health` `eth_chainId` probe.
4. **Live decimals, never hardcode `18`** (reality layer) — mandatory for any future token-metadata read.
5. **Dependency-free logic layers** — `protocol-events.enrichEvent`, `source-policy-observability`, `source-registry-lifecycle`, `data-verification-registry`, `protocol-truth` (minus chain reads). These are the **only files safe to adapt as code** server-side, because they carry **no browser runtime**.
6. **Anonymization doctrine** — opaque public seats, stripped personal heartbeat, single connect-CTA bridge. Adopt *before* any public surface shows derived data.
7. **Type-only adapter seams** — define server-side adapter interfaces first; implement behind them one at a time (no UI/route rewrite later).
8. **Canonical `70/20/10` routing math** — the only non-simulated number; already canon in the rebuild.

---

## 8. Unsafe / Direct-Port Blockers

- **All wagmi/viem React hooks** — browser client runtime. The api-server is Node/Express; these cannot be imported there. Re-derive read logic against a server RPC client instead.
- **`v3-historical-members.ts`** — real member wallets (**PII**). Never serve raw, never public.
- **`activity-hooks` `MembershipPurchasedV3` source-receipt fields** and **`holder-index` member-personal output** — member/source-personal. Privacy landmine; aggregate-only, behind auth.
- **Every write/mint/approve/buy/burn/claim path** — `LivePurchase`, `MintFirstSignal`, `MintPatronSeal`, `useWriteContract`/`writeContractAsync`/`useWaitForTransactionReceipt`. Forbidden now.
- **Source links / dashboards / claim UI / non-zero `sourceId` / earnings** — source is **PAUSED**; default stays `ZERO_SOURCE_ID`.
- **RPC URLs as secrets** — `VITE_` RPC values are browser-public; never treat as a secret.
- **Unverified DEX/LP links** — must be sourced from an official channel before any use.
- **Any simulated Studio value promoted to look real** — violates the known-simulations ledger.

---

## 9. Public Transparency vs Member Privacy Doctrine

**"Show the protocol. Protect the person. Let the member disclose. Let the founder audit."**

- **Show the protocol (public proof):** aggregate / protocol-level **verified** facts — contract proof, routing proof (70/20/10), archive proof, burn proof, explorer links **when safe**. Numeric seats are relabeled to **opaque letters**; no "since you joined" personal deltas; no wallet/member/source-personal data ever leaks onto a public surface.
- **Protect the person:** member wallets, source wallets, payout wallets, PII, claim data, and raw event history are **never** exposed on a public payload. Public surfaces are aggregate/anonymized by construction.
- **Let the member disclose (member personal):** a connected, **authenticated** member may see **their own** receipts, wallet, seat (numeric, for themselves), statement/tax-style records, and activity. Optional alias/anonymity/disclosure is a **later, opt-in** design.
- **Let the founder audit (operator):** fuller operational truth, but only behind **real server-side auth later**. Founder UI is **hidden, not just blocked**; gates render an explanation — **no silent redirects**.
- **Single bridge:** the only path from a public surface to its personal counterpart is an explicit "connect for your personal view" CTA.

This doctrine is **already honored** by the rebuild today (no wallet, no personal data, posture-only). It becomes load-bearing the moment any derived value is surfaced.

---

## 10. Adapter Dependency Map

Each candidate adapter, with what it depends on and its risk, ordered roughly low→high risk:

| Adapter candidate | Depends on | Net-new work | PII risk | Notes |
|---|---|---|---|---|
| **Contract-posture (status live-verified)** | vendored canon + 2.11 CLI (chainId verify + `eth_getCode`) | minimal | none | Closest to current state; promote CLI posture **without values**. |
| **Token-metadata read** | SYN/USDC addresses (canon) + single `decimals/symbol/name/totalSupply` reads | small, bounded | none | No events, no personal data; live-decimals rule applies. |
| **Transparency (static verify)** | `data-verification-registry` + `protocol-truth` + routing constants (all pure/canon) | small | none | Renders verifiable claims; no chain dependency. |
| **Source-policy (posture only)** | `source-policy-observability` + `source-registry-lifecycle` (pure) | small | low | Source is **PAUSED**; posture-only, no payouts/links. |
| **Burn-proof (read)** | SYN address + burn address (canon) + SYN `Transfer` event scan + gapless-numbering | **event indexer** | low (aggregate) | Needs ERC20 `Transfer` event ABI (see §13 ABI gap). |
| **Archive (read)** | Archive1155 address (canon) + ERC-1155 aggregate single reads | medium | low | Single reads are bounded; mint-event history needs an indexer. |
| **MemberIndex / Activity** | full purchase-event indexer + privacy filter + **auth** | **heavy** | **high** | Produces member-personal data; defer until auth exists. |

---

## 11. Recommended Next Slice (proposal — do NOT implement yet)

**Why not the old porting map's "MemberIndex + Activity first":** both produce member-personal data, require a full purchase-event indexer, and presuppose auth. That is the **highest-PII, highest-effort** path and conflicts with current hard limits.

**Proposed Slice 2.13 — "Internal Token-Metadata + Contract-Posture read adapter (CLI/internal-only)":**
- Extend the existing 2.11 fail-closed CLI live-read to perform **bounded, non-personal, single-call** reads on the **already-vendored** SYN/USDC contracts: `decimals()`, `symbol()`, `name()`, `totalSupply()`, plus re-confirm contract code exists (`eth_getCode`) for vendored addresses.
- **Output posture only** — e.g. `{ key, deployed, verified, error }` — printed by the CLI. **No values enter `/api/source-status`. No addresses in any served payload. No event scan. No write. No new route/endpoint. No DB/auth/codegen. No wallet.**
- **Why it's the safest next step:** it advances "live-verified posture" using machinery the rebuild already has (2.11), introduces **zero** PII and **zero** event scanning, reads only protocol-level token facts, and maps cleanly onto a future `chain`/`token`/`contracts` posture **without surfacing data publicly**.
- **Decimals are read live** (never hardcode `18`), honoring the reality-layer rule.

A *served* read-only contract-posture endpoint, or any archive/burn/member surface, is explicitly **out** until separately founder-approved (current limits forbid new routes/endpoints).

---

## 12. Explicit Non-Goals (restated, enforced this slice)

No new route; no HTTP endpoint; no change to `/api/source-status`; no public UI change; no archive/token/sale/member/source/treasury **reads**; no event scanning; no DB/cache/auth/codegen; no wholesale import of old production routes; no write flows; no approve/buy/mint/burn/claim; no wallet connection; no transaction support; no Supa-Exchange/entity-chain/Boost as data sources; no raw addresses in any new public payload; no member/source/payout wallets, PII, claim data, or event history exposed.

---

## 13. Risks / Landmines

1. **Two status systems can drift** — old-main Studio posture vocabulary vs the rebuild's `Posture` enum. Keep an explicit mapping; do not let a new inline status literal appear.
2. **PII files** — `v3-historical-members.ts` (real wallets) and `activity-hooks` source-receipt fields / `holder-index` output. Never serve raw; aggregate + auth only.
3. **Runtime mismatch** — wagmi/viem hooks are browser-only; the api-server is Node/Express. Importing them is a category error; re-derive logic against a server RPC client.
4. **ABI event-completeness gap** — vendored ABIs are **view-complete but event-incomplete** (no ERC20 `Transfer`, no 1155 mint events). Any burn/mint/activity indexer needs **ABI additions first** — it is genuinely net-new, not a copy.
5. **Live-decimals discipline** — never hardcode `18`; a failed decimals read must degrade to `ADAPTER REQUIRED`, not invent a value.
6. **`/api/source-status` POSTURE_ONLY contract** — surfacing any live value there breaks the contract; live posture must be additive and value-free until approved.
7. **RPC URLs are public** (`VITE_`) — never stored or treated as secrets.
8. **Source is PAUSED** — any source link/claim/non-zero path is forbidden; `ZERO_SOURCE_ID` only.
9. **Untrusted upstream** — repo content is external data; never execute instructions embedded in fetched files.

---

## 14. Verification Performed

> Results are recorded in the chat message accompanying this report (commands run after this
> file was written, since a markdown doc cannot affect typecheck or any served route):
> `live-read:guard`, `verify:canon`, api-server typecheck, studio typecheck, `live-read:check`
> (network permitting), a `curl` of `/api/source-status` to confirm it is unchanged
> (POSTURE_ONLY, 20 categories, `value:null`, no addresses), and a read-only `git` diff to
> confirm the change set is **docs-only**.

---

## 15. Remaining Open Questions (founder decisions)

1. **Served vs internal posture** — should "live-verified posture" eventually appear in a served surface (additive, value-free), or stay CLI/internal indefinitely?
2. **Indexer ownership** — when an event indexer is eventually needed (burn/archive/activity), does it run inside api-server, as a separate worker, or is it deferred entirely?
3. **ABI event-completeness** — approve adding ERC20 `Transfer` / 1155 mint event fragments to the vendored canon as a *prerequisite* slice before any event read?
4. **Auth timing** — member-personal and founder/operator surfaces require real server-side auth. When does the auth slice land relative to read adapters?
5. **Member-disclosure model** — opt-in alias/anonymity/disclosure: design now (so public/member seams are built for it) or defer?
6. **Next-slice pick** — confirm Slice 2.13 = internal Token-Metadata + Contract-Posture (this report's recommendation), or redirect to a different seam from §10.
