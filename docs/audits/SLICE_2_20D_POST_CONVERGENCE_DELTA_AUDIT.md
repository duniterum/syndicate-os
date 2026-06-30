# Slice 2.20D — Post-Convergence Delta Audit

> READ-ONLY / REPORT-ONLY. This document verifies whether the convergence work in
> **2.20B** (`chore: converge status posture vocabulary`) and **2.20C**
> (`chore: align source-status API contract`) actually closed the high-priority
> findings raised by the **2.20A** whole-system organism audit. It implements
> **nothing**: no source/UI/API/route/canon change, no package/lockfile change, no
> dependency, no live data, no adapter, no indexer, no auth/admin/member behavior,
> no live chain read, no transaction, no deploy, and no repo-visibility change. The
> only file added by this slice is this report (plus one short README pointer to it).

| Field | Value |
|---|---|
| Slice | 2.20D — Post-Convergence Delta Audit |
| Mode | READ-ONLY / REPORT-ONLY (docs-only) |
| Repo (authority) | `https://github.com/duniterum/syndicate-os` (private) |
| Branch | `main` |
| HEAD audited | `404b99b261e2fe1f4609dc82878bba7293dcc1d2` |
| Working copy | fresh clone into `/tmp` (verified remote, branch, HEAD, visibility) |
| Audit date | 2026-06-30 |

---

## 1. Executive Verdict

- **Delta status:** **CONVERGENCE CONFIRMED.** Every **HIGH** and **MEDIUM** finding
  from 2.20A (R1, R2, R3, R4) is closed, and one LOW doc finding (R5) is closed.
  The posture-bearing source-status and badge surfaces now **type-conform**
  (compile-time) to the canonical `@workspace/os-contracts` `SourcePosture`: the API
  canon carries a `Posture extends SourcePosture` assertion and `PostureBadge` is
  typed `NonLivePosture`. The studio `TruthStatus` remains a granular **reason-code**
  layer with a canonical `truthStatusToPosture` projection that is **defined but not
  yet rendered through**. The one dynamic endpoint (`/api/source-status`) is now inside
  the OpenAPI contract-first pipeline (server-validated; client-side runtime
  validation remains a LOW hardening residual).
- **Readiness classification:** **`READY_FOR_NEXT_IMPLEMENTATION`.** The structural
  debt 2.20A flagged (posture-vocabulary fragmentation + the off-contract endpoint)
  is resolved. Only LOW / deferred items remain (R6 SEO pre-deploy posture, R7
  `post-merge` `db push`, R8 confidence/authority axis), none blocking.
- **One-paragraph summary:** 2.20A classified the foundation `READY_FOR_TARGETED_REPAIRS`
  and prescribed an ordered sequence (S1 studio binding → S2 API/Badge convergence →
  S3 OpenAPI adoption → S4 docs/ops → S5 adapter stubs). 2.20B executed S1+S2 and the
  S5-adjacent README precision (S-doc); 2.20C executed S3. This delta audit re-cloned
  the repo at the approved HEAD, re-ran every safe gate (all green), and traced each
  2.20A risk to its closing change. The targeted repairs landed cleanly with no
  scope creep into data wiring, payload shape, canon values, or visibility. The
  remaining work is the small, founder-gated S4 docs/ops patch (R7 + R8), with R6
  correctly deferred to pre-deploy.

---

## 2. Scope & Method

- **What this audit checks:** whether 2.20B + 2.20C closed the 2.20A risk register
  (R1–R8), nothing more. It does not re-audit the whole system from scratch (2.20A
  remains the baseline); it is a **delta** against that baseline.
- **Authority chain:** 2.20A audit (`docs/audits/SLICE_2_20A_…`) → its §13 Risk
  Register and §14 Recommended Sequence are the closure checklist used here.
- **Commit map (verified in the fresh clone):**

  | Slice | Commit | Subject | Maps to 2.20A sequence |
  |---|---|---|---|
  | SourcePosture contract | `79cc496` | `types: add source posture contracts` | (pre-2.20A canon) |
  | 2.20A | `418df4e` | `docs: add whole-system organism audit` | baseline |
  | 2.20B | `ea429a4` | `chore: converge status posture vocabulary` | S1 + S2 (+ R5 doc) |
  | 2.20C | `404b99b` (HEAD) | `chore: align source-status API contract` | S3 |

- **Method:** fresh `git clone` into `/tmp`; verified `remote = duniterum/syndicate-os`
  (not the public TheSyndicate), `private = true` (GitHub API), `branch = main`,
  `HEAD = 404b99b…` (matches the approved starting HEAD; no unapproved advance);
  `pnpm install --frozen-lockfile`; re-ran the safe gate set; read each changed file
  and traced it to the finding it closes.

