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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HipoWallet = exports.init = exports.walletLinkHooks = exports.walletLink = exports.metaMaskHooks = exports.metaMask = exports.hooks = exports.network = void 0;
const buffer = __importStar(require("buffer"));
window.Buffer = buffer.Buffer;
__exportStar(require("@web3-react/core"), exports);
__exportStar(require("@web3-react/types"), exports);
__exportStar(require("@web3-react/walletlink"), exports);
__exportStar(require("@web3-react/walletconnect"), exports);
__exportStar(require("@web3-react/network"), exports);
__exportStar(require("./metamask"), exports);
const metamask_1 = require("./metamask");
const chains_1 = require("./chains");
const core_1 = require("@web3-react/core");
const walletlink_1 = require("@web3-react/walletlink");
const network_1 = require("@web3-react/network");
_a = (0, core_1.initializeConnector)((actions) => new network_1.Network(actions, chains_1.URLS), Object.keys(chains_1.URLS).map((chainId) => Number(chainId))), exports.network = _a[0], exports.hooks = _a[1];
_b = (0, core_1.initializeConnector)((actions) => new metamask_1.MetaMask(actions)), exports.metaMask = _b[0], exports.metaMaskHooks = _b[1];
_c = (0, core_1.initializeConnector)((actions) => new walletlink_1.WalletLink(actions, { url: chains_1.URLS[1][0], appName: 'web3-react' })), exports.walletLink = _c[0], exports.walletLinkHooks = _c[1];
const walletInstance = {
    metaMask: exports.metaMask,
    walletLink: exports.walletLink
};
const walletHooks = {
    metaMask: exports.metaMaskHooks,
    walletLink: exports.walletLinkHooks
};
const connectWallet = {
    metaMask() {
        return exports.metaMask.activate();
    },
    walletLink() {
        return exports.walletLink.activate();
    }
};
const disConnectWallet = {
    metaMask() {
        return exports.metaMask.deactivate();
    },
    walletLink() {
        return exports.walletLink.deactivate();
    }
};
function init() {
    exports.metaMask.connectEagerly();
    exports.walletLink.connectEagerly();
}
exports.init = init;
class HipoWallet {
    static connect(walletType) {
        const connectorWallet = connectWallet[walletType]() || null;
        HipoWallet.connector = walletInstance[walletType];
        return connectorWallet;
    }
    static disconnect(walletType) {
        disConnectWallet[walletType]();
    }
}
exports.HipoWallet = HipoWallet;
HipoWallet.connector = exports.metaMask;
HipoWallet.getHooks = (walletType) => {
    return walletHooks[walletType] || exports.metaMaskHooks;
};
HipoWallet.init = init;
