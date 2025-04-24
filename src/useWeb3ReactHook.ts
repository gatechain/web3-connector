import { store, useWeb3Store, type Web3State, type Web3Actions } from './stores/Web3Store'
import { isServer } from './utils/env'

// 导出完整的 store state 和 actions 类型
export type { Web3State, Web3Actions }

// 导出 store 实例
export { store }

// React hook
export const useWeb3React = () => useWeb3Store()

// 兼容性函数
export function updateStore(update: Partial<Web3State>) {
  if (isServer) return
  store.getState().updateStore(update)
}

export function resetStore() {
  if (isServer) return
  store.getState().reset()
}
