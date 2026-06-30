# Prior-Art Reconciliation — Slice 2.19D

**Posture, Adapter, Surface & Proof Vocabulary**

> READ-ONLY / REPORT-ONLY reconciliation. This document compares the new clean
> Source Boundary Manifest (the current authority of `duniterum/syndicate-os`)
> against the prior-developed truth-layer, adapter, surface, proof, source-attribution,
> member, archive, and burn work in the public prior-art repo `duniterum/TheSyndicate`.
> It does **not** implement TypeScript types, change runtime behaviour, wire data, or
> start 2.19E. It is the senior reconciliation map that will guide the 2.19E type contracts.

| Field | Value |
|---|---|
| Slice | 2.19D — Prior-Art Reconciliation |
| Mode | READ-ONLY / REPORT-ONLY (docs-only) |
| New repo (authority) | `duniterum/syndicate-os` (private), main `045c76c0399fea4722d3e68772a791c4f570fcdb` |
| Old repo (prior art, **not** authority) | `duniterum/TheSyndicate` (public), read-only clone |
| Current authority docs | `README.md`, `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md`, server-side canon + `PROVENANCE.md`, `replit.md`, `artifacts/studio/src/config/truthStatus.ts` |
| Prior-art files inspected | 29 listed (29 present, 0 absent) + supporting glossary/canon |

---

## 1. Executive Verdict

- **Is it safe to proceed to TypeScript posture contracts after this reconciliation?**
  **Yes.** The new manifest vocabulary is sound, and the prior art confirms (rather than
  contradicts) the manifest's core lifecycle terms. No blocking vocabulary conflict was found.

- **Did old TheSyndicate contain relevant prior-art vocabulary/structures?**
  **Yes — substantial and directly relevant.** The old repo already shipped a layered
  truth/posture system (`AdapterStatus`, `ContractRefStatus`, `ReadState`, `TruthSource`,
  `TruthConfidence`, `BurnScanCompleteness`), a public/member surface model (`surfaces.ts`,
  proof matrix), a full set of **type-only adapter seams** (`adapters.ts`), two **concrete
  read-only live adapters** (`burn-proof-adapter.ts`, `wallet-adapter.ts`), and an extensive
  canon/glossary with binding terminology-collision rulings. The new manifest's two strongest
  terms — `READ_ONLY_PROOF` and `NOT_WIRED` — **originate in this prior art.**

- **Should 2.19E encode the new manifest exactly, adapt old vocabulary, or use compatibility aliases?**
  **Encode the new manifest as the primary canon, adapt two old concepts in, and add a small
  number of compatibility aliases (documentation-level, not exported public API).** The new
  manifest is cleaner and safer (it removes simulated/fake postures). The old work contributes
  two things the manifest should absorb: (a) the **completeness/reconciliation** honesty model
  for Proof-of-Fire, and (b) the **three-axis separation** of posture vs. source vs. confidence
  (kept as optional metadata, not collapsed into posture).

- **Recommended final approach.**
  1. Make the manifest's **7-state posture lifecycle** the single canonical capability axis.
  2. Keep the already-shipped `truthStatus.ts` **reason codes** as a *separate, finer display
     axis* and formally map each reason code to a posture (do not merge the two into one enum).
  3. Reject every `SIMULATED` / `PROTOTYPE` / `DEMO PREVIEW` posture from the old repo.
  4. Treat old "LIVE" / "LIVE_READ" as **read-only proof of a live source**, never as the new
     `LIVE_ACTION` (which means an executed write). This is the single highest-risk mismatch.
  5. Defer (do not port) the concrete client-side live read/RPC/wallet adapters.

---

## 2. Sources Inspected

### 2a. New repo authority files (private `duniterum/syndicate-os`)

| Source file | Exists? | Inspected? | Relevance | Reason |
|---|---|---|---|---|
| `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` | Yes | Yes | HIGH | Current authority for posture/surface/domain/adapter vocabulary. |
| `artifacts/studio/src/config/truthStatus.ts` | Yes | Yes | HIGH | Already-shipped runtime status/reason vocabulary + per-surface posture map. |
| `artifacts/api-server/src/canon/the-syndicate/PROVENANCE.md` | Yes | Yes | MEDIUM | Server-side canon provenance; defines what is locally pinned vs. not. |
| `README.md` | Yes | Yes | MEDIUM | Architecture-spec index; possible pointer target. |
| `replit.md` | Yes | Yes | MEDIUM | Project doctrine + phase discipline + forbidden copy. |

### 2b. Old prior-art files (public `duniterum/TheSyndicate`)

