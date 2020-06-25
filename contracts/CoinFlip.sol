//SPDX-License-Identifier: UNLICENSED

import "./Ownable.sol";
pragma solidity 0.6.10;

contract CoinFlip is Ownable{

    uint public _contractBalance_;
    uint public _totalAllPlayerBalance_;

    // status of active bets; Each player can have multiple bets before each flip
    //Update each time player submited new bet

    struct Bets  {
        uint for0;  //wei amount bet for 0
        uint for1;  //wei amount bet for 1
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
    mapping (address => Bets) public activeBet;

    //playerList store information
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => betHistory) public playerHistory;

    //newBetCreated emit when created and not finished
    event newBetCreated(uint betChoice, uint betAmount, address playerAddress);

    //betFinished emit when
    event betFinished(uint winAmount, uint result);

    //common notice
    event notice(string noticeString, uint noticeValue);

    uint _minBetAmount = 1000; //All Amount are in Wei unless has _eth ending
    uint _maxBetWaiting = 3; // Maximun number of bets for a player before toss coin

    //Check Account Balance validity
    function validPlayerBalance() private view returns(bool) {
        if (playerHistory[msg.sender].totalBalance ==
            playerHistory[msg.sender].totalTopUp - playerHistory[msg.sender].totalWithdrawn -
            playerHistory[msg.sender].totalSpentAmount + playerHistory[msg.sender].totalWinAmount) {
                return true;
            } else {
                return false;
            }
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

    function getPlayerHistory() public view  returns(uint,uint,uint,uint,uint,uint,uint,uint) {
        require(validPlayerBalance(), "Not valid Player Balance");
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


    function createMyBet(uint[] memory betAmount_eth) public returns (uint, uint){

        updateMyBalance();
        require(validPlayerBalance(), "Not valid Player Balance");

        uint betAmount_0= eth2Wei(betAmount_eth[0]);
        uint betAmount_1= eth2Wei(betAmount_eth[1]);

        uint playerPlayable = playerPlayableFund();
        require(betAmount_0+betAmount_1 >= _minBetAmount, "Bet amount too small");
        require((playerPlayable >= uint(betAmount_0) && (playerPlayable >= uint(betAmount_1))) ,
                    "TOO BIG BET, NOT ENOUGH BALANCE ON CONTRACT");

        mySpentBalance(betAmount_0+betAmount_1); //Deduct spent amount from player balance

        activeBet[msg.sender].for1 += betAmount_1;
        activeBet[msg.sender].for0 += betAmount_0;

        emit newBetCreated(activeBet[msg.sender].for0, activeBet[msg.sender].for1, msg.sender);
        return (activeBet[msg.sender].for0, activeBet[msg.sender].for1);
    }


    function getMyBet() public view returns(uint, uint)  {
        return ( activeBet[msg.sender].for0, activeBet[msg.sender].for1 );
    }

    function random() private view returns(uint) {
        return now % 2;
    }

    function resetPlayerBetList() private {
        activeBet[msg.sender].for0 = 0;
        activeBet[msg.sender].for1 = 0;
    }

    function playerBetListIsEmpty() private view returns(bool) {
        return (activeBet[msg.sender].for0 == 0 && activeBet[msg.sender].for1 == 0);
    }

    function playerTossCoin() public returns(uint) {

        require(validPlayerBalance(), "Not valid Player Balance");
        uint result = random();
        require(    result == 1 || result==0);
        require(    activeBet[msg.sender].for1 > 0 || activeBet[msg.sender].for0 > 0,
                    "No bet placed, plase place the bet!");

        uint winAmount = 0;
        if (1 == result) {
            winAmount += activeBet[msg.sender].for1 * 2;
            }
        else {
            winAmount += activeBet[msg.sender].for0 * 2;
        }

        resetPlayerBetList();
        myWinBalance(winAmount);

        emit betFinished(winAmount, result);
        return (winAmount);
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

    function playerWithdrawAll() public  returns(uint) {

        updateMyBalance();

        require(validPlayerBalance());

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
