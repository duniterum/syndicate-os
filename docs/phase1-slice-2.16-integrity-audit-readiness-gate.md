<!-- Phase 1 — Slice 2.16 — Integrity Audit + Production Readiness Gate -->

# Phase 1 — Slice 2.16: Integrity Audit + Production Readiness Gate

> **Posture:** `AUDIT / VERIFICATION / REPORT-ONLY`. No feature, refactor, API, UI,
> route, live-read, or public-payload change was made. No `docs/FAQ/whitepaper`
> finalization. No promotion copy. `/api/source-status` is unchanged
> (`POSTURE_ONLY`). The sole deliverable is **this document**.
>
> **Audit question:** *"If the founder needed to publish a controlled MVP preview
> after this phase, what would block it?"*
>
> **Important:** This audit is **not** approval to publish. Controlled internal
> preview ≠ public promotion.

---

## 1. Executive readiness verdict

**`READY_AFTER_MINOR_CLEANUP`**

The rebuild boots cleanly, serves every current route, and passes the entire
verification battery (4/4 guards, both typechecks, 3/3 live network checks). There
are **no BLOCKER or MAJOR findings**. Everything found is `MINOR` or `CLEANUP`:

- one environment-induced binary churn (`opengraph.jpg` — appears restart-related,
  not an authored edit);
- wide-open CORS on the read-only API (no risk today; a pre-promotion hardening item);
- a few documentation-completeness / staleness notes;
- SPA returns `200` for unknown client paths; unknown `/api/*` returns HTML `404`.

None of these block a **controlled internal preview** (see §19). They are repo-hygiene
and pre-promotion-hardening items, hence "after minor cleanup."

---

## 2. Build / run environment check

| Item | Value |
| --- | --- |
| Node | `v24.13.0` |
| pnpm | `10.26.1` |
| Package manager state | pnpm workspace; root `preinstall` hard-enforces pnpm (rejects npm/yarn) |
| Root scripts | `build`, `typecheck`, `typecheck:libs`, `preinstall` |
| api-server scripts | `dev`, `build` (esbuild `build.mjs`), `start`, `typecheck`, `verify:canon`, `live-read:check`/`:guard`, `token-metadata:check`/`:guard`, `archive-posture:check`/`:guard` |
| studio scripts | `dev`, `build`, `serve`, `typecheck` |
| Missing install/build assumptions | None. api-server `dev` = build→start; studio `dev` = `vite --host`. Verify studio with `typecheck`, not `build` (build needs workflow `PORT`/`BASE_PATH`). |

---

## 3. Clean server restart / app boot

Both web/API workflows were cleanly restarted from the current workspace.

| Service | Port | Result |
| --- | --- | --- |
| `artifacts/api-server: API Server` | `8080` | esbuild build (≈517 ms) → `node dist/index.mjs` → **"Server listening"**. No crash. |
| `artifacts/studio: web` | `18425` | **Vite v7.3.5 ready (≈910 ms)**, serving `/`. No crash. |
| `artifacts/mockup-sandbox` | `8082` | Running (`/__mockup`) — unrelated design sandbox, not part of the product. |

- **No startup crash; no runtime errors in logs.**
- Benign: api-server logs `GET / → 404`. Expected — api-server serves only `/api/*`;
  the shared proxy routes `/` to studio. Not an error.
- Browser console: only Vite connect/HMR messages. No application errors.

---

## 4. HTTP smoke tests (via shared proxy `localhost:80`)

| Route | Status | Content-Type | Serves | Leak? | Forbidden framing? |
| --- | --- | --- | --- | --- | --- |
| `/` | `200` | `text/html` | studio SPA | none | none |
| `/status` | `200` | `text/html` | studio SPA (client route) | none | none |
| `/studio` | `200` | `text/html` | studio SPA | none | none |
| `/proof` | `200` | `text/html` | studio SPA | none | none |
| `/(unknown)` | `200` | `text/html` | SPA fallback → client NotFound | none | none |
| `/api/healthz` | `200` | `application/json` | `{"status":"ok"}` | none | none |
| `/api/source-status` | `200` | `application/json` | `POSTURE_ONLY` payload | none (0x scan empty) | none |
| `/api/(unknown)` | `404` | `text/html` | Express default 404 | none | none |

