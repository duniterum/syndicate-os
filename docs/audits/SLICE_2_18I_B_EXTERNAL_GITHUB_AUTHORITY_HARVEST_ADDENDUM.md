# Slice 2.18I-B — External GitHub Authority Harvest Addendum

**Status:** READ-ONLY / REPORT-ONLY. No product, config, memory, or index file
was edited. No transaction, deployment, publish, or activation was performed.
This document is an **addendum** to
`docs/audits/SLICE_2_18I_GITHUB_CAPABILITY_HARVEST_FLEXIBLE_MVP_ADAPTATION_MAP.md`
(the prior in-workspace harvest). It does not supersede it; it corrects and
extends it with evidence read directly from the external source-of-record
repository.

**Doctrine reminder honored throughout:** no `0x` addresses, no transaction
hashes, no member identifiers, and no PII appear in this document. Every
contract, wallet, source record, and member surface is referred to **by name
only**. Nothing below authorizes wiring real data, contracts, chain reads, or
payments. Adapting anything found here remains gated behind explicit
founder approval and a verified real source (per `replit.md` user preferences).

---

## 1. Purpose & Scope

The prior slice (2.18I) harvested capability signal from material already inside
this workspace (vendored canon + attached prompt files) and produced a
flexible-MVP adaptation map. That harvest was necessarily **partial**: it could
only see the subset of the protocol that had been vendored into this clean
rebuild.

This addendum closes that gap by reading the **external authority repository**
directly — the full upstream tree, not the vendored slice — and answering:

1. Could the external repo actually be accessed, and at what exact revision?
2. Is the local vendored canon a faithful subset of that revision?
3. Where does the protocol "intelligence map" material actually live, and is it
   answers or questions?
4. What are the external repo's top real capabilities?
5. Where are the biggest local-vs-external gaps?
6. What must feed the next slice (2.18J)?
7. Is 2.18J safe to start?

It deliberately stops at reporting. It does **not** begin 2.18J, implement any
capability, or modify any product surface.

---

## 2. External Repository Access & Provenance

**Access: confirmed.** A shallow clone succeeded over the public network:

- Repository: `https://github.com/duniterum/TheSyndicate`
- Clone location (outside the workspace source tree, safe): `/tmp/thesyndicate-external-github`
- Files materialized: ~2,581
- Branch: `main`

**External HEAD (exact):**

- Commit: `cf4ca34c74599de1324e77052f1a81dd15cb1cc0`
- Date: `2026-06-29`
- Subject: `Merge Product OS Studio canonical truth registry`

**Critical provenance finding — the canon match.** This HEAD is the **exact
commit the local vendored canon was pinned from**. The local workspace is
therefore not a stale or divergent fork: it is a **thin, clean rebuild that
vendored a partial subset of this precise external revision**. This matters for
every comparison below — there is no "which version is real" ambiguity. The
external tree is the *fuller* expression of the *same* locked truth the local
canon already trusts.

**Every named authority file exists in the external tree.** All authority
documents the prior harvest referenced (or inferred) are present and were read
or inventoried at this HEAD, including:

- `docs/PROTOCOL_KNOWLEDGE_INDEX.md` (master domain map)
- `docs/PROTOCOL_ORGANISM_GRAPH.md` (canonical module relationship map)
- `docs/MODULE_INTEGRATION_STANDARD.md` (canonical architecture/intake standard)
- `docs/SYNDICATE_OPERATING_SYSTEM.md` (the engine + Seat object model)
- `docs/MASTER_COMPLETION_PASS_REMAINING_WORK_MAP.md` (status ledger)
- `docs/whitepaper/WHITEPAPER_EXTRACTION_MAP.md` (whitepaper assembly source map)
- `docs/canon/00…09` (the constitutional canon layers)
- `apps/product-os-studio/docs/PRODUCTION_BOUNDARY.md`
- `apps/product-os-studio/docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`
- `apps/product-os-studio/docs/STUDIO_ACTION_TOOLKIT_MAP.md`

**Workspace remote note:** the local workspace's own git remote is a
gitsafe-backup only; it does not point at this external repo. The external repo
was reached by an explicit clone to `/tmp`, never wired into the workspace.

---

## 3. Protocol Intelligence-Map Material — Found, With An Important Caveat

**Found: yes — but the two *named* intelligence files are prompts, not reports.**

