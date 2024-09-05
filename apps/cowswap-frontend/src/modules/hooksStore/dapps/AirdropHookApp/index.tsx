import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { formatTokenAmount } from '@cowprotocol/common-utils'
import { HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Fraction } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ContentWrapper } from './components/ContentWrapper'
import { DropDownMenu } from './components/DropDown'
import { Header } from './components/Header'
import { Link } from './components/Link'
import { Row } from './components/Row'
import { Wrapper } from './components/Wrapper'
import { AIRDROP_OPTIONS, AirdropOption } from './constants'
import { usePreviewClaimableTokens } from './hooks/usePreviewClaimableTokens'

import { useVirtualTokenAirdropContract } from './hooks/useAirdropContract'

import { HookDappContext } from '../../context'

const NAME = 'Airdrop'
const DESCRIPTION = 'Claim an aidrop before swapping!'
const IMAGE_URL =
  'https://static.vecteezy.com/system/resources/previews/017/317/302/original/an-icon-of-medical-airdrop-editable-and-easy-to-use-vector.jpg'

export const PRE_AIRDROP: HookDappInternal = {
  name: NAME,
  description: DESCRIPTION,
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/build',
  image: IMAGE_URL,
  component: <AirdropHookApp />,
  version: '0.1.0',
}

export function AirdropHookApp() {
  const hookDappContext = useContext(HookDappContext)
  const [gasLimit, setgasLimit] = useState<BigNumber | undefined>(undefined)

  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropOption>()
  const VitrualTokenAirdorpContract = useVirtualTokenAirdropContract(selectedAirdrop)
  const { data: claimData, isLoading, error } = usePreviewClaimableTokens(selectedAirdrop)
  const [message, setMessage] = useState('')

  const VitrualTokenAirdorpContractInterface = VitrualTokenAirdorpContract?.interface

  const callData = useMemo(() => {
    if (!hookDappContext?.account || !claimData || !VitrualTokenAirdorpContractInterface) return
    return VitrualTokenAirdorpContractInterface.encodeFunctionData('claim', [
      claimData.index, //index
      0, //claimType
      hookDappContext.account, //claimant
      claimData.amount, //claimableAmount
      claimData.amount, //claimedAmount
      claimData.proof, //merkleProof
    ])
  }, [VitrualTokenAirdorpContractInterface, hookDappContext?.account, claimData])

  useEffect(() => {
    if (!hookDappContext?.account || !claimData) return
    VitrualTokenAirdorpContract?.estimateGas
      .claim(claimData.index, 0, hookDappContext.account, claimData.amount, claimData.amount, claimData.proof)
      .then(setgasLimit)
  }, [claimData])

  const clickOnAddHook = useCallback(() => {
    if (!hookDappContext || !callData || !gasLimit || !selectedAirdrop || !claimData) return

    const hook = {
      target: selectedAirdrop.addressesMapping[hookDappContext.chainId].vToken.address,
      callData: callData,
      gasLimit: gasLimit?.toString(),
    }

    hookDappContext.addHook(
      {
        hook: hook,
        dapp: PRE_AIRDROP,
        outputTokens: [
          CurrencyAmount.fromRawAmount(
            selectedAirdrop.addressesMapping[hookDappContext.chainId].token,
            claimData.amount
          ),
        ],
      },
      true
    )
  }, [hookDappContext, callData, gasLimit])

  const canClaim = claimData?.amount && !claimData?.isClaimed

  useEffect(() => {
    if (isLoading) {
      setMessage('Loading...')
      return
    }
    if (error) {
      setMessage(error.message)
      return
    }
    if (claimData?.amount) {
      const tokenAmount = formatTokenAmount(new Fraction(claimData.amount, 10 ** 18))
      const newMessage = claimData.isClaimed
        ? `You have already claimed ${tokenAmount} tokens`
        : `You have ${tokenAmount} tokens to claim`
      setMessage(newMessage)
    }
    if (!hookDappContext?.account) {
      setMessage('Please log in to check claimable tokens')
      return
    }
    if (!claimData?.amount) {
      setMessage("You don't have claimable tokens")
    }
  }, [claimData, hookDappContext, isLoading, error, selectedAirdrop])

  return (
    <Wrapper>
      <Header>
        <img src={IMAGE_URL} alt={NAME} width="120" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <Row>
          <DropDownMenu airdropOptions={AIRDROP_OPTIONS} setSelectedAirdrop={setSelectedAirdrop} />
        </Row>
        {selectedAirdrop && <Row>{message}</Row>}
      </ContentWrapper>
      <ButtonPrimary disabled={!canClaim || isLoading} onClick={clickOnAddHook}>
        +Add Pre-hook
      </ButtonPrimary>
      <Link
        onClick={(e) => {
          e.preventDefault()
          hookDappContext?.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}
