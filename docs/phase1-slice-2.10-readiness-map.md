# Phase 1 — Slice 2.10: Live Data Source & Adapter Readiness Map

**Type:** Report-only technical reconnaissance. **No code was modified.** No RPC, no
indexer, no adapter, no live values were wired. This document only inspects and
classifies; every recommendation is a *proposal* pending explicit founder approval.

**Canon pin referenced:** `duniterum/TheSyndicate` main @ `cf4ca34` (the commit the
vendored canon was pinned at).

---

## 1. Executive summary

The blocker has fully shifted. After Slices 2.7–2.9 the problem is no longer "missing
canon" — the ABIs, addresses, event taxonomy, archive IDs, chain registry and token
constants are all vendored and pinned locally. The remaining problem is exactly what
the truth labels now say: **how the app should safely *read live truth*.**

Three findings dominate this map:

1. **There is no live-read code anywhere in the workspace to reuse.** No installed web3
   dependency (`viem`/`ethers`/`wagmi`/`web3`) in any `package.json`, and no JSON-RPC
   client, reader, adapter, or indexer code (`publicClient`/`getLogs`/`readContract`/
   `JsonRpcProvider`) in any source file. No `.sol` files. (The only textual matches for
   terms like `viem` are inside vendored *documentation comments* — e.g. a MetaMask/viem
   note in `chain-registry.ts` — not executable code.) The only "old TheSyndicate code"
   present is the **vendored canon itself** — inert data plus *pure* helpers (URL
   builders, lookups, validators, ABI decoders). A live read path must be built net-new;
   nothing risky is silently wired today.

2. **A small set of categories can be read live *right now*, safely, with zero PII and
   zero amounts.** The safest are chain-level and existence checks that need no ABI at
   all: `eth_chainId` (verify 43114) and `eth_getCode` (prove a contract is deployed at
   a known address, emitted as a boolean). Just behind them sit per-artifact archive
   reads (`getArtifactCore`, `remainingSupply`) and ERC-20 `decimals` verification —
   real protocol data with no member identity attached.

3. **Everything historical or person-linked requires an indexer and a hard privacy
   gate.** Proof-of-fire (burns), source attribution, sale history, treasury routing,
   receipts, and membership history all live in **events** that carry buyer / recipient
   / source wallet addresses. These need an event indexer (block-range `getLogs`),
   storage, and strict anonymized aggregation before anything reaches a public payload.

**Recommended first move:** a *minimal, internal-only* server-side read adapter that
does `eth_chainId` + `eth_getCode` (booleans only), behind a flag, **not** wired into
`/api/source-status`. It proves the live path end-to-end (timeout, rate-limit, error,
cache) with zero exposure, so the founder can review real live output before a single
value is surfaced.

**The `/api/source-status` contract already anticipates this transition:** its `Posture`
enum contains an unused `ADAPTER_REQUIRED` value — the natural label for categories
moving from "static read-only proof" to "live-verified" once an adapter exists.

---

## 2. Files inspected

**API status contract**
- `artifacts/api-server/src/data/sourceStatus.ts` — the 20-category posture registry,
  Zod schema, `Posture`/`PublicClass` enums, and the runtime payload-discipline guard.
- `artifacts/api-server/src/routes/sourceStatus.ts` — the `GET /api/source-status` route.

**Vendored canon** (`artifacts/api-server/src/canon/the-syndicate/`)
- `PROVENANCE.md` — source paths, conversions, safety review, "deliberately NOT vendored" list.
- `index.ts` — namespaced barrel of canon modules.
- `chain/chain-registry.ts` — chain id 43114, RPC endpoints, explorer URL builders (pure).
- `contracts/syndicate-config.ts` — addresses, token spec, deployment blocks, active-sale
  flags, rank tables, pure helpers (URL builders, validators, math).
- `contracts/contract-registry.ts` — structured contract registry + lookups; 2 PENDING
  null-address entries (`COMMISSION_ROUTER_V1`, `SEAT_RECORD_721`).
- `contracts/abi/sale-abi.ts` — `ERC20_ABI`, `SALE_ABI` (V1), `SALE_V2_ABI`, `SALE_V3_ABI`,
  `SOURCE_REGISTRY_V1_ABI`, `PAIR_ABI`.
