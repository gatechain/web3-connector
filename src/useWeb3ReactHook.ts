import { useSyncExternalStore } from "react";
import { ConnectionType, Network } from "./types";
import { AbstractWallet } from "./connectors/AbstractWallet";
import { connectWallet, disconnect } from ".";
import { Web3Provider } from "@ethersproject/providers";

let initialStore: IStore = {
  chainId: undefined,
  isActive: false,
  isActivating: false,
  account: undefined,
  accounts: [],
  provider: undefined,
};

let store: IStore = initialStore;

export { store };

type IStore = {
  chainId?: number;
  isActive: boolean;
  isActivating: boolean;
  account?: string;
  accounts: string[];
  gateAccountInfo?: any;
  currentWallet?: ConnectionType;
  connector?: AbstractWallet;
  network?: Network;
  provider: any;
};

let listeners: any[] = [];

function subscribe(listener: any) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return store;
}

function diff(prev: Partial<IStore>, curr: Partial<IStore>) {
  for (const key in curr) {
    if (prev[key as keyof IStore] != curr[key as keyof IStore]) {
      return true;
    }
  }
  return false;
}

export function updateStore(s: Partial<IStore>) {
  // const isChanged = diff(store, s);

  // if (!isChanged) return;

  let provider = s.connector?.provider;

  if (provider) {
    if (
      [ConnectionType.INJECTED, ConnectionType.WALLET_CONNECT, ConnectionType.WALLET_CONNECT_NOTQR, ConnectionType.GATEWALLET].includes(s.currentWallet as ConnectionType) &&
      !(provider instanceof Web3Provider)
    ) {
      provider = new Web3Provider(provider);
    }

    store = {
      ...store,
      ...s,
      provider,
    };
  } else {
    store = {
      ...store,
      ...s,
    };
  }

  emitChange();
}

export function resetStore() {
  store = initialStore;
  emitChange();
}

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

export function useWeb3React() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return store;
}

export function useNonEVMReact() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    isConnected: store.isActive,
    isConnecting: store.isActivating,
    address: store.account,
    gateAcountInfo: store.gateAccountInfo,
    chainId: store.chainId,
    connector: store.connector,
    connectiorName: store.currentWallet,
    connect: connectWallet,
    disconnect: disconnect,
  };
}
