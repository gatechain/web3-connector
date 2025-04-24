import { Web3Provider } from '@ethersproject/providers';
import { ConnectionType, Network } from '../types';
export interface Web3State {
    chainId?: number;
    isActive: boolean;
    isActivating: boolean;
    account?: string;
    accounts: string[];
    gateAccountInfo?: any;
    currentWallet?: ConnectionType;
    connector?: any;
    network?: Network;
    provider: Web3Provider | null;
}
export interface Web3Actions {
    updateStore: (update: Partial<Web3State>) => void;
    reset: () => void;
    connect: (connectionType: ConnectionType) => Promise<void>;
    disconnect: () => void;
}
type StoreState = Web3State & Web3Actions;
export declare const store: import("zustand/vanilla").StoreApi<StoreState>;
export declare const useWeb3Store: () => StoreState;
export {};
