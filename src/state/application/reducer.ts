import { createSlice, nanoid } from '@reduxjs/toolkit'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'

// export type PopupContent = {
//   txn: {
//     hash: string
//   }
// }

// MOD: Modified PopupContent. The mod happened directly in the src file, to avoid redefining the state/hoos/etc
export type PopupContent = TxPopupContent | MetaTxPopupContent

export type TxPopupContent = {
  txn: {
    hash: string
    success?: boolean
    summary?: string
  }
}

export interface MetaTxPopupContent {
  metatxn: {
    id: string
    success?: boolean
    summary?: string | JSX.Element
  }
}

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE,
  POOL_OVERVIEW_OPTIONS,
  NETWORK_SELECTOR,
  PRIVACY_POLICY,
  // -----------------      MOD: CowSwap specific modals      --------------------
  TRANSACTION_CONFIRMATION,
  TRANSACTION_ERROR,
  ARBITRUM_OPTIONS,
  // ------------------------------------------------------------------------------
}

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly chainConnectivityWarning: boolean
  readonly chainId: number | null
  readonly implements3085: boolean
  readonly openModal: ApplicationModal | null
  readonly popupList: PopupList
}

const initialState: ApplicationState = {
  blockNumber: {},
  chainConnectivityWarning: false,
  chainId: null,
  implements3085: false,
  openModal: null,
  popupList: [],
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateChainId(state, action) {
      const { chainId } = action.payload
      state.chainId = chainId
    },
    updateBlockNumber(state, action) {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    },
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
    addPopup(state, { payload: { content, key, removeAfterMs = DEFAULT_TXN_DISMISS_MS } }) {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    },
    removePopup(state, { payload: { key } }) {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    },
    setImplements3085(state, { payload: { implements3085 } }) {
      state.implements3085 = implements3085
    },
    setChainConnectivityWarning(state, { payload: { warn } }) {
      state.chainConnectivityWarning = warn
    },
  },
})

export const {
  updateChainId,
  updateBlockNumber,
  setOpenModal,
  addPopup,
  removePopup,
  setImplements3085,
  setChainConnectivityWarning,
} = applicationSlice.actions
export default applicationSlice.reducer
