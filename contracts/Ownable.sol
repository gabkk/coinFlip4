
pragma solidity 0.5.12;

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
