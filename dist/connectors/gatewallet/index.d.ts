import type detectEthereumProvider from "./detect-provider";
import type { Actions, AddEthereumChainParameter, Provider, WatchAssetParameters } from "@web3-react/types";
import { Connector } from "@web3-react/types";
interface IGateACcountInfo {
    walletName: string;
    accountName: string;
    walletId: string;
    accountNetworkArr: Array<{
        accountFormat: string;
        accountFormatName: string;
        address: string;
        network: string;
        accountPublicKey?: string;
    }>;
    moreAddressSort: Array<any>;
}
type GateWalletProvider = Provider & {
    isMetaMask?: boolean;
    isConnected?: () => boolean;
    providers?: GateWalletProvider[];
    selectedAddress: string;
    connect: () => Promise<IGateACcountInfo>;
    chainId: string;
    getAccount: () => Promise<IGateACcountInfo>;
};
export declare class NoMetaMaskError extends Error {
    constructor();
}
/**
 * @param options - Options to pass to `@metamask/detect-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface MetaMaskConstructorArgs {
    actions: Actions;
    options?: Parameters<typeof detectEthereumProvider>[0];
    onError?: (error: Error) => void;
}
export declare const MAX_SAFE_CHAIN_ID = 4503599627370476;
export declare class GateWallet extends Connector {
    /** {@inheritdoc Connector.provider} */
    provider?: GateWalletProvider;
    private readonly options?;
    private eagerConnection?;
    private _switchingChains;
    constructor({ actions, options, onError }: MetaMaskConstructorArgs);
    private isomorphicInitialize;
    /** {@inheritdoc Connector.connectEagerly} */
    connectEagerly(): Promise<void>;
    /**
     * Initiates a connection.
     *
     * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
     * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
     * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
     * specified parameters first, before being prompted to switch.
     */
    activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void>;
    watchAsset({ address, symbol, decimals, image, }: WatchAssetParameters): Promise<true>;
    deactivate(): void;
}
export {};
