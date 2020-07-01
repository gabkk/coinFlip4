
//web3.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var web3 = new Web3(Web3.givenProvider);

// CONTRACT VARIABLES - should be sync with COntract values
var BET_RANGE_MIN = 0;
var BET_RANGE_MAX = 99;
var CHIP_TO_WEI = 10**15; //1 chips = 1 eth - Can be parametric
var CHIP_TO_ETH = CHIP_TO_WEI/10**18;
var BET_MIN_AMOUNT_WEI = CHIP_TO_WEI ; //All Amount are in ETH
var BET_WIN_RATE = 190

var CONTRACT_INSTANCE;
var ACTIVE_ADDRESS;
var CONTRACT_ADDRESS = "0x3fccba31735f047ff3eba443cab828627da39b6a";
var OWNER_ADDRESS = "";
var BET_LIST_NUMBERS = [];
var BET_LIST_AMOUNTS = []; //Amount Eth betted for 0 and 1
var BETTING_LOCKED;

$(document).ready(function() {
    window.ethereum.enable().then(async function(accounts){
      await getActiveAddress()
      CONTRACT_INSTANCE = new web3.eth.Contract(window.abi, CONTRACT_ADDRESS , {gas:1000000, from: ACTIVE_ADDRESS});
      console.log("CONTRACT_INSTANCE :",CONTRACT_INSTANCE);
      refreshDisplay();
    });

    $("#add_bet_button").click(addBet);
    $("#cancel_all_button").click(cancelBet);
    $("#Play_button").click(flipNow);
    $("#topUp_button").click(playerTopUp_eth);
    $("#FundUp_button").click(ownerFundUp_eth);
    $("#Submit_button").click(submitBet);
    $("#PlayerWithdrawAll_button").click(PlayerWithdrawAll);
    $("#OwnerWithdrawAll_button").click(OwnerWithdrawAll);
    $("#CheckResult_button").click(checkResult);

    window.ethereum.on('accountsChanged', async function(accounts) {
        console.log("Account changed")
        refreshDisplay();
    });
});

async function checkResult() {
  console.log("Sending check result request...")
  await CONTRACT_INSTANCE.methods.payOutCheckRequest(ACTIVE_ADDRESS)
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


function cancelBet() {
    BET_LIST_NUMBERS = []
    BET_LIST_AMOUNTS = []
    console.log("BETTING_LOCKED ",BETTING_LOCKED)
    refreshLocalBetList()
}

function validBetNumber(_num) {
  num = parseFloat(_num)

  if ((num < BET_RANGE_MIN) || (num > BET_RANGE_MAX)) {
    alert("bet number out of range")
    return false
  }

  if (num != Math.round(num)) {
    alert("bet number should be interger from ",BET_RANGE_MIN," to ",BET_RANGE_MAX)
    return false
  }
  return true
}

function validBetAmount(_num) { //chips
  num = parseFloat(_num)

  if (num < 1) {
    alert(" bet amount shold be interger and higher 0 ")
    return false
  }

  if (num != Math.round(num)) {
    alert(" bet amount shold be interger and higher 0 ")
    return false
  }
  return true
}

function addBet() {
  var betAmount_chip = $("#betAmount_input").val();
  var betNumber = $("#betNumber_input").val();

  if (validBetNumber(betNumber) && validBetAmount(betAmount_chip) ){
    BET_LIST_NUMBERS.push(betNumber)
    BET_LIST_AMOUNTS.push(parseInt(betAmount_chip))
  }
  refreshDisplay()
}

async function submitBet() { //This will place bet to Contract
      //If more than 2 choices => Should send all choices in one Call;
      //For later upgradability to multi choices, will send both 1 and 0 bets..
      //Later will Merge Place Bet and Toss Coin into One Function call

      await getActiveAddress()

      console.log("Button clicked -> Place New Bet to blockchain...")
      console.log("Bet Numbers:",BET_LIST_NUMBERS)
      console.log("Bet Amounts:",BET_LIST_AMOUNTS)

      await CONTRACT_INSTANCE.methods.createMyBet(BET_LIST_NUMBERS, BET_LIST_AMOUNTS) //Does Solidity accept Array as input?
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
          cancelBet()
        })
};


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
          OWNER_ADDRESS = ACTIVE_ADDRESS; //Only Owner is allowed to WITHDRAW
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

