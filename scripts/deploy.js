// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy DataOracle
  const DataOracle = await hre.ethers.getContractFactory("DataOracle");
  const dataOracle = await DataOracle.deploy();
  await dataOracle.deployed();
  console.log("DataOracle deployed to:", dataOracle.address);

  // Deploy OracleCaller
  const OracleCaller = await hre.ethers.getContractFactory("OracleCaller");
  const oracleCaller = await OracleCaller.deploy();
  await oracleCaller.deployed();
  console.log("OracleCaller deployed to:", oracleCaller.address);

  // Set oracle instance on OracleCaller
  const setInstanceTx = await oracleCaller.setOracleInstanceAddress(dataOracle.address);
  await setInstanceTx.wait();
  const oracleInstanceAddress = await oracleCaller.getOracleInstanceAddress();
  console.log('OracleCaller oracle instance addr:', oracleInstanceAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
