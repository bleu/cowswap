import { current } from "@reduxjs/toolkit";
import { useCallback } from "react"

interface PreviewClaimableTokensParams {
    dataBaseUrl:string,
    address:string,
}

type IntervalsType = {[key: string]: string}

interface RowType {
  index:number,
  type:string,
  amount:string,
  proof: any[],
}

type ChunkDataType = {[key:string]:RowType[]}


export function findIntervalKey(name:string, intervals:IntervalsType) {
    /* function to check if a name is inside a interval
    intervals is in the format: {
        "name1":"name2",
        "name3":"name4",
        ...
    }
    name4 > name3 > name2 > name1

    returns the interval key if the condition is checked, else undefined
    */
    const keys = Object.keys(intervals);
    const numberOfKeys = keys.length
    let currentKeyIndex = 0
    let found = false
    while (!found) {
      const currentKey = keys[currentKeyIndex];
      if ((currentKey <= name) && (intervals[currentKey] >= name)) {
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
        return undefined;
      }
    }
    return undefined;
  }

const fecthIntervals = async (dataBaseUrl:string):Promise<IntervalsType> => {
  // console.log(dataBaseUrl + 'mapping.json')
  const response = await fetch(dataBaseUrl + 'mapping.json')
  const intervals = await response.json()
  console.log(intervals)
  return intervals
}

const fetchChunk = async (dataBaseUrl:string,intervalKey:string):Promise<ChunkDataType> => {
    const response = await fetch(`${dataBaseUrl}chunks/${intervalKey}.json`)
    const chunkData = await response.json()
    return chunkData
}

function parseAmount(weiAmount:string) {
  const tokenAmount = Number(weiAmount) / 10**18
    return tokenAmount.toFixed(4)
}

export const usePreviewClaimableTokens = () => {

    const previewClaimableTokens = useCallback(
      async({
        dataBaseUrl,
        address
      }: PreviewClaimableTokensParams
      ):Promise<string | undefined | void> => {
      
      let errorWhileFetching = false
      const intervals = await fecthIntervals(dataBaseUrl)
        .catch(error => {errorWhileFetching = true} )

      // Error fetching intervals
      if (errorWhileFetching || (!intervals)) return 'Failed to check claimable tokens.'

      const intervalKey = findIntervalKey(address, intervals)
      console.log('intervalKey:',intervalKey)
      
      // Interval key is undefined (user address is not in intervals)
      if (!intervalKey) return 'Your address does not have claimable tokens'

      console.log(`${dataBaseUrl}'chunks/${intervalKey}.json`)
      
      const chunkData = await fetchChunk(dataBaseUrl,intervalKey)
        .catch(error => {errorWhileFetching = true})
      const addressLowerCase = address.toLowerCase()
      
      // Error fetching chunks
      if (errorWhileFetching || (!chunkData)) return "Failed to check claimable tokens"

      // The user address is not listed in chunk
      if (!(addressLowerCase in chunkData)) return 'Your address does not have claimable tokens'
      
      const claimData = chunkData[addressLowerCase]
      console.log('claimData: ',claimData)

      const airDropData = claimData.filter((row:RowType) => row.type == 'Airdrop')
      console.log(airDropData)
      
      // The user has other kind of tokens, but not airdrops
      if (airDropData.length < 1) return "Your address does not have claimable tokens"

      return `You have ${parseAmount(airDropData[0].amount)} tokens to claim`

    }, []);

    

    return previewClaimableTokens;
}