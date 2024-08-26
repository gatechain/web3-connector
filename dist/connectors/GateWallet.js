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
class GateWallet extends AbstractWallet {
    constructor() {
        super();
        this.handleGateAccountChange = (gateWallet) => {
            var _a;
            console.log("gateAccountChange", gateWallet, JSON.stringify(gateWallet) === "{}");
            if (!gateWallet || JSON.stringify(gateWallet) === "{}") {
                (_a = this.deactivate) === null || _a === void 0 ? void 0 : _a.call(this);
            }
            else {
                updateStore({
                    gateAccountInfo: gateWallet,
                    account: this.provider.selectedAddress,
                    chainId: this.provider.chainId,
                });
            }
        };
        this.handleGateAccountChange = this.handleGateAccountChange.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }
    detectProvider(timeout = 3000) {
        let handled = false;
        let that = this;
        return new Promise((resolve) => {
            if (window.gatewallet) {
                handlegatewallet();
            }
            else {
                setTimeout(() => {
                    handlegatewallet();
                }, timeout);
            }
            function handlegatewallet() {
                if (handled) {
                    return;
                }
                handled = true;
                const { gatewallet } = window;
                if (gatewallet && gatewallet.isWeb3Wallet) {
                    that.provider = gatewallet;
                    resolve(gatewallet);
                }
                else {
                    const message = "Unable to detect window.gatewallet.";
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
            provider.on("connect", this.handleConnectEvent);
            provider.on("gateAccountChange", this.handleGateAccountChange);
            provider.on("chainChanged", this.handleChainChanged);
            provider.on("accountsChanged", this.handleAccountsChanged);
            provider.on("disconnect", this.deactivate);
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const gateAccountInfo = yield provider.getAccount();
                updateStore({
                    isActive: true,
                    gateAccountInfo,
                    connector: this,
                    currentWallet: ConnectionType.GATEWALLET,
                });
            }
            catch (error) {
                console.error(error);
            }
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
                updateStore({
                    isActive: true,
                    gateAccountInfo,
                    connector: this,
                    currentWallet: ConnectionType.GATEWALLET,
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
    handleConnectEvent({ chainId }) {
        updateStore({ chainId });
    }
    handleChainChanged(chainId) {
        updateStore({ chainId });
    }
    deactivate() {
        var _a;
        (_a = this.provider) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static getInstance() {
        if (GateWallet.instance)
            return GateWallet.instance;
        GateWallet.instance = new GateWallet();
        return GateWallet.instance;
    }
}
export default GateWallet;
