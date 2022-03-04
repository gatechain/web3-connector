import type detectEthereumProvider from '@metamask/detect-provider';
import type { Actions, AddEthereumChainParameter } from '@web3-react/types';
import { Connector } from '@web3-react/types';
export declare class NoMetaMaskError extends Error {
    constructor();
}
export declare class MetaMask extends Connector {
    private readonly options?;
    private eagerConnection?;
    /**
     * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
     * @param options - Options to pass to `@metamask/detect-provider`
     */
    constructor(actions: Actions, connectEagerly?: boolean, options?: Parameters<typeof detectEthereumProvider>[0]);
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
}
