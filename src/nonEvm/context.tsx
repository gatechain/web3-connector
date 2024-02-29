import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { NonEVMConnectorName, Network } from "./types";
import {
  Connector,
  ConnectorOptions,
  GateAccountInfo,
} from "./connectors/types";
import { UnisatConnector } from "./connectors/unisat";
import { NonEVMGateWalletConnector } from "./connectors/gatewalllet";
import { getConnection, getStorage, selectedWalletKey } from "../connection";
import { ConnectionType } from "../types";

type Action =
  | { type: "on connect"; connectorName: NonEVMConnectorName }
  | { type: "connect failed" }
  | {
      type: "connected";
      connectorName: NonEVMConnectorName;
      address?: string;
      publicKey?: string;
      network?: Network;
      gateAccountInfo?: any;
      hasEvmNetwork?: boolean;
    }
  | { type: "chain change"; chainId: string }
  | { type: "account changed"; address: string; publicKey: string }
  | { type: "network changed"; network: Network }
  | { type: "has evm network"; hasEvmNetwork: boolean }
  | { type: "gate account change"; gateAccountInfo: any }
  | { type: "disconnected" };

type Dispatch = (action: Action) => void;

interface State {
  isConnecting: boolean;
  isConnected: boolean;
  address?: string;
  publicKey?: string;
  connectorName?: NonEVMConnectorName;
  network?: Network;
  chainId?: string;
  gateAccountInfo?: {
    walletName: string;
    accountName: string;
    walletId: string;
    accountNetworkArr: Array<{
      accountFormat: string;
      accountFormatName: string;
      address: string;
      network: string;
      accountPublicKey?: string;
    }>;
  } | null;
  hasEVMNetwork?: boolean;
}

type NonEVMProviderProps = { children: React.ReactNode };

const NonEVMContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const nonEVMReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "on connect": {
      return {
        ...state,
        isConnecting: true,
        connectorName: action.connectorName,
      };
    }

    case "connect failed": {
      return {
        ...state,
        isConnecting: false,
        connectorName: undefined,
      };
    }

    case "connected": {
      return {
        ...state,
        isConnecting: false,
        isConnected: true,
        connectorName: action.connectorName,
        address: action.address,
        publicKey: action.publicKey,
        network: action.network,
        gateAccountInfo: action.gateAccountInfo,
        hasEVMNetwork: !!action?.gateAccountInfo?.accountNetworkArr?.find(
          (x: any) => x.network === "EVM"
        ),
      };
    }

    case "disconnected": {
      return {
        isConnecting: false,
        isConnected: false,
        connectorName: undefined,
        address: undefined,
        publicKey: undefined,
        network: undefined,
        chainId: undefined,
      };
    }

    case "account changed": {
      return { ...state, address: action.address, publicKey: action.publicKey };
    }

    case "chain change": {
      return { ...state, chainId: action.chainId };
    }

    case "network changed": {
      return { ...state, network: action.network };
    }

    case "gate account change": {
      return {
        ...state,
        gateAccountInfo: action.gateAccountInfo,
        hasEVMNetwork: !!action?.gateAccountInfo?.accountNetworkArr?.find(
          (x: any) => x.network === "EVM"
        ),
      };
    }

    case "has evm network": {
      return { ...state, hasEVMNetwork: action.hasEvmNetwork };
    }

    default: {
      throw new Error(`Unhandled action type`);
    }
  }
};

export const NonEVMProvider = ({ children }: NonEVMProviderProps) => {
  const [state, dispatch] = useReducer(nonEVMReducer, {
    isConnecting: false,
    isConnected: false,
    connectorName: undefined,
    address: undefined,
    publicKey: undefined,
    network: undefined,
    gateAccountInfo: undefined,
    chainId: undefined,
  });

  console.log("state", state);

  return (
    <NonEVMContext.Provider value={{ state, dispatch }}>
      {children}
    </NonEVMContext.Provider>
  );
};

const useNonEVMContext = () => {
  const ctx = useContext(NonEVMContext);
  if (ctx === undefined) {
    throw new Error("useNonEVMContext must be used within a nonEVMProvider");
  }

  return ctx;
};