---

## 3. Verification Health

| # | Command | Result | Notes |
|---|---|---|---|
| A1 | `pnpm install --frozen-lockfile` | **PASS** (~64s) | Lockfile honored; no drift. |
| A2 | `pnpm run typecheck` | **PASS** (exit 0) | Libs built, then all 3 leaf artifacts + scripts typecheck clean. |
| A3 | `pnpm --filter @workspace/api-server run build` | **PASS** (exit 0) | esbuild bundle (~0.8s); canon dir excluded from program & bundle. |
| A4 | `pnpm --filter @workspace/api-server run verify:canon` | **PASS** (33/33) | Posture distribution `{READ_ONLY_PROOF:5, NOT_WIRED:7, FUTURE:7, VERIFIED_SOURCE_PENDING_ADAPTER:1}` over the exact 20-category set. |
| A5 | `git status --porcelain` | **clean** | Working tree matches HEAD before this report was added. |
| A6 | `git diff --check` | **clean** | No whitespace/conflict markers in the working tree. |
| A7 | `live-read:check` / `token-metadata:check` / `archive-posture:check` | **SKIPPED** | Require live Avalanche RPC; doctrine forbids live chain reads in this slice (read-only scripts, fenced out of program/bundle, on no gate). |

**Note on generated-file EOF artifact (cosmetic, not a finding):** the orval-generated
files carry trailing blank line(s) at EOF (an orval 8.18.0 formatting artifact). On a
clean checkout `git diff --check` is clean; the artifact only resurfaces as a benign
EOF warning if the contract is regenerated. No action required.

**Verdict:** verification health is **green**; safe to record this docs-only report.

---

## 4. 2.20A Finding-Closure Matrix

| ID | Sev (2.20A) | Finding | Closed by | Status | Evidence in clone |
|---|---|---|---|---|---|
| R1 | HIGH | `os-contracts` `SourcePosture` is the canon but no code conforms; 3+ posture vocabularies diverge | 2.20B | **CLOSED** | API canon, studio reason-code map, and `PostureBadge` all type-conform to `SourcePosture`; single vocabulary (details §5.1). |
| R2 | HIGH | `/source-status` consumed via raw `fetch` + hand-duplicated client types; only `/healthz` in OpenAPI | 2.20C | **CLOSED** (1 minor residual) | `openapi.yaml` now defines `/source-status`; studio uses generated `useGetSourceStatus` + generated `SourceStatusItem`; server route does `GetSourceStatusResponse.parse(...)` (details §5.2). |
| R3 | MEDIUM | `EXTERNAL` had no `SourcePosture` home; `NOT_LIVE`/`ADAPTER_REQUIRED` mappings unencoded | 2.20B | **CLOSED** | `EXTERNAL` retired from runtime; `NOT_LIVE`→`NOT_WIRED` and `ADAPTER_REQUIRED`→`VERIFIED_SOURCE_PENDING_ADAPTER` encoded; guard forbids retired literals (details §5.3). |
| R4 | MEDIUM | Duplicate 6-value `Posture` enum in API and studio | 2.20B | **CLOSED** | API now declares the 4-value public-display subset with a compile-time conformance assertion to `SourcePosture`; `PostureBadge` is typed `NonLivePosture` from the contract — no hand-duplicated enum (details §5.1). |
| R5 | LOW | `README` still listed bare `LIVE` posture | 2.20B | **CLOSED** | README posture line now lists the canonical 7-state set and states "Never claim a bare `LIVE` posture." |
| R6 | LOW (DEFER) | Canonical origin + sitemap/robots + `index, follow` pinned to `thesyndicate.money` while repo is private/undeployed | — | **OPEN (deferred by design)** | `index.html` still `robots: index, follow`, OG/canonical `https://thesyndicate.money/`; out of 2.20B/2.20C scope → pre-deploy. |
| R7 | LOW (S4/ops) | `post-merge.sh` runs `db push` on an empty schema every merge | — | **OPEN** | `scripts/post-merge.sh` still runs `pnpm --filter db push`; out of 2.20B/2.20C scope → S4. |
| R8 | LOW (S2) | Runtime confidence axis is lowercase + no authority axis vs `os-contracts` separate axes | partial | **OPEN (partial)** | Posture converged, but the payload `confidence` enum is still lowercase `high\|medium\|low` and `SourceConfidence`/`SourceAuthority` are unused at runtime → fold into S4. |

**Net:** all HIGH (R1, R2) and MEDIUM (R3, R4) closed; one LOW (R5) closed; three LOW
remain (R6/R7/R8 — two deferred-by-design, one partial). **No blocker-severity items.**

