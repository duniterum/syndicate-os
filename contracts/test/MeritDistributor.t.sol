// SPDX-License-Identifier: MIT
// ⛔ TEST-ONLY — the bench, never deployed. Production = src/MeritDistributor.sol (binds the REAL Circle USDC at deploy). guard-prod-purity.sh enforces the separation.
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {MeritDistributor} from "../src/MeritDistributor.sol";
import {MockUSDC, Mock18Decimals} from "./mocks/MockUSDC.sol";

/// @notice S3-1 core suite — the critical money paths, access matrix, and the spec's named
///         regression classes. The exhaustive adversarial stack (15 stateful invariants at
///         50k runs, Halmos, Murky proof-forgery fuzz, mutation, fork tests) is S3-2.
contract MeritDistributorTest is Test {
    MeritDistributor internal pool;
    MockUSDC internal usdc;

    address internal founder = makeAddr("founder");
    address internal sealer = makeAddr("sealer");
    address internal executor = makeAddr("executor");
    address internal guardian = makeAddr("guardian");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal rando = makeAddr("rando");

    // The proposed mainnet params (spec §5 deploy sheet): 72h/2y/72h/7d/14d.
    uint64 constant PENDING_DELAY = 72 hours;
    uint64 constant CLAIM_EXPIRY = 730 days;
    uint64 constant RESERVE_TIMELOCK = 72 hours;
    uint64 constant CORRECTION_WINDOW = 7 days;
    uint64 constant MAX_PAUSE = 14 days;
    bytes32 constant S1_RULES = keccak256("season-1-rule-sheet");

    function setUp() public {
        usdc = new MockUSDC();
        pool = new MeritDistributor(
            address(usdc),
            sealer,
            executor,
            guardian,
            PENDING_DELAY,
            CLAIM_EXPIRY,
            RESERVE_TIMELOCK,
            CORRECTION_WINDOW,
            MAX_PAUSE,
            S1_RULES
        );
        // Two-authorities handshake: deployer -> founder, founder accepts.
        pool.transferOwnership(founder);
        vm.prank(founder);
        pool.acceptOwnership();

        usdc.mint(founder, 10_000_000e6);
        vm.prank(founder);
        usdc.approve(address(pool), type(uint256).max);
    }

    // ─────────────────────────── helpers ───────────────────────────

    function assertConservation() internal view {
        assertTrue(pool.conservationHolds(), "conservation identity broken");
    }

    function _leafPayout(uint256 roundId, address account, uint256 amount)
        internal
        view
        returns (bytes32)
    {
        return keccak256(
            bytes.concat(
                keccak256(
                    abi.encode(
                        uint8(1), block.chainid, address(pool), roundId, account, amount
                    )
                )
            )
        );
    }

    function _leafSeal(uint256 seasonId, address account, uint256 xp)
        internal
        view
        returns (bytes32)
    {
        return keccak256(
            bytes.concat(
                keccak256(
                    abi.encode(uint8(2), block.chainid, address(pool), seasonId, account, xp)
                )
            )
        );
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(bytes.concat(a, b)) : keccak256(bytes.concat(b, a));
    }

    function _fundCommitted(uint256 seasonId, uint128 amount) internal {
        vm.prank(founder);
        pool.fund(amount, MeritDistributor.Bucket.COMMITTED, seasonId);
    }

    function _fundReserve(uint128 amount) internal {
        vm.prank(founder);
        pool.fund(amount, MeritDistributor.Bucket.RESERVE, 0);
    }

    /// Posts + activates a 2-leaf INTERIM round (alice: amtA, bob: amtB) for season 1.
    function _liveRound(uint256 roundId, uint128 budget, uint256 amtA, uint256 amtB)
        internal
        returns (bytes32 leafA, bytes32 leafB)
    {
        leafA = _leafPayout(roundId, alice, amtA);
        leafB = _leafPayout(roundId, bob, amtB);
        bytes32 root = _hashPair(leafA, leafB);
        vm.prank(executor);
        pool.postRound(roundId, root, budget, "ipfs://round", MeritDistributor.RoundClass.INTERIM);
        vm.warp(block.timestamp + PENDING_DELAY);
        pool.activate(roundId); // anyone
    }

    function _proofFor(bytes32 sibling) internal pure returns (bytes32[] memory p) {
        p = new bytes32[](1);
        p[0] = sibling;
    }

    // ─────────────────────────── constructor ───────────────────────────

    function test_constructor_rejectsWrongDecimals() public {
        Mock18Decimals wrong = new Mock18Decimals();
        vm.expectRevert(MeritDistributor.NotUSDCDecimals6.selector);
        new MeritDistributor(
            address(wrong), sealer, executor, guardian, PENDING_DELAY, CLAIM_EXPIRY,
            RESERVE_TIMELOCK, CORRECTION_WINDOW, MAX_PAUSE, S1_RULES
        );
    }

    function test_constructor_rejectsPendingDelayBelowReserveTimelock() public {
        vm.expectRevert(MeritDistributor.TimerOutOfBounds.selector);
        new MeritDistributor(
            address(usdc), sealer, executor, guardian, 2 hours, CLAIM_EXPIRY,
            72 hours, CORRECTION_WINDOW, MAX_PAUSE, S1_RULES
        );
    }

    function test_constructor_rejectsOutOfBoundTimers() public {
        vm.expectRevert(MeritDistributor.TimerOutOfBounds.selector);
        new MeritDistributor(
            address(usdc), sealer, executor, guardian, PENDING_DELAY, 1 days, // expiry too short
            RESERVE_TIMELOCK, CORRECTION_WINDOW, MAX_PAUSE, S1_RULES
        );
    }

    function test_constructor_opensSeason1() public view {
        assertEq(pool.seasonRulesHash(1), S1_RULES);
        assertEq(uint8(pool.seasonPhase(1)), uint8(MeritDistributor.SeasonPhase.OPEN));
    }

    // ─────────────────────────── funding ───────────────────────────

    function test_fund_committed_and_reserve() public {
        _fundCommitted(1, 1_000e6);
        _fundReserve(500e6);
        assertEq(pool.committed(1), 1_000e6);
        assertEq(pool.totalCommitted(), 1_000e6);
        assertEq(pool.reserve(), 500e6);
        assertEq(pool.totalFunded(), 1_500e6);
        assertConservation();
    }

    function test_fund_committed_rejectsUnopenedSeason() public {
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.SeasonNotOpen.selector);
        pool.fund(100e6, MeritDistributor.Bucket.COMMITTED, 7); // season 7 never opened
    }

    function test_fund_reserve_requiresSeasonZero() public {
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.ReserveIsSeasonAgnostic.selector);
        pool.fund(100e6, MeritDistributor.Bucket.RESERVE, 1);
    }

    function test_commitFromReserve_ratchet() public {
        _fundReserve(500e6);
        vm.prank(founder);
        pool.commitFromReserve(200e6, 1);
        assertEq(pool.reserve(), 300e6);
        assertEq(pool.committed(1), 200e6);
        assertConservation();
    }

    // ─────────────────────────── seasons ───────────────────────────

    function test_openSeason_requiresOwnerAnchoredRules() public {
        vm.prank(executor);
        vm.expectRevert(MeritDistributor.SeasonRulesNotSet.selector);
        pool.openSeason(2);

        vm.prank(founder);
        pool.setSeasonRules(2, keccak256("s2"));
        vm.prank(executor);
        pool.openSeason(2);
        assertEq(uint8(pool.seasonPhase(2)), uint8(MeritDistributor.SeasonPhase.OPEN));
    }

    function test_setSeasonRules_onlyOwner_andOnce() public {
        vm.prank(executor);
        vm.expectRevert();
        pool.setSeasonRules(2, keccak256("s2"));

        vm.startPrank(founder);
        pool.setSeasonRules(2, keccak256("s2"));
        vm.expectRevert(MeritDistributor.RulesAlreadySet.selector);
        pool.setSeasonRules(2, keccak256("s2-again"));
        vm.stopPrank();
    }

    // ─────────────────────────── rounds: post/revoke/activate ───────────────────────────

    function test_postRound_interim_accountingAndCap() public {
        _fundCommitted(1, 1_000e6);
        bytes32 root = keccak256("root");

        vm.prank(executor);
        vm.expectRevert(MeritDistributor.InsufficientAvailable.selector);
        pool.postRound(1001, root, 2_000e6, "u", MeritDistributor.RoundClass.INTERIM);

        vm.prank(executor);
        pool.postRound(1001, root, 400e6, "u", MeritDistributor.RoundClass.INTERIM);
        assertEq(pool.committed(1), 600e6);
        assertEq(pool.roundReserved(), 400e6);
        // Interim never touches the phase.
        assertEq(uint8(pool.seasonPhase(1)), uint8(MeritDistributor.SeasonPhase.OPEN));
        assertConservation();
    }

    function test_postRound_close_paysWholePotPlusCarryover() public {
        _fundCommitted(1, 1_000e6);
        // Manufacture carryover: an interim that expires unclaimed.
        (bytes32 la,) = _liveRound(1001, 100e6, 60e6, 40e6);
        la; // silence
        vm.warp(block.timestamp + CLAIM_EXPIRY + 1);
        pool.sweepExpired(1001);
        assertEq(pool.carryover(), 100e6);

        uint128 whole = pool.committed(1) + pool.carryover(); // 900 + 100
        vm.prank(executor);
        vm.expectRevert(MeritDistributor.BudgetMismatch.selector);
        pool.postRound(1002, keccak256("r"), whole - 1, "u", MeritDistributor.RoundClass.CLOSE);

        vm.prank(executor);
        pool.postRound(1002, keccak256("r"), whole, "u", MeritDistributor.RoundClass.CLOSE);
        assertEq(pool.committed(1), 0);
        assertEq(pool.carryover(), 0);
        assertEq(pool.roundReserved(), whole);
        assertEq(uint8(pool.seasonPhase(1)), uint8(MeritDistributor.SeasonPhase.FINAL_PENDING));
        assertConservation();
    }

    function test_postRound_final_isOwnerOnly() public {
        _fundCommitted(1, 100e6);
        vm.prank(executor);
        vm.expectRevert();
        pool.postRound(1001, keccak256("r"), 100e6, "u", MeritDistributor.RoundClass.FINAL);

        vm.prank(founder);
        pool.postRound(1001, keccak256("r"), 100e6, "u", MeritDistributor.RoundClass.FINAL);
    }

    function test_postRound_rootImmutable_evenAcrossRevoke() public {
        _fundCommitted(1, 100e6);
        vm.prank(executor);
        pool.postRound(1001, keccak256("r"), 50e6, "u", MeritDistributor.RoundClass.INTERIM);
        vm.prank(founder);
        pool.revokeRound(1001);
        // The roundId can never be reused — even by the owner.
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.RoundExists.selector);
        pool.postRound(1001, keccak256("r2"), 10e6, "u", MeritDistributor.RoundClass.FINAL);
    }

    function test_revokeActivate_windowsNeverOverlap() public {
        _fundCommitted(1, 100e6);
        vm.prank(executor);
        pool.postRound(1001, keccak256("r"), 100e6, "u", MeritDistributor.RoundClass.INTERIM);
        (,,, uint64 activateAfter,,,,) = pool.rounds(1001);

        // One second before the boundary: activate reverts, revoke succeeds — after re-post,
        // at the boundary: activate succeeds, revoke reverts. No block admits both.
        vm.warp(activateAfter - 1);
        vm.expectRevert(MeritDistributor.TooEarly.selector);
        pool.activate(1001);
        vm.prank(founder);
        pool.revokeRound(1001); // veto works inside the window
        assertEq(pool.committed(1), 100e6);
        assertConservation();

        vm.prank(executor);
        pool.postRound(1002, keccak256("r2"), 100e6, "u", MeritDistributor.RoundClass.INTERIM);
        (,,, uint64 aa2,,,,) = pool.rounds(1002);
        vm.warp(aa2);
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.TooLate.selector);
        pool.revokeRound(1002);
        pool.activate(1002); // permissionless
    }

    function test_revoke_closeRound_restoresAndReopens() public {
        _fundCommitted(1, 100e6);
        (bytes32 la,) = _liveRound(1001, 40e6, 25e6, 15e6);
        la;
        vm.warp(block.timestamp + CLAIM_EXPIRY + 1);
        pool.sweepExpired(1001); // carryover 40

        uint128 whole = pool.committed(1) + pool.carryover(); // 60 + 40
        vm.prank(executor);
        pool.postRound(1002, keccak256("c"), whole, "u", MeritDistributor.RoundClass.CLOSE);
        vm.prank(founder);
        pool.revokeRound(1002);
        // The carryover portion merges into committed (the stronger guarantee).
        assertEq(pool.committed(1), 100e6);
        assertEq(pool.carryover(), 0);
        assertEq(uint8(pool.seasonPhase(1)), uint8(MeritDistributor.SeasonPhase.OPEN));
        assertConservation();
    }

    function test_closeActivation_makesSeasonTerminal() public {
        _fundCommitted(1, 100e6);
        vm.prank(executor);
        pool.postRound(1001, keccak256("c"), 100e6, "u", MeritDistributor.RoundClass.CLOSE);
        vm.warp(block.timestamp + PENDING_DELAY);
        pool.activate(1001);
        assertEq(uint8(pool.seasonPhase(1)), uint8(MeritDistributor.SeasonPhase.CLOSED));

        // Terminal: no funding, no rounds, no revoke on a closed season.
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.SeasonNotOpen.selector);
        pool.fund(1e6, MeritDistributor.Bucket.COMMITTED, 1);
        vm.prank(executor);
        vm.expectRevert(MeritDistributor.PhaseWrong.selector);
        pool.postRound(1003, keccak256("x"), 1, "u", MeritDistributor.RoundClass.INTERIM);
    }

    // ─────────────────────────── claims ───────────────────────────

    function test_claim_happyPath_bothLeaves() public {
        _fundCommitted(1, 100e6);
        (bytes32 leafA, bytes32 leafB) = _liveRound(1001, 100e6, 60e6, 40e6);

        vm.prank(alice);
        pool.claim(1001, 60e6, _proofFor(leafB));
        assertEq(usdc.balanceOf(alice), 60e6);

        // claimFor: rando pushes bob's share — funds go to BOB, never the caller.
        vm.prank(rando);
        pool.claimFor(1001, bob, 40e6, _proofFor(leafA));
        assertEq(usdc.balanceOf(bob), 40e6);
        assertEq(usdc.balanceOf(rando), 0);
        assertEq(pool.totalPaid(), 100e6);
        assertEq(pool.roundReserved(), 0);
        assertConservation();
    }

    function test_claim_doubleClaimReverts_bothOrders() public {
        _fundCommitted(1, 100e6);
        (bytes32 leafA, bytes32 leafB) = _liveRound(1001, 100e6, 60e6, 40e6);
        leafA;
        vm.prank(alice);
        pool.claim(1001, 60e6, _proofFor(leafB));
        vm.prank(alice);
        vm.expectRevert(MeritDistributor.AlreadyClaimed.selector);
        pool.claim(1001, 60e6, _proofFor(leafB));
        vm.prank(rando);
        vm.expectRevert(MeritDistributor.AlreadyClaimed.selector);
        pool.claimFor(1001, alice, 60e6, _proofFor(leafB));
    }

    function test_claim_perRound_noGlobalLockout() public {
        // The origin's named trap: a Season-1 claimant locked out forever. Same account
        // claims independently across two rounds.
        _fundCommitted(1, 200e6);
        (, bytes32 leafB1) = _liveRound(1001, 100e6, 60e6, 40e6);
        vm.prank(alice);
        pool.claim(1001, 60e6, _proofFor(leafB1));

        (, bytes32 leafB2) = _liveRound(1002, 100e6, 70e6, 30e6);
        vm.prank(alice);
        pool.claim(1002, 70e6, _proofFor(leafB2));
        assertEq(usdc.balanceOf(alice), 130e6);
        assertConservation();
    }

    function test_claim_budgetFence_boundsInflatedRoot() public {
        // A deviant root whose leaves sum PAST the budget: the fence stops the over-draw —
        // it can never reach a sibling round's reserved money.
        _fundCommitted(1, 300e6);
        uint256 rid = 1001;
        bytes32 leafA = _leafPayout(rid, alice, 80e6);
        bytes32 leafB = _leafPayout(rid, bob, 80e6);
        bytes32 root = _hashPair(leafA, leafB); // Σ=160 > budget 100
        vm.prank(executor);
        pool.postRound(rid, root, 100e6, "u", MeritDistributor.RoundClass.INTERIM);
        vm.warp(block.timestamp + PENDING_DELAY);
        pool.activate(rid);

        vm.prank(alice);
        pool.claim(rid, 80e6, _proofFor(leafB));
        vm.prank(bob);
        vm.expectRevert(MeritDistributor.ExceedsBudget.selector);
        pool.claim(rid, 80e6, _proofFor(leafA));
        assertConservation();
    }

    function test_sealRoot_structurallyUnclaimable() public {
        // Load a SEAL-kind tree as a payout round's root: every claim must fail BadProof —
        // the kind byte differs inside the pre-image.
        _fundCommitted(1, 100e6);
        uint256 rid = 1001;
        bytes32 sealA = _leafSeal(1, alice, 500); // xp, kind=2, "roundId"=seasonId=1...
        bytes32 sealB = _leafSeal(1, bob, 300);
        bytes32 root = _hashPair(sealA, sealB);
        vm.prank(executor);
        pool.postRound(rid, root, 100e6, "u", MeritDistributor.RoundClass.INTERIM);
        vm.warp(block.timestamp + PENDING_DELAY);
        pool.activate(rid);

        vm.prank(alice);
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claim(rid, 500, _proofFor(sealB));
        assertFalse(pool.verifyClaim(rid, alice, 500, _proofFor(sealB)));
    }

    function test_claim_wrongAmountFailsProof() public {
        _fundCommitted(1, 100e6);
        (, bytes32 leafB) = _liveRound(1001, 100e6, 60e6, 40e6);
        vm.prank(alice);
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claim(1001, 61e6, _proofFor(leafB));
    }

    function test_claimForBatch_skipsBlockedLeaf_paysRest_pullIntact() public {
        _fundCommitted(1, 100e6);
        (bytes32 leafA, bytes32 leafB) = _liveRound(1001, 100e6, 60e6, 40e6);
        usdc.setBlocked(bob, true); // Circle-style blacklist

        address[] memory accounts = new address[](2);
        accounts[0] = alice;
        accounts[1] = bob;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 60e6;
        amounts[1] = 40e6;
        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = _proofFor(leafB);
        proofs[1] = _proofFor(leafA);

        vm.prank(executor);
        pool.claimForBatch(1001, accounts, amounts, proofs);

        // Alice paid; bob skipped with his flag FALSE (pull fallback intact).
        assertEq(usdc.balanceOf(alice), 60e6);
        assertEq(usdc.balanceOf(bob), 0);
        assertFalse(pool.claimed(1001, bob));

        usdc.setBlocked(bob, false);
        vm.prank(bob);
        pool.claim(1001, 40e6, _proofFor(leafA));
        assertEq(usdc.balanceOf(bob), 40e6);
        assertConservation();
    }

    function test_pushOne_selfOnly() public {
        vm.expectRevert(MeritDistributor.NotSelf.selector);
        pool.pushOne(1001, alice, 1, new bytes32[](0));
    }

    // ─────────────────────────── expiry + pause ───────────────────────────

    function test_sweepExpired_recyclesToCarryover_thenClaimDead() public {
        _fundCommitted(1, 100e6);
        (, bytes32 leafB) = _liveRound(1001, 100e6, 60e6, 40e6);
        vm.warp(block.timestamp + CLAIM_EXPIRY + 1);
        vm.prank(rando);
        pool.sweepExpired(1001);
        assertEq(pool.carryover(), 100e6);
        vm.prank(alice);
        vm.expectRevert(MeritDistributor.RoundNotActive.selector);
        pool.claim(1001, 60e6, _proofFor(leafB));
        assertConservation();
    }

    function test_pause_freezesClaimsAndSweepOnly_expiryExtends() public {
        _fundCommitted(1, 100e6);
        (, bytes32 leafB) = _liveRound(1001, 100e6, 60e6, 40e6);
        uint64 exp0 = pool.effectiveExpiry(1001);

        vm.prank(guardian);
        pool.pause();
        vm.prank(alice);
        vm.expectRevert();
        pool.claim(1001, 60e6, _proofFor(leafB));
        vm.expectRevert();
        pool.sweepExpired(1001); // a paused round can never be expired
        // But funding + posting + activation stay live.
        _fundCommitted(1, 5e6);

        vm.warp(block.timestamp + 3 days);
        vm.prank(founder);
        pool.unpause();
        // The claim window extended by exactly the paused duration.
        assertEq(pool.effectiveExpiry(1001), exp0 + 3 days);
        vm.prank(alice);
        pool.claim(1001, 60e6, _proofFor(leafB));
        assertConservation();
    }

    function test_unpause_permissionlessAfterMaxPause() public {
        vm.prank(guardian);
        pool.pause();
        vm.prank(rando);
        vm.expectRevert(MeritDistributor.PauseNotExpired.selector);
        pool.unpause();
        vm.warp(block.timestamp + MAX_PAUSE);
        vm.prank(rando);
        pool.unpause(); // no key can freeze claims indefinitely
        assertFalse(pool.paused());
    }

    // ─────────────────────────── reserve withdrawal ───────────────────────────

    function test_withdraw_timelock_consumesAnnouncement() public {
        _fundReserve(500e6);
        vm.prank(founder);
        pool.announceWithdrawal(founder, 200e6);
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.TimelockNotReady.selector);
        pool.withdrawUnallocated();

        vm.warp(block.timestamp + RESERVE_TIMELOCK);
        uint256 before = usdc.balanceOf(founder);
        vm.prank(founder);
        pool.withdrawUnallocated();
        assertEq(usdc.balanceOf(founder) - before, 200e6);
        assertEq(pool.reserve(), 300e6);
        assertEq(pool.totalWithdrawn(), 200e6);
        assertConservation();

        // One announcement = ONE withdrawal — the next needs a fresh 72h notice.
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.NothingAnnounced.selector);
        pool.withdrawUnallocated();
    }

    function test_withdraw_canNeverTouchCommitted() public {
        _fundCommitted(1, 1_000e6);
        _fundReserve(10e6);
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.InsufficientReserve.selector);
        pool.announceWithdrawal(founder, 11e6); // reserve is the ONLY reachable bucket
    }

    // ─────────────────────────── sweeps + rescue ───────────────────────────

    function test_sweepStray_routesToReserve_neverThePot() public {
        _fundCommitted(1, 100e6);
        usdc.mint(rando, 50e6);
        vm.prank(rando);
        usdc.transfer(address(pool), 50e6); // stray direct transfer
        pool.sweepStray();
        assertEq(pool.reserve(), 50e6);
        assertEq(pool.committed(1), 100e6); // the members' pot never inflates
        assertConservation();
    }

    function test_rescueForeignToken_neverUSDC() public {
        Mock18Decimals alien = new Mock18Decimals();
        alien.mint(address(pool), 123e18);
        vm.prank(founder);
        pool.rescueForeignToken(address(alien), founder);
        assertEq(alien.balanceOf(founder), 123e18);

        vm.prank(founder);
        vm.expectRevert(MeritDistributor.ForeignTokenOnly.selector);
        pool.rescueForeignToken(address(usdc), founder);
    }

    // ─────────────────────────── seals ───────────────────────────

    function test_seal_onceThenCorrectOnceInsideWindow() public {
        vm.prank(sealer);
        pool.sealSeason(1, keccak256("xp-root"), "ipfs://season-1");
        vm.prank(sealer);
        vm.expectRevert(MeritDistributor.SealExists.selector);
        pool.sealSeason(1, keccak256("xp-root-2"), "u");

        vm.prank(founder);
        pool.sealCorrect(1, keccak256("xp-root-fixed"));
        assertEq(pool.sealRoot(1), keccak256("xp-root-fixed"));
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.AlreadyCorrected.selector);
        pool.sealCorrect(1, keccak256("xp-root-3"));
    }

    function test_sealCorrect_windowCloses() public {
        vm.prank(sealer);
        pool.sealSeason(1, keccak256("xp"), "u");
        vm.warp(block.timestamp + CORRECTION_WINDOW + 1);
        vm.prank(founder);
        vm.expectRevert(MeritDistributor.CorrectionWindowClosed.selector);
        pool.sealCorrect(1, keccak256("xp2"));
    }

    // ─────────────────────────── roles ───────────────────────────

    function test_roles_negativeMatrix() public {
        _fundCommitted(1, 100e6);
        vm.prank(rando);
        vm.expectRevert(MeritDistributor.NotExecutor.selector);
        pool.postRound(1001, keccak256("r"), 1e6, "u", MeritDistributor.RoundClass.INTERIM);
        vm.prank(rando);
        vm.expectRevert(MeritDistributor.NotSealer.selector);
        pool.sealSeason(1, keccak256("x"), "u");
        vm.prank(rando);
        vm.expectRevert(MeritDistributor.NotGuardian.selector);
        pool.pause();
        vm.prank(rando);
        vm.expectRevert(MeritDistributor.NotExecutor.selector);
        pool.openSeason(2);
        vm.prank(rando);
        vm.expectRevert();
        pool.announceWithdrawal(rando, 1);
        vm.prank(guardian);
        vm.expectRevert();
        pool.revokeRound(1001); // guardian can NEVER veto — pause-only
    }

    function test_rotations_rejectZero() public {
        vm.startPrank(founder);
        pool.rotateExecutor(rando);
        assertEq(pool.executor(), rando);
        vm.expectRevert(MeritDistributor.ZeroAddress.selector);
        pool.rotateGuardian(address(0));
        vm.stopPrank();
    }
}
