import type { Web3Provider } from '@ethersproject/providers';
import type { ConnectionType, Network } from '../types';

export interface IWeb3Store {
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

  updateStore(update: Partial<IWeb3Store>): void;
  reset(): void;
  connect(connectionType: ConnectionType): Promise<void>;
  disconnect(): void;
}

export interface IRootStore {
  web3Store: IWeb3Store;
} 