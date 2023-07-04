import { initializeConnector } from "@web3-react/core";
import { Connection, ConnectionType } from "../types";
import { WalletConnectV2 } from "../connectors/walletConnectV2";
// c6c9bacd35afa3eb9e6cccf6d8464395
const projectId = "49cf6ec6179f8d21bf525adc78d6900a";
export class WalletConnectConnector {
  private constructor() {}
  private static instance: ReturnType<
    typeof initializeConnector<WalletConnectV2>
  >;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<WalletConnectV2>(
        (actions) =>
          new WalletConnectV2({
            actions,
            defaultChainId: 1,
          })
      );
    }
    return this.instance;
  }
  public static getConnection() {
    const [web3WalletConnect, web3WalletConnectHooks] =
      WalletConnectConnector.getInstance();
    const walletConnectConnection: Connection = {
      connector: web3WalletConnect,
      hooks: web3WalletConnectHooks,
      type: ConnectionType.WALLET_CONNECT,
    };
    return walletConnectConnection;
  }
}
