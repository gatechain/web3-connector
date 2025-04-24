import Cookies from 'js-cookie';
import { isServer } from '../utils/env';

export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const cookieStorage: Storage = {
  async getItem(key: string) {
    if (isServer) return null;
    return Cookies.get(key) || null;
  },
  async setItem(key: string, value: string) {
    if (isServer) return;
    Cookies.set(key, value, {
      expires: 30, // 30 days
      sameSite: 'strict',
      secure: window.location.protocol === 'https:',
    });
  },
  async removeItem(key: string) {
    if (isServer) return;
    Cookies.remove(key);
  },
};

export interface StorageConfig {
  storage: Storage;
  key?: string;
}

export function createStorage(config: StorageConfig) {
  const { storage, key = 'web3_state' } = config;
  
  return {
    async getItem(customKey?: string) {
      return storage.getItem(customKey || key);
    },
    async setItem(value: string, customKey?: string) {
      return storage.setItem(customKey || key, value);
    },
    async removeItem(customKey?: string) {
      return storage.removeItem(customKey || key);
    },
  };
} 