# New-Session Handoff — First Clean Schema-Only Production Publish (2026-07-03)

Compact starting brief for the next session. Full audit: this date's whole-organism
continuity audit (chat report). Doctrine sources: `replit.md`, `docs/architecture/`.

## 1. Live production truth

- Domains: `https://thesyndicate.money` + `https://syndicate-os.replit.app` — identical responses.
- Bundle: `index-DnOIYIru.js` (previous: `index-DDt6H_KU.js`).
- API: `node artifacts/api-server/dist/index.mjs`; `/api/healthz` 200, `/api/source-status` 200,
  `/api/protocol/reality` 200 (live Avalanche reads, chain 43114, read-only proof lifecycle,
  fresh→cached verified). Unknown API → 404.
- Public routes all serve (SPA fallback by design). `/os-map` operator code is build-excluded
  from the production bundle (registry metadata + honest exclusion note only).
- Only deploy-log errors ever: cold-start `/api` 500s bounded to the pre-listening window.

## 2. Private GitHub truth (after this checkpoint)

- Repo: `duniterum/syndicate-os` (private, main). This checkpoint adds:
  1. `fix(db)` — plain-column wallet index replacing the expression index.
  2. `release` — first clean schema-only production publish + this handoff note.
- Tag: `prod-2026-07-03-first-clean-schema-publish` → release commit.

## 3. Database state

- Production: 5 tables + enum `sale_generation {V1,V2A,V2B,V3}`; **all row counts 0**;
  index `historical_member_wallet_uq (chain_id, freeze_block, wallet)` materialized;
  no dev data copied. Served code never writes.
- Dev baseline: sale_event_raw 26 · indexer_cursor 6 · historical_member_freeze 1 ·
  historical_member 8 · block_timestamp 17.
- Data doctrine: freeze/member rows #1–#8 are canonical wallet/member proof data —
  private/internal **until deliberately surfaced** through Holder Index / Register / proof
  pages (transparency-by-design, not a privacy bunker). Authority = import artifact +
  on-chain V1_MEMBER_ROOT; never regenerate/renumber. Raw sale events + block timestamps
  are re-derivable from chain (prod backfill re-indexes, never copies dev rows).
  `indexer_cursor` is operator-local. The risk is uncontrolled dev→prod data movement,
  not public proof itself.

## 4. Auth / security state

- Auth dark in production: `/api/auth/*` → 404 `{"error":"not_found"}` with unknown-route
  parity; no app cookies (host `GAESA` infra cookie only). `SYNDICATE_AUTH_ENABLED` absent.
- IA-1/IA-2 (access-state shell, SIWE session skeleton, throttle identity) exist in code,
  gated dark. Remain disabled until founder approval.
- Live bundle scanned clean: no contract addresses, no internal paths, no env-flag names,
  no forbidden product copy.

## 5. Replit publish lesson (expression-index bug)

- The publish gate introspects the DEV DB and reconstructs DDL; it mangles EXPRESSION
  indexes (misassigned operator classes, e.g. `text_ops`/`int4_ops`), even when dev
  Postgres holds valid DDL. Plain-column indexes reconstruct correctly.
- Rule: keep this schema expression-free in indexes; enforce normalization invariants at
  the fail-closed write gate. Pre-publish: scan dev `pg_indexes.indexdef` for `lower(` /
  `_ops`. At the gate: reject opclass tokens and any `INSERT`/`COPY`/`VALUES`
  (schema-only vs data-copy stays explicit).

## 6. Milestone summary

Live: reality spine, source-status ledger, public front door + console shells, prod schema.
Dark/gated: IA-1/IA-2 auth skeleton, operator preview (`/os-map`).
Dev-only canonical data: Part A raw index, Part B freeze/members (VERIFIED), Protocol Time.
Design-only/future: Holder Index / read-model, IA-2.5+, wallet connect, purchase/referral.

## 7. Unresolved risks

- None material after this checkpoint. Minor: keep memory/docs in sync with the live
  bundle marker when it next changes.

## 8. Next recommended slice

**Holder Index / read-model — design-only.** Taxonomy already exists in the canon
protocol-event-registry (never mint a parallel one). No implementation, no DB writes,
no new public routes without founder approval.

## 9. What NOT to do next

- No dev→prod data copying, no manual prod SQL, no prod migrations outside the publish gate.
- No auth enablement / `SYNDICATE_AUTH_ENABLED`.
- No expression indexes in schema.
- No regeneration/renumbering of the member freeze.
- No wallet connect, no IA-3, no Holder Index implementation, no new public routes,
  no forbidden financial framing (see `replit.md` Gotchas).
