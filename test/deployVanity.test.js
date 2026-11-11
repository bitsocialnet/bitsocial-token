const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const SCRIPT = path.join(__dirname, "..", "scripts", "deployVanity.js");
const SALT = fs
  .readFileSync(path.join(__dirname, "..", "scripts", "salt.txt"), "utf8")
  .match(/Salt\s*:\s*(0x[0-9a-fA-F]{64})/)[1];
const HOLDER = "0x5Bc4FF33f86E0272be53Fa25861294489AB2FE2a";
const SUPPLY = hre.ethers.parseUnits("210000000", 18);

// Runs scripts/deployVanity.js in this process (same Hardhat network as the
// test) and resolves once it has logged its result. process.exit is stubbed so
// a failing run reports its exit code instead of ending mocha.
function runDeployVanity(env) {
  return new Promise((resolve) => {
    const saved = { FACTORY: process.env.FACTORY, SALT: process.env.SALT };
    const { log, error } = console;
    const { exit } = process;
    const logs = [];
    let err;
    let exitCode;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      // Let the script finish logging and reach process.exit before restoring.
      setImmediate(() => {
        console.log = log;
        console.error = error;
        process.exit = exit;
        for (const [key, value] of Object.entries(saved)) {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        }
        resolve({ logs, error: err, exitCode });
      });
    };

    process.exit = (code) => {
      exitCode = code === undefined ? 0 : code;
    };
    console.log = (...args) => {
      logs.push(args);
      finish();
    };
    console.error = (e) => {
      err = e;
      finish();
    };

    process.env.FACTORY = env.FACTORY;
    process.env.SALT = env.SALT;

    delete require.cache[require.resolve(SCRIPT)];
    require(SCRIPT);
  });
}

async function deployFactory() {
  const factory = await hre.ethers.deployContract("TokenFactory");
  await factory.waitForDeployment();
  return factory;
}

async function tokenAddress(factoryAddress) {
  const { bytecode } = await hre.artifacts.readArtifact("BitsocialToken");
  return hre.ethers.getCreate2Address(
    factoryAddress,
    SALT,
    hre.ethers.keccak256(bytecode)
  );
}

function expectFailedRun(result) {
  expect(result.error).to.be.an.instanceOf(Error);
  expect(result.exitCode).to.equal(1);
  expect(result.logs).to.deep.equal([]);
}

describe("scripts/deployVanity.js", function () {
  it("deploys BitsocialToken through TokenFactory at the CREATE2 address for the salt", async function () {
    const factory = await deployFactory();
    const { bytecode } = await hre.artifacts.readArtifact("BitsocialToken");
    const expected = await factory.computeAddress(
      SALT,
      hre.ethers.keccak256(bytecode)
    );

    const result = await runDeployVanity({
      FACTORY: await factory.getAddress(),
      SALT,
    });

    expect(result.error).to.equal(undefined);
    expect(result.exitCode).to.equal(undefined);
    expect(result.logs[0]).to.deep.equal(["Token deployed at:", expected]);
    expect(result.logs[1][0]).to.equal("Deployed tx:");
    expect(await hre.ethers.provider.getCode(expected)).to.not.equal("0x");

    const token = await hre.ethers.getContractAt("BitsocialToken", expected);
    expect(await token.totalSupply()).to.equal(SUPPLY);
    expect(await token.balanceOf(HOLDER)).to.equal(SUPPLY);
  });

  it("exits non-zero when the deployment fails", async function () {
    const factory = await deployFactory();
    const env = { FACTORY: await factory.getAddress(), SALT };

    await runDeployVanity(env);
    // Same factory and salt again: CREATE2 collides, so the deploy reverts.
    const result = await runDeployVanity(env);

    expectFailedRun(result);
  });

  it("exits non-zero without sending a transaction when FACTORY has no code", async function () {
    // For example a factory address from another network.
    const factory = hre.ethers.Wallet.createRandom().address;
    const [sender] = await hre.ethers.getSigners();
    const nonce = await sender.getNonce();

    const result = await runDeployVanity({ FACTORY: factory, SALT });

    expectFailedRun(result);
    expect(result.error.message).to.contain("No TokenFactory");
    expect(await sender.getNonce()).to.equal(nonce);
  });

  it("exits non-zero when the FACTORY call succeeds but deploys nothing", async function () {
    // Init code PUSH1 1 PUSH1 0 RETURN leaves a single STOP byte as runtime
    // code, so every call to this contract succeeds and does nothing.
    const [sender] = await hre.ethers.getSigners();
    const tx = await sender.sendTransaction({ data: "0x60016000f3" });
    const { contractAddress } = await tx.wait();
    expect(await hre.ethers.provider.getCode(contractAddress)).to.equal("0x00");

    const result = await runDeployVanity({ FACTORY: contractAddress, SALT });

    expectFailedRun(result);
    expect(result.error.message).to.contain("No contract at");
    expect(
      await hre.ethers.provider.getCode(await tokenAddress(contractAddress))
    ).to.equal("0x");
  });
});