- No response leaked a raw address or PII (a `0x[40-hex]` scan of served studio +
  the `/api/source-status` body returned **zero** matches).
- Note (MINOR): the SPA returns `200` for unknown client paths (standard SPA
  history-fallback; client renders NotFound). Unknown `/api/*` returns an HTML `404`
  rather than JSON — a cosmetic API-shape inconsistency.

---

## 5. `/api/source-status` contract audit

| Invariant | Expected | Observed | OK |
| --- | --- | --- | --- |
| `mode` | `POSTURE_ONLY` | `POSTURE_ONLY` | ✅ |
| `expectedChainId` | `43114` | `43114` | ✅ |
| Category count | `20` | `20` | ✅ |
| Category values | all `null` | `0` non-null | ✅ |
| Raw addresses | none | none | ✅ |
| PII | none | none | ✅ |
| Live values surfaced | none | none | ✅ |
| Payload shape | unchanged | `asOf`, `generatedBy`, `mode`, `expectedChainId`, `categories` | ✅ |

**No payload-shape or content change since prior slices.**

---

## 6. CLI verification battery

All commands run from `artifacts/api-server`. Exit code `0` = pass.

| Command | Result |
| --- | --- |
| `verify:canon` | **GUARD PASSED** — canon integrity + public payload contract intact |
| `live-read:guard` | **GUARD PASSED** — live-read safety invariants hold |
| `token-metadata:guard` | **GUARD PASSED** — token-metadata safety invariants hold |
| `archive-posture:guard` | **GUARD PASSED** — archive-posture safety invariants hold |
| `typecheck` (api-server) | **clean** |
| `typecheck` (studio) | **clean** |
| `live-read:check` (network) | **OK** — C-Chain `43114` verified; **8/8** target contracts have on-chain code |
| `token-metadata:check` (network) | **OK** — **2/2** tokens returned safe metadata; **no canon mismatch** |
| `archive-posture:check` (network) | **OK** — Archive1155 has code; **8/9** artifacts safe; **no ABI drift** (id 9 not configured) |

**Battery result: 9/9 green.**

---

## 7. Script inventory / broken-script audit

| Script | Exists | Runs | Guard | Internal-only | Prints raw addr? | Fail-closed |
| --- | --- | --- | --- | --- | --- | --- |
| `verify-canon-integrity.ts` | ✅ | ✅ | self-verifying | ✅ (`scripts/`) | No | ✅ |
| `avalanche-live-read-check.ts` | ✅ | ✅ | `.guard.ts` | ✅ | No | ✅ (chainId-first; wrong/unreachable → fail) |
| `avalanche-token-metadata-check.ts` | ✅ | ✅ | `.guard.ts` | ✅ | No | ✅ |
| `avalanche-archive-posture-check.ts` | ✅ | ✅ | `.guard.ts` | ✅ | No | ✅ |

- Each network check has a paired `:guard` that asserts safety invariants
  (first RPC call is always `eth_chainId`; only `eth_chainId`/`eth_getCode`/`eth_call`
  are used; unreachable RPC or wrong chain fails closed; no fabricated values).
- All four are `scripts/`-only (outside `tsc`/served code). None is reachable as a route.

---

## 8. Git diff / repository cleanliness

- `git status`:
  - `M artifacts/studio/public/opengraph.jpg` — **appears environment-induced**, not
    an authored edit. Evidence: mtime `23:18` = the studio workflow restart time;
    studio `vite.config.ts` has **no** image-optimization/write-back plugin; the
    restart reported "Screenshot captured." This is consistent with the platform
    regenerating the preview/OG image on restart (47690 → 47771 bytes); exact
    causality is not proven from the diff. Classified `CLEANUP` (A1).
  - `?? attached_assets/*.txt` ×3 — this turn's founder prompt files (untracked).
- **attached_assets:** tracked in the repo (64 committed + 3 new) but **not served**
  by the app (repo-root `attached_assets/`, not `studio/public/` or `dist/`).
- **agent memory:** `.agents/` (11 tracked files) is separate from served product
  and is not shipped.
- **Temp/debug/leftover files:** none (`.log`/`.bak`/`tmp` scan empty).
- **Accidental source changes:** **none** under `artifacts/**/src` or `lib/**`.
  The working-tree deltas this slice are: this report (the deliverable, untracked),
  the `opengraph.jpg` env-artifact (§8, A1), and the founder's `attached_assets/*`
  (untracked). `.agents/` agent-memory was **not** modified this slice.

