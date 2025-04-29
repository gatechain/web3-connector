import { useWeb3Store, store } from './stores/Web3Store.js';
import { isServer } from './utils/env.js';

// React hook
const useWeb3React = () => useWeb3Store();
// 兼容性函数
function updateStore(update) {
    if (isServer)
        return;
    store.getState().updateStore(update);
}
function resetStore() {
    if (isServer)
        return;
    store.getState().reset();
}

export { resetStore, store, updateStore, useWeb3React };
