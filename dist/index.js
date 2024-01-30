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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNonEVMEagerlyConnect = exports.GateWalletProvider = exports.useNonEVMReact = exports.connectGateWallet = void 0;
__exportStar(require("@web3-react/core"), exports);
__exportStar(require("@web3-react/types"), exports);
__exportStar(require("./connection"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
var gateWalletHook_1 = require("./gatewallet/gateWalletHook");
Object.defineProperty(exports, "connectGateWallet", { enumerable: true, get: function () { return gateWalletHook_1.connectGateWallet; } });
Object.defineProperty(exports, "useNonEVMReact", { enumerable: true, get: function () { return gateWalletHook_1.useNonEVMReact; } });
Object.defineProperty(exports, "GateWalletProvider", { enumerable: true, get: function () { return gateWalletHook_1.GateWalletProvider; } });
Object.defineProperty(exports, "useNonEVMEagerlyConnect", { enumerable: true, get: function () { return gateWalletHook_1.useNonEVMEagerlyConnect; } });
