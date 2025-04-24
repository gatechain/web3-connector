import { observer } from 'mobx-react-lite';
import { ConnectionType } from "./types";
import { rootStore } from './stores/RootStore';
import { isServer } from "./utils/env";
import type { IWeb3Store } from './stores/types';

export const store = rootStore.web3Store;

export function updateStore(update: Partial<IWeb3Store>) {
  if (isServer) return;
  store.updateStore(update);
}

export function resetStore() {
  if (isServer) return;
  store.reset();
}

export const useWeb3React = () => {
  return store;
};

export const useNonEVMReact = () => {
  const web3Store = useWeb3React();
  
  return {
    isConnected: web3Store.isActive,
    isConnecting: web3Store.isActivating,
    address: web3Store.account,
    gateAcountInfo: web3Store.gateAccountInfo,
    chainId: web3Store.chainId,
    connector: web3Store.connector,
    connectiorName: web3Store.currentWallet,
    connect: web3Store.connect.bind(web3Store),
    disconnect: web3Store.disconnect.bind(web3Store),
  };
};
