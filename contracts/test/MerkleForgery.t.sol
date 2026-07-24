// SPDX-License-Identifier: MIT
// ⛔ TEST-ONLY — the bench, never deployed. Production = src/MeritDistributor.sol (binds the REAL Circle USDC at deploy). guard-prod-purity.sh enforces the separation.
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Merkle} from "murky/Merkle.sol";
import {MeritDistributor} from "../src/MeritDistributor.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

/// @notice Proof-forgery fuzzing (spec §9): real multi-leaf trees built in-Solidity with
///         Murky (sorted-pair keccak — OZ-compatible). Every valid proof claims exactly
///         once; every mutation class the spec names is proven REJECTED.
contract MerkleForgeryTest is Test {
    MeritDistributor internal pool;
    MockUSDC internal usdc;
    Merkle internal m;

    address internal founder = makeAddr("founder");
    address internal executor = makeAddr("executor");

    function setUp() public {
        usdc = new MockUSDC();
        pool = new MeritDistributor(
            address(usdc), makeAddr("sealer"), executor, makeAddr("guardian"),
            72 hours, 730 days, 72 hours, 7 days, 14 days, keccak256("s1")
        );
        pool.transferOwnership(founder);
        vm.prank(founder);
        pool.acceptOwnership();
        m = new Merkle();
        usdc.mint(founder, type(uint96).max);
        vm.prank(founder);
        usdc.approve(address(pool), type(uint256).max);
    }

    // ── leaf builders ──

    function _leaf(uint8 kind, uint256 chainId, address poolAddr, uint256 rid, address acct, uint256 amt)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(bytes.concat(keccak256(abi.encode(kind, chainId, poolAddr, rid, acct, amt))));
    }

    function _singleHashLeaf(uint256 rid, address acct, uint256 amt) internal view returns (bytes32) {
        return keccak256(abi.encode(uint8(1), block.chainid, address(pool), rid, acct, amt));
    }

    function _packedLeaf(uint256 rid, address acct, uint256 amt) internal view returns (bytes32) {
        return keccak256(
            bytes.concat(keccak256(abi.encodePacked(uint8(1), block.chainid, address(pool), rid, acct, amt)))
        );
    }

    function _buildAndActivate(uint256 rid, bytes32[] memory leaves, uint128 budget)
        internal
        returns (bytes32 root)
    {
        root = m.getRoot(leaves);
        vm.prank(founder);
        pool.fund(budget, MeritDistributor.Bucket.COMMITTED, 1);
        vm.prank(executor);
        pool.postRound(rid, root, budget, "u", MeritDistributor.RoundClass.INTERIM);
        vm.warp(block.timestamp + 72 hours);
        pool.activate(rid);
    }

    // ── the fuzz: valid proofs pay once; mutations all revert ──

    function testFuzz_validProofsPayOnce_mutationsAllRejected(uint256 seed, uint8 nRaw) public {
        uint256 n = bound(nRaw, 2, 8);
        uint256 rid = 1001;
        address[] memory accts = new address[](n);
        uint256[] memory amts = new uint256[](n);
        bytes32[] memory leaves = new bytes32[](n);
        uint128 budget;
        for (uint256 i; i < n; ++i) {
            accts[i] = address(uint160(uint256(keccak256(abi.encode(seed, i, "acct")))));
            amts[i] = bound(uint256(keccak256(abi.encode(seed, i, "amt"))), 1e6, 1_000e6);
            budget += uint128(amts[i]);
            leaves[i] = _leaf(1, block.chainid, address(pool), rid, accts[i], amts[i]);
        }
        _buildAndActivate(rid, leaves, budget);

        // Every valid leaf claims exactly once…
        for (uint256 i; i < n; ++i) {
            bytes32[] memory proof = m.getProof(leaves, i);
            assertTrue(pool.verifyClaim(rid, accts[i], amts[i], proof));
            pool.claimFor(rid, accts[i], amts[i], proof);
            assertEq(usdc.balanceOf(accts[i]), amts[i]);
            // …and never twice.
            vm.expectRevert(MeritDistributor.AlreadyClaimed.selector);
            pool.claimFor(rid, accts[i], amts[i], proof);
        }
        assertEq(pool.totalPaid(), budget);
        assertTrue(pool.conservationHolds());
    }

    function testFuzz_wrongAmountAndWrongAccountRejected(uint256 seed) public {
        uint256 rid = 1001;
        (bytes32[] memory leaves, address[] memory accts, uint256[] memory amts) = _threeLeaves(seed, rid);
        _buildAndActivate(rid, leaves, 3_000e6);

        bytes32[] memory proof0 = m.getProof(leaves, 0);
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claimFor(rid, accts[0], amts[0] + 1, proof0); // amount+1
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claimFor(rid, accts[1], amts[0], proof0); // someone else's proof
    }

    function testFuzz_crossRoundReplayRejected(uint256 seed) public {
        // A valid (amount, proof) from round A never validates against round B — roundId
        // lives INSIDE the leaf pre-image.
        uint256 ridA = 1001;
        (bytes32[] memory leavesA, address[] memory accts, uint256[] memory amts) = _threeLeaves(seed, ridA);
        _buildAndActivate(ridA, leavesA, 3_000e6);

        uint256 ridB = 1002;
        (bytes32[] memory leavesB,,) = _threeLeaves(seed, ridB);
        _buildAndActivate(ridB, leavesB, 3_000e6);

        bytes32[] memory proofA = m.getProof(leavesA, 0);
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claimFor(ridB, accts[0], amts[0], proofA);
    }

    function testFuzz_sealKindTreeUnclaimable(uint256 seed) public {
        // kind=SEAL inside every pre-image → structurally unpayable via claim paths.
        uint256 rid = 1001;
        bytes32[] memory leaves = new bytes32[](3);
        address[] memory accts = new address[](3);
        uint256[] memory xp = new uint256[](3);
        for (uint256 i; i < 3; ++i) {
            accts[i] = address(uint160(uint256(keccak256(abi.encode(seed, i)))));
            xp[i] = bound(uint256(keccak256(abi.encode(seed, i, "xp"))), 1, 1_000e6);
            leaves[i] = _leaf(2, block.chainid, address(pool), rid, accts[i], xp[i]);
        }
        _buildAndActivate(rid, leaves, 3_000e6);
        for (uint256 i; i < 3; ++i) {
            bytes32[] memory proof = m.getProof(leaves, i);
            vm.expectRevert(MeritDistributor.BadProof.selector);
            pool.claimFor(rid, accts[i], xp[i], proof);
        }
    }

    function test_singleHashEncodingRejected() public {
        // The origin's encoding-mismatch class, part 1: a SINGLE-hash tree can never satisfy
        // the contract's double-hash reconstruction.
        uint256 rid = 1001;
        address acct = makeAddr("acctS");
        address other = makeAddr("otherS");
        uint256 amt = 100e6;
        bytes32[] memory single = new bytes32[](2);
        single[0] = _singleHashLeaf(rid, acct, amt);
        single[1] = _singleHashLeaf(rid, other, amt);
        _buildAndActivate(rid, single, uint128(amt * 2));
        bytes32[] memory proof = m.getProof(single, 0);
        assertFalse(pool.verifyClaim(rid, acct, amt, proof));
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claimFor(rid, acct, amt, proof);
    }

    function test_packedEncodingRejected() public {
        // Part 2: an abi.encodePacked tree (the origin format) can never satisfy the
        // abi.encode (padded) reconstruction.
        uint256 rid = 1002;
        address acct = makeAddr("acctP");
        address other = makeAddr("otherP");
        uint256 amt = 100e6;
        bytes32[] memory packed = new bytes32[](2);
        packed[0] = _packedLeaf(rid, acct, amt);
        packed[1] = _packedLeaf(rid, other, amt);
        _buildAndActivate(rid, packed, uint128(amt * 2));
        bytes32[] memory proof = m.getProof(packed, 0);
        assertFalse(pool.verifyClaim(rid, acct, amt, proof));
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claimFor(rid, acct, amt, proof);
    }

    function testFuzz_wrongChainIdRejected(uint256 seed, uint64 wrongChain) public {
        // The domain tag kills cross-deployment replay: a leaf built with a different
        // chainId can never satisfy the on-chain reconstruction (block.chainid).
        vm.assume(wrongChain != block.chainid);
        uint256 rid = 1001;
        address acct = address(uint160(uint256(keccak256(abi.encode(seed))) | 1));
        address other = makeAddr("otherC");
        uint256 amt = bound(seed, 1e6, 1_000e6);
        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = _leaf(1, wrongChain, address(pool), rid, acct, amt);
        leaves[1] = _leaf(1, wrongChain, address(pool), rid, other, amt);
        _buildAndActivate(rid, leaves, uint128(amt * 2));
        bytes32[] memory proof = m.getProof(leaves, 0);
        vm.expectRevert(MeritDistributor.BadProof.selector);
        pool.claimFor(rid, acct, amt, proof);
    }

    // ── the empirical chunk gas authority (spec: measurement decides, 50 = hypothesis) ──

    function test_chunkGas_50LeafBatch() public {
        uint256 rid = 1001;
        uint256 n = 50;
        address[] memory accts = new address[](n);
        uint256[] memory amts = new uint256[](n);
        bytes32[] memory leaves = new bytes32[](n);
        uint128 budget;
        for (uint256 i; i < n; ++i) {
            accts[i] = address(uint160(0xB0B00 + i));
            amts[i] = 10e6;
            budget += 10e6;
            leaves[i] = _leaf(1, block.chainid, address(pool), rid, accts[i], amts[i]);
        }
        _buildAndActivate(rid, leaves, budget);

        bytes32[][] memory proofs = new bytes32[][](n);
        for (uint256 i; i < n; ++i) {
            proofs[i] = m.getProof(leaves, i);
        }
        uint256 g0 = gasleft();
        vm.prank(executor);
        pool.claimForBatch(rid, accts, amts, proofs);
        uint256 used = g0 - gasleft();
        emit log_named_uint("claimForBatch(50) gas", used);
        emit log_named_uint("per-leaf gas", used / n);
        // Avalanche C-Chain block gas target is 15M — a 50-chunk must sit far below it.
        assertLt(used, 8_000_000, "50-leaf batch too close to block gas");
        assertEq(pool.totalPaid(), budget);
    }

    // ── helpers ──

    function _threeLeaves(uint256 seed, uint256 rid)
        internal
        view
        returns (bytes32[] memory leaves, address[] memory accts, uint256[] memory amts)
    {
        leaves = new bytes32[](3);
        accts = new address[](3);
        amts = new uint256[](3);
        for (uint256 i; i < 3; ++i) {
            accts[i] = address(uint160(uint256(keccak256(abi.encode(seed, i, rid)))));
            amts[i] = bound(uint256(keccak256(abi.encode(seed, i, "a"))), 1e6, 1_000e6);
            leaves[i] = _leaf(1, block.chainid, address(pool), rid, accts[i], amts[i]);
        }
    }
}
