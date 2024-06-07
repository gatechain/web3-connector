import { initializeConnector } from "@web3-react/core";
import { Connection, ConnectionType, MetadataType } from "../types";
import { GatewalletConnect } from "../connectors/walletConnectV2";
import { MetaMask } from "@web3-react/metamask";
// c6c9bacd35afa3eb9e6cccf6d8464395
export class WalletConnectNotQrConnector {
  private constructor() {}
  private static instance: ReturnType<
    typeof initializeConnector<GatewalletConnect>
  >;
  public static getInstance(metadata?: MetadataType) {
    if (!this.instance) {
      this.instance = initializeConnector<GatewalletConnect>(
        (actions) =>
          new GatewalletConnect({
            actions,
            defaultChainId: 1,
            metadata,
          })
      );
    }
    return this.instance;
  }
  public static getConnection(metadata?: MetadataType) {
    const [web3WalletConnect, web3WalletConnectHooks] =
      WalletConnectNotQrConnector.getInstance(metadata);
    const walletConnectNotQrConnection: Connection = {
      connector: web3WalletConnect,
      hooks: web3WalletConnectHooks,
      type: ConnectionType.WALLET_CONNECT_NOTQR,
    };
    return walletConnectNotQrConnection;
  }
}
