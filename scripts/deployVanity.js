const hre = require("hardhat");

async function main() {
  const factory = await hre.ethers.getContractAt(
    "TokenFactory",
    process.env.FACTORY
  );
  const factoryAddress = await factory.getAddress();

  // A call to an address with no code succeeds without deploying anything.
  if ((await hre.ethers.provider.getCode(factoryAddress)) === "0x") {
    throw new Error(`No TokenFactory at ${factoryAddress} on this network`);
  }

  const salt = process.env.SALT;

  // Same init code findSalt.js hashes; the constructor takes no arguments.
  const { bytecode } = await hre.artifacts.readArtifact("BitsocialToken");
  const tokenAddress = hre.ethers.getCreate2Address(
    factoryAddress,
    salt,
    hre.ethers.keccak256(bytecode)
  );

  const tx = await factory.deploy(bytecode, salt);
  const receipt = await tx.wait();

  if ((await hre.ethers.provider.getCode(tokenAddress)) === "0x") {
    throw new Error(
      `No contract at ${tokenAddress} after tx ${receipt.hash}; is FACTORY a TokenFactory?`
    );
  }

  console.log("Token deployed at:", tokenAddress);
  console.log("Deployed tx:", receipt.hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});