import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { bundleSimulation } from '../utils/bundleSimulation'
import { useTopTokenHolders } from './useTopTokenHolders'
import { getTokenTransferInfo } from '../utils/getTokenTransferInfo'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'
import { useTokenContract } from 'common/hooks/useContract'
import useSWR from 'swr'
import { useHooks } from 'modules/hooksStore'
import { generateNewSimulationData, generateSimulationDataToError } from '../utils/generateSimulationData'

export function useTenderlyBundleSimulateSWR() {
  const { account, chainId } = useWalletInfo()
  const { preHooks, postHooks } = useHooks()
  const orderParams = useOrderParams()
  const tokenSell = useTokenContract(orderParams?.sellTokenAddress)
  const tokenBuy = useTokenContract(orderParams?.buyTokenAddress)
  const buyAmount = orderParams?.buyAmount

  const { data: buyTokenTopHolders, isValidating: isTopTokenHoldersValidating } = useTopTokenHolders({
    tokenAddress: tokenBuy?.address,
    chainId,
  })

  const getNewSimulationData = useCallback(async () => {
    console.log('getNewSimulationData')
    if (postHooks.length === 0 && preHooks.length === 0) return {}

    console.log('getNewSimulationData 2')
    console.log({
      account,
      buyTokenTopHolders,
      tokenBuy,
      orderParams,
      tokenSell,
      buyAmount,
    })
    if (!account || !buyTokenTopHolders || !tokenBuy || !orderParams || !tokenSell || !buyAmount) {
      return generateSimulationDataToError({ postHooks, preHooks })
    }

    const tokenBuyTransferInfo = getTokenTransferInfo({
      tokenHolders: buyTokenTopHolders,
      amountToTransfer: buyAmount,
    })

    const paramsComplete = {
      postHooks,
      preHooks,
      tokenBuy,
      tokenBuyTransferInfo,
      orderParams,
      tokenSell,
      account,
      chainId,
    }

    console.log({ paramsComplete })

    try {
      const response = await bundleSimulation(paramsComplete)
      return generateNewSimulationData(response, paramsComplete)
    } catch {
      return generateSimulationDataToError(paramsComplete)
    }
  }, [account, chainId, buyTokenTopHolders, tokenBuy, postHooks, preHooks, buyAmount])

  const { data, isValidating: isBundleSimulationLoading } = useSWR(
    ['tenderly-bundle-simulation', postHooks, preHooks, orderParams?.sellTokenAddress, orderParams?.buyTokenAddress],
    getNewSimulationData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
    },
  )

  return { data, isValidating: isBundleSimulationLoading || isTopTokenHoldersValidating }
}