The two specifically-named "intelligence" artifacts (the scalability audit and
the economic-reality audit) exist in the external tree, but on reading them they
are **audit *prompt templates / question frameworks*** — the founder's
structured request for an analysis — **not the filled-in answers**. They are
strategically valuable because they reveal the founder's *intent and the
questions that matter*, but they must never be treated as settled findings or
(worse) as live protocol facts. Several of them rehearse speculative
reward/booster/commission framings as *questions to be tested*; lifting that
language as if it were product truth would directly violate the forbidden-copy
doctrine.

**Where the actual synthesis lives.** The real, consolidated "intelligence map"
is not one file — it is a layered system:

- `docs/PROTOCOL_KNOWLEDGE_INDEX.md` is the **front door / master domain map** —
  the closest single thing to a canonical intelligence map.
- `docs/canon/00…09` are the **constitutional layers** (source-of-truth tables,
  doctrine, the 5-layer model, the Adjacency Law, the money/signal guardrail).
- `docs/PROTOCOL_ORGANISM_GRAPH.md` + `docs/MODULE_INTEGRATION_STANDARD.md` are
  the **relationship + intake standards** that bind modules together.
- A runtime knowledge surface also exists upstream (a protocol-knowledge map
  module and `/knowledge-map` + protocol-intelligence lab routes), i.e. the
  intelligence map is partly *productized* in the live app, not only in docs.

**Net:** intelligence-map material is abundant and high quality. The trap is
that the *named* files are questions; the *answers* are distributed across the
knowledge index, the canon, and the graph/standard pair. Any 2.18J work should
quote the canon/index/graph, and treat the two named audit files only as a
**prioritized question list**, never as a source of claims.

---

## 4. Top 10 External Capabilities (real, by name, with honest status)

Statuses below are taken from the external `PROTOCOL_KNOWLEDGE_INDEX`,
`PROTOCOL_ORGANISM_GRAPH` truth table, and `MASTER_COMPLETION_PASS` ledger.
"LIVE" = the upstream production app, **not** this workspace. Nothing here is
live in the local workspace.

1. **MembershipSaleV3 (seat acquisition engine).** LIVE direct-buy target,
   funded, owner-accepted. Buy SYN with USDC; public/default path uses the
   zero-source id only. Emits a rich `MembershipPurchasedV3` receipt (gross,
   acquisition cost, net routed, Vault/Liquidity/Operations split 70/20/10, SYN
   delivered, era, chapter, source fields, caps, first-seat flag, version).
   *This receipt is the spine the whole read model hangs off.*

2. **Holder Index (derived identity model).** LIVE. Reconstructs member number,
   chapter, rank, and seat identity from purchase-event scans — identity is
   derived from on-chain history, not from UI memory. Feeds Seat Passport and
   My Syndicate.

3. **Activity (protocol heartbeat read model).** LIVE. Centralized
   event parsing/classification (`protocol-events` + event registry) that powers
   a live activity feed and metrics, and proposes Chronicle candidates.

4. **My Syndicate (member home / cockpit).** LIVE. Member-facing home that
   summarizes seat, receipts, contribution depth, and surfaces *pending* future
   modules as explicitly PENDING (never as live).

5. **Institutional Register + Transparency/Economy.** LIVE proof surfaces.
   Register preserves durable on-chain truth; Transparency renders routed funds,
   the 3-stream revenue registry (membership 70/20/10, archive mints, LP fees),
   and treasury/LP reads.

6. **Archive1155 (protocol memory / artifacts).** LIVE but **not source-aware**.
   Two active mint paths (a "first signal" ID and a "patron seal" ID); other IDs
   reserved/gated/unconfigured. Mints are memory objects, explicitly *not* seats
   and *not* commissionable today.

7. **SourceRegistryV1 (source/attribution policy layer).** DEPLOYED,
   owner-accepted, with exactly **one internal source record in a PAUSED state**.
   Stores source terms/status/payout-wallet/metadata; it is *policy
   infrastructure*, not a payment router, and public buys do not use it.

8. **Verified Introduction / Referral (source-aware growth layer).** Direction
   **approved**, launch **not** approved. The public referral route is
   PENDING / noindex / read-only. A claim UI for source escrow exists in concept
   but is INACTIVE (no public route/action).

9. **Chronicle (curated institutional history).** PARTIAL. A small set of locked
   curated entries plus a derivation pipeline that lands *drafts* — never
   auto-publishes. Encodes the rule that routine accounting is not history.

10. **Proof-of-Fire / SYN burn proof.** LIVE as a one-off, manual, verifiable
    burn-to-dead-address event (a named first burn proof). There is **no**
    automated burn mechanism; it is recorded as memory/transparency, never as a
    yield or buyback promise.

