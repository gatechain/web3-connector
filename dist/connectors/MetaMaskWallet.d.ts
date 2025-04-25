import { AddEthereumChainParameter } from '@web3-react/types';
import { AbstractWallet } from './AbstractWallet';
declare class MetaMaskWallet extends AbstractWallet {
    provider: any;
    constructor();
    detectProvider(): Promise<void>;
    private initialize;
    private handleAccountsChanged;
    private handleConnectEvent;
    private handleChainChanged;
    activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<any>;
    connectEagerly(): Promise<void>;
    deactivate(): void;
    static instance: MetaMaskWallet;
    static getInstance(): MetaMaskWallet;
}
export default MetaMaskWallet;
