# `contracts/` — Syndicate OS on-chain merit rail (S3)

The Foundry project for **`MeritDistributor`** (product label: **« Season Bounty Pool »**) —
ONE immutable, generic merit-payment distributor. Season bounty rounds are the first program;
future campaigns ride the SAME contract as new rounds. No proxy, no upgradeability, ever.

> **THE SPEC IS LAW:** `docs/reference/MERITDISTRIBUTOR_CONTRACT_SPEC.md` (FROZEN v4 —
> supersedes the harvest §0.7/§0.17 for the contract; the harvest stays the WHY).
> **The execution plan:** `docs/reference/S3_SEASON_CASH_RAIL_MASTER_PLAN.md`.
> *Names lie — read the `.sol`.*

This directory is **self-contained** and lives OUTSIDE the pnpm workspace on purpose — the
Solidity toolchain never touches the JS/TS build or guards, and vice-versa.

---

## Layout

- `src/MeritDistributor.sol` — the contract (pragma 0.8.28). Its header carries the S3-1
  realization notes (the `RoundClass {INTERIM, CLOSE, FINAL}` arbitration, pause-overlap
  expiry, fund/season guards).
- `test/MeritDistributor.t.sol` — the S3-1 core suite (36 tests: money paths, access matrix,
  the named regression classes). The S3-2 adversarial stack adds the 15 stateful invariants
  (≥50k runs, ghost ledger), Halmos symbolic proofs, Murky proof-forgery fuzzing, mutation
  testing, and real-USDC mainnet-fork tests.
- `test/mocks/MockUSDC.sol` — 6-decimal USDC stand-in with a Circle-style blocklist.
- `lib/` — **vendored, COMMITTED, pinned** (an immutable money contract's audit target must
  be reproducible offline): `forge-std` `6e8c4a9` · `openzeppelin-contracts` **v5.6.1** ·
  `murky` `991e371` — all plain files (no submodules — OneDrive-safe), slimmed to the
  compile-needed trees (`contracts/` / `src/`).
- `foundry.toml` — solc 0.8.28 pinned, `evm_version=cancun`, deterministic builds
  (`bytecode_hash=none`, `cbor_metadata=false`), the `green` profile (invariants at
  50k/depth 25) for the spec §9 GREEN gate.

Run the tests:

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd contracts && forge test -vv
```

---

## Toolchain install recipe (verified on THIS Windows box — reproduce exactly)

**Foundry: v1.7.1** (forge/cast/anvil/chisel), attestation-verified. Solc 0.8.28 auto-installs.

### The box's TLS gotcha (why plain installs fail)

This machine's `curl` uses the **Schannel** backend, which cannot do certificate-revocation
checks → fetches die with `CRYPT_E_NO_REVOCATION_CHECK (0x80092012)`. Two scoped,
non-persistent workarounds:

- **curl**: point `CURL_HOME` at a dir containing a `.curlrc` with one line `ssl-no-revoke`.
- **git**: prefix clones with `-c http.schannelCheckRevoke=false`.

`forge`'s own downloader (Rust HTTP) is unaffected.

### Install Foundry

```bash
export CURL_HOME=/path/to/dir/with/.curlrc     # .curlrc contains: ssl-no-revoke
mkdir -p "$HOME/.foundry/bin"
curl -sSf -L "https://raw.githubusercontent.com/foundry-rs/foundry/HEAD/foundryup/foundryup" \
  -o "$HOME/.foundry/bin/foundryup"
chmod +x "$HOME/.foundry/bin/foundryup"
"$HOME/.foundry/bin/foundryup"
export PATH="$HOME/.foundry/bin:$PATH"
forge --version
```

### Static-analysis toolchain (state on THIS box, 2026-07-24)

No native Python/cargo here. **`uv` 0.11.32** installed (single binary, manages its own
Python); this box's TLS interception rejects Rust's default roots → **always pass
`--system-certs`** (the Windows cert store). **slither 0.11.5 installed and green**
(`0 high / 0 medium` — triage in `analysis/slither-triage.md`):

```bash
uv tool install --system-certs --python 3.12 slither-analyzer
slither src/MeritDistributor.sol --solc-remaps "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/" \
  --exclude-informational --exclude-low --exclude-optimization
```

**halmos: BLOCKED on this box** — `safe-pysha3` has no py3.12 wheel and the source build
fails (no C toolchain). Recorded paths: `uv tool install --system-certs --python 3.11 halmos`
(3.11 wheels exist) or run the symbolic pass in WSL/CI. **aderyn + mutation testing**: not
yet installed — they ride the same later GREEN-gate pass.

### Dependencies

Already vendored + committed in `lib/` — nothing to install. To re-vendor from scratch
(new pins go through the spec change process first):

```bash
git -c http.schannelCheckRevoke=false clone --depth 1 --branch v5.6.1 \
  https://github.com/OpenZeppelin/openzeppelin-contracts lib/openzeppelin-contracts
git -c http.schannelCheckRevoke=false clone --depth 1 https://github.com/dmfxyz/murky lib/murky
# then: rm -rf <lib>/.git, slim to contracts// src/, keep LICENSE+README
```

---

## The road to mainnet (spec §9 — engineering only, NO legal gate, 8-8)

S3-2 adversarial stack → S3-3 `season-merkle` v2 tooling + the differential fixture →
(server/admin/front slices per the master plan) → the founder's money-sheet seal →
**the MAINNET-FORK rehearsal** (anvil fork of Avalanche C-Chain — the REAL USDC + chain
state; the founder's acts on the real console screens; founder ruling 2026-07-24: no
testnet detour) → the founder's signed **mainnet deploy** → post-deploy verification →
`acceptOwnership` → early 2-of-3 Safe transfer → **the MAINNET CANARY** (tiny « Engager »,
one real round end-to-end on Snowtrace) → Season-1 scale funding. The rail is then
autonomous (SETTLED_RULES 8-8).

Deploy params (the founder confirms in one plain line): `PENDING_DELAY=72h` ·
`RESERVE_TIMELOCK=72h` · `CORRECTION_WINDOW=7d` · `MAX_PAUSE=14d` · `CLAIM_EXPIRY=2y`.
