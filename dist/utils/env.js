const isServer = typeof window === 'undefined';
function runOnlyInBrowser(fn, fallback) {
    if (isServer)
        return fallback;
    return fn();
}

export { isServer, runOnlyInBrowser };
