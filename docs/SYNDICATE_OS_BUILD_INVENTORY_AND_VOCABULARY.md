# THE SYNDICATE OS — BUILD INVENTORY & CANONICAL VOCABULARY

> **Read this first.** This is the single "what exists / what's built / what we can do" map, in ONE set of
> canonical, human-readable terms. It exists so no session (human or AI) re-discovers the system or invents
> parallel vocabulary. When something changes, update this file in the same slice. Last updated: 2026-07-07.
>
> Authority: this is an *index*, not a competing canon. On any conflict, the source doc / code / chain wins
> (see `THE_SYNDICATE_OS_COMPASS.md`). Chain > code > docs.

---

## 1. Canonical vocabulary (use THESE words, human-readable)

| Concept | Canonical term | Human-readable | On-chain / source of truth |
|---|---|---|---|
| Membership rank | **Rank** (Rank Ladder) | 12 named ranks, Citizen → Cornerstone (see §2) | `RANKS_V2` / `HOME_RANK_LADDER` in `syndicate-config.ts` |
| Sale generation | **Era** | "Era I" (current: 100 SYN per 1 USDC) | `era` (uint16) in the sale contract |
| Archive/story period | **Chapter** | "Genesis Chapter" (first Archive1155 artifact) | `chapter` (uint16); Archive1155 IDs |
| Referral tier | **Source class** | Standard / Trusted / Partner (proposed §5) | `sourceClass` (uint8) in `sourceConfig` |
| Referral rate | **Commission** | a **percentage** (e.g. 8%) | `commissionBps` (uint16); 8% = 800 bps |
| Money split | **Routing** | 70% Vault / 20% Liquidity / 10% Operations (fixed) | `USDC_ROUTING`; enforced on-chain |
| Referrer (public word) | **Referral** | "Referral link / code / commission" | — |
| Referrer (protocol word) | **Source** | "Source ID / registry / receipt" | SourceRegistryV1 |
| Data honesty state | **Posture** | Not live yet / Verified — view only / Paused for safety / … | `os-contracts` (7 postures) |
| Access level | **Access state** | Visitor / Wallet connected / Signed in / Member (S1–S14) | `os-contracts` (14 states) |
| Membership arc | **Journey** | 7 steps: Buy → Rank → Registry → Archive → Participate → Governance → Vault | `JOURNEY_STEPS` |

**Word roles (referral):** Referral = user word · Source = protocol word · Commission = business word ·
Receipt = proof word · Recognition = long-term status word.

**Rate rule:** the UI always shows a **percentage**; storage/emission is basis points. A hard **cap** applies
(proposed 30% = 3000 bps — confirm). The 70/20/10 routing is separate and fixed — never confuse the two.

---

## 2. The Rank Ladder (12 named ranks — human-readable)

| # | Rank | Entry (USDC) | Group |
|---|---|---|---|
| 1 | Citizen | $5 | Open |
| 2 | Scout | $10 | Open |
| 3 | Operator | $25 | Open |
| 4 | Builder | $50 | Active |
| 5 | Strategist | $75 | Active |
| 6 | Vanguard | $100 | Active |
| 7 | Architect | $250 | Deep |
| 8 | Steward | $500 | Deep |
| 9 | Custodian | $1,000 | Deep |
| 10 | Keystone | $2,500 | Keystone |
| 11 | Inner Circle | $5,000 | Keystone |
| 12 | Cornerstone | $10,000 | Keystone |

Ranks are **recognition only** — never bonus tokens, cheaper SYN, or private terms. Transitions are by
purchase total (`rankForUsdc` / `rankForSyn`).

**Journey (7 steps):** Buy SYN (live) → Reflect Rank (live) → Join Registry (live) → Access Archive (next) →
Participate (next) → Governance (pending) → Future Vault (pending).

---

## 3. What is LIVE on-chain (Avalanche C-Chain, 43114)

