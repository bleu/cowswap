import { findIntervalKey } from "../hooks/usePreviewClaimableTokens";

function testFindIntervalKey() {

    const testIntervals = {
        "b":"c",
        "d":"e",
        "g":"h",
    }

    const expectedResults = [
        {name:"bcdefg", expectedOutput:"b"},
        {name:"e", expectedOutput:"d"},
        {name:"g", expectedOutput:"g"},
        {name:"a", expectedOutput:undefined},
        {name:"f", expectedOutput:undefined},
        {name:"z", expectedOutput:undefined},
    ]

    console.log('Testing findIntervalKey...')
    console.log('Intervals to test:')
    console.log(testIntervals, '\n')

    expectedResults.map(expectedResult => {
        const result = findIntervalKey(expectedResult.name,testIntervals);
        console.log(`Expecting result for ${expectedResult.name} to be equal ${expectedResult.expectedOutput}`)
        console.log(`Got output: ${result}`)
        console.log(`Passed: ${result === expectedResult.expectedOutput}`)
        console.log('--------------------------------\n')
    })

}