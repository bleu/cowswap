import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface AirdropDataInfo {
  index: number
  type: string
  amount: string
  proof: string[]
}
export interface IClaimData extends AirdropDataInfo {
  isClaimed: boolean
}

export interface AirdropOption {
  name: string
  dataBaseUrl: string
  decimals: number
  addressesMapping: Record<
    SupportedChainId,
    {
      vToken: TokenWithLogo
      token: TokenWithLogo
    }
  >
}
