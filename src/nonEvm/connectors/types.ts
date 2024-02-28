import { NonEVMConnectorName, Network } from "../types";

export type AccountsChangedHandler = (
  address: string,
  publicKey: string
) => void;
export type GateAccountChangeHandler = (
  gateAccountInfo: GateAccountInfo
) => void;
export type NetworkChangedHandler = (network: Network) => void;
export type DisconnectHandler = () => void;
export type ChainChangeHandler = (chainId: string) => void;

export type GateAccountInfo = any;

export interface ConnectorOptions {
  onAccountsChanged?: AccountsChangedHandler;
  onNetworkChanged?: NetworkChangedHandler;
  onDisconnect?: DisconnectHandler;
  onGateAccountChange?: GateAccountChangeHandler;
  onChainChange?: ChainChangeHandler;
}

export interface Connection {
  address?: string;
  publicKey?: string;
  network?: Network;
  chainId?: string;
  walletName?: string;
  walletId?: string;
  gateAccountInfo?: GateAccountInfo;
}

export interface Connector {
  name: NonEVMConnectorName;
  getProvider(): unknown;
  connect(options?: ConnectorOptions): Promise<Connection | undefined>;
  connectEagerly(): Promise<Connection | undefined>;
  disconnect(): void;
  signMessage?: (message?: string) => Promise<string>;
}
