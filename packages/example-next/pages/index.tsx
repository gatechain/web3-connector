import type { NextPage } from 'next'
import { useCallback } from 'react'
import styles from '../styles/Home.module.css'
import { connectWallet, ConnectionType, useWeb3React, disconnect, AddEthereumChainParameter } from 'hipo-wallet'

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

  const changeChain = async (e: any) => {
    const value = e.target.value
    try {
      if (value === 'gt') {
        const gtItem: AddEthereumChainParameter = {
          chainId: 85,
          chainName: 'GateChain',
          nativeCurrency: {
            name: "GateChain",
            symbol: "GT",
            decimals: 18
          },
          rpcUrls: ['https://evm.gatenode.cc']
        }
        connector.activate(gtItem)
      }
      if (value === 'eth') {
        await connector.activate(1)
        console.log('shishsishis ')
      }
      if (value === 'bnb') {
        connector.activate(256)
      }
    } catch (error) {
      console.log(error, 'ahhahah')
    }
  }

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
      <select onChange={changeChain}>
        <option value=""> </option>
        <option value="gt">gatechain</option>
        <option value="eth">ETH</option>
        <option value="bnb">bnb</option>
      </select>
    </div>
  )
}

export default Home