function chipToWei(chip) {
  return (CHIP_TO_WEI * chip)
}

async function ownerFundUp_eth() {
    var fundUpAmount_eth = $("#FundUp_input").val();
    await getActiveAddress()
    var config = {value: web3.utils.toWei(fundUpAmount_eth.toString(), "ether"),
                  gas:1000000, from: ACTIVE_ADDRESS}; // Should return later for player at the end of game

    console.log("Fund Up amount:",typeof(fundUpAmount_eth),fundUpAmount_eth)

    fundUpAmount_chip = fundUpAmount_eth / CHIP_TO_ETH
    await CONTRACT_INSTANCE.methods.ownerFundUp_chip(fundUpAmount_chip).send(config)
      .on('transactionHash', function(hash){
        console.log("tx hash :",hash);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("confirmation Number:",confirmationNumber);
          OWNER_ADDRESS = ACTIVE_ADDRESS; //Only Owner is allowed to fund up
      })
      .on('receipt', function(receipt){
        console.log("receipt: ",receipt);
        refreshDisplay();
      })
};

async function playerTopUp_eth() {
    var topUpAmount_eth = $("#topUp_input").val();
    await getActiveAddress()
    var config = {value: web3.utils.toWei(topUpAmount_eth.toString(), "ether"),
                  gas:1000000,
                  from: ACTIVE_ADDRESS}; // Should return later for player at the end of game

    console.log("Top Up amount:",typeof(topUpAmount_eth),topUpAmount_eth)

    topUpAmount_chip = topUpAmount_eth/CHIP_TO_ETH
    await CONTRACT_INSTANCE.methods.playerTopUp_chip(topUpAmount_chip).send(config)
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
    if (OWNER_ADDRESS!= "" ) {
      owner_balance = await web3.eth.getBalance(OWNER_ADDRESS);
      $("#Owner_address").text(OWNER_ADDRESS);
      $("#Owner_balance").text(weiToEther(owner_balance));
    }
    contract_balance = await web3.eth.getBalance(CONTRACT_ADDRESS);
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

function weiToEth_ar(wei_ar) {
      eth_ar = []
      for (x=0; x<wei_ar.length; x++) {
        eth_ar.push(web3.utils.fromWei(wei_ar[x].toString(),"ether"))
      }
      return eth_ar
}

async function refreshOnChainBetInfo() {

      //get bet List from contract
      console.log("Now calling getMyBet...")
      betList = await CONTRACT_INSTANCE.methods.getMyBet().call({gas:1000000, from: ACTIVE_ADDRESS});

      ONCHAIN_BET_LIST_NUMBERS = betList[0]
      ONCHAIN_BET_LIST_AMOUNTS = betList[1]
      BETTING_LOCKED = betList[2]
      //BETTING ID= betList[3]

      console.log("...updating on chain bet status =",betList)
      console.log("On Chain Bet Numbers: ",ONCHAIN_BET_LIST_NUMBERS)
      console.log("On Chain Bet Amounts(chips): ",ONCHAIN_BET_LIST_AMOUNTS)

      $("#onchain_betNumbers_output").text(ONCHAIN_BET_LIST_NUMBERS);
      $("#onchain_betAmounts_output").text(ONCHAIN_BET_LIST_AMOUNTS);
}


function refreshLocalBetList() {
    console.log("...updating bet status =")
    console.log("Bet NUMBERS",BET_LIST_NUMBERS)
    console.log("Bet AMOUNTS",BET_LIST_AMOUNTS,"(chips)")
    if (!BETTING_LOCKED) {
      $("#betNumbers_output").text(BET_LIST_NUMBERS);
      $("#betAmounts_output").text(BET_LIST_AMOUNTS,"(chips)");
    }

    $("#chip_to_ether").text(CHIP_TO_ETH.toString()+" ETH");
}


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
