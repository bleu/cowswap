export const FACTORY_ABI = [
  {
    type: 'function',
    name: 'executeHooks',
    inputs: [
      {
        name: 'calls',
        type: 'tuple[]',
        internalType: 'struct Call[]',
        components: [
          {
            name: 'target',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'value',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'allowFailure',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isDelegateCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'nonce',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const SHED_ABI = [
  {
    type: 'function',
    name: 'executeHooks',
    inputs: [
      {
        name: 'calls',
        type: 'tuple[]',
        internalType: 'struct Call[]',
        components: [
          {
            name: 'target',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'value',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'allowFailure',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isDelegateCall',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'nonce',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const PROXY_CREATION_CODE = '0x'

// TODO: update this once the contract is deployed
export const COW_SHED_FACTORY = '0xBB64Eb2cE6C4Fecc3EE0b18A415c536b147d6727'
export const COW_SHED_IMPLEMENTATION = '0x0CCb8fDAA217943D52Db003703b75b66523295a1'
export const proxyInitCode =
  '0x60a034608e57601f61037138819003918201601f19168301916001600160401b038311848410176093578084926040948552833981010312608e57604b602060458360a9565b920160a9565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc556040516102b490816100bd8239608051818181608f01526101720152f35b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203608e5756fe60806040526004361015610018575b3661019457610194565b6000803560e01c908163025b22bc1461003b575063f851a4400361000e5761010d565b3461010a5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261010a5773ffffffffffffffffffffffffffffffffffffffff60043581811691828203610106577f0000000000000000000000000000000000000000000000000000000000000000163314600014610101577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8280a280f35b61023d565b8380fd5b80fd5b346101645760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112610164576020610146610169565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b600080fd5b333003610101577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101ef575b1561023d5760046040517ff92ee8a9000000000000000000000000000000000000000000000000000000008152fd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000006000351614156101c0565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546000808092368280378136915af43d82803e1561027a573d90f35b3d90fdfea264697066735822122031e6c23049bed9e91b6914ec3a10b4ead2d855cd933d50e8e3635e4e999fe02e64736f6c63430008190033'
