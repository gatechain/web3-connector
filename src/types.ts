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
