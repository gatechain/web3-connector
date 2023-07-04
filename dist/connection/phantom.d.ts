import { Phantom } from "../connectors/phantom";
import { ConnectionType } from "../types";
export { Phantom } from "../connectors/phantom";
export declare class PhantomConnector {
    private constructor();
    private static instance;
    static getInstance(): [Phantom, import("@web3-react/core").Web3ReactHooks, import("@web3-react/types").Web3ReactStore];
    static getConnection(): {
        connector: Phantom;
        hooks: import("@web3-react/core").Web3ReactHooks;
        type: ConnectionType;
    };
}
