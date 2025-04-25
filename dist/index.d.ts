import { ConnectionType } from './types';
export { useWeb3React } from './useWeb3ReactHook';
export { ConnectionType };
export declare function connectWallet(connectionType: ConnectionType, resolve?: (uri: string) => void, reject?: (err: Error) => void): void;
export declare function disconnect(): void;
export declare function useEagerlyConnect(onError?: Function): void;
type ISWalletType = 'MetaMask' | 'TokenPocket';
export interface EthereumProvider {
    isMetaMask?: boolean;
    isTokenPocket?: boolean;
    [key: string]: any;
}
export declare const isWallet: (params: ISWalletType) => boolean;
