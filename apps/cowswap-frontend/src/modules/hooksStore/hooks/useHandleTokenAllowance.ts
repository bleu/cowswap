import { useCallback } from 'react'

import { Erc20Abi } from '@cowprotocol/abis'
import {
  type GetTokenPermitIntoResult,
  type PermitInfo,
  generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
} from '@cowprotocol/permit-utils'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

import { BigNumber, type Signer } from 'ethers'
import { Abi, type Address, maxUint256, PublicClient } from 'viem'

import { handleTokenApprove } from './useHandleTokenApprove'

export function useHandleTokenAllowance({
  spender,
  account,
  chainId,
  web3Provider,
  publicClient,
  jsonRpcProvider,
  signer,
}: {
  spender: Address | undefined
  account: Address | undefined
  chainId: number | undefined
  web3Provider: Web3Provider | undefined
  publicClient: PublicClient | undefined
  jsonRpcProvider: JsonRpcProvider | undefined
  signer: Signer | undefined
}) {
  return useCallback(
    async (amount: BigNumber, tokenAddress: Address) => {
      if (!publicClient || !jsonRpcProvider || !account || !chainId || !spender || !web3Provider)
        throw new Error('Missing context')

      const tokenContract = {
        address: tokenAddress,
        abi: Erc20Abi as Abi,
      }

      const [{ result: currentAllowance }, { result: tokenName }] = await publicClient.multicall({
        contracts: [
          {
            ...tokenContract,
            functionName: 'allowance',
            args: [account, spender],
          },
          {
            ...tokenContract,
            functionName: 'name',
          },
        ],
      })
      if (currentAllowance === undefined || !tokenName) {
        throw new Error('Token allowance not available')
      }

      if (amount.lte(BigNumber.from(currentAllowance))) {
        // amount is less than or equal to current allowance so no need to approve
        return
      }

      const eip2162Utils = getPermitUtilsInstance(chainId, web3Provider, account)

      const [permitInfo, nonce] = await Promise.all([
        getTokenPermitInfo({
          spender,
          tokenAddress,
          chainId,
          provider: jsonRpcProvider,
        }),
        eip2162Utils.getTokenNonce(tokenAddress, account),
      ]).catch(() => [undefined, undefined])

      if (!permitInfo || !checkIsPermitInfo(permitInfo)) {
        await handleTokenApprove({
          signer,
          spender,
          tokenAddress,
          amount: maxUint256,
        })
        return
      }

      const hook = await generatePermitHook({
        chainId,
        inputToken: {
          address: tokenAddress,
          name: tokenName as string,
        },
        spender,
        provider: jsonRpcProvider,
        permitInfo,
        eip2162Utils: eip2162Utils,
        account,
        nonce,
      })
      if (!hook) throw new Error('User rejected permit')
      return hook
    },
    [jsonRpcProvider, account, chainId, publicClient, spender, signer, web3Provider],
  )
}

export function checkIsPermitInfo(permitInfo: GetTokenPermitIntoResult): permitInfo is PermitInfo {
  return 'type' in permitInfo && permitInfo.type !== 'unsupported'
}
