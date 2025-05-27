---
# web3-connector

web3-connector 是一个多钱包连接器，支持多种主流 Web3 钱包的一键式连接和状态获取，适用于 React 项目，兼容 SSR 场景。
主要功能包括：连接钱包、断开钱包连接、钱包账户获取、切链、Provider 获取等。
---

## 安装

```
// .npmrc
@gateweb3:registry=http://gateio-registry.fulltrust.link/
```

```bash
pnpm add @gateweb3/web3-connector
```

### 依赖

- react

```json
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

---

## 快速上手

### 1. 在应用中集成

无需 Provider 包裹，直接在任意组件中使用 hooks 获取钱包状态：

```tsx
import { useWalletStatus } from 'web3-connector';

function WalletInfo() {
  const { isActive, account, chainId, provider } = useWalletStatus();

  return (
    <div>
      <div>连接状态: {isActive ? '已连接' : '未连接'}</div>
      <div>当前账户: {account}</div>
      <div>链ID: {chainId}</div>
    </div>
  );
}
```

---

### 2. 连接钱包

使用 `connectWallet` 方法连接指定类型的钱包：

```ts
import { connectWallet, ConnectionType } from 'web3-connector';

// 连接 MetaMask
connectWallet(ConnectionType.INJECTED);

// 连接 GateWallet
connectWallet(ConnectionType.GATEWALLET);

// 连接 Phantom
connectWallet(ConnectionType.PHANTOM);

// 连接 Unisat
connectWallet(ConnectionType.Unisat);

// 连接 WalletConnect
connectWallet(ConnectionType.WALLET_CONNECT);

// 连接 Gate钱包（扫码）
connectWallet(ConnectionType.WALLET_CONNECT_NOTQR);

// 连接 Gate App 内钱包
connectWallet(ConnectionType.GATEAPPWALLET);
```

可选参数：`connectWallet(type, resolve, reject)`，其中 resolve 用于 WalletConnect 获取二维码 URI，reject 用于捕获连接异常。

---

### 3. 断开连接

```ts
import { disconnect } from 'web3-connector';

disconnect();
```

---

### 4. 自动连接

web3-connector 内部已实现自动连接逻辑（如检测到已选钱包会自动尝试连接），无需手动处理。

---

### 5. 获取 provider

- `provider` 字段：为 ethers.js 标准 Provider，适合大多数合约交互和链上查询。
- `connector.provider` 字段：为原始钱包 provider，即各钱包注入的原生 provider（如 window.ethereum、window.gatewallet 等），适合需要调用钱包自定义方法或与 ethers 无关的特殊场景。

```ts
const { provider, connector } = useWalletStatus();

// 用法一：合约交互、余额查询等
await provider.getBalance(account);

// 用法二：直接调用原生 provider 的自定义方法
await connector?.provider?.request({ method: 'wallet_switchEthereumChain', params: [...] });
```

---

### 6. 网络切换

连接器支持 `activate(desiredChainId)` 处理常见的链切换，也可通过 provider 的 request 方法自定义切换。

#### 方式一：通过 connector.activate 方法（推荐）

activate 方法会自动处理链切换和链添加，推荐优先使用。

```ts
const { connector } = useWalletStatus();

// 切换到以太坊主网（chainId: 1）
await connector?.activate(1);

// 切换到自定义链（如 GateChain 主网）
await connector?.activate({
  chainId: 134, // 10进制
  chainName: 'GateChain Mainnet',
  rpcUrls: ['https://rpc.gatenode.cc'],
  nativeCurrency: { name: 'GT', symbol: 'GT', decimals: 18 },
  blockExplorerUrls: ['https://www.gatescan.org/'],
});
```

#### 方式二：通过 connector.provider（原生 provider）

适用于所有支持 EIP-1193 的钱包（如 MetaMask、GateWallet 等）。

```ts
const { connector } = useWalletStatus();

// 切换到以太坊主网（chainId: 1）
await connector?.provider?.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x1' }],
});

