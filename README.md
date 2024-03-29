# `web3-connector`

> This is a tool for connecting Web3 wallets.

## Usage

```
// package.json

"web3-connector": "https://github.com/gatechain/web3-connector#3.2.1"
```

- dist/umd/web3-connector.x.x.x.js // window.web3Connector

### 前置依赖

- ethers | window.ethers
- react | window.React

### provider

```ts
// _app.tsx
import {
  getConnectors,
  useEagerlyConnect,
  Web3ReactProvider,
} from "web3-connector";

const connectors = getConnectors({ 1: ["https://mainnet.infura.io/v3/"] });
function MyApp({ Component, pageProps }: AppProps) {
  useEagerlyConnect();

  return (
    <Web3ReactProvider connectors={connectors}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default MyApp;
```

### connect/disconnect wallet demo

```ts
import {
  connectWallet,
  ConnectionType,
  useWeb3React,
  disconnect,
} from "web3-connector";

const Home: NextPage = () => {
  const {
    connector,
    provider,
    account,
    accounts,
    chainId,
    isActive,
    isActivating,
  } = useWeb3React();

  function connectCoinbaseWallet() {
    connectWallet(ConnectionType.COINBASE_WALLET);
  }

  function connectMetaMask() {
    connectWallet(ConnectionType.INJECTED);
  }

  function connectWalletConnect() {
    connectWallet(ConnectionType.WALLET_CONNECT);
  }

  const getBalance = useCallback(() => {
    if (!account) {
      return;
    }
    provider?.getBalance(account).then((res) => {
      console.log(res.toString());
    });
  }, [account, chainId]);

  return (
    <div className={styles.container}>
      <div>
        chainid: {chainId}
        account: {account}
        isActive: {isActive ? "true" : "false"} ///// isActivating:{" "}
        {isActivating ? "loding" : "null"}
      </div>
      <button onClick={connectCoinbaseWallet}>coinBase</button>
      <button onClick={connectMetaMask}>metamask</button>
      <button onClick={connectWalletConnect}>walletConnect</button>
      <button onClick={getBalance}>getBalance</button>
      <button
        onClick={() => {
          disconnect(connector);
        }}
      >
        disconnect
      </button>
    </div>
  );
};

export default Home;
```

### wallet

| name                        | type                 |
| --------------------------- | -------------------- |
| WalletConnect               | WALLET_CONNECT       |
| imToken, Rainbow, Zengo ... | WALLET_CONNECT_NOTQR |
| MetaMask , TP ...           | INJECTED             |
| phantom                     | PHANTOM              |

### log

- 3.1.2 add phantom
- 3.2.0
  1. delete getWCUri
  2. split connection
  3. delete isMeteMask isxxxx....
  4. use @web3-react/metamask@8.2.0 | @web3-react/walletconnect-v2@8.3.5
- 3.2.1
  1. Supports nextjs