- `contracts/abi/archive-nft-abi.ts` — `ARCHIVE_NFT_ABI` (Archive1155) + decode helpers.
- `archive/archive-id-registry.ts` — 9 static archive artifact IDs + eligibility helpers.
- `proof/protocol-event-registry.ts` — event taxonomy (kinds, categories, metric effects,
  chronicle eligibility, reserved future namespaces).

**Reuse search (workspace-wide)**
- `package.json` files (all), full source tree under `artifacts/*` and `lib/*`, plus a
  pattern search for `viem|ethers|wagmi|web3|publicClient|getLogs|readContract|JsonRpcProvider`
  and for `*.sol`. Result: **no installed dependency, import, reader, adapter, or indexer**
  anywhere. The only matches are inside vendored *documentation comments* (e.g.
  `chain-registry.ts` references viem/MetaMask behavior) and the founder's own pasted
  brief — never executable code. No `.sol` files exist.

---

## 3. Old TheSyndicate reusable logic found — classification

**Headline: there is no pre-existing reader, adapter, indexer, or RPC client to reuse.**
What exists is the vendored canon. Classified:

| Asset (vendored canon) | Nature | Classification |
|---|---|---|
| ABI fragments (`ERC20`, `SALE`, `SALE_V2`, `SALE_V3`, `SOURCE_REGISTRY_V1`, `PAIR`, `ARCHIVE_NFT`) | `as const` typed arrays | **Usable as-is** — directly consumable by any typed reader (viem/ethers) when a reader is built. |
| `archive-nft-abi.ts` decoders (`decodeArtifactCore`, `normalizeArtifactCore`, `RENDERER_MODE_LABEL`) | Pure functions | **Usable as-is** — pure tuple decoders; they need a live `getArtifactCore` result to act on, but the decode logic itself is reusable now. |
| `chain-registry.ts` URL builders (`txUrl`, `addressUrl`, `tokenUrl`, `erc1155TokenUrl`, per-explorer variants) | Pure (post-shim) | **Usable as-is** — no DOM dependency after the vendoring shim; safe server-side. |
| `syndicate-config.ts` helpers (`isLiveAddress`, `isTxHash`, `explorerUrlFor*`, `rankForUsdc`, `rankForSyn`, `vaultFlow`) | Pure | **Usable as-is.** |
| `contract-registry.ts` lookups (`contractByKey`, `liveContracts`, `pendingContracts`) | Pure | **Usable as-is.** |
| `archive-id-registry.ts` lookups (`archiveIdEntry`, `publicMintIds`, `isPublicMintEligible`) | Pure | **Usable as-is.** |
| `protocol-event-registry.ts` taxonomy (`CATEGORY_FOR_KIND`, `EVENT_METRIC_EFFECTS`, `chronicleEligibleForKind`) | Pure data | **Usable as reference / classification layer** for a future indexer — not a parser itself. |
| Deployment-block constants (`SALE_*_DEPLOYMENT_BLOCK`, `SOURCE_REGISTRY_V1_READBACK_BLOCK`) | Constants | **Usable as-is** — these are the `fromBlock` values a future indexer needs. |

**Adaptation caveat for all of the above:** the canon dir is excluded from the
api-server TypeScript program and `chain-registry.ts` carries a no-op
`explorer-preference` shim. The slice that *first imports* canon into compiled code owns
strict-mode / server-runtime adaptation (this is already documented in `PROVENANCE.md`).

**Must NOT be used as data/source** (doctrine, restated):
- `v3-historical-members.ts` — member PII; deliberately not vendored.
- `explorer-preference.ts` — React/DOM (`localStorage`); not server-safe.
- Supa-Exchange — frontend/backend reference memory only, never a Syndicate source.
- entity-chain — entity/x402 concept memory only, never a source.
- Boost Protocol — action/validator/receipt *pattern* reference only, never a source.

---

## 4. Category-by-category live-data readiness

Legend for the 15 fields: **1** posture · **2** sourceRef · **3** vendored canon ·
**4** ABI · **5** address server-side · **6** RPC can answer now · **7** needs indexer ·
**8** needs DB/cache · **9** needs auth/privacy gate · **10** old code usable as-is ·
**11** adaptation needed · **12** public-safe payload possible now · **13** first safe
live-read candidate · **14** risk · **15** recommended next action.

### Scan matrix

