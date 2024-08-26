import { ConnectionType } from "./types";
export { useWeb3React } from "./useWeb3ReactHook";
export declare function connectWallet(connectionType: ConnectionType, resolve?: (uri: string) => void, reject?: (err: Error) => void): void;
export declare function disconnect(): void;
export declare function useEagerlyConnect(onError?: Function): void;
