var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var activeAccount;

var contractAddress = "0x64f36aa8d0899913738314Bea50ae4aA2c3E8F2E";

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
      await displayAccountInfo()
      contractInstance = new web3.eth.Contract(window.abi, contractAddress , {from: activeAccount});
      console.log("contractInstance :",contractInstance);

    });
    $("#place_bet1_button").click(placeBet1);
    $("#place_bet0_button").click(placeBet0);
    $("#play_button").click(flipNow);
    $("#topUp_button").click(topUpNow);
});

function topUpNow() {
    var topUpAmount = $("#topUp_input").val();
    var config = {value: web3.utils.toWei(topUpAmount, "ether"),
                  gas:100000};

    console.log("Top Up amount:",typeof(topUpAmount),topUpAmount)

    contractInstance.methods.topUp().send(config)
      .on('transactionHash', function(hash){
        console.log("tx hash :",hash);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("confirmation Number:",confirmationNumber);
      })
      .on('receipt', function(receipt){
        console.log("receipt: ",receipt);
      })
}

async function displayAccountInfo () {
    let accounts = await window.web3.eth.getAccounts();
    activeAccount = accounts[0];

    $('#Player_address').text(activeAccount);
    console.log("Player Account =",activeAccount)

    let balance = await window.web3.eth.getBalance(activeAccount);
    console.log("Player Balance =",window.web3.utils.fromWei(balance, "ether") + " ETH")
    $('#Player_balance').text(window.web3.utils.fromWei(balance, "ether") + " ETH");

    let contract_balance = await window.web3.eth.getBalance(contractAddress);
    console.log('#Contract_balance', window.web3.utils.fromWei(contractAddress, "ether") + " ETH")
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
  console.log("Before displayAccountInfo activeAccount = ",activeAccount)
  await displayAccountInfo()
  console.log("After displayAccountInfo activeAccount = ",activeAccount)

  if (parseFloat(betAmount) <= 0.001) {
    alert("Not valid coin amount!");
    return;
  }

  var config = {value: web3.utils.toWei(betAmount, "ether"),
                gas:100000};

  console.log("Calling Create Bet:",typeof(betChoice),betChoice)

  await contractInstance.methods.createBet(betChoice).send(config)
    .on('transactionHash', function(hash){
      console.log("tx hash :",hash);
    })
    .on('confirmation', function(confirmationNumber, receipt){
        console.log("confirmation Number:",confirmationNumber);
    })
    .on('receipt', function(receipt){
      console.log("receipt: ",receipt);
    })

  await displayAccountInfo()

  console.log("Now calling getMyBet...")

  betHistory = await contractInstance.methods
        .getMyBet()
        .call({gas:100000})

  console.log("Bet history:",betHistory)
  displayBetInfo(betHistory);
}

async function flipNow(){
      console.log("... Calling Flip Contract..");

      await contractInstance.methods.FlipNPayOut(activeAccount).call({from: contractAddress, gas: 100000})

            .on('transactionHash', function(hash){
              console.log("tx hash :",hash);
            })
            .on('confirmation', function(confirmationNumber, receipt){
                console.log("confirmation Number:",confirmationNumber);
            })
            .on('receipt', function(receipt){
              console.log("receipt: ",receipt);
            })

      //console.log("Bet result:",result)

      await displayAccountInfo()

      //betHistory =
      await contractInstance.methods
            .getMyBet()
            .call({gas:100000, from: activeAccount})

      //displayBetInfo(betHistory);
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
