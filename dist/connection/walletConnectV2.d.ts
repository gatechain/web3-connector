import { Connection } from "../types";
import { WalletConnectV2 } from "../connectors/walletConnectV2";
export declare class WalletConnectConnector {
    private constructor();
    private static instance;
    static getInstance(): [WalletConnectV2, import("@web3-react/core").Web3ReactHooks, import("@web3-react/types").Web3ReactStore];
    static getConnection(): Connection;
}
