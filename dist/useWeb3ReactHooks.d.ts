export declare const useWeb3React: () => unknown;
export declare const useNonEVMReact: () => {
    isConnected: any;
    isConnecting: any;
    address: any;
    gateAcountInfo: any;
    chainId: any;
    connector: any;
    connectiorName: any;
};
declare global {
    interface Window {
        ethereum?: {
            on(event: string, callback: (...args: any[]) => void): void;
            removeListener(event: string, callback: (...args: any[]) => void): void;
        };
    }
}
export declare const updateWalletState: any, handleAccountsChanged: any, handleChainChanged: any, resetState: any;
