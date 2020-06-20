var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var playerAddress;

var contractAddress = "0x3FdC296E7622e548d130fe0ac2531A1899430B58";

// Is there is an injected web3 instance?
if (typeof web3 !== 'undefined') {
  //App.web3Provider = web3.currentProvider;
  web3 = new Web3(web3.currentProvider);
} else {
  // If no injected web3 instance is detected, fallback to Ganache.
  //App.web3Provider = new web3.providers.HttpProvider('http://127.0.0.1:7545');
  web3 = new Web3(App.web3Provider);
}

$(document).ready(function() {
    window.ethereum.enable().then(async function(accounts){
      await fetchAccountInfo()
      contractInstance = new web3.eth.Contract(window.abi, contractAddress , {from: playerAddress});
      console.log("contractInstance :",contractInstance);

      //get and display Player's balance
      let playerBalanceNow = await contractInstance.methods.playerReport(playerAddress).call({gas:100000});
      console.log(playerBalanceNow)
      displayPlayerBalanceInfo(playerBalanceNow)
    });
    $("#place_bet1_button").click(placeBet1);
    $("#place_bet0_button").click(placeBet0);
    $("#play_button").click(flipNow);
    $("#topUp_button").click(topUpNow);
});

function weiToEther(balance) {
    return window.web3.utils.fromWei(balance, "ether") + " ETH"
}

async function topUpNow() {
    var topUpAmount = $("#topUp_input").val();

    var config = {value: web3.utils.toWei(topUpAmount, "ether"),
                  gas:100000,
                  from: playerAddress}; // Should return later for player at the end of game

    console.log("Top Up amount:",typeof(topUpAmount),topUpAmount)

    await contractInstance.methods.topUp().send(config)
      .on('transactionHash', function(hash){
        console.log("tx hash :",hash);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("confirmation Number:",confirmationNumber);
      })
      .on('receipt', function(receipt){
        console.log("receipt: ",receipt);
      });

    let playerBalanceNow = await contractInstance.methods.playerReport(playerAddress).call({gas:100000});
    console.log(playerBalanceNow)
    displayPlayerBalanceInfo(playerBalanceNow)
    /*
    playerHistory[playerAddress].totalBalance,
                playerHistory[playerAddress].totalTopUp,
                playerHistory[playerAddress].totalSpentAmount,
                playerHistory[playerAddress].totalWinAmount,
                playerHistory[playerAddress].totalGames,
                playerHistory[playerAddress].totalWins,
                playerHistory[playerAddress].lastWinAmount
    */
};

function displayPlayerBalanceInfo(playerBalanceNow) {
    $("#Player_totalBalance").text(weiToEther(playerBalanceNow[0]));
    $("#Player_totalTopUp").text(weiToEther(playerBalanceNow[1]));
    $("#Player_totalSpentAmount").text(weiToEther(playerBalanceNow[2]));
    $("#Player_totalWinAmount").text(weiToEther(playerBalanceNow[3]));
    $("#Player_totalGames").text(playerBalanceNow[4]);
    $("#Player_totalWins").text(playerBalanceNow[5]);
    $("#Player_lastWinAmount").text(weiToEther(playerBalanceNow[6]));
  };

async function fetchAccountInfo () {
    let accounts = await window.web3.eth.getAccounts();
    playerAddress = accounts[0];

    $('#Player_address').text(playerAddress);
    console.log("Player Account =",playerAddress)

    let balance = await window.web3.eth.getBalance(playerAddress);
    console.log("Player Balance =",window.web3.utils.fromWei(balance, "ether") + " ETH")
    $('#Player_balance').text(window.web3.utils.fromWei(balance, "ether") + " ETH");

    let contract_balance = await window.web3.eth.getBalance(contractAddress);
    console.log('#Contract_balance', window.web3.utils.fromWei(contract_balance, "ether") + " ETH")
    $('#Contract_balance').text(window.web3.utils.fromWei(contract_balance, "ether") + " ETH");

    console.log('#Contract_address', contractAddress)
    $('#Contract_address').text(contractAddress);
}

function placeBet1() {
  placeBet(1)
}

function placeBet0() {
  placeBet(0)
}

async function placeBet(betChoice) {

  console.log("Place Bet ",betChoice,": button clicked...")
  var betAmount = $("#betAmount_input").val();
  console.log("type of betAmount:",typeof(betAmount))
  console.log("Before fetchAccountInfo playerAddress = ",playerAddress)
  await fetchAccountInfo()
  console.log("After fetchAccountInfo playerAddress = ",playerAddress)

  if (parseFloat(betAmount) <= 0.001) {
    alert("Not valid coin amount!");
    return;
  }

  console.log("Calling Create Bet:",typeof(betChoice),betChoice)

  //Should check here if player balance is enough and deduct balance before creating bet
  //...
  await contractInstance.methods
    .createBetForPlayer(betChoice, betAmount, playerAddress)
    .send({gas:100000})
    .on('transactionHash', function(hash){
      console.log("tx hash :",hash);
    })
    .on('confirmation', function(confirmationNumber, receipt){
        console.log("confirmation Number:",confirmationNumber);
    })
    .on('receipt', function(receipt){
      console.log("receipt: ",receipt);
    })

  await fetchAccountInfo()

  console.log("Now calling getMyBet...")

  betHistory = await contractInstance.methods
        .getPlayerBet(playerAddress)
        .call({gas:100000})

  console.log("Bet history:",betHistory)
  displayBetInfo(betHistory);
}

async function flipNow(){
      console.log("... Calling Flip Contract..");

      result = await contractInstance.methods.playerTossCoin(playerAddress)
            //.call({from: contractAddress, gas: 100000})
            .call()

      console.log("Bet result:",result)

      await fetchAccountInfo()

      betHistory =  await contractInstance.methods
            .getPlayerBet(playerAddress)
            .call({gas:100000, from: playerAddress})

      displayBetInfo(betHistory);
}

function displayBetInfo(betHistory){
  betChoice_ar = betHistory[0]
  betAmount_ar = betHistory[1]
  console.log("...updating bet status...")
  console.log("Bet array: ",betChoice_ar)
  console.log("Bet amount array: ",betAmount_ar)
  var betAmount = [0,0]
  for (x=0; x<betChoice_ar.length; x++) {
    if (betChoice_ar[x]=="1") {
      betAmount[1] += parseInt(betAmount_ar[x])
    }
    else if (betChoice_ar[x]=="0") {
      betAmount[0] += parseInt(betAmount_ar[x])
    }
  }
  console.log("typeof(betAmount[1]) =",typeof(betAmount[1]))
  betAmount[1] = window.web3.utils.fromWei(betAmount[1].toString(), "ether")
  betAmount[0] = window.web3.utils.fromWei(betAmount[0].toString(), "ether")
  betAmount[1] = betAmount[1].toString()+" ETH"
  betAmount[0] = betAmount[0].toString()+" ETH"
  console.log("typeof(betAmount[1]) =",typeof(betAmount[1]))
  $("#betAmount1_output").text(betAmount[1]);
  $("#betAmount0_output").text(betAmount[0]);

}