| Category | 1 Posture | 3 Canon | 4 ABI | 5 Addr | 6 RPC now | 7 Indexer | 9 Auth/PII | 12 Public-safe now | 13 First read | 14 Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| chain | READ_ONLY_PROOF | yes | n/a | n/a | **yes** | no | no | yes | **yes** | low |
| contracts | READ_ONLY_PROOF | yes | yes | yes | **yes** | no | no | yes (bool) | **yes** | low |
| proof | NOT_WIRED | yes | yes | yes | partial | **yes** | yes | no | no | med |
| action | FUTURE | no (ref) | no | no | no | no | tbd | no | no | low |
| receipt | FUTURE | partial | yes | yes | partial | yes | yes | partial | no | med |
| source | NOT_WIRED | yes | yes | yes | partial | **yes** | **yes** | no | no | **high** |
| recognition | FUTURE | no | no | no | no | later | yes | no | no | low |
| membership | NOT_WIRED | partial | yes | yes | partial | history | **yes** | partial (count) | partial | med-high |
| sale | NOT_LIVE | yes | yes | yes | yes* | history | partial | partial (flags) | partial | med |
| token | READ_ONLY_PROOF | yes | yes | yes | yes* | burn-hist | no | partial | yes (decimals) | low-med |
| treasury | NOT_WIRED | partial | yes | yes | partial | **yes** | partial | partial (bal) | partial | med |
| routing | NOT_WIRED | partial | yes | yes | no | **yes** | partial | no | no | med |
| economy | FUTURE | no | derived | derived | no | yes | no | no | no | low |
| archive | READ_ONLY_PROOF | yes | yes | yes | **yes** | optional | no | yes | **yes** | low |
| chronicle | NOT_WIRED | **no** | no | no | no | partial | no | no | no | low |
| learning | NOT_WIRED | **no** | no | no | no | no | no | no | no | low |
| entities | FUTURE | no (ref) | no | no | no | no | internal | no | no | low |
| indexer | FUTURE | no | n/a | n/a | no | (is the indexer) | internal | no | no | low |
| operator | FUTURE | no | (owner fns) | yes | no | no | **yes** | **never** | no | high* |
| guardrails | READ_ONLY_PROOF | yes (in-repo) | n/a | n/a | n/a | no | internal | yes | n/a | low |

\* `yes*` = a clean view read exists but is **founder-gated** by doctrine (sale `NOT_LIVE`
/ no-amounts; token no price/supply/balances). `high*` for operator = high risk **only
if mis-exposed**; correct handling is "never public."

### Per-category detail

**chain** — 1 READ_ONLY_PROOF · 2 `vendored:…/chain/chain-registry.ts@cf4ca34` · 3 yes ·
4 n/a · 5 n/a · 6 **yes** (`eth_chainId` → expect 43114) · 7 no · 8 no · 9 no · 10 RPC
endpoints + builders vendored, no client · 11 add a tiny JSON-RPC call + timeout/error ·
12 yes · 13 **yes (safest of all)** · 14 low · 15 first candidate for a live chainId
verification read.

**contracts** — 1 READ_ONLY_PROOF · 2 `vendored:…/contract-registry.ts@cf4ca34` · 3 yes ·
4 yes · 5 yes (many, server-side) · 6 **yes** (`eth_getCode` proves deployment) · 7 no ·
8 optional cache · 9 no (emit boolean, never the address) · 10 registry usable, no reader ·
11 RPC client + getCode; redact addresses → presence booleans/counts only · 12 yes (as
"deployed: true") · 13 **yes** · 14 low (addresses must stay server-side) · 15 candidate
for contract-existence verification (boolean output).

**proof** — 1 NOT_WIRED · 2 `vendored:…/proof/protocol-event-registry.ts@cf4ca34` · 3 yes ·
4 partial (sale `Purchased`/`MembershipPurchasedV3` events vendored; **burns need a standard
ERC-20 `Transfer` event fragment that is NOT in the vendored `ERC20_ABI`**; archive mint
events also not vendored — see §6) · 5 yes · 6 partial (single calls can't reconstruct
history) · 7 **yes** ·
8 yes · 9 yes (events carry buyer addresses) · 10 taxonomy usable as classifier, no parser ·
11 build event indexer (getLogs from deployment block) + aggregate + redact · 12 no ·
13 no · 14 medium · 15 belongs to the indexer DESIGN slice.

