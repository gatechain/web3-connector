import { selectedWalletKey } from "../constant";
import { ConnectionType } from "../types";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import { parseChainId } from "../utils";
import { AbstractWallet } from "./AbstractWallet";
import ethProviderModule from "@walletconnect/ethereum-provider";

export type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

type ChainsProps =
  | {
      chains: ArrayOneOrMore<number>;
      optionalChains?: number[];
    }
  | {
      chains?: number[];
      optionalChains: ArrayOneOrMore<number>;
    };

export function isArrayOneOrMore<T>(
  input: T[] = []
): input is ArrayOneOrMore<T> {
  return input.length > 0;
}

function getChainsWithDefault(
  chains: number[] | ArrayOneOrMore<number> | undefined,
  defaultChainId: number | undefined
) {
  if (!chains || !defaultChainId || chains.length === 0) {
    return chains;
  }
  const idx = chains.indexOf(defaultChainId);
  if (idx === -1) {
    throw new Error(
      `Invalid chainId ${defaultChainId}. Make sure default chain is included in "chains" - chains specified in "optionalChains" may not be selected as the default, as they may not be supported by the wallet.`
    );
  }

  const ordered = [...chains];
  ordered.splice(idx, 1);
  return [defaultChainId, ...ordered];
}

class WalletConnect extends AbstractWallet {
  public provider: any;

  protected readonly defaultChainId = 1;

  constructor({ showQrModal }: { showQrModal: boolean }) {
    super();
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.handleChainChange = this.handleChainChange.bind(this);
    this.handleDisplayURI = this.handleDisplayURI.bind(this);

    this.options.showQrModal = showQrModal;

    const { chains, optionalChains } = this.getChainProps(
      this.options.chains,
      this.options.optionalChains,
      this.defaultChainId
    );

    this.chains = chains;
    this.optionalChains = optionalChains;
  }

  private readonly chains;
  private readonly optionalChains;

  protected options = {
    metadata: {
      name: "GateWallet",
      description: "GateWallet WalletConnect",
      url: "https://www.gate.io/web3",
      icons: ["https://www.gate.io/images/apple-touch-icon-120x120.png"],
    },
    projectId: "49cf6ec6179f8d21bf525adc78d6900a",
    chains: [this.defaultChainId || 1],
    optionalChains: [1, 10, 56, 86, 137, 324, 42161, 43114, 81457],
    showQrModal: true,
    optionalMethods: ["eth_signTypedData", "eth_signTypedData_v4", "eth_sign"],
    qrModalOptions: {
      explorerRecommendedWalletIds: [
        // "aba1f652e61fd536e8a7a5cd5e0319c9047c435ef8f7e907717361ff33bb3588",
        "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
        "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
        "ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef",
        "20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66",
      ],
      themeVariables: {
        "--wcm-z-index": "10000",
      },
    },
  };

  private getChainProps(
    chains: number[] | ArrayOneOrMore<number> | undefined,
    optionalChains: number[] | ArrayOneOrMore<number> | undefined,
    desiredChainId: number | undefined = this.defaultChainId
  ): ChainsProps {
    // Reorder chains and optionalChains if necessary
    const orderedChains = getChainsWithDefault(chains, desiredChainId);
    const orderedOptionalChains = getChainsWithDefault(
      optionalChains,
      desiredChainId
    );

    // Validate and return the result.
    // Type discrimination requires that we use these typeguard checks to guarantee a valid return type.
    if (isArrayOneOrMore(orderedChains)) {
      return { chains: orderedChains, optionalChains: orderedOptionalChains };
    } else if (isArrayOneOrMore(orderedOptionalChains)) {
      return { chains: orderedChains, optionalChains: orderedOptionalChains };
    }

    throw new Error(
      "Either chains or optionalChains must have at least one item."
    );
  }

  public detectProvider(
    desiredChainId: number | undefined = this.defaultChainId
  ): Promise<unknown> {
    if (this.provider) return Promise.resolve();
    const chainProps = this.getChainProps(
      this.chains,
      this.optionalChains,
      desiredChainId
    );
    return ethProviderModule
      .init({
        ...this.options,
        ...chainProps,
      })
      .then((provider) => {
        this.provider = provider;
      });
  }

  protected async initialize(
    desiredChainId: number | undefined = this.defaultChainId
  ) {
    await this.detectProvider(desiredChainId);
    const provider = this.provider;

    if (!provider) return;

    provider.on("disconnect", this.deactivate);
    provider.on("chainChanged", this.handleChainChange);
    provider.on("accountsChanged", this.handleAccountsChanged);
    provider.on("display_uri", this.handleDisplayURI);
  }

  private handleChainChange(chainId: string) {
    updateStore({
      chainId: parseChainId(chainId),
    });
  }

  protected handleDisplayURI(url: string) {
    console.log("url", url);
  }

  public async connectEagerly() {
    await this.initialize();
    const provider = this.provider;
    if (!provider.session) {
      console.error(
        new Error("No active session found. Connect your wallet first.")
      );
      return;
    }
    updateStore({
      isActive: true,
      chainId: provider.chainId,
      accounts: provider.accounts,
      account: provider.accounts[0],
      connector: this,
      currentWallet: ConnectionType.WALLET_CONNECT,
    });
  }

  public async activate(desiredChainId: number = this.defaultChainId) {
    await this.initialize(desiredChainId);
    const provider = this.provider;

    (window as any).wc = provider;

    if (!provider) return;
    if (provider.session) {
      if (!desiredChainId || desiredChainId === provider.chainId) return;
      // WalletConnect exposes connected accounts, not chains: `eip155:${chainId}:${address}`
      const isConnectedToDesiredChain =
        provider.session.namespaces.eip155.accounts.some((account: any) =>
          account.startsWith(`eip155:${desiredChainId}:`)
        );
      if (!isConnectedToDesiredChain) {
        if (this.options.optionalChains?.includes(desiredChainId)) {
          throw new Error(
            `Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`
          );
        }
        throw new Error(
          `Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`
        );
      }
      return provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
      });
    }

    try {
      await provider.enable();

      updateStore({
        isActive: true,
        chainId: provider.chainId,
        accounts: provider.accounts,
        account: provider.accounts[0],
        connector: this,
        currentWallet: ConnectionType.WALLET_CONNECT,
      });
    } catch (error) {
      await this.deactivate();
      throw error;
    }
  }

  private handleAccountsChanged(accounts: string[]) {
    const currentAccount = accounts[0];
    updateStore({
      accounts: accounts,
      account: currentAccount,
    });
  }

  public deactivate() {
    const provider = this.provider;

    if (provider) {
      provider.removeListener("disconnect", this.deactivate);
      provider.removeListener("chainChanged", this.handleChainChange);
      provider.removeListener("accountsChanged", this.handleAccountsChanged);
      provider.removeListener("display_uri", this.handleDisplayURI);
      provider.disconnect();
    }

    localStorage.removeItem(selectedWalletKey);

    resetStore();
  }

  static instance: WalletConnect;

  static getInstance() {
    if (WalletConnect.instance) return WalletConnect.instance;
    WalletConnect.instance = new WalletConnect({ showQrModal: true });
    return WalletConnect.instance;
  }
}

export default WalletConnect;
