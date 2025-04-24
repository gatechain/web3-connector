# Web3 Connector 使用示例

这个示例展示了如何使用 Web3 Connector 库来实现钱包连接功能。

## 基础示例 (BasicExample.tsx)

这个示例组件展示了以下功能：
- 连接不同类型的钱包（MetaMask、WalletConnect、Gate Wallet）
- 显示连接状态
- 显示账户信息（地址、Chain ID）
- 断开钱包连接

### 使用方法

1. 首先安装依赖：
```bash
pnpm install
```

2. 在你的 React 应用中使用示例组件：

```tsx
import { Web3StateProvider } from './hooks/useWeb3State';
import BasicExample from './examples/BasicExample';

function App() {
  return (
    <Web3StateProvider>
      <BasicExample />
    </Web3StateProvider>
  );
}
```

### 在其他组件中使用

你可以在任何被 `Web3StateProvider` 包裹的组件中使用 `useWeb3State` hook：

```tsx
import { useWeb3State } from './hooks/useWeb3State';

const YourComponent = () => {
  const { isActive, connect, disconnect } = useWeb3State();
  // ...
};
```

### 支持的钱包类型

目前支持以下钱包类型：
- MetaMask (INJECTED)
- WalletConnect
- Gate Wallet
- Phantom
- Unisat
- SUI

### 注意事项

1. 确保在使用 WalletConnect 时配置了正确的项目 ID
2. 对于 MetaMask，需要用户已经安装了浏览器插件
3. 该示例支持服务端渲染 (SSR)
4. 状态会自动持久化到 cookie 中
5. 确保在使用 `useWeb3State` 的组件外层包裹了 `Web3StateProvider` 