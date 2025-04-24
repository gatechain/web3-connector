export const isServer = typeof window === 'undefined';
export const isBrowser = !isServer;

export function getGlobalObject<T>(): T | undefined {
  if (isServer) return undefined;
  return (typeof window !== 'undefined' ? window : global) as unknown as T;
}

export function runOnlyInBrowser<T>(fn: () => T, fallback?: T): T {
  if (isServer) return fallback as T;
  return fn();
} 