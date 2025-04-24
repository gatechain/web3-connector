import { configure } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { isServer } from '../utils/env';

// 启用服务端静态渲染
enableStaticRendering(isServer);

// MobX 配置
configure({
  // 在服务端禁用响应式
  useProxies: 'ifavailable',
  // 强制执行操作必须在 action 中
  enforceActions: 'never',
}); 