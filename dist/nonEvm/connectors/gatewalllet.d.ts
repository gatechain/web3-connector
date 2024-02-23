import { NonEVMConnectorName } from "../types";
import { AccountsChangedHandler, Connector, ConnectorOptions, DisconnectHandler, GateAccountChangeHandler, NetworkChangedHandler } from "./types";
export declare class NonEVMGateWalletConnector implements Connector {
    name: NonEVMConnectorName;
    onAccountsChanged?: AccountsChangedHandler;
    onNetworkChanged?: NetworkChangedHandler;
    onDisconnect?: DisconnectHandler;
    onGateAccountChange?: GateAccountChangeHandler;
    constructor(options?: ConnectorOptions);
    getProvider(): any;
    connect(): Promise<{}>;
    connectEagerly(): Promise<{
        gateAccountInfo: any;
    }>;
    disconnect(): void;
}
