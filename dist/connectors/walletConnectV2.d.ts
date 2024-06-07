import { WalletConnect, WalletConnectConstructorArgs } from "@web3-react/walletconnect-v2";
import { MetadataType } from "../types";
export declare class WalletConnectV2 extends WalletConnect {
    ANALYTICS_EVENT: string;
    constructor({ actions, defaultChainId, qrcode, metadata, onError, }: Omit<WalletConnectConstructorArgs, "options"> & {
        defaultChainId: number;
        qrcode?: boolean;
        metadata?: MetadataType;
    });
}
export declare class GatewalletConnect extends WalletConnectV2 {
    ANALYTICS_EVENT: string;
    static GATE_URI_AVAILABLE: string;
    constructor({ actions, metadata, onError, }: Omit<WalletConnectConstructorArgs, "options"> & {
        defaultChainId: number;
        qrcode?: boolean;
        metadata?: MetadataType;
    });
}
