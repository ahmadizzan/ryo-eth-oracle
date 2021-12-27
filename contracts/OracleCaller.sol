//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./DataOracleInterface.sol";
import "./OracleCallerInterface.sol";

contract OracleCaller is OracleCallerInterface, Ownable {
  string private data;

  DataOracleInterface private oracleInstance;
  address private oracleAddress;

  mapping(uint256=>bool) myRequests;

  event newOracleAddressEvent(address oracleAddress);
  event ReceivedNewRequestIdEvent(uint256 id);
  event DataUpdatedEvent(uint256 id, string data);

  function getData() public view returns (string memory) {
    return data;
  }

  function getOracleInstanceAddress() public view returns (address) {
      return oracleAddress;
  }
  
  function setOracleInstanceAddress (address _oracleInstanceAddress) public onlyOwner {
    oracleAddress = _oracleInstanceAddress;
    oracleInstance = DataOracleInterface(oracleAddress);
    emit newOracleAddressEvent(oracleAddress);
  }
  
  function updateData() public {
    uint256 id = oracleInstance.getLatestData();
    myRequests[id] = true;
    emit ReceivedNewRequestIdEvent(id);
  }

  function callback(uint256 _id, string calldata _data) external override onlyOracle {
    require(myRequests[_id], "This request is not in my pending list.");
    data = _data;
    delete myRequests[_id];
    emit DataUpdatedEvent(_id, _data);
  }

  modifier onlyOracle() {
    require(msg.sender == oracleAddress, "You are not authorized to call this function.");
    _;
  }
}
