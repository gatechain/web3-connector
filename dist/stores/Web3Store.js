import create from 'zustand/vanilla';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectionType } from '../types.js';
import { disconnect, connectWallet } from '../index.js';
import { isServer } from '../utils/env.js';
import { useState, useEffect } from 'react';

const initialState = {
    chainId: undefined,
    isActive: false,
    isActivating: false,
    account: undefined,
    accounts: [],
    gateAccountInfo: undefined,
    currentWallet: undefined,
    connector: undefined,
    network: undefined,
    provider: null,
};
// 创建原始 store
const store = create((set, get) => ({
    ...initialState,
    updateStore: (update) => {
        if (isServer)
            return;
        set((state) => {
            const newState = { ...state, ...update };
            // 特殊处理 provider
            if (update.connector?.provider) {
                const provider = update.connector.provider;
                if ([
                    ConnectionType.INJECTED,
                    ConnectionType.WALLET_CONNECT,
                    ConnectionType.WALLET_CONNECT_NOTQR,
                    ConnectionType.GATEWALLET,
                ].includes(update.currentWallet) &&
                    typeof provider.request === 'function') {
                    newState.provider = new Web3Provider(provider);
                }
                else {
                    newState.provider = provider;
                }
            }
            return newState;
        });
    },
    reset: () => {
        if (isServer)
            return;
        set(initialState);
    },
    connect: async (connectionType) => {
        if (isServer)
            return;
        set({ isActivating: true });
        try {
            await connectWallet(connectionType);
        }
        finally {
            set({ isActivating: false });
        }
    },
    disconnect: () => {
        if (isServer)
            return;
        disconnect();
        set(initialState);
    },
}));
// 添加持久化
if (!isServer) {
    const key = 'web3-store';
    const savedState = localStorage.getItem(key);
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            store.setState(state);
        }
        catch (e) {
            console.error('Failed to restore web3 store state:', e);
        }
    }
    store.subscribe((state) => {
        try {
            const saveState = {
                chainId: state.chainId,
                isActive: state.isActive,
                account: state.account,
                accounts: state.accounts,
                currentWallet: state.currentWallet,
                network: state.network,
            };
            localStorage.setItem(key, JSON.stringify(saveState));
        }
        catch (e) {
            console.error('Failed to persist web3 store state:', e);
        }
    });
}
const useWeb3Store = () => {
    const [state, setState] = useState(() => store.getState());
    useEffect(() => {
        const unsubscribe = store.subscribe(setState);
        return unsubscribe;
    }, []);
    return state;
};

export { store, useWeb3Store };
