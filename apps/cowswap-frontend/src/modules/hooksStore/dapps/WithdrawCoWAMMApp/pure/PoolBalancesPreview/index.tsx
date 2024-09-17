import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import { Label } from 'modules/hooksStore/styled'

import { FiatValue } from 'common/pure/FiatValue'

import * as styledEl from './styled'

import { PoolBalance } from '../../types'

export interface PoolBalancesProps {
  poolBalance: PoolBalance[]
  label: string
  backgroundColor?: string
}

export interface PoolBalancePreviewProps {
  id: string
  poolBalance: PoolBalance
}

export function PoolBalancesPreview(props: PoolBalancesProps) {
  const { poolBalance, label, backgroundColor } = props

  return (
    <div>
      <div>
        <Label>{label}</Label>
      </div>
      <styledEl.Wrapper backgroundColor={backgroundColor}>
        {poolBalance.map((poolBalance, index) => (
          <PoolBalancePreview key={index} id={`${label}-${index}`} poolBalance={poolBalance} />
        ))}
      </styledEl.Wrapper>
    </div>
  )
}

export function PoolBalancePreview(props: PoolBalancePreviewProps) {
  const { id, poolBalance } = props

  return (
    <styledEl.Container id={id}>
      <div>
        <styledEl.TokenLogoWrapper>
          <TokenLogo token={poolBalance.token} size={42} />
        </styledEl.TokenLogoWrapper>
      </div>
      <styledEl.Amount>
        <TokenAmount
          className="token-amount-input"
          amount={new Fraction(poolBalance.balance, 1)}
          tokenSymbol={poolBalance.token}
        />
        <FiatValue fiatValue={CurrencyAmount.fromFractionalAmount(poolBalance.token, poolBalance.fiatAmount, 1)} />
      </styledEl.Amount>
    </styledEl.Container>
  )
}
