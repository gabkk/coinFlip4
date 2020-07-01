//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.21 <0.7.0;
//pragma solidity 0.6.10;

contract Ownable{
  address public owner;

  modifier onlyOwner(){
      require(msg.sender == owner);
      _; //Continue execution
  }

  constructor() public payable {
      owner = msg.sender;
  }
}
