import { useCallback, useEffect, useMemo, useState } from 'react'
import { Wrapper } from '../styled'
import { ButtonPrimary } from '@cowprotocol/ui'
import { HookDappProps } from 'modules/hooksStore/types/hooks'
import { Address, Chain, createPublicClient, encodeFunctionData, formatUnits, http, isAddress, parseUnits } from 'viem'
import { Erc20Abi } from '@cowprotocol/abis'

import { mainnet, base } from 'viem/chains'

import { CowShedHooks } from '@cowprotocol/cow-sdk'
import { BigNumber } from 'ethers'

import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useReadTokenContract } from './useReadTokenContract'
import { useWalletProvider } from '@cowprotocol/common-hooks'

export function TransferHookApp({ context }: HookDappProps) {
  const hookToEdit = context.hookToEdit
  const isPreHook = context.isPreHook
  const account = context?.account
  const tokenAddress = context?.orderParams?.buyTokenAddress as Address | undefined

  const target = tokenAddress

  const web3Provider = useWalletProvider()
  const signer = useMemo(() => web3Provider && web3Provider.getSigner(), [web3Provider])

  const chain = ([mainnet, base].find((chain) => chain.id === context?.chainId) ?? mainnet) as Chain

  const publicClient = useMemo(() => {
    if (!context?.chainId) return
    return createPublicClient({
      chain,
      transport: http(context?.chainId === 1 ? 'https://eth.llamarpc.com' : 'https://base.llamarpc.com'),
    })
  }, [context?.chainId])

  const jsonRpcProvider = useMemo(() => {
    if (!context?.chainId) return
    return new JsonRpcProvider('https://eth.llamarpc.com')
  }, [context?.chainId])

  const { tokenDecimals, tokenSymbol, userBalance } = useReadTokenContract({
    tokenAddress: context?.orderParams?.buyTokenAddress as Address | undefined,
    context,
    publicClient,
  })

  const formattedBalance =
    tokenDecimals && userBalance !== undefined ? formatUnits(userBalance, tokenDecimals) : undefined

  const gasLimit = '100000'

  const cowShed = useMemo(() => {
    if (!context?.chainId) return
    return new CowShedHooks(context.chainId)
  }, [context?.chainId])

  const cowShedProxy = useMemo(() => {
    if (!context?.account || !cowShed) return
    return cowShed.proxyOf(context.account)
  }, [context?.account, cowShed]) as Address | undefined

  const onButtonClick = useCallback(async () => {
    if (!cowShed || !target || !gasLimit) return

    //@ts-ignore
    const amount = String(document?.getElementById('amount')?.value)
    //@ts-ignore
    const toAddress = String(document?.getElementById('address')?.value)

    if (!amount || !toAddress || !isAddress(toAddress) || Number(amount) <= 0) return

    const amountBigint = parseUnits(amount, tokenDecimals)

    const callData = encodeFunctionData({
      abi: Erc20Abi,
      functionName: 'transferFrom',
      args: [account, toAddress, amountBigint],
    })

    const calls = [
      {
        to: target,
        callData,
      },
    ]

    const allowances = [
      {
        tokenAddress,
        amount,
      },
    ]

    const hook = {
      calls,
      allowances,
      gasLimit,
    }

    context.addHook({ hook })
  }, [target, gasLimit, context])

  const buttonProps = useMemo(() => {
    if (!context.account) return { message: 'Connect wallet', disabled: true }
    if (!context.orderParams) return { message: 'Missing order params', disabled: true }
    return { message: 'Add Post-hook', disabled: false }
  }, [hookToEdit, context.account, isPreHook])

  return (
    <Wrapper>
      <span>Amount of {tokenSymbol} to transfer</span>
      <input
        id="amount"
        type="number"
        inputMode="decimal"
        step={`0.${'0'.repeat(tokenDecimals - 1)}1`}
        style={{ padding: '8px', fontSize: 16 }}
      />
      <span>Your balance: {formattedBalance}</span>
      <span>Address to transfer</span>
      <input id="address" style={{ padding: '8px', fontSize: 16 }} />
      <ButtonPrimary onClick={onButtonClick} disabled={buttonProps.disabled}>
        {buttonProps.message}
      </ButtonPrimary>
    </Wrapper>
  )
}
