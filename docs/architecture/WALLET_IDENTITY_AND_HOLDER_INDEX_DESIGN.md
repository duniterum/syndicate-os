# Wallet Identity + Holder Index Read-Model Design

- **Status:** CANONICAL (internal architecture doctrine) — founder-approved Slice A, 2026-07-02
- **Source:** Wallet Identity + Holder Index Read-Model Design Audit (accepted by founder, 2026-07-02; architect-reviewed twice, PASS)
- **Scope:** design doctrine only. Nothing in this document authorizes a table, projection, endpoint, route, UI, publish, or deploy. Every implementation step below remains behind its own founder gate.
- **Vocabulary rule:** this document introduces **no new taxonomy**. All domain/posture/visibility terms are the existing `lib/os-contracts` vocabulary (`WALLET_MEMBER_IDENTITY`, `MEMBERSHIP_SEAT_RECEIPT`, `RECEIPT_READ_MODEL_ADAPTER`, `MemberDataVisibility`, `SourcePosture`, etc.).

---

## 1. Executive position

Recovery mode is complete; identity/OS mode begins. Part A (raw sale-event index) and Part B (historical member freeze/root import) are verified, guard-locked foundations — they are now **authority**, not recovery targets. The governing question inverted from "how do we rebuild what existed?" to:

> **"What is the wallet/member identity truth model of the Syndicate OS, and how does Holder Index become its first read-model?"**

Design flows from identity truth forward, never from UI backward.

**Layer order (canonical):**
0. Canon / authority → 1. Wallet identity boundary → 2. Seat / membership receipt truth → 3. Historical identity continuity → 4. Holder Index / member intelligence read-model → 5. My Syndicate private cockpit → 6. Activity heartbeat → 7. Chronicle / Register / Archive institutional memory → 8. Entity / company / proof / AI control-tower layer.

## 2. Current verified foundation (at acceptance)

| Item | State |
|---|---|
| Part A raw index | `sale_event_raw` = 26 rows; 6 indexer cursors `complete` @ block 89,272,869 |
| Part B import | `historical_member_freeze` = 1 VERIFIED row (root triple-matched vs live V3 `V1_MEMBER_ROOT`); `historical_member` = 8 rows seq 1..8 |
| freezeGate | static VERIFIED · db-derived VERIFIED · CONSISTENT |
| Public surfaces | exactly 3 read-only API routes; `member` module `phase: future, enabled: false` |
| Holder Index | does **not** exist — no table, endpoint, projection, or UI is approved |

## 3. Original canon review (summary of verdicts)

Verdicts over the original TheSyndicate identity docs (read as historical oracle; never copied blindly):

**Adopted as-is** — from `IDENTITY_ATTRIBUTION_CONSTITUTION.md` (canonical in the original authority map):
- Three-layer split: seat owner / wallet owner / historical identity.
- Historical identity does not move on SYN transfer; migration/linking must be explicit, visible, reconstructable; no silent or frontend-only reassignment.
- Source never owns a member; attribution starts at first valid linked purchase; no retroactive capture; attribution non-transferable.
- Privy = onboarding/session/account layer only, never membership truth. SeatRecord721 = future non-transferable identity-record infrastructure only — never live-seat replacement, no yield/governance/claim rights.

**Adopted in principle** — from `HOLDER_INDEX_ARCHITECTURE.md` (classified **REFERENCE_PATTERN_ONLY**): identity from one event class; footprint layered, never identity; derived state always derived, never stored; INDEXED-only persistence; no manual fields ever; market-buy ≠ member; the seven anti-rewrite rules.

**Superseded:**
- Client-side browser/wagmi scanning → server-side indexer + `sale_event_raw`.
- Member numbers for #1–#8 derived from event replay → authority is now the Part B freeze/root.
- Rank / USDC-gap framing as core record fields → rank is secondary recognition only (per the original `RANK_CONSTITUTIONAL_RULING`), excluded from identity.
- Public wallet-profile pages and member tickers → violate the no-wallet-leak posture; at best future gated surfaces.

## 4. Wallet identity model

