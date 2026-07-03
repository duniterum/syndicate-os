# Founder Decision Memo — Holder Index Sprint (pre-approval)

Date: 2026-07-03
Status: AWAITING FOUNDER DECISIONS — nothing in this memo is built, scheduled, or implied approved.
Canon referenced: `docs/architecture/HOLDER_INDEX_READ_MODEL_DESIGN.md` (design canon),
`docs/architecture/WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` (identity canon).
On conflict, those documents win; this memo only frames the decisions they leave to you.

---

## Context: where the protocol stands after the Protocol Map sprint

The public Protocol Map shipped at `/map`: zero new endpoints, a read-only composition of
`GET /api/protocol/reality` (chain, contracts, tokens, sale, source; archive deliberately
unbound), with the V3 engine's three public figures raw-first (exact base-unit strings as
source of truth, derived display labelled and computed from live token decimals, fail-closed
to raw-only). The homepage promoted card now routes there. Full validation battery is green
(typecheck; all guards including new /map exposure checks; SEO 204 checks, 11 INDEX routes);
architect review passed with no code changes required.

The next natural organism is the **Holder Index** — the raw-truth → served-read-model bridge.
Everything below is gated on your decisions. Five are required; each lists options,
implications, and a recommendation. Nothing proceeds on a recommendation alone.

---

## Decision 1 — Public exposure policy

**Question:** When a Holder Index read-model exists, what (if anything) becomes publicly visible?

Hard constraints already binding (not up for decision here):
- Wallet addresses are server-side PII. Never in any public UI, API response, or projection.
- `memberNumber` is an opaque recognition token, never linked publicly to a wallet.
- Part B historical-member data (wallets, first transactions, leaves, proofs) stays server-only.

Options:
- **1a. Nothing public** — the index exists server-side only, consumed by self-readback
  (Decision 5) and future operator surfaces. Public surfaces keep showing only the
  aggregate figures already live on `/map` (receipt count, etc.).
- **1b. Aggregates only** — public surfaces may additionally show derived aggregate counts
  from the index (e.g. seats recognised per era, continuity counts) with truth labels and
  a registry-driven posture chip. No per-seat rows, no numbers-to-anything linkage.
- **1c. Per-seat public register** — a public roster of seat numbers with era provenance
  (never wallets). This is the "Register" surface from canon §11 — a distinct product
  decision with real de-anonymisation surface area (timing correlation against public
  chain data), and canon says Register/Chronicle/Activity/Archive must never collapse.

**Recommendation: 1b.** It gives the public organism honest growth (real aggregate reads,
truth-labelled) without opening any per-seat correlation surface. 1c should be its own
future sprint with a dedicated privacy review if you ever want it.

## Decision 2 — Served read path (doctrine amendment) vs script-only

**Question:** May served code read the database at runtime, for the first time?

Current doctrine: served code never touches the DB at runtime. Every DB row exists via
founder-gated one-time scripts; `freezeGate.ts` is a static served module reconciled by an
offline script that fails closed. The Activity Heartbeat read-model is script-only by the
same rule. A served Holder Index endpoint breaks this unless we keep the pattern.

Options:
- **2a. Static snapshot module (freezeGate pattern, no doctrine change)** — a founder-gated
  script builds the read-model and emits a static, hash-pinned TypeScript/JSON snapshot that
  served code imports. A reconciler script verifies snapshot-vs-DB and fails closed.
  Implication: index freshness = whenever you re-run the script; zero runtime DB exposure;
  doctrine untouched.
- **2b. Doctrine amendment: read-only runtime DB path** — served code gains a read-only DB
  role (SELECT-only credentials, separate connection, no write grants), used exclusively by
  the Holder Index read endpoint. Implication: fresher index, but the "served code never
  reads the DB" invariant becomes "served code never *writes* the DB", and the guard suite
  must grow a new class of checks (role privileges, import fencing, query allow-list).
- **2c. Defer** — build the read-model script-only (like Activity Heartbeat), serve nothing yet.

**Recommendation: 2a.** The freeze-gate pattern already proved this shape works and fails
closed. The index changes only when membership events happen; a founder-gated rebuild is an
honest cadence, not a limitation. Amend doctrine (2b) only when a surface genuinely needs
runtime freshness that a snapshot cannot give — that day is not obviously here.

## Decision 3 — Protocol Time enrichment and the hash rebuild

**Question:** Do we enrich block timestamps first, and accept the continuity-hash rebuild that follows?

