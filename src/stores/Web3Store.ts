import { makeAutoObservable } from 'mobx';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectionType, Network } from '../types';
import { connectWallet as connectWalletUtil, disconnect as disconnectUtil } from '../index';
import type { IWeb3Store, IRootStore } from './types';
import { isServer } from '../utils/env';
import { cookieStorage, createStorage } from '../stores/storage';

const storage = createStorage({
  storage: cookieStorage,
  key: 'web3_store_state'
});

export class Web3Store implements IWeb3Store {
  chainId?: number = undefined;
  isActive: boolean = false;
  isActivating: boolean = false;
  account?: string = undefined;
  accounts: string[] = [];
  gateAccountInfo?: any = undefined;
  currentWallet?: ConnectionType = undefined;
  connector?: any = undefined;
  network?: Network = undefined;
  provider: Web3Provider | null = null;

  constructor(private rootStore: IRootStore) {
    // 只在客户端进行 observable 初始化
    if (!isServer) {
      makeAutoObservable(this, {}, { autoBind: true });
      
      // 从 cookie 中恢复状态
      this.hydrate();
    }
  }

  private hydrate = async () => {
    try {
      const state = await storage.getItem('web3_store_state');
      if (state) {
        Object.assign(this, JSON.parse(state));
      }
    } catch (error) {
      console.error('Failed to hydrate web3 store:', error);
    }
  }

  private persist = async () => {
    if (isServer) return;
    
    try {
      const state = {
        chainId: this.chainId,
        isActive: this.isActive,
        account: this.account,
        accounts: this.accounts,
        currentWallet: this.currentWallet,
        network: this.network,
      };
      await storage.setItem('web3_store_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist web3 store:', error);
    }
  }

  updateStore = (update: Partial<Web3Store>) => {
    if (isServer) return;

    Object.assign(this, update);

    // 特殊处理 provider
    if (update.connector?.provider) {
      const provider = update.connector.provider;
      if (
        [ConnectionType.INJECTED, ConnectionType.WALLET_CONNECT, ConnectionType.WALLET_CONNECT_NOTQR, ConnectionType.GATEWALLET].includes(update.currentWallet as ConnectionType) &&
        typeof provider.request === 'function'
      ) {
        this.provider = new Web3Provider(provider);
      } else {
        this.provider = provider;
      }
    }

    // 持久化状态到 cookie
    this.persist();
  };

  reset = () => {
    if (isServer) return;

    this.chainId = undefined;
    this.isActive = false;
    this.isActivating = false;
    this.account = undefined;
    this.accounts = [];
    this.gateAccountInfo = undefined;
    this.currentWallet = undefined;
    this.connector = undefined;
    this.network = undefined;
    this.provider = null;

    // 清除持久化的状态
    storage.removeItem('web3_store_state');
  };

  connect = async (connectionType: ConnectionType) => {
    if (isServer) return;
    await connectWalletUtil(connectionType);
  };

  disconnect = () => {
    if (isServer) return;
    disconnectUtil();
    this.reset();
  };
} 