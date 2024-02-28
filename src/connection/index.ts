import { useEffect } from "react";
import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import { Connection, ConnectionType } from "../types";
import { createStorage, noopStorage } from "../storage";
import { MetaMaskConnector, MetaMask } from "./metaMask";
import { PhantomConnector, Phantom } from "./phantom";
import { WalletConnectConnector } from "./walletConnectV2";
import { GatewalletConnect } from "../connectors/walletConnectV2";
import { WalletConnectNotQrConnector } from "./walletConnectV2NotQr";
import { URI_AVAILABLE } from "@web3-react/walletconnect-v2";
import { GateWalletConnector, GateWallet } from "./gateWallet";
import { useNonEVMReact } from "../nonEvm/context";

export function getConnectors(config?: any) {
  return initConnector();
}

type InitConnectorReturnType = [
  MetaMask | GatewalletConnect | Phantom | GateWallet,
  Web3ReactHooks
][];
export function initConnector(): InitConnectorReturnType {
  const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
  const [gateWallet, getWalletHooks] = GateWalletConnector.getInstance();
  const [phantom, phantomHooks] = PhantomConnector.getInstance();
  const [web3WalletConnect, web3WalletConnectHooks] =
    WalletConnectConnector.getInstance();
  const [web3WalletNotQrConnect, web3WalletNotQrConnectHooks] =
    WalletConnectNotQrConnector.getInstance();

  return [
    [web3Injected, web3InjectedHooks],
    [web3WalletConnect, web3WalletConnectHooks],
    [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
    [phantom, phantomHooks],
    [gateWallet, getWalletHooks],
  ];
}

export function getConnectionMap(): Connection[] {
  const phantomConnection = PhantomConnector.getConnection();
  const injectedConnection = MetaMaskConnector.getConnection();
  const getWalletConnection = GateWalletConnector.getConnection();
  const walletConnectConnection = WalletConnectConnector.getConnection();
  const walletConnectNotQrConnection =
    WalletConnectNotQrConnector.getConnection();

  return [
    injectedConnection,
    phantomConnection,
    walletConnectConnection,
    walletConnectNotQrConnection,
    getWalletConnection,
  ];
}

export function getConnection(c: Connector | ConnectionType): Connection {
  const CONNECTIONS = getConnectionMap();

  if (c instanceof Connector) {
    const connection = CONNECTIONS.find(
      (connection) => connection.connector === c
    );
    if (!connection) {
      throw Error("unsupported connector");
    }
    return connection;
  } else {
    const connectionFind = CONNECTIONS.filter((i) => i.type === c);
    return connectionFind[0];
  }
}

export function getStorage() {
  const storage = createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
  });

  return storage;
}

export const selectedWalletKey = "selectedWallet";

export function useEagerlyConnect(onError?: Function) {
  let selectedWallet: any;
  const storage = getStorage();
  if (typeof window !== "undefined") {
    selectedWallet = storage.getItem(selectedWalletKey) as ConnectionType;
  }

  const { connectEagerly } = useNonEVMReact();

  let selectedConnection: Connection | undefined;
  if (selectedWallet) {
    try {
      selectedConnection = getConnection(selectedWallet);
    } catch {
      onError && onError();
    }
  }

  useEffect(() => {
    if (selectedConnection) {
      connect(selectedConnection.connector);
    }
  }, []);

  useEffect(() => {
    console.log('eargely selectedWallet', selectedWallet)
    if (selectedWallet === ConnectionType.GATEWALLET) {
      connectEagerly("GateWallet");
      return;
    }
    if (selectedWallet === ConnectionType.Unisat) {
      connectEagerly("Unisat");
      return;
    }
  }, []);
}

export function connectWallet(
  connectionType: ConnectionType,
  resolve?: (uri: string) => void,
  reject?: (err: any) => void
) {
  const storage = getStorage();
  let connection: Connection = getConnection(connectionType);
  if (!connection) {
    return;
  }

  connection.connector
    ?.activate()
    ?.then(() => {
      storage.setItem(selectedWalletKey, connectionType);
    })
    .catch((err) => {
      reject && reject(err);
    });

  function setUri(uri: string) {
    if (!uri) return;
    resolve && resolve(uri);
    (connection.connector as any)?.events.removeListener(URI_AVAILABLE, setUri);
  }

  if (connectionType === ConnectionType.WALLET_CONNECT_NOTQR) {
    (connection.connector as any)?.events.on(URI_AVAILABLE, setUri);
  }
}

export function disconnect(connector: Connector) {
  const storage = getStorage();
  if (connector && connector?.deactivate) {
    connector.deactivate();
  }
  connector.resetState();
  storage.removeItem(selectedWalletKey);
}

export async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-connector eager connection error: ${error}`);
  }
}
