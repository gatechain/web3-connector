import { MetaMask } from "@web3-react/metamask";
import { Connection } from "../types";
export { MetaMask } from "@web3-react/metamask";
export declare class MetaMaskConnector {
    private constructor();
    private static instance;
    static getInstance(): [MetaMask, import("@web3-react/core").Web3ReactHooks, import("@web3-react/types").Web3ReactStore];
    static getConnection(): Connection;
}
