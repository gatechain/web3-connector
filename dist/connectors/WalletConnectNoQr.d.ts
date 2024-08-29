import WalletConnect from "./WalletConnect";
type UriCallback = (uri: string) => void;
declare class WalletConnectNoQr extends WalletConnect {
    constructor(options: {
        setUri?: UriCallback;
    });
    setUri(uri: string): void;
    protected handleDisplayURI(url: string): void;
    activate(desiredChainId?: number): Promise<any>;
    static instance: WalletConnectNoQr;
    static getInstance(setUri?: UriCallback): WalletConnectNoQr;
}
export default WalletConnectNoQr;
