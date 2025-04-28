import { SELECTED_WALLET_KEY } from '../constant.js';
import { ConnectionType } from '../types.js';
import { updateStore, resetStore } from '../useWeb3ReactHook.js';
import { AbstractWallet } from './AbstractWallet.js';

class UnisatWallet extends AbstractWallet {
    provider;
    constructor() {
        super();
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    }
    detectProvider(timeout = 3000) {
        let handled = false;
        let that = this;
        return new Promise((resolve) => {
            if (window.unisat) {
                handleUnisat();
            }
            else {
                setTimeout(() => {
                    handleUnisat();
                }, timeout);
            }
            function handleUnisat() {
                if (handled) {
                    return;
                }
                handled = true;
                const { unisat } = window;
                if (unisat) {
                    that.provider = unisat;
                    resolve(unisat);
                }
                else {
                    const message = 'Unable to detect window.unisat.';
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
        provider.on('networkChanged', this.handleNetworkChanged);
        provider.on('accountsChanged', this.handleAccountsChanged);
    }
    handleNetworkChanged(network) {
        updateStore({
            network: network,
        });
    }
    async connectEagerly() {
        this.activate();
    }
    async activate() {
        await this.initialize();
        const provider = this.provider;
        if (!provider)
            return;
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
        }
        catch (error) {
            console.error(error);
        }
    }
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
    deactivate() {
        const provider = this.provider;
        if (!provider)
            return;
        provider.removeListener('networkChanged', this.handleNetworkChanged);
        provider.removeListener('accountsChanged', this.handleAccountsChanged);
        localStorage.removeItem(SELECTED_WALLET_KEY);
        resetStore();
    }
    static instance;
    static getInstance() {
        if (UnisatWallet.instance)
            return UnisatWallet.instance;
        UnisatWallet.instance = new UnisatWallet();
        return UnisatWallet.instance;
    }
}

export { UnisatWallet as default };
