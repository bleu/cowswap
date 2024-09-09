import { COW } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AirdropOption } from './types'

export const AIRDROP_OPTIONS = [
  {
    name: 'COW',
    dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-token-mock/main/mock-airdrop-data/',
    addressesMapping: {
      [SupportedChainId.SEPOLIA]: '0x326295729699096f7E4425fdC4CB7C4F1dd5e09a',
    },
    tokenMapping: {
      [SupportedChainId.SEPOLIA]: {
        ...COW[SupportedChainId.SEPOLIA],
        address: '0x5fe27bf718937ca1c4a7818d246cd4e755c7470c',
      },
    },

    decimals: 18,
  },
] as AirdropOption[]
