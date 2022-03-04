import { Signer, providers } from "ethers"
import { Config, HipoContract } from "./index"

export enum Contracts {
	perpetualContract = 'perpetualContract'
}

abstract class ContractAbstract {
	public chainId
	public config: Config
	public signer: Signer
	public provider: providers.Provider
	public currAccount: string
	public contract: HipoContract
	
	public Contracts = Contracts

	constructor(props: any) {
		this.config = props.config
		this.chainId = props.chainId
		this.provider = props.provider
		this.currAccount = props.currAccount
		this.signer = props.provider.getSigner()
		this.contract = props.contract
	}

	public getContractAddress (contractKey: Contracts) {
		return this.config[this.chainId][contractKey].address
	}
}

export default ContractAbstract