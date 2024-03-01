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
    static instance: NonEVMGateWalletConnector | null;
    private id;
    setOptions(options?: ConnectorOptions): void;
    getProvider(): any;
    connect(): Promise<{
        gateAccountInfo: any;
    } | undefined>;
    private handleGateAccountChange;
    private handleConnect;
    private handleChainChange;
    connectEagerly(): Promise<{
        gateAccountInfo: any;
    } | undefined>;
    disconnect(): void;
    static getInstance(options?: ConnectorOptions): NonEVMGateWalletConnector;
}
