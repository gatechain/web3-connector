import { AbstractWallet } from './connectors/AbstractWallet';
import GateAppWallet from './connectors/GateAppWallet';
import GateWallet from './connectors/GateWallet';
import MetaMaskWallet from './connectors/MetaMaskWallet';
import PhantomWallet from './connectors/PhantomWallet';
import UnisatWallet from './connectors/UnisatWallet';
import WalletConnect from './connectors/WalletConnect';
import WalletConnectNoQr from './connectors/WalletConnectNoQr';
import { SELECTED_WALLET_KEY, WEB3_WALLET_INFO_KEY } from './constant';
import { store, updateStore } from './hooks/useWalletStatus';
import { ConnectionType } from './types';
import { getQueryParams, isApp } from './utils';

export { useWalletStatus } from './hooks/useWalletStatus';

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

export { getConnector };

function getConnector(connectionType: ConnectionType, resolve?: (uri: string) => void) {
  const map: any = {
    [ConnectionType.GATEWALLET]: GateWallet,
    [ConnectionType.INJECTED]: MetaMaskWallet,
    [ConnectionType.PHANTOM]: PhantomWallet,
    [ConnectionType.Unisat]: UnisatWallet,
    [ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr,
    [ConnectionType.WALLET_CONNECT]: WalletConnect,
    [ConnectionType.GATEAPPWALLET]: GateAppWallet,
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
  localStorage.removeItem(WEB3_WALLET_INFO_KEY);
  connector?.deactivate();
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

// ---- autoConnect 逻辑开始 ----
(function autoConnect() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  const isGateApp = isApp(getQueryParams());
  if (isGateApp) {
    connectWallet(ConnectionType.GATEAPPWALLET);
    return;
  }
  const selectedWalletType = localStorage.getItem(SELECTED_WALLET_KEY)?.replace(/"/g, '');
  if (selectedWalletType) {
    const selectedWallet = getConnector(selectedWalletType as ConnectionType);
    if (typeof selectedWallet.autoConnect === 'function') {
      selectedWallet.autoConnect();
    }
  }
})();
// ---- autoConnect 逻辑结束 ----

export { ConnectionType };
