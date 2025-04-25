import { AbstractWallet } from './AbstractWallet';
declare class GateAppWallet extends AbstractWallet {
    provider: any;
    constructor();
    detectProvider(timeout?: number): Promise<unknown>;
    private initialize;
    connectEagerly(): Promise<void>;
    activate(): Promise<void>;
    private handleGateAccountChange;
    private handleAccountsChanged;
    private handleConnectEvent;
    private handleChainChanged;
    deactivate(): void;
    static instance: GateAppWallet;
    static getInstance(): GateAppWallet;
}
export default GateAppWallet;
