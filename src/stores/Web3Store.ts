import create from 'zustand/vanilla'
import { Web3Provider } from '@ethersproject/providers'
import { ConnectionType, Network } from '../types'
import { connectWallet as connectWalletUtil, disconnect as disconnectUtil } from '../index'
import { isServer } from '../utils/env'

export interface Web3State {
  chainId?: number
  isActive: boolean
  isActivating: boolean
  account?: string
  accounts: string[]
  gateAccountInfo?: any
  currentWallet?: ConnectionType
  connector?: any
  network?: Network
  provider: Web3Provider | null
}

export interface Web3Actions {
  updateStore: (update: Partial<Web3State>) => void
  reset: () => void
  connect: (connectionType: ConnectionType) => Promise<void>
  disconnect: () => void
}

type StoreState = Web3State & Web3Actions

const initialState: Web3State = {
  chainId: undefined,
  isActive: false,
  isActivating: false,
  account: undefined,
  accounts: [],
  gateAccountInfo: undefined,
  currentWallet: undefined,
  connector: undefined,
  network: undefined,
  provider: null,
}

// 创建原始 store
export const store = create<StoreState>((set, get) => ({
  ...initialState,

  updateStore: (update: Partial<Web3State>) => {
    if (isServer) return

    set((state) => {
      const newState = { ...state, ...update }

      // 特殊处理 provider
      if (update.connector?.provider) {
        const provider = update.connector.provider
        if (
          [
            ConnectionType.INJECTED,
            ConnectionType.WALLET_CONNECT,
            ConnectionType.WALLET_CONNECT_NOTQR,
            ConnectionType.GATEWALLET,
          ].includes(update.currentWallet as ConnectionType) &&
          typeof provider.request === 'function'
        ) {
          newState.provider = new Web3Provider(provider)
        } else {
          newState.provider = provider
        }
      }

      return newState
    })
  },

  reset: () => {
    if (isServer) return
    set(initialState)
  },

  connect: async (connectionType: ConnectionType) => {
    if (isServer) return
    set({ isActivating: true })
    try {
      await connectWalletUtil(connectionType)
    } finally {
      set({ isActivating: false })
    }
  },

  disconnect: () => {
    if (isServer) return
    disconnectUtil()
    set(initialState)
  },
}))

// 添加持久化
if (!isServer) {
  const key = 'web3-store'
  const savedState = localStorage.getItem(key)
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      store.setState(state)
    } catch (e) {
      console.error('Failed to restore web3 store state:', e)
    }
  }

  store.subscribe((state) => {
    try {
      const saveState = {
        chainId: state.chainId,
        isActive: state.isActive,
        account: state.account,
        accounts: state.accounts,
        currentWallet: state.currentWallet,
        network: state.network,
      }
      localStorage.setItem(key, JSON.stringify(saveState))
    } catch (e) {
      console.error('Failed to persist web3 store state:', e)
    }
  })
}

// 创建 React hook
import { useEffect, useState } from 'react'

export const useWeb3Store = () => {
  const [state, setState] = useState(() => store.getState())

  useEffect(() => {
    const unsubscribe = store.subscribe(setState)
    return unsubscribe
  }, [])

  return state
} 