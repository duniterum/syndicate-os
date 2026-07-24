// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {MeritDistributor} from "../../src/MeritDistributor.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";

/// @notice The bounded actor the invariant fuzzer drives. Every money move is mirrored in an
///         INDEPENDENT ghost ledger computed from call inputs only — the invariants then
///         assert the contract's own accounting against the ghosts (never the contract
///         against itself: the origin's two-authority-figure trap).
///         Rounds are single-leaf (root == leaf, proof == []) — bucket math is fully
///         exercised; multi-leaf proof mechanics live in the Murky forgery fuzz suite.
contract BountyHandler is Test {
    MeritDistributor public pool;
    MockUSDC public usdc;

    address public owner;
    address public executor;
    address public sealer;
    address public guardian;
    address[5] public members;

    // ── Ghost ledger (derived from call inputs ONLY) ──
    uint256 public g_funded; //          every credit that entered (fund + strays swept)
    uint256 public g_paid; //            every claim payout
    uint256 public g_withdrawn; //       every reserve withdrawal
    uint256 public g_ratchetLast; //     last observed totalCommitted+roundReserved+carryover+totalPaid
    bool public g_ratchetBroken;
    bool public g_terminalViolated; //   a CLOSED season observed leaving CLOSED
    bool public g_rootMutated; //        a posted root observed changing
    bool public g_paidOverBudget; //     any round with paid > budget

    uint256[] public seasonsOpened; //   incl. season 1
    uint256[] public roundsPosted;
    mapping(uint256 => bytes32) public postedRoot;
    mapping(uint256 => address) public roundAccount; // the single leaf's account
    mapping(uint256 => uint256) public roundAmount; //  the single leaf's amount
    mapping(uint256 => bool) public roundClaimed;
    mapping(uint256 => bool) public seasonSeenClosed;
    mapping(uint256 => uint256) public seqOf; //        next round seq per season

    mapping(bytes32 => uint256) public calls;

    uint256 internal nextSeason = 2;

    constructor(MeritDistributor pool_, MockUSDC usdc_, address owner_, address executor_, address sealer_, address guardian_) {
        pool = pool_;
        usdc = usdc_;
        owner = owner_;
        executor = executor_;
        sealer = sealer_;
        guardian = guardian_;
        for (uint256 i; i < 5; ++i) {
            members[i] = address(uint160(0xA11CE00 + i));
        }
        seasonsOpened.push(1);
        seqOf[1] = 1;
    }

    // ─────────────────────────── internal helpers ───────────────────────────

    function _snapshotAndCheck() internal {
        // Ratchet: totalCommitted + roundReserved + carryover + totalPaid never decreases.
        uint256 ratchet = uint256(pool.totalCommitted()) + pool.roundReserved() + pool.carryover()
            + pool.totalPaid();
        if (ratchet < g_ratchetLast) g_ratchetBroken = true;
        g_ratchetLast = ratchet;

        // Terminal seasons stay terminal; roots stay immutable; fences hold.
        for (uint256 i; i < seasonsOpened.length; ++i) {
            uint256 s = seasonsOpened[i];
            if (pool.seasonPhase(s) == MeritDistributor.SeasonPhase.CLOSED) {
                seasonSeenClosed[s] = true;
            } else if (seasonSeenClosed[s]) {
                g_terminalViolated = true;
            }
        }
        for (uint256 i; i < roundsPosted.length; ++i) {
            uint256 rid = roundsPosted[i];
            (bytes32 root, uint128 budget, uint128 paid,,,,,) = pool.rounds(rid);
            if (root != postedRoot[rid]) g_rootMutated = true;
            if (paid > budget) g_paidOverBudget = true;
        }
    }

    function _openSeasonId(uint256 seed) internal view returns (uint256) {
        // Prefer a season currently OPEN; fall back to season 1.
        uint256 n = seasonsOpened.length;
        for (uint256 i; i < n; ++i) {
            uint256 s = seasonsOpened[(seed + i) % n];
            if (pool.seasonPhase(s) == MeritDistributor.SeasonPhase.OPEN) return s;
        }
        return 0;
    }

    function _leaf(uint256 roundId, address account, uint256 amount) internal view returns (bytes32) {
        return keccak256(
            bytes.concat(
                keccak256(abi.encode(uint8(1), block.chainid, address(pool), roundId, account, amount))
            )
        );
    }

    // ─────────────────────────── fuzzed actions ───────────────────────────

    function warpForward(uint256 secs) external {
        secs = bound(secs, 1 hours, 30 days);
        vm.warp(block.timestamp + secs);
        calls["warp"]++;
        _snapshotAndCheck();
    }

    function fundCommitted(uint256 seasonSeed, uint256 amount) external {
        uint256 s = _openSeasonId(seasonSeed);
        if (s == 0) return;
        amount = bound(amount, 1e6, 1_000_000e6);
        usdc.mint(owner, amount);
        vm.startPrank(owner);
        usdc.approve(address(pool), amount);
        pool.fund(uint128(amount), MeritDistributor.Bucket.COMMITTED, s);
        vm.stopPrank();
        g_funded += amount;
        calls["fundCommitted"]++;
        _snapshotAndCheck();
    }

    function fundReserve(uint256 amount) external {
        amount = bound(amount, 1e6, 1_000_000e6);
        usdc.mint(owner, amount);
        vm.startPrank(owner);
        usdc.approve(address(pool), amount);
        pool.fund(uint128(amount), MeritDistributor.Bucket.RESERVE, 0);
        vm.stopPrank();
        g_funded += amount;
        calls["fundReserve"]++;
        _snapshotAndCheck();
    }

    function commitFromReserve(uint256 seasonSeed, uint256 amount) external {
        uint256 s = _openSeasonId(seasonSeed);
        if (s == 0) return;
        uint128 res = pool.reserve();
        if (res == 0) return;
        amount = bound(amount, 1, res);
        vm.prank(owner);
        pool.commitFromReserve(uint128(amount), s);
        calls["commitFromReserve"]++;
        _snapshotAndCheck();
    }

    function openNextSeason() external {
        uint256 s = nextSeason;
        vm.prank(owner);
        pool.setSeasonRules(s, keccak256(abi.encode("rules", s)));
        vm.prank(executor);
        pool.openSeason(s);
        seasonsOpened.push(s);
        seqOf[s] = 1;
        nextSeason++;
        calls["openSeason"]++;
        _snapshotAndCheck();
    }

    function postInterim(uint256 seasonSeed, uint256 amountSeed, uint256 memberSeed) external {
        uint256 s = _openSeasonId(seasonSeed);
        if (s == 0) return;
        uint128 avail = pool.committed(s);
        if (avail == 0) return;
        uint256 budget = bound(amountSeed, 1, avail);
        address account = members[memberSeed % 5];
        uint256 rid = s * 1000 + seqOf[s];
        if (rid >= s * 1000 + 999) return;
        uint256 amount = bound(uint256(keccak256(abi.encode(amountSeed))), 1, budget);
        bytes32 root = _leaf(rid, account, amount);
        vm.prank(executor);
        pool.postRound(rid, root, uint128(budget), "u", MeritDistributor.RoundClass.INTERIM);
        seqOf[s]++;
        roundsPosted.push(rid);
        postedRoot[rid] = root;
        roundAccount[rid] = account;
        roundAmount[rid] = amount;
        calls["postInterim"]++;
        _snapshotAndCheck();
    }

    function postClose(uint256 seasonSeed, uint256 memberSeed) external {
        uint256 s = _openSeasonId(seasonSeed);
        if (s == 0) return;
        uint256 budget = uint256(pool.committed(s)) + pool.carryover();
        if (budget == 0) return;
        address account = members[memberSeed % 5];
        uint256 rid = s * 1000 + seqOf[s];
        if (rid >= s * 1000 + 999) return;
        uint256 amount = bound(uint256(keccak256(abi.encode(memberSeed, budget))), 1, budget);
        bytes32 root = _leaf(rid, account, amount);
        vm.prank(executor);
        pool.postRound(rid, root, uint128(budget), "u", MeritDistributor.RoundClass.CLOSE);
        seqOf[s]++;
        roundsPosted.push(rid);
        postedRoot[rid] = root;
        roundAccount[rid] = account;
        roundAmount[rid] = amount;
        calls["postClose"]++;
        _snapshotAndCheck();
    }

    function revokePending(uint256 roundSeed) external {
        uint256 n = roundsPosted.length;
        if (n == 0) return;
        for (uint256 i; i < n; ++i) {
            uint256 rid = roundsPosted[(roundSeed + i) % n];
            (,,, uint64 activateAfter,,, MeritDistributor.RoundState state,) = pool.rounds(rid);
            if (state == MeritDistributor.RoundState.PENDING && block.timestamp < activateAfter) {
                vm.prank(owner);
                pool.revokeRound(rid);
                calls["revoke"]++;
                _snapshotAndCheck();
                return;
            }
        }
    }

    function activateReady(uint256 roundSeed) external {
        uint256 n = roundsPosted.length;
        if (n == 0) return;
        for (uint256 i; i < n; ++i) {
            uint256 rid = roundsPosted[(roundSeed + i) % n];
            (,,, uint64 activateAfter,,, MeritDistributor.RoundState state,) = pool.rounds(rid);
            if (state == MeritDistributor.RoundState.PENDING) {
                if (block.timestamp < activateAfter) vm.warp(activateAfter);
                pool.activate(rid);
                calls["activate"]++;
                _snapshotAndCheck();
                return;
            }
        }
    }

    function claimOne(uint256 roundSeed) external {
        if (pool.paused()) return;
        uint256 n = roundsPosted.length;
        if (n == 0) return;
        for (uint256 i; i < n; ++i) {
            uint256 rid = roundsPosted[(roundSeed + i) % n];
            (,,,,,, MeritDistributor.RoundState state,) = pool.rounds(rid);
            if (state == MeritDistributor.RoundState.ACTIVE && !roundClaimed[rid]) {
                if (block.timestamp > pool.effectiveExpiry(rid)) continue;
                bytes32[] memory noProof = new bytes32[](0);
                pool.claimFor(rid, roundAccount[rid], roundAmount[rid], noProof);
                roundClaimed[rid] = true;
                g_paid += roundAmount[rid];
                calls["claim"]++;
                _snapshotAndCheck();
                return;
            }
        }
    }

    function sweepOneExpired(uint256 roundSeed) external {
        if (pool.paused()) return;
        uint256 n = roundsPosted.length;
        if (n == 0) return;
        for (uint256 i; i < n; ++i) {
            uint256 rid = roundsPosted[(roundSeed + i) % n];
            (,,,,,, MeritDistributor.RoundState state,) = pool.rounds(rid);
            if (state == MeritDistributor.RoundState.ACTIVE) {
                uint64 exp = pool.effectiveExpiry(rid);
                vm.warp(uint256(exp) + 1);
                pool.sweepExpired(rid);
                calls["sweepExpired"]++;
                _snapshotAndCheck();
                return;
            }
        }
    }

    function strayThenSweep(uint256 amount) external {
        amount = bound(amount, 1, 10_000e6);
        usdc.mint(address(pool), amount); // a stray direct credit
        pool.sweepStray();
        g_funded += amount; // sweepStray books it into totalFunded
        calls["sweepStray"]++;
        _snapshotAndCheck();
    }

    function withdrawCycle(uint256 amount) external {
        uint128 res = pool.reserve();
        if (res == 0) return;
        amount = bound(amount, 1, res);
        vm.prank(owner);
        pool.announceWithdrawal(owner, uint128(amount));
        vm.warp(block.timestamp + pool.RESERVE_TIMELOCK());
        vm.prank(owner);
        pool.withdrawUnallocated();
        g_withdrawn += amount;
        calls["withdraw"]++;
        _snapshotAndCheck();
    }

    function pauseCycle(uint256 durationSeed) external {
        if (pool.paused()) return;
        vm.prank(guardian);
        pool.pause();
        uint256 dur = bound(durationSeed, 1 hours, 10 days);
        vm.warp(block.timestamp + dur);
        vm.prank(owner);
        pool.unpause();
        calls["pauseCycle"]++;
        _snapshotAndCheck();
    }

    // ─────────────────────────── views for the invariants ───────────────────────────

    function seasonsCount() external view returns (uint256) {
        return seasonsOpened.length;
    }

    function roundsCount() external view returns (uint256) {
        return roundsPosted.length;
    }

    function sumCommittedOverSeasons() external view returns (uint256 sum) {
        for (uint256 i; i < seasonsOpened.length; ++i) {
            sum += pool.committed(seasonsOpened[i]);
        }
    }
}
