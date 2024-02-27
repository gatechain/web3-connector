"use strict";
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
exports.NonEVMGateWalletConnector = void 0;
const errors_1 = require("../errors");
class NonEVMGateWalletConnector {
    constructor(options) {
        this.name = "GateWallet";
        this.onAccountsChanged = options === null || options === void 0 ? void 0 : options.onAccountsChanged;
        this.onNetworkChanged = options === null || options === void 0 ? void 0 : options.onNetworkChanged;
        this.onDisconnect = options === null || options === void 0 ? void 0 : options.onDisconnect;
        this.onGateAccountChange = options === null || options === void 0 ? void 0 : options.onGateAccountChange;
        this.onChainChange = options === null || options === void 0 ? void 0 : options.onChainChange;
    }
    getProvider() {
        if (typeof window.gatewallet !== "undefined") {
            console.log("Gate Wallet is installed!");
            return window.gatewallet;
        }
        throw new errors_1.ConnectorNotFoundError();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = this.getProvider();
                if (provider.on) {
                    provider.on("connect", (info) => {
                        var _a;
                        console.log("inffo", info);
                        if (info === null || info === void 0 ? void 0 : info.chainId) {
                            (_a = this.onChainChange) === null || _a === void 0 ? void 0 : _a.call(this, info.chainId);
                        }
                    });
                    provider.on("gateAccountChange", (gateWallet) => {
                        var _a, _b, _c;
                        console.log("gateAccountChange", gateWallet);
                        if (!gateWallet) {
                            (_a = this.onDisconnect) === null || _a === void 0 ? void 0 : _a.call(this);
                        }
                        if (JSON.stringify(gateWallet) === "{}") {
                            (_b = this.onDisconnect) === null || _b === void 0 ? void 0 : _b.call(this);
                        }
                        (_c = this.onGateAccountChange) === null || _c === void 0 ? void 0 : _c.call(this, gateWallet);
                    });
                    provider.on("chainChanged", (chainId) => {
                        var _a;
                        console.log("chainId", chainId);
                        (_a = this.onChainChange) === null || _a === void 0 ? void 0 : _a.call(this, chainId);
                    });
                    provider.on("disconnect", (error) => {
                        console.log(error, "error");
                    });
                }
                const info = yield provider.connect();
                console.log("info", info);
                return { gateAccountInfo: info };
            }
            catch (error) {
                console.log("connnector error: ", error);
                throw error;
            }
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = this.getProvider();
                if (provider.on) {
                    provider.on("connect", (info) => {
                        console.log("inffo", info);
                    });
                    provider.on("gateAccountChange", (gateWallet) => {
                        var _a;
                        console.log("gateAccountChange", gateWallet);
                        (_a = this.onGateAccountChange) === null || _a === void 0 ? void 0 : _a.call(this, gateWallet);
                    });
                    provider.on("chainChanged", (chainId) => {
                        console.log("chainId", chainId);
                    });
                    provider.on("disconnect", (error) => {
                        console.log(error, "error");
                    });
                }
                const info = yield provider.getAccount();
                console.log("info", info);
                return { gateAccountInfo: info };
            }
            catch (error) {
                console.log("connnector error: ", error);
                throw error;
            }
        });
    }
    // Unisat does not provide a disconnect method at this time
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() { }
}
exports.NonEVMGateWalletConnector = NonEVMGateWalletConnector;
