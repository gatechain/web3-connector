"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNonEVMReact = exports.useWeb3React = exports.resetStore = exports.updateStore = exports.store = void 0;
const react_1 = require("react");
const _1 = require(".");
let initialStore = {
    chainId: null,
    isActive: false,
    isActivating: false,
    account: null,
    accounts: [],
};
let store = initialStore;
exports.store = store;
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
function updateStore(s) {
    exports.store = store = Object.assign(Object.assign({}, store), s);
    emitChange();
}
exports.updateStore = updateStore;
function resetStore() {
    exports.store = store = initialStore;
    emitChange();
}
exports.resetStore = resetStore;
function emitChange() {
    for (let listener of listeners) {
        listener();
    }
}
function useWeb3React() {
    const store = (0, react_1.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
    return store;
}
exports.useWeb3React = useWeb3React;
function useNonEVMReact() {
    const store = (0, react_1.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
    return {
        isConnected: store.isActive,
        isConnecting: store.isActivating,
        address: store.account,
        gateAcountInfo: store.gateAccountInfo,
        chainId: store.chainId,
        connector: store.connector,
        connectiorName: store.currentWallet,
        connect: _1.connectWallet,
        disconnect: _1.disconnect
    };
}
exports.useNonEVMReact = useNonEVMReact;
