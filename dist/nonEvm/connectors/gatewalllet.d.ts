import { NonEVMConnectorName } from "../types";
import { AccountsChangedHandler, ChainChangeHandler, Connector, ConnectorOptions, DisconnectHandler, GateAccountChangeHandler, NetworkChangedHandler } from "./types";
export declare class NonEVMGateWalletConnector implements Connector {
    name: NonEVMConnectorName;
    onAccountsChanged?: AccountsChangedHandler;
    onNetworkChanged?: NetworkChangedHandler;
    onDisconnect?: DisconnectHandler;
    onGateAccountChange?: GateAccountChangeHandler;
    onChainChange?: ChainChangeHandler;
    constructor(options?: ConnectorOptions);
    getProvider(): any;
    connect(): Promise<{
        gateAccountInfo: any;
    }>;
    connectEagerly(): Promise<{
        gateAccountInfo: any;
    }>;
    disconnect(): void;
}
