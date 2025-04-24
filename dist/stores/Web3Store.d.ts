import { Web3Provider } from '@ethersproject/providers';
import { ConnectionType, Network } from '../types';
import type { IWeb3Store, IRootStore } from './types';
export declare class Web3Store implements IWeb3Store {
    private rootStore;
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
    constructor(rootStore: IRootStore);
    private hydrate;
    private persist;
    updateStore: (update: Partial<Web3Store>) => void;
    reset: () => void;
    connect: (connectionType: ConnectionType) => Promise<void>;
    disconnect: () => void;
}
