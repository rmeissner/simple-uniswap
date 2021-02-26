import { ethers, providers, BigNumber, Signer } from 'ethers'
import { uniswapContract } from './config';

const Uniswap = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)"
];
const UniswapInterface = new ethers.utils.Interface(Uniswap)

export const swapTokens = async(signer: Signer, provider: providers.Provider, sellToken: string, buyToken: string, amount: BigNumber): Promise<any> => {
    const uniswapAddress = await uniswapContract(provider)
    const reveiver = await signer.getAddress()
    const contract = new ethers.Contract(uniswapAddress, UniswapInterface, signer)
    return contract.swapExactTokensForTokens(amount, 0, [sellToken, buyToken], reveiver, BigNumber.from("0xFFFFFFFFFFFFFFFF"))
}