import WalletConnect from "./WalletConnect";

type UriCallback = (uri: string) => void;

class WalletConnectNoQr extends WalletConnect {
  constructor(options: { setUri?: UriCallback }) {
    super({ ...options, showQrModal: false });
    const { setUri } = options;
    this.handleDisplayURI = setUri || function () {};
  }

  static instance: WalletConnectNoQr;

  static getInstance(setUri?: UriCallback) {
    if (WalletConnectNoQr.instance) return WalletConnectNoQr.instance;
    WalletConnectNoQr.instance = new WalletConnectNoQr({
      setUri,
    });
    return WalletConnectNoQr.instance;
  }
}

export default WalletConnectNoQr;
