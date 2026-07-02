const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const factoryAddress = process.env.FACTORY;

    if (!factoryAddress) {
        throw new Error("FACTORY missing from .env");
    }

    console.log("Factory:", factoryAddress);
    console.log("Searching for CREATE2 address starting with 0xB50...\n");

    const artifact = await hre.artifacts.readArtifact("BitsocialToken");

    // No constructor args anymore
    const bytecode = artifact.bytecode;

    const bytecodeHash = ethers.keccak256(bytecode);

    let checked = 0n;

    while (true) {
        const salt = ethers.zeroPadValue(
            ethers.toBeHex(checked),
            32
        );

        const predictedAddress = ethers.getCreate2Address(
            factoryAddress,
            salt,
            bytecodeHash
        );

        if (predictedAddress.startsWith("0xB50")) {
            console.log("\n=================================");
            console.log("FOUND MATCH!");
            console.log("Address:", predictedAddress);
            console.log("Salt   :", salt);
            console.log("Checked:", checked.toString());
            console.log("=================================");
            // return;
        }

        checked++;

        if (checked % 100000n === 0n) {
            process.stdout.write(`\rChecked ${checked.toString()} salts...`);
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});