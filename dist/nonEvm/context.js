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
exports.useNonEVMReact = exports.NonEVMProvider = void 0;
const react_1 = require("react");
const unisat_1 = require("./connectors/unisat");
const gatewalllet_1 = require("./connectors/gatewalllet");
const connection_1 = require("../connection");
const types_1 = require("../types");
const zustand_1 = require("zustand");
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
    return children;
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
        Unisat: new unisat_1.UnisatConnector(defaultConnectorOptions),
        GateWallet: gatewalllet_1.NonEVMGateWalletConnector.getInstance(defaultConnectorOptions),
    }), [defaultConnectorOptions]);
    const connector = (0, react_1.useMemo)(() => {
        if (!ctx.connectorName)
            return null;
        return ConnectorMap[ctx.connectorName];
    }, [ConnectorMap, ctx.connectorName]);
    const disconnect = (0, react_1.useCallback)(() => {
        var _a, _b;
        ctx.dispatch({ type: "disconnected" });
        connector === null || connector === void 0 ? void 0 : connector.disconnect();
        const storage = (0, connection_1.getStorage)();
        const connection = (0, connection_1.getConnection)(storage.getItem(connection_1.selectedWalletKey));
        (_b = (_a = connection === null || connection === void 0 ? void 0 : connection.connector) === null || _a === void 0 ? void 0 : _a.deactivate) === null || _b === void 0 ? void 0 : _b.call(_a);
    }, [connector, ctx]);
    const connect = (0, react_1.useCallback)((connectorName) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            if (ctx.isConnected) {
                disconnect();
            }
            // TODO: avoid dispatch if is connected
            ctx.dispatch({
                type: "on connect",
                connectorName,
            });
            const { address, publicKey, network, gateAccountInfo } = (yield ConnectorMap[connectorName].connect()) || {};
            const storage = (0, connection_1.getStorage)();
            const map = {
                Unisat: types_1.ConnectionType.Unisat,
                GateWallet: types_1.ConnectionType.GATEWALLET,
            };
            storage.setItem(connection_1.selectedWalletKey, map[connectorName]);
            const hasEvmNetwork = !!((_a = gateAccountInfo === null || gateAccountInfo === void 0 ? void 0 : gateAccountInfo.accountNetworkArr) === null || _a === void 0 ? void 0 : _a.find((x) => x.network === "EVM"));
            if (hasEvmNetwork) {
                const connection = (0, connection_1.getConnection)(types_1.ConnectionType.GATEWALLET);
                (_c = (_b = connection.connector).connectEagerly) === null || _c === void 0 ? void 0 : _c.call(_b);
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
    }), [ConnectorMap, ctx, disconnect]);
    const connectEagerly = (0, react_1.useCallback)((connectorName) => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e, _f;
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
        catch (error) {
            ctx.dispatch({ type: "connect failed" });
            throw error;
        }
    }), [ConnectorMap, ctx, disconnect]);
    const signMessage = (0, react_1.useCallback)((message) => __awaiter(void 0, void 0, void 0, function* () {
        var _g;
        return (_g = connector === null || connector === void 0 ? void 0 : connector.signMessage) === null || _g === void 0 ? void 0 : _g.call(connector, message);
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