**action** — 1 FUTURE · 2 `reference:boost-action-pattern` · 3 no (Boost = pattern ref) ·
4 no · 5 no · 6 no · 7 no · 8 no · 9 tbd · 10 reference only, must not import as data ·
11 n/a · 12 no · 13 no · 14 low · 15 keep FUTURE; no wiring.

**receipt** — 1 FUTURE · 2 `canon:source-attributed-receipts` · 3 partial (`SALE_V3` has
`receiptCount` + `MembershipPurchasedV3.receiptId`) · 4 yes · 5 yes · 6 partial
(`receiptCount()` is a clean aggregate; per-receipt detail is event/PII) · 7 yes ·
8 yes · 9 yes (addresses in receipts) · 10 ABI usable, no reader · 11 count via view call;
history via indexer with redaction · 12 partial (count only) · 13 no (keep FUTURE) ·
14 medium · 15 keep FUTURE; note `receiptCount` as a possible later aggregate.

**source** (Source Attribution) — 1 NOT_WIRED · 2 `canon:referral-attribution` · 3 yes
(`SOURCE_REGISTRY_V1_ABI` + address + readback block) · 4 yes · 5 yes · 6 partial
(`sourceExists`/`isActive`/`sourceConfig` are view calls but need a `sourceId` and
`sourceConfig` returns `sourceWallet`/`payoutWallet`/`createdBy`) · 7 **yes** (enumerate via
`SourceCreated` logs) · 8 yes · 9 **yes — heavy PII + commission terms** · 10 ABI usable,
no reader · 11 indexer + strict anonymization; never emit wallets/commission/bps ·
12 no · 13 no · 14 **high** · 15 indexer design + founder privacy decision; keep
commission language out of any public copy.

**recognition** — 1 FUTURE · 2 `canon:recognition-candidates` · 3 no (formula pending
founder) · 4 no (derived) · 5 no · 6 no · 7 later (derived from events) · 8 later ·
9 yes (member-subject) · 10 rank tables in config usable as input reference · 11 needs a
founder-decided formula first · 12 no · 13 no · 14 low · 15 keep FUTURE; founder decision
on the recognition model.

**membership** — 1 NOT_WIRED · 2 `canon:institutional-register-registry` (class
FOUNDER_DECISION) · 3 partial (contracts/ABIs vendored; **member list deliberately not
vendored**) · 4 yes (`memberCount`, `knownMember`, `memberNumberOf`) · 5 yes · 6 partial
(`memberCount()`/`nextSeatNumber()` are clean aggregates; per-member calls are
address-keyed PII) · 7 history only · 8 optional · 9 **yes** (member identity is PII +
FOUNDER_DECISION) · 10 no reader; member list must stay unvendored · 11 aggregate count is
safe; per-member is gated · 12 partial (aggregate count, only with founder approval) ·
13 partial · 14 medium-high · 15 founder decision on surfacing aggregate `memberCount`;
no per-member wiring.

**sale** — 1 NOT_LIVE · 2 `vendored:…/abi/sale-abi.ts@cf4ca34` · 3 yes (V2/V3 ABIs +
addresses + deployment blocks + active-version flags) · 4 yes · 5 yes · 6 yes for
aggregates (`paused`, `isConcluded`, `currentEra`, `availableSyn`, `totalSynSold`,
`memberCount`, `nextSeatNumber`) **but founder doctrine = no amounts, no CTA** · 7 history
(events) · 8 history yes · 9 aggregate-safe; per-buyer gated · 10 ABI usable, no reader ·
11 RPC client + view reads; honor "status flags only, no amounts" until approved · 12
partial (status flags yes; amounts founder-restricted) · 13 partial (`paused()`/
`isConcluded()` are the cleanest non-amount reads) · 14 medium (financial-copy doctrine) ·
15 founder decision: may status flags surface while sale stays NOT_LIVE / amount-free?

