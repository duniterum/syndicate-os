# Source Boundary Manifest

> Spec / contract only. This document defines source-boundary rules for **future** implementation. It is **not** live-data integration, and adding it wires nothing.

## 1. Purpose

- This manifest defines source-boundary rules that must hold **before** any implementation begins.
- It exists to **prevent fake-live protocol claims**: nothing may be presented as `LIVE` unless it is truly live and verified.
- It separates **canon**, **read models**, **APIs**, **public UI**, and **private admin/operator** surfaces so each has explicit allowed and forbidden material.
- It is **not** a live-data integration, an indexer, a chain read, or a transaction. No adapter described here is implemented yet.

## 2. Source Hierarchy

Source-of-truth priority (highest authority first):

1. **Verified live on-chain events / receipts** — the strongest proof, valid only when actually verified against the target chain.
2. **Server-side canon + `PROVENANCE.md`** — the curated, private-repo reference data with recorded provenance.
3. **API read models derived from verified sources** — derived payloads computed only from (1) and (2).
4. **Truth / status config** — the posture vocabulary (`truthStatus` / `surfaceStatus`) that labels each surface.
5. **Public UI labels** — what the studio renders, always carrying a truth label.
6. **Reference repositories** — pattern sources only; **never** live Syndicate truth.

Also:

- Docs and marketing copy **derive from** verified code/canon; they never lead it.
- **No public claim may outrank code, canon, or live proof.** If copy and source disagree, source wins and the copy is corrected.

## 3. Data / Proof Domains

Postures used: `LIVE` (truly live and verified in the current target), `READ_ONLY_PROOF` (verified canon present, read-only), `READ_ONLY` (real but non-proof, e.g. server liveness), `NOT_WIRED` (no adapter/read-model exists), `FUTURE` (concept only), `PRIVATE` (founder/admin-only).

| Domain | Examples | Current source | Future adapter / read-model | Current posture | Allowed public surfaces | Private / server-only | LIVE upgrade gate |
|---|---|---|---|---|---|---|---|
| Membership seat / receipt | seat claim, mint receipt | none wired (sale not live) | ReceiptReadModelAdapter | `NOT_WIRED` | labeled "awaiting source" summary | raw receipts, buyer identity | verified mint/receipt events + receipt read-model |
| Wallet / member identity | member handle to wallet | none wired | identity resolver (future) | `NOT_WIRED` / `PRIVATE` | none until privacy decision | any wallet-to-person linkage, PII | verified linkage + privacy/consent decision |
| Activity heartbeat | "system active" signal | none wired | ActivityIndexAdapter | `NOT_WIRED` | labeled status only | raw activity streams | verified activity index + fail-closed |
| Contract registry / status | contract list and status | server-side canon | CanonAdapter | `READ_ONLY_PROOF` | name/status, no raw identifiers | private-repo-approved chain identifiers | verified on-chain status read |
| Source / verified introduction | who introduced whom | none wired | SourceAttributionAdapter | `NOT_WIRED` | labeled "awaiting source" | attribution graph, PII | verified attribution source + privacy review |
| Archive / NFT memory | archived memory items | server-side canon | ArchiveMemoryAdapter | `READ_ONLY_PROOF` | curated names/labels | private-repo-approved identifiers | verified token/metadata read |
| Chronicle / institutional memory | long-form record | concept only | ArchiveMemoryAdapter (extended) | `FUTURE` | labeled FUTURE | drafts, private notes | defined source + read-model + review |
| Transparency / economy routing | treasury/routing view | none wired | EconomySnapshotAdapter | `NOT_WIRED` | labeled "awaiting source" | balances, routing internals | verified snapshot + no-speculation copy review |
| Proof of Fire / burn events | burn proof feed | one canon-recorded identifier (server-side) | ChainEventAdapter | `NOT_WIRED` | labeled summary, no values | private-repo-approved burn identifier | verified burn events + event read-model |
| Dashboard / system health | server liveness, status | API health endpoint (real) | HealthStatusAdapter | `READ_ONLY` (server health) | up/down + labeled status | internal metrics, intelligence | protocol metrics need verified sources |
| Admin / operator audit events | operator action log | none wired | AdminAuditAdapter | `PRIVATE` / `NOT_WIRED` | none | all audit material | private by design; never public |
| Future marketplace / payment events | listing, settlement | concept only | payment adapter (future) | `FUTURE` | labeled FUTURE | order/payment internals | full payment design + compliance review |
| Future swap / exchange-like utility | utility transfer | concept only | exchange adapter (future) | `FUTURE` | labeled FUTURE | quoting internals | design + review; no speculation framing |
| Future governance / DAO | proposals, votes | concept only | governance adapter (future) | `FUTURE` | labeled FUTURE | voting internals | verified governance source + read-model |

