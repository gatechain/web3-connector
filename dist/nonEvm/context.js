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
const NonEVMContext = (0, react_1.createContext)(undefined);
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
            return {
                isConnecting: false,
                isConnected: true,
                connectorName: action.connectorName,
                address: action.address,
                publicKey: action.publicKey,
                network: action.network,
                gateAccountInfo: action.gateAccountInfo,
                hasEVMNetwork: !!((_b = (_a = action === null || action === void 0 ? void 0 : action.gateAccountInfo) === null || _a === void 0 ? void 0 : _a.accountNetworkArr) === null || _b === void 0 ? void 0 : _b.find((x) => x.network === "EVM")),
            };
        }
        case "disconnected": {
            return {
                isConnecting: false,
                isConnected: false,
                connectorName: undefined,
                address: undefined,
                publicKey: undefined,
                network: undefined,
            };
        }
        case "account changed": {
            return Object.assign(Object.assign({}, state), { address: action.address, publicKey: action.publicKey });
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
    const [state, dispatch] = (0, react_1.useReducer)(nonEVMReducer, {
        isConnecting: false,
        isConnected: false,
        connectorName: undefined,
        address: undefined,
        publicKey: undefined,
        network: undefined,
        gateAccountInfo: undefined,
    });
    console.log("state", state);
    return (react_1.default.createElement(NonEVMContext.Provider, { value: { state, dispatch } }, children));
};
exports.NonEVMProvider = NonEVMProvider;
const useNonEVMContext = () => {
    const ctx = (0, react_1.useContext)(NonEVMContext);
    if (ctx === undefined) {
        throw new Error("useNonEVMContext must be used within a nonEVMProvider");
    }
    return ctx;
};
const useNonEVMReact = (options) => {
    const ctx = useNonEVMContext();
    const defaultConnectorOptions = (0, react_1.useMemo)(() => ({
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
        onDisconnect: () => {
            ctx.dispatch({ type: "disconnected" });
        },
        onGateAccountChange: (gateAccountInfo) => {
            var _a;
            console.log("fdsfs", gateAccountInfo);
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
    }), [ctx]);
    const ConnectorMap = (0, react_1.useMemo)(() => ({
        Unisat: new unisat_1.UnisatConnector(defaultConnectorOptions),
        GateWallet: new gatewalllet_1.NonEVMGateWalletConnector(defaultConnectorOptions),
    }), [defaultConnectorOptions]);
    const connector = (0, react_1.useMemo)(() => {
        if (!ctx.state.connectorName)
            return null;
        return ConnectorMap[ctx.state.connectorName];
    }, [ConnectorMap, ctx.state.connectorName]);
    const disconnect = (0, react_1.useCallback)(() => {
        ctx.dispatch({ type: "disconnected" });
        connector === null || connector === void 0 ? void 0 : connector.disconnect();
    }, [connector, ctx]);
    const connect = (0, react_1.useCallback)((connectorName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (ctx.state.isConnected) {
                disconnect();
            }
            // TODO: avoid dispatch if is connected
            ctx.dispatch({
                type: "on connect",
                connectorName,
            });
            const { address, publicKey, network, gateAccountInfo } = yield ConnectorMap[connectorName].connect();
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
        try {
            if (ctx.state.isConnected) {
                disconnect();
            }
            // TODO: avoid dispatch if is connected
            ctx.dispatch({
                type: "on connect",
                connectorName,
            });
            const { address, publicKey, network, gateAccountInfo } = yield ConnectorMap[connectorName].connectEagerly();
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
        var _a;
        return (_a = connector === null || connector === void 0 ? void 0 : connector.signMessage) === null || _a === void 0 ? void 0 : _a.call(connector, message);
    }), [connector]);
    (0, react_1.useEffect)(() => {
        if (options === null || options === void 0 ? void 0 : options.connectEagerly) {
            connectEagerly(options.connectorName);
        }
    }, []);
    return Object.assign(Object.assign({}, ctx.state), { connect, disconnect, connector, signMessage });
};
exports.useNonEVMReact = useNonEVMReact;
