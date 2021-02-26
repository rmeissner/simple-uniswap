import { ethers, providers, BigNumber, Signer } from 'ethers'

const Erc20 = [
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
    "function decimals() public view returns (uint256)",
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "event Approval(address indexed _owner, address indexed _spender, uint256 _value)"
];
const Erc20Interface = new ethers.utils.Interface(Erc20)

export interface TokenInfo {
    address: string,
    decimals: number,
    name: string,
    symbol: string
}

export const loadTokenAllowance = async(provider: providers.Provider, token: string, owner: string, spender: string): Promise<BigNumber> => {
    const contract = new ethers.Contract(token, Erc20Interface, provider)
    return await contract.allowance(owner, spender)
}

export const loadTokenInfo = async(provider: providers.Provider, address: string): Promise<TokenInfo> => {
    const contract = new ethers.Contract(address, Erc20Interface, provider)
    return {
        address,
        decimals: await contract.decimals(),
        name: await contract.name(),
        symbol: await contract.symbol()
    }
}

export const setAllowance = async(signer: Signer, token: string, spender: string, amount: BigNumber): Promise<void> => {
    const contract = new ethers.Contract(token, Erc20Interface, signer)
    await contract.approve(spender, amount)
}