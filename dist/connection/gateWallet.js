"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateWalletConnector = exports.GateWallet = void 0;
const core_1 = require("@web3-react/core");
const gatewallet_1 = require("../connectors/gatewallet");
const types_1 = require("../types");
var gatewallet_2 = require("../connectors/gatewallet");
Object.defineProperty(exports, "GateWallet", { enumerable: true, get: function () { return gatewallet_2.GateWallet; } });
class GateWalletConnector {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new gatewallet_1.GateWallet({ actions }));
        }
        return this.instance;
    }
    static getConnection() {
        const [web3Injected, web3InjectedHooks] = GateWalletConnector.getInstance();
        const injectedConnection = {
            connector: web3Injected,
            hooks: web3InjectedHooks,
            type: types_1.ConnectionType.GATEWALLET,
        };
        return injectedConnection;
    }
}
exports.GateWalletConnector = GateWalletConnector;
