import { AbstractWallet } from "./AbstractWallet";
declare class GateWallet extends AbstractWallet {
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
    static instance: GateWallet;
    static getInstance(): GateWallet;
}
export default GateWallet;