---

## 5. Convergence Verification Detail

### 5.1 Posture vocabulary — one canon (R1, R4)

- **Single source of truth:** `lib/os-contracts/src/source-boundary.ts` defines the
  7-state `SourcePosture` and the derived `NonLivePosture` / `PublicDisplayPosture`
  subsets. It remains **type-only** (the imports that consume it are `import type`,
  erased at build) — which is the intended design for a contracts lib, and is exactly
  how a single vocabulary is enforced without adding runtime code.
- **API canon conforms (R4):** `artifacts/api-server/src/data/sourceStatus.ts`
  declares `Posture` as the **4-value public-display subset**
  (`READ_ONLY_PROOF`, `NOT_WIRED`, `VERIFIED_SOURCE_PENDING_ADAPTER`, `FUTURE`) and
  asserts `Posture extends SourcePosture` at compile time — so any drift off-canon
  stops type-checking. The retired dialect cannot be emitted.
- **Studio badge conforms (R4):** `artifacts/studio/src/components/PostureBadge.tsx`
  types its prop as `NonLivePosture` imported from `@workspace/os-contracts` — the
  prior independent 6-value enum is gone; `LIVE_ACTION` is structurally excluded so a
  badge can never imply a write.
- **Studio reason codes bound (R1):** `artifacts/studio/src/config/truthStatus.ts`
  adds `truthStatusToPosture: Record<TruthStatus, SourcePosture>`, mapping each of the
  10 reason codes to a posture (none to `LIVE_ACTION`). The map is **defined and
  available**; it is the canonical projection the 2.20A S1 step prescribed.
  *Honest scope note:* the map is not yet consumed by a renderer — TruthLabel display
  meaning is unchanged — which is correct for a type-level binding slice (no UI
  change was in scope). The convergence is real at the contract/type level.
- **Guard reflects the canon:** `verify-canon-integrity.ts` now allows only the
  4-value subset and explicitly **forbids** the retired `ADAPTER_REQUIRED` / `NOT_LIVE`
  literals in the serialized payload, and asserts the exact posture counts.

### 5.2 Contract-first endpoint (R2)

- `lib/api-spec/openapi.yaml` now defines `getSourceStatus` (`/source-status`) with a
  full `SourceStatusResponse` / `SourceStatusItem` schema (posture enum = the 4-value
  subset; `value: "null"`; `expectedChainId` enum `43114`).
- Generated outputs exist and are consumed: `@workspace/api-client-react` exports
  `useGetSourceStatus` + `SourceStatusItem`; `artifacts/studio/src/pages/SystemStatus.tsx`
  uses the generated hook and generated item type — **no** hand-duplicated interface
  and **no** raw `fetch` remain.
- Server route `artifacts/api-server/src/routes/sourceStatus.ts` validates with
  `GetSourceStatusResponse.parse(...)` from `@workspace/api-zod`.
- **Minor residual (does not reopen R2):** the generated react-query client
  (`getSourceStatus`) returns typed data via `customFetch` **without** running the
  generated zod schema at runtime on the client. The primary 2.20A concern — manual
  type drift from hand-copied interfaces — is fully eliminated, and the server
  validates the payload; client-side runtime validation is an optional hardening that
  can be folded into a later slice.

### 5.3 Alias resolution (R3)

- `EXTERNAL` is **retired** from all runtime posture vocabularies — **no runtime
  posture value emits `EXTERNAL`**. The remaining `EXTERNAL`/retired-dialect tokens in
  the tree are non-emitting references only: explanatory comments in `sourceStatus.ts`,
  the guard's forbidden-list literals in `verify-canon-integrity.ts`, and audit prose —
  plus an unrelated `EXTERNAL_URI` metadata enum value in a vendored, server-side-only
  NFT ABI (not a posture).
- `os-contracts` documents the deprecated aliases as types
  (`ADAPTER_REQUIRED → VERIFIED_SOURCE_PENDING_ADAPTER`,
  `LIVE`/`LIVE_READ → READ_ONLY_PROOF`); the studio map encodes `NOT_LIVE → NOT_WIRED`.
- The single former `NOT_LIVE` category (`sale`) is now
  `VERIFIED_SOURCE_PENDING_ADAPTER` (it carries a verified, vendored sale ABI with no
  live adapter wired) — verified by `verify:canon`.

---

## 6. Remaining Highest Risks (post-convergence)

All remaining items are **LOW**; none block further implementation.

