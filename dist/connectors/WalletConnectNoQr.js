"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WalletConnect_1 = __importDefault(require("./WalletConnect"));
class WalletConnectNoQr extends WalletConnect_1.default {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { showQrModal: false }));
        const { setUri } = options;
        this.handleDisplayURI = setUri || function () { };
    }
    static getInstance(setUri) {
        if (WalletConnectNoQr.instance)
            return WalletConnectNoQr.instance;
        WalletConnectNoQr.instance = new WalletConnectNoQr({
            setUri,
        });
        return WalletConnectNoQr.instance;
    }
}
exports.default = WalletConnectNoQr;
