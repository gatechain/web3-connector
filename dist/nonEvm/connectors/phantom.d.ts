import { NonEVMConnectorName } from "../types";
import { Provider } from "@web3-react/types";
import { AccountsChangedHandler, Connector, ConnectorOptions, DisconnectHandler, NetworkChangedHandler } from "./types";
type PhantomProvider = Provider & {
    connect: (x?: {
        onlyIfTrusted: true;
    }) => Promise<any>;
};
export declare class PhantomConnector implements Connector {
    name: NonEVMConnectorName;
    onAccountsChanged?: AccountsChangedHandler;
    onNetworkChanged?: NetworkChangedHandler;
    onDisconnect?: DisconnectHandler;
    static instance?: PhantomConnector;
    constructor(options?: ConnectorOptions);
    setOptions(options?: ConnectorOptions): void;
    getProvider(): PhantomProvider | undefined;
    connect(): Promise<{
        address: any;
        publicKey: any;
    } | {
        address?: undefined;
        publicKey?: undefined;
    }>;
    connectEagerly(): Promise<{
        address: any;
        publicKey: any;
    } | {
        address?: undefined;
        publicKey?: undefined;
    }>;
    disconnect(): void;
    static getInstance(options?: ConnectorOptions): PhantomConnector;
}
export {};
