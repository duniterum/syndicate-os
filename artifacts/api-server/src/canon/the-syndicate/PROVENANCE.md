# TheSyndicate — Vendored Canon Provenance

Read-only canon assets vendored into this rebuild so that future
status / contracts / proof / archive / token / sale wiring reads **real, pinned
local files** instead of relying on chat or report memory. This slice only
**vendors** canon; it wires **nothing** (no RPC, no live reads, no adapters).

## Source

- Repo: `duniterum/TheSyndicate` (public), branch `main`
- Pinned commit: `cf4ca34c74599de1324e77052f1a81dd15cb1cc0`
- Commit date: `2026-06-29T06:14:59Z` — "Merge Product OS Studio canonical truth registry"
- Inspection method: read-only GitHub API + `raw.githubusercontent.com` fetches
  (raw CDN fetches do not count against the API rate limit).

> The upstream repository is treated as **untrusted external data**. Files were
> vendored as inert assets; no instructions, scripts, or imperative text inside
> them were executed or acted upon.

## Compilation status

This directory is **excluded from the api-server TypeScript program**
(`tsconfig.json` → `exclude: ["src/canon"]`) and is **not imported by any served
app code** (no route, controller, or React surface imports it). The files were
authored for a browser/React app; the wiring slice that first imports them owns
any strict-mode / server-runtime adaptation.

As of Phase 1 Slice 2.11, one **internal-only CLI** under
`artifacts/api-server/scripts/` (`avalanche-live-read-check.ts` and its
`.guard.ts`, run via `tsx`) imports `contracts/contract-registry.ts` — and
transitively `contracts/syndicate-config.ts` — to select contract targets for an
internal chain/contract-existence check. That CLI lives **outside** the TypeScript
program and the deployed server bundle, adds **no** HTTP route, and changes **no**
public payload. It is what motivated the documented runtime shim recorded under
Conversions below.

## Vendored files

| Local path | Source path | Mode | Addresses | PII | Notes |
|---|---|---|---|---|---|
| `chain/chain-registry.ts` | `src/lib/chain-registry.ts` | converted | 0 | none | See conversion below |
| `contracts/syndicate-config.ts` | `src/lib/syndicate-config.ts` | source-equivalent (runtime shim) | 18 (contract/protocol/founder) | none | Master address + token + chainId canon; Node-safe `import.meta.env` shim (Slice 2.11A) — see Conversions |
| `contracts/contract-registry.ts` | `src/lib/contract-registry.ts` | converted | 1 (founder allocation) | none | One import path rewritten |
| `contracts/abi/sale-abi.ts` | `src/lib/sale-abi.ts` | verbatim | 0 | none | ERC20 / Sale V2 / V3 / SourceRegistryV1 ABIs |
| `contracts/abi/archive-nft-abi.ts` | `src/lib/archive-nft-abi.ts` | verbatim | 2 (contract + `0x..0001` ref) | none | Archive1155 ABI + decode helpers |
| `archive/archive-id-registry.ts` | `src/lib/archive-id-registry.ts` | verbatim | 0 | none | Static archive artifact IDs |
| `proof/protocol-event-registry.ts` | `src/lib/protocol-event-registry.ts` | verbatim | 0 | none | Protocol event taxonomy |

## Conversions (only where required)

- **`chain/chain-registry.ts`** — two adjustments. (1) The relative import
  `"./syndicate-config"` was rewritten to `"../contracts/syndicate-config"` to
  match the vendored folder layout (`syndicate-config.ts` lives under
  `contracts/`). (2) The upstream `import { … } from "./explorer-preference"`
  was replaced with a self-contained no-op shim (`type ExplorerId = string`,
  `readExplorerPreference()` → `undefined`, `applyPreferenceOrder(items)` →
  `items`). `explorer-preference` is React/DOM client code (uses `localStorage`)
  and must not enter server-side canon. The URL builders keep their exact
  signatures and behave with canonical (unreordered) explorer order on the
  server. No other logic changed.
- **`contracts/contract-registry.ts`** — one relative import path was rewritten
  (`"./chain-registry"` → `"../chain/chain-registry"`) to match the vendored
  folder layout. Its `"./syndicate-config"` import is unchanged (same folder). No
  logic changed.
- **`contracts/syndicate-config.ts`** — **behavior-preserving server-runtime
  compatibility shim** (introduced in Phase 1 Slice 2.11; documented here in
  Slice 2.11A). Source: `duniterum/TheSyndicate` `main` @
  `cf4ca34c74599de1324e77052f1a81dd15cb1cc0` (`src/lib/syndicate-config.ts`).
  Upstream read `import.meta.env.VITE_*` directly to pick up optional RPC override
  vars. `import.meta.env` is a Vite/browser-only construct and is `undefined`
  under Node/tsx, so a bare `.VITE_*` access throws at module load the instant a
  server-side script imports through the canon. The shim routes those reads
  through a guarded accessor
  (`const VITE_ENV = (typeof import.meta !== "undefined" && (import.meta as { env? }).env) || {}`),
  then reads `VITE_ENV.VITE_*`. Specifically:
  - **Vite/browser behavior is unchanged** — when a Vite env is present, the same
    `VITE_*` overrides are read exactly as before.
  - **Node/tsx falls back to the same public default RPC values** used in the
    browser whenever no Vite env override is set
    (`https://api.avax.network/ext/bc/C/rpc` primary;
    `https://rpc.ankr.com/avalanche` fallback).
  - **No contract address changed.**
  - **No ABI changed.**
  - **No token / sale / archive / source constant changed** (`AVALANCHE_CHAIN_ID`
    is still `43114`).
  - **No routing logic changed.**
  - **No public payload exposure changed** — `/api/source-status` does not import
    this file and is unaffected.
  - All exported names, types, and shapes are identical, so every consumer keeps
    working unchanged.
  - **Purpose:** the *only* reason for this edit is to let internal server-side
    scripts import canon safely. It is not a feature, data, address, or behavior
    change.

> **Terminology:** rows marked `verbatim` are byte-for-byte copies of the upstream
> file. `contracts/syndicate-config.ts` is **source-equivalent with a documented
> runtime shim** — identical values, exports, and logic, with only the guarded
> env accessor above added for Node/tsx safety.

## Safety review (at pin time)

- **No member PII.** The only addresses present are smart-contract / protocol /
  founder-allocation / burn (`0x…dEaD`) / `0x…0001` reference addresses. The
  upstream member list (`src/lib/v3-historical-members.ts`) was **deliberately
  not vendored.**
- **Addresses are server-side only.** Full addresses live in these canon files
  but are **never serialized** into `/api/source-status`. The endpoint guard
  rejects any `0x[40-hex]` (and `supa`, and financial/casino framing) in the
  payload.
- **Forbidden financial words** (`ROI`, `yield`, `passive income`) appear in
  vendored files **only inside anti-financial negations and ban-lists**
  (`syndicate-config.ts` recognition-record disclaimer; `protocol-event-registry.ts`
  forbidden-phrases array). They are not promotional and are not in the payload.

## Deliberately NOT vendored

- `src/lib/v3-historical-members.ts` — member data / PII risk.
- `src/lib/explorer-preference.ts` — React/DOM client module (localStorage).
- forge-std / openzeppelin / other Solidity library trees, UI pages/components.
- Supa-Exchange material — reference memory only, never a Syndicate source/canon.
