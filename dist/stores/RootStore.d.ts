import { Web3Store } from './Web3Store';
import type { IRootStore } from './types';
import './config';
export declare class RootStore implements IRootStore {
    web3Store: Web3Store;
    constructor();
}
export declare const rootStore: RootStore;
