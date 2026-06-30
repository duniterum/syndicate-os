# Source Boundary Manifest

> Spec / contract only. This document defines source-boundary rules for **future** implementation. It is **not** live-data integration, and adding it wires nothing.

## 1. Purpose

- This manifest defines source-boundary rules that must hold **before** any implementation begins.
- It exists to **prevent fake-live protocol claims**: nothing may be presented as `LIVE_ACTION` (or any live/authenticated state) unless it is truly available and verified.
- It separates **canon**, **read models**, **APIs**, **public UI**, **authenticated member surfaces**, and **private admin/operator** surfaces so each has explicit allowed and forbidden material.
- **Posture is defined per domain, not globally.** `READ_ONLY_PROOF` is **not** a permanent product limitation. The Syndicate OS is not a static, read-only museum: each domain may graduate to authenticated or live states through the upgrade gate (Section 13) once a verified source, the required adapter, authentication/privacy controls where relevant, tests, rollback/fail-closed behavior, and founder approval are all in place.
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

## 3. Posture Lifecycle

Posture is assigned **per domain**, and a domain advances through these states as real sources, adapters, auth, and approvals arrive. Posture is not a global ceiling.

- **`NOT_WIRED`** — concept exists, but no verified adapter/source is connected.
- **`READ_ONLY_PROOF`** — a verified source can be displayed but not mutated.
- **`VERIFIED_SOURCE_PENDING_ADAPTER`** — a real source/data exists, but the adapter / API / UI contract is not implemented yet.
- **`AUTH_REQUIRED`** — member/account data exists or may exist, but requires authenticated access and privacy controls.
- **`ADMIN_ONLY`** — operator/admin data or controls; never public.
- **`LIVE_ACTION`** — a user or admin can execute a real action/write, **only after** source, auth (where relevant), tests, rollback/fail-closed behavior, and founder approval.
- **`FUTURE`** — concept planned, but not part of current product operation.

Typical progression (per domain, gated at each step): `NOT_WIRED` → `VERIFIED_SOURCE_PENDING_ADAPTER` → `READ_ONLY_PROOF` → `AUTH_REQUIRED` → `LIVE_ACTION`. `ADMIN_ONLY` is a parallel classification for operator-only material; `FUTURE` is for concepts not yet in operation.

## 4. Surface Model

The OS is built from distinct surfaces, each with its own allowed material:

- **Public site / visitor surface** — anonymous, public-safe. Truth-labeled summaries only; no member data, no raw identifiers, no admin controls.
- **Authenticated member dashboard** — per-member data behind authentication and privacy controls; only verified member state; never exposed publicly.
- **Private operator / admin console** — founder/operator-only controls and intelligence; `ADMIN_ONLY`; never public, never in public docs.
- **API / read-model layer** — derives public-safe and (later) auth-scoped payloads from verified sources; must include posture/status; must fail closed.
- **Server-side canon** — curated reference data + `PROVENANCE.md`; private-repo-approved identifiers live here and are never exposed raw in public output.
- **Future automation / indexer layer** — verified event/read-model production; not implemented; `NOT_WIRED` until built and approved.

## 5. Data / Proof Domains

Postures below use the Posture Lifecycle (Section 3). "Current posture" reflects what is verified **in this repo today**; "Target posture" is the honest next state once the required adapter (and, where relevant, auth/privacy) is built and approved (Sections 12–13).

