# Slice 2.21A — Full Visible Syndicate OS Organism (Shell)

## What this slice did

Turned the read-only foundation into the first coherent, navigable Syndicate OS:
a public marketing site and an operator console that share one registry spine,
with every surface honestly lifecycle-labelled and source-boundary-safe. No
protocol data, contracts, chain, auth, or backend writes were wired.

## Surfaces (registry-driven)

- **Public:** `/` (front door), `/proof`, `/status`, `/learning`, `/contracts`,
  `/source-attribution`, `/support`; plus `/archive` and `/recognition`
  (concept memory, NOINDEX).
- **Member preview:** `/member` (founder-gated, NOINDEX).
- **Operator preview (console):** `/studio`, `/proof-studio`, `/founder`,
  `/source` (`/source` stays paused by precaution; INTERNAL).

The homepage stayed within its governance cap (no new sections) and links out to
the new surfaces.

## One spine, no competing systems

Every route is declared once and projected everywhere:

- `lib/seo-route-registry.ts` — indexing/SEO truth (sitemap + robots derived; kept
  dependency-free so the Node scripts can load it directly).
- `config/surfaceClassification.ts` — route ↔ audience ↔ layout.
- `config/modules.ts` / `config/navigation.ts` — module registry + header /
  sidebar / footer groups (no hardcoded link islands).
- `config/truthStatus.ts` — `TruthStatus` + `DisplayLifecycle`, each projected onto
  the canonical `@workspace/os-contracts` `SourcePosture` (none map to
  `LIVE_ACTION`).
- Content config: `config/contractMemory.ts`, `config/sourceAttributionTerminology.ts`,
  `config/supportIntake.ts`, `config/learningModules.ts`, `config/sharedCopy.ts`.
- Phase-0 `config/routeMemory.ts` classifies every legacy surface
  (preserve-public / merge-public / auth-member-future / private-operator-future /
  proof-or-archive / learning-or-chronicle / contract-memory / source-attribution /
  reject-unsafe / defer-post-mvp).

## Honesty guards (Node-loadable, dependency-free)

Run with `pnpm --filter @workspace/studio run guards`:

1. `guard:lifecycle` — every surface page carries a `<LifecycleBadge>`/`<TruthLabel>`.
2. `guard:copy` — no forbidden financial framing anywhere in `src/`.
3. `guard:source` — source attribution stays recognition-only and paused.
4. `guard:coverage` — every route classified once; audience ↔ layout consistent.
5. `guard:drift` — router ↔ registry ↔ modules ↔ nav stay in lockstep.
6. `guard:posture` — posture projections are total, valid, and never `LIVE_ACTION`.
7. `guard:live` — no hardcoded `LIVE`/`Online`/`Active` labels.

The api-server `verify:canon` guard is untouched. The SEO guard
(`seo:check` → sitemap has exactly 7 INDEX routes) also stays green.

## Boundaries honored

No deploy/publish, no Solidity/transactions, no live adapters/indexers, no real
auth or backend writes, no fake data/balances/members, no fake-LIVE labels, no
forbidden financial framing, no hardcoded nav islands, no dependency/lockfile
changes.
