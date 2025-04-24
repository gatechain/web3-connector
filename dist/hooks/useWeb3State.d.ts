import React from 'react';
import type { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';
import { ConnectionType, Network } from '../types';
export interface Web3State {
    chainId?: number;
    isActive: boolean;
    isActivating: boolean;
    account?: string;
    accounts: string[];
    gateAccountInfo?: any;
    currentWallet?: ConnectionType;
    connector?: any;
    network?: Network;
    provider: EthersWeb3Provider | null;
}
export interface Web3ContextValue extends Web3State {
    connect: (connectionType: ConnectionType) => Promise<void>;
    disconnect: () => void;
}
export declare const initialState: Web3State;
export declare const defaultContextValue: Web3ContextValue;
export declare const Web3Context: React.Context<Web3ContextValue>;
export declare const Web3StateProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useWeb3State: () => Web3ContextValue;
