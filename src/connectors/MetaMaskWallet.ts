import detectEthereumProvider from '@metamask/detect-provider';
import { AddEthereumChainParameter, ProviderRpcError } from '@web3-react/types';
import { ConnectionType } from '../types';
import { resetStore, updateStore } from '../useWeb3ReactHook';
import { parseChainId } from '../utils';
import { AbstractWallet } from './AbstractWallet';

class MetaMaskWallet extends AbstractWallet {
  declare public provider: any;

  constructor() {
    super();
    this.handleConnectEvent = this.handleConnectEvent.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  public async detectProvider() {
    try {
      const provider$1: any = await detectEthereumProvider({
        timeout: 1000,
      });
      if (!provider$1) {
        resetStore();
        return;
      }
      console.log('detectProvider provider$1', provider$1);
      const provider = provider$1?.providers?.length
        ? (provider$1?.providers.find((p: any) => p.isMetaMask) ?? provider$1.providers[0])
        : provider$1;
      this.provider = provider;
      this.provider = provider$1;
    } catch (error) {
      console.error(error);
      resetStore();
    }
  }

  private async initialize() {
    await this.detectProvider();
    const provider = this.provider;
    if (!provider) {
      return;
    }

    provider.on('connect', this.handleConnectEvent);
    provider.on('chainChanged', this.handleChainChanged);
    provider.on('accountsChanged', this.handleAccountsChanged);
    provider.on('disconnect', this.deactivate);
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

  private handleConnectEvent({ chainId }: any) {
    console.log('connect chainId', chainId);
    updateStore({ chainId: parseChainId(chainId) });
  }

  private handleChainChanged(chainId: string) {
    console.log('chainChanged chainId', chainId);
    updateStore({ chainId: parseChainId(chainId) });
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
            currentWallet: ConnectionType.INJECTED,
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

  public async connectEagerly() {
    await this.initialize();
    const provider = this.provider;

    if (!provider) return;

    try {
      const [chainId, accounts] = await Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
        this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
      ]);

      updateStore({
        isActive: true,
        chainId: parseChainId(chainId),
        accounts,
        account: accounts?.[0],
        currentWallet: ConnectionType.INJECTED,
        connector: this,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public deactivate() {
    const provider = this.provider;
    if (provider) {
      provider.removeListener('connect', this.handleConnectEvent);
      provider.removeListener('chainChanged', this.handleChainChanged);
      provider.removeListener('accountsChanged', this.handleAccountsChanged);
      provider.removeListener('disconnect', this.deactivate);
    }
    resetStore();
  }

  static instance: MetaMaskWallet;

  static getInstance() {
    if (MetaMaskWallet.instance) return MetaMaskWallet.instance;
    MetaMaskWallet.instance = new MetaMaskWallet();
    return MetaMaskWallet.instance;
  }
}

export default MetaMaskWallet;
