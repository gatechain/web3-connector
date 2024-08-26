var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import detectEthereumProvider from "@metamask/detect-provider";
import { AbstractWallet } from "./AbstractWallet";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import { ConnectionType } from "../types";
import { selectedWalletKey } from "../constant";
import { parseChainId } from "../utils";
class MetaMaskWallet extends AbstractWallet {
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
        return detectEthereumProvider()
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
            updateStore({
                accounts: accounts,
                account: currentAccount,
            });
        }
    }
    handleConnectEvent({ chainId }) {
        console.log("connect chainId", chainId);
        updateStore({ chainId });
    }
    handleChainChanged(chainId) {
        console.log("chainChanged chainId", chainId);
        updateStore({ chainId });
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
                const receivedChainId = parseChainId(chainId);
                const desiredChainId = typeof desiredChainIdOrChainParameters === "number"
                    ? desiredChainIdOrChainParameters
                    : desiredChainIdOrChainParameters === null || desiredChainIdOrChainParameters === void 0 ? void 0 : desiredChainIdOrChainParameters.chainId;
                // if there's no desired chain, or it's equal to the received, update
                if (!desiredChainId || receivedChainId === desiredChainId) {
                    updateStore({
                        isActive: true,
                        chainId: parseChainId(chainId),
                        accounts,
                        account: accounts === null || accounts === void 0 ? void 0 : accounts[0],
                        currentWallet: ConnectionType.INJECTED,
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
                updateStore({
                    isActive: true,
                    chainId,
                    accounts,
                    account: accounts === null || accounts === void 0 ? void 0 : accounts[0],
                    currentWallet: ConnectionType.INJECTED,
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
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static getInstance() {
        if (MetaMaskWallet.instance)
            return MetaMaskWallet.instance;
        MetaMaskWallet.instance = new MetaMaskWallet();
        return MetaMaskWallet.instance;
    }
}
export default MetaMaskWallet;
