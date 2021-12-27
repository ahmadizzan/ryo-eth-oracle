
# Run Your Own ETH Oracle

Run your own simple ETH oracle implementation, fetching off-chain data from external APIs.

This project is mostly based on [CryptoZombies oracle series](https://cryptozombies.io/en/lesson/14), modified and ported to [hardhat](https://github.com/nomiclabs/hardhat)/[ether.js](https://github.com/ethers-io/ethers.js/).

## Requirements
1. `node js (tested on v16.13.1)`
2. `npx`

## Installation
```
npm install
```

## Usage

#### Deploy `DataOracle` and `OracleCaller` contracts to hardhat local network.

```
# run local network
npx hardhat node
# deploy to local network
npx hardhat run --networkscripts/deploy.js
```

IMPORTANT: after deploying the contracts, change `dataOracleAddress` and `oracleCallerAddress` to the deployed addresses of each contracts in `scripts/server.js` and `scripts/trigger-update-data.js`.

#### Simulate data update

Assuming you have deployed the contracts.

***Step 1:*** run sample server

This script will listen to new request events triggered from oracle caller contract and periodically process them.

```
node scripts/server.js
```

***Step 2:*** run trigger update data script

This will tigger will call OracleCaller contract's `updateData`, emitting `ReceivedNewRequestIdEvent` event, which will trigger data fetching logic in `scripts/server.js`.

```
node scripts/trigget-update-data.js
```

If you look at `scripts/server.js`'s output, you should be able to see something like this.

```
NEW EVENT - ReceivedNewRequestIdEvent: BigNumber { _hex: '0x0203', _isBigNumber: true }
NEW EVENT - DataUpdatedEvent: id = BigNumber { _hex: '0x0203', _isBigNumber: true } data = https://cdn.shibe.online/shibes/55a6c07e7965f3ca93ff64bcbcc6a4a7a62645de.jpg
```

Which shows that the request was listened by the server and the server triggered a data update to the contract.

## Run tests
```
npx hardhat test
```