---

## 9. Drift audit (slices 2.10 → 2.15)

| Slice | Deliverable | Exists | Hard limits respected | Notes |
| --- | --- | --- | --- | --- |
| 2.10 readiness map | `docs/…-2.10-readiness-map.md` | ✅ | ✅ | — |
| 2.11 live-read skeleton | `scripts/avalanche-live-read-check.ts` (+guard) | ✅ (code) | ✅ | no per-slice doc (code/CLI slice) |
| 2.11A provenance patch | `canon/the-syndicate/PROVENANCE.md` + runtime shim | ✅ (code) | ✅ | no per-slice doc |
| 2.12 read-model reconciliation | `docs/…-2.12-readmodel-reconciliation.md` | ✅ | ✅ | — |
| 2.13 token-metadata CLI | `scripts/avalanche-token-metadata-check.ts` (+guard) | ✅ (code) | ✅ | no per-slice doc |
| 2.14 archive posture + inventory | `docs/…-2.14-…md` + `scripts/avalanche-archive-posture-check.ts` | ✅ | ✅ | — |
| 2.15 reference systems | `docs/…-2.15-reference-systems-reconciliation.md` | ✅ | ✅ | — |

- **No silent promotion:** no internal CLI capability was promoted to a served route
  or into `/api/source-status` (the route serves only the static `POSTURE_ONLY`
  payload).
- **No contradictions:** no later slice contradicts an earlier one.
- **Stale-but-not-wrong recommendations** (`CLEANUP`, A5): `2.10` and `2.12` each
  recommend a "next slice" that has since been completed (2.11, 2.13 respectively).
  Correct when written; now historical. `2.15` correctly points to 2.16.
- **Documentation-completeness gap** (`MINOR`, A4): 2.11 / 2.11A / 2.13 have no
  standalone `docs/` report (they were code/CLI slices, verified by guards).

---

## 10. Canon / provenance consistency

- `PROVENANCE.md` pins the upstream commit SHA (`cf4ca34…`) and documents the
  `tsx`/Node **runtime shim** for `import.meta.env` in `syndicate-config.ts`, using
  the wording **"source-equivalent with a documented runtime shim."**
- It distinguishes **verbatim (byte-for-byte)** vs **converted / source-equivalent**
  files. **No false claim of byte-for-byte exactness** where a shim was applied.
- **Supa-Exchange / entity-chain / Boost are never labeled canon** — they are
  reference-only in the master map, the 2.10 readiness map, and the 2.15 report.
- Contract roles/statuses align with the reports; **no raw addresses leak** into
  served studio or `docs/` (0x scan empty). Canon addresses live only in the
  internal `api-server/src/canon/**` (not served, not in the public payload).

---

## 11. Public copy / framing audit

- **No forbidden framing in any served public copy.** Every forbidden-term hit is
  the **denylist definition itself** in `api-server/src/data/sourceStatus.ts`
  (the enforcement list that *rejects* casino/financial framing) — not copy shown
  to users.
- Allowed vocabulary in use: membership, proof, recognition, archive/protocol
  memory, read-only verification, honest "real vs awaiting source" framing.
- **Risky phrases found in served UI copy: none.**

---

## 12. Fake / mock / simulated / placeholder / TODO audit

| Finding | Location | Classification |
| --- | --- | --- |
| `"simulated"`, `"fake live"`, `"SIMULATED"` | `sourceStatus.ts` (denylist + comment) | Acceptable — safety mechanism |
| `"read-only placeholder"`, `"rather than simulated"` | `syndicateFacts.ts` | Acceptable — honest truth-label copy |
| `placeholder="0x…"`, `"Transfer(…)"`, `"Awaiting event parser"` | `ProofStudio.tsx` (all on **disabled** inputs) | Acceptable — non-wired future-tool surface, labelled |
| `"{title} Module Placeholder"` | `PlaceholderPage.tsx` | Acceptable — intentional future-route surface |
| `placeholder="Search proof events…"` | `ProofDashboard.tsx` | Acceptable — input affordance |
| `placeholder:` Tailwind classes | shadcn ui primitives | Acceptable — CSS |

