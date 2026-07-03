# Holder Index Read-Model Design (the raw-truth → served-read-model bridge)

- **Status:** DESIGN-ONLY — founder-approved slice, 2026-07-03. Nothing in this document authorizes a table, migration, endpoint, route, UI, auth, wallet connect, backfill, or publish. Every implementation step remains behind its own founder gate.
- **First-read router:** `THE_SYNDICATE_OS_COMPASS.md` (meta-canon router; source docs win on conflict).
- **Parent doctrine:** `docs/architecture/WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` (founder-audited identity canon, 2026-07-02). This document does not restate or replace it; it designs the **bridge** that turns the truth that doc governs into future served, truth-labelled read-models.
- **Vocabulary rule:** no new taxonomy. All posture/surface/visibility terms are the existing `lib/os-contracts` vocabulary; all event terms are the vendored canon `protocol-event-registry`.

---

## 1. Executive purpose

The Holder Index read-model is the first OS read-model over wallet identity + seat receipt truth — per parent doctrine §7, a **member intelligence layer**, one record per member, unifying both eras (#1–#8 historical, #9+ V3). This document defines **how canonical member/sale reality later becomes served, truth-labelled read-models** — the fold rules, shapes, posture mapping, and exposure gates — *without building any of it now*.

## 2. Problem solved

The repo holds verified raw truth and verified doctrine, but no designed bridge between them and any future served surface:

- **Raw canonical truth** — Part A `sale_event_raw` (insert-only raw sale-event index, 6 cursors complete).
- **Historical continuity** — Part B `historical_member_freeze` / `historical_member` (VERIFIED, root triple-matched, guard-locked).
- **Protocol events** — the vendored canon event taxonomy (kinds, categories, fold semantics).
- **Wallet identity doctrine** — the 3-layer model and per-era numbering authority.
- **Activity heartbeat** — the script-only, in-memory activity derivation pattern.

Without this design, any future Member OS / recognition / proof surface would improvise its own normalization — the exact parallel-canon drift this repo has already paid for. This document fixes the rules once, on paper, before code exists.

## 3. Source authority hierarchy

| Concern | Authority |
|---|---|
| Event taxonomy | `artifacts/api-server/src/canon/the-syndicate/proof/protocol-event-registry.ts` — only; never a parallel taxonomy |
| Historical freeze / member numbering (#1–#8) | Part B tables (`lib/db/src/schema/partB.ts`) anchored by the VERIFIED freeze root triple-matched vs on-chain `V1_MEMBER_ROOT` |
| Post-freeze numbering (#9+) | the emitted `MembershipPurchasedV3` `memberNumber` field (contract-assigned) |
| Wallet identity doctrine | `docs/architecture/WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` §§4–7 |
| Access / public-private exposure | `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` + parent doctrine §11 privacy matrix |
| Posture / status vocabulary | `lib/os-contracts/src/` (`SourcePosture`, `SourceAuthority`, `MemberDataVisibility`, `SyndicateProofDomain`, …) — only |
| Chain-verified time | Protocol Time `block_timestamp` cache (never wall-clock) |

Conflict rule: this design defers to every authority above; if it disagrees with one of them, the authority wins and this document is the bug.

## 4. Raw inputs

1. **Part A — `sale_event_raw`**: insert-only raw rows (txHash, blockNumber, logIndex, event name, generation, decoded fields). Replayable; the normalization below never mutates it.
2. **Part B — freeze/member rows**: 8 historical identity rows + the frozen root. Authority for #1–#8; never regenerated.
3. **Canon protocol-event-registry**: `purchase` (category `membership-sale`) is the identity-bearing kind; `Routed` rows are routing detail, not separate events.
4. **Protocol Time — `block_timestamp`**: chain-verified timestamps for time-bearing fields; written only by the founder-gated enrichment script.
5. **Activity heartbeat read-model**: the proven fold/guard pattern this design inherits (pure builder, read-only derive, guard suite, address-safe reporting).
6. **Wallet identity doctrine**: the semantic rules every field below obeys.

## 5. Identity model (inherited, not redefined)

Per parent doctrine §4–§6:

- **Wallet** — proves key control, tx history, current balance; never a person, never entitlement to another wallet's entry history.
- **Receipt** — the atomic membership-truth object: Part B row (#1–#8) or raw `MembershipPurchasedV3` row with `firstSeat=true` (#9+), with its proof trail (txHash + blockNumber + logIndex, future blockTimestamp).
- **Member number** — permanent historical identity, per-era authority (§6 below).
- **Era / generation** — V1 / V2A / V2B / V3; preserved in generation fields, never collapsed.
- **Chapter / recognition context** — DERIVED, pure function of memberNumber bucketing; recognition is secondary standing, never identity, never stored.
- **Historical continuity** — entry record stays with the entry wallet forever; **SYN transfer moves the seat, not historical identity**.
- **Current holder vs historical member** — both facts coexist without contradiction: seatedness follows live SYN balance; entry history stays with the entry wallet. The read-model records historical identity and *never infers* seatedness, migration, or person↔wallet links.

## 6. Per-era numbering authority (binding; no exceptions)

| Era | Numbering authority | Notes |
|---|---|---|
| **V1** (#1–#8 range) | Part B freeze/root **only** | raw events corroborate; they never number |
| **V2A** | Part B freeze/root **only** | continuity preserved in generation fields |
| **V2B** | Part B freeze/root **only** | sentinel `memberNumber=0` excluded always (schema CHECK-enforced); it is a pairing token, never a member |
| **V3** (#9+) | the **emitted** `memberNumber` event field | `(blockNumber, logIndex)` ordering, contiguity (> 8, no gaps), and on-chain `memberCount()` are reconciliation checks — never sources |

- **No regeneration or renumbering — ever.** The freeze is frozen.
- **No manual assignment.** Per parent doctrine §7 (verbatim): "No manual fields."
- Re-deriving #1–#8 from event replay is the superseded prior-art method and is doctrine drift.

## 7. Fold / normalization rules (design-level)

1. **Raw → normalized purchase row**: exactly the canon kind `purchase` (category `membership-sale`) produces an identity-bearing row. No other kind creates or modifies identity.
2. **Routed folding**: a `Routed` row (V2A/V2B) is routing detail of its purchase transaction, folded into the purchase row — pairing by transaction hash with fail-closed cardinality (exactly one purchase per tx, at most one Routed) and reconciliation of the opaque pairing token (`memberNumber`) on both rows. Never a separate identity event.
3. **Ordering**: `(blockNumber, logIndex)` is the only ordering; input order must never change the output (verified by shuffled-input byte-identity, per the Activity heartbeat precedent).
4. **Duplicates / idempotency**: the raw index is insert-only and unique per event position; the rebuild is deterministic and idempotent — running it twice produces byte-equal output; there is no incremental hand-patching path.
5. **Partial / unknown states**: emitted-only discipline — `firstSeat` is `true`/`false` only where the contract emitted it, `unknown` otherwise (V1 rows always `unknown`); never inferred. Time-bearing fields exist only where Protocol Time has the block; identity fields never depend on timestamps.
6. **Failure handling**: fail closed. Wrong chain, unknown event/generation shape, unpaired Routed row, pairing-token mismatch, numbering discontinuity, root mismatch — each aborts the build. Nothing is guessed, normalized-by-assumption, or invented.
7. **Why pure-function rebuildable**: per parent doctrine §7 (verbatim): "Rebuild = **pure function** of (`historical_member_freeze` + `historical_member` + `sale_event_raw`). Deterministic, idempotent, droppable and fully rebuildable." And: "No manual fields. No stored eligibility." Derived state is always derived at build time, never stored as if authoritative, never hand-edited.
8. **Reconciliation invariants** (every build): recomputed root == frozen root == on-chain root; V3 contiguity; total == `memberCount()`; V2B sentinel excluded.

## 8. Read-model shapes (design-level only — no schema, no migration, no code)

Field classes and privacy follow the parent doctrine §7 table and §11 matrix exactly.

1. **Member identity summary** (internal-admin): memberNumber, era/generation, continuity flags, chapter/cohort (DERIVED). No wallet.
2. **Purchase / receipt row** (server-only): entry wallet, entry tx/block/logIndex, folded routing facts, future blockTimestamp. The full proof trail.
3. **Continuity row** (server-only): the era-unified record — Part B fields (#1–#8: entry wallet, firstTransaction, leaf, Merkle proof) or raw V3 fields (#9+), plus reconciliation lineage.
4. **Exposure-safe public proof row** (public-safe, later, gated): aggregate existence only — counts, generation totals, shortened root commitment. Never a wallet, never a per-member trail, never the memberNumber↔wallet mapping.
5. **Internal verification row** (server-only): the reconciliation result set — root triple-match, contiguity check, `memberCount()` match, sentinel-exclusion check, build determinism hash — the future guard suite's substrate (parent doctrine §14).

Gated fields (V3 source/referral linkage incl. `sourceId`, `sourceClass`, `commissionBps`, `attributionScope`) are **never read into the model** until their own founder gate opens — the Activity heartbeat's whitelist discipline (decoded-field access limited to exactly what the slice is approved to read) is the binding precedent.

## 9. Truth-label / posture mapping (existing `SourcePosture` vocabulary only)

| Posture | What belongs under it (Holder Index context) |
|---|---|
| `READ_ONLY_PROOF` | Only what is verified AND locally present/pinned AND actually served read-only — today: nothing of the Holder Index; the three existing API routes retain their own postures |
| `NOT_WIRED` | Any surface slot that names Holder Index data with no adapter behind it (e.g. the studio `member` module today) |
| `VERIFIED_SOURCE_PENDING_ADAPTER` | The honest posture of Holder Index data itself: Part A/B are verified sources, but no read-model adapter exists yet (per `source-boundary.ts`: verified sales/member/receipt data is modelled as this or `AUTH_REQUIRED` — never invented, never prematurely public) |
| `AUTH_REQUIRED` | Future member-scoped facts: own receipt, own proof, own attribution — after a real auth layer exists |
| `ADMIN_ONLY` | memberNumber/era tables, aggregate internals, verification rows for operator review |
| `FUTURE` | My Syndicate cockpit, SeatRecord721 issuance checks, recognition surfaces |

No new posture value is introduced; none of the above implies `LIVE_ACTION` (there is no write posture anywhere in this design). Posture, source authority, and confidence remain three separate axes.

## 10. Exposure gates

| Class | Contents | Rule |
|---|---|---|
| **Server-only, always** | entry wallets, Merkle leaf/proof, per-member tx/block/log trail, raw source/referral fields, full roots | never serialized outward; leak guards scan every outbound payload |
| **Founder/operator-only** | memberNumber & era tables, chapter distributions, verification rows, aggregate internals | `ADMIN_ONLY` posture; still never the memberNumber↔wallet mapping in any UI/debug/serialized form |
| **Future member-auth** | the authenticated member's **own** record: own receipt, own proof, own routing facts, own attribution | `AUTH_REQUIRED`; scoped strictly to self; never blurs "you are seated" (live balance) with "this entry history is yours" (historical identity) |
| **Public proof, later, gated** | aggregate counts, generation totals, shortened root commitment, protocol-level routing split facts | each exposure is a separate founder-approved act with copy review |
| **Deliberately surfaced proof** | designed transparency — a chosen, reviewed, truth-labelled disclosure (e.g. a published root commitment) | allowed by doctrine; every such surface passes the `PostureUpgradeGate` checklist |
| **Never leaks accidentally** | memberNumber↔wallet mapping; any wallet on any public surface; per-member event trails; raw decoded JSON; gated economics fields | uncontrolled raw leakage is forbidden; serialized-payload self-scans (the Activity heartbeat's address-safe pattern) are mandatory in the implementation slice |

## 11. Relationship to Activity / Chronicle / Register / Archive (never collapse)

- **Activity** = raw event heartbeat — chronological, derived from real events + Protocol Time only; never identity authority.
- **Holder Index** = the normalized identity/member read-model — one record per member; the substrate others read.
- **Register** = official structured protocol records (policy actions, revocations, recoveries).
- **Chronicle** = curated institutional memory; person-subject rows never auto-become Chronicle entries (canon registry: `purchase`/`new-member`/`rank-reached` are never Chronicle-eligible).
- **Archive** = permanent artifact/memory layer — "SYN is the seat, artifacts are the memory"; never seat identity.

Each reads the Holder Index record where relevant; none redefines it.

## 12. Relationship to future surfaces

- **Member OS / My Syndicate** — reads the authenticated member's own continuity record (after auth + linking policy exist).
- **Recognition** — chapter/standing context as DERIVED reductions; recognition is member-status logic, never identity, never stored.
- **Public proof** — exposure-safe aggregates + root commitments feed truth-labelled public surfaces, each behind its own gate.
- **Source attribution** — verified-introduction records read the same receipts once their namespace un-gates; attribution never means the source owns the member.
- **Treasury / economy** — folded routing facts (70/20/10) aggregate into protocol-level flow ledgers using the same template.
- **Founder/operator review** — verification rows power internal readiness reporting (`ADMIN_ONLY`), the first consumer after implementation.

The generalizable pattern (parent doctrine §10): authoritative event trail → frozen authority anchor → rebuildable read-model → posture-gated surfaces. Members are the first primitive; entities, flows, and audit records reuse the same shape later.

## 13. Explicitly not built in this slice

No schema. No migration. No endpoint. No UI. No auth. No wallet connect. No public Holder Index. No DB writes. No backfills. No production data movement. No guard changes (none required by this document). This file is the only deliverable.

## 14. Future implementation phases (each requires separate founder approval)

1. **Founder/Dave review** of this design.
2. **Schema proposal** — internal server-only read-model schema per §8, presented as its own gated slice.
3. **Server read-model builder design/implementation** — pure builder + read-only derive runner, mirroring the Part B / Activity heartbeat pattern; no endpoint, no UI.
4. **Internal verification harness** — guard suite per parent doctrine §14 (leak guards, determinism, reconciliation, doctrine assertions, §11 matrix tests).
5. **Member/auth-gated surface** — only after the auth prerequisite track exists (own-record scope only).
6. **Public proof surface** — only after separate approval, copy review, and the `PostureUpgradeGate` checklist.

Prerequisite noted, not scheduled: blockTimestamp enrichment completion for any time-bearing field (identity fields do not wait on it).

## 15. Risks refused by this design

- **No parallel event taxonomy** — canon registry only; local literals must be guard-reconciled against canon text (Activity heartbeat precedent).
- **No parallel status vocabulary** — `lib/os-contracts` only; no fourth enum.
- **No renumbering** — #1–#8 freeze/root authority; #9+ emitted field; never row order, never replay.
- **No manual identity edits** — "No manual fields. No stored eligibility." (parent doctrine §7, verbatim).
- **No privacy panic** — exposure is a designed, gated matrix, not an emergency reaction; the §10 table decides in advance.
- **No accidental public proof leak** — server-only classes never serialize outward; mandatory self-scanning reports.
- **No premature implementation** — this slice ships one document; every build step sits behind its own gate.

## 16. Open founder/Dave decisions (needed later, none blocking this document)

1. **Schema gate** — approve the internal server-only schema slice (phase 2) when ready.
2. **blockTimestamp enrichment run** — founder-gated script execution to complete Protocol Time coverage (prerequisite for time-bearing fields and honest Activity).
3. **Identity migration/linking policy** — the explicit, recorded, reconstructable linking act must be specified before any member-facing cockpit.
4. **Attribution vocabulary mapping** — the original canon's own term for the attribution-settlement wallet is itself on the banned product-copy list (parent doctrine §13.3; deliberately not written here); "source settlement wallet" is the safe synonym to lock before any attribution surface.
5. **Aggregate exposure approvals** — each public-safe aggregate (counts, generation totals, shortened root commitment) is a separate approval with copy review.
6. **SeatRecord721 policy freeze** — required before any issuance-check consumer of this read-model is designed.
