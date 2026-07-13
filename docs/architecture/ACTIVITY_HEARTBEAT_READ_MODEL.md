# Activity Heartbeat Read-Model (server-internal; backbone-rebuilt)

Status (M4-a + M4-b, founder GO 2026-07-13): **SERVER-INTERNAL READ-MODEL,
rebuilt UNATTENDED by the event backbone, with exactly TWO sanctioned public
projections:** ① the address-safe AGGREGATE report
(counts/buckets/coverage/day-dates) at `/api/backbone/status`; ② the
RECEIPT-LINE FEED at `/api/backbone/feed` — newest-first, hard-capped (100),
public chain data per line (kind · generation · block · chain-verified time ·
the transaction verify anchor), identity-blind (no wallets, no member
numbers, no log indexes), gated by its own fail-closed output scan
(exact-shape anchors masked, strict scanner on the rest). Persistence of the
model itself: still none — in-memory only, rebuilt each cycle.

## What it is

An in-memory derivation of "protocol activity" from two already-proven
sources (written by the founder-gated scripts AND, since M4-a, by the
unattended backbone's incremental cycles):

- **Part A** — `sale_event_raw`, the insert-only raw sale-event index.
- **Protocol Time** — `block_timestamp`, the chain-verified block-timestamp
  cache (never wall-clock).

It mirrors the member-continuity pattern exactly: a **pure builder**, a
**shared loader**, a **read-only derive runner**, and guard suites.

| File | Role |
| --- | --- |
| `artifacts/api-server/src/backbone/activityHeartbeatReadmodel.ts` | Pure builder: no db, no network, no clock. Deterministic, fail-closed. (Moved from scripts/ in M4-a.) |
| `artifacts/api-server/src/backbone/backboneDb.ts` | THE one lazy-DB zone of the backbone: scan persistence + Protocol Time inserts + the shared activity loader (decodedJson whitelist + divergence cross-check). |
| `artifacts/api-server/src/backbone/backboneRunner.ts` | The unattended runner: boot + interval cycles (scan → enrich → rebuild), fail-closed per cycle, last-good kept, dark by default (`SYNDICATE_BACKBONE_ENABLED === "true"` exact literal). |
| `artifacts/api-server/src/backbone/blockTimeEnrich.ts` | Incremental Protocol Time enrichment (never-verified blocks only; the full re-verification replay stays `protocol-time:enrich`). |
| `artifacts/api-server/src/routes/backboneStatus.ts` | `/api/backbone/status` — address-safe aggregate snapshot; output-gated. |
| `artifacts/api-server/src/backbone/feedProjection.ts` | The receipt-line feed projection (M4-b): field whitelist, exact-shape verify anchors, own output gate. |
| `artifacts/api-server/src/routes/backboneFeed.ts` | `/api/backbone/feed` — newest-first receipt lines, hard cap 100; gate-scanned before send. |
| `artifacts/api-server/scripts/activity-heartbeat-derive.ts` | Shared loader → builder → determinism verification → address-safe report. `activity:derive`. |
| `artifacts/api-server/scripts/activity-heartbeat.guard.ts` | Fixture + static-scan guard. `activity:guard`. |
| `artifacts/api-server/scripts/backbone.guard.ts` | The backbone zone's own guard (exposure literal, one-DB-file, write discipline, failure posture, output gate). `backbone:guard`. |

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

## What the backbone (M4-a) deliberately does NOT do

- No new tables, no migrations: the unattended cycles write ONLY what the
  founder-gated scripts already write (raw rows, cursors, block timestamps —
  all idempotent inserts / the engine's cursor upsert).
- No third projection: aggregate report + receipt-line feed, nothing else;
  filters, pagination depth, and personal feeds wait (M5+).
- Event kinds (M4-c): purchases (+ folded Routed) via the sale lane, PLUS the
  protocol-event lane — SYN burns (the numbered Proof of Burn record;
  senders leave the server ONLY as Founder/Community labels) and the three
  Source Registry lifecycle events (`src/backbone/protocolEventScan.ts` +
  `protocolEventReadmodel.ts`, additive tables `protocol_event_cursor` /
  `protocol_event_raw`). Numbering is gapless BY CONSTRUCTION (a failed chunk
  fails the cycle without advancing the cursor). Notifications and further
  kinds wait.
- No identity claims: activity is not identity authority; the Chronicle,
  Register, and holder index remain separate concerns.
- Never on by accident: dark by default in every environment; the founder's
  exact `SYNDICATE_BACKBONE_ENABLED="true"` literal is the only ignition.

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
