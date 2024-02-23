import React from "react";
import { NonEVMConnectorName, Network } from "./types";
import { Connector } from "./connectors/types";
type NonEVMProviderProps = {
    children: React.ReactNode;
};
export declare const NonEVMProvider: ({ children }: NonEVMProviderProps) => JSX.Element;
export declare const useNonEVMReact: (options?: {
    connectEagerly: boolean;
    connectorName: NonEVMConnectorName;
}) => {
    connect: (connectorName: NonEVMConnectorName) => Promise<void>;
    disconnect: () => void;
    connector: Connector | null;
    signMessage: (message?: string) => Promise<string | undefined>;
    isConnecting: boolean;
    isConnected: boolean;
    address?: string | undefined;
    publicKey?: string | undefined;
    connectorName?: NonEVMConnectorName | undefined;
    network?: Network | undefined;
    gateAccountInfo?: {
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
    hasEVMNetwork?: boolean | undefined;
};
export {};
