import detectEthereumProvider from '@metamask/detect-provider';
import { AbstractWallet } from './AbstractWallet.js';
import { updateStore, resetStore } from '../useWeb3ReactHook.js';
import { ConnectionType } from '../types.js';
import { selectedWalletKey } from '../constant.js';
import { parseChainId } from '../utils/index.js';
import { isServer, runOnlyInBrowser } from '../utils/env.js';

class MetaMaskWallet extends AbstractWallet {
    constructor() {
        super();
        if (!isServer) {
            this.handleConnectEvent = this.handleConnectEvent.bind(this);
            this.handleChainChanged = this.handleChainChanged.bind(this);
            this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
            this.deactivate = this.deactivate.bind(this);
        }
    }
    provider;
    detectProvider() {
        return runOnlyInBrowser(() => detectEthereumProvider()
            .then((provider$1) => {
            const provider = provider$1?.providers?.length
                ? provider$1?.providers.find((p) => p.isMetaMask) ??
                    provider$1.providers[0]
                : provider$1;
            this.provider = provider;
        })
            .catch((error) => {
            console.error(error);
        }), Promise.resolve());
    }
    async initialize() {
        if (isServer)
            return;
        await this.detectProvider();
        const provider = this.provider;
        if (!provider)
            return;
        provider.on("connect", this.handleConnectEvent);
        provider.on("chainChanged", this.handleChainChanged);
        provider.on("accountsChanged", this.handleAccountsChanged);
        provider.on("disconnect", this.deactivate);
    }
    handleAccountsChanged(accounts) {
        if (isServer)
            return;
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
        if (isServer)
            return;
        console.log("connect chainId", chainId);
        updateStore({ chainId: parseChainId(chainId) });
    }
    handleChainChanged(chainId) {
        if (isServer)
            return;
        console.log("chainChanged chainId", chainId);
        updateStore({ chainId: parseChainId(chainId) });
    }
    activate(desiredChainIdOrChainParameters) {
        if (isServer)
            return Promise.resolve();
        return this.initialize().then(() => {
            const provider = this.provider;
            if (!provider)
                return;
            return Promise.all([
                this.provider.request({ method: "eth_chainId" }),
                this.provider.request({ method: "eth_requestAccounts" }),
            ]).then(([chainId, accounts]) => {
                const receivedChainId = parseChainId(chainId);
                const desiredChainId = typeof desiredChainIdOrChainParameters === "number"
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
                return this.provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: desiredChainIdHex }],
                })
                    .catch((error) => {
                    if (error.code === 4902 &&
                        typeof desiredChainIdOrChainParameters !== "number") {
                        return this.provider.request({
                            method: "wallet_addEthereumChain",
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
    async connectEagerly() {
        if (isServer)
            return;
        await this.initialize();
        const provider = this.provider;
        if (!provider)
            return;
        try {
            const [chainId, accounts] = await Promise.all([
                this.provider.request({ method: "eth_chainId" }),
                this.provider.request({ method: "eth_requestAccounts" }),
            ]);
            updateStore({
                isActive: true,
                chainId: parseChainId(chainId),
                accounts,
                account: accounts?.[0],
                currentWallet: ConnectionType.INJECTED,
                connector: this,
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    deactivate() {
        if (isServer)
            return;
        const provider = this.provider;
        if (!provider)
            return;
        provider.removeListener("connect", this.handleConnectEvent);
        provider.removeListener("chainChanged", this.handleChainChanged);
        provider.removeListener("accountsChanged", this.handleAccountsChanged);
        provider.removeListener("disconnect", this.deactivate);
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static instance;
    static getInstance() {
        if (MetaMaskWallet.instance)
            return MetaMaskWallet.instance;
        MetaMaskWallet.instance = new MetaMaskWallet();
        return MetaMaskWallet.instance;
    }
}

export { MetaMaskWallet as default };
