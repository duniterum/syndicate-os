# MeritDistributor — the frozen contract spec (S3)

*(product label for the season rail: **« Season Bounty Pool »**)*

**Status:** ✅ **FROZEN (v4)** — 6 senior lenses + **5 adversarial rounds** + a money-safety hunt +
an all-hats world-class consolidation (wf_888afcd6) + a final confirmation (wf_a8c9c21c: **0 blocking
items, both lenses READY-TO-FREEZE**). Verdict: **world-class, materially ahead of the audited
benchmarks.** This is the authoritative build spec; the 5 polish notes ride the `.sol` build.
**Authority:** `SEASONS_ORIGIN_HARVEST_AAA_BENCHMARK.md` §0.7 · §0.11–0.18 + §8 · `SETTLED_RULES` §8.
**Rule:** *names lie — read the `.sol`.*

ONE **immutable, audited, generic merit-payment distributor** (§0.12-②) — not season-only. The
season bounty is the first program; future campaigns ride the SAME contract as new rounds. **No
proxy, no upgradeability, ever** (§0.12-⑤). Contract name is **name-agnostic in the leaf** (uses
`address(this)`, never a string), so the label never touches consensus.

---

## 0. Guardrails (founder, non-negotiable)

merit≠chance · USDC≠SYN · company money≠70/20/10 · rounds by SEAT-TIER not dates (time only for
safety timers) · fail-closed · autonomous at mainnet + funded, **NO legal gate** (8-8) — honest
zero-click accounting (polish ruling 2026-07-24): the founder's recurring acts are **TWO**:
`fund()` at his cadence + ONE `setSeasonRules` signature per season (deliberate — a compromised
executor can never forge the rule sheet); both surfaced by the admin next-step engine + the
"era seals soon — season N+1 sheet not anchored" alarm; **members stay fully zero-click** ·
SUPERSEDED
`season-merkle.reference.ts` banned · structurally prevent drain-anytime-owner + global-claim-lockout.

---

## 1. The frozen leaf (byte-exact)

```
leaf = keccak256( bytes.concat( keccak256( abi.encode(
    uint8   kind,        // PAYOUT = 1, SEAL = 2 (nonzero; 0 invalid)
    uint256 chainId,     // block.chainid       — cross-deployment replay killed
    address pool,        // address(this)       — cross-deployment replay killed
    uint256 roundId,     // PAYOUT: the round · SEAL: = seasonId
    address account,     // the wallet
    uint256 amount       // PAYOUT: USDC 6-dec base units · SEAL: the wallet's season XP
) ) ) )
```
OZ `StandardMerkleTree` double-hash. `kind` = `uint8` (not `bytes1`). `claim()` hardcodes
`kind=PAYOUT`; seal roots (`kind=SEAL`) live in a separate mapping never passed to `claim()` —
seal≠payout is **structural**. **Differential fixture (hard gate)** rejects: `bytes1`-kind ·
single-hash · `abi.encodePacked` · wrong-chainId/pool/roundId/kind · **Σamount>budget** ·
**Σamount<budget** (under-sum, round-3+consolidation). Fixture generated against the real deploy
address via **CREATE2** (resolves the address-in-leaf chicken-and-egg), or two-phase (CI on a fixed
address, regenerate + re-verify against the live address before the first live root).

---

## 2. The 4-bucket ledger — per-season committed (consolidation must-fix #2)

The contract NEVER prices from `balanceOf`.

| Bucket | Meaning | Withdrawable? |
|---|---|---|
| `reserve` (global `uint128`) | company staging capital | YES — reserve-only, 72h public timelock |
| `committed[seasonId]` (per-season) | « Engager au pot » for that season — **irrevocable ratchet** | NO, ever |
| `roundReserved` (global) | budget of open rounds, member-bound, unpaid | NO (pays out / reverts to `committed[s]` on revoke) |
| `carryover` (global) | recycled unclaimed shares — **the cross-season recycle bucket** (§0.17-⑨) | NO — spendable by ANY round (this or a future season); never back to `reserve` |

