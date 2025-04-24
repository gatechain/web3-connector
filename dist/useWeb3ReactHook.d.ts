import { ConnectionType } from "./types";
import type { IWeb3Store } from './stores/types';
export declare const store: import("./stores/Web3Store").Web3Store;
export declare function updateStore(update: Partial<IWeb3Store>): void;
export declare function resetStore(): void;
export declare const useWeb3React: () => import("./stores/Web3Store").Web3Store;
export declare const useNonEVMReact: () => {
    isConnected: boolean;
    isConnecting: boolean;
    address: string | undefined;
    gateAcountInfo: any;
    chainId: number | undefined;
    connector: any;
    connectiorName: ConnectionType | undefined;
    connect: (connectionType: ConnectionType) => Promise<void>;
    disconnect: () => void;
};
