import { ConnectionType } from "../types";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import WalletConnect from "./WalletConnect";

type UriCallback = (uri: string) => void;

class WalletConnectNoQr extends WalletConnect {
  constructor(options: { setUri?: UriCallback }) {
    super({ ...options, showQrModal: false });
    const { setUri } = options;
    this.setUri = setUri || function () {};
  }

  public setUri(uri: string) {}

  protected handleDisplayURI(url: string): void {
    this.setUri(url);
  }

  public async activate(desiredChainId: number = this.defaultChainId) {
    await this.initialize(desiredChainId);
    const provider = this.provider;

    (window as any).wc = provider;

    if (!provider) return;
    if (provider.session) {
      if (!desiredChainId || desiredChainId === provider.chainId) return;
      // WalletConnect exposes connected accounts, not chains: `eip155:${chainId}:${address}`
      const isConnectedToDesiredChain =
        provider.session.namespaces.eip155.accounts.some((account: any) =>
          account.startsWith(`eip155:${desiredChainId}:`)
        );
      if (!isConnectedToDesiredChain) {
        if (this.options.optionalChains?.includes(desiredChainId)) {
          throw new Error(
            `Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`
          );
        }
        throw new Error(
          `Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`
        );
      }
      return provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
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
        currentWallet: ConnectionType.WALLET_CONNECT_NOTQR,
      });
    } catch (error) {
      await this.deactivate();
      resetStore();
      throw error;
    }
  }

  static instance: WalletConnectNoQr;

  static getInstance(setUri?: UriCallback) {
    if (WalletConnectNoQr.instance) {
      WalletConnectNoQr.instance.setUri = setUri || function () {};
      return WalletConnectNoQr.instance;
    }
    WalletConnectNoQr.instance = new WalletConnectNoQr({
      setUri,
    });
    return WalletConnectNoQr.instance;
  }
}

export default WalletConnectNoQr;
