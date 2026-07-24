// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

/// @title MeritDistributor — the Syndicate OS merit-payment rail (product label: « Season Bounty Pool »)
/// @notice ONE immutable, generic merit-payment distributor. Escrows company USDC and pays
///         builders by rank via per-round Merkle roots. Season bounty rounds are the first
///         program; future campaigns ride the SAME contract as new rounds — never a new one.
///         No proxy, no upgradeability, ever: immutability is the product.
///
/// @dev THE SPEC IS LAW: docs/reference/MERITDISTRIBUTOR_CONTRACT_SPEC.md (FROZEN v4).
///      Execution plan: docs/reference/S3_SEASON_CASH_RAIL_MASTER_PLAN.md.
///
///      S3-1 REALIZATION NOTES (the arbiter's recorded calls — "names lie, read the .sol"):
///      1. `RoundClass {INTERIM, CLOSE, FINAL}` realizes the spec's unified postRound + the
///         ADOPTED auto-close-on-drain hardening WITHOUT the interim false-positive: an
///         INTERIM (executor) draws committed[season] ONLY and never touches carryover nor
///         the season phase — so an interim that happens to drain committed to zero never
///         wrongly closes a live season. CLOSE (executor — the automatic season-close /
///         era-seal payout) and FINAL (owner — the §0.17-⑨ early-exit valve) both pay
///         committed[season] + carryover ENTIRELY (budget must equal that sum), set
///         FINAL_PENDING at posting (keeping their own revoke window — the round-3 veto fix)
///         and CLOSED at activation (terminal). A stale season can never be resurrected to
///         draw live carryover: only CLOSE/FINAL touch carryover, and both end the season.
///      2. `pausedSnapshot` is taken at ACTIVATION (not posting): the claim window starts at
///         activation, so only pauses overlapping the round's OWN active window extend it.
///      3. `fund(RESERVE)` requires seasonId == 0 (explicit, fail-closed); COMMITTED requires
///         the season OPEN — funding a closed or nonexistent season is structurally impossible.
///      4. `openSeason` does NOT require the previous season CLOSED on-chain: per-season
///         committed[] already quarantines every season's money structurally, and a zero-pot
///         season legitimately stays OPEN (the executor skips a zero-budget close round; the
///         read-model's lifecycle map treats sealed+zero-budget as terminal-for-money). The
///         seasonId==era binding is policed by the read-model alarm (spec §10).
///      5. OZ Pausable emits Paused/Unpaused(address); the additional ClaimsUnpaused event
///         carries the cumulative pausedAccum the indexer needs (spec must-fix, event-only
///         read-model). Pause freezes claim paths + sweepExpired ONLY — fund, postRound,
///         activate, revoke, seals and withdrawals never sit behind the pause.
///      6. Native AVAX force-lodged via selfdestruct is unrecoverable by design (no receive,
///         no native rescue — surface minimalism); rescueForeignToken covers ERC-20 strays,
///         USDC strays route to `reserve` via sweepStray.
contract MeritDistributor is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeCast for uint256;

    // ─────────────────────────────── Types ───────────────────────────────

    enum Bucket {
        RESERVE,
        COMMITTED
    }

    enum RoundState {
        NONE,
        PENDING,
        ACTIVE,
        EXPIRED,
        REVOKED
    }

    enum SeasonPhase {
        NONE,
        OPEN,
        FINAL_PENDING,
        CLOSED
    }

    enum RoundClass {
        INTERIM, // executor · draws committed[season] only · no phase change
        CLOSE, //   executor · the automatic season-close payout · committed+carryover · terminal
        FINAL //    owner    · the early-exit valve (§0.17-⑨)   · committed+carryover · terminal
    }

    struct Round {
        bytes32 root; //          immutable once set — even for the owner
        uint128 budget;
        uint128 paid;
        uint64 activateAfter; //  posting time + PENDING_DELAY (the public dispute window)
        uint64 expiresAt; //      activation time + CLAIM_EXPIRY (0 while PENDING)
        uint64 pausedSnapshot; // pausedAccum at activation (per-round pause overlap)
        RoundState state;
        RoundClass class;
    }

    struct PendingWithdrawal {
        address to;
        uint128 amount;
        uint64 readyAt;
    }

    // ─────────────────────────────── Leaf kinds ───────────────────────────────

    /// leaf = keccak256(bytes.concat(keccak256(abi.encode(
    ///     uint8 kind, uint256 chainId, address pool, uint256 roundId, address account, uint256 amount))))
    /// A SEAL root is structurally unclaimable as a payout root: the kind byte differs
    /// inside the pre-image and claim paths hardcode KIND_PAYOUT.
    uint8 public constant KIND_PAYOUT = 1;
    uint8 public constant KIND_SEAL = 2;

    // ──────────────────── Timer bounds (immutable-footgun rails) ────────────────────

    uint64 public constant MIN_PENDING_DELAY = 1 hours;
    uint64 public constant MAX_PENDING_DELAY = 30 days;
    uint64 public constant MIN_CLAIM_EXPIRY = 30 days;
    uint64 public constant MAX_CLAIM_EXPIRY = 5 * 365 days;
    uint64 public constant MIN_RESERVE_TIMELOCK = 1 hours;
    uint64 public constant MAX_RESERVE_TIMELOCK = 30 days;
    uint64 public constant MIN_CORRECTION_WINDOW = 1 days;
    uint64 public constant MAX_CORRECTION_WINDOW = 90 days;
    uint64 public constant MIN_MAX_PAUSE = 1 days;
    uint64 public constant MAX_MAX_PAUSE = 90 days;

    // ─────────────────────────────── Immutables ───────────────────────────────

    IERC20 public immutable USDC;
    uint64 public immutable PENDING_DELAY; //     ≥ RESERVE_TIMELOCK (the members' veto window
    //                                            is never weaker than the company's own timelock)
    uint64 public immutable CLAIM_EXPIRY;
    uint64 public immutable RESERVE_TIMELOCK;
    uint64 public immutable CORRECTION_WINDOW;
    uint64 public immutable MAX_PAUSE;

    // ──────────────── The bucket ledger (never priced from balanceOf) ────────────────
    // Conservation: reserve + totalCommitted + roundReserved + carryover
    //               + totalPaid + totalWithdrawn == totalFunded
    // Ratchet (never falls): totalCommitted + roundReserved + carryover + totalPaid

    uint128 public reserve;
    uint128 public roundReserved;
    uint128 public carryover;
    uint128 public totalCommitted;
    uint128 public totalFunded;
    uint128 public totalPaid;
    uint128 public totalWithdrawn;
    mapping(uint256 seasonId => uint128) public committed;

    // ─────────────────────────────── Rounds + claims ───────────────────────────────

    mapping(uint256 roundId => Round) public rounds;
    /// Per-(roundId, account) — NO global lockout: an account claims independently across rounds.
    mapping(uint256 roundId => mapping(address account => bool)) public claimed;

    // ─────────────────────────────── Seasons ───────────────────────────────

    mapping(uint256 seasonId => bytes32) public seasonRulesHash;
    mapping(uint256 seasonId => SeasonPhase) public seasonPhase;

    // ──────────────────────── Seals (moneyless XP fingerprints) ────────────────────────

    mapping(uint256 seasonId => bytes32) public sealRoot;
    mapping(uint256 seasonId => uint64) public sealTime;
    mapping(uint256 seasonId => bool) public sealCorrected;

    // ─────────────────────────────── Reserve withdrawal ───────────────────────────────

    PendingWithdrawal public pendingWithdrawal;

    // ─────────────────────────────── Pause accounting ───────────────────────────────

    uint64 public pausedAccum;
    uint64 public pausedAt;

    // ─────────────────────────────── Role slots ───────────────────────────────

    address public sealer; //   seal roots only — no money power
    address public executor; // opens seasons, posts INTERIM/CLOSE rounds, pushes claims
    address public guardian; // pause claims only

    // ─────────────────────────────── Events ───────────────────────────────

    event SeasonOpened(uint256 indexed seasonId, bytes32 rulesHash);
    event SeasonRulesSet(uint256 indexed seasonId, bytes32 rulesHash);
    event Funded(address indexed from, uint128 amount, Bucket indexed bucket, uint256 indexed seasonId);
    event CommittedFromReserve(uint256 indexed seasonId, uint128 amount);
    event PendingRound(
        uint256 indexed roundId,
        uint256 indexed seasonId,
        bytes32 root,
        uint128 budget,
        string uri,
        bytes32 rulesHash,
        RoundClass class
    );
    event RoundActivated(uint256 indexed roundId, uint64 expiresAt);
    event RoundRevoked(uint256 indexed roundId);
    event Claimed(uint256 indexed roundId, address indexed account, uint128 amount);
    event ClaimSkipped(uint256 indexed roundId, address indexed account, bytes reason);
    event SeasonSealed(uint256 indexed seasonId, bytes32 xpRoot, string uri);
    event SealCorrected(uint256 indexed seasonId, bytes32 oldRoot, bytes32 newRoot);
    event TimelockAnnounced(address indexed to, uint128 amount, uint64 readyAt);
    event Withdrawal(address indexed to, uint128 amount);
    event CarryoverMoved(uint256 indexed roundId, uint128 amount);
    event SweptToReserve(uint128 amount);
    event ForeignTokenRescued(address indexed token, address indexed to, uint256 amount);
    event ClaimsUnpaused(address indexed by, uint64 pausedAccum);
    event SealerRotated(address indexed previous, address indexed next);
    event ExecutorRotated(address indexed previous, address indexed next);
    event GuardianRotated(address indexed previous, address indexed next);

    // ─────────────────────────────── Errors ───────────────────────────────

    error NotUSDCDecimals6();
    error TimerOutOfBounds();
    error ZeroAddress();
    error ZeroAmount();
    error ZeroRoot();
    error ZeroBudget();
    error ZeroRulesHash();
    error NotExecutor();
    error NotSealer();
    error NotGuardian();
    error NotSelf();
    error SeasonAlreadyOpen();
    error SeasonNotOpen();
    error SeasonRulesNotSet();
    error RulesAlreadySet();
    error PhaseWrong();
    error MalformedRoundId();
    error RoundExists();
    error InsufficientAvailable();
    error BudgetMismatch();
    error NotPending();
    error TooEarly();
    error TooLate();
    error RoundNotActive();
    error RoundExpired();
    error AlreadyClaimed();
    error ExceedsBudget();
    error AmountTooLarge();
    error BadProof();
    error LengthMismatch();
    error SealExists();
    error SealMissing();
    error AlreadyCorrected();
    error CorrectionWindowClosed();
    error InsufficientReserve();
    error NothingAnnounced();
    error TimelockNotReady();
    error ForeignTokenOnly();
    error PauseNotExpired();
    error ReserveIsSeasonAgnostic();

    // ─────────────────────────────── Constructor ───────────────────────────────

    /// @dev Atomic: no unset-role window, fail-closed from block 0. Season 1's rulesHash is
    ///      anchored AT DEPLOY (the one-season accommodation — S1 opened before any contract
    ///      existed); every later season anchors via setSeasonRules + openSeason.
    constructor(
        address usdc_,
        address sealer_,
        address executor_,
        address guardian_,
        uint64 pendingDelay_,
        uint64 claimExpiry_,
        uint64 reserveTimelock_,
        uint64 correctionWindow_,
        uint64 maxPause_,
        bytes32 season1RulesHash
    ) Ownable(msg.sender) {
        if (
            usdc_ == address(0) || sealer_ == address(0) || executor_ == address(0)
                || guardian_ == address(0)
        ) revert ZeroAddress();
        if (IERC20Metadata(usdc_).decimals() != 6) revert NotUSDCDecimals6();
        if (pendingDelay_ < MIN_PENDING_DELAY || pendingDelay_ > MAX_PENDING_DELAY) {
            revert TimerOutOfBounds();
        }
        if (claimExpiry_ < MIN_CLAIM_EXPIRY || claimExpiry_ > MAX_CLAIM_EXPIRY) {
            revert TimerOutOfBounds();
        }
        if (reserveTimelock_ < MIN_RESERVE_TIMELOCK || reserveTimelock_ > MAX_RESERVE_TIMELOCK) {
            revert TimerOutOfBounds();
        }
        if (correctionWindow_ < MIN_CORRECTION_WINDOW || correctionWindow_ > MAX_CORRECTION_WINDOW)
        {
            revert TimerOutOfBounds();
        }
        if (maxPause_ < MIN_MAX_PAUSE || maxPause_ > MAX_MAX_PAUSE) revert TimerOutOfBounds();
        // The members' public dispute window is never weaker than the company's own timelock.
        if (pendingDelay_ < reserveTimelock_) revert TimerOutOfBounds();
        if (season1RulesHash == bytes32(0)) revert ZeroRulesHash();

        USDC = IERC20(usdc_);
        sealer = sealer_;
        executor = executor_;
        guardian = guardian_;
        PENDING_DELAY = pendingDelay_;
        CLAIM_EXPIRY = claimExpiry_;
        RESERVE_TIMELOCK = reserveTimelock_;
        CORRECTION_WINDOW = correctionWindow_;
        MAX_PAUSE = maxPause_;

        seasonRulesHash[1] = season1RulesHash;
        seasonPhase[1] = SeasonPhase.OPEN;
        emit SeasonOpened(1, season1RulesHash);
    }

    // ─────────────────────────────── Funding ───────────────────────────────

    /// @notice Permissionless. COMMITTED = « Engager au pot » — the irrevocable ratchet for
    ///         that season. RESERVE = company staging capital (seasonId must be 0).
    /// @dev Balance-delta credit (correct under any token behavior); never pausable.
    function fund(uint128 amount, Bucket dest, uint256 seasonId) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (dest == Bucket.COMMITTED) {
            if (seasonPhase[seasonId] != SeasonPhase.OPEN) revert SeasonNotOpen();
        } else {
            if (seasonId != 0) revert ReserveIsSeasonAgnostic();
        }
        uint256 before = USDC.balanceOf(address(this));
        USDC.safeTransferFrom(msg.sender, address(this), amount);
        uint128 credited = (USDC.balanceOf(address(this)) - before).toUint128();
        if (credited == 0) revert ZeroAmount();
        if (dest == Bucket.COMMITTED) {
            committed[seasonId] += credited;
            totalCommitted += credited;
        } else {
            reserve += credited;
        }
        totalFunded += credited;
        emit Funded(msg.sender, credited, dest, seasonId);
    }

    /// @notice Owner promotes staging capital into a season's irrevocable pot — the internal
    ///         ratchet (strictly safer than withdraw-then-refund; no external transfer).
    function commitFromReserve(uint128 amount, uint256 seasonId) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (seasonPhase[seasonId] != SeasonPhase.OPEN) revert SeasonNotOpen();
        if (amount > reserve) revert InsufficientReserve();
        reserve -= amount;
        committed[seasonId] += amount;
        totalCommitted += amount;
        emit CommittedFromReserve(seasonId, amount);
    }

    // ─────────────────────────────── Seasons ───────────────────────────────

    /// @notice Owner anchors a season's rule sheet BEFORE its first round — deliberately an
    ///         OWNER signature so a compromised executor can never forge the rules.
    function setSeasonRules(uint256 seasonId, bytes32 rulesHash) external onlyOwner {
        if (seasonId <= 1) revert SeasonAlreadyOpen(); // season 1 anchored at deploy
        if (rulesHash == bytes32(0)) revert ZeroRulesHash();
        if (seasonRulesHash[seasonId] != bytes32(0)) revert RulesAlreadySet();
        seasonRulesHash[seasonId] = rulesHash;
        emit SeasonRulesSet(seasonId, rulesHash);
    }

    /// @notice Executor opens a season whose rules the owner already anchored (autonomous).
    function openSeason(uint256 seasonId) external {
        if (msg.sender != executor) revert NotExecutor();
        if (seasonId <= 1) revert SeasonAlreadyOpen();
        if (seasonPhase[seasonId] != SeasonPhase.NONE) revert SeasonAlreadyOpen();
        if (seasonRulesHash[seasonId] == bytes32(0)) revert SeasonRulesNotSet();
        seasonPhase[seasonId] = SeasonPhase.OPEN;
        emit SeasonOpened(seasonId, seasonRulesHash[seasonId]);
    }

    // ─────────────────────────────── Rounds ───────────────────────────────

    /// @notice The ONE round pipeline. INTERIM (executor): partial budget from committed only.
    ///         CLOSE (executor, the automatic era-seal payout) and FINAL (owner, the exit
    ///         valve): the WHOLE committed[season] + carryover — budget must equal that sum.
    /// @dev Root immutable once set (RoundExists — even for the owner). CLOSE/FINAL set
    ///      FINAL_PENDING (their own veto window stays open); activation makes the season
    ///      CLOSED, terminal.
    function postRound(
        uint256 roundId,
        bytes32 root,
        uint128 budget,
        string calldata uri,
        RoundClass class
    ) external {
        if (class == RoundClass.FINAL) {
            _checkOwner();
        } else {
            if (msg.sender != executor) revert NotExecutor();
        }
        if (roundId < 1000) revert MalformedRoundId();
        uint256 seasonId = roundId / 1000;
        if (root == bytes32(0)) revert ZeroRoot();
        if (budget == 0) revert ZeroBudget();
        if (seasonRulesHash[seasonId] == bytes32(0)) revert SeasonRulesNotSet();
        if (seasonPhase[seasonId] != SeasonPhase.OPEN) revert PhaseWrong();
        if (rounds[roundId].root != bytes32(0)) revert RoundExists();

        uint128 fromCommitted = 0;
        uint128 fromCarry = 0; // INTERIM never draws carryover — stays 0 by design
        if (class == RoundClass.INTERIM) {
            if (budget > committed[seasonId]) revert InsufficientAvailable();
            fromCommitted = budget;
        } else {
            if (budget != committed[seasonId] + carryover) revert BudgetMismatch();
            fromCommitted = committed[seasonId];
            fromCarry = carryover;
        }

        committed[seasonId] -= fromCommitted;
        totalCommitted -= fromCommitted;
        carryover -= fromCarry;
        roundReserved += budget;

        rounds[roundId] = Round({
            root: root,
            budget: budget,
            paid: 0,
            activateAfter: uint64(block.timestamp) + PENDING_DELAY,
            expiresAt: 0,
            pausedSnapshot: 0,
            state: RoundState.PENDING,
            class: class
        });
        if (class != RoundClass.INTERIM) seasonPhase[seasonId] = SeasonPhase.FINAL_PENDING;

        emit PendingRound(roundId, seasonId, root, budget, uri, seasonRulesHash[seasonId], class);
    }

    /// @notice The owner's veto — only during the public dispute window, never after.
    ///         Non-overlapping with activate by construction (R2).
    function revokeRound(uint256 roundId) external onlyOwner {
        Round storage r = rounds[roundId];
        if (r.state != RoundState.PENDING) revert NotPending();
        if (block.timestamp >= r.activateAfter) revert TooLate();
        uint256 seasonId = roundId / 1000;
        if (seasonPhase[seasonId] == SeasonPhase.CLOSED) revert PhaseWrong();

        roundReserved -= r.budget;
        // The carryover portion of a CLOSE/FINAL round merges into committed[season] — the
        // stronger, irrevocable guarantee. Conservation preserved.
        committed[seasonId] += r.budget;
        totalCommitted += r.budget;
        if (r.class != RoundClass.INTERIM) seasonPhase[seasonId] = SeasonPhase.OPEN;
        r.state = RoundState.REVOKED;
        emit RoundRevoked(roundId);
    }

    /// @notice Permissionless after the dispute window — a stalled executor can never freeze
    ///         the engine. A CLOSE/FINAL activation makes its season CLOSED (terminal).
    function activate(uint256 roundId) external {
        Round storage r = rounds[roundId];
        if (r.state != RoundState.PENDING) revert NotPending();
        if (block.timestamp < r.activateAfter) revert TooEarly();
        r.state = RoundState.ACTIVE;
        r.expiresAt = uint64(block.timestamp) + CLAIM_EXPIRY;
        r.pausedSnapshot = pausedAccum;
        if (r.class != RoundClass.INTERIM) seasonPhase[roundId / 1000] = SeasonPhase.CLOSED;
        emit RoundActivated(roundId, r.expiresAt);
    }

    // ─────────────────────────────── Claims ───────────────────────────────

    function _effectiveExpiry(Round storage r) internal view returns (uint64) {
        // Only pause time overlapping THIS round's active window extends its expiry.
        return r.expiresAt + (pausedAccum - r.pausedSnapshot);
    }

    function _claim(uint256 roundId, address account, uint256 amount, bytes32[] calldata proof)
        internal
    {
        if (amount == 0) revert ZeroAmount();
        if (amount > type(uint128).max) revert AmountTooLarge();
        Round storage r = rounds[roundId];
        if (r.state != RoundState.ACTIVE) revert RoundNotActive();
        if (block.timestamp > _effectiveExpiry(r)) revert RoundExpired();
        if (claimed[roundId][account]) revert AlreadyClaimed();
        uint128 amt = uint128(amount);
        // The per-round budget fence: a deviant/inflated root is bounded to its OWN round's
        // budget — it can never reach a sibling round's reserved money.
        if (r.paid + amt > r.budget) revert ExceedsBudget();
        bytes32 leaf = keccak256(
            bytes.concat(
                keccak256(
                    abi.encode(
                        KIND_PAYOUT, block.chainid, address(this), roundId, account, amount
                    )
                )
            )
        );
        if (!MerkleProof.verify(proof, r.root, leaf)) revert BadProof();
        // CEI: flag + bucket math strictly before the transfer.
        claimed[roundId][account] = true;
        r.paid += amt;
        roundReserved -= amt;
        totalPaid += amt;
        USDC.safeTransfer(account, amount);
        emit Claimed(roundId, account, amt);
    }

    function claim(uint256 roundId, uint256 amount, bytes32[] calldata proof)
        external
        nonReentrant
        whenNotPaused
    {
        _claim(roundId, msg.sender, amount, proof);
    }

    /// @notice Permissionless push (URD pattern): caller pays gas, funds go to the leaf's
    ///         account — never to the caller. Members pay no gas.
    function claimFor(uint256 roundId, address account, uint256 amount, bytes32[] calldata proof)
        external
        nonReentrant
        whenNotPaused
    {
        _claim(roundId, account, amount, proof);
    }

    /// @dev Self-call only — the batch's per-leaf isolation boundary.
    function pushOne(uint256 roundId, address account, uint256 amount, bytes32[] calldata proof)
        external
        nonReentrant
    {
        if (msg.sender != address(this)) revert NotSelf();
        _claim(roundId, account, amount, proof);
    }

    /// @notice Batch push. The wrapper is deliberately NOT nonReentrant (R3): each pushOne
    ///         self-call carries its own guard; one failing leaf (blacklisted recipient,
    ///         already claimed) is skipped — its claimed flag stays false, its pull fallback
    ///         intact — and the batch pays every good leaf.
    function claimForBatch(
        uint256 roundId,
        address[] calldata accounts,
        uint256[] calldata amounts,
        bytes32[][] calldata proofs
    ) external whenNotPaused {
        if (accounts.length != amounts.length || accounts.length != proofs.length) {
            revert LengthMismatch();
        }
        for (uint256 i; i < accounts.length; ++i) {
            try this.pushOne(roundId, accounts[i], amounts[i], proofs[i]) {}
            catch (bytes memory reason) {
                emit ClaimSkipped(roundId, accounts[i], reason);
            }
        }
    }

    /// @notice Dry-run mirror of claim's checks — fork-dry-run every leaf before any root.
    function verifyClaim(uint256 roundId, address account, uint256 amount, bytes32[] calldata proof)
        external
        view
        returns (bool)
    {
        Round storage r = rounds[roundId];
        if (amount == 0 || amount > type(uint128).max) return false;
        if (r.state != RoundState.ACTIVE) return false;
        if (block.timestamp > _effectiveExpiry(r)) return false;
        if (claimed[roundId][account]) return false;
        if (r.paid + uint128(amount) > r.budget) return false;
        bytes32 leaf = keccak256(
            bytes.concat(
                keccak256(
                    abi.encode(
                        KIND_PAYOUT, block.chainid, address(this), roundId, account, amount
                    )
                )
            )
        );
        return MerkleProof.verify(proof, r.root, leaf);
    }

    // ─────────────────────────────── Seals (no money) ───────────────────────────────

    /// @notice The narrow SEALER commits a season's XP fingerprint — moves no money; a seal
    ///         root can never satisfy a payout reconstruction (the kind byte differs).
    function sealSeason(uint256 seasonId, bytes32 xpRoot, string calldata uri) external {
        if (msg.sender != sealer) revert NotSealer();
        if (xpRoot == bytes32(0)) revert ZeroRoot();
        if (seasonRulesHash[seasonId] == bytes32(0)) revert SeasonRulesNotSet();
        if (sealRoot[seasonId] != bytes32(0)) revert SealExists();
        sealRoot[seasonId] = xpRoot;
        sealTime[seasonId] = uint64(block.timestamp);
        emit SeasonSealed(seasonId, xpRoot, uri);
    }

    /// @notice The one owner correction, inside the published window only. Event-trailed.
    function sealCorrect(uint256 seasonId, bytes32 xpRoot) external onlyOwner {
        if (xpRoot == bytes32(0)) revert ZeroRoot();
        bytes32 old = sealRoot[seasonId];
        if (old == bytes32(0)) revert SealMissing();
        if (sealCorrected[seasonId]) revert AlreadyCorrected();
        if (block.timestamp > sealTime[seasonId] + CORRECTION_WINDOW) {
            revert CorrectionWindowClosed();
        }
        sealCorrected[seasonId] = true;
        sealRoot[seasonId] = xpRoot;
        emit SealCorrected(seasonId, old, xpRoot);
    }

    // ─────────────────────── Reserve withdrawal (72h public timelock) ───────────────────────

    /// @notice Reserve ONLY — committed/roundReserved/carryover are unreachable by any
    ///         withdraw path (the origin's drain-anytime owner power does not survive).
    function announceWithdrawal(address to, uint128 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount > reserve) revert InsufficientReserve();
        pendingWithdrawal =
            PendingWithdrawal(to, amount, uint64(block.timestamp) + RESERVE_TIMELOCK);
        emit TimelockAnnounced(to, amount, pendingWithdrawal.readyAt);
    }

    /// @dev Consumes the announcement — every withdrawal needs its OWN fresh public notice.
    function withdrawUnallocated() external onlyOwner nonReentrant {
        PendingWithdrawal memory pw = pendingWithdrawal;
        if (pw.amount == 0) revert NothingAnnounced();
        if (block.timestamp < pw.readyAt) revert TimelockNotReady();
        if (pw.amount > reserve) revert InsufficientReserve();
        reserve -= pw.amount;
        totalWithdrawn += pw.amount;
        delete pendingWithdrawal;
        USDC.safeTransfer(pw.to, pw.amount);
        emit Withdrawal(pw.to, pw.amount);
    }

    // ─────────────────────────────── Sweeps ───────────────────────────────

    /// @notice Reconciles stray direct USDC transfers into `reserve` (never `committed` — a
    ///         stray can never inflate the members' pot). The ONLY balanceOf-driven credit.
    function sweepStray() external {
        uint256 tracked =
            uint256(reserve) + totalCommitted + roundReserved + carryover;
        uint256 bal = USDC.balanceOf(address(this));
        if (bal > tracked) {
            uint128 stray = (bal - tracked).toUint128();
            reserve += stray;
            totalFunded += stray;
            emit SweptToReserve(stray);
        }
    }

    /// @notice Permissionless past the effective expiry; pause-safe (whenNotPaused): a paused
    ///         round can never be expired under members' frozen feet.
    function sweepExpired(uint256 roundId) external whenNotPaused {
        Round storage r = rounds[roundId];
        if (r.state != RoundState.ACTIVE) revert RoundNotActive();
        if (block.timestamp <= _effectiveExpiry(r)) revert TooEarly();
        uint128 rem = r.budget - r.paid;
        roundReserved -= rem;
        carryover += rem;
        r.state = RoundState.EXPIRED;
        emit CarryoverMoved(roundId, rem);
    }

    /// @notice Non-USDC ERC-20 strays only — USDC is untouchable here by construction.
    function rescueForeignToken(address token, address to) external onlyOwner {
        if (token == address(USDC)) revert ForeignTokenOnly();
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(to, bal);
        emit ForeignTokenRescued(token, to, bal);
    }

    // ─────────────────────────────── Pause ───────────────────────────────

    /// @notice OWNER or GUARDIAN. Freezes claim paths + sweepExpired ONLY — funding, rounds,
    ///         activation, seals and withdrawals never sit behind the pause.
    function pause() external whenNotPaused {
        if (msg.sender != owner() && msg.sender != guardian) revert NotGuardian();
        pausedAt = uint64(block.timestamp);
        _pause();
    }

    /// @notice OWNER anytime — or ANYONE once MAX_PAUSE has elapsed (the liveness escape: no
    ///         key can freeze claims indefinitely). Paused time credits every round still in
    ///         its window via pausedAccum.
    function unpause() external whenPaused {
        if (msg.sender != owner()) {
            if (block.timestamp < uint256(pausedAt) + MAX_PAUSE) revert PauseNotExpired();
        }
        pausedAccum += uint64(block.timestamp) - pausedAt;
        _unpause();
        emit ClaimsUnpaused(msg.sender, pausedAccum);
    }

    // ─────────────────────────────── Rotations ───────────────────────────────

    function rotateSealer(address next) external onlyOwner {
        if (next == address(0)) revert ZeroAddress();
        emit SealerRotated(sealer, next);
        sealer = next;
    }

    function rotateExecutor(address next) external onlyOwner {
        if (next == address(0)) revert ZeroAddress();
        emit ExecutorRotated(executor, next);
        executor = next;
    }

    function rotateGuardian(address next) external onlyOwner {
        if (next == address(0)) revert ZeroAddress();
        emit GuardianRotated(guardian, next);
        guardian = next;
    }

    // ─────────────────────────────── Views ───────────────────────────────

    /// @notice The master conservation identity — the ghost-ledger invariant's on-chain twin.
    function conservationHolds() external view returns (bool) {
        return uint256(reserve) + totalCommitted + roundReserved + carryover + totalPaid
            + totalWithdrawn == totalFunded;
    }

    /// @notice A round's live claim deadline (0 unless ACTIVE) — deadlines render from chain.
    function effectiveExpiry(uint256 roundId) external view returns (uint64) {
        Round storage r = rounds[roundId];
        if (r.state != RoundState.ACTIVE) return 0;
        return _effectiveExpiry(r);
    }
}
