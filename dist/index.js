import React, { createContext, useContext, useEffect } from 'react';
import { makeAutoObservable, configure } from 'mobx';
import { Web3Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import Cookies from 'js-cookie';
import { enableStaticRendering } from 'mobx-react-lite';

const selectedWalletKey = "web3.selectedWallet";

var ConnectionType;
(function (ConnectionType) {
    ConnectionType["INJECTED"] = "INJECTED";
    ConnectionType["GATEWALLET"] = "GATEWALLET";
    ConnectionType["PHANTOM"] = "PHANTOM";
    ConnectionType["WALLET_CONNECT"] = "WALLET_CONNECT";
    ConnectionType["WALLET_CONNECT_NOTQR"] = "WALLET_CONNECT_NOTQR";
    ConnectionType["Unisat"] = "UNISAT";
    ConnectionType["SUI"] = "SUI";
})(ConnectionType || (ConnectionType = {}));

const isServer = typeof window === 'undefined';
function runOnlyInBrowser(fn, fallback) {
    if (isServer)
        return fallback;
    return fn();
}

const cookieStorage = {
    async getItem(key) {
        if (isServer)
            return null;
        return Cookies.get(key) || null;
    },
    async setItem(key, value) {
        if (isServer)
            return;
        Cookies.set(key, value, {
            expires: 30, // 30 days
            sameSite: 'strict',
            secure: window.location.protocol === 'https:',
        });
    },
    async removeItem(key) {
        if (isServer)
            return;
        Cookies.remove(key);
    },
};
function createStorage(config) {
    const { storage, key = 'web3_state' } = config;
    return {
        async getItem(customKey) {
            return storage.getItem(customKey || key);
        },
        async setItem(value, customKey) {
            return storage.setItem(customKey || key, value);
        },
        async removeItem(customKey) {
            return storage.removeItem(customKey || key);
        },
    };
}

const storage = createStorage({
    storage: cookieStorage,
    key: 'web3_store_state'
});
class Web3Store {
    rootStore;
    chainId = undefined;
    isActive = false;
    isActivating = false;
    account = undefined;
    accounts = [];
    gateAccountInfo = undefined;
    currentWallet = undefined;
    connector = undefined;
    network = undefined;
    provider = null;
    constructor(rootStore) {
        this.rootStore = rootStore;
        // 只在客户端进行 observable 初始化
        if (!isServer) {
            makeAutoObservable(this, {}, { autoBind: true });
            // 从 cookie 中恢复状态
            this.hydrate();
        }
    }
    hydrate = async () => {
        try {
            const state = await storage.getItem('web3_store_state');
            if (state) {
                Object.assign(this, JSON.parse(state));
            }
        }
        catch (error) {
            console.error('Failed to hydrate web3 store:', error);
        }
    };
    persist = async () => {
        if (isServer)
            return;
        try {
            const state = {
                chainId: this.chainId,
                isActive: this.isActive,
                account: this.account,
                accounts: this.accounts,
                currentWallet: this.currentWallet,
                network: this.network,
            };
            await storage.setItem('web3_store_state', JSON.stringify(state));
        }
        catch (error) {
            console.error('Failed to persist web3 store:', error);
        }
    };
    updateStore = (update) => {
        if (isServer)
            return;
        Object.assign(this, update);
        // 特殊处理 provider
        if (update.connector?.provider) {
            const provider = update.connector.provider;
            if ([ConnectionType.INJECTED, ConnectionType.WALLET_CONNECT, ConnectionType.WALLET_CONNECT_NOTQR, ConnectionType.GATEWALLET].includes(update.currentWallet) &&
                typeof provider.request === 'function') {
                this.provider = new Web3Provider(provider);
            }
            else {
                this.provider = provider;
            }
        }
        // 持久化状态到 cookie
        this.persist();
    };
    reset = () => {
        if (isServer)
            return;
        this.chainId = undefined;
        this.isActive = false;
        this.isActivating = false;
        this.account = undefined;
        this.accounts = [];
        this.gateAccountInfo = undefined;
        this.currentWallet = undefined;
        this.connector = undefined;
        this.network = undefined;
        this.provider = null;
        // 清除持久化的状态
        storage.removeItem('web3_store_state');
    };
    connect = async (connectionType) => {
        if (isServer)
            return;
        await connectWallet(connectionType);
    };
    disconnect = () => {
        if (isServer)
            return;
        disconnect();
        this.reset();
    };
}

// 启用服务端静态渲染
enableStaticRendering(isServer);
// MobX 配置
configure({
    // 在服务端禁用响应式
    useProxies: 'ifavailable',
    // 强制执行操作必须在 action 中
    enforceActions: 'never',
});

class RootStore {
    web3Store;
    constructor() {
        this.web3Store = new Web3Store(this);
        // 在服务端不初始化 MobX
        if (!isServer) {
            makeAutoObservable(this);
        }
    }
}
// 创建一个单例实例
const rootStore = new RootStore();

const store = rootStore.web3Store;
function updateStore(update) {
    if (isServer)
        return;
    store.updateStore(update);
}
function resetStore() {
    if (isServer)
        return;
    store.reset();
}
const useWeb3React = () => {
    return store;
};
const useNonEVMReact = () => {
    const web3Store = useWeb3React();
    return {
        isConnected: web3Store.isActive,
        isConnecting: web3Store.isActivating,
        address: web3Store.account,
        gateAcountInfo: web3Store.gateAccountInfo,
        chainId: web3Store.chainId,
        connector: web3Store.connector,
        connectiorName: web3Store.currentWallet,
        connect: web3Store.connect.bind(web3Store),
        disconnect: web3Store.disconnect.bind(web3Store),
    };
};

function parseChainId(chainId) {
    return Number.parseInt(chainId, 16);
}

class AbstractWallet {
}

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
                    const message = "Unable to detect window.unisat.";
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
        provider.on("networkChanged", this.handleNetworkChanged);
        provider.on("accountsChanged", this.handleAccountsChanged);
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
        provider.removeListener("networkChanged", this.handleNetworkChanged);
        provider.removeListener("accountsChanged", this.handleAccountsChanged);
        localStorage.removeItem(selectedWalletKey);
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

// 动态导入 WalletConnect provider
const getEthProviderModule = async () => {
    if (isServer)
        return null;
    const module = await import('@walletconnect/ethereum-provider');
    return module.default;
};
function isArrayOneOrMore(input = []) {
    return input.length > 0;
}
function getChainsWithDefault(chains, defaultChainId) {
    if (!chains || !defaultChainId || chains.length === 0) {
        return chains;
    }
    const idx = chains.indexOf(defaultChainId);
    if (idx === -1) {
        throw new Error(`Invalid chainId ${defaultChainId}. Make sure default chain is included in "chains" - chains specified in "optionalChains" may not be selected as the default, as they may not be supported by the wallet.`);
    }
    const ordered = [...chains];
    ordered.splice(idx, 1);
    return [defaultChainId, ...ordered];
}
class WalletConnect extends AbstractWallet {
    defaultChainId = 1;
    constructor({ showQrModal }) {
        super();
        if (!isServer) {
            this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
            this.deactivate = this.deactivate.bind(this);
            this.handleChainChange = this.handleChainChange.bind(this);
            this.handleDisplayURI = this.handleDisplayURI.bind(this);
            this.options.showQrModal = showQrModal;
            const { chains, optionalChains } = this.getChainProps(this.options.chains, this.options.optionalChains, this.defaultChainId);
            this.chains = chains;
            this.optionalChains = optionalChains;
        }
    }
    chains;
    optionalChains;
    options = {
        metadata: {
            name: "GateWallet",
            description: "GateWallet WalletConnect",
            url: "https://www.gate.io/web3",
            icons: ["https://www.gate.io/images/apple-touch-icon-120x120.png"],
        },
        projectId: "49cf6ec6179f8d21bf525adc78d6900a",
        chains: [this.defaultChainId || 1],
        optionalChains: [1, 10, 56, 86, 137, 324, 42161, 43114, 81457],
        showQrModal: true,
        optionalMethods: ["eth_signTypedData", "eth_signTypedData_v4", "eth_sign"],
        qrModalOptions: {
            explorerRecommendedWalletIds: [
                "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
                "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
                "ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef",
                "20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66",
            ],
            themeVariables: {
                "--wcm-z-index": "10000",
            },
        },
    };
    getChainProps(chains, optionalChains, desiredChainId = this.defaultChainId) {
        if (isServer)
            return { chains: [1], optionalChains: [1] };
        const orderedChains = getChainsWithDefault(chains, desiredChainId);
        const orderedOptionalChains = getChainsWithDefault(optionalChains, desiredChainId);
        if (isArrayOneOrMore(orderedChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        else if (isArrayOneOrMore(orderedOptionalChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        throw new Error("Either chains or optionalChains must have at least one item.");
    }
    async detectProvider(desiredChainId = this.defaultChainId) {
        if (isServer)
            return Promise.resolve();
        if (this.provider)
            return Promise.resolve();
        const ethProviderModule = await getEthProviderModule();
        if (!ethProviderModule)
            return Promise.resolve();
        const chainProps = this.getChainProps(this.chains, this.optionalChains, desiredChainId);
        return ethProviderModule
            .init({
            ...this.options,
            ...chainProps,
        })
            .then((provider) => {
            this.provider = provider;
        })
            .catch((err) => {
            console.error(err);
        });
    }
    async initialize(desiredChainId = this.defaultChainId) {
        if (isServer)
            return;
        await this.detectProvider(desiredChainId);
        const provider = this.provider;
        if (!provider)
            return;
        provider.on("disconnect", this.deactivate);
        provider.on("chainChanged", this.handleChainChange);
        provider.on("accountsChanged", this.handleAccountsChanged);
        provider.on("display_uri", this.handleDisplayURI);
    }
    handleChainChange(chainId) {
        if (isServer)
            return;
        updateStore({
            chainId: parseChainId(chainId),
        });
    }
    handleDisplayURI(url) {
        if (isServer)
            return;
        console.log("url", url);
    }
    async connectEagerly() {
        if (isServer)
            return;
        await this.initialize();
        const provider = this.provider;
        if (!provider?.session) {
            console.error(new Error("No active session found. Connect your wallet first."));
            return;
        }
        updateStore({
            isActive: true,
            chainId: provider.chainId,
            accounts: provider.accounts,
            account: provider.accounts[0],
            connector: this,
            currentWallet: ConnectionType.WALLET_CONNECT,
        });
    }
    isLoading = false;
    async activate(desiredChainId = this.defaultChainId) {
        if (isServer)
            return;
        if (this.isLoading)
            return;
        this.isLoading = true;
        await this.initialize(desiredChainId);
        const provider = this.provider;
        if (!provider)
            return;
        try {
            const accounts = await provider.enable();
            updateStore({
                isActive: true,
                chainId: provider.chainId,
                accounts,
                account: accounts[0],
                connector: this,
                currentWallet: ConnectionType.WALLET_CONNECT,
            });
        }
        catch (error) {
            console.error("Failed to activate:", error);
            this.deactivate();
        }
        finally {
            this.isLoading = false;
        }
    }
    handleAccountsChanged(accounts) {
        if (isServer)
            return;
        if (accounts.length === 0) {
            this.deactivate();
        }
        else {
            updateStore({
                accounts,
                account: accounts[0],
            });
        }
    }
    deactivate() {
        if (isServer)
            return;
        const provider = this.provider;
        if (provider) {
            provider.removeListener("disconnect", this.deactivate);
            provider.removeListener("chainChanged", this.handleChainChange);
            provider.removeListener("accountsChanged", this.handleAccountsChanged);
            provider.removeListener("display_uri", this.handleDisplayURI);
            provider.disconnect();
        }
        localStorage.removeItem(selectedWalletKey);
        resetStore();
        this.provider = null;
    }
    static instance;
    static getInstance(showQrModal = true) {
        if (WalletConnect.instance)
            return WalletConnect.instance;
        WalletConnect.instance = new WalletConnect({ showQrModal });
        return WalletConnect.instance;
    }
}

class WalletConnectNoQr extends WalletConnect {
    constructor(options) {
        super({ ...options, showQrModal: false });
        const { setUri } = options;
        this.setUri = setUri || function () { };
    }
    setUri(uri) { }
    handleDisplayURI(url) {
        this.setUri(url);
    }
    async activate(desiredChainId = this.defaultChainId) {
        await this.initialize(desiredChainId);
        const provider = this.provider;
        window.wc = provider;
        if (!provider)
            return;
        if (provider.session) {
            if (!desiredChainId || desiredChainId === provider.chainId)
                return;
            // WalletConnect exposes connected accounts, not chains: `eip155:${chainId}:${address}`
            const isConnectedToDesiredChain = provider.session.namespaces.eip155.accounts.some((account) => account.startsWith(`eip155:${desiredChainId}:`));
            if (!isConnectedToDesiredChain) {
                if (this.options.optionalChains?.includes(desiredChainId)) {
                    throw new Error(`Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`);
                }
                throw new Error(`Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`);
            }
            return provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
            });
        }
        try {
            await provider.enable();
            updateStore({
                isActive: true,
                chainId: provider.chainId,
                accounts: provider.accounts,
                account: provider.accounts[0],
                connector: this,
                currentWallet: ConnectionType.WALLET_CONNECT_NOTQR,
            });
        }
        catch (error) {
            await this.deactivate();
            resetStore();
            throw error;
        }
    }
    static instance;
    static getInstance(setUri) {
        if (WalletConnectNoQr.instance) {
            WalletConnectNoQr.instance.setUri = setUri || function () { };
            return WalletConnectNoQr.instance;
        }
        WalletConnectNoQr.instance = new WalletConnectNoQr({
            setUri,
        });
        return WalletConnectNoQr.instance;
    }
}

const initialState = {
    isActive: false,
    isActivating: false,
    accounts: [],
    provider: null
};
// 创建一个空的 context 值用于服务端渲染
const defaultContextValue = {
    ...initialState,
    connect: async () => { },
    disconnect: () => { }
};
const Web3Context = createContext(defaultContextValue);
let ClientProvider = null;
// 服务端直接返回 null，避免使用任何 hooks
const Web3StateProvider = ({ children }) => {
    if (isServer) {
        return (React.createElement(Web3Context.Provider, { value: defaultContextValue }, children));
    }
    // 客户端才动态加载组件
    if (!ClientProvider) {
        try {
            // 同步加载客户端组件
            ClientProvider = require('./Web3ClientProvider').default;
        }
        catch (e) {
            console.error('Failed to load Web3ClientProvider:', e);
            return (React.createElement(Web3Context.Provider, { value: defaultContextValue }, children));
        }
    }
    return React.createElement(ClientProvider, null, children);
};
const useWeb3State = () => {
    const context = useContext(Web3Context);
    return context;
};

function connectWallet(connectionType, resolve, reject) {
    const { currentWallet, connector } = store;
    if (currentWallet && connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
        connector?.deactivate();
    }
    const connector$1 = getConnector(connectionType, resolve);
    if (connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
        updateStore({ isActivating: true });
    }
    connector$1
        .activate()
        .then(() => {
        localStorage.setItem(selectedWalletKey, JSON.stringify(connectionType));
    })
        .catch((err) => {
        console.error(err);
        reject?.(err);
    })
        .finally(() => {
        updateStore({ isActivating: false });
    });
}
function getConnector(connectionType, resolve) {
    const map = {
        [ConnectionType.GATEWALLET]: GateWallet,
        [ConnectionType.INJECTED]: MetaMaskWallet,
        [ConnectionType.PHANTOM]: PhantomWallet,
        [ConnectionType.Unisat]: UnisatWallet,
        [ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr,
        [ConnectionType.WALLET_CONNECT]: WalletConnect,
    };
    if (connectionType === ConnectionType.WALLET_CONNECT_NOTQR) {
        const connector = map[connectionType].getInstance(resolve);
        return connector;
    }
    else {
        const connector = (map[connectionType] || MetaMaskWallet).getInstance();
        return connector;
    }
}
function disconnect() {
    const { currentWallet } = store;
    const connector = getConnector(currentWallet);
    localStorage.removeItem(selectedWalletKey);
    connector?.deactivate();
}
function useEagerlyConnect(onError) {
    useEffect(() => {
        const selectedWalletString$1 = localStorage.getItem(selectedWalletKey);
        try {
            if (!selectedWalletString$1) {
                onError?.();
                return;
            }
            const selectedWalletString = JSON.parse(selectedWalletString$1);
            const selectedWallet = getConnector(selectedWalletString);
            selectedWallet.connectEagerly();
        }
        catch (error) {
            console.error(error);
        }
    }, []);
}
const isWallet = (params) => {
    const ethereum = window?.ethereum;
    if (params === "MetaMask") {
        return ethereum?.isMetaMask || false;
    }
    if (params === "TokenPocket") {
        return ethereum?.isTokenPocket || false;
    }
    return false;
};

export { ConnectionType, Web3StateProvider, connectWallet, disconnect, isWallet, useEagerlyConnect, useNonEVMReact, useWeb3React, useWeb3State };
