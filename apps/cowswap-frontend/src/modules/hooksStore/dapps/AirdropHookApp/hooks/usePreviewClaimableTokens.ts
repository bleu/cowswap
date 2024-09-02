import { current } from "@reduxjs/toolkit";
import { useCallback } from "react"

interface PreviewClaimableTokensParams {
    dataBaseUrl:string,
    address:string,
}

export function findIntervalKey(name:string, intervals:object) {
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


export const usePreviewClaimableTokens = () => {

    const previewClaimableTokens = useCallback(async ({dataBaseUrl,address}: PreviewClaimableTokensParams) => {
        console.log(dataBaseUrl + 'mapping.json')
        const response = await fetch(dataBaseUrl + 'mapping.json')
        const intervals = await response.json()
        console.log(intervals)
        let intervalKey
        if (intervals) {
            intervalKey = findIntervalKey(address, intervals)
            console.log('intervalKey:',intervalKey)

            console.log(`${dataBaseUrl}'chunks/${intervalKey}.json`)
            const response2 = await fetch(`${dataBaseUrl}chunks/${intervalKey}.json`)
            const chunkData = await response2.json()
            if (address.toLowerCase() in chunkData) {
                const claimData = chunkData[address.toLowerCase()]
                console.log('claimData: ',claimData)

                const airDropData = claimData.filter((row) => row.type == 'Airdrop')
                console.log(airDropData)
                return airDropData[0].amount
            } else {
                console.log('Address is in interval, but not in chunk')
            }
        } else {
            console.log('there are no intervals')
        }

    }, []);

    

    return previewClaimableTokens;
}