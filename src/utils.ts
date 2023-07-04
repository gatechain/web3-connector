type ISWalletType = "MetaMask" | "TokenPocket";
export interface EthereumProvider {
  isMetaMask?: boolean;
  isTokenPocket?: boolean;
  [key: string]: any;
}
export const isWallet = (params: ISWalletType): boolean => {
  const ethereum = window?.ethereum as EthereumProvider;

  if (params === "MetaMask") {
    return ethereum?.isMetaMask || false;
  }

  if (params === "TokenPocket") {
    return ethereum?.isTokenPocket || false;
  }

  return false;
};
export const delay = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t));
