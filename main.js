
//web3.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var web3 = new Web3(Web3.givenProvider);

var contractInstance;
var playerAddress;
var contractAddress = "0x774952e2f334DEE89f78bf6d9002B01D2DA0a408";

$(document).ready(function() {
    window.ethereum.enable().then(async function(accounts){
      await fetchAccountInfo()
      contractInstance = new web3.eth.Contract(window.abi, contractAddress , {gas:1000000, from: playerAddress});
      console.log("contractInstance :",contractInstance);
      refreshDisplay();

    });
    $("#place_bet1_button").click(placeBet1);
    $("#place_bet0_button").click(placeBet0);
    $("#play_button").click(flipNow);
    $("#topUp_button").click(playerTopUp_eth);
    $("#FundUp_button").click(ownerFundUp_eth);
    window.ethereum.on('accountsChanged', async function(accounts) {
        console.log("Account changed")
        refreshDisplay();
    });
});

function weiToEther(balance) {
    return web3.utils.fromWei(balance, "ether") + " ETH"
}

async function ownerFundUp_eth() {
    var fundUpAmount_eth = $("#FundUp_input").val();

    var config = {value: web3.utils.toWei(fundUpAmount_eth, "ether"),
                  gas:1000000, from: playerAddress}; // Should return later for player at the end of game

    console.log("Fund Up amount:",typeof(fundUpAmount_eth),fundUpAmount_eth)

    await contractInstance.methods.ownerFundUp_eth(fundUpAmount_eth).send(config)
      .on('transactionHash', function(hash){
        console.log("tx hash :",hash);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("confirmation Number:",confirmationNumber);
      })
      .on('receipt', function(receipt){
        console.log("receipt: ",receipt);
        refreshDisplay();
      })
};

async function playerTopUp_eth() {
    var topUpAmount_eth = $("#topUp_input").val();

    var config = {value: web3.utils.toWei(topUpAmount_eth, "ether"),
                  gas:1000000,
                  from: playerAddress}; // Should return later for player at the end of game

    console.log("Top Up amount:",typeof(topUpAmount_eth),topUpAmount_eth)

    await contractInstance.methods.playerTopUp_eth(topUpAmount_eth).send(config)
      .on('transactionHash', function(hash){
        console.log("tx hash :",hash);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("confirmation Number:",confirmationNumber);
      })
      .on('receipt', function(receipt){
        console.log("receipt: ",receipt);
        refreshDisplay();
      })
};

async function refreshDisplay() {
  console.log("===== refreshDisplay =====")
  await fetchAccountInfo()
  await refreshPlayerInfo()
}

async function fetchAccountInfo () {
    console.log("* * * fetchAccountInfo * * *")
    console.log("Before fetchAccountInfo playerAddress = ",playerAddress)
    let accounts = await web3.eth.getAccounts();
    playerAddress = accounts[0];

    $('#Player_address').text(playerAddress);
    console.log("Player Account =",playerAddress)

    let balance = await web3.eth.getBalance(playerAddress);
    console.log("Player Balance =",web3.utils.fromWei(balance, "ether") + " ETH")
    $('#Player_balance').text(web3.utils.fromWei(balance, "ether") + " ETH");

    let contract_balance = await web3.eth.getBalance(contractAddress);
    console.log('#Contract_balance', web3.utils.fromWei(contract_balance, "ether") + " ETH")
    $('#Contract_balance').text(web3.utils.fromWei(contract_balance, "ether") + " ETH");

    console.log('#Contract_address', contractAddress)
    $('#Contract_address').text(contractAddress);
    console.log("After fetchAccountInfo playerAddress = ",playerAddress)
}

function placeBet1() {
  placeBet(1)
}

function placeBet0() {
  placeBet(0)
}

async function placeBet(betChoice) {
      var betAmountEth = $("#betAmount_input").val();
      if (betAmountEth != Math.round(betAmountEth)) {
            alert("Not valid coin amount!");
            return;
          }

      await refreshDisplay()
      console.log("Button clicked -> Place New Bet ",typeof(betChoice),betChoice)
      console.log("BetAmount:",typeof(parseInt(betAmountEth)),betAmountEth,"eth")

      await contractInstance.methods.createMyBet(betChoice,parseInt(betAmountEth))
        .send({gas:1000000, from: playerAddress})
        .on('transactionHash', function(hash){
          console.log("tx hash :",hash);
        })
        .on('confirmation', function(confirmationNumber, receipt){
            console.log("confirmation Number:",confirmationNumber);
        })
        .on('receipt', function(receipt){
          console.log("receipt: ",receipt);
          refreshDisplay();
        })
  }

async function flipNow(){
      await refreshDisplay()
      console.log("... Calling Flip Contract..");

      result = await contractInstance.methods.playerTossCoin()
            //.call({from: contractAddress, gas: 100000})
            .send({gas:1000000, from: playerAddress})

      console.log("Bet result:",result)

      await refreshDisplay()

}


async function refreshPlayerInfo(){

  betHistory = await contractInstance.methods.getPlayerHistory().call({gas:1000000, from: playerAddress});
  console.log("playerBalanceNow =",betHistory)

  $("#Player_totalBalance").text(weiToEther(betHistory[0]));
  $("#Player_totalTopUp").text(weiToEther(betHistory[1]));
  $("#Player_totalWithdrawn").text(weiToEther(betHistory[2]));
  $("#Player_totalSpentAmount").text(weiToEther(betHistory[3]));
  $("#Player_totalWinAmount").text(weiToEther(betHistory[4]));
  $("#Player_totalGames").text(betHistory[5]);
  $("#Player_totalWins").text(betHistory[6]);
  $("#Player_lastWinAmount").text(weiToEther(betHistory[7]));

  console.log("Now calling getMyBet...")
  betList = await contractInstance.methods.getMyBet().call({gas:1000000, from: playerAddress});

  bet0 = betList[0]
  bet1 = betList[1]
  console.log("...updating bet status =",betList)
  console.log("Bet for 0: ",bet0)
  console.log("Bet for 1: ",bet1)
  $("#betAmount1_output").text(bet1);
  $("#betAmount0_output").text(bet0);

}
