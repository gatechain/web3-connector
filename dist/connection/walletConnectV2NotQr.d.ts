import { Connection } from "../types";
import { GatewalletConnect } from "../connectors/walletConnectV2";
export declare class WalletConnectNotQrConnector {
    private constructor();
    private static instance;
    static getInstance(): [GatewalletConnect, import("@web3-react/core").Web3ReactHooks, import("@web3-react/types").Web3ReactStore];
    static getConnection(): Connection;
}
