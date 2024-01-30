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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectGateWallet = exports.detectProvider = exports.GateWalletProvider = exports.useNonEVMEagerlyConnect = exports.useNonEVMReact = exports.GateWalletContext = void 0;
const react_1 = __importStar(require("react"));
const events_1 = __importDefault(require("events"));
const eventEmitter = new events_1.default();
exports.GateWalletContext = (0, react_1.createContext)({
    connectInfo: null,
    gateAccountInfo: null,
    hasEVMNetwork: false,
    chainId: "",
});
const useNonEVMReact = () => {
    const gatewallet = (0, react_1.useContext)(exports.GateWalletContext);
    return gatewallet;
};
exports.useNonEVMReact = useNonEVMReact;
const useNonEVMEagerlyConnect = () => {
    (0, react_1.useEffect)(() => {
        var _a;
        const provider = detectProvider();
        if (!provider)
            return;
        provider.on("connect", (info) => {
            eventEmitter.emit("connect", info);
        });
        provider.on("gateAccountChange", (gateWallet) => {
            console.log("gateAccountChange", gateWallet, gateWallet);
            eventEmitter.emit("gateAccountChange", gateWallet);
        });
        provider.on("chainChanged", (chainId) => {
            console.log("chainChanged", chainId);
            eventEmitter.emit("chainChanged", chainId);
        });
        provider.on("disconnect", (error) => {
            console.log(error, "error");
        });
        (_a = provider
            .getAccount) === null || _a === void 0 ? void 0 : _a.call(provider).then((gc) => {
            console.log(gc, "connectEagerly gc", provider);
        }).catch((err) => {
            console.error("gatewallet.getAccount错误", err);
        });
    }, []);
};
exports.useNonEVMEagerlyConnect = useNonEVMEagerlyConnect;
const GateWalletProvider = ({ children }) => {
    const [connectInfo, setConnectInfo] = (0, react_1.useState)(null);
    const [gateAccountInfo, setGateAccountInfo] = (0, react_1.useState)({});
    const [chain, setChain] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        eventEmitter.on("connect", (info) => {
            console.log("--emitter--info", info);
            setConnectInfo(info);
            setChain(info.chainId);
        });
        eventEmitter.on("gateAccountChange", (gateWallet) => {
            console.log("--emitter--gateWallet", gateWallet);
            setGateAccountInfo(gateWallet);
        });
        eventEmitter.on("chainChanged", (chainId) => {
            console.log("--emitter--chainId", chainId);
            setChain(chainId);
        });
    }, []);
    const hasEVMNetwork = (0, react_1.useMemo)(() => {
        var _a;
        return !!((_a = gateAccountInfo === null || gateAccountInfo === void 0 ? void 0 : gateAccountInfo.accountNetworkArr) === null || _a === void 0 ? void 0 : _a.find((x) => x.network === "EVM"));
    }, [gateAccountInfo]);
    const value = (0, react_1.useMemo)(() => {
        return {
            connectInfo,
            gateAccountInfo,
            chainId: chain,
            hasEVMNetwork: hasEVMNetwork,
        };
    }, [connectInfo, gateAccountInfo, chain, hasEVMNetwork]);
    return (react_1.default.createElement(exports.GateWalletContext.Provider, { value: value }, children));
};
exports.GateWalletProvider = GateWalletProvider;
function detectProvider() {
    if (typeof window.gatewallet !== "undefined") {
        console.log("Gate Wallet is installed!");
        return window.gatewallet;
    }
    return false;
}
exports.detectProvider = detectProvider;
function connectGateWallet() {
    const provider = detectProvider();
    if (!provider)
        return;
    provider.on("connect", (info) => {
        eventEmitter.emit("connect", info);
    });
    provider.on("gateAccountChange", (gateWallet) => {
        console.log("gateAccountChange", gateWallet, gateWallet);
        eventEmitter.emit("gateAccountChange", gateWallet);
    });
    provider.on("chainChanged", (chainId) => {
        console.log("chainChanged", chainId);
        eventEmitter.emit("chainChanged", chainId);
    });
    provider.on("disconnect", (error) => {
        console.log(error, "error");
    });
    return provider.connect();
}
exports.connectGateWallet = connectGateWallet;
