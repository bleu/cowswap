import { useCallback, useContext, useEffect, useState } from 'react'

import { CowHook, HookDappInternal, HookDappType } from '@cowprotocol/types'
import { HookDappContext } from '../../context'

import { AIRDROP_OPTIONS } from './constants'
import { usePreviewClaimableTokens } from './hooks/usePreviewClaimableTokens'

import { ButtonPrimary } from '@cowprotocol/ui'
import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import SVG from 'react-inlinesvg'
import { Dropdown, DropdownButton, DropdownContent, SelectButton } from './components/DropDown'
import {Wrapper} from "./components/Wrapper"
import { Header } from './components/Header'
import { ContentWrapper } from './components/ContentWrapper'
import { Row } from './components/Row'
import { Link } from './components/Link'

type ClaimableAmount = string | undefined

const NAME = 'Airdrop'
const DESCRIPTION = 'Claim an aidrop before swapping!'
const IMAGE_URL = "https://static.vecteezy.com/system/resources/previews/017/317/302/original/an-icon-of-medical-airdrop-editable-and-easy-to-use-vector.jpg"

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
  const [selectedAirdrop, setSelectedAirdrop] = useState({})
  const [dropDownText, setDropDownText] = useState("Select your airdrop")
  const [claimableAmount, setClaimableAmount ] = useState<ClaimableAmount>(undefined)
  const previewClaimableTokens = usePreviewClaimableTokens()
  const link = AIRDROP_OPTIONS[0].link
  const address = "0xa90914762709441d557De208bAcE1edB1A3968b2"
  
  useEffect(() => {
    console.log('Running preview claimable tokens')
    console.log(previewClaimableTokens({link,address}))
  }, [])
  

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

  async function handleSelectAirdrop(airdrop:any) {
    setSelectedAirdrop(airdrop)
    setDropDownText(airdrop.name)
    setShowDropdown(false)

    const newClaimableAmount = await previewClaimableTokens({link,address})
    console.log('new claimable amount:',newClaimableAmount)
    setClaimableAmount(newClaimableAmount)
  }

  function DropDownMenu() {

    return (
        <Dropdown>
        <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        {dropDownText}<SVG src={ICON_ARROW_DOWN} />
        </DropdownButton>
        {showDropdown && (
        <DropdownContent>
            {AIRDROP_OPTIONS.map((airdrop) => {
                return (
                    <SelectButton
                    onClick={() => handleSelectAirdrop(airdrop)}
                    >
                        {airdrop.name}
                    </SelectButton>
                )
            })}
        </DropdownContent>
        )}
        </Dropdown>
    )
}

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
        <Row>
          claimable amount: {claimableAmount}
        </Row>
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