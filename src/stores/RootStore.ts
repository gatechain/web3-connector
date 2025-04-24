import { makeAutoObservable } from 'mobx';
import { Web3Store } from './Web3Store';
import type { IRootStore } from './types';
import { isServer } from '../utils/env';
import './config';

export class RootStore implements IRootStore {
  web3Store: Web3Store;

  constructor() {
    this.web3Store = new Web3Store(this);
    // 在服务端不初始化 MobX
    if (!isServer) {
      makeAutoObservable(this);
    }
  }
}

// 创建一个单例实例
export const rootStore = new RootStore(); 