> Where a domain depends on server-side canon containing chain identifiers, the public surface refers only to "server-side canon" and "private-repo-approved chain identifiers" — never raw values.

## 4. Adapter Types

All adapters below are **future categories** — none implemented. Spec only.

### CanonAdapter
- **Purpose:** expose curated server-side canon as read-only, public-safe payloads.
- **Allowed inputs:** server-side canon files + `PROVENANCE.md`.
- **Forbidden inputs:** raw secrets, raw chain identifiers in public output, PII.
- **Output contract:** name/status/posture fields only; no raw identifiers.
- **Posture before implementation:** `READ_ONLY_PROOF` (canon present) / `NOT_WIRED` (where canon absent).
- **Verification gate:** `verify:canon` passes; payload reviewed for no raw identifiers.

### ChainEventAdapter
- **Purpose:** read and verify on-chain events/receipts from the target chain.
- **Allowed inputs:** verified read sources for approved contracts.
- **Forbidden inputs:** unverified/synthetic events, fabricated receipts, any write/transaction call.
- **Output contract:** verified event read-models with posture; fail-closed when unavailable.
- **Posture before implementation:** `NOT_WIRED`.
- **Verification gate:** source verified + read-only confirmed + fail-closed tested.

### ReceiptReadModelAdapter
- **Purpose:** derive seat/receipt read-models from verified mint/sale events.
- **Allowed inputs:** `ChainEventAdapter` outputs, canon.
- **Forbidden inputs:** fabricated receipts, buyer PII in public payloads.
- **Output contract:** counts/status, privacy-safe; no raw buyer identity.
- **Posture before implementation:** `NOT_WIRED`.
- **Verification gate:** verified events + privacy review.

### ActivityIndexAdapter
- **Purpose:** produce honest activity/heartbeat signals from verified sources.
- **Allowed inputs:** verified events/health.
- **Forbidden inputs:** synthetic activity numbers.
- **Output contract:** labeled status; fail-closed when unavailable.
- **Posture before implementation:** `NOT_WIRED`.
- **Verification gate:** verified source + no fabrication.

### EconomySnapshotAdapter
- **Purpose:** produce transparency / economy-routing snapshots from verified sources.
- **Allowed inputs:** verified balance/routing reads.
- **Forbidden inputs:** speculative projections, yield-style framing.
- **Output contract:** factual snapshot with posture; no speculation.
- **Posture before implementation:** `NOT_WIRED`.
- **Verification gate:** verified source + no-speculation copy review.

### ArchiveMemoryAdapter
- **Purpose:** expose archive/NFT/chronicle memory as curated, read-only items.
- **Allowed inputs:** canon, verified token metadata.
- **Forbidden inputs:** raw identifiers in public output, PII.
- **Output contract:** curated names/labels + posture.
- **Posture before implementation:** `READ_ONLY_PROOF` (canon) / `FUTURE` (chronicle).
- **Verification gate:** verified metadata read + review.

### SourceAttributionAdapter
- **Purpose:** model verified introduction/attribution without exposing PII.
- **Allowed inputs:** verified attribution source.
- **Forbidden inputs:** PII, unverified referral-payment claims.
- **Output contract:** privacy-safe attribution status; no payment promises.
- **Posture before implementation:** `NOT_WIRED`.
- **Verification gate:** verified source + privacy review + no referral-payment framing.

