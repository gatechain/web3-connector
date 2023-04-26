import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { useEffect } from "react";
import { Connector } from "@web3-react/types";
import { MetaMask } from "./metamask";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { WalletConnect } from "@web3-react/walletconnect";
import { Connection, ConnectionType } from "./types";
import { createStorage, noopStorage } from "./storage";

type URLMap = {
  [chainId: number]: string | string[];
};

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

class CoinbaseWalletConnector {
  private constructor() {}
  private static instance: ReturnType<
    typeof initializeConnector<CoinbaseWallet>
  >;
  public static getInstance(URLS: URLMap) {
    if (!this.instance) {
      this.instance = initializeConnector<CoinbaseWallet>(
        (actions) =>
          new CoinbaseWallet({
            actions,
            options: {
              url: URLS[1][0],
              appName: "web3-react",
            },
          })
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

export function initConnector(URLS: URLMap): any {
  const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
  const [web3CoinbaseWallet, web3CoinbaseWalletHooks] =
    CoinbaseWalletConnector.getInstance(URLS);
  const [web3WalletConnect, web3WalletConnectHooks] =
    WalletConnectConnector.getInstance(URLS);

  return [
    [web3Injected, web3InjectedHooks],
    [web3CoinbaseWallet, web3CoinbaseWalletHooks],
    [web3WalletConnect, web3WalletConnectHooks],
  ];
}

function getConnectionMap() {
  const [web3Injected, web3InjectedHooks] = MetaMaskConnector.getInstance();
  const [web3CoinbaseWallet, web3CoinbaseWalletHooks] =
    CoinbaseWalletConnector.getInstance({});
  const [web3WalletConnect, web3WalletConnectHooks] =
    WalletConnectConnector.getInstance({});
  const injectedConnection = {
    connector: web3Injected,
    hooks: web3InjectedHooks,
    type: ConnectionType.INJECTED,
  };

  const coinbaseWalletConnection = {
    connector: web3CoinbaseWallet,
    hooks: web3CoinbaseWalletHooks,
    type: ConnectionType.COINBASE_WALLET,
  };

  const walletConnectConnection: Connection = {
    connector: web3WalletConnect,
    hooks: web3WalletConnectHooks,
    type: ConnectionType.WALLET_CONNECT,
  };

  return {
    injectedConnection,
    coinbaseWalletConnection,
    walletConnectConnection,
  };
}

export function getConnectors(URLS: URLMap) {
  const [
    [web3Injected, web3InjectedHooks],
    [web3CoinbaseWallet, web3CoinbaseWalletHooks],
    [web3WalletConnect, web3WalletConnectHooks],
  ] = initConnector(URLS);

  const connectors: [
    MetaMask | CoinbaseWallet | WalletConnect,
    Web3ReactHooks
  ][] = [
    [web3Injected, web3InjectedHooks],
    [web3CoinbaseWallet, web3CoinbaseWalletHooks],
    [web3WalletConnect, web3WalletConnectHooks],
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
    coinbaseWalletConnection,
    walletConnectConnection,
  } = getConnectionMap();
  const CONNECTIONS = [
    injectedConnection,
    coinbaseWalletConnection,
    walletConnectConnection,
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
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection;
      case ConnectionType.WALLET_CONNECT:
        return walletConnectConnection;
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
    case ConnectionType.COINBASE_WALLET:
      return "Coinbase Wallet";
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

export function connectWallet(connectionType: ConnectionType) {
  const storage = getStorage();
  let connection: Connection;
  switch (connectionType) {
    case ConnectionType.INJECTED:
      connection = getConnection(ConnectionType.INJECTED);
      break;
    case ConnectionType.COINBASE_WALLET:
      connection = getConnection(ConnectionType.COINBASE_WALLET);
      break;
    case ConnectionType.WALLET_CONNECT:
      connection = getConnection(ConnectionType.WALLET_CONNECT);
      break;
  }

  connection && connection.connector.activate();
  storage.setItem(selectedWalletKey, connectionType);
}

export function disconnect(connector: Connector) {
  const storage = getStorage();
  if (connector && connector?.deactivate) {
    connector.deactivate();
  }
  connector.resetState();
  storage.removeItem(selectedWalletKey);
}