1. **R8 — Confidence/authority axis (partial S2).** The payload `confidence` axis is
   still lowercase `high|medium|low` and the `SourceConfidence`/`SourceAuthority`
   axes from `os-contracts` are unused at runtime. This is the only remaining
   *vocabulary-convergence* remnant; highest-value of the three to close.
2. **R7 — `post-merge` `db push`.** `scripts/post-merge.sh` still runs
   `pnpm --filter db push` against an empty schema on every merge — couples merges to
   a reachable `DATABASE_URL` for no current benefit. Ops-only; gate on a non-empty
   schema or document the expectation.
3. **R6 — SEO publish posture (deferred).** Canonical origin / sitemap / robots are
   pinned to `thesyndicate.money` with `index, follow` while the repo is private and
   undeployed. Harmless while unpushed; confirm domain ownership and intended index
   posture **before any public deploy**. Correctly out of convergence scope.

No secrets, PII, full addresses, or fake-live data were found in any served code or
public payload during this delta pass (consistent with 2.20A §7); the public
`/api/source-status` payload remains posture-only with every `value` null and a
fail-closed startup guard.

---

## 7. Readiness Classification

**`READY_FOR_NEXT_IMPLEMENTATION`.**

- Not `READY_FOR_TARGETED_REPAIRS` any longer: the targeted repairs 2.20A prescribed
  (S1/S2/S3) are landed and verified; the posture canon is singular and the endpoint
  is contract-first.
- Not `NEEDS_ARCHITECTURE_REPAIR_FIRST` / `NEEDS_SECURITY_REPAIR_FIRST` / `BLOCKED`:
  every gate is green, the security/privacy posture is unchanged and clean, and only
  LOW / deferred items remain.

---

## 8. Recommended Next Slice (ONE)

**Slice 2.20E — Docs/Ops Precision & Axis Convergence (2.20A "S4").**

- **Goal:** close the last two non-deferred LOW items in one small, founder-gated,
  no-data-wiring slice.
  - **R8:** converge the runtime confidence axis onto `os-contracts` `SourceConfidence`
    (decide casing) and decide whether to surface a `SourceAuthority` value — type /
    contract level only (payload `value`s stay `null`; the 20-category set is
    unchanged; regenerate the OpenAPI client/zod if the confidence enum changes).
  - **R7:** gate `post-merge` `db push` on a non-empty schema (or document the
    `DATABASE_URL` expectation).
  - **Optional (LOW hardening, the R2 residual):** add client-side runtime validation
    of the `/source-status` payload via the generated zod schema — only if it folds in
    without widening scope; otherwise defer to a later dedicated hardening item.
- **Allowed changes:** `artifacts/api-server/src/data/sourceStatus.ts` (axis types),
  `lib/api-spec/openapi.yaml` + regenerated outputs (only if confidence casing
  changes), `lib/os-contracts` (axis docs), `scripts/post-merge.sh` (guard only),
  `README.md` (precision).
- **No-touch:** no live data, no adapter/indexer, no `LIVE_ACTION`/write, no payload
  values, no new runtime deps beyond the workspace reference, no deploy, no
  visibility change.
- **Acceptance:** `typecheck` + `build` + `verify:canon` (20 categories, all values
  null) stay green; client/server still agree via the generated contract.
- **Then (later, in order):** 2.20A **S5** adapter interface stubs (type-only,
  `NOT_WIRED`), then the gated member/admin scaffolding — **not** live reads,
  indexers, writes, public deploy, or repo-public, all of which remain founder-gated.
- **Defer:** R6 (SEO publish posture) to a dedicated pre-deploy checklist.

---

## 9. No-Touch Confirmation

- **No source / runtime / API / UI / canon / package / lockfile / dependency / schema
  / workflow change** was made by this slice. The convergence changes audited here
  already exist in 2.20B/2.20C; this slice re-verified them read-only.
- **The only file added is this report**, plus a single one-line README pointer to it
  (docs-only).
- **No live chain read, transaction, deploy/publish, or repo-visibility change** was
  performed. The repository remains **private**.

---

## 10. Final Verdict

The 2.20B + 2.20C convergence **successfully closed every high- and medium-priority
2.20A finding**. The Syndicate OS foundation now type-conforms its source-status and
badge surfaces to a single, compile-time-enforced posture canon (with the studio
`TruthStatus` reason-code layer mapped to it via a defined-but-not-yet-rendered
projection) and serves its one dynamic endpoint through the contract-first pipeline
(server-validated). It is **healthy, honest, safe, and `READY_FOR_NEXT_IMPLEMENTATION`**. The
recommended next step is the small, founder-gated **2.20E docs/ops precision & axis
convergence (S4)** slice; live data, indexers, writes, public deploy, and repo-public
all remain explicitly deferred.