### HealthStatusAdapter
- **Purpose:** expose server/system health and labeled protocol status.
- **Allowed inputs:** the real health endpoint, verified status.
- **Forbidden inputs:** fabricated protocol metrics.
- **Output contract:** up/down + labeled posture.
- **Posture before implementation:** `READ_ONLY` (server health) / `NOT_WIRED` (protocol metrics).
- **Verification gate:** protocol metrics require verified sources.

### AdminAuditAdapter
- **Purpose:** record operator/admin audit events for private surfaces only.
- **Allowed inputs:** internal operator actions.
- **Forbidden inputs:** any public exposure, PII leakage.
- **Output contract:** private-only audit records; never public.
- **Posture before implementation:** `PRIVATE`.
- **Verification gate:** stays private; explicit founder approval required for any surfacing (default: never).

## 5. API Boundary Rules

- API may expose **only public-safe derived payloads** computed from verified sources/canon.
- API **must not** expose private canon raw values (identifiers) unless explicitly founder-approved.
- API payloads **must include truth posture/status** where relevant.
- API **must fail closed** when a source is unavailable — respond with a labeled unavailable / `NOT_WIRED` state, never a fabricated value.
- API **must not synthesize** fake money, activity, contracts, or receipts.

## 6. Studio / UI Boundary Rules

- Studio may render ambition **only** as labeled `FUTURE` / `NOT_WIRED`.
- The public homepage stays simple and **does not dump every module** (Homepage Governance applies).
- All user-facing surfaces **show truth labels**.
- Member/user-specific data **requires a verified source and an explicit privacy decision** before display.
- **No fake dashboards** — no invented numbers, charts, or activity.

## 7. Private / Admin Boundary Rules

- Founder/admin/operator surfaces are **private**.
- Admin health/intelligence may use richer data but **must not leak** into public UI.
- Private operator intelligence is **not** public product copy.
- Audit logs and internal reports are **not** public docs by default.

## 8. Posture Upgrade Gate

Before any domain moves from `NOT_WIRED` / `READ_ONLY` / `FUTURE` to `LIVE`, **all** of the following must hold:

- [ ] Source identified and verified
- [ ] Adapter implemented
- [ ] Tests / typecheck pass
- [ ] API payload reviewed
- [ ] Public/private boundary reviewed
- [ ] No secrets / PII / identifier exposure
- [ ] Founder approval
- [ ] Rollback / fail-closed behavior in place
- [ ] Public copy reviewed for no yield / speculation / fake-live claims

## 9. Forbidden Patterns

Hard blocks (never allowed):

- Fake money
- Fake contracts
- Fake source / referral payments
- Fake live activation
- Fake dashboard numbers
- Unauthorized transactions
- PII exposure
- Client-side private-key generation
- Yield / APY / passive-income / reward-speculation framing
- Importing reference-repo product promises
- Presenting reference-repo data as Syndicate truth

## 10. Next Implementation Candidates

| Candidate | Safe now? | Why / why not | Recommended order |
|---|---|---|---|
| README precision wording patch | Yes | docs-only; no source/behavior change | 1 |
| API/studio manifest **types** (TS types for posture/payload shapes) | Yes (types only) | type-level contracts, no runtime/data wiring; typecheck-gated | 2 |
| Adapter **interface stubs** (signatures, no bodies) | Conditional | safe only as non-wired interfaces declaring `NOT_WIRED`; must not fetch or compute | 3 |
| Route **label binding** (bind existing surfaces to `truthStatus`) | Conditional | safe only if it binds existing labels to config and changes no data; founder + Homepage Governance review | 4 |
| Live read model / indexer | No | requires a verified source + `ChainEventAdapter`; live wiring is explicitly deferred | later |
| Homepage copy changes | Not by default | governed by Homepage Governance; only via an approved, labeled, source-bound change | later |

Recommended order: **1 → 2 → 3 → 4**, with live wiring (indexer / read-model) deferred until a verified source exists and is founder-approved.
