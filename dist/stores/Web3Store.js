import { Web3Provider } from '@ethersproject/providers';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import 'zustand/shallow';
import { SELECTED_WALLET_KEY } from '../constant.js';
import { disconnect, connectWallet } from '../index.js';
import { ConnectionType } from '../types.js';
import { isServer } from '../utils/env.js';

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
// 创建 store
const store = create()(persist((set, get) => ({
    ...initialState,
    updateStore: (update) => {
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
                ].includes(update.currentWallet)) {
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
        console.log('reset');
        localStorage.removeItem(SELECTED_WALLET_KEY);
        localStorage.removeItem('web3-storage');
        set(initialState);
    },
    connect: async (connectionType) => {
        set({ isActivating: true });
        try {
            await connectWallet(connectionType);
        }
        finally {
            set({ isActivating: false });
        }
    },
    disconnect: () => {
        disconnect();
        set(initialState);
    },
}), {
    name: 'web3-storage',
    storage: createJSONStorage(() => ({
        getItem: (name) => {
            return localStorage.getItem(name);
        },
        setItem: (name, value) => {
            if (!isServer) {
                localStorage.setItem(name, value);
            }
        },
        removeItem: (name) => {
            if (!isServer) {
                localStorage.removeItem(name);
            }
        },
    })),
    partialize: (state) => {
        if (!state.isActive) {
            return {};
        }
        return {
            chainId: state.chainId,
            account: state.account,
            accounts: state.accounts,
            currentWallet: state.currentWallet,
            isActive: state.isActive,
            network: state.network,
        };
    },
    version: 1,
}));
// 基础 hook
const useWeb3Store = store;

export { store, useWeb3Store };
