"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletConnectConnector = void 0;
const core_1 = require("@web3-react/core");
const types_1 = require("../types");
const walletConnectV2_1 = require("../connectors/walletConnectV2");
// c6c9bacd35afa3eb9e6cccf6d8464395
const projectId = "49cf6ec6179f8d21bf525adc78d6900a";
class WalletConnectConnector {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new walletConnectV2_1.WalletConnectV2({
                actions,
                defaultChainId: 1,
            }));
        }
        return this.instance;
    }
    static getConnection() {
        const [web3WalletConnect, web3WalletConnectHooks] = WalletConnectConnector.getInstance();
        const walletConnectConnection = {
            connector: web3WalletConnect,
            hooks: web3WalletConnectHooks,
            type: types_1.ConnectionType.WALLET_CONNECT,
        };
        return walletConnectConnection;
    }
}
exports.WalletConnectConnector = WalletConnectConnector;
