import type { AddEthereumChainParameter } from '@web3-react/types';
interface BasicChainInformation {
    urls: string[];
    name: string;
}
interface ExtendedChainInformation extends BasicChainInformation {
    nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
    blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
}
export declare function getAddChainParameters(chainId: number): AddEthereumChainParameter | number;
export declare const CHAINS: {
    [chainId: number]: BasicChainInformation | ExtendedChainInformation;
};
export declare const URLS: {
    [chainId: number]: string[];
};
export {};