export const useNonEVMReact = () => {
  const ctx = useNonEVMContext();

  const defaultConnectorOptions: ConnectorOptions = useMemo(
    () => ({
      onAccountsChanged: (address, publicKey) => {
        ctx.dispatch({
          type: "account changed",
          address,
          publicKey,
        });
      },
      onNetworkChanged: (network) => {
        ctx.dispatch({
          type: "network changed",
          network,
        });
      },
      onChainChange: (chainId) => {
        ctx.dispatch({
          type: "chain change",
          chainId,
        });
      },
      onDisconnect: () => {
        ctx.dispatch({ type: "disconnected" });
      },
      onGateAccountChange: (gateAccountInfo: GateAccountInfo) => {
        ctx.dispatch({
          type: "gate account change",
          gateAccountInfo,
        });
        const hasEVMNetwork = !!gateAccountInfo?.accountNetworkArr?.find(
          (x: any) => x.network === "EVM"
        );

        ctx.dispatch({
          type: "has evm network",
          hasEvmNetwork: hasEVMNetwork,
        });
      },
    }),
    [ctx]
  );

  const ConnectorMap: Record<NonEVMConnectorName, Connector> = useMemo(
    () => ({
      Unisat: new UnisatConnector(defaultConnectorOptions),
      GateWallet: new NonEVMGateWalletConnector(defaultConnectorOptions),
    }),
    [defaultConnectorOptions]
  );

  const connector = useMemo(() => {
    if (!ctx.state.connectorName) return null;
    return ConnectorMap[ctx.state.connectorName];
  }, [ConnectorMap, ctx.state.connectorName]);

  const disconnect = useCallback(() => {
    ctx.dispatch({ type: "disconnected" });
    connector?.disconnect();

    const storage = getStorage();

    const connection = getConnection(
      storage.getItem(selectedWalletKey) as ConnectionType
    );
    connection?.connector?.deactivate?.();
  }, [connector, ctx]);

  const connect = useCallback(
    async (connectorName: NonEVMConnectorName) => {
      try {
        if (ctx.state.isConnected) {
          disconnect();
        }

        // TODO: avoid dispatch if is connected
        ctx.dispatch({
          type: "on connect",
          connectorName,
        });

        const { address, publicKey, network, gateAccountInfo } =
          (await ConnectorMap[connectorName].connect()) || {};

        const storage = getStorage();

        const map = {
          Unisat: ConnectionType.Unisat,
          GateWallet: ConnectionType.GATEWALLET,
        };

        storage.setItem(selectedWalletKey, map[connectorName]);

        const hasEvmNetwork = !!gateAccountInfo?.accountNetworkArr?.find(
          (x: any) => x.network === "EVM"
        );

        if (hasEvmNetwork) {
          const connection = getConnection(ConnectionType.GATEWALLET);
          connection.connector.connectEagerly?.();
        }

        ctx.dispatch({
          type: "connected",
          connectorName,
          address,
          publicKey,
          network,
          gateAccountInfo,
        });
      } catch (error) {
        ctx.dispatch({ type: "connect failed" });
        throw error;
      }
    },
    [ConnectorMap, ctx, disconnect]
  );

  const connectEagerly = useCallback(
    async (connectorName: NonEVMConnectorName) => {
      try {
        if (ctx.state.isConnected) {
          disconnect();
        }

        // TODO: avoid dispatch if is connected
        ctx.dispatch({
          type: "on connect",
          connectorName,
        });

        const { address, publicKey, network, gateAccountInfo } =
          (await ConnectorMap[connectorName].connectEagerly()) || {};

        const storage = getStorage();

        const map = {
          Unisat: ConnectionType.Unisat,
          GateWallet: ConnectionType.GATEWALLET,
        };

        storage.setItem(selectedWalletKey, map[connectorName]);

        const hasEvmNetwork = !!gateAccountInfo?.accountNetworkArr?.find(
          (x: any) => x.network === "EVM"
        );

        if (hasEvmNetwork) {
          const connection = getConnection(ConnectionType.GATEWALLET);
          connection.connector.connectEagerly?.();
        }

        ctx.dispatch({
          type: "connected",
          connectorName,
          address,
          publicKey,
          network,
          gateAccountInfo,
        });
      } catch (error) {
        ctx.dispatch({ type: "connect failed" });
        throw error;
      }
    },
    [ConnectorMap, ctx, disconnect]
  );

  const signMessage = useCallback(
    async (message?: string) => {
      return connector?.signMessage?.(message);
    },
    [connector]
  );

  return {
    ...ctx.state,
    connect,
    disconnect,
    connector,
    signMessage,
    connectEagerly,
  };
};
