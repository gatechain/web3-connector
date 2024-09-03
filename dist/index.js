import { useSyncExternalStore, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import ethProviderModule from '@walletconnect/ethereum-provider';
import { Web3Provider } from '@ethersproject/providers';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}

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

let initialStore = {
    chainId: undefined,
    isActive: false,
    isActivating: false,
    account: undefined,
    accounts: [],
    provider: undefined,
};
let store = initialStore;
let listeners = [];
function subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
function getSnapshot() {
    return store;
}
function updateStore(s) {
    // const isChanged = diff(store, s);
    var _a;
    // if (!isChanged) return;
    let provider = (_a = s.connector) === null || _a === void 0 ? void 0 : _a.provider;
    if (provider) {
        if ([ConnectionType.INJECTED, ConnectionType.WALLET_CONNECT, ConnectionType.WALLET_CONNECT_NOTQR, ConnectionType.GATEWALLET].includes(s.currentWallet) &&
            !(provider instanceof Web3Provider)) {
            provider = new Web3Provider(provider);
        }
        store = Object.assign(Object.assign(Object.assign({}, store), s), { provider });
    }
    else {
        store = Object.assign(Object.assign({}, store), s);
    }
    emitChange();
}
function resetStore() {
    store = initialStore;
    emitChange();
}
function emitChange() {
    for (let listener of listeners) {
        listener();
    }
}
function useWeb3React() {
    const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return store;
}
function useNonEVMReact() {
    const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return {
        isConnected: store.isActive,
        isConnecting: store.isActivating,
        address: store.account,
        gateAcountInfo: store.gateAccountInfo,
        chainId: store.chainId,
        connector: store.connector,
        connectiorName: store.currentWallet,
        connect: connectWallet,
        disconnect: disconnect,
    };
}

function parseChainId(chainId) {
    return Number.parseInt(chainId, 16);
}

class AbstractWallet {
}

