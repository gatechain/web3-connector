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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const detect_provider_1 = __importDefault(require("@metamask/detect-provider"));
const AbstractWallet_1 = require("./AbstractWallet");
const useWeb3ReactHook_1 = require("../useWeb3ReactHook");
const types_1 = require("../types");
const constant_1 = require("../constant");
const utils_1 = require("../utils");
class MetaMaskWallet extends AbstractWallet_1.AbstractWallet {
    constructor() {
        super();
        this.handleConnectEvent = this.handleConnectEvent.bind(this);
        this.handleChainChanged = this.handleChainChanged.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }
    /**
     * detectProvider
     */
    detectProvider() {
        return (0, detect_provider_1.default)()
            .then((provider) => {
            this.provider = provider;
        })
            .catch((error) => {
            console.error(error);
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider();
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("connect", this.handleConnectEvent);
            provider.on("chainChanged", this.handleChainChanged);
            provider.on("accountsChanged", this.handleAccountsChanged);
            provider.on("disconnect", this.deactivate);
        });
    }
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts.
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
    handleConnectEvent({ chainId }) {
        console.log("connect chainId", chainId);
        (0, useWeb3ReactHook_1.updateStore)({ chainId });
    }
    handleChainChanged(chainId) {
        console.log("chainChanged chainId", chainId);
        (0, useWeb3ReactHook_1.updateStore)({ chainId });
    }
    /**
     * connect
     */
    activate(desiredChainIdOrChainParameters) {
        return this.initialize().then(() => {
            const provider = this.provider;
            if (!provider)
                return;
            return Promise.all([
                this.provider.request({ method: "eth_chainId" }),
                this.provider.request({ method: "eth_requestAccounts" }),
            ]).then(([chainId, accounts]) => {
                const receivedChainId = (0, utils_1.parseChainId)(chainId);
                const desiredChainId = typeof desiredChainIdOrChainParameters === "number"
                    ? desiredChainIdOrChainParameters
                    : desiredChainIdOrChainParameters === null || desiredChainIdOrChainParameters === void 0 ? void 0 : desiredChainIdOrChainParameters.chainId;
                // if there's no desired chain, or it's equal to the received, update
                if (!desiredChainId || receivedChainId === desiredChainId) {
                    (0, useWeb3ReactHook_1.updateStore)({
                        isActive: true,
                        chainId: (0, utils_1.parseChainId)(chainId),
                        accounts,
                        account: accounts === null || accounts === void 0 ? void 0 : accounts[0],
                        currentWallet: types_1.ConnectionType.INJECTED,
                        connector: this,
                    });
                    return;
                }
                const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
                // if we're here, we can try to switch networks
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: desiredChainIdHex }],
                })
                    .catch((error) => {
                    if (error.code === 4902 &&
                        typeof desiredChainIdOrChainParameters !== "number") {
                        // if we're here, we can try to add a new network
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return this.provider.request({
                            method: "wallet_addEthereumChain",
                            params: [
                                Object.assign(Object.assign({}, desiredChainIdOrChainParameters), { chainId: desiredChainIdHex }),
                            ],
                        });
                    }
                    throw error;
                })
                    .then(() => this.activate(desiredChainId));
            });
        });
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider)
                return;
            try {
                const [chainId, accounts] = yield Promise.all([
                    this.provider.request({ method: "eth_chainId" }),
                    this.provider.request({ method: "eth_requestAccounts" }),
                ]);
                (0, useWeb3ReactHook_1.updateStore)({
                    isActive: true,
                    chainId,
                    accounts,
                    account: accounts === null || accounts === void 0 ? void 0 : accounts[0],
                    currentWallet: types_1.ConnectionType.INJECTED,
                    connector: this,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    /**
     * disconnect
     */
    deactivate() {
        var _a;
        (_a = this.provider) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        localStorage.removeItem(constant_1.selectedWalletKey);
        (0, useWeb3ReactHook_1.resetStore)();
    }
    static getInstance() {
        if (MetaMaskWallet.instance)
            return MetaMaskWallet.instance;
        MetaMaskWallet.instance = new MetaMaskWallet();
        return MetaMaskWallet.instance;
    }
}
exports.default = MetaMaskWallet;
