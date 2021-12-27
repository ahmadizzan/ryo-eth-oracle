const { ethers } = require("ethers");

const OracleCallerJSON = require(__dirname + '/../artifacts/contracts/OracleCaller.sol/OracleCaller.json');

// TODO: do not hardcode these!
const oracleCallerAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

(async () => {
  // We first initialize ethers by creating a provider using our local node
  const provider = new ethers.providers.JsonRpcProvider();

  const signer = provider.getSigner(0);
  console.log('Signer address:', await signer.getAddress());

  const oracleCaller = new ethers.Contract(
    oracleCallerAddress,
    OracleCallerJSON.abi,
    signer
  );

  // Trigger update data!
  const tx = await oracleCaller.updateData();
  await tx.wait()

})()
