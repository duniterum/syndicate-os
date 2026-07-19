# Deploy Readiness Checklist — The Syndicate Studio OS

> **Status: operational artifact, non-served.** This file lives under `docs/` and is
> never bundled into any served build. It does not authorize a publish — publishing
> remains a founder-gated act. It exists so that when a publish IS approved, the
> smoke pass and the rollback path are already written down.

Last reviewed: 2026-07-02 (pre-publish hardening slice).

---

## 1. Pre-publish verification (run in the workspace, before publishing)

All of these must be green on the exact code being published:

- [ ] `pnpm run typecheck` — full workspace typecheck passes.
- [ ] `pnpm --filter @workspace/api-server run auth-zone:guard` — all checks pass
      (includes section 8: production exposure gate).
- [ ] `pnpm --filter @workspace/api-server run protocol-reality:guard` — all checks
      pass (includes 7d: served cache discipline).
- [ ] `pnpm --filter @workspace/api-server run auth-skeleton:test` — all checks pass
      (includes the in-process production-dark gate section).
      Note: wait ≥60s between reruns — the live throttle section shares a
      per-minute bucket and a fast rerun can trip a spurious 429.
- [ ] Remaining guard suite green: `operator-gate:guard`, `access-state:guard`,
      studio guards, and the other api-server guards per `package.json`.
- [ ] Production-default studio build exists and is current
      (`artifacts/studio/dist`), and dist grep is silent for:
      `SYNDICATE_AUTH_ENABLED`, `/api/auth`, `Sign to prove control of this wallet`,
      `privateKeyToAccount`, `syn_session` (auth-zone guard section 6 enforces this).
- [ ] No secrets/config values pasted into code, docs, or reports.

## 2. Environment posture at publish time

- `SYNDICATE_AUTH_ENABLED` — **leave UNSET** for any current publish. The auth zone
  is dark by default in production; `/api/auth/*` answers exactly like an unknown
  route (`404 {"error":"not_found"}`). Setting the flag to the exact string `true`
  is a founder-gated act and requires a re-publish decision, not a hot toggle.
- `AVALANCHE_RPC_URL` — must be present in the deployment environment (the reality
  spine reads it; without it the spine fails closed and `/status` shows unavailable).
- `SESSION_SECRET` — present but unused by the dark zone; keep it set.
- No `VITE_OPERATOR_PREVIEW` in production builds (operator preview routes stay
  code-excluded from the published studio bundle).

## 3. Post-publish smoke pass (run against the production origin)

Replace `ORIGIN` with the production origin (e.g. `https://thesyndicate.money`).

- [ ] `GET ORIGIN/api/healthz` → `200`.
- [ ] `GET ORIGIN/api/protocol/reality` → `200`; body carries `mode`, `asOf`,
      `cached`, `cacheTtlMs: 30000`, and the five groups; **no `0x…40-hex`
      address anywhere in the body**.
- [ ] Repeat the same request within 30s → `200` with `cached: true` and the
      SAME `asOf` (bounded cache is serving).
- [ ] `GET ORIGIN/api/source-status` → `200`.
- [ ] `POST ORIGIN/api/auth/challenge` → `404` with body exactly
      `{"error":"not_found"}` and **no `set-cookie` header** (auth zone dark).
- [ ] `GET ORIGIN/api/auth/session` → `404`, same body, no cookie.
- [ ] `GET ORIGIN/api/definitely-not-a-route` → `404 {"error":"not_found"}`
      (dark auth is indistinguishable from this).
- [ ] `/` renders (public homepage), `/status` renders and the protocol reality
      panel shows values or an honest "unavailable" card — never placeholders.
- [ ] `/os-map` is NOT reachable in production (operator preview excluded).

## 4. Known-benign signals (do NOT treat as incidents)

- A small burst of `/api` 500s in deployment logs at cold start while the first
  protocol-reality read warms up — benign, previously verified.
- `cached: false` on the first reality read after any idle period — expected;
  the cache is success-only and bounded to 30s.
- Static-SPA host quirks on the production host: soft-404s for unknown SPA paths,
  no compression, private cache headers — known platform behavior, not regressions.

## 5. Rollback path

Publishing is checkpoint-based; rollback = re-publish a known-good state.

1. **Identify the last known-good checkpoint** (the one behind the currently-live
   deploy, or the last one whose smoke pass was green).
2. **Re-publish that checkpoint** via Replit's publish flow (publish history /
   rollback in the deployments pane). Unless the deploy carried a schema
   migration (its own cycle by doctrine), no data migration is involved. The
   runtime writes are confined to the three sanctioned zones (operator writes
   + audit, member notification receipts, the aggregate channel log) — all
   additive, none load-bearing for serving — so a code rollback loses no data
   and breaks nothing; rows written meanwhile simply persist.
3. **Re-run the smoke pass** (section 3) against production after rollback.
4. **Environment rollback:** if a flag was changed (e.g. `SYNDICATE_AUTH_ENABLED`),
   unset it in the deployment environment and re-publish — deployment env changes
   only take effect with a publish.
5. **Record the event**: what was rolled back, why, and which checkpoint is now
   live — in the founder log, not in served copy.

## 6. Out of scope for this artifact

- It does not grant permission to publish, wire new sources, enable auth, or
  change contracts/canon — every one of those stays founder-gated.
- It contains no secrets and must never contain secret VALUES (names only).
