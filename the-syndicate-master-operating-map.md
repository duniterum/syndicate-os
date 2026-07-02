# THE SYNDICATE — Canon vs Reference Architecture Decision Map + Phased Build Ledger

> Master operating map (chat-only planning artifact). No code, no files wired, nothing implemented.
> **Doctrine:** Professionalize the business. Do not erase the business.
> Institutional money/protocol machine — verified, truth-labelled, disciplined.
> No fake data, no PII, no profit/yield/ROI/passive/casino framing.

**Verified context baseline**

- TheSyndicate `main` has the full root app + Studio mirror.
- Chain: Avalanche C-Chain, chainId `43114`.
- ABIs exist: `sale-abi.ts`, `archive-nft-abi.ts`.
- Contract registry: **one verified live address**; other addresses UNKNOWN/PENDING.
- Archive1155 registry: **9 IDs**.
- Historical member freeze: **#1–#8** (V1×2 / V2a×3 / V2b×3), block `88496414`, real wallets (`v3-historical-members.ts`).
- Root app stack: TanStack Start + `viem`/`wagmi`. **No DB, no backend, no real auth.** No Supabase, no swap product.
- External references inspected (public, read-only): `boostxyz/boost-protocol`, `duniterum/Supa-Exchange`, `duniterum/entity-chain`.

---

## 1 — Canon vs Reference Decision Map

| Source family | Role | Trust | Adopt | Adapt | Reject | Defer | Risks | Feeds future architecture |
|---|---|---|---|---|---|---|---|---|
| **TheSyndicate `main`** | Canonical repo | **Canon (highest)** | All verified facts, registries, ABIs, doctrine docs | — | — | — | Docs may lag code | The single source of truth for every fact |
| **Root `src/` app** (TanStack Start + viem/wagmi) | The real institutional machine | **Canon (code > docs)** | Registries, sale-abi, chain/contract/archive registries, proof/source/recognition/treasury logic | Surfaces re-bound to truth registry + guardrails | Risk-framed copy (vault/liquidity/revenue/mint FOMO) | Live chain reads until RPC+addresses verified | Real chain calls; some copy in forbidden zone | Becomes the rebuilt public + economic + proof machine |
| **`apps/product-os-studio`** | Simulated mirror | **Pattern only** | Role/surface gating *doctrine*, data-posture taxonomy, route-map | Gating → real auth later | `mock-data.ts`, localStorage roles, demo/stale banners | Operator-console layout ideas | Mock data pretending to be live | Donates the gating + posture model, never its data |
| **Branches / `labs.*`** | Experiments | **Candidate** | Ideas only (reality-map, contribution-recognition, home-candidate) | Re-derive from canon if useful | Wholesale merge (all 42–44 behind main) | Promotion case-by-case | Stale, drift from canon | Idea pool, never bulk-imported |
| **Supa-Exchange** (`duniterum/Supa-Exchange`) | Founder backend reference | **Reference (not canon)** | Express+Drizzle/Postgres+Zod+session **backend blueprint**, admin console, referral schema, Merkle claim proofs, object storage | Referral→`/source`; Merkle→eligibility proof; admin→operator | Swap/DEX, Yield, Seasons/XP/Quests/Badges/Tiers/Leaderboard/Rewards, DCA, gamification | x402 metered API; AI agents | Saturated with yield/reward/casino framing | The missing backend/auth/admin/indexer layer (architecture only) |
| **entity-chain** (`duniterum/entity-chain`) | Founder concept reference | **Reference (not canon)** | "**Entity**" registry concept; **x402 metered-API** model; explorer schema shape | Entities→`entities` bucket; x402→disciplined pay-per-use API | Staking/18.5% APY/"14 passive income streams", simulated chain & rewards | DAO governance concept | Forbidden framing + simulated numbers | Entity abstraction + a non-yield revenue concept |
| **Boost Protocol** (`boostxyz/boost-protocol`) | External pattern reference | **Reference (not canon)** | **Action / Validator / AllowList / Registry** composable proof pattern; RBAC; clone-factory registry | Validator→proof; AllowList→gating; Action→verifiable member action; receipt→attestation | **Incentive/reward** economics (ERC20/1155/Points payout) | Budget→treasury analogy | Incentive modules = reward farming (forbidden) | The proof/eligibility/action spine, minus reward economics |
| **Current Replit app** (`artifacts/studio`) | Clean rebuild foundation | **Working canon (must not break)** | Existing truth-label + config spine + dual-layout shell | Extend `surfaceStatus`/truth registry incrementally | Breaking rebuilds | Big-bang rewrites | Regression if over-edited | The vessel everything ships into, phase by phase |

