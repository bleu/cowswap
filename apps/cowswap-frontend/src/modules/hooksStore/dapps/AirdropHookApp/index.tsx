import { useCallback, useContext, useEffect, useState } from 'react'

import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import { CowHook, HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { ContentWrapper } from './components/ContentWrapper'
import { Dropdown, DropdownButton, DropdownContent, SelectButton } from './components/DropDown'
import { Header } from './components/Header'
import { Link } from './components/Link'
import { Row } from './components/Row'
import { Wrapper } from './components/Wrapper'
import { AIRDROP_OPTIONS, AirdropOption } from './constants'
import { RowType, usePreviewClaimableTokens } from './hooks/usePreviewClaimableTokens'

import { HookDappContext } from '../../context'
import { useVirtualTokenAirdropContract } from './hooks/useAirdropContract'

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

export interface IClaimData extends RowType {
  isClaimed: boolean
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
  const [claimData, setClaimData] = useState<IClaimData>()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const previewClaimableTokens = usePreviewClaimableTokens()
  const { account } = useWalletInfo()

  const airdropContract = useVirtualTokenAirdropContract(selectedAirdrop?.addressesMapping)

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
    setIsLoading(true)
    setSelectedAirdrop(airdrop)
    setDropDownText(airdrop.name)
    setShowDropdown(false)

    const dataBaseUrl = airdrop.dataBaseUrl
    console.log('database url:', dataBaseUrl, typeof dataBaseUrl)

    if (!(account && dataBaseUrl)) return

    const address = account.toLowerCase()

    const newClaimData = await previewClaimableTokens({ dataBaseUrl, address })

    const isClaimed = claimData?.index ? await airdropContract?.isClaimed(claimData.index) : false

    setClaimData({ ...newClaimData, isClaimed: !!isClaimed } as IClaimData) // TODO: improve this type with errors on preview claimable tokens

    setIsLoading(false)
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
    if (claimData?.amount && claimData?.isClaimed) {
      setMessage(`You have already claimed ${claimData.amount} tokens`)
    }
    if (claimData?.amount && !claimData?.isClaimed) {
      setMessage(`You have ${claimData.amount} tokens to claim`)
    }
    if (!claimData?.amount) {
      setMessage('No tokens to claim')
    }
    if (!account) {
      setMessage('Please log in to check claimable tokens')
    }
  }, [claimData, account])

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
      <ButtonPrimary onClick={clickOnAddHook}>+Add Pre-hook</ButtonPrimary>
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
