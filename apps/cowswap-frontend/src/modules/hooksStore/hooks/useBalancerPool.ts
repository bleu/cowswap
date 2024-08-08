import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { gql, GraphQLClient } from 'graphql-request'
import useSWR from 'swr'

import { PoolData, PoolsData } from '../types/BalancerPool'

const BalancerChainName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'MAINNET',
  [SupportedChainId.SEPOLIA]: 'SEPOLIA',
  [SupportedChainId.ARBITRUM_ONE]: 'ARBITRUM',
  [SupportedChainId.GNOSIS_CHAIN]: 'GNOSIS',
}

const USER_POOLS_QUERY = gql`
  query GetPools(
    $first: Int
    $skip: Int
    $orderBy: GqlPoolOrderBy
    $orderDirection: GqlPoolOrderDirection
    $where: GqlPoolFilter
    $textSearch: String
  ) {
    pools: poolGetPools(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
      textSearch: $textSearch
    ) {
      address
      chain
      protocolVersion
      id
      name
      symbol
      type
      decimals
      userBalance {
        totalBalance
        totalBalanceUsd
      }
      displayTokens {
        address
        symbol
      }
    }
  }
`

const POOL_QUERY = gql`
  query GetPool($id: String!, $chain: GqlChain!, $userAddress: String) {
    pool: poolGetPool(id: $id, chain: $chain, userAddress: $userAddress) {
      id
      address
      decimals
      symbol
      type
      chain
      protocolVersion
      userBalance {
        totalBalance
        totalBalanceUsd
      }
      poolTokens {
        id
        address
        name
        decimals
        symbol
        balance
      }
    }
  }
`

const BASE_URL = `https://api-v3.balancer.fi/graphql`
const GQL_CLIENT = new GraphQLClient(BASE_URL)

export function useUserBalancerPool() {
  const { chainId, account } = useWalletInfo()

  return useSWR([chainId, account], async ([chainId, account]) => {
    if (!account || !chainId) {
      return []
    }
    const chainName = BalancerChainName[chainId]
    return await GQL_CLIENT.request<{
      pools: PoolsData[]
    }>(USER_POOLS_QUERY, {
      where: {
        userAddress: account,
        chainIn: [chainName],
      },
    }).then((result) => {
      return result.pools
    })
  })
}

export function usePoolData(poolId?: string) {
  const { chainId, account } = useWalletInfo()

  return useSWR(poolId, async (poolId) => {
    if (!poolId) {
      return undefined
    }

    return await GQL_CLIENT.request<{
      pool: PoolData
    }>(POOL_QUERY, {
      id: poolId,
      chain: BalancerChainName[chainId],
      userAddress: account,
    }).then((result) => {
      return result.pool
    })
  })
}
