import { AbstractWallet } from "./AbstractWallet";
export type ArrayOneOrMore<T> = {
    0: T;
} & Array<T>;
export declare function isArrayOneOrMore<T>(input?: T[]): input is ArrayOneOrMore<T>;
declare class WalletConnect extends AbstractWallet {
    provider: any;
    private readonly defaultChainId;
    constructor({ showQrModal }: {
        showQrModal: boolean;
    });
    private readonly chains;
    private readonly optionalChains;
    protected options: {
        metadata: {
            name: string;
            description: string;
            url: string;
            icons: string[];
        };
        projectId: string;
        chains: number[];
        optionalChains: number[];
        showQrModal: boolean;
        optionalMethods: string[];
        qrModalOptions: {
            explorerRecommendedWalletIds: string[];
            themeVariables: {
                "--wcm-z-index": string;
            };
        };
    };
    private getChainProps;
    detectProvider(desiredChainId?: number | undefined): Promise<unknown>;
    private initialize;
    private handleChainChange;
    protected handleDisplayURI(url: string): void;
    connectEagerly(): Promise<void>;
    activate(desiredChainId?: number): Promise<any>;
    private handleAccountsChanged;
    deactivate(): void;
    static instance: WalletConnect;
    static getInstance(): WalletConnect;
}
export default WalletConnect;
