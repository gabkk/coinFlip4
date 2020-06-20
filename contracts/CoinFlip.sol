import "./Ownable.sol";
pragma solidity 0.5.12;

contract CoinFlip is Ownable{

    uint public _contractBalance_;

    // status of active bets; Each player can have multiple bets before each flip
    //Update each time player submited new bet

    struct activeBet {
        uint[] betListPrecdictions;  // 0 or 1
        uint[] betListAmount; //wei
        }

    //list of all activities of a player (update after finished solving each bet)
    struct betHistory {
        uint totalSpentAmount;
        uint totalWinAmount;
        uint totalGames;
        uint totalWins;
        uint lastWinAmount;
    }

    //betList is a list of all active bets
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => activeBet) private playerActiveBetList;

    //playerList store information
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => betHistory) private playerHistory;

    //newBetCreated emit when created and not finished
    event newBetCreated(uint betChoice, uint betAmount);

    //betFinished emit when
    event betFinished(uint betAmount, uint winAmount, uint result);

    uint _minBetAmount = 1000;

    modifier higherMin(){
        require(msg.value >= _minBetAmount);
        _;
    }

    function topUp() public payable {
        _contractBalance_ += msg.value;
    }

    function balance() public view returns (uint) {
      return _contractBalance_;
    }

    function createBet(uint betChoice) public payable higherMin() {
        require(betChoice == 1 || betChoice == 0, "Bet should be 1 or 0");
        _contractBalance_ += msg.value;

        insertNewBet(betChoice);

        uint totalActivePredicts = playerActiveBetList[msg.sender].betListPrecdictions.length;
        uint  totalActiveBets = playerActiveBetList[msg.sender].betListAmount.length;

        assert(totalActivePredicts == totalActiveBets);
        assert(
            keccak256(
                abi.encodePacked(
                    playerActiveBetList[msg.sender].betListPrecdictions[totalActivePredicts - 1],
                    playerActiveBetList[msg.sender].betListAmount[totalActiveBets - 1]
                )
            )
            ==
            keccak256(
                abi.encodePacked(
                    betChoice,
                    msg.value
                )
            )
        );

        emit newBetCreated(betChoice, msg.value);
        //checkPayOut(newPlayersBet)
    }

    function insertNewBet(uint betChoice) private {
        require(playerActiveBetList[msg.sender].betListPrecdictions.length < 10, "Too many bets for one draw; Please hit FLIP button!");
        playerActiveBetList[msg.sender].betListPrecdictions.push(betChoice);
        playerActiveBetList[msg.sender].betListAmount.push(msg.value);
    }

    function getMyBet() public view returns(uint[] memory, uint[] memory)
    {
        return (
            playerActiveBetList[msg.sender].betListPrecdictions,
            playerActiveBetList[msg.sender].betListAmount
        );
    }

    function getMyHistory() public view returns(uint, uint, uint, uint, uint)
    {
        return (
            playerHistory[msg.sender].totalSpentAmount,
            playerHistory[msg.sender].totalWinAmount,
            playerHistory[msg.sender].totalWins,
            playerHistory[msg.sender].totalGames,
            playerHistory[msg.sender].lastWinAmount
        );
    }

    function random() internal view returns(uint) {
        return now % 2;
    }

    function updatePlayerHistory(uint spentAmount, uint winAmount) internal {
        playerHistory[msg.sender].totalSpentAmount +=  spentAmount;
        playerHistory[msg.sender].totalWinAmount += winAmount;
        playerHistory[msg.sender].totalGames++;
        if (winAmount>0) {
            playerHistory[msg.sender].totalWins += 1;
        }
        playerHistory[msg.sender].lastWinAmount = winAmount;
    }

    function resetPlayerBetList() internal {
        activeBet memory noBets;
        playerActiveBetList[msg.sender] = noBets;
    }

    function payOut() public {
      FlipNPayOut(msg.sender);
    }

    function FlipNPayOut(address payable playerAddress) public returns(uint , uint, uint) {
        uint result = random();
        uint spentAmount = 0;
        uint winAmount = 0;

        require(    playerActiveBetList[playerAddress].betListPrecdictions.length > 0,
                    "No bet placed, plase place the bet!");

        for (uint x=0; x < playerActiveBetList[playerAddress].betListPrecdictions.length; x++) {
            spentAmount += playerActiveBetList[playerAddress].betListAmount[x];
            if (playerActiveBetList[playerAddress].betListPrecdictions[x] == result) {
                winAmount += playerActiveBetList[playerAddress].betListAmount[x];
            }
        }

        updatePlayerHistory(spentAmount, winAmount);

        resetPlayerBetList();

        if (winAmount>0) {
            _contractBalance_ -= winAmount;
            playerAddress.send(winAmount); //Should change WIn rate later..
        }

        emit betFinished(spentAmount, winAmount, result);
        return (spentAmount, winAmount, result);
    }

    /*
    function deleteplayer(address creator) public onlyOwner {
      string memory name = people[creator].name;
      bool senior = people[creator].senior;

       delete people[creator];
       assert(people[creator].age == 0);
       emit playerDeleted(name, senior, owner);
   }
   function getCreator(uint index) public view onlyOwner returns(address){
       return creators[index];
   }
   function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       return toTransfer;
   }
   */

}
