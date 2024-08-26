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
class UnisatWallet extends AbstractWallet_1.AbstractWallet {
    constructor() {
        super();
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    }
    detectProvider(timeout = 3000) {
        let handled = false;
        let that = this;
        return new Promise((resolve) => {
            if (window.unisat) {
                handleUnisat();
            }
            else {
                setTimeout(() => {
                    handleUnisat();
                }, timeout);
            }
            function handleUnisat() {
                if (handled) {
                    return;
                }
                handled = true;
                const { unisat } = window;
                if (unisat) {
                    that.provider = unisat;
                    resolve(unisat);
                }
                else {
                    const message = "Unable to detect window.unisat.";
                    console.error("detect-provider:", message);
                    resolve(null);
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
            provider.on("networkChanged", this.handleNetworkChanged);
            provider.on("accountsChanged", this.handleAccountsChanged);
        });
    }
    handleNetworkChanged(network) {
        (0, useWeb3ReactHook_1.updateStore)({
            network: network,
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activate();
        });
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const [accounts, publicKey, network] = yield Promise.all([
                    provider.requestAccounts(),
                    provider.getPublicKey(),
                    provider.getNetwork(),
                ]);
                (0, useWeb3ReactHook_1.updateStore)({
                    isActive: true,
                    connector: this,
                    currentWallet: types_1.ConnectionType.Unisat,
                    account: accounts[0],
                    accounts: accounts,
                    network: network,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.deactivate();
        }
        else {
            const currentAccount = accounts[0];
            (0, useWeb3ReactHook_1.updateStore)({
                accounts: accounts,
                account: currentAccount,
            });
        }
    }
    deactivate() {
        var _a;
        (_a = this.provider) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        localStorage.removeItem(constant_1.selectedWalletKey);
        (0, useWeb3ReactHook_1.resetStore)();
    }
    static getInstance() {
        if (UnisatWallet.instance)
            return UnisatWallet.instance;
        UnisatWallet.instance = new UnisatWallet();
        return UnisatWallet.instance;
    }
}
exports.default = UnisatWallet;
