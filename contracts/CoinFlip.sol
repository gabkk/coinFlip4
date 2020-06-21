import "./Ownable.sol";
pragma solidity 0.5.12;

contract CoinFlip is Ownable{

    uint public _contractBalance_;

    // status of active bets; Each player can have multiple bets before each flip
    //Update each time player submited new bet

    struct activeBet  {
        uint[] betListPrecdictions;  // 0 or 1
        uint[] betListAmount; //wei
        }

    //list of all activities of a player (update after finished solving each bet)
    struct betHistory {
        uint totalBalance;
        uint totalTopUp;
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
    mapping (address => betHistory) public playerHistory;

    //newBetCreated emit when created and not finished
    event newBetCreated(uint betChoice, uint betAmount, address playerAddress);

    //betFinished emit when
    event betFinished(uint betAmount, uint winAmount, uint result);

    uint _minBetAmount = 1000;

    function topUp() public payable {
        _contractBalance_ += msg.value;
        playerHistory[msg.sender].totalTopUp += msg.value;
        updatePlayerBalance(msg.sender);
    }

    function balance() public view returns (uint) {
      return _contractBalance_;
    }

    function playerReport(address playerAddress) public view returns(uint,uint,uint,uint,uint,uint,uint) {
        require(playerHistory[playerAddress].totalBalance ==
            playerHistory[playerAddress].totalTopUp - playerHistory[playerAddress].totalSpentAmount + playerHistory[playerAddress].totalWinAmount,
            "ERROR CALCULATING PLAYER BALLANCE");
        return  (   playerHistory[playerAddress].totalBalance,
                    playerHistory[playerAddress].totalTopUp,
                    playerHistory[playerAddress].totalSpentAmount,
                    playerHistory[playerAddress].totalWinAmount,
                    playerHistory[playerAddress].totalGames,
                    playerHistory[playerAddress].totalWins,
                    playerHistory[playerAddress].lastWinAmount );
    }

    function createBet(uint betChoice) public payable {
        require(msg.value >= _minBetAmount);
        require(_contractBalance_ >= msg.value , "TOO BIG BET, NOT ENOUGH BALANCE ON CONTRACT");
        createBetForPlayer(betChoice, msg.value, msg.sender);
    }

    function createBetForPlayer(uint betChoice, uint256 betAmount, address playerAddress) public {
        require(betAmount >= _minBetAmount);
        require(betChoice == 1 || betChoice == 0, "Bet should be 1 or 0");

        insertNewBetForPlayer(betChoice, betAmount, playerAddress);

        uint totalActivePredicts = playerActiveBetList[playerAddress].betListPrecdictions.length;
        uint  totalActiveBets = playerActiveBetList[playerAddress].betListAmount.length;

        assert(totalActivePredicts == totalActiveBets);
        assert(
            keccak256(
                abi.encodePacked(
                    playerActiveBetList[playerAddress].betListPrecdictions[totalActivePredicts - 1],
                    playerActiveBetList[playerAddress].betListAmount[totalActiveBets - 1]
                )
            )
            ==
            keccak256(
                abi.encodePacked(
                    betChoice,
                    betAmount
                )
            )
        );

        emit newBetCreated(betChoice, betAmount, playerAddress);
    }

    function updatePlayerBalance(address playerAddress) private {
        playerHistory[playerAddress].totalBalance =
        playerHistory[playerAddress].totalTopUp -  playerHistory[playerAddress].totalSpentAmount +  playerHistory[playerAddress].totalWinAmount;
    }

    function insertNewBetForPlayer(uint betChoice, uint betAmount, address playerAddress) private {
        require(playerHistory[playerAddress].totalBalance ==
            playerHistory[playerAddress].totalTopUp - playerHistory[playerAddress].totalSpentAmount + playerHistory[playerAddress].totalWinAmount,
            "ERROR CALCULATING PLAYER BALLANCE");
        require(playerActiveBetList[playerAddress].betListPrecdictions.length < 3, "Too many bets for one draw; Please hit FLIP button!");
        require(playerActiveBetList[playerAddress].betListAmount.length < 3, "Too many bets for one draw; Please hit FLIP button!");
        require(playerHistory[playerAddress].totalBalance >= betAmount, "Too big Bet, please top Up more coins..");

        playerHistory[playerAddress].totalSpentAmount += betAmount;
        updatePlayerBalance(playerAddress);

        playerActiveBetList[playerAddress].betListPrecdictions.push(betChoice);
        playerActiveBetList[playerAddress].betListAmount.push(betAmount);
    }

    function getMyBet() public view returns(uint[] memory, uint[] memory)
    {
        return getPlayerBet(msg.sender);
    }

    function getPlayerBet(address playerAddress) public view returns(uint[] memory, uint[] memory)
    {
        return (
            playerActiveBetList[playerAddress].betListPrecdictions,
            playerActiveBetList[playerAddress].betListAmount
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

    function tossCoin() public {
      playerTossCoin(msg.sender);
    }

    function playerTossCoin(address payable playerAddress) public returns(uint , uint, uint) {
        uint result = random();
        uint spentAmount = 0;
        uint winAmount = 0;

        require(    result == 1 || result==0);
        require(    playerActiveBetList[playerAddress].betListPrecdictions.length > 0,
                    "No bet placed, plase place the bet!");

        require(    playerActiveBetList[playerAddress].betListAmount.length > 0,
                    "No bet placed, plase place the bet!");

        require(    playerActiveBetList[playerAddress].betListAmount.length == playerActiveBetList[playerAddress].betListPrecdictions.length,
                    "Error bet data");

        for (uint x=0; x < playerActiveBetList[playerAddress].betListPrecdictions.length; x++) {
            spentAmount += playerActiveBetList[playerAddress].betListAmount[x];
            if (playerActiveBetList[playerAddress].betListPrecdictions[x] == result) {
                winAmount += playerActiveBetList[playerAddress].betListAmount[x];
            }
        }

        updatePlayerHistory(spentAmount, winAmount);

        resetPlayerBetList();

        if (winAmount>0) {
            playerHistory[playerAddress].totalWinAmount += winAmount;
            updatePlayerBalance(playerAddress);
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
