import { ConnectorNotFoundError } from "../errors";
import { NonEVMConnectorName, Network } from "../types";
import { Provider } from "@web3-react/types";
import {
  AccountsChangedHandler,
  Connector,
  ConnectorOptions,
  DisconnectHandler,
  NetworkChangedHandler,
} from "./types";

type PhantomProvider = Provider & {
  connect: (x?: { onlyIfTrusted: true }) => Promise<any>;
};

export class PhantomConnector implements Connector {
  name: NonEVMConnectorName;
  onAccountsChanged?: AccountsChangedHandler;
  onNetworkChanged?: NetworkChangedHandler;
  onDisconnect?: DisconnectHandler;

  static instance?: PhantomConnector;

  constructor(options?: ConnectorOptions) {
    this.name = "Phantom";
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

  getProvider() {
    const w = window as any;
    if (w?.phantom?.solana) return w.phantom.solana as PhantomProvider;
    console.error(new ConnectorNotFoundError());
  }

  async connect() {
    try {
      const provider = this.getProvider();

      if (provider?.on) {
        provider.on("connect", (publicKey: any): void => {
          this.onAccountsChanged?.(publicKey.toBase58(), publicKey);
        });

        provider.on("disconnect", (error: any): void => {
          console.error(error);
          this.onDisconnect?.();
        });

        provider.on("accountChanged", (publicKey: any): void => {
          this.onAccountsChanged?.(publicKey.toBase58(), publicKey);
        });
      }

      if (provider) {
        const resp = await provider.connect();

        const publicKey = resp?.publicKey?.toString();

        const account = resp?.publicKey?.toBase58();

        console.log("fsdfs", account, publicKey);
        return { address: account, publicKey };
      }
      return {};
    } catch (error) {
      console.log("connnector error: ", error);
      throw error;
    }
  }

  async connectEagerly() {
    try {
      const provider = this.getProvider();

      if (provider?.on) {
        provider.on("connect", (publicKey: any): void => {
          this.onAccountsChanged?.(publicKey.toBase58(), publicKey);
        });

        provider.on("disconnect", (error: any): void => {
          console.error(error);
          this.onDisconnect?.();
        });

        provider.on("accountChanged", (publicKey: any): void => {
          this.onAccountsChanged?.(publicKey.toBase58(), publicKey);
        });
      }

      if (provider) {
        const resp = await provider.connect({ onlyIfTrusted: true });

        const publicKey = resp?.publicKey?.toString();

        const account = resp?.publicKey?.toBase58();

        console.log("fsdfs", account, publicKey);
        return { address: account, publicKey };
      }
      return {};
    } catch (error) {
      console.log("connnector error: ", error);
      throw error;
    }
  }

  // Unisat does not provide a disconnect method at this time
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  static getInstance(options?: ConnectorOptions) {
    if (this.instance) {
      this.instance.setOptions(options);
      return this.instance;
    }
    this.instance = new PhantomConnector(options);
    return this.instance;
  }
}