**token** — 1 READ_ONLY_PROOF · 2 `vendored:…/syndicate-config.ts@cf4ca34` · 3 yes ·
4 yes (`ERC20_ABI` has `decimals`/`balanceOf`; `PAIR_ABI` has `getReserves`/`totalSupply`) ·
5 yes (SYN, USDC, LP pair, burn `0x…dEaD`) · 6 yes (`decimals()` verify; `balanceOf(dEaD)`
= burned; LP `getReserves` = spot ratio/TVL) **but doctrine currently exposes no price/
supply/balances** · 7 no for snapshots; yes for burn-over-time · 8 optional cache · 9 no
(aggregates, no PII) · 10 ABI usable, no reader · 11 RPC client + view reads;
**note:** vendored `ERC20_ABI` lacks `totalSupply`/`symbol`/`name` **and the `Transfer`
event** (symbol/decimals are canon constants), so SYN total supply and any burn *history*
would each need an added ABI fragment ·
12 partial (symbol/decimals verify yes; supply/price founder-restricted) · 13 yes for
`decimals` verification · 14 low-medium (must never frame price as investment upside) ·
15 founder decision on exposing supply/burned/price aggregates; decimals/symbol verify is
the safe first step.

**treasury** — 1 NOT_WIRED · 2 `canon:treasury-ledger-doctrine` · 3 partial (vault/
liquidity/operations wallet addresses in config; sale exposes `VAULT()`/`LIQUIDITY()`/
`OPERATIONS()`) · 4 yes (ERC-20 `balanceOf` on wallets; sale `Routed` event) · 5 yes ·
6 partial (`USDC.balanceOf(vaultWallet)` = point-in-time balance; flows need history) ·
7 **yes** (flows) · 8 yes · 9 balances aggregate-safe; wallet addresses stay server-side ·
10 no reader · 11 indexer for flows; balanceOf for snapshots · 12 partial (aggregate
balances) · 13 partial · 14 medium (avoid any yield/return framing) · 15 indexer design
for routing; founder decision on balance snapshots.

**routing** — 1 NOT_WIRED · 2 `canon:treasury-ledger-doctrine` · 3 partial (`Routed` event
in `SALE_V2`; `USDC_ROUTING` config) · 4 yes · 5 yes · 6 no (flows = event history) ·
7 **yes** · 8 yes · 9 aggregate-safe (`Routed` carries `memberNumber`, not wallet) ·
10 no reader · 11 indexer over `Routed`; aggregate splits · 12 no · 13 no · 14 medium ·
15 fold into the treasury/indexer design slice.

**economy** — 1 FUTURE · 2 `canon:protocol-economy-observatory-design` · 3 no (composite
design) · 4 derived · 5 derived · 6 no · 7 yes (depends on token+treasury+sale) · 8 yes ·
9 no (aggregate dashboard) · 10 none · 11 depends on upstream categories being wired ·
12 no · 13 no · 14 low · 15 keep FUTURE; depends on token/treasury/sale first.

**archive** — 1 READ_ONLY_PROOF · 2 `vendored:…/archive/archive-id-registry.ts@cf4ca34` ·
3 yes (9 IDs + `ARCHIVE_NFT_ABI` + address + decoders) · 4 yes · 5 yes · 6 **yes**
(`getArtifactCore(id)`, `remainingSupply(id)`, `paused()`, `uri(id)` — per-artifact
aggregates, no PII) · 7 optional (**mint history would need ERC-1155 event fragments —
`TransferSingle`/`TransferBatch` are NOT in the vendored `ARCHIVE_NFT_ABI`**; snapshots need
no events) · 8 optional cache · 9 no for
artifact supply/config; yes for per-wallet holdings · 10 **decoders usable as-is**, no
reader · 11 RPC client + `getArtifactCore`/`remainingSupply`, decode via vendored helpers ·
12 yes (artifact supply/config) · 13 **yes — best "real protocol data" first read with no
PII** · 14 low · 15 strong candidate for an archive artifact supply/config read.

**chronicle** — 1 NOT_WIRED · 2 `canon:chronicle-registry` · 3 **no (not yet vendored)** ·
4 no (curated content; candidates derive from events) · 5 no · 6 no · 7 partial (candidate
detection from burn/lp/mint events) · 8 yes (curated store) · 9 no (PUBLIC_MEMORY_SAFE) ·
10 `chronicleEligibleForKind` usable as reference · 11 vendor chronicle canon first ·
12 no · 13 no · 14 low · 15 vendor chronicle canon (a future vendoring slice), then wire.

**learning** — 1 NOT_WIRED · 2 `canon:learning-canon` · 3 **no (not yet vendored)** ·
4 no (static content) · 5 no · 6 no · 7 no · 8 maybe (content store) · 9 no (SAFE_PUBLIC) ·
10 none in workspace · 11 vendor learning canon first · 12 no · 13 no · 14 low ·
15 vendor learning canon (future) → then it becomes static read-only proof, no RPC needed.

