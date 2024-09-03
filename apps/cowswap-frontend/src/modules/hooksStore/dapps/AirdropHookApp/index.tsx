import { useCallback, useContext, useEffect, useState } from 'react'

import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import { CowHook, HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { ethers } from 'ethers'
import { errors } from './hooks/usePreviewClaimableTokens'

import SVG from 'react-inlinesvg'

import { ContentWrapper } from './components/ContentWrapper'
import { Dropdown, DropdownButton, DropdownContent, SelectButton } from './components/DropDown'
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

function formatWeiToEth(weiValue: string) {
  const ethValue = ethers.utils.formatEther(BigInt(weiValue))
  const [whole, decimal] = ethValue.split('.')
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formattedDecimal = decimal.padEnd(4, '0').slice(0, 4)
  return `${formattedWhole}.${formattedDecimal}`
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
  const [dropDownText, setDropDownText] = useState('Select your airdrop')
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
    const newIsClaimed = await airdropContract?.isClaimed(newClaimData.index) // TODO: test what happens if the tokens are already claimed
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
        outputTokens: undefined, // TODO: Simulate and extract the output tokens
      },
      true
    )
  }, [hook, hookDappContext])

  async function handleSelectAirdrop(airdrop: AirdropOption) {
    setSelectedAirdrop(airdrop)
    setDropDownText(airdrop.name)
    setShowDropdown(false)
  }

  function DropDownMenu() {
    return (
      <Dropdown>
        <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
          {dropDownText}
          <SVG src={ICON_ARROW_DOWN} />
        </DropdownButton>
        {showDropdown && (
          <DropdownContent>
            {AIRDROP_OPTIONS.map((airdrop) => {
              return <SelectButton onClick={() => handleSelectAirdrop(airdrop)}>{airdrop.name}</SelectButton>
            })}
          </DropdownContent>
        )}
      </Dropdown>
    )
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
      const tokenAmount = formatWeiToEth(claimData.amount)
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
          <DropDownMenu />
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
