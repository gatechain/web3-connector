import { getStorage, selectedWalletKey } from "../../connection";
import { ConnectorNotFoundError } from "../errors";
import { NonEVMConnectorName, Network } from "../types";
import {
  AccountsChangedHandler,
  ChainChangeHandler,
  Connector,
  ConnectorOptions,
  DisconnectHandler,
  GateAccountChangeHandler,
  NetworkChangedHandler,
} from "./types";

export class NonEVMGateWalletConnector implements Connector {
  name: NonEVMConnectorName;
  onAccountsChanged?: AccountsChangedHandler;
  onNetworkChanged?: NetworkChangedHandler;
  onDisconnect?: DisconnectHandler;
  onGateAccountChange?: GateAccountChangeHandler;
  onChainChange?: ChainChangeHandler;

  constructor(options?: ConnectorOptions) {
    this.name = "GateWallet";
    this.setOptions(options);
    this.handleGateAccountChange = this.handleGateAccountChange.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleChainChange = this.handleChainChange.bind(this);
    this.id = Math.random();
  }

  static instance: NonEVMGateWalletConnector | null = null;

  private id: number = Math.random();

  setOptions(options?: ConnectorOptions) {
    this.onAccountsChanged = options?.onAccountsChanged;
    this.onNetworkChanged = options?.onNetworkChanged;
    this.onDisconnect = options?.onDisconnect;
    this.onGateAccountChange = options?.onGateAccountChange;
    this.onChainChange = options?.onChainChange;
  }

  getProvider() {
    if (typeof (window as any).gatewallet !== "undefined") {
      console.log("Gate Wallet is installed!");
      return (window as any).gatewallet;
    }
    console.error(new ConnectorNotFoundError());
  }

  async connect() {
    console.log("connectddd");
    try {
      const provider = this.getProvider();

      if (!provider) return;

      if (provider.on) {
        provider.on("connect", (info: any) => {
          console.log("inffo", info);
          if (info?.chainId) {
            this.onChainChange?.(info.chainId);
          }
        });

        provider.on("gateAccountChange", this.handleGateAccountChange);

        provider.on("chainChanged", (chainId: string): void => {
          console.log("chainId", chainId);
          this.onChainChange?.(chainId);
        });

        provider.on("disconnect", (error: any) => {
          console.log(error, "error");
        });
      }

      const info = await provider.connect();

      console.log("info", info);

      return { gateAccountInfo: info };
    } catch (error) {
      console.log("connnector error: ", error);
    }
  }

  private handleGateAccountChange = (gateWallet: any) => {
    console.log(
      "gateAccountChange",
      gateWallet,
      JSON.stringify(gateWallet) === "{}"
    );

    if (!gateWallet || JSON.stringify(gateWallet) === "{}") {
      const storage = getStorage();

      storage.removeItem(selectedWalletKey);
      this.onDisconnect?.();
    } else {
      this.onGateAccountChange?.(gateWallet);
    }
  };

  private handleConnect = (info: any) => {
    console.log("inffo", info);
    if (info?.chainId) {
      this.onChainChange?.(info.chainId);
    }
  };

  private handleChainChange = (chainId: string) => {
    console.log("chainId", chainId);
    this.onChainChange?.(chainId);
  };

  async connectEagerly() {
    try {
      const provider = this.getProvider();

      if (!provider) return;

      if (provider.on) {
        provider.on("connect", this.handleConnect);

        provider.on("gateAccountChange", this.handleGateAccountChange);

        provider.on("chainChanged", this.handleChainChange);

        provider.on("disconnect", (error: any) => {
          console.log(error, "error");
        });
      }

      const info = await provider.getAccount();

      console.log("info", info);

      return { gateAccountInfo: info };
    } catch (error) {
      console.log("connnector error: ", error);
      throw error;
    }
  }

  // Unisat does not provide a disconnect method at this time
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {
    try {
      const provider = this.getProvider();

      if (!provider) return;

      console.log("disconnecttttt", this.id);

      provider.removeListener(
        "gateAccountChange",
        this.handleGateAccountChange
      );

      provider.removeListener("connect", this.handleConnect);

      provider.removeListener("chainChanged", this.handleChainChange);
    } catch (err) {
      console.error("disconnect error", err);
    }
  }

  // signMessage: (message?: string) => Promise<string> = (message) => {
  //   const provider = this.getProvider();
  //   return provider.signMessage(message) as Promise<string>;
  // };
  static getInstance(options?: ConnectorOptions) {
    if (this.instance) {
      this.instance.setOptions(options);
      return this.instance;
    }
    this.instance = new NonEVMGateWalletConnector(options);
    return this.instance;
  }
}
