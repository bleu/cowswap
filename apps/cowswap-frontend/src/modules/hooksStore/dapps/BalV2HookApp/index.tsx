import { useCallback, useContext, useEffect, useState } from 'react'

import { RPC_URLS } from '@cowprotocol/common-const'
import { HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { RemoveLiquidity, RemoveLiquidityKind, Slippage } from '@balancer/sdk'
import { parseUnits } from 'ethers/lib/utils'
import styled from 'styled-components/macro'

import { usePoolData, useUserBalancerPool } from 'modules/hooksStore/hooks/useBalancerPool'
import { PoolData, PoolsData } from 'modules/hooksStore/types/BalancerPool'

import { HookDappContext } from '../../context'
import balancerLogo from '../../images/balancer.png'
import { ICall } from 'modules/hooksStore/cow-shed'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useTokenContract } from 'common/hooks/useContract'
import { useCowShed } from 'modules/hooksStore/hooks/useCowShed'

const TITLE = 'Exit Balancer Pool'
const DESCRIPTION = 'Allows you to exit a Balancer pool'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.6rem;
  padding: 1rem;
  justify-content: start;
`

const DropdownContainer = styled.div`
  position: relative;
  width: 50%;
  margin: 1.4rem 0;
`

const DropdownHeader = styled.div`
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 500;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`

const DropdownBody = styled.div`
  position: absolute;
  top: calc(100% + 1rem);
  left: 0;
  width: 100%;
  border-radius: 1.6rem;
  padding: 0.6rem;
  display: flex;
  flex-flow: column wrap;
  gap: 0.6rem;
`

const DropdownOption = styled.div`
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 500;

  &:hover {
    background-color: black;
    border-radius: 1rem;
  }
`

const ErrorLabel = styled.div`
  color: var(${UI.COLOR_RED});
`

const LoadingLabel = styled.div`
  color: var(${UI.COLOR_TEXT2});
`

export const PRE_EXIT_BAL_POOL: HookDappInternal = {
  name: TITLE,
  description: DESCRIPTION,
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/claim-gno',
  component: <ExitBalV2App />,
  image: balancerLogo,
  version: 'v0.1.1',
}

export function ExitBalV2App() {
  const hookDappContext = useContext(HookDappContext)
  const { data: pools, isLoading: isLoadingPools } = useUserBalancerPool()
  const [selectedPoolId, setSelectedPoolId] = useState<string>()
  const { data: poolData, isValidating: isValidatingPoolData } = usePoolData(selectedPoolId)
  const [userDeadline] = useUserTransactionTTL()
  const { signCalls, calculateProxyAddress } = useCowShed()
  const bptContract = useTokenContract(poolData?.address)
  const [hookCalls, setHookCalls] = useState<ICall[]>()
  const [outputTokens, setOutputTokens] = useState<CurrencyAmount<Token>[]>()

  useEffect(() => {
    const updateHookData = async () => {
      if (!hookDappContext || !poolData || !hookDappContext.account) return

      const removeLiquidity = new RemoveLiquidity()

      const bptAmount = parseUnits(poolData.userBalance.totalBalance, poolData.decimals).toBigInt()
      const proxyAddress = calculateProxyAddress(hookDappContext.account) as `0x${string}`

      const exitQuery = await removeLiquidity.query(
        {
          chainId: hookDappContext.chainId,
          kind: RemoveLiquidityKind.Proportional,
          rpcUrl: RPC_URLS[hookDappContext.chainId],
          bptIn: {
            address: poolData.address,
            decimals: poolData.decimals,
            rawAmount: bptAmount,
          },
        },
        {
          id: poolData.id,
          address: poolData.address,
          type: poolData.type.charAt(0).toUpperCase() + poolData.type.slice(1).toLowerCase(),
          protocolVersion: poolData.protocolVersion,
          tokens: poolData.poolTokens.map((token, index) => ({
            ...token,
            index,
          })),
        }
      )
      const exitCall = removeLiquidity.buildCall({
        ...exitQuery,
        slippage: Slippage.fromPercentage('10'),
        sender: proxyAddress,
        recipient: hookDappContext.account as `0x${string}`,
      })
      setHookCalls([
        {
          target: poolData.address,
          isDelegateCall: false,
          value: BigInt(0),
          allowFailure: false,
          callData: bptContract?.interface.encodeFunctionData('transferFrom', [
            hookDappContext.account,
            proxyAddress,
            bptAmount,
          ]) as string,
        },
        {
          target: exitCall.to,
          isDelegateCall: false,
          value: exitCall.value,
          allowFailure: false,
          callData: exitCall.callData,
        },
      ])
      setOutputTokens(
        exitQuery.amountsOut.map((amount) =>
          CurrencyAmount.fromRawAmount(
            new Token(hookDappContext.chainId, amount.token.address, amount.token.decimals, amount.token.symbol),
            amount.amount.toString()
          )
        )
      )
    }

    updateHookData()
  }, [poolData, hookDappContext])

  const clickOnAddHook = useCallback(async () => {
    if (!hookCalls || !hookDappContext) return
    const validTo = BigInt(Date.now() + userDeadline * 2)

    const hook = await signCalls(hookCalls, validTo)

    hookDappContext.addHook(
      {
        hook,
        dapp: PRE_EXIT_BAL_POOL,
        outputTokens,
      },
      true
    )
  }, [hookCalls, userDeadline, hookDappContext, signCalls, outputTokens])

  if (!hookDappContext?.account) {
    return 'Connect your wallet first'
  }

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <SelectPoolToExit
        loading={isLoadingPools}
        pools={pools}
        poolData={poolData}
        setSelectedPoolId={setSelectedPoolId}
      />
      <ButtonPrimary onClick={clickOnAddHook} disabled={isValidatingPoolData || !poolData} width={'50%'}>
        +Add Pre-hook
      </ButtonPrimary>
    </Wrapper>
  )
}

export function SelectPoolToExit(props: {
  loading: boolean
  pools?: PoolsData[]
  setSelectedPoolId: (poolId: string) => void
  poolData?: PoolData
}) {
  const { loading, pools, setSelectedPoolId, poolData } = props
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return <LoadingLabel>Loading...</LoadingLabel>
  }

  if (!pools) {
    return <ErrorLabel>None pool found</ErrorLabel>
  }

  const handleSelect = (pool: PoolsData) => {
    setSelectedPoolId(pool.id)
    setIsOpen(false)
  }

  return (
    <DropdownContainer>
      <DropdownHeader onClick={() => setIsOpen(!isOpen)}>
        <b>{poolData ? poolData.symbol : 'Select the pool to exit'}</b>
      </DropdownHeader>
      {isOpen && (
        <DropdownBody>
          {pools.map((pool) => (
            <DropdownOption onClick={() => handleSelect(pool)} key={pool.id}>
              {pool.symbol}
            </DropdownOption>
          ))}
        </DropdownBody>
      )}
    </DropdownContainer>
  )
}
