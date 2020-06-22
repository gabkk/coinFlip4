//SPDX-License-Identifier: UNLICENSED

import "./Ownable.sol";
pragma solidity 0.6.10;

contract CoinFlip is Ownable{

    uint public _contractBalance_;
    uint public _totalAllPlayerBalance_;

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
        uint totalWithdrawn;
        uint totalSpentAmount;
        uint totalWinAmount;
        uint totalGames;
        uint totalWins;
        uint lastWinAmount;
    }

    //betList is a list of all active bets
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => activeBet) private activeBetList;

    //playerList store information
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => betHistory) public playerHistory;

    //newBetCreated emit when created and not finished
    event newBetCreated(uint betChoice, uint betAmount, address playerAddress);

    //betFinished emit when
    event betFinished(uint betAmount, uint winAmount, uint result);

    //common notice
    event notice(string noticeString, uint noticeValue);

    uint _minBetAmount = 1000; //All Amount are in Wei unless has _eth ending
    uint _maxBetWaiting = 3; // Maximun number of bets for a player before toss coin

    //Check Account Balance validity
    modifier validPlayerBalance() {
        require(playerHistory[msg.sender].totalBalance ==
            playerHistory[msg.sender].totalTopUp - playerHistory[msg.sender].totalWithdrawn -
            playerHistory[msg.sender].totalSpentAmount + playerHistory[msg.sender].totalWinAmount,
            "ERROR CALCULATING PLAYER BALLANCE");
        _;
    }

    function eth2Wei(uint eth) public pure returns(uint) {
        return eth*1000000000000000000;
    }

    //Owner balance topUp
    function ownerFundUp_eth(uint topUp_eth) public onlyOwner payable {

        require(msg.value == eth2Wei(topUp_eth), "msg.value != topUp_eth * 1e16");
        if (msg.value != eth2Wei(topUp_eth)) revert();

        _contractBalance_ += msg.value ;
    }


    //Player account balance topUp
    function playerTopUp_eth(uint topUp_eth) public payable {
        //1eth = 1000000000000000000 wei
        require(msg.value == eth2Wei(topUp_eth), "msg.value != topUp_eth * 1e16");
        if (msg.value != eth2Wei(topUp_eth)) revert();

        _contractBalance_ += msg.value ;
        playerHistory[msg.sender].totalTopUp += msg.value;
        updateMyBalance();
    }

    //Calculate values each time player status changed
    function updateMyBalance() private {
        _totalAllPlayerBalance_ -= playerHistory[msg.sender].totalBalance;
        playerHistory[msg.sender].totalBalance =
        playerHistory[msg.sender].totalTopUp -
        playerHistory[msg.sender].totalWithdrawn -
        playerHistory[msg.sender].totalSpentAmount +
        playerHistory[msg.sender].totalWinAmount;
        _totalAllPlayerBalance_ += playerHistory[msg.sender].totalBalance;
        }

    function resetMyBalance() private  {
        playerHistory[msg.sender].totalBalance = 0;
    }

    function mySpentBalance(uint spentAmount) private  {
        playerHistory[msg.sender].totalSpentAmount += spentAmount;
        updateMyBalance();
    }

    function myWinBalance(uint winAmount) private  {
        playerHistory[msg.sender].totalGames++;
        if (winAmount>0) {
            playerHistory[msg.sender].totalWinAmount += winAmount;
            playerHistory[msg.sender].totalWins += 1;
        }
        playerHistory[msg.sender].lastWinAmount = winAmount;
        updateMyBalance();
    }

    function getPlayerHistory() public view validPlayerBalance returns(uint,uint,uint,uint,uint,uint,uint,uint) {
        return  (   playerHistory[msg.sender].totalBalance,
                    playerHistory[msg.sender].totalTopUp,
                    playerHistory[msg.sender].totalWithdrawn,
                    playerHistory[msg.sender].totalSpentAmount,
                    playerHistory[msg.sender].totalWinAmount,
                    playerHistory[msg.sender].totalGames,
                    playerHistory[msg.sender].totalWins,
                    playerHistory[msg.sender].lastWinAmount );
    }

    function getContractBalance() public view returns (uint) {
      return _contractBalance_;
    }


    function get_totalAllPlayerBalance_() public view returns (uint) {
      return _totalAllPlayerBalance_;
    }

    function contractPlayableFund() public view returns(uint) {
      if (_contractBalance_ == 0) {
        return 0;
      }
      else {
        return _contractBalance_ - _totalAllPlayerBalance_;
      }
    }

    function playerPlayableFund() public view returns(uint) {
        uint contractPlayable = contractPlayableFund();
        if (uint(playerHistory[msg.sender].totalBalance) < contractPlayable) {
            return playerHistory[msg.sender].totalBalance;
        }
        else {
            return contractPlayable;
        }
    }

    function createMyBet(uint betChoice, uint betAmount_eth) public validPlayerBalance {
        updateMyBalance();
        uint betAmount = eth2Wei(betAmount_eth);

        require(betAmount >= _minBetAmount, "Bet amount too small");
        require(playerPlayableFund() >= betAmount , "TOO BIG BET, NOT ENOUGH BALANCE ON CONTRACT");
        require(betChoice == 1 || betChoice == 0, "Bet should be 1 or 0");

        uint totalActivePredicts = activeBetList[msg.sender].betListPrecdictions.length;
        uint totalActiveBets = activeBetList[msg.sender].betListAmount.length;

        require(totalActivePredicts == totalActiveBets, "Invalid database");
        require(totalActivePredicts < _maxBetWaiting, "Too many bets for one draw; Please hit FLIP button!");

        mySpentBalance(betAmount);

        activeBetList[msg.sender].betListPrecdictions.push(betChoice);
        activeBetList[msg.sender].betListAmount.push(betAmount);

        totalActivePredicts = activeBetList[msg.sender].betListPrecdictions.length;
        totalActiveBets = activeBetList[msg.sender].betListAmount.length;

        assert(
            keccak256(
                abi.encodePacked(
                    activeBetList[msg.sender].betListPrecdictions[totalActivePredicts - 1],
                    activeBetList[msg.sender].betListAmount[totalActiveBets - 1]
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

        emit newBetCreated(betChoice, betAmount, msg.sender);
    }

    function getMyBet() public view returns(uint[] memory, uint[] memory)
    {
        return (
            activeBetList[msg.sender].betListPrecdictions,
            activeBetList[msg.sender].betListAmount
        );
    }

    function random() private view returns(uint) {
        return now % 2;
    }

    function resetPlayerBetList() private {
        activeBet memory noBets;
        activeBetList[msg.sender] = noBets;
    }

    function playerBetListIsEmpty() private view returns(bool) {
        return activeBetList[msg.sender].betListAmount.length == 0;
    }

    function playerTossCoin() public validPlayerBalance returns(uint , uint, uint) {
        uint result = random();
        uint spentAmount = 0;
        uint winAmount = 0;

        require(    result == 1 || result==0);
        require(    activeBetList[msg.sender].betListPrecdictions.length > 0,
                    "No bet placed, plase place the bet!");

        require(    activeBetList[msg.sender].betListAmount.length > 0,
                    "No bet placed, plase place the bet!");

        require(    activeBetList[msg.sender].betListAmount.length == activeBetList[msg.sender].betListPrecdictions.length,
                    "Error bet data");

        for (uint x=0; x < activeBetList[msg.sender].betListPrecdictions.length; x++) {
            spentAmount += activeBetList[msg.sender].betListAmount[x];
            if (activeBetList[msg.sender].betListPrecdictions[x] == result) {
                winAmount += activeBetList[msg.sender].betListAmount[x] * 2;
            }
        }

        myWinBalance(winAmount);

        resetPlayerBetList();

        emit betFinished(spentAmount, winAmount, result);
        return (spentAmount, winAmount, result);
    }

    function ownerWithdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = getContractBalance();

       //Should cancel all bets before withdrawn
       //Should return all players ballances before withdrawn
       _totalAllPlayerBalance_ = 0;
       _contractBalance_ = 0;

       msg.sender.transfer(toTransfer);
       return toTransfer;
    }

    function playerWithdrawAll() public validPlayerBalance returns(uint) {
        updateMyBalance();

        require(playerBetListIsEmpty(), "Please Cancel your bets or Click Flip Button..");

        uint toTransfer = playerHistory[msg.sender].totalBalance;

        playerHistory[msg.sender].totalWithdrawn = toTransfer;

        _contractBalance_ -= toTransfer;

        updateMyBalance();

        resetMyBalance();

        msg.sender.transfer(toTransfer);

        return toTransfer;
    }

}
