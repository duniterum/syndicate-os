<!-- Phase 1 Ledger — Slices 2.10 → 2.16 (created in Slice 2.16A) -->

# Phase 1 Ledger — Slices 2.10 → 2.16

> **Purpose:** a single factual record of Phase 1 read-model / verification slices.
> It consolidates the slices that produced **code/CLI deliverables without a
> standalone markdown report** (2.11, 2.11A, 2.13), so no separate per-slice docs
> are needed for those. Factual only — no promotion copy, no new scope.
>
> **Posture unchanged:** the product remains a read-only, proof-first foundation.
> `/api/source-status` is `POSTURE_ONLY` (all values `null`). No live values are
> surfaced. The verification CLIs are internal (`scripts/`-only) and are never
> reachable as routes.

## Slice ledger

| Slice | Deliverable | Files / area | Verification | Status | Limitations | Next dependency |
| --- | --- | --- | --- | --- | --- | --- |
| **2.10** Readiness map | `docs/phase1-slice-2.10-readiness-map.md` | docs (planning) | reviewed / accepted | Accepted | Planning-only; no code | 2.11 |
| **2.11** Live-read skeleton | `scripts/avalanche-live-read-check.ts` (+ `.guard.ts`) | api-server `scripts/` | `live-read:guard` PASS; `live-read:check` OK (8/8 contracts have on-chain code) | Accepted (no md report — see this ledger) | Existence proof only (`eth_getCode`/`eth_call`/`eth_chainId`); **no values surfaced**; fail-closed | 2.12 |
| **2.11A** Provenance patch | `canon/the-syndicate/PROVENANCE.md` + runtime shim in `contracts/syndicate-config.ts` | api-server canon | `verify:canon` PASS | Accepted (no md report — see this ledger) | Documents pinned upstream SHA + `tsx`/Node `import.meta.env` shim; "source-equivalent with a documented runtime shim" (no false byte-for-byte claim) | 2.12 |
| **2.12** Read-model reconciliation | `docs/phase1-slice-2.12-readmodel-reconciliation.md` | docs (planning) | reviewed / accepted | Accepted | Planning/reconciliation only | 2.13 |
| **2.13** Token-metadata CLI | `scripts/avalanche-token-metadata-check.ts` (+ `.guard.ts`) | api-server `scripts/` | `token-metadata:guard` PASS; `token-metadata:check` OK (2/2 tokens safe, no canon mismatch) | Accepted (no md report — see this ledger) | Reads `name`/`symbol`/`decimals` only; **no values surfaced**; fail-closed | 2.14 |
| **2.14** Archive posture + future-surface inventory | `docs/phase1-slice-2.14-archive-posture-and-future-surface-inventory.md` + `scripts/avalanche-archive-posture-check.ts` (+ `.guard.ts`) | docs + api-server `scripts/` | `archive-posture:guard` PASS; `archive-posture:check` OK (8/9 artifacts safe, no ABI drift) | Accepted | Posture-only; archive id 9 `NOT_CONFIGURED` (fails closed) | 2.15 |
| **2.15** Reference systems reconciliation | `docs/phase1-slice-2.15-reference-systems-reconciliation.md` | docs | reviewed / accepted | Accepted | Supa-Exchange / entity-chain / Boost are **reference-only**, never canon | 2.16 |
| **2.16** Integrity audit + production readiness gate | `docs/phase1-slice-2.16-integrity-audit-readiness-gate.md` | docs (audit) | architect-passed; full battery green | Accepted — **READY_AFTER_MINOR_CLEANUP** | No BLOCKER/MAJOR; internal preview OK, **public promotion blocked** | 2.16A |
| **2.16A** Targeted cleanup / audit remediation | this ledger + `app.ts` CORS allowlist + JSON `/api/*` 404 + removed unused body parsers + restored authored `opengraph.jpg` | api-server `src/app.ts`, `docs/`, `studio/public/opengraph.jpg` | typechecks + guards + smoke (see slice report) | (current slice) | Cleanup only; no new product surface, no payload change | 2.17 (gated on founder decisions) |

## Supersession notes (A5)

Older planning reports recommended a "next slice" that has since been completed.
Per the cleanup scope, the old reports are **not** edited; the corrections are
recorded here instead:

- **2.10** recommended a "minimal, internal-only server-side read adapter" →
  **superseded / completed by Slice 2.11** (live-read skeleton).
- **2.12** recommended a "minimal, internal, read-only Token-Metadata + Contract
  posture extension" → **superseded / completed by Slice 2.13** (token-metadata CLI)
  and Slice 2.14 (archive posture).
- The current authoritative sequence is: **2.16 audit → 2.16A cleanup (this) →
  2.17 Registry↔Chain Reconciliation** (internal CLI-only; gated on founder
  decisions). Slice 2.15's "next = 2.16" note was correct and is not superseded.

## Documented deferrals / hardening notes

- **A6 — SPA `200` for unknown client paths:** the studio dev server returns `200`
  with `index.html` for unknown client routes (standard SPA history fallback; the
  client renders a NotFound view). Left unchanged this slice — acceptable dev-SPA
  behavior; a real server/router 404 is a later routing-hardening item, not changed
  here to avoid risking working routes.
- **A2 — CORS production env decision:** the api-server now allows no-origin
  requests, an allowlist auto-built from `REPLIT_DOMAINS` + `REPLIT_DEV_DOMAIN`, an
  optional operator-set `CORS_ALLOWED_ORIGINS` (comma-separated full origins), and
  localhost origins in non-production. **Remaining production decision:** if the app
  is later promoted on a custom domain not present in `REPLIT_DOMAINS`, set
  `CORS_ALLOWED_ORIGINS` to that origin before public promotion. No credentials/
  cookies are enabled.
- **A7 — body parsers:** the unused `express.json()` / `express.urlencoded()`
  middleware was removed. The API is GET-only and no current or near-term route
  consumes a request body (the only new handler added this slice is the JSON 404,
  which reads no body). Re-add if a future write route is introduced.
- **A3 — JSON 404:** unknown `/api/*` routes now return `404 { "error":
  "not_found" }` (JSON), scoped to `/api` so the studio SPA fallback is unaffected;
  `/api/healthz` and `/api/source-status` are untouched.
- **A1 — `opengraph.jpg`:** the environment-induced binary churn (introduced by a
  dev-server restart and swept into the prior checkpoint commit) was reverted to the
  last **authored** version. No new image was created and no branding was
  regenerated.
