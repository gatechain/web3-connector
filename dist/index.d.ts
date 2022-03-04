export * from '@web3-react/core';
export * from '@web3-react/types';
export * from '@web3-react/walletlink';
export * from '@web3-react/walletconnect';
export * from '@web3-react/network';
export * from './metamask';
import { MetaMask } from './metamask';
import { Web3ReactHooks } from '@web3-react/core';
import { WalletLink } from '@web3-react/walletlink';
import { Connector } from '@web3-react/types';
import { Network } from '@web3-react/network';
export declare const network: Network, hooks: Web3ReactHooks;
export declare const metaMask: MetaMask, metaMaskHooks: Web3ReactHooks;
export declare const walletLink: WalletLink, walletLinkHooks: Web3ReactHooks;
export declare type WalletType = 'metaMask' | 'walletLink' | 'WalletConnect';
export declare function init(): void;
export declare class HipoWallet {
    static connector: Connector | null;
    static getHooks: (walletType: WalletType) => Web3ReactHooks;
    static init: typeof init;
    static connect(walletType: WalletType): any;
    static disconnect(walletType: WalletType): void;
}
