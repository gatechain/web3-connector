import { ConnectionType } from "./types";
export { useWeb3React, useNonEVMReact } from "./useWeb3ReactHook";
export { useWeb3State, Web3StateProvider } from "./hooks/useWeb3State";
export { ConnectionType };
export declare function connectWallet(connectionType: ConnectionType, resolve?: (uri: string) => void, reject?: (err: Error) => void): void;
export declare function disconnect(): void;
export declare function useEagerlyConnect(onError?: Function): void;
type ISWalletType = "MetaMask" | "TokenPocket";
export interface EthereumProvider {
    isMetaMask?: boolean;
    isTokenPocket?: boolean;
    [key: string]: any;
}
export declare const isWallet: (params: ISWalletType) => boolean;
