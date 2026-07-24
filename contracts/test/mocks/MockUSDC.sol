// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice 6-decimal USDC stand-in with a Circle-style blocklist for unit tests.
///         (Fork tests against the REAL mainnet USDC come with the S3-2 stack.)
contract MockUSDC is ERC20 {
    mapping(address => bool) public blocked;

    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setBlocked(address account, bool isBlocked) external {
        blocked[account] = isBlocked;
    }

    function _update(address from, address to, uint256 value) internal override {
        require(!blocked[from] && !blocked[to], "USDC: blocked");
        super._update(from, to, value);
    }
}

/// @notice A wrong-decimals token for the constructor assert test.
contract Mock18Decimals is ERC20 {
    constructor() ERC20("Wrong", "W18") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