- **No `TODO` / `FIXME` / `mock` / fake-data / `hardcoded` / `lorem` / `demo`** in
  served code. **No blocker / risky-for-public finding.**

---

## 13. Address / PII / raw-wallet leak audit

| Surface | Result |
| --- | --- |
| Served studio (`artifacts/studio`) | **No** raw `0x` address |
| `docs/` reports | **No** raw `0x` address |
| `/api/source-status` body | **No** raw `0x` address |
| Replit/Hermes/agent wording in served UI | **None** |
| Member identities / holder lists / buyer-minter-source-recipient | **None served** |

Classification of where addresses legitimately exist:

- **Canon proof source / internal-only:** `api-server/src/canon/**` (registries, ABIs)
  — not served, not in payload. Correct containment.
- **Founder input:** `attached_assets/*` — tracked but **not served**.
- **Accidental leak:** **none found.**

---

## 14. Route / link consistency

- **Served studio routes (10):** `/`, `/studio`, `/proof`, `/proof-studio`,
  `/member`, `/founder`, `/source`, `/recognition`, `/learning`, `/status` — all
  serve (SPA, `200`).
- **Served API routes (2):** `GET /api/healthz`, `GET /api/source-status`.
- **Promised-future IA** (docs/master map): `/join`, `/token`, `/economy`,
  `/treasury`, `/archive`, `/chronicle`, `/contracts`, `/entities`, `/indexer`,
  `/guardrails`, gated `/exchange` + `x402` — correctly **not served yet**
  (classified promised-future / doc-only / should-not-be-public-yet).
- **Broken links to currently-served routes:** none.
- MINOR (A6): unknown client paths return `200` (SPA fallback) rather than a hard
  server `404` — future redirect/404 handling.

---

## 15. Interconnection audit

- `sourceStatus.ts` exposes **exactly 20 categories**, matching the master operating
  map's 20-category model.
- `live-read` and `token-metadata` scripts source addresses from
  `contract-registry.ts` + `syndicate-config.ts` (single source of truth) — aligned.
- `archive-posture` script's id set aligns with `archive-id-registry.ts`
  (ids 1–8 configured; id 9 `NOT_CONFIGURED` / `configuredOnChain: false`; live
  result fails closed for id 9).
- Reports point to the correct next slice (2.16 → 2.17). **No duplicated/conflicting
  doctrine;** `Posture`/`PublicClass` enums consistent; `MEMBER_DEFINITION` is a
  single source.

---

## 16. Security / secrets / config audit

| Check | Result |
| --- | --- |
| Hardcoded secrets | **None** (scan empty) |
| RPC secret exposure | None — RPC endpoints are **public**, server-side only, with optional env overrides (`AVALANCHE_RPC_URL` / `_FALLBACK` / `_TIMEOUT_MS`); fail-closed on unreachable |
| Vite vs Node env drift | Client (studio) reads only `import.meta.env.BASE_URL`; no server secret reaches the browser |
| CORS | `app.use(cors())` — **wide-open / no origin allowlist** (`app.ts:28`). Low risk today (read-only API, no auth/secrets/PII/mutations). `MINOR` (A2): set an explicit origin policy before public promotion |
| Unused body parsers | `express.json()` + `urlencoded()` enabled though no write route consumes them (`app.ts:29–30`). Harmless. `MINOR` (A7) |
| Admin/founder write surfaces | **None** — API is GET-only; no mutation endpoints |
| Request logging | `pino-http` strips query strings (`url.split("?")[0]`) — no query-param leakage in logs |
| Accidental internal file serving | None — studio serves `dist/public`; `attached_assets` / `.agents` not served |

---

## 17. Production-readiness blocker register

| ID | Severity | Area | Finding | Evidence | Impact | Fix slice | Blocks preview? | Blocks promotion? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | CLEANUP | repo hygiene | `opengraph.jpg` modified — appears environment-induced (restart) | `git status`; mtime 23:18; no vite image plugin | cosmetic OG-image churn | micro-cleanup / rollback | No | No |
| A2 | MINOR | API security | wide-open CORS (no allowlist) | `app.ts:28` | permissive cross-origin to read-only API | pre-promotion hardening | No | Yes (harden first) |
| A3 | MINOR | API ergonomics | unknown `/api/*` → HTML `404`, not JSON | smoke test | inconsistent API error shape | pre-promotion hardening | No | No |
| A4 | MINOR | docs completeness | no per-slice docs for 2.11 / 2.11A / 2.13 | `docs/` listing | weaker paper trail (code+guards exist) | optional ledger doc | No | No |
| A5 | CLEANUP | docs staleness | 2.10 / 2.12 "next slice" recs superseded | drift audit (§9) | historical, not wrong | optional | No | No |
| A6 | MINOR | routing | SPA returns `200` for unknown client paths | smoke test | no hard server 404 | future redirect/404 | No | No |
| A7 | MINOR | middleware | unused `json`/`urlencoded` parsers | `app.ts:29–30` | negligible | pre-promotion hardening | No | No |

