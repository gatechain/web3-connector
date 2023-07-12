import { initializeConnector } from "@web3-react/core";
import { GateWallet } from "../connectors/gatewallet";
import { Connection, ConnectionType } from "../types";
export { GateWallet } from "../connectors/gatewallet";

export class GateWalletConnector {
  private constructor() {}
  private static instance: ReturnType<typeof initializeConnector<GateWallet>>;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<GateWallet>(
        (actions) => new GateWallet({ actions })
      );
    }
    return this.instance;
  }
  public static getConnection(): Connection {
    const [web3Injected, web3InjectedHooks] = GateWalletConnector.getInstance();
    const injectedConnection: Connection = {
      connector: web3Injected,
      hooks: web3InjectedHooks,
      type: ConnectionType.GATEWALLET,
    };
    return injectedConnection;
  }
}
