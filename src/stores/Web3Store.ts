import { Web3Provider } from '@ethersproject/providers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SELECTED_WALLET_KEY, WEB3_WALLET_INFO_KEY } from '../constant';
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

          // 统一封装为ethers标准Provider,方便按ethers标准使用
          if (update.connector?.provider) {
            const provider = update.connector.provider;
            if (
              [
                ConnectionType.INJECTED,
                ConnectionType.WALLET_CONNECT,
                ConnectionType.WALLET_CONNECT_NOTQR,
                ConnectionType.GATEWALLET,
                ConnectionType.GATEAPPWALLET,
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
        localStorage.removeItem(SELECTED_WALLET_KEY);
        localStorage.removeItem(WEB3_WALLET_INFO_KEY);
        set(initialState);
      },
    }),
    {
      name: WEB3_WALLET_INFO_KEY,
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
