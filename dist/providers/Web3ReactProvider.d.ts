import React from 'react';
import type { IWeb3Store } from '../stores/types';
export declare const useWeb3React: () => IWeb3Store;
interface Web3ReactProviderProps {
    children: React.ReactNode;
}
export declare const Web3ReactProvider: (({ children }: Web3ReactProviderProps) => React.JSX.Element) & {
    displayName: string;
};
export {};
