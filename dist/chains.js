"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLS = exports.CHAINS = exports.getAddChainParameters = void 0;
const ETH = {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
};
const GT = {
    name: 'GT',
    symbol: 'GT',
    decimals: 18,
};
const MATIC = {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
};
function isExtendedChainInformation(chainInformation) {
    return !!chainInformation.nativeCurrency;
}
function getAddChainParameters(chainId) {
    const chainInformation = exports.CHAINS[chainId];
    if (isExtendedChainInformation(chainInformation)) {
        return {
            chainId,
            chainName: chainInformation.name,
            nativeCurrency: chainInformation.nativeCurrency,
            rpcUrls: chainInformation.urls,
            blockExplorerUrls: chainInformation.blockExplorerUrls,
        };
    }
    else {
        return chainId;
    }
}
exports.getAddChainParameters = getAddChainParameters;
exports.CHAINS = {
    1: {
        urls: [
            process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
            process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : undefined,
            'https://cloudflare-eth.com',
        ].filter((url) => url !== undefined),
        name: 'Mainnet',
    },
    3: {
        urls: [process.env.infuraKey ? `https://ropsten.infura.io/v3/${process.env.infuraKey}` : undefined].filter((url) => url !== undefined),
        name: 'Ropsten',
    },
    4: {
        urls: [process.env.infuraKey ? `https://rinkeby.infura.io/v3/${process.env.infuraKey}` : undefined].filter((url) => url !== undefined),
        name: 'Rinkeby',
    },
    5: {
        urls: [process.env.infuraKey ? `https://goerli.infura.io/v3/${process.env.infuraKey}` : undefined].filter((url) => url !== undefined),
        name: 'Görli',
    },
    42: {
        urls: [process.env.infuraKey ? `https://kovan.infura.io/v3/${process.env.infuraKey}` : undefined].filter((url) => url !== undefined),
        name: 'Kovan',
    },
    // Optimism
    10: {
        urls: [
            process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
            'https://mainnet.optimism.io',
        ].filter((url) => url !== undefined),
        name: 'Optimism',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
    },
    69: {
        urls: [
            process.env.infuraKey ? `https://optimism-kovan.infura.io/v3/${process.env.infuraKey}` : undefined,
            'https://kovan.optimism.io',
        ].filter((url) => url !== undefined),
        name: 'Optimism Kovan',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
    },
    // Arbitrum
    42161: {
        urls: [
            process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
            'https://arb1.arbitrum.io/rpc',
        ].filter((url) => url !== undefined),
        name: 'Arbitrum One',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://arbiscan.io'],
    },
    421611: {
        urls: [
            process.env.infuraKey ? `https://arbitrum-rinkeby.infura.io/v3/${process.env.infuraKey}` : undefined,
            'https://rinkeby.arbitrum.io/rpc',
        ].filter((url) => url !== undefined),
        name: 'Arbitrum Testnet',
        nativeCurrency: ETH,
        blockExplorerUrls: ['https://testnet.arbiscan.io'],
    },
    // Polygon
    137: {
        urls: [
            process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
            'https://polygon-rpc.com',
        ].filter((url) => url !== undefined),
        name: 'Polygon Mainnet',
        nativeCurrency: MATIC,
        blockExplorerUrls: ['https://polygonscan.com'],
    },
    80001: {
        urls: [process.env.infuraKey ? `https://polygon-mumbai.infura.io/v3/${process.env.infuraKey}` : undefined].filter((url) => url !== undefined),
        name: 'Polygon Mumbai',
        nativeCurrency: MATIC,
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    },
    // MEta
    85: {
        urls: ['https://meteora-evm.gatenode.cc'],
        name: 'Meteora',
        nativeCurrency: GT,
        blockExplorerUrls: ['https://gatescan.org/testnet/'],
    },
};
exports.URLS = Object.keys(exports.CHAINS).reduce((accumulator, chainId) => {
    const validURLs = exports.CHAINS[Number(chainId)].urls;
    if (validURLs.length) {
        accumulator[Number(chainId)] = validURLs;
    }
    return accumulator;
}, {});