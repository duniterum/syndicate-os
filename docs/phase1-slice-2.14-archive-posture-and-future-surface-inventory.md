# Phase 1 — Slice 2.14: Internal Archive-1155 Posture Read + Future Archive Surface Inventory

> **Posture:** `INTERNAL / CLI-ONLY`. This slice adds the **smallest safe** internal
> read of the deployed `SyndicateArchive1155` artifact-level posture, plus this
> inventory document. **No served HTTP route was added. `/api/source-status` was not
> changed. No UI changed.** The implementation is a `scripts/`-only CLI (run via `tsx`),
> outside the api-server TypeScript program, importing only vendored canon + Node.
>
> **Inspected canon (pinned SHA `cf4ca34c74599de1324e77052f1a81dd15cb1cc0`):**
> `contracts/abi/archive-nft-abi.ts` (full `ARCHIVE_NFT_ABI`, `decodeArtifactCore`,
> `REFERENCE_WALLET`), `archive/archive-id-registry.ts` (`ARCHIVE_ID_REGISTRY`, ids 1–9),
> `contracts/contract-registry.ts` (`ARCHIVE_1155` entry, role `archive1155`, status `LIVE`).
> Old-main `src/lib/archive-*.ts` machinery does **not** exist in this repo — this is a clean
> foundation; the Archive surface lives only in vendored canon + docs/memory.
> **Trust note:** the deployed contract is treated as **untrusted external data** — its
> `uri()` payload, in particular, is classified, never rendered, and never emitted.

---

## 1. What this slice implements (in scope)

A dependency-free CLI, `artifacts/api-server/scripts/avalanche-archive-posture-check.ts`,
that — **only after** verifying the chain and that the Archive contract has code — reads,
per known artifact id from the registry, a tiny artifact-level **posture**:

| Surfaced field | Source read | Notes |
| --- | --- | --- |
| `exists` | `getArtifactCore(id)` → `configured` (field 0) | ONLY `configured` is surfaced. |
| `mintableReference` | `isMintable(id, REFERENCE_WALLET, 1)` | Reference-wallet display eligibility (a bool). Revert = legitimate → `null`. |
| `paused` | `paused()` (global Pausable, read **once**) | Applied to every artifact. Unreadable → `null` (never "not paused"). |
| `remainingSupply` | `remainingSupply(id)` | Artifact **contract state**, NOT a financial metric. |
| `uriStatus` | `uri(id)` | Classified to `omitted`/`safe`/`redacted`/`unreadable`. The **raw value is NEVER emitted**. |

**Chain discipline (Avalanche C-Chain only, 43114 / `0xa86a`):** the first RPC call is always
`eth_chainId`; `eth_getCode` is never called unless chainId matches; archive `eth_call` is never
made unless chainId is verified **and** the Archive contract has code. Unreachable RPC, wrong
chain, and no-code all **fail closed** (the CLI exits non-zero and returns no fabricated posture).

**Approved RPC methods:** `eth_chainId`, `eth_getCode`, `eth_call`.
**Approved `eth_call` selectors (derived from canonical signatures via a vendored, guard-verified
keccak-256):** `getArtifactCore(uint256)` `0x0f1a0fba`, `remainingSupply(uint256)` `0x47fda41a`,
`paused()` `0x5c975abb`, `isMintable(uint256,address,uint64)` `0x80e101ca`, `uri(uint256)`
`0x0e89341c`. Nothing else is callable.

**Address-free by construction:** the Archive address and `REFERENCE_WALLET` (`0x…0001`) are used
only inside call params, never in output; a final `assertNoAddressLeak` scan runs before printing.
`getArtifactCore` price/payment fields (`priceUsdc`, `minted`, `maxSupply`, `walletLimit`) are
decoded **for ABI-shape validation only** and are deliberately **not surfaced** this slice
("present in ABI, not surfaced").

**Observed live result (Avalanche C-Chain, this slice):** ids 1–8 readable; id 9 fail-closed
(`ARTIFACT_CORE_REVERT; REMAINING_SUPPLY_REVERT`) exactly matching its `NOT_CONFIGURED` registry
status. All `uriStatus` returned `unreadable` (the deployed contract's `uri()` reverts / returns
non-standard data for these ids) — correctly fail-closed without leaking anything.

---

## 2. Future Archive Surface Inventory (out of scope here — **preserved, not erased**)

The broader Archive read/write surfaces remain valid future work. This slice deliberately does
**not** activate them. Each is recorded below with where it lives in canon, why it is deferred,
and the safety gate that must hold before it can be staged. **Doctrine:**
*Show the protocol. Protect the person. Let the member disclose. Let the founder audit.*

### A. Wallet-personal reads (member-scope, behind real auth only — PII landmines)
1. **`balanceOf(account, id)`** — present in `ARCHIVE_NFT_ABI`. Per-wallet holdings.
   *Deferred:* binds an address to holdings (member-personal). *Gate:* member-scope behind real
   server-side auth; never public; never emit the raw wallet.
