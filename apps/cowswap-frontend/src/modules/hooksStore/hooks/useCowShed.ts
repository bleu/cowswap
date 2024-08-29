import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'
import { useCallback } from 'react'
import { CowShedSdk, ICall } from '../cow-shed'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION, proxyInitCode } from '../cow-shed/constants'
import { ethers } from 'ethers_v6'
import { CowHook } from '@cowprotocol/types'

export function useCowShed() {
  const provider = useWalletProvider()
  const { account, chainId } = useWalletInfo()
  const cancelPendingOrder = useRequestOrderCancellation()
  const shedSdk = new CowShedSdk({
    factoryAddress: COW_SHED_FACTORY,
    implementationAddress: COW_SHED_IMPLEMENTATION,
    proxyCreationCode: proxyInitCode,
    chainId,
  })

  const calculateProxyAddress = useCallback(
    (user: string) => {
      return shedSdk.computeProxyAddress(user)
    },
    [shedSdk]
  )

  const signCalls = useCallback(
    async (calls: ICall[], validTo: bigint): Promise<CowHook> => {
      if (!account || !provider) {
        throw new Error('No account or provider')
      }

      const nonce = ethers.encodeBytes32String(Date.now().toString())

      const infoToSign = shedSdk.hashToSignWithUser(calls, nonce, validTo, account)

      const signer = provider.getSigner()

      const signatureRaw = await signer._signTypedData(infoToSign.domain, infoToSign.types, infoToSign.value)
      const r = BigInt(signatureRaw.slice(0, 66))
      const s = BigInt(`0x${signatureRaw.slice(66, 130)}`)
      const v = parseInt(signatureRaw.slice(130, 132), 16)

      const encodedSignature = CowShedSdk.encodeEOASignature(r, s, v)

      const hooksCalldata = CowShedSdk.encodeExecuteHooksForFactory(
        calls,
        nonce,
        BigInt(validTo),
        account,
        encodedSignature
      )
      const estimateGas = await provider.estimateGas({
        to: COW_SHED_FACTORY,
        value: '0',
        data: hooksCalldata,
      })

      return { target: COW_SHED_FACTORY, callData: hooksCalldata, gasLimit: estimateGas.add(estimateGas).toString() }
    },
    [account, cancelPendingOrder, chainId, provider]
  )

  return { calculateProxyAddress, signCalls }
}
