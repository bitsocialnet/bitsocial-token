const hre = require("hardhat");

function isB50(addr) {
  return addr.toLowerCase().startsWith("0xb50");
}

async function main() {
  const factory = await hre.ethers.getContractAt(
    "TokenFactory",
    process.env.FACTORY
  );

  const supply = hre.ethers.parseUnits("210000000", 18);

  const bytecode = hre.ethers.solidityPackedKeccak256(
    ["bytes", "bytes"],
    [
      hre.artifacts.readArtifactSync("BitsocialToken").bytecode,
      hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [supply]
      )
    ]
  );

  console.log("Searching for salt...");

  for (let i = 0; i < 1_000_000; i++) {
    const salt = hre.ethers.zeroPadValue(hre.ethers.toBeHex(i), 32);

    const predicted = await factory.computeAddress(salt, bytecode);

    if (isB50(predicted)) {
      console.log("FOUND!");
      console.log("Salt:", salt);
      console.log("Address:", predicted);
      return;
    }

    if (i % 10000 === 0) {
      console.log("Checked:", i);
    }
  }

  console.log("No match found");
}

main();