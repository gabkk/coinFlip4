var abi =  [
  {
    "constant": true,
    "inputs": [],
    "name": "_contractBalance_",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "playerHistory",
    "outputs": [
      {
        "name": "totalBalance",
        "type": "uint256"
      },
      {
        "name": "totalTopUp",
        "type": "uint256"
      },
      {
        "name": "totalWithdrawn",
        "type": "uint256"
      },
      {
        "name": "totalSpentAmount",
        "type": "uint256"
      },
      {
        "name": "totalWinAmount",
        "type": "uint256"
      },
      {
        "name": "totalGames",
        "type": "uint256"
      },
      {
        "name": "totalWins",
        "type": "uint256"
      },
      {
        "name": "lastWinAmount",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "_totalAllPlayerBalance_",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "activeBet",
    "outputs": [
      {
        "name": "waitingResult",
        "type": "bool"
      },
      {
        "name": "waitingId",
        "type": "bytes32"
      },
      {
        "name": "paidOut",
        "type": "bool"
      },
      {
        "name": "lastResult",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "BET_RANGE_MIN",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "latestNumber",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "BET_RANGE_MAX",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "BET_MIN_AMOUNT_WEI",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "betNumbers",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "name": "betAmounts_chip",
        "type": "uint256[]"
      },
      {
        "indexed": false,
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
        "name": "playerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "winAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
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
        "name": "noticeString",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "noticeValue",
        "type": "uint256"
      }
    ],
    "name": "notice",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "playerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "Id",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "randomNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "generatedRandomNumber",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "notice",
        "type": "string"
      }
    ],
    "name": "LogNewProvableQuery",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "description",
        "type": "string"
      }
    ],
    "name": "proofFailed",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "random",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_queryId",
        "type": "bytes32"
      },
      {
        "name": "_result",
        "type": "string"
      },
      {
        "name": "_proof",
        "type": "bytes"
      }
    ],
    "name": "__callback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "getRandom100",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "topUp_chip",
        "type": "uint256"
      }
    ],
    "name": "ownerFundUp_chip",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "topUp_chip",
        "type": "uint256"
      }
    ],
    "name": "playerTopUp_chip",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayerHistory",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "get_totalAllPlayerBalance_",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "contractPlayableFund",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "playerPlayableFund",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "betNumbers",
        "type": "uint256[]"
      },
      {
        "name": "betAmount_chip",
        "type": "uint256[]"
      }
    ],
    "name": "createMyBet",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getMyBet",
    "outputs": [
      {
        "name": "",
        "type": "uint256[]"
      },
      {
        "name": "",
        "type": "uint256[]"
      },
      {
        "name": "",
        "type": "bool"
      },
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "winWei",
        "type": "uint256"
      }
    ],
    "name": "getWinAmountWei",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "playerTossCoin",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "ownerWithdrawAll",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "playerWithdrawAll",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
