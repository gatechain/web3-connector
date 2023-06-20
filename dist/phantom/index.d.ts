import type detectEthereumProvider from "./detect";
import type { Actions, AddEthereumChainParameter, Provider } from "@web3-react/types";
import { Connector } from "@web3-react/types";
type PhantomProvider = Provider & {
    isPhantom?: boolean;
    isConnected?: () => boolean;
    providers?: PhantomProvider[];
};
export declare class NoPhantomError extends Error {
    constructor();
}
/**
 * @param options - Options to pass to `@Phantom/detect-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface PhantomConstructorArgs {
    actions: Actions;
    options?: Parameters<typeof detectEthereumProvider>[0];
    onError?: (error: Error) => void;
}
export declare class Phantom extends Connector {
    /** {@inheritdoc Connector.provider} */
    provider?: PhantomProvider;
    private readonly options?;
    private eagerConnection?;
    constructor({ actions, options, onError }: PhantomConstructorArgs);
    private isomorphicInitialize;
    /** {@inheritdoc Connector.connectEagerly} */
    connectEagerly(): Promise<void>;
    /**
     * Initiates a connection.
     *
     * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will switch
     * to the chain.
     */
    activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void>;
}
export {};
