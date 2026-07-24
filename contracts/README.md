# `contracts/` — Syndicate OS on-chain merit rail (S3+)

The Foundry project for the Syndicate OS smart contracts. First contract: **`SeasonBountyPool`**
(the autonomous season-cagnotte payout rail).

This directory is **self-contained** and lives OUTSIDE the pnpm workspace (`artifacts/*`,
`lib/*`, `scripts`) on purpose — the Solidity toolchain does not touch the JS/TS build or
guards, and vice-versa.

> **Names lie — read the `.sol`.** Field/function names are convenience; the authority is
> the compiled source + its tests. (Founder guardrail, S3.)

---

## What is here now (the toolchain spike — 2026-07-24)

S3's engraved first act was a **Foundry toolchain spike**: prove the atelier compiles +
tests on this Windows box *before* any contract code. Status: **GREEN**.

- `foundry.toml` — pinned to **solc 0.8.28**, deterministic builds (`bytecode_hash = "none"`,
  `cbor_metadata = false`).
- `src/HelloSyndicate.sol` + `test/HelloSyndicate.t.sol` — a **zero-dependency** sentinel
  proving compiler + test runner. **Deleted when the real `SeasonBountyPool` lands.**
- `forge-std` + a fuzz test were also verified working on this box (256 runs, green) —
  see "Reinstall forge-std" below. Not committed (see `.gitignore`); the
  dependency-vendoring strategy is a deliberate real-build decision.

Run the tests:

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd contracts && forge test -vv
```

---

## Toolchain install recipe (verified on THIS Windows box — reproduce exactly)

**Foundry: v1.7.1** (forge/cast/anvil/chisel), attestation-verified.

### The box's TLS gotcha (why the plain install fails)

This machine's `curl` uses the **Schannel** backend, which cannot do certificate-revocation
checks → every fetch dies with `CRYPT_E_NO_REVOCATION_CHECK (0x80092012)`. Two scoped
workarounds (neither writes a persistent config):

- **curl**: point `CURL_HOME` at a dir containing a `.curlrc` with one line `ssl-no-revoke`,
  then export `CURL_HOME` for the install commands. (Or add `--ssl-no-revoke` per call.)
- **git**: prefix the clone with `-c http.schannelCheckRevoke=false` (scoped to that command).

> `forge`'s own downloader (svm for solc, release fetch) uses a Rust HTTP client — it does
> **not** hit the Schannel revocation wall. Only `curl`/`git` do.

### Install Foundry

```bash
# .curlrc with `ssl-no-revoke`, then:
export CURL_HOME=/path/to/dir/with/.curlrc
mkdir -p "$HOME/.foundry/bin"
curl -sSf -L "https://raw.githubusercontent.com/foundry-rs/foundry/HEAD/foundryup/foundryup" \
  -o "$HOME/.foundry/bin/foundryup"
chmod +x "$HOME/.foundry/bin/foundryup"
"$HOME/.foundry/bin/foundryup"          # downloads + attestation-verifies the toolchain
export PATH="$HOME/.foundry/bin:$PATH"   # forge is NOT auto-added to the running shell
forge --version                          # forge 1.7.1
```

### Reinstall forge-std (test infra; needed for the real fuzz + invariant suite)

Vendored as **plain files** (no submodule — keeps the parent repo's git structure clean and
avoids OneDrive submodule flakiness). Pinned commit: **`6e8c4a92c9a8b31c1b0f0c39296d1fa4695c7df8`**.

```bash
cd contracts
git clone -c http.schannelCheckRevoke=false --depth 1 \
  https://github.com/foundry-rs/forge-std lib/forge-std
rm -rf lib/forge-std/.git         # vendored as plain files
forge remappings                  # auto: forge-std/=lib/forge-std/src/
```

---

## The real build (next): `SeasonBountyPool`

Spec source of truth: `docs/reference/SEASONS_ORIGIN_HARVEST_AAA_BENCHMARK.md`
— **§0.7** (domain-tagged Merkle leaf: `(kind, chainId, address(this), roundId, account, amount)`;
a seal root is structurally unclaimable as a payout root), **§0.14-C** (Ownable2Step,
pause-only guardian, `claimFor` batches), **§0.17** (two buckets, seat-tier rounds — **never
dates**, snipe-proof seal, `rulesHash` anchored at deploy), **§8-1** (care protocol: full
Foundry suite → Fuji rehearsal → founder's signed mainnet deploy).

> **SUPERSEDED — do not use:** `docs/reference/season-merkle.reference.ts` is the ORIGIN leaf
> format (carries a stop banner). The S3 leaf is the domain-tagged §0.7 tuple.

Guardrails: merit never chance · USDC never SYN · company money never mixed with the 70/20/10 ·
rounds by seat-tier not dates · fail-closed · autonomous payment at mainnet, no legal gate
(SETTLED_RULES 8-8).
