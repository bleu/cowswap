import { useState } from 'react'

import ICON_CHECKMARK from '@cowprotocol/assets/cow-swap/checkmark.svg'
import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'

import SVG from 'react-inlinesvg'

import { Dropdown, DropdownButton, DropdownContent, SelectButton } from './styled'

interface IItem {
  id: string
  value: string
}

export function DropDownMenu({
  items,
  setSelectedItem,
  text,
}: {
  items: IItem[]
  setSelectedItem: (option: IItem) => void
  text: string
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  function handleSelectItem(item: IItem) {
    setSelectedItem(item)
    setShowDropdown(false)
  }

  return (
    <Dropdown>
      <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        {text}
        <SVG src={ICON_ARROW_DOWN} />
      </DropdownButton>
      {showDropdown && (
        <DropdownContent>
          {items.map((item) => {
            return (
              <SelectButton onClick={() => handleSelectItem(item)} id={item.id} key={item.id}>
                <div>
                  <SVG src={ICON_CHECKMARK} />
                  {item.value}
                </div>
              </SelectButton>
            )
          })}
        </DropdownContent>
      )}
    </Dropdown>
  )
}
