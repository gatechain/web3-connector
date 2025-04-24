export interface Storage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export declare const cookieStorage: Storage;
export interface StorageConfig {
    storage: Storage;
    key?: string;
}
export declare function createStorage(config: StorageConfig): {
    getItem(customKey?: string): Promise<string | null>;
    setItem(value: string, customKey?: string): Promise<void>;
    removeItem(customKey?: string): Promise<void>;
};
