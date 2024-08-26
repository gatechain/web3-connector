import { useSyncExternalStore } from "react";
import { ConnectionType, Network } from "./types";
import { AbstractWallet } from "./connectors/AbstractWallet";
import { parseChainId } from "./utils";
import { connectWallet, disconnect } from ".";

let initialStore: IStore = {
  chainId: null,
  isActive: false,
  isActivating: false,
  account: null,
  accounts: [],
  provider: undefined
};

let store: IStore = initialStore;

export { store };

type IStore = {
  chainId?: number | string | null;
  isActive: boolean;
  isActivating: boolean;
  account?: string | null;
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

export function updateStore(s: Partial<IStore>) {
  const provider = s.connector?.provider;
  if (provider) {
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
