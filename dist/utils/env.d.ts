export declare const isServer: boolean;
export declare const isBrowser: boolean;
export declare function getGlobalObject<T>(): T | undefined;
export declare function runOnlyInBrowser<T>(fn: () => T, fallback?: T): T;
