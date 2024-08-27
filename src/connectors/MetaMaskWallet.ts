import detectEthereumProvider from "@metamask/detect-provider";
import { AbstractWallet } from "./AbstractWallet";
import { resetStore, updateStore } from "../useWeb3ReactHook";
import { ConnectionType } from "../types";
import { selectedWalletKey } from "../constant";
import { AddEthereumChainParameter, ProviderRpcError } from "@web3-react/types";
import { parseChainId } from "../utils";

class MetaMaskWallet extends AbstractWallet {
  constructor() {
    super();
    this.handleConnectEvent = this.handleConnectEvent.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }
  public provider: any;
  /**
   * detectProvider
   */
  public detectProvider() {
    return detectEthereumProvider()
      .then((provider) => {
        this.provider = provider;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private async initialize() {
    await this.detectProvider();
    const provider = this.provider;

    if (!provider) return;

    provider.on("connect", this.handleConnectEvent);

    provider.on("chainChanged", this.handleChainChanged);
    provider.on("accountsChanged", this.handleAccountsChanged);

    provider.on("disconnect", this.deactivate);
  }

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts.

      this.deactivate();
    } else {
      const currentAccount = accounts[0];
      updateStore({
        accounts: accounts,
        account: currentAccount,
      });
    }
  }

  private handleConnectEvent({ chainId }: any) {
    console.log("connect chainId", chainId);
    updateStore({ chainId: parseChainId(chainId) });
  }

  private handleChainChanged(chainId: string) {
    console.log("chainChanged chainId", chainId);
    updateStore({ chainId: parseChainId(chainId) });
  }

  /**
   * connect
   */
  public activate(
    desiredChainIdOrChainParameters?: number | AddEthereumChainParameter
  ) {
    return this.initialize().then(() => {
      const provider = this.provider;

      if (!provider) return;

      return Promise.all([
        this.provider.request({ method: "eth_chainId" }) as Promise<string>,
        this.provider.request({ method: "eth_requestAccounts" }) as Promise<
          string[]
        >,
      ]).then(([chainId, accounts]) => {
        const receivedChainId = parseChainId(chainId);
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === "number"
            ? desiredChainIdOrChainParameters
            : desiredChainIdOrChainParameters?.chainId;

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId) {
          updateStore({
            isActive: true,
            chainId: parseChainId(chainId),
            accounts,
            account: accounts?.[0],
            currentWallet: ConnectionType.INJECTED,
            connector: this,
          });
          return;
        }
        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;

        // if we're here, we can try to switch networks
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.provider!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChainIdHex }],
        })
          .catch((error: ProviderRpcError) => {
            if (
              error.code === 4902 &&
              typeof desiredChainIdOrChainParameters !== "number"
            ) {
              // if we're here, we can try to add a new network
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return this.provider!.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    ...desiredChainIdOrChainParameters,
                    chainId: desiredChainIdHex,
                  },
                ],
              });
            }

            throw error;
          })
          .then(() => this.activate(desiredChainId));
      });
    });
  }

  public async connectEagerly() {
    await this.initialize();
    const provider = this.provider;

    if (!provider) return;

    try {
      const [chainId, accounts] = await Promise.all([
        this.provider.request({ method: "eth_chainId" }) as Promise<string>,
        this.provider.request({ method: "eth_requestAccounts" }) as Promise<
          string[]
        >,
      ]);

      updateStore({
        isActive: true,
        chainId,
        accounts,
        account: accounts?.[0],
        currentWallet: ConnectionType.INJECTED,
        connector: this,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * disconnect
   */
  public deactivate() {
    this.provider?.removeAllListeners();
    localStorage.removeItem(selectedWalletKey);
    resetStore();
  }

  static instance: MetaMaskWallet;

  static getInstance() {
    if (MetaMaskWallet.instance) return MetaMaskWallet.instance;
    MetaMaskWallet.instance = new MetaMaskWallet();
    return MetaMaskWallet.instance;
  }
}

export default MetaMaskWallet;
