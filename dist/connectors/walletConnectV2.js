"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewalletConnect = exports.WalletConnectV2 = void 0;
const walletconnect_v2_1 = require("@web3-react/walletconnect-v2");
class WalletConnectV2 extends walletconnect_v2_1.WalletConnect {
    constructor({ actions, defaultChainId, qrcode = true, onError, }) {
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
                        "20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66",
                    ],
                    themeVariables: {
                        "--wcm-z-index": "10000",
                    },
                },
            },
            onError,
        });
        this.ANALYTICS_EVENT = "Wallet Connect QR Scan";
    }
}
exports.WalletConnectV2 = WalletConnectV2;
// Custom class for Gate Wallet specific functionality
class GatewalletConnect extends WalletConnectV2 {
    constructor({ actions, onError, }) {
        // disables walletconnect's proprietary qr code modal; instead GatewalletModal will listen for events to trigger our custom modal
        super({ actions, defaultChainId: 1, qrcode: false, onError });
        this.ANALYTICS_EVENT = "Gate Wallet QR Scan";
        this.events.once(walletconnect_v2_1.URI_AVAILABLE, () => {
            var _a;
            (_a = this.provider) === null || _a === void 0 ? void 0 : _a.events.on("disconnect", this.deactivate);
        });
        this.events.on(walletconnect_v2_1.URI_AVAILABLE, (uri) => {
            if (!uri)
                return;
            // Emits custom wallet connect code, parseable by the Gate Wallet
            this.events.emit(GatewalletConnect.GATE_URI_AVAILABLE, `hello_gatewallet:${uri}`);
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
exports.GatewalletConnect = GatewalletConnect;
GatewalletConnect.GATE_URI_AVAILABLE = "gate_uri_available";
