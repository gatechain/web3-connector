type ISWalletType = "MetaMask" | "TokenPocket";
export interface EthereumProvider {
    isMetaMask?: boolean;
    isTokenPocket?: boolean;
    [key: string]: any;
}
export declare const isWallet: (params: ISWalletType) => boolean;
export declare const delay: (t: number) => Promise<unknown>;
export {};
