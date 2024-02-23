import { NonEVMConnectorName, Network } from "../types";
import { AccountsChangedHandler, Connector, ConnectorOptions, DisconnectHandler, NetworkChangedHandler } from "./types";
export declare class UnisatConnector implements Connector {
    name: NonEVMConnectorName;
    onAccountsChanged?: AccountsChangedHandler;
    onNetworkChanged?: NetworkChangedHandler;
    onDisconnect?: DisconnectHandler;
    constructor(options?: ConnectorOptions);
    getProvider(): any;
    connect(): Promise<{
        address: string;
        publicKey: string;
        network: Network;
    }>;
    connectEagerly(): Promise<{
        address: string;
        publicKey: string;
        network: Network;
    }>;
    disconnect(): void;
    signMessage: (message?: string) => Promise<string>;
}
