import { COW, V_COW } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AirdropOption } from './types'

export const AIRDROP_OPTIONS = [
  {
    name: 'COW',
    dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-token-mock/main/mock-airdrop-data/',
    addressesMapping: {
      [SupportedChainId.SEPOLIA]: {
        vToken: { ...V_COW[SupportedChainId.SEPOLIA], address: '0x665a921D720D27118ae4f9D1fA98976FEad04e5A' },
        token: { ...COW[SupportedChainId.SEPOLIA], address: '0x5fe27bf718937ca1c4a7818d246cd4e755c7470c' },
      },
    },
    decimals: 18,
  },
] as AirdropOption[]
