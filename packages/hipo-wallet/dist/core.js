"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinbaseWalletConnection = exports.injectedConnection = void 0;
const _1 = require(".");
const types_1 = require("./types");
const [web3Injected, web3InjectedHooks] = (0, _1.getMetaMaskConnector)();
exports.injectedConnection = {
    connector: web3Injected,
    hooks: web3InjectedHooks,
    type: types_1.ConnectionType.INJECTED,
};
const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = (0, _1.getCoinbaseWalletConnector)();
exports.coinbaseWalletConnection = {
    connector: web3CoinbaseWallet,
    hooks: web3CoinbaseWalletHooks,
    type: types_1.ConnectionType.COINBASE_WALLET,
};