class GateWallet extends AbstractWallet {
    constructor() {
        super();
        this.handleGateAccountChange = (gateWallet) => {
            var _a;
            console.log("gateAccountChange", gateWallet, JSON.stringify(gateWallet) === "{}");
            if (!gateWallet || JSON.stringify(gateWallet) === "{}") {
                (_a = this.deactivate) === null || _a === void 0 ? void 0 : _a.call(this);
            }
            else {
                updateStore({
                    gateAccountInfo: gateWallet,
                    account: this.provider.selectedAddress,
                    chainId: parseChainId(this.provider.chainId),
                });
            }
        };
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
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider();
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("connect", this.handleConnectEvent);
            provider.on("gateAccountChange", this.handleGateAccountChange);
            provider.on("chainChanged", this.handleChainChanged);
            provider.on("accountsChanged", this.handleAccountsChanged);
            provider.on("disconnect", this.deactivate);
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const gateAccountInfo = yield provider.getAccount();
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
        });
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const gateAccountInfo = yield provider.connect();
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
        });
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
        this.handleConnectEvent = this.handleConnectEvent.bind(this);
        this.handleChainChanged = this.handleChainChanged.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }
    /**
     * detectProvider
     */
    detectProvider() {
        return detectEthereumProvider()
            .then((provider$1) => {
            var _a, _b;
            const provider = ((_a = provider$1 === null || provider$1 === void 0 ? void 0 : provider$1.providers) === null || _a === void 0 ? void 0 : _a.length)
                ? (_b = provider$1 === null || provider$1 === void 0 ? void 0 : provider$1.providers.find((p) => p.isMetaMask)) !== null && _b !== void 0 ? _b : provider$1.providers[0]
                : provider$1;
            this.provider = provider;
        })
            .catch((error) => {
            console.error(error);
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider();
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("connect", this.handleConnectEvent);
            provider.on("chainChanged", this.handleChainChanged);
            provider.on("accountsChanged", this.handleAccountsChanged);
            provider.on("disconnect", this.deactivate);
        });
    }
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts.
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
        console.log("connect chainId", chainId);
        updateStore({ chainId: parseChainId(chainId) });
    }
    handleChainChanged(chainId) {
        console.log("chainChanged chainId", chainId);
        updateStore({ chainId: parseChainId(chainId) });
    }
    /**
     * connect
     */
    activate(desiredChainIdOrChainParameters) {
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
                    : desiredChainIdOrChainParameters === null || desiredChainIdOrChainParameters === void 0 ? void 0 : desiredChainIdOrChainParameters.chainId;
                // if there's no desired chain, or it's equal to the received, update
                if (!desiredChainId || receivedChainId === desiredChainId) {
                    updateStore({
                        isActive: true,
                        chainId: parseChainId(chainId),
                        accounts,
                        account: accounts === null || accounts === void 0 ? void 0 : accounts[0],
                        currentWallet: ConnectionType.INJECTED,
                        connector: this,
                    });
                    return;
                }
                const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
                // if we're here, we can try to switch networks
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: desiredChainIdHex }],
                })
                    .catch((error) => {
                    if (error.code === 4902 &&
                        typeof desiredChainIdOrChainParameters !== "number") {
                        // if we're here, we can try to add a new network
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return this.provider.request({
                            method: "wallet_addEthereumChain",
                            params: [
                                Object.assign(Object.assign({}, desiredChainIdOrChainParameters), { chainId: desiredChainIdHex }),
                            ],
                        });
                    }
                    throw error;
                })
                    .then(() => this.activate(desiredChainId));
            });
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const [chainId, accounts] = yield Promise.all([
                    this.provider.request({ method: "eth_chainId" }),
                    this.provider.request({ method: "eth_requestAccounts" }),
                ]);
                updateStore({
                    isActive: true,
                    chainId: parseChainId(chainId),
                    accounts,
                    account: accounts === null || accounts === void 0 ? void 0 : accounts[0],
                    currentWallet: ConnectionType.INJECTED,
                    connector: this,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    /**
     * disconnect
     */
    deactivate() {
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
    static getInstance() {
        if (MetaMaskWallet.instance)
            return MetaMaskWallet.instance;
        MetaMaskWallet.instance = new MetaMaskWallet();
        return MetaMaskWallet.instance;
    }
}

class PhantomWallet extends AbstractWallet {
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
            var _a;
            if ((_a = window.phantom) === null || _a === void 0 ? void 0 : _a.solana) {
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
                if (phantom === null || phantom === void 0 ? void 0 : phantom.solana) {
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
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider();
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("connect", this.handleConnectEvent);
            provider.on("accountChanged", this.handleAccountsChanged);
            provider.on("disconnect", this.deactivate);
        });
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const gateAccountInfo = yield provider.connect();
                updateStore({
                    isActive: true,
                    gateAccountInfo,
                    currentWallet: ConnectionType.PHANTOM,
                    connector: this,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activate();
        });
    }
    handleAccountsChanged(publicKey) {
        updateStore({
            account: publicKey.toBase58(),
        });
    }
    handleConnectEvent(publicKey) {
        updateStore({ account: publicKey.toBase58() });
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
    static getInstance() {
        if (PhantomWallet.instance)
            return PhantomWallet.instance;
        PhantomWallet.instance = new PhantomWallet();
        return PhantomWallet.instance;
    }
}

class UnisatWallet extends AbstractWallet {
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
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider();
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("networkChanged", this.handleNetworkChanged);
            provider.on("accountsChanged", this.handleAccountsChanged);
        });
    }
    handleNetworkChanged(network) {
        updateStore({
            network: network,
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activate();
        });
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const [accounts, publicKey, network] = yield Promise.all([
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
        });
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
    static getInstance() {
        if (UnisatWallet.instance)
            return UnisatWallet.instance;
        UnisatWallet.instance = new UnisatWallet();
        return UnisatWallet.instance;
    }
}

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
    constructor({ showQrModal }) {
        super();
        this.defaultChainId = 1;
        this.options = {
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
                    // "aba1f652e61fd536e8a7a5cd5e0319c9047c435ef8f7e907717361ff33bb3588",
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
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.handleChainChange = this.handleChainChange.bind(this);
        this.handleDisplayURI = this.handleDisplayURI.bind(this);
        this.options.showQrModal = showQrModal;
        const { chains, optionalChains } = this.getChainProps(this.options.chains, this.options.optionalChains, this.defaultChainId);
        this.chains = chains;
        this.optionalChains = optionalChains;
    }
    getChainProps(chains, optionalChains, desiredChainId = this.defaultChainId) {
        // Reorder chains and optionalChains if necessary
        const orderedChains = getChainsWithDefault(chains, desiredChainId);
        const orderedOptionalChains = getChainsWithDefault(optionalChains, desiredChainId);
        // Validate and return the result.
        // Type discrimination requires that we use these typeguard checks to guarantee a valid return type.
        if (isArrayOneOrMore(orderedChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        else if (isArrayOneOrMore(orderedOptionalChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        throw new Error("Either chains or optionalChains must have at least one item.");
    }
    detectProvider(desiredChainId = this.defaultChainId) {
        if (this.provider)
            return Promise.resolve();
        const chainProps = this.getChainProps(this.chains, this.optionalChains, desiredChainId);
        return ethProviderModule
            .init(Object.assign(Object.assign({}, this.options), chainProps))
            .then((provider) => {
            this.provider = provider;
        });
    }
    initialize(desiredChainId = this.defaultChainId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider(desiredChainId);
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("disconnect", this.deactivate);
            provider.on("chainChanged", this.handleChainChange);
            provider.on("accountsChanged", this.handleAccountsChanged);
            provider.on("display_uri", this.handleDisplayURI);
        });
    }
    handleChainChange(chainId) {
        updateStore({
            chainId: parseChainId(chainId),
        });
    }
    handleDisplayURI(url) {
        console.log("url", url);
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider.session) {
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
        });
    }
    activate(desiredChainId = this.defaultChainId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize(desiredChainId);
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
                    if ((_a = this.options.optionalChains) === null || _a === void 0 ? void 0 : _a.includes(desiredChainId)) {
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
                yield provider.enable();
                updateStore({
                    isActive: true,
                    chainId: provider.chainId,
                    accounts: provider.accounts,
                    account: provider.accounts[0],
                    connector: this,
                    currentWallet: ConnectionType.WALLET_CONNECT,
                });
            }
            catch (error) {
                yield this.deactivate();
                throw error;
            }
        });
    }
    handleAccountsChanged(accounts) {
        const currentAccount = accounts[0];
        updateStore({
            accounts: accounts,
            account: currentAccount,
        });
    }
    deactivate() {
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
    }
    static getInstance() {
        if (WalletConnect.instance)
            return WalletConnect.instance;
        WalletConnect.instance = new WalletConnect({ showQrModal: true });
        return WalletConnect.instance;
    }
}

