import { useCallback } from 'react'

export interface PreviewClaimableTokensParams {
  dataBaseUrl: string
  address: string
}

type IntervalsType = { [key: string]: string }

export interface RowType {
  index: number
  type: string
  amount: string
  proof: any[]
}

type ChunkDataType = { [key: string]: RowType[] }

export const errors = {
  NO_CLAIMABLE_TOKENS: "You don't have claimable tokens",
  ERROR_FETCHING_DATA: 'There was an error trying to load claimable tokens',
  NO_CLAIMABLE_AIRDROPS: 'You possibly have other items to claim, but not Airdrops',
  UNEXPECTED_WRONG_FORMAT_DATA: 'Unexpected error fetching data: wrong format data',
}

/*
function to check if a name is inside a interval
intervals is in the format: {
    "name1":"name2",
    "name3":"name4",
    ...
}
name4 > name3 > name2 > name1

returns the interval key if the condition is checked, else undefined
*/
export function findIntervalKey(name: string, intervals: IntervalsType) {
  const keys = Object.keys(intervals)
  const numberOfKeys = keys.length
  let currentKeyIndex = 0
  let found = false
  while (!found) {
    const currentKey = keys[currentKeyIndex]
    if (currentKey <= name && intervals[currentKey] >= name) {
      return currentKey
      found = true
    }
    // Quit at once when verifying that name will not be in the intervals
    // Imagine searching for "Albert" in a phone list, but you've finished the "A" section
    if (currentKey > name) {
      return undefined
    }
    currentKeyIndex += 1
    if (currentKeyIndex > numberOfKeys) {
      return undefined
    }
  }
  return undefined
}

const fecthIntervals = async (dataBaseUrl: string): Promise<IntervalsType> => {
  const response = await fetch(dataBaseUrl + 'mapping.json')
  const intervals = await response.json()
  return intervals
}

const fetchChunk = async (dataBaseUrl: string, intervalKey: string): Promise<ChunkDataType> => {
  const response = await fetch(`${dataBaseUrl}chunks/${intervalKey}.json`)
  const chunkData = await response.json()
  return chunkData
}

export const usePreviewClaimableTokens = () => {
  const previewClaimableTokens = async ({
    dataBaseUrl,
    address,
  }: PreviewClaimableTokensParams): Promise<RowType | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let errorWhileFetching = false
    const intervals = await fecthIntervals(dataBaseUrl).catch((error) => {
      errorWhileFetching = true
    })

    // Error fetching intervals
    if (errorWhileFetching || !intervals) throw new Error(errors.ERROR_FETCHING_DATA)

    const intervalKey = findIntervalKey(address, intervals)

    // Interval key is undefined (user address is not in intervals)
    if (!intervalKey) throw new Error(errors.NO_CLAIMABLE_TOKENS)

    const chunkData = await fetchChunk(dataBaseUrl, intervalKey).catch((error) => {
      errorWhileFetching = true
    })
    const addressLowerCase = address.toLowerCase()

    // Error fetching chunks
    if (errorWhileFetching || !chunkData) throw new Error(errors.ERROR_FETCHING_DATA)

    // The user address is not listed in chunk
    if (!(addressLowerCase in chunkData)) throw new Error(errors.NO_CLAIMABLE_TOKENS)

    const claimData = chunkData[addressLowerCase]

    const airDropData = claimData.filter((row: RowType) => row.type == 'Airdrop')
    // The user has other kind of tokens, but not airdrops
    if (airDropData.length < 1) throw new Error(errors.NO_CLAIMABLE_AIRDROPS)

    return airDropData[0]
  }

  return previewClaimableTokens
}
