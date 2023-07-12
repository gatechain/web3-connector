interface GateWalletProvider {
  isMetaMask?: boolean;
  isWeb3Wallet?: boolean;
  once(eventName: string | symbol, listener: (...args: any[]) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this;
  addListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  removeAllListeners(event?: string | symbol): this;
}

interface Window {
  gatewallet?: GateWalletProvider;
}

export = detectgatewalletProvider;

/**
 * Returns a Promise that resolves to the value of window.gatewallet if it is
 * set within the given timeout, or null.
 * The Promise will not reject, but an error will be thrown if invalid options
 * are provided.
 *
 * @param options - Options bag.
 * @param options.mustBeMetaMask - Whether to only look for MetaMask providers.
 * Default: false
 * @param options.silent - Whether to silence console errors. Does not affect
 * thrown errors. Default: false
 * @param options.timeout - Milliseconds to wait for 'gatewallet#initialized' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * given timeout, otherwise null.
 */
function detectgatewalletProvider<T = GateWalletProvider>({
  mustBeMetaMask = false,
  silent = false,
  timeout = 3000,
} = {}): Promise<T | null> {
  _validateInputs();

  let handled = false;

  return new Promise((resolve) => {
    if ((window as Window).gatewallet) {
      handlegatewallet();
    } else {
      window.addEventListener("ethereum#initialized", handlegatewallet, {
        once: true,
      });

      setTimeout(() => {
        handlegatewallet();
      }, timeout);
    }

    function handlegatewallet() {
      if (handled) {
        return;
      }
      handled = true;

      window.removeEventListener("ethereum#initialized", handlegatewallet);

      const { gatewallet } = window as Window;

      if (gatewallet && gatewallet.isWeb3Wallet) {
        resolve(gatewallet as unknown as T);
      } else {
        const message =
          mustBeMetaMask && gatewallet
            ? "Non-GateWallet window.gatewallet detected."
            : "Unable to detect window.gatewallet.";

        !silent && console.error("detect-provider:", message);
        resolve(null);
      }
    }
  });

  function _validateInputs() {
    if (typeof mustBeMetaMask !== "boolean") {
      throw new Error(
        `detect-provider: Expected option 'mustBeGateWallet' to be a boolean.`
      );
    }
    if (typeof silent !== "boolean") {
      throw new Error(
        `detect-provider: Expected option 'silent' to be a boolean.`
      );
    }
    if (typeof timeout !== "number") {
      throw new Error(
        `detect-provider: Expected option 'timeout' to be a number.`
      );
    }
  }
}
