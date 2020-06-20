const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");
contract("CoinFlip", async function(accounts){

  var instance;

  //beforeEach(async function() {...})
  //afterEach(async function() {...})
  //after(async function() {...})

  it("should't accept bet lower 1000Wei", async function(){
    instance = await CoinFlip.new();
    await truffleAssert.fails(
      instance.createBet(
        1,
        {value: 100, from: accounts[0]}),
      truffleAssert.ErrorType.REVERT  // require error type to be specific
      );
  });

  it("should accept top Up", async function(){
    instance = await CoinFlip.new();
    console.log("CoinFlip.address = ", CoinFlip.address)
    console.log("Instance.address = ", instance.address)
    let CoinFlipBalance_before =parseFloat( await web3.eth.getBalance(CoinFlip.address))
    let InstanceContractBalance_before =parseFloat( await web3.eth.getBalance(instance.address))
    let instanceBalance_before = parseFloat(await instance.balance()) //balance is a function of CoinFlip contract

    console.log("CoinFLip Balance at start = ",CoinFlipBalance_before);
    console.log("contract Balance at start = ",InstanceContractBalance_before);
    console.log("instance Balance at start = ",instanceBalance_before);

    assert(InstanceContractBalance_before == instanceBalance_before, "Balance of instance and balance of Network address not match")

    console.log("Creating top Up ..")

    await instance.topUp({value: 100000000000, from: accounts[0]});

    let CoinFlipBalance_after = parseFloat( await web3.eth.getBalance(CoinFlip.address))
    let InstanceContractBalance_after = parseFloat(await web3.eth.getBalance(instance.address))
    let instanceBalance_after = parseFloat(await instance.balance())

    console.log("CoinFLip Balance after top UP = ",CoinFlipBalance_after);
    console.log("contract Balance after top UP = ",InstanceContractBalance_after);
    console.log("instance Balance after top UP = ",instanceBalance_after);

    let playerDetails = await instance.playerReport(accounts[0],{from: accounts[0]});
    console.log( "playerDetails", playerDetails)

    assert(InstanceContractBalance_after == instanceBalance_after, "Balance of instance and balance of Network address not match");
    assert(InstanceContractBalance_after > InstanceContractBalance_before, "Balance of instance not insreased")
  });

  it("should accept new bet", async function() {

    let betChoice = 1;
    let betAmount = 5000000;
    await instance.createBet( betChoice ,
      {value: betAmount, from: accounts[0]});
    let betted = await instance.getMyBet({from: accounts[0]});
    console.log("Betted for :",betted[0]," Should be:", betChoice);
    console.log("Betted Amount :",betted[1]," Should be:", betAmount);
    assert(betted[0] == betChoice, "wrong Bet choice filled");
    assert(betted[1] == betAmount, "Wrong bet amount filled")
  });

  it("should accept new bet for player at address..", async function() {
    let betChoice = 1;
    let betAmount = 5000000;
    await instance.createBetForPlayer( betChoice , betAmount, accounts[0],
      {from: accounts[0]});
    let betted = await instance.getMyBet({from: accounts[0]});
    console.log("Betted for :",betted[0]," Should be:", betChoice);
    console.log("Betted Amount :",betted[1]," Should be:", betAmount);
    assert(betted[0][1] == betChoice, "wrong Bet choice filled");
    assert(betted[1][1] == betAmount, "Wrong bet amount filled");
  });


/*
  it("should payOut and reset",async function() {
    playerDetails = await instance.playerReport(accounts[0]);
    console.log( "playerDetails", playerDetails)
    CoinFlipBalance_before =parseFloat( await web3.eth.getBalance(CoinFlip.address))
    InstanceContractBalance_before =parseFloat( await web3.eth.getBalance(instance.address))
    instanceBalance_before = parseFloat(await instance.balance()) //balance is a function of CoinFlip contract
    playerBalance = parseFloat( await web3.eth.getBalance(accounts[0]))

    console.log("CoinFLip Balance before PayOut = ",CoinFlipBalance_before);
    console.log("contract Balance before PayOut = ",InstanceContractBalance_before);
    console.log("instance Balance before PayOut = ",instanceBalance_before);
    console.log("Player Balance = ", playerBalance);

    betted = await instance.getMyBet({from: accounts[0]});
    console.log("Before Pay Out: Betted for :",betted[0] );
    console.log("Before Pay Out: Betted Amount :",betted[1]);

    //Here should test PayOut

    CoinFlipBalance_after = parseFloat( await web3.eth.getBalance(CoinFlip.address))
    InstanceContractBalance_after = parseFloat( await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseFloat(await instance.balance()) //balance is a function of CoinFlip contract
    playerBalance = parseFloat( await web3.eth.getBalance(accounts[0]))

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
    let contractBalance_before =parseFloat( await web3.eth.getBalance(instance.address))
    let instanceBalance_before = parseFloat(await instance.balance()) //balance is a function of People contract

    console.log("contract Balance at start = ",contractBalance_before);
    console.log("instance Balance at start = ",instanceBalance_before);

    assert(contractBalance_before == instanceBalance_before, "Balance of instance and balance of Network address not match")

    console.log("Creating person...")
    await instance.createPerson(
      "Alice", 100, 190,
      {value: web3.utils.toWei("1","ether"), from: accounts[1]});

    let contractBalance_after = parseFloat(await web3.eth.getBalance(instance.address))
    instanceBalance_after = parseFloat(await instance.balance())

    console.log("contract Balance after Person created = ",contractBalance_after);
    console.log("instance Balance after Person created = ",instanceBalance_after);

    assert(contractBalance_after == instanceBalance_after, "Balance of instance and balance of Network address not match")
    assert(contractBalance_after == contractBalance_before + web3.utils.toWei("1","ether"), "Wrong Balance added");

    console.log("Withdraw to account 1...")
    await truffleAssert.fails(
        instance.withdrawAll({from: accounts[1]}),
        truffleAssert.ErrorType.REVERT
        );

    contractBalance_afterWithdraw = parseFloat(await web3.eth.getBalance(instance.address))
    instanceBalance_afterWithdraw = parseFloat(await instance.balance())
    console.log("contract Balance after withdraw = ",contractBalance_afterWithdraw);
    console.log("instance Balance after withdraw = ",instanceBalance_afterWithdraw);

    let acc0_balance_before = parseFloat(await web3.eth.getBalance(accounts[0]))

    console.log("Withdraw to account 0...")
    await truffleAssert.passes(
      instance.withdrawAll({from: accounts[0]})
    );

    contractBalance_afterWithdraw = parseFloat(await web3.eth.getBalance(instance.address))
    instanceBalance_afterWithdraw = parseFloat(await instance.balance())
    console.log("contract Balance after withdraw = ",contractBalance_afterWithdraw);
    console.log("instance Balance after withdraw = ",instanceBalance_afterWithdraw);

    assert(contractBalance_afterWithdraw == instanceBalance_afterWithdraw, "Balance of instance and balance of Network address not match")
    assert(instanceBalance_afterWithdraw == web3.utils.toWei("0","ether"), "Balance not Zero")

    let acc0_balance_after = parseFloat(await web3.eth.getBalance(accounts[0]))
    console.log("Account 0 Balance before withdrawall = ",acc0_balance_before);
    console.log("Account 0 Balance after withdrawall = ",acc0_balance_after);

    assert(acc0_balance_before < acc0_balance_after, "Ballance not increased")
  });


*/
  //it("Should not allow Non Owner to delete person", async function(accounts[1]))
});
