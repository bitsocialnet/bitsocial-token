// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./BitsocialToken.sol";

contract TokenFactory {
    event Deployed(address addr, bytes32 salt);

    function deploy(
        bytes32 salt,
        uint256 supply
    ) external returns (address addr) {
        bytes memory bytecode = abi.encodePacked(
            type(BitsocialToken).creationCode,
            abi.encode(supply)
        );

        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(addr) { revert(0, 0) }
        }

        emit Deployed(addr, salt);
    }

    function computeAddress(bytes32 salt, bytes32 bytecodeHash)
        external
        view
        returns (address)
    {
        return address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            bytecodeHash
        )))));
    }
}