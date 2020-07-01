//SPDX-License-Identifier: UNLICENSED

import "./Ownable.sol";
import "./provableAPI_0.4.25_simplified.sol";
pragma solidity 0.4.26;

contract CoinFlip100 is Ownable, usingProvable{

    uint public BET_RANGE_MIN = 0;
    uint public BET_RANGE_MAX = 99;

    uint CHIP_TO_WEI = 10**15; //1 chips = 1 eth - Can be parametric
    uint public BET_MIN_AMOUNT_WEI = CHIP_TO_WEI ; //All Amount are in ETH
    uint BET_WIN_RATE = 7000; //Win rate = 70x with 2 decimals

    uint public _contractBalance_;
    uint public _totalAllPlayerBalance_; // Total balance deposited and not used by players (not locked in bets) can be withdrawn by players any time
    uint public _lockedInBets_;  // Total amount locked in bets (can not be widthdraw by any one)

    uint public _latestNumber; // latest random number returned by Oracle engine

    // status of active bets; Each player can have multiple bets before each flip
    //Update each time player submited new bet

    struct Bets  {
        uint[] betNumbers;
        uint[] betAmount;  //wei amount bet for each number
        bool waitingResult;
        bytes32 waitingId; //uint == 0 when not waiting for Flipped result
        bool paidOut;
        uint lastResult;
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

    struct betMarket {
        uint confirmed; // When owners fund is enough, number il be confirmed
        uint waiting; // when fund is NOT enouugh, number will placed on waiting quee
    }
    //betList is a list of all active bets
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => Bets) public activeBet;

    //playerList store information
    // Should limit storage size somehow to avoid everflow in future?
    mapping (address => betHistory) public playerHistory;

    //each queryId map with one address
    mapping (bytes32 => address) private playersQuery;

    //each number has a total bet amount
    mapping (uint => betMarket) betAmountForNumber; //in wei // for all players combined
    uint _maxBetedNumber_; //Number for wich highest amount beted

    //newBetCreated emit when created and not finished
    event newBetCreated(uint[] betNumbers, uint[] betAmounts_chip, address playerAddress);

    //betFinished emit when
    event betFinished(address playerAddress, uint winAmount, uint result);

    //common notice
    event notice(string noticeString, uint noticeValue);



    //Oracle >>>>>>>>>>>>>>>>>>>>
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

    event generatedRandomNumber(bytes32 Id, uint256 randomNumber ,  bytes proof);
    event LogNewProvableQuery(string notice);
    event proofFailed(string description);

    constructor() public payable {
        provable_setProof(proofType_Ledger);
        _contractBalance_ = msg.value ;

    }


    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
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
            //uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result)))%100;

            uint256 randomNumber = 99;
            _latestNumber = randomNumber;
            address playerAddress = playersQuery[_queryId];
            activeBet[playerAddress].lastResult = randomNumber;
            //payOut(_queryId, randomNumber, _proof);
            emit generatedRandomNumber(_queryId, randomNumber, _proof);
        //}
    }

    /*
    function getRandom100() payable public returns(bytes32 waitingId)
    {
        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;

        waitingId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );
        emit LogNewProvableQuery("Provable query was sent, waiting for the answer..");
        return (waitingId);
    }
    */
    //Oracle <<<<<<<<<<<<<<<<<<<<<


    //Check Account Balance validity
    function validPlayerBalance() private view returns(bool) {
          if (playerHistory[msg.sender].totalBalance ==
            playerHistory[msg.sender].totalTopUp - playerHistory[msg.sender].totalWithdrawn -
            playerHistory[msg.sender].totalSpentAmount + playerHistory[msg.sender].totalWinAmount) {
                return true;
            } else {
                require(playerHistory[msg.sender].totalBalance ==
                  playerHistory[msg.sender].totalTopUp - playerHistory[msg.sender].totalWithdrawn -
                  playerHistory[msg.sender].totalSpentAmount + playerHistory[msg.sender].totalWinAmount,
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
        playerHistory[playerAddress].totalWinAmount;
        _totalAllPlayerBalance_ += playerHistory[playerAddress].totalBalance;
        }


    function mySpentBalance(uint[] memory spentAmounts_wei) private {
        for (uint x=0; x<spentAmounts_wei.length; x++) {
            playerHistory[msg.sender].totalSpentAmount += spentAmounts_wei[x];
        }
        updatePlayerBalance(msg.sender);
    }

    function myWinBalance(address playerAddress, uint winAmount_wei) private  {
        playerHistory[playerAddress].totalGames++;
        if (winAmount_wei>0) {
            playerHistory[playerAddress].totalWinAmount += winAmount_wei;
            playerHistory[playerAddress].totalWins += 1;
        }
        playerHistory[playerAddress].lastWinAmount = winAmount_wei;
        updatePlayerBalance(playerAddress);
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

    function realContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getContractBalance() public view returns (uint) {
      return _contractBalance_;
    }

    function get_totalAllPlayerBalance_() public view returns (uint) {
      return _totalAllPlayerBalance_;
    }

    function get_ownerBalance() public view returns(uint) {
      if (_contractBalance_ == 0) {
        return 0;
      }
      else {
        return _contractBalance_ - _totalAllPlayerBalance_ - _lockedInBets_;
      }
    }

    function playerPlayableFund() public view returns(uint) {
        uint contractPlayable = get_ownerBalance();
        if (getWinAmountWei(playerHistory[msg.sender].totalBalance) < contractPlayable) {
            return playerHistory[msg.sender].totalBalance;
        }
        else {
            return get_betAbleAmountWei(contractPlayable);
        }
    }

    function verifyBet(uint[] memory betNumbers, uint[] memory betAmount_wei) private view returns(bool) {
        // verify that new bet is valid
        require (betNumbers.length == betAmount_wei.length," ERROR bet aray") ;
        uint sumBetAmount = 0;

        for (uint x = 0; x<betNumbers.length; x++) {
            require(((betNumbers[x] >=  BET_RANGE_MIN) && (betNumbers[x] <=  BET_RANGE_MAX)), "Bet number out of range");
            require(betAmount_wei[x] >=  BET_MIN_AMOUNT_WEI, "Bet amount less than min amount");
            sumBetAmount += betAmount_wei[x];
        }
        require(sumBetAmount <= playerPlayableFund(), "TOO BIG BET, PLEASE ADJUST OUR BET");
        return true;
    }

    function lockOutAmount(uint BetNumber, uint BetAmount) private {
        betAmountForNumber [ BetNumber ].confirmed -= BetAmount;
        if (_maxBetedNumber_ == BetNumber) {
            // Should find new highest bet
            uint maxBet = 0;
            for (uint8 x=0; x<100; x++) {
                if (maxBet < betAmountForNumber[x].confirmed) {
                    maxBet = betAmountForNumber[x].confirmed;
                    _maxBetedNumber_ = x;

                }
            }
            _lockedInBets_ = getWinAmountWei(betAmountForNumber [ _maxBetedNumber_ ].confirmed );
        }
    }

    function lockInAmount(uint newBetNumber, uint newBetAmount) private {
        betAmountForNumber [ newBetNumber ].confirmed += newBetAmount;
        if (getWinAmountWei(betAmountForNumber [ newBetNumber ].confirmed )> _lockedInBets_) {
            _lockedInBets_ = getWinAmountWei(betAmountForNumber [ newBetNumber ].confirmed );
            _maxBetedNumber_ = newBetNumber;
        }
    }

    function updateActiveBet(uint[] memory newBetNumbers, uint[] memory newBetAmount_wei) private {
        //append new bets with current Betlist
        for (uint x=0; x<newBetNumbers.length; x++) {
            activeBet[msg.sender].betNumbers.push(newBetNumbers[x]);
            activeBet[msg.sender].betAmount.push(newBetAmount_wei[x]);

            lockInAmount(newBetNumbers[x], newBetAmount_wei[x]);
        }
    }



    function createMyBet(uint[] memory betNumbers, uint[] memory betAmount_chip) public returns (bool) {

        //money amount received from frontEnd is in Chips;
        //Should conver all chips to Wei

        require(activeBet[msg.sender].waitingResult ==  false, ".. Please Wait for result of last bet..");

        uint[] memory betAmount = chip2Wei_ar(betAmount_chip);

        require(verifyBet(betNumbers,betAmount), "NOT VALID BET");

        mySpentBalance(betAmount); //Deduct spent amount from player balance

        updateActiveBet(betNumbers, betAmount); //Update Active Betlist for a player

        //assert(validPlayerBalance());

        emit newBetCreated(betNumbers,betAmount, msg.sender);

        return (true);
    }


    function getMyBet() public view returns(uint[] memory, uint[] memory,bool, bytes32, bool, uint)  {
        //Data sent to front page from contract is in Chips
        return (    activeBet[msg.sender].betNumbers,
                    wei2Chip_ar(activeBet[msg.sender].betAmount), //wei
                    activeBet[msg.sender].waitingResult,
                    activeBet[msg.sender].waitingId,
                    activeBet[msg.sender].paidOut,
                    activeBet[msg.sender].lastResult);
    }


    function resetPlayerBetList(address playerAddress) private {
        Bets memory nullBet;
        activeBet[playerAddress] = nullBet;
        activeBet[playerAddress].waitingResult = false;
    }


    function get_betAbleAmountWei(uint podWei) public view returns(uint) {
        return (podWei/BET_WIN_RATE)*100;
    }

    function getWinAmountWei(uint winWei) public view returns(uint) {
        return (winWei*BET_WIN_RATE)/100;
    }

    function playerTossCoin() public payable returns(bytes32 waitingId){

        require(activeBet[msg.sender].waitingResult == false, "Already called random Number, please wait for result..");
        require(activeBet[msg.sender].betNumbers.length > 0,"playerTossCoin: No bet placed, plase place the bet!");
        activeBet[msg.sender].waitingResult = true;
        activeBet[msg.sender].paidOut = false;

        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;

        waitingId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );

        emit LogNewProvableQuery("Provable query was sent, waiting for the answer..");
        activeBet[msg.sender].waitingId = waitingId;

        playersQuery[waitingId] = msg.sender;
        return waitingId;
    }

    function payOutCheckRequest(address playerAddress) public {
        if (activeBet[playerAddress].waitingResult) {
            if (activeBet[playerAddress].paidOut == false) {
                    payOut(activeBet[playerAddress].waitingId ,activeBet[playerAddress].lastResult); //, activeBet[playerAddress].proof)
                } else {
                    emit notice("Allready paid", playerHistory[playerAddress].lastWinAmount);
                }
        } else {
            emit notice("No New BET yet, PLEASE SUBMITE BET AND HIT FLIP..", 0);
        }
    }

    function payOut(bytes32 _queryId, uint result) //, bytes memory _proof)
        private returns(address, uint, uint) {
        address playerAddress = playersQuery[_queryId];

        activeBet[playerAddress].lastResult = result;
        activeBet[playerAddress].waitingResult = false;
        activeBet[playerAddress].paidOut = true;

        uint winAmount_wei = 0;

        for (uint x=0; x<activeBet[playerAddress].betNumbers.length; x++) {

                //reduce bet amout from player for a number in big table
                lockOutAmount(activeBet[playerAddress].betNumbers[x], activeBet[playerAddress].betAmount[x]);

                if (activeBet[playerAddress].betNumbers[x] == result) {
                    winAmount_wei += getWinAmountWei(activeBet[playerAddress].betAmount[x]);
                }
            }

        resetPlayerBetList(playerAddress);
        myWinBalance(playerAddress,winAmount_wei);
        updatePlayerBalance(playerAddress);

        emit betFinished(playerAddress, winAmount_wei, result);
        return (playerAddress,winAmount_wei, result);
    }


    function ownerWithdrawAll() public onlyOwner returns(uint) {
       //Should add emergency Withdrawall
       //playerWithdrawAll(); //If owner plays, Withdraw as a player first

       uint toTransfer = realContractBalance() - _totalAllPlayerBalance_ ; // - _lockedInBets_; Should add later..

       //Should cancel all bets before withdrawn
       //Should return all players ballances before withdrawn
       _totalAllPlayerBalance_ = 0;
       _contractBalance_ -= toTransfer;

       msg.sender.transfer(toTransfer);
       return toTransfer;
    }

    function playerWithdrawAll() public returns(uint) {

        updatePlayerBalance(msg.sender);

        require(playerHistory[msg.sender].totalBalance > 0, "Player is out of money");

        require(validPlayerBalance(), "Invalid balance check");

        require(activeBet[msg.sender].waitingResult == false, "Waiting for bet result..");

        uint toTransfer = playerHistory[msg.sender].totalBalance;

        playerHistory[msg.sender].totalWithdrawn += toTransfer;

        resetPlayerBetList(msg.sender);

        _contractBalance_ -= toTransfer;
        
        updatePlayerBalance(msg.sender);

        assert(playerHistory[msg.sender].totalBalance == 0);

        msg.sender.transfer(toTransfer);

        return toTransfer;
    }

}
