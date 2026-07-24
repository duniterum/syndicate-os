# Slither triage — MeritDistributor (GREEN gate §9 [g])

**Run:** slither 0.11.5 · solc 0.8.28 · `--exclude-informational --exclude-low
--exclude-optimization` · 58 detectors over 15 contracts (MeritDistributor + OZ imports).
**Result: 0 high · 0 medium unresolved.** 3 findings, each triaged below in writing.

| # | Detector | Site | Triage |
|---|---|---|---|
| 1 | `incorrect-equality` | `conservationHolds()` strict `== totalFunded` | **INTENDED.** A diagnostic VIEW — its entire purpose is the exact identity check (the ghost-ledger invariant's on-chain twin). No money path branches on it. |
| 2 | `incorrect-equality` | `fund()` `credited == 0` | **INTENDED.** A zero-guard (`revert ZeroAmount`) on the balance-delta credit — the standard fail-closed check; not attacker-steerable logic. |
| 3 | `uninitialized-local` | `postRound()` `fromCarry` | **FIXED** (style): now explicitly `= 0` with the design comment (INTERIM never draws carryover). Solidity zero-initializes locals; the explicit form removes any reader doubt. |

**Halmos status:** install blocked on this box (safe-pysha3 build failure under managed
Python 3.12 — a known Windows wheel gap). Path recorded: retry under `uv --python 3.11`,
or run in WSL/CI for the GREEN-gate symbolic pass. Not a shipping blocker for S3-3.
**aderyn:** to be run alongside the halmos pass (Rust binary; same session).
