import { AddEthereumChainParameter } from '@web3-react/types';
import { AbstractWallet } from './AbstractWallet';
declare class GateAppWallet extends AbstractWallet {
    provider: any;
    constructor();
    detectProvider(timeout?: number): Promise<unknown>;
    private initialize;
    connectEagerly(): Promise<void>;
    activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<any>;
    private handleGateAccountChange;
    private handleAccountsChanged;
    private handleConnectEvent;
    private handleChainChanged;
    deactivate(): void;
    static instance: GateAppWallet;
    static getInstance(): GateAppWallet;
}
export default GateAppWallet;
