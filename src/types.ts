export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface AddEthereumChainParameter {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

export enum ConnectionType {
  INJECTED = 'INJECTED',
  GATEWALLET = 'GATEWALLET',
  PHANTOM = 'PHANTOM',
  WALLET_CONNECT = 'WALLET_CONNECT',
  WALLET_CONNECT_NOTQR = 'WALLET_CONNECT_NOTQR',
  Unisat = 'UNISAT',
  SUI = 'SUI',
  GATEAPPWALLET = 'GATE_APP_WALLET',
}

export type Network = 'livenet' | 'testnet';

export enum ChainType {
  EVM = 'EVM',
  SUI = 'SUI',
  SOL = 'SOL',
  TRX = 'TRX',
  TON = 'TON',
  SEI = 'SEI',
  BTC = 'BTC',
}
