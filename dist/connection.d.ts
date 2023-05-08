import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import { MetaMask } from "@web3-react/metamask";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { WalletConnect } from "@web3-react/walletconnect";
import { Connection, ConnectionType } from "./types";
declare type URLMap = {
    [chainId: number]: string | string[];
};
export declare function initConnector(URLS: URLMap): any;
export declare function getConnectors(URLS: URLMap): [MetaMask | CoinbaseWallet | WalletConnect, Web3ReactHooks][];
export declare function connect(connector: Connector): Promise<void>;
export declare function getIsInjected(): boolean;
export declare function getIsMetaMask(): boolean;
export declare function getIsCoinbaseWallet(): boolean;
export declare function getConnection(c: Connector | ConnectionType): {
    connector: CoinbaseWallet;
    hooks: Web3ReactHooks;
    type: ConnectionType;
} | Connection;
export declare function getConnectionName(connectionType: ConnectionType, isMetaMask?: boolean): "MetaMask" | "Injected" | "Coinbase Wallet" | "WalletConnect" | undefined;
export declare function useEagerlyConnect(onError?: Function): void;
export declare function connectWallet(connectionType: ConnectionType): Promise<Connection>;
export declare function disconnect(connector: Connector): void;
export declare function getWCUri(connection: Connection): any;
export {};
