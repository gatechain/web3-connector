import { useEffect } from 'react';
import { GateWallet } from './connectors/GateWallet.js';
import MetaMaskWallet from './connectors/MetaMaskWallet.js';
import PhantomWallet from './connectors/PhantomWallet.js';
import UnisatWallet from './connectors/UnisatWallet.js';
import WalletConnect from './connectors/WalletConnect.js';
import WalletConnectNoQr from './connectors/WalletConnectNoQr.js';
import { SELECTED_WALLET_KEY } from './constant.js';
import { ConnectionType } from './types.js';
import { updateStore } from './useWeb3ReactHook.js';
export { useWeb3React } from './useWeb3ReactHook.js';
import { store } from './stores/Web3Store.js';

function connectWallet(connectionType, resolve, reject) {
    const { currentWallet, connector } = store.getState();
    if (currentWallet && connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
        connector?.deactivate();
    }
    const connector$1 = getConnector(connectionType, resolve);
    if (connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
        updateStore({ isActivating: true });
    }
    connector$1
        .activate()
        .then(() => {
        localStorage.setItem(SELECTED_WALLET_KEY, JSON.stringify(connectionType));
    })
        .catch((err) => {
        console.error(err);
        reject?.(err);
    })
        .finally(() => {
        updateStore({ isActivating: false });
    });
}
function getConnector(connectionType, resolve) {
    const map = {
        [ConnectionType.GATEWALLET]: GateWallet,
        [ConnectionType.INJECTED]: MetaMaskWallet,
        [ConnectionType.PHANTOM]: PhantomWallet,
        [ConnectionType.Unisat]: UnisatWallet,
        [ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr,
        [ConnectionType.WALLET_CONNECT]: WalletConnect,
    };
    if (connectionType === ConnectionType.WALLET_CONNECT_NOTQR) {
        const connector = map[connectionType].getInstance(resolve);
        return connector;
    }
    else {
        const connector = (map[connectionType] || MetaMaskWallet).getInstance();
        return connector;
    }
}
function disconnect() {
    const { currentWallet } = store.getState();
    if (!currentWallet)
        return;
    const connector = getConnector(currentWallet);
    localStorage.removeItem(SELECTED_WALLET_KEY);
    localStorage.removeItem('web3-storage');
    connector?.deactivate();
}
function useEagerlyConnect(onError) {
    useEffect(() => {
        const web3Storage = localStorage.getItem('web3-storage');
        const web3StorageString = JSON?.parse(web3Storage || '{}');
        const selectedWalletType = web3StorageString?.state?.currentWallet || '';
        try {
            if (!selectedWalletType) {
                onError?.();
                return;
            }
            const selectedWallet = getConnector(selectedWalletType);
            selectedWallet.connectEagerly();
        }
        catch (error) {
            console.error(error);
        }
    }, []);
}
const isWallet = (params) => {
    const ethereum = window?.ethereum;
    if (params === 'MetaMask') {
        return ethereum?.isMetaMask || false;
    }
    if (params === 'TokenPocket') {
        return ethereum?.isTokenPocket || false;
    }
    return false;
};

export { ConnectionType, connectWallet, disconnect, isWallet, useEagerlyConnect };
