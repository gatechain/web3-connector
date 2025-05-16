import { store, useWeb3Store, type Web3Actions, type Web3State } from '../stores/Web3Store';
import { isServer } from '../utils/env';

// 导出完整的 store state 和 actions 类型
export type { Web3Actions, Web3State };

// 导出 store 实例
export { store };

const useWalletStatus = () => useWeb3Store();

// 兼容性函数
export function updateStore(update: Partial<Web3State>) {
  if (isServer) return;
  store.getState().updateStore(update);
}

export function resetStore() {
  if (isServer) return;
  store.getState().reset();
}

export { useWalletStatus };
