import type { NextPage } from 'next'
import { useCallback } from 'react'
import styles from '../styles/Home.module.css'
import { connectWallet, ConnectionType, useWeb3React, disconnect } from 'hipo-wallet'

const Home: NextPage = () => {
  const { connector, provider, account, chainId, isActive, isActivating } = useWeb3React()

  function connectCoinbaseWallet() {
    connectWallet(ConnectionType.COINBASE_WALLET)
  }

  function connectMetaMask() {
    connectWallet(ConnectionType.INJECTED)
  }

  const getBalance = useCallback(() => {
    if (!account) {
      return
    }
    provider?.getBalance(account).then((res) => {
      console.log(res.toString())
    })
  }, [account, chainId])

  return (
    <div className={styles.container}>
      <div>
        chainid:  {chainId}
        account: {account}
        isActive: {isActive ? 'true' : 'false'} /////
        isActivating: {isActivating ? 'loding' : 'null'}
      </div>
      <button onClick={connectCoinbaseWallet}>链接coinBase</button>
      <button onClick={connectMetaMask}>链接metamask</button>
      <button onClick={getBalance}>获取余额</button>
      <button onClick={() => {
        disconnect(connector)
      }}>断开钱包</button>
    </div>
  )
}

export default Home
