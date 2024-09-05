import { VCow, vCowAbi } from '@cowprotocol/abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useContract } from 'common/hooks/useContract'

import { AirdropOption } from '../constants'

export function useVirtualTokenAirdropContract(airdropOption?: AirdropOption): VCow | null {
  const { chainId } = useWalletInfo()
  const vToken = airdropOption?.addressesMapping[chainId].vToken.address
  return useContract<VCow>(vToken, vCowAbi)
}
