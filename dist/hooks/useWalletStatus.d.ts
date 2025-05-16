import { store, type Web3Actions, type Web3State } from '../stores/Web3Store';
export type { Web3Actions, Web3State };
export { store };
declare const useWalletStatus: () => Web3State & Web3Actions;
export declare function updateStore(update: Partial<Web3State>): void;
export declare function resetStore(): void;
export { useWalletStatus };
