import { selectedWalletKey } from '../constant.js';
import { ConnectionType } from '../types.js';
import { updateStore, resetStore } from '../useWeb3ReactHook.js';
import { parseChainId } from '../utils/index.js';
import { AbstractWallet } from './AbstractWallet.js';

class GateWallet extends AbstractWallet {
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
            if (window.gatewallet) {
                handlegatewallet();
            }
            else {
                setTimeout(() => {
                    handlegatewallet();
                }, timeout);
            }
            function handlegatewallet() {
                if (handled) {
                    return;
                }
                handled = true;
                const { gatewallet } = window;
                if (gatewallet && gatewallet.isWeb3Wallet) {
                    that.provider = gatewallet;
                    resolve(gatewallet);
                }
                else {
                    const message = "Unable to detect window.gatewallet.";
                    console.error("detect-provider:", message);
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
        provider.on("connect", this.handleConnectEvent);
        provider.on("gateAccountChange", this.handleGateAccountChange);
        provider.on("chainChanged", this.handleChainChanged);
        provider.on("accountsChanged", this.handleAccountsChanged);
        provider.on("disconnect", this.deactivate);
    }
    async connectEagerly() {
        await this.initialize();
        const provider = this.provider;
        if (!provider)
            return;
        try {
            const gateAccountInfo = await provider.getAccount();
            updateStore({
                isActive: true,
                gateAccountInfo,
                connector: this,
                currentWallet: ConnectionType.GATEWALLET,
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    async activate() {
        await this.initialize();
        const provider = this.provider;
        if (!provider)
            return;
        try {
            const gateAccountInfo = await provider.connect();
            updateStore({
                chainId: parseChainId(provider.chainId),
                account: provider.selectedAddress,
                isActive: true,
                gateAccountInfo,
                connector: this,
                currentWallet: ConnectionType.GATEWALLET,
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    handleGateAccountChange = (gateWallet) => {
        console.log("gateAccountChange", gateWallet, JSON.stringify(gateWallet) === "{}");
        if (!gateWallet || JSON.stringify(gateWallet) === "{}") {
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
        console.log("chainId", chainId);
        updateStore({ chainId: parseChainId(chainId), isActive: true });
    }
    handleChainChanged(chainId) {
        updateStore({ chainId: parseChainId(chainId) });
    }
    deactivate() {
        const provider = this.provider;
        if (!provider)
            return;
        provider.removeListener("connect", this.handleConnectEvent);
        provider.removeListener("gateAccountChange", this.handleGateAccountChange);
        provider.removeListener("chainChanged", this.handleChainChanged);
        provider.removeListener("accountsChanged", this.handleAccountsChanged);
        provider.removeListener("disconnect", this.deactivate);
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static instance;
    static getInstance() {
        if (GateWallet.instance)
            return GateWallet.instance;
        GateWallet.instance = new GateWallet();
        return GateWallet.instance;
    }
}

export { GateWallet as default };
