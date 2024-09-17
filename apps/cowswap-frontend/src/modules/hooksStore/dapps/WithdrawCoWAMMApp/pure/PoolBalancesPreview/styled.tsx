import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export interface WrapperProps {
  backgroundColor?: string
}

export const Wrapper = styled.div<WrapperProps>`
  padding: 6px 0px;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  border: 1px solid var(${UI.COLOR_BORDER});
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  background-color: ${({ backgroundColor }) => `var(${backgroundColor})` || 'transparent'};

  ${Media.upToSmall()} {
    font-size: 13px;
    letter-spacing: -0.1px;
  }
`

export const Container = styled.div`
  padding: 12px 12px;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;

  ${Media.upToSmall()} {
    font-size: 13px;
    letter-spacing: -0.1px;
  }
`

export const Amount = styled.div`
  font-size: 15px;
  font-weight: 600;
  display: flex;
  flex-flow: column wrap;
  text-align: right;
  gap: 6px;

  // Targets FiatValue
  > div {
    font-weight: 500;
    font-size: 13px;
  }
`

export const TokenLogoWrapper = styled.div`
  display: inline-block;
  border-radius: 50%;
  line-height: 0;
  box-shadow: 0 2px 10px 0 ${({ theme }) => (theme.darkMode ? '#496e9f' : '#bfd6f7')};
`
