import React, { FC } from "react";
interface IGateAccountInfo {
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
}
export declare const GateWalletContext: React.Context<{
    connectInfo: {
        chainId: string;
    } | null;
    gateAccountInfo?: IGateAccountInfo | null | undefined;
    hasEVMNetwork?: boolean | undefined;
    chainId: string;
}>;
export declare const useNonEVMReact: () => {
    connectInfo: {
        chainId: string;
    } | null;
    gateAccountInfo?: IGateAccountInfo | null | undefined;
    hasEVMNetwork?: boolean | undefined;
    chainId: string;
};
export declare const useNonEVMEagerlyConnect: () => void;
export declare const GateWalletProvider: FC<{
    children: any;
}>;
export declare function detectProvider(): any;
export declare function connectGateWallet(): any;
export declare function disconnectGateWallet(): void;
export {};