**entities** — 1 FUTURE · 2 `reference:entity-registry-concept` (INTERNAL_ONLY) · 3 no ·
4 no · 5 no · 6 no · 7 no · 8 no · 9 internal · 10 entity-chain is concept ref only, never
data · 11 n/a · 12 no · 13 no · 14 low · 15 keep FUTURE; concept only.

**indexer** — 1 FUTURE · 2 `internal:indexer-design` (INTERNAL_ONLY) · 3 no (design) ·
4 n/a · 5 n/a · 6 no · 7 it *is* the indexer · 8 **yes (its own store)** · 9 internal
(could later expose aggregate health) · 10 none · 11 design the indexer · 12 no · 13 no ·
14 low · 15 this is the convergence point for all event-based categories — design slice.

**operator** — 1 FUTURE · 2 `canon:founder-review` (FOUNDER_OPERATOR_ONLY) · 3 no ·
4 owner/treasury view fns exist on contracts · 5 founder addresses in config (server-side) ·
6 no (operator controls are auth-gated, not public reads) · 7 no · 8 maybe · 9 **yes —
real auth required (deferred)** · 10 none · 11 needs an auth system first · 12 **never
public** · 13 no · 14 high if mis-exposed · 15 defer to the auth slice; never public.

**guardrails** — 1 READ_ONLY_PROOF · 2 `canon:live-content-rules` (INTERNAL_ONLY) · 3 yes
(in-repo: the guard + forbidden lists + doctrine) · 4 n/a · 5 n/a · 6 n/a (no chain;
static doctrine enforced at runtime by the endpoint guard) · 7 no · 8 no · 9 internal ·
10 n/a (this is the rebuild's own guard) · 11 none · 12 yes · 13 n/a (already live as
static proof) · 14 low · 15 none — already read-only proof; keep enforcing.

---

## 5. RPC-readiness table

Public Avalanche C-Chain RPC is evaluated as a **future option only**. RPC endpoints are
already vendored in canon (`CHAIN_REGISTRY.rpc.primary/fallback/all`, sourced from
`syndicate-config.ts`). The founder-suggested endpoints
(`https://api.avax.network/ext/bc/C/rpc`, fallback
`https://avalanche-c-chain-rpc.publicnode.com`) should be **reconciled against the pinned
canon endpoints** rather than hard-coded anew.

Per candidate read:

| Read | Method | ABI? | Addr? | PII | Full addr in payload? | Public-safe | Notes |
|---|---|---|---|---|---|---|---|
| Chain id verify | `eth_chainId` | no | no | none | no | **yes** | Safest possible read; compare to 43114. |
| Contract exists | `eth_getCode` | no | yes (in) | none | no (emit bool) | **yes** | Proves deployment; never echo the address. |
| Archive artifact core | `getArtifactCore(id)` | yes | yes | none | no | **yes** | Per-id config/supply/minted/price; decoders vendored. |
| Archive remaining supply | `remainingSupply(id)` | yes | yes | none | no | **yes** | Aggregate per artifact. |
| Token decimals verify | `decimals()` | yes | yes | none | no | **yes** | Confirms canon constant (18). |
| Burned supply | `balanceOf(0x…dEaD)` | yes | yes | none | no | yes (gated) | Aggregate **snapshot** via vendored `balanceOf`; burn *history* needs an ERC-20 `Transfer` fragment (not vendored). Doctrine currently withholds supply. |
| LP spot/TVL | `getReserves()` / `totalSupply()` | yes | yes | none | no | yes (gated) | Aggregate; must never be framed as price-for-upside. |
| Sale status flags | `paused()` / `isConcluded()` / `currentEra()` | yes | yes | none | no | yes (gated) | No amounts; sale is doctrine-`NOT_LIVE`. |
| Sale aggregates | `availableSyn()` / `totalSynSold()` | yes | yes | none | no | gated | Amounts → founder approval required. |
| Member count | `memberCount()` | yes | yes | none | no | gated | Aggregate; class FOUNDER_DECISION. |
| Treasury balance | `USDC.balanceOf(wallet)` | yes | yes | none | no | gated | Aggregate snapshot; wallet stays server-side. |

