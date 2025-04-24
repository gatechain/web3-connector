import React, { useCallback, useState, useEffect } from 'react';
import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';
import { ConnectionType } from '../types';
import { connectWallet as connectWalletUtil, disconnect as disconnectUtil } from '../index';
import { cookieStorage, createStorage } from '../stores/storage';
import { Web3Context, initialState, type Web3State } from './useWeb3State';

const storage = createStorage({
  storage: cookieStorage,
  key: 'web3_state'
});

const ClientWeb3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Web3State>(initialState);

  // 从 cookie 恢复状态
  useEffect(() => {
    const hydrate = async () => {
      try {
        const savedState = await storage.getItem('web3_state');
        if (savedState) {
          setState((prevState: Web3State) => ({
            ...prevState,
            ...JSON.parse(savedState)
          }));
        }
      } catch (error) {
        console.error('Failed to hydrate web3 state:', error);
      }
    };

    hydrate();
  }, []);

  // 持久化状态到 cookie
  const persistState = useCallback(async (newState: Partial<Web3State>) => {
    try {
      const stateToSave = {
        chainId: newState.chainId,
        isActive: newState.isActive,
        account: newState.account,
        accounts: newState.accounts,
        currentWallet: newState.currentWallet,
        network: newState.network,
      };
      await storage.setItem('web3_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to persist web3 state:', error);
    }
  }, []);

  const updateState = useCallback((update: Partial<Web3State>) => {
    setState((prevState: Web3State) => {
      const newState = { ...prevState, ...update };

      // 特殊处理 provider
      if (update.connector?.provider) {
        const provider = update.connector.provider;
        if (
          [ConnectionType.INJECTED, ConnectionType.WALLET_CONNECT, ConnectionType.WALLET_CONNECT_NOTQR, ConnectionType.GATEWALLET].includes(update.currentWallet as ConnectionType) &&
          typeof provider.request === 'function'
        ) {
          newState.provider = new EthersWeb3Provider(provider);
        } else {
          newState.provider = provider;
        }
      }

      // 持久化状态
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  const connect = useCallback(async (connectionType: ConnectionType) => {
    setState((prev: Web3State) => ({ ...prev, isActivating: true }));
    try {
      await connectWalletUtil(connectionType);
    } finally {
      setState((prev: Web3State) => ({ ...prev, isActivating: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectUtil();
    setState(initialState);
    storage.removeItem('web3_state');
  }, []);

  const value = {
    ...state,
    connect,
    disconnect
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default ClientWeb3Provider; 