import { ConnectorNotFoundError } from "../errors";
import { NonEVMConnectorName, Network } from "../types";
import {
  AccountsChangedHandler,
  Connector,
  ConnectorOptions,
  DisconnectHandler,
  GateAccountChangeHandler,
  GateAccountInfo,
  NetworkChangedHandler,
} from "./types";

export class NonEVMGateWalletConnector implements Connector {
  name: NonEVMConnectorName;
  onAccountsChanged?: AccountsChangedHandler;
  onNetworkChanged?: NetworkChangedHandler;
  onDisconnect?: DisconnectHandler;
  onGateAccountChange?: GateAccountChangeHandler;

  constructor(options?: ConnectorOptions) {
    this.name = "GateWallet";
    this.onAccountsChanged = options?.onAccountsChanged;
    this.onNetworkChanged = options?.onNetworkChanged;
    this.onDisconnect = options?.onDisconnect;
    this.onGateAccountChange = options?.onGateAccountChange;
  }

  getProvider() {
    if (typeof (window as any).gatewallet !== "undefined") {
      console.log("Gate Wallet is installed!");
      return (window as any).gatewallet;
    }
    throw new ConnectorNotFoundError();
  }

  async connect() {
    try {
      const provider = this.getProvider();

      if (provider.on) {
        provider.on("connect", (info: any) => {
          console.log("inffo", info);
        });

        provider.on(
          "gateAccountChange",
          (gateWallet: GateAccountInfo): void => {
            console.log("gateAccountChange", gateWallet);
            this.onGateAccountChange?.(gateWallet);
          }
        );

        provider.on("chainChanged", (chainId: string): void => {
          console.log('chainId', chainId)
        });

        provider.on("disconnect", (error: any) => {
          console.log(error, "error");
        });
      }

      const info = await provider.connect();

      console.log("info", info);

      return {};
    } catch (error) {
      console.log("connnector error: ", error);
      throw error;
    }
  }

  async connectEagerly() {
    try {
      const provider = this.getProvider();

      if (provider.on) {
        provider.on("connect", (info: any) => {
          console.log("inffo", info);
        });

        provider.on(
          "gateAccountChange",
          (gateWallet: GateAccountInfo): void => {
            console.log("gateAccountChange", gateWallet);
            this.onGateAccountChange?.(gateWallet);
          }
        );

        provider.on("chainChanged", (chainId: string): void => {
          console.log('chainId', chainId)
        });

        provider.on("disconnect", (error: any) => {
          console.log(error, "error");
        });
      }

      const info = await provider.getAccount();

      console.log("info", info);

      return { gateAccountInfo: info};
    } catch (error) {
      console.log("connnector error: ", error);
      throw error;
    }
  }

  // Unisat does not provide a disconnect method at this time
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  // signMessage: (message?: string) => Promise<string> = (message) => {
  //   const provider = this.getProvider();
  //   return provider.signMessage(message) as Promise<string>;
  // };
}
