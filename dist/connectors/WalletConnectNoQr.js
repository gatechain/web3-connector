import { updateStore, resetStore } from '../hooks/useWalletStatus.js';
import { ConnectionType } from '../types.js';
import WalletConnect from './WalletConnect.js';

//扫码连接gate钱包
class WalletConnectNoQr extends WalletConnect {
  constructor(options) {
    super({
      ...options,
      showQrModal: false
    });
    const {
      setUri
    } = options;
    this.setUri = setUri || function () {};
  }
  setUri(uri) {}
  handleDisplayURI(url) {
    this.setUri(url);
  }
  async activate(desiredChainId = this.defaultChainId) {
    await this.initialize(desiredChainId);
    const provider = this.provider;
    window.wc = provider;
    if (!provider) return;
    if (provider.session) {
      if (!desiredChainId || desiredChainId === provider.chainId) return;
      // WalletConnect exposes connected accounts, not chains: `eip155:${chainId}:${address}`
      const isConnectedToDesiredChain = provider.session.namespaces.eip155.accounts.some(account => account.startsWith(`eip155:${desiredChainId}:`));
      if (!isConnectedToDesiredChain) {
        if (this.options.optionalChains?.includes(desiredChainId)) {
          throw new Error(`Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`);
        }
        throw new Error(`Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`);
      }
      return provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{
          chainId: `0x${desiredChainId.toString(16)}`
        }]
      });
    }
    try {
      await provider.enable();
      updateStore({
        isActive: true,
        chainId: provider.chainId,
        accounts: provider.accounts,
        account: provider.accounts[0],
        connector: this,
        currentWallet: ConnectionType.WALLET_CONNECT_NOTQR
      });
    } catch (error) {
      await this.deactivate();
      resetStore();
      throw error;
    }
  }
  static instance;
  static getInstance(setUri) {
    if (WalletConnectNoQr.instance) {
      WalletConnectNoQr.instance.setUri = setUri || function () {};
      return WalletConnectNoQr.instance;
    }
    WalletConnectNoQr.instance = new WalletConnectNoQr({
      setUri
    });
    return WalletConnectNoQr.instance;
  }
}

export { WalletConnectNoQr as default };
