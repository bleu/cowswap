import { useMemo, useState } from 'react'

import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { DropDownMenu } from 'modules/hooksStore/pure/DropDownMenu'
import { Slider } from 'modules/hooksStore/pure/Slider'
import { ContentWrapper, Row, Wrapper } from 'modules/hooksStore/styled'
import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { usePoolUserBalance } from './hooks/usePoolUserBalance'
import { useUserPools } from './hooks/useUserPools'
import { PoolBalancesPreview } from './pure/PoolBalancesPreview'
import { IMinimalPool } from './types'
import { multiplyValueByPct } from './utils'

export function WithdrawHookApp({ context }: HookDappProps) {
  const pools = useUserPools(context.account)
  const [selectedPool, setSelectedPool] = useState<IMinimalPool>()
  const poolBalances = usePoolUserBalance(selectedPool?.id)
  const [withdrawPct, setWithdrawPct] = useState<number>(100)

  const poolBalancesAfterWithdraw = useMemo(() => {
    if (!poolBalances) return []
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, 100 - withdrawPct),
      fiatAmount: multiplyValueByPct(poolBalance.fiatAmount, 100 - withdrawPct),
    }))
  }, [poolBalances, withdrawPct])

  const buttonProps = useMemo(() => {
    if (!context.account) return { disabled: true, message: 'Connect wallet to withdraw' }
    if (!pools.length) return { disabled: true, message: 'No pools to withdraw from' }
    if (!selectedPool) return { disabled: true, message: 'Choose liquidity pool' }
    if (!withdrawPct) return { disabled: true, message: 'Define percentage' }
    return { disabled: false, message: 'Add pre-hook' }
  }, [context.account, pools, selectedPool, withdrawPct])

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <DropDownMenu
            items={pools.map((pool) => ({ value: pool.symbol, id: pool.id }))}
            text={selectedPool?.symbol || 'Choose a pool to remove liquidity from..'}
            setSelectedItem={({ id }) => setSelectedPool(pools.find((pool) => pool.id === id))}
          />
        </Row>
        {selectedPool && (
          <>
            <Row>
              <PoolBalancesPreview label="Current balance" poolBalance={poolBalances} />
            </Row>
            <Row>
              <Slider value={withdrawPct} setValue={setWithdrawPct} title="Define withdrawal percentage" />
            </Row>
            <Row>
              <PoolBalancesPreview
                label="Balance after withdraw"
                poolBalance={poolBalancesAfterWithdraw}
                backgroundColor={UI.COLOR_PAPER_DARKER}
              />
            </Row>
          </>
        )}
        <ButtonPrimary disabled={buttonProps.disabled}>{buttonProps.message}</ButtonPrimary>
      </ContentWrapper>
    </Wrapper>
  )
}
