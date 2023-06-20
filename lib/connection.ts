import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { useEffect } from "react";
import { Connector } from "@web3-react/types";
import { MetaMask } from "./metamask";
import { WalletConnect } from "@web3-react/walletconnect";
import { Phantom } from "./phantom";
import { Connection, ConnectionType } from "./types";
import { createStorage, noopStorage } from "./storage";
import { delay } from "./utils";

type URLMap = { [chainId: number]: string | string[] };

class MetaMaskConnector {
  private constructor() {}
  private static instance: ReturnType<typeof initializeConnector<MetaMask>>;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<MetaMask>(
        (actions) => new MetaMask({ actions })
      );
    }
    return this.instance;
  }
}

class PhantomConnector {
  private constructor() {}
  private static instance: ReturnType<typeof initializeConnector<Phantom>>;
  public static getInstance() {
    if (!this.instance) {
      this.instance = initializeConnector<Phantom>(
        (actions) => new Phantom({ actions })
      );
    }
    return this.instance;
  }
}
class WalletConnectConnector {
  private constructor() {}
  private static instance: ReturnType<
    typeof initializeConnector<WalletConnect>
  >;
  public static getInstance(URLS: URLMap) {
    if (!this.instance) {
      this.instance = initializeConnector<WalletConnect>(
        (actions) => new WalletConnect({ actions, options: { rpc: URLS } })
      );
    }
    return this.instance;
  }
}
class WalletConnectNotQrConnector {
  private constructor() {}
  private static instance: ReturnType<
    typeof initializeConnector<WalletConnect>
  >;
  public static getInstance(URLS: URLMap) {
    if (!this.instance) {
      this.instance = initializeConnector<WalletConnect>(
        (actions) =>
          new WalletConnect({ actions, options: { rpc: URLS, qrcode: false } })
      );
    }
    return this.instance;
  }
}

export function initConnector(URLS: URLMap): any {
  const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
  const [phantom, phantomHooks] = PhantomConnector.getInstance();
  const [web3WalletConnect, web3WalletConnectHooks] =
    WalletConnectConnector.getInstance(URLS);
  const [web3WalletNotQrConnect, web3WalletNotQrConnectHooks] =
    WalletConnectNotQrConnector.getInstance(URLS);

  return [
    [web3Injected, web3InjectedHooks],
    [web3WalletConnect, web3WalletConnectHooks],
    [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
    [phantom, phantomHooks],
  ];
}

function getConnectionMap() {
  const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
  const [phantom, phantomHooks] = PhantomConnector.getInstance();
  const [web3WalletConnect, web3WalletConnectHooks] =
    WalletConnectConnector.getInstance({});
  const [web3WalletNotQrConnect, web3WalletNotQrConnectHooks] =
    WalletConnectNotQrConnector.getInstance({});
  const injectedConnection = {
    connector: web3Injected,
    hooks: web3InjectedHooks,
    type: ConnectionType.INJECTED,
  };
  const phantomConnection = {
    connector: phantom,
    hooks: phantomHooks,
    type: ConnectionType.PHANTOM,
  };

  const walletConnectConnection: Connection = {
    connector: web3WalletConnect,
    hooks: web3WalletConnectHooks,
    type: ConnectionType.WALLET_CONNECT,
  };
  const walletConnectNotQrConnection: Connection = {
    connector: web3WalletNotQrConnect,
    hooks: web3WalletNotQrConnectHooks,
    type: ConnectionType.WALLET_CONNECT_NOTQR,
  };

  return {
    injectedConnection,
    phantomConnection,
    walletConnectConnection,
    walletConnectNotQrConnection,
  };
}

export function getConnectors(URLS: URLMap) {
  const [
    [web3Injected, web3InjectedHooks],
    [web3WalletConnect, web3WalletConnectHooks],
    [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
    [phantom, phantomHooks],
  ] = initConnector(URLS);

  const connectors: [MetaMask | WalletConnect, Web3ReactHooks][] = [
    [web3Injected, web3InjectedHooks],
    [web3WalletConnect, web3WalletConnectHooks],
    [web3WalletNotQrConnect, web3WalletNotQrConnectHooks],
    [phantom, phantomHooks],
  ];
  return connectors;
}

export async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
}

export function getIsInjected(): boolean {
  return Boolean(window.ethereum);
}

export function getIsMetaMask(): boolean {
  return (window.ethereum as any)?.isMetaMask ?? false;
}

export function getIsCoinbaseWallet(): boolean {
  return (window.ethereum as any)?.isCoinbaseWallet ?? false;
}

export function getConnection(c: Connector | ConnectionType) {
  const {
    injectedConnection,
    walletConnectConnection,
    walletConnectNotQrConnection,
    phantomConnection,
  } = getConnectionMap();
  const CONNECTIONS = [
    injectedConnection,
    walletConnectConnection,
    walletConnectNotQrConnection,
    phantomConnection,
  ];

  if (c instanceof Connector) {
    const connection = CONNECTIONS.find(
      (connection) => connection.connector === c
    );
    if (!connection) {
      throw Error("unsupported connector");
    }
    return connection;
  } else {
    switch (c) {
      case ConnectionType.INJECTED:
        return injectedConnection;
      case ConnectionType.WALLET_CONNECT:
        return walletConnectConnection;
      case ConnectionType.WALLET_CONNECT_NOTQR:
        return walletConnectNotQrConnection;
      case ConnectionType.PHANTOM:
        return phantomConnection;
    }
  }
}

export function getConnectionName(
  connectionType: ConnectionType,
  isMetaMask?: boolean
) {
  switch (connectionType) {
    case ConnectionType.INJECTED:
      return isMetaMask ? "MetaMask" : "Injected";
    case ConnectionType.WALLET_CONNECT:
      return "WalletConnect";
  }
}

function getStorage() {
  const storage = createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
  });

  return storage;
}

const selectedWalletKey = "selectedWallet";

export function useEagerlyConnect(onError?: Function) {
  let selectedWallet = undefined;
  const storage = getStorage();
  if (typeof window !== "undefined") {
    selectedWallet = storage.getItem(selectedWalletKey) as ConnectionType;
  }

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
}

export async function connectWallet(connectionType: ConnectionType) {
  const storage = getStorage();
  let connection: Connection;
  switch (connectionType) {
    case ConnectionType.INJECTED:
      connection = getConnection(ConnectionType.INJECTED);
      break;
    case ConnectionType.WALLET_CONNECT:
      connection = getConnection(ConnectionType.WALLET_CONNECT);
      break;
    case ConnectionType.WALLET_CONNECT_NOTQR:
      connection = getConnection(ConnectionType.WALLET_CONNECT_NOTQR);
      break;
    case ConnectionType.PHANTOM:
      connection = getConnection(ConnectionType.PHANTOM);
      break;
  }

  connection && connection.connector.activate();
  storage.setItem(selectedWalletKey, connectionType);
  await delay(100);
  return connection;
}

export function disconnect(connector: Connector) {
  const storage = getStorage();
  if (connector && connector?.deactivate) {
    connector.deactivate();
  }
  connector.resetState();
  storage.removeItem(selectedWalletKey);
}
export function getWCUri(connection: Connection) {
  try {
    const { uri } = (connection.connector?.provider as any)?.connector;
    return uri;
  } catch (e) {
    return "";
  }
}
