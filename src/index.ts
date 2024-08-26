import { useEffect } from "react";
import GateWallet from "./connectors/GateWallet";
import MetaMaskWallet from "./connectors/MetaMaskWallet";
import PhantomWallet from "./connectors/PhantomWallet";
import UnisatWallet from "./connectors/UnisatWallet";
import { selectedWalletKey } from "./constant";
import { ConnectionType } from "./types";
import { store, updateStore } from "./useWeb3ReactHook";
import { AbstractWallet } from "./connectors/AbstractWallet";
import WalletConnect from "./connectors/WalletConnect";
import WalletConnectNoQr from "./connectors/WalletConnectNoQr";
export { useWeb3React, useNonEVMReact } from "./useWeb3ReactHook";

export { ConnectionType };

export function connectWallet(
  connectionType: ConnectionType,
  resolve?: (uri: string) => void,
  reject?: (err: Error) => void
) {
  const { currentWallet, connector } = store;

  if (currentWallet) {
    connector?.deactivate();
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
    .catch((err: Error) => {
      console.error(err);
      reject?.(err);
    })
    .finally(() => {
      updateStore({ isActivating: false });
    });
}

function getConnector(
  connectionType: ConnectionType,
  resolve?: (uri: string) => void
) {
  const map: any = {
    [ConnectionType.GATEWALLET]: GateWallet,
    [ConnectionType.INJECTED]: MetaMaskWallet,
    [ConnectionType.PHANTOM]: PhantomWallet,
    [ConnectionType.Unisat]: UnisatWallet,
    [ConnectionType.WALLET_CONNECT_NOTQR]: WalletConnectNoQr,
    [ConnectionType.WALLET_CONNECT]: WalletConnect,
  };

  if (connectionType === ConnectionType.WALLET_CONNECT_NOTQR) {
    const connector = map[connectionType].getInstance(resolve);
    return connector as AbstractWallet;
  } else {
    const connector = (map[connectionType] || MetaMaskWallet).getInstance();
    return connector as AbstractWallet;
  }
}

export function disconnect() {
  const { currentWallet } = store;

  const connector = getConnector(currentWallet as ConnectionType);
  localStorage.removeItem(selectedWalletKey);

  connector?.deactivate();
}

export function useEagerlyConnect(onError?: Function) {
  useEffect(() => {
    const selectedWalletString = localStorage.getItem(selectedWalletKey);

    if (!selectedWalletString) {
      onError?.();
      return;
    }

    const selectedWallet = getConnector(selectedWalletString as ConnectionType);

    selectedWallet.connectEagerly();
  }, []);
}
