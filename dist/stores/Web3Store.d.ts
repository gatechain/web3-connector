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
}
type StoreState = Web3State & Web3Actions;
export declare const store: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<StoreState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<StoreState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: StoreState) => void) => () => void;
        onFinishHydration: (fn: (state: StoreState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<StoreState, unknown>>;
    };
}>;
export declare const useWeb3Store: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<StoreState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<StoreState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: StoreState) => void) => () => void;
        onFinishHydration: (fn: (state: StoreState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<StoreState, unknown>>;
    };
}>;
export {};
