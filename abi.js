var abi =[
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "betAmount",
       "type": "uint256"
     },
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "winAmount",
       "type": "uint256"
     },
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "result",
       "type": "uint256"
     }
   ],
   "name": "betFinished",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "betChoice",
       "type": "uint256"
     },
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "betAmount",
       "type": "uint256"
     },
     {
       "indexed": false,
       "internalType": "address",
       "name": "playerAddress",
       "type": "address"
     }
   ],
   "name": "newBetCreated",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": false,
       "internalType": "string",
       "name": "noticeString",
       "type": "string"
     },
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "noticeValue",
       "type": "uint256"
     }
   ],
   "name": "notice",
   "type": "event"
 },
 {
   "inputs": [],
   "name": "_contractBalance_",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "_totalAllPlayerBalance_",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "owner",
   "outputs": [
     {
       "internalType": "address",
       "name": "",
       "type": "address"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [
     {
       "internalType": "address",
       "name": "",
       "type": "address"
     }
   ],
   "name": "playerHistory",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "totalBalance",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "totalTopUp",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "totalWithdrawn",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "totalSpentAmount",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "totalWinAmount",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "totalGames",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "totalWins",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "lastWinAmount",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [
     {
       "internalType": "uint256",
       "name": "eth",
       "type": "uint256"
     }
   ],
   "name": "eth2Wei",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "pure",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [
     {
       "internalType": "uint256",
       "name": "topUp_eth",
       "type": "uint256"
     }
   ],
   "name": "ownerFundUp_eth",
   "outputs": [],
   "stateMutability": "payable",
   "type": "function",
   "payable": true
 },
 {
   "inputs": [
     {
       "internalType": "uint256",
       "name": "topUp_eth",
       "type": "uint256"
     }
   ],
   "name": "playerTopUp_eth",
   "outputs": [],
   "stateMutability": "payable",
   "type": "function",
   "payable": true
 },
 {
   "inputs": [],
   "name": "getPlayerHistory",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "getContractBalance",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "get_totalAllPlayerBalance_",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "contractPlayableFund",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "playerPlayableFund",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [
     {
       "internalType": "uint256",
       "name": "betChoice",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "betAmount_eth",
       "type": "uint256"
     }
   ],
   "name": "createMyBet",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "getMyBet",
   "outputs": [
     {
       "internalType": "uint256[]",
       "name": "",
       "type": "uint256[]"
     },
     {
       "internalType": "uint256[]",
       "name": "",
       "type": "uint256[]"
     }
   ],
   "stateMutability": "view",
   "type": "function",
   "constant": true
 },
 {
   "inputs": [],
   "name": "playerTossCoin",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     },
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "ownerWithdrawAll",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "playerWithdrawAll",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "nonpayable",
   "type": "function"
 }
];
