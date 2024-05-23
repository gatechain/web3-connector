"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.useNonEVMReact = exports.NonEVMProvider = void 0;
const react_1 = __importStar(require("react"));
const unisat_1 = require("./connectors/unisat");
const gatewalllet_1 = require("./connectors/gatewalllet");
const connection_1 = require("../connection");
const types_1 = require("../types");
const zustand_1 = require("zustand");
const phantom_1 = require("./connectors/phantom");
const wallet_kit_1 = require("@suiet/wallet-kit");
const useStore = (0, zustand_1.create)((set) => ({
    isConnecting: false,
    isConnected: false,
    connectorName: undefined,
    address: undefined,
    publicKey: undefined,
    network: undefined,
    gateAccountInfo: undefined,
    chainId: undefined,
    dispatch: (action) => set((state) => nonEVMReducer(state, action)),
}));
const nonEVMReducer = (state, action) => {
    var _a, _b, _c, _d;
    switch (action.type) {
        case "on connect": {
            return Object.assign(Object.assign({}, state), { isConnecting: true, connectorName: action.connectorName });
        }
        case "connect failed": {
            return Object.assign(Object.assign({}, state), { isConnecting: false, connectorName: undefined });
        }
        case "connected": {
            return Object.assign(Object.assign({}, state), { isConnecting: false, isConnected: true, connectorName: action.connectorName, address: action.address, publicKey: action.publicKey, network: action.network, gateAccountInfo: action.gateAccountInfo, hasEVMNetwork: !!((_b = (_a = action === null || action === void 0 ? void 0 : action.gateAccountInfo) === null || _a === void 0 ? void 0 : _a.accountNetworkArr) === null || _b === void 0 ? void 0 : _b.find((x) => x.network === "EVM")) });
        }
        case "disconnected": {
            return {
                isConnecting: false,
                isConnected: false,
                connectorName: undefined,
                gateAccountInfo: undefined,
                address: undefined,
                publicKey: undefined,
                network: undefined,
                chainId: undefined,
            };
        }
        case "account changed": {
            return Object.assign(Object.assign({}, state), { address: action.address, publicKey: action.publicKey });
        }
        case "chain change": {
            return Object.assign(Object.assign({}, state), { chainId: action.chainId });
        }
        case "network changed": {
            return Object.assign(Object.assign({}, state), { network: action.network });
        }
        case "gate account change": {
            return Object.assign(Object.assign({}, state), { gateAccountInfo: action.gateAccountInfo, hasEVMNetwork: !!((_d = (_c = action === null || action === void 0 ? void 0 : action.gateAccountInfo) === null || _c === void 0 ? void 0 : _c.accountNetworkArr) === null || _d === void 0 ? void 0 : _d.find((x) => x.network === "EVM")) });
        }
        case "has evm network": {
            return Object.assign(Object.assign({}, state), { hasEVMNetwork: action.hasEvmNetwork });
        }
        default: {
            throw new Error(`Unhandled action type`);
        }
    }
};
const NonEVMProvider = ({ children }) => {
    return react_1.default.createElement(wallet_kit_1.WalletProvider, { autoConnect: false }, children);
};
exports.NonEVMProvider = NonEVMProvider;
const useNonEVMReact = () => {
    const ctx = useStore();
    const defaultConnectorOptions = (0, react_1.useMemo)(() => {
        return {
            onAccountsChanged: (address, publicKey) => {
                ctx.dispatch({
                    type: "account changed",
                    address,
                    publicKey,
                });
            },
            onNetworkChanged: (network) => {
                ctx.dispatch({
                    type: "network changed",
                    network,
                });
            },
            onChainChange: (chainId) => {
                ctx.dispatch({
                    type: "chain change",
                    chainId,
                });
            },
            onDisconnect: () => {
                ctx.dispatch({ type: "disconnected" });
            },
            onGateAccountChange: (gateAccountInfo) => {
                var _a;
                ctx.dispatch({
                    type: "gate account change",
                    gateAccountInfo,
                });
                const hasEVMNetwork = !!((_a = gateAccountInfo === null || gateAccountInfo === void 0 ? void 0 : gateAccountInfo.accountNetworkArr) === null || _a === void 0 ? void 0 : _a.find((x) => x.network === "EVM"));
                ctx.dispatch({
                    type: "has evm network",
                    hasEvmNetwork: hasEVMNetwork,
                });
            },
        };
    }, [ctx.dispatch]);
    const ConnectorMap = (0, react_1.useMemo)(() => ({
        Unisat: unisat_1.UnisatConnector.getInstance(defaultConnectorOptions),
        GateWallet: gatewalllet_1.NonEVMGateWalletConnector.getInstance(defaultConnectorOptions),
        Phantom: phantom_1.PhantomConnector.getInstance(defaultConnectorOptions),
    }), [defaultConnectorOptions]);
    const connector = (0, react_1.useMemo)(() => {
        if (!ctx.connectorName || ctx.connectorName === "Sui")
            return null;
        return ConnectorMap[ctx.connectorName];
    }, [ConnectorMap, ctx.connectorName]);
    const wallet = (0, wallet_kit_1.useWallet)();
    const disconnect = (0, react_1.useCallback)(() => {
        var _a, _b;
        ctx.dispatch({ type: "disconnected" });
        connector === null || connector === void 0 ? void 0 : connector.disconnect();
        wallet.disconnect().catch(() => { });
        const storage = (0, connection_1.getStorage)();
        const connection = (0, connection_1.getConnection)(storage.getItem(connection_1.selectedWalletKey));
        (_b = (_a = connection === null || connection === void 0 ? void 0 : connection.connector) === null || _a === void 0 ? void 0 : _a.deactivate) === null || _b === void 0 ? void 0 : _b.call(_a);
        storage.removeItem(connection_1.selectedWalletKey);
    }, [connector, ctx, wallet]);
    const connect = (0, react_1.useCallback)((connectorName) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            if (ctx.isConnected) {
                if (connectorName === "Sui" && ctx.connectorName === "Sui") {
                }
                else {
                    disconnect();
                }
            }
            // TODO: avoid dispatch if is connected
            ctx.dispatch({
                type: "on connect",
                connectorName,
            });
            if (connectorName === "Sui") {
                const allWallets = [
                    ...wallet.configuredWallets,
                    ...wallet.detectedWallets,
                ];
                const suietWallet = allWallets.find((x) => x.name === "Suiet");
                console.log(suietWallet, suietWallet === null || suietWallet === void 0 ? void 0 : suietWallet.installed);
                if (!(suietWallet === null || suietWallet === void 0 ? void 0 : suietWallet.installed))
                    return;
                console.log("sui", suietWallet.installed);
                yield wallet.select(suietWallet.name);
                const address = (_c = (_b = (_a = suietWallet.adapter) === null || _a === void 0 ? void 0 : _a.accounts) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.address;
                console.log("walletaddress", address, suietWallet);
                const storage = (0, connection_1.getStorage)();
                storage.setItem(connection_1.selectedWalletKey, "Sui");
                ctx.dispatch({
                    type: "connected",
                    connectorName,
                    address: address,
                });
            }
            else {
                const { address, publicKey, network, gateAccountInfo } = (yield ConnectorMap[connectorName].connect()) || {};
                const storage = (0, connection_1.getStorage)();
                const map = {
                    Unisat: types_1.ConnectionType.Unisat,
                    GateWallet: types_1.ConnectionType.GATEWALLET,
                    Phantom: types_1.ConnectionType.PHANTOM,
                };
                storage.setItem(connection_1.selectedWalletKey, map[connectorName]);
                const hasEvmNetwork = !!((_d = gateAccountInfo === null || gateAccountInfo === void 0 ? void 0 : gateAccountInfo.accountNetworkArr) === null || _d === void 0 ? void 0 : _d.find((x) => x.network === "EVM"));
                if (hasEvmNetwork) {
                    const connection = (0, connection_1.getConnection)(types_1.ConnectionType.GATEWALLET);
                    (_f = (_e = connection.connector).connectEagerly) === null || _f === void 0 ? void 0 : _f.call(_e);
                }
                ctx.dispatch({
                    type: "connected",
                    connectorName,
                    address,
                    publicKey,
                    network,
                    gateAccountInfo,
                });
            }
        }
        catch (error) {
            ctx.dispatch({ type: "connect failed" });
            throw error;
        }
    }), [ConnectorMap, ctx, disconnect, wallet]);
    const connectEagerly = (0, react_1.useCallback)((connectorName) => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h, _j;
        try {
            if (ctx.isConnected) {
                disconnect();
            }
            // TODO: avoid dispatch if is connected
            ctx.dispatch({
                type: "on connect",
                connectorName,
            });
            const { address, publicKey, network, gateAccountInfo } = (yield ConnectorMap[connectorName].connectEagerly()) || {};
            const storage = (0, connection_1.getStorage)();
            const map = {
                Unisat: types_1.ConnectionType.Unisat,
                GateWallet: types_1.ConnectionType.GATEWALLET,
                Phantom: types_1.ConnectionType.PHANTOM,
            };
            storage.setItem(connection_1.selectedWalletKey, map[connectorName]);
            const hasEvmNetwork = !!((_g = gateAccountInfo === null || gateAccountInfo === void 0 ? void 0 : gateAccountInfo.accountNetworkArr) === null || _g === void 0 ? void 0 : _g.find((x) => x.network === "EVM"));
            if (hasEvmNetwork) {
                const connection = (0, connection_1.getConnection)(types_1.ConnectionType.GATEWALLET);
                (_j = (_h = connection.connector).connectEagerly) === null || _j === void 0 ? void 0 : _j.call(_h);
            }
            ctx.dispatch({
                type: "connected",
                connectorName,
                address,
                publicKey,
                network,
                gateAccountInfo,
            });
        }
        catch (error) {
            ctx.dispatch({ type: "connect failed" });
            throw error;
        }
    }), [ConnectorMap, ctx, disconnect, wallet]);
    const signMessage = (0, react_1.useCallback)((message) => __awaiter(void 0, void 0, void 0, function* () {
        var _k;
        return (_k = connector === null || connector === void 0 ? void 0 : connector.signMessage) === null || _k === void 0 ? void 0 : _k.call(connector, message);
    }), [connector]);
    return {
        isConnecting: ctx.isConnecting,
        isConnected: ctx.isConnected,
        connectorName: ctx.connectorName,
        address: ctx.address,
        publicKey: ctx.publicKey,
        network: ctx.network,
        gateAccountInfo: ctx.gateAccountInfo,
        chainId: ctx.chainId,
        connect,
        disconnect,
        connector,
        signMessage,
        connectEagerly,
    };
};
exports.useNonEVMReact = useNonEVMReact;
