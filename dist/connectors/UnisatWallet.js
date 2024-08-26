var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { selectedWalletKey } from "../constant";
import { ConnectionType } from "../types";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import { AbstractWallet } from "./AbstractWallet";
class UnisatWallet extends AbstractWallet {
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
        updateStore({
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
                updateStore({
                    isActive: true,
                    connector: this,
                    currentWallet: ConnectionType.Unisat,
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
            updateStore({
                accounts: accounts,
                account: currentAccount,
            });
        }
    }
    deactivate() {
        var _a;
        (_a = this.provider) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static getInstance() {
        if (UnisatWallet.instance)
            return UnisatWallet.instance;
        UnisatWallet.instance = new UnisatWallet();
        return UnisatWallet.instance;
    }
}
export default UnisatWallet;
