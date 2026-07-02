require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      // accounts: [process.env.PRIVATE_KEY],
    },
  },
};