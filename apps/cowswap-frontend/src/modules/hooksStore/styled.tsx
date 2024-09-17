import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  padding-bottom: 1rem;

  flex-grow: 1;
`

export const ContentWrapper = styled.div`
  flex-grow: 1;
  flex-flow: column wrap;

  display: flex;

  gap: 10px;

  text-align: center;
`

export const Row = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  margin: 0.5rem 0;

  label {
    margin: 10px;
    flex-grow: 0;
    width: 5em;
  }

  input,
  textarea {
    flex-grow: 1;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const Label = styled.div`
  text-align: left;
  font-size: var(${UI.FONT_SIZE_NORMAL});
  margin-bottom: 10px;
`
