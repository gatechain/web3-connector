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
exports.PhantomConnector = void 0;
const errors_1 = require("../errors");
class PhantomConnector {
    constructor(options) {
        var _a, _b, _c;
        this.name = "Phantom";
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
        if (typeof window === "undefined")
            return;
        if (typeof window.phantom === "undefined") {
            throw new errors_1.ConnectorNotFoundError();
        }
        return window.phantom.solana;
    }
    connect() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = this.getProvider();
                if (provider === null || provider === void 0 ? void 0 : provider.on) {
                    provider.on("connect", (publicKey) => {
                        var _a;
                        (_a = this.onAccountsChanged) === null || _a === void 0 ? void 0 : _a.call(this, publicKey.toBase58(), publicKey);
                    });
                    provider.on("disconnect", (error) => {
                        var _a;
                        console.error(error);
                        (_a = this.onDisconnect) === null || _a === void 0 ? void 0 : _a.call(this);
                    });
                    provider.on("accountChanged", (publicKey) => {
                        var _a;
                        (_a = this.onAccountsChanged) === null || _a === void 0 ? void 0 : _a.call(this, publicKey.toBase58(), publicKey);
                    });
                }
                if (provider) {
                    const resp = yield provider.connect();
                    const publicKey = (_a = resp === null || resp === void 0 ? void 0 : resp.publicKey) === null || _a === void 0 ? void 0 : _a.toString();
                    const account = (_b = resp === null || resp === void 0 ? void 0 : resp.publicKey) === null || _b === void 0 ? void 0 : _b.toBase58();
                    console.log("fsdfs", account, publicKey);
                    return { address: account, publicKey };
                }
                return {};
            }
            catch (error) {
                console.log("connnector error: ", error);
                throw error;
            }
        });
    }
    connectEagerly() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = this.getProvider();
                if (provider === null || provider === void 0 ? void 0 : provider.on) {
                    provider.on("connect", (publicKey) => {
                        var _a;
                        (_a = this.onAccountsChanged) === null || _a === void 0 ? void 0 : _a.call(this, publicKey.toBase58(), publicKey);
                    });
                    provider.on("disconnect", (error) => {
                        var _a;
                        console.error(error);
                        (_a = this.onDisconnect) === null || _a === void 0 ? void 0 : _a.call(this);
                    });
                    provider.on("accountChanged", (publicKey) => {
                        var _a;
                        (_a = this.onAccountsChanged) === null || _a === void 0 ? void 0 : _a.call(this, publicKey.toBase58(), publicKey);
                    });
                }
                if (provider) {
                    const resp = yield provider.connect({ onlyIfTrusted: true });
                    const publicKey = (_a = resp === null || resp === void 0 ? void 0 : resp.publicKey) === null || _a === void 0 ? void 0 : _a.toString();
                    const account = (_b = resp === null || resp === void 0 ? void 0 : resp.publicKey) === null || _b === void 0 ? void 0 : _b.toBase58();
                    return { address: account, publicKey };
                }
                return {};
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
    static getInstance(options) {
        if (this.instance) {
            this.instance.setOptions(options);
            return this.instance;
        }
        this.instance = new PhantomConnector(options);
        return this.instance;
    }
}
exports.PhantomConnector = PhantomConnector;
