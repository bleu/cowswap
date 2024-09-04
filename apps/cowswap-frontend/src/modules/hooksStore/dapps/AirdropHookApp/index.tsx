import { useCallback, useContext, useEffect, useState } from 'react'

import { CowHook, HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import { errors } from './hooks/usePreviewClaimableTokens'

import { ContentWrapper } from './components/ContentWrapper'
import { DropDownMenu } from './components/DropDown'
import { Header } from './components/Header'
import { Link } from './components/Link'
import { Row } from './components/Row'
import { Wrapper } from './components/Wrapper'
import { AIRDROP_OPTIONS, AirdropOption } from './constants'
import {
  type PreviewClaimableTokensParams,
  type RowType,
  usePreviewClaimableTokens,
} from './hooks/usePreviewClaimableTokens'

import { HookDappContext } from '../../context'
import { useVirtualTokenAirdropContract } from './hooks/useAirdropContract'
import useSWR from 'swr'
import { Fraction } from '@uniswap/sdk-core'

const NAME = 'Airdrop'
const DESCRIPTION = 'Claim an aidrop before swapping!'
const IMAGE_URL =
  'https://static.vecteezy.com/system/resources/previews/017/317/302/original/an-icon-of-medical-airdrop-editable-and-easy-to-use-vector.jpg'

const dropdownInitialText = 'Select your airdrop'

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
  const [hook, setHook] = useState<CowHook>({
    target: 'test',
    callData: 'test',
    gasLimit: 'test',
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropOption>()
  const [dropDownText, setDropDownText] = useState(dropdownInitialText)
  const [claimData, setClaimData] = useState<RowType>({} as RowType)
  const [isClaimed, setIsClaimed] = useState(false)
  const [message, setMessage] = useState('')
  const previewClaimableTokens = usePreviewClaimableTokens()
  const { account } = useWalletInfo()

  const airdropContract = useVirtualTokenAirdropContract(selectedAirdrop?.addressesMapping)

  const previewClaimableTokensAndCheckIfClaimed = async ({ dataBaseUrl, address }: PreviewClaimableTokensParams) => {
    const newClaimData = await previewClaimableTokens({ dataBaseUrl, address })
    if (!newClaimData) throw new Error(errors.ERROR_FETCHING_DATA)
    if (!newClaimData.index) throw new Error(errors.UNEXPECTED_WRONG_FORMAT_DATA)
    const newIsClaimed = await airdropContract?.isClaimed(newClaimData.index)
    if (newIsClaimed) setIsClaimed(newIsClaimed)
    setClaimData(newClaimData)
    return newClaimData
  }

  const {
    data: newClaimData,
    error,
    isLoading,
  } = useSWR<RowType | undefined>(
    selectedAirdrop && account
      ? {
          dataBaseUrl: selectedAirdrop.dataBaseUrl,
          address: account.toLowerCase(),
        }
      : null,
    previewClaimableTokensAndCheckIfClaimed,
    { errorRetryCount: 0 }
  )

  useEffect(() => {
    setClaimData(newClaimData ? newClaimData : ({} as RowType))
  }, [newClaimData])

  const clickOnAddHook = useCallback(() => {
    const { callData, gasLimit, target } = hook
    if (!hookDappContext || !callData || !gasLimit || !target) {
      return
    }

    hookDappContext.addHook(
      {
        hook: hook,
        dapp: PRE_AIRDROP,
        outputTokens: undefined,
      },
      true
    )
  }, [hook, hookDappContext])

  async function handleSelectAirdrop(airdrop: AirdropOption) {
    setSelectedAirdrop(airdrop)
    setDropDownText(airdrop.name)
    setShowDropdown(false)
  }

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
      const newMessage = isClaimed
        ? `You have already claimed ${tokenAmount} tokens`
        : `You have ${tokenAmount} tokens to claim`
      setMessage(newMessage)
    }
    if (!claimData?.amount) {
      setMessage("You don't have claimable tokens")
    }
    if (!account) {
      setMessage('Please log in to check claimable tokens')
      return
    }
    if (dropDownText === dropdownInitialText) {
      setMessage('')
    }
  }, [claimData, account, isLoading, error])

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <Header>
        <img src={IMAGE_URL} alt={NAME} width="120" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <Row>
          <DropDownMenu
            airdropOptions={AIRDROP_OPTIONS}
            dropdownText={dropDownText}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            handleSelectAirdrop={handleSelectAirdrop}
          />
        </Row>
        <Row>{message}</Row>
      </ContentWrapper>
      <ButtonPrimary disabled={!(!isClaimed && !!account && !!claimData.amount)} onClick={clickOnAddHook}>
        +Add Pre-hook
      </ButtonPrimary>
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
