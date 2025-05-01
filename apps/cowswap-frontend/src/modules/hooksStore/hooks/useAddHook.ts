import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { useWalletProvider } from '@cowprotocol/common-hooks'
import { CowShedHooks } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { useWalletInfo } from '@cowprotocol/wallet'

import { v4 as uuidv4 } from 'uuid'
import { Address, Chain, createPublicClient, http } from 'viem'
import { mainnet, base } from 'viem/chains'

import { useCowShedSignature } from './useCowShedSignature'
import { useHandleTokenAllowance } from './useHandleTokenAllowance'
import { useOrderParams } from './useOrderParams'

import { setHooksAtom } from '../state/hookDetailsAtom'
import { AddHook, HookDapp } from '../types/hooks'
import { BigNumber } from 'ethers'

export function useAddHook(dapp: HookDapp, isPreHook: boolean): AddHook {
  const updateHooks = useSetAtom(setHooksAtom)
  const orderParams = useOrderParams()
  const { account, chainId } = useWalletInfo()
  const web3Provider = useWalletProvider()
  const signer = useMemo(() => web3Provider && web3Provider.getSigner(), [web3Provider])
  const cowShed = useMemo(() => {
    if (!chainId) return
    return new CowShedHooks(chainId)
  }, [chainId])

  const cowShedProxy = useMemo(() => {
    if (!account || !cowShed) return
    return cowShed.proxyOf(account)
  }, [account, cowShed]) as Address | undefined

  const jsonRpcProvider = useMemo(() => getRpcProvider(chainId) ?? undefined, [chainId])

  const chain = ([mainnet, base].find((chain) => chain.id === chainId) ?? mainnet) as Chain

  const publicClient = useMemo(
    () =>
      jsonRpcProvider?.connection.url
        ? createPublicClient({ transport: http(jsonRpcProvider.connection.url), chain })
        : undefined,
    [jsonRpcProvider?.connection.url],
  )

  const handleTokenAllowance = useHandleTokenAllowance({
    spender: cowShedProxy,
    account: account as Address,
    chainId,
    web3Provider,
    publicClient,
    jsonRpcProvider,
    signer,
  })

  const getCowShedCall = useCowShedSignature({
    cowShed,
    signer,
    account: account as Address,
    orderParams,
  })

  return useCallback(
    async (hookToAdd) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)

      const uuid = uuidv4()

      const permitTxs = []
      for (const allowance of hookToAdd.hook.allowances) {
        const permitData = await handleTokenAllowance(
          BigNumber.from(allowance.amount),
          allowance.tokenAddress as Address,
        )
        if (permitData)
          permitTxs.push({
            to: permitData.target,
            value: BigInt(0),
            callData: permitData.callData,
          })
      }
      const callsWithValues = hookToAdd.hook.calls.map((call) => ({ ...call, value: BigInt(0) }))

      const callData = await getCowShedCall([...permitTxs, ...callsWithValues])

      const hook = {
        target: cowShed?.getFactoryAddress() ?? '',
        callData: callData ?? '',
        gasLimit: '100000',
      }

      const hookDetails: CowHookDetails = {
        ...hookToAdd,
        uuid,
        hook: {
          ...hook,
          dappId: dapp.id,
        },
      }

      updateHooks((hooks) => {
        if (isPreHook) {
          return { preHooks: [...hooks.preHooks, hookDetails], postHooks: hooks.postHooks }
        } else {
          return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, hookDetails] }
        }
      })
    },
    [updateHooks, dapp, isPreHook, cowShedProxy],
  )
}
