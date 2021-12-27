//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface OracleCallerInterface {
    function callback(uint256 id, string calldata data) external;
}
