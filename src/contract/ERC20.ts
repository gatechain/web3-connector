import { BigNumber } from "@ethersproject/bignumber";
import { Signer, providers, Contract } from "ethers"
import { fixedToInt } from "../utils";
import ERC20ABI from './abis/ERC20'
import ContractAbstract, { Contracts } from "./ContractAbstract";

enum ApproveStatus {
	Approve,
	dontApprove,
}

export function getERC20Contract(token: string, signerOrProvider?: Signer | providers.Provider) {
	return new Contract(token, ERC20ABI, signerOrProvider);
}

async function getERC20(token: string, provider: providers.Provider) {
	const contract = getERC20Contract(token, provider);
	const decimals = await contract.decimals()
	return { decimals, contract }
}

export class ERC20 extends ContractAbstract {
	constructor(props: any) {
		super(props)
	}
	public getERC20Contract = getERC20Contract

	public getContractAddress(contractKey: Contracts) {
		return this.config[this.chainId][contractKey].address
	}

	// 查授权额度 
	public async getTokenAllowance(token: string, spender: string): Promise<BigNumber> {
		const contract = getERC20Contract(token, this.contract.provider);
		const allowance = await contract.allowance(this.contract.currAccount, spender)
		return allowance
	}

	// 授权
	public async approve(token: string, spender: string, value: string): Promise<any> {
		try {
			const { decimals, contract } = await getERC20(token, this.contract.provider);
			if (this.contract.signer) {
				const signerContract = contract.connect(this.contract.signer);
				const tx = await signerContract.approve(spender, fixedToInt(value, decimals));
				return tx;
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * 查看授权状态
	 */
	public async getApproveStatus(token: string, spender: string, value: string) {
		try {
			const allowance = await this.getTokenAllowance(token, spender)
			const { decimals } = await getERC20(token, this.contract.provider);
			const bigValue = BigNumber.from(fixedToInt(value, decimals))
			return allowance.gte(bigValue) ? ApproveStatus.dontApprove : ApproveStatus.Approve
		} catch (error) {
			throw error
		}
	}
}

export default ContractAbstract