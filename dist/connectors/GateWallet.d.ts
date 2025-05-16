import { AddEthereumChainParameter } from '../types';
import { AbstractWallet } from './AbstractWallet';
export declare class GateWallet extends AbstractWallet {
    provider: any;
    constructor();
    detectProvider(timeout?: number): Promise<unknown>;
    private initialize;
    autoConnect(): Promise<void>;
    activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<any>;
    private handleGateAccountChange;
    private handleAccountsChanged;
    private handleConnectEvent;
    private handleChainChanged;
    deactivate(): void;
    static instance: GateWallet;
    static getInstance(): GateWallet;
}
export default GateWallet;