**Every** RPC read, when built, must be: **safe read-only** (no state-changing calls);
**no PII**; **no full address emitted publicly**; behind a **timeout**, **rate limit**,
**short cache**, and an explicit **error/unavailable state** (never a silent fallback to a
fabricated value). View calls additionally require the **ABI + address** (both vendored,
server-side). `eth_chainId`/`eth_getCode` require neither an ABI nor exposing the address.

---

## 6. Indexer-readiness table

| Category | Events (signatures in canon) | ABI/canon file | Address needed | Privacy risk | Public aggregation possible | DB/cache | Old parser exists |
|---|---|---|---|---|---|---|---|
| proof (burns) | ERC-20 `Transfer(addr,addr,uint256)` → `0x…dEaD` | **event fragment NOT vendored** (`ERC20_ABI` has no `Transfer`) | SYN token | med (sender addr) | yes (burned total, count, latest) | yes | no |
| proof / sale (V1) | `TokensPurchased(buyer,purchaseId,…)` | `SALE_ABI` | Sale V1 | med (buyer) | yes (counts/totals) | yes | no |
| sale / membership (V2) | `Purchased(...)`, `Routed(...)`, `V1MembershipRecognized(member)` | `SALE_V2_ABI` | Sale V2 | med (buyer/member) | yes (counts/totals/routing) | yes | no |
| sale / membership / receipt (V3) | `MembershipPurchasedV3(receiptId,buyer,recipient,…,sourceWallet,…)` | `SALE_V3_ABI` | Sale V3 | **high** (buyer+recipient+source wallets) | yes only if anonymized | yes | no |
| source attribution | `SourceCreated`, `SourceTermsUpdated`, `SourceStatusChanged`, `SourceWalletUpdated`, `SourcePayoutWalletUpdated` | `SOURCE_REGISTRY_V1_ABI` | SourceRegistryV1 | **high** (source/payout wallets, commission bps) | only anonymized counts | yes | no |
| treasury / routing | `Routed(memberNumber,vault,liquidity,operations,referral)` | `SALE_V2_ABI` | Sale V2 | low-med (memberNumber, not wallet) | yes (flow aggregates) | yes | no |
| archive history | ERC-1155 `TransferSingle`/`TransferBatch` | **event fragments NOT vendored** (`ARCHIVE_NFT_ABI` has functions/decoders only) | Archive1155 | low-med (minter addr) | yes (mint counts) | optional | no (decoders only) |
| recognition | derived from the above kinds | `protocol-event-registry` taxonomy | n/a | med (member-subject) | yes if aggregated | yes | no |

**`fromBlock` is partially solved:** deployment-block constants are vendored **for sale and
source only** (`SALE_DEPLOYMENT_BLOCK`, `SALE_V2_DEPLOYMENT_BLOCK`, `SALE_V2A_DEPLOYMENT_BLOCK`,
`SALE_V3_DEPLOYMENT_BLOCK`, `SOURCE_REGISTRY_V1_READBACK_BLOCK`), giving exact start blocks
for those contracts. **Start blocks for SYN burn history, LP events, and archive mint history
are NOT vendored** and would need to be discovered/pinned. Two event surfaces are also
**missing ABI fragments**: the ERC-20 `Transfer` event (burns) and the ERC-1155
`TransferSingle`/`TransferBatch` events (archive mints). **No event parser/indexer exists
today** — all of this is net-new and should start as a *design* slice, not an implementation.

---

## 7. Privacy / auth risk table

| Tier | Categories / data | Rule |
|---|---|---|
| **HIGH** | source (source/payout wallets, commission), operator (founder/operator data), per-member membership (wallets, member identity) | Never public. Auth-gated. Anonymized aggregates only, and only if founder approves. |
| **MEDIUM** | proof/receipt/sale/routing events (buyer/recipient addresses), treasury balances | Aggregate + redact before any public surface. No per-person rows. |
| **LOW** | chain, contracts (addresses server-side), archive artifact supply/config, token aggregates, guardrails | Safe as aggregates/booleans; still never emit a full address. |

Standing rules (restated): no full member wallets in public payloads; no PII; no
historical member-freeze exposure; no private founder/operator data; full contract
addresses may live server-side but are not emitted publicly without explicit founder
approval; public outputs are posture / aggregate / redacted / anonymized only. The
`/api/source-status` guard already enforces the hard floor (rejects any `0x[40-hex]`,
`supa`, financial/casino framing, non-null value, or category/key mismatch at startup).

---

## 8. Usable as-is

