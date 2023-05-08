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
exports.getWCUri = exports.disconnect = exports.connectWallet = exports.useEagerlyConnect = exports.getConnectionName = exports.getConnection = exports.getIsCoinbaseWallet = exports.getIsMetaMask = exports.getIsInjected = exports.connect = exports.getConnectors = exports.initConnector = void 0;
const core_1 = require("@web3-react/core");
const react_1 = require("react");
const types_1 = require("@web3-react/types");
const metamask_1 = require("@web3-react/metamask");
const walletconnect_1 = require("@web3-react/walletconnect");
const types_2 = require("./types");
const storage_1 = require("./storage");
const utils_1 = require("./utils");
class MetaMaskConnector {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new metamask_1.MetaMask({ actions }));
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
class WalletConnectNotQrConnector {
    constructor() { }
    static getInstance(URLS) {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new walletconnect_1.WalletConnect({ actions, options: { rpc: URLS, qrcode: false } }));
        }
        return this.instance;
    }
}
function initConnector(URLS) {
    const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
    const [web3WalletConnect, web3WalletConnectHooks] = WalletConnectConnector.getInstance(URLS);
    const [web3WalletNotQrConnect, web3WalletNotQrConnectHooks] = WalletConnectNotQrConnector.getInstance(URLS);
    return [
        [web3Injected, web3InjectedHooks],
        [web3WalletConnect, web3WalletConnectHooks],
        [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
    ];
}
exports.initConnector = initConnector;
function getConnectionMap() {
    const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
    const [web3WalletConnect, web3WalletConnectHooks] = WalletConnectConnector.getInstance({});
    const [web3WalletNotQrConnect, web3WalletNotQrConnectHooks] = WalletConnectNotQrConnector.getInstance({});
    const injectedConnection = {
        connector: web3Injected,
        hooks: web3InjectedHooks,
        type: types_2.ConnectionType.INJECTED,
    };
    const walletConnectConnection = {
        connector: web3WalletConnect,
        hooks: web3WalletConnectHooks,
        type: types_2.ConnectionType.WALLET_CONNECT,
    };
    const walletConnectNotQrConnection = {
        connector: web3WalletNotQrConnect,
        hooks: web3WalletNotQrConnectHooks,
        type: types_2.ConnectionType.WALLET_CONNECT_NOTQR,
    };
    return {
        injectedConnection,
        walletConnectConnection,
        walletConnectNotQrConnection,
    };
}
function getConnectors(URLS) {
    const [[web3Injected, web3InjectedHooks], [web3WalletConnect, web3WalletConnectHooks], [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],] = initConnector(URLS);
    const connectors = [
        [web3Injected, web3InjectedHooks],
        [web3WalletConnect, web3WalletConnectHooks],
        [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
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
    const { injectedConnection, walletConnectConnection, walletConnectNotQrConnection, } = getConnectionMap();
    const CONNECTIONS = [
        injectedConnection,
        walletConnectConnection,
        walletConnectNotQrConnection,
    ];
    if (c instanceof types_1.Connector) {
        const connection = CONNECTIONS.find((connection) => connection.connector === c);
        if (!connection) {
            throw Error("unsupported connector");
        }
        return connection;
    }
    else {
        switch (c) {
            case types_2.ConnectionType.INJECTED:
                return injectedConnection;
            case types_2.ConnectionType.WALLET_CONNECT:
                return walletConnectConnection;
            case types_2.ConnectionType.WALLET_CONNECT_NOTQR:
                return walletConnectNotQrConnection;
        }
    }
}
exports.getConnection = getConnection;
function getConnectionName(connectionType, isMetaMask) {
    switch (connectionType) {
        case types_2.ConnectionType.INJECTED:
            return isMetaMask ? "MetaMask" : "Injected";
        case types_2.ConnectionType.WALLET_CONNECT:
            return "WalletConnect";
    }
}
exports.getConnectionName = getConnectionName;
function getStorage() {
    const storage = (0, storage_1.createStorage)({
        storage: typeof window !== "undefined" ? window.localStorage : storage_1.noopStorage,
    });
    return storage;
}
const selectedWalletKey = "selectedWallet";
function useEagerlyConnect(onError) {
    let selectedWallet = undefined;
    const storage = getStorage();
    if (typeof window !== "undefined") {
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
    return __awaiter(this, void 0, void 0, function* () {
        const storage = getStorage();
        let connection;
        switch (connectionType) {
            case types_2.ConnectionType.INJECTED:
                connection = getConnection(types_2.ConnectionType.INJECTED);
                break;
            case types_2.ConnectionType.WALLET_CONNECT:
                connection = getConnection(types_2.ConnectionType.WALLET_CONNECT);
                break;
            case types_2.ConnectionType.WALLET_CONNECT_NOTQR:
                connection = getConnection(types_2.ConnectionType.WALLET_CONNECT_NOTQR);
                break;
        }
        connection && connection.connector.activate();
        storage.setItem(selectedWalletKey, connectionType);
        yield (0, utils_1.delay)(100);
        return connection;
    });
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
function getWCUri(connection) {
    var _a, _b;
    try {
        const { uri } = (_b = (_a = connection.connector) === null || _a === void 0 ? void 0 : _a.provider) === null || _b === void 0 ? void 0 : _b.connector;
        return uri;
    }
    catch (e) {
        return "";
    }
}
exports.getWCUri = getWCUri;