*Honorable mentions / explicitly FUTURE (not built):* SeatRecord721 identity,
SwapRail/bridge, ProductSaleRouter, premium/pass sales, marketplace, Archive
sale wrapper / Archive1155 V2. CommissionRouterV1 and SyndicateSaleV2 exist in
the contracts tree but are **not** the active V3 source engine.

---

## 5. Biggest Local-vs-External Gaps

The local workspace is a deliberately read-only, proof-first foundation; the
external repo is the rich production protocol. The honest framing: **neither is
automatically superior** — the local app is cleaner and safer, the external app
is far more capable but carries real money/chain/legal weight. The gaps that
matter for planning:

1. **Receipt-driven read model (largest gap).** The external app's entire
   identity/activity/transparency surface is *derived from one canonical receipt
   schema* (`MembershipPurchasedV3`) parsed once and fanned out. The local app
   has none of this machinery — no event scanning, no holder index, no activity
   read model. This is the single biggest capability delta.

2. **Source attribution architecture.** The external repo has a fully designed
   policy layer (SourceRegistryV1), a paused internal source record, an
   activation-ceremony lifecycle, and explicit non-edges (a source never owns a
   member; Archive is never source-aware). The local app has only the *concept*,
   with nothing wired.

3. **Module integration discipline.** The external repo enforces an
   anti-fragmentation intake (`MODULE_INTEGRATION_STANDARD`) + a relationship
   graph (`PROTOCOL_ORGANISM_GRAPH`) before any module is built. The local app
   has its config spine and truth-labels but not this formal module taxonomy /
   manifest standard.

4. **Object model depth.** External `SYNDICATE_OPERATING_SYSTEM` defines a
   unified Seat object and an engine model richer than the local 8-layer framing
   (see §7). The local app summarizes; the external app fully specifies.

5. **Productized knowledge/intelligence map.** External ships a runtime
   knowledge-map module and intelligence-lab routes; local has docs/config only.