| Layer | Definition | Proven by |
|---|---|---|
| **Seat owner** | Wallet currently holding SYN. Binary; live balance. | `balanceOf` (not wired in this app; server-design posture only) |
| **Wallet owner** | Controller of the wallet/session — ability to sign **now**. | Signatures only |
| **Historical identity** | Permanent entry record: entry wallet, memberNumber, era/generation, purchase tx. | Part B freeze/root (#1–#8) + raw V3 events (#9+); server-side |

- A wallet **proves**: control of its key, its transaction history, its current balance.
- A wallet **does not prove**: a person, a legal entity, permanent identity, or entitlement to another wallet's entry history.
- **SYN transfer moves the seat, not historical identity.** If the entry wallet differs from the current holder, both facts coexist without contradiction: entry history stays with the entry wallet; seatedness follows the token.
- Identity migration/linking is a future explicit, recorded, reconstructable act — **never inferred**.
- **Privy may** (future, gated): onboarding, sessions, linked wallets, notifications. **Never**: seat truth, membership truth, signature replacement.
- **SeatRecord721 may** (future, gated): record memberNumber, entry wallet, chapter/era, purchase proof. **Never**: replace SYN as the live seat, confer rights, be minted before its policy is frozen.
- **Never inferred automatically:** person↔wallet, identity migration, attribution beyond emitted terms, seatedness from anything but live balance.

## 5. Seat receipt / proof model

The receipt is the atomic membership-truth object.

- **#1–#8 (historical):** receipt = Part B row (entry wallet, firstTransaction, leaf, Merkle proof) anchored by the VERIFIED freeze root triple-matched against on-chain `V1_MEMBER_ROOT`. Raw V1/V2 events **corroborate; they never number**.
- **#9+ (V3, post-freeze):** receipt = raw `MembershipPurchasedV3` rows with `firstSeat=true`. The **emitted `memberNumber` field is authoritative** (contract-assigned). `(blockNumber, logIndex)` ordering, contiguity (> 8, no gaps), and the on-chain `memberCount()` view are reconciliation checks — never sources.
- **V2B sentinel `memberNumber=0` is excluded always** (schema CHECK-enforced).
- Proof trail per receipt: txHash + blockNumber + logIndex (+ future blockTimestamp enrichment); 70/20/10 routing proof via the existing `Routed`-folds-into-`purchase` pairing (canon semantic bridge; pair on txHash + memberNumber).
- V3 source/referral fields (`sourceId`, `sourceClass`, `commissionBps`, `attributionScope`, …) exist in raw rows but remain **server-only, PENDING, gated**. Attribution is recorded; it never means the source owns the member.
- Public-safe receipt shape: aggregate existence only (counts, generation totals, shortened root commitment). The memberNumber↔wallet mapping is never exposed.

## 6. Historical continuity model

- Seats #1–#8 are historical identity rows whose numbering authority is the Part B freeze/root — never event replay.
- V2A/V2B continuity is preserved in generation fields; V2B sentinel 0 excluded.
- V3 numbering (#9+) begins after the freeze; its authority is the emitted event field.
- `freezeGate` VERIFIED means identity truth is available **server-side** — it does not make anything public.

## 7. Holder Index read-model: `MemberContinuityRecord`

Holder Index is a **member intelligence layer** — the first OS read-model over wallet identity + seat receipt truth — not merely a page/table. One record per member, unifying both eras.

| Field | Source of truth | Class | Privacy |
|---|---|---|---|
| memberNumber | Part B (#1–#8) / emitted V3 field (#9+) | AUTHORITATIVE | internal-admin; aggregates later |
| generation / era (V1/V2A/V2B/V3) | freeze row / raw event generation | AUTHORITATIVE | internal-admin; aggregates later |
| entry wallet | Part B / raw buyer-recipient | AUTHORITATIVE | **server-only, always** |
| entry tx/block/logIndex | Part B firstTransaction / raw row | AUTHORITATIVE | server-only |
| Merkle leaf + proof (#1–#8) | Part B | AUTHORITATIVE | server-only |
| chapter / cohort | bucketed memberNumber | DERIVED (pure fn) | aggregate-safe later |
| continuity flags (historical vs post-freeze) | era | DERIVED | internal-admin |
| source/referral linkage | raw V3 fields | GATED (PENDING) | server-only |
| rank recognition | — | FUTURE — never stored, never identity | — |
| aggregates (counts, generation totals) | reductions | DERIVED | public-safe later |

**Rules (binding):**
- Rebuild = **pure function** of (`historical_member_freeze` + `historical_member` + `sale_event_raw`). Deterministic, idempotent, droppable and fully rebuildable.
- Reconciliation: recomputed root == frozen root == on-chain root; V3 contiguity; total == `memberCount()`.
- No manual fields. No stored eligibility. No wallet/member leak. No memberNumber↔wallet public mapping.
- **No public surface until separately approved.**

**Future use:** substrate for My Syndicate lookups, Activity actor context, Register entries, SeatRecord721 issuance checks — all read the record; none redefines it.

## 8. My Syndicate boundary (future; not built)

Prerequisites before any cockpit work: wallet-signature authentication layer; Holder Index read-model (implemented + approved); explicit recovery/linking policy; future Privy account path. Scope when built: member lookup, receipt view, proof view, private member context, source/referral boundary — all scoped to the authenticated member's **own** record. Must never blur "you are seated" (live balance) with "this entry history is yours" (historical identity).

## 9. Activity / Chronicle / Register / Archive distinction (never collapse)

- **Activity** = live/chronological event heartbeat, derived from real events only. Blocked on blockTimestamp enrichment (honest time). Anonymized/aggregated on any non-member surface. Never identity authority.
- **Chronicle** = curated institutional memory. **Person-subject rows never auto-become Chronicle entries**; no raw member feed masquerading as institutional memory.
- **Register** = structured official protocol records (policy actions, revocations, recoveries).
- **Archive** = permanent artifact/memory layer ("SYN is the seat, artifacts are the memory") — never seat identity; reads remain NOT_WIRED behind separate gates.

Waiting-on map: Activity → timestamp enrichment; My Syndicate → auth + Holder Index; Chronicle/Register → curation policy; Archive → archive-read approval.

## 10. Big OS / Management OS extension

The generalizable pattern: **authoritative event trail → frozen authority anchor → rebuildable read-model → posture-gated surfaces.** Members are the first primitive. The same shape then serves companies/entities (registration proofs → entity records), capital flows (routing receipts → flow ledgers), decisions/audits (Register entries → control records), and operators/AI workers — who consume the same provenance-labelled read-models under `ADMIN_ONLY` / `SERVER_SIDE_CANON` postures, never bypassing them. Each future module arrives via its own founder gate using this template; no fake modules, full-size vision.

## 11. Privacy and posture matrix

| Data | Server-only | Internal admin | Auth member (own) | Public-safe later | Forbidden now |
|---|---|---|---|---|---|
| Wallets | ✅ always | — | own wallet echo | never | any exposure |
| memberNumber | ✅ | ✅ | own number | aggregates only | number↔wallet mapping |
| Merkle proof/leaf | ✅ | — | own proof (future gate) | never | any exposure |
| tx/block/log data | ✅ | ✅ | own receipts | never per-member | public per-member trail |
| source/referral fields | ✅ (PENDING) | future gate | own attribution | never raw | any surface |
| Aggregate counts | — | ✅ | ✅ | ✅ (gated) | ungated live claims |
| Roots | ✅ full | ✅ | — | shortened commitment | root + member context |
| Activity items | ✅ raw | ✅ | own events | anonymized aggregates | raw feed w/ wallets |
| Company/entity links | future | future | — | future gates | now |
| Rank | — | — | — | recognition-only, future | as identity or financial framing |
| Chapter/cohort | — | ✅ | own | aggregate distribution | per-wallet mapping |
| Receipt routing facts (70/20/10) | ✅ raw | ✅ | own receipt routing | protocol-level split facts | per-member routing w/ wallet |

## 12. Existing workspace reuse

- `lib/os-contracts` — the complete vocabulary. **No parallel taxonomy may ever be created.**
- Canon protocol-event registry + semantic bridge — event taxonomy, memberNumber rules, Routed-folding, generation postures.
- Part B gate/guard engine — the template for the read-model reconciliation guard.
- Studio config spine — `member` module slot, `syndicateFacts` membershipIdentity stages, surface classification: the future UI story is pre-wired and honestly PENDING.
- Status alignments executed with this doc (Slice A): `PART_B_STATUS` successor `IMPORTED_VERIFIED` (coordinated constant + guard expectation), and a narrow studio-facts reflection that historical member identity is verified server-side (no surface implied).

## 13. Risks

1. **Numbering drift** — re-deriving #1–#8 from events, or #9+ from row order instead of the emitted field.
2. **PII creep** — memberNumber↔wallet mapping leaking via an admin/debug surface or serialized payload.
3. **Vocabulary trap** — original canon uses "payout wallet" pervasively; that word is banned in studio product copy. Any future attribution UI must map to a safe synonym (e.g. "source settlement wallet").
4. **Surface pressure** — building Holder Index UI / member feed before auth + privacy prerequisites exist.
5. **Rank re-financialization** — progress-bar / gap framing would recreate forbidden copy.
6. **Fake-time Activity** — building Activity before blockTimestamp enrichment fabricates chronology.

## 14. Guard/test plan (required for the implementation slice)

- **Leak guards:** no-address-leak (serialized-payload scan), no decodedJson/rawJson leak, API route-exposure allowlist (exactly the approved read-only routes), no accidental wallet/member/source/referral route, no public member feed, no public proof API.
- **Correctness:** read-model rebuild determinism (two builds byte-equal); raw↔Part B reconciliation (recomputed root == frozen == on-chain); V2B sentinel exclusion; V1 freeze-numbering doctrine (#1–#8 never from events); post-freeze V3 numbering (emitted-field authority + contiguity + `memberCount()` match).
- **Doctrine assertions:** SYN transfer ≠ identity migration; Privy ≠ membership truth; source ≠ member owner; rank ≠ identity/reward; Activity ≠ identity authority; Chronicle ≠ member feed.
- **Privacy posture tests:** field-visibility matrix (§11) enforced.
- **Keep green:** freezeGate consistency, Part B canon/import guards, sale suites, full typecheck.

## 15. Next implementation gates (each requires separate founder approval)

1. Internal server-only Holder Index schema/read-model implementation (per §7, with §14 guards) — **no endpoint, no UI**.
2. blockTimestamp enrichment (prerequisite for honest Activity time).
3. Wallet/auth prerequisite design (prerequisite for My Syndicate).
4. Internal readiness/reporting surface — only after 1 exists and only if separately approved.
5. Any public surface — only after auth + privacy prerequisites exist and the §11 matrix is enforced by tests.
