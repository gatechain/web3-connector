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
import { parseChainId } from "../utils";
import { AbstractWallet } from "./AbstractWallet";
import ethProviderModule from "@walletconnect/ethereum-provider";
export function isArrayOneOrMore(input = []) {
    return input.length > 0;
}
function getChainsWithDefault(chains, defaultChainId) {
    if (!chains || !defaultChainId || chains.length === 0) {
        return chains;
    }
    const idx = chains.indexOf(defaultChainId);
    if (idx === -1) {
        throw new Error(`Invalid chainId ${defaultChainId}. Make sure default chain is included in "chains" - chains specified in "optionalChains" may not be selected as the default, as they may not be supported by the wallet.`);
    }
    const ordered = [...chains];
    ordered.splice(idx, 1);
    return [defaultChainId, ...ordered];
}
class WalletConnect extends AbstractWallet {
    constructor({ showQrModal }) {
        super();
        this.defaultChainId = 1;
        this.options = {
            metadata: {
                name: "GateWallet",
                description: "GateWallet WalletConnect",
                url: "https://www.gate.io/web3",
                icons: ["https://www.gate.io/images/apple-touch-icon-120x120.png"],
            },
            projectId: "49cf6ec6179f8d21bf525adc78d6900a",
            chains: [this.defaultChainId || 1],
            optionalChains: [1, 10, 56, 86, 137, 324, 42161, 43114, 81457],
            showQrModal: true,
            optionalMethods: ["eth_signTypedData", "eth_signTypedData_v4", "eth_sign"],
            qrModalOptions: {
                explorerRecommendedWalletIds: [
                    // "aba1f652e61fd536e8a7a5cd5e0319c9047c435ef8f7e907717361ff33bb3588",
                    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
                    "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
                    "ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef",
                    "20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66",
                ],
                themeVariables: {
                    "--wcm-z-index": "10000",
                },
            },
        };
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.handleChainChange = this.handleChainChange.bind(this);
        this.handleDisplayURI = this.handleDisplayURI.bind(this);
        this.options.showQrModal = showQrModal;
        const { chains, optionalChains } = this.getChainProps(this.options.chains, this.options.optionalChains, this.defaultChainId);
        this.chains = chains;
        this.optionalChains = optionalChains;
    }
    getChainProps(chains, optionalChains, desiredChainId = this.defaultChainId) {
        // Reorder chains and optionalChains if necessary
        const orderedChains = getChainsWithDefault(chains, desiredChainId);
        const orderedOptionalChains = getChainsWithDefault(optionalChains, desiredChainId);
        // Validate and return the result.
        // Type discrimination requires that we use these typeguard checks to guarantee a valid return type.
        if (isArrayOneOrMore(orderedChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        else if (isArrayOneOrMore(orderedOptionalChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        throw new Error("Either chains or optionalChains must have at least one item.");
    }
    detectProvider(desiredChainId = this.defaultChainId) {
        if (this.provider)
            return Promise.resolve();
        const chainProps = this.getChainProps(this.chains, this.optionalChains, desiredChainId);
        return ethProviderModule
            .init(Object.assign(Object.assign({}, this.options), chainProps))
            .then((provider) => {
            this.provider = provider;
        });
    }
    initialize(desiredChainId = this.defaultChainId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectProvider(desiredChainId);
            const provider = this.provider;
            if (!provider)
                return;
            provider.on("disconnect", this.deactivate);
            provider.on("chainChanged", this.handleChainChange);
            provider.on("accountsChanged", this.handleAccountsChanged);
            provider.on("display_uri", this.handleDisplayURI);
        });
    }
    handleChainChange(chainId) {
        updateStore({
            chainId: parseChainId(chainId),
        });
    }
    handleDisplayURI(url) {
        console.log("url", url);
    }
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            const provider = this.provider;
            if (!provider.session) {
                console.error(new Error("No active session found. Connect your wallet first."));
                return;
            }
            updateStore({
                isActive: true,
                chainId: provider.chainId,
                accounts: provider.accounts,
                account: provider.accounts[0],
                connector: this,
                currentWallet: ConnectionType.WALLET_CONNECT,
            });
        });
    }
    activate(desiredChainId = this.defaultChainId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize(desiredChainId);
            const provider = this.provider;
            window.wc = provider;
            if (!provider)
                return;
            if (provider.session) {
                if (!desiredChainId || desiredChainId === provider.chainId)
                    return;
                // WalletConnect exposes connected accounts, not chains: `eip155:${chainId}:${address}`
                const isConnectedToDesiredChain = provider.session.namespaces.eip155.accounts.some((account) => account.startsWith(`eip155:${desiredChainId}:`));
                if (!isConnectedToDesiredChain) {
                    if ((_a = this.options.optionalChains) === null || _a === void 0 ? void 0 : _a.includes(desiredChainId)) {
                        throw new Error(`Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`);
                    }
                    throw new Error(`Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`);
                }
                return provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
                });
            }
            try {
                yield provider.enable();
                updateStore({
                    isActive: true,
                    chainId: provider.chainId,
                    accounts: provider.accounts,
                    account: provider.accounts[0],
                    connector: this,
                    currentWallet: ConnectionType.WALLET_CONNECT,
                });
            }
            catch (error) {
                yield this.deactivate();
                resetStore();
                throw error;
            }
        });
    }
    handleAccountsChanged(accounts) {
        const currentAccount = accounts[0];
        updateStore({
            accounts: accounts,
            account: currentAccount,
        });
    }
    deactivate() {
        const provider = this.provider;
        if (provider) {
            provider.removeListener("disconnect", this.deactivate);
            provider.removeListener("chainChanged", this.handleChainChange);
            provider.removeListener("accountsChanged", this.handleAccountsChanged);
            provider.removeListener("display_uri", this.handleDisplayURI);
            provider.disconnect();
        }
        localStorage.removeItem(selectedWalletKey);
        resetStore();
    }
    static getInstance() {
        if (WalletConnect.instance)
            return WalletConnect.instance;
        WalletConnect.instance = new WalletConnect({ showQrModal: true });
        return WalletConnect.instance;
    }
}
export default WalletConnect;
