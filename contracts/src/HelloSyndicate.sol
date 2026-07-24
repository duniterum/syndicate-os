// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title HelloSyndicate — toolchain spike sentinel, NOT a product contract.
/// @notice Exists only to prove Foundry compiles + tests on this box. Deleted once
///         the real SeasonBountyPool lands. Carries zero merit-rail logic.
contract HelloSyndicate {
    /// @dev Echoes its input so a test can assert a real compile+run round-trip.
    function echo(uint256 xp) external pure returns (uint256) {
        return xp;
    }
}
