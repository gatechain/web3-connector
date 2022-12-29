"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connectWallet = exports.useEagerlyConnect = exports.getConnectionName = exports.getConnection = exports.getIsCoinbaseWallet = exports.getIsMetaMask = exports.getIsInjected = exports.connect = exports.getConnectors = exports.initConnector = void 0;
const core_1 = require("@web3-react/core");
const react_1 = require("react");
const types_1 = require("@web3-react/types");
const metamask_1 = require("./metamask");
const coinbase_wallet_1 = require("@web3-react/coinbase-wallet");
const walletconnect_1 = require("@web3-react/walletconnect");
const types_2 = require("./types");
const storage_1 = require("./storage");
class MetaMaskConnector {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new metamask_1.MetaMask({ actions }));
        }
        return this.instance;
    }
}
class CoinbaseWalletConnector {
    constructor() { }
    static getInstance(URLS) {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new coinbase_wallet_1.CoinbaseWallet({
                actions,
                options: {
                    url: URLS[1][0],
                    appName: 'web3-react',
                }
            }));
        }
        return this.instance;
    }
}
class WalletConnectConnector {
    constructor() { }
    static getInstance(URLS) {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new walletconnect_1.WalletConnect({ actions, options: { rpc: URLS } }));
        }
        return this.instance;
    }
}
function initConnector(URLS) {
    const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
    const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = CoinbaseWalletConnector.getInstance(URLS);
    const [web3WalletConnect, web3WalletConnectHooks] = WalletConnectConnector.getInstance(URLS);
    return [
        [web3Injected, web3InjectedHooks],
        [web3CoinbaseWallet, web3CoinbaseWalletHooks],
        [web3WalletConnect, web3WalletConnectHooks]
    ];
}
exports.initConnector = initConnector;
function getConnectionMap() {
    const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
    const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = CoinbaseWalletConnector.getInstance({});
    const [web3WalletConnect, web3WalletConnectHooks] = WalletConnectConnector.getInstance({});
    const injectedConnection = {
        connector: web3Injected,
        hooks: web3InjectedHooks,
        type: types_2.ConnectionType.INJECTED,
    };
    const coinbaseWalletConnection = {
        connector: web3CoinbaseWallet,
        hooks: web3CoinbaseWalletHooks,
        type: types_2.ConnectionType.COINBASE_WALLET,
    };
    const walletConnectConnection = {
        connector: web3WalletConnect,
        hooks: web3WalletConnectHooks,
        type: types_2.ConnectionType.WALLET_CONNECT,
    };
    return {
        injectedConnection,
        coinbaseWalletConnection,
        walletConnectConnection
    };
}
function getConnectors(URLS) {
    const [[web3Injected, web3InjectedHooks], [web3CoinbaseWallet, web3CoinbaseWalletHooks], [web3WalletConnect, web3WalletConnectHooks]] = initConnector(URLS);
    const connectors = [
        [web3Injected, web3InjectedHooks],
        [web3CoinbaseWallet, web3CoinbaseWalletHooks],
        [web3WalletConnect, web3WalletConnectHooks]
    ];
    return connectors;
}
exports.getConnectors = getConnectors;
function connect(connector) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (connector.connectEagerly) {
                yield connector.connectEagerly();
            }
            else {
                yield connector.activate();
            }
        }
        catch (error) {
            console.debug(`web3-react eager connection error: ${error}`);
        }
    });
}
exports.connect = connect;
function getIsInjected() {
    return Boolean(window.ethereum);
}
exports.getIsInjected = getIsInjected;
function getIsMetaMask() {
    var _a, _b;
    return (_b = (_a = window.ethereum) === null || _a === void 0 ? void 0 : _a.isMetaMask) !== null && _b !== void 0 ? _b : false;
}
exports.getIsMetaMask = getIsMetaMask;
function getIsCoinbaseWallet() {
    var _a, _b;
    return (_b = (_a = window.ethereum) === null || _a === void 0 ? void 0 : _a.isCoinbaseWallet) !== null && _b !== void 0 ? _b : false;
}
exports.getIsCoinbaseWallet = getIsCoinbaseWallet;
function getConnection(c) {
    const { injectedConnection, coinbaseWalletConnection, walletConnectConnection } = getConnectionMap();
    const CONNECTIONS = [
        injectedConnection,
        coinbaseWalletConnection,
        walletConnectConnection
    ];
    if (c instanceof types_1.Connector) {
        const connection = CONNECTIONS.find((connection) => connection.connector === c);
        if (!connection) {
            throw Error('unsupported connector');
        }
        return connection;
    }
    else {
        switch (c) {
            case types_2.ConnectionType.INJECTED:
                return injectedConnection;
            case types_2.ConnectionType.COINBASE_WALLET:
                return coinbaseWalletConnection;
            case types_2.ConnectionType.WALLET_CONNECT:
                return walletConnectConnection;
        }
    }
}
exports.getConnection = getConnection;
function getConnectionName(connectionType, isMetaMask) {
    switch (connectionType) {
        case types_2.ConnectionType.INJECTED:
            return isMetaMask ? 'MetaMask' : 'Injected';
        case types_2.ConnectionType.COINBASE_WALLET:
            return 'Coinbase Wallet';
        case types_2.ConnectionType.WALLET_CONNECT:
            return 'WalletConnect';
    }
}
exports.getConnectionName = getConnectionName;
function getStorage() {
    const storage = (0, storage_1.createStorage)({
        storage: typeof window !== 'undefined' ? window.localStorage : storage_1.noopStorage,
    });
    return storage;
}
const selectedWalletKey = 'selectedWallet';
function useEagerlyConnect(onError) {
    let selectedWallet = undefined;
    const storage = getStorage();
    if (typeof window !== 'undefined') {
        selectedWallet = storage.getItem(selectedWalletKey);
    }
    let selectedConnection;
    if (selectedWallet) {
        try {
            selectedConnection = getConnection(selectedWallet);
        }
        catch (_a) {
            onError && onError();
        }
    }
    (0, react_1.useEffect)(() => {
        if (selectedConnection) {
            connect(selectedConnection.connector);
        }
    }, []);
}
exports.useEagerlyConnect = useEagerlyConnect;
function connectWallet(connectionType) {
    const storage = getStorage();
    let connection;
    switch (connectionType) {
        case types_2.ConnectionType.INJECTED:
            connection = getConnection(types_2.ConnectionType.INJECTED);
            break;
        case types_2.ConnectionType.COINBASE_WALLET:
            connection = getConnection(types_2.ConnectionType.COINBASE_WALLET);
            break;
        case types_2.ConnectionType.WALLET_CONNECT:
            connection = getConnection(types_2.ConnectionType.WALLET_CONNECT);
            break;
    }
    connection && connection.connector.activate();
    storage.setItem(selectedWalletKey, connectionType);
}
exports.connectWallet = connectWallet;
function disconnect(connector) {
    const storage = getStorage();
    if (connector && (connector === null || connector === void 0 ? void 0 : connector.deactivate)) {
        connector.deactivate();
    }
    connector.resetState();
    storage.removeItem(selectedWalletKey);
}
exports.disconnect = disconnect;
