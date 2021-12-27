// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
const { ethers } = require("ethers");

const DataOracleJSON = require(__dirname + '/../artifacts/contracts/DataOracle.sol/DataOracle.json');
const OracleCallerJSON = require(__dirname + '/../artifacts/contracts/OracleCaller.sol/OracleCaller.json');

// TODO: do not hardcode these!
const dataOracleAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const oracleCallerAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

const MAX_RETRIES = 1;
const PROCESS_CHUNK = 3;

let pendingRequestQueue = []

// TODO: wire to actual endpoint
async function fetchData() {
  const now = Date.now();
  return "data " + now;
}

async function setLatestData(dataOracle, id, data) {
  try {
    const tx = await dataOracle.setLatestData(data, oracleCallerAddress, id);
    await tx.wait();
  } catch (error) {
    console.log('Error encountered while calling setLatestData');
    console.log(error);
  }
}

async function processRequest(dataOracle, id) {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const data = await fetchData()
      await setLatestData(dataOracle, id, data);
      return;
    } catch (error) {
      if (retries === MAX_RETRIES - 1) {
        // set data to empty string
        await setLatestData(dataOracle, id, data);
        return;
      }
      retries++
    }
  }
}

async function processRequestQueue(dataOracle) {
  console.log(">> processRequestQueue");

  let processedRequests = 0;
  while (pendingRequestQueue.length > 0 && processedRequests < PROCESS_CHUNK) {
    const reqId = pendingRequestQueue.shift();
    await processRequest(dataOracle, reqId);
    processedRequests++;
  }
}

(async () => {
  // We first initialize ethers by creating a provider using our local node
  const provider = new ethers.providers.JsonRpcProvider();

  const signer = provider.getSigner(0);
  console.log('Signer address:', await signer.getAddress());

  // Initialize contracts
  const dataOracle = new ethers.Contract(
    dataOracleAddress,
    DataOracleJSON.abi,
    signer
  );

  const oracleCaller = new ethers.Contract(
    oracleCallerAddress,
    OracleCallerJSON.abi,
    signer
  );

  oracleCaller.on("ReceivedNewRequestIdEvent", (_id) => {
    console.log("NEW EVENT - ReceivedNewRequestIdEvent:", _id);
    pendingRequestQueue.push(_id);
  })

  oracleCaller.on("DataUpdatedEvent", (_id, _data) => {
    console.log("NEW EVENT - DataUpdatedEvent: id =", _id, 'data =', _data);
  })

  setInterval(async () => {
    processRequestQueue(dataOracle);
  }, 2000);

})()
