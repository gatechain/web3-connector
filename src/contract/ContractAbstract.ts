import { Signer, providers } from "ethers"
import { Config, HipoContract } from "./index"

export enum Contracts {
	perpetualContract = 'perpetualContract'
}

abstract class ContractAbstract {
	public chainId
	public config: Config
	public contract: HipoContract
	
	public Contracts = Contracts

	constructor(props: any) {
		this.config = props.config
		this.chainId = props.chainId
		this.contract = props.contract
	}

	public getContractAddress (contractKey: Contracts) {
		return this.config[this.chainId][contractKey].address
	}
	
}

export default ContractAbstract