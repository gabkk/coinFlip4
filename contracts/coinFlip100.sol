//SPDX-License-Identifier: UNLICENSED

import "./Ownable.sol";
pragma solidity 0.6.10;

contract CoinFlip100 is Ownable{

    uint public BET_RANGE_MIN = 0;
    uint public BET_RANGE_MAX = 99;

    uint CHIP_TO_WEI = 1000000000000000; //1 chips = 1 eth - Can be parametric
    uint public BET_MIN_AMOUNT_WEI = CHIP_TO_WEI ; //All Amount are in ETH
    uint BET_WIN_RATE = 190; //Win rate = 1,9 with 2 decimals

    uint public _contractBalance_;
    uint public _totalAllPlayerBalance_;

    // status of active bets; Each player can have multiple bets before each flip
    //Update each time player submited new bet

    struct Bets  {
        uint[] betNumbers;
        uint[] betAmount;  //wei amount bet for each number
        bool waitingResult;
        uint waitingId; //uint == 0 when not waiting for Flipped result
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
    event newBetCreated(uint[] betNumbers, uint[] betAmounts_chip, address playerAddress);

    //betFinished emit when
    event betFinished(uint winAmount, uint result);

    //common notice
    event notice(string noticeString, uint noticeValue);

    //Pseudo Random
    function random() public pure returns(uint) {
        return 0;
        //return now % (BET_RANGE_MAX+1);
    }


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

    function wei2Chip(uint _wei) private view returns(uint) {
        return _wei / CHIP_TO_WEI;
    }

    function chip2Wei(uint chip) private view returns(uint) {
        return chip * CHIP_TO_WEI;
    }

    function chip2Wei_ar(uint[] memory chip_ar) private view returns(uint[] memory) {
        for (uint x=0; x<chip_ar.length; x++) {
            chip_ar[x] = chip2Wei(chip_ar[x]);
        }
        return chip_ar;
    }

    function wei2Chip_ar(uint[] memory wei_ar) private view returns(uint[] memory) {
        for (uint x=0; x<wei_ar.length; x++) {
           wei_ar[x] = wei2Chip(wei_ar[x]);
        }
        return wei_ar;
    }


    //Owner balance topUp
    function ownerFundUp_chip(uint topUp_chip) public onlyOwner payable {

        require(msg.value == chip2Wei(topUp_chip), "msg.value != topUp_chip * 1e16");
        if (msg.value != chip2Wei(topUp_chip)) revert();
        _contractBalance_ += msg.value ;
    }


    //Player account balance topUp
    function playerTopUp_chip(uint topUp_chip) public payable {
        //1eth = 1000000000000000000 wei
        require(msg.value == chip2Wei(topUp_chip), "msg.value != topUp_chip * 1e16");
        if (msg.value != chip2Wei(topUp_chip)) revert();

        _contractBalance_ += msg.value ;
        playerHistory[msg.sender].totalTopUp += msg.value;
        updateMyBalance();
    }

    // Calculate values each time player status changed
    // All values of playerHistory in wei
    function updateMyBalance() private {
        _totalAllPlayerBalance_ -= playerHistory[msg.sender].totalBalance;
        playerHistory[msg.sender].totalBalance =
        playerHistory[msg.sender].totalTopUp -
        playerHistory[msg.sender].totalWithdrawn -
        playerHistory[msg.sender].totalSpentAmount +
        playerHistory[msg.sender].totalWinAmount;
        _totalAllPlayerBalance_ += playerHistory[msg.sender].totalBalance;
        }

    function mySpentBalance(uint[] memory spentAmounts_wei) private {

        for (uint x=0; x<spentAmounts_wei.length; x++) {
            playerHistory[msg.sender].totalSpentAmount += spentAmounts_wei[x];
        }
        updateMyBalance();
    }

    function myWinBalance(uint winAmount_wei) private  {
        playerHistory[msg.sender].totalGames++;
        if (winAmount_wei>0) {
            playerHistory[msg.sender].totalWinAmount += winAmount_wei;
            playerHistory[msg.sender].totalWins += 1;
        }
        playerHistory[msg.sender].lastWinAmount = winAmount_wei;
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
        if (playerHistory[msg.sender].totalBalance < contractPlayable) {
            return playerHistory[msg.sender].totalBalance;
        }
        else {
            return contractPlayable;
        }
    }

    function verifyBet(uint[] memory betNumbers, uint[] memory betAmount_wei) private view returns(bool) {

        require (betNumbers.length == betAmount_wei.length," ERROR bet aray") ;
        uint sumBetAmount = 0;

        for (uint x = 0; x<betNumbers.length; x++) {

            require(betAmount_wei[x] >=  BET_MIN_AMOUNT_WEI, "Bet amount less than min amount");
            sumBetAmount += betAmount_wei[x];
        }

        require(sumBetAmount <= playerPlayableFund(), "TOO BIG BET, PLEASE ADJUST OUR BET");

        return true;
    }

    function updateActiveBet(uint[] memory newBetNumbers, uint[] memory newBetAmount_wei) private {
        //append new bets with current Betlist
        for (uint x=0; x<newBetNumbers.length; x++) {
            activeBet[msg.sender].betNumbers.push(newBetNumbers[x]);
            activeBet[msg.sender].betAmount.push(newBetAmount_wei[x]);
        }
    }


    function createMyBet(uint[] memory betNumbers, uint[] memory betAmount_chip) public returns (bool){

        //money amount received from frontEnd is in Chips;
        //Should conver all chips to Wei

        require(activeBet[msg.sender].waitingId == 0, ".. Please Wait for result of last bet..");

        require(validPlayerBalance(), "Not valid Player Balance");

        uint[] memory betAmount = chip2Wei_ar(betAmount_chip);

        require(verifyBet(betNumbers,betAmount), "NOT VALID BET");

        mySpentBalance(betAmount); //Deduct spent amount from player balance

        updateActiveBet(betNumbers, betAmount); //Update Active Betlist for a player

        emit newBetCreated(betNumbers,betAmount, msg.sender);

        return (true);
    }


    function getMyBet() public view returns(uint[] memory, uint[] memory,bool, uint)  {
        //Data sent to front page from contract is in Chips
        return (    activeBet[msg.sender].betNumbers,
                    wei2Chip_ar(activeBet[msg.sender].betAmount), //wei
                    activeBet[msg.sender].waitingResult,
                    activeBet[msg.sender].waitingId);
    }


    function resetPlayerBetList() private {
        Bets memory nullBet;
        activeBet[msg.sender] = nullBet;
        activeBet[msg.sender].waitingResult = false;
    }


    function getWinAmountWei(uint winWei) public view returns(uint) {
        return (winWei*BET_WIN_RATE)/100;
    }

    function playerTossCoin() public returns(uint, uint) {

        require(validPlayerBalance(), "playerTossCoin: Not valid Player Balance");
        require(activeBet[msg.sender].betNumbers.length > 0,"playerTossCoin: No bet placed, plase place the bet!");

        activeBet[msg.sender].waitingResult = true;
        activeBet[msg.sender].waitingId = 1231321; //For use later
        uint result = random();

        require(result >= BET_RANGE_MIN && result <= BET_RANGE_MAX, "playerTossCoin: Random out of range");

        uint winAmount_wei = 0;

        for (uint x=0; x<activeBet[msg.sender].betNumbers.length; x++) {
            if (activeBet[msg.sender].betNumbers[x] == result) {
                winAmount_wei += getWinAmountWei(activeBet[msg.sender].betAmount[x]);
            }
        }

        resetPlayerBetList();
        myWinBalance(winAmount_wei);

        emit betFinished(winAmount_wei, result);
        return (winAmount_wei, result);
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

        require(playerHistory[msg.sender].totalBalance > 0, "Player is out of money");

        require(validPlayerBalance(), "Invalid balance check");

        require(activeBet[msg.sender].waitingId == 0, "Waiting for bet result..");

        require(activeBet[msg.sender].betNumbers.length == 0, "Bet can not be cancelled, Click Flip Button..");

        uint toTransfer = playerHistory[msg.sender].totalBalance;

        playerHistory[msg.sender].totalWithdrawn += toTransfer;

        _contractBalance_ -= toTransfer;

        updateMyBalance();

        assert(playerHistory[msg.sender].totalBalance == 0);

        msg.sender.transfer(toTransfer);

        return toTransfer;
    }

}
