/*

    Bitsocial (BSO) - third and final token. Immutable, fixed-supply ERC-20.

    Lineage (each generation migrated 1:1 from the previous; the predecessor
    contracts remain on-chain forever as the verifiable proof of provenance):
      1) Avalanche  0x625fc9bb971bb305a2ad63252665dcfe9098bee9  - 2021
      2) Ethereum   0xEA81DaB2e0EcBc6B5c4172DE4c22B6Ef6E55Bd8f  - 2023, upgradeable proxy
      3) Ethereum   this contract                               - immutable & adminless

    In development since 2021. Supply: 210,000,000 BSO - minted once, 100%
    distributed. No team / ICO / presale. No owner - no mint - no pause - no proxy.

    Anchor of record = the predecessor contracts above.
    Official site at launch (may move; verify against the lineage): bitsocial.net

*/

// contracts/BitsocialToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BitsocialToken is ERC20, ERC20Burnable {
    constructor() ERC20("Bitsocial", "BSO") {
        _mint(0x5Bc4FF33f86E0272be53Fa25861294489AB2FE2a, 210_000_000 * 1e18);
    }
}