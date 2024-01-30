import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import EventEmitter from "events";

const eventEmitter = new EventEmitter();

interface IGateAccountInfo {
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
}

export const GateWalletContext = createContext<{
  connectInfo: {
    chainId: string;
  } | null;
  gateAccountInfo?: IGateAccountInfo | null;
  hasEVMNetwork?: boolean;
  chainId: string;
}>({
  connectInfo: null,
  gateAccountInfo: null,
  hasEVMNetwork: false,
  chainId: "",
});

export const useNonEVMReact = () => {
  const gatewallet = useContext(GateWalletContext);
  return gatewallet;
};

export const useNonEVMEagerlyConnect = () => {
  useEffect(() => {
    const provider = detectProvider();
    if (!provider) return;
    provider.on("connect", (info: { chainId: string }) => {
      eventEmitter.emit("connect", info);
    });

    provider.on("gateAccountChange", (gateWallet: IGateAccountInfo): void => {
      console.log("gateAccountChange", gateWallet, gateWallet);
      eventEmitter.emit("gateAccountChange", gateWallet);
    });

    provider.on("chainChanged", (chainId: string): void => {
      console.log("chainChanged", chainId);
      eventEmitter.emit("chainChanged", chainId);
    });

    provider.on("disconnect", (error: any) => {
      console.log(error, "error");
    });
    provider
      .getAccount?.()
      .then((gc: any) => {
        console.log(gc, "connectEagerly gc", provider);
      })
      .catch((err: any) => {
        console.error("gatewallet.getAccount错误", err);
      });
  }, []);
};

export const GateWalletProvider: FC<{ children: any }> = ({ children }) => {
  const [connectInfo, setConnectInfo] = useState(null);
  const [gateAccountInfo, setGateAccountInfo] = useState<any>({});
  const [chain, setChain] = useState("");

  useEffect(() => {
    eventEmitter.on("connect", (info) => {
      console.log("--emitter--info", info);
      setConnectInfo(info);
      setChain(info.chainId);
    });

    eventEmitter.on("gateAccountChange", (gateWallet: any): void => {
      console.log("--emitter--gateWallet", gateWallet);
      setGateAccountInfo(gateWallet);
    });

    eventEmitter.on("chainChanged", (chainId: string): void => {
      console.log("--emitter--chainId", chainId);
      setChain(chainId);
    });
  }, []);

  const hasEVMNetwork = useMemo(() => {
    return !!gateAccountInfo?.accountNetworkArr?.find(
      (x: any) => x.network === "EVM"
    );
  }, [gateAccountInfo]);

  const value = useMemo(() => {
    return {
      connectInfo,
      gateAccountInfo,
      chainId: chain,
      hasEVMNetwork: hasEVMNetwork,
    };
  }, [connectInfo, gateAccountInfo, chain, hasEVMNetwork]);

  return (
    <GateWalletContext.Provider value={value}>
      {children}
    </GateWalletContext.Provider>
  );
};

export function detectProvider() {
  if (typeof (window as any).gatewallet !== "undefined") {
    console.log("Gate Wallet is installed!");
    return (window as any).gatewallet;
  }
  return false;
}

export function connectGateWallet() {
  const provider = detectProvider();

  if (!provider) return;

  provider.on("connect", (info: any) => {
    eventEmitter.emit("connect", info);
  });

  provider.on("gateAccountChange", (gateWallet: any): void => {
    console.log("gateAccountChange", gateWallet, gateWallet);
    eventEmitter.emit("gateAccountChange", gateWallet);
  });

  provider.on("chainChanged", (chainId: string): void => {
    console.log("chainChanged", chainId);
    eventEmitter.emit("chainChanged", chainId);
  });

  provider.on("disconnect", (error: any) => {
    console.log(error, "error");
  });

  return provider.connect();
}
