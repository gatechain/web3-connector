import { initializeConnector } from "@web3-react/core";
import { Connection, ConnectionType } from "../types";
import { GatewalletConnect } from "../connectors/walletConnectV2";
// c6c9bacd35afa3eb9e6cccf6d8464395
export class WalletConnectNotQrConnector {
  private constructor() {}
  private static instance: ReturnType<
    typeof initializeConnector<GatewalletConnect>
  >;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<GatewalletConnect>(
        (actions) =>
          new GatewalletConnect({
            actions,
            defaultChainId: 1,
          })
      );
    }
    return this.instance;
  }
  public static getConnection() {
    const [web3WalletConnect, web3WalletConnectHooks] =
      WalletConnectNotQrConnector.getInstance();
    const walletConnectNotQrConnection: Connection = {
      connector: web3WalletConnect,
      hooks: web3WalletConnectHooks,
      type: ConnectionType.WALLET_CONNECT_NOTQR,
    };
    return walletConnectNotQrConnection;
  }
}
