import { useCallback, useContext, useState } from 'react'

import { RPC_URLS } from '@cowprotocol/common-const'
import { HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { RemoveLiquidity, RemoveLiquidityKind } from '@balancer/sdk'
import { parseUnits } from 'ethers/lib/utils'
import styled from 'styled-components/macro'

import { HookDappContext } from '../../context'
import balancerLogo from '../../images/balancer.png'
import { usePoolData, useUserBalancerPool } from 'modules/hooksStore/hooks/useBalancerPool'
import { PoolData, PoolsData } from 'modules/hooksStore/types/BalancerPool'

const TITLE = 'Exit Balancer V2 Pool'
const DESCRIPTION = 'Allows you to exit a Balancer V2 pool'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;

  flex-grow: 1;
`

const Link = styled.button`
  border: none;
  padding: 0;
  text-decoration: underline;
  display: text;
  cursor: pointer;
  background: none;
  color: white;
  margin: 10px 0;
`

const Header = styled.div`
  display: flex;
  padding: 1.5em;

  p {
    padding: 0 1em;
  }
`

const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1em;
  text-align: center;
`

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 1.4rem 0;
`

const DropdownHeader = styled.div`
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 500;

  > img {
    --size: 1.6rem;
    width: var(--size);
    height: var(--size);
  }

  > b {
    display: flex;
    flex-flow: row wrap;
    gap: 0.3rem;
  }

  > b::after {
    --size: 1rem;
    content: '';
    width: var(--size);
    height: var(--size);
    display: inline-block;
    background: url(/images/icons/carret-down.svg) no-repeat center / contain;
  }
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
  const { data: poolData, isValidating: isValidatingPoolData, mutate: mutatePoolData } = usePoolData()

  const clickOnAddHook = useCallback(async () => {
    if (!hookDappContext || !selectedPool || !hookDappContext.account) return

    const removeLiquidity = new RemoveLiquidity()

    const exitInfo = await removeLiquidity.query(
      {
        chainId: hookDappContext.chainId,
        kind: RemoveLiquidityKind.Proportional,
        rpcUrl: RPC_URLS[hookDappContext.chainId],
        bptIn: {
          address: selectedPool.address,
          decimals: selectedPool.decimals,
          rawAmount: parseUnits(selectedPool.userBalance.totalBalance, selectedPool.decimals).toBigInt(),
        },
      },
      {
        id: selectedPool.id,
        address: selectedPool.address,
        type: selectedPool.type,
        protocolVersion: selectedPool.protocolVersion,
        tokens: selectedPool.displayTokens.map((token, index) => ({
          ...token,
          index,
        })),
      }
    )

    // const exitPool = removeLiquidity.buildCall({
    //   poolType: selectedPool.type,
    //   poolId: selectedPool.id,
    //   removeLiquidityKind: RemoveLiquidityKind.Proportional,
    //   bptIn: TokenAmount.fromHumanAmount(
    //     new Token(hookDappContext.chainId, selectedPool.address, selectedPool.decimals),
    //     selectedPool.userBalance.totalBalance
    //   ),
    //   slippage: Slippage.fromPercentage('0.05'),
    //   chainId: hookDappContext.chainId,
    //   protocolVersion: selectedPool.protocolVersion,
    //   amountsOut: [],
    // })

    console.log({ exitInfo })
  }, [poolData, hookDappContext])

  if (!hookDappContext?.account) {
    return 'Connect your wallet first'
  }

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <Header>
        <img src={balancerLogo} alt={TITLE} width="60" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <SelectPoolToExit loading={isLoadingPools} pools={pools} poolData={poolData} mutatePoolData={mutatePoolData} />
      </ContentWrapper>
      {poolData && (
        <ButtonPrimary onClick={clickOnAddHook} disabled={isValidatingPoolData}>
          +Add Pre-hook
        </ButtonPrimary>
      )}

      <Link
        onClick={(e) => {
          e.preventDefault()
          hookDappContext.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}

export function SelectPoolToExit(props: {
  loading: boolean
  pools?: PoolsData[]
  mutatePoolData: (pool: PoolData) => void
  poolData?: PoolData
}) {
  const { loading, pools, mutatePoolData, poolData } = props
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return <LoadingLabel>Loading...</LoadingLabel>
  }

  if (!pools) {
    return <ErrorLabel>None pool found</ErrorLabel>
  }

  const handleSelect = (pool: PoolData) => {
    mutatePoolData(pool)
    setIsOpen(false)
  }

  return (
    <>
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
    </>
  )
}
