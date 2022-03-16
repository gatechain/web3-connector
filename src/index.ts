import * as buffer from 'buffer';

if (!globalThis.Buffer) {
	(globalThis as any).Buffer = buffer.Buffer;
}

export * from '@web3-react/core'
export * from '@web3-react/types';
export * from '@web3-react/walletlink'
export * from '@web3-react/walletconnect'
export * from '@web3-react/network'
export * from './metamask'

import { MetaMask } from './metamask'
import { URLS } from './chains'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { WalletLink } from '@web3-react/walletlink';
import { Connector } from '@web3-react/types';
import { Network } from '@web3-react/network';
import { WalletConnect } from '@web3-react/walletconnect';
export const [network, hooks] = initializeConnector<Network>(
	(actions) => new Network(actions, URLS),
	Object.keys(URLS).map((chainId) => Number(chainId))
)
export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask(actions))
export const [walletLink, walletLinkHooks] = initializeConnector<WalletLink>((actions) =>  new WalletLink(actions, {url: URLS[1][0],appName: 'web3-react'}))
export const [walletConnect, walletConnecthooks] = initializeConnector<WalletConnect>((actions) =>
	  new WalletConnect(actions, {
		rpc: URLS,
	  }),
	Object.keys(URLS).map((chainId) => Number(chainId))
)


export type WalletType = 'metaMask' | 'walletLink' | 'walletConnect'



const walletInstance: any = {
	metaMask,
	walletLink,
	walletConnect
}

const walletHooks: any = {
	metaMask: metaMaskHooks,
	walletLink: walletLinkHooks,
	walletConnect: walletConnecthooks
}

const connectWallet: any = {
	metaMask () {
		return metaMask.activate()
	},
	walletLink () {
		return walletLink.activate()
	},
	walletConnect () {
		return walletConnect.activate()
	}
}

const disConnectWallet: any = {
	metaMask () {
		return metaMask.deactivate()
	},
	walletLink () {
		return walletLink.deactivate()
	},
	walletConnect () {
		return walletConnect.deactivate()
	}
}

export function init () {
	metaMask.connectEagerly()
	walletLink.connectEagerly()
	walletConnect.connectEagerly()
}

export class HipoWallet {
	static connector: Connector | null = metaMask
	static getHooks = (walletType: WalletType): Web3ReactHooks => {
		return walletHooks[walletType] || metaMaskHooks
	}
	static init = init
	static connect (walletType: WalletType) {
		const connectorWallet = connectWallet[walletType]() || null
		HipoWallet.connector = walletInstance[walletType]
		return connectorWallet
	}
	static disconnect(walletType: WalletType) {
		disConnectWallet[walletType]()
	}
}