2. **`balanceOfBatch(accounts, ids)`** — keccak `0x4e1273f4` (not added as an approved selector).
   Batch form of the above. Same gate.
3. **`walletRemaining(id, wallet)`** — present in ABI. Per-wallet remaining mint allowance.
   *Deferred:* member-personal. *Gate:* member-scope auth; aggregate only if ever public.
4. **`isMintable(id, CONNECTED wallet, qty)`** — the connected-wallet eligibility read (distinct
   from this slice's `REFERENCE_WALLET` display read). *Gate:* member-scope; connected wallet
   stays client-side; never logged/served raw.

### B. Identity / payout addresses (founder/audit-scope — never raw public)
5. **`owner()`** — present in ABI (OZ Ownable). The withdraw-authorized wallet.
   *Deferred:* a raw address. *Gate:* founder/audit-scope; surface as posture/verification link,
   never as a raw public address; degrade to PENDING when unreadable, never fabricate.
6. **`treasury()`** — present in ABI. The NFT-revenue destination. Same gate as `owner()`.

### C. Write path (never server-side)
7. **`mint(id, quantity)`** — present in ABI (`nonpayable`). *Deferred indefinitely server-side:*
   this is a write. *Gate:* only ever a client wallet flow in a future UI slice; the server holds
   no key and signs nothing.

### D. Artifact economics & definition (decode exists; framing not yet safe)
8. **`getArtifactCore` payment fields** (`priceUsdc`, `minted`, `maxSupply`, `walletLimit`) —
   decoded by canon `decodeArtifactCore`; **not surfaced** here. *Gate:* a future public surface
   must frame price as a **mint cost**, never investment upside — and must respect the forbidden-copy
   list (no profit/ROI/yield/payout/return framing).
9. **`getArtifactCore` definition flags** (`active`, `ownerOnly`, `definitionFrozen`,
   `rendererMode`) — decoded/validated by canon (`RENDERER_MODE_LABEL` exists); only `configured`
   is surfaced this slice. *Gate:* a future reconciliation/status surface may surface `active` etc.

### E. Media (after validation only)
10. **`uri(id)` value + media rendering** — this slice reads and **classifies** `uri()` but never
    emits the value. *Deferred:* rendering arbitrary on-chain/off-chain media is untrusted-content
    risk. *Gate:* a sanitized media pipeline (scheme allow-list, content validation) before any
    value is surfaced or rendered. (Live `uri()` is currently `unreadable` for these ids.)

### F. Event-derived surfaces (need an indexer — highest effort + PII)
11. **Mint / Transfer events** — the vendored `ARCHIVE_NFT_ABI` is **view-complete but
    event-incomplete**: it contains no `TransferSingle`/`TransferBatch`/mint events. *Deferred:*
    any minted-over-time, holder-count, or activity surface needs an event indexer + ABI events
    that are not yet vendored. *Gate:* indexer ownership decided; gapless-scan discipline
    ("count only when the scan is gapless"); aggregate/anonymized output only.
12. **Holder index / per-id holder counts** — derived from events. PII landmine (real wallets).
    *Gate:* aggregate + anonymized only; never per-member public output.

### G. Reconciliation & integration (data ready, not wired)
13. **Registry-vs-chain reconciliation** — compare registry `configuredOnChain` /
    `publicMintAllowed` / `activation` against on-chain `getArtifactCore` (`configured`/`active`).
    All inputs are now produced; the comparison surface is a future slice. *Gate:* report as
    posture, fail closed on contradiction.
14. **`/api/source-status` integration** — this slice intentionally feeds **nothing** into the
    served status ledger (it stays `POSTURE_ONLY`, static-canon). *Gate:* a future, explicitly
    approved slice may summarize archive posture into the ledger — posture booleans/enums only,
    never values, never addresses.
15. **Other Archive contract roles** — `RESERVED_DISABLED` id 2 (SeatRecord721 identity, future
    ERC-721 `PENDING`) and `NOT_CONFIGURED` id 9 (roadmap). *Gate:* no UI may claim configured /
    active until canon + chain agree; ids stay fail-closed until then.

---

## 3. Verification

- `archive-posture:guard` — **69/69** (keccak correctness, chainId-first ordering, no-getCode/
  no-call gating, only-5-approved-selectors, posture-only output, decode-failure & ABI-shape-drift
  explicit errors, uri-value-never-emitted, address/REFERENCE_WALLET/field-name leak scans,
  framing/PII scan, cache + coalescing, real canon selection of `ARCHIVE_1155` + all 9 ids).
- `live-read:guard` 43/43 · `token-metadata:guard` 62/62 · `verify:canon` 33/33 — all still pass.
- `pnpm --filter @workspace/api-server run typecheck` and `… studio run typecheck` — both clean.
- Live `archive-posture:check` — chain verified (43114), Archive has code, 8/9 readable, no drift.
- `/api/source-status` — unchanged: `POSTURE_ONLY`, 20 categories. Diff is scoped to
  `package.json` (two new scripts) + the two new `scripts/avalanche-archive-posture-check*.ts` files.
