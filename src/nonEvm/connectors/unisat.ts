import { ConnectorNotFoundError } from "../errors";
import { NonEVMConnectorName, Network } from "../types";
import {
  AccountsChangedHandler,
  Connector,
  ConnectorOptions,
  DisconnectHandler,
  NetworkChangedHandler,
} from "./types";

export class UnisatConnector implements Connector {
  name: NonEVMConnectorName;
  onAccountsChanged?: AccountsChangedHandler;
  onNetworkChanged?: NetworkChangedHandler;
  onDisconnect?: DisconnectHandler;

  constructor(options?: ConnectorOptions) {
    this.name = "Unisat";
    this.setOptions(options);
    this.onAccountsChanged = this.onAccountsChanged?.bind(this);
    this.onNetworkChanged = this.onNetworkChanged?.bind(this);
    this.onDisconnect = this.onDisconnect?.bind(this);
  }

  setOptions(options?: ConnectorOptions) {
    this.onAccountsChanged = options?.onAccountsChanged;
    this.onNetworkChanged = options?.onNetworkChanged;
    this.onDisconnect = options?.onDisconnect;
  }

  static instance?: UnisatConnector;

  getProvider() {
    if (typeof window === "undefined") return;
    if (typeof (window as any).unisat === "undefined") {
      throw new ConnectorNotFoundError();
    }

    return (window as any).unisat;
  }

  async connect() {
    try {
      const provider = this.getProvider();

      if (provider.on) {
        provider.on("accountsChanged", async (accounts: string[]) => {
          if (!!accounts && accounts.length > 0) {
            const publicKey: string = await provider.getPublicKey();
            this.onAccountsChanged?.(accounts[0] as string, publicKey);
          } else {
            provider.removeAllListeners();
            this.onDisconnect?.();
          }
        });
        provider.on("networkChanged", (network: Network) => {
          this.onNetworkChanged?.(network);
        });
      }

      const accounts: string[] = await provider.requestAccounts();
      const publicKey: string = await provider.getPublicKey();
      const network: Network = await provider.getNetwork();

      return { address: accounts[0], publicKey, network };
    } catch (error) {
      console.log("connnector error: ", error);
      throw error;
    }
  }

  async connectEagerly() {
    return this.connect();
  }

  // Unisat does not provide a disconnect method at this time
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  signMessage: (message?: string) => Promise<string> = (message) => {
    const provider = this.getProvider();
    return provider.signMessage(message) as Promise<string>;
  };

  static getInstance(options?: ConnectorOptions) {
    if (this.instance) {
      this.instance.setOptions(options);
      return this.instance;
    }
    this.instance = new UnisatConnector(options);
    return this.instance;
  }
}
