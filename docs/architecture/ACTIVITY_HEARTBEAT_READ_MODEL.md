# Activity Heartbeat Read-Model (internal, server-only)

Status: **INTERNAL READ-MODEL ONLY** — no persistence, no route, no UI, no
public projection. A public activity surface is a separate, founder-gated
slice that does not exist yet.

## What it is

An in-memory derivation of "protocol activity" from two already-proven,
founder-gated sources:

- **Part A** — `sale_event_raw`, the insert-only raw sale-event index.
- **Protocol Time** — `block_timestamp`, the chain-verified block-timestamp
  cache (never wall-clock).

It mirrors the member-continuity pattern exactly: a **pure builder**, a
**read-only derive runner**, and a **guard suite**.

| File | Role |
| --- | --- |
| `artifacts/api-server/scripts/activity-heartbeat-readmodel.ts` | Pure builder: no db, no network, no clock. Deterministic, fail-closed. |
| `artifacts/api-server/scripts/activity-heartbeat-derive.ts` | Read-only selects → builder → address-safe report. `activity:derive`. |
| `artifacts/api-server/scripts/activity-heartbeat.guard.ts` | Fixture + static-scan guard. `activity:guard`. |

## Derivation rules

- **Taxonomy**: every item is kind `purchase`, category `membership-sale` —
  local literals mirroring the vendored canon protocol-event registry
  (tsconfig-excluded, never imported). The guard reconciles the literals
  against the canon text and fails on drift. No parallel taxonomy is minted.
- **Routed folding**: a `Routed` row (V2A/V2B) is routing detail of its
  purchase transaction, not separate activity. Pairing is by transaction hash
  with fail-closed cardinality (exactly one purchase per tx, at most one
  Routed) and reconciliation of the opaque pairing token (`memberNumber`) on
  both rows. The V2B sentinel `0` is a valid token, never a member.
- **firstSeat buckets**: `true` / `false` / `unknown`. Reported only where the
  contract emitted the flag; V1 rows are always `unknown` — never inferred.
- **Time**: every item timestamp is the chain-verified block timestamp from
  the Protocol Time cache; a missing timestamp fails the whole build. The
  report carries day-granularity UTC dates only.
- **Ordering**: items sort by `(blockNumber, logIndex)`; input order never
  changes the output (verified by rebuild + shuffled-input byte-identity).
- **Fail closed**: wrong chain, unknown event/generation shape, unpaired
  Routed row, pairing-token mismatch, conflicting or missing timestamps all
  throw. Nothing is guessed or normalized.

## Privacy / reporting boundary

The only serialization path out is `toAddressSafeActivityReport`:
counts, generation/bucket aggregates, coverage counts, a day-granularity date
range, and pass/fail checks. It structurally excludes items and self-scans its
own JSON — fail-closed — for hex identity material (shared
`assertAddressSafeJson`) and for forbidden field names (`memberNumber`,
`blockNumber`, `transactionHash`, `firstSeat`, `logIndex`,
`blockTimestampSec`). Gated economics (referral/source fields) are never read
into the model at all: derive's `decodedJson` access is whitelisted to exactly
`{firstSeat, memberNumber}` and the guard scans for gated literals.

## Derive runner extras

- Refuses to run if any raw row sits on an unexpected chain (expected 43114).
- Cross-checks `sale_event_raw.block_hash` against the Protocol Time cache's
  divergence-witness hash for every row where both exist; any mismatch aborts.
- Exits non-zero unless consistency + determinism are fully green.

## What this slice deliberately does NOT do

- No table, no migration, no runtime DB writes (served backend stays
  read-only; DB rows exist only via the existing founder-gated scripts).
- No API route, no UI, no public projection of any kind.
- No RPC: chain truth was already verified upstream by the indexer and the
  Protocol Time enrichment; this adds no new network dependency.
- No identity claims: activity is not identity authority; the Chronicle,
  Register, and holder index remain separate concerns.

## The receipt thread — one truth through five surfaces (advisor synthesis, 2026-07-13)

*Cross-repo read (syndicate-os prod code + the origin's activity/chronicle design intent).
DESIGN DIRECTION for the Activity/Chronicle slices; the pipeline above stays the authority.*

The **receipt is the atom**: the on-chain purchase transaction itself (the
`MembershipPurchasedV3` event — tx hash, block, memberNumber). Nothing is minted or invented;
the chain emits it. Today it is already served own-row (`memberRoster.lookupMemberReceipt`,
ADR-003 §3, fail-closed) and rendered with "Share my proof" on the member's Your Seat strip.

Where it attaches, in order — the same atom projected, never duplicated:

1. **Receipt** — the tx (own-row for the member; any visitor can verify it on the explorer).
2. **Activity** — the heartbeat feed renders it as an event row (type `membership`, proof
   `On-chain`), per this read-model's EVENT→SIGNAL pipeline. Origin design intent kept: each
   row carries a type badge + a proof badge + the memory flag.
3. **Memory** — events of memory grade (archive/milestone in the origin's taxonomy) are
   "anchored"; transient rows (routing) are not. The flag derives from the event type only.
4. **Chronicle** — promotion of an anchored event into the solemn record is a HUMAN act
   (founder), never automatic (candidates live in `docs/chronicle/candidates/`).
5. **Share card** — the origin's ShareDialog pattern (eyebrow · title · proof lines · share
   text): the receipt/event becomes the member's shareable proof — this IS the
   vanity/acquisition layer of `MVP_FINAL_MASTER_BRIEF` (pieces 2+3+7).

**Admin manageability (already law, applied here):** every surface this thread lights up
(Activity · Chronicle · share cards · seasons later) ships as a MODULE with its founder-owned
`enabled` switch (a literal — CANON_INVARIANT_VS_STATE) and a management page in the
WordPress-style admin shell (`ADMIN_SHELL_SPEC.md`), on the Supa admin lifecycle pattern
(state machine · next-step engine · guarded actions · audit · archive — harvested in
`SEASONS_ENGINE_ON_SYNDICATE_OS.md` §1). The founder activates, deactivates, and configures
— plugins, not rebuilds.
