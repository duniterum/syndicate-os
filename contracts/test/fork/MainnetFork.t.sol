// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {MeritDistributor} from "../../src/MeritDistributor.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Real-USDC ground truth on an Avalanche C-Chain MAINNET FORK (the founder's
///         venue ruling: no testnet — the fork IS mainnet state). Runs only when AVAX_RPC
///         is set (e.g. AVAX_RPC=https://api.avax.network/ext/bc/C/rpc forge test);
///         silently green otherwise so the offline suite never breaks.
contract MainnetForkTest is Test {
    // Circle's native USDC on Avalanche C-Chain.
    address constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;

    MeritDistributor internal pool;
    address internal founder = makeAddr("founder");
    address internal executor = makeAddr("executor");
    bool internal forked;

    function setUp() public {
        string memory rpc = vm.envOr("AVAX_RPC", string(""));
        if (bytes(rpc).length == 0) return;
        vm.createSelectFork(rpc);
        forked = true;
        pool = new MeritDistributor(
            USDC, makeAddr("sealer"), executor, makeAddr("guardian"),
            72 hours, 730 days, 72 hours, 7 days, 14 days, keccak256("s1")
        );
        pool.transferOwnership(founder);
        vm.prank(founder);
        pool.acceptOwnership();
        // deal() writes the real token's balance storage — the founder holds real-USDC state.
        deal(USDC, founder, 1_000_000e6, true);
        vm.prank(founder);
        IERC20(USDC).approve(address(pool), type(uint256).max);
    }

    function _leaf(uint256 rid, address acct, uint256 amt) internal view returns (bytes32) {
        return keccak256(
            bytes.concat(
                keccak256(abi.encode(uint8(1), block.chainid, address(pool), rid, acct, amt))
            )
        );
    }

    /// The real token accepts the deploy (decimals()==6) and a full fund→post→activate→
    /// claim cycle moves REAL USDC with the balance ground truth holding throughout.
    function testFork_fullCycle_realUSDC() public {
        if (!forked) return;
        vm.prank(founder);
        pool.fund(100e6, MeritDistributor.Bucket.COMMITTED, 1);
        assertGe(IERC20(USDC).balanceOf(address(pool)), 100e6);

        address alice = makeAddr("alice");
        uint256 rid = 1001;
        bytes32 leaf = _leaf(rid, alice, 100e6);
        vm.prank(executor);
        pool.postRound(rid, leaf, 100e6, "u", MeritDistributor.RoundClass.INTERIM);
        vm.warp(block.timestamp + 72 hours);
        pool.activate(rid);

        bytes32[] memory noProof = new bytes32[](0);
        pool.claimFor(rid, alice, 100e6, noProof);
        assertEq(IERC20(USDC).balanceOf(alice), 100e6, "real USDC did not land");
        assertTrue(pool.conservationHolds());
        assertGe(
            IERC20(USDC).balanceOf(address(pool)),
            uint256(pool.reserve()) + pool.totalCommitted() + pool.roundReserved() + pool.carryover()
        );
    }

    /// A recipient whose real-token transfer REVERTS (Circle-blacklist behavior simulated
    /// at the call boundary) is skipped by the batch — the rest are paid, the skipped
    /// member's pull fallback stays intact. Our isolation vs a reverting REAL token call.
    function testFork_batchIsolation_revertingRecipient() public {
        if (!forked) return;
        vm.prank(founder);
        pool.fund(100e6, MeritDistributor.Bucket.COMMITTED, 1);

        address alice = makeAddr("alice");
        address blocked = makeAddr("blocked");
        uint256 rid = 1001;
        bytes32 leafA = _leaf(rid, alice, 60e6);
        bytes32 leafB = _leaf(rid, blocked, 40e6);
        bytes32 root = leafA < leafB
            ? keccak256(bytes.concat(leafA, leafB))
            : keccak256(bytes.concat(leafB, leafA));
        vm.prank(executor);
        pool.postRound(rid, root, 100e6, "u", MeritDistributor.RoundClass.INTERIM);
        vm.warp(block.timestamp + 72 hours);
        pool.activate(rid);

        // Simulate the blacklist at the boundary: transfers to `blocked` revert.
        vm.mockCallRevert(
            USDC,
            abi.encodeWithSelector(IERC20.transfer.selector, blocked, 40e6),
            "BLACKLISTED"
        );
        address[] memory accts = new address[](2);
        accts[0] = alice;
        accts[1] = blocked;
        uint256[] memory amts = new uint256[](2);
        amts[0] = 60e6;
        amts[1] = 40e6;
        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = new bytes32[](1);
        proofs[0][0] = leafB;
        proofs[1] = new bytes32[](1);
        proofs[1][0] = leafA;
        vm.prank(executor);
        pool.claimForBatch(rid, accts, amts, proofs);

        assertEq(IERC20(USDC).balanceOf(alice), 60e6, "good leaf not paid");
        assertFalse(pool.claimed(rid, blocked), "skipped leaf must stay pull-claimable");
        vm.clearMockedCalls();
        pool.claimFor(rid, blocked, 40e6, proofs[1]);
        assertEq(IERC20(USDC).balanceOf(blocked), 40e6, "pull fallback failed");
        assertTrue(pool.conservationHolds());
    }
}
