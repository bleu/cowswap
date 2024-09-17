import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

interface SliderFillProps {
  percentage: number
}

export interface SliderProps {
  title?: string
}

export const SliderContainer = styled.div`
  width: 100%;
  margin: 20px auto;
`

export const SliderContent = styled.div`
  display: flex;
  align-items: center;
`

export const SliderInputContainer = styled.div`
  position: relative;
  width: 100%;
  height: 15px;
`

export const SliderTrack = styled.div`
  width: 100%;
  height: 5px;
  background: var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 5px;
  position: absolute;
  top: 60%;
  transform: translateY(-50%);
  left: 0;
`

export const SliderFill = styled.div<SliderFillProps>`
  height: 5px;
  background-color: var(${UI.COLOR_PRIMARY_OPACITY_50});
  border-radius: 2.5px;
  position: absolute;
  top: 60%;
  left: 0;
  transform: translateY(-50%);
  width: ${(props) => props.percentage}%;
`

export const SliderInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  background: transparent;
  outline: none;
  transition: opacity 0.2s;
  position: relative;
  z-index: 2;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(${UI.COLOR_PRIMARY});
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(${UI.COLOR_PRIMARY});
    cursor: pointer;
  }
`

export const SliderValue = styled.div`
  min-width: 40px;
  text-align: right;
  margin-left: 15px;
  font-size: var(${UI.FONT_SIZE_NORMAL});
`
