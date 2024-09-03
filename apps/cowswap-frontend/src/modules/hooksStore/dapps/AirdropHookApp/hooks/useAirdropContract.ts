import { VCow, vCowAbi } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useContract } from 'common/hooks/useContract'

export function useVirtualTokenAirdropContract(addressesMapping?: Record<SupportedChainId, string>): VCow | null {
  // TODO: check change network fail
  //if (!addressesMapping) return null
  return useContract<VCow>(addressesMapping, vCowAbi)
}
