import React, { createContext, useContext } from 'react';
import type { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';
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
  provider: EthersWeb3Provider | null;
}

export interface Web3ContextValue extends Web3State {
  connect: (connectionType: ConnectionType) => Promise<void>;
  disconnect: () => void;
}

export const initialState: Web3State = {
  isActive: false,
  isActivating: false,
  accounts: [],
  provider: null
};

// 创建一个空的 context 值用于服务端渲染
export const defaultContextValue: Web3ContextValue = {
  ...initialState,
  connect: async () => {},
  disconnect: () => {}
};

export const Web3Context = createContext<Web3ContextValue>(defaultContextValue);

let ClientProvider: any = null;

// 服务端直接返回 null，避免使用任何 hooks
export const Web3StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isServer) {
    return (
      <Web3Context.Provider value={defaultContextValue}>
        {children}
      </Web3Context.Provider>
    );
  }

  // 客户端才动态加载组件
  if (!ClientProvider) {
    try {
      // 同步加载客户端组件
      ClientProvider = require('./Web3ClientProvider').default;
    } catch (e) {
      console.error('Failed to load Web3ClientProvider:', e);
      return (
        <Web3Context.Provider value={defaultContextValue}>
          {children}
        </Web3Context.Provider>
      );
    }
  }

  return <ClientProvider>{children}</ClientProvider>;
};

export const useWeb3State = () => {
  const context = useContext(Web3Context);
  return context;
}; 