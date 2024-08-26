"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEagerlyConnect = exports.disconnect = exports.connectWallet = exports.useWeb3React = void 0;
const react_1 = require("react");
const GateWallet_1 = __importDefault(require("./connectors/GateWallet"));
const MetaMaskWallet_1 = __importDefault(require("./connectors/MetaMaskWallet"));
const PhantomWallet_1 = __importDefault(require("./connectors/PhantomWallet"));
const UnisatWallet_1 = __importDefault(require("./connectors/UnisatWallet"));
const constant_1 = require("./constant");
const types_1 = require("./types");
const useWeb3ReactHook_1 = require("./useWeb3ReactHook");
const WalletConnect_1 = __importDefault(require("./connectors/WalletConnect"));
const WalletConnectNoQr_1 = __importDefault(require("./connectors/WalletConnectNoQr"));
var useWeb3ReactHook_2 = require("./useWeb3ReactHook");
Object.defineProperty(exports, "useWeb3React", { enumerable: true, get: function () { return useWeb3ReactHook_2.useWeb3React; } });
function connectWallet(connectionType, resolve, reject) {
    const { currentWallet, connector } = useWeb3ReactHook_1.store;
    if (currentWallet) {
        connector === null || connector === void 0 ? void 0 : connector.deactivate();
    }
    const connector$1 = getConnector(connectionType, resolve);
    if (connectionType !== types_1.ConnectionType.WALLET_CONNECT_NOTQR) {
        (0, useWeb3ReactHook_1.updateStore)({ isActivating: true });
    }
    connector$1
        .activate()
        .then(() => {
        localStorage.setItem(constant_1.selectedWalletKey, connectionType);
    })
        .catch((err) => {
        console.error(err);
        reject === null || reject === void 0 ? void 0 : reject(err);
    })
        .finally(() => {
        (0, useWeb3ReactHook_1.updateStore)({ isActivating: false });
    });
}
exports.connectWallet = connectWallet;
function getConnector(connectionType, resolve) {
    const map = {
        [types_1.ConnectionType.GATEWALLET]: GateWallet_1.default,
        [types_1.ConnectionType.INJECTED]: MetaMaskWallet_1.default,
        [types_1.ConnectionType.PHANTOM]: PhantomWallet_1.default,
        [types_1.ConnectionType.Unisat]: UnisatWallet_1.default,
        [types_1.ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr_1.default,
        [types_1.ConnectionType.WALLET_CONNECT]: WalletConnect_1.default,
    };
    if (connectionType === types_1.ConnectionType.WALLET_CONNECT_NOTQR) {
        const connector = map[connectionType].getInstance(resolve);
        return connector;
    }
    else {
        const connector = (map[connectionType] || MetaMaskWallet_1.default).getInstance();
        return connector;
    }
}
function disconnect() {
    const { currentWallet } = useWeb3ReactHook_1.store;
    const connector = getConnector(currentWallet);
    localStorage.removeItem(constant_1.selectedWalletKey);
    connector === null || connector === void 0 ? void 0 : connector.deactivate();
}
exports.disconnect = disconnect;
function useEagerlyConnect(onError) {
    (0, react_1.useEffect)(() => {
        const selectedWalletString = localStorage.getItem(constant_1.selectedWalletKey);
        if (!selectedWalletString) {
            onError === null || onError === void 0 ? void 0 : onError();
            return;
        }
        const selectedWallet = getConnector(selectedWalletString);
        selectedWallet.connectEagerly();
    }, []);
}
exports.useEagerlyConnect = useEagerlyConnect;