| Source file | Exists? | Inspected? | Relevance | Reason |
|---|---|---|---|---|
| `apps/product-os-studio/src/lib/adapters.ts` | Yes | Yes | HIGH | The canonical type-only adapter-seam + posture vocabulary of the old OS. |
| `apps/product-os-studio/src/lib/protocol-truth-registry.ts` | Yes | Yes | HIGH | `TruthGroup` / `TruthSource` / `TruthConfidence` / posture three-axis model. |
| `apps/product-os-studio/src/lib/surfaces.ts` | Yes | Yes | HIGH | Public↔member surface model + group taxonomy. |
| `apps/product-os-studio/src/lib/burn-proof-types.ts` | Yes | Yes | HIGH | `BurnScanCompleteness` reconciliation/honesty model. |
| `apps/product-os-studio/docs/STUDIO_PUBLIC_PROOF_MATRIX.md` | Yes | Yes | HIGH | Public visibility layers + anonymization rules + module status labels. |
| `apps/product-os-studio/docs/STUDIO_ADAPTER_SEAMS.md` | Yes | Yes | HIGH | Per-adapter posture map; type-only-vs-live boundary. |
| `apps/product-os-studio/src/lib/burn-proof-adapter.ts` | Yes | Yes | MEDIUM | Concrete read-only burn scan (live-read prior art; defer, do not port). |
| `apps/product-os-studio/src/lib/wallet-adapter.ts` | Yes | Yes | MEDIUM | Concrete read-only wallet/identity prior art (defer to auth design). |
| `apps/product-os-studio/src/lib/protocol-snapshot-adapter.ts` | Yes | Yes | MEDIUM | Client-side RPC snapshot (defer; not a new-repo pattern). |
| `apps/product-os-studio/src/pages/member-home.tsx` | Yes | Yes | MEDIUM | Member dashboard shape + member-data fields (simulated in old repo). |
| `apps/product-os-studio/src/pages/public-registry.tsx` | Yes | Yes | MEDIUM | Public registry/proof surface prior art. |
| `apps/product-os-studio/src/pages/public-referral-status.tsx` | Yes | Yes | MEDIUM | Verified-introduction (source attribution) public surface prior art. |
| `docs/canon/03_GLOSSARY.md` | Yes | Yes | HIGH | Binding terminology + collision rulings + banned financial vocabulary. |
| `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` | Yes | Yes | MEDIUM | Source-of-truth tiers (contains address values — not reproduced here). |
| `docs/canon/08_PROTOCOL_OPERATING_PRINCIPLE.md` | Yes | Yes | MEDIUM | "Derive, Don't Invent" principle — aligns with new doctrine. |
| `docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` | Yes | Yes | MEDIUM | Two-kinds-of-truth + fact lifecycle + canonical homes. |
| `docs/MODULE_INTEGRATION_STANDARD.md` | Yes | Yes | HIGH | Module taxonomy, activation gates, anti-fragmentation intake. |
| `docs/PROTOCOL_TRUTH_LAYER_REPORT.md` | Yes | Yes | MEDIUM | Centralized status enum + canonical-facts consolidation history. |
| `docs/PROTOCOL_METRICS_REGISTRY_REPORT.md` | Yes | Yes | MEDIUM | One-registry-projected-everywhere pattern + legal-vocab enforcement. |
| `docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md` | Yes | Yes | HIGH | Source/referral capability matrix + phased architecture + copy rules. |
| `docs/SOURCE_PUBLIC_PRODUCT_DECISION_FRAMEWORK.md` | Yes | Yes | MEDIUM | Source-product V1 shape + no-go conditions. |
| `docs/SOURCE_PUBLIC_PRODUCT_DECISION_GATE.md` | Yes | Yes | MEDIUM | Required gates / forbidden-until-approved for source product. |
| `docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md` | Yes | Yes | MEDIUM | Referral V1 readiness + non-negotiable copy guards + non-authorization. |
| `docs/CONTRACT_INTEGRATION_STATUS.md` | Yes | Yes | MEDIUM | Archive1155 integration status (contains address values — not reproduced). |
| `docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md` | Yes | Yes | MEDIUM | Archive/NFT canonical architecture + rights disclaimer. |
| `docs/TRANSACTION_TAG_REGISTRY.md` | Yes | Yes | MEDIUM | Transaction tag schema (activity/proof domain prior art). |
| `docs/MEMBER_WALL_SPEC.md` | Yes | Yes | MEDIUM | Member-wall shown/hidden data rules; "what it must not become". |
| `docs/DATA_SOURCE_MAP.md` | Yes | Yes | MEDIUM | Hooks→sources map + "static-where-live-exists" flags. |
| `docs/DATA_VERIFICATION_REGISTRY.md` | Yes | Yes | MEDIUM | Heartbeat/hero metrics + "what NOT to expose". |

**29 of 29 listed prior-art files present; 0 absent.** No file was fabricated. Files
containing address/hash/value data were inspected for vocabulary only; **no sensitive
value is reproduced in this report** (path/category/count only — see §11/§12).

---

## 3. Current New Manifest Vocabulary

Summarized from `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` (verified against the file)
and the shipped `artifacts/studio/src/config/truthStatus.ts`.

- **Posture Lifecycle (7 states):** `NOT_WIRED`, `READ_ONLY_PROOF`,
  `VERIFIED_SOURCE_PENDING_ADAPTER`, `AUTH_REQUIRED`, `ADMIN_ONLY`, `LIVE_ACTION`, `FUTURE`.
- **Surface Model (6):** `PUBLIC_VISITOR`, `AUTHENTICATED_MEMBER`, `PRIVATE_OPERATOR_ADMIN`,
  `API_READ_MODEL`, `SERVER_SIDE_CANON`, `FUTURE_AUTOMATION_INDEXER`.
- **Data/Proof Domains (14):** membership-seat-receipt, wallet-member-identity,
  activity-heartbeat, contract-registry-status, source-verified-introduction,
  archive-nft-memory, chronicle-institutional-memory, transparency-economy-routing,
  proof-of-fire-burn-events, dashboard-system-health, admin-operator-audit-events, and three
  `FUTURE_*` domains (marketplace/payment, swap/exchange-utility, governance/DAO).
- **Adapter Types (9):** canon, chain-event, receipt-read-model, activity-index,
  economy-snapshot, archive-memory, source-attribution, health-status, admin-audit.
- **Member/Admin direction:** the OS is not a marketing-only frontend; it grows into
  public-visitor + authenticated-member + private-operator/admin, all auth/privacy/approval-gated.
- **Verified Existing Data rule:** any already-verified sale/member/receipt data is not "fake"
  and must be classified `VERIFIED_SOURCE_PENDING_ADAPTER` or `AUTH_REQUIRED` — never invented,
  never silently dropped, never publicly exposed before adapters/auth exist.
- **Upgrade Gate:** moving a domain toward `LIVE_ACTION` requires a verified source, an adapter,
  auth/privacy where applicable, tests, fail-closed behaviour, and founder approval.

**Shipped reason-code layer (`truthStatus.ts`, the existing runtime UI vocabulary):**
`NOT_LIVE`, `DESIGN_PREVIEW`, `FUTURE_MODULE`, `EVENT_ADAPTER_NOT_WIRED`,
`SOURCE_INDEXER_NOT_WIRED`, `ARCHIVE_READS_NOT_WIRED`, `AWAITING_CHAIN_INDEX`,
`SYNDICATE_INDEXER_NOT_WIRED`, `AWAITING_FOUNDER_APPROVAL`, `LIVE_SOURCE_MISSING`. These are a
**finer "why-not-live" axis** keyed by `SurfaceId` (membership, proofOfFire, sourceAttribution,
archive, recognition, proofEventParser, founderControls, publicDashboard, coreApiRpc,
contractState). Post-vendoring doctrine: a surface whose ABI/canon is vendored says "… Not
Wired" (the live wiring is the gap), not "awaiting canon".

