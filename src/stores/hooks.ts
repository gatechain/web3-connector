import { useContext, createContext } from 'react';
import type { IRootStore } from './types';
import { RootStore, rootStore } from './RootStore';
import { isServer } from '../utils/env';
import './config';

const StoreContext = createContext<IRootStore | null>(null);

export const StoreProvider = StoreContext.Provider;

export function useStore(): IRootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}

// 创建一个空的 store 实现用于服务端渲染
const emptyStore = {
  provider: null,
  account: null,
  chainId: null,
  connected: false,
  isActivating: false,
  currentWallet: null,
  connectWallet: async () => {},
  disconnect: () => {},
  setProvider: () => {},
  setAccount: () => {},
  setChainId: () => {},
  setConnected: () => {},
  reset: () => {},
};

export function useWeb3Store() {
  // 在服务端返回空的 store
  if (isServer) {
    return emptyStore;
  }

  const store = useStore();
  return store.web3Store;
}

// 导出根 store 实例
export { rootStore }; 