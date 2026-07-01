// contracts/BitsocialToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BitsocialToken is ERC20, ERC20Burnable, ERC20Permit {
    constructor(uint256 initialSupply)
        ERC20("Bitsocial", "BSO")
        ERC20Permit("Bitsocial")
    {
        _mint(msg.sender, initialSupply);
    }
}