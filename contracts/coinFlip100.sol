//SPDX-License-Identifier: UNLICENSED

// GAME RULES:
// Bet numbers a ranging from 0-99
// Players can bet for "A Number" or for "NOT A Number" (Play as Player or Banker)
// Players and Bankers bets are matched on principle of Market price Match. Price for each number can range from 1x to 99x.
// Every day 1 bet round;
// All bets will be closed 15 minutes prior result request (18h15);
// All not matched orders will be deleted.
// Every day at 18h30 contract will send request for random number to Oracle engine.
// After result arrived, All players/bankers will receive Event notification.
// Only winner pays: Contract Owner take 1%(?) of winning amount.
// Newbets allowed after 19h:00

import "./Ownable.sol";
//import "./provableAPI_0.4.25_simplified.sol";
import "./provableAPI_0.5.sol";
pragma solidity 0.5.12;

contract CoinFlip100 is Ownable, usingProvable{

    uint public BET_RANGE_MIN = 0;
    uint public BET_RANGE_MAX = 99;

    uint CHIP_TO_WEI = 10**15; //1 chips = 1 eth - Can be parametric
    uint public BET_MIN_AMOUNT_WEI = CHIP_TO_WEI ; //All Amount are in ETH
    uint BET_WIN_RATE = 7000; //Win rate = 70x with 2 decimals

    uint public _contractBalance_;
    uint public _totalAllPlayerBalance_; // Total balance deposited and not used by players (not locked in bets) can be withdrawn by players any time
    uint public _lockedInBets_;  // Total amount locked in bets (can not be widthdraw by any one)
    uint public _currentRoundNo_;  // Unique sequence Number of
    uint public _coverAmount100_;  // coverable amount for all 100 numberclosedAtBlock

    //uint[] public explicitCoverableAmount; // Explicit cover by banker for A number
    address[][100] public _playerAddreses_;
    uint[100] public _amountsMatched_;  //wei amount bet for each number

    //uint[100] public _bankerAmountsMatched_;  //wei amount bet for each number
    //uint[100] public _bankerAmountsWaiting_;  //wei amount bet for each number

    struct BetTable {
        uint result         ;  // each round will save result to this var
        uint closedAtBlock  ;  // block number when bet closed and random number request sent
        uint openedAtBlock  ;
        bool paidOut        ;
        bytes32 queryId     ;
        bytes proof         ;
        // Later: function to transfer waiting Amount to next round
    }

    //list of all activities of a player (update after finished solving each bet)

    struct PlayerHistory {
        uint totalBalance;
        uint totalTopUp;
        uint totalWithdrawn;
        uint totalSpentAmount;
        uint totalwinAmount;
        uint totalGames;
        uint totalWins;
        uint playableAmount;
        uint [] winAmount;
        uint[][] numbersMatched;
        uint[][] amountsMatched;
        // later should add storage for all historic bets
    }

    // Storing all results from all rounds under betTable[_currentRoundNo_]... //should limit size to avoid overflow?
    mapping (uint => BetTable) public betTable;

    //playerList store information
    // Should limit storage size somehow to avoid overflow in future?
    mapping (address => PlayerHistory) public playerHistory;

    //newBetCreated emit when created and not finished
    event newBetCreated(uint[] betNumbers, uint[] betAmounts_chip, address playerAddress);

    //betFinished emit when finished calculation PL for all players
    event betFinished(uint roundNo, uint result);

    //common notice
    event notice(string noticeString, uint noticeValue);
    event error (string noticeString, uint noticeValue);

    //Oracle >>>>>>>>>>>>>>>>>>>>
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1; //Should change later for better randomnes

    event generatedRandomNumber(uint roundNo, uint256 randomNumber , bytes32 Id,   bytes proof);
    event LogNewProvableQuery(string notice);
    event proofFailed(string description);

    constructor() public payable {
        provable_setProof(proofType_Ledger);
        _contractBalance_ = msg.value ;
        initNewRound();
    }

    function __callback(bytes32 _queryId, string _result, bytes _proof) public {

        require(msg.sender == provable_cbAddress());
        //if (
        //    provable_randomDS_proofVerify__returnCode(
        //        _queryId,
        //        _result,
        //        _proof
        //    ) != 0
        //) {
        //    emit proofFailed("The proof verification failed in the callback");
        //} else {

            uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result)))%100;
            // Temporary redefine to 99 for testing purpose
            randomNumber = 99;

            betTable[_currentRoundNo_].result = randomNumber;
            betTable[_currentRoundNo_].closedAtBlock = block.number; //Allways check time to know wherether bet is closed!
            betTable[_currentRoundNo_].queryId = _queryId;
            betTable[_currentRoundNo_].proof = _proof;
            //_currentRoundNo_ should be advanced before next round by PayOutCheck function

            emit generatedRandomNumber(_currentRoundNo_-1, randomNumber,_queryId, _proof);
        //}
    }

    //Oracle <<<<<<<<<<<<<<<<<<<<<


    //Check Account Balance validity
    function validPlayerBalance() private view returns(bool) {
          if (playerHistory[msg.sender].totalBalance ==
            playerHistory[msg.sender].totalTopUp - playerHistory[msg.sender].totalWithdrawn -
            playerHistory[msg.sender].totalSpentAmount + playerHistory[msg.sender].totalwinAmount) {
                return true;
            } else {
                require(playerHistory[msg.sender].totalBalance ==
                  playerHistory[msg.sender].totalTopUp - playerHistory[msg.sender].totalWithdrawn -
                  playerHistory[msg.sender].totalSpentAmount + playerHistory[msg.sender].totalwinAmount,
                  "validPlayerBalance: Player balance check not match!");
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

    function coverFund() public view returns(uint) {
        return getCoverableAmount(realContractBalance() - _totalAllPlayerBalance_);
    }

    //Owner balance topUp
    function ownerFundUp_chip(uint topUp_chip) public onlyOwner payable {

        require(msg.value == chip2Wei(topUp_chip), "msg.value != topUp_chip * 1e16");
        if (msg.value != chip2Wei(topUp_chip)) revert();
        _contractBalance_ += msg.value ;
        _coverAmount100_ = coverFund();
    }

    //Player account balance topUp
    function playerTopUp_chip(uint topUp_chip) public payable {
        //1eth = 1000000000000000000 wei
        require(msg.value == chip2Wei(topUp_chip), "msg.value != topUp_chip * 1e16");
        if (msg.value != chip2Wei(topUp_chip)) revert();

        _contractBalance_ += msg.value ;
        playerHistory[msg.sender].totalTopUp += msg.value;
        updatePlayerBalance(msg.sender);
    }

    // Calculate values each time player status changed
    // All values of playerHistory in wei
    function updatePlayerBalance(address playerAddress) private {
        _totalAllPlayerBalance_ -= playerHistory[playerAddress].totalBalance;
        playerHistory[playerAddress].totalBalance =
        playerHistory[playerAddress].totalTopUp -
        playerHistory[playerAddress].totalWithdrawn -
        playerHistory[playerAddress].totalSpentAmount +
        playerHistory[playerAddress].totalwinAmount;
        _totalAllPlayerBalance_ += playerHistory[playerAddress].totalBalance;
        }


    function mySpentBalance(uint[] memory spentAmounts_wei) private {
        for (uint x=0; x<spentAmounts_wei.length; x++) {
            playerHistory[msg.sender].totalSpentAmount += spentAmounts_wei[x];
        }
        updatePlayerBalance(msg.sender);
    }

    function myWinBalance(uint roundNo, address playerAddress, uint winAmount_wei) private  {
        playerHistory[playerAddress].totalGames++;
        if (winAmount_wei>0) {
            playerHistory[playerAddress].totalwinAmount += winAmount_wei;
            playerHistory[playerAddress].totalWins += 1;
        }
        playerHistory[playerAddress].winAmount[roundNo] = winAmount_wei;
        updatePlayerBalance(playerAddress);
    }

    function getPlayerHistory() public view  returns(uint,uint,uint,uint,uint,uint,uint,uint) {
        require(validPlayerBalance(), "Not valid Player Balance");
        return  (   playerHistory[msg.sender].totalBalance,
                    playerHistory[msg.sender].totalTopUp,
                    playerHistory[msg.sender].totalWithdrawn,
                    playerHistory[msg.sender].totalSpentAmount,
                    playerHistory[msg.sender].totalwinAmount,
                    playerHistory[msg.sender].totalGames,
                    playerHistory[msg.sender].totalWins,
                    playerHistory[msg.sender].winAmount[_currentRoundNo_-1] ); // add more returns here
    }

    function readVar_contractBalance_() public view returns(uint) {
      return _contractBalance_;
    }

    function readVar_coverAmount100_() public view returns(uint) {
      return _coverAmount100_;
    }

    function readVar_amountsMatched_(uint number) public view returns(uint) {
      return _amountsMatched_[number];
    }

    function realContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    //Check how much amount left for covering a number
    function coverAmountLeft(uint number) public view returns(uint) {
        return _coverAmount100_ - _amountsMatched_[number];
    }

    //CHeck the amount/price can be matched for a number? return matching amount
    function getPlayerBetableAmount(uint number, uint amount_wei, uint wantedWinRate) public view returns(uint) {
        uint coverLeft = coverAmountLeft(number);
        if ((coverLeft >= amount_wei) && (BET_WIN_RATE >= wantedWinRate)) //Later : add parametric Winrate
            {  return  (amount_wei) ; }
            else
            { return coverAmountLeft(number);}
    }

    function verifyBet(uint[] memory betNumbers, uint[] memory betAmounts_wei) private view returns(bool) {
        // verify that new bet is valid
        require (betNumbers.length == betAmounts_wei.length," ERROR bet aray") ;
        uint sumbetAmounts = 0;

        for (uint x = 0; x<betNumbers.length; x++) {
            require(((betNumbers[x] >=  BET_RANGE_MIN) && (betNumbers[x] <=  BET_RANGE_MAX)), "Bet number out of range");
            require(betAmounts_wei[x] >=  BET_MIN_AMOUNT_WEI, "Bet amount less than min amount");
            sumbetAmounts += betAmounts_wei[x];
        }
        require(sumbetAmounts <= playerHistory[msg.sender].totalBalance , "BET AMOUNT HIGHER PLAYER TOTAL BALANCE, PLEASE ADJUST OUR BET");

        return true;
    }

    function updateBetTableMatched(address playerAddress, uint number, uint amount) private {
        uint basicCoverLeft = _coverAmount100_ - _amountsMatched_[number];
        if (basicCoverLeft < 0) {
            emit error("EROR cover number: ",number);
        } else {
            _playerAddreses_[number].push(playerAddress);
            if (basicCoverLeft - amount < 0) {
                //If _coverAmount100_ is not enough, then use only basicCoverLeft:
                _amountsMatched_[number] += basicCoverLeft;
                emit notice("Added bet for number: ",number);
                emit notice("Added bet amount: ",basicCoverLeft);
            } else {
                _amountsMatched_[number] += amount;
                emit notice("Added bet for number: ",number);
                emit notice("Added bet amount: ",amount);
            }
        }
    }

    function updateplayerHistory(uint[] memory newBetNumbers, uint[] memory newbetAmounts_wei) private {
        //append new bets with current Betlist
        mySpentBalance(newbetAmounts_wei); //Deduct spent amount from player balance

        for (uint x=0; x<newBetNumbers.length; x++) {
            playerHistory[msg.sender]
                .numbersMatched[_currentRoundNo_]
                    .push(newBetNumbers[x]);

            playerHistory[msg.sender]
                .amountsMatched[_currentRoundNo_]
                    .push(newbetAmounts_wei[x]);

            updateBetTableMatched(msg.sender, newBetNumbers[x], newbetAmounts_wei[x]);
        }
    }

    function createMyBet(uint[] memory betNumbers, uint[] memory betAmounts_chip) public {

        //money amount received from frontEnd is in Chips;
        //Should conver all chips to Wei
        require(betTable[_currentRoundNo_].closedAtBlock == 0, ".. No more bets, please wait until next round...");
        uint[] memory betAmounts = chip2Wei_ar(betAmounts_chip);
        require(verifyBet(betNumbers,betAmounts), "NOT VALID BET");
        updateplayerHistory(betNumbers, betAmounts); //Update Active Betlist for a player
        emit newBetCreated(betNumbers,betAmounts, msg.sender);
    }

    function getPlayersBet(uint _roundNo, address playerAddress) public view returns(uint , uint[] memory, uint[] memory)  {
        //Data sent to front page from contract is in Chips
        return (    _roundNo,
                    playerHistory[playerAddress].numbersMatched[_roundNo],
                    wei2Chip_ar(playerHistory[playerAddress].amountsMatched[_roundNo]) //wei
                );
    }

    function getCoverableAmount(uint prize) public view returns(uint) {
        return (prize/BET_WIN_RATE)*100;
    }

    function getwinAmountWei(uint winWei) public view returns(uint) {
        return (winWei*BET_WIN_RATE)/100;
    }


    // This function should be called automatically everyday one time at 18h30;
    // For now will be called by Owner for testing purpose only;
    function contractRequestResultNumber() public payable onlyOwner returns(bytes32 waitingId){

        //require (someBetsArePlaced())  //to avoid sending request for nothing
        require (betTable[_currentRoundNo_].queryId == 0x0000000000000000000000000000000000000000000000000000000000000000,
                "REQUEST for NUMBER ALREADY SENT");

        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 500000;
        //Calling Oracle for random number // Oracle will call __callback function when number is ready
        waitingId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );

        emit LogNewProvableQuery("Provable query was sent, waiting for the answer..");
        betTable[_currentRoundNo_].queryId = waitingId;
        return waitingId;
    }

    // After got result, contract should iterate thru all player that followed winning number to payout
    // This function should be called automatically after result arrived from Oracle;
    // Due to gas limit problem may cause __callback from Oracle to fails, this function may be call separately
    // For now will be called by Owner for testing purpose only;
    // New Round should start only after this function is finished

    function payOutOldAndStartNewRound() public onlyOwner returns(bool) {
        // Check for Banker PL : later
        // Check for Player PL

        if (betTable[_currentRoundNo_].closedAtBlock == 0)
        {
            emit notice("NO RESULT YET, CAN NOT PAY OUT FOR ROUND:", _currentRoundNo_);
            return (false);
        }

        if (betTable[_currentRoundNo_].paidOut == true) {
            emit notice("PAYOUT DUPLICATE REQUEST FOR ROUND :", _currentRoundNo_);
            return (false);
        }

        //iterate thru winner list
        for (uint x=0; x<_playerAddreses_[ betTable[_currentRoundNo_].result ].length; x++)
        {
            address winnerAddress = _playerAddreses_[ betTable[_currentRoundNo_].result ][x];
            uint winAmount_wei = 0;
            //Itera thru bet list and count win amount
            for (uint xx=0; xx<playerHistory[winnerAddress].numbersMatched[_currentRoundNo_].length; xx++)
            {
            if (playerHistory[winnerAddress].numbersMatched[_currentRoundNo_][xx]
                == betTable[_currentRoundNo_].result) {
                    winAmount_wei += getwinAmountWei(playerHistory[winnerAddress].amountsMatched[_currentRoundNo_][xx]);
                }
            }
            myWinBalance(_currentRoundNo_, winnerAddress, winAmount_wei); //Change player balance record
        }
        betTable[_currentRoundNo_].paidOut = true;

        // opening bet for next ROUND
        initNewRound();

        emit notice("BET ROUND IS OPENED at BLOCK No:", betTable[_currentRoundNo_].openedAtBlock);

        return (true);
    }

    function blockNumber() public view returns(uint) {
        return block.number;
    }

    function initNewRound() public onlyOwner {
        if (_currentRoundNo_ !=0) {
            require(betTable[_currentRoundNo_].closedAtBlock != 0, "LastRound not closed");
        }
        _currentRoundNo_ += 1;
        betTable[_currentRoundNo_].openedAtBlock = block.number;
        _coverAmount100_ = coverFund();
    }

    function ownerWithdrawAll() public onlyOwner returns(uint) {
       //   Should add emergency Withdrawall
       //   playerWithdrawAll(); //If owner plays, Withdraw as a player first
       //   Should allow to withdraw only at certain time when beting closed(?)

       uint toTransfer = realContractBalance() - _totalAllPlayerBalance_ ; // - _lockedInBets_; Should add later..

       //Should cancel all bets before withdrawn
       //Should return all players ballances before withdrawn
       _totalAllPlayerBalance_ = 0;
       _contractBalance_ -= toTransfer;

       msg.sender.transfer(toTransfer);
       return toTransfer;
    }

    function playerWithdrawAll() public returns(uint) {
        //   Should allow to withdraw only at certain time when beting closed(?)

        updatePlayerBalance(msg.sender);

        require(playerHistory[msg.sender].totalBalance > 0, "Player is out of money");

        require(validPlayerBalance(), "Invalid balance check");

        uint toTransfer = playerHistory[msg.sender].totalBalance;

        playerHistory[msg.sender].totalWithdrawn += toTransfer;

        _contractBalance_ -= toTransfer;

        updatePlayerBalance(msg.sender);

        assert(playerHistory[msg.sender].totalBalance == 0);

        msg.sender.transfer(toTransfer);

        return toTransfer;
    }

}
