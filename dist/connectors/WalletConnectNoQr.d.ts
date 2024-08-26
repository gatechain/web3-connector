import WalletConnect from "./WalletConnect";
type UriCallback = (uri: string) => void;
declare class WalletConnectNoQr extends WalletConnect {
    constructor(options: {
        setUri?: UriCallback;
    });
    static instance: WalletConnectNoQr;
    static getInstance(setUri?: UriCallback): WalletConnectNoQr;
}
export default WalletConnectNoQr;
