import { useEffect } from 'react';
import { AbstractWallet } from './connectors/AbstractWallet';
import GateWallet from './connectors/GateWallet';
import MetaMaskWallet from './connectors/MetaMaskWallet';
import PhantomWallet from './connectors/PhantomWallet';
import UnisatWallet from './connectors/UnisatWallet';
import WalletConnect from './connectors/WalletConnect';
import WalletConnectNoQr from './connectors/WalletConnectNoQr';
import { SELECTED_WALLET_KEY } from './constant';
import { ConnectionType } from './types';
import { store, updateStore } from './useWeb3ReactHook';
export { useWeb3React } from './useWeb3ReactHook';

export { ConnectionType };

export function connectWallet(
  connectionType: ConnectionType,
  resolve?: (uri: string) => void,
  reject?: (err: Error) => void
) {
  const { currentWallet, connector } = store.getState();

  if (currentWallet && connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
    connector?.deactivate();
  }

  const connector$1 = getConnector(connectionType, resolve);

  if (connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
    updateStore({ isActivating: true });
  }

  connector$1
    .activate()
    .then(() => {
      localStorage.setItem(SELECTED_WALLET_KEY, JSON.stringify(connectionType));
    })
    .catch((err: Error) => {
      console.error(err);
      reject?.(err);
    })
    .finally(() => {
      updateStore({ isActivating: false });
    });
}

function getConnector(connectionType: ConnectionType, resolve?: (uri: string) => void) {
  const map: any = {
    [ConnectionType.GATEWALLET]: GateWallet,
    [ConnectionType.INJECTED]: MetaMaskWallet,
    [ConnectionType.PHANTOM]: PhantomWallet,
    [ConnectionType.Unisat]: UnisatWallet,
    [ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr,
    [ConnectionType.WALLET_CONNECT]: WalletConnect,
  };

  if (connectionType === ConnectionType.WALLET_CONNECT_NOTQR) {
    const connector = map[connectionType].getInstance(resolve);
    return connector as AbstractWallet;
  } else {
    const connector = (map[connectionType] || MetaMaskWallet).getInstance();
    return connector as AbstractWallet;
  }
}

export function disconnect() {
  const { currentWallet } = store.getState();
  if (!currentWallet) return;

  const connector = getConnector(currentWallet);
  localStorage.removeItem(SELECTED_WALLET_KEY);
  localStorage.removeItem('web3-storage');
  connector?.deactivate();
}

export function useEagerlyConnect(onError?: Function) {
  useEffect(() => {
    const web3Storage = localStorage.getItem('web3-storage');
    const web3StorageString = JSON?.parse(web3Storage || '{}');
    const selectedWalletType = (web3StorageString?.state?.currentWallet as ConnectionType) || '';

    try {
      if (!selectedWalletType) {
        onError?.();
        return;
      }
      const selectedWallet = getConnector(selectedWalletType as ConnectionType);
      selectedWallet.connectEagerly();
    } catch (error) {
      console.error(error);
    }
  }, []);
}

type ISWalletType = 'MetaMask' | 'TokenPocket';
export interface EthereumProvider {
  isMetaMask?: boolean;
  isTokenPocket?: boolean;
  [key: string]: any;
}
export const isWallet = (params: ISWalletType): boolean => {
  const ethereum = (window as any)?.ethereum as EthereumProvider;

  if (params === 'MetaMask') {
    return ethereum?.isMetaMask || false;
  }

  if (params === 'TokenPocket') {
    return ethereum?.isTokenPocket || false;
  }

  return false;
};