| Contract | Address | Status |
|---|---|---|
| SYN Token (1B supply) | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` | LIVE |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | LIVE |
| Membership Sale V3 (active buy target) | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | LIVE (blk 88505301) |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` | DEPLOYED (readback blk 88808111) |
| Archive1155 (9 IDs) | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` | LIVE |
| LP Trader Joe SYN/USDC | `0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389` | LIVE |
| Membership Sale V1 / V2 / V2a | (sealed history — in canon) | LIVE/sealed |
| CommissionRouterV1 | — | PENDING (not deployed) |
| SeatRecord721 | — | PENDING (not deployed) |

Routing 70/20/10 wallets + 7 allocation wallets are all set in `syndicate-config.ts`. Historical member
freeze #1–#8 (real wallets, block 88496414) is server-side / PII-gated.

**On-chain commission model already exists:** per-source `sourceConfig` = `sourceWallet`, `sourceClass`,
`commissionBps`, `status`, `scope`, `startTime`/`endTime`, `grossCap`, `perBuyerCap`. The sale emits
`SourceRecorded` with `commissionBps`, `sourceClass`, `attributionWindowEndsAt`, remaining caps, etc.
Router changes are **timelocked** (`ROUTER_TIMELOCK`, `pendingCommissionRouter`).

---

## 4. What is BUILT (surfaces, backend, tooling)

### Studio (public app + operator) — 20 pages
PublicHome, Home, JoinProtocol, MemberAccess (member cockpit), Recognition, Archive, ContractMemory (→/contracts),
SourceAttribution (public referral page), SourceLinkBuilder (/source, gated), ProofDashboard, ProofStudio,
ProtocolMap, OsMap, Learning, Support, SystemStatus (→/status), AdminControlTower, OperatorPreview,
OperatorPreviewUnavailable, not-found.

### API server (read-only, fail-closed) — 8 routes
health, sourceStatus (`/api/source-status`, 24 posture categories), protocolReality, sourceValidate
(**reads SourceRegistryV1 live**), joinQuote, holderIndex, publicReadThrottle, index.

### Live-chain machinery (ALREADY BUILT — just needs an RPC env var)
`evmRead.ts`, `rpcTransport.ts` (`resolveEndpoints()`), `realityService.ts`, `saleEventIndexer.ts`,
`engineReadback.ts`, `avalanche-live-read-check.ts`. All chainId-first, fail-closed, no address leak.
**Indexers:** holder-index, sale-event-index, member-continuity, activity-heartbeat, protocol-time.
**RPC env vars:** `AVALANCHE_RPC_URL` (primary), `AVALANCHE_RPC_URL_FALLBACK`, `AVALANCHE_RPC_TIMEOUT_MS`.
**Verify command:** `pnpm --filter @workspace/api-server run live-read:check`.

### Guards (the truth/safety spine — all green)
Studio: guard-forbidden-copy (negation-aware), guard-safe-source, guard-lifecycle-labels, guard-no-fake-live,
guard-operator-gate, guard-posture-map, guard-route-nav-drift, guard-surface-coverage, guard-access-state,
check-public-surface-audit, check-seo-registry, generate-sitemap.
API: verify-canon-integrity + per-domain guards (holder-index, member-continuity, protocol-reality, sale-event,
protocol-time, avalanche-*).

### Shared packages (`lib/`)
os-contracts (postures + access states), db (Drizzle schema), api-spec, api-zod (generated types),
api-client-react (generated hooks).

### Referral + Admin (built this sprint — all preview/paused, guard-green)
- **Public referral:** `SourceAttribution` page shows the full Referral Program (paused banner, how-it-works,
  eligibility, anti-abuse, 10 states, boundary copy).
- **Member cockpit (`/member` → Source tab):** `MemberReferralDashboard` (link + code + Copy, sample stats,
  trend chart, history), `ShareCard` (verified brag card), `ShareMenu` (X/Facebook/WhatsApp/Telegram/LinkedIn/
  email), `QrCodeBlock` (real QR, PNG/SVG download — needs `react-qr-code`, added to package.json).
- **Admin control tower (`/admin`):** `AdminModulesConsole` (plugin on/off), `AdminReferralPanel` (KPIs),
  `AdminReferralCrud` (activate/pause + edit terms), `AdminOperatorsCrud` (role hierarchy + operator registry +
  source review), `AdminOperatorSurfaces` (broadcast, feature flags, audit log, support queue).
- **Config:** all referral vocabulary, states, sample data, settings, operator roles in `config/referralProgram.ts`.
- **Doctrine:** referral commission = transparent acquisition payment (not passive income / yield / downline /
  profit promise); `guard-safe-source` enforces the protective boundaries; program stays **paused** until founder
  activation + the operator write zone.

---

## 5. What we CAN do next (canonical backlog)

### Referral tiers + transparency events (no RPC needed — awaiting 3 founder decisions)
- **Source-class tiers (proposed):** Standard 5% · Trusted 8% · Partner ≤ 30% (confirm names + %).
- **Hard cap:** 30% (3000 bps) — confirm.
- **Transparency event:** add reserved kind `source-terms-changed` under the `governance` namespace so every
  rate/tier/cap change flows to **Activity + Chronicle** (old value → new value, actor, timelock). This closes
  the one gap: today config changes emit no event.

### Write zone (Phase 3 — needs auth provider + DB choice)
Turn every preview control (Modules on/off, Referral Save, Invite/Approve, Broadcast send, flag toggles) into
real writes. Wallet-first SIWE + operator registry + audit log, per `OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN`.

### Live chain (Phase 4 — needs only the RPC env var; machinery already built)
Set `AVALANCHE_RPC_URL`, run `live-read:check`, then the indexers. Sample numbers become real; "paused/active"
becomes chain-derived (not hardcoded). `/api/source-validate` already reads SourceRegistryV1 live.

### Further phases (per the 12-phase ledger)
5 proof/source/recognition · 6 archive/chronicle/history · 7 token/economy/treasury · 8 sale/join ·
9 Member OS · 10 founder/operator cockpit · 11 entities/x402 (founder go/no-go) · 12 exchange (founder go/no-go).

---

## 6. Event vocabulary (single taxonomy — `protocol-event-registry.ts`)

**Live kinds (13):** new-member, rank-reached, swap-buy, swap-sell, lp-add, lp-remove, vault-in, vault-out,
nft-mint-first-signal, nft-mint-patron-seal, nft-mint-other, burn-founder, burn-community.

**Reserved namespaces (not wired):** referral-attribution, referral-reward (commission settlement), governance,
burn-governance, marketplace. → **Add `source-terms-changed` here** for rate-change transparency.

---

## 7. Standing pointers
- Meta-canon router: `THE_SYNDICATE_OS_COMPASS.md`
- Reconciliation + carte-blanche authority: `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md`
- Roles/auth design: `docs/architecture/OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md`
- Harvest/reuse map: `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md`
- Contracts/addresses/vocabulary: `artifacts/api-server/src/canon/the-syndicate/contracts/syndicate-config.ts`

*Keep this file current — a stale inventory is a bug.*
