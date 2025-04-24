import { selectedWalletKey } from '../constant.js';
import { ConnectionType } from '../types.js';
import { updateStore, resetStore } from '../useWeb3ReactHook.js';
import { AbstractWallet } from './AbstractWallet.js';

class PhantomWallet extends AbstractWallet {
    provider;
    constructor() {
        super();
        this.detectProvider = this.detectProvider.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }
    detectProvider(timeout = 3000) {
        let handled = false;
        let that = this;
        return new Promise((resolve, reject) => {
            if (window.phantom?.solana) {
                handlePhantomwallet();
            }
            else {
                setTimeout(() => {
                    handlePhantomwallet();
                }, timeout);
            }
            function handlePhantomwallet() {
                if (handled) {
                    return;
                }
                handled = true;
                const { phantom } = window;
                if (phantom?.solana) {
                    that.provider = phantom.solana;
                    resolve(phantom);
                }
                else {
                    const message = "Unable to detect window.phantom.solana.";
                    console.error("detect-provider:", message);
                    reject();
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
        provider.on("accountChanged", this.handleAccountsChanged);
        provider.on("disconnect", this.deactivate);
    }
    async activate() {
        await this.initialize();
        const provider = this.provider;
        if (!provider)
            return;
        try {
            const resp = await provider.connect();
            const publicKey = resp?.publicKey?.toString();
            const account = resp?.publicKey?.toBase58();
            updateStore({
                isActive: true,
                account: account,
                currentWallet: ConnectionType.PHANTOM,
                connector: this,
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    async connectEagerly() {
        this.activate();
    }
    handleAccountsChanged(publicKey) {
        updateStore({
            account: publicKey?.toBase58(),
        });
    }
    handleConnectEvent(publicKey) {
        updateStore({ account: publicKey?.toBase58() });
    }
    deactivate() {
        const provider = this.provider;
        if (!provider)
            return;
        provider.removeListener("connect", this.handleConnectEvent);
        provider.removeListener("accountChanged", this.handleAccountsChanged);
        provider.removeListener("disconnect", this.deactivate);
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static instance;
    static getInstance() {
        if (PhantomWallet.instance)
            return PhantomWallet.instance;
        PhantomWallet.instance = new PhantomWallet();
        return PhantomWallet.instance;
    }
}

export { PhantomWallet as default };
