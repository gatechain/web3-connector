import { AbstractWallet } from './AbstractWallet';
declare class UnisatWallet extends AbstractWallet {
    provider: any;
    constructor();
    detectProvider(timeout?: number): Promise<unknown>;
    private initialize;
    private handleNetworkChanged;
    connectEagerly(): Promise<void>;
    activate(): Promise<void>;
    private handleAccountsChanged;
    deactivate(): void;
    static instance: UnisatWallet;
    static getInstance(): UnisatWallet;
}
export default UnisatWallet;
