const CoinFlip100 = artifacts.require("CoinFlip100");
const truffleAssert = require("truffle-assertions");

var CHIP_TO_WEI = 10**15; //1 chips = 1 eth - Can be parametric
var BET_MIN_AMOUNT_WEI = CHIP_TO_WEI ; //All Amount are in ETH
var BET_WIN_RATE = 7000; //Win rate = 70x with 2 decimals

var acc0 = "0x879f4528aC8718c1A4400b722114943A099C260f"
var acc1 = "0x001618D1bd09F71cd223afA603978127961CD5fB"

function chip2wei_ar(ar) {
  wei_ar = []
  for (x=0; x<ar.length; x++) {
    wei_ar.push(ar[x]*CHIP_TO_WEI);
  }
  return wei_ar
}

function chip2wei(chip) {
  return (chip*CHIP_TO_WEI);
}

function wei2Chip(wei) {
  return (wei/CHIP_TO_WEI);
}

function theSameArray(ar1,ar2) {
  if (ar1.length!=ar2.length) {
    return false
  }
  for (x=0; x < ar1.length; x++) {
    if (parseInt(ar1[x]) != parseInt(ar2[x])) {
      return false
    }
  }
  return true;
}


async function contractBalanceVarCheck() {
    InstanceContractBalance = parseInt( await web3.eth.getBalance(instance.address))
    readVar_contractbalance = parseInt(await instance.readVar_contractBalance_()) //balance is a function of CoinFlip100 contract
    console.log("contract Balance on Chain = ",InstanceContractBalance);
    console.log("contract Balance in memory = ",readVar_contractbalance);
    if (InstanceContractBalance != readVar_contractbalance) {
      compare = false;
    } else {compare = true};
    return {correct: compare, amount_wei:InstanceContractBalance, amount_chip: wei2Chip(InstanceContractBalance)};
  }


async function withdrawAllOfOwner(accAddress) {
    console.log("Withdraw to account 0...");
    contractBalance_before = parseInt(await web3.eth.getBalance(instance.address))
    userBalance_before = parseInt( await web3.eth.getBalance(accAddress))
    if (accountId == 0) {
      await truffleAssert.passes(instance.withdrawAll({from: accAddress}),"owner withdraw Not passed")
    } else {
      await truffleAssert.fails(instance.withdrawAll({from: accAddress}),"player withdraw Not stoped")
    }
    contractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
    userBalance_after = parseInt( await web3.eth.getBalance(accAddress))
    if (accountId == 0) {
      if (contractBalance_before > contractBalance_after) {
        return true
      } else {return false}
    }
    else{
      if (contractBalance_before > contractBalance_after) {
        return false
      } else {return true}
    }
  }