**Conflict rule:** code/contracts/registries > docs > branches; external references never override canon.

---

## 2 — No-loss Preservation Map

| Work / concept | Source | Why it matters | Future surface | Phase | Risk | Required inputs / gates |
|---|---|---|---|---|---|---|
| Sale / join | root `join`, `sale-abi/hooks`, `JoinPackages`, `LivePurchase` | The actual business (membership sale) | `/join` | 8 | copy FOMO | V3 addr, RPC, copy scrub |
| Tokenomics | `tokenomics`, `TokenomicsDonut`, `contract-registry` | Institutional token mechanics | `/token` | 7 | "returns/APR" wording | scrub vs guardrail |
| SYN / accounting | `chain/contract-registry`, sale events | Token math truth | `/token`, `/economy` | 7 | yield framing | RPC + addresses |
| USDC routing | treasury doctrine (70/20/10) | How money actually moves | `/treasury` | 7 | none | RPC + indexer |
| Treasury / routing | `TREASURY_LEDGER_DOCTRINE.md`, treasury-hooks | Append-only, tx-anchored proof | `/treasury` | 7 | unanchored prose=PENDING | tx-hash anchoring |
| Member history | `institutional-register-registry` | The business roster | `/member`, `/proof` | 6 | **PII** | privacy policy decision |
| **Historical member freeze** | `v3-historical-members.ts` (#1–#8, V1×2/V2a×3/V2b×3, block 88496414, real wallets) | Irreplaceable origin record | `/member`, `/proof` | 6 | **wallet PII** | founder publish decision |
| Proof / event systems | `protocol-event-registry`, `tx-proof`, sale-abi events | Radical-honesty backbone | `/proof` | 5 | none | RPC + indexer |
| Proof of Fire | `fire-ledger`, `ProofOfFireCard` | Signature proof artifact | `/proof` | 5 | none | indexer |
| Source / referral attribution | `referral-attribution`, `source-*` (8 files), `source-attributed-receipts` | Verified-Introduction model | `/source` | 5 | "affiliate income" wording | anonymization |
| Recognition / standing | `recognition-candidates`, `RankHub`, branch `contribution-recognition` | Non-financial merit | `/recognition` | 5 | "rewards/multiplier" | **formula = founder** |
| Archive1155 (9 IDs) | `archive-id-registry`, `archive-nft-abi` | Protocol memory artifacts | `/archive` | 6 | "mint for gains" | Archive addr |
| Chronicle / protocol memory | `chronicle-*` (11 files) | Institutional narrative | `/chronicle` | 6 | none | admission rules |
| Transparency / tx proof | `TransparencyCenter`, `x/tx/$hash`, `wallet/$address` | On-chain verification | `/proof` | 5 | none | RPC |
| Dashboards / economy observatory | `PROTOCOL_ECONOMY_OBSERVATORY_DESIGN.md`, `MyEconomy` | Institutional economic layer | `/economy` | 7 | profit/APR copy | scrub + RPC + indexer |
| Member OS | `MemberShell`, cockpit/* | Member-facing product | `/member` | 9 | PII | real auth |
| Founder / operator cockpit | `founder-review`, `role-gate` | Control plane | `/founder` | 10 | privilege leakage | real auth |
| Data posture / truth registry | `data-posture.ts`, `surfaceStatus`, StatusBadge | Honesty engine | `/status` | 1 | none | (none) |
| Guardrails / tests | `live-content-rules`, signal-money-guardrail, guard tests | Forbidden-copy enforcement | `/guardrails` (internal) | 2 | none | (none) |
| Backend / admin / auth patterns | Supa-Exchange `server/*`, schema | The missing layer | backend/API | 3 | reward schema bleed | strip gamification |
| Entity registry concept | entity-chain `EntityEcosystem`, schema | Unify members/sources/contracts/archives | `entities` | 11 | simulated origin | concept only |
| x402 metered-API concept | entity-chain `x402Verifier`, Supa `ai_billable_sessions` | Non-yield revenue option | `/api` / x402 | 11 | "passive income" | **founder revenue decision** |
| Boost action/validator/allowlist/receipt | boost-protocol contracts | Proof/eligibility spine | `/proof`, `/source` | 5 | reward bleed | adopt pattern only |
| **Live verified contract address** (1) | `contract-registry` | The one real anchor today | `/contracts`, `/proof` | 1 | none | keep labelled LIVE |

---

## 3 — Risk Firewall (reject / scrub / gate)

| Risk item | Source | Why risky | Allowed disciplined replacement | Gate before reuse |
|---|---|---|---|---|
| Mock data | studio `mock-data.ts` | Fake-live violation | Real source or `NOT_WIRED` posture | Never import; delete on touch |
| Simulated role gating as auth | studio `localStorage` roles | Security theatre | Real auth (Phase 3) | No member/founder data until real auth |
| Fake live values | studio / entity-chain | Honesty breach | Truth-labelled null | Banned posture: `SIMULATED`/`LIVE_READ` pre-verify |
| Demo/stale banners | studio `DemoBanner`/`StaleBuildBanner` | Implies broken/preview | Remove | Strip before any promotion |
| Branch wholesale merge | codex/* (42–44 behind) | Drift/regression | Cherry-pick *idea*, re-derive from canon | Founder approval per concept |
| Supa swap/yield/seasons/gamification | Supa-Exchange | Profit/reward/casino framing | Backend *architecture* only | Strip all reward/yield tables & surfaces |
| entity-chain APY/passive/simulated chain | entity-chain README + simulators | Forbidden + fake numbers | Entity concept + x402 only | Reject all staking/APY/sim data |
| Boost incentive/reward economics | boost-protocol `incentives/*` | Reward farming | Action/Validator/AllowList only | Use proof pattern; drop payout |
| Liquidity/vault copy | root `liquidity`/`vault`/`WhyLpMatters`/`RevenueStreams`/`UseOfFunds` | profit/APR/return wording | Factual routing + tx-anchored balances | Pass live-content-rules + money-guardrail |
| `FinalMintCTA`/`MintProgressTracker` | root | FOMO/upside framing | Calm institutional "take your seat" | Copy audit |
| Public PII | member registry, wallets | Legal/privacy | Aggregate/anonymized; opt-in only | **Founder privacy policy** |
| Unverified contract/address/RPC | UNKNOWN/PENDING entries | False truth | Render `PENDING`/`NOT_WIRED` | Verified source supplied as fact/secret |

---

## 4 — Future Top-level Information Architecture

| Surface | Purpose | Audience | Fed by | Source of truth | Data needed | Phase | Copy risks | Gates | Must never say |
|---|---|---|---|---|---|---|---|---|---|
| `/home` | Institutional front door | public | root `/`, studio home | brand/syndicateFacts | static | 1–2 | hype | scrub | profit/FOMO |
| `/join` (sale) | Membership/seat sale | public→member | join, sale-abi | sale-abi/hooks | RPC+V3 addr | 8 | FOMO | addr+RPC+scrub | "buy for upside" |
| `/member` (Member OS) | Personal cockpit | member | MemberShell, cockpit | chain+register | **auth**+RPC | 9 | PII | real auth | public PII |
| `/proof` | On-chain evidence | public | events, tx-proof, fire | event-registry | RPC+indexer | 5 | none | indexer | unverified claims |
| `/source` | Verified-Introduction | public | referral/source-* | source registries | indexer | 5 | affiliate | anonymize | "affiliate income" |
| `/recognition` | Standing/merit | public | recognition-candidates | recognition registry | indexer | 5 | rewards | **formula** | "rewards/yield" |
| `/token` | SYN factual mechanics | public | tokenomics | contract-registry | RPC | 7 | APR | scrub | passive income |
| `/economy` | Economic dashboard | public/dashboard | observatory, MyEconomy | observatory design | RPC+indexer | 7 | profit | scrub+indexer | yield/returns |
| `/treasury` (routing) | 70/20/10 transparency | public/dashboard | treasury doctrine | treasury-ledger | RPC+indexer | 7 | none | tx-anchor | unanchored claims |
| `/archive` | Archive1155 memory | public | archive registries | archive-id-registry | RPC | 6 | speculation | Archive addr | "mint for gains" |
| `/chronicle` | Protocol memory | public | chronicle-* | chronicle registries | static→RPC | 6 | none | admission rules | embellishment |
| `/learning` (canon) | Education/whitepaper | public | learn/docs/whitepaper | canon docs | static | 1–2 | guarantees | — | guaranteed benefit |
| `/status` (truth hub) | Wiring/truth ledger | public/internal | data-posture, registry | truth registry | static | 1 | none | — | fake live |
| `/founder` (operator studio) | Control plane + approvals | founder/operator | founder-review, role-gate | operator registry | **auth** | 10 | none | real auth | leak privileges |
| `/contracts` | Address/ABI truth | public | contract-registry | contract-registry | RPC verify | 1→4 | none | verified addr | unverified=LIVE |
| `/entities` | Entity meta-registry | internal | Syndicate registries + entity-chain concept | entity registry | derived | 11 | none | concept lock | simulated entities |
| `/indexer` (data health) | Freshness/source health | internal/operator | holder-index, indexer | indexer status | indexer | 4 | none | indexer design | fake freshness |
| `/guardrails` | Doctrine/copy/test status | internal | live-content-rules, tests | guard registry | static | 2 | none | — | — |
| `/exchange` or `/marketplace` | Swap/trade | public | *none real* (Trader Joe external) | — | real DEX | **12 (if approved)** | speculation | **founder approval** | speculative hype |
| `/api` (x402) | Metered API revenue | public/member | entity-chain/Supa x402 | x402 registry | backend | **11 (if approved)** | passive income | **founder revenue decision** | "passive income" |

---

## 5 — Final Source-status Category Model (20)

**Allowed publicClass:** `SAFE_PUBLIC`, `INSTITUTIONAL_PUBLIC_SALE_SAFE`, `PUBLIC_MEMORY_SAFE`, `ECONOMIC_DASHBOARD_SAFE`, `MEMBER_ONLY`, `FOUNDER_OPERATOR_ONLY`, `INTERNAL_ONLY`, `FOUNDER_DECISION`, `BLOCKED_PUBLIC`.
**Allowed first-slice posture:** `READ_ONLY_PROOF`, `ADAPTER_REQUIRED`, `NOT_WIRED`, `NOT_LIVE`, `FUTURE`, `EXTERNAL`.
**Forbidden first-slice posture:** `LIVE_READ`, `PROTOTYPE`, `SIMULATED`.

| Category | Why it exists | Source family | Audience | publicClass | First slice | Future deps | Risk notes |
|---|---|---|---|---|---|---|---|
| `chain` | Network/chainId truth (Avalanche 43114) | root chain-registry | public | SAFE_PUBLIC | **include** `READ_ONLY_PROOF` | RPC | none |
| `contracts` | Address/ABI status (1 LIVE, rest PENDING) | root contract-registry | public | SAFE_PUBLIC | **include** `NOT_WIRED` (per addr) | verified addrs | unverified≠LIVE |
| `proof` | Events / tx / Proof of Fire | root proof + Boost pattern | public | SAFE_PUBLIC | **include** `NOT_WIRED` | RPC+indexer | none |
| `action` | Verifiable member/protocol actions | Boost Action pattern | public | SAFE_PUBLIC | reserve `FUTURE` | indexer | reward bleed |
| `receipt` | Attestation/claim of an action | Boost + Supa Merkle, source-receipts | public | PUBLIC_MEMORY_SAFE | reserve `FUTURE` | indexer | reward framing |
| `source` | Referral/introduction attribution | root source-*, Supa referral | public | SAFE_PUBLIC | reserve `NOT_WIRED` | indexer | affiliate wording |
| `recognition` | Standing/merit (anonymized) | root recognition | public | PUBLIC_MEMORY_SAFE | reserve `FUTURE` | indexer | **formula founder** |
| `membership` | Seat/register/historical members | root register + v3-historical | public-agg/member | FOUNDER_DECISION | reserve `NOT_WIRED` | privacy policy | **PII** |
| `sale` | Offer + sale history (V2 sealed, V3) | root sale-abi | public/founder | INSTITUTIONAL_PUBLIC_SALE_SAFE | reserve `NOT_LIVE` | V3 addr+RPC | FOMO |
| `token` | SYN/USDC factual mechanics | root tokenomics | public | ECONOMIC_DASHBOARD_SAFE | reserve `NOT_WIRED` | RPC | yield wording |
| `treasury` | 70/20/10 routing ledger | treasury doctrine | dashboard | ECONOMIC_DASHBOARD_SAFE | reserve `NOT_WIRED` | RPC+indexer | unanchored |
| `routing` | USDC movement tags/flow | treasury doctrine | dashboard | ECONOMIC_DASHBOARD_SAFE | reserve `NOT_WIRED` | indexer | none |
| `economy` | Aggregate metric families | observatory design | dashboard | ECONOMIC_DASHBOARD_SAFE | reserve `FUTURE` | RPC+indexer | profit framing |
| `archive` | Archive1155 IDs (9) | archive registries | public | PUBLIC_MEMORY_SAFE | reserve `NOT_WIRED` | Archive addr | speculation |
| `chronicle` | Admitted protocol memory | chronicle-* | public | PUBLIC_MEMORY_SAFE | reserve `READ_ONLY_PROOF` | admission | embellishment |
| `learning` | Canon/whitepaper/FAQ | learn/docs | public | SAFE_PUBLIC | reserve `READ_ONLY_PROOF` | — | guarantees |
| `entities` | Meta-registry of all entity types | Syndicate + entity-chain concept | internal | INTERNAL_ONLY | reserve `FUTURE` | concept lock | simulated |
| `indexer` | Data freshness/source health | holder-index, Supa pattern | internal/operator | INTERNAL_ONLY | reserve `FUTURE` | indexer design | fake freshness |
| `operator` | Founder/approval/control status | studio founder-review | founder | FOUNDER_OPERATOR_ONLY | defer `FUTURE` | real auth | privilege leak |
| `guardrails` | Doctrine/copy/test status | live-content-rules, tests | internal | INTERNAL_ONLY | reserve `READ_ONLY_PROOF` | — | none |

**Rejected as categories:** `boost`, `incentive` (reward economics), `marketplace`, `exchange` (no real product), `campaign` (reward connotation) — folded or deferred per §3/§4.

---

## 6 — Phased Build Ledger

| Phase | Objective | Source families | Module/surface | Required inputs | Files likely touched (later) | Acceptance | Verification | Rollback | Out of scope |
|---|---|---|---|---|---|---|---|---|---|
| **0 Plan/canon lock** | Freeze this map | all | (none) | founder sign-off | none | Map approved | founder review | n/a | any code |
| **1 Truth/status spine** | Posture-only `/api/source-status` static canon registry (20 cats, values null) | root registries | api-server + config | category list | `artifacts/api-server/*`, studio config | Endpoint returns posture-only JSON; no values | typecheck + curl `/api/source-status` | revert endpoint file | UI binding, chain |
| **2 UI binding + guardrails** | Bind `/status` + truth labels to spine; wire copy guardrails | studio, guardrails | `/status`, TruthLabel | Phase 1 | studio pages, guard tests | `/status` renders posture from API; guard tests pass | typecheck + e2e `/status` | revert UI commit | new modules |
| **3 Backend/auth/admin foundation** | DB + Express + Zod + session + admin scaffold (no product data) | Supa pattern | backend/API, auth | **auth provider**, DB choice | api-server, db lib | Auth login works; admin gate real | e2e auth flow | drop tables/routes | member/sale data |
| **4 RPC/contracts/indexer verification** | Verify chain reads + addresses; indexer design | root chain/contract, indexer | `/contracts`, `/indexer` | **RPC secret, V3/Archive/USDC/SYN addrs** | chain-registry, indexer | Addresses verified LIVE/PENDING truthfully | read-only chain calls match explorer | feature-flag off | writing chain |
| **5 Proof/source/recognition** | Wire proof/source/recognition from verified reads | root + Boost pattern | `/proof`, `/source`, `/recognition` | Phase 4, **recognition formula** | proof/source/recognition modules | Real events render w/ truth labels | e2e + tx cross-check | flag off | rewards |
| **6 Archive/chronicle/member history** | Surface Archive1155 + chronicle + member freeze | root archive/chronicle/register | `/archive`, `/chronicle`, `/member` (history) | Archive addr, **privacy policy** | archive/chronicle/register | History accurate, anonymized per policy | e2e + registry diff | flag off | live PII |
| **7 Token/economy/treasury/routing** | Economic dashboards from verified reads | root token/treasury, observatory | `/token`, `/economy`, `/treasury` | Phase 4 | tokenomics/treasury modules | Dashboards factual, tx-anchored, scrubbed | e2e + ledger reconcile | flag off | yield framing |
| **8 Institutional sale/join** | Real sale offer + history | root sale-abi | `/join` | **V3 addr**, sale posture | join/sale modules | Sale state truthful; calm copy | e2e + on-chain match | flag off | upside copy |
| **9 Member OS** | Authenticated member cockpit | studio pattern + root | `/member` | real auth (Phase 3) | member modules | Member sees own data only | e2e auth+data | flag off | public PII |
| **10 Founder/operator cockpit** | Control plane + approvals | studio founder-review | `/founder` | real auth + roles | operator modules | Founder-only controls gated | e2e role tests | flag off | public exposure |
| **11 Entities / x402 / advanced API** | Entity registry + metered API **if approved** | entity-chain concept | `/entities`, `/api` | **founder revenue decision** | entity/x402 modules | Metered API disciplined, non-yield | e2e billing | flag off | passive-income framing |
| **12 Exchange/marketplace** | Only **if real + approved** | (none real yet) | `/exchange` | **founder approval**, real DEX | tbd | Real, verified, disciplined | e2e | flag off | speculation/hype |

---

## 7 — First Five Implementation Slices (defined, not implemented)

The recommended first slice is **confirmed**, and API and UI are kept **strictly separate** (Slices 1 vs 2). Combining them would couple posture data to rendering and make truth-label regressions hard to isolate.

| # | Name | Goal | Files likely touched | Inputs needed | Acceptance | Tests/checks | Must NOT touch |
|---|---|---|---|---|---|---|---|
| **1** | `/api/source-status` posture-only canon registry | Static endpoint listing 20 categories with `publicClass` + posture, **all values null** | `artifacts/api-server/src/*` (route + static module) | approved category list (§5) | Returns 20 categories, posture-only, no values, no chain | `pnpm --filter @workspace/api-server typecheck`; curl via `localhost:80/api/source-status` | studio UI, DB, chain, auth |
| **2** | `/status` binds to spine | Render posture from endpoint via truth labels | `artifacts/studio/src/pages` (status) + config | Slice 1 | `/status` shows each category + posture from API; no inline literals | studio typecheck; e2e `/status` | api logic, other pages |
| **3** | Guardrail test pass for posture vocab | Lock allowed posture/publicClass enums + forbidden-copy check on `/status` | guard test files, shared enum | §5 enums | Tests fail on illegal posture or forbidden word | run guard tests | runtime code |
| **4** | `contracts` truth slice (read-only, no RPC) | Mark the 1 verified address LIVE, others PENDING — **from registry only**, no chain call | contract-registry surface, `/contracts` stub | existing registry | Truthful LIVE/PENDING badges, zero chain calls | typecheck + e2e badge render | RPC, sale, token |
| **5** | `learning`/`chronicle` static `READ_ONLY_PROOF` slice | Surface already-true static canon (docs/chronicle admitted) w/ labels | learning/chronicle surfaces | canon docs | Static canon renders labelled, no fabrication | typecheck + e2e | dynamic data, chain |

---

## 8 — Unknowns / Founder Decisions

| Unknown | Why it matters | Blocks phase | Proceed without? |
|---|---|---|---|
| V3 sale address | Real sale state | 8 | Yes (Phases 1–7 don't need it) |
| Archive1155 address | Archive reads | 6 | Yes until 6 |
| USDC / SYN token addresses | Token/economy/routing reads | 7 | Yes until 7 |
| RPC provider / secret | Any live chain read | 4+ | Yes (posture-only Phases 1–3) |
| Indexer design | Events/holders/freshness | 4–5 | Yes until 4 |
| Auth provider | Member/founder/admin | 3, 9, 10 | Yes (Phases 1–2 are public posture) |
| DB / backend choice | Backend foundation | 3 | Yes until 3 |
| Member identity / privacy policy | Whether wallets/members are public | 6, 9 | Yes until 6 — **default: no PII** |
| Public sale posture | How sale is framed | 8 | Yes until 8 |
| Token/economy dashboard posture | Framing discipline | 7 | Yes until 7 |
| Recognition formula | Standing logic | 5 | Yes until 5 |
| x402 / API revenue decision | New revenue surface | 11 | Yes (optional) |
| Exchange/marketplace decision | New product surface | 12 | Yes (optional) |
| Liquidity/vault public framing | Forbidden-copy risk | 7 | Yes — **default: quarantine until scrubbed** |
| Studio `/ai` chat scope | Whether to keep AI surface | later | Yes — defer |

---

## 9 — Quality Gates (every future implementation prompt must include)

1. No fake data.
2. No simulated values rendered as live.
3. Source pinned (every value cites its origin).
4. Truth labels on all non-real values.
5. Founder approval where flagged.
6. Copy guardrail pass (forbidden-framing list).
7. No public PII.
8. No ROI/yield/profit/passive-income framing.
9. No unverified `LIVE` status.
10. No branch wholesale import.
11. No external reference treated as canon.
12. Tests + typecheck + route verification green.
13. **API and UI binding shipped/approved separately** unless explicitly justified.
14. Rollback plan stated (feature-flag or revertable commit).
15. Posture restricted to allowed enum; `LIVE_READ`/`PROTOTYPE`/`SIMULATED` forbidden pre-verification.

---

## 10 — One Recommended Next Step

**D → then B.** Stop for **founder decisions** on the small set that gates everything early — specifically:

1. Member/PII privacy default,
2. DB/backend + auth provider choice,
3. Confirmation of the 20-category set.

None block Phase 1, but locking them now prevents rework. The moment the category set is confirmed, proceed to **B: Phase 1 Slice 1 — `/api/source-status` posture-only static canon registry** (API only, no UI, no chain, no values).

If not pausing: proceed directly to **B**, since Slice 1 is safe, reversible, and needs no unknowns.

---

### Forbidden framing (never appears in UI)

guaranteed profit · guaranteed return · ROI promise · passive income · yield promise · payout promise · jackpot · betting/wagering · reward farming · liquidity mining hype · buy for upside · casino FOMO · fake live numbers · public PII.

### Source hierarchy (canon order)

1. TheSyndicate `main` = current Syndicate canon for facts.
2. Code/contracts/registries win over docs if conflict.
3. docs/canon consolidate doctrine but do not override code/contracts.
4. Root `src` app = real institutional machine.
5. `apps/product-os-studio` = simulated mirror / role-gated pattern / product memory.
6. branches = candidate material only unless merged into main or founder-approved.
7. Supa-Exchange = founder reference repo (backend/admin/auth/referral/Merkle/operator), not product canon.
8. entity-chain = founder reference repo (entity registry / x402 metered API / explorer schema), not product canon.
9. Boost Protocol = external reference (Action / Validator / AllowList / Registry / receipt/proof), not Syndicate canon.
10. Current Replit app = clean rebuild foundation that must not be broken.