| Domain | Examples | Current source | Required adapter | Current posture | Target posture | Surface | Public-safe output | Private / server-only | Upgrade gate |
|---|---|---|---|---|---|---|---|---|---|
| Membership seat / receipt | seat claim, mint receipt | none verified yet (sale not live) | ReceiptReadModelAdapter | `NOT_WIRED` | `AUTH_REQUIRED` / `LIVE_ACTION` | member + public summary | labeled count/status | raw receipts, buyer identity | verified sale/receipt source + adapter + auth + privacy |
| Wallet / member identity | member handle to wallet | none verified yet | identity resolver | `NOT_WIRED` | `AUTH_REQUIRED` | member | none until privacy decision | any wallet-to-person linkage, PII | verified linkage + auth + privacy/consent |
| Activity heartbeat | "system active" signal | none verified yet | ActivityIndexAdapter | `NOT_WIRED` | `READ_ONLY_PROOF` | public + admin | labeled status only | raw activity streams | verified activity source + fail-closed |
| Contract registry / status | contract list and status | server-side canon | CanonAdapter / ChainEventAdapter | `READ_ONLY_PROOF` | `VERIFIED_SOURCE_PENDING_ADAPTER` (live status) | public | name/status, no raw identifiers | private-repo-approved chain identifiers | verified on-chain status read |
| Source / verified introduction | who introduced whom | none verified yet | SourceAttributionAdapter | `NOT_WIRED` | `AUTH_REQUIRED` | member + admin | labeled "awaiting source" | attribution graph, PII | verified attribution source + auth + privacy |
| Archive / NFT memory | archived memory items | server-side canon | ArchiveMemoryAdapter | `READ_ONLY_PROOF` | `VERIFIED_SOURCE_PENDING_ADAPTER` (live metadata) | public | curated names/labels | private-repo-approved identifiers | verified token/metadata read |
| Chronicle / institutional memory | long-form record | concept only | ArchiveMemoryAdapter (extended) | `FUTURE` | `READ_ONLY_PROOF` | public + member | labeled FUTURE | drafts, private notes | defined source + read-model + review |
| Transparency / economy routing | treasury/routing view | none verified yet | EconomySnapshotAdapter | `NOT_WIRED` | `VERIFIED_SOURCE_PENDING_ADAPTER` | public + admin | labeled "awaiting source" | balances, routing internals | verified snapshot + no-speculation copy review |
| Proof of Fire / burn events | burn proof feed | one canon-recorded identifier (server-side) | ChainEventAdapter | `VERIFIED_SOURCE_PENDING_ADAPTER` | `READ_ONLY_PROOF` | public | labeled summary, no values | private-repo-approved burn identifier | verified burn events + event read-model |
| Dashboard / system health | server liveness, status | API health endpoint (real) | HealthStatusAdapter | `READ_ONLY_PROOF` (server health) | `VERIFIED_SOURCE_PENDING_ADAPTER` (protocol metrics) | public + admin | up/down + labeled status | internal metrics, intelligence | protocol metrics require verified sources |
| Admin / operator audit events | operator action log | none wired | AdminAuditAdapter | `ADMIN_ONLY` | `ADMIN_ONLY` / `LIVE_ACTION` (operator) | admin only | none | all audit material | private by design + auth + founder approval |
| Future marketplace / payment events | listing, settlement | concept only | payment adapter | `FUTURE` | `LIVE_ACTION` | public + member | labeled FUTURE | order/payment internals | full payment design + compliance + auth |
| Future swap / exchange-like utility | utility transfer | concept only | exchange adapter | `FUTURE` | `LIVE_ACTION` | member | labeled FUTURE | quoting internals | design + review; no speculation framing |
| Future governance / DAO | proposals, votes | concept only | governance adapter | `FUTURE` | `LIVE_ACTION` | member + admin | labeled FUTURE | voting internals | verified governance source + auth + read-model |

> Where a domain depends on server-side canon containing chain identifiers, the public surface refers only to "server-side canon" and "private-repo-approved chain identifiers" — never raw values.

## 6. Adapter Types

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
- **Posture before implementation:** `NOT_WIRED` / `VERIFIED_SOURCE_PENDING_ADAPTER` (where a real source is known).
- **Verification gate:** source verified + read-only confirmed + fail-closed tested.

### ReceiptReadModelAdapter
- **Purpose:** derive seat/receipt read-models from verified mint/sale events.
- **Allowed inputs:** `ChainEventAdapter` outputs, canon.
- **Forbidden inputs:** fabricated receipts, buyer PII in public payloads.
- **Output contract:** counts/status, privacy-safe; no raw buyer identity.
- **Posture before implementation:** `NOT_WIRED` (public) / `AUTH_REQUIRED` (per-member).
- **Verification gate:** verified events + auth + privacy review.

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
- **Posture before implementation:** `NOT_WIRED` / `AUTH_REQUIRED` (member-scoped).
- **Verification gate:** verified source + auth + privacy review + no referral-payment framing.

### HealthStatusAdapter
- **Purpose:** expose server/system health and labeled protocol status.
- **Allowed inputs:** the real health endpoint, verified status.
- **Forbidden inputs:** fabricated protocol metrics.
- **Output contract:** up/down + labeled posture.
- **Posture before implementation:** `READ_ONLY_PROOF` (server health) / `NOT_WIRED` (protocol metrics).
- **Verification gate:** protocol metrics require verified sources.

### AdminAuditAdapter
- **Purpose:** record operator/admin audit events for private surfaces only.
- **Allowed inputs:** internal operator actions.
- **Forbidden inputs:** any public exposure, PII leakage.
- **Output contract:** private-only audit records; never public.
- **Posture before implementation:** `ADMIN_ONLY`.
- **Verification gate:** stays private; explicit founder approval + auth required for any action (default: never public).

## 7. API Boundary Rules

- API may expose **only public-safe derived payloads** computed from verified sources/canon; auth-scoped payloads require authentication.
- API **must not** expose private canon raw values (identifiers) unless explicitly founder-approved.
- API payloads **must include truth posture/status** where relevant.
- API **must fail closed** when a source is unavailable — respond with a labeled unavailable / `NOT_WIRED` state, never a fabricated value.
- API **must not synthesize** fake money, activity, contracts, or receipts.

## 8. Studio / UI Boundary Rules

- Studio may render ambition **only** as labeled `FUTURE` / `NOT_WIRED`.
- The public homepage stays simple and **does not dump every module** (Homepage Governance applies).
- All user-facing surfaces **show truth labels**.
- Member/user-specific data **requires a verified source, authentication, and an explicit privacy decision** before display.
- **No fake dashboards** — no invented numbers, charts, or activity.

## 9. Private / Admin Boundary Rules

