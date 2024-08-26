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
const constant_1 = require("../constant");
const types_1 = require("../types");
const useWeb3ReactHook_1 = require("../useWeb3ReactHook");
const AbstractWallet_1 = require("./AbstractWallet");
class PhantomWallet extends AbstractWallet_1.AbstractWallet {
    constructor() {
        super();
        this.detectProvider = this.detectProvider.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }
    detectProvider(timeout = 3000) {
        let handled = false;
        let that = this;
        return new Promise((resolve, reject) => {
            var _a;
            if ((_a = window.phantom) === null || _a === void 0 ? void 0 : _a.solana) {
                handlePhantomwallet();
            }
            else {
                setTimeout(() => {
                    handlePhantomwallet();
                }, timeout);
            }
            function handlePhantomwallet() {
                if (handled) {
                    return;
                }
                handled = true;
                const { phantom } = window;
                if (phantom === null || phantom === void 0 ? void 0 : phantom.solana) {
                    that.provider = phantom.solana;
                    resolve(phantom);
                }
                else {
                    const message = "Unable to detect window.phantom.solana.";
                    console.error("detect-provider:", message);
                    reject();
                }
            }
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider();
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("connect", this.handleConnectEvent);
            provider.on("accountChanged", this.handleAccountsChanged);
            provider.on("disconnect", this.deactivate);
        });
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const gateAccountInfo = yield provider.connect();
                (0, useWeb3ReactHook_1.updateStore)({
                    isActive: true,
                    gateAccountInfo,
                    currentWallet: types_1.ConnectionType.PHANTOM,
                    connector: this,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activate();
        });
    }
    handleAccountsChanged(publicKey) {
        (0, useWeb3ReactHook_1.updateStore)({
            account: publicKey.toBase58(),
        });
    }
    handleConnectEvent(publicKey) {
        (0, useWeb3ReactHook_1.updateStore)({ account: publicKey.toBase58() });
    }
    deactivate() {
        var _a;
        (_a = this.provider) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        localStorage.removeItem(constant_1.selectedWalletKey);
        (0, useWeb3ReactHook_1.resetStore)();
    }
    static getInstance() {
        if (PhantomWallet.instance)
            return PhantomWallet.instance;
        PhantomWallet.instance = new PhantomWallet();
        return PhantomWallet.instance;
    }
}
exports.default = PhantomWallet;
