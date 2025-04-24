import { selectedWalletKey } from '../constant.js';
import { ConnectionType } from '../types.js';
import { updateStore, resetStore } from '../useWeb3ReactHook.js';
import { parseChainId } from '../utils/index.js';
import { AbstractWallet } from './AbstractWallet.js';
import { isServer } from '../utils/env.js';

// 动态导入 WalletConnect provider
const getEthProviderModule = async () => {
    if (isServer)
        return null;
    const module = await import('@walletconnect/ethereum-provider');
    return module.default;
};
function isArrayOneOrMore(input = []) {
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
    defaultChainId = 1;
    constructor({ showQrModal }) {
        super();
        if (!isServer) {
            this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
            this.deactivate = this.deactivate.bind(this);
            this.handleChainChange = this.handleChainChange.bind(this);
            this.handleDisplayURI = this.handleDisplayURI.bind(this);
            this.options.showQrModal = showQrModal;
            const { chains, optionalChains } = this.getChainProps(this.options.chains, this.options.optionalChains, this.defaultChainId);
            this.chains = chains;
            this.optionalChains = optionalChains;
        }
    }
    chains;
    optionalChains;
    options = {
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
    getChainProps(chains, optionalChains, desiredChainId = this.defaultChainId) {
        if (isServer)
            return { chains: [1], optionalChains: [1] };
        const orderedChains = getChainsWithDefault(chains, desiredChainId);
        const orderedOptionalChains = getChainsWithDefault(optionalChains, desiredChainId);
        if (isArrayOneOrMore(orderedChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        else if (isArrayOneOrMore(orderedOptionalChains)) {
            return { chains: orderedChains, optionalChains: orderedOptionalChains };
        }
        throw new Error("Either chains or optionalChains must have at least one item.");
    }
    async detectProvider(desiredChainId = this.defaultChainId) {
        if (isServer)
            return Promise.resolve();
        if (this.provider)
            return Promise.resolve();
        const ethProviderModule = await getEthProviderModule();
        if (!ethProviderModule)
            return Promise.resolve();
        const chainProps = this.getChainProps(this.chains, this.optionalChains, desiredChainId);
        return ethProviderModule
            .init({
            ...this.options,
            ...chainProps,
        })
            .then((provider) => {
            this.provider = provider;
        })
            .catch((err) => {
            console.error(err);
        });
    }
    async initialize(desiredChainId = this.defaultChainId) {
        if (isServer)
            return;
        await this.detectProvider(desiredChainId);
        const provider = this.provider;
        if (!provider)
            return;
        provider.on("disconnect", this.deactivate);
        provider.on("chainChanged", this.handleChainChange);
        provider.on("accountsChanged", this.handleAccountsChanged);
        provider.on("display_uri", this.handleDisplayURI);
    }
    handleChainChange(chainId) {
        if (isServer)
            return;
        updateStore({
            chainId: parseChainId(chainId),
        });
    }
    handleDisplayURI(url) {
        if (isServer)
            return;
        console.log("url", url);
    }
    async connectEagerly() {
        if (isServer)
            return;
        await this.initialize();
        const provider = this.provider;
        if (!provider?.session) {
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
    }
    isLoading = false;
    async activate(desiredChainId = this.defaultChainId) {
        if (isServer)
            return;
        if (this.isLoading)
            return;
        this.isLoading = true;
        await this.initialize(desiredChainId);
        const provider = this.provider;
        if (!provider)
            return;
        try {
            const accounts = await provider.enable();
            updateStore({
                isActive: true,
                chainId: provider.chainId,
                accounts,
                account: accounts[0],
                connector: this,
                currentWallet: ConnectionType.WALLET_CONNECT,
            });
        }
        catch (error) {
            console.error("Failed to activate:", error);
            this.deactivate();
        }
        finally {
            this.isLoading = false;
        }
    }
    handleAccountsChanged(accounts) {
        if (isServer)
            return;
        if (accounts.length === 0) {
            this.deactivate();
        }
        else {
            updateStore({
                accounts,
                account: accounts[0],
            });
        }
    }
    deactivate() {
        if (isServer)
            return;
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
        this.provider = null;
    }
    static instance;
    static getInstance(showQrModal = true) {
        if (WalletConnect.instance)
            return WalletConnect.instance;
        WalletConnect.instance = new WalletConnect({ showQrModal });
        return WalletConnect.instance;
    }
}

export { WalletConnect as default, isArrayOneOrMore };
