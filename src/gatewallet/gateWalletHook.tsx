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

export const GateWalletContext = createContext<{
  connectInfo: {
    chainId: string;
  } | null;
  gateAccountInfo?: any;
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
    }
  }, [connectInfo, gateAccountInfo, chain, hasEVMNetwork])

  return (
    <GateWalletContext.Provider
      value={value}
    >
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
    console.log("gateAccountChange", provider?.gateAccountInfo);
    eventEmitter.emit("gateAccountChange", provider?.gateAccountInfo);
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
