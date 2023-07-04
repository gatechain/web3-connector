import {
  WalletConnect,
  WalletConnectConstructorArgs,
  URI_AVAILABLE,
} from "@web3-react/walletconnect-v2";
export class WalletConnectV2 extends WalletConnect {
  ANALYTICS_EVENT = "Wallet Connect QR Scan";
  constructor({
    actions,
    defaultChainId,
    qrcode = true,
    onError,
  }: Omit<WalletConnectConstructorArgs, "options"> & {
    defaultChainId: number;
    qrcode?: boolean;
  }) {
    super({
      actions,
      options: {
        projectId: "49cf6ec6179f8d21bf525adc78d6900a",
        chains: [defaultChainId],
        optionalChains: [],
        showQrModal: qrcode,
        optionalMethods: [
          "eth_signTypedData",
          "eth_signTypedData_v4",
          "eth_sign",
        ],
        qrModalOptions: {
          explorerRecommendedWalletIds: [
            "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
            "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
            "ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef",
          ],
        },
      },
      onError,
    });
  }
}

// Custom class for Gate Wallet specific functionality
export class GatewalletConnect extends WalletConnectV2 {
  ANALYTICS_EVENT = "Gate Wallet QR Scan";
  static GATE_URI_AVAILABLE = "gate_uri_available";

  constructor({
    actions,
    onError,
  }: Omit<WalletConnectConstructorArgs, "options">) {
    // disables walletconnect's proprietary qr code modal; instead GatewalletModal will listen for events to trigger our custom modal
    super({ actions, defaultChainId: 1, qrcode: false, onError });

    this.events.once(URI_AVAILABLE, () => {
      this.provider?.events.on("disconnect", this.deactivate);
    });

    this.events.on(URI_AVAILABLE, (uri) => {
      if (!uri) return;
      // Emits custom wallet connect code, parseable by the Gate Wallet
      this.events.emit(
        GatewalletConnect.GATE_URI_AVAILABLE,
        `hello_gatewallet:${uri}`
      );

      // Opens deeplink to Gate Wallet if on iOS
      // if (isIOS) {
      //   const newTab = window.open(`https://uniswap.org/app/wc?uri=${encodeURIComponent(uri)}`)
      //
      //   // Fixes blank tab opening on mobile Chrome
      //   newTab?.close()
      // }
    });
  }
}
