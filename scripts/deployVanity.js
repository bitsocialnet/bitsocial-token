const hre = require("hardhat");

async function main() {
  const factory = await hre.ethers.getContractAt(
    "TokenFactory",
    process.env.FACTORY
  );

  const salt = process.env.SALT;

  const supply = hre.ethers.parseUnits("210000000", 18);

  const tx = await factory.deploy(salt, supply);
  const receipt = await tx.wait();

  console.log("Deployed tx:", receipt.hash);
}

main().catch(console.error);