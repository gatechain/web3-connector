import { initializeConnector } from "@web3-react/core";
import { Phantom } from "../connectors/phantom";
import { ConnectionType } from "../types";
export { Phantom } from "../connectors/phantom";

export class PhantomConnector {
  private constructor() {}
  private static instance: ReturnType<typeof initializeConnector<Phantom>>;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<Phantom>(
        (actions) => new Phantom({ actions })
      );
    }
    return this.instance;
  }
  public static getConnection() {
    const [phantom, phantomHooks] = PhantomConnector.getInstance();
    const phantomConnection = {
      connector: phantom,
      hooks: phantomHooks,
      type: ConnectionType.PHANTOM,
    };
    return phantomConnection;
  }
}
