import { getAddress } from '@ethersproject/address';
import { resetStore, updateStore } from '../hooks/useWalletStatus.js';
import { ConnectionType, ChainType } from '../types.js';
import { parseChainId } from '../utils/index.js';
import { AbstractWallet } from './AbstractWallet.js';

class GateWallet extends AbstractWallet {
  constructor() {
    super();
    this.handleGateAccountChange = this.handleGateAccountChange.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }
  detectProvider(timeout = 1000) {
    let handled = false;
    let that = this;
    return new Promise(resolve => {
      if (window.gatewallet) {
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
        const {
          gatewallet
        } = window;
        if (gatewallet && gatewallet.isWeb3Wallet) {
          that.provider = gatewallet;
          resolve(gatewallet);
        } else {
          const message = 'Unable to detect window.gatewallet.';
          console.error('detect-provider:', message);
          resolve(null);
        }
      }
    });
  }
  async initialize() {
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
        currentWallet: ConnectionType.GATEWALLET
      });
    } catch (error) {
      console.error(error);
    }
  }
  async activate(desiredChainIdOrChainParameters) {
    await this.initialize();
    const provider = this.provider;
    if (!provider) return;
    try {
      const gateAccountInfo = await provider.connect();
      const {
        accountNetworkArr
      } = gateAccountInfo;
      if (accountNetworkArr.find(item => item.network === ChainType.EVM)) {
        return Promise.all([this.provider.request({
          method: 'eth_chainId'
        }), this.provider.request({
          method: 'eth_requestAccounts'
        })]).then(([chainId, accounts]) => {
          const receivedChainId = parseChainId(chainId);
          const desiredChainId = typeof desiredChainIdOrChainParameters === 'number' ? desiredChainIdOrChainParameters : desiredChainIdOrChainParameters?.chainId;
          const formattedAccounts = accounts?.map(account => getAddress(account || ''));
          if (!desiredChainId || receivedChainId === desiredChainId) {
            updateStore({
              isActive: true,
              chainId: parseChainId(chainId),
              gateAccountInfo,
              accounts: formattedAccounts,
              account: formattedAccounts[0],
              currentWallet: ConnectionType.GATEWALLET,
              connector: this
            });
            return;
          }
          const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
          return this.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{
              chainId: desiredChainIdHex
            }]
          }).catch(error => {
            if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              return this.provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  ...desiredChainIdOrChainParameters,
                  chainId: desiredChainIdHex
                }]
              });
            }
            throw error;
          }).then(() => this.activate(desiredChainId));
        });
      } else {
        updateStore({
          isActive: true,
          gateAccountInfo,
          account: accountNetworkArr?.[0]?.address,
          currentWallet: ConnectionType.GATEWALLET,
          connector: this
        });
      }
    } catch (error) {
      console.error('activate error', error);
    }
  }
  handleGateAccountChange = gateWallet => {
    try {
      console.log('gateAccountChange', gateWallet, JSON.stringify(gateWallet) === '{}');
      if (!gateWallet || JSON.stringify(gateWallet) === '{}') {
        this.deactivate?.();
      } else {
        updateStore({
          gateAccountInfo: gateWallet,
          account: getAddress(this.provider.selectedAddress || ''),
          chainId: parseChainId(this.provider.chainId)
        });
      }
    } catch (error) {
      console.error('gateAccountChange error', error);
    }
  };
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.deactivate();
    } else {
      const formattedAccounts = accounts.map(account => getAddress(account));
      const currentAccount = formattedAccounts[0];
      updateStore({
        accounts: formattedAccounts,
        account: currentAccount
      });
    }
  }
  handleConnectEvent({
    chainId
  }) {
    console.log('chainId', chainId);
    updateStore({
      chainId: parseChainId(chainId),
      isActive: true
    });
  }
  handleChainChanged = chainId => {
    updateStore({
      chainId: parseChainId(chainId)
    });
  };
  deactivate() {
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
  static instance;
  static getInstance() {
    if (GateWallet.instance) return GateWallet.instance;
    GateWallet.instance = new GateWallet();
    return GateWallet.instance;
  }
}

export { GateWallet, GateWallet as default };
