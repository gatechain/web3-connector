import GateAppWallet from './connectors/GateAppWallet.js';
import { GateWallet } from './connectors/GateWallet.js';
import MetaMaskWallet from './connectors/MetaMaskWallet.js';
import PhantomWallet from './connectors/PhantomWallet.js';
import UnisatWallet from './connectors/UnisatWallet.js';
import WalletConnect from './connectors/WalletConnect.js';
import WalletConnectNoQr from './connectors/WalletConnectNoQr.js';
import { SELECTED_WALLET_KEY, WEB3_WALLET_INFO_KEY } from './constant.js';
import { updateStore } from './hooks/useWalletStatus.js';
export { useWalletStatus } from './hooks/useWalletStatus.js';
import { ConnectionType } from './types.js';
import { isApp, getQueryParams } from './utils/index.js';
import { store } from './stores/Web3Store.js';

function connectWallet(connectionType, resolve, reject) {
  const {
    currentWallet,
    connector
  } = store.getState();
  if (currentWallet && connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
    connector?.deactivate();
  }
  const connector$1 = getConnector(connectionType, resolve);
  if (connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
    updateStore({
      isActivating: true
    });
  }
  connector$1.activate().then(() => {
    localStorage.setItem(SELECTED_WALLET_KEY, JSON.stringify(connectionType));
  }).catch(err => {
    console.error(err);
    reject?.(err);
  }).finally(() => {
    updateStore({
      isActivating: false
    });
  });
}
function getConnector(connectionType, resolve) {
  const map = {
    [ConnectionType.GATEWALLET]: GateWallet,
    [ConnectionType.INJECTED]: MetaMaskWallet,
    [ConnectionType.PHANTOM]: PhantomWallet,
    [ConnectionType.Unisat]: UnisatWallet,
    [ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr,
    [ConnectionType.WALLET_CONNECT]: WalletConnect,
    [ConnectionType.GATEAPPWALLET]: GateAppWallet
  };
  if (connectionType === ConnectionType.WALLET_CONNECT_NOTQR) {
    const connector = map[connectionType].getInstance(resolve);
    return connector;
  } else {
    const connector = (map[connectionType] || MetaMaskWallet).getInstance();
    return connector;
  }
}
function disconnect() {
  const {
    currentWallet
  } = store.getState();
  if (!currentWallet) return;
  const connector = getConnector(currentWallet);
  localStorage.removeItem(SELECTED_WALLET_KEY);
  localStorage.removeItem(WEB3_WALLET_INFO_KEY);
  connector?.deactivate();
}
const isWallet = params => {
  const ethereum = window?.ethereum;
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
    const selectedWallet = getConnector(selectedWalletType);
    if (typeof selectedWallet.autoConnect === 'function') {
      selectedWallet.autoConnect();
    }
  }
})();

export { ConnectionType, connectWallet, disconnect, getConnector, isWallet };
