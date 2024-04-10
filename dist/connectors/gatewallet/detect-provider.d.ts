interface GateWalletProvider {
    isMetaMask?: boolean;
    isWeb3Wallet?: boolean;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
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
declare function detectgatewalletProvider<T = GateWalletProvider>({ mustBeMetaMask, silent, timeout, }?: {
    mustBeMetaMask?: boolean | undefined;
    silent?: boolean | undefined;
    timeout?: number | undefined;
}): Promise<T | null>;
