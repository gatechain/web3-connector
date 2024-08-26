import { useEffect } from "react";
import GateWallet from "./connectors/GateWallet";
import MetaMaskWallet from "./connectors/MetaMaskWallet";
import PhantomWallet from "./connectors/PhantomWallet";
import UnisatWallet from "./connectors/UnisatWallet";
import { selectedWalletKey } from "./constant";
import { ConnectionType } from "./types";
import { store, updateStore } from "./useWeb3ReactHook";
import WalletConnect from "./connectors/WalletConnect";
import WalletConnectNoQr from "./connectors/WalletConnectNoQr";
export { useWeb3React, useNonEVMReact } from "./useWeb3ReactHook";
export { ConnectionType };
export function connectWallet(connectionType, resolve, reject) {
    const { currentWallet, connector } = store;
    if (currentWallet) {
        connector === null || connector === void 0 ? void 0 : connector.deactivate();
    }
    const connector$1 = getConnector(connectionType, resolve);
    if (connectionType !== ConnectionType.WALLET_CONNECT_NOTQR) {
        updateStore({ isActivating: true });
    }
    connector$1
        .activate()
        .then(() => {
        localStorage.setItem(selectedWalletKey, connectionType);
    })
        .catch((err) => {
        console.error(err);
        reject === null || reject === void 0 ? void 0 : reject(err);
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
export function disconnect() {
    const { currentWallet } = store;
    const connector = getConnector(currentWallet);
    localStorage.removeItem(selectedWalletKey);
    connector === null || connector === void 0 ? void 0 : connector.deactivate();
}
export function useEagerlyConnect(onError) {
    useEffect(() => {
        const selectedWalletString = localStorage.getItem(selectedWalletKey);
        if (!selectedWalletString) {
            onError === null || onError === void 0 ? void 0 : onError();
            return;
        }
        const selectedWallet = getConnector(selectedWalletString);
        selectedWallet.connectEagerly();
    }, []);
}
