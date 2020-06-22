const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");
contract("CoinFlip", async function(accounts){

  var instance;

  //beforeEach(async function() {...})
  //afterEach(async function() {...})
  //after(async function() {...})

  it("should accept Owner top Up", async function(){
    instance = await CoinFlip.new();
    console.log("CoinFlip.address = ", CoinFlip.address)
    console.log("Instance.address = ", instance.address)
    let CoinFlipBalance_before =parseInt( await web3.eth.getBalance(CoinFlip.address))
    let InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
    let instanceBalance_before = parseInt(await instance.getContractBalance()) //balance is a function of CoinFlip contract

    console.log("CoinFLip Balance at start = ",CoinFlipBalance_before);
    console.log("contract Balance at start = ",InstanceContractBalance_before);
    console.log("instance Balance at start = ",instanceBalance_before);

    assert(InstanceContractBalance_before == instanceBalance_before, "Balance of instance and balance of Network address not match")

    ownerFundUp_eth = "10"
    console.log("Creating Fund Up ..",ownerFundUp_eth,"eth")

    ownerFundUp_wei = web3.utils.toWei(ownerFundUp_eth,"ether")
    await instance.ownerFundUp_eth(ownerFundUp_eth,{value: ownerFundUp_wei, from: accounts[0]});

    let CoinFlipBalance_after = parseInt( await web3.eth.getBalance(CoinFlip.address))
    let InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
    let instanceBalance_after = parseInt(await instance.getContractBalance())

    console.log("CoinFLip Balance after top UP = ",CoinFlipBalance_after);
    console.log("contract Balance after top UP = ",InstanceContractBalance_after);
    console.log("instance Balance after top UP = ",instanceBalance_after);

    assert(InstanceContractBalance_after == instanceBalance_after, "Balance of instance and balance of Network address not match");
    assert(InstanceContractBalance_after > InstanceContractBalance_before, "Balance of instance not insreased")
  });


    it("should accept Player 1 top Up", async function(){

      console.log("CoinFlip.address = ", CoinFlip.address)
      console.log("Instance.address = ", instance.address)
      CoinFlipBalance_before =parseInt( await web3.eth.getBalance(CoinFlip.address))
      InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
      instanceBalance_before = parseInt(await instance.getContractBalance()) //balance is a function of CoinFlip contract

      console.log("CoinFLip Balance at start = ",CoinFlipBalance_before);
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

      topUp_eth_1 = "3"
      console.log("Creating Player top Up ..",topUp_eth_1,"eth")
      topUp_wei_1 = web3.utils.toWei(topUp_eth_1 ,"ether")
      await instance.playerTopUp_eth(topUp_eth_1,{value: topUp_wei_1, from: accounts[1]});

      let CoinFlipBalance_after = parseInt( await web3.eth.getBalance(CoinFlip.address))
      let InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
      let instanceBalance_after = parseInt(await instance.getContractBalance())

      console.log("CoinFLip Balance after top UP = ",CoinFlipBalance_after);
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
      if (parseInt(topUp_eth_1) <= parseInt(ownerFundUp_eth)) {
        playable_eth = topUp_eth_1
      }
      else {
        playable_eth = ownerFundUp_eth
      }

      console.log("playable_eth = ",playable_eth)

      get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
      get_playable_eth = web3.utils.fromWei(get_playable_wei,"ether")
      console.log("get_playable_eth = ",get_playable_eth)

      assert(get_playable_eth == playable_eth, "Not correct playable value")
    });

    it("should accept Player 2 top Up", async function(){

          console.log("CoinFlip.address = ", CoinFlip.address)
          console.log("Instance.address = ", instance.address)
          CoinFlipBalance_before =parseInt( await web3.eth.getBalance(CoinFlip.address))
          InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
          instanceBalance_before = parseInt(await instance.getContractBalance()) //balance is a function of CoinFlip contract

          console.log("CoinFLip Balance at start = ",CoinFlipBalance_before);
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

          topUp_eth_2 = "2"
          console.log("Creating Player top Up ..",topUp_eth_2,"ether")

          topUp_wei_2 = web3.utils.toWei(topUp_eth_2,"ether")
          await instance.playerTopUp_eth(topUp_eth_2,{value: topUp_wei_2, from: accounts[2]});

          let CoinFlipBalance_after = parseInt( await web3.eth.getBalance(CoinFlip.address))
          let InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
          let instanceBalance_after = parseInt(await instance.getContractBalance())

          console.log("CoinFLip Balance after top UP = ",CoinFlipBalance_after);
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

    betChoice_1 = 1;
    betAmount_eth_1 = "1";

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("get_playable_wei = ",parseInt(get_playable_wei))

    playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[1]})
    console.log("Player_totalBalance =",parseInt(playerHistory_after[0]))

    betAmount_wei_1 = parseInt(await instance.eth2Wei(betAmount_eth_1, {gas:100000, from: accounts[1]}))
    console.log("PlayerBetAmount_wei =",betAmount_wei_1)

    await instance.createMyBet( betChoice_1, betAmount_eth_1, {gas:1000000, from: accounts[1]});
    betted = await instance.getMyBet({gas:100000, from: accounts[1]});
    console.log("Betted for :",betted[0]," Should be:", betChoice_1);
    console.log("Betted Amount :",betted[1]," Should be:", betAmount_eth_1);
    assert(betted[0][betted[0].length-1] == betChoice_1, "wrong Bet choice filled");
    assert(betted[1][betted[1].length-1] == betAmount_wei_1, "Wrong bet amount filled")
  });

  it("should accept new bet from PLayer 2", async function() {
    betChoice_2 = 1;
    betAmount_eth_2 = 1;

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei = ",parseInt(get_playable_wei))

    playerHistory_after =  await instance.getPlayerHistory({gas:100000, from: accounts[2]})
    console.log("Player_totalBalance =",parseInt(playerHistory_after[0]))

    betAmount_wei_2 = parseInt(await instance.eth2Wei(betAmount_eth_2, {gas:100000, from: accounts[2]}))
    console.log("PlayerBetAmount_wei =",betAmount_wei_2)

    await instance.createMyBet( betChoice_2, betAmount_eth_2, {gas:1000000, from: accounts[2]});
    let betted = await instance.getMyBet({gas:100000, from: accounts[2]});
    console.log("Betted for :",betted[0]," Should be:", betChoice_2);
    console.log("Betted Amount :",betted[1]," Should be:", betAmount_eth_2);
    assert(betted[0][betted[0].length-1] == betChoice_2, "wrong Bet choice filled");
    assert(betted[1][betted[1].length-1] == betAmount_wei_2, "Wrong bet amount filled")
  });

  it("should not accept new bet more than player's balance or contract's balance", async function() {
    BIGbetChoice = 0;
    BIGbetAmount = 5;

    //Too high bet amount for player Balance
    await truffleAssert.fails(
      instance.createMyBet( BIGbetChoice , BIGbetAmount , {gas:1000000, from: accounts[1]}),
      truffleAssert.ErrorType.REVERT);

    BIGbetChoice2 = 0;
    BIGbetAmount2 = 15;

    //Too high bet amount for Contract Balance
    await truffleAssert.fails(
        instance.createMyBet( BIGbetChoice2 , BIGbetAmount2 , {gas:1000000, from: accounts[1]}),
        truffleAssert.ErrorType.REVERT);

    betted = await instance.getMyBet({gas:100000, from: accounts[1]});
    console.log("Betted for :",betted[0]," Should be:", betChoice_1);
    console.log("Betted Amount :",betted[1]," Should be:", betAmount_eth_1);
    assert(betted[0][betted[0].length-1] == betChoice_1, "wrong Bet choice filled");
    assert(betted[1][betted[1].length-1] == betAmount_wei_1, "Wrong bet amount filled");

    betted = await instance.getMyBet({gas:100000, from: accounts[2]});
    console.log("Betted for :",betted[0]," Should be:", betChoice_2);
    console.log("Betted Amount :",betted[1]," Should be:", betAmount_eth_2);
    assert(betted[0][betted[0].length-1] == betChoice_2, "wrong Bet choice filled");
    assert(betted[1][betted[1].length-1] == betAmount_wei_2, "Wrong bet amount filled");

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

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("get_playable_wei player 1 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei > 0, "Not correct playable 1 value")

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei player 2 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei > 0, "Not correct playable 2 value")
  });

  it("Player Toss Coin to return..", async function() {
    tossResult1 = await instance.playerTossCoin({gas:1000000, from: accounts[1]});
    console.log("tossResult1 = ",tossResult1);
    tossResult2 = await instance.playerTossCoin({gas:1000000, from: accounts[2]});
    console.log("tossResult2 = ",tossResult2);
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


  it("Should not allow Owner to withdraw ", async function() {

    await truffleAssert.passes(
      instance.ownerWithdrawAll({gas:1000000, from: accounts[0]}));

    CoinFlipBalance_after = parseInt( await web3.eth.getBalance(CoinFlip.address))
    InstanceContractBalance_after = parseInt(await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseInt(await instance.getContractBalance())

    console.log("CoinFLip Balance after widthdraw all = ",CoinFlipBalance_after);
    console.log("contract Balance after widthdraw all = ",InstanceContractBalance_after);
    console.log("instance Balance after widthdraw all = ",instanceBalance_after);

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[1]})
    console.log("get_playable_wei player 1 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei == 0, "Not correct playable 1 value")

    get_playable_wei = await instance.playerPlayableFund({gas:100000, from: accounts[2]})
    console.log("get_playable_wei player 2 = ",web3.utils.fromWei(get_playable_wei,"ether"))
    assert(get_playable_wei == 0, "Not correct playable 2 value")

  });


});

