"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMaskConnector = exports.MetaMask = void 0;
const core_1 = require("@web3-react/core");
const metamask_1 = require("@web3-react/metamask");
const types_1 = require("../types");
var metamask_2 = require("@web3-react/metamask");
Object.defineProperty(exports, "MetaMask", { enumerable: true, get: function () { return metamask_2.MetaMask; } });
class MetaMaskConnector {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new metamask_1.MetaMask({ actions }));
        }
        return this.instance;
    }
    static getConnection() {
        const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
        const injectedConnection = {
            connector: web3Injected,
            hooks: web3InjectedHooks,
            type: types_1.ConnectionType.INJECTED,
        };
        return injectedConnection;
    }
}
exports.MetaMaskConnector = MetaMaskConnector;
