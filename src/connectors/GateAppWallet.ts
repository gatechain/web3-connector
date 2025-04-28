import { AddEthereumChainParameter, ProviderRpcError } from '@web3-react/types';
import { SELECTED_WALLET_KEY } from '../constant';
import { ConnectionType } from '../types';
import { resetStore, updateStore } from '../useWeb3ReactHook';
import { parseChainId } from '../utils';
import { AbstractWallet } from './AbstractWallet';

//在webview中直连gate钱包
class GateAppWallet extends AbstractWallet {
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
      if ((window as any)?.gatewallet) {
        handleGateAppWallet();
      } else {
        setTimeout(() => {
          handleGateAppWallet();
        }, timeout);
      }

      function handleGateAppWallet() {
        if (handled) {
          return;
        }
        handled = true;

        const { gatewallet } = window as any;
        console.log('gatewallet', gatewallet);
        if (gatewallet?.ethereum) {
          that.provider = gatewallet.ethereum;
          resolve(gatewallet.ethereum as any);
        } else {
          const message = 'Unable to detect window.gatewallet.';

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

    provider.on('connect', this.handleConnectEvent);

    provider.on('gateAccountChange', this.handleGateAccountChange);

    provider.on('chainChanged', this.handleChainChanged);
    provider.on('accountsChanged', this.handleAccountsChanged);

    provider.on('disconnect', this.deactivate);
  }

  async connectEagerly() {
    await this.initialize();
    const provider = this.provider;

    if (!provider) return;
    const [chainId, accounts] = await Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ]);

    updateStore({
      isActive: true,
      chainId: parseChainId(chainId),
      accounts,
      account: accounts?.[0],
      currentWallet: ConnectionType.GATEAPPWALLET,
      connector: this,
    });
  }

  public activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter) {
    return this.initialize().then(() => {
      const provider = this.provider;
      if (!provider) return;
      return Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
        this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
      ]).then(([chainId, accounts]) => {
        const receivedChainId = parseChainId(chainId);
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number'
            ? desiredChainIdOrChainParameters
            : desiredChainIdOrChainParameters?.chainId;

        if (!desiredChainId || receivedChainId === desiredChainId) {
          updateStore({
            isActive: true,
            chainId: parseChainId(chainId),
            accounts,
            account: accounts?.[0],
            currentWallet: ConnectionType.GATEAPPWALLET,
            connector: this,
          });
          return;
        }

        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;

        return this.provider!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
          .catch((error: ProviderRpcError) => {
            if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              return this.provider!.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    ...desiredChainIdOrChainParameters,
                    chainId: desiredChainIdHex,
                  },
                ],
              });
            }
            throw error;
          })
          .then(() => this.activate(desiredChainId));
      });
    });
  }

  private handleGateAccountChange = (gateWallet: any) => {
    console.log('gateAccountChange', gateWallet, JSON.stringify(gateWallet) === '{}');

    if (!gateWallet || JSON.stringify(gateWallet) === '{}') {
      this.deactivate?.();
    } else {
      updateStore({
        gateAccountInfo: gateWallet,
        account: this.provider.selectedAddress,
        chainId: parseChainId(this.provider.chainId),
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
    console.log('chainId', chainId);
    updateStore({ chainId: parseChainId(chainId), isActive: true });
  }

  private handleChainChanged(chainId: string) {
    updateStore({ chainId: parseChainId(chainId) });
  }

  public deactivate() {
    const provider = this.provider;
    if (!provider) return;
    provider.removeListener('connect', this.handleConnectEvent);

    provider.removeListener('gateAccountChange', this.handleGateAccountChange);

    provider.removeListener('chainChanged', this.handleChainChanged);
    provider.removeListener('accountsChanged', this.handleAccountsChanged);

    provider.removeListener('disconnect', this.deactivate);
    localStorage.removeItem(SELECTED_WALLET_KEY);
    resetStore();
  }

  static instance: GateAppWallet;

  static getInstance() {
    if (GateAppWallet.instance) return GateAppWallet.instance;
    GateAppWallet.instance = new GateAppWallet();
    return GateAppWallet.instance;
  }
}

export default GateAppWallet;
