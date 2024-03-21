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
exports.connect = exports.disconnect = exports.connectWallet = exports.useEagerlyConnect = exports.selectedWalletKey = exports.getStorage = exports.getConnection = exports.getConnectionMap = exports.initConnector = exports.getConnectors = void 0;
const react_1 = require("react");
const types_1 = require("@web3-react/types");
const types_2 = require("../types");
const storage_1 = require("../storage");
const metaMask_1 = require("./metaMask");
const phantom_1 = require("./phantom");
const walletConnectV2_1 = require("./walletConnectV2");
const walletConnectV2NotQr_1 = require("./walletConnectV2NotQr");
const walletconnect_v2_1 = require("@web3-react/walletconnect-v2");
const gateWallet_1 = require("./gateWallet");
const context_1 = require("../nonEvm/context");
function getConnectors(config) {
    return initConnector();
}
exports.getConnectors = getConnectors;
function initConnector() {
    const [web3Injected, web3InjectedHooks] = metaMask_1.MetaMaskConnector.getInstance();
    const [gateWallet, getWalletHooks] = gateWallet_1.GateWalletConnector.getInstance();
    const [phantom, phantomHooks] = phantom_1.PhantomConnector.getInstance();
    const [web3WalletConnect, web3WalletConnectHooks] = walletConnectV2_1.WalletConnectConnector.getInstance();
    const [web3WalletNotQrConnect, web3WalletNotQrConnectHooks] = walletConnectV2NotQr_1.WalletConnectNotQrConnector.getInstance();
    return [
        [web3Injected, web3InjectedHooks],
        [web3WalletConnect, web3WalletConnectHooks],
        [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
        [phantom, phantomHooks],
        [gateWallet, getWalletHooks],
    ];
}
exports.initConnector = initConnector;
function getConnectionMap() {
    const phantomConnection = phantom_1.PhantomConnector.getConnection();
    const injectedConnection = metaMask_1.MetaMaskConnector.getConnection();
    const getWalletConnection = gateWallet_1.GateWalletConnector.getConnection();
    const walletConnectConnection = walletConnectV2_1.WalletConnectConnector.getConnection();
    const walletConnectNotQrConnection = walletConnectV2NotQr_1.WalletConnectNotQrConnector.getConnection();
    return [
        injectedConnection,
        phantomConnection,
        walletConnectConnection,
        walletConnectNotQrConnection,
        getWalletConnection,
    ];
}
exports.getConnectionMap = getConnectionMap;
function getConnection(c) {
    const CONNECTIONS = getConnectionMap();
    if (c instanceof types_1.Connector) {
        const connection = CONNECTIONS.find((connection) => connection.connector === c);
        if (!connection) {
            throw Error("unsupported connector");
        }
        return connection;
    }
    else {
        const connectionFind = CONNECTIONS.filter((i) => i.type === c);
        return connectionFind[0];
    }
}
exports.getConnection = getConnection;
function getStorage() {
    const storage = (0, storage_1.createStorage)({
        storage: typeof window !== "undefined" ? window.localStorage : storage_1.noopStorage,
    });
    return storage;
}
exports.getStorage = getStorage;
exports.selectedWalletKey = "selectedWallet";
function useEagerlyConnect(onError) {
    let selectedWallet;
    const storage = getStorage();
    if (typeof window !== "undefined") {
        selectedWallet = storage.getItem(exports.selectedWalletKey);
    }
    const { connectEagerly } = (0, context_1.useNonEVMReact)();
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
    (0, react_1.useEffect)(() => {
        console.log('eargely selectedWallet', selectedWallet);
        if (selectedWallet === types_2.ConnectionType.GATEWALLET) {
            connectEagerly("GateWallet");
            return;
        }
        if (selectedWallet === types_2.ConnectionType.Unisat) {
            connectEagerly("Unisat");
            return;
        }
        if (selectedWallet === types_2.ConnectionType.PHANTOM) {
            connectEagerly("Phantom");
            return;
        }
    }, []);
}
exports.useEagerlyConnect = useEagerlyConnect;
function connectWallet(connectionType, resolve, reject) {
    var _a, _b, _c;
    const storage = getStorage();
    let connection = getConnection(connectionType);
    if (!connection) {
        return;
    }
    (_b = (_a = connection.connector) === null || _a === void 0 ? void 0 : _a.activate()) === null || _b === void 0 ? void 0 : _b.then(() => {
        storage.setItem(exports.selectedWalletKey, connectionType);
    }).catch((err) => {
        reject && reject(err);
    });
    function setUri(uri) {
        var _a;
        if (!uri)
            return;
        resolve && resolve(uri);
        (_a = connection.connector) === null || _a === void 0 ? void 0 : _a.events.removeListener(walletconnect_v2_1.URI_AVAILABLE, setUri);
    }
    if (connectionType === types_2.ConnectionType.WALLET_CONNECT_NOTQR) {
        (_c = connection.connector) === null || _c === void 0 ? void 0 : _c.events.on(walletconnect_v2_1.URI_AVAILABLE, setUri);
    }
}
exports.connectWallet = connectWallet;
function disconnect(connector) {
    const storage = getStorage();
    if (connector && (connector === null || connector === void 0 ? void 0 : connector.deactivate)) {
        connector.deactivate();
    }
    connector.resetState();
    storage.removeItem(exports.selectedWalletKey);
}
exports.disconnect = disconnect;
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
            console.debug(`web3-connector eager connection error: ${error}`);
        }
    });
}
exports.connect = connect;