/*
  it("should payOut and reset",async function() {
    playerDetails = await instance.playerReport(accounts[0]);
    console.log( "playerDetails", playerDetails)
    CoinFlipBalance_before =parseInt( await web3.eth.getBalance(CoinFlip.address))
    InstanceContractBalance_before =parseInt( await web3.eth.getBalance(instance.address))
    instanceBalance_before = parseInt(await instance.balance()) //balance is a function of CoinFlip contract
    playerBalance = parseInt( await web3.eth.getBalance(accounts[0]))

    console.log("CoinFLip Balance before PayOut = ",CoinFlipBalance_before);
    console.log("contract Balance before PayOut = ",InstanceContractBalance_before);
    console.log("instance Balance before PayOut = ",instanceBalance_before);
    console.log("Player Balance = ", playerBalance);

    betted = await instance.getMyBet({from: accounts[0]});
    console.log("Before Pay Out: Betted for :",betted[0] );
    console.log("Before Pay Out: Betted Amount :",betted[1]);

    //Here should test PayOut

    CoinFlipBalance_after = parseInt( await web3.eth.getBalance(CoinFlip.address))
    InstanceContractBalance_after = parseInt( await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseInt(await instance.balance()) //balance is a function of CoinFlip contract
    playerBalance = parseInt( await web3.eth.getBalance(accounts[0]))

    console.log("CoinFLip Balance after PayOut = ",CoinFlipBalance_after);
    console.log("contract Balance after PayOut = ",InstanceContractBalance_after);
    console.log("instance Balance after PayOut = ",instanceBalance_after);
    console.log("Player Balance = ", playerBalance);

    betted = await instance.getMyBet({from: accounts[0]});
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
      instance.deletePerson(accounts[0], {from: accounts[0]})
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

    let acc0_balance_before = parseInt(await web3.eth.getBalance(accounts[0]))

    console.log("Withdraw to account 0...")
    await truffleAssert.passes(
      instance.withdrawAll({from: accounts[0]})
    );

    contractBalance_afterWithdraw = parseInt(await web3.eth.getBalance(instance.address))
    instanceBalance_afterWithdraw = parseInt(await instance.balance())
    console.log("contract Balance after withdraw = ",contractBalance_afterWithdraw);
    console.log("instance Balance after withdraw = ",instanceBalance_afterWithdraw);

    assert(contractBalance_afterWithdraw == instanceBalance_afterWithdraw, "Balance of instance and balance of Network address not match")
    assert(instanceBalance_afterWithdraw == web3.utils.toWei("0","ether"), "Balance not Zero")

    let acc0_balance_after = parseInt(await web3.eth.getBalance(accounts[0]))
    console.log("Account 0 Balance before withdrawall = ",acc0_balance_before);
    console.log("Account 0 Balance after withdrawall = ",acc0_balance_after);

    assert(acc0_balance_before < acc0_balance_after, "Ballance not increased")
  });



  //it("Should not allow Non Owner to delete person", async function(accounts[1]))
});
*/
