import { Web3Provider } from '@ethersproject/providers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { connectWallet as connectWalletUtil, disconnect as disconnectUtil } from '../index';
import { ConnectionType, Network } from '../types';
import { isServer } from '../utils/env';

export interface Web3State {
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
}

export interface Web3Actions {
  updateStore: (update: Partial<Web3State>) => void;
  reset: () => void;
  connect: (connectionType: ConnectionType) => Promise<void>;
  disconnect: () => void;
}

type StoreState = Web3State & Web3Actions;

const initialState: Web3State = {
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
export const store = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateStore: (update: Partial<Web3State>) => {
        set((state) => {
          const newState = { ...state, ...update };

          // 特殊处理 provider
          if (update.connector?.provider) {
            const provider = update.connector.provider;
            if (
              [
                ConnectionType.INJECTED,
                ConnectionType.WALLET_CONNECT,
                ConnectionType.WALLET_CONNECT_NOTQR,
                ConnectionType.GATEWALLET,
              ].includes(update.currentWallet as ConnectionType)
            ) {
              newState.provider = new Web3Provider(provider);
            } else {
              newState.provider = provider;
            }
          }

          return newState;
        });
      },

      reset: () => {
        set(initialState);
      },

      connect: async (connectionType: ConnectionType) => {
        set({ isActivating: true });
        try {
          await connectWalletUtil(connectionType);
        } finally {
          set({ isActivating: false });
        }
      },

      disconnect: () => {
        disconnectUtil();
        set(initialState);
      },
    }),
    {
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
      partialize: (state: StoreState) => {
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
    }
  )
);

// 基础 hook
export const useWeb3Store = store;

// 常用状态组合的 hook
export const useWallet = () => {
  return useWeb3Store(
    (state) => ({
      account: state.account,
      isActive: state.isActive,
      isActivating: state.isActivating,
      chainId: state.chainId,
      currentWallet: state.currentWallet,
    }),
    shallow
  );
};

// Provider 相关的 hook
export const useWeb3Provider = () => {
  return useWeb3Store((state) => state.provider);
};
