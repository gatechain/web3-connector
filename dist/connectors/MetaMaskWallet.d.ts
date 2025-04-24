import { AbstractWallet } from "./AbstractWallet";
import { AddEthereumChainParameter } from "@web3-react/types";
declare class MetaMaskWallet extends AbstractWallet {
    constructor();
    provider: any;
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
