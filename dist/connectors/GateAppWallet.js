import { SELECTED_WALLET_KEY } from '../constant.js';
import { ConnectionType } from '../types.js';
import { updateStore, resetStore } from '../useWeb3ReactHook.js';
import { parseChainId } from '../utils/index.js';
import { AbstractWallet } from './AbstractWallet.js';

//在webview中直连gate钱包
class GateAppWallet extends AbstractWallet {
    provider;
    constructor() {
        super();
        this.handleGateAccountChange = this.handleGateAccountChange.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }
    detectProvider(timeout = 3000) {
        let handled = false;
        let that = this;
        return new Promise((resolve) => {
            if (window?.gatewallet) {
                handleGateAppWallet();
            }
            else {
                setTimeout(() => {
                    handleGateAppWallet();
                }, timeout);
            }
            function handleGateAppWallet() {
                if (handled) {
                    return;
                }
                handled = true;
                const { gatewallet } = window;
                console.log('gatewallet', gatewallet);
                if (gatewallet?.ethereum) {
                    that.provider = gatewallet.ethereum;
                    resolve(gatewallet.ethereum);
                }
                else {
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
        if (!provider)
            return;
        provider.on('connect', this.handleConnectEvent);
        provider.on('gateAccountChange', this.handleGateAccountChange);
        provider.on('chainChanged', this.handleChainChanged);
        provider.on('accountsChanged', this.handleAccountsChanged);
        provider.on('disconnect', this.deactivate);
    }
    async connectEagerly() {
        await this.initialize();
        const provider = this.provider;
        if (!provider)
            return;
        const [chainId, accounts] = await Promise.all([
            this.provider.request({ method: 'eth_chainId' }),
            this.provider.request({ method: 'eth_requestAccounts' }),
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
    activate(desiredChainIdOrChainParameters) {
        return this.initialize().then(() => {
            const provider = this.provider;
            if (!provider)
                return;
            return Promise.all([
                this.provider.request({ method: 'eth_chainId' }),
                this.provider.request({ method: 'eth_requestAccounts' }),
            ]).then(([chainId, accounts]) => {
                const receivedChainId = parseChainId(chainId);
                const desiredChainId = typeof desiredChainIdOrChainParameters === 'number'
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
                return this.provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: desiredChainIdHex }],
                })
                    .catch((error) => {
                    if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
                        return this.provider.request({
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
    handleGateAccountChange = (gateWallet) => {
        console.log('gateAccountChange', gateWallet, JSON.stringify(gateWallet) === '{}');
        if (!gateWallet || JSON.stringify(gateWallet) === '{}') {
            this.deactivate?.();
        }
        else {
            updateStore({
                gateAccountInfo: gateWallet,
                account: this.provider.selectedAddress,
                chainId: parseChainId(this.provider.chainId),
            });
        }
    };
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.deactivate();
        }
        else {
            const currentAccount = accounts[0];
            updateStore({
                accounts: accounts,
                account: currentAccount,
            });
        }
    }
    handleConnectEvent({ chainId }) {
        console.log('chainId', chainId);
        updateStore({ chainId: parseChainId(chainId), isActive: true });
    }
    handleChainChanged(chainId) {
        updateStore({ chainId: parseChainId(chainId) });
    }
    deactivate() {
        const provider = this.provider;
        if (!provider)
            return;
        provider.removeListener('connect', this.handleConnectEvent);
        provider.removeListener('gateAccountChange', this.handleGateAccountChange);
        provider.removeListener('chainChanged', this.handleChainChanged);
        provider.removeListener('accountsChanged', this.handleAccountsChanged);
        provider.removeListener('disconnect', this.deactivate);
        localStorage.removeItem(SELECTED_WALLET_KEY);
        resetStore();
    }
    static instance;
    static getInstance() {
        if (GateAppWallet.instance)
            return GateAppWallet.instance;
        GateAppWallet.instance = new GateAppWallet();
        return GateAppWallet.instance;
    }
}

export { GateAppWallet as default };
