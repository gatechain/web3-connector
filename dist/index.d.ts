import { AbstractWallet } from './connectors/AbstractWallet';
import { ConnectionType } from './types';
export { useWalletStatus } from './hooks/useWalletStatus';
export declare function connectWallet(connectionType: ConnectionType, resolve?: (uri: string) => void, reject?: (err: Error) => void): void;
export { getConnector };
declare function getConnector(connectionType: ConnectionType, resolve?: (uri: string) => void): AbstractWallet;
export declare function disconnect(): void;
type ISWalletType = 'MetaMask' | 'TokenPocket';
export interface EthereumProvider {
    isMetaMask?: boolean;
    isTokenPocket?: boolean;
    [key: string]: any;
}
export declare const isWallet: (params: ISWalletType) => boolean;
export { ConnectionType };
