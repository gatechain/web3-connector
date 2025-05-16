import { getAddress } from '@ethersproject/address';
import { resetStore, updateStore } from '../hooks/useWalletStatus';
import { AddEthereumChainParameter, ChainType, ConnectionType, ProviderRpcError } from '../types';
import { parseChainId } from '../utils';
import { AbstractWallet } from './AbstractWallet';

export class GateWallet extends AbstractWallet {
  declare public provider: any;

  constructor() {
    super();
    this.handleGateAccountChange = this.handleGateAccountChange.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  public detectProvider(timeout = 1000): Promise<unknown> {
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
    if (!provider) {
      resetStore();
      return;
    }

    provider.on('accountsChanged', this.handleAccountsChanged);
    provider.on('chainChanged', this.handleChainChanged);
    provider.on('connect', this.handleConnectEvent);

    provider.on('gateAccountChange', this.handleGateAccountChange);

    provider.on('disconnect', this.deactivate);
  }

  async autoConnect() {
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

  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter) {
    await this.initialize();
    const provider = this.provider;
    if (!provider) return;
    try {
      const gateAccountInfo = await provider.connect();
      const { accountNetworkArr } = gateAccountInfo;

      if (accountNetworkArr.find((item) => item.network === ChainType.EVM)) {
        return Promise.all([
          this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
          this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
        ]).then(([chainId, accounts]) => {
          const receivedChainId = parseChainId(chainId);
          const desiredChainId =
            typeof desiredChainIdOrChainParameters === 'number'
              ? desiredChainIdOrChainParameters
              : desiredChainIdOrChainParameters?.chainId;

          const formattedAccounts = accounts?.map((account) => getAddress(account || ''));

          if (!desiredChainId || receivedChainId === desiredChainId) {
            updateStore({
              isActive: true,
              chainId: parseChainId(chainId),
              gateAccountInfo,
              accounts: formattedAccounts,
              account: formattedAccounts[0],
              currentWallet: ConnectionType.GATEWALLET,
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
      } else {
        updateStore({
          isActive: true,
          gateAccountInfo,
          account: accountNetworkArr?.[0]?.address,
          currentWallet: ConnectionType.GATEWALLET,
          connector: this,
        });
      }
    } catch (error) {
      console.error('activate error', error);
    }
  }

  private handleGateAccountChange = (gateWallet: any) => {
    try {
      console.log('gateAccountChange', gateWallet, JSON.stringify(gateWallet) === '{}');

      if (!gateWallet || JSON.stringify(gateWallet) === '{}') {
        this.deactivate?.();
      } else {
        updateStore({
          gateAccountInfo: gateWallet,
          account: getAddress(this.provider.selectedAddress || ''),
          chainId: parseChainId(this.provider.chainId),
        });
      }
    } catch (error) {
      console.error('gateAccountChange error', error);
    }
  };

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      this.deactivate();
    } else {
      const formattedAccounts = accounts.map((account) => getAddress(account));
      const currentAccount = formattedAccounts[0];
      updateStore({
        accounts: formattedAccounts,
        account: currentAccount,
      });
    }
  }

  private handleConnectEvent({ chainId }: any) {
    console.log('chainId', chainId);
    updateStore({ chainId: parseChainId(chainId), isActive: true });
  }

  private handleChainChanged = (chainId: string) => {
    updateStore({
      chainId: parseChainId(chainId),
    });
  };

  public deactivate() {
    const provider = this.provider;
    console.log('provider deactivate', provider);
    if (provider) {
      provider.removeListener('connect', this.handleConnectEvent);

      provider.removeListener('gateAccountChange', this.handleGateAccountChange);

      provider.removeListener('chainChanged', this.handleChainChanged);
      provider.removeListener('accountsChanged', this.handleAccountsChanged);

      provider.removeListener('disconnect', this.deactivate);
    }
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
