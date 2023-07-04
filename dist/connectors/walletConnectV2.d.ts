import { WalletConnect, WalletConnectConstructorArgs } from "@web3-react/walletconnect-v2";
export declare class WalletConnectV2 extends WalletConnect {
    ANALYTICS_EVENT: string;
    constructor({ actions, defaultChainId, qrcode, onError, }: Omit<WalletConnectConstructorArgs, "options"> & {
        defaultChainId: number;
        qrcode?: boolean;
    });
}
export declare class GatewalletConnect extends WalletConnectV2 {
    ANALYTICS_EVENT: string;
    static GATE_URI_AVAILABLE: string;
    constructor({ actions, onError, }: Omit<WalletConnectConstructorArgs, "options">);
}
