import { selectedWalletKey } from "../constant";
import { ConnectionType } from "../types";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import { AbstractWallet } from "./AbstractWallet";

class PhantomWallet extends AbstractWallet {
  public provider: any;

  constructor() {
    super();
    this.detectProvider = this.detectProvider.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  public detectProvider(timeout = 3000): Promise<unknown> {
    let handled = false;

    let that = this;

    return new Promise((resolve, reject) => {
      if ((window as any).phantom?.solana) {
        handlePhantomwallet();
      } else {
        setTimeout(() => {
          handlePhantomwallet();
        }, timeout);
      }

      function handlePhantomwallet() {
        if (handled) {
          return;
        }
        handled = true;

        const { phantom } = window as any;

        if (phantom?.solana) {
          that.provider = phantom.solana;
          resolve(phantom as any);
        } else {
          const message = "Unable to detect window.phantom.solana.";

          console.error("detect-provider:", message);
          reject();
        }
      }
    });
  }

  private async initialize() {
    await this.detectProvider();
    const provider = this.provider;

    if (!provider) return;

    provider.on("connect", this.handleConnectEvent);

    provider.on("accountChanged", this.handleAccountsChanged);

    provider.on("disconnect", this.deactivate);
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
        currentWallet: ConnectionType.PHANTOM,
        connector: this,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async connectEagerly(): Promise<void> {
    this.activate();
  }

  private handleAccountsChanged(publicKey: any) {
    updateStore({
      account: publicKey.toBase58(),
    });
  }

  private handleConnectEvent(publicKey: any) {
    updateStore({ account: publicKey.toBase58() });
  }

  public deactivate() {
    this.provider?.removeAllListeners();
    localStorage.removeItem(selectedWalletKey)
    resetStore();
  }

  static instance: PhantomWallet;

  static getInstance() {
    if (PhantomWallet.instance) return PhantomWallet.instance;
    PhantomWallet.instance = new PhantomWallet();
    return PhantomWallet.instance;
  }
}

export default PhantomWallet;
