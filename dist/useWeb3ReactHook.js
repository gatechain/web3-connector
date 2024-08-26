import { useSyncExternalStore } from "react";
import { connectWallet, disconnect } from ".";
let initialStore = {
    chainId: null,
    isActive: false,
    isActivating: false,
    account: null,
    accounts: [],
    provider: undefined
};
let store = initialStore;
export { store };
let listeners = [];
function subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
function getSnapshot() {
    return store;
}
export function updateStore(s) {
    var _a;
    const provider = (_a = s.connector) === null || _a === void 0 ? void 0 : _a.provider;
    if (provider) {
        store = Object.assign(Object.assign(Object.assign({}, store), s), { provider });
    }
    else {
        store = Object.assign(Object.assign({}, store), s);
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
