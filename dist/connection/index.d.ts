import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import { Connection, ConnectionType } from "../types";
import { MetaMask } from "./metaMask";
import { Phantom } from "./phantom";
import { GatewalletConnect } from "../connectors/walletConnectV2";
export declare function getConnectors(config?: any): InitConnectorReturnType;
type InitConnectorReturnType = [
    MetaMask | GatewalletConnect | Phantom,
    Web3ReactHooks
][];
export declare function initConnector(): InitConnectorReturnType;
export declare function getConnectionMap(): Connection[];
export declare function getConnection(c: Connector | ConnectionType): Connection;
export declare function useEagerlyConnect(onError?: Function): void;
export declare function connectWallet(connectionType: ConnectionType, cb?: (uri: string) => void): Promise<Connection>;
export declare function disconnect(connector: Connector): void;
export declare function connect(connector: Connector): Promise<void>;
export {};
