// SPDX-License-Identifier: MIT
// ⛔ TEST-ONLY — the crash-test dummy, NEVER deployed, NEVER referenced by src/.
// Production is src/MeritDistributor.sol alone; at the real deploy it binds the REAL
// Circle USDC (Avalanche C-Chain 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E) and the
// Snowtrace-verified source will contain ZERO test files. guard-prod-purity.sh enforces
// this separation as a RED BUILD, forever.
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice 6-decimal USDC stand-in with a Circle-style blocklist, used ONLY on the test
///         bench (the fork suite exercises the REAL mainnet USDC).
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

/// @notice ⛔ TEST-ONLY — a DELIBERATELY WRONG token (18 decimals), never deployed. It
///         exists to prove a PROTECTION: the production constructor must REFUSE any token
///         that is not 6-decimal USDC (test_constructor_rejectsWrongDecimals), and it plays
///         the stray "foreign token" in the rescueForeignToken test. If this mock ever
///         stopped being rejected, that test would go RED.
contract Mock18Decimals is ERC20 {
    constructor() ERC20("Wrong", "W18") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
