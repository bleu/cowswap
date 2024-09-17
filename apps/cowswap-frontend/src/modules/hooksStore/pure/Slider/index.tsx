import { Label } from 'modules/hooksStore/styled'

import {
  SliderContainer,
  SliderContent,
  SliderFill,
  SliderInput,
  SliderInputContainer,
  SliderTrack,
  SliderValue,
} from './styled'

export const Slider = ({
  value,
  setValue,
  title,
  isPercentage = true,
}: {
  value: number
  setValue: (value: number) => void
  title: string
  isPercentage?: boolean
}) => {
  return (
    <SliderContainer>
      <Label>{title}</Label>
      <SliderContent>
        <SliderInputContainer>
          <SliderTrack />
          <SliderFill percentage={value} />
          <SliderInput
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </SliderInputContainer>
        <SliderValue>
          {value}
          {isPercentage && '%'}
        </SliderValue>
      </SliderContent>
    </SliderContainer>
  )
}