> **Key reconciliation fact:** the new repo already runs **two** vocabularies — the manifest's
> 7-state *posture lifecycle* (capability/security axis) and `truthStatus.ts`'s 10 *reason
> codes* (display axis). The old repo adds a **third** family of enums. 2.19E must reconcile all
> three deliberately, not invent a fourth.

---

## 4. Old TheSyndicate Vocabulary / Structures Found

Conceptual vocabulary only; no sensitive values. "Kind" = code / doc / UI. "Health" =
proven-usable / partial / stale / unsafe.

### 4a. Truth / status vocabulary
| Old term/structure | Old source | Meaning in old repo | Kind | Health |
|---|---|---|---|---|
| `AdapterStatus` = `SIMULATED` \| `ADAPTER_REQUIRED` \| `READ_ONLY_PROOF` \| `NOT_WIRED` | `lib/adapters.ts` | Posture of a Studio value vs production. | code | partial (SIMULATED unsafe) |
| `ContractRefStatus` = `READ-ONLY PRODUCTION PROOF` \| `PAUSED` \| `PROTOTYPE PLACEHOLDER` \| `ADAPTER REQUIRED` \| `NOT WIRED` | `lib/adapters.ts` | Posture of a contract reference. | code | partial (PROTOTYPE unsafe) |
| `ReadState` = idle/notConnected/wrongNetwork/loading/live/partial/anomaly/stale/error/read-only-proof/adapter-required | `lib/adapters.ts` | Runtime read lifecycle for live reads. | code | proven (read-layer), but live-read-specific |
| `DataPosture` family: `READ_ONLY_PROOF`, `LIVE_READ`, `PROTOTYPE`, `PAUSED`, `NOT_WIRED`, `NOT_LIVE`, `ADAPTER_REQUIRED`, `FUTURE` | `lib/protocol-truth-registry.ts` | Per-truth-item posture. | code | partial (PROTOTYPE unsafe) |
| `TruthSource` = production-porting-map \| on-chain-live-read \| snowtrace \| studio-prototype \| adapter-seam | `lib/protocol-truth-registry.ts` | **Where** a value's truth comes from. | code | proven (orthogonal axis) |
| `TruthConfidence` = verified \| reconciled \| live-read \| static-proof \| adapter-required \| simulated \| paused | `lib/protocol-truth-registry.ts` | **How sure** of the value as shown. | code | proven (orthogonal axis) |
| Status pills `LIVE` \| `PARTIAL` \| `PENDING` \| `DEMO PREVIEW` | `canon/03_GLOSSARY.md` | Public status labels. | doc/UI | partial (DEMO unsafe) |
| Module status labels `LIVE NOW` \| `READ-ONLY` \| `IN REVIEW` \| `V1 CANDIDATE` \| `FUTURE` \| `SIMULATED PROTOTYPE` | proof matrix / surfaces | Per-module UI status. | UI | partial (SIMULATED unsafe) |

### 4b. Surface vocabulary
| Old term | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| Three visibility layers: **Public proof / Member personal / Founder-operator** | proof matrix | The trust tiers of the old OS. | doc | proven (maps to new surfaces) |
| `SurfaceGroup` = `Proof` \| `Memory` \| `Resources` | `lib/surfaces.ts` | Nav grouping (orthogonal to trust). | code | proven (nav taxonomy) |
| `PublicSurface` + `memberPath` mapping (activity, economy, registry, recognition, referral-status, fire, evolution, chronicle, archive, toolkit, share, press, learn) | `lib/surfaces.ts` | One public↔member map reused everywhere to prevent drift. | code | proven (strong pattern) |
| Member personal nav (`MEMBER_NAV`) | proof matrix | Simulated connected-wallet member view. | UI | unsafe (was simulated; needs auth) |

### 4c. Adapter vocabulary
| Old seam | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| `WalletAdapter` | `lib/adapters.ts` (+ concrete `wallet-adapter.ts`) | Wallet connect/identity; concrete file did a real read-only SYN balance LIVE read. | code | partial (defer; auth/identity) |
| `ContractRegistryAdapter` | `lib/adapters.ts` | List canonical contract refs. | code | proven |
| `MembershipSaleAdapter` | `lib/adapters.ts` | Sale stats/quote/buy (buy NOT wired). | code | proven (type-only) |
| `MemberIndexAdapter` | `lib/adapters.ts` | Member index from purchase events. | code | proven (type-only) |
| `ActivityAdapter` (+ `PurchaseEvent`) | `lib/adapters.ts` | Recent activity / purchase scan. | code | proven (type-only) |
| `SourcePolicyAdapter` (+ `SourcePolicyState` = PAUSED/ACTIVE/REVOKED, `ZERO_SOURCE_ID`) | `lib/adapters.ts` | Source/referral policy (PAUSED today). | code | proven (type-only) |
| `ArchiveAdapter` | `lib/adapters.ts` | Archive1155 list/mint (mint NOT wired). | code | proven (type-only) |
| `BurnProofAdapter` | `lib/adapters.ts` (+ concrete `burn-proof-adapter.ts`, 497 lines) | Proof-of-Fire proofs; concrete file did a real read-only `eth_getLogs` burn scan. | code | partial (live-read; defer impl) |
| `TransparencyAdapter` (+ `RoutingSplit` 70/20/10, `TransparencyTotals`) | `lib/adapters.ts` | Economy/routing totals. | code | proven (type-only) |
| `protocol-snapshot-adapter.ts` (RPC snapshot, balances) | `lib/protocol-snapshot-adapter.ts` | Client-side RPC balance snapshot. | code | partial (client RPC; defer) |

### 4d. Proof / data-domain vocabulary
| Old term | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| `TruthGroup` = chain \| contracts \| proof-of-fire \| routing-economy \| membership-seat \| referral-source \| archive-memory \| activity-chronicle | `lib/protocol-truth-registry.ts` | The old proof/data domains. | code | proven (maps to new 14) |
| `ProofKind` = On-chain \| ERC-1155 \| Internal \| Protocol | `lib/adapters.ts` | Proof provenance class. | code | proven |
| `BurnScanCompleteness` = not-scanned \| complete \| partial \| anomaly | `lib/burn-proof-types.ts` | Honest completeness via reconciliation (sum(events) vs live balance of sink). | code | **proven — high value** |
| Transaction tag schema | `docs/TRANSACTION_TAG_REGISTRY.md` | Activity/heartbeat tagging. | doc | proven |

