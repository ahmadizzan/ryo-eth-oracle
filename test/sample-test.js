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
    await tx.wait();

    // Final state: oracle instance addr should be updated to `sampleAddress`
    expect(await oracleCaller.getOracleInstanceAddress()).to.equal(sampleAddress);
  });

  it("Should simulate data update without error(s)", async function () {
    const [owner] = await ethers.getSigners();

    const DataOracle = await ethers.getContractFactory("DataOracle");
    const dataOracle = await DataOracle.deploy();
    await dataOracle.deployed();

    const OracleCaller = await ethers.getContractFactory("OracleCaller");
    const oracleCaller = await OracleCaller.deploy();
    await oracleCaller.deployed();

    // Set oracle instance address to dataOracle's address
    const setInstanceTx = await oracleCaller.setOracleInstanceAddress(dataOracle.address);
    await setInstanceTx.wait();
    expect(await oracleCaller.getOracleInstanceAddress()).to.equal(dataOracle.address);

    //
    // Simulate update data flow
    //
    // STEP 1: init request
    const updateDataTx = await oracleCaller.updateData();
    await updateDataTx.wait();
    expect(updateDataTx)
      .to.emit(dataOracle, "GetLatestDataEvent")
      .to.emit(oracleCaller, "ReceivedNewRequestIdEvent");
    
    // STEP 2: simulate client update latest data to contract

    //// Get request id
    const events = await oracleCaller.queryFilter("ReceivedNewRequestIdEvent", 0, 'latest');
    const event = events[0];
    const requestId = event.args.id;

    //// Set data
    const setLatestDataTx = await dataOracle.setLatestData("hehe", oracleCaller.address, requestId);
    await setLatestDataTx.wait();
    expect(setLatestDataTx)
      .to.emit(oracleCaller, "DataUpdatedEvent")
        .withArgs(requestId, "hehe")
      .to.emit(dataOracle, "SetLatestDataEvent")
        .withArgs("hehe", oracleCaller.address);
    
    //// Check latest data value
    expect(await oracleCaller.getData()).to.equal("hehe");
  });
});