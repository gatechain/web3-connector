import { GateWallet } from "../connectors/gatewallet";
import { Connection } from "../types";
export { GateWallet } from "../connectors/gatewallet";
export declare class GateWalletConnector {
    private constructor();
    private static instance;
    static getInstance(): [GateWallet, import("@web3-react/core").Web3ReactHooks, import("@web3-react/types").Web3ReactStore];
    static getConnection(): Connection;
}
