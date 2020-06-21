
//web3.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var web3 = new Web3(Web3.givenProvider);

var contractInstance;
var playerAddress;
var contractAddress = "0x125B46ACc66EF576AdF5d54a37A84263C34CE88C";

$(document).ready(function() {
    window.ethereum.enable().then(async function(accounts){
      await fetchAccountInfo()
      contractInstance = new web3.eth.Contract(window.abi, contractAddress , {from: playerAddress});
      console.log("contractInstance :",contractInstance);

      //get and display Player's balance
      let playerBalanceNow = await contractInstance.methods.getPlayerHistory().call({gas:100000});
      console.log(playerBalanceNow)
      displayPlayerBalanceInfo(playerBalanceNow)
    });
    $("#place_bet1_button").click(placeBet1);
    $("#place_bet0_button").click(placeBet0);
    $("#play_button").click(flipNow);
    $("#topUp_button").click(playerTopUp_eth);
    $("#FundUp_button").click(ownerFundUp_eth);
    window.ethereum.on('accountsChanged', async function(accounts) {
      await fetchAccountInfo()
    });
});

function weiToEther(balance) {
    return web3.utils.fromWei(balance, "ether") + " ETH"
}

async function ownerFundUp_eth() {
    var fundUpAmount_eth = $("#FundUp_input").val();

    var config = {value: web3.utils.toWei(fundUpAmount_eth, "ether"),
                  gas:100000, from: playerAddress}; // Should return later for player at the end of game

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
      });

    let ContractBalanceNow = await contractInstance.methods.getContractBalance().call({gas:100000});
    console.log(ContractBalanceNow)
    await fetchAccountInfo()
};

async function playerTopUp_eth() {
    var topUpAmount_eth = $("#topUp_input").val();

    var config = {value: web3.utils.toWei(topUpAmount_eth, "ether"),
                  gas:100000,
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
      })
      .then(async function() {
        let playerBalanceNow = await contractInstance.methods.getPlayerHistory().call({gas:100000});
        console.log("playerBalanceNow =",playerBalanceNow)
        displayPlayerBalanceInfo(playerBalanceNow)
      });
};

function displayPlayerBalanceInfo(playerBalanceNow) {
    $("#Player_totalBalance").text(weiToEther(playerBalanceNow[0]));
    $("#Player_totalTopUp").text(weiToEther(playerBalanceNow[1]));
    $("#Player_totalWithdrawn").text(weiToEther(playerBalanceNow[2]));
    $("#Player_totalSpentAmount").text(weiToEther(playerBalanceNow[3]));
    $("#Player_totalWinAmount").text(weiToEther(playerBalanceNow[4]));
    $("#Player_totalGames").text(playerBalanceNow[5]);
    $("#Player_totalWins").text(playerBalanceNow[6]);
    $("#Player_lastWinAmount").text(weiToEther(playerBalanceNow[7]));
  };

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

  await fetchAccountInfo()

  console.log("Button clicked -> Place Bet ",typeof(betChoice),betChoice)
  console.log("BetAmount:",typeof(betAmountEth),betAmountEth,"eth")

  await contractInstance.methods.createMyBet(betChoice,betAmountEth)
    .call({gas:100000, from: contractAddress})
    /*
    .on('transactionHash', function(hash){
      console.log("tx hash :",hash);
    })
    .on('confirmation', function(confirmationNumber, receipt){
        console.log("confirmation Number:",confirmationNumber);
    })
    .on('receipt', function(receipt){
      console.log("receipt: ",receipt);
    })
    */

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

      result = await contractInstance.methods.playerTossCoin()
            //.call({from: contractAddress, gas: 100000})
            .call({gas:100000})

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
  betAmount[1] = web3.utils.fromWei(betAmount[1].toString(), "ether")
  betAmount[0] = web3.utils.fromWei(betAmount[0].toString(), "ether")
  betAmount[1] = betAmount[1].toString()+" ETH"
  betAmount[0] = betAmount[0].toString()+" ETH"
  console.log("typeof(betAmount[1]) =",typeof(betAmount[1]))
  $("#betAmount1_output").text(betAmount[1]);
  $("#betAmount0_output").text(betAmount[0]);

}
