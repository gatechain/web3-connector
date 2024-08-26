import { selectedWalletKey } from "../constant";
import { ConnectionType } from "../types";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import { AbstractWallet } from "./AbstractWallet";

class GateWallet extends AbstractWallet {
  public provider: any;

  constructor() {
    super();
    this.handleGateAccountChange = this.handleGateAccountChange.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  public detectProvider(timeout = 3000): Promise<unknown> {
    let handled = false;

    let that = this;

    return new Promise((resolve) => {
      if ((window as any).gatewallet) {
        handlegatewallet();
      } else {
        setTimeout(() => {
          handlegatewallet();
        }, timeout);
      }

      function handlegatewallet() {
        if (handled) {
          return;
        }
        handled = true;

        const { gatewallet } = window as any;

        if (gatewallet && gatewallet.isWeb3Wallet) {
          that.provider = gatewallet;
          resolve(gatewallet as any);
        } else {
          const message = "Unable to detect window.gatewallet.";

          console.error("detect-provider:", message);
          resolve(null);
        }
      }
    });
  }

  private async initialize() {
    await this.detectProvider();
    const provider = this.provider;

    if (!provider) return;

    provider.on("connect", this.handleConnectEvent);

    provider.on("gateAccountChange", this.handleGateAccountChange);

    provider.on("chainChanged", this.handleChainChanged);
    provider.on("accountsChanged", this.handleAccountsChanged);

    provider.on("disconnect", this.deactivate);
  }

  async connectEagerly() {
    await this.initialize();
    const provider = this.provider;

    if (!provider) return;

    try {
      const gateAccountInfo = await provider.getAccount();

      updateStore({
        isActive: true,
        gateAccountInfo,
        connector: this,
        currentWallet: ConnectionType.GATEWALLET,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async activate() {
    await this.initialize();
    const provider = this.provider;

    if (!provider) return;

    try {
      const gateAccountInfo = await provider.connect();

      updateStore({
        isActive: true,
        gateAccountInfo,
        connector: this,
        currentWallet: ConnectionType.GATEWALLET,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private handleGateAccountChange = (gateWallet: any) => {
    console.log(
      "gateAccountChange",
      gateWallet,
      JSON.stringify(gateWallet) === "{}"
    );

    if (!gateWallet || JSON.stringify(gateWallet) === "{}") {
      this.deactivate?.();
    } else {
      updateStore({
        gateAccountInfo: gateWallet,
        account: this.provider.selectedAddress,
        chainId: this.provider.chainId,
      });
    }
  };

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      this.deactivate();
    } else {
      const currentAccount = accounts[0];
      updateStore({
        accounts: accounts,
        account: currentAccount,
      });
    }
  }

  private handleConnectEvent({ chainId }: any) {
    updateStore({ chainId });
  }

  private handleChainChanged(chainId: string) {
    updateStore({ chainId });
  }

  public deactivate() {
    this.provider?.removeAllListeners();
    localStorage.removeItem(selectedWalletKey);
    resetStore();
  }

  static instance: GateWallet;

  static getInstance() {
    if (GateWallet.instance) return GateWallet.instance;
    GateWallet.instance = new GateWallet();
    return GateWallet.instance;
  }
}

export default GateWallet;
