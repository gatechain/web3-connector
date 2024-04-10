import React from "react";
import { NonEVMConnectorName, Network } from "./types";
import { Connector } from "./connectors/types";
type NonEVMProviderProps = {
    children: React.ReactNode;
};
export declare const NonEVMProvider: ({ children }: NonEVMProviderProps) => React.ReactNode;
export declare const useNonEVMReact: () => {
    isConnecting: boolean;
    isConnected: boolean;
    connectorName: NonEVMConnectorName | undefined;
    address: string | undefined;
    publicKey: string | undefined;
    network: Network | undefined;
    gateAccountInfo: {
        walletName: string;
        accountName: string;
        walletId: string;
        accountNetworkArr: Array<{
            accountFormat: string;
            accountFormatName: string;
            address: string;
            network: string;
            accountPublicKey?: string;
        }>;
    } | null | undefined;
    chainId: string | undefined;
    connect: (connectorName: NonEVMConnectorName) => Promise<void>;
    disconnect: () => void;
    connector: Connector | null;
    signMessage: (message?: string) => Promise<string | undefined>;
    connectEagerly: (connectorName: NonEVMConnectorName) => Promise<void>;
};
export {};
