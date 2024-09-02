interface AirdropOption {
    name:string,
    dataBaseUrl:string,
}

export const AIRDROP_OPTIONS = [
    {
        name:"COW",
        dataBaseUrl:"https://raw.githubusercontent.com/bleu/cow-airdrop-token-mock/main/mock-airdrop-data/",
    },
    {
        name:"OTHER",
        link:"",
    }
] as AirdropOption[]