contract("CoinFlip100", async function(accounts){

  var instance;

  //beforeEach(async function() {...})
  //afterEach(async function() {...})
  //after(async function() {...})


  //  CHECK NO #1
  it("should accept Owner top Up", async function(){

      instance = await CoinFlip100.new();
      contractBalance_afterWithdraw = parseInt(await web3.eth.getBalance(instance.address))
  });
  /*
  
      instanceBalance_afterWithdraw = parseInt(await instance.balance())
      console.log("contract Balance after withdraw = ",contractBalance_afterWithdraw);
      console.log("instance Balance after withdraw = ",instanceBalance_afterWithdraw);

      ownerBalance_1a = parseInt( await web3.eth.getBalance(acc0))
      player1Balance_1a = parseInt( await web3.eth.getBalance(acc1))

      contractBalance_1a = contractBalanceVarCheck();
      assert(contractBalance_1a.correct , "Balance of instance and balance of Network address not match")
      total_owner_player_balance_1a = ownerBalance_1a + player1Balance_1a

      //console.log("CoinFlip100.address = ", CoinFlip100.address)
      //console.log("Instance.address = ", instance.address)

      ownerFundUp_chip_1a = 140 //1000 ships = 1 eth
      console.log("Creating Fund Up ..",ownerFundUp_chip,"chip")

      ownerFundUp_wei = chip2Wei(ownerFundUp_chip_1a);
      await instance.ownerFundUp_chip(ownerFundUp_chip,{value: ownerFundUp_wei.toString(), from: acc0});

      contactBalance_1b = contractBalanceVarCheck();
      assert(contactBalance_1b.correct, "Balance of instance and balance of Network address not match");
      assert(contactBalance_1b.amount_chip == ownerFundUp_chip_1a, "Balance of instance not correct")

      console.log("Contract Balance after funding:",ownerFundUp_chip_1a,"IS:",contactBalance_1b.amount_chip );
  });

  //  CHECK NO #...
  it("should accept Owner withdraw", async function(){

      test_W1 = withdrawAllOfOwner(acc1);
      assert(test_W1, " test withdraw from account 1 not ok ");
      test_W0 = withdrawAllOfOwner(acc0);
      assert(test_W0, " test withdraw from account 0 not ok ");
  });

/*
    it("should accept Player 1 top Up", async function(){

      console.log("CoinFlip100.address = ", CoinFlip100.address)
      console.log("Instance.address = ", instance.address)
      CoinFlip100Balance_before =parseInt( await web3.eth.getBalance(CoinFlip100.address))
      InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
      instanceBalance_before = parseInt(await instance.getContractBalance()) //balance is a function of CoinFlip100 contract

      console.log("CoinFlip100 Balance at start = ",CoinFlip100Balance_before);
      console.log("contract Balance at start = ",InstanceContractBalance_before);
      console.log("instance Balance at start = ",instanceBalance_before);

      assert(InstanceContractBalance_before == instanceBalance_before, "Balance of instance and balance of Network address not match")

      //user 1 Balance
      playerBalance_before = await web3.eth.getBalance(accounts[1])
      playerHistory_before =  await instance.getPlayerHistory()
      console.log("playerBalance_before =",web3.utils.fromWei(playerBalance_before,"ether"))
      console.log("playerHistory_before =",playerHistory_before)
      playerTopUp_eth_before = web3.utils.fromWei(playerHistory_before[0],"ether")
      console.log("playerTopUp_eth_before =",playerTopUp_eth_before,"eth")

      topUp_chip_1 = 1000
      topUp_eth_1 = topUp_chip_1/EthToChip
      console.log("Creating Player top Up ..",topUp_eth_1,"eth")
      topUp_wei_1 = web3.utils.toWei(topUp_eth_1.toString() ,"ether")
      await instance.playerTopUp_chip(topUp_chip_1,{value: topUp_wei_1, from: accounts[1]});

      let CoinFlip100Balance_after = parseInt( await web3.eth.getBalance(CoinFlip100.address))
      let InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
      let instanceBalance_after = parseInt(await instance.getContractBalance())

      console.log("CoinFlip100 Balance after top UP = ",CoinFlip100Balance_after);
      console.log("contract Balance after top UP = ",InstanceContractBalance_after);
      console.log("instance Balance after top UP = ",instanceBalance_after);

      assert(InstanceContractBalance_after == instanceBalance_after, "Balance of instance and balance of Network address not match");
      assert(InstanceContractBalance_after > InstanceContractBalance_before, "Balance of instance not insreased")

      //check user 1 Balance
      playerBalance_after = await web3.eth.getBalance(accounts[1])
      playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[1]})
      console.log("playerBalance_after =",web3.utils.fromWei(playerBalance_after,"ether"))
      console.log("playerHistory_after =",playerHistory_after)
      playerTopUp_eth_after = web3.utils.fromWei(playerHistory_after[0],"ether")
      console.log("playerTopUp_eth_after =",playerTopUp_eth_after,"eth")

      let playable_wei = 0
      assert(topUp_eth_1 == playerTopUp_eth_after, "top up balance not match")


      console.log("topUp_eth_1 = ",topUp_eth_1," | ownerFundUp_eth = ",ownerFundUp_eth)
      playable_eth = Math.min(topUp_eth_1,ownerFundUp_eth)

      console.log("playable_eth = ",playable_eth)

      get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
      get_playable_eth = web3.utils.fromWei(get_playable_wei,"ether")
      console.log("get_playable_eth player 1 = ",get_playable_eth)

      assert(get_playable_eth == playable_eth, "Not correct playable value")
    });

    it("should accept Player 2 top Up", async function(){

          console.log("CoinFlip100.address = ", CoinFlip100.address)
          console.log("Instance.address = ", instance.address)
          CoinFlip100Balance_before =parseInt( await web3.eth.getBalance(CoinFlip100.address))
          InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
          instanceBalance_before = parseInt(await instance.getContractBalance()) //balance is a function of CoinFlip100 contract

          console.log("CoinFlip100 Balance at start = ",CoinFlip100Balance_before);
          console.log("contract Balance at start = ",InstanceContractBalance_before);
          console.log("instance Balance at start = ",instanceBalance_before);

          assert(InstanceContractBalance_before == instanceBalance_before, "Balance of instance and balance of Network address not match")

          //user 2 Balance
          playerBalance_before = await web3.eth.getBalance(accounts[2])
          playerHistory_before =  await instance.getPlayerHistory()
          console.log("playerBalance_before =", web3.utils.fromWei(playerBalance_before,"ether"))
          console.log("playerHistory_before =",playerHistory_before)
          playerTopUp_eth_before = web3.utils.fromWei(playerHistory_before[0],"ether")
          console.log("playerTopUp_eth_before =",playerTopUp_eth_before)

          topUp_chip_2 = 2000;
          topUp_eth_2 = topUp_chip_2 / EthToChip
          console.log("Creating Player top Up ..",topUp_eth_2,"ether")

          topUp_wei_2 = web3.utils.toWei(topUp_eth_2.toString(),"ether")
          await instance.playerTopUp_chip(topUp_chip_2.toString(),{value: topUp_wei_2, from: accounts[2]});

          let CoinFlip100Balance_after = parseInt( await web3.eth.getBalance(CoinFlip100.address))
          let InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
          let instanceBalance_after = parseInt(await instance.getContractBalance())

          console.log("CoinFlip100 Balance after top UP = ",CoinFlip100Balance_after);
          console.log("contract Balance after top UP = ",InstanceContractBalance_after);
          console.log("instance Balance after top UP = ",instanceBalance_after);

          assert(InstanceContractBalance_after == instanceBalance_after, "Balance of instance and balance of Network address not match");
          assert(InstanceContractBalance_after > InstanceContractBalance_before, "Balance of instance not insreased")

          //check user 2 Balance
          playerBalance_after = await web3.eth.getBalance(accounts[2])
          playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[2]})
          console.log("playerBalance_after =",web3.utils.fromWei(playerBalance_after,"ether"))
          console.log("playerHistory_after =",playerHistory_after)
          playerTopUp_eth_after = web3.utils.fromWei(playerHistory_after[0],"ether")
          console.log("playerTopUp_eth_after =",playerTopUp_eth_after)

          assert(topUp_eth_2 == playerTopUp_eth_after, "top up balance not match")

          if (parseInt(topUp_wei_2) < parseInt(ownerFundUp_wei)) {
            playable_wei = parseInt(topUp_wei_2)
          }
          else {
            playable_wei = parseInt(ownerFundUp_wei)
          }

          get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
          console.log("get_playable_wei = ",web3.utils.fromWei(get_playable_wei,"ether"))
          assert(get_playable_wei == playable_wei, "Not correct playable value")
        });

  it("should accept new bet from PLayer 1", async function() {

    console.log("======== PLAYER 1: FIRST BET =======")
    bet_numbers_1 = [11,12];
    bet_amounts_chip_1 = [1,2];
    bet_amounts_wei_1 = chip2wei_ar(bet_amounts_chip_1)
    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("player 1 get_playable_wei = ",parseInt(get_playable_wei))

    playerHistory_before=  await instance.getPlayerHistory({gas:100000, from: accounts[1]})
    console.log("Player 1 _totalBalance =",parseInt(playerHistory_before[0]))

    await instance.createMyBet(bet_numbers_1, bet_amounts_chip_1, {gas:1000000, from: accounts[1]});
    betted = await instance.getMyBet({gas:100000, from: accounts[1]});

    console.log("Betted Numbers :",betted[0]," Should be:", bet_numbers_1);
    console.log("Betted Amounts:",betted[1]," Should be:", bet_amounts_wei_1);
    assert(theSameArray(betted[0],bet_numbers_1), "wrong Bet choice filled");
    assert(theSameArray(betted[1],bet_amounts_wei_1), "Wrong bet amount filled");
    assert(betted[2] == false, "Wrong bet waiting status - should be false");
    assert(betted[3] == 0, "Wrong bet ID - should be 0");

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    get_playable_eth = web3.utils.fromWei(get_playable_wei,"ether")
    console.log("get_playable_eth player 1 after 1st bet= ",get_playable_eth)

    //==== 2nd bet====
    console.log("======== PLAYER 1: SECOND BET =======")
    bet_numbers_12 = [12,0];
    bet_amounts_chip_12 = [2,100];
    bet_amounts_wei_1 = chip2wei_ar([1,2,2,100])

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("get_playable_wei = ",parseInt(get_playable_wei))

    playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[1]})
    console.log("Player_totalBalance =",parseInt(playerHistory_after[0]))

    await instance.createMyBet( bet_numbers_12, bet_amounts_chip_12, {gas:1000000, from: accounts[1]});
    betted = await instance.getMyBet({gas:100000, from: accounts[1]});

    console.log("Betted Numbers :",betted[0]," Should be:", [11,12,12,0]);
    console.log("Betted Amounts:",betted[1]," Should be:", bet_amounts_wei_1);
    assert(theSameArray(betted[0],  [11,12,12,0]), "wrong Bet choice filled");
    assert(theSameArray(betted[1],bet_amounts_wei_1), "Wrong bet amount filled");
    assert(betted[2] == false, "Wrong bet waiting status - should be false");
    assert(betted[3] == 0, "Wrong bet ID - should be 0");

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    get_playable_eth = web3.utils.fromWei(get_playable_wei,"ether")
    console.log("get_playable_eth player 1 after 2nd bet= ",get_playable_eth)

  });

  it("should accept new bet from PLayer 2", async function() {
    console.log("======== PLAYER 2: FIRST BET =======")
    bet_numbers_21 = [98,99,98];
    bet_amounts_chip_21 = [2,100,1];
    bet_amounts_wei_21 = chip2wei_ar(bet_amounts_chip_21)

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei = ",parseInt(get_playable_wei))

    playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[2]})
    console.log("Player_totalBalance =",parseInt(playerHistory_after[0]))

    console.log("2.0 bet for :",bet_numbers_21, " amount:", bet_amounts_chip_21,"chips")

    await instance.createMyBet( bet_numbers_21, bet_amounts_chip_21, {gas:1000000, from: accounts[2]});
    betted = await instance.getMyBet({gas:100000, from: accounts[2]});
    console.log("Betted Numbers :",betted[0]," Should be:", bet_numbers_21);
    console.log("Betted Amounts:",betted[1]," Should be:", bet_amounts_wei_21);
    assert(theSameArray(betted[0],  bet_numbers_21), "wrong Bet choice filled");
    assert(theSameArray(betted[1],  bet_amounts_wei_21), "Wrong bet amount filled");
    assert(betted[2] == false, "Wrong bet waiting status - should be false");
    assert(betted[3] == 0, "Wrong bet ID - should be 0");

    console.log("======== PLAYER 2: SECOND BET =======")
    bet_numbers_22 = [98,99,98];
    bet_amounts_chip_22 = [2,100,1];
    bet_amounts_wei_21 = chip2wei_ar([2,100,1,2,100,1])

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei = ",parseInt(get_playable_wei))

    playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[2]})
    console.log("Player_totalBalance =",parseInt(playerHistory_after[0]))

    console.log("2.1 bet for :",bet_numbers_22, " amount:", bet_amounts_chip_22,"chip")
    await instance.createMyBet( bet_numbers_22, bet_amounts_chip_22, {gas:1000000, from: accounts[2]});

    betted = await instance.getMyBet({gas:100000, from: accounts[2]});

    console.log("Betted Numbers :",betted[0]," Should be:", [98,99,98,98,99,98]);
    console.log("Betted Amounts:",betted[1]," Should be:", bet_amounts_wei_21);
    assert(theSameArray(betted[0],   [98,99,98,98,99,98]), "wrong Bet choice filled");
    assert(theSameArray(betted[1],  bet_amounts_wei_21), "Wrong bet amount filled");
    assert(betted[2] == false, "Wrong bet waiting status - should be false");
    assert(betted[3] == 0, "Wrong bet ID - should be 0");

  });

  it("should not accept new bet more than player's balance or contract's balance", async function() {
    BIGbet_numbers_1 = [55,66];
    BIGbet_amounts_chip_1 = [1000,2000];

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    get_playable_eth = web3.utils.fromWei(get_playable_wei,"ether")
    console.log("get_playable_eth player 1 after player 2 bet= ",get_playable_eth)

    //Too high bet amount for player Balance
    await truffleAssert.fails(
      instance.createMyBet( BIGbet_numbers_1 , BIGbet_amounts_chip_1 , {gas:1000000, from: accounts[1]}),
      truffleAssert.ErrorType.REVERT);

    betted = await instance.getMyBet({gas:100000, from: accounts[1]});

    console.log("Betted Numbers :",betted[0]);
    console.log("Betted Amounts:",betted[1]);

    BIGbet_numbers_2 = [55,66];
    BIGbet_amounts_chip_2 = [10000,20000];

    //Too high bet amount for Contract Balance
    await truffleAssert.fails(
        instance.createMyBet( BIGbet_numbers_2 , BIGbet_amounts_chip_2 , {gas:1000000, from: accounts[2]}),
        truffleAssert.ErrorType.REVERT);

    betted = await instance.getMyBet({gas:100000, from: accounts[2]});
    console.log("Betted Numbers :",betted[0]);
    console.log("Betted Amounts:",betted[1]);

  });


  it("Should not allow non Owner to withdraw ", async function() {

    await truffleAssert.fails(
      instance.ownerWithdrawAll({gas:1000000, from: accounts[1]}),
      truffleAssert.ErrorType.REVERT);

    await truffleAssert.fails(
      instance.ownerWithdrawAll({gas:1000000, from: accounts[2]}),
      truffleAssert.ErrorType.REVERT);
  });

  it("Should not allow players to withdraw due to Bet placed", async function() {
    await truffleAssert.fails(
      instance.playerWithdrawAll({gas:1000000, from: accounts[1]}));

    await truffleAssert.fails(
      instance.playerWithdrawAll({gas:1000000, from: accounts[2]}));
  });


  it("Player Toss Coin to return..", async function() {
    result1 = await instance.playerTossCoin({gas:1000000, from: accounts[1]});
    console.log("Result 1 = ",result1[0], result1[1]);
    result2 = await instance.playerTossCoin({gas:1000000, from: accounts[2]});
    console.log("Result 2 = ",result2[0], result2[1]);
    //should add more checks..

  });

  it("Should allow players to withdraw ", async function() {
    await truffleAssert.passes(
      instance.playerWithdrawAll({gas:1000000, from: accounts[1]}));

    await truffleAssert.passes(
      instance.playerWithdrawAll({gas:1000000, from: accounts[2]}));

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("get_playable_wei player 1 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei == 0, "Not correct playable 1 value")

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei player 2 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei == 0, "Not correct playable 2 value")
  });

  it("Should allow Owner to withdraw ", async function() {

    await truffleAssert.passes(
      instance.ownerWithdrawAll({gas:1000000, from: acc0}));

    CoinFlip100Balance_after = parseInt( await web3.eth.getBalance(CoinFlip100.address))
    InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseInt(await instance.getContractBalance())

    console.log("CoinFlip100 Balance after widthdraw all = ",CoinFlip100Balance_after);


    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("get_playable_wei player 1 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei == 0, "Not correct playable 1 value")

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei player 2 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei == 0, "Not correct playable 2 value")

    console.log("Owner balance at start:")
    console.log("Player 1 balance at start:")
    console.log("Player 2 balance at start:")

    ownerBalanceEnd = parseInt( await web3.eth.getBalance(acc0))
    player1_BalanceEnd = parseInt( await web3.eth.getBalance(accounts[1]))
    player2_BalanceEnd = parseInt( await web3.eth.getBalance(accounts[2]))
    totalBalance_End= ownerBalanceEnd+player1_BalanceEnd+player2_BalanceEnd

    console.log("Owner balance start: ",ownerBalanceStart)
    console.log("Owner balance end: ",ownerBalanceEnd)
    console.log("Player 1 balance start: ",player1_BalanceStart)
    console.log("Player 1 balance end: ",player1_BalanceEnd)
    console.log("Player 2 balance start: ",player2_BalanceStart)
    console.log("Player 2 balance end: ",player2_BalanceEnd)
    console.log("totalBalance_start : ",totalBalance_start)
    console.log("totalBalance_End : ",totalBalance_End)

    p1_PLwei = player1_BalanceEnd-player1_BalanceStart
    p1_PL = web3.utils.fromWei(p1_PLwei.toString(),"ether")
    p2_PLwei = player2_BalanceEnd-player2_BalanceStart
    p2_PL = web3.utils.fromWei(p2_PLwei.toString(),"ether")
    owner_PLwei = ownerBalanceEnd-ownerBalanceStart
    owner_PL = web3.utils.fromWei(owner_PLwei.toString(),"ether")
    fee_wei = totalBalance_start - totalBalance_End
    fee = web3.utils.fromWei(fee_wei.toString(),"ether")

    console.log("Player 1 PL =",p1_PL)
    console.log("Player 2 PL =",p2_PL)
    console.log("Owner PL =",owner_PL)
    console.log("Trasaction fee = ",fee)
    console.log("contract Balance after widthdraw all = ",InstanceContractBalance_after);
    console.log("instance Balance after widthdraw all = ",instanceBalance_after);
  });


/*
  it("should payOut and reset",async function() {
    playerDetails = await instance.playerReport(acc0);
    console.log( "playerDetails", playerDetails)
    CoinFlip100Balance_before =parseInt( await web3.eth.getBalance(CoinFlip100.address))
    InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
    instanceBalance_before = parseInt(await instance.balance()) //balance is a function of CoinFlip100 contract
    playerBalance = parseInt( await web3.eth.getBalance(acc0))

    console.log("CoinFlip100 Balance before PayOut = ",CoinFlip100Balance_before);
    console.log("contract Balance before PayOut = ",InstanceContractBalance_before);
    console.log("instance Balance before PayOut = ",instanceBalance_before);
    console.log("Player Balance = ", playerBalance);

    betted = await instance.getMyBet({from: acc0});
    console.log("Before Pay Out: Betted for :",betted[0] );
    console.log("Before Pay Out: Betted Amount :",betted[1]);

    //Here should test PayOut

    CoinFlip100Balance_after = parseInt( await web3.eth.getBalance(CoinFlip100.address))
    InstanceContractBalance_after = parseInt( await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseInt(await instance.balance()) //balance is a function of CoinFlip100 contract
    playerBalance = parseInt( await web3.eth.getBalance(acc0))

    console.log("CoinFlip100 Balance after PayOut = ",CoinFlip100Balance_after);
    console.log("contract Balance after PayOut = ",InstanceContractBalance_after);
    console.log("instance Balance after PayOut = ",instanceBalance_after);
    console.log("Player Balance = ", playerBalance);

    betted = await instance.getMyBet({from: acc0});
    console.log("After Pay Out: Betted for :",betted[0] );
    console.log("After Pay Out: Betted Amount :",betted[1]);
    assert(betted[0] == 0);
    assert(betted[1] == 0);
  })
*/

/*
  it("should not create person without payment", async function() {
    await truffleAssert.fails(
      instance.createPerson(
        "Bob", 100, 190,
        {value: web3.utils.toWei("0.001","ether"), from: accounts[1]}),
      truffleAssert.ErrorType.REVERT  //require error type to be specific
    );
  });

  it("should set senior status", async function() {
    await instance.createPerson(
        "Bob", 65, 190,
        { value: web3.utils.toWei("1","ether"), from: accounts[1]}
      );
    let result = await instance.getPerson({from: accounts[1]});
    assert(result.senior === true, "Senior level not set")
  });

  it("should set age correctly", async function() {
    let result = await instance.getPerson({from: accounts[1]});
    assert(result.age.toNumber() === 65, "Age not set correctly")
  });

  it("account [2] wont allowed to delete person",async function() {
    instance.createPerson(
      "Bob", 100, 190,
      {value: web3.utils.toWei("1","ether"), from: accounts[2]});
    await truffleAssert.fails(
      instance.deletePerson(accounts[2], {from: accounts[2]}),
      truffleAssert.ErrorType.REVERT
    )
  });

  it("Account [0] able to delete person", async function () {
    let instance = await People.new();
    instance.createPerson(
      "Bob", 100, 190,
      {value: web3.utils.toWei("1","ether"), from: accounts[1]});
    await truffleAssert.passes(
      instance.deletePerson(acc0, {from: acc0})
    );
  });
    //web3.eth.getBalance(address)
    //Google: Find contract address in truffle

  it("Account Ballance of Contract People should be added 1 eth", async function() {
    let instance = await People.new();
    console.log("People.address = ", People.address)
    console.log("Instance.address = ", instance.address)
    let contractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
    let instanceBalance_before = parseInt(await instance.balance()) //balance is a function of People contract

    console.log("contract Balance at start = ",contractBalance_before);
    console.log("instance Balance at start = ",instanceBalance_before);

    assert(contractBalance_before == instanceBalance_before, "Balance of instance and balance of Network address not match")

    console.log("Creating person...")
    await instance.createPerson(
      "Alice", 100, 190,
      {value: web3.utils.toWei("1","ether"), from: accounts[1]});

    let contractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseInt(await instance.balance())

    console.log("contract Balance after Person created = ",contractBalance_after);
    console.log("instance Balance after Person created = ",instanceBalance_after);

    assert(contractBalance_after == instanceBalance_after, "Balance of instance and balance of Network address not match")
    assert(contractBalance_after == contractBalance_before + web3.utils.toWei("1","ether"), "Wrong Balance added");

    console.log("Withdraw to account 1...")
    await truffleAssert.fails(
        instance.withdrawAll({from: accounts[1]}),
        truffleAssert.ErrorType.REVERT
        );

    contractBalance_afterWithdraw = parseInt(await web3.eth.getBalance(instance.address))
    instanceBalance_afterWithdraw = parseInt(await instance.balance())
    console.log("contract Balance after withdraw = ",contractBalance_afterWithdraw);
    console.log("instance Balance after withdraw = ",instanceBalance_afterWithdraw);

    let acc0_balance_before = parseInt(await web3.eth.getBalance(acc0))

    console.log("Withdraw to account 0...")
    await truffleAssert.passes(
      instance.withdrawAll({from: acc0})
    );

    contractBalance_afterWithdraw = parseInt(await web3.eth.getBalance(instance.address))
    instanceBalance_afterWithdraw = parseInt(await instance.balance())
    console.log("contract Balance after withdraw = ",contractBalance_afterWithdraw);
    console.log("instance Balance after withdraw = ",instanceBalance_afterWithdraw);

    assert(contractBalance_afterWithdraw == instanceBalance_afterWithdraw, "Balance of instance and balance of Network address not match")
    assert(instanceBalance_afterWithdraw == web3.utils.toWei("0","ether"), "Balance not Zero")

    let acc0_balance_after = parseInt(await web3.eth.getBalance(acc0))
    console.log("Account 0 Balance before withdrawall = ",acc0_balance_before);
    console.log("Account 0 Balance after withdrawall = ",acc0_balance_after);

    assert(acc0_balance_before < acc0_balance_after, "Ballance not increased")
  });



  //it("Should not allow Non Owner to delete person", async function(accounts[1]))
*/
});
