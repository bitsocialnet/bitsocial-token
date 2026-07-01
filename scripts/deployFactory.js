const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("TokenFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  console.log("Factory deployed at:", await factory.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});