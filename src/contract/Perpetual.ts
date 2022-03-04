import { Contract } from "ethers";
import Abi from './abis/Perpetual'
import { fixedToInt, intToFixed } from "../utils";
import ContractAbstract from "./ContractAbstract";
export default class Perpetual extends ContractAbstract {
	constructor(props: any){
		super(props)
	}
	//充值合约
	public getPerpetualContract() {
		try {
			return new Contract(this.getContractAddress(this.Contracts.perpetualContract), Abi, this.contract.signer)
		} catch (error) {
			throw error
		}
	}

	async getGasLimit(contract: Contract, method: string, args: any) {
		try {
			const options = { from: this.contract.currAccount }
			const gasLimit = await contract.estimateGas[method](...args, options);
			return gasLimit.toString();
		} catch (error) {
			throw error
		}
	}

	// 充值
	async deposit(token: string, amount: string) {
		try {
			const contract = this.getPerpetualContract()
			const erc20 = this.contract.ERC20.getERC20Contract(token, this.contract.provider)
			const decimals = await erc20.decimals()
			const amountBig = fixedToInt(amount, decimals)
			return await contract.deposit(this.contract.currAccount, token, amountBig)
		} catch (error) {
			throw error
		}
	}

	// 提现
	async withdraw(token: string) {
		try {
			const contract = this.getPerpetualContract()
			return await contract.withdraw(this.contract.currAccount, token)
		} catch (error) {
			throw error
		}
	}

	// 获取可提现余额
	async getWithdrawalBalance(token: string) {
		try {
			const contract = this.getPerpetualContract()
			const erc20 = this.contract.ERC20.getERC20Contract(token, this.contract.provider)
			const decimals = await erc20.decimals()
			const balanceBig = await contract.getWithdrawalBalance(this.contract.currAccount, token)
			return intToFixed(balanceBig, decimals)
		} catch (error) {
			throw error	
		}
	}
}
