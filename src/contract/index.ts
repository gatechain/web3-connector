import Perpetual from "./Perpetual";
import { Signer, providers } from "ethers"
import { ERC20 } from "./ERC20";

export interface Config {
	[key: number]: {
	  perpetualContract: {
		address: string
	  },
	  [key: string]: any,
	}
}


export class HipoContract {
	public signer: Signer
	public perpetual: Perpetual
	public ERC20: ERC20
	public config: Config

	constructor (props: any) {
		const resultPorps = {
			...props,
			contract: this
		}
		this.signer = props.provider.getSigner()
		this.perpetual = new Perpetual(resultPorps)
		this.ERC20 = new ERC20(resultPorps)
		this.config = props.config
	}
	
	public sign (value: string) {
		return this.signer.signMessage(value)
	}
}