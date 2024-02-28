import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import { Connection, ConnectionType } from "../types";
import { MetaMask } from "./metaMask";
import { Phantom } from "./phantom";
import { GatewalletConnect } from "../connectors/walletConnectV2";
import { GateWallet } from "./gateWallet";
export declare function getConnectors(config?: any): InitConnectorReturnType;
type InitConnectorReturnType = [
    MetaMask | GatewalletConnect | Phantom | GateWallet,
    Web3ReactHooks
][];
export declare function initConnector(): InitConnectorReturnType;
export declare function getConnectionMap(): Connection[];
export declare function getConnection(c: Connector | ConnectionType): Connection;
export declare function getStorage(): import("../storage").ClientStorage;
export declare const selectedWalletKey = "selectedWallet";
export declare function useEagerlyConnect(onError?: Function): void;
export declare function connectWallet(connectionType: ConnectionType, resolve?: (uri: string) => void, reject?: (err: any) => void): void;
export declare function disconnect(connector: Connector): void;
export declare function connect(connector: Connector): Promise<void>;
export {};
