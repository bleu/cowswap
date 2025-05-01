import { useCallback, useMemo } from 'react'

import type { CowShedHooks, ICoWShedCall } from '@cowprotocol/cow-sdk'

import { Address, stringToHex } from 'viem'

import { useOrderParams } from './useOrderParams'

import type { Signer } from 'ethers'

type OrderParams = ReturnType<typeof useOrderParams>

export interface BaseTransaction {
  to: string
  value: bigint
  callData: string
  isDelegateCall?: boolean
}

export function useHookDeadline({ orderParams }: { orderParams: OrderParams }) {
  return useMemo(() => {
    const now = new Date()
    const validToOnTimezone = (orderParams && orderParams.validTo) || 0
    const validToTimestamp = validToOnTimezone + now.getTimezoneOffset() * 60
    const currentTimestamp = new Date().getTime() / 1000
    const oneHourAfter = Number(currentTimestamp.toFixed()) + 60 * 60

    if (validToTimestamp < oneHourAfter) return BigInt(oneHourAfter)
    return BigInt(validToTimestamp)
  }, [orderParams])
}

export function getCowShedNonce() {
  return stringToHex(Date.now().toString(), { size: 32 })
}

export function useCowShedSignature({
  cowShed,
  signer,
  account,
  orderParams,
}: {
  cowShed: CowShedHooks | undefined
  signer: Signer | undefined
  account: Address | undefined
  orderParams: OrderParams
}) {
  const hookDeadline = useHookDeadline({ orderParams })

  return useCallback(
    async (txs: BaseTransaction[]) => {
      if (!cowShed || !signer || !account) return
      const cowShedCalls: ICoWShedCall[] = txs.map((tx) => {
        return {
          target: tx.to,
          value: BigInt(tx.value),
          callData: tx.callData,
          allowFailure: false,
          isDelegateCall: !!tx.isDelegateCall,
        }
      })
      const nonce = getCowShedNonce()

      const signature = '0x'
      return cowShed.encodeExecuteHooksForFactory(cowShedCalls, nonce, hookDeadline, account, signature)
    },
    [hookDeadline, cowShed, signer, account],
  )
}
