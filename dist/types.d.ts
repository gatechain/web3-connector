import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
export declare enum ConnectionType {
    INJECTED = "INJECTED",
    GATEWALLET = "GATEWALLET",
    PHANTOM = "PHANTOM",
    WALLET_CONNECT = "WALLET_CONNECT",
    WALLET_CONNECT_NOTQR = "WALLET_CONNECT_NOTQR"
}
export interface Connection {
    connector: Connector;
    hooks: Web3ReactHooks;
    type: ConnectionType;
}
