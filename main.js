
//web3.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var web3 = new Web3(Web3.givenProvider);

var CONTRACT_INSTANCE;
var ACTIVE_ADDRESS;
var CONTRACT_ADDRESS = "0x3Aae9dd58057e9F409E85f8A7750312E99a7508C";
var OWNER_ADDRESS;
var BET_LIST_AMOUNT = [0,0]; //Amount Eth betted for 0 and 1
var BETTING_LOCKED;

$(document).ready(function() {
    window.ethereum.enable().then(async function(accounts){
      await getActiveAddress()
      CONTRACT_INSTANCE = new web3.eth.Contract(window.abi, CONTRACT_ADDRESS , {gas:1000000, from: ACTIVE_ADDRESS});
      console.log("CONTRACT_INSTANCE :",CONTRACT_INSTANCE);
      refreshDisplay();

    });

    $("#place_bet1_button").click(placeBet1);
    $("#place_bet0_button").click(placeBet0);
    $("#Play_button").click(flipNow);
    $("#topUp_button").click(playerTopUp_eth);
    $("#FundUp_button").click(ownerFundUp_eth);
    $("#Submit_button").click(placeBet);
    $("#PlayerWithdrawAll_button").click(PlayerWithdrawAll);
    $("#OwnerWithdrawAll_button").click(OwnerWithdrawAll);

    window.ethereum.on('accountsChanged', async function(accounts) {
        console.log("Account changed")
        refreshDisplay();
    });
});

function lockBetting() {
  BETTING_LOCKED = true;
}

function openBetting() {
  BETTING_LOCKED = false;
}