### 4e. Source / referral / attribution vocabulary
| Old term | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| `ZERO_SOURCE_ID` (default public buys) | `lib/adapters.ts` | No source attributed; default path. | code | proven |
| Source = **attribution**, never **reward** | `canon/03_GLOSSARY.md` (ruling #6) | Referral attributes who caused a join; reward = payout (FUTURE/PENDING). | doc | **proven — binding** |
| Capability matrix + phased architecture + no-go gates | source-attribution / decision docs | What source attribution can/can't do, gated. | doc | proven |
| "Verified Introduction" public label | `surfaces.ts` / `public-referral-status.tsx` | Public-safe name for referral status (V1 candidate, not live). | code/UI | proven (good naming) |

### 4f. Member / account / dashboard vocabulary
| Old term | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| `MemberIndexEntry` (address, designation "Member #N", seatHeld, chapter, capitalFootprintUsdc, contributionDepth, synAcquired) | `lib/adapters.ts` | Member record shape. | code | partial (capital/contribution fields are exposure-sensitive) |
| `Member` vs `Holder` distinction | `canon/03_GLOSSARY.md` (ruling #4) | Member joined via sale (seat + number); holder holds SYN any way. | doc | **proven — binding** |
| Member-wall shown/hidden rules + "what it must not become" | `docs/MEMBER_WALL_SPEC.md` | Social-proof tile rules; anti-wealth-leaderboard. | doc | proven |

### 4g. Registry / proof / public-verification vocabulary
| Old term | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| `PROTOCOL_TRUTH_REGISTRY` / `ProtocolTruthItem` | `lib/protocol-truth-registry.ts` | One registry, projected everywhere. | code | proven (pattern) |
| Public proof matrix + anonymization (`PUBLIC_HEARTBEAT`, opaque `Seat A/B` relabel) | proof matrix / `protocol-graph.ts` | Public surfaces strip personal data; numeric seats relabelled opaque. | doc/code | **proven — high value** |
| Data verification registry ("what NOT to expose") | `docs/DATA_VERIFICATION_REGISTRY.md` | Per-metric verification + exposure rules. | doc | proven |

### 4h. Burn / archive / memory vocabulary
| Old term | Old source | Meaning | Kind | Health |
|---|---|---|---|---|
| Proof of Fire / `PROOF_OF_FIRE_001`..`NNN` | burn-proof types/adapter | Deterministic 1-based numbering of burn events. | code | proven |
| Burn reconciliation (sum events === live balanceOf sink) | `lib/burn-proof-types.ts` | Provable completeness; otherwise honestly "partial". | code | **proven — high value** |
| Archive1155 / `memoryOnly: true` / "memory, not financial rights" | `lib/adapters.ts`, archive docs | NFTs are memory artifacts, never seats/financial rights. | code/doc | **proven — binding** |
| Deep-lore layering Archive/Chronicle/Relic (Relic banned in live UI) | `canon/03_GLOSSARY.md` | Layered vocabulary, public vs lore. | doc | proven |

### 4i. Live / pending / not-wired posture vocabulary
| Old term | Meaning | Health |
|---|---|---|
| `LIVE` / `LIVE NOW` / `LIVE_READ` | Live **read-only verifiable** (NOT a write). | proven — but collides with new `LIVE_ACTION` (see §5) |
| `NOT_WIRED` / `NOT WIRED` | No interaction wired. | proven (preserve) |
| `ADAPTER_REQUIRED` / `ADAPTER REQUIRED` | Value/behaviour deferred to a future adapter. | proven (→ `VERIFIED_SOURCE_PENDING_ADAPTER`) |
| `PAUSED` | Deployed but inactive (e.g. SourceRegistryV1). | proven (model as sub-note, not top-level posture) |
| `NOT_LIVE` / `PENDING` | Not operating / contract not deployed. | proven |
| `READ_ONLY_PROOF` | Static canonical reference, inert. | **proven — origin of the new term** |

### 4j. Module integration rules
| Old term | Old source | Meaning | Health |
|---|---|---|---|
| Module taxonomy + manifest standard + activation gates | `docs/MODULE_INTEGRATION_STANDARD.md` | How a module is defined/activated; anti-fragmentation intake. | proven |
| "Derive, Don't Invent" operating principle | `canon/08_PROTOCOL_OPERATING_PRINCIPLE.md` | Higher systems derive from lower truth; never invent. | **proven — matches new doctrine** |
| Two kinds of truth + fact lifecycle + canonical homes | `canon/09_PROTOCOL_KNOWLEDGE_MAP.md` | Where facts live; anti-fragmentation. | proven |

### 4k. Unsafe or stale vocabulary
| Old term | Why unsafe/stale |
|---|---|
| `SIMULATED`, `PROTOTYPE PLACEHOLDER`, `DEMO PREVIEW`, `SIMULATED PROTOTYPE`, `studio-prototype`, `simulated` (confidence) | The old Studio ran on simulated/fake data. The new doctrine forbids fake data entirely — these postures must not exist in 2.19E. |
| Concrete client-side live reads (`burn-proof-adapter.ts`, `wallet-adapter.ts`, `protocol-snapshot-adapter.ts`) | Real RPC/`eth_getLogs`/wallet reads shipped client-side — contradicts "no live wiring yet" + server-side-canon direction. Defer. |
| Real address/value constants surfaced as `READ-ONLY PRODUCTION PROOF` in client (old `mock-data.ts` PRODUCTION_PROOF, source-of-truth table) | Address/value exposure on public surfaces. New repo keeps such values server-side and unprinted. |
| `capitalFootprintUsdc` / `contributionDepth` member ranking fields | Wealth-ranking exposure risk; old canon itself bans "wealth leaderboard". |
| Snowtrace deep-links as a truth source (`snowtrace`, `txExplorerUrl`) | Couples public proof to an external explorer + exposes tx/address identifiers. |

---

## 5. Compatibility / Mapping Table

| Old term / structure | New manifest term | Proposed final TS term | Action | Reason |
|---|---|---|---|---|
| `NOT_WIRED` / `NOT WIRED` | `NOT_WIRED` | `NOT_WIRED` | **PRESERVE** | Identical meaning; old origin. |
| `READ_ONLY_PROOF` / `READ-ONLY PRODUCTION PROOF` | `READ_ONLY_PROOF` | `READ_ONLY_PROOF` | **PRESERVE** | Origin term; new repo already uses it. |
| `ADAPTER_REQUIRED` / `ADAPTER REQUIRED` | `VERIFIED_SOURCE_PENDING_ADAPTER` | `VERIFIED_SOURCE_PENDING_ADAPTER` | **RENAME (+doc alias)** | New term is clearer and ties to a *verified* source. Keep old as documented alias. |
| `LIVE` / `LIVE NOW` / `LIVE_READ` (read-only verifiable) | `READ_ONLY_PROOF` (live-sourced) | `READ_ONLY_PROOF` | **REMAP — do NOT collapse to `LIVE_ACTION`** | Old "LIVE" was a read, not a write. `LIVE_ACTION` = executed write. Collapsing them would grant phantom write capability. **Highest-risk mismatch.** |
| `PAUSED` / `SourcePolicyState=PAUSED` | (none) | sub-note on `VERIFIED_SOURCE_PENDING_ADAPTER` | **DEFER** | "Deployed but inactive" is a source-state nuance, not a top-level capability posture. |
| `SourcePolicyState` = `ACTIVE` / `REVOKED` | (none) | source-state metadata | **DEFER** | Policy lifecycle, not OS posture; model later under source-attribution adapter. |
| `SIMULATED` / `PROTOTYPE` / `DEMO PREVIEW` / `studio-prototype` | (none) | (none) | **REJECT** | No fake/simulated posture allowed in new doctrine. |
| `NOT_LIVE` / `PENDING` | `NOT_WIRED` (no adapter) or `FUTURE` (no contract) | `NOT_WIRED` / `FUTURE` | **MERGE** | Disambiguate by cause; both already representable. |
| `V1 CANDIDATE` / `IN REVIEW` | (none) | workflow metadata, not a type | **DEFER** | Process states, not type-level postures. |
| `TruthSource` (5 values) | (none at posture level) | optional `source` metadata axis | **DEFER (keep as separate axis)** | Valuable orthogonal axis; do not fold into posture. |
| `TruthConfidence` (7 values) | (none at posture level) | optional `confidence` metadata axis | **DEFER (keep as separate axis)** | Same; keep separate, drop `simulated` value. |
| `ReadState` (11 values) | (runtime, not posture) | runtime read-state type | **DEFER** | Belongs to a future live-read layer, not the posture canon. |
| `TruthGroup` (8) | 14 Data/Proof Domains | proof-domain union | **MERGE/EXPAND** | New domains are a superset; old `activity-chronicle` **splits** into activity + chronicle. |
| `referral-source` | `SOURCE_VERIFIED_INTRODUCTION` | `SOURCE_VERIFIED_INTRODUCTION` | **RENAME** | Aligns with glossary ruling #6 (attribution, not reward). |
| `routing-economy` | `TRANSPARENCY_ECONOMY_ROUTING` | `TRANSPARENCY_ECONOMY_ROUTING` | **RENAME** | Clearer; same concept (70/20/10). |
| `membership-seat` | `MEMBERSHIP_SEAT_RECEIPT` | `MEMBERSHIP_SEAT_RECEIPT` | **RENAME** | Adds receipt provenance. |
| `archive-memory` | `ARCHIVE_NFT_MEMORY` | `ARCHIVE_NFT_MEMORY` | **PRESERVE** | Same; "memory, not rights" preserved. |
| `proof-of-fire` | `PROOF_OF_FIRE_BURN_EVENTS` | `PROOF_OF_FIRE_BURN_EVENTS` | **PRESERVE** | Carry the `BurnScanCompleteness` honesty model with it. |
| `contracts` / `chain` | `CONTRACT_REGISTRY_STATUS` / `DASHBOARD_SYSTEM_HEALTH` | both | **MERGE** | Old `chain` health folds into system-health/contract-status. |
| Old adapter seams (`WalletAdapter`…`TransparencyAdapter`) | 9 new adapter kinds | see §9 | **RENAME/MERGE** | One-to-one or merged; wallet → identity/auth (defer). |
| `truthStatus.ts` reason codes (shipped) | finer display axis | `TruthStatus` (keep) | **PRESERVE as separate axis + add posture map** | Already shipped UI vocabulary; map each to a posture, don't merge. |
| Banned financial vocabulary (glossary) | forbidden-copy doctrine | (lint/guard list) | **PRESERVE** | Identical to new repo's forbidden-copy rule. |

> Where old wording is better it is recommended (e.g. "Verified Introduction" naming, the
> reconciliation/completeness model). Where new wording is cleaner it is kept and the old term
> is retained only as a documentation alias. Semantically different terms (`LIVE` read vs
> `LIVE_ACTION` write; `referral` vs `reward`) are **not** collapsed.

---

## 6. Final Recommended Posture Vocabulary for 2.19E

Encode the manifest's 7 states exactly. The prior art did not prove a better posture set; it
proved the *need to keep read separate from write* and to keep `truthStatus.ts` as a separate axis.

| Literal | Human meaning | Public/private | In public UI? | May contain user/member data? | May execute an action? | Upgrade gate required? | Old aliases |
|---|---|---|---|---|---|---|---|
| `NOT_WIRED` | No source/adapter connected yet. | either | yes (as labelled) | no | no | n/a | `NOT_WIRED`, `NOT WIRED`, `NOT_LIVE` |
| `READ_ONLY_PROOF` | Verified, inert, read-only proof (may reflect a live source) — display only. | public-safe | yes | no (aggregate/anonymized only) | no | n/a | `READ-ONLY PRODUCTION PROOF`, `READ_ONLY_PROOF`, `LIVE`/`LIVE_READ` (read sense) |
| `VERIFIED_SOURCE_PENDING_ADAPTER` | A real verified source exists; the adapter/read-model is not built yet. | either | yes (as labelled) | no (until adapter+auth) | no | yes (to advance) | `ADAPTER_REQUIRED`, `ADAPTER REQUIRED`, `V1 CANDIDATE`, `PAUSED` (deployed-inactive) |
| `AUTH_REQUIRED` | Member-scoped data requiring authentication/privacy. | private | no (gated) | yes (after auth) | no (read) | yes (auth design) | old `MEMBER_NAV` / member-personal |
| `ADMIN_ONLY` | Operator/admin-scoped surfaces and controls. | private | no (gated) | yes (operator) | sometimes (gated) | yes (auth + approval) | old "Founder / operator" mode |
| `LIVE_ACTION` | An executed real write/transaction. | gated | only the entry point, gated | yes | **yes** | yes (full gate) | (none — old repo never shipped a live write) |
| `FUTURE` | Planned concept; no contract/source/design yet. | either | yes (as labelled) | no | no | n/a | `FUTURE`, `PENDING`, `FUTURE_MODULE` |

Explicit clarifications (required by spec):
- **`READ_ONLY_PROOF` is not a permanent global freeze.** It is the per-domain display posture
  for verified inert data; domains advance independently through the upgrade gate.
- **Existing verified sales/member/receipt data** is classified `VERIFIED_SOURCE_PENDING_ADAPTER`
  (source proven, adapter pending) or `AUTH_REQUIRED` (member-scoped) — never `SIMULATED`,
  never invented, never publicly exposed before adapters/auth exist.
- **`LIVE_ACTION`** requires source + adapter + auth/privacy (where applicable) + tests +
  fail-closed behaviour + founder approval. The old repo has **no** `LIVE_ACTION` prior art
  (it never shipped a write), so there is nothing to alias here — start clean.

**Reason-code reconciliation (keep `truthStatus.ts` as a second axis):** recommended posture
mapping for the shipped reason codes — `NOT_LIVE`→`NOT_WIRED`; `DESIGN_PREVIEW`→`NOT_WIRED`
(or `FUTURE`); `FUTURE_MODULE`→`FUTURE`; `EVENT_ADAPTER_NOT_WIRED` /
`SOURCE_INDEXER_NOT_WIRED` / `ARCHIVE_READS_NOT_WIRED` / `SYNDICATE_INDEXER_NOT_WIRED` /
`LIVE_SOURCE_MISSING`→`VERIFIED_SOURCE_PENDING_ADAPTER` (canon vendored, live wiring is the gap);
`AWAITING_CHAIN_INDEX`→`VERIFIED_SOURCE_PENDING_ADAPTER`; `AWAITING_FOUNDER_APPROVAL`→
`ADMIN_ONLY`/gate. Encode this as a `Record<TruthStatus, Posture>`, not by merging the enums.

---

## 7. Final Recommended Surface Vocabulary for 2.19E

Encode the manifest's 6 surfaces. Keep the old `SurfaceGroup` (Proof/Memory/Resources) as a
**navigation** taxonomy only — it is orthogonal to the trust/surface model, do not conflate.

| Literal | Meaning | Allowed data | Forbidden data | Old aliases |
|---|---|---|---|---|
| `PUBLIC_VISITOR` | Unauthenticated public surfaces. | aggregate/anonymized, labelled proof | member PII, wallet values, addresses, raw receipts | old "Public proof" (`PROOF_SURFACES` + `RESOURCE_SURFACES`) |
| `AUTHENTICATED_MEMBER` | Member-scoped, post-auth. | the member's own verified data | other members' data; admin controls | old "Member personal" (`MEMBER_NAV`) — was simulated |
| `PRIVATE_OPERATOR_ADMIN` | Operator/admin console. | operational state, audit, config (gated) | anything public; unaudited writes | old "Founder / operator" mode — was simulated |
| `API_READ_MODEL` | Server read-model the UI consumes. | adapter-shaped read models | secrets; raw chain creds; PII beyond scope | (none — new layer; partial overlap with old hooks/`DATA_SOURCE_MAP`) |
| `SERVER_SIDE_CANON` | Server-held canonical truth (ABIs, registries, provenance). | pinned canon values | client exposure of raw values | old `production-porting-map` / canon (was client-surfaced) |
| `FUTURE_AUTOMATION_INDEXER` | Planned off-chain indexers/automation. | (planned) | shipping before approval | old `*_INDEXER_NOT_WIRED` intent |

---

## 8. Final Recommended Proof Domains for 2.19E

Encode the manifest's 14 domains. Carry the old reconciliation/honesty model into the burn
domain. `activity-chronicle` **splits** (old conflation) into two domains — do not re-merge.

| Canonical literal | Meaning | Current posture | Future target | Required adapter / read-model | Old aliases | Reject/defer notes |
|---|---|---|---|---|---|---|
| `MEMBERSHIP_SEAT_RECEIPT` | Seat = SYN acquired by joining; sale receipt provenance. | `VERIFIED_SOURCE_PENDING_ADAPTER` | `AUTH_REQUIRED` (member) / `READ_ONLY_PROOF` (aggregate) | receipt-read-model | `membership-seat`, `MembershipSaleAdapter` | keep Member≠Holder ruling. |
| `WALLET_MEMBER_IDENTITY` | Member identity tied to wallet. | `AUTH_REQUIRED` | `AUTH_REQUIRED` | (identity/auth) | `WalletAdapter` | defer to auth design; no client key-gen. |
| `ACTIVITY_HEARTBEAT` | Public protocol activity feed (anonymized). | `VERIFIED_SOURCE_PENDING_ADAPTER` | `READ_ONLY_PROOF` | activity-index | `activity` (from `activity-chronicle`), `ActivityAdapter` | apply `PUBLIC_HEARTBEAT` anonymization. |
| `CONTRACT_REGISTRY_STATUS` | Canonical contract/registry status. | `READ_ONLY_PROOF` | `READ_ONLY_PROOF` | canon / chain-event | `contracts`, `chain`, `ContractRegistryAdapter` | values stay server-side. |
| `SOURCE_VERIFIED_INTRODUCTION` | Who introduced/caused a join (attribution, not reward). | `VERIFIED_SOURCE_PENDING_ADAPTER` (PAUSED) | `AUTH_REQUIRED` | source-attribution | `referral-source`, `SourcePolicyAdapter`, "Verified Introduction" | never "reward/earn"; gated. |
| `ARCHIVE_NFT_MEMORY` | Archive1155 memory artifacts. | `READ_ONLY_PROOF` (reads) | `READ_ONLY_PROOF` / member | archive-memory | `archive-memory`, `ArchiveAdapter` | "memory, not financial rights". |
| `CHRONICLE_INSTITUTIONAL_MEMORY` | Curated institutional history. | `READ_ONLY_PROOF` | `READ_ONLY_PROOF` | canon | `chronicle` (from `activity-chronicle`) | "Chronicle" curatorial, not public-raw. |
| `TRANSPARENCY_ECONOMY_ROUTING` | 70/20/10 routing + economy totals. | `READ_ONLY_PROOF` | `READ_ONLY_PROOF` | economy-snapshot | `routing-economy`, `TransparencyAdapter` | no profit/yield framing. |
| `PROOF_OF_FIRE_BURN_EVENTS` | SYN burns; Proof-of-Fire numbering. | `VERIFIED_SOURCE_PENDING_ADAPTER` | `READ_ONLY_PROOF` | chain-event | `proof-of-fire`, `BurnProofAdapter`, `BurnScanCompleteness` | **adopt** not-scanned/complete/partial/anomaly completeness. |
| `DASHBOARD_SYSTEM_HEALTH` | System/operational health. | `NOT_WIRED` | `READ_ONLY_PROOF` / `ADMIN_ONLY` | health-status | partial `chain`/snapshot | — |
| `ADMIN_OPERATOR_AUDIT_EVENTS` | Operator audit trail. | `ADMIN_ONLY` | `ADMIN_ONLY` | admin-audit | (none — new) | never public. |
| `FUTURE_MARKETPLACE_PAYMENT_EVENTS` | Future marketplace/payments. | `FUTURE` | TBD | (future) | old "ProductSaleRouter"/commerce layer | gated, not now. |
| `FUTURE_SWAP_EXCHANGE_UTILITY` | Future swap/exchange utility. | `FUTURE` | TBD | (future) | old "SwapRail / Bridge / Trade" module | no investment framing. |
| `FUTURE_GOVERNANCE_DAO` | Future governance. | `FUTURE` | TBD | (future) | glossary "Council reserved for governance" | rank confers no governance today. |

---

## 9. Final Recommended Adapter Kinds for 2.19E

Encode the manifest's 9 kinds (type-only now). Old seams map cleanly; the two **concrete**
old live adapters are deferred (their existence proves feasibility, not readiness to ship).

| Canonical literal | Purpose | Allowed inputs | Forbidden inputs | Output posture | Old aliases | Type-only now / deferred |
|---|---|---|---|---|---|---|
| `CANON_ADAPTER` | Read server-side canon (ABIs, registries, provenance). | pinned canon | live chain creds | `READ_ONLY_PROOF` | `ContractRegistryAdapter` (canon part) | type-only now |
| `CHAIN_EVENT_ADAPTER` | Read-only chain events (burns, purchases). | RPC reads (server) | writes/signing | `VERIFIED_SOURCE_PENDING_ADAPTER`→`READ_ONLY_PROOF` | `BurnProofAdapter`, concrete `burn-proof-adapter.ts` | type-only now; **defer concrete impl** |
| `RECEIPT_READ_MODEL_ADAPTER` | Membership/seat receipts read model. | sale events | raw PII to public | `VERIFIED_SOURCE_PENDING_ADAPTER` | `MembershipSaleAdapter` + `MemberIndexAdapter` | type-only now |
| `ACTIVITY_INDEX_ADAPTER` | Activity heartbeat index. | event logs | personal framing on public | `READ_ONLY_PROOF` (anonymized) | `ActivityAdapter` | type-only now |
| `ECONOMY_SNAPSHOT_ADAPTER` | Economy/routing snapshot. | totals | invented values | `READ_ONLY_PROOF` | `TransparencyAdapter`, `protocol-snapshot-adapter.ts` | type-only now; **defer client RPC** |
| `ARCHIVE_MEMORY_ADAPTER` | Archive1155 memory reads. | 1155 reads | mint/write | `READ_ONLY_PROOF` | `ArchiveAdapter` | type-only now |
| `SOURCE_ATTRIBUTION_ADAPTER` | Verified-introduction attribution. | source records | reward/payout logic | `VERIFIED_SOURCE_PENDING_ADAPTER` | `SourcePolicyAdapter`, `ZERO_SOURCE_ID` | type-only now |
| `HEALTH_STATUS_ADAPTER` | System health. | health probes | secrets | `NOT_WIRED`→`READ_ONLY_PROOF` | partial snapshot | type-only now |
| `ADMIN_AUDIT_ADAPTER` | Operator audit events. | audit log | public exposure | `ADMIN_ONLY` | (none — new) | type-only now; deferred behaviour |

> Old `WalletAdapter` / `wallet-adapter.ts` does **not** map to a chain adapter kind — wallet
> connect/identity belongs to the **auth/identity** layer, deferred until auth design.

---

## 10. Member/Admin Backend Direction

The founder's concern, in architecture terms:

- **The Syndicate OS must not remain a marketing-only frontend.** The prior art already proves
  the intended shape: a public proof surface, a member-personal surface, and a founder/operator
  surface. In the old repo those member/operator surfaces were **simulated**; the new OS must
  realize them as **authenticated, privacy-gated** surfaces.
- It is **not WordPress**, but it needs operational completeness: role-gated admin, safe
  content/config governance, verified receipts/activity/member state, and private operator
  controls — all behind auth, privacy, and founder approval.
- **No admin/member capability may be public or shipped without auth/privacy/approval.**
- **Existing verified package sales / users / receipts**, if any, must be classified properly
  (`VERIFIED_SOURCE_PENDING_ADAPTER` or `AUTH_REQUIRED`) and **never ignored, invented, or
  publicly exposed**.

Distinguish (per spec):

| Stage | What |
|---|---|
| **Can be typed now (2.19E)** | Posture lifecycle, surface literals, proof-domain literals, adapter-kind literals, and the `Record<TruthStatus, Posture>` reconciliation map. Pure type-only; no bodies. |
| **Can be stubbed later** | Adapter interface signatures, read-model payload shapes (no implementations). |
| **Requires auth design** | `AUTHENTICATED_MEMBER`, `WALLET_MEMBER_IDENTITY`, member view of `MEMBERSHIP_SEAT_RECEIPT`, `SOURCE_VERIFIED_INTRODUCTION`, all `ADMIN_ONLY`. |
| **Requires a verified data source** | Any advance toward `READ_ONLY_PROOF`/`LIVE_ACTION` for burns, receipts, activity, economy, source attribution. |
| **Unsafe to expose** | Member PII, wallet values, addresses/hashes, capital-footprint/contribution ranking, operator controls, audit events, source-attribution graph. |

---

## 11. Rejected / Blocked Prior-Art

Must **not** enter 2.19E:

- **Simulated/fake postures** — `SIMULATED`, `PROTOTYPE PLACEHOLDER`, `DEMO PREVIEW`,
  `SIMULATED PROTOTYPE`, `studio-prototype`, `simulated` (confidence). No fake-live anything.
- **Fake dashboards / fake-live claims** — the old member/founder surfaces ran on simulated
  data; do not port their "live" framing.
- **Simulated protocol values** — no invented numbers anywhere (matches new doctrine).
- **Client-side live reads** — concrete `burn-proof-adapter.ts` (`eth_getLogs`),
  `wallet-adapter.ts` (balance reads), `protocol-snapshot-adapter.ts` (RPC). Defer to a
  server-side read-model; do not ship client RPC now.
- **Public exposure of server-side canon values** — addresses/values in old client
  `PRODUCTION_PROOF` / source-of-truth table must stay server-side and unprinted.
- **Client-side key generation / wallet writes** — none to port; remains forbidden.
- **Unauthenticated member/admin data** — member/operator surfaces only behind real auth.
- **Wealth/ranking exposure** — `capitalFootprintUsdc` / `contributionDepth` leaderboard
  framing; old canon itself bans "wealth leaderboard / top buyers / whales".
- **Yield/APY/passive-income/speculation & unsafe referral-reward framing** — banned by both
  repos' glossaries; "referral" is attribution, never reward/earn/payout.
- **External-explorer coupling as a truth source** (`snowtrace` deep-links) — exposes
  tx/address identifiers; keep proof self-contained and server-mediated.
- **Over-complex/stale module language** — `V1 CANDIDATE` / `IN REVIEW` as type-level postures;
  keep them as workflow metadata, not encoded posture literals.

---

## 12. Exact 2.19E Type Contract Recommendation

> Preparation only — **do not write the types in this slice.**

- **File location (new private repo).** Two viable homes, recommended in order:
  1. A new **shared lib** `lib/os-contracts` (composite TS lib: `composite`,
     `declarationMap`, `emitDeclarationOnly`; add to root `tsconfig.json` `references`) so both
     `artifacts/studio` and `artifacts/api-server` can import the vocabulary. **Preferred** —
     the manifest spans web + API + canon.
  2. If a lib is deemed premature, a single type-only module
     `artifacts/studio/src/config/osVocabulary.ts` co-located with `truthStatus.ts`.
- **Files to create/edit.**
  - Create the chosen module (lib `index.ts` or `osVocabulary.ts`) — type-only.
  - Edit `artifacts/studio/src/config/truthStatus.ts` **only** to add the
    `Record<TruthStatus, Posture>` mapping import (no behaviour change), if the lib route is taken.
  - No other files.
- **Type names to add.** `Posture`, `OsSurface`, `ProofDomain`, `AdapterKind`, and a
  `postureForTruthStatus: Record<TruthStatus, Posture>` map; optional `TruthSourceAxis` /
  `TruthConfidenceAxis` as separate (non-posture) metadata unions.
- **Union literals to encode.** Posture (7, §6), OsSurface (6, §7), ProofDomain (14, §8),
  AdapterKind (9, §9).
- **Alias/mapping approach.** Old terms are documentation aliases only (kept in this report);
  do **not** export old literals as public API. Provide the `TruthStatus`→`Posture` map and a
  domain→default-posture map.
- **Export strategy.** Type-only exports (`export type …`) plus `as const` literal arrays for
  iteration; no runtime side effects, no implementations, no adapter bodies.
- **Verification commands.** `pnpm install --frozen-lockfile`, `pnpm run typecheck`
  (+ `pnpm run typecheck:libs` first if the lib route is taken),
  `pnpm --filter @workspace/api-server run build`,
  `pnpm --filter @workspace/api-server run verify:canon`.
- **No-touch boundaries (2.19E).** No runtime behaviour, no UI, no API, no routes, no canon
  values, no live data/adapters/indexers/auth, no package/lockfile changes beyond the new lib's
  own `package.json` if the lib route is taken, no deploy, no repo-visibility change.

---

## 13. Final Readiness Verdict

- **Are we ready for 2.19E TypeScript type contracts?** **Yes.** Vocabulary is reconciled; the
  manifest stands as primary canon with two adopted old concepts and a defined reason-code map.
- **Highest-risk vocabulary mismatch.** Old `LIVE` / `LIVE_READ` (a read-only verifiable value)
  vs. new `LIVE_ACTION` (an executed write). Encoding old "LIVE" as `LIVE_ACTION` would grant
  phantom write capability. Old "LIVE" reads map to `READ_ONLY_PROOF`.
- **Highest-value old prior-art to preserve.** The **Proof-of-Fire reconciliation/completeness
  model** (`not-scanned` / `complete` / `partial` / `anomaly`, proven by sum-of-events vs. live
  sink balance) together with the **public-surface anonymization rules** — both are honest,
  battle-tested boundary logic that the new doctrine should inherit.
- **What must be avoided.** Any `SIMULATED`/`PROTOTYPE` posture, client-side live reads,
  exposure of addresses/values/PII, wealth-ranking, and reward/yield framing.
- **One-sentence instruction for the 2.19E implementer.** Encode the manifest's posture (7),
  surface (6), proof-domain (14), and adapter-kind (9) unions as a type-only module, add a
  `Record<TruthStatus, Posture>` map, keep source/confidence as separate optional axes, and
  never collapse a read posture into `LIVE_ACTION` or a referral into a reward.

---

*Prior art read from `duniterum/TheSyndicate` (public) for continuity only; it is not authority.
The Source Boundary Manifest remains the authority of `duniterum/syndicate-os`. No old files were
copied into this repo; no sensitive values are reproduced here.*
