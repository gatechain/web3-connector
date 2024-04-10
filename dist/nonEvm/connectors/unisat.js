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
exports.UnisatConnector = void 0;
const errors_1 = require("../errors");
class UnisatConnector {
    constructor(options) {
        var _a, _b, _c;
        this.signMessage = (message) => {
            const provider = this.getProvider();
            return provider.signMessage(message);
        };
        this.name = "Unisat";
        this.setOptions(options);
        this.onAccountsChanged = (_a = this.onAccountsChanged) === null || _a === void 0 ? void 0 : _a.bind(this);
        this.onNetworkChanged = (_b = this.onNetworkChanged) === null || _b === void 0 ? void 0 : _b.bind(this);
        this.onDisconnect = (_c = this.onDisconnect) === null || _c === void 0 ? void 0 : _c.bind(this);
    }
    setOptions(options) {
        this.onAccountsChanged = options === null || options === void 0 ? void 0 : options.onAccountsChanged;
        this.onNetworkChanged = options === null || options === void 0 ? void 0 : options.onNetworkChanged;
        this.onDisconnect = options === null || options === void 0 ? void 0 : options.onDisconnect;
    }
    getProvider() {
        if (window === null || window === void 0 ? void 0 : window.unisat)
            return window.unisat;
        console.error(new errors_1.ConnectorNotFoundError());
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = this.getProvider();
                if (provider.on) {
                    provider.on("accountsChanged", (accounts) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        if (!!accounts && accounts.length > 0) {
                            const publicKey = yield provider.getPublicKey();
                            (_a = this.onAccountsChanged) === null || _a === void 0 ? void 0 : _a.call(this, accounts[0], publicKey);
                        }
                        else {
                            provider.removeAllListeners();
                            (_b = this.onDisconnect) === null || _b === void 0 ? void 0 : _b.call(this);
                        }
                    }));
                    provider.on("networkChanged", (network) => {
                        var _a;
                        (_a = this.onNetworkChanged) === null || _a === void 0 ? void 0 : _a.call(this, network);
                    });
                }
                const accounts = yield provider.requestAccounts();
                const publicKey = yield provider.getPublicKey();
                const network = yield provider.getNetwork();
                return { address: accounts[0], publicKey, network };
            }
            catch (error) {
                console.log("connnector error: ", error);
                throw error;
            }
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connect();
        });
    }
    // Unisat does not provide a disconnect method at this time
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() { }
    static getInstance(options) {
        if (this.instance) {
            this.instance.setOptions(options);
            return this.instance;
        }
        this.instance = new UnisatConnector(options);
        return this.instance;
    }
}
exports.UnisatConnector = UnisatConnector;
