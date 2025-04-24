import { store, type Web3State, type Web3Actions } from './stores/Web3Store';
export type { Web3State, Web3Actions };
export { store };
export declare const useWeb3React: () => Web3State & Web3Actions;
export declare function updateStore(update: Partial<Web3State>): void;
export declare function resetStore(): void;