async function OwnerWithdrawAll() {
  console.log("Sending owner's withdraw all request...")
  await CONTRACT_INSTANCE.methods.ownerWithdrawAll()
      .send({gas:1000000, from: ACTIVE_ADDRESS})
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

async function PlayerWithdrawAll() {
  console.log("Sending owner's withdraw all request...")
  await CONTRACT_INSTANCE.methods.playerWithdrawAll()
      .send({gas:1000000, from: ACTIVE_ADDRESS})
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

function weiToEther(balance) {
    return web3.utils.fromWei(balance, "ether") + " ETH"
}

async function ownerFundUp_eth() {
    var fundUpAmount_eth = $("#FundUp_input").val();

    var config = {value: web3.utils.toWei(fundUpAmount_eth, "ether"),
                  gas:1000000, from: ACTIVE_ADDRESS}; // Should return later for player at the end of game

    console.log("Fund Up amount:",typeof(fundUpAmount_eth),fundUpAmount_eth)

    await CONTRACT_INSTANCE.methods.ownerFundUp_eth(fundUpAmount_eth).send(config)
      .on('transactionHash', function(hash){
        console.log("tx hash :",hash);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("confirmation Number:",confirmationNumber);
      })
      .on('receipt', function(receipt){
        console.log("receipt: ",receipt);
        OWNER_ADDRESS = ACTIVE_ADDRESS; //Only Owner is allowed to fund up
        refreshDisplay();
      })
};

async function playerTopUp_eth() {
    var topUpAmount_eth = $("#topUp_input").val();

    var config = {value: web3.utils.toWei(topUpAmount_eth, "ether"),
                  gas:1000000,
                  from: ACTIVE_ADDRESS}; // Should return later for player at the end of game

    console.log("Top Up amount:",typeof(topUpAmount_eth),topUpAmount_eth)

    await CONTRACT_INSTANCE.methods.playerTopUp_eth(topUpAmount_eth).send(config)
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
  await getActiveAddress()

  refreshOnChainBetInfo()

  refreshPlayerInfo()

  refreshLocalBetList()

  refreshOwnerInfo()
}

async function getActiveAddress() {
    console.log("* * * getActiveAddress * * *")
    console.log("Before getActiveAddress ACTIVE_ADDRESS = ",ACTIVE_ADDRESS)
    let accounts = await web3.eth.getAccounts();
    console.log("After getActiveAddress ACTIVE_ADDRESS = ",ACTIVE_ADDRESS)
    ACTIVE_ADDRESS = accounts[0];
}

async function refreshOwnerInfo() {
    owner_balance = await web3.eth.getBalance(OWNER_ADDRESS);
    contract_balance = await web3.eth.getBalance(CONTRACT_ADDRESS);
    $("#Owner_address").text(OWNER_ADDRESS);
    $("#Owner_balance").text(weiToEther(owner_balance));
    $('#Contract_balance').text(web3.utils.fromWei(contract_balance, "ether") + " ETH");
    $('#Contract_address').text(CONTRACT_ADDRESS);
}

async function refreshPlayerInfo(){

      betHistory = await CONTRACT_INSTANCE.methods.getPlayerHistory().call({gas:1000000, from: ACTIVE_ADDRESS});
      balance = await web3.eth.getBalance(ACTIVE_ADDRESS);

      $('#Player_address').text(ACTIVE_ADDRESS);
      $('#Player_balance').text(web3.utils.fromWei(balance, "ether") + " ETH");
      $("#Player_totalBalance").text(weiToEther(betHistory[0]));
      $("#Player_totalTopUp").text(weiToEther(betHistory[1]));
      $("#Player_totalWithdrawn").text(weiToEther(betHistory[2]));
      $("#Player_totalSpentAmount").text(weiToEther(betHistory[3]));
      $("#Player_totalWinAmount").text(weiToEther(betHistory[4]));
      $("#Player_totalGames").text(betHistory[5]);
      $("#Player_totalWins").text(betHistory[6]);
      $("#Player_lastWinAmount").text(weiToEther(betHistory[7]));
}

async function refreshOnChainBetInfo() {
      console.log("Now calling getMyBet...")
      //get bet List from contract
      betList = await CONTRACT_INSTANCE.methods.getMyBet().call({gas:1000000, from: ACTIVE_ADDRESS});

      bet0 = betList[0]
      bet1 = betList[1]
      console.log("...updating on chain bet status =",betList)
      console.log("On Chain Bet for 0: ",bet0)
      console.log("On Chain Bet for 1: ",bet1)
      $("#betAmount1_output").text(bet1);
      $("#betAmount0_output").text(bet0);
}

function refreshLocalBetList() {
    bet0 = BET_LIST_AMOUNT[0]
    bet1 = BET_LIST_AMOUNT[1]
    console.log("...updating bet status =",BET_LIST_AMOUNT)
    console.log("Bet for 0: ",BET_LIST_AMOUNT[0]+" ETH")
    console.log("Bet for 1: ",BET_LIST_AMOUNT[1]+" ETH")
    $("#betAmount1_output").text(BET_LIST_AMOUNT[1]+" ETH");
    $("#betAmount0_output").text(BET_LIST_AMOUNT[0]+" ETH");
}

function placeBet1() {
  placeBetToBrowser(1)
}

function placeBet0() {
  placeBetToBrowser(0)
}

function placeBetToBrowser(betChoice) {
  var betAmountEth = $("#betAmount_input").val();
  if (betAmountEth != Math.round(betAmountEth)) {
        alert("Not valid coin amount!");
        return;
      };
  if (betChoice!=1 && betChoice!=0) {
    alert("Not valid Bet");
    return;
  }
  BET_LIST_AMOUNT[betChoice] += parseInt(betAmountEth)
  refreshLocalBetList()
}

async function placeBet() { //This will place bet to Contract
      //If more than 2 choices => Should send all choices in one Call;
      //For later upgradability to multi choices, will send both 1 and 0 bets..
      //Later will Merge Place Bet and Toss Coin into One Function call

      await refreshDisplay()
      console.log("Button clicked -> Place New Bet to blockchain...")
      console.log("BetAmount 0:",typeof((BET_LIST_AMOUNT[0]),(BET_LIST_AMOUNT[0],"eth")))
      console.log("BetAmount 1:",typeof((BET_LIST_AMOUNT[1]),(BET_LIST_AMOUNT[1],"eth")))

      await CONTRACT_INSTANCE.methods.createMyBet(BET_LIST_AMOUNT) //Does Solidity accept Array as input?
        .send({gas:1000000, from: ACTIVE_ADDRESS})
        .on('transactionHash', function(hash){
          console.log("tx hash :",hash);
          lockBetting();
        })
        .on('confirmation', function(confirmationNumber, receipt){
            console.log("confirmation Number:",confirmationNumber);
        })
        .on('receipt', async function(receipt){
          console.log("receipt: ",receipt);
          await refreshDisplay();
          console.log("PRESS FLIP TO TOSS COIN AND GET RESULT....");
        })
};

async function flipNow(){
      await refreshDisplay()

      console.log("... Calling Flip Contract..");
      result = await CONTRACT_INSTANCE.methods.playerTossCoin()
            //.call({from: CONTRACT_ADDRESS, gas: 100000})
            .send({gas:1000000, from: ACTIVE_ADDRESS})
            .on('transactionHash', function(hash){
              console.log("tx hash :",hash);
              lockBetting();
            })
            .on('confirmation', function(confirmationNumber, receipt){
                console.log("confirmation Number:",confirmationNumber);
            })
            .on('receipt', async function(receipt){
              console.log("receipt: ",receipt);
            })
      console.log("Bet result:",result)
      await refreshDisplay() //Update all data
      openBetting();

}
