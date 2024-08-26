import WalletConnect from "./WalletConnect";
class WalletConnectNoQr extends WalletConnect {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { showQrModal: false }));
        const { setUri } = options;
        this.handleDisplayURI = setUri || function () { };
    }
    static getInstance(setUri) {
        if (WalletConnectNoQr.instance)
            return WalletConnectNoQr.instance;
        WalletConnectNoQr.instance = new WalletConnectNoQr({
            setUri,
        });
        return WalletConnectNoQr.instance;
    }
}
export default WalletConnectNoQr;
