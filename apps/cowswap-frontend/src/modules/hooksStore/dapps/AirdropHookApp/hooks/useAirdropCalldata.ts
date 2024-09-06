import { ICoWShedCall } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useVirtualTokenAirdropContract } from './useAirdropContract'

import { IClaimData } from '../types'
import { AirdropOption } from '../types'

export const useAirdropHookCalls = (claimData?: IClaimData, selectedAirdrop?: AirdropOption): ICoWShedCall[] => {
  const { account } = useWalletInfo()
  const virtualTokenAirdropContract = useVirtualTokenAirdropContract(selectedAirdrop)

  if (!claimData || !virtualTokenAirdropContract || !account) return []

  const claimCallData = virtualTokenAirdropContract.interface.encodeFunctionData('claim', [
    claimData.index, //index
    0, //claimType
    account, //claimant
    claimData.amount, //claimableAmount
    claimData.amount, //claimedAmount
    claimData.proof, //merkleProof
  ])

  const swapCallData = virtualTokenAirdropContract.interface.encodeFunctionData('swapAll')

  if (!swapCallData || !claimCallData) return []

  return [
    {
      target: virtualTokenAirdropContract.address,
      callData: claimCallData,
      value: BigInt(0),
      isDelegateCall: false,
      allowFailure: false,
    },
    // {
    //   target: virtualTokenAirdropContract.address,
    //   callData: swapCallData,
    //   value: BigInt(0),
    //   isDelegateCall: false,
    //   allowFailure: false,
    // },
  ]
}
