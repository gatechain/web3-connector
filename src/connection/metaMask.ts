import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { Connection, ConnectionType } from "../types";
export { MetaMask } from "@web3-react/metamask";

export class MetaMaskConnector {
  private constructor() {}
  private static instance: ReturnType<typeof initializeConnector<MetaMask>>;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<MetaMask>(
        (actions) => new MetaMask({ actions })
      );
    }
    return this.instance;
  }
  public static getConnection(): Connection {
    const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
    const injectedConnection: Connection = {
      connector: web3Injected,
      hooks: web3InjectedHooks,
      type: ConnectionType.INJECTED,
    };
    return injectedConnection;
  }
}
