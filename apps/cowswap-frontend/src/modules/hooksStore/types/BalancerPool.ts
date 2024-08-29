export interface PoolsData {
  address: `0x${string}`
  chain: string
  protocolVersion: 1 | 2 | 3
  id: `0x${string}`
  name: string
  symbol: string
  type: string
  decimals: number
  userBalance: {
    totalBalance: `${number}`
    totalBalanceUsd: number
  }
  displayTokens: {
    address: `0x${string}`
    symbol: string
  }[]
}

export interface PoolData {
  id: `0x${string}`
  address: `0x${string}`
  decimals: number
  symbol: string
  type: string
  chain: string
  protocolVersion: 1 | 2 | 3
  userBalance: {
    totalBalance: `${number}`
    totalBalanceUsd: number
  }
  poolTokens: {
    id: `0x${string}`
    address: `0x${string}`
    name: string
    decimals: number
    symbol: string
    balance: number
  }[]
}