Facts: S3b continuity records are persisted and hash-pinned; the hash **includes block
timestamps**. Enriching Protocol Time (the founder-gated `protocol-time:enrich` script)
changes those timestamps, so hashes for the same provenance will differ — and by design,
hash drift on identical provenance **hard-fails**; there is no upsert. The correct sequence
is a founder-approved full re-build of the continuity records (S3b re-run), never a
compare-against-stale-hash.

Options:
- **3a. Enrich → rebuild → verify (one gated sequence)** — run `protocol-time:enrich` to
  complete the timestamp cache, then re-build S3b from scratch under the dual-armed write
  gate, then verify replay is an exact no-op. The Holder Index then builds on
  timestamp-complete records.
- **3b. Build Holder Index on current records; enrich later** — accepts a known future
  rebuild of both the continuity records *and* the derived index (two rebuilds instead of one).
- **3c. Freeze current records permanently** — no enrichment; index carries gaps where
  timestamps are missing, honestly labelled.

**Recommendation: 3a.** One deliberate, gated rebuild before the index exists is strictly
cheaper and cleaner than rebuilding a two-layer structure later. Each step in the sequence
still requires its own arm/confirm — approving 3a approves the sequence, not a blanket write.

## Decision 4 — Numbering authority era boundary (confirm as binding for the index)

**Question:** Confirm the per-era numbering authority as the served index's spine, and how era provenance is displayed.

Canon (design doc §6) is already explicit; this is a confirmation plus one display choice:
- Seats **#1–8**: authority is the verified historical freeze + on-chain `V1_MEMBER_ROOT`.
  Never re-derived. (`memberNumber = 0` remains a sentinel, never a seat.)
- Seats **#9+**: authority is the emitted V3 `memberNumber` from chain events. Never inferred,
  never renumbered.
- The index must store era provenance per record and must never present a single
  undifferentiated sequence as if one authority issued it.

Display choice (only matters if Decision 1 ≠ 1a):
- **4a. Era always labelled** — any surfaced number carries its provenance chip
  ("historical freeze / on-chain root" vs "V3 engine event").
- **4b. Era internal-only** — public sees plain numbers; era lives server-side.

**Recommendation: confirm the boundary as binding + 4a.** Provenance labelling is the same
honesty muscle as the raw/derived labelling that just shipped on `/map` — it costs one chip
and forecloses a future "why do these numbers have two sources" credibility question.

## Decision 5 — Self-readback extension

**Question:** May a signed-in wallet read its own Holder Index continuity record, in addition to the live `memberNumberOf` chain read it gets today?

Current amended doctrine: session ≠ membership, except **self-readback** — the SIWE session's
bound account may read ONLY its own standing (`memberNumberOf`), no directory, no lookup of
other wallets, bound account never echoed.

Options:
- **5a. Extend self-readback to own continuity record** — `/member` could show your seat's
  era provenance, first-seen, continuity status: own-row-only, same binding rules, and it
  composes cleanly with 2a (the served snapshot is keyed so a session can only resolve its
  own row; still no directory).
- **5b. Keep chain-only** — self-readback stays exactly `memberNumberOf`; the index remains
  invisible to members for now.
- **5c. Defer** until the index exists and has been verified server-side for a full cycle.

**Recommendation: 5c, with 5a as the pre-approved shape.** Build and verify the index first;
extend the member surface one sprint later once the reconciler has proven the snapshot
stable. That keeps the auth surface unchanged during the index's first life-cycle.

---

## Minor housekeeping (no decision needed, noted for the next registry touch)

- Architect flagged a one-line consistency question: the new `public-map` registry entry sets
  `adminManaged: true` while the promoted `protocol-reality` entry is `false`. Reconcile the
  flag's meaning next time `moduleRegistry.ts` is edited (not a defect; both rows render
  correctly today).

## What a "yes" unlocks (shape of the sprint, for sizing only)

With 1b + 2a + 3a + 4(confirm, 4a) + 5c, the Holder Index sprint would be:
enrich Protocol Time (gated) → rebuild S3b (gated, replay-verified) → build the index
read-model script + static snapshot + fail-closed reconciler → serve aggregates through the
existing spine posture vocabulary → surface truth-labelled aggregate(s) on `/status` (and
`/map` only if you approve a sixth group there) → guard extensions for every new invariant.
No auth changes, no new write paths, no wallet data leaving the server.

**Nothing above starts until you answer Decisions 1–5.**