// 如果目标链未添加，可用 wallet_addEthereumChain
await connector?.provider?.request({
  method: 'wallet_addEthereumChain',
  params: [
    {
      chainId: '0x86', // GateChain 主网
      chainName: 'GateChain Mainnet',
      rpcUrls: ['https://rpc.gatenode.cc'],
      nativeCurrency: { name: 'GT', symbol: 'GT', decimals: 18 },
      blockExplorerUrls: ['https://www.gatescan.org/'],
    },
  ],
});
```

---

### 7. 错误处理

- `connectWallet` 支持传入 reject 回调处理连接异常：

```ts
connectWallet(ConnectionType.INJECTED, undefined, (err) => {
  alert('连接失败: ' + err.message);
});
```

---

### 8. 钱包类型枚举

所有支持的钱包类型如下：

```ts
import { ConnectionType } from 'web3-connector';

ConnectionType.INJECTED; // MetaMask、TokenPocket 等浏览器注入钱包
ConnectionType.GATEWALLET; // Gate 官方钱包
ConnectionType.PHANTOM; // Phantom 钱包
ConnectionType.WALLET_CONNECT; // WalletConnect
ConnectionType.WALLET_CONNECT_NOTQR; // WalletConnect（不弹二维码，适合移动端）
ConnectionType.Unisat; // Unisat 钱包
ConnectionType.GATEAPPWALLET; // Gate App 内嵌钱包
```

---

## 类型定义

### useWalletStatus API 说明

`useWalletStatus` 是 web3-connector 提供的核心 Hook，用于获取当前钱包的所有状态信息。返回值字段说明如下：

| 字段名          | 类型                                | 说明                                                                                       |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| isActive        | boolean                             | 当前钱包是否已连接。为 true 时表示钱包连接成功，可以进行链上操作。                         |
| isActivating    | boolean                             | 连接中状态。为 true 时表示正在发起连接请求，适合用于按钮 loading 态等。                    |
| account         | string \| undefined                 | 当前活跃账户地址。通常为用户当前选中的钱包地址。                                           |
| accounts        | string[]                            | 所有可用账户地址。部分钱包支持多账户时会返回全部地址，通常第一个为主账户。                 |
| chainId         | number \| undefined                 | 当前连接的链 ID（EVM链）。如以太坊主网为 1，BSC 为 56，GateChain 主网为 86 等。            |
| currentWallet   | ConnectionType \| undefined         | 当前连接的钱包类型。如 INJECTED、WALLET_CONNECT、GATEWALLET 等。                           |
| provider        | Web3Provider \| null                | ethers.js 标准 Provider 实例（仅针对支持evm交易的钱包类型)，用于合约交互、查询链上数据等。 |
| network         | 'livenet' \| 'testnet' \| undefined | 当前网络类型。主网为 livenet，测试网为 testnet。                                           |
| gateAccountInfo | any                                 | Gate 钱包专用账户信息。如 GateWallet 返回的扩展信息，其他钱包一般为 undefined。            |
| connector       | AbstractWallet \| undefined         | 当前钱包连接器实例。可用于调用如 deactivate()、activate() 等方法。                         |

---

### 兼容 SSR

- 内部已自动处理 SSR 场景，localStorage 相关操作在服务端不会执行。

---

## FAQ

**Q: 如何监听链/账户变更？**  
A: 连接器内部已自动监听，状态会自动更新，直接用 useWalletStatus 获取最新状态即可。

**Q: 如何自定义连接二维码？**  
A: 通过 `connectWallet(ConnectionType.WALLET_CONNECT, (uri) => { ... })` 获取二维码 URI，自行渲染二维码。

**Q: 支持多链/多钱包吗？**  
A: 支持多钱包切换，当前状态只维护一个活跃钱包。

---

## 在 web3_next 仓库中使用

若某一 app 需要使用 `@gateweb3/web3-connector`，需要配合使用 `core_header_v2` package。  
**原因备注**：由于当前仍需兼容使用旧版本

---