class WalletConnectNoQr extends WalletConnect {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { showQrModal: false }));
        const { setUri } = options;
        this.setUri = setUri || function () { };
    }
    setUri(uri) { }
    handleDisplayURI(url) {
        this.setUri(url);
    }
    activate(desiredChainId = this.defaultChainId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize(desiredChainId);
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
                    if ((_a = this.options.optionalChains) === null || _a === void 0 ? void 0 : _a.includes(desiredChainId)) {
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
                yield provider.enable();
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
                yield this.deactivate();
                resetStore();
                throw error;
            }
        });
    }
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

function connectWallet(connectionType, resolve, reject) {
    const { currentWallet, connector } = store;
    if (currentWallet && connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
        connector === null || connector === void 0 ? void 0 : connector.deactivate();
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
        reject === null || reject === void 0 ? void 0 : reject(err);
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
    connector === null || connector === void 0 ? void 0 : connector.deactivate();
}
function useEagerlyConnect(onError) {
    useEffect(() => {
        const selectedWalletString$1 = localStorage.getItem(selectedWalletKey);
        try {
            if (!selectedWalletString$1) {
                onError === null || onError === void 0 ? void 0 : onError();
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
    const ethereum = window === null || window === void 0 ? void 0 : window.ethereum;
    if (params === "MetaMask") {
        return (ethereum === null || ethereum === void 0 ? void 0 : ethereum.isMetaMask) || false;
    }
    if (params === "TokenPocket") {
        return (ethereum === null || ethereum === void 0 ? void 0 : ethereum.isTokenPocket) || false;
    }
    return false;
};

export { ConnectionType, connectWallet, disconnect, isWallet, useEagerlyConnect, useNonEVMReact, useWeb3React };
