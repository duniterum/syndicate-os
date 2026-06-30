# The Syndicate OS

The Syndicate OS is the **private foundation repository** for The Syndicate — a proof-first membership and recognition protocol surface. It combines a public-facing studio/app, an API server, shared libraries, utility scripts, and server-side canon in a single pnpm monorepo. The codebase is deliberately a **read-only foundation**: it preserves radical-honesty *truth labels* on every value that is not wired to a verified source, and it makes no fake-live protocol claims. No protocol data, contracts, chain reads, payments, or backend writes are wired yet.

## Current Status

- **Private foundation repository** — not a public repository.
- Initial foundation tag: **`v0.1.0-foundation`**.
- **Not** public-production doctrine yet; the repository stays private until a public posture is explicitly founder-approved.
- This repository and this README are **not** a deployment trigger and imply **no** feature implementation.
- Read-only foundation: no live wiring, no contracts, no chain/RPC, no payments.

## Repository Structure

This documents only the actual pushed tree.

### `artifacts/studio`
- **What it is:** the public-facing web app (React + Vite) — a public homepage plus the operator console ("Studio OS / Proof OS").
- **Belongs here:** UI, routes, pages, components, client config, truth-label and posture surfaces.
- **Does not belong here:** secrets, private canon values, server-only logic, live-chain writes, or fake/live protocol data.

### `artifacts/api-server`
- **What it is:** the Express API server plus the **server-side canon** (the protocol's reference data and integrity guards).
- **Belongs here:** API routes, the health endpoint, canon files, `PROVENANCE.md`, and canon-integrity guards/checks.
- **Does not belong here:** client UI, secrets / `.env`, member PII, or private keys.

### `lib/`
- **What it is:** shared workspace libraries (API spec, generated client hooks, Zod schemas, database schema scaffolding).
- **Belongs here:** reusable cross-package code consumed by the artifacts.
- **Does not belong here:** app-specific UI, secrets, or environment-specific values.

### `scripts/`
- **What it is:** shared utility scripts (`@workspace/scripts`).
- **Belongs here:** small repo-level helper scripts.
- **Does not belong here:** deploy/publish automation, live-chain-write scripts, or anything requiring secrets at import time.

### Root configuration
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.npmrc`, `tsconfig.base.json`, `tsconfig.json` — workspace, dependency, and TypeScript configuration.
- **Belongs here:** workspace-level configuration only.
- **Does not belong here:** secrets or deploy credentials.

### `replit.md`
- Project overview, run/operate notes, architecture decisions, homepage governance, doctrine, and founder preferences — the authoritative orientation document alongside this README.

### `.gitignore`
- Keeps build output, dependencies, caches, and local-only material out of version control.

### Intentionally excluded (absent by design)
The clean foundation deliberately omits:
- `docs/` and all audit reports / phase ledgers
- `artifacts/mockup-sandbox` (design sandbox, unrelated to the product)
- `attached_assets/`
- `.agents/`
- `.env` files / secrets
- reference-repo clones
- `node_modules/` and build/cache output (`dist/`, `.cache`, etc.)

These are operational or local-only and must not be reintroduced into this repository.

## Truth & Canon Boundary

- **Server-side canon** lives under the api-server canon paths and holds the protocol's reference data.
- **`PROVENANCE.md`** (under the canon directory) records the source/provenance of that canon.
- **Public surfaces must use truth/status labels.** Every value not wired to a verified source renders a truth label; there is no fake-live data anywhere.
- **Posture vocabulary must be preserved:** `NOT_WIRED`, `READ_ONLY` / `READ_ONLY_PROOF`, `NOT_LIVE`, `FUTURE`, and `LIVE`. Do not downgrade honesty or claim "live" without a verified source. A canon-integrity guard enforces these postures and the public-payload contract.
- **Reference repositories are pattern sources, not live Syndicate truth.** Patterns may inform architecture; they are never imported or presented as protocol truth.
- **No fake money, fake contracts, fake dashboard data, fake activation, or unauthorized transactions** — ever.
- **Chain identifiers / addresses:** Some server-side canon files contain private-repo-approved chain identifiers/addresses; do not expose them in public UI or public docs without founder approval.

## Setup

Commands verified in slice 2.19A:

```bash
pnpm install --frozen-lockfile                          # install exact locked dependencies
pnpm run typecheck                                      # typecheck libs + artifacts + scripts
pnpm --filter @workspace/api-server run build           # bundle the API server
pnpm --filter @workspace/api-server run verify:canon    # canon integrity guard
```

Notes:
- The **studio build requires `PORT`** (and `BASE_PATH`) because `vite.config.ts` is environment-gated; the run workflow injects them. From a bare shell, verify the web app with `pnpm run typecheck`, not `build`.
- **Do not run deploy/publish or live-chain-write scripts** (for example live-read / token-metadata / archive-posture chain reads, or database `push`) without explicit founder approval.

## Verification

Safe verification commands and what they prove:

| Command | Proves |
| --- | --- |
| `pnpm install --frozen-lockfile` | dependencies resolve from the lockfile with no drift |
| `pnpm run typecheck` | libs build and all artifacts/scripts typecheck — imports across studio/api-server/lib/canon resolve |
| `pnpm --filter @workspace/api-server run build` | the API server bundles successfully |
| `pnpm --filter @workspace/api-server run verify:canon` | canon integrity and the public-payload contract are intact |

Secret/PII safety: there is no committed secret-scanning script in this repository, so a **pre-push secret/PII gate is required before any release or public-posture change** (fail-closed: no `.env`, keys, tokens, mnemonics, or PII; server-side canon chain identifiers are private-repo-allowed only).

## Safety Rules

- Keep the repository **private** until a public posture is founder-approved.
- **No secrets in git** — no `.env`, no API / cloud / bot tokens.
- **No member PII** — no emails, phone numbers, or rosters.
- **No private keys or mnemonics / seed phrases.**
- **No client-side key generation.**
- **No internal control/workflow material** (no internal orchestration or platform-internal notes).
- **No reference-repo clone imports.**
- **No public exposure of server-side canon values** (addresses/identifiers) without founder approval.

## Development Doctrine

- Source truth before claims.
- Proof before promotion.
- Docs and copy derive from verified code/canon — not invented.
- Small slices.
- Report before implementation when a boundary is unclear.
- Protect truth and money; keep architecture flexible until MVP lock.

## Current Next Step

The next expected slice after this README is **not** live wiring. It should be a founder-approved foundation implementation slice — likely adapter-seam / manifest planning or another small, source-boundary-safe improvement. Live data wiring stays deferred until a real read-model source is verified and explicitly approved.
