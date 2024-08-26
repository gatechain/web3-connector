import { AbstractWallet } from "./AbstractWallet";
declare class PhantomWallet extends AbstractWallet {
    provider: any;
    constructor();
    detectProvider(timeout?: number): Promise<unknown>;
    private initialize;
    activate(): Promise<void>;
    connectEagerly(): Promise<void>;
    private handleAccountsChanged;
    private handleConnectEvent;
    deactivate(): void;
    static instance: PhantomWallet;
    static getInstance(): PhantomWallet;
}
export default PhantomWallet;