ABI fragments; archive tuple decoders; all pure helpers (URL builders, validators, rank
lookups, registry lookups, archive-id lookups); event taxonomy as a classification layer;
deployment-block constants as indexer start blocks. (Full table in §3.)

## 9. Needs adaptation

A net-new **typed read adapter** must be built: a server-side JSON-RPC client (e.g. viem)
configured from the vendored chain/RPC canon, with timeout + rate-limit + cache + explicit
error state. It would consume the vendored ABIs/addresses for view calls. The canon dir is
currently tsc-excluded and carries the `explorer-preference` shim, so the first slice that
compiles canon into server code owns strict-mode adaptation. Archive decoders plug straight
into `getArtifactCore` results once a reader exists.

## 10. Must not be used

`v3-historical-members.ts` (PII), `explorer-preference.ts` (DOM), Supa-Exchange,
entity-chain, Boost Protocol — none are a Syndicate source/canon/data. No mock/demo data,
no wholesale branch import.

---

## 11. First safe live-read recommendation

**`eth_chainId` (verify 43114) + `eth_getCode` at known contract addresses (boolean
output).** These need no ABI, expose no PII, no amounts, and no addresses (emit booleans
only), and they upgrade `chain` and `contracts` from *static* read-only proof to
*live-verified* read-only proof. Immediately after, **archive artifact supply/config**
(`getArtifactCore`/`remainingSupply`) is the best first read of *real protocol data* with
no privacy surface, followed by **token `decimals` verification**.

---

## 12. Recommended sequencing

1. **Minimal RPC health / chainId + getCode slice — internal-only, behind a flag, NOT
   wired to the public payload.** Proves the live path (timeout/rate-limit/cache/error)
   with zero exposure. Output to logs / an internal route the founder can inspect.
2. **Read-adapter skeleton + archive/token verification reads.** Typed adapter over
   vendored ABIs; surface only no-PII aggregates the founder approves (archive supply/
   config, token decimals/symbol). Consider the `ADAPTER_REQUIRED` posture as the
   transition label.
3. **Event-indexer DESIGN slice (design only).** Event signatures, per-contract
   `fromBlock`, aggregation + anonymization rules, storage model — for proof / source /
   sale / treasury / routing / receipt / membership-history. No implementation.
4. **DB/cache + indexer implementation**, then **auth** (operator + member-gated
   surfaces) **last**. DB/cache/auth arrive only when event indexing or private surfaces
   are explicitly approved.

## 13. Founder decisions required

1. Approve a public Avalanche RPC endpoint for **server-side** use (reconcile the
   suggested `api.avax.network` + `publicnode` fallback with the vendored canon
   endpoints), with rate-limit + timeout. Yes/no.
2. May `chainId` + contract-existence be surfaced as **live-verified** on `/status`, or
   stay internal-only first?
3. **Token:** may supply / burned / LP price be exposed as aggregates (strictly no
   investment framing)? Current doctrine says no.
4. **Sale:** may status flags (`paused` / `isConcluded` / `currentEra`) be exposed while
   the sale stays `NOT_LIVE` with no amounts and no CTA?
5. **Membership:** may aggregate `memberCount` be surfaced (class FOUNDER_DECISION)?
6. **Privacy confirmation:** all event-derived surfaces (source / proof / receipt /
   routing / sale history) must be anonymized aggregates — confirm no wallet, no
   commission, ever public.
7. Adopt the existing-but-unused **`ADAPTER_REQUIRED`** posture as the label for
   categories transitioning from static proof to live-verified?

## 14. Exact next recommended implementation slice

**Phase 1 Slice 2.11 — Minimal Server-Side Read Adapter Skeleton (chainId + contract
existence), internal-only.**
- Build the smallest possible typed read path: `eth_chainId` (assert 43114) and
  `eth_getCode` at known addresses (boolean "deployed"), configured from vendored
  chain/RPC canon.
- Hard requirements: timeout, rate limit, short cache, explicit error/unavailable state,
  **no public payload change**, **no PII**, **no amounts**, **no addresses emitted**.
- Output to logs or an internal-only route for founder inspection.
- Fully reversible; nothing user-facing changes until the founder reviews real live output
  and approves the next step.

> **Stop point.** This is the readiness map. No RPC, indexer, adapter, DB, auth, or live
> value is wired. Awaiting founder decisions (§13) before any implementation slice.
