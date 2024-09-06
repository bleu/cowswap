import { calculateGasMargin } from '@cowprotocol/common-utils'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { CowHook } from 'modules/appData/types'

type IHookGasCalculator = (transactionData: Omit<CowHook, 'gasLimit'>) => Promise<string>

export const useHookGasLimitCalculator = (): IHookGasCalculator => {
  const provider = useWalletProvider()

  return async (transactionData: Omit<CowHook, 'gasLimit'>) => {
    if (!provider) throw new Error('Provider is not defined')
    const gasEstimation = await provider.estimateGas({ to: transactionData.target, data: transactionData.callData })
    return calculateGasMargin(gasEstimation).toString()
  }
}