- Founder/admin/operator surfaces are **private** (`ADMIN_ONLY`).
- Admin health/intelligence may use richer data but **must not leak** into public UI.
- Private operator intelligence is **not** public product copy.
- Audit logs and internal reports are **not** public docs by default.

## 10. Member / Admin System Direction

- The Syndicate OS **must not remain only a marketing frontend.**
- It should evolve into a **protocol operating system** with three layers: a public visitor surface, an authenticated member surface, and a private operator/admin console.
- It is **not WordPress**, but it needs equivalent **operational completeness**: role-gated administration, source-boundary-safe content/config governance, verified receipts/activity/member state, and private operator controls.
- **No admin/backend capability may be exposed publicly or implemented without authentication, privacy controls, and founder approval.**
- Member and admin surfaces are additive graduations of the same source-boundary discipline — they never bypass the posture lifecycle, the upgrade gate, or the forbidden-patterns list.

## 11. Verified Existing Data

- If verified **package sales, purchase receipts, member/account records, source/attribution records, activity events, or other real operational data** already exist (or later become available), the manifest classifies them as **`VERIFIED_SOURCE_PENDING_ADAPTER`** (real data exists, adapter/API/UI not built) or **`AUTH_REQUIRED`** (member/account/private data) — **not** as permanently `NOT_WIRED` or `READ_ONLY_PROOF`. The architecture must allow these domains to graduate.
- This manifest **does not assert** that any such data exists today; it defines how to classify it **if/when** verified. Today, only server-side canon (contract registry, archive, one recorded burn identifier) and the real server-health endpoint are verified in-repo.
- **Report categories and required adapters only.** Never print or expose any user/member data, wallet values, addresses, emails, phone numbers, transaction hashes, or PII.

| Real-data category (if it exists) | Classify as | Required adapter | Primary surface |
|---|---|---|---|
| Package sales / purchase receipts | `VERIFIED_SOURCE_PENDING_ADAPTER` → `AUTH_REQUIRED` | ReceiptReadModelAdapter | member + public summary |
| Member / account records | `AUTH_REQUIRED` | identity resolver | member |
| Source / attribution records | `AUTH_REQUIRED` | SourceAttributionAdapter | member + admin |
| Activity events | `VERIFIED_SOURCE_PENDING_ADAPTER` | ActivityIndexAdapter | public + admin |
| On-chain contract / burn / archive data | `VERIFIED_SOURCE_PENDING_ADAPTER` | ChainEventAdapter / ArchiveMemoryAdapter | public |
| Operator / admin actions | `ADMIN_ONLY` | AdminAuditAdapter | admin only |

## 12. Posture / Action Upgrade Gate

Before any domain moves from `NOT_WIRED` / `READ_ONLY_PROOF` / `VERIFIED_SOURCE_PENDING_ADAPTER` / `FUTURE` to `AUTH_REQUIRED` or `LIVE_ACTION`, **all** of the following must hold:

- [ ] Source identified and verified
- [ ] Adapter implemented
- [ ] Tests / typecheck pass
- [ ] API payload reviewed
- [ ] Public/private boundary reviewed
- [ ] Authentication in place (for member/account data)
- [ ] Privacy/consent controls in place (for member/account/PII data)
- [ ] No secrets / PII / identifier exposure
- [ ] Founder approval
- [ ] Rollback / fail-closed behavior in place
- [ ] Public copy reviewed for no yield / speculation / fake-live claims

## 13. Forbidden Patterns

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
- Any admin/member capability exposed publicly or without authentication, privacy controls, and founder approval

## 14. Next Implementation Candidates

| Candidate | Safe now? | Why / why not | Recommended order |
|---|---|---|---|
| README precision wording patch | Yes | docs-only; no source/behavior change | 1 |
| API/studio manifest **types** (posture lifecycle + payload shapes) | Yes (types only) | type-level contracts, no runtime/data wiring; typecheck-gated | 2 |
| Adapter **interface stubs** (signatures, no bodies) | Conditional | safe only as non-wired interfaces declaring `NOT_WIRED`; must not fetch or compute | 3 |
| Route **label binding** (bind existing surfaces to `truthStatus`) | Conditional | safe only if it binds existing labels to config and changes no data; founder + Homepage Governance review | 4 |
| Auth scaffolding for the member surface | Conditional | foundational for `AUTH_REQUIRED` domains, but only as a gated, source-boundary-safe slice with privacy review; no member data wired | 5 |
| Admin/operator console shell (no live controls) | Conditional | `ADMIN_ONLY` shell behind auth; no real actions until the upgrade gate passes | 6 |
| Live read model / indexer | No | requires a verified source + `ChainEventAdapter`; live wiring is explicitly deferred | later |
| Homepage copy changes | Not by default | governed by Homepage Governance; only via an approved, labeled, source-bound change | later |

Recommended order: **1 → 2 → 3 → 4 → 5 → 6**, with live wiring (indexer / read-model) and any `LIVE_ACTION` deferred until a verified source, authentication/privacy (where relevant), and founder approval are all in place.
