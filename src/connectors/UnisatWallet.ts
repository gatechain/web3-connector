import { SELECTED_WALLET_KEY } from '../constant';
import { resetStore, updateStore } from '../hooks/useWalletStatus';
import { ConnectionType } from '../types';
import { AbstractWallet } from './AbstractWallet';

class UnisatWallet extends AbstractWallet {
  declare public provider: any;

  constructor() {
    super();
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
  }

  public detectProvider(timeout = 3000): Promise<unknown> {
    let handled = false;

    let that = this;

    return new Promise((resolve) => {
      if ((window as any).unisat) {
        handleUnisat();
      } else {
        setTimeout(() => {
          handleUnisat();
        }, timeout);
      }

      function handleUnisat() {
        if (handled) {
          return;
        }
        handled = true;

        const { unisat } = window as any;

        if (unisat) {
          that.provider = unisat;
          resolve(unisat as any);
        } else {
          const message = 'Unable to detect window.unisat.';

          console.error('detect-provider:', message);
          resolve(null);
        }
      }
    });
  }

  private async initialize() {
    await this.detectProvider();
    const provider = this.provider;

    if (!provider) return;

    provider.on('networkChanged', this.handleNetworkChanged);

    provider.on('accountsChanged', this.handleAccountsChanged);
  }

  private handleNetworkChanged(network: any) {
    updateStore({
      network: network,
    });
  }

  public async autoConnect() {
    this.activate();
  }

  public async activate() {
    await this.initialize();
    const provider = this.provider;

    if (!provider) return;

    try {
      const [accounts, publicKey, network] = await Promise.all([
        provider.requestAccounts(),
        provider.getPublicKey(),
        provider.getNetwork(),
      ]);

      updateStore({
        isActive: true,
        connector: this,
        currentWallet: ConnectionType.Unisat,
        account: accounts[0],
        accounts: accounts,
        network: network,
      });
    } catch (error) {
      console.error(error);
    }
  }

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

  public deactivate() {
    const provider = this.provider;

    if (!provider) return;
    provider.removeListener('networkChanged', this.handleNetworkChanged);

    provider.removeListener('accountsChanged', this.handleAccountsChanged);
    localStorage.removeItem(SELECTED_WALLET_KEY);
    resetStore();
  }

  static instance: UnisatWallet;

  static getInstance() {
    if (UnisatWallet.instance) return UnisatWallet.instance;
    UnisatWallet.instance = new UnisatWallet();
    return UnisatWallet.instance;
  }
}

export default UnisatWallet;