Aggregate `totalCommitted = Σ_s committed[s]`. Ends: `totalFunded`, `totalPaid`, `totalWithdrawn`.

**Conservation (master invariant):**
`reserve + totalCommitted + roundReserved + carryover + totalPaid + totalWithdrawn == totalFunded`
plus `Σ_s committed[s] == totalCommitted`.

Because `committed` is **season-bound**, a third-party pre-fund lands in `committed[thatSeason]` and
**cannot enrich or drain any other season** — the old "sequential-season discipline" crutch is
**CLOSED, not disclosed** (consolidation #2). `balanceOf` is read only at `fund()` (balance-delta)
and `sweepStray()` (strays → `reserve`; `totalFunded += stray`).

### Public pot (read-model composition; contract stays minimal)
`publicPot(season) = committed[season] + (that season's open-round reserved) + carryover`;
`distributed = totalPaid`. **The monotone "never falls" quantity is
`totalCommitted + roundReserved + carryover + totalPaid`** (verified flat/increasing across every
mover; only `reserve`, outside it, falls via withdraw). The **GOAL** figure (aspirational,
non-binding, motivating) is **read-model-only — no on-chain goal field, ever** (enforced by a
read-model unit test); COMMITTED (on-chain) is what's guaranteed. Before the first
`Funded(committed)`: money-dark.

---

## 3. Roles & access-control matrix

`Ownable2Step` + `Pausable` + `ReentrancyGuard`. `SafeERC20`, `SafeCast`, `MerkleProof`.
Slots: **SEALER** (seal roots — no money), **EXECUTOR** (opens seasons/rounds, activates, pushes),
**GUARDIAN** (pause claims only) — separate, owner-rotatable.

| Function | Caller |
|---|---|
| `fund` | ANYONE (not pausable) |
| `setSeasonRules` | OWNER (anchors the rule-sheet hash — a compromised executor cannot forge it) |
| `openSeason` | EXECUTOR (autonomous; uses the owner-anchored rules) |
| `commitFromReserve` | OWNER (internal reserve→committed ratchet, no external transfer) |
| `postRound(…, isFinal)` | `isFinal` ⇒ OWNER · else ⇒ EXECUTOR |
| `revokeRound` | OWNER — `now < activateAfter`, phase ≠ CLOSED (a pending final round IS revocable) |
| `activate` | ANYONE — `now >= activateAfter` |
| `claim`/`claimFor`/`claimForBatch` | ANYONE (whenNotPaused) · `pushOne` | self only |
| `verifyClaim` | view |
| `sealSeason` | SEALER · `sealCorrect` | OWNER (once, within window) |
| `announceWithdrawal`/`withdrawUnallocated` | OWNER (reserve only) |
| `sweepStray` | ANYONE · `sweepExpired` | ANYONE (whenNotPaused) |
| `rescueForeignToken` | OWNER (token ≠ USDC) |
| `pause` | OWNER or GUARDIAN · `unpause` | OWNER, or ANYONE after `MAX_PAUSE` |
| `rotateSealer/Executor/Guardian` | OWNER (reject `address(0)`) |
| `acceptOwnership` | pending owner |

**OWNER = a 2-of-3 Gnosis Safe** (founder + 2 independent geographically-distributed keys), set via
`Ownable2Step` — the **decided** answer to both abandonment AND single-key diversion, at **zero
contract cost** (consolidation ruling; emergencyClaim REJECTED). Deploy single-key → founder
`acceptsOwnership` → **transfer to the Safe EARLY** (a GREEN-gate-adjacent step, not "later").
**No key can freeze the engine/claims:** `activate`-after-timeout + `unpause`-after-`MAX_PAUSE`.

---

## 4. Round lifecycle — unified `postRound` + `SeasonPhase` enum (consolidation #4, simplifications)

`enum SeasonPhase { NONE, OPEN, FINAL_PENDING, CLOSED }` (illegal states unrepresentable — replaces
the two bools). `enum RoundState { NONE, PENDING, ACTIVE, EXPIRED, REVOKED }`.

```
setSeasonRules(seasonId, rulesHash) [OWNER]  →  openSeason(seasonId) [EXECUTOR]  → phase = OPEN
    (season 1: constructor sets rules + phase OPEN + emits SeasonOpened(1))

postRound(roundId, root, budget, uri, isFinal)   // isFinal⇒OWNER, else⇒EXECUTOR
    seasonId = roundId/1000; require phase==OPEN && seasonRulesHash!=0 && rounds[roundId].root==0
    avail = committed[seasonId] + carryover; require 0 < budget <= avail
    fromCommitted = min(budget, committed[seasonId]); fromCarry = budget - fromCommitted
    committed[seasonId] -= fromCommitted; totalCommitted -= fromCommitted; carryover -= fromCarry
    roundReserved += budget; activateAfter = now + PENDING_DELAY; pausedSnapshot = pausedAccum
    if isFinal: phase = FINAL_PENDING
    emit PendingRound(roundId, seasonId, root, budget, uri, rulesHash, isFinal)
    // SEASON-CLOSE ROUND (the era-boundary payout — distinct from sealSeason/kind=SEAL, the
    //   moneyless XP fingerprint) = executor postRound(isFinal=false, budget=committed[s]+carryover)
    //   → recycles carryover every season (must-fix #1). INTERIM = executor, partial budget.
    //   FINAL = owner, early-exit valve, terminal (FINAL_PENDING→CLOSED).
revokeRound(roundId) [OWNER, now<activateAfter, phase≠CLOSED]:
    roundReserved -= budget; committed[seasonId] += budget; totalCommitted += budget
    if isFinal: phase = OPEN                       // carryover portion merges into committed[s]
activate(roundId) [ANYONE, now>=activateAfter]:
    state = ACTIVE; expiresAt = now + CLAIM_EXPIRY; if isFinal: phase = CLOSED
claim/claimFor [before effectiveExpiry]:
    require paid + amount <= budget                // per-round fence (round-3)
    paid += amount; roundReserved -= amount; totalPaid += amount; safeTransfer
sweepExpired(roundId) [ANYONE, whenNotPaused, now > effectiveExpiry]:
    roundReserved -= (budget-paid); carryover += (budget-paid); state = EXPIRED
```

- **Carryover recycles under the zero-click default** (must-fix #1): the season-close round draws
  `committed[s] + carryover`, so unclaimed money re-enters the pot every season — not stranded.
  *Hardening — ADOPTED (arbitrated 2026-07-24, full-system consolidation):* **a season auto-closes
  once its close-round drains `committed[s]` to 0** (the cheap structural fix — a long-over season
  can no longer be re-posted to draw current global carryover). The on-chain era gate
  (`seasonId == eraForSeatCount`) stays REJECTED (an oracle dependency the read-model alarm covers).
  *Executor behavior (off-chain, recorded):* when a season seals with `committed[s]+carryover == 0`,
  the executor SKIPS the close round (§5 `postRound` rejects `ZeroBudget`) and the read-model's
  lifecycle map treats sealed+zero-budget as terminal-for-money — a zero-pot season still seals
  (moneyless `sealSeason`) and never hangs OPEN.
- **Root IMMUTABLE once set** (`RootAlreadySet`, even owner). **Final round keeps its veto**
  (`FINAL_PENDING` at posting blocks new rounds but not its own `revokeRound`; `CLOSED` at
  activation is terminal — no resurrection).
- **`effectiveExpiry = expiresAt + (pausedAccum − round.pausedSnapshot)`** — per-round paused
  OVERLAP only (simplification: the **raw/absolute** `pausedAccum` is NOT added — only the per-round
  overlap `(pausedAccum − round.pausedSnapshot)` counts, killing the "late round inherits a
  near-infinite window" recycling bug). `sweepExpired` is `whenNotPaused`.
- **Timestamps for every safety timer**; immutable constructor params with **MIN/MAX bound asserts
  on ALL of them** (pendingDelay MIN+MAX, claimExpiry MIN+MAX, reserveTimelock MIN+MAX,
  correctionWindow MIN+MAX, maxPause MIN+MAX) **and** `pendingDelay ≥ reserveTimelock` (must-fix #7).
  Safety timers ≠ round cadence (off-chain/seat-tier).
- **Trailing final-window XP:** the final round's snapshot captures **ALL XP up to season close**
  (the explicit EXCEPTION to "XP in a pending window belongs to the next window") — no last-minute
  contributor is zeroed (consolidation #11). Differential fixture asserts `block<sealBlock` vs
  `sealBlock`.

---

## 5. Function signatures (frozen) — key deltas from v3

```solidity
constructor(address usdc, address sealer_, address executor_, address guardian_,
            uint64 pendingDelay, uint64 claimExpiry, uint64 reserveTimelock,
            uint64 correctionWindow, uint64 maxPause, bytes32 season1RulesHash);
    // decimals()==6; MIN/MAX bound asserts on all 5 timers; pendingDelay>=reserveTimelock;
    // seasonRulesHash[1]=…; seasonPhase[1]=OPEN; emit SeasonOpened(1, …)

enum Bucket { RESERVE, COMMITTED }
fund(uint128 amount, Bucket dest, uint256 seasonId) external nonReentrant;
    // balance-delta credit via SafeCast; COMMITTED requires seasonPhase[seasonId]==OPEN
    //   (rejects closed/nonexistent season — must-fix #3); RESERVE season-agnostic
setSeasonRules(uint256 seasonId, bytes32 rulesHash) external onlyOwner;   // before its first round
openSeason(uint256 seasonId) external onlyExecutor;      // seasonId>1; uses owner-anchored rules
commitFromReserve(uint128 amount, uint256 seasonId) external onlyOwner;   // reserve→committed ratchet
postRound(uint256 roundId, bytes32 root, uint128 budget, string uri, bool isFinal) external;
    // isFinal⇒onlyOwner else onlyExecutor; carries isFinal in the event (indexer replay, must-fix #4)
revokeRound(uint256 roundId) external onlyOwner;
activate(uint256 roundId) external;
claim(...) / claimFor(...) external nonReentrant whenNotPaused;   // -> _claim (per-round fence + SafeCast)
claimForBatch(...) external whenNotPaused;   // try this.pushOne {} catch { emit ClaimSkipped }
pushOne(...) external nonReentrant;          // require msg.sender==address(this)
verifyClaim(...) external view returns (bool);
sealSeason(uint256 seasonId, bytes32 xpRoot, string uri) external onlySealer;   // no money
sealCorrect(uint256 seasonId, bytes32 xpRoot) external onlyOwner;               // once, within window
announceWithdrawal(address to, uint128 amount) external onlyOwner;
withdrawUnallocated() external onlyOwner nonReentrant;   // require pw.amount!=0 && now>=pw.readyAt;
    // reserve-=a; totalWithdrawn+=a; delete pw   (each withdraw needs a fresh 72h notice)
sweepStray() external;   // stray = balanceOf - (reserve+totalCommitted+roundReserved+carryover) -> reserve; totalFunded+=stray
sweepExpired(uint256 roundId) external whenNotPaused;
rescueForeignToken(address token, address to) external onlyOwner;   // require token != address(USDC)
pause() external;   // OWNER|GUARDIAN; pausedAt=now
unpause() external; // OWNER, or ANYONE if now>=pausedAt+MAX_PAUSE; pausedAccum += now-pausedAt; emit Unpaused(by, pausedAccum)
rotateSealer/rotateExecutor/rotateGuardian(address) external onlyOwner;

// views: publicPot(seasonId) · distributed()=totalPaid · reserveBucket() · carryoverBucket() ·
//   roundInfo(roundId) · isClaimed(roundId,account) · seasonRulesHash(seasonId) · seasonPhase(seasonId) ·
//   conservationHolds() · + the 5 TIMER GETTERS (pendingDelay/claimExpiry/reserveTimelock/
//   correctionWindow/maxPause — polish ruling 2026-07-24: §10's deadline displays render from
//   chain, so the immutables must be publicly readable)
```

**DEPLOY PARAMS (arbitrated 2026-07-24; engineering proposes, the founder confirms in ONE plain
line at mainnet):** `PENDING_DELAY = 72h` (a 48h proposal was REFUSED — it breaches the
constructor-asserted `pendingDelay ≥ reserveTimelock`) · `RESERVE_TIMELOCK = 72h` ·
`CORRECTION_WINDOW = 7d` · `MAX_PAUSE = 14d` · `CLAIM_EXPIRY = 2y`. The 48h interim
**pre-announcement** is a SEPARATE off-chain clock, ADDITIVE to the ≥72h on-chain pending window
(two different quantities, both stated in founder-facing copy).

**Storage:** globals `reserve, roundReserved, carryover, totalFunded, totalPaid, totalWithdrawn,
totalCommitted` (uint128) · `mapping(uint256=>uint128) committed` · `Round{bytes32 root; uint128
budget; uint128 paid; uint64 activateAfter; uint64 expiresAt; uint64 pausedSnapshot; RoundState
state; bool isFinal;}` · `mapping(uint256=>Round) rounds` · `mapping(uint256=>mapping(address=>bool))
claimed` · `mapping(uint256=>bytes32) seasonRulesHash` · `mapping(uint256=>SeasonPhase) seasonPhase`
· `mapping(uint256=>bytes32) sealRoot` · `mapping(uint256=>uint64) sealTime` ·
`mapping(uint256=>bool) sealCorrected` · `PendingWithdrawal pw` · `uint64 pausedAccum, pausedAt` ·
role slots · immutables. **SafeCast.toUint128 at every `uint256→uint128` money boundary** (must-fix #8).

**Custom-error catalog (full — GREEN gate [e] needs it):** `NotUSDCDecimals6, TimerOutOfBounds,
SeasonAlreadyOpen, SeasonNotOpen, PhaseWrong, NotExecutor, NotSealer, NotGuardian, RoundExists,
RootAlreadySet, ZeroRoot, ZeroBudget, InsufficientAvailable, NotPending, TooEarly, TooLate,
AlreadyClaimed, ExceedsBudget, AmountTooLarge, SealExists, CorrectionWindowClosed, ReserveOnly,
TimelockNotReady, NothingAnnounced, ForeignTokenOnly, NotSelf, ZeroAddress` (onlyOwner reuses OZ
`OwnableUnauthorizedAccount`; the role guards get their own selectors so GREEN gate [e]'s
"every negative-role revert with a matched selector" is satisfiable).

---

## 6. Events (all filter-keys indexed — must-fix #4/#5, best-practice)

`SeasonOpened(uint256 indexed seasonId, bytes32 rulesHash)` · `SeasonRulesSet(uint256 indexed
seasonId, bytes32 rulesHash)` · `Funded(address indexed from, uint128 amount, Bucket indexed bucket,
uint256 indexed seasonId)` · `CommittedFromReserve(uint256 indexed seasonId, uint128 amount)` ·
`PendingRound(uint256 indexed roundId, uint256 indexed seasonId, bytes32 root, uint128 budget,
string uri, bytes32 rulesHash, bool isFinal)` · `RoundActivated(uint256 indexed roundId, uint64
expiresAt)` · `RoundRevoked(uint256 indexed roundId)` · `Claimed(uint256 indexed roundId, address
indexed account, uint128 amount)` · `ClaimSkipped(uint256 indexed roundId, address indexed account,
bytes reason)` · `SeasonSealed(uint256 indexed seasonId, bytes32 xpRoot, string uri)` ·
`SealCorrected(uint256 indexed seasonId, bytes32 oldRoot, bytes32 newRoot)` · `TimelockAnnounced` ·
`Withdrawal` · `CarryoverMoved(uint256 indexed roundId, uint128 amount)` · `SweptToReserve` ·
`ForeignTokenRescued(address indexed token, address indexed to, uint256 amount)` · `Paused(address
by)` / `Unpaused(address by, uint64 pausedAccum)` · rotations · Ownable2Step's. **The event log
alone rebuilds `committed[seasonId]`, `totalCommitted`, round phases, and the published deadline.**

---

## 7. Honest limitations (disclosed in full — consolidation #6, #11, forgotten-source)

- **Payout correctness is PUBLICLY verifiable during the window (founder ruling 2026-07-24: "on
  montre — sur la blockchain tout est visible"; wallet addresses are public chain data, every claim
  emits them on Snowtrace anyway).** The round's published file carries the **FULL
  `(rank, address, XP, amount)` rows**; its own keccak rides `PendingRound.uri`. ANYONE can rebuild
  the Merkle tree from the file and match the on-chain root — **Merkl-grade permissionless
  recomputation**: a phantom leaf or a wrong share is publicly detectable during `PENDING_DELAY`,
  not merely owner-vetoable. The residual trust surface shrinks to the XP standings themselves (the
  off-chain ledger's output — auditable against the sealed XP roots + the committed season files);
  the owner veto stays the correction lever; `rulesHash` on `PendingRound` makes deviation
  attributable; the rule-sheet is **owner-anchored** so a compromised executor can't self-forge it.
  Short form remains OUR surfaces' rendering convention (readability, never concealment); the red
  line is name/alias/email — never wallet addresses.
- **Operator/owner inaction:** already-posted claims can NEVER be frozen (permissionless
  activate/unpause), so the only residual is "the owner never posts the closing round" — reduced by
  the **2-of-3 Safe** to "multiple independent hardware keys vanish at once" (negligible), backed by
  executor-gas + stalled-round alarms (below). **No on-chain emergency path is added.**
- **Over-commit has no undo** — `fund(COMMITTED)` is irrevocable; commit progressively (§8).
- **Terminal-era residual:** unclaimed money after the very last era's final sweep is permanently
  non-withdrawable (never an owner-drain vector). Autonomous carryover recycling (must-fix #1) means
  this is bounded to the LAST era only.
- **USDC is a Circle-controlled upgradeable proxy:** a claimant blacklist recycles that share; a
  **pool-address blacklist** freezes all payouts + reserve at once (external tail risk, USDC-only
  guardrail bars multi-asset). A custodial/exchange payout address receives on-chain but may be
  unspendable (prevented at seat-purchase, not in the contract).
- **`sealCorrect`** lets the OWNER change a sealed XP root ONCE within `CORRECTION_WINDOW` (moves no
  money, event-trailed).

---

## 8. The commit-progressively doctrine (founder, the 1M/10-people question)

**The contract pays what you commit; it never decides how much.** The seal round pays 100% of the
season's committed pot to the standings — so **never commit more than you're happy to see fully paid
to whoever earned it.** Commit **progressively**, at the rhythm of participation (§0.17 "the pot
fills during the era"); **giving more later is always allowed, taking never** (§0.17-⑦). Show an
aspirational **GOAL** (big, motivating, non-binding) separate from **COMMITTED** (real, irrevocable).
→ If era 9 has 10 small-action people, you'd have committed a **small** pot; they share a small pot,
proportional to reality. The 1M-to-10 case only arises from over-committing, which the model gives no
reason to do. The long-era / L1-migration answer is the **exit valve** (§0.16-③, §0.17-⑨): commit is
PAID via the final round, then the chain moves; the old chain keeps its history; cross-chain replay
is impossible by construction.

---

## 9. Invariants + GREEN gate (grade-AAA test stack)

**Invariants (Foundry stateful ≥50k/depth25, ghost-ledger):** `conservation`
(`…+totalWithdrawn==totalFunded`) · `committedAggregate` (`Σ committed[s]==totalCommitted`) ·
`ratchetMonotone` (`totalCommitted+roundReserved+carryover+totalPaid` non-decreasing) ·
`committedNeverWithdrawn` · `paidLeqBudgetPerRound` (enforced by the §5 fence) · `noCrossSeasonDraw`
(a round draws only its own season's committed + global carryover) · `claimedFlagsMonotone` ·
`rootImmutable` · `carryoverNeverEntersReserve` · `sealRootUnclaimable` · `noRandomnessInPayout` ·
`seasonTerminal` · `pauseNeverBurnsWindow` · `balanceGeUnclaimed` (fork, real USDC:
`balanceOf ≥ reserve+totalCommitted+roundReserved+carryover`) · `callDistribution` meta-invariant.

**GREEN gate (engineering only — §8-1):** all tests green · invariants pass, zero failing corpus ·
branch 100% money+access, line ≥95% · **Halmos symbolic proof** of conservation/ratchet/aggregate ·
**Murky in-Solidity proof-forgery fuzzing** + the checked-in JS differential fixture (with the
Σ>budget AND Σ<budget negative cases) · **mutation testing ≥90% killed** on money+access · every
negative-role revert with matched custom-error selectors · gas snapshot · **slither + aderyn zero
high/medium** · fork-test a Circle blacklist on the POOL itself · **exact pinned toolchain** (single
pragma e.g. `0.8.26`, committed `foundry.toml` with optimizer runs + `evm_version` matched to
Avalanche C-Chain, bytecode-provenance check) · **MAINNET-FORK REHEARSAL over TWO full season
lifecycles** (founder ruling 2026-07-24: "on déploie directement sur mainnet" — the Fuji testnet
detour is DROPPED; the rehearsal runs on an **anvil fork of Avalanche C-Chain**: the REAL USDC
contract, the REAL chain state — stronger than any testnet, and time-warpable so the strict timer
bounds never need loosening) proving `committed[season1]` is untouched by season2's round, plus
`rescueForeignToken`, an under-sum root, non-owner `unpause`-after-`MAX_PAUSE`, executor-stall
`activate`-by-anyone, and `sealCorrect` — each event-asserted; **the founder rehearses his acts
(acceptOwnership · fund · one revoke) on the REAL console screens, rig pointed at the fork**
(rig-only env config, fail-closed, never in the prod build). Then: the founder's signed **mainnet
deploy** → post-deploy verification BEFORE `acceptOwnership` (bytecode provenance vs the pinned
toolchain · timers/roles/USDC read back on-chain · the differential fixture regenerated two-phase
against the LIVE address and verified) → `acceptOwnership` → **early transfer to the 2-of-3 Safe**
→ **THE MAINNET CANARY** (the live rehearsal, real USDC, bounded blast radius): a TINY « Engager »
amount (founder's call) → ONE real canary round end-to-end ON MAINNET (post → public window — the
phone-veto drill happens here → activate → claimForBatch → `Claimed` verified on Snowtrace → the
member bell observed live) → only then the Season-1 scale funding.

---

## 10. Off-chain + read-model (rides the S3 slice — heartbeat invariant)

- **`season-merkle` v2** (OZ `StandardMerkleTree`): `buildSealRoot` (kind=SEAL, roundId=seasonId) ·
  `buildPayoutRoot` (kind=PAYOUT) — asserts `Σamount==budget` (the on-chain per-round fence is the
  trustless backstop), fork-dry-runs `verifyClaim`, emits the differential fixture + the
  **FULL-ADDRESS `(rank, address, XP, amount)` published file** (founder ruling 2026-07-24: chain
  data is public, we SHOW — full permissionless root recomputation by anyone; the file's own keccak
  rides `PendingRound.uri`; the rule-sheet hash is the separate `rulesHash` — two artifacts, two
  hashes). Ship `season-merkle verify <pendingRound>` — runnable by ANYONE, not just us.
- **`seasonPotReadmodel`** folds the event log into the per-season 4-bucket ledger (event-only, never
  `balanceOf`; fail-closed to last-good). **Season lifecycle** PLANNED→LIVE→SEALED→ROOT_COMMITTED→
  PUBLISHED mapped to its event sources (SEALED = off-chain transient; ROOT_COMMITTED = `SeasonSealed`)
  (forgotten-source #6).
- **Autonomy monitoring (must-fix #9, §0.15):** executor-wallet AVAX balance + low-gas alert, a
  `roundReserved>0 past expected seal / after expiry+sweep` alarm, and a **dispute-window admin panel**
  (per-PENDING-round standings + a server-computed recompute-vs-on-chain-root **MATCH/MISMATCH
  verdict** as the founder's one-glance check — the PUBLIC independently recomputes the full tree
  from the full-address published file (founder ruling 2026-07-24), so the verdict is a convenience,
  never the only check — + the 4-bucket view + pending-withdrawal `readyAt` + `conservationHolds`)
  so the owner veto is exercisable.
- **`rulesHash` completeness (forgotten-source #2):** hashes curve % + per-source caps + interim
  policy + **hors-concours list** + floors (expand §12 accordingly), not just amount/weights/floors.
- **Bindings policed by the read-model** (can't be enforced on-chain): every `SeasonOpened.seasonId
  == eraForSeatCount(block)` (§8-5) — alarm on mismatch; the published deadline renders from on-chain
  `CLAIM_EXPIRY` only (retrue the dossier's stale "1 year" → **2 years**).
- **Heartbeat completeness:** pool + **executor + sealer + guardian + founder-funding** wallets JOIN
  `protocolTargets`/`verifyLinks` (infrastructure only) + `Claimed` on `/activity`. Snowtrace via the
  central `EXPLORER_BASE`.
- **Three figures, three authorities, never reconciled:** `buildersEarning` · `seats` · `paidSlots`.

---

## 11. Rejected alternatives (documented so no future session re-adds them)

- **On-chain `emergencyClaim` — REJECTED** (unanimous consolidation): would break seal≠payout, pay a
  non-curve distribution, double the immutable audit surface, reopen a committed drain path. Abandonment
  is handled by the **2-of-3 Safe + permissionless activate/unpause + monitoring alarms** at zero
  contract cost.
- **Cumulative Merkl/Morpho trees** — the HIGH-CADENCE scale path only (they double-count our delta
  windows + add a live-root-updater trust point). Per-round roots are correct for our cadence.
- **ERC-2612 permit on `fund()`** — omitted (rare manual founder act, adds signature-replay surface).
- **Contract `goal` field** — never; GOAL is read-model-only.
- **`rescueForeignToken` for USDC** — never; strictly `token != USDC` (keeps "committed never withdrawn").

---

## 12. Founder-money inputs (the rulesHash — NOT a build blocker)

INPUTS to the off-chain `seasonConfig` (hashed into `rulesHash`), never contract structure: the
FULL §0.17-⑦ sheet — « Engager au pot » amount + cadence · the Option-A curve % + per-source caps +
interim policy · **the hors-concours list** · the XP weight table (+ footprint-rung XP) · the floor
pair (min qualifying purchase, min XP for paid bands, $20 min-cash). Claim window **2 years**
(`CLAIM_EXPIRY`, a deploy param). They set what the policy module computes; they don't gate the build.