6. **The Studio mirror is simulated upstream too.** Crucially, the external
   `apps/product-os-studio` is itself a **SIMULATED** mirror (mock data,
   localStorage roles) gated by a strict `PRODUCTION_BOUNDARY` ("simulation, not
   authority"). So the local Studio OS is *correctly* read-only — the gap is not
   "local Studio is fake," it's that the external one has a documented **adapter
   seam plan** (`STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP`) for one day
   pointing those same surfaces at real adapters. The local app lacks that
   seam plan, not the honesty.

---

## 6. Adapt / Copy / Defer / Discard

Classified by truth-safety and usefulness, **not** by which repo "wins." Nothing
here is an instruction to implement — it is the recommended disposition for when
2.18J is explicitly authorized.

**Adapt (safe to bring as architecture/IA, with truth-labels, no live data):**
- The **module manifest + intake standard** discipline (classify before code).
- The **organism-graph relationship model** as a planning reference for any
  future surface (which contract is source of truth, which receipt proves it,
  which read models consume it, which non-edges must never be implied).
- The **adapter-seam framing** for Studio OS (WalletAdapter, MembershipSale,
  MemberIndex, Activity, SourcePolicy, Archive, BurnProof, Transparency) — as
  *interfaces awaiting real sources*, rendered with `TruthLabel`/NOT_WIRED.
- The **Seat object model + engine vocabulary** to deepen the local OS framing.

**Copy (text/structure only, re-verified against canon, never as live values):**
- The **canon layers** (`docs/canon/00…09`) and `PROTOCOL_KNOWLEDGE_INDEX`
  structure as the authoritative explanatory backbone.
- The **whitepaper extraction map's claim/source/disclaimer discipline** —
  especially the legal-exclusions framing and "code outranks docs" precedence.
- The **status vocabulary** (LIVE / DEPLOYED-PAUSED / PARTIAL / PENDING / FUTURE
  / INACTIVE) to replace ad-hoc local status literals.

**Defer (real value, but blocked until a verified real source + approval):**
- Anything reading the chain: holder index, activity scans, archive mint scans,
  transparency reads. Architecturally desirable, but these are *live data* and
  must stay NOT_WIRED until a founder-approved real source exists.
- Source attribution / Verified Introduction surfaces (direction approved,
  launch not approved upstream — must remain PENDING/read-only locally too).

**Discard (do not bring across):**
- The two named **audit-prompt files as if they were findings** — use only as a
  question list (see §3).
- Any **reward/booster/commission/yield speculation** language they contain
  (forbidden copy).
- Real **addresses, tx hashes, member identifiers** present in the external
  Studio porting map and contracts — never copy; refer by name only.
- The external Studio's **mock data / localStorage role simulation** as anything
  resembling live authority.

---

## 7. New OS Layers / Models Surfaced (not in the prior 2.18I map)

The prior harvest used an 8-layer framing. The external authority docs reveal a
richer, more precise model that 2.18J planning should adopt as *vocabulary*
(not as live features):

- **Engine model (`SYNDICATE_OPERATING_SYSTEM`).** The protocol is framed as a
  set of engines (story/identity/wallet/collector/community/referral/
  progression/reputation/governance) over a single **unified Seat object**, with
  governance and reputation explicitly recognition-only. Deeper than the local
  layer list.
- **Organism graph node/edge typing (`PROTOCOL_ORGANISM_GRAPH`).** Formal node
  types (contract / module / route / receipt-event / read-model / doctrine /
  treasury / source-policy / activation-ceremony / future-module) and edge types
  (reads / writes / emits / caches / renders / routes-funds / requires-approval
  / activates / blocks / **must-not-imply**). The "must-not-imply" non-edges are
  a doctrine-grade tool the local app should reuse.
- **Module taxonomy + manifest (`MODULE_INTEGRATION_STANDARD`).** A 12-type
  module taxonomy and a `SyndicateModuleManifest` shape (lifecycleStatus,
  publicStatus, payment path, source-attribution posture, receipt schema,
  read-model consumers, legal/risk status, activation ceremony, prohibited
  claims). This is the missing formal layer between the local config spine and
  real modules.
- **Commerce/attribution layering (Policy → Product-Sale → Receipt → Read-Model
  → UX → Legal → SEO).** A clean separation the local app has only implicitly.

These are **planning models / vocabulary**, not features to build now.

---

## 8. What Must Feed Slice 2.18J

When 2.18J is explicitly authorized, it should ingest — as **authority and
planning input only** — the following, in priority order:

1. `docs/PROTOCOL_KNOWLEDGE_INDEX.md` — the master domain map (front door).
2. `docs/canon/00…09` — constitutional layers (source-of-truth tables,
   doctrine, money/signal guardrail, Adjacency Law).
3. `docs/PROTOCOL_ORGANISM_GRAPH.md` + `docs/MODULE_INTEGRATION_STANDARD.md` —
   the relationship + intake standards (use the must-not-imply non-edges and the
   manifest shape directly).
4. `docs/SYNDICATE_OPERATING_SYSTEM.md` — the Seat object + engine vocabulary.
5. `docs/MASTER_COMPLETION_PASS_REMAINING_WORK_MAP.md` — the DONE/PARTIAL/TODO/
   FUTURE ledger, to keep local status labels honest.
6. `docs/whitepaper/WHITEPAPER_EXTRACTION_MAP.md` — claim/source/disclaimer
   discipline + legal exclusions.
7. `apps/product-os-studio/docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`
   + `STUDIO_ACTION_TOOLKIT_MAP.md` + `PRODUCTION_BOUNDARY.md` — the adapter-seam
   plan and the simulation-not-authority boundary (the single most directly
   reusable artifact for the local Studio OS).
8. The two named audit-prompt files — **as a question list only**, never as
   findings or copy.

2.18J must carry forward these **hard constraints**: refer to all contracts/
wallets/records/members **by name only**; keep everything **NOT_WIRED /
TruthLabel** until a verified real source + founder approval exist; never import
addresses/tx/PII; never adopt forbidden reward/yield/commission framing; treat
the local Studio as read-only simulation exactly as the upstream Studio is.

---

## 9. Is 2.18J Safe To Start?

**Yes — the external harvest is complete and 2.18J is safe to begin, as a
report/planning/architecture slice under the same read-only doctrine.**

Rationale:

- External access succeeded; the exact authority revision is known and is the
  *same locked commit* the local canon already trusts — no provenance ambiguity.
- All named authority files were located and the key ones read; the intelligence
  material is well understood (including the prompt-vs-report caveat).
- The capability inventory, gap analysis, and disposition (adapt/copy/defer/
  discard) are established, so 2.18J has a concrete, evidence-grounded input set.
- The hard guardrails are explicit and unchanged: 2.18J stays read-only,
  name-only, NOT_WIRED, no contracts/chain/payments/activation, no forbidden
  copy.

**Safe to start — explicitly NOT yet started.** This addendum does not begin,
scaffold, or pre-author 2.18J. Beginning 2.18J (and any later move from
report → architecture → wiring) remains gated behind explicit founder approval
and, for any live value, a verified real source.

---

*End of addendum. No further action taken: no implementation, no commit, no
publish, no 2.18J start, and no edits to product, config, memory, or index
files.*
