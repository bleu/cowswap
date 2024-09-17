import { HookDappInternal, HookDappType } from 'modules/hooksStore/types/hooks'

import withdrawImage from './icon.png'

import { WithdrawHookApp } from './index'

const Description = () => {
  return (
    <>
      <p>
        Reduce or withdraw liquidity from a pool before a token swap integrating the process{' '}
        <b>directly into the transaction flow.</b> By adjusting your liquidity ahead of time, you gain{' '}
        <b>more control over your assets</b> without any extra steps.
      </p>
      <br />
      <p>
        Optimize your position in a pool, all in one seamless action —{' '}
        <b>no need for multiple transactions or added complexity.</b>
      </p>
    </>
  )
}

export const PRE_WITHDRAW_COW_AMM: HookDappInternal = {
  name: 'Withdraw Liquidity',
  description: <Description />,
  descriptionShort: 'Exit the pool or decrease liquidity before the swap',
  type: HookDappType.INTERNAL,
  image: withdrawImage,
  component: (props) => <WithdrawHookApp {...props} />,
  version: '0.1.0',
  website: 'https://balancer.fi/pools/cow',
}
