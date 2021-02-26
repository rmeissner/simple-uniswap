import { ethers, providers } from 'ethers'

const uniswap: Record<string, string> = {
    rinkeby: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
}

export const uniswapContract = async (provider: providers.Provider) => {
    const network = await provider.getNetwork()
    return uniswap[network.name]
}