**No `BLOCKER` and no `MAJOR` findings.**

---

## 18. Cleanup recommendation (one next step)

**Run a small targeted cleanup slice first, then proceed to Slice 2.17 only after the
§20 founder decisions are answered.**

The cleanup slice is tiny and should be limited to:

1. Revert the `opengraph.jpg` env-artifact (A1) so the working tree is pristine.
2. (Optional, pre-promotion) CORS origin allowlist (A2) + JSON `/api/*` 404 (A3).
3. (Optional) a consolidated Phase-1 ledger doc to close the 2.11/2.11A/2.13 paper-trail gap (A4).

Slice 2.17 (Registry↔Chain Reconciliation, internal CLI-only) remains the approved
next *implementation* step, but it is itself gated on founder decisions (RPC
ownership, etc.). It should **not** start until those are settled.

---

## 19. Publication readiness verdict

- **Can the site be published for controlled internal preview?** **Yes.** It boots
  clean, serves all current routes, leaks nothing, contains no forbidden framing, and
  passes every verification. The §17 items are repo-hygiene / pre-promotion-hardening
  and do not block an internal preview.
- **Can the site be publicly promoted?** **No — not yet.**
- **What must be fixed before public promotion:**
  - Wire real, verified protocol sources per the phased plan (today the app is
    posture-only; all `/api/source-status` values are `null`).
  - CORS origin allowlist (A2); JSON API error shape (A3).
  - Resolve the §20 founder decisions (auth/DB, indexer, PII policy, recognition
    formula, RPC ownership, x402/exchange, archive media).
  - Finalize `docs/FAQ/whitepaper` (founder-approved) and author promotion copy.
- **What must remain hidden / internal:** the four verification CLIs (`scripts/`),
  raw canon addresses, any member/wallet data, the `/exchange` + `x402` surfaces
  (reference-only), and any founder-only operations.

---

## 20. Open founder decisions

1. **RPC secret ownership / timing** — who owns the production RPC endpoint/key, and when.
2. **Auth provider + database** — choice and ownership.
3. **Indexer ownership / design** — who runs it; event-indexing architecture.
4. **Member / PII privacy policy** — what may ever be shown; member-controlled disclosure rules.
5. **Recognition formula** — the canonical definition (founder-owned).
6. **Source / referral policy** — eligibility + disclosure model.
7. **x402 decision** — pursue metered pay-per-use API, or shelve.
8. **Exchange decision** — keep reference-only, or pursue (and how, honestly).
9. **Archive media / URI pipeline** — in scope for MVP, or registry/posture-only.
10. **`docs/FAQ/whitepaper` timing** — when to finalize; single source of truth.

---

## Verification (this slice)

- **No product/served-code change.** No source/route/API/UI/`/api/source-status`/
  canon/live-read/import behavior was changed by this audit. No new feature was
  implemented.
- The git working tree contains: this report (the deliverable), one
  **environment-induced** `opengraph.jpg` change (appears restart-related — see
  §8, A1), and the founder's own `attached_assets/*` inputs. `.agents/` agent-memory
  was **not** modified this slice. **No file under `artifacts/**/src` or `lib/**`
  was edited.**
- `/api/source-status` unchanged: `POSTURE_ONLY`, `expectedChainId` 43114, 20
  categories, all values `null`, no addresses, no PII.
- Command results: 4/4 guards PASS; api-server + studio typechecks clean; 3/3 network
  checks OK (8/8 contracts coded, 2/2 tokens safe, 8/9 archive artifacts safe / no
  drift). Smoke tests: all current routes return expected status/content-type with no
  leak. Servers restarted clean (api 8080, studio 18425).
