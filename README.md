# `hipo-wallet`

> This is a tool for connecting Web3 wallets.  

## Usage

```
yarn add hipo-wallet
```

### provider
```tsx
// _app.tsx
import { getConnectors, useEagerlyConnect, Web3ReactProvider } from 'hipo-wallet'

const connectors = getConnectors({ 1: ['https://mainnet.infura.io/v3/'] })
function MyApp({ Component, pageProps }: AppProps) {
  useEagerlyConnect()

  return <Web3ReactProvider connectors={connectors} >
    <Component {...pageProps} />
  </ Web3ReactProvider>
}

export default MyApp
```

### connect/disconnect wallet demo 

```tsx
import { connectWallet, ConnectionType, useWeb3React, disconnect } from 'hipo-wallet'

const Home: NextPage = () => {
  const { connector, provider, account, chainId, isActive, isActivating } = useWeb3React()

  function connectCoinbaseWallet() {
    connectWallet(ConnectionType.COINBASE_WALLET)
  }

  function connectMetaMask() {
    connectWallet(ConnectionType.INJECTED)
  }

  function connectWalletConnect() {
    connectWallet(ConnectionType.WALLET_CONNECT)
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
      <button onClick={connectCoinbaseWallet}>coinBase</button>
      <button onClick={connectMetaMask}>metamask</button>
      <button onClick={connectWalletConnect}>walletConnect</button>
      <button onClick={getBalance}>getBalance</button>
      <button onClick={() => {
        disconnect(connector)
      }}>disconnect</button>
    </div>
  )
}

export default Home

```