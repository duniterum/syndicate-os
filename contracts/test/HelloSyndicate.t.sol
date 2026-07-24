// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {HelloSyndicate} from "../src/HelloSyndicate.sol";

/// @notice Zero-dependency spike test — proves the compiler + test runner work on this
///         box without any external lib. forge discovers `test*` functions by ABI.
contract HelloSyndicateTest {
    HelloSyndicate internal hello;

    function setUp() public {
        hello = new HelloSyndicate();
    }

    function test_echoesInput() public view {
        require(hello.echo(4200) == 4200, "spike: echo mismatch");
    }
}
