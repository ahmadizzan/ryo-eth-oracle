const { expect } = require("chai");
const { ethers } = require("hardhat");

const emptyAddress = "0x0000000000000000000000000000000000000000";

describe("DataOracle", function () {
  it("Should emit GetLatestData event", async function () {
    const DataOracle = await ethers.getContractFactory("DataOracle");
    const dataOracle = await DataOracle.deploy();
    await dataOracle.deployed();

    const getLatestDataTx = await dataOracle.getLatestData();

    // Wait until the transaction is mined
    // TODO: is this really needed?
    await getLatestDataTx.wait();

    expect(getLatestDataTx).to.emit(dataOracle, "GetLatestDataEvent");
  });
});

describe("OracleCaller", function () {
  it("Should update oracleInstanceAddress", async function () {
    const OracleCaller = await ethers.getContractFactory("OracleCaller");
    const oracleCaller = await OracleCaller.deploy();
    await oracleCaller.deployed();

    // Initial state: oracle instance addr value is zero
    expect(await oracleCaller.getOracleInstanceAddress()).to.equal(emptyAddress);

    // Set oracle instance addr
    const sampleAddress = "0x0000000000000000000000000000000000123456";

    const tx = await oracleCaller.setOracleInstanceAddress(sampleAddress);
    tx.wait()

    // Final state: oracle instance addr should be updated to `sampleAddress`
    expect(await oracleCaller.getOracleInstanceAddress()).to.equal(sampleAddress);
